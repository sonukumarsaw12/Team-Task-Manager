const Project = require('../models/Project');
const User = require('../models/User');
const Task = require('../models/Task');
const { logActivity } = require('../utils/activityLogger');
const { sendNotification, sendAdminNotification } = require('../utils/sendNotification');

exports.createProject = async (req, res) => {
  try {
    const { name, description, members, icon, color, deadline, priority, status, visibility } = req.body;
    const project = await Project.create({
      name,
      description,
      members,
      icon,
      color,
      deadline,
      priority,
      status,
      visibility,
      createdBy: req.user._id
    });

    await logActivity({
      userId: req.user._id,
      projectId: project._id,
      action: 'Created project',
      metadata: { projectName: project.name }
    });

    const io = req.app.get('io');

    // Notify added members
    if (members && members.length > 0) {
      for (const memberId of members) {
        if (memberId.toString() !== req.user._id.toString()) {
          sendNotification(io, {
            userId: memberId,
            message: `You were added to project "${project.name}" by ${req.user.name}`,
            type: 'member_added'
          });
        }
      }
    }

    // Notify all admins about new project creation
    sendAdminNotification(io, {
      message: `New project "${project.name}" created by ${req.user.name}`,
      type: 'project_created',
      excludeUserId: req.user._id
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProjects = async (req, res) => {
  try {
    let query = {};
    if (req.user.role !== 'Admin') {
      query.members = req.user._id;
    }
    const projects = await Project.find(query).populate('members', 'name email profilePicture').sort({ createdAt: -1 });
    
    // Add task counts to each project
    const projectsWithStats = await Promise.all(projects.map(async (project) => {
      const tasks = await Task.find({ projectId: project._id });
      return {
        ...project.toObject(),
        totalTasks: tasks.length,
        completedTasks: tasks.filter(t => t.status === 'Done').length
      };
    }));

    res.json(projectsWithStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('members', 'name email profilePicture');
    if (!project) return res.status(404).json({ message: 'Project not found' });
    
    if (req.user.role !== 'Admin' && !project.members.some(m => m._id.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const io = req.app.get('io');

    // Handle members update separately to log activity and notify
    if (req.body.members) {
      const addedMembers = req.body.members.filter(m => !project.members.includes(m));
      if (addedMembers.length > 0) {
        for (const memberId of addedMembers) {
          sendNotification(io, {
            userId: memberId,
            message: `You were added to project "${project.name}" by ${req.user.name}`,
            type: 'member_added'
          });
        }
      }
    }

    const updatedProject = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    
    await logActivity({
      userId: req.user._id,
      projectId: project._id,
      action: 'Updated project',
      metadata: { changes: Object.keys(req.body) }
    });

    // Notify admins about project update
    sendAdminNotification(io, {
      message: `Project "${project.name}" was updated by ${req.user.name}`,
      type: 'project_updated',
      excludeUserId: req.user._id
    });

    res.json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Delete all associated tasks
    await Task.deleteMany({ projectId: req.params.id });

    await logActivity({
      userId: req.user._id,
      action: 'Deleted project',
      metadata: { projectName: project.name }
    });

    // Notify admins about project deletion
    const io = req.app.get('io');
    sendAdminNotification(io, {
      message: `Project "${project.name}" was deleted by ${req.user.name}`,
      type: 'project_deleted',
      excludeUserId: req.user._id
    });

    res.json({ message: 'Project removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
