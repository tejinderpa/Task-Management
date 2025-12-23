const API_URL = 'http://localhost:8000/api/v1';

// Sample tasks data
const taskTemplates = [
  // TODO tasks
  { title: 'Review project requirements', description: 'Go through all client requirements and prepare documentation', priority: 'high', status: 'TODO' },
  { title: 'Setup development environment', description: 'Install and configure all necessary tools and dependencies', priority: 'medium', status: 'TODO' },
  { title: 'Design database schema', description: 'Create ERD and design normalized database structure', priority: 'high', status: 'TODO' },
  { title: 'Research new UI frameworks', description: 'Evaluate and compare modern UI frameworks for the project', priority: 'low', status: 'TODO' },
  { title: 'Update team documentation', description: 'Add new features and API endpoints to team wiki', priority: 'medium', status: 'TODO' },
  { title: 'Schedule client meeting', description: 'Coordinate with client for quarterly review meeting', priority: 'urgent', status: 'TODO' },
  { title: 'Code review pull requests', description: 'Review and approve pending pull requests from team members', priority: 'high', status: 'TODO' },
  { title: 'Update security patches', description: 'Apply latest security updates to all dependencies', priority: 'urgent', status: 'TODO' },
  { title: 'Write technical blog post', description: 'Document learnings from recent project implementation', priority: 'low', status: 'TODO' },
  { title: 'Optimize API performance', description: 'Identify and fix performance bottlenecks in API endpoints', priority: 'high', status: 'TODO' },
  { title: 'Create user onboarding flow', description: 'Design and implement smooth onboarding experience', priority: 'medium', status: 'TODO' },
  { title: 'Setup CI/CD pipeline', description: 'Configure automated testing and deployment pipeline', priority: 'high', status: 'TODO' },
  { title: 'Backup database', description: 'Setup automated daily backup for production database', priority: 'urgent', status: 'TODO' },
  { title: 'Plan sprint retrospective', description: 'Prepare agenda and materials for upcoming retrospective', priority: 'low', status: 'TODO' },
  { title: 'Refactor authentication module', description: 'Improve code quality and add additional security measures', priority: 'medium', status: 'TODO' },
  { title: 'Create mobile responsive design', description: 'Ensure all pages work perfectly on mobile devices', priority: 'high', status: 'TODO' },
  { title: 'Write unit tests', description: 'Increase test coverage to at least 80%', priority: 'medium', status: 'TODO' },
  { title: 'Update API documentation', description: 'Add examples and better descriptions to API docs', priority: 'low', status: 'TODO' },

  // IN_PROGRESS tasks
  { title: 'Implement payment gateway', description: 'Integrate Stripe payment processing into the application', priority: 'urgent', status: 'IN_PROGRESS' },
  { title: 'Build analytics dashboard', description: 'Create comprehensive analytics with charts and metrics', priority: 'high', status: 'IN_PROGRESS' },
  { title: 'Fix login authentication bug', description: 'Resolve issue with token refresh on certain devices', priority: 'urgent', status: 'IN_PROGRESS' },
  { title: 'Design landing page', description: 'Create modern and attractive landing page design', priority: 'medium', status: 'IN_PROGRESS' },
  { title: 'Migrate to new database', description: 'Move data from old database to new optimized structure', priority: 'high', status: 'IN_PROGRESS' },
  { title: 'Add email notifications', description: 'Implement email notifications for important events', priority: 'medium', status: 'IN_PROGRESS' },
  { title: 'Create admin panel', description: 'Build comprehensive admin dashboard for management', priority: 'high', status: 'IN_PROGRESS' },
  { title: 'Implement search functionality', description: 'Add full-text search with filters and sorting', priority: 'medium', status: 'IN_PROGRESS' },
  { title: 'Setup monitoring system', description: 'Configure application monitoring and alerting', priority: 'high', status: 'IN_PROGRESS' },
  { title: 'Optimize images', description: 'Compress and optimize all images for faster loading', priority: 'low', status: 'IN_PROGRESS' },
  { title: 'Build reporting module', description: 'Create system for generating custom reports', priority: 'medium', status: 'IN_PROGRESS' },
  { title: 'Add dark mode', description: 'Implement dark theme with smooth transitions', priority: 'low', status: 'IN_PROGRESS' },
  { title: 'Integrate third-party API', description: 'Connect with external service for data enrichment', priority: 'medium', status: 'IN_PROGRESS' },
  { title: 'Create onboarding tutorial', description: 'Build interactive tutorial for new users', priority: 'low', status: 'IN_PROGRESS' },
  { title: 'Implement caching strategy', description: 'Add Redis caching for improved performance', priority: 'high', status: 'IN_PROGRESS' },
  { title: 'Build notification center', description: 'Create centralized notification management system', priority: 'medium', status: 'IN_PROGRESS' },
  { title: 'Add export functionality', description: 'Allow users to export data in multiple formats', priority: 'medium', status: 'IN_PROGRESS' },
  { title: 'Setup error tracking', description: 'Integrate Sentry for error monitoring', priority: 'high', status: 'IN_PROGRESS' },

  // REVIEW tasks
  { title: 'Review security audit', description: 'Complete security audit and address findings', priority: 'urgent', status: 'REVIEW' },
  { title: 'Test new features', description: 'Comprehensive testing of recently developed features', priority: 'high', status: 'REVIEW' },
  { title: 'Review code architecture', description: 'Evaluate current architecture and suggest improvements', priority: 'medium', status: 'REVIEW' },
  { title: 'Validate user feedback', description: 'Review and categorize user feedback from last release', priority: 'medium', status: 'REVIEW' },
  { title: 'Check accessibility compliance', description: 'Ensure application meets WCAG 2.1 AA standards', priority: 'high', status: 'REVIEW' },
  { title: 'Review API endpoints', description: 'Audit all API endpoints for consistency and security', priority: 'medium', status: 'REVIEW' },
  { title: 'Test mobile responsiveness', description: 'Verify all pages work on various mobile devices', priority: 'high', status: 'REVIEW' },
  { title: 'Review database indexes', description: 'Analyze and optimize database query performance', priority: 'medium', status: 'REVIEW' },
  { title: 'Validate data migration', description: 'Verify all data migrated correctly to new system', priority: 'urgent', status: 'REVIEW' },
  { title: 'Review deployment process', description: 'Document and improve deployment procedures', priority: 'low', status: 'REVIEW' },
  { title: 'Check browser compatibility', description: 'Test application across different browsers', priority: 'medium', status: 'REVIEW' },
  { title: 'Review backup procedures', description: 'Verify backup and recovery processes work correctly', priority: 'high', status: 'REVIEW' },
  { title: 'Validate form inputs', description: 'Test all form validations and error handling', priority: 'medium', status: 'REVIEW' },
  { title: 'Review user permissions', description: 'Audit role-based access control implementation', priority: 'high', status: 'REVIEW' },
  { title: 'Check performance metrics', description: 'Analyze application performance and identify issues', priority: 'medium', status: 'REVIEW' },
  { title: 'Review error messages', description: 'Ensure all error messages are user-friendly', priority: 'low', status: 'REVIEW' },
  { title: 'Validate email templates', description: 'Review and test all email notification templates', priority: 'low', status: 'REVIEW' },
  { title: 'Review documentation', description: 'Update and improve technical documentation', priority: 'medium', status: 'REVIEW' },

  // DONE tasks
  { title: 'Setup project repository', description: 'Initialize Git repository with proper structure', priority: 'high', status: 'DONE' },
  { title: 'Create project roadmap', description: 'Define milestones and timeline for project completion', priority: 'medium', status: 'DONE' },
  { title: 'Design logo and branding', description: 'Create brand identity including logo and color scheme', priority: 'low', status: 'DONE' },
  { title: 'Setup production server', description: 'Configure and deploy production environment', priority: 'urgent', status: 'DONE' },
  { title: 'Implement user authentication', description: 'Build secure login and registration system', priority: 'urgent', status: 'DONE' },
  { title: 'Create database models', description: 'Define and implement all database schemas', priority: 'high', status: 'DONE' },
  { title: 'Build REST API', description: 'Develop RESTful API with all CRUD operations', priority: 'high', status: 'DONE' },
  { title: 'Setup frontend framework', description: 'Initialize React application with routing', priority: 'high', status: 'DONE' },
  { title: 'Implement state management', description: 'Setup Zustand for global state management', priority: 'medium', status: 'DONE' },
  { title: 'Create reusable components', description: 'Build library of common UI components', priority: 'medium', status: 'DONE' },
  { title: 'Add form validations', description: 'Implement client and server-side validations', priority: 'high', status: 'DONE' },
  { title: 'Setup testing framework', description: 'Configure Jest and React Testing Library', priority: 'medium', status: 'DONE' },
  { title: 'Configure ESLint', description: 'Setup code linting and formatting rules', priority: 'low', status: 'DONE' },
  { title: 'Create error handling', description: 'Implement global error handling mechanism', priority: 'high', status: 'DONE' },
  { title: 'Add loading states', description: 'Implement loading indicators for async operations', priority: 'low', status: 'DONE' },
  { title: 'Setup CORS', description: 'Configure cross-origin resource sharing', priority: 'medium', status: 'DONE' },
  { title: 'Implement rate limiting', description: 'Add API rate limiting to prevent abuse', priority: 'high', status: 'DONE' },
  { title: 'Create user profile page', description: 'Build page for users to manage their profile', priority: 'medium', status: 'DONE' },
  { title: 'Add password reset', description: 'Implement forgot password functionality', priority: 'high', status: 'DONE' },
  { title: 'Setup logging', description: 'Configure Winston for application logging', priority: 'medium', status: 'DONE' },
];

