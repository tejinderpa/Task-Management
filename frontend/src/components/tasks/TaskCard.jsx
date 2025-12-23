import { FiCalendar, FiEdit2, FiTrash2, FiClock } from 'react-icons/fi';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import useTaskStore from '../../store/taskStore';

const TaskCard = ({ task, onEdit, style }) => {
  const { deleteTask, updateTaskStatus } = useTaskStore();

  const statusConfig = {
    TODO: { color: 'bg-yellow-100 text-yellow-800', label: 'To Do' },
    IN_PROGRESS: { color: 'bg-blue-100 text-blue-800', label: 'In Progress' },
    REVIEW: { color: 'bg-purple-100 text-purple-800', label: 'Review' },
    DONE: { color: 'bg-green-100 text-green-800', label: 'Done' },
  };

  const priorityConfig = {
    low: { color: 'bg-gray-100 text-gray-800', label: 'Low' },
    medium: { color: 'bg-blue-100 text-blue-800', label: 'Medium' },
    high: { color: 'bg-orange-100 text-orange-800', label: 'High' },
    urgent: { color: 'bg-red-100 text-red-800', label: 'Urgent' },
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(task._id);
        toast.success('Task deleted successfully');
      } catch (error) {
        toast.error('Failed to delete task');
      }
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await updateTaskStatus(task._id, newStatus);
      toast.success('Status updated successfully');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE';

  return (
    <div
      className="card hover:shadow-xl transition-all duration-200 animate-slide-in"
      style={style}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {task.title}
          </h3>
          <div className="flex flex-wrap gap-2">
            <span className={`badge ${statusConfig[task.status]?.color}`}>
              {statusConfig[task.status]?.label}
            </span>
            <span className={`badge ${priorityConfig[task.priority]?.color}`}>
              {priorityConfig[task.priority]?.label}
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {task.description}
        </p>
      )}

      {/* Due Date */}
      {task.dueDate && (
        <div className={`flex items-center gap-2 text-sm mb-4 ${
          isOverdue ? 'text-red-600' : 'text-gray-600'
        }`}>
          <FiCalendar className="w-4 h-4" />
          <span>
            {isOverdue && <strong>Overdue: </strong>}
            Due {format(new Date(task.dueDate), 'MMM dd, yyyy h:mm a')}
          </span>
        </div>
      )}

      {/* Assigned To */}
      {task.assignedTo && (
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-accent-400 rounded-full flex items-center justify-center text-white text-sm font-semibold">
            {task.assignedTo.firstName?.[0]}{task.assignedTo.lastName?.[0]}
          </div>
          <span className="text-sm text-gray-600">
            {task.assignedTo.firstName} {task.assignedTo.lastName}
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(task)}
            className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            title="Edit task"
          >
            <FiEdit2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete task"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Status Change */}
        {task.status !== 'DONE' && (
          <select
            value={task.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="text-sm border rounded-lg px-2 py-1 hover:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="REVIEW">Review</option>
            <option value="DONE">Done</option>
          </select>
        )}
      </div>

      {/* Created timestamp */}
      <div className="flex items-center gap-1 text-xs text-gray-400 mt-3">
        <FiClock className="w-3 h-3" />
        <span>Created {format(new Date(task.createdAt), 'MMM dd, yyyy')}</span>
      </div>
    </div>
  );
};

export default TaskCard;
