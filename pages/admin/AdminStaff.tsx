import React, { useState, useEffect } from 'react';
import { TeamMember } from '../../types';

// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Helper to get CSRF token from cookies
const getCsrfToken = () => {
  const name = 'csrftoken';
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
};

const AdminStaff: React.FC = () => {
  const [staff, setStaff] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<TeamMember | null>(null);
  const [processing, setProcessing] = useState(false);
  
  // New staff form state
  const [formData, setFormData] = useState<Partial<TeamMember>>({
    name: '',
    position: '',
    bio: '',
    email: '',
    phone: '',
    order: 0,
    is_active: true,
    facebook: '',
    twitter: '',
    linkedin: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/team/`);
      if (response.ok) {
        const data = await response.json();
        setStaff(Array.isArray(data) ? data : (data.results || []));
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      position: '',
      bio: '',
      email: '',
      phone: '',
      order: 0,
      is_active: true,
      facebook: '',
      twitter: '',
      linkedin: ''
    });
    setImageFile(null);
    setImagePreview(null);
    setSelectedStaff(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          data.append(key, value.toString());
        }
      });
      
      if (imageFile) {
        data.append('image', imageFile);
      }

      const csrfToken = getCsrfToken();
      const url = selectedStaff 
        ? `${API_BASE_URL}/team/${selectedStaff.id}/`
        : `${API_BASE_URL}/team/`;
      
      const response = await fetch(url, {
        method: selectedStaff ? 'PATCH' : 'POST',
        headers: {
          ...(csrfToken ? { 'X-CSRFToken': csrfToken } : {}),
        },
        credentials: 'include',
        body: data,
      });

      if (response.ok) {
        alert(selectedStaff ? 'Staff member updated successfully!' : 'Staff member added successfully!');
        resetForm();
        setShowAddModal(false);
        setShowEditModal(false);
        fetchStaff();
      } else {
        const error = await response.json();
        alert(`Error: ${JSON.stringify(error)}`);
      }
    } catch (error) {
      console.error('Error submitting staff:', error);
      alert('Network error. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this staff member?')) return;
    
    try {
      const csrfToken = getCsrfToken();
      const response = await fetch(`${API_BASE_URL}/team/${id}/`, {
        method: 'DELETE',
        headers: {
          ...(csrfToken ? { 'X-CSRFToken': csrfToken } : {}),
        },
        credentials: 'include',
      });

      if (response.ok) {
        fetchStaff();
      }
    } catch (error) {
      console.error('Error deleting staff:', error);
    }
  };

  const handleEdit = (member: TeamMember) => {
    setSelectedStaff(member);
    setFormData({
      name: member.name,
      position: member.position,
      bio: member.bio || '',
      email: member.email || '',
      phone: member.phone || '',
      order: member.order,
      is_active: member.is_active,
      facebook: member.facebook || '',
      twitter: member.twitter || '',
      linkedin: member.linkedin || ''
    });
    setImagePreview(member.image);
    setShowEditModal(true);
  };

  const filteredStaff = staff.filter(member => 
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-orbitron font-bold text-white mb-2">Staff Management</h1>
          <p className="text-gray-400">Manage your team members and their public profiles.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setShowAddModal(true); }}
          className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-red-600/20"
        >
          + Add Staff Member
        </button>
      </header>

      {/* Search Bar */}
      <div className="glass p-4 rounded-2xl flex items-center border border-white/5">
        <div className="relative flex-grow">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
          <input 
            type="text" 
            placeholder="Search staff by name or position..." 
            className="w-full bg-slate-800/50 border border-white/5 rounded-xl pl-12 pr-4 py-3 text-sm text-white focus:outline-none focus:border-red-500 transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStaff.map(member => (
          <div key={member.id} className="glass p-6 rounded-3xl border border-white/5 relative group hover:border-red-500/30 transition-all overflow-hidden">
            <div className="flex items-start justify-between mb-4">
              <div className="w-20 h-20 rounded-2xl overflow-hidden glass border border-white/10">
                <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => handleEdit(member)}
                  className="p-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white rounded-lg transition-all"
                  title="Edit"
                >
                  ✏️
                </button>
                <button 
                  onClick={() => handleDelete(member.id)}
                  className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-all"
                  title="Delete"
                >
                  🗑️
                </button>
              </div>
            </div>
            
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white mb-1">{member.name}</h3>
              <p className="text-red-400 text-sm font-medium uppercase tracking-wider">{member.position}</p>
              {member.email && <p className="text-gray-400 text-xs">{member.email}</p>}
            </div>

            <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
              <div className="flex space-x-3">
                {member.linkedin && <span className="text-gray-500 text-xs">LN</span>}
                {member.facebook && <span className="text-gray-500 text-xs">FB</span>}
                {member.twitter && <span className="text-gray-500 text-xs">TW</span>}
              </div>
              <span className={`text-[10px] px-2 py-1 rounded-full uppercase font-bold ${member.is_active ? 'bg-green-500/10 text-green-400' : 'bg-gray-500/10 text-gray-400'}`}>
                {member.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
          <div className="glass p-8 rounded-3xl border border-white/5 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">{selectedStaff ? 'Edit Staff Member' : 'Add Staff Member'}</h2>
              <button 
                onClick={() => { setShowAddModal(false); setShowEditModal(false); resetForm(); }} 
                className="text-gray-400 hover:text-white text-2xl"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Photo Upload */}
                <div className="md:col-span-2 flex items-center space-x-6">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden glass border border-white/10 flex-shrink-0">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl">👤</div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Staff Photo</label>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageChange}
                      className="text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-red-600/10 file:text-red-400 hover:file:bg-red-600/20"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-400">Full Name *</label>
                  <input 
                    type="text" 
                    name="name" 
                    required 
                    value={formData.name} 
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-red-500" 
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-400">Position / Role *</label>
                  <input 
                    type="text" 
                    name="position" 
                    required 
                    value={formData.position} 
                    onChange={handleInputChange}
                    placeholder="e.g. Senior Technical Trainer"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-red-500" 
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-400">Email Address</label>
                  <input 
                    type="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-red-500" 
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-400">Phone Number</label>
                  <input 
                    type="text" 
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-red-500" 
                  />
                </div>

                <div className="md:col-span-2 space-y-1">
                  <label className="block text-sm font-medium text-gray-400">Biography</label>
                  <textarea 
                    name="bio" 
                    rows={4} 
                    value={formData.bio} 
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-red-500"
                  ></textarea>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-400">Facebook URL</label>
                  <input 
                    type="url" 
                    name="facebook" 
                    value={formData.facebook} 
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-red-500" 
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-400">LinkedIn URL</label>
                  <input 
                    type="url" 
                    name="linkedin" 
                    value={formData.linkedin} 
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-red-500" 
                  />
                </div>

                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="is_active" 
                      name="is_active" 
                      checked={formData.is_active} 
                      onChange={handleInputChange}
                      className="w-5 h-5 rounded border-white/10 bg-white/5 text-red-600 focus:ring-red-500"
                    />
                    <label htmlFor="is_active" className="text-sm font-medium text-white">Active Status</label>
                  </div>
                  <div className="flex-grow">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Display Order</label>
                    <input 
                      type="number" 
                      name="order" 
                      value={formData.order} 
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-red-500" 
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-8">
                <button 
                  type="button"
                  onClick={() => { setShowAddModal(false); setShowEditModal(false); resetForm(); }}
                  className="px-8 py-3 glass hover:bg-white/10 text-white font-bold rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={processing}
                  className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-600/20 disabled:opacity-50 transition-all"
                >
                  {processing ? 'Processing...' : (selectedStaff ? 'Update Staff Member' : 'Add Staff Member')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStaff;
