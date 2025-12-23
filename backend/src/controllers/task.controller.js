import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Task } from "../models/task.models.js";
import { User } from "../models/user.models.js";
import { AuditLog } from "../models/auditLog.models.js";
import { AUDIT_ACTIONS, TASK_STATUS, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "../constants.js";
import { sendTaskAssignedEmail, sendTaskCompletedEmail } from "../services/email.service.js";
import logger from "../utils/logger.js";

/**
 * @desc    Get all tasks with filtering, sorting, and pagination
 * @route   GET /api/v1/tasks
 * @access  Private
 */
const getTasks = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = DEFAULT_PAGE_SIZE,
        status,
        priority,
        assignedTo,
        createdBy,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        fromDate,
        toDate
    } = req.query;

    // Build query
    const query = { isDeleted: false };

    // Apply filters
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (assignedTo) query.assignedTo = assignedTo;
    if (createdBy) query.createdBy = createdBy;

    // Date range filter
    if (fromDate || toDate) {
        query.dueDate = {};
        if (fromDate) query.dueDate.$gte = new Date(fromDate);
        if (toDate) query.dueDate.$lte = new Date(toDate);
    }

    // Full-text search
    if (search) {
        query.$text = { $search: search };
    }

    // Role-based filtering: regular users only see their own tasks or assigned tasks
    if (req.user.role === 'user') {
        query.$or = [
            { createdBy: req.user._id },
            { assignedTo: req.user._id }
        ];
    }

    // Pagination options
    const options = {
        page: parseInt(page),
        limit: Math.min(parseInt(limit), MAX_PAGE_SIZE),
        sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 },
        populate: [
            { path: 'createdBy', select: 'firstName lastName email' },
            { path: 'assignedTo', select: 'firstName lastName email' }
        ]
    };

    // Execute aggregation with pagination
    const aggregate = Task.aggregate([
        { $match: query },
        {
            $lookup: {
                from: 'users',
                localField: 'createdBy',
                foreignField: '_id',
                as: 'createdBy'
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'assignedTo',
                foreignField: '_id',
                as: 'assignedTo'
            }
        },
        {
            $unwind: {
                path: '$createdBy',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $unwind: {
                path: '$assignedTo',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $project: {
                title: 1,
                description: 1,
                status: 1,
                priority: 1,
                dueDate: 1,
                tags: 1,
                createdAt: 1,
                updatedAt: 1,
                completedAt: 1,
                'createdBy._id': 1,
                'createdBy.firstName': 1,
                'createdBy.lastName': 1,
                'createdBy.email': 1,
                'assignedTo._id': 1,
                'assignedTo.firstName': 1,
                'assignedTo.lastName': 1,
                'assignedTo.email': 1
            }
        },
        { $sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 } }
    ]);

    const tasks = await Task.aggregatePaginate(aggregate, options);

    return res.status(200).json(
        new ApiResponse(200, tasks, "Tasks retrieved successfully")
    );
});

/**
 * @desc    Get single task by ID
 * @route   GET /api/v1/tasks/:id
 * @access  Private
 */
const getTaskById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const task = await Task.findOne({ _id: id, isDeleted: false })
        .populate('createdBy', 'firstName lastName email')
        .populate('assignedTo', 'firstName lastName email');

    if (!task) {
        throw new ApiError(404, "Task not found");
    }

    // Check if user has permission to view task
    if (req.user.role === 'user' &&
        task.createdBy._id.toString() !== req.user._id.toString() &&
        (!task.assignedTo || task.assignedTo._id.toString() !== req.user._id.toString())) {
        throw new ApiError(403, "You don't have permission to view this task");
    }

    return res.status(200).json(
        new ApiResponse(200, task, "Task retrieved successfully")
    );
});

/**
 * @desc    Create new task
 * @route   POST /api/v1/tasks
 * @access  Private
 */
const createTask = asyncHandler(async (req, res) => {
    const { title, description, priority, dueDate, assignedTo, tags } = req.body;

    // Create task
    const task = await Task.create({
        title,
        description,
        priority,
        dueDate,
        assignedTo: assignedTo || null,
        tags: tags || [],
        createdBy: req.user._id
    });

    const populatedTask = await Task.findById(task._id)
        .populate('createdBy', 'firstName lastName email')
        .populate('assignedTo', 'firstName lastName email');

    // Send email notification if task is assigned to someone
    if (assignedTo && assignedTo !== req.user._id.toString()) {
        try {
            const assignedUser = await User.findById(assignedTo);
            if (assignedUser) {
                await sendTaskAssignedEmail(assignedUser, populatedTask);
                logger.info(`Task assigned email sent to ${assignedUser.email}`);
            }
        } catch (emailError) {
            logger.error('Failed to send task assignment email:', emailError);
            // Don't fail the request if email fails
        }
    }

    // Create audit log
    await AuditLog.createLog({
        userId: req.user._id,
        action: AUDIT_ACTIONS.CREATE,
        resourceType: 'Task',
        resourceId: task._id,
        details: { title, priority, dueDate },
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
    });

    return res.status(201).json(
        new ApiResponse(201, populatedTask, "Task created successfully")
    );
});

