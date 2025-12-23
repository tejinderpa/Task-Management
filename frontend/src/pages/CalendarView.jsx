import { useEffect, useState, useMemo } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import useTaskStore from '../store/taskStore';
import TaskModal from '../components/tasks/TaskModal';

const locales = {
  'en-US': enUS
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const CalendarView = () => {
  const { tasks, fetchTasks } = useTaskStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const events = useMemo(() => {
    return tasks.map(task => ({
      id: task._id,
      title: task.title,
      start: new Date(task.dueDate),
      end: new Date(task.dueDate),
      resource: task,
    }));
  }, [tasks]);

  const eventStyleGetter = (event) => {
    const task = event.resource;
    let backgroundColor = '#3182ce';
    
    if (task.status === 'DONE') backgroundColor = '#38a169';
    else if (task.priority === 'urgent') backgroundColor = '#e53e3e';
    else if (task.priority === 'high') backgroundColor = '#dd6b20';
    else if (task.priority === 'medium') backgroundColor = '#3182ce';
    else backgroundColor = '#718096';

    return {
      style: {
        backgroundColor,
        borderRadius: '5px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block',
      }
    };
  };

  const handleSelectEvent = (event) => {
    setSelectedTask(event.resource);
    setIsModalOpen(true);
  };

  return (
    <div className="h-screen flex flex-col p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Calendar View</h1>
        <p className="text-gray-600 dark:text-gray-400">View and manage your tasks on a calendar</p>
      </div>

      <div className="flex-1 bg-white dark:bg-gray-900 rounded-lg shadow-lg p-4">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          eventPropGetter={eventStyleGetter}
          onSelectEvent={handleSelectEvent}
          views={['month', 'week', 'day', 'agenda']}
          className="dark:text-white"
        />
      </div>

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

export default CalendarView;