// Function to get a random date (only future dates or today)
function getRandomDate(daysOffset) {
  const date = new Date();
  // Always use positive offset (0 to 30 days in the future)
  const randomDays = Math.abs(daysOffset) % 30;
  date.setDate(date.getDate() + randomDays);
  // Add random hours to avoid all tasks having same time
  date.setHours(Math.floor(Math.random() * 24));
  date.setMinutes(Math.floor(Math.random() * 60));
  return date.toISOString();
}

// Function to login and get token
async function login() {
  try {
    console.log('🔐 Logging in...');
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'tej@example.com',
        password: '13$@Tsingh'
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }
    
    const token = data.data.accessToken;
    console.log('✅ Login successful!');
    return token;
  } catch (error) {
    console.error('❌ Login failed. Make sure you have registered an account first.');
    console.error('Error:', error.message);
    throw error;
  }
}

// Function to create a task
async function createTask(token, taskData) {
  try {
    const response = await fetch(`${API_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(taskData)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Task creation failed');
    }
    
    return data;
  } catch (error) {
    console.error('Error creating task:', taskData.title);
    console.error(error.message);
    return null;
  }
}

// Main function to seed tasks
async function seedTasks() {
  try {
    console.log('\n🌱 Starting task seeding process...\n');
    
    // Login to get token
    const token = await login();
    
    console.log('\n📝 Creating tasks...\n');
    
    let createdCount = 0;
    const statusCounts = { TODO: 0, IN_PROGRESS: 0, REVIEW: 0, DONE: 0 };
    
    // Create tasks with random due dates
    for (const template of taskTemplates) {
      const daysOffset = Math.floor(Math.random() * 30) - 10; // Random date within +/- 10 days
      
      const taskData = {
        ...template,
        dueDate: getRandomDate(daysOffset)
      };
      
      const result = await createTask(token, taskData);
      
      if (result) {
        createdCount++;
        statusCounts[template.status]++;
        process.stdout.write(`✓`);
      } else {
        process.stdout.write(`✗`);
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  🎉 Task Seeding Complete!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`\n✅ Created ${createdCount} tasks:\n`);
    console.log(`   📋 TODO: ${statusCounts.TODO} tasks`);
    console.log(`   ⚡ IN_PROGRESS: ${statusCounts.IN_PROGRESS} tasks`);
    console.log(`   🔍 REVIEW: ${statusCounts.REVIEW} tasks`);
    console.log(`   ✅ DONE: ${statusCounts.DONE} tasks`);
    console.log('\n🌐 Refresh your browser to see all the new tasks!\n');
    
  } catch (error) {
    console.error('\n❌ Seeding failed:', error.message);
    process.exit(1);
  }
}

// Run the seeding script
seedTasks();
