import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import { TASK_STATUS, TASK_PRIORITY } from "../constants.js";

const taskSchema = new Schema(
    {
        title: {
            type: String,
            required: [true, 'Task title is required'],
            trim: true,
            maxlength: [200, 'Title cannot exceed 200 characters'],
            index: true
        },
        description: {
            type: String,
            required: [true, 'Task description is required'],
            trim: true,
            maxlength: [2000, 'Description cannot exceed 2000 characters']
        },
        status: {
            type: String,
            enum: Object.values(TASK_STATUS),
            default: TASK_STATUS.TODO,
            index: true
        },
        priority: {
            type: String,
            enum: Object.values(TASK_PRIORITY),
            default: TASK_PRIORITY.MEDIUM,
            index: true
        },
        dueDate: {
            type: Date,
            required: [true, 'Due date is required'],
            index: true
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },
        assignedTo: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            default: null,
            index: true
        },
        tags: [{
            type: String,
            trim: true,
            lowercase: true
        }],
        isDeleted: {
            type: Boolean,
            default: false,
            index: true
        },
        deletedAt: {
            type: Date,
            default: null
        },
        completedAt: {
            type: Date,
            default: null
        },
        notifications: {
            dueSoonSent: {
                type: Boolean,
                default: false
            },
            overdueSent: {
                type: Boolean,
                default: false
            }
        }
    },
    {
        timestamps: true
    }
);

// Compound indexes for common queries
taskSchema.index({ status: 1, priority: 1 });
taskSchema.index({ assignedTo: 1, status: 1 });
taskSchema.index({ createdBy: 1, createdAt: -1 });
taskSchema.index({ dueDate: 1, status: 1 });
taskSchema.index({ isDeleted: 1, status: 1 });

// Text index for full-text search
taskSchema.index({ title: 'text', description: 'text' });

// Virtual for checking if task is overdue
taskSchema.virtual('isOverdue').get(function() {
    if (this.status === TASK_STATUS.DONE) return false;
    return new Date() > this.dueDate;
});

// Method to soft delete
taskSchema.methods.softDelete = function() {
    this.isDeleted = true;
    this.deletedAt = new Date();
    return this.save();
};

// Query helper to exclude deleted tasks
taskSchema.query.notDeleted = function() {
    return this.where({ isDeleted: false });
};

// Plugin for pagination
taskSchema.plugin(mongooseAggregatePaginate);

export const Task = mongoose.model("Task", taskSchema);
