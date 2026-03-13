import React, { useState, useEffect } from 'react';
import { Page } from '../types';
import { COURSES } from '../constants';

interface CoursesProps {
  onNavigate: (page: Page) => void;
  onViewCourse?: (id: string) => void;
}

const Courses: React.FC<CoursesProps> = ({ onNavigate, onViewCourse }) => {
  const [coursePdfs, setCoursePdfs] = useState<{[key: string]: string}>({});
  const [loading, setLoading] = useState<{[key: string]: boolean}>({});
  
  // Array of available cover images
  const coverImages = ['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg', '6.jpg', '7.jpg', '8.jpg', '9.jpg'];
  
  // Map each course to a specific cover image
  const getCourseCoverImage = (courseId: string | number, courseIndex: number) => {
    const imageIndex = courseIndex % coverImages.length;
    return coverImages[imageIndex];
  };

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
        const response = await fetch(`${API_BASE_URL}/courses/`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        const pdfMap: {[key: string]: string} = {};
        data.forEach((course: any) => {
          if (course.course_pdf_url) {
            pdfMap[String(course.id)] = course.course_pdf_url;
          }
        });
        
        setCoursePdfs(pdfMap);
      } catch (error) {
        console.error('Error fetching course PDFs:', error);
      }
    };
    
    fetchCourseData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handleDownloadPdf = (courseId: string | number, courseTitle: string) => {
    setLoading(prev => ({ ...prev, [String(courseId)]: true }));
    
    try {
      const course = COURSES.find(c => String(c.id) === String(courseId));
      
      if (course && course.course_pdf_url) {
        const pdfFilename = course.course_pdf_url.split('/').pop();
        
        if (pdfFilename) {
          const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
          const baseUrl = API_BASE_URL.replace('/api', '');
          const pdfUrl = `${baseUrl}/pdfs/course-outlines/${pdfFilename}`;
          window.open(pdfUrl, '_blank');
        } else {
          throw new Error('Invalid PDF filename');
        }
      } else {
        const pdfUrl = coursePdfs[String(courseId)];
        if (pdfUrl) {
          window.open(pdfUrl, '_blank');
        } else {
          throw new Error('No PDF available for this course');
        }
      }
    } catch (error) {
      console.error('Error opening PDF:', error);
      alert('Failed to open PDF. Please make sure the PDF file exists in the pdfs folder.');
    } finally {
      setLoading(prev => ({ ...prev, [String(courseId)]: false }));
    }
  };

  const handleViewCourse = (courseId: string | number) => {
    if (onViewCourse) {
      onViewCourse(String(courseId));
    } else {
      console.warn('onViewCourse function not provided');
    }
  };

  return (
    <div className="pt-24 pb-20 bg-slate-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-16">
          <h2 className="text-blue-500 font-bold uppercase tracking-widest text-sm mb-4">Our Programs</h2>
          <h3 className="text-3xl md:text-5xl font-orbitron font-bold text-white mb-6">Automotive Mastery</h3>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Explore our specialized Occupational Certificates designed to turn you into a industry-ready professional in as little as 9 months.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {COURSES.map((course, index) => {
            const coverImage = getCourseCoverImage(course.id, index);
            
            return (
              <div key={course.id} className="group relative glass rounded-2xl overflow-hidden border border-white/5 transition-all hover:border-blue-500/30 hover:transform hover:-translate-y-1 duration-300">
                <div className="w-full h-40 overflow-hidden">
                  <img 
                    src={`/images/${coverImage}`} 
                    alt={course.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = course.image || `https://picsum.photos/400/600?random=${course.id}`;
                    }}
                  />
                </div>
                <div className="p-8">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                      {course.short_title || course.title}
                    </h4>
                    <span className="bg-blue-600/20 text-blue-400 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest ml-2 whitespace-nowrap">
                      {course.duration}
                    </span>
                  </div>
                  
                  <p className="text-gray-400 text-sm leading-relaxed mb-6">
                    {course.description}
                  </p>
                  
                  {/* FIXED: Only showing registration and assessment fees */}
                  <div className="mb-6 p-4 rounded-lg bg-white/5 border border-white/5">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-400">Registration Fee:</span>
                      <span className="text-white font-bold">{formatCurrency(course.registration_fee)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-white/10">
                      <span className="text-sm text-gray-400">Assessment Fee:</span>
                      <span className="text-white font-bold">{formatCurrency(course.assessment_fee)}</span>
                    </div>
                  </div>
                  
                  {/* PDF Download Button */}
                  <div className="mb-4">
                    <button 
                      onClick={() => handleDownloadPdf(course.id, course.title)}
                      disabled={loading[String(course.id)]}
                      className="w-full py-2 px-4 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading[String(course.id)] ? (
                        <>
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Opening PDF...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span>Download Course Outline (PDF)</span>
                        </>
                      )}
                    </button>
                  </div>
                  
                  <div className="flex space-x-4">
                    <button 
                      onClick={() => handleViewCourse(course.id)}
                      className="flex-1 py-3 glass text-white font-bold rounded-lg transition-all flex items-center justify-center space-x-2 border border-white/10 hover:bg-white/5 hover:border-blue-500/30"
                    >
                      <span>View Details</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => onNavigate(Page.Apply)}
                      className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold rounded-lg transition-all flex items-center justify-center space-x-2"
                    >
                      <span>Apply Now</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Requirements Box */}
        <div className="mt-20 glass p-10 rounded-3xl border border-blue-500/20">
          <h4 className="text-2xl font-orbitron font-bold text-white mb-4">Admission Details</h4>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">Please note that all applications require a non-refundable R661.25 registration fee. Proof of payment must be uploaded during the application process.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mt-8">
            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
              <span className="block text-2xl mb-2">📄</span>
              <p className="text-sm font-medium text-gray-300">Certified ID Copy</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
              <span className="block text-2xl mb-2">🎓</span>
              <p className="text-sm font-medium text-gray-300">Matric/School Cert</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
              <span className="block text-2xl mb-2">💰</span>
              <p className="text-sm font-medium text-gray-300">R661.25 Admin Fee</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
              <span className="block text-2xl mb-2">🔢</span>
              <p className="text-sm font-medium text-gray-300">Maths (Required for some)</p>
            </div>
          </div>
        </div>

        {/* Banking Details */}
        <div className="mt-12 glass p-8 rounded-3xl border border-green-500/20">
          <h4 className="text-2xl font-orbitron font-bold text-white mb-6">Banking Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h5 className="text-lg font-bold text-white mb-4">Payment Details</h5>
              <div className="space-y-3 text-gray-400">
                <div className="flex justify-between">
                  <span>Account Holder:</span>
                  <span className="text-white font-medium">Tucoprox (PTY) Ltd t/a Bathudi Automotive Technical Training Centre</span>
                </div>
                <div className="flex justify-between">
                  <span>Bank:</span>
                  <span className="text-white font-medium">First National Bank</span>
                </div>
                <div className="flex justify-between">
                  <span>Account Number:</span>
                  <span className="text-white font-mono font-bold">63097751622</span>
                </div>
                <div className="flex justify-between">
                  <span>Branch Code:</span>
                  <span className="text-white font-mono font-bold">250655</span>
                </div>
              </div>
            </div>
            <div>
              <h5 className="text-lg font-bold text-white mb-4">Important Notes</h5>
              <ul className="text-sm text-gray-400 space-y-2">
                <li className="flex items-start">
                  <span className="text-amber-400 mr-2">•</span>
                  <span>No cash payments accepted</span>
                </li>
                <li className="flex items-start">
                  <span className="text-amber-400 mr-2">•</span>
                  <span>10% discount for upfront payment</span>
                </li>
                <li className="flex items-start">
                  <span className="text-amber-400 mr-2">•</span>
                  <span>Monthly payments due on 1st of each month</span>
                </li>
                <li className="flex items-start">
                  <span className="text-amber-400 mr-2">•</span>
                  <span>R500 late payment fee after 7th of month</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Courses;