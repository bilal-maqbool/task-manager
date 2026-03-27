const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const { protect } = require('../middleware/auth');

// All routes are protected (must be logged in)
router.use(protect);

// @route   GET /api/tasks
// @desc    Get all tasks for logged-in user (with search + filter)
// @access  Private
router.get('/', async (req, res) => {
  try {
    const { search, status, priority, category, sort } = req.query;

    // Build filter object
    let filter = { user: req.user._id };

    if (status && status !== 'all') filter.status = status;
    if (priority && priority !== 'all') filter.priority = priority;
    if (category && category !== 'all') filter.category = category;

    // Search by title or description
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Sort options
    let sortObj = { createdAt: -1 }; // Default: newest first
    if (sort === 'oldest') sortObj = { createdAt: 1 };
    if (sort === 'due-date') sortObj = { dueDate: 1 };
    if (sort === 'priority') sortObj = { priority: -1 };
    if (sort === 'title') sortObj = { title: 1 };

    const tasks = await Task.find(filter).sort(sortObj);

    // Task stats
    const allTasks = await Task.find({ user: req.user._id });
    const stats = {
      total: allTasks.length,
      pending: allTasks.filter(t => t.status === 'pending').length,
      inProgress: allTasks.filter(t => t.status === 'in-progress').length,
      completed: allTasks.filter(t => t.status === 'completed').length,
    };

    res.json({ success: true, count: tasks.length, tasks, stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/tasks
// @desc    Create a new task
// @access  Private
router.post('/', async (req, res) => {
  try {
    const { title, description, priority, category, dueDate } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Task title is required' });
    }

    const task = await Task.create({
      user: req.user._id,
      title,
      description,
      priority,
      category,
      dueDate: dueDate || null
    });

    res.status(201).json({ success: true, task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/tasks/:id
// @desc    Get single task
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    res.json({ success: true, task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/tasks/:id
// @desc    Update a task
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    let task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const { title, description, status, priority, category, dueDate } = req.body;

    // Update fields
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (category !== undefined) task.category = category;
    if (dueDate !== undefined) task.dueDate = dueDate || null;

    await task.save();
    res.json({ success: true, task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete a task
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PATCH /api/tasks/:id/complete
// @desc    Toggle task complete/incomplete
// @access  Private
router.patch('/:id/complete', async (req, res) => {
  try {
    let task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    task.status = task.status === 'completed' ? 'pending' : 'completed';
    await task.save();

    res.json({ success: true, task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
