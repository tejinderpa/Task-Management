import { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { FiPlus, FiCalendar, FiUser } from 'react-icons/fi';
import { format } from 'date-fns';
import useTaskStore from '../store/taskStore';
import TaskModal from '../components/tasks/TaskModal';
import toast from 'react-hot-toast';

const KanbanBoard = () => {
  const { tasks, fetchTasks, updateTaskStatus } = useTaskStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const columns = {
    TODO: { title: 'To Do', color: 'bg-yellow-100 border-yellow-300' },
    IN_PROGRESS: { title: 'In Progress', color: 'bg-blue-100 border-blue-300' },
    REVIEW: { title: 'Review', color: 'bg-purple-100 border-purple-300' },
    DONE: { title: 'Done', color: 'bg-green-100 border-green-300' },
  };

  const tasksByStatus = Object.keys(columns).reduce((acc, status) => {
    acc[status] = tasks.filter(task => task.status === status);
    return acc;
  }, {});

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId) return;

    try {
      await updateTaskStatus(draggableId, destination.droppableId);
      toast.success('Task status updated');
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const priorityColors = {
    low: 'bg-gray-200 text-gray-700',
    medium: 'bg-blue-200 text-blue-700',
    high: 'bg-orange-200 text-orange-700',
    urgent: 'bg-red-200 text-red-700',
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Kanban Board</h1>
        <p className="text-gray-600 dark:text-gray-400">Drag tasks between columns to update status</p>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4 flex-1">
          {Object.entries(columns).map(([status, { title, color }]) => (
            <div key={status} className="flex-shrink-0 w-80">
              <div className={`rounded-lg border-2 ${color} p-4 mb-3`}>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">{title}</h3>
                  <span className="px-2 py-1 bg-white rounded-full text-sm font-medium">
                    {tasksByStatus[status]?.length || 0}
                  </span>
                </div>
              </div>

              <Droppable droppableId={status}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`space-y-3 min-h-[500px] rounded-lg p-2 transition-colors ${
                      snapshot.isDraggingOver ? 'bg-blue-50 dark:bg-gray-700' : 'bg-gray-50 dark:bg-gray-800'
                    }`}
                  >
                    {tasksByStatus[status]?.map((task, index) => (
                      <Draggable key={task._id} draggableId={task._id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            onClick={() => {
                              setSelectedTask(task);
                              setIsModalOpen(true);
                            }}
                            className={`bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-md transition-all ${
                              snapshot.isDragging ? 'rotate-2 shadow-lg' : ''
                            }`}
                          >
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                              {task.title}
                            </h4>
                            
                            {task.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                                {task.description}
                              </p>
                            )}

                            <div className="flex items-center gap-2 mb-2">
                              <span className={`text-xs px-2 py-1 rounded-full font-medium ${priorityColors[task.priority]}`}>
                                {task.priority}
                              </span>
                            </div>

                            {task.dueDate && (
                              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                <FiCalendar className="w-3 h-3" />
                                {format(new Date(task.dueDate), 'MMM dd, h:mm a')}
                              </div>
                            )}

                            {task.assignedTo && (
                              <div className="flex items-center gap-2 mt-2">
                                <div className="w-6 h-6 bg-gradient-to-br from-primary-400 to-accent-400 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                                  {task.assignedTo.firstName?.[0]}{task.assignedTo.lastName?.[0]}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      {isModalOpen && (
        <TaskModal
          task={selectedTask}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedTask(null);
          }}
          onSuccess={() => {
            setIsModalOpen(false);
            setSelectedTask(null);
            fetchTasks();
          }}
        />
      )}
    </div>
  );
};

export default KanbanBoard;
