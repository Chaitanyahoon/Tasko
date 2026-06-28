const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');
const mongoose = require('mongoose');
const { logAction } = require('../middleware/auditLogger');

// @desc    Get all tasks for a project
// @route   GET /api/tasks/project/:projectId
// @access  Private
const getTasksByProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      res.status(404);
      throw new Error('Project not found');
    }

    // Owner check
    if (project.owner.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to access tasks for this project');
    }

    const tasks = await Task.find({ project: projectId })
      .populate('assignedTo', 'name email')
      .populate('project', 'name')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res, next) => {
  try {
    const { title, description, dueDate, priority, status, assignedTo, project: projectId } = req.body;

    // Backend validation
    if (!title || !title.trim()) {
      res.status(400);
      throw new Error('Task title is required');
    }
    if (!projectId) {
      res.status(400);
      throw new Error('Project ID is required');
    }

    const project = await Project.findById(projectId);
    if (!project) {
      res.status(404);
      throw new Error('Project not found');
    }

    // Admin-only check — only admins can create tasks
    if (req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Only organization admins can create tasks');
    }

    // Organization check
    if (project.organization.toString() !== req.user.organization.toString()) {
      res.status(403);
      throw new Error('Not authorized to add tasks to projects outside your organization');
    }

    // Validate assignedTo user ID if provided
    let assignUser = null;
    if (assignedTo && assignedTo !== 'null' && assignedTo !== 'undefined' && assignedTo !== '') {
      if (!mongoose.Types.ObjectId.isValid(assignedTo)) {
        res.status(400);
        throw new Error('AssignedTo must be a valid User ID');
      }
      const userExists = await User.findById(assignedTo);
      if (!userExists) {
        res.status(404);
        throw new Error('Assigned user not found');
      }
      assignUser = assignedTo;
    }

    const task = await Task.create({
      title,
      description,
      status: status || 'Todo',
      priority: priority || 'Medium',
      dueDate,
      assignedTo: assignUser,
      project: projectId,
    });

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('project', 'name');

    // Audit log task creation
    await logAction(req.user._id, req.user.organization, 'Task Created', `${req.user.name} created task "${populatedTask.title}" in project "${project.name}"`);

    res.status(201).json(populatedTask);
  } catch (error) {
    next(error);
  }
};

// @desc    Update task details (by owner or assignee)
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    const project = await Project.findById(task.project);
    if (!project) {
      res.status(404);
      throw new Error('Project not found');
    }

    const isAdmin = req.user.role === 'admin';
    const isAssignee = task.assignedTo && task.assignedTo.toString() === req.user._id.toString();

    if (!isAdmin && !isAssignee) {
      res.status(403);
      throw new Error('Not authorized to edit this task');
    }

    const { title, description, dueDate, priority, status, assignedTo } = req.body;

    // Members (non-admins) can ONLY update the status of tasks assigned to them
    if (!isAdmin) {
      if (title !== undefined || description !== undefined || dueDate !== undefined || priority !== undefined || assignedTo !== undefined) {
        res.status(403);
        throw new Error('Members can only update the status of their assigned tasks');
      }
      task.status = status !== undefined ? status : task.status;
    } else {
      // Admins can update everything
      if (title !== undefined) {
        if (!title || !title.trim()) {
          res.status(400);
          throw new Error('Task title cannot be empty');
        }
        task.title = title;
      }

      task.description = description !== undefined ? description : task.description;
      task.dueDate = dueDate !== undefined ? dueDate : task.dueDate;
      task.priority = priority !== undefined ? priority : task.priority;
      task.status = status !== undefined ? status : task.status;

      if (assignedTo !== undefined) {
        if (!assignedTo || assignedTo === 'null' || assignedTo === 'undefined' || assignedTo === '') {
          task.assignedTo = null;
        } else {
          if (!mongoose.Types.ObjectId.isValid(assignedTo)) {
            res.status(400);
            throw new Error('AssignedTo must be a valid User ID');
          }
          const userExists = await User.findById(assignedTo);
          if (!userExists) {
            res.status(404);
            throw new Error('Assigned user not found');
          }
          task.assignedTo = assignedTo;
        }
      }
    }

    const updatedTask = await task.save();
    
    const populatedUpdatedTask = await Task.findById(updatedTask._id)
      .populate('assignedTo', 'name email')
      .populate('project', 'name');

    // Audit log task update
    await logAction(req.user._id, req.user.organization, 'Task Updated', `${req.user.name} updated task "${populatedUpdatedTask.title}" status to "${populatedUpdatedTask.status}"`);

    res.json(populatedUpdatedTask);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    const project = await Project.findById(task.project);
    if (!project) {
      res.status(404);
      throw new Error('Project not found');
    }

    // Admin-only check
    if (req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Only organization admins can delete tasks');
    }

    await task.deleteOne();

    // Audit log task deletion
    await logAction(req.user._id, req.user.organization, 'Task Deleted', `${req.user.name} deleted task "${task.title}"`);

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all tasks assigned to current user across all projects
// @route   GET /api/tasks/assigned-to-me
// @access  Private
const getMyTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user._id })
      .populate('project', 'name description')
      .populate('assignedTo', 'name email')
      .sort({ dueDate: 1 });
    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasksByProject,
  createTask,
  updateTask,
  deleteTask,
  getMyTasks,
};
