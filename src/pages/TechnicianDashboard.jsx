import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import CustomSelect from '../components/CustomSelect';
import { complaintAPI } from '../services/api';
import { Wrench, Search, Filter, Paperclip, X, Image as ImageIcon, Send, Clock, Eye, Hourglass, CheckCircle2 } from 'lucide-react';

const TechnicianDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Submit Update Modal State
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [updateText, setUpdateText] = useState('');
  const [proposedStatus, setProposedStatus] = useState('RESOLVED');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAssignedComplaints();
  }, []);

  const fetchAssignedComplaints = async () => {
    setLoading(true);
    try {
      const res = await complaintAPI.getTechnicianComplaints();
      setComplaints(res.data);
    } catch (err) {
      console.error('Failed to load technician complaints', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles((prev) => [...prev, ...files]);

    const newPreviews = files.map((file) => ({
      name: file.name,
      size: (file.size / 1024).toFixed(1) + ' KB',
      url: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
    }));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmitUpdate = async (e) => {
    e.preventDefault();
    if (!selectedComplaint || !updateText.trim()) return;

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('updateText', updateText);
      formData.append('proposedStatus', proposedStatus);

      selectedFiles.forEach((file) => {
        formData.append('files', file);
      });

      await complaintAPI.submitUpdate(selectedComplaint.id, formData);

      setSelectedComplaint(null);
      setUpdateText('');
      setProposedStatus('RESOLVED');
      setSelectedFiles([]);
      setPreviews([]);
      fetchAssignedComplaints();
    } catch (err) {
      alert(err.response?.data?.message || 'Error submitting update');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredComplaints = complaints.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
                          c.description.toLowerCase().includes(search.toLowerCase()) ||
                          (c.categoryName || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalAssigned = complaints.length;
  const pendingApprovalCount = complaints.filter(c => c.status === 'PENDING_APPROVAL').length;
  const inProgressCount = complaints.filter(c => c.status === 'IN_PROGRESS' || c.status === 'ASSIGNED').length;
  const resolvedCount = complaints.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED').length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Technician Work Portal
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Field Inspection & Maintenance Workload
            </h1>
          </div>
        </div>

        {/* Operational Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="card-modern p-4 rounded-xl flex items-center space-x-4 bg-white border border-slate-200 shadow-sm">
            <div className="w-12 h-12 rounded-lg bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-600">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-500">Total Assigned</div>
              <div className="text-2xl font-black text-slate-900">{totalAssigned}</div>
            </div>
          </div>

          <div className="card-modern p-4 rounded-xl flex items-center space-x-4 bg-white border border-slate-200 shadow-sm">
            <div className="w-12 h-12 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-800">Active Work</div>
              <div className="text-2xl font-black text-amber-800">{inProgressCount}</div>
            </div>
          </div>

          <div className="card-modern p-4 rounded-xl flex items-center space-x-4 bg-white border border-slate-200 shadow-sm">
            <div className="w-12 h-12 rounded-lg bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-700">
              <Hourglass className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold text-cyan-800">Awaiting Admin Review</div>
              <div className="text-2xl font-black text-cyan-800">{pendingApprovalCount}</div>
            </div>
          </div>

          <div className="card-modern p-4 rounded-xl flex items-center space-x-4 bg-white border border-slate-200 shadow-sm">
            <div className="w-12 h-12 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-800">Approved & Resolved</div>
              <div className="text-2xl font-black text-emerald-800">{resolvedCount}</div>
            </div>
          </div>
        </div>

        {/* Filter & Search */}
        <div className="card-modern p-4 rounded-xl mb-6 flex flex-col md:flex-row items-center justify-between gap-4 bg-white border border-slate-200 shadow-sm">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search assigned tickets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-modern pl-9"
            />
          </div>

          <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <Filter className="w-4 h-4 text-slate-400 mr-1 flex-shrink-0" />
            {['ALL', 'ASSIGNED', 'IN_PROGRESS', 'PENDING_APPROVAL', 'RESOLVED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  statusFilter === st
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Complaints Grid */}
        {loading ? (
          <div className="text-center py-16 text-slate-500">
            <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            Loading assigned workload...
          </div>
        ) : filteredComplaints.length === 0 ? (
          <div className="card-modern rounded-xl p-12 text-center bg-white border border-slate-200 shadow-sm max-w-xl mx-auto">
            <Wrench className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-900">No assigned tickets found</h3>
            <p className="text-slate-500 text-xs font-medium mt-1">You currently have no tasks assigned in this status view.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredComplaints.map((c) => (
              <div
                key={c.id}
                className="card-modern card-modern-hover p-5 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-bold text-brand-700 bg-brand-50 border border-brand-200 px-2.5 py-0.5 rounded-full truncate">
                      {c.categoryName}
                    </span>
                    <StatusBadge status={c.status} />
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900 mb-2 line-clamp-1">
                    {c.title}
                  </h3>

                  <p className="text-slate-600 text-xs line-clamp-3 mb-4 leading-relaxed font-medium">
                    {c.description}
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-200 text-xs text-slate-500 mb-3.5">
                    <PriorityBadge priority={c.priority} />
                    <span className="text-slate-500 text-[11px] font-medium">
                      Assigned by: {c.assignedBy?.name || 'Admin'}
                    </span>
                  </div>

                  {/* Perfectly Aligned Button Bar */}
                  <div className="flex items-center space-x-2.5">
                    <button
                      onClick={() => setSelectedComplaint(c)}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-bold text-xs shadow-sm transition flex items-center justify-center space-x-2"
                    >
                      <Send className="w-3.5 h-3.5 text-white" />
                      <span>Submit Work Update</span>
                    </button>

                    <Link
                      to={`/complaint/${c.id}`}
                      className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition flex items-center justify-center"
                      title="View Full History"
                    >
                      <Eye className="w-4 h-4 text-slate-600" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Submit Update Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 border border-slate-200 shadow-2xl relative my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                <Send className="w-5 h-5 text-brand-600" />
                <span>Submit Field Work Progress</span>
              </h2>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitUpdate} className="space-y-4 mt-4">
              <div>
                <label className="label-modern">Ticket Title</label>
                <input
                  type="text"
                  readOnly
                  value={selectedComplaint.title}
                  className="input-modern bg-slate-50 font-bold"
                />
              </div>

              <div>
                <label className="label-modern">Proposed New Status *</label>
                <CustomSelect
                  value={proposedStatus}
                  onChange={(val) => setProposedStatus(val)}
                  options={[
                    { value: 'IN_PROGRESS', label: 'IN_PROGRESS — Work Currently Underway' },
                    { value: 'RESOLVED', label: 'RESOLVED — Issue Fixed & Ready for Approval' },
                    { value: 'REJECTED', label: 'REJECTED — Unable to Fix / Invalid Issue' },
                  ]}
                />
              </div>

              <div>
                <label className="label-modern">Work Report / Inspection Summary *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe parts replaced, tests conducted, or work progress details..."
                  value={updateText}
                  onChange={(e) => setUpdateText(e.target.value)}
                  className="input-modern"
                />
              </div>

              <div>
                <label className="label-modern">
                  Upload Photo Evidence <span className="text-slate-500 font-normal">(Required for RESOLVED verification)</span>
                </label>
                <div className="border-2 border-dashed border-slate-300 hover:border-brand-500 rounded-xl p-4 text-center cursor-pointer transition bg-slate-50">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="fileUpload"
                  />
                  <label htmlFor="fileUpload" className="cursor-pointer flex flex-col items-center">
                    <ImageIcon className="w-8 h-8 text-brand-600 mb-1" />
                    <span className="text-xs font-bold text-slate-700">Click to upload repair photos</span>
                    <span className="text-[11px] text-slate-500">Upload on-site evidence photos</span>
                  </label>
                </div>

                {previews.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {previews.map((p, idx) => (
                      <div key={idx} className="relative group bg-white border border-slate-200 p-2 rounded-lg flex items-center space-x-2">
                        {p.url ? (
                          <img src={p.url} alt="preview" className="w-10 h-10 object-cover rounded" />
                        ) : (
                          <Paperclip className="w-6 h-6 text-brand-600 flex-shrink-0" />
                        )}
                        <div className="overflow-hidden text-[10px]">
                          <p className="truncate font-bold text-slate-800">{p.name}</p>
                          <p className="text-slate-500">{p.size}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(idx)}
                          className="absolute -top-1.5 -right-1.5 bg-red-600 text-white rounded-full p-0.5 shadow-sm"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setSelectedComplaint(null)}
                  className="btn-modern-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-modern-primary text-xs"
                >
                  {submitting ? 'Submitting Report...' : 'Submit to Admin for Approval'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TechnicianDashboard;
