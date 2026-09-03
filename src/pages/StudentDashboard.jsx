import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import CustomSelect from '../components/CustomSelect';
import { complaintAPI, categoryAPI, userAPI } from '../services/api';
import { PlusCircle, Search, Filter, Paperclip, X, Image as ImageIcon, CheckCircle, Clock, Eye, AlertCircle, ShieldOff, XCircle, ArrowRight, RotateCcw, ChevronDown, ChevronUp, Layers, UserCheck, Shield, Wrench, Send, Check } from 'lucide-react';

const ITEMS_PER_PAGE = 6;

const StudentDashboard = () => {
  const location = useLocation();
  const [complaints, setComplaints] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search & Basic Status Filter
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Advanced Funnel Filters
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('NEWEST');

  // Inline expanded cards state
  const [expandedCards, setExpandedCards] = useState({});

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);

  // Create Complaint Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('new') === 'true') {
      setIsModalOpen(true);
    }
  }, [location]);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategoryId, setNewCategoryId] = useState('');
  const [newPriority, setNewPriority] = useState('LOW');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Role Request State
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [targetRole, setTargetRole] = useState('TECHNICIAN');
  const [roleReason, setRoleReason] = useState('');
  const [roleSubmitting, setRoleSubmitting] = useState(false);
  const [roleRequestSuccess, setRoleRequestSuccess] = useState(false);

  const handleRequestRoleSubmit = async (e) => {
    e.preventDefault();
    if (!roleReason.trim()) return;
    setRoleSubmitting(true);
    try {
      await userAPI.requestRole({ requestedRole: targetRole, reason: roleReason });
      setRoleRequestSuccess(true);
      setTimeout(() => {
        setIsRoleModalOpen(false);
        setRoleRequestSuccess(false);
        setRoleReason('');
      }, 1500);
    } catch (err) {
      alert(err.response?.data?.message || 'Error submitting role change request');
    } finally {
      setRoleSubmitting(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, categoryFilter, priorityFilter, sortBy]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resComplaints, resCategories] = await Promise.all([
        complaintAPI.getMyComplaints(),
        categoryAPI.getAll()
      ]);
      setComplaints(resComplaints.data);
      setCategories(resCategories.data);
      if (resCategories.data.length > 0) {
        setNewCategoryId(resCategories.data[0].id);
      }
    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles((prev) => [...prev, ...files]);

    const newPreviews = files.map(file => ({
      name: file.name,
      size: (file.size / 1024).toFixed(1) + ' KB',
      url: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      type: file.type
    }));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreateComplaint = async (e) => {
    e.preventDefault();
    if (!newTitle || !newDescription || !newCategoryId) return;

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', newTitle);
      formData.append('description', newDescription);
      formData.append('categoryId', newCategoryId);
      formData.append('priority', newPriority);
      formData.append('isAnonymous', isAnonymous);

      selectedFiles.forEach((file) => {
        formData.append('files', file);
      });

      await complaintAPI.create(formData);
      
      setNewTitle('');
      setNewDescription('');
      setIsAnonymous(false);
      setSelectedFiles([]);
      setPreviews([]);
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error submitting complaint');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleExpandCard = (id) => {
    setExpandedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const resetAllFilters = () => {
    setSearch('');
    setStatusFilter('ALL');
    setCategoryFilter('ALL');
    setPriorityFilter('ALL');
    setSortBy('NEWEST');
  };

  const filteredComplaints = complaints.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
                          c.description.toLowerCase().includes(search.toLowerCase()) ||
                          (c.categoryName || '').toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchesCategory = categoryFilter === 'ALL' || c.categoryId?.toString() === categoryFilter;
    const matchesPriority = priorityFilter === 'ALL' || c.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
  }).sort((a, b) => {
    if (sortBy === 'OLD_FIRST') {
      return new Date(a.createdAt) - new Date(b.createdAt);
    }
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const activeAdvancedCount = (categoryFilter !== 'ALL' ? 1 : 0) + (priorityFilter !== 'ALL' ? 1 : 0) + (sortBy !== 'NEWEST' ? 1 : 0);

  const totalPages = Math.ceil(filteredComplaints.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedComplaints = filteredComplaints.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const totalCount = complaints.length;
  const pendingCount = complaints.filter(c => c.status === 'PENDING' || c.status === 'ASSIGNED').length;
  const inProgressCount = complaints.filter(c => c.status === 'IN_PROGRESS' || c.status === 'PENDING_APPROVAL').length;
  const resolvedCount = complaints.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED').length;
  const rejectedCount = complaints.filter(c => c.status === 'REJECTED').length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      <Navbar onOpenNewComplaint={() => setIsModalOpen(true)} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              My Complaints & Issues
            </h1>
            <p className="text-slate-500 text-xs font-medium mt-1">
              Track real-time resolution progress and submit new campus tickets
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsRoleModalOpen(true)}
              className="btn-modern-secondary py-2.5 px-4 text-xs font-bold border-purple-200 text-purple-700 bg-purple-50 hover:bg-purple-100"
            >
              <UserCheck className="w-4 h-4 text-purple-600" />
              <span>Request Role Upgrade</span>
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-modern-primary py-2.5 px-5"
            >
              <PlusCircle className="w-5 h-5 text-white" />
              <span>Lodge New Complaint</span>
            </button>
          </div>
        </div>

        {/* 5-Column Stats Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 mb-8">
          
          <div
            onClick={() => setStatusFilter('ALL')}
            className={`card-modern card-modern-hover p-4 cursor-pointer ${
              statusFilter === 'ALL' ? 'ring-2 ring-brand-500 border-brand-500 bg-brand-50/50' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500">Total Logged</span>
              <div className="w-8 h-8 rounded-lg bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-600">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900">{totalCount}</div>
          </div>

          <div
            onClick={() => setStatusFilter('PENDING')}
            className={`card-modern card-modern-hover p-4 cursor-pointer ${
              statusFilter === 'PENDING' ? 'ring-2 ring-amber-500 border-amber-500 bg-amber-50/50' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-amber-800">Pending Review</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-amber-800">{pendingCount}</div>
          </div>

          <div
            onClick={() => setStatusFilter('IN_PROGRESS')}
            className={`card-modern card-modern-hover p-4 cursor-pointer ${
              statusFilter === 'IN_PROGRESS' ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50/50' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-blue-800">In Progress</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                <AlertCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-blue-800">{inProgressCount}</div>
          </div>

          <div
            onClick={() => setStatusFilter('RESOLVED')}
            className={`card-modern card-modern-hover p-4 cursor-pointer ${
              statusFilter === 'RESOLVED' ? 'ring-2 ring-emerald-500 border-emerald-500 bg-emerald-50/50' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-800">Resolved</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                <CheckCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-emerald-800">{resolvedCount}</div>
          </div>

          <div
            onClick={() => setStatusFilter('REJECTED')}
            className={`card-modern card-modern-hover p-4 cursor-pointer ${
              statusFilter === 'REJECTED' ? 'ring-2 ring-red-500 border-red-500 bg-red-50/50' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-red-800">Rejected</span>
              <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
                <XCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-red-800">{rejectedCount}</div>
          </div>

        </div>

        {/* Search & Filter Controls Card */}
        <div className="card-modern p-4 rounded-xl mb-6 bg-white border border-slate-200 shadow-sm">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search tickets by title, details or category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-modern pl-10 pr-9 text-xs"
              />
              {search ? (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700"
                  title="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : (
                <span className="absolute right-3 top-2.5 text-[10px] font-bold text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded uppercase border border-brand-200">
                  LIVE
                </span>
              )}
            </div>

            {/* Filter Tabs & Funnel Toggle */}
            <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`btn-modern-secondary py-1.5 px-3 text-xs ${
                  showAdvancedFilters || activeAdvancedCount > 0 ? 'bg-brand-50 border-brand-200 text-brand-700' : ''
                }`}
                title="Toggle Advanced Filters"
              >
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                <span>Filters</span>
                {activeAdvancedCount > 0 && (
                  <span className="ml-1 bg-brand-600 text-white px-1.5 py-0.2 text-[10px] font-bold rounded-full">
                    {activeAdvancedCount}
                  </span>
                )}
              </button>

              {/* Status Tabs */}
              {['ALL', 'PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    statusFilter === st
                      ? 'bg-brand-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Expanded Advanced Filters Panel */}
          {showAdvancedFilters && (
            <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="label-modern">Filter by Category</label>
                <CustomSelect
                  value={categoryFilter}
                  onChange={(val) => setCategoryFilter(val)}
                  size="sm"
                  options={[
                    { value: 'ALL', label: 'All Categories' },
                    ...categories.map((cat) => ({ value: cat.id.toString(), label: cat.name }))
                  ]}
                />
              </div>

              <div>
                <label className="label-modern">Filter by Priority</label>
                <CustomSelect
                  value={priorityFilter}
                  onChange={(val) => setPriorityFilter(val)}
                  size="sm"
                  options={[
                    { value: 'ALL', label: 'All Priorities' },
                    { value: 'URGENT', label: 'URGENT' },
                    { value: 'HIGH', label: 'HIGH' },
                    { value: 'MEDIUM', label: 'MEDIUM' },
                    { value: 'LOW', label: 'LOW' },
                  ]}
                />
              </div>

              <div>
                <label className="label-modern">Sort Order</label>
                <div className="flex items-center space-x-2">
                  <div className="flex-1">
                    <CustomSelect
                      value={sortBy}
                      onChange={(val) => setSortBy(val)}
                      size="sm"
                      options={[
                        { value: 'NEWEST', label: 'Newest First' },
                        { value: 'OLD_FIRST', label: 'Oldest First' },
                      ]}
                    />
                  </div>

                  {(search || statusFilter !== 'ALL' || categoryFilter !== 'ALL' || priorityFilter !== 'ALL') && (
                    <button
                      onClick={resetAllFilters}
                      className="btn-modern-secondary p-2 text-xs border-red-200 text-red-600 hover:bg-red-50"
                      title="Reset All Filters"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Results Summary Bar */}
          <div className="mt-3 text-[11px] font-medium text-slate-500 flex items-center justify-between pt-2 border-t border-slate-200">
            <span>
              Showing <strong className="text-slate-900">{filteredComplaints.length}</strong> of <strong className="text-slate-900">{totalCount}</strong> total complaints
            </span>
            {(search || statusFilter !== 'ALL' || categoryFilter !== 'ALL' || priorityFilter !== 'ALL') && (
              <button
                onClick={resetAllFilters}
                className="text-brand-600 hover:text-brand-700 underline font-semibold"
              >
                Clear all active filters
              </button>
            )}
          </div>
        </div>

        {/* Complaints Grid / Skeleton / Empty State */}
        {loading ? (
          /* Skeleton Loader */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((sk) => (
              <div key={sk} className="bg-white p-5 border border-slate-200 rounded-xl animate-pulse space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="h-5 w-24 bg-slate-200 rounded-full"></div>
                  <div className="h-5 w-20 bg-slate-200 rounded-full"></div>
                </div>
                <div className="h-5 w-3/4 bg-slate-200 rounded"></div>
                <div className="space-y-2">
                  <div className="h-3 w-full bg-slate-200 rounded"></div>
                  <div className="h-3 w-5/6 bg-slate-200 rounded"></div>
                </div>
                <div className="h-9 w-full bg-slate-100 rounded-xl pt-2"></div>
              </div>
            ))}
          </div>
        ) : filteredComplaints.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-xl p-12 text-center border border-slate-200 shadow-sm max-w-xl mx-auto my-8">
            <div className="w-14 h-14 rounded-2xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-600 mx-auto mb-3">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              No Complaints Found
            </h3>
            <p className="text-slate-500 text-xs mt-1.5 leading-relaxed font-medium">
              We couldn't find any complaints under status view <strong className="text-brand-700">"{statusFilter.replace('_', ' ')}"</strong> or matching your active search query.
            </p>
            <div className="flex items-center justify-center space-x-3 mt-6">
              <button
                onClick={resetAllFilters}
                className="btn-modern-secondary text-xs"
              >
                Reset All Filters
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                className="btn-modern-primary text-xs"
              >
                Lodge New Complaint
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Complaints Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedComplaints.map((c) => {
                const isExpanded = expandedCards[c.id];
                return (
                  <div
                    key={c.id}
                    className="card-modern card-modern-hover p-5 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-xs font-bold text-brand-700 bg-brand-50 border border-brand-200 px-2.5 py-0.5 rounded-full truncate">
                          {c.categoryName}
                        </span>
                        <StatusBadge status={c.status} />
                      </div>

                      <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-600 transition line-clamp-1 mb-2">
                        {c.title}
                      </h3>

                      <p className={`text-slate-600 text-xs leading-relaxed mb-1 ${isExpanded ? '' : 'line-clamp-3'}`}>
                        {c.description}
                      </p>

                      {c.description.length > 120 && (
                        <button
                          onClick={() => toggleExpandCard(c.id)}
                          className="text-[11px] font-semibold text-brand-600 hover:text-brand-700 flex items-center mb-3"
                        >
                          {isExpanded ? (
                            <><span>Read less</span> <ChevronUp className="w-3 h-3 ml-0.5" /></>
                          ) : (
                            <><span>Read more</span> <ChevronDown className="w-3 h-3 ml-0.5" /></>
                          )}
                        </button>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200">
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                        <div className="flex items-center space-x-2">
                          <PriorityBadge priority={c.priority} />
                          {c.anonymous && (
                            <span className="flex items-center text-purple-700 text-[11px] font-semibold" title="Anonymous submission">
                              <ShieldOff className="w-3.5 h-3.5 mr-0.5 text-purple-600" /> Anon
                            </span>
                          )}
                        </div>

                        {c.attachments && c.attachments.length > 0 && (
                          <span className="flex items-center text-cyan-800 text-xs font-semibold">
                            <Paperclip className="w-3.5 h-3.5 mr-1 text-cyan-600" /> {c.attachments.length} file(s)
                          </span>
                        )}
                      </div>

                      <Link
                        to={`/complaint/${c.id}`}
                        className="w-full btn-modern-secondary text-slate-800 justify-between py-2 text-xs font-bold border-slate-300"
                      >
                        <span>View Timeline & Details</span>
                        <ArrowRight className="w-3.5 h-3.5 text-brand-600 group-hover:translate-x-0.5 transition duration-150" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-4 text-xs">
                <span className="text-slate-500">
                  Showing <strong className="text-slate-900">{startIndex + 1}</strong> to <strong className="text-slate-900">{Math.min(startIndex + ITEMS_PER_PAGE, filteredComplaints.length)}</strong> of <strong className="text-slate-900">{filteredComplaints.length}</strong> items
                </span>

                <div className="flex items-center space-x-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    className="btn-modern-secondary py-1 px-3"
                  >
                    Previous
                  </button>

                  <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-slate-800 font-bold">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    className="btn-modern-secondary py-1 px-3"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Lodge New Complaint Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 border border-slate-200 shadow-2xl relative my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                <PlusCircle className="w-5 h-5 text-brand-600" />
                <span>Lodge New Complaint</span>
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateComplaint} className="space-y-4 mt-4">
              <div>
                <label className="label-modern">Issue Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Broken water heater in Block B 3rd floor"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="input-modern"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-modern">Category *</label>
                  <CustomSelect
                    value={newCategoryId}
                    onChange={(val) => setNewCategoryId(val)}
                    placeholder="Select Category"
                    options={categories.map((cat) => ({
                      value: cat.id,
                      label: cat.name
                    }))}
                  />
                </div>

                <div>
                  <label className="label-modern">Priority Level</label>
                  <CustomSelect
                    value={newPriority}
                    onChange={(val) => setNewPriority(val)}
                    options={[
                      { value: 'LOW', label: 'Low (General)' },
                      { value: 'MEDIUM', label: 'Medium (Standard)' },
                      { value: 'HIGH', label: 'High (Urgent Attention)' },
                      { value: 'URGENT', label: 'Urgent (Safety/Emergency)' },
                    ]}
                  />
                </div>
              </div>

              <div>
                <label className="label-modern">Detailed Description *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe the exact location, situation, and details..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="input-modern"
                />
              </div>

              <div className="flex items-center space-x-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <input
                  type="checkbox"
                  id="anonCheck"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 bg-white border-slate-300 cursor-pointer"
                />
                <label htmlFor="anonCheck" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Submit anonymously <span className="text-slate-500 font-normal">(Your name will be hidden from public logs)</span>
                </label>
              </div>

              <div>
                <label className="label-modern">
                  Upload Photo Evidence / Document <span className="text-slate-500 font-normal">(Optional - JPG, PNG, PDF)</span>
                </label>
                <div className="border-2 border-dashed border-slate-300 hover:border-brand-500 rounded-xl p-4 text-center cursor-pointer transition bg-slate-50">
                  <input
                    type="file"
                    multiple
                    accept="image/*,.pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="fileUpload"
                  />
                  <label htmlFor="fileUpload" className="cursor-pointer flex flex-col items-center">
                    <ImageIcon className="w-8 h-8 text-brand-600 mb-1" />
                    <span className="text-xs font-bold text-slate-700">Click to choose files or drag here</span>
                    <span className="text-[11px] text-slate-500">Attach photos of broken equipment, ragging evidence, etc.</span>
                  </label>
                </div>

                {previews.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {previews.map((p, idx) => (
                      <div key={idx} className="relative group bg-white border border-slate-200 p-2 rounded-lg flex items-center space-x-2 shadow-xs">
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
                  onClick={() => setIsModalOpen(false)}
                  className="btn-modern-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-modern-primary text-xs"
                >
                  {submitting ? 'Submitting Ticket...' : 'Submit Complaint'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Role Upgrade Request Modal */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 border border-slate-200/90 shadow-2xl relative transition-all duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-3.5">
                <div className="w-11 h-11 rounded-2xl bg-purple-100/90 border border-purple-200 flex items-center justify-center text-purple-700 shadow-xs">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Request Role Upgrade</h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Elevate account privileges for campus administration</p>
                </div>
              </div>
              <button
                onClick={() => setIsRoleModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {roleRequestSuccess ? (
              <div className="py-10 text-center">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto mb-3.5">
                  <CheckCircle className="w-9 h-9 animate-bounce" />
                </div>
                <h3 className="text-lg font-extrabold text-slate-900">Request Sent to Admin!</h3>
                <p className="text-xs text-slate-500 mt-1.5 max-w-xs mx-auto">
                  Your upgrade request has been submitted. An administrator will review your credentials shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleRequestRoleSubmit} className="space-y-5 mt-5">
                {/* Select Target Role via Interactive Cards */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                    Select Desired Role *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Technician Card */}
                    <button
                      type="button"
                      onClick={() => setTargetRole('TECHNICIAN')}
                      className={`p-3.5 rounded-xl border text-left transition-all duration-150 relative flex flex-col justify-between cursor-pointer ${
                        targetRole === 'TECHNICIAN'
                          ? 'border-purple-600 bg-purple-50/70 shadow-xs ring-2 ring-purple-600/20'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            targetRole === 'TECHNICIAN' ? 'bg-purple-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600'
                          }`}>
                            <Wrench className="w-4 h-4" />
                          </div>
                          {targetRole === 'TECHNICIAN' && (
                            <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center">
                              <Check className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-bold text-slate-900">Field Technician</div>
                        <p className="text-[11px] text-slate-500 leading-tight mt-1">
                          Campus repairs, electrical, plumbing & maintenance tickets
                        </p>
                      </div>
                    </button>

                    {/* Staff Card */}
                    <button
                      type="button"
                      onClick={() => setTargetRole('STAFF')}
                      className={`p-3.5 rounded-xl border text-left transition-all duration-150 relative flex flex-col justify-between cursor-pointer ${
                        targetRole === 'STAFF'
                          ? 'border-purple-600 bg-purple-50/70 shadow-xs ring-2 ring-purple-600/20'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            targetRole === 'STAFF' ? 'bg-purple-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600'
                          }`}>
                            <Shield className="w-4 h-4" />
                          </div>
                          {targetRole === 'STAFF' && (
                            <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center">
                              <Check className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-bold text-slate-900">Warden / Staff</div>
                        <p className="text-[11px] text-slate-500 leading-tight mt-1">
                          Hostel warden, department faculty & ticket review staff
                        </p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Reason & Details */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Reason & Credentials *
                    </label>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {roleReason.length} characters
                    </span>
                  </div>
                  <textarea
                    required
                    rows={3}
                    placeholder="Mention your department, staff/employee ID, or justification for elevated privileges..."
                    value={roleReason}
                    onChange={(e) => setRoleReason(e.target.value)}
                    className="w-full bg-slate-50/60 hover:bg-white focus:bg-white border border-slate-300 focus:border-purple-600 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600/20 transition duration-150 resize-none shadow-xs"
                  />
                </div>

                {/* Helpful note */}
                <div className="bg-purple-50/50 border border-purple-100 rounded-xl p-3 flex items-start space-x-2.5">
                  <div className="w-4 h-4 rounded-full bg-purple-200 text-purple-800 flex items-center justify-center text-[10px] font-bold mt-0.5 flex-shrink-0">
                    i
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Requests are reviewed by administrators. You will be able to manage assigned tickets immediately upon approval.
                  </p>
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsRoleModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition duration-150 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={roleSubmitting || !roleReason.trim()}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 active:scale-[0.98] text-white text-xs font-bold shadow-md shadow-purple-600/25 disabled:opacity-50 transition duration-150 flex items-center space-x-2 cursor-pointer"
                  >
                    {roleSubmitting ? (
                      <span>Submitting...</span>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Submit Upgrade Request</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
