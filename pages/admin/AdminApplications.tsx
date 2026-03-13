import React, { useState, useEffect } from 'react';

// Define types for the application
interface Application {
  id: number;
  name: string;
  surname: string;
  age: number;
  country: string;
  mobile: string;
  email: string;
  id_number: string;
  address: string;
  education_level: string;
  previous_school: string;
  course: string;
  course_title: string;
  status: 'pending' | 'approved' | 'rejected';
  fee_verified: boolean;
  created_at: string;
  formatted_date: string;
  documents_status: {
    id: boolean;
    matric: boolean;
    pop: boolean;
  };
}

interface ApplicationDocuments {
  id_document: {
    url: string;
    name: string;
    size: number | null;
  };
  matric_certificate: {
    url: string;
    name: string;
    size: number | null;
  };
  proof_of_payment: {
    url: string;
    name: string;
    size: number | null;
  };
  additional_doc_1: {
    url: string;
    name: string;
    size: number | null;
  } | null;
  additional_doc_2: {
    url: string;
    name: string;
    size: number | null;
  } | null;
}

// FIXED: Use import.meta.env for Vite instead of process.env
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const AdminApplications: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [documentUrls, setDocumentUrls] = useState<ApplicationDocuments | null>(null);
  const [processing, setProcessing] = useState<number | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    feeVerified: 0
  });

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [applications]);

  const calculateStats = () => {
    const total = applications.length;
    const pending = applications.filter(app => app.status === 'pending').length;
    const approved = applications.filter(app => app.status === 'approved').length;
    const rejected = applications.filter(app => app.status === 'rejected').length;
    const feeVerified = applications.filter(app => app.fee_verified).length;
    
    setStats({ total, pending, approved, rejected, feeVerified });
  };

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/applications/`);
      if (response.ok) {
        const data: Application[] = await response.json();
        console.log('Fetched applications:', data.length);
        setApplications(data);
      } else {
        console.error('Failed to fetch applications:', response.status);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDocumentUrls = async (appId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/applications/${appId}/documents/`);
      if (response.ok) {
        const data: ApplicationDocuments = await response.json();
        setDocumentUrls(data);
      } else {
        console.error('Failed to fetch document URLs:', response.status);
        alert('Failed to load documents. Please try again.');
      }
    } catch (error) {
      console.error('Error fetching document URLs:', error);
    }
  };

  const handleViewDocuments = async (app: Application) => {
    setSelectedApp(app);
    await fetchDocumentUrls(app.id);
  };

  // Function to add approved application to students
  const addToStudents = async (application: Application) => {
    try {
      // Prepare student data from application
      const studentData = {
        name: application.name,
        surname: application.surname,
        email: application.email,
        phone: application.mobile,
        address: application.address,
        id_number: application.id_number,
        age: application.age,
        country: application.country,
        education_level: application.education_level,
        previous_school: application.previous_school,
        course: application.course, // This should be course ID
        status: 'Active',
        fees_status: application.fee_verified ? 'Paid' : 'Pending',
        // Document status from application
        documents_status: application.documents_status
      };

      console.log('Adding to students:', studentData);

      const response = await fetch(`${API_BASE_URL}/students/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(studentData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Student added successfully:', result);
        return true;
      } else {
        const error = await response.json();
        console.error('Failed to add student:', error);
        return false;
      }
    } catch (error) {
      console.error('Error adding to students:', error);
      return false;
    }
  };

  const handleApprove = async (appId: number) => {
    if (window.confirm('Are you sure you want to approve this application? This will add the student to the registry.')) {
      try {
        setProcessing(appId);
        
        // First, approve the application
        const response = await fetch(`${API_BASE_URL}/applications/${appId}/approve/`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const result = await response.json();
          
          // Find the application that was approved
          const approvedApp = applications.find(app => app.id === appId);
          
          if (approvedApp) {
            // Add to students list
            const studentAdded = await addToStudents(approvedApp);
            
            if (studentAdded) {
              alert(`✅ Application approved and student added to registry successfully!`);
            } else {
              alert(`⚠️ Application approved but failed to add to student registry. Please add manually.`);
            }
          } else {
            alert(`✅ ${result.message || 'Application approved successfully!'}`);
          }
          
          fetchApplications(); // Refresh the list
          if (selectedApp?.id === appId) {
            setSelectedApp(null);
            setDocumentUrls(null);
          }
        } else {
          alert('Failed to approve application. Please try again.');
        }
      } catch (error) {
        console.error('Error approving application:', error);
        alert('Network error. Please check connection and try again.');
      } finally {
        setProcessing(null);
      }
    }
  };

  const handleReject = async (appId: number) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (reason === null) return; // User cancelled
    
    if (window.confirm(`Reject application with reason: "${reason}"?`)) {
      try {
        setProcessing(appId);
        const response = await fetch(`${API_BASE_URL}/applications/${appId}/reject/`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ reason })
        });
        
        if (response.ok) {
          const result = await response.json();
          alert(`❌ ${result.message || 'Application rejected.'}`);
          fetchApplications(); // Refresh the list
          if (selectedApp?.id === appId) {
            setSelectedApp(null);
            setDocumentUrls(null);
          }
        } else {
          alert('Failed to reject application. Please try again.');
        }
      } catch (error) {
        console.error('Error rejecting application:', error);
        alert('Network error. Please check connection and try again.');
      } finally {
        setProcessing(null);
      }
    }
  };

  const handleVerifyFee = async (appId: number) => {
    try {
      setProcessing(appId);
      const response = await fetch(`${API_BASE_URL}/applications/${appId}/verify_fee/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        alert(`💰 ${result.message || 'Fee verified successfully!'}`);
        fetchApplications(); // Refresh the list
      } else {
        alert('Failed to verify fee. Please try again.');
      }
    } catch (error) {
      console.error('Error verifying fee:', error);
      alert('Network error. Please check connection and try again.');
    } finally {
      setProcessing(null);
    }
  };

  const formatFileSize = (bytes: number | null): string => {
    if (!bytes) return 'Unknown size';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'approved':
        return 'text-green-400';
      case 'rejected':
        return 'text-red-400';
      case 'pending':
        return 'text-amber-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusBgColor = (status: string): string => {
    switch (status) {
      case 'approved':
        return 'bg-green-500/20';
      case 'rejected':
        return 'bg-red-500/20';
      case 'pending':
        return 'bg-amber-500/20';
      default:
        return 'bg-gray-500/20';
    }
  };

  const getFilteredApplications = () => {
    if (filter === 'all') return applications;
    return applications.filter(app => app.status === filter);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-white flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <div>Loading applications...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 md:p-6">
      <header>
        <h1 className="text-3xl font-bold text-white mb-2">📋 Applications Review</h1>
        <p className="text-gray-400">Review student submissions and fee confirmations. Approving an application automatically adds the student to the registry.</p>
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-6">
          <div className="glass p-4 rounded-2xl border border-white/5">
            <div className="text-gray-400 text-sm">Total Applications</div>
            <div className="text-2xl font-bold text-white">{stats.total}</div>
          </div>
          <div className="glass p-4 rounded-2xl border border-white/5">
            <div className="text-gray-400 text-sm">Pending Review</div>
            <div className="text-2xl font-bold text-amber-400">{stats.pending}</div>
          </div>
          <div className="glass p-4 rounded-2xl border border-white/5">
            <div className="text-gray-400 text-sm">Approved</div>
            <div className="text-2xl font-bold text-green-400">{stats.approved}</div>
          </div>
          <div className="glass p-4 rounded-2xl border border-white/5">
            <div className="text-gray-400 text-sm">Rejected</div>
            <div className="text-2xl font-bold text-red-400">{stats.rejected}</div>
          </div>
          <div className="glass p-4 rounded-2xl border border-white/5">
            <div className="text-gray-400 text-sm">Fee Verified</div>
            <div className="text-2xl font-bold text-blue-400">{stats.feeVerified}</div>
          </div>
        </div>

        {/* Filter and Refresh */}
        <div className="mt-6 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-300 hover:bg-white/10'}`}
            >
              All ({stats.total})
            </button>
            <button 
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filter === 'pending' ? 'bg-amber-600 text-white' : 'bg-white/5 text-gray-300 hover:bg-white/10'}`}
            >
              Pending ({stats.pending})
            </button>
            <button 
              onClick={() => setFilter('approved')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filter === 'approved' ? 'bg-green-600 text-white' : 'bg-white/5 text-gray-300 hover:bg-white/10'}`}
            >
              Approved ({stats.approved})
            </button>
            <button 
              onClick={() => setFilter('rejected')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filter === 'rejected' ? 'bg-red-600 text-white' : 'bg-white/5 text-gray-300 hover:bg-white/10'}`}
            >
              Rejected ({stats.rejected})
            </button>
          </div>
          
          <button 
            onClick={fetchApplications}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white rounded-lg text-sm font-bold transition-all flex items-center"
          >
            <span className="mr-2">🔄</span>
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </header>

      {/* Document Viewer Modal */}
      {selectedApp && documentUrls && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="glass p-6 md:p-8 rounded-3xl border border-white/5 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">
                📄 Documents for {selectedApp.name} {selectedApp.surname}
              </h2>
              <button 
                onClick={() => {
                  setSelectedApp(null);
                  setDocumentUrls(null);
                }}
                className="text-gray-400 hover:text-white text-2xl transition-colors"
              >
                ×
              </button>
            </div>

            <div className="mb-6 p-4 rounded-xl bg-slate-900/50 border border-white/5">
              <h3 className="text-white font-bold mb-3">Application Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Full Name</p>
                  <p className="text-white font-medium">{selectedApp.name} {selectedApp.surname}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Course</p>
                  <p className="text-blue-400 font-medium">{selectedApp.course_title}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Age & Country</p>
                  <p className="text-white font-medium">{selectedApp.age} years • {selectedApp.country}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Mobile</p>
                  <p className="text-white font-medium">{selectedApp.mobile}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Education</p>
                  <p className="text-white font-medium">{selectedApp.education_level}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Previous School</p>
                  <p className="text-white font-medium">{selectedApp.previous_school}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">ID Number</p>
                  <p className="text-white font-medium">{selectedApp.id_number}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Email</p>
                  <p className="text-white font-medium">{selectedApp.email}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-400">Address</p>
                  <p className="text-white font-medium">{selectedApp.address}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* ID Document */}
              <div className="p-4 rounded-xl bg-slate-900/50 border border-white/5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-bold">ID Document</h3>
                  <span className={`text-xs px-2 py-1 rounded ${selectedApp.documents_status.id ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {selectedApp.documents_status.id ? 'Uploaded' : 'Missing'}
                  </span>
                </div>
                {documentUrls.id_document.url ? (
                  <>
                    <a 
                      href={documentUrls.id_document.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block mb-2 p-3 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg border border-blue-500/20 transition-all"
                    >
                      <div className="text-center">
                        <span className="text-3xl">🆔</span>
                        <p className="text-sm text-white mt-2">View ID Document</p>
                        <p className="text-xs text-gray-400 mt-1 truncate" title={documentUrls.id_document.name}>
                          {documentUrls.id_document.name}
                        </p>
                        {documentUrls.id_document.size && (
                          <p className="text-xs text-gray-500 mt-1">
                            {formatFileSize(documentUrls.id_document.size)}
                          </p>
                        )}
                      </div>
                    </a>
                    <a 
                      href={documentUrls.id_document.url} 
                      download
                      className="block w-full py-2 text-center text-blue-400 hover:text-blue-300 text-sm font-bold border border-blue-500/20 rounded-lg hover:bg-blue-500/10 transition-all"
                    >
                      Download
                    </a>
                  </>
                ) : (
                  <div className="text-center p-4">
                    <span className="text-3xl text-gray-600">❌</span>
                    <p className="text-gray-500 mt-2">No ID document uploaded</p>
                  </div>
                )}
              </div>

              {/* Matric Certificate */}
              <div className="p-4 rounded-xl bg-slate-900/50 border border-white/5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-bold">Matric Certificate</h3>
                  <span className={`text-xs px-2 py-1 rounded ${selectedApp.documents_status.matric ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {selectedApp.documents_status.matric ? 'Uploaded' : 'Missing'}
                  </span>
                </div>
                {documentUrls.matric_certificate.url ? (
                  <>
                    <a 
                      href={documentUrls.matric_certificate.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block mb-2 p-3 bg-green-500/10 hover:bg-green-500/20 rounded-lg border border-green-500/20 transition-all"
                    >
                      <div className="text-center">
                        <span className="text-3xl">🎓</span>
                        <p className="text-sm text-white mt-2">View Matric Certificate</p>
                        <p className="text-xs text-gray-400 mt-1 truncate" title={documentUrls.matric_certificate.name}>
                          {documentUrls.matric_certificate.name}
                        </p>
                        {documentUrls.matric_certificate.size && (
                          <p className="text-xs text-gray-500 mt-1">
                            {formatFileSize(documentUrls.matric_certificate.size)}
                          </p>
                        )}
                      </div>
                    </a>
                    <a 
                      href={documentUrls.matric_certificate.url} 
                      download
                      className="block w-full py-2 text-center text-green-400 hover:text-green-300 text-sm font-bold border border-green-500/20 rounded-lg hover:bg-green-500/10 transition-all"
                    >
                      Download
                    </a>
                  </>
                ) : (
                  <div className="text-center p-4">
                    <span className="text-3xl text-gray-600">❌</span>
                    <p className="text-gray-500 mt-2">No matric certificate uploaded</p>
                  </div>
                )}
              </div>

              {/* Proof of Payment */}
              <div className="p-4 rounded-xl bg-slate-900/50 border border-white/5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-bold">Proof of Payment (R661.25)</h3>
                  <span className={`text-xs px-2 py-1 rounded ${selectedApp.documents_status.pop ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {selectedApp.documents_status.pop ? 'Uploaded' : 'Missing'}
                  </span>
                </div>
                {documentUrls.proof_of_payment.url ? (
                  <>
                    <a 
                      href={documentUrls.proof_of_payment.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block mb-2 p-3 bg-amber-500/10 hover:bg-amber-500/20 rounded-lg border border-amber-500/20 transition-all"
                    >
                      <div className="text-center">
                        <span className="text-3xl">💰</span>
                        <p className="text-sm text-white mt-2">View Proof of Payment</p>
                        <p className="text-xs text-gray-400 mt-1 truncate" title={documentUrls.proof_of_payment.name}>
                          {documentUrls.proof_of_payment.name}
                        </p>
                        {documentUrls.proof_of_payment.size && (
                          <p className="text-xs text-gray-500 mt-1">
                            {formatFileSize(documentUrls.proof_of_payment.size)}
                          </p>
                        )}
                      </div>
                    </a>
                    <a 
                      href={documentUrls.proof_of_payment.url} 
                      download
                      className="block w-full py-2 text-center text-amber-400 hover:text-amber-300 text-sm font-bold border border-amber-500/20 rounded-lg hover:bg-amber-500/10 transition-all"
                    >
                      Download
                    </a>
                  </>
                ) : (
                  <div className="text-center p-4">
                    <span className="text-3xl text-gray-600">❌</span>
                    <p className="text-gray-500 mt-2">No proof of payment uploaded</p>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Documents */}
            {(documentUrls.additional_doc_1 || documentUrls.additional_doc_2) && (
              <div className="mb-6">
                <h3 className="text-white font-bold mb-3">Additional Documents</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {documentUrls.additional_doc_1 && (
                    <div className="p-4 rounded-xl bg-slate-900/50 border border-white/5">
                      <h4 className="text-white font-bold mb-2">Additional Document 1</h4>
                      <a 
                        href={documentUrls.additional_doc_1.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block mb-2 p-3 bg-purple-500/10 hover:bg-purple-500/20 rounded-lg border border-purple-500/20 transition-all"
                      >
                        <div className="text-center">
                          <span className="text-3xl">📄</span>
                          <p className="text-sm text-white mt-2">View Document</p>
                          <p className="text-xs text-gray-400 mt-1 truncate">
                            {documentUrls.additional_doc_1.name}
                          </p>
                        </div>
                      </a>
                    </div>
                  )}
                  {documentUrls.additional_doc_2 && (
                    <div className="p-4 rounded-xl bg-slate-900/50 border border-white/5">
                      <h4 className="text-white font-bold mb-2">Additional Document 2</h4>
                      <a 
                        href={documentUrls.additional_doc_2.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block mb-2 p-3 bg-purple-500/10 hover:bg-purple-500/20 rounded-lg border border-purple-500/20 transition-all"
                      >
                        <div className="text-center">
                          <span className="text-3xl">📄</span>
                          <p className="text-sm text-white mt-2">View Document</p>
                          <p className="text-xs text-gray-400 mt-1 truncate">
                            {documentUrls.additional_doc_2.name}
                          </p>
                        </div>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8 pt-6 border-t border-white/5">
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">Status:</span>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${getStatusBgColor(selectedApp.status)} ${getStatusColor(selectedApp.status)}`}>
                  {selectedApp.status.toUpperCase()}
                </span>
                <span className="text-xs text-gray-500">Fee:</span>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${selectedApp.fee_verified ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>
                  {selectedApp.fee_verified ? 'Verified' : 'Not Verified'}
                </span>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <button 
                  onClick={() => handleVerifyFee(selectedApp.id)}
                  disabled={processing === selectedApp.id || selectedApp.fee_verified}
                  className="px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed text-amber-400 rounded-lg text-sm font-bold border border-amber-500/20 transition-all"
                >
                  {selectedApp.fee_verified ? '✓ Fee Verified' : 'Verify Fee'}
                </button>
                {/* FIXED: Use type guard to check if status is not 'approved' */}
                {selectedApp.status !== 'approved' && (
                  <>
                    <button 
                      onClick={() => handleReject(selectedApp.id)}
                      disabled={processing === selectedApp.id}
                      className="px-6 py-2 bg-red-500/10 hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed text-red-500 rounded-lg text-sm font-bold border border-red-500/20 transition-all"
                    >
                      {processing === selectedApp.id ? 'Processing...' : 'Reject'}
                    </button>
                    <button 
                      onClick={() => handleApprove(selectedApp.id)}
                      disabled={processing === selectedApp.id}
                      className="px-6 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-bold transition-all shadow-lg shadow-green-600/20"
                    >
                      {processing === selectedApp.id ? 'Processing...' : 'Approve & Enroll'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Applications List */}
      <div className="grid grid-cols-1 gap-6">
        {getFilteredApplications().length === 0 ? (
          <div className="glass p-8 rounded-3xl border border-white/5 text-center">
            <span className="text-5xl mb-4">📭</span>
            <h3 className="text-xl font-bold text-white mb-2">
              {filter === 'all' ? 'No Applications' : `No ${filter} Applications`}
            </h3>
            <p className="text-gray-400">
              {filter === 'all' 
                ? 'No applications have been submitted yet.' 
                : `There are no ${filter} applications.`}
            </p>
            <button 
              onClick={fetchApplications}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold"
            >
              Refresh List
            </button>
          </div>
        ) : (
          getFilteredApplications().map((app) => (
            <div key={app.id} className="glass p-6 rounded-3xl border border-white/5 hover:border-blue-500/30 transition-all">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-start space-x-6">
                  <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center text-2xl font-bold border border-white/5">
                    {app.name[0]}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-white">{app.name} {app.surname}</h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-gray-400 border border-white/5">
                        APP-{app.id.toString().padStart(3, '0')}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${getStatusBgColor(app.status)} ${getStatusColor(app.status)}`}>
                        {app.status.toUpperCase()}
                      </span>
                      {app.fee_verified && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-green-500/20 text-green-400">
                          FEE VERIFIED
                        </span>
                      )}
                    </div>
                    <p className="text-blue-400 text-sm font-semibold mb-3">{app.course_title}</p>
                    <div className="flex flex-wrap gap-4">
                      <span className="text-xs text-gray-500 flex items-center">
                        <span className="mr-1">🗓️</span> {app.formatted_date || new Date(app.created_at).toLocaleDateString()}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center">
                        <span className="mr-1">🎂</span> {app.age} years
                      </span>
                      <span className="text-xs text-gray-500 flex items-center">
                        <span className="mr-1">📞</span> {app.mobile}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center">
                        <span className="mr-1">📍</span> {app.country}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Document Status Badges */}
                  <div className="flex items-center space-x-4 p-3 rounded-xl bg-black/20 border border-white/5">
                    <div className="text-center" title="ID Document">
                      <p className="text-[9px] uppercase tracking-widest text-gray-500 mb-1">ID</p>
                      <span className={app.documents_status.id ? "text-green-500 text-lg" : "text-gray-600 text-lg"}>
                        {app.documents_status.id ? "✅" : "❌"}
                      </span>
                    </div>
                    <div className="text-center" title="Matric Certificate">
                      <p className="text-[9px] uppercase tracking-widest text-gray-500 mb-1">Matric</p>
                      <span className={app.documents_status.matric ? "text-green-500 text-lg" : "text-gray-600 text-lg"}>
                        {app.documents_status.matric ? "✅" : "❌"}
                      </span>
                    </div>
                    <div className="text-center" title="Proof of Payment">
                      <p className="text-[9px] uppercase tracking-widest text-blue-400 mb-1 font-bold">R661.25 POP</p>
                      <span className={app.documents_status.pop ? "text-green-500 text-lg" : "text-gray-600 text-lg"}>
                        {app.documents_status.pop ? "✅" : "❌"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => handleViewDocuments(app)}
                      className="px-5 py-2.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-xl text-sm font-bold border border-blue-500/20 transition-all"
                    >
                      View Docs
                    </button>
                    {!app.fee_verified && (
                      <button 
                        onClick={() => handleVerifyFee(app.id)}
                        disabled={processing === app.id}
                        className="px-4 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed text-amber-400 rounded-xl text-sm font-bold border border-amber-500/20 transition-all"
                      >
                        Verify Fee
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-white/5 flex flex-wrap gap-4 justify-between items-center">
                <div className="text-xs text-gray-500">
                  <span className="font-medium text-gray-400">Education:</span> {app.education_level} • {app.previous_school}
                </div>
                <div className="flex gap-3">
                  {/* FIXED: Use type guard to check if status is 'approved' */}
                  {app.status === 'approved' ? (
                    <span className="px-4 py-2 text-xs bg-green-500/20 text-green-400 rounded-lg font-bold border border-green-500/20">
                      ✓ Approved
                    </span>
                  ) : (
                    <>
                      <button 
                        onClick={() => handleReject(app.id)}
                        disabled={processing === app.id || app.status === 'rejected'}
                        className="px-4 py-2 text-xs bg-red-500/10 hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed text-red-500 rounded-lg font-bold border border-red-500/20 transition-all"
                      >
                        {app.status === 'rejected' ? 'Rejected' : 'Reject'}
                      </button>
                      <button 
                        onClick={() => handleApprove(app.id)}
                        // FIXED: Use a type assertion to tell TypeScript this is safe
                        disabled={processing === app.id || (app.status as string) === 'approved'}
                        className="px-4 py-2 text-xs bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-bold transition-all"
                      >
                        Approve & Enroll
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminApplications;