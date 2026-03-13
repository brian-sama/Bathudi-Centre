import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import Preloader from './components/Preloader';
import AdminSidebar from './components/AdminSidebar';
// import StudentSidebar from './components/StudentSidebar'; // COMMENTED OUT
import Home from './pages/Home';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import About from './pages/About';
import Gallery from './pages/Gallery';
import Team from './pages/Team';
import Apply from './pages/Apply';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminStudents from './pages/admin/AdminStudents';
import AdminApplications from './pages/admin/AdminApplications';
import AdminCMS from './pages/admin/AdminCMS';
import AdminLogin from './pages/admin/AdminLogin';
import PaymentSuccess from './pages/PaymentSuccess';  
import PaymentCancel from './pages/PaymentCancel';
// STUDENT PORTAL - COMMENTED OUT
// import StudentLogin from './pages/StudentLogin';
// import StudentDashboard from './pages/StudentDashboard';
// import StudentProfile from './pages/StudentProfile';
// import StudentCourses from './pages/StudentCourses';
// import StudentAnnouncements from './pages/StudentAnnouncements';
// import StudentDocuments from './pages/StudentDocuments';
// import StudentFees from './pages/StudentFees';
import NewsDetail from './pages/NewsDetail';
import StudentContent from './pages/admin/StudentContent';
import StudentNotifications from './pages/admin/StudentNotifications';
import BroadcastMessages from './pages/admin/BroadcastMessages';
import { Page, ViewMode, Student } from './types';


