# Task Management System - Frontend

Modern, responsive React application built with Vite, TailwindCSS, and Zustand for state management.

## 🎨 Features

- **Modern UI/UX**: Beautiful, responsive design inspired by leading task management tools
- **Authentication**: Secure login/register with JWT token management
- **Task Management**: Create, edit, delete, and track tasks with ease
- **Real-time Updates**: Automatic token refresh and session management
- **Role-based Access**: Different views for admin, manager, and regular users
- **Advanced Filtering**: Search, filter by status/priority, and sort tasks
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

## 🚀 Tech Stack

- **React 18.2**: Modern React with hooks
- **Vite 5.0**: Lightning-fast build tool
- **TailwindCSS 3.4**: Utility-first CSS framework
- **Zustand 4.4**: Lightweight state management
- **React Router 6**: Client-side routing
- **Axios**: HTTP client with interceptors
- **React Hot Toast**: Beautiful notifications
- **date-fns**: Modern date utility library
- **React Icons**: Popular icon library

## 📦 Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file in the frontend directory:
```env
VITE_API_URL=http://localhost:8000/api/v1
```

## 🏃‍♂️ Running the Application

### Development Mode
```bash
npm run dev
```
Application will be available at `http://localhost:3000`

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 📁 Project Structure

```
frontend/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable components
│   │   ├── Layout.jsx           # Main layout with sidebar
│   │   ├── ProtectedRoute.jsx   # Route protection wrapper
│   │   └── tasks/
│   │       ├── TaskCard.jsx     # Task display card
│   │       └── TaskModal.jsx    # Task create/edit modal
│   ├── pages/           # Page components
│   │   ├── auth/
│   │   │   ├── Login.jsx        # Login page
│   │   │   └── Register.jsx     # Registration page
│   │   ├── Dashboard.jsx        # Dashboard with statistics
│   │   └── TaskList.jsx         # Task list with filters
│   ├── services/        # API services
│   │   └── api.js               # Axios configuration & API calls
│   ├── store/           # Zustand stores
│   │   ├── authStore.js         # Authentication state
│   │   └── taskStore.js         # Task management state
│   ├── App.jsx          # Main app component
│   ├── main.jsx         # Application entry point
│   └── index.css        # Global styles
├── .eslintrc.cjs        # ESLint configuration
├── tailwind.config.js   # Tailwind configuration
├── vite.config.js       # Vite configuration
└── package.json         # Dependencies
```

## 🎯 Key Features Explained

### Authentication Flow
- JWT-based authentication with access and refresh tokens
- Automatic token refresh on 401 errors
- Secure token storage in localStorage
- Protected routes for authenticated users

### State Management
- **authStore**: Manages user authentication state, login, logout, token refresh
- **taskStore**: Handles task CRUD operations, filtering, pagination, and statistics

### API Integration
- Centralized API service with axios
- Request interceptor adds authentication headers
- Response interceptor handles token refresh automatically
- Error handling and toast notifications

### UI Components
- **Layout**: Responsive sidebar navigation with mobile menu
- **TaskCard**: Beautiful card component with status badges and quick actions
- **TaskModal**: Full-featured form for creating and editing tasks
- **Dashboard**: Statistics overview with visual cards and quick actions

## 🎨 Design System

### Colors
- **Primary**: Blue gradient (600-700)
- **Accent**: Purple gradient (500-600)
- **Success**: Green (500)
- **Warning**: Yellow/Orange (500)
- **Error**: Red (500-600)

### Custom Classes
- `.card`: White background with shadow and rounded corners
- `.btn-primary`: Primary action button with gradient
- `.btn-secondary`: Secondary button with gray styling
- `.badge`: Small status/priority indicator
- `.input-field`: Styled form input

### Animations
- `animate-fade-in`: Fade in effect
- `animate-slide-in`: Slide up and fade in
- Smooth transitions on hover states

## 🔧 Configuration

### Vite Proxy
Development server proxies API requests to backend:
```javascript
proxy: {
  '/api': {
    target: 'http://localhost:8000',
    changeOrigin: true,
  },
}
```

### TailwindCSS
Custom theme colors and utilities configured in `tailwind.config.js`:
- Extended color palette
- Custom animations
- Responsive breakpoints

## 📱 Responsive Design

- **Mobile First**: Designed for mobile, enhanced for larger screens
- **Breakpoints**:
  - `sm`: 640px
  - `md`: 768px
  - `lg`: 1024px
  - `xl`: 1280px
  - `2xl`: 1536px

## 🔐 Environment Variables

Create a `.env` file:
```env
# API Configuration
VITE_API_URL=http://localhost:8000/api/v1

# Optional: Enable debug mode
VITE_DEBUG=false
```

## 🧪 Testing

To run the application:
1. Start the backend server (see backend README)
2. Start the frontend dev server: `npm run dev`
3. Navigate to `http://localhost:3000`

### Test Credentials
Use the registration page to create an account or use existing backend credentials.

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🎯 Future Enhancements

- [ ] Real-time notifications with WebSockets
- [ ] Task comments and attachments
- [ ] Drag-and-drop task reordering
- [ ] Calendar view for tasks
- [ ] Dark mode support
- [ ] Export tasks to CSV/PDF
- [ ] Advanced analytics and reports
- [ ] Team collaboration features

## 🐛 Troubleshooting

### Port Already in Use
If port 3000 is already in use, Vite will automatically suggest an alternative port.

### API Connection Issues
1. Ensure backend is running on port 8000
2. Check VITE_API_URL in .env file
3. Verify CORS is enabled in backend

### Build Errors
1. Clear node_modules: `rm -rf node_modules`
2. Clear cache: `rm -rf .vite`
3. Reinstall dependencies: `npm install`

## 📄 License

This project is part of the Task Management System - Built for Accenture Standards.

## 👥 Support

For issues or questions, please refer to the main project README.

---

**Note**: This frontend application requires the backend API to be running. See the backend README for setup instructions.
