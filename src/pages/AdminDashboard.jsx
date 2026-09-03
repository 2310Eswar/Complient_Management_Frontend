import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import LightboxModal from '../components/LightboxModal';
import CustomSelect from '../components/CustomSelect';
import { complaintAPI, categoryAPI, analyticsAPI, updateAPI, userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Filter, Search, UserPlus, RefreshCw, Layers, CheckCircle2, Clock, XCircle, AlertCircle, Eye, Plus, ShieldOff, Hourglass, Check, X, Wrench, Paperclip, ChevronRight, Users, UserCheck, UserX, Shield, UserMinus, Power, Ban, CheckCircle, GraduationCap } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [categories, setCategories] = useState([]);
  const [staffUsers, setStaffUsers] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL_TICKETS'); // ALL_TICKETS | PENDING_APPROVALS | USERS_MANAGEMENT

  // Filters & Search
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL'); // ALL | REQUESTS | STAFF_TECH | STUDENTS | DEACTIVATED
  const [togglingUserId, setTogglingUserId] = useState(null);

  // Interactive Row Management Modal
  const [manageModalComplaint, setManageModalComplaint] = useState(null);

  // Modals
  const [statusModalComplaint, setStatusModalComplaint] = useState(null);
  const [newStatus, setNewStatus] = useState('IN_PROGRESS');
  const [statusComment, setStatusComment] = useState('');

  const [assignModalComplaint, setAssignModalComplaint] = useState(null);
  const [selectedTechnicianId, setSelectedTechnicianId] = useState('');

  const [reviewModalUpdate, setReviewModalUpdate] = useState(null);
  const [reviewAction, setReviewAction] = useState('APPROVE'); // APPROVE | REJECT
  const [reviewComment, setReviewComment] = useState('');

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');

  const [activeAttachment, setActiveAttachment] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resComplaints, resCategories, resSummary, resPending, resUsers] = await Promise.allSettled([
        complaintAPI.getAllComplaints(),
        categoryAPI.getAll(),
        analyticsAPI.getSummary(),
        updateAPI.getPendingApprovals(),
        userAPI.getAllUsers()
      ]);
      if (resComplaints.status === 'fulfilled') setComplaints(resComplaints.value.data || []);
      if (resCategories.status === 'fulfilled') setCategories(resCategories.value.data || []);
      if (resSummary.status === 'fulfilled') setSummary(resSummary.value.data || null);
      if (resPending.status === 'fulfilled') setPendingApprovals(resPending.value.data || []);
      if (resUsers.status === 'fulfilled') setAllUsers(resUsers.value.data || []);

      try {
        const resStaff = await analyticsAPI.getStaffUsers();
        setStaffUsers(resStaff.data || []);
        if (resStaff.data && resStaff.data.length > 0) {
          setSelectedTechnicianId(resStaff.data[0].id.toString());
        }
      } catch (err) {
        console.error('Failed to load staff users', err);
      }
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!statusModalComplaint && !manageModalComplaint) return;
    const target = statusModalComplaint || manageModalComplaint;
    try {
      await complaintAPI.updateStatus(target.id, {
        status: newStatus,
        comment: statusComment
      });
      setStatusModalComplaint(null);
      setManageModalComplaint(null);
      setStatusComment('');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating status');
    }
  };

  const handleAssignTechnician = async (e) => {
    e.preventDefault();
    if ((!assignModalComplaint && !manageModalComplaint) || !selectedTechnicianId) return;
    const target = assignModalComplaint || manageModalComplaint;
    try {
      await complaintAPI.assignTechnician(target.id, {
        technicianId: parseInt(selectedTechnicianId)
      });
      setAssignModalComplaint(null);
      setManageModalComplaint(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error assigning technician');
    }
  };

  const handleReviewUpdate = async (e) => {
    e.preventDefault();
    if (!reviewModalUpdate) return;
    try {
      if (reviewAction === 'APPROVE') {
        await updateAPI.approve(reviewModalUpdate.id, { reviewComment });
      } else {
        await updateAPI.reject(reviewModalUpdate.id, { reviewComment });
      }
      setReviewModalUpdate(null);
      setReviewComment('');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error processing review decision');
    }
  };

  const handleUserRoleChange = async (userId, targetRole, action) => {
    try {
      await userAPI.updateUserRole(userId, { newRole: targetRole, requestAction: action });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating user role');
    }
  };

  const handleToggleUserStatus = async (targetUser) => {
    if (targetUser.email === user?.email) {
      alert("You cannot deactivate your own administrator account.");
      return;
    }
    const isActivating = targetUser.active === false;
    const actionName = isActivating ? 'activate' : 'deactivate';
    if (!window.confirm(`Are you sure you want to ${actionName} account for "${targetUser.name}" (${targetUser.email})?`)) {
      return;
    }
    setTogglingUserId(targetUser.id);
    try {
      await userAPI.toggleUserStatus(targetUser.id);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating user status');
    } finally {
      setTogglingUserId(null);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!catName) return;
    try {
      await categoryAPI.create({ name: catName, description: catDesc });
      setCatName('');
      setCatDesc('');
      setIsCategoryModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating category');
    }
  };

  const filteredComplaints = complaints.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
                          c.description.toLowerCase().includes(search.toLowerCase()) ||
                          (c.createdBy?.name || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = selectedStatus === 'ALL' || c.status === selectedStatus;
    const matchesCategory = selectedCategory === 'ALL' || c.categoryId?.toString() === selectedCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const filteredUsers = allUsers.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
                          u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
                          (u.department || '').toLowerCase().includes(userSearch.toLowerCase());
    if (!matchesSearch) return false;

    if (userRoleFilter === 'REQUESTS') return u.roleRequestStatus === 'PENDING';
    if (userRoleFilter === 'STAFF_TECH') return u.role === 'STAFF' || u.role === 'TECHNICIAN';
    if (userRoleFilter === 'STUDENTS') return u.role === 'STUDENT';
    if (userRoleFilter === 'DEACTIVATED') return u.active === false;
    return true;
  });

  const pendingRoleRequestsCount = allUsers.filter(u => u.roleRequestStatus === 'PENDING').length;
  const staffTechCount = allUsers.filter(u => u.role === 'STAFF' || u.role === 'TECHNICIAN').length;
  const studentUsersCount = allUsers.filter(u => u.role === 'STUDENT').length;
  const deactivatedUsersCount = allUsers.filter(u => u.active === false).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {user.role} Control Center
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Campus Resolution Dashboard
            </h1>
          </div>

          {user.role === 'ADMIN' && (
            <button
              onClick={() => setIsCategoryModalOpen(true)}
              className="btn-modern-secondary text-xs"
            >
              <Plus className="w-4 h-4 text-brand-600" />
              <span>Add Category</span>
            </button>
          )}
        </div>

        {/* Analytics Metric Cards */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="card-modern p-4">
              <div className="text-xs text-slate-500 font-bold mb-1">Total Received</div>
              <div className="text-2xl font-black text-slate-900">{summary.totalComplaints}</div>
            </div>

            <div className="card-modern p-4">
              <div className="text-xs text-amber-700 font-bold mb-1">Pending</div>
              <div className="text-2xl font-black text-amber-700">{summary.pendingComplaints}</div>
            </div>

            <div
              onClick={() => setActiveTab('PENDING_APPROVALS')}
              className="card-modern p-4 border-cyan-200 bg-cyan-50/50 cursor-pointer hover:border-cyan-300 transition"
            >
              <div className="text-xs text-cyan-800 font-bold mb-1 flex items-center justify-between">
                <span>Pending Approvals</span>
                <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
              </div>
              <div className="text-2xl font-black text-cyan-800">{pendingApprovals.length}</div>
            </div>

            <div className="card-modern p-4">
              <div className="text-xs text-emerald-700 font-bold mb-1">Resolved</div>
              <div className="text-2xl font-black text-emerald-700">{summary.resolvedComplaints}</div>
            </div>

            <div
              onClick={() => setActiveTab('USERS_MANAGEMENT')}
              className="card-modern p-4 border-purple-200 bg-purple-50/50 cursor-pointer hover:border-purple-300 transition"
            >
              <div className="text-xs text-purple-800 font-bold mb-1 flex items-center justify-between">
                <span>Registered Users</span>
                {pendingRoleRequestsCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-purple-600 animate-ping"></span>
                )}
              </div>
              <div className="text-2xl font-black text-purple-800">{allUsers.length}</div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-3 mb-6 border-b border-slate-200 pb-3">
          <button
            onClick={() => setActiveTab('ALL_TICKETS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
              activeTab === 'ALL_TICKETS'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Master Complaints Table</span>
          </button>

          <button
            onClick={() => setActiveTab('PENDING_APPROVALS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
              activeTab === 'PENDING_APPROVALS'
                ? 'bg-cyan-700 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Hourglass className="w-4 h-4" />
            <span>Technician Approval Queue</span>
            {pendingApprovals.length > 0 && (
              <span className="ml-1 bg-cyan-100 text-cyan-800 font-bold px-1.5 py-0.5 rounded-full text-[10px]">
                {pendingApprovals.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('USERS_MANAGEMENT')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
              activeTab === 'USERS_MANAGEMENT'
                ? 'bg-purple-700 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Users & Role Requests</span>
            {pendingRoleRequestsCount > 0 && (
              <span className="ml-1 bg-purple-200 text-purple-900 font-extrabold px-1.5 py-0.5 rounded-full text-[10px]">
                {pendingRoleRequestsCount} Request(s)
              </span>
            )}
          </button>
        </div>

        {activeTab === 'ALL_TICKETS' ? (
          <>
            {/* Search & Filters */}
            <div className="card-modern p-4 rounded-xl mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search complaints or student name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input-modern pl-9 text-xs"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <CustomSelect
                  value={selectedStatus}
                  onChange={(val) => setSelectedStatus(val)}
                  size="sm"
                  options={[
                    { value: 'ALL', label: 'All Statuses' },
                    { value: 'PENDING', label: 'Pending' },
                    { value: 'ASSIGNED', label: 'Assigned' },
                    { value: 'IN_PROGRESS', label: 'In Progress' },
                    { value: 'PENDING_APPROVAL', label: 'Pending Approval' },
                    { value: 'RESOLVED', label: 'Resolved' },
                    { value: 'CLOSED', label: 'Closed' },
                    { value: 'REJECTED', label: 'Rejected' },
                  ]}
                />

                <CustomSelect
                  value={selectedCategory}
                  onChange={(val) => setSelectedCategory(val)}
                  size="sm"
                  options={[
                    { value: 'ALL', label: 'All Categories' },
                    ...categories.map((cat) => ({ value: cat.id.toString(), label: cat.name }))
                  ]}
                />
              </div>
            </div>

            {/* Master Complaints Table - NO HORIZONTAL SCROLL FIT */}
            <div className="card-modern rounded-xl overflow-hidden shadow-card">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase font-bold border-b border-slate-200 tracking-wider">
                  <tr>
                    <th className="px-4 py-3.5">Complaint & Student</th>
                    <th className="px-4 py-3.5">Priority</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5">Assigned Technician</th>
                    <th className="px-4 py-3.5 text-right">Quick Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200 bg-white">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="text-center py-12 text-slate-500">
                        <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                        Loading complaints records...
                      </td>
                    </tr>
                  ) : filteredComplaints.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-12 text-slate-500 font-medium">
                        No complaints match the selected parameters.
                      </td>
                    </tr>
                  ) : (
                    filteredComplaints.map((c) => (
                      <tr
                        key={c.id}
                        onClick={() => {
                          setManageModalComplaint(c);
                          if (staffUsers.length > 0) {
                            setSelectedTechnicianId(c.assignedTechnician?.id?.toString() || staffUsers[0].id.toString());
                          }
                          setNewStatus(c.status);
                        }}
                        className="hover:bg-indigo-50/40 transition duration-150 cursor-pointer border-b border-slate-100 group"
                      >
                        <td className="px-4 py-3.5 align-middle">
                          <div className="flex items-center space-x-2">
                            <span className="bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded text-[11px] border border-slate-200">
                              {c.categoryName}
                            </span>
                            <span className="text-[11px] font-medium text-slate-400">#{c.id}</span>
                          </div>
                          <div className="font-extrabold text-slate-900 text-sm mt-0.5 group-hover:text-brand-600 transition">
                            {c.title}
                          </div>
                          <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                            By {c.anonymous ? 'Anonymous' : (c.createdBy?.name || 'Student')} ({new Date(c.createdAt).toLocaleDateString()})
                          </div>
                        </td>

                        <td className="px-4 py-3.5 align-middle">
                          <PriorityBadge priority={c.priority} />
                        </td>

                        <td className="px-4 py-3.5 align-middle">
                          <StatusBadge status={c.status} />
                        </td>

                        <td className="px-4 py-3.5 align-middle">
                          {c.assignedTechnician ? (
                            <div>
                              <div className="text-amber-900 font-bold text-xs">{c.assignedTechnician.name}</div>
                              <div className="text-[10px] text-slate-500 font-medium">{c.assignedTechnician.department || 'Field Tech'}</div>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic text-xs font-medium">Unassigned</span>
                          )}
                        </td>

                        <td className="px-4 py-3.5 align-middle text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="inline-flex items-center justify-end space-x-1.5">
                            <button
                              onClick={() => {
                                setAssignModalComplaint(c);
                                if (staffUsers.length > 0) {
                                  setSelectedTechnicianId(c.assignedTechnician?.id?.toString() || staffUsers[0].id.toString());
                                }
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs shadow-sm flex items-center space-x-1"
                              title="Assign Field Technician"
                            >
                              <UserPlus className="w-3.5 h-3.5 text-amber-700" />
                              <span>Assign</span>
                            </button>

                            <button
                              onClick={() => {
                                setStatusModalComplaint(c);
                                setNewStatus(c.status);
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 font-bold text-xs shadow-sm flex items-center space-x-1"
                              title="Update Status"
                            >
                              <RefreshCw className="w-3.5 h-3.5 text-brand-600" />
                              <span>Status</span>
                            </button>

                            <Link
                              to={`/complaint/${c.id}`}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition shadow-sm inline-flex items-center justify-center"
                              title="View Details"
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-600" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : activeTab === 'PENDING_APPROVALS' ? (
          /* Technician Approval Review Queue Tab */
          <div className="space-y-6">
            {pendingApprovals.length === 0 ? (
              <div className="card-modern rounded-xl p-12 text-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-900">Approval Queue is Clear!</h3>
                <p className="text-slate-500 text-xs mt-1">There are no technician progress updates awaiting approval.</p>
              </div>
            ) : (
              pendingApprovals.map((up) => (
                <div key={up.id} className="card-modern rounded-xl p-6 border-cyan-200 bg-cyan-50/30 shadow-card">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-xs font-bold text-cyan-800 bg-cyan-100 border border-cyan-200 px-2.5 py-0.5 rounded-full uppercase">
                          Awaiting Approval
                        </span>
                        <span className="text-xs text-slate-500">
                          Complaint #{up.complaintId}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">{up.complaintTitle}</h3>
                    </div>

                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => {
                          setReviewModalUpdate(up);
                          setReviewAction('APPROVE');
                          setReviewComment('Work verified and approved.');
                        }}
                        className="btn-modern-primary bg-emerald-600 hover:bg-emerald-700 py-2 text-xs"
                      >
                        <Check className="w-4 h-4" />
                        <span>Approve Update</span>
                      </button>

                      <button
                        onClick={() => {
                          setReviewModalUpdate(up);
                          setReviewAction('REJECT');
                          setReviewComment('');
                        }}
                        className="btn-modern-secondary text-red-600 hover:bg-red-50 border-red-200 py-2 text-xs"
                      >
                        <X className="w-4 h-4" />
                        <span>Reject / Request Redo</span>
                      </button>
                    </div>
                  </div>

                  <div className="pt-4">
                    <div className="flex items-center space-x-2 text-xs text-amber-800 font-bold mb-2">
                      <Wrench className="w-4 h-4 text-amber-600" />
                      <span>Submitted by Field Technician: {up.submittedBy?.name} ({new Date(up.createdAt).toLocaleString()})</span>
                    </div>

                    <p className="text-sm text-slate-800 bg-white p-4 rounded-xl border border-slate-200 leading-relaxed mb-4">
                      "{up.updateText}"
                    </p>

                    {up.attachments && up.attachments.length > 0 && (
                      <div>
                        <span className="text-xs font-bold text-slate-700 mb-2 block">Technician Photo Evidence:</span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {up.attachments.map((att) => {
                            const fileUrl = `http://localhost:8082${att.fileUrl}`;
                            return (
                              <div
                                key={att.id}
                                onClick={() => setActiveAttachment(att)}
                                className="group cursor-pointer rounded-xl overflow-hidden border border-slate-200 h-24 relative bg-slate-100 hover:opacity-90"
                              >
                                <img src={fileUrl} alt="evidence" className="w-full h-full object-cover group-hover:scale-105 transition duration-200" />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          /* Users & Role Management Tab */
          <div className="space-y-5">
            {/* Header Controls: Filters & Search */}
            <div className="card-modern p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                {/* Search Bar */}
                <div className="relative w-full md:w-96">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="Search by name, email, department..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-purple-600 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition duration-150"
                  />
                  {userSearch && (
                    <button
                      onClick={() => setUserSearch('')}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Counter */}
                <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 self-end md:self-auto">
                  <span>Showing <strong className="text-slate-900">{filteredUsers.length}</strong> of <strong className="text-slate-900">{allUsers.length}</strong> registered users</span>
                </div>
              </div>

              {/* Filter Tabs Row */}
              <div className="flex items-center space-x-2 overflow-x-auto pb-1 border-t border-slate-100 pt-3 text-xs">
                <button
                  onClick={() => setUserRoleFilter('ALL')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                    userRoleFilter === 'ALL'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 border border-slate-200/80'
                  }`}
                >
                  <span>All Users</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${userRoleFilter === 'ALL' ? 'bg-purple-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
                    {allUsers.length}
                  </span>
                </button>

                <button
                  onClick={() => setUserRoleFilter('REQUESTS')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                    userRoleFilter === 'REQUESTS'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 border border-slate-200/80'
                  }`}
                >
                  <Hourglass className="w-3.5 h-3.5" />
                  <span>Pending Upgrade Requests</span>
                  {pendingRoleRequestsCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-200 text-amber-900 font-extrabold animate-pulse">
                      {pendingRoleRequestsCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setUserRoleFilter('STAFF_TECH')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                    userRoleFilter === 'STAFF_TECH'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 border border-slate-200/80'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Staff & Technicians</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${userRoleFilter === 'STAFF_TECH' ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
                    {staffTechCount}
                  </span>
                </button>

                <button
                  onClick={() => setUserRoleFilter('STUDENTS')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                    userRoleFilter === 'STUDENTS'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 border border-slate-200/80'
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Students</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${userRoleFilter === 'STUDENTS' ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
                    {studentUsersCount}
                  </span>
                </button>

                <button
                  onClick={() => setUserRoleFilter('DEACTIVATED')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                    userRoleFilter === 'DEACTIVATED'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 border border-slate-200/80'
                  }`}
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span>Deactivated</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${deactivatedUsersCount > 0 ? 'bg-rose-200 text-rose-900 font-extrabold' : 'bg-slate-200 text-slate-700'}`}>
                    {deactivatedUsersCount}
                  </span>
                </button>
              </div>
            </div>

            {/* Modern Table Container */}
            <div className="card-modern rounded-2xl overflow-hidden shadow-sm border border-slate-200 bg-white">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 text-slate-600 uppercase font-extrabold text-[11px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-4">User Profile</th>
                      <th className="px-5 py-4">Account Status</th>
                      <th className="px-5 py-4">System Role</th>
                      <th className="px-5 py-4">Role Request</th>
                      <th className="px-5 py-4 text-right">Role Assignment</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 bg-white">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center py-16 text-slate-500">
                          <div className="max-w-xs mx-auto text-center space-y-2">
                            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
                              <Users className="w-6 h-6" />
                            </div>
                            <div className="font-bold text-sm text-slate-800">No users found</div>
                            <p className="text-xs text-slate-500">Try adjusting your active search query or filter tab.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => {
                        const isSelf = u.email === user?.email;
                        const isDeactivated = u.active === false;

                        // Avatar theme styling based on role
                        const avatarBg = isDeactivated
                          ? 'bg-slate-200 text-slate-500'
                          : u.role === 'ADMIN'
                          ? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-xs'
                          : u.role === 'STAFF'
                          ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-xs'
                          : u.role === 'TECHNICIAN'
                          ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-xs'
                          : 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xs';

                        return (
                          <tr
                            key={u.id}
                            className={`hover:bg-slate-50/70 transition-colors ${
                              isDeactivated ? 'bg-slate-50/40 opacity-75' : ''
                            }`}
                          >
                            {/* User Profile */}
                            <td className="px-5 py-4 align-middle">
                              <div className="flex items-center space-x-3.5">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-xs flex-shrink-0 ${avatarBg}`}>
                                  {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center space-x-2">
                                    <span className={`font-extrabold text-sm truncate ${isDeactivated ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                                      {u.name}
                                    </span>
                                    {isSelf && (
                                      <span className="bg-purple-100 text-purple-800 font-bold px-1.5 py-0.2 rounded-md text-[10px] border border-purple-200">
                                        You
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[11px] text-slate-500 truncate mt-0.5">{u.email}</div>
                                  {u.department && (
                                    <span className="inline-block mt-1 text-[10px] font-semibold text-slate-600 bg-slate-100 border border-slate-200/80 px-2 py-0.5 rounded-md">
                                      {u.department}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Account Status: Active / Deactivate Toggle */}
                            <td className="px-5 py-4 align-middle">
                              <div className="space-y-1.5">
                                <div>
                                  {!isDeactivated ? (
                                    <span className="inline-flex items-center text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
                                      Active
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5"></span>
                                      Deactivated
                                    </span>
                                  )}
                                </div>

                                <div>
                                  {isSelf ? (
                                    <span className="text-[10px] text-slate-400 italic">Protected</span>
                                  ) : (
                                    <button
                                      type="button"
                                      disabled={togglingUserId === u.id}
                                      onClick={() => handleToggleUserStatus(u)}
                                      className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all duration-150 inline-flex items-center space-x-1 cursor-pointer disabled:opacity-50 ${
                                        !isDeactivated
                                          ? 'border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300'
                                          : 'border-emerald-300 text-emerald-700 bg-emerald-50/80 hover:bg-emerald-100 shadow-xs'
                                      }`}
                                      title={!isDeactivated ? 'Deactivate user login access' : 'Reactivate user login access'}
                                    >
                                      {togglingUserId === u.id ? (
                                        <span>Updating...</span>
                                      ) : !isDeactivated ? (
                                        <>
                                          <Ban className="w-3 h-3" />
                                          <span>Deactivate</span>
                                        </>
                                      ) : (
                                        <>
                                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                                          <span>Activate</span>
                                        </>
                                      )}
                                    </button>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* System Role Badge */}
                            <td className="px-5 py-4 align-middle">
                              {u.role === 'ADMIN' ? (
                                <span className="inline-flex items-center space-x-1 bg-purple-50 text-purple-700 font-extrabold px-2.5 py-1 rounded-xl text-xs border border-purple-200">
                                  <Shield className="w-3.5 h-3.5 text-purple-600" />
                                  <span>ADMIN</span>
                                </span>
                              ) : u.role === 'STAFF' ? (
                                <span className="inline-flex items-center space-x-1 bg-blue-50 text-blue-700 font-bold px-2.5 py-1 rounded-xl text-xs border border-blue-200">
                                  <Users className="w-3.5 h-3.5 text-blue-600" />
                                  <span>STAFF</span>
                                </span>
                              ) : u.role === 'TECHNICIAN' ? (
                                <span className="inline-flex items-center space-x-1 bg-amber-50 text-amber-800 font-bold px-2.5 py-1 rounded-xl text-xs border border-amber-200">
                                  <Wrench className="w-3.5 h-3.5 text-amber-600" />
                                  <span>TECHNICIAN</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center space-x-1 bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-xl text-xs border border-emerald-200">
                                  <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>STUDENT</span>
                                </span>
                              )}
                            </td>

                            {/* Role Request Status */}
                            <td className="px-5 py-4 align-middle">
                              {u.roleRequestStatus === 'PENDING' ? (
                                <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1.5 max-w-xs">
                                  <div className="flex items-center justify-between text-xs font-extrabold text-amber-900">
                                    <span className="flex items-center">
                                      <Hourglass className="w-3.5 h-3.5 mr-1 text-amber-600 animate-spin" />
                                      Requesting {u.requestedRole}
                                    </span>
                                  </div>
                                  <div className="text-[11px] text-slate-600 italic bg-white/80 p-1.5 rounded-lg border border-amber-100 leading-snug">
                                    "{u.roleRequestReason || 'No reason specified'}"
                                  </div>
                                  <div className="flex items-center space-x-2 pt-1">
                                    <button
                                      type="button"
                                      onClick={() => handleUserRoleChange(u.id, u.requestedRole, 'APPROVE')}
                                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-xs flex items-center space-x-1 cursor-pointer"
                                      title="Approve Role Request"
                                    >
                                      <Check className="w-3 h-3" />
                                      <span>Approve</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleUserRoleChange(u.id, null, 'REJECT')}
                                      className="px-2 py-1 rounded-lg bg-white hover:bg-red-50 text-red-600 border border-red-200 font-bold text-[11px] transition cursor-pointer"
                                      title="Reject Role Request"
                                    >
                                      <X className="w-3 h-3" />
                                      <span>Reject</span>
                                    </button>
                                  </div>
                                </div>
                              ) : u.roleRequestStatus === 'APPROVED' ? (
                                <span className="inline-flex items-center text-emerald-700 font-bold text-xs bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                                  <UserCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Approved
                                </span>
                              ) : u.roleRequestStatus === 'REJECTED' ? (
                                <span className="inline-flex items-center text-red-700 font-bold text-xs bg-red-50 border border-red-200 px-2.5 py-1 rounded-lg">
                                  <UserX className="w-3.5 h-3.5 mr-1 text-red-600" /> Rejected
                                </span>
                              ) : (
                                <span className="text-slate-400 text-xs font-medium">—</span>
                              )}
                            </td>

                            {/* Direct Role Assignment Selector */}
                            <td className="px-5 py-4 align-middle text-right">
                              <CustomSelect
                                value={u.role}
                                onChange={(val) => handleUserRoleChange(u.id, val, 'DIRECT_CHANGE')}
                                align="right"
                                size="sm"
                                options={[
                                  { value: 'STUDENT', label: 'STUDENT', icon: <GraduationCap className="w-3.5 h-3.5 text-emerald-600" /> },
                                  { value: 'STAFF', label: 'STAFF', icon: <Users className="w-3.5 h-3.5 text-blue-600" /> },
                                  { value: 'TECHNICIAN', label: 'TECHNICIAN', icon: <Wrench className="w-3.5 h-3.5 text-amber-600" /> },
                                  { value: 'ADMIN', label: 'ADMIN', icon: <Shield className="w-3.5 h-3.5 text-purple-600" /> },
                                ]}
                              />
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Row Click Complaint Interactive Quick-Manage Modal */}
      {manageModalComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 border border-slate-200 shadow-2xl relative my-8">
            
            {/* Header with Title & Badges */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-200">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="bg-slate-100 text-slate-700 font-bold text-xs px-2.5 py-0.5 rounded-md border border-slate-200">
                    Ticket #{manageModalComplaint.id}
                  </span>
                  <span className="bg-indigo-50 text-indigo-700 font-bold text-xs px-2.5 py-0.5 rounded-md border border-indigo-200">
                    {manageModalComplaint.categoryName}
                  </span>
                  <PriorityBadge priority={manageModalComplaint.priority} />
                  <StatusBadge status={manageModalComplaint.status} />
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">{manageModalComplaint.title}</h2>
              </div>
              
              <button
                onClick={() => setManageModalComplaint(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              
              {/* Description Card */}
              <div>
                <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Issue Details</span>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 text-xs text-slate-800 leading-relaxed font-medium">
                  {manageModalComplaint.description}
                </div>
              </div>

              {/* Submitted & Technician Bar */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-100/60 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500 font-medium block">Submitted By</span>
                  <span className="font-bold text-slate-900">
                    {manageModalComplaint.anonymous ? 'Anonymous' : (manageModalComplaint.createdBy?.name || 'Student')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block">Assigned Technician</span>
                  <span className="font-bold text-slate-900">
                    {manageModalComplaint.assignedTechnician ? manageModalComplaint.assignedTechnician.name : 'Unassigned'}
                  </span>
                </div>
              </div>

              {/* Management Sections */}
              <div className="space-y-4 pt-2 border-t border-slate-200">
                
                {/* Assign Technician Action */}
                <div className="bg-amber-50/40 p-4 rounded-xl border border-amber-200/80">
                  <label className="block text-xs font-bold text-amber-900 uppercase tracking-wider mb-2 flex items-center">
                    <UserPlus className="w-4 h-4 mr-1.5 text-amber-700" />
                    <span>Assign Field Technician</span>
                  </label>

                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <div className="w-full">
                      <CustomSelect
                        value={selectedTechnicianId}
                        onChange={(val) => setSelectedTechnicianId(val)}
                        placeholder="Choose field technician..."
                        options={staffUsers.map((st) => ({
                          value: st.id.toString(),
                          label: `${st.name} (${st.department || 'Tech'})`
                        }))}
                      />
                    </div>

                    <button
                      onClick={handleAssignTechnician}
                      className="w-full sm:w-auto px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-bold text-xs shadow-sm transition whitespace-nowrap cursor-pointer"
                    >
                      Confirm Assign
                    </button>
                  </div>
                </div>

                {/* Change Workflow Status Action */}
                <div className="bg-indigo-50/40 p-4 rounded-xl border border-indigo-200/80">
                  <label className="block text-xs font-bold text-indigo-900 uppercase tracking-wider mb-2 flex items-center">
                    <RefreshCw className="w-4 h-4 mr-1.5 text-indigo-600" />
                    <span>Update Complaint Status</span>
                  </label>

                  <div className="flex flex-col sm:flex-row items-center gap-2 mb-2">
                    <div className="w-full">
                      <CustomSelect
                        value={newStatus}
                        onChange={(val) => setNewStatus(val)}
                        options={[
                          { value: 'PENDING', label: 'PENDING' },
                          { value: 'ASSIGNED', label: 'ASSIGNED' },
                          { value: 'IN_PROGRESS', label: 'IN_PROGRESS' },
                          { value: 'PENDING_APPROVAL', label: 'PENDING_APPROVAL' },
                          { value: 'RESOLVED', label: 'RESOLVED' },
                          { value: 'CLOSED', label: 'CLOSED' },
                          { value: 'REJECTED', label: 'REJECTED' },
                        ]}
                      />
                    </div>

                    <button
                      onClick={handleUpdateStatus}
                      className="w-full sm:w-auto px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs shadow-sm transition whitespace-nowrap"
                    >
                      Save Status
                    </button>
                  </div>

                  <input
                    type="text"
                    placeholder="Optional remark / comment for student & staff..."
                    value={statusComment}
                    onChange={(e) => setStatusComment(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-medium placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

              </div>

              {/* Footer Links */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                <Link
                  to={`/complaint/${manageModalComplaint.id}`}
                  className="px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition border border-indigo-200 flex items-center space-x-1.5"
                >
                  <span>Open Full Thread</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>

                <button
                  onClick={() => setManageModalComplaint(null)}
                  className="btn-modern-secondary text-xs py-2 px-4"
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Review Approve / Reject Modal */}
      {reviewModalUpdate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-md w-full p-6 border border-slate-200 shadow-2xl">
            <h2 className="text-lg font-bold text-slate-900 mb-1">
              {reviewAction === 'APPROVE' ? 'Approve Technician Update' : 'Reject & Send Back to Technician'}
            </h2>
            <p className="text-xs text-slate-500 mb-4 truncate">{reviewModalUpdate.complaintTitle}</p>

            <form onSubmit={handleReviewUpdate} className="space-y-4">
              <div>
                <label className="label-modern">
                  {reviewAction === 'APPROVE' ? 'Approval Remark (Optional)' : 'Rejection Reason / Rework Comment *'}
                </label>
                <textarea
                  required={reviewAction === 'REJECT'}
                  rows={3}
                  placeholder={reviewAction === 'APPROVE' ? 'e.g. Verified on-site inspection.' : 'Explain what needs to be redone or checked...'}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="input-modern"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setReviewModalUpdate(null)}
                  className="btn-modern-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={reviewAction === 'APPROVE' ? 'btn-modern-primary bg-emerald-600 hover:bg-emerald-700' : 'btn-modern-primary bg-red-600 hover:bg-red-700 text-white'}
                >
                  {reviewAction === 'APPROVE' ? 'Confirm Approval' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Technician Modal */}
      {assignModalComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-md w-full p-6 border border-slate-200 shadow-2xl">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Assign Responsible Field Technician</h2>
            <p className="text-xs text-slate-500 mb-4 truncate">{assignModalComplaint.title}</p>

            <form onSubmit={handleAssignTechnician} className="space-y-4">
              <div>
                <label className="label-modern">Select Field Technician</label>
                <CustomSelect
                  value={selectedTechnicianId}
                  onChange={(val) => setSelectedTechnicianId(val)}
                  placeholder="Choose technician..."
                  options={staffUsers.map((st) => ({
                    value: st.id.toString(),
                    label: `${st.name} (${st.department || 'Field Technician'})`
                  }))}
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setAssignModalComplaint(null)}
                  className="btn-modern-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-modern-primary text-xs"
                >
                  Assign Technician
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Status Change Modal */}
      {statusModalComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-md w-full p-6 border border-slate-200 shadow-2xl">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Update Status Manually</h2>
            <p className="text-xs text-slate-500 mb-4 truncate">{statusModalComplaint.title}</p>

            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div>
                <label className="label-modern">New Workflow Status</label>
                <CustomSelect
                  value={newStatus}
                  onChange={(val) => setNewStatus(val)}
                  options={[
                    { value: 'PENDING', label: 'PENDING' },
                    { value: 'ASSIGNED', label: 'ASSIGNED' },
                    { value: 'IN_PROGRESS', label: 'IN_PROGRESS' },
                    { value: 'PENDING_APPROVAL', label: 'PENDING_APPROVAL' },
                    { value: 'RESOLVED', label: 'RESOLVED' },
                    { value: 'CLOSED', label: 'CLOSED' },
                    { value: 'REJECTED', label: 'REJECTED' },
                  ]}
                />
              </div>

              <div>
                <label className="label-modern">Resolution Remark / Comment</label>
                <textarea
                  rows={3}
                  placeholder="Explain status update..."
                  value={statusComment}
                  onChange={(e) => setStatusComment(e.target.value)}
                  className="input-modern"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setStatusModalComplaint(null)}
                  className="btn-modern-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-modern-primary text-xs"
                >
                  Save Status Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-md w-full p-6 border border-slate-200 shadow-2xl">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Add Complaint Category</h2>

            <form onSubmit={handleCreateCategory} className="space-y-4 mt-4">
              <div>
                <label className="label-modern">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Campus Wi-Fi & IT"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="input-modern"
                />
              </div>

              <div>
                <label className="label-modern">Description</label>
                <textarea
                  rows={3}
                  placeholder="Brief summary of category issues..."
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  className="input-modern"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="btn-modern-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-modern-primary text-xs"
                >
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      <LightboxModal
        attachment={activeAttachment}
        onClose={() => setActiveAttachment(null)}
      />
    </div>
  );
};

export default AdminDashboard;
