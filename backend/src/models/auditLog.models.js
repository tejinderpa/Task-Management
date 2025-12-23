import mongoose, { Schema } from "mongoose";
import { AUDIT_ACTIONS } from "../constants.js";

const auditLogSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },
        action: {
            type: String,
            enum: Object.values(AUDIT_ACTIONS),
            required: true,
            index: true
        },
        resourceType: {
            type: String,
            required: true,
            enum: ['Task', 'User', 'Auth'],
            index: true
        },
        resourceId: {
            type: Schema.Types.ObjectId,
            required: false,
            index: true
        },
        details: {
            type: Schema.Types.Mixed,
            default: {}
        },
        ipAddress: {
            type: String,
            default: null
        },
        userAgent: {
            type: String,
            default: null
        },
        timestamp: {
            type: Date,
            default: Date.now,
            index: true
        }
    },
    {
        timestamps: true
    }
);

// Compound indexes for common audit queries
auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ resourceType: 1, resourceId: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });

// Static method to create audit log
auditLogSchema.statics.createLog = async function(logData) {
    try {
        return await this.create(logData);
    } catch (error) {
        console.error('Audit log creation failed:', error);
        // Don't throw error to prevent audit logging from breaking the main flow
        return null;
    }
};

export const AuditLog = mongoose.model("AuditLog", auditLogSchema);
