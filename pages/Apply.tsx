import React, { useState, useEffect } from 'react';
import { Page } from '../types';  // types is in root
import { generatePayFastSignature, PAYFAST_URLS, generatePaymentId, PayFastData } from '../src/utils/payfast';

interface ApplyProps {
  onNavigate: (page: Page) => void;
}

const ApplicationForm: React.FC<ApplyProps> = ({ onNavigate }) => {
  const [loading, setLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [availableCourses, setAvailableCourses] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    age: '',
    country: 'South Africa',
    mobile: '',
    email: '',
    id_number: '',
    address: '',
    education_level: '',
    previous_school: '',
    course: '', // This will store the course ID as string
  });
  
  const [files, setFiles] = useState({
    id_document: null as File | null,
    matric_certificate: null as File | null,
    proof_of_payment: null as File | null,
    additional_doc_1: null as File | null,
    additional_doc_2: null as File | null,
  });

  // PayFast configuration from environment variables
  const PAYFAST_MERCHANT_ID = import.meta.env.VITE_PAYFAST_MERCHANT_ID || '';
  const PAYFAST_MERCHANT_KEY = import.meta.env.VITE_PAYFAST_MERCHANT_KEY || '';
  const PAYFAST_PASSPHRASE = import.meta.env.VITE_PAYFAST_PASSPHRASE || '';
  const IS_SANDBOX = import.meta.env.VITE_PAYFAST_SANDBOX === 'true';

  // Fetch available courses from backend
  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      const response = await fetch(`${API_BASE_URL}/courses/`);
      if (response.ok) {
        const data = await response.json();
        setAvailableCourses(data);
        console.log('Available courses:', data);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  // Handle PayFast payment - UPDATED FOR LOCAL TESTING
  const handlePayNow = () => {
    if (!formData.name || !formData.surname || !formData.email) {
      alert('Please fill in your name, surname, and email before proceeding to payment.');
      return;
    }

    if (!formData.course) {
      alert('Please select a course before proceeding to payment.');
      return;
    }

    if (!PAYFAST_MERCHANT_ID || !PAYFAST_MERCHANT_KEY) {
      alert(`❌ PayFast merchant credentials are not configured.`);
      return;
    }

    setPaymentLoading(true);

    try {
      // Use localhost URLs for testing
      const baseUrl = 'http://localhost:3000'; // Your React app URL
      const backendUrl = 'http://localhost:8000'; // Your Django backend URL
      
      const paymentId = generatePaymentId();
      
      const paymentData: PayFastData = {
        merchant_id: PAYFAST_MERCHANT_ID,
        merchant_key: PAYFAST_MERCHANT_KEY,
        return_url: `${baseUrl}/payment-success`,
        cancel_url: `${baseUrl}/payment-cancel`,
        notify_url: `${backendUrl}/api/payfast/notify`,
        name_first: formData.name,
        name_last: formData.surname,
        email_address: formData.email,
        cell_number: formData.mobile,
        m_payment_id: paymentId,
        amount: '661.25',
        item_name: 'Course Registration Fee',
        item_description: `Registration fee for course ID: ${formData.course}`,
        email_confirmation: '1',
        confirmation_address: formData.email,
      };

      console.log('Payment Data:', paymentData);
      
      const signature = generatePayFastSignature(paymentData, PAYFAST_PASSPHRASE);
      
      // Create form and submit to PayFast
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = IS_SANDBOX ? PAYFAST_URLS.sandbox : PAYFAST_URLS.live;
      
      // Add all payment data fields
      const sortedKeys = Object.keys(paymentData).sort() as Array<keyof PayFastData>;
      
      sortedKeys.forEach(key => {
        const value = paymentData[key];
        if (value !== undefined && value !== null && value !== '') {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = value.toString();
          form.appendChild(input);
        }
      });
      
      // Add signature
      const signatureInput = document.createElement('input');
      signatureInput.type = 'hidden';
      signatureInput.name = 'signature';
      signatureInput.value = signature;
      form.appendChild(signatureInput);
      
      // Append form to body and submit
      document.body.appendChild(form);
      console.log('Submitting form to PayFast:', form.action);
      form.submit();
      
    } catch (error) {
      console.error('❌ Payment error:', error);
      alert('Failed to initiate payment. Please try again.');
      setPaymentLoading(false);
    }
  };

  // Handle text input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle file input changes
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files: fileList } = e.target;
    if (fileList && fileList[0]) {
      setFiles(prev => ({
        ...prev,
        [name]: fileList[0]
      }));
    }
  };

  // Remove uploaded file
  const handleRemoveFile = (fileType: keyof typeof files) => {
    setFiles(prev => ({
      ...prev,
      [fileType]: null
    }));
    
    const fileInput = document.querySelector(`input[name="${fileType}"]`) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  // Format file name to prevent overflow
  const formatFileName = (fileName: string, maxLength: number = 20): string => {
    if (fileName.length <= maxLength) return fileName;
    const extension = fileName.substring(fileName.lastIndexOf('.'));
    const nameWithoutExtension = fileName.substring(0, fileName.lastIndexOf('.'));
    const truncatedName = nameWithoutExtension.substring(0, maxLength - 8) + '...';
    return truncatedName + extension;
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Validate form
  const validateForm = () => {
    const requiredFields = ['name', 'surname', 'age', 'mobile', 'email', 'id_number', 'address', 'education_level', 'previous_school', 'course'];
    for (const field of requiredFields) {
      if (!formData[field as keyof typeof formData]) {
        setErrorMessage(`Please fill in ${field.replace('_', ' ')}`);
        return false;
      }
    }

    const age = parseInt(formData.age);
    if (isNaN(age) || age < 16 || age > 65) {
      setErrorMessage('Age must be between 16 and 65');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setErrorMessage('Please enter a valid email address');
      return false;
    }

    const mobileRegex = /^(\+27|0)[1-9][0-9]{8}$/;
    const cleanMobile = formData.mobile.replace(/\s/g, '');
    if (!mobileRegex.test(cleanMobile)) {
      setErrorMessage('Please enter a valid South African mobile number (e.g., 083 123 4567 or +27831234567)');
      return false;
    }

    const requiredFiles = ['id_document', 'matric_certificate'];
    for (const fileField of requiredFiles) {
      if (!files[fileField as keyof typeof files]) {
        setErrorMessage(`Please upload ${fileField.replace('_', ' ')}`);
        return false;
      }
    }

    const maxSize = 5 * 1024 * 1024;
    for (const [field, file] of Object.entries(files)) {
      if (file && file.size > maxSize) {
        setErrorMessage(`${field.replace('_', ' ')} is too large. Maximum size is 5MB`);
        return false;
      }
    }

    return true;
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      alert(`❌ Validation Error: ${errorMessage}`);
      return;
    }

    setLoading(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const formDataToSend = new FormData();
      
      // Add all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value) {
          if (key === 'course') {
            // Send as 'course' with the ID as a number
            const courseId = parseInt(value);
            console.log('🎓 Sending course ID:', courseId);
            formDataToSend.append('course', courseId.toString());
            // Also send as form_course_id for the model's save method
            formDataToSend.append('form_course_id', value);
          } else if (key === 'age') {
            formDataToSend.append('age', parseInt(value).toString());
          } else {
            formDataToSend.append(key, value.toString());
          }
        }
      });
      
      // Add files
      Object.entries(files).forEach(([key, file]) => {
        if (file) {
          formDataToSend.append(key, file, file.name);
        }
      });

      console.log('📤 Submitting application data...');
      
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      const response = await fetch(`${API_BASE_URL}/applications/`, {
        method: 'POST',
        body: formDataToSend,
      });

      console.log('📡 Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Application submitted successfully:', data);
        
        alert(`✅ Application Submitted Successfully!\n\n📋 Application ID: ${data.id || 'Pending'}\n👤 Name: ${formData.name} ${formData.surname}\n🎓 Course ID: ${formData.course}\n\n📬 We will contact you via email or phone within 3-5 working days.\n\nYour application will now appear in the admin dashboard for review.`);
        
        setSubmitStatus('success');
        
        // Reset form
        setFormData({
          name: '',
          surname: '',
          age: '',
          country: 'South Africa',
          mobile: '',
          email: '',
          id_number: '',
          address: '',
          education_level: '',
          previous_school: '',
          course: '',
        });
        setFiles({
          id_document: null,
          matric_certificate: null,
          proof_of_payment: null,
          additional_doc_1: null,
          additional_doc_2: null,
        });
        
      } else {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        
        try {
          const errorData = JSON.parse(errorText);
          console.error('Submission error JSON:', errorData);
          
          let errorMsg = errorData.error || errorData.detail || errorData.message || 'Failed to submit application. Please try again.';
          
          alert(`❌ Submission Error:\n\n${errorMsg}\n\nPlease check your information and try again.`);
          
          setSubmitStatus('error');
          setErrorMessage(errorMsg);
        } catch (parseError) {
          console.error('Error parsing error response:', parseError);
          const errorMsg = `Server error (${response.status})`;
          
          alert(`❌ Server Error (${response.status})`);
          
          setSubmitStatus('error');
          setErrorMessage(errorMsg);
        }
      }
    } catch (error: any) {
      console.error('❌ Network error:', error);
      alert(`Network error: ${error.message}. Please check your connection.`);
      setSubmitStatus('error');
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Go back to courses
  const handleBackToCourses = () => {
    onNavigate(Page.Courses);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-gray-900 pt-20 sm:pt-24 pb-12 sm:pb-16 px-3 sm:px-4">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={handleBackToCourses}
          className="flex items-center text-gray-400 hover:text-white mb-6 sm:mb-8 transition-colors group text-sm sm:text-base"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to All Courses
        </button>

        {/* Header with Registration Fee Notice */}
        <div className="mb-8 sm:mb-10 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4 font-orbitron bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
            Apply for Admission
          </h2>
          <div className="inline-flex flex-col sm:flex-row items-center justify-center px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-full mb-4 sm:mb-6">
            <span className="text-amber-400 font-bold text-sm sm:text-base">📢 Registration Fee: R661.25</span>
            <span className="hidden sm:inline mx-3 text-gray-400">•</span>
            <span className="text-gray-300 text-xs sm:text-sm">Pay online or upload proof</span>
          </div>
          <p className="text-gray-400 text-sm sm:text-base max-w-2xl mx-auto">
            Complete the form below to apply for your chosen course. All fields are required unless marked optional.
          </p>
        </div>

        {/* Status Messages */}
        {submitStatus === 'success' && (
          <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl">
            <div className="flex items-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-500/20 flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
                <span className="text-xl sm:text-2xl text-green-400">✓</span>
              </div>
              <div>
                <p className="text-green-400 font-bold text-base sm:text-lg">Application Submitted Successfully!</p>
                <p className="text-green-400/80 text-xs sm:text-sm mt-1">
                  Your application has been received and will appear in the admin dashboard for review.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {submitStatus === 'error' && (
          <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-gradient-to-r from-red-500/10 to-rose-500/10 border border-red-500/20 rounded-2xl">
            <div className="flex items-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-red-500/20 flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
                <span className="text-xl sm:text-2xl text-red-400">✗</span>
              </div>
              <div>
                <p className="text-red-400 font-bold text-base sm:text-lg">Submission Error</p>
                <p className="text-red-400/80 text-xs sm:text-sm mt-1">{errorMessage}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="glass p-4 sm:p-6 md:p-8 rounded-3xl border border-white/5 bg-gradient-to-br from-slate-900/50 to-gray-900/50 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
            {/* Section 1: Personal Information */}
            <div className="p-4 sm:p-6 rounded-2xl bg-white/5 border border-white/10">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 flex items-center">
                <span className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-blue-500/20 flex items-center justify-center mr-2 sm:mr-3 text-sm sm:text-base">1</span>
                Personal Information
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm sm:text-base"
                    placeholder="Enter your first name"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="surname"
                    value={formData.surname}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm sm:text-base"
                    placeholder="Enter your last name"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                    Age *
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm sm:text-base"
                    placeholder="Enter your age"
                    min="16"
                    max="65"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                    ID/Passport Number *
                  </label>
                  <input
                    type="text"
                    name="id_number"
                    value={formData.id_number}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm sm:text-base"
                    placeholder="Enter ID or passport number"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                    Country *
                  </label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors appearance-none cursor-pointer text-sm sm:text-base"
                    style={{ color: 'white' }}
                    required
                  >
                    <option value="South Africa" style={{ backgroundColor: '#1f2937', color: 'white' }}>South Africa</option>
                    <option value="Lesotho" style={{ backgroundColor: '#1f2937', color: 'white' }}>Lesotho</option>
                    <option value="Botswana" style={{ backgroundColor: '#1f2937', color: 'white' }}>Botswana</option>
                    <option value="Eswatini" style={{ backgroundColor: '#1f2937', color: 'white' }}>Eswatini</option>
                    <option value="Namibia" style={{ backgroundColor: '#1f2937', color: 'white' }}>Namibia</option>
                    <option value="Zimbabwe" style={{ backgroundColor: '#1f2937', color: 'white' }}>Zimbabwe</option>
                    <option value="Mozambique" style={{ backgroundColor: '#1f2937', color: 'white' }}>Mozambique</option>
                    <option value="Zambia" style={{ backgroundColor: '#1f2937', color: 'white' }}>Zambia</option>
                    <option value="Other" style={{ backgroundColor: '#1f2937', color: 'white' }}>Other African Country</option>
                    <option value="International" style={{ backgroundColor: '#1f2937', color: 'white' }}>International</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm sm:text-base"
                    placeholder="083 123 4567"
                    required
                  />
                </div>
                
                <div className="sm:col-span-2">
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm sm:text-base"
                    placeholder="your.email@example.com"
                    required
                  />
                </div>
                
                <div className="sm:col-span-2">
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                    Physical Address *
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none text-sm sm:text-base"
                    placeholder="Enter your full physical address"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Education Information */}
            <div className="p-4 sm:p-6 rounded-2xl bg-white/5 border border-white/10">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 flex items-center">
                <span className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-green-500/20 flex items-center justify-center mr-2 sm:mr-3 text-sm sm:text-base">2</span>
                Education Information
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                    Highest Education Level *
                  </label>
                  <select
                    name="education_level"
                    value={formData.education_level}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors appearance-none cursor-pointer text-sm sm:text-base"
                    style={{ color: 'white' }}
                    required
                  >
                    <option value="" style={{ backgroundColor: '#1f2937', color: 'white' }}>Select your education level</option>
                    <option value="Grade 9" style={{ backgroundColor: '#1f2937', color: 'white' }}>Grade 9</option>
                    <option value="Grade 10" style={{ backgroundColor: '#1f2937', color: 'white' }}>Grade 10</option>
                    <option value="Grade 11" style={{ backgroundColor: '#1f2937', color: 'white' }}>Grade 11</option>
                    <option value="Grade 12 (Matric)" style={{ backgroundColor: '#1f2937', color: 'white' }}>Grade 12 (Matric)</option>
                    <option value="N3" style={{ backgroundColor: '#1f2937', color: 'white' }}>N3</option>
                    <option value="N4" style={{ backgroundColor: '#1f2937', color: 'white' }}>N4</option>
                    <option value="Certificate" style={{ backgroundColor: '#1f2937', color: 'white' }}>Certificate</option>
                    <option value="Diploma" style={{ backgroundColor: '#1f2937', color: 'white' }}>Diploma</option>
                    <option value="Degree" style={{ backgroundColor: '#1f2937', color: 'white' }}>Degree</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                    Previous School/Institution *
                  </label>
                  <input
                    type="text"
                    name="previous_school"
                    value={formData.previous_school}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm sm:text-base"
                    placeholder="Name of your previous school"
                    required
                  />
                </div>
                
                <div className="sm:col-span-2">
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                    Choose Course *
                  </label>
                  <select
                    name="course"
                    value={formData.course}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors appearance-none cursor-pointer text-sm sm:text-base"
                    style={{ color: 'white' }}
                    required
                  >
                    <option value="" style={{ backgroundColor: '#1f2937', color: 'white' }}>Select a course</option>
                    {/* IMPORTANT: Use course.id as the value (number) */}
                    {availableCourses.map(course => (
                      <option key={course.id} value={course.id} style={{ backgroundColor: '#1f2937', color: 'white' }}>
                        {course.title}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-2">
                    Selected course ID: {formData.course}
                  </p>
                </div>
              </div>
            </div>

            {/* Section 3: Documents Upload */}
            <div className="p-4 sm:p-6 rounded-2xl bg-white/5 border border-white/10">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 flex items-center">
                <span className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-amber-500/20 flex items-center justify-center mr-2 sm:mr-3 text-sm sm:text-base">3</span>
                Required Documents
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* ID Document */}
                <div className="space-y-2 sm:space-y-3">
                  <label className="block text-xs sm:text-sm font-medium text-gray-300">
                    ID/Passport Document *
                  </label>
                  <div className="space-y-2 sm:space-y-3">
                    {!files.id_document ? (
                      <div className="relative">
                        <input
                          type="file"
                          name="id_document"
                          onChange={handleFileChange}
                          className="block w-full text-xs sm:text-sm text-gray-400 file:mr-2 sm:file:mr-4 file:py-2 file:px-3 sm:file:py-3 sm:file:px-4 file:rounded-xl file:border-0 file:text-xs sm:file:text-sm file:font-semibold file:bg-blue-500/20 file:text-blue-400 hover:file:bg-blue-500/30 cursor-pointer bg-black/30 border border-white/10 rounded-xl"
                          accept=".pdf,.jpg,.jpeg,.png"
                          required
                        />
                      </div>
                    ) : (
                      <div className="p-3 sm:p-4 bg-gradient-to-r from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-xl">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                              <span className="text-blue-400 text-sm sm:text-base">🆔</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs sm:text-sm font-medium text-white truncate" title={files.id_document.name}>
                                {formatFileName(files.id_document.name)}
                              </p>
                              <p className="text-[10px] sm:text-xs text-gray-400">
                                {formatFileSize(files.id_document.size)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                            <span className="text-green-400 text-xs sm:text-sm">✓</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveFile('id_document')}
                              className="text-red-400 hover:text-red-300 text-base sm:text-lg font-bold"
                              title="Remove file"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                    <p className="text-[10px] sm:text-xs text-gray-500">Upload scanned copy of ID or passport</p>
                  </div>
                </div>

                {/* Matric Certificate */}
                <div className="space-y-2 sm:space-y-3">
                  <label className="block text-xs sm:text-sm font-medium text-gray-300">
                    Matric Certificate *
                  </label>
                  <div className="space-y-2 sm:space-y-3">
                    {!files.matric_certificate ? (
                      <div className="relative">
                        <input
                          type="file"
                          name="matric_certificate"
                          onChange={handleFileChange}
                          className="block w-full text-xs sm:text-sm text-gray-400 file:mr-2 sm:file:mr-4 file:py-2 file:px-3 sm:file:py-3 sm:file:px-4 file:rounded-xl file:border-0 file:text-xs sm:file:text-sm file:font-semibold file:bg-green-500/20 file:text-green-400 hover:file:bg-green-500/30 cursor-pointer bg-black/30 border border-white/10 rounded-xl"
                          accept=".pdf,.jpg,.jpeg,.png"
                          required
                        />
                      </div>
                    ) : (
                      <div className="p-3 sm:p-4 bg-gradient-to-r from-green-500/10 to-green-600/10 border border-green-500/20 rounded-xl">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                              <span className="text-green-400 text-sm sm:text-base">🎓</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs sm:text-sm font-medium text-white truncate" title={files.matric_certificate.name}>
                                {formatFileName(files.matric_certificate.name)}
                              </p>
                              <p className="text-[10px] sm:text-xs text-gray-400">
                                {formatFileSize(files.matric_certificate.size)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                            <span className="text-green-400 text-xs sm:text-sm">✓</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveFile('matric_certificate')}
                              className="text-red-400 hover:text-red-300 text-base sm:text-lg font-bold"
                              title="Remove file"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                    <p className="text-[10px] sm:text-xs text-gray-500">Latest school results or certificate</p>
                  </div>
                </div>

                {/* Proof of Payment */}
                <div className="space-y-2 sm:space-y-3">
                  <label className="block text-xs sm:text-sm font-medium text-gray-300">
                    Proof of Payment (R661.25) *
                  </label>
                  
                  {/* Pay Now Button */}
                  <div className="mb-4">
                    <button
                      type="button"
                      onClick={handlePayNow}
                      disabled={paymentLoading}
                      className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-xl text-sm sm:text-base transition-all duration-300 shadow-lg shadow-green-600/30 flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-green-400/30"
                    >
                      {paymentLoading ? (
                        <>
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Redirecting to PayFast...</span>
                        </>
                      ) : (
                        <>
                          <span className="text-2xl">💰</span>
                          <span className="text-lg">Pay Now with PayFast</span>
                        </>
                      )}
                    </button>
                    <p className="text-xs text-center text-gray-500 mt-2">
                      Click to pay your R661.25 registration fee securely via PayFast
                    </p>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/10"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="px-2 bg-white/5 text-gray-400 rounded">OR upload proof of payment</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 sm:space-y-3 mt-3">
                    {!files.proof_of_payment ? (
                      <div className="relative">
                        <input
                          type="file"
                          name="proof_of_payment"
                          onChange={handleFileChange}
                          className="block w-full text-xs sm:text-sm text-gray-400 file:mr-2 sm:file:mr-4 file:py-2 file:px-3 sm:file:py-3 sm:file:px-4 file:rounded-xl file:border-0 file:text-xs sm:file:text-sm file:font-semibold file:bg-amber-500/20 file:text-amber-400 hover:file:bg-amber-500/30 cursor-pointer bg-black/30 border border-white/10 rounded-xl"
                          accept=".pdf,.jpg,.jpeg,.png"
                        />
                        <p className="text-[10px] text-gray-500 mt-1">
                          If you already paid via EFT/bank deposit, upload your proof here
                        </p>
                      </div>
                    ) : (
                      <div className="p-3 sm:p-4 bg-gradient-to-r from-amber-500/10 to-amber-600/10 border border-amber-500/20 rounded-xl">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                              <span className="text-amber-400 text-sm sm:text-base">💰</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs sm:text-sm font-medium text-white truncate" title={files.proof_of_payment.name}>
                                {formatFileName(files.proof_of_payment.name)}
                              </p>
                              <p className="text-[10px] sm:text-xs text-gray-400">
                                {formatFileSize(files.proof_of_payment.size)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                            <span className="text-green-400 text-xs sm:text-sm">✓</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveFile('proof_of_payment')}
                              className="text-red-400 hover:text-red-300 text-base sm:text-lg font-bold"
                              title="Remove file"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Document 1 */}
                <div className="space-y-2 sm:space-y-3">
                  <label className="block text-xs sm:text-sm font-medium text-gray-300">
                    Additional Document 1 (Optional)
                  </label>
                  <div className="space-y-2 sm:space-y-3">
                    {!files.additional_doc_1 ? (
                      <div className="relative">
                        <input
                          type="file"
                          name="additional_doc_1"
                          onChange={handleFileChange}
                          className="block w-full text-xs sm:text-sm text-gray-400 file:mr-2 sm:file:mr-4 file:py-2 file:px-3 sm:file:py-3 sm:file:px-4 file:rounded-xl file:border-0 file:text-xs sm:file:text-sm file:font-semibold file:bg-purple-500/20 file:text-purple-400 hover:file:bg-purple-500/30 cursor-pointer bg-black/30 border border-white/10 rounded-xl"
                          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        />
                      </div>
                    ) : (
                      <div className="p-3 sm:p-4 bg-gradient-to-r from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-xl">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                              <span className="text-purple-400 text-sm sm:text-base">📄</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs sm:text-sm font-medium text-white truncate" title={files.additional_doc_1.name}>
                                {formatFileName(files.additional_doc_1.name)}
                              </p>
                              <p className="text-[10px] sm:text-xs text-gray-400">
                                {formatFileSize(files.additional_doc_1.size)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                            <span className="text-green-400 text-xs sm:text-sm">✓</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveFile('additional_doc_1')}
                              className="text-red-400 hover:text-red-300 text-base sm:text-lg font-bold"
                              title="Remove file"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                    <p className="text-[10px] sm:text-xs text-gray-500">Reference letter, CV, etc.</p>
                  </div>
                </div>

                {/* Additional Document 2 */}
                <div className="space-y-2 sm:space-y-3">
                  <label className="block text-xs sm:text-sm font-medium text-gray-300">
                    Additional Document 2 (Optional)
                  </label>
                  <div className="space-y-2 sm:space-y-3">
                    {!files.additional_doc_2 ? (
                      <div className="relative">
                        <input
                          type="file"
                          name="additional_doc_2"
                          onChange={handleFileChange}
                          className="block w-full text-xs sm:text-sm text-gray-400 file:mr-2 sm:file:mr-4 file:py-2 file:px-3 sm:file:py-3 sm:file:px-4 file:rounded-xl file:border-0 file:text-xs sm:file:text-sm file:font-semibold file:bg-purple-500/20 file:text-purple-400 hover:file:bg-purple-500/30 cursor-pointer bg-black/30 border border-white/10 rounded-xl"
                          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        />
                      </div>
                    ) : (
                      <div className="p-3 sm:p-4 bg-gradient-to-r from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-xl">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                              <span className="text-purple-400 text-sm sm:text-base">📄</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs sm:text-sm font-medium text-white truncate" title={files.additional_doc_2.name}>
                                {formatFileName(files.additional_doc_2.name)}
                              </p>
                              <p className="text-[10px] sm:text-xs text-gray-400">
                                {formatFileSize(files.additional_doc_2.size)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                            <span className="text-green-400 text-xs sm:text-sm">✓</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveFile('additional_doc_2')}
                              className="text-red-400 hover:text-red-300 text-base sm:text-lg font-bold"
                              title="Remove file"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                    <p className="text-[10px] sm:text-xs text-gray-500">Certificates, qualifications, etc.</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <div className="flex items-start">
                  <div className="mr-2 sm:mr-4 text-blue-400 flex-shrink-0">ℹ️</div>
                  <div>
                    <p className="text-blue-400 font-medium text-xs sm:text-sm mb-1">Important Notes:</p>
                    <ul className="text-[10px] sm:text-xs text-gray-400 space-y-1">
                      <li>• Maximum file size: 5MB per document</li>
                      <li>• Accepted formats: PDF, JPG, JPEG, PNG, DOC, DOCX</li>
                      <li>• Registration fee of R661.25 is non-refundable</li>
                      <li>• You can pay online via PayFast or upload proof of payment</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Section */}
            <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Ready to Submit</h3>
                  <p className="text-gray-400 text-xs sm:text-sm">
                    Please review all information before submitting.
                  </p>
                </div>
                
                <div className="flex flex-col xs:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="px-4 sm:px-6 py-2 sm:py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-xs sm:text-sm font-bold border border-white/10 transition-colors"
                  >
                    Clear Form
                  </button>
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 sm:px-8 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold rounded-xl text-sm sm:text-base transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/30 flex items-center justify-center min-w-[160px] sm:min-w-[200px]"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Submitting...</span>
                      </>
                    ) : (
                      'Submit Application'
                    )}
                  </button>
                </div>
              </div>
              
              <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-white/10">
                <p className="text-center text-gray-500 text-[10px] sm:text-xs">
                  By submitting, you agree to our Terms of Service and confirm that all information is accurate.
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ApplicationForm;