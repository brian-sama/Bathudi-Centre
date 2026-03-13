import React, { useState, useEffect } from 'react';
import { Student, StudentStatus, FeeStatus } from '../../types';

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
    course_title: 'Engine Fitter',
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
        alert(`❌ Failed to enroll student: ${error.message || 'Unknown error'}`);
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
      course_title: 'Engine Fitter',
      status: StudentStatus.Active,
      fees_status: FeeStatus.Pending,
      documents: {
        id: false,
        matric: false,
        pop: false,
        additional: false
      }
    });
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

      {/* Rest of your component remains the same... */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-orbitron font-bold text-white mb-2">Student Registry</h1>
          <p className="text-gray-400">Manage, track, and update enrolled students and their fee records.</p>
        </div>
        <div className="flex items-center space-x-4">
          <button className="px-6 py-3 glass hover:bg-white/10 rounded-xl text-sm font-bold border border-white/10">
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