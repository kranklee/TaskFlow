const Task = require("../models/Task");

// POST /api/tasks 
exports.createTask = async (req, res) => {
  try {
    const { title, description, dueDate, priority } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    
    const ownerId = req.user.id;

    const task = await Task.create({
      title,
      description,
      dueDate: dueDate || null,
      priority: priority || "medium",
      owner: ownerId,
    });

    return res.status(201).json(task);
  } catch (err) {
    console.error("Create task error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/tasks  
exports.getTasks = async (req, res) => {
  try {
    const ownerId = req.user.id;

    const tasks = await Task.find({ owner: ownerId }).sort({ createdAt: -1 });

    return res.json(tasks);
  } catch (err) {
    console.error("Get tasks error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/tasks/:id
exports.getTaskById = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const task = await Task.findOne({
      _id: req.params.id,
      owner: ownerId,
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(task);
  } catch (err) {
    console.error("Get task by id error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/tasks/:id
exports.updateTask = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { title, description, status, priority, dueDate } = req.body;

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, owner: ownerId },
      { title, description, status, priority, dueDate },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(task);
  } catch (err) {
    console.error("Update task error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/tasks/:id
exports.deleteTask = async (req, res) => {
  try {
    const ownerId = req.user.id;

    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      owner: ownerId,
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({ message: "Task deleted" });
  } catch (err) {
    console.error("Delete task error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
exports.delayTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findOne({ _id: id, owner: req.user.id });
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

   
    if (task.dueDate) {
      const d = new Date(task.dueDate);
      d.setDate(d.getDate() + 1); 
      task.dueDate = d;
    }
    task.status = "delayed";

    await task.save();

    res.json({ message: "Task delayed", task });
  } catch (err) {
    console.error("Delay task error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