const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('public');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogin, setShowLogin] = useState<'admin' | 'student' | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>(Page.Home);
  const [currentUser, setCurrentUser] = useState<Student | null>(null);
  const [newsId, setNewsId] = useState<string | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Check for existing session on load
  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    // const studentData = localStorage.getItem('studentData'); // COMMENTED OUT
    
    if (adminToken) {
      setIsAuthenticated(true);
      setViewMode('admin');
      setCurrentPage(Page.AdminDashboard);
    } 
    // STUDENT PORTAL - COMMENTED OUT
    /*
    else if (studentData) {
      try {
        const student = JSON.parse(studentData);
        setCurrentUser(student);
        setIsAuthenticated(true);
        setViewMode('student');
        setCurrentPage(Page.StudentDashboard);
      } catch (error) {
        localStorage.removeItem('studentData');
      }
    }
    */
  }, []);

  // Public pages routing - FIXED: Added PaymentSuccess and PaymentCancel
  const renderPublicPage = () => {
    switch (currentPage) {
      case Page.Home:
        return <Home 
          onNavigate={setCurrentPage} 
          onViewNews={(id) => {
            setNewsId(id);
            setCurrentPage(Page.NewsDetail);
          }} 
        />;
      case Page.Courses:
        return <Courses 
          onNavigate={setCurrentPage} 
          onViewCourse={(courseId) => {
            setSelectedCourseId(courseId);
            setCurrentPage(Page.CourseDetail);
          }}
        />;
      case Page.CourseDetail:
        return selectedCourseId ? (
          <CourseDetail 
            courseId={selectedCourseId} 
            onNavigate={setCurrentPage} 
          />
        ) : (
          <Courses 
            onNavigate={setCurrentPage} 
            onViewCourse={(courseId) => {
              setSelectedCourseId(courseId);
              setCurrentPage(Page.CourseDetail);
            }}
          />
        );
      case Page.About:
        return <About />;
      case Page.Gallery:
        return <Gallery />;
      case Page.Team:
        return <Team />;
      case Page.Apply:
        return <Apply onNavigate={setCurrentPage} />;
      case Page.NewsDetail:
        return <NewsDetail 
          newsId={newsId} 
          onBack={() => {
            setCurrentPage(Page.Home);
            setNewsId(null);
          }} 
        />;
      case Page.PaymentSuccess:
        return <PaymentSuccess onNavigate={setCurrentPage} />;
      case Page.PaymentCancel:
        return <PaymentCancel onNavigate={setCurrentPage} />;
      // STUDENT PORTAL PAGES - COMMENTED OUT
      /*
      case Page.StudentDashboard:
      case Page.StudentProfile:
      case Page.StudentCourses:
      case Page.StudentAnnouncements:
      case Page.StudentDocuments:
      case Page.StudentFees:
        return <div className="text-center py-20 text-white">Student portal is currently under maintenance</div>;
      */
      default:
        return <Home 
          onNavigate={setCurrentPage} 
          onViewNews={(id) => {
            setNewsId(id);
            setCurrentPage(Page.NewsDetail);
          }} 
        />;
    }
  };

  // Admin pages routing
  const renderAdminPage = () => {
    switch (currentPage) {
      case Page.AdminDashboard:
        return <AdminDashboard />;
      case Page.AdminStudents:
        return <AdminStudents />;
      case Page.AdminApplications:
        return <AdminApplications />;
      case Page.AdminCMS:
        return <AdminCMS />;
      case Page.StudentContent:
        return <StudentContent onNavigate={setCurrentPage} />;
      case Page.StudentNotifications:
        return <StudentNotifications onNavigate={setCurrentPage} />;
      case Page.BroadcastMessages:
        return <BroadcastMessages onNavigate={setCurrentPage} />;
      default:
        return <AdminDashboard />;
    }
  };

  // STUDENT PORTAL - COMMENTED OUT ENTIRELY
  /*
  const renderStudentPage = () => {
    switch (currentPage) {
      case Page.StudentDashboard:
        return currentUser ? (
          <StudentDashboard 
            student={currentUser} 
            onNavigate={setCurrentPage}
            sidebarCollapsed={sidebarCollapsed}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-gray-400">No student data available</p>
              <button 
                onClick={handleLogout}
                className="mt-4 px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700"
              >
                Return to Login
              </button>
            </div>
          </div>
        );
      case Page.StudentProfile:
        return currentUser ? (
          <StudentProfile student={currentUser} onUpdate={setCurrentUser} />
        ) : (
          <div>No student data</div>
        );
      case Page.StudentCourses:
        return currentUser ? (
          <StudentCourses student={currentUser} />
        ) : (
          <div>No student data</div>
        );
      case Page.StudentAnnouncements:
        return <StudentAnnouncements student={currentUser} onNavigate={setCurrentPage} />;
      case Page.StudentDocuments:
        return currentUser ? (
          <StudentDocuments student={currentUser} />
        ) : (
          <div>No student data</div>
        );
      case Page.StudentFees:
        return currentUser ? (
          <StudentFees student={currentUser} />
        ) : (
          <div>No student data</div>
        );
      default:
        return currentUser ? (
          <StudentDashboard 
            student={currentUser} 
            onNavigate={setCurrentPage}
            sidebarCollapsed={sidebarCollapsed}
          />
        ) : (
          <div>No student data</div>
        );
    }
  };
  */

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage, viewMode]);

  // Handle admin login
  const handleAdminLogin = (success: boolean) => {
    if (success) {
      setIsAuthenticated(true);
      setViewMode('admin');
      setCurrentPage(Page.AdminDashboard);
      setShowLogin(null);
      localStorage.setItem('adminToken', 'admin-logged-in');
    }
  };

  // STUDENT LOGIN - COMMENTED OUT
  /*
  const handleStudentLogin = (studentData: Student) => {
    setIsAuthenticated(true);
    setCurrentUser(studentData);
    setViewMode('student');
    setCurrentPage(Page.StudentDashboard);
    setShowLogin(null);
    localStorage.setItem('studentData', JSON.stringify(studentData));
  };
  */

  // Handle logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setViewMode('public');
    setCurrentPage(Page.Home);
    setNewsId(null);
    setSelectedCourseId(null);
    
    localStorage.removeItem('adminToken');
    // localStorage.removeItem('studentData'); // COMMENTED OUT
  };

  // Toggle sidebar collapse - COMMENTED OUT (student only)
  /*
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };
  */

  // Show login screen if needed
  if (showLogin === 'admin') {
    return <AdminLogin onLogin={handleAdminLogin} onCancel={() => setShowLogin(null)} />;
  }

  // STUDENT LOGIN - COMMENTED OUT
  /*
  if (showLogin === 'student') {
    return <StudentLogin onLogin={handleStudentLogin} onCancel={() => setShowLogin(null)} />;
  }
  */

  // Admin view with sidebar
  if (viewMode === 'admin' && isAuthenticated) {
    return (
      <div className="min-h-screen flex bg-slate-950 text-white font-inter">
        <AdminSidebar 
          currentPage={currentPage} 
          onNavigate={setCurrentPage} 
          onLogout={handleLogout} 
        />
        <main className="flex-grow overflow-y-auto p-4 md:p-6 lg:p-8 animate-fadeIn">
          {renderAdminPage()}
        </main>
      </div>
    );
  }

  // STUDENT VIEW - COMMENTED OUT ENTIRELY
  /*
  if (viewMode === 'student' && isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-white font-inter flex">
        <StudentSidebar 
          currentPage={currentPage} 
          onNavigate={setCurrentPage} 
          onLogout={handleLogout}
          student={currentUser}
          onToggleCollapse={toggleSidebar}
          collapsed={sidebarCollapsed}
        />
        <div className={`flex-grow transition-all duration-300 ${
          sidebarCollapsed ? 'ml-16' : 'ml-16 lg:ml-64'
        }`}>
          <div className="p-4 md:p-5 lg:p-6 animate-fadeIn">
            {renderStudentPage()}
          </div>
        </div>
      </div>
    );
  }
  */

  // Public view
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-white font-inter selection:bg-red-500 selection:text-white">
      <Preloader />
      <Navbar 
        currentPage={currentPage} 
        onNavigate={setCurrentPage}
        // onStudentPortal={() => setShowLogin('student')} // COMMENTED OUT - Optional
      />
      
      <main className="flex-grow">
        {renderPublicPage()}
      </main>

      <Footer onNavigate={setCurrentPage} />
      <WhatsAppButton />

      {/* Admin Entry Secret Button */}
      <button 
        onClick={() => setShowLogin('admin')}
        className="fixed bottom-4 left-4 opacity-10 hover:opacity-100 text-[10px] text-gray-500 z-[100] transition-opacity cursor-default hover:cursor-pointer p-2 bg-black/20 rounded-lg backdrop-blur-sm"
        title="Admin Access"
      >
        ADMIN HUB
      </button>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
        }
        .glass-dark {
          backdrop-filter: blur(16px) saturate(180%);
          -webkit-backdrop-filter: blur(16px) saturate(180%);
          background-color: rgba(17, 25, 40, 0.85);
          border-bottom: 1px solid rgba(255, 255, 255, 0.125);
        }
        .glass {
          backdrop-filter: blur(16px) saturate(180%);
          -webkit-backdrop-filter: blur(16px) saturate(180%);
          background-color: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.125);
        }
        .font-orbitron {
          font-family: 'Orbitron', sans-serif;
        }
        .font-inter {
          font-family: 'Inter', sans-serif;
        }
        .overflow-y-auto::-webkit-scrollbar {
          width: 6px;
        }
        .overflow-y-auto::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 3px;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        aside {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        @media (max-width: 768px) {
          main.p-4 {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default App;