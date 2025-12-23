import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';

/**
 * Export tasks to PDF format
 * @param {Array} tasks - Array of task objects
 * @param {string} filterType - Optional filter type for filename
 */
export const exportToPDF = (tasks, filterType = '') => {
  try {
    // Create new PDF document
    const doc = new jsPDF();
    
    // Add title
    const title = filterType 
      ? `Task Report - ${filterType.charAt(0).toUpperCase() + filterType.slice(1)}`
      : 'Task Management Report';
    
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text(title, 14, 22);
    
    // Add metadata
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Generated on: ${format(new Date(), 'MMMM dd, yyyy h:mm a')}`, 14, 30);
    doc.text(`Total Tasks: ${tasks.length}`, 14, 36);
    
    // Calculate statistics
    const stats = {
      TODO: tasks.filter(t => t.status === 'TODO').length,
      IN_PROGRESS: tasks.filter(t => t.status === 'IN_PROGRESS').length,
      REVIEW: tasks.filter(t => t.status === 'REVIEW').length,
      DONE: tasks.filter(t => t.status === 'DONE').length,
      urgent: tasks.filter(t => t.priority === 'urgent').length,
      high: tasks.filter(t => t.priority === 'high').length,
      medium: tasks.filter(t => t.priority === 'medium').length,
      low: tasks.filter(t => t.priority === 'low').length,
    };
    
    // Add statistics section
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Task Statistics', 14, 46);
    
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.text(`By Status: TODO (${stats.TODO}) | In Progress (${stats.IN_PROGRESS}) | Review (${stats.REVIEW}) | Done (${stats.DONE})`, 14, 52);
    doc.text(`By Priority: Urgent (${stats.urgent}) | High (${stats.high}) | Medium (${stats.medium}) | Low (${stats.low})`, 14, 57);
    
    // Prepare table data
    const tableData = tasks.map(task => [
      task.title,
      task.status.replace('_', ' '),
      task.priority.charAt(0).toUpperCase() + task.priority.slice(1),
      task.dueDate ? format(new Date(task.dueDate), 'MMM dd, yyyy') : 'No due date',
      task.description ? task.description.substring(0, 50) + (task.description.length > 50 ? '...' : '') : '-'
    ]);
    
    // Add table
    doc.autoTable({
      head: [['Title', 'Status', 'Priority', 'Due Date', 'Description']],
      body: tableData,
      startY: 65,
      styles: { 
        fontSize: 8,
        cellPadding: 3,
      },
      headStyles: { 
        fillColor: [99, 102, 241],
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250]
      },
      columnStyles: {
        0: { cellWidth: 40 }, // Title
        1: { cellWidth: 25 }, // Status
        2: { cellWidth: 20 }, // Priority
        3: { cellWidth: 30 }, // Due Date
        4: { cellWidth: 'auto' } // Description
      },
      didDrawPage: (data) => {
        // Add footer with page number
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(8);
        doc.text(
          `Page ${data.pageNumber} of ${pageCount}`,
          doc.internal.pageSize.getWidth() / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }
    });
    
    // Save the PDF
    const filename = filterType 
      ? `tasks-${filterType}-${format(new Date(), 'yyyy-MM-dd')}.pdf`
      : `tasks-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
    
    doc.save(filename);
    
    return { success: true, filename };
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Export tasks to CSV format
 * @param {Array} tasks - Array of task objects
 * @param {string} filterType - Optional filter type for filename
 */
export const exportToCSV = (tasks, filterType = '') => {
  try {
    // Define CSV headers
    const headers = [
      'Title',
      'Description',
      'Status',
      'Priority',
      'Due Date',
      'Created At',
      'Updated At',
      'Tags'
    ];
    
    // Convert tasks to CSV rows
    const rows = tasks.map(task => [
      task.title,
      task.description || '',
      task.status,
      task.priority,
      task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd HH:mm:ss') : '',
      format(new Date(task.createdAt), 'yyyy-MM-dd HH:mm:ss'),
      format(new Date(task.updatedAt), 'yyyy-MM-dd HH:mm:ss'),
      task.tags ? task.tags.join('; ') : ''
    ]);
    
    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => 
        row.map(cell => 
          // Escape commas and quotes in cell content
          `"${String(cell).replace(/"/g, '""')}"`
        ).join(',')
      )
    ].join('\n');
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    const filename = filterType 
      ? `tasks-${filterType}-${format(new Date(), 'yyyy-MM-dd')}.csv`
      : `tasks-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return { success: true, filename };
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Export task statistics to PDF
 * @param {Object} stats - Statistics object with counts
 */
export const exportStatsToPDF = (stats) => {
  try {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('Task Management Statistics', 14, 22);
    
    // Date
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Generated on: ${format(new Date(), 'MMMM dd, yyyy h:mm a')}`, 14, 32);
    
    // Overview Section
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Overview', 14, 45);
    
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.text(`Total Tasks: ${stats.total || 0}`, 20, 55);
    doc.text(`Overdue Tasks: ${stats.overdue || 0}`, 20, 62);
    doc.text(`Due Today: ${stats.dueToday || 0}`, 20, 69);
    doc.text(`Upcoming This Week: ${stats.upcomingWeek || 0}`, 20, 76);
    
    // Status Distribution
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Status Distribution', 14, 90);
    
    const statusData = [
      ['Status', 'Count', 'Percentage'],
      ['To Do', stats.TODO || 0, `${((stats.TODO || 0) / (stats.total || 1) * 100).toFixed(1)}%`],
      ['In Progress', stats.IN_PROGRESS || 0, `${((stats.IN_PROGRESS || 0) / (stats.total || 1) * 100).toFixed(1)}%`],
      ['Review', stats.REVIEW || 0, `${((stats.REVIEW || 0) / (stats.total || 1) * 100).toFixed(1)}%`],
      ['Done', stats.DONE || 0, `${((stats.DONE || 0) / (stats.total || 1) * 100).toFixed(1)}%`]
    ];
    
    doc.autoTable({
      head: [statusData[0]],
      body: statusData.slice(1),
      startY: 95,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [99, 102, 241] }
    });
    
    // Priority Distribution
    const finalY = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Priority Distribution', 14, finalY);
    
    const priorityData = [
      ['Priority', 'Count', 'Percentage'],
      ['Urgent', stats.urgent || 0, `${((stats.urgent || 0) / (stats.total || 1) * 100).toFixed(1)}%`],
      ['High', stats.high || 0, `${((stats.high || 0) / (stats.total || 1) * 100).toFixed(1)}%`],
      ['Medium', stats.medium || 0, `${((stats.medium || 0) / (stats.total || 1) * 100).toFixed(1)}%`],
      ['Low', stats.low || 0, `${((stats.low || 0) / (stats.total || 1) * 100).toFixed(1)}%`]
    ];
    
    doc.autoTable({
      head: [priorityData[0]],
      body: priorityData.slice(1),
      startY: finalY + 5,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [99, 102, 241] }
    });
    
    // Save
    doc.save(`task-statistics-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    
    return { success: true };
  } catch (error) {
    console.error('Error exporting statistics:', error);
    return { success: false, error: error.message };
  }
};
