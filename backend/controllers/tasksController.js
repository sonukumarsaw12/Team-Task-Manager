const Task = require('../models/Task');
const Project = require('../models/Project');
const { logActivity } = require('../utils/activityLogger');
const { sendNotification, sendAdminNotification } = require('../utils/sendNotification');
const { cloudinary } = require('../utils/cloudinary');

exports.createTask = async (req, res) => {
  try {
    const task = await Task.create({
      ...req.body,
      createdBy: req.user._id
    });

    const project = await Project.findById(task.projectId);

    await logActivity({
      userId: req.user._id,
      projectId: task.projectId,
      taskId: task._id,
      action: 'Created task',
      metadata: { title: task.title }
    });

    const io = req.app.get('io');
    const projectName = project ? project.name : 'Unknown';

    // Notify assigned user
    if (task.assignedTo) {
      sendNotification(io, {
        userId: task.assignedTo,
        message: `You have been assigned a new task: "${task.title}" by ${req.user.name}`,
        type: 'task_assigned'
      });
    }

    // Notify all admins about new task creation
    sendAdminNotification(io, {
      message: `New task "${task.title}" created in project "${projectName}" by ${req.user.name}`,
      type: 'task_created',
      excludeUserId: req.user._id
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTasks = async (req, res) => {
  try {
    const { projectId, status, assignedTo } = req.query;
    let query = {};
    
    if (projectId) query.projectId = projectId;
    if (status) query.status = status;
    if (assignedTo) query.assignedTo = assignedTo;

    // If member, ensure they only see tasks from projects they are part of
    if (req.user.role !== 'Admin') {
      const projects = await Project.find({ members: req.user._id }).select('_id');
      const projectIds = projects.map(p => p._id);
      
      if (projectId && !projectIds.some(id => id.toString() === projectId)) {
        return res.status(403).json({ message: 'Not authorized for this project' });
      }
      
      if (!projectId) {
         query.projectId = { $in: projectIds };
      }
    }

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email profilePicture')
      .populate('createdBy', 'name');
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('assignedTo', 'name email profilePicture');
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Permission Check
    const isAdmin = req.user.role === 'Admin';
    const isAssignedToMe = task.assignedTo && task.assignedTo.toString() === req.user._id.toString();

    if (!isAdmin) {
      if (!isAssignedToMe) {
        return res.status(403).json({ message: 'You are not authorized to update this task' });
      }
      
      // If assigned to me but not admin, ONLY allow status update
      const allowedFields = ['status'];
      const requestedFields = Object.keys(req.body);
      const isOnlyStatusUpdate = requestedFields.every(field => allowedFields.includes(field));
      
      if (!isOnlyStatusUpdate) {
        return res.status(403).json({ message: 'You can only update the status of your assigned tasks' });
      }
    }

    const previousStatus = task.status;
    const previousAssignee = task.assignedTo ? task.assignedTo.toString() : null;

    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('assignedTo', 'name email profilePicture');

    const io = req.app.get('io');
    const project = await Project.findById(updatedTask.projectId);
    const projectName = project ? project.name : 'Unknown';

    // Collect IDs already notified to avoid duplicate admin notifications
    const notifiedUserIds = [req.user._id.toString()];

    if (req.body.status && req.body.status !== previousStatus) {
      await logActivity({
        userId: req.user._id,
        projectId: task.projectId,
        taskId: task._id,
        action: `Changed status to ${req.body.status}`,
        metadata: { title: task.title, oldStatus: previousStatus, newStatus: req.body.status }
      });

      // Notify project members about status change
      if (project) {
        project.members.forEach(memberId => {
          const memberIdStr = memberId.toString();
          if (memberIdStr !== req.user._id.toString()) {
            sendNotification(io, {
              userId: memberId,
              message: `Task "${task.title}" status changed to ${req.body.status} by ${req.user.name}`,
              type: 'status_updated'
            });
            notifiedUserIds.push(memberIdStr);
          }
        });
      }

      // Notify admins who are NOT project members
      sendAdminNotification(io, {
        message: `Task "${task.title}" moved to ${req.body.status} in "${projectName}" by ${req.user.name}`,
        type: 'status_updated',
        excludeUserId: notifiedUserIds
      });
    }

    if (req.body.assignedTo && req.body.assignedTo !== previousAssignee) {
      sendNotification(io, {
        userId: req.body.assignedTo,
        message: `You have been assigned to task: "${task.title}" by ${req.user.name}`,
        type: 'task_assigned'
      });
    }

    // For general task updates (title, description, etc.)
    if (!req.body.status || req.body.status === previousStatus) {
      sendAdminNotification(io, {
        message: `Task "${task.title}" was updated in "${projectName}" by ${req.user.name}`,
        type: 'task_updated',
        excludeUserId: req.user._id
      });
    }

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Permission Check: Only Admins can delete tasks
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Only admins can delete tasks' });
    }

    await Task.findByIdAndDelete(req.params.id);

    const project = await Project.findById(task.projectId);
    const projectName = project ? project.name : 'Unknown';

    await logActivity({
      userId: req.user._id,
      projectId: task.projectId,
      action: 'Deleted task',
      metadata: { title: task.title }
    });

    // Notify admins about task deletion
    const io = req.app.get('io');
    sendAdminNotification(io, {
      message: `Task "${task.title}" was deleted from "${projectName}" by ${req.user.name}`,
      type: 'task_deleted',
      excludeUserId: req.user._id
    });

    res.json({ message: 'Task removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.uploadAttachment = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Permission Check: Only Admins or the assigned user can upload attachments
    const isAdmin = req.user.role === 'Admin';
    const isAssignedToMe = task.assignedTo && task.assignedTo.toString() === req.user._id.toString();

    if (!isAdmin && !isAssignedToMe) {
      return res.status(403).json({ message: 'You are not authorized to upload attachments to this task' });
    }

    const attachment = {
      url: req.file.path,
      filename: req.file.originalname,
      uploadedAt: new Date()
    };

    task.attachments.push(attachment);
    await task.save();

    await logActivity({
      userId: req.user._id,
      projectId: task.projectId,
      taskId: task._id,
      action: 'Uploaded file',
      metadata: { filename: req.file.originalname }
    });

    // Notify admins about file upload
    const io = req.app.get('io');
    const project = await Project.findById(task.projectId);
    const projectName = project ? project.name : 'Unknown';

    sendAdminNotification(io, {
      message: `File "${req.file.originalname}" uploaded to task "${task.title}" in "${projectName}" by ${req.user.name}`,
      type: 'file_uploaded',
      excludeUserId: req.user._id
    });

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.removeAttachment = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Permission Check: Only Admins or the assigned user can remove attachments
    const isAdmin = req.user.role === 'Admin';
    const isAssignedToMe = task.assignedTo && task.assignedTo.toString() === req.user._id.toString();

    if (!isAdmin && !isAssignedToMe) {
      return res.status(403).json({ message: 'You are not authorized to remove attachments from this task' });
    }

    const attachmentId = req.params.attachmentId;
    task.attachments = task.attachments.filter(att => att._id.toString() !== attachmentId);
    
    await task.save();

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