/**
 * @desc    Update task
 * @route   PUT /api/v1/tasks/:id
 * @access  Private
 */
const updateTask = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { title, description, priority, dueDate, assignedTo, tags } = req.body;

    const task = await Task.findOne({ _id: id, isDeleted: false });

    if (!task) {
        throw new ApiError(404, "Task not found");
    }

    // Check permissions
    if (req.user.role === 'user' && task.createdBy.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You don't have permission to update this task");
    }

    // Store old values for audit
    const oldValues = {
        title: task.title,
        description: task.description,
        priority: task.priority,
        dueDate: task.dueDate,
        assignedTo: task.assignedTo
    };

    // Update task
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (assignedTo !== undefined) task.assignedTo = assignedTo;
    if (tags !== undefined) task.tags = tags;

    await task.save();

    const updatedTask = await Task.findById(task._id)
        .populate('createdBy', 'firstName lastName email')
        .populate('assignedTo', 'firstName lastName email');

    // Create audit log
    await AuditLog.createLog({
        userId: req.user._id,
        action: AUDIT_ACTIONS.UPDATE,
        resourceType: 'Task',
        resourceId: task._id,
        details: { oldValues, newValues: req.body },
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
    });

    return res.status(200).json(
        new ApiResponse(200, updatedTask, "Task updated successfully")
    );
});

/**
 * @desc    Update task status
 * @route   PATCH /api/v1/tasks/:id/status
 * @access  Private
 */
const updateTaskStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!Object.values(TASK_STATUS).includes(status)) {
        throw new ApiError(400, "Invalid status value");
    }

    const task = await Task.findOne({ _id: id, isDeleted: false });

    if (!task) {
        throw new ApiError(404, "Task not found");
    }

    // Check if user is assigned to task or created it
    if (req.user.role === 'user' &&
        task.createdBy.toString() !== req.user._id.toString() &&
        (!task.assignedTo || task.assignedTo.toString() !== req.user._id.toString())) {
        throw new ApiError(403, "You don't have permission to update this task status");
    }

    const oldStatus = task.status;
    task.status = status;

    // Set completedAt if status is DONE
    if (status === TASK_STATUS.DONE) {
        task.completedAt = new Date();
        
        // Send completion email
        try {
            const taskOwner = await User.findById(task.createdBy);
            if (taskOwner) {
                await sendTaskCompletedEmail(taskOwner, task);
                logger.info(`Task completion email sent to ${taskOwner.email}`);
            }
        } catch (emailError) {
            logger.error('Failed to send task completion email:', emailError);
        }
    } else {
        task.completedAt = null;
    }

    await task.save();

    const updatedTask = await Task.findById(task._id)
        .populate('createdBy', 'firstName lastName email')
        .populate('assignedTo', 'firstName lastName email');

    // Create audit log
    await AuditLog.createLog({
        userId: req.user._id,
        action: AUDIT_ACTIONS.STATUS_CHANGE,
        resourceType: 'Task',
        resourceId: task._id,
        details: { oldStatus, newStatus: status },
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
    });

    return res.status(200).json(
        new ApiResponse(200, updatedTask, "Task status updated successfully")
    );
});

/**
 * @desc    Delete task (soft delete)
 * @route   DELETE /api/v1/tasks/:id
 * @access  Private
 */
const deleteTask = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const task = await Task.findOne({ _id: id, isDeleted: false });

    if (!task) {
        throw new ApiError(404, "Task not found");
    }

    // Only creator, manager, or admin can delete
    if (req.user.role === 'user' && task.createdBy.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You don't have permission to delete this task");
    }

    await task.softDelete();

    // Create audit log
    await AuditLog.createLog({
        userId: req.user._id,
        action: AUDIT_ACTIONS.DELETE,
        resourceType: 'Task',
        resourceId: task._id,
        details: { title: task.title },
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
    });

    return res.status(200).json(
        new ApiResponse(200, null, "Task deleted successfully")
    );
});

/**
 * @desc    Get task statistics
 * @route   GET /api/v1/tasks/stats
 * @access  Private
 */
const getTaskStats = asyncHandler(async (req, res) => {
    const userId = req.user.role === 'user' ? req.user._id : null;

    const matchStage = { isDeleted: false };
    if (userId) {
        matchStage.$or = [
            { createdBy: userId },
            { assignedTo: userId }
        ];
    }

    const stats = await Task.aggregate([
        { $match: matchStage },
        {
            $facet: {
                statusCount: [
                    { $group: { _id: '$status', count: { $sum: 1 } } }
                ],
                priorityCount: [
                    { $group: { _id: '$priority', count: { $sum: 1 } } }
                ],
                overdueTasks: [
                    {
                        $match: {
                            dueDate: { $lt: new Date() },
                            status: { $ne: TASK_STATUS.DONE }
                        }
                    },
                    { $count: 'count' }
                ],
                completedThisWeek: [
                    {
                        $match: {
                            completedAt: {
                                $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                            }
                        }
                    },
                    { $count: 'count' }
                ]
            }
        }
    ]);

    return res.status(200).json(
        new ApiResponse(200, stats[0], "Task statistics retrieved successfully")
    );
});

export {
    getTasks,
    getTaskById,
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
    getTaskStats
};
