const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
const Organization = require('../models/Organization');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, orgMode, orgName, orgId } = req.body;

    // Validation
    if (!name || !name.trim()) {
      res.status(400);
      throw new Error('Name is required');
    }
    if (!email || !email.trim()) {
      res.status(400);
      throw new Error('Email is required');
    }
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      res.status(400);
      throw new Error('Please enter a valid email address');
    }
    if (!password) {
      res.status(400);
      throw new Error('Password is required');
    }
    if (password.length < 6) {
      res.status(400);
      throw new Error('Password must be at least 6 characters');
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error('Email already registered');
    }

    // Handle Organization
    let selectedOrgId = null;

    if (orgMode === 'create') {
      if (!orgName || !orgName.trim()) {
        res.status(400);
        throw new Error('Organization name is required to create a new organization');
      }

      // Check if organization name exists (case-insensitive)
      const orgExists = await Organization.findOne({
        name: { $regex: new RegExp(`^${orgName.trim()}$`, 'i') },
      });
      if (orgExists) {
        res.status(400);
        throw new Error('Organization name already exists');
      }

      // Create new organization
      const newOrg = await Organization.create({ name: orgName.trim() });
      selectedOrgId = newOrg._id;
    } else if (orgMode === 'join') {
      if (!orgId) {
        res.status(400);
        throw new Error('Please select an organization to join');
      }

      // Find organization
      const existingOrg = await Organization.findById(orgId);
      if (!existingOrg) {
        res.status(404);
        throw new Error('Organization not found');
      }
      selectedOrgId = existingOrg._id;
    } else {
      res.status(400);
      throw new Error('Invalid organization mode selection');
    }

    // Create user with organization and role
    const user = await User.create({
      name,
      email,
      password,
      organization: selectedOrgId,
      role: orgMode === 'create' ? 'admin' : 'member',
    });

    if (user) {
      const populatedUser = await User.findById(user._id).populate('organization', 'name');
      res.status(201).json({
        token: generateToken(populatedUser._id),
        user: {
          _id: populatedUser._id,
          name: populatedUser.name,
          email: populatedUser.email,
          organization: populatedUser.organization,
          role: populatedUser.role,
          createdAt: populatedUser.createdAt,
        },
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !email.trim()) {
      res.status(400);
      throw new Error('Email is required');
    }
    if (!password) {
      res.status(400);
      throw new Error('Password is required');
    }

    // Check for user & populate organization
    const user = await User.findOne({ email }).populate('organization', 'name');

    if (user && (await user.matchPassword(password))) {
      res.json({
        token: generateToken(user._id),
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          organization: user.organization,
          role: user.role,
          createdAt: user.createdAt,
        },
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user profile & computed stats (scoped by organization)
// @route   GET /api/auth/me
// @access  Private
const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('organization', 'name').select('-password');
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // Get organization-wide projects
    const projects = await Project.find({ organization: user.organization });
    const projectIds = projects.map((p) => p._id);

    // Compute stats
    const totalProjects = projects.length;
    const totalTasks = await Task.countDocuments({ project: { $in: projectIds } });
    const completedTasks = await Task.countDocuments({
      project: { $in: projectIds },
      status: 'Done',
    });
    const pendingTasks = totalTasks - completedTasks;

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      organization: user.organization,
      role: user.role,
      createdAt: user.createdAt,
      stats: {
        totalProjects,
        totalTasks,
        completedTasks,
        pendingTasks,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update profile name only
// @route   PUT /api/auth/me
// @access  Private
const updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('organization', 'name');

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    const { name } = req.body;

    if (!name || !name.trim()) {
      res.status(400);
      throw new Error('Name cannot be empty');
    }

    user.name = name;
    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      organization: updatedUser.organization,
      role: updatedUser.role,
      createdAt: updatedUser.createdAt,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all registered users within the same organization
// @route   GET /api/auth/users
// @access  Private
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({ organization: req.user.organization }).select('name email role');
    res.json(users);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all organizations
// @route   GET /api/auth/organizations
// @access  Public
const getOrganizations = async (req, res, next) => {
  try {
    const orgs = await Organization.find({}).sort({ name: 1 });
    res.json(orgs);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  getOrganizations,
};
