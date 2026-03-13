import React, { useState, useEffect } from 'react';
import { Page } from '../types';

interface CourseDetailProps {
  courseId: string;
  onNavigate: (page: Page) => void;
}

interface Course {
  id: number | string;
  title: string;
  short_title: string;
  description: string;
  short_description: string;
  duration: string;
  credits: number;
  deposit_amount: number;
  monthly_payment: number;
  total_payment: number;
  assessment_fee: number;
  fee: number;
  registration_fee: number;
  level: string;
  curriculum: string;
  prerequisites: string;
  requirements: string;
  career_opportunities: string;
  course_pdf: string;
  image: string;
  image_url: string;
  is_math_required: boolean;
  is_featured: boolean;
}

const CourseDetail: React.FC<CourseDetailProps> = ({ courseId, onNavigate }) => {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
        const response = await fetch(`${API_BASE_URL}/courses/${courseId}/`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setCourse(data);
        
      } catch (err) {
        console.error('Error fetching course details:', err);
        
        try {
          const { COURSES } = await import('../constants');
          const localCourse = COURSES.find(c => String(c.id) === String(courseId));
          
          if (localCourse) {
            const fallbackCourse: Course = {
              id: localCourse.id,
              title: localCourse.title,
              short_title: localCourse.short_title || localCourse.title,
              description: localCourse.description,
              short_description: localCourse.short_description || localCourse.description.substring(0, 150) + '...',
              duration: localCourse.duration,
              credits: localCourse.credits || 0,
              deposit_amount: localCourse.deposit_amount,
              monthly_payment: localCourse.monthly_payment,
              total_payment: localCourse.total_payment,
              assessment_fee: localCourse.assessment_fee || 0,
              fee: localCourse.fee || 0,
              registration_fee: localCourse.registration_fee || 661.25,
              level: localCourse.level || 'beginner',
              curriculum: localCourse.curriculum || 'Comprehensive curriculum covering all essential aspects of automotive technology including engine systems, electrical systems, braking systems, suspension, diagnostics, and repair techniques.',
              prerequisites: localCourse.prerequisites || 'No specific prerequisites required. Suitable for beginners with interest in automotive technology.',
              requirements: localCourse.requirements || 'Basic understanding of automotive concepts. Willingness to learn and hands-on practice.',
              career_opportunities: localCourse.career_opportunities || 'Automotive Technician, Mechanic, Service Advisor, Workshop Manager, Diagnostic Specialist, Automotive Electrician',
              course_pdf: localCourse.course_pdf_url || '',
              image: localCourse.image,
              image_url: localCourse.image_url || '',
              is_math_required: localCourse.is_math_required || false,
              is_featured: localCourse.is_featured || false,
            };
            setCourse(fallbackCourse);
          } else {
            setError('Course not found in local data');
          }
        } catch (fallbackError) {
          setError('Failed to load course details. Please check your connection.');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourseDetails();
  }, [courseId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handleDownloadPdf = () => {
    if (!course) {
      alert('Course information not available');
      return;
    }
    
    const pdfPath = course.course_pdf;
    
    if (!pdfPath) {
      alert('No PDF available for this course');
      return;
    }
    
    const pdfFilename = pdfPath.split('/').pop();
    
    if (!pdfFilename) {
      alert('Invalid PDF filename');
      return;
    }
    
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
    const baseUrl = API_BASE_URL.replace('/api', '');
    const pdfUrl = `${baseUrl}/pdfs/course-outlines/${pdfFilename}`;
    window.open(pdfUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="pt-24 pb-20 bg-slate-950 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-400 mt-4">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="pt-24 pb-20 bg-slate-950 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="glass p-8 rounded-3xl text-center">
            <h2 className="text-2xl font-bold text-red-400 mb-4">Error</h2>
            <p className="text-gray-400 mb-6">{error || 'Course not found'}</p>
            <button
              onClick={() => onNavigate(Page.Courses)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Back to Courses
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 bg-slate-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Back Button */}
        <button
          onClick={() => onNavigate(Page.Courses)}
          className="flex items-center text-gray-400 hover:text-white mb-8 transition-colors group"
        >
          <svg className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to All Courses
        </button>

        {/* Course Header */}
        <div className="glass rounded-3xl overflow-hidden mb-8">
          <div className="md:flex">
            <div className="md:w-2/3 p-8">
              <div className="flex items-center mb-4">
                <span className="bg-blue-600/20 text-blue-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest mr-4">
                  {course.level}
                </span>
                <span className="bg-emerald-600/20 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                  {course.duration}
                </span>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-orbitron font-bold text-white mb-4">
                {course.title}
              </h1>
              
              <p className="text-gray-300 text-lg mb-6">
                {course.short_description}
              </p>
              
              <div className="flex flex-wrap gap-4 mb-6">
                {course.is_featured && (
                  <span className="inline-flex items-center bg-amber-600/20 text-amber-400 text-sm px-3 py-1 rounded-full">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    Featured
                  </span>
                )}
                <span className="inline-flex items-center bg-purple-600/20 text-purple-400 text-sm px-3 py-1 rounded-full">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  {course.credits} Credits
                </span>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => onNavigate(Page.Apply)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold rounded-lg transition-all flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  <span>Apply Now</span>
                </button>
                
                {course.course_pdf && (
                  <button
                    onClick={handleDownloadPdf}
                    className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-lg transition-all flex items-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Download Outline</span>
                  </button>
                )}
              </div>
            </div>
            
            {/* FIXED: Only showing registration fee and assessment fee */}
            <div className="md:w-1/3 p-8 bg-white/5 flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">{formatCurrency(course.registration_fee)}</div>
                <div className="text-gray-400 mb-4">Registration Fee</div>
                <div className="space-y-2">
                  <div className="flex justify-between border-t border-white/10 pt-2">
                    <span className="text-gray-400">Assessment Fee:</span>
                    <span className="text-white font-bold">{formatCurrency(course.assessment_fee)}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-4">Non-refundable registration fee</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="glass rounded-3xl overflow-hidden mb-8">
          <div className="border-b border-white/10">
            <nav className="flex overflow-x-auto">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-4 font-medium whitespace-nowrap ${activeTab === 'overview' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('curriculum')}
                className={`px-6 py-4 font-medium whitespace-nowrap ${activeTab === 'curriculum' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
              >
                Curriculum
              </button>
              <button
                onClick={() => setActiveTab('requirements')}
                className={`px-6 py-4 font-medium whitespace-nowrap ${activeTab === 'requirements' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
              >
                Requirements
              </button>
              <button
                onClick={() => setActiveTab('careers')}
                className={`px-6 py-4 font-medium whitespace-nowrap ${activeTab === 'careers' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
              >
                Careers
              </button>
              <button
                onClick={() => setActiveTab('fees')}
                className={`px-6 py-4 font-medium whitespace-nowrap ${activeTab === 'fees' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
              >
                Fees & Payment
              </button>
            </nav>
          </div>
          
          <div className="p-8">
            {activeTab === 'overview' && (
              <div>
                <h3 className="text-2xl font-bold text-white mb-6">Course Overview</h3>
                <div className="prose prose-invert max-w-none">
                  <p className="text-gray-300 text-lg leading-relaxed mb-6">
                    {course.description}
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                    <div className="p-6 rounded-xl bg-white/5">
                      <h4 className="text-lg font-bold text-white mb-3">What You'll Learn</h4>
                      <ul className="space-y-2 text-gray-300">
                        <li className="flex items-start">
                          <svg className="w-5 h-5 text-green-400 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Comprehensive automotive diagnostics</span>
                        </li>
                        <li className="flex items-start">
                          <svg className="w-5 h-5 text-green-400 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Hands-on repair techniques</span>
                        </li>
                        <li className="flex items-start">
                          <svg className="w-5 h-5 text-green-400 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Industry-standard tools and equipment</span>
                        </li>
                        <li className="flex items-start">
                          <svg className="w-5 h-5 text-green-400 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Safety protocols and best practices</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="p-6 rounded-xl bg-white/5">
                      <h4 className="text-lg font-bold text-white mb-3">Course Features</h4>
                      <ul className="space-y-2 text-gray-300">
                        <li className="flex items-start">
                          <svg className="w-5 h-5 text-blue-400 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Flexible payment options</span>
                        </li>
                        <li className="flex items-start">
                          <svg className="w-5 h-5 text-blue-400 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          <span>Workshop-based learning</span>
                        </li>
                        <li className="flex items-start">
                          <svg className="w-5 h-5 text-blue-400 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                          <span>Certified instructors</span>
                        </li>
                        <li className="flex items-start">
                          <svg className="w-5 h-5 text-blue-400 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span>Industry-recognized certification</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'curriculum' && (
              <div>
                <h3 className="text-2xl font-bold text-white mb-6">Course Curriculum</h3>
                <div className="prose prose-invert max-w-none">
                  <div className="text-gray-300 whitespace-pre-line leading-relaxed">
                    {course.curriculum.split('\n').map((line, index) => (
                      <p key={index} className="mb-4">{line}</p>
                    ))}
                  </div>
                  
                  <div className="mt-8 p-6 rounded-xl bg-blue-600/10 border border-blue-500/20">
                    <h4 className="text-lg font-bold text-white mb-3">Learning Outcomes</h4>
                    <ul className="space-y-3 text-gray-300">
                      <li className="flex items-start">
                        <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">1</div>
                        <span>Develop comprehensive understanding of automotive systems and components</span>
                      </li>
                      <li className="flex items-start">
                        <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">2</div>
                        <span>Master diagnostic techniques using modern automotive tools</span>
                      </li>
                      <li className="flex items-start">
                        <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">3</div>
                        <span>Gain hands-on experience with repair and maintenance procedures</span>
                      </li>
                      <li className="flex items-start">
                        <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">4</div>
                        <span>Understand safety protocols and industry best practices</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'requirements' && (
              <div>
                <h3 className="text-2xl font-bold text-white mb-6">Admission Requirements</h3>
                <div className="prose prose-invert max-w-none">
                  <div className="text-gray-300 whitespace-pre-line leading-relaxed mb-8">
                    {course.requirements}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 rounded-xl bg-white/5">
                      <h4 className="text-lg font-bold text-white mb-4">Prerequisites</h4>
                      <div className="text-gray-300 whitespace-pre-line leading-relaxed">
                        {course.prerequisites}
                      </div>
                      
                      {course.is_math_required && (
                        <div className="mt-4 p-4 rounded-lg bg-amber-600/10 border border-amber-500/20">
                          <div className="flex items-center">
                            <svg className="w-5 h-5 text-amber-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-amber-300 font-medium">Mathematics Required</span>
                          </div>
                          <p className="text-amber-200/80 text-sm mt-2">Basic mathematics knowledge is required for this course</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-6 rounded-xl bg-white/5">
                      <h4 className="text-lg font-bold text-white mb-4">Documentation Needed</h4>
                      <ul className="space-y-3 text-gray-300">
                        <li className="flex items-center">
                          <svg className="w-5 h-5 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Certified ID Copy
                        </li>
                        <li className="flex items-center">
                          <svg className="w-5 h-5 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Matric/School Certificate
                        </li>
                        <li className="flex items-center">
                          <svg className="w-5 h-5 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Proof of Registration Fee Payment (R661.25)
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'careers' && (
              <div>
                <h3 className="text-2xl font-bold text-white mb-6">Career Opportunities</h3>
                <div className="prose prose-invert max-w-none">
                  <div className="text-gray-300 whitespace-pre-line leading-relaxed mb-8">
                    {course.career_opportunities}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {['Automotive Technician', 'Diagnostic Specialist', 'Workshop Manager'].map((job, index) => (
                      <div key={index} className="p-6 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                        <div className="text-3xl mb-4">{['🔧', '🔍', '👔'][index]}</div>
                        <h4 className="text-lg font-bold text-white mb-2">{job}</h4>
                        <p className="text-gray-400 text-sm">
                          Start your career as a professional {job.toLowerCase()} with skills gained from this course
                        </p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-8 p-6 rounded-xl bg-emerald-600/10 border border-emerald-500/20">
                    <h4 className="text-lg font-bold text-white mb-3">Industry Demand</h4>
                    <p className="text-gray-300 mb-4">
                      The automotive industry in South Africa has a growing demand for skilled technicians. 
                      Graduates from our programs typically find employment within 3-6 months of completion.
                    </p>
                    <div className="flex items-center text-emerald-400">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                      <span className="font-medium">High employment rate for certified graduates</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'fees' && (
              <div>
                <h3 className="text-2xl font-bold text-white mb-6">Fees & Payment Information</h3>
                <div className="prose prose-invert max-w-none">
                  <div className="overflow-hidden rounded-xl border border-white/10">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-white/5">
                          <th className="py-4 px-6 text-left text-white font-bold">Fee Item</th>
                          <th className="py-4 px-6 text-left text-white font-bold">Amount (ZAR)</th>
                          <th className="py-4 px-6 text-left text-white font-bold">Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-white/5">
                          <td className="py-4 px-6 text-gray-300">Registration Fee</td>
                          <td className="py-4 px-6 text-white font-bold">{formatCurrency(course.registration_fee)}</td>
                          <td className="py-4 px-6 text-gray-400">Non-refundable, due with application</td>
                        </tr>
                        <tr className="border-b border-white/5">
                          <td className="py-4 px-6 text-gray-300">Assessment Fee</td>
                          <td className="py-4 px-6 text-white font-bold">{formatCurrency(course.assessment_fee)}</td>
                          <td className="py-4 px-6 text-gray-400">Final assessment and certification</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 rounded-xl bg-blue-600/10 border border-blue-500/20">
                      <h4 className="text-lg font-bold text-white mb-3">Payment Options</h4>
                      <ul className="space-y-3 text-gray-300">
                        <li className="flex items-center">
                          <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                          <span>Full upfront payment (10% discount available)</span>
                        </li>
                        <li className="flex items-center">
                          <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                          <span>Bank transfer or electronic payment</span>
                        </li>
                        <li className="flex items-center">
                          <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                          <span>No cash payments accepted</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="p-6 rounded-xl bg-emerald-600/10 border border-emerald-500/20">
                      <h4 className="text-lg font-bold text-white mb-3">Important Notes</h4>
                      <ul className="space-y-3 text-gray-300">
                        <li className="flex items-start">
                          <svg className="w-5 h-5 text-emerald-400 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>All fees are in South African Rand (ZAR)</span>
                        </li>
                        <li className="flex items-start">
                          <svg className="w-5 h-5 text-emerald-400 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Registration fee is non-refundable</span>
                        </li>
                        <li className="flex items-start">
                          <svg className="w-5 h-5 text-emerald-400 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Course materials and tools are included</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="mt-8 p-6 rounded-xl bg-amber-600/10 border border-amber-500/20">
                    <div className="flex items-start">
                      <svg className="w-6 h-6 text-amber-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.23 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <div>
                        <h4 className="text-lg font-bold text-white mb-2">Banking Information</h4>
                        <div className="space-y-2 text-gray-300">
                          <div className="flex">
                            <span className="w-32 text-gray-400">Bank:</span>
                            <span className="text-white">First National Bank</span>
                          </div>
                          <div className="flex">
                            <span className="w-32 text-gray-400">Account Holder:</span>
                            <span className="text-white">Tucoprox (PTY) Ltd t/a Bathudi Automotive Technical Training Centre</span>
                          </div>
                          <div className="flex">
                            <span className="w-32 text-gray-400">Account Number:</span>
                            <span className="text-white font-mono">63097751622</span>
                          </div>
                          <div className="flex">
                            <span className="w-32 text-gray-400">Branch Code:</span>
                            <span className="text-white font-mono">250655</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Call to Action */}
        <div className="glass p-8 rounded-3xl text-center border border-blue-500/20">
          <h3 className="text-2xl font-bold text-white mb-4">Ready to Start Your Journey?</h3>
          <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
            Join hundreds of students who have transformed their careers with our industry-focused training programs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => onNavigate(Page.Apply)}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold rounded-lg transition-all flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              <span>Apply for This Course</span>
            </button>
            <button
              onClick={() => onNavigate(Page.Courses)}
              className="px-8 py-3 glass text-white font-bold rounded-lg transition-all flex items-center justify-center space-x-2 border border-white/10 hover:bg-white/5"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <span>Browse All Courses</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;