const ActivityLog = require('../models/ActivityLog');
const Project = require('../models/Project');

exports.getActivityLogs = async (req, res) => {
  try {
    let query = {};
    if (req.user.role !== 'Admin') {
      // Member sees their own activity and activity in their projects
      const projects = await Project.find({ members: req.user._id }).select('_id');
      const projectIds = projects.map(p => p._id);
      
      query = {
        $or: [
          { userId: req.user._id },
          { projectId: { $in: projectIds } }
        ]
      };
    }
    
    const logs = await ActivityLog.find(query)
      .populate('userId', 'name email profilePicture')
      .populate('projectId', 'name')
      .populate('taskId', 'title')
      .sort({ createdAt: -1 })
      .limit(100);
      
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProjectActivity = async (req, res) => {
  try {
    const projectId = req.params.id;
    
    if (req.user.role !== 'Admin') {
      const project = await Project.findById(projectId);
      if (!project || !project.members.includes(req.user._id)) {
        return res.status(403).json({ message: 'Not authorized' });
      }
    }

    const logs = await ActivityLog.find({ projectId })
      .populate('userId', 'name email profilePicture')
      .populate('taskId', 'title')
      .sort({ createdAt: -1 })
      .limit(50);
      
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
