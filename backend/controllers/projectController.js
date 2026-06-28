const Project = require('../models/Project');
const Task = require('../models/Task');
const { logAction } = require('../middleware/auditLogger');

// @desc    Get all projects in the user's organization
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({ organization: req.user.organization }).sort({ createdAt: -1 });

    // Compute task stats for each project
    const projectsWithStats = await Promise.all(
      projects.map(async (project) => {
        const total = await Task.countDocuments({ project: project._id });
        const done = await Task.countDocuments({ project: project._id, status: 'Done' });
        return {
          ...project.toObject(),
          stats: {
            total,
            done,
            pending: total - done,
          },
        };
      })
    );

    res.json(projectsWithStats);
  } catch (error) {
    next(error);
  }
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Private
const createProject = async (req, res, next) => {
  try {
    const { name, description, deadline } = req.body;

    // Admin-only check
    if (req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Only organization admins can create projects');
    }

    // Backend validation
    if (!name || !name.trim()) {
      res.status(400);
      throw new Error('Project name is required');
    }

    const project = await Project.create({
      name,
      description,
      deadline: deadline || null,
      owner: req.user._id,
      organization: req.user.organization,
    });

    // Audit log project creation
    await logAction(req.user._id, req.user.organization, 'Project Created', `${req.user.name} created project "${project.name}"`);

    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single project details and tasks
// @route   GET /api/projects/:id
// @access  Private
const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      res.status(404);
      throw new Error('Project not found');
    }

    // Organization check
    if (project.organization.toString() !== req.user.organization.toString()) {
      res.status(403);
      throw new Error('Not authorized to access projects outside your organization');
    }

    // Fetch tasks
    const tasks = await Task.find({ project: project._id })
      .populate('assignedTo', 'name email')
      .populate('project', 'name')
      .sort({ createdAt: -1 });

    res.json({
      ...project.toObject(),
      tasks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update project (owner or admin only)
// @route   PUT /api/projects/:id
// @access  Private
const updateProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      res.status(404);
      throw new Error('Project not found');
    }

    // Owner or Admin check
    const isOwner = project.owner.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      res.status(403);
      throw new Error('Only the project owner or organization admin can update this project');
    }

    const { name, description, deadline } = req.body;

    if (name !== undefined) {
      if (!name || !name.trim()) {
        res.status(400);
        throw new Error('Project name cannot be empty');
      }
      project.name = name;
    }

    project.description = description !== undefined ? description : project.description;
    project.deadline = deadline !== undefined ? deadline : project.deadline;

    const updatedProject = await project.save();

    // Audit log project update
    await logAction(req.user._id, req.user.organization, 'Project Updated', `${req.user.name} updated project settings for "${updatedProject.name}"`);

    res.json(updatedProject);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete project and its tasks (owner or admin only)
// @route   DELETE /api/projects/:id
// @access  Private
const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      res.status(404);
      throw new Error('Project not found');
    }

    // Owner or Admin check
    const isOwner = project.owner.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      res.status(403);
      throw new Error('Only the project owner or organization admin can delete this project');
    }

    // Cascade delete tasks
    await Task.deleteMany({ project: project._id });

    // Delete project
    await project.deleteOne();

    // Audit log project deletion
    await logAction(req.user._id, req.user.organization, 'Project Deleted', `${req.user.name} deleted project "${project.name}" and all its tasks`);

    res.json({ message: 'Project and all its tasks removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
};
