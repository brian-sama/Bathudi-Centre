import React, { useState, useEffect } from 'react';
import { Student, StudentStatus, FeeStatus } from '../../types';

<<<<<<< HEAD
=======
// To handle Excel/CSV uploads, you'll need to install the 'xlsx' library:
// npm install xlsx
import * as XLSX from 'xlsx';
>>>>>>> upstream/main
// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

interface NewStudentForm {
  name: string;
  surname: string;
  email: string;
  phone: string;
  address: string;
  id_number: string;
  age: string;
  country: string;
  education_level: string;
  previous_school: string;
  course_id: number;
  course_title: string;
  status: StudentStatus;
  fees_status: FeeStatus;
  documents: {
    id: boolean;
    matric: boolean;
    pop: boolean;
    additional: boolean;
  };
}

const AdminStudents: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [availableCourses, setAvailableCourses] = useState<any[]>([]);
<<<<<<< HEAD
=======
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any[] | null>(null);
>>>>>>> upstream/main
  const [processing, setProcessing] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  
  // New student form state
  const [newStudent, setNewStudent] = useState<NewStudentForm>({
    name: '',
    surname: '',
    email: '',
    phone: '',
    address: '',
    id_number: '',
    age: '',
    country: 'South Africa',
    education_level: '',
    previous_school: '',
    course_id: 1,
<<<<<<< HEAD
    course_title: 'Engine Fitter',
=======
    course_title: '',
>>>>>>> upstream/main
    status: StudentStatus.Active,
    fees_status: FeeStatus.Pending,
    documents: {
      id: false,
      matric: false,
      pop: false,
      additional: false
    }
  });

  // Fetch students from API
  useEffect(() => {
    fetchStudents();
    fetchCourses();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/students/`);
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      } else {
        console.error('Failed to fetch students');
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/courses/`);
      if (response.ok) {
        const data = await response.json();
        setAvailableCourses(data);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'course_id') {
      const selectedCourse = availableCourses.find(c => c.id === parseInt(value));
      setNewStudent(prev => ({
        ...prev,
        course_id: parseInt(value),
        course_title: selectedCourse?.title || 'Unknown Course'
      }));
    } else {
      setNewStudent(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle document checkbox changes
  const handleDocumentChange = (docType: 'id' | 'matric' | 'pop' | 'additional') => {
    setNewStudent(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [docType]: !prev.documents[docType]
      }
    }));
  };

  // Handle enroll student
  const handleEnrollStudent = async () => {
    if (!newStudent.name || !newStudent.surname || !newStudent.email || !newStudent.phone) {
      alert('Please fill in all required fields');
      return;
    }

    setProcessing(true);

    try {
      const studentData = {
        name: newStudent.name,
        surname: newStudent.surname,
<<<<<<< HEAD
        email: newStudent.email,
        phone: newStudent.phone,
        address: newStudent.address,
        id_number: newStudent.id_number,
        age: parseInt(newStudent.age) || 0,
        country: newStudent.country,
        education_level: newStudent.education_level,
        previous_school: newStudent.previous_school,
        course: newStudent.course_id,
        status: newStudent.status,
        fees_status: newStudent.fees_status,
=======
        ...newStudent,
        course: newStudent.course_id,
>>>>>>> upstream/main
        documents_status: {
          id: newStudent.documents.id,
          matric: newStudent.documents.matric,
          pop: newStudent.documents.pop,
          additional: newStudent.documents.additional
        }
      };

      const response = await fetch(`${API_BASE_URL}/students/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentData),
      });

      if (response.ok) {
        alert(`✅ Student ${newStudent.name} ${newStudent.surname} enrolled successfully!`);
        setShowAddModal(false);
        resetForm();
        fetchStudents();
      } else {
        const error = await response.json();
<<<<<<< HEAD
        alert(`❌ Failed to enroll student: ${error.message || 'Unknown error'}`);
=======
        const errorDetail = typeof error.details === 'string' ? error.details : JSON.stringify(error.details);
        alert(`❌ Failed to enroll student: ${error.error || 'Unknown error'}. Details: ${errorDetail}`);
>>>>>>> upstream/main
      }
    } catch (error) {
      console.error('Error enrolling student:', error);
      alert('❌ Network error. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  // Handle edit student
  const handleEditStudent = async () => {
    if (!selectedStudent) return;
    
    setProcessing(true);
    try {
      const response = await fetch(`${API_BASE_URL}/students/${selectedStudent.id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedStudent),
      });

      if (response.ok) {
        alert(`✅ Student details updated successfully!`);
        setShowEditModal(false);
        setSelectedStudent(null);
        fetchStudents();
      } else {
        const error = await response.json();
        alert(`❌ Failed to update student: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating student:', error);
      alert('❌ Network error. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  // Handle delete student
  const handleDeleteStudent = async (student: Student) => {
    if (!confirm(`Are you sure you want to delete ${student.name} ${student.surname}? This action cannot be undone.`)) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/students/${student.id}/`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert(`✅ Student deleted successfully!`);
        fetchStudents();
      } else {
        alert(`❌ Failed to delete student`);
      }
    } catch (error) {
      console.error('Error deleting student:', error);
      alert('❌ Network error. Please try again.');
    }
  };

  // Reset form
  const resetForm = () => {
    setNewStudent({
      name: '',
      surname: '',
      email: '',
      phone: '',
      address: '',
      id_number: '',
      age: '',
      country: 'South Africa',
      education_level: '',
      previous_school: '',
      course_id: 1,
<<<<<<< HEAD
      course_title: 'Engine Fitter',
=======
      course_title: '',
>>>>>>> upstream/main
      status: StudentStatus.Active,
      fees_status: FeeStatus.Pending,
      documents: {
        id: false,
        matric: false,
        pop: false,
        additional: false
      }
    });
<<<<<<< HEAD
=======
    setParsedData(null);
    setBulkFile(null);
  };

  // Handle bulk upload file selection and parsing
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBulkFile(file);
      setProcessing(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = event.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json(worksheet);
          setParsedData(json);
        } catch (err) {
          alert("Error reading the file. Please ensure it's a valid Excel or CSV file.");
          console.error(err);
        } finally {
          setProcessing(false);
        }
      };
      reader.readAsBinaryString(file);
    }
  };

  // Handle submitting bulk upload
  const handleBulkUpload = async () => {
    if (!parsedData) return alert('No data to upload.');
    setProcessing(true);
    try {
      const response = await fetch(`${API_BASE_URL}/students/bulk_enroll/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsedData),
      });
      const result = await response.json();
      alert(result.message || 'Upload process finished.');
      if (response.ok || response.status === 207) {
        setShowBulkUploadModal(false);
        resetForm();
        fetchStudents();
      }
    } catch (error) {
      alert('A network error occurred during bulk upload.');
    } finally {
      setProcessing(false);
    }
>>>>>>> upstream/main
  };

  // Filter students
  const filteredStudents = students.filter(student => {
    const searchLower = searchTerm.toLowerCase();
    const studentIdString = student.id?.toString() || '';
    const studentIdNumber = student.student_id?.toLowerCase() || '';
    const courseTitle = student.course_title?.toLowerCase() || '';
    
    return (
      student.name.toLowerCase().includes(searchLower) ||
      student.surname.toLowerCase().includes(searchLower) ||
      studentIdString.includes(searchLower) ||
      studentIdNumber.includes(searchLower) ||
      courseTitle.includes(searchLower) ||
      student.email.toLowerCase().includes(searchLower)
    );
  });

  const getFeeStatus = (student: Student): FeeStatus => {
    return student.fees_status || student.feesStatus || FeeStatus.Pending;
  };

  const getFeeStatusColor = (status: FeeStatus): string => {
    switch(status) {
      case FeeStatus.Paid: return 'bg-blue-500/20 text-blue-400';
      case FeeStatus.Partial: return 'bg-yellow-500/20 text-yellow-400';
      case FeeStatus.Outstanding: return 'bg-red-500/20 text-red-400';
      case FeeStatus.Pending: default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-white flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <div>Loading students...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
<<<<<<< HEAD
=======
      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="glass p-8 rounded-3xl border border-white/5 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Enroll New Student</h2>
              <button onClick={() => { setShowAddModal(false); resetForm(); }} 
                className="text-gray-400 hover:text-white text-2xl">×</button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <h3 className="md:col-span-2 text-lg font-semibold text-blue-400 border-b border-white/10 pb-2">Personal Details</h3>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">First Name *</label>
                  <input type="text" name="name" value={newStudent.name} onChange={handleInputChange} className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Last Name *</label>
                  <input type="text" name="surname" value={newStudent.surname} onChange={handleInputChange} className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Email *</label>
                  <input type="email" name="email" value={newStudent.email} onChange={handleInputChange} className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Phone *</label>
                  <input type="text" name="phone" value={newStudent.phone} onChange={handleInputChange} className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">ID Number</label>
                  <input type="text" name="id_number" value={newStudent.id_number} onChange={handleInputChange} className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Age</label>
                  <input type="number" name="age" value={newStudent.age} onChange={handleInputChange} className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-400 mb-1">Address</label>
                  <textarea name="address" value={newStudent.address} onChange={handleInputChange} className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white min-h-[80px]"></textarea>
                </div>

                <h3 className="md:col-span-2 text-lg font-semibold text-blue-400 border-b border-white/10 pb-2 mt-4">Enrollment Details</h3>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Course *</label>
                  <select name="course_id" value={newStudent.course_id} onChange={handleInputChange} className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white">
                    {availableCourses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Student Status</label>
                  <select name="status" value={newStudent.status} onChange={handleInputChange} className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white">
                    {Object.values(StudentStatus).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Fee Status</label>
                  <select name="fees_status" value={newStudent.fees_status} onChange={handleInputChange} className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white">
                    {Object.values(FeeStatus).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-blue-400 border-b border-white/10 pb-2 mt-4 mb-2">Documents on File</h3>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center space-x-2 text-gray-300">
                    <input type="checkbox" checked={newStudent.documents.id} onChange={() => handleDocumentChange('id')} className="form-checkbox bg-gray-800 border-gray-600 text-blue-500" />
                    <span>ID Document</span>
                  </label>
                  <label className="flex items-center space-x-2 text-gray-300">
                    <input type="checkbox" checked={newStudent.documents.matric} onChange={() => handleDocumentChange('matric')} className="form-checkbox bg-gray-800 border-gray-600 text-blue-500" />
                    <span>Matric Certificate</span>
                  </label>
                  <label className="flex items-center space-x-2 text-gray-300">
                    <input type="checkbox" checked={newStudent.documents.pop} onChange={() => handleDocumentChange('pop')} className="form-checkbox bg-gray-800 border-gray-600 text-blue-500" />
                    <span>Proof of Payment</span>
                  </label>
                </div>
              </div>
              
              <div className="flex justify-end gap-4 mt-6">
                <button onClick={() => { setShowAddModal(false); resetForm(); }} 
                  className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg">Cancel</button>
                <button onClick={handleEnrollStudent} disabled={processing}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50">
                  {processing ? 'Enrolling...' : 'Enroll Student'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {showBulkUploadModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="glass p-8 rounded-3xl border border-white/5 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Bulk Student Upload</h2>
              <button onClick={() => { setShowBulkUploadModal(false); resetForm(); }} 
                className="text-gray-400 hover:text-white text-2xl">×</button>
            </div>
            
            <div className="space-y-6">
              <div className="bg-blue-900/50 p-4 rounded-lg border border-blue-500/30 text-sm text-blue-200">
                <p className="font-bold mb-2">Instructions:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Upload an Excel (.xlsx) or CSV (.csv) file.</li>
                  <li>The first row must be a header row.</li>
                  <li>Required columns: <strong>name, surname, email, phone, course</strong>.</li>
                  <li>The 'course' column should match a course title in the system.</li>
                </ul>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Upload Spreadsheet</label>
                <input 
                  type="file" 
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileSelect}
                  className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                />
              </div>

              {processing && <div className="text-center text-blue-400">Processing file...</div>}

              {parsedData && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Data Preview ({parsedData.length} rows found)</h3>
                  <div className="max-h-60 overflow-y-auto border border-white/10 rounded-lg">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-white/10">
                        <tr>
                          {Object.keys(parsedData[0]).map(key => (
                            <th key={key} className="px-4 py-2 text-gray-300 font-semibold">{key}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {parsedData.slice(0, 5).map((row, i) => (
                          <tr key={i}>
                            {Object.values(row).map((val: any, j) => (
                              <td key={j} className="px-4 py-2 text-gray-400 truncate max-w-[150px]">{String(val)}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {parsedData.length > 5 && <p className="text-xs text-gray-500 mt-2">...and {parsedData.length - 5} more rows.</p>}
                </div>
              )}

              <div className="flex justify-end gap-4 mt-6">
                <button onClick={() => { setShowBulkUploadModal(false); resetForm(); }} 
                  className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg">Cancel</button>
                <button onClick={handleBulkUpload} disabled={!parsedData || processing}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50">
                  {processing ? 'Uploading...' : `Upload ${parsedData?.length || 0} Students`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

>>>>>>> upstream/main
      {/* View Modal */}
      {showViewModal && selectedStudent && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="glass p-8 rounded-3xl border border-white/5 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Student Details</h2>
              <button onClick={() => { setShowViewModal(false); setSelectedStudent(null); }} 
                className="text-gray-400 hover:text-white text-2xl">×</button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-gray-400">Name</p><p className="text-white font-medium">{selectedStudent.name} {selectedStudent.surname}</p></div>
                <div><p className="text-gray-400">Student ID</p><p className="text-white font-medium">{selectedStudent.student_id || selectedStudent.id}</p></div>
                <div><p className="text-gray-400">Email</p><p className="text-white font-medium">{selectedStudent.email}</p></div>
                <div><p className="text-gray-400">Phone</p><p className="text-white font-medium">{selectedStudent.phone}</p></div>
                <div><p className="text-gray-400">Course</p><p className="text-white font-medium">{selectedStudent.course_title}</p></div>
                <div><p className="text-gray-400">Status</p><p className={`font-medium ${selectedStudent.status === StudentStatus.Active ? 'text-green-400' : 'text-red-400'}`}>{selectedStudent.status}</p></div>
                <div><p className="text-gray-400">Fee Status</p><p className={`font-medium ${getFeeStatusColor(getFeeStatus(selectedStudent))}`}>{getFeeStatus(selectedStudent)}</p></div>
                <div><p className="text-gray-400">Address</p><p className="text-white font-medium">{selectedStudent.address || 'N/A'}</p></div>
              </div>
              <div className="flex justify-end mt-6">
                <button onClick={() => { setShowViewModal(false); setSelectedStudent(null); }} 
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedStudent && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="glass p-8 rounded-3xl border border-white/5 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Edit Student Details</h2>
              <button onClick={() => { setShowEditModal(false); setSelectedStudent(null); }} 
                className="text-gray-400 hover:text-white text-2xl">×</button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">First Name</label>
                  <input type="text" value={selectedStudent.name} 
                    onChange={(e) => setSelectedStudent({...selectedStudent, name: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Last Name</label>
                  <input type="text" value={selectedStudent.surname} 
                    onChange={(e) => setSelectedStudent({...selectedStudent, surname: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Email</label>
                  <input type="email" value={selectedStudent.email} 
                    onChange={(e) => setSelectedStudent({...selectedStudent, email: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Phone</label>
                  <input type="text" value={selectedStudent.phone} 
                    onChange={(e) => setSelectedStudent({...selectedStudent, phone: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Address</label>
                  <input type="text" value={selectedStudent.address || ''} 
                    onChange={(e) => setSelectedStudent({...selectedStudent, address: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Fee Status</label>
                  <select value={selectedStudent.fees_status} 
                    onChange={(e) => setSelectedStudent({...selectedStudent, fees_status: e.target.value as FeeStatus})}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white">
                    <option value={FeeStatus.Paid}>Paid</option>
                    <option value={FeeStatus.Partial}>Partial</option>
                    <option value={FeeStatus.Outstanding}>Outstanding</option>
                    <option value={FeeStatus.Pending}>Pending</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Status</label>
                  <select value={selectedStudent.status} 
                    onChange={(e) => setSelectedStudent({...selectedStudent, status: e.target.value as StudentStatus})}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white">
                    <option value={StudentStatus.Active}>Active</option>
                    <option value={StudentStatus.Inactive}>Inactive</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end gap-4 mt-6">
                <button onClick={() => { setShowEditModal(false); setSelectedStudent(null); }} 
                  className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg">Cancel</button>
                <button onClick={handleEditStudent} disabled={processing}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50">
                  {processing ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

<<<<<<< HEAD
      {/* Rest of your component remains the same... */}
=======
>>>>>>> upstream/main
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-orbitron font-bold text-white mb-2">Student Registry</h1>
          <p className="text-gray-400">Manage, track, and update enrolled students and their fee records.</p>
        </div>
        <div className="flex items-center space-x-4">
<<<<<<< HEAD
          <button className="px-6 py-3 glass hover:bg-white/10 rounded-xl text-sm font-bold border border-white/10">
=======
          <button 
            onClick={() => setShowBulkUploadModal(true)}
            className="px-6 py-3 glass hover:bg-white/10 rounded-xl text-sm font-bold border border-white/10">
>>>>>>> upstream/main
            Bulk Upload CSV
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20"
          >
            + Enroll New Student
          </button>
        </div>
      </header>

      {/* Filter Bar */}
      <div className="glass p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center border border-white/5">
        <div className="relative flex-grow">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
          <input 
            type="text" 
            placeholder="Search by name, ID or course..." 
            className="w-full bg-slate-800/50 border border-white/5 rounded-xl pl-12 pr-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select className="bg-slate-800/50 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none">
          <option>All Courses</option>
          {availableCourses.map(c => <option key={c.id}>{c.title}</option>)}
        </select>
        <select className="bg-slate-800/50 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none">
          <option>All Statuses</option>
          <option>Active</option>
          <option>Inactive</option>
        </select>
      </div>

      {/* Students Table */}
      <div className="glass rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 border-b border-white/5">
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-gray-400">Student Info</th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-gray-400">Course</th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-gray-400">Status</th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-gray-400 text-center">Fees Record</th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    No students found. Click "Enroll New Student" to add your first student.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const feeStatus = getFeeStatus(student);
                  const courseDisplay = student.course_title || `Course #${student.course}`;
                  
                  return (
                    <tr key={student.id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-blue-600/10 text-blue-400 flex items-center justify-center font-bold">
                            {student.name[0]}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">{student.name} {student.surname}</p>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest">
                              ID: #{student.student_id || student.id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-sm text-gray-300">{courseDisplay}</p>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${
                          student.status === StudentStatus.Active 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {student.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <div className="flex flex-col items-center">
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase mb-1 ${getFeeStatusColor(feeStatus)}`}>
                            {feeStatus}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {/* Eye - View Details */}
                          <button 
                            onClick={() => { setSelectedStudent(student); setShowViewModal(true); }}
                            className="p-2 glass hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors" 
                            title="View Details"
                          >
                            👁️
                          </button>
                          {/* Pen - Edit Details */}
                          <button 
                            onClick={() => { setSelectedStudent(student); setShowEditModal(true); }}
                            className="p-2 glass hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors" 
                            title="Edit Details"
                          >
                            ✏️
                          </button>
                          {/* Dustbin - Delete Student */}
                          <button 
                            onClick={() => handleDeleteStudent(student)}
                            className="p-2 glass hover:bg-red-500/20 rounded-lg text-gray-400 hover:text-red-400 transition-colors" 
                            title="Delete Student"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
        <div className="glass p-4 rounded-xl border border-white/5">
          <p className="text-xs text-gray-400 uppercase">Total Students</p>
          <p className="text-2xl font-bold text-white">{students.length}</p>
        </div>
        <div className="glass p-4 rounded-xl border border-white/5">
          <p className="text-xs text-gray-400 uppercase">Active Students</p>
          <p className="text-2xl font-bold text-green-400">
            {students.filter(s => s.status === StudentStatus.Active).length}
          </p>
        </div>
        <div className="glass p-4 rounded-xl border border-white/5">
          <p className="text-xs text-gray-400 uppercase">Fees Paid</p>
          <p className="text-2xl font-bold text-blue-400">
            {students.filter(s => getFeeStatus(s) === FeeStatus.Paid).length}
          </p>
        </div>
        <div className="glass p-4 rounded-xl border border-white/5">
          <p className="text-xs text-gray-400 uppercase">Outstanding</p>
          <p className="text-2xl font-bold text-yellow-400">
            {students.filter(s => getFeeStatus(s) === FeeStatus.Outstanding).length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminStudents;