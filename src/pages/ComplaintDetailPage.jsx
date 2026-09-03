import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import LightboxModal from '../components/LightboxModal';
import { complaintAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Clock, Paperclip, MessageSquare, Send, ShieldOff, CheckCircle2, UserCheck, Wrench, Check, X, Hourglass, AlertCircle } from 'lucide-react';

const ComplaintDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [complaint, setComplaint] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [postingComment, setPostingComment] = useState(false);
  const [activeAttachment, setActiveAttachment] = useState(null);

  useEffect(() => {
    fetchComplaintDetails();
  }, [id]);

  const fetchComplaintDetails = async () => {
    setLoading(true);
    try {
      const [resComplaint, resUpdates] = await Promise.all([
        complaintAPI.getById(id),
        complaintAPI.getUpdates(id)
      ]);
      setComplaint(resComplaint.data);
      setUpdates(resUpdates.data);
    } catch (err) {
      console.error('Error fetching complaint details', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setPostingComment(true);
    try {
      await complaintAPI.addComment(id, { message: commentText });
      setCommentText('');
      fetchComplaintDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Error posting comment');
    } finally {
      setPostingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center text-slate-500">
          <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          Loading complaint details...
        </div>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-slate-900">Complaint Not Found</h2>
          <Link to="/" className="mt-4 btn-primary inline-flex">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const steps = ['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'PENDING_APPROVAL', 'RESOLVED', 'CLOSED'];
  const currentStepIndex = steps.indexOf(complaint.status);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Back Link */}
        <Link
          to={user.role === 'STUDENT' ? '/dashboard' : user.role === 'TECHNICIAN' ? '/technician' : '/admin'}
          className="inline-flex items-center space-x-1.5 text-xs text-slate-500 hover:text-brand-600 mb-6 transition font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>

        {/* Complaint Header Card */}
        <div className="card p-6 rounded-xl border border-slate-200 mb-8 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center space-x-3">
              <span className="text-xs font-bold text-brand-700 bg-brand-50 border border-brand-200 px-3 py-1 rounded-full">
                {complaint.categoryName}
              </span>
              <PriorityBadge priority={complaint.priority} />
              {complaint.isAnonymous && (
                <span className="inline-flex items-center text-xs text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-full font-medium">
                  <ShieldOff className="w-3.5 h-3.5 mr-1 text-purple-600" /> Anonymous
                </span>
              )}
            </div>
            <StatusBadge status={complaint.status} />
          </div>

          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-3">
            {complaint.title}
          </h1>

          <div className="flex flex-wrap items-center text-xs text-slate-600 gap-4 mb-6 pb-4 border-b border-slate-200">
            <div>
              <span className="text-slate-500">Ticket ID:</span> <strong className="text-slate-800">#{complaint.id}</strong>
            </div>
            <div>
              <span className="text-slate-500">Submitted by:</span>{' '}
              <span className="text-slate-800 font-semibold">{complaint.createdBy?.name || 'Student'}</span>
            </div>
            <div>
              <span className="text-slate-500">Assigned Technician:</span>{' '}
              <span className="text-amber-800 font-semibold">
                {complaint.assignedTechnician ? complaint.assignedTechnician.name : 'Unassigned'}
              </span>
            </div>
            <div>
              <span className="text-slate-500">Logged on:</span> {new Date(complaint.createdAt).toLocaleString()}
            </div>
          </div>

          <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line mb-6">
            {complaint.description}
          </div>

          {/* Attached Evidence Photos / Documents */}
          {complaint.attachments && complaint.attachments.length > 0 && (
            <div className="pt-4 border-t border-slate-200">
              <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-3 flex items-center">
                <Paperclip className="w-4 h-4 text-brand-600 mr-1.5" />
                Attached Photos & Documents ({complaint.attachments.length})
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {complaint.attachments.map((att) => {
                  const isImg = att.fileType && att.fileType.startsWith('image/');
                  const fileUrl = `http://localhost:8082${att.fileUrl}`;
                  return (
                    <div
                      key={att.id}
                      onClick={() => setActiveAttachment(att)}
                      className="group cursor-pointer card rounded-xl p-2 border border-slate-200 hover:border-brand-300 transition overflow-hidden bg-slate-50"
                    >
                      {isImg ? (
                        <div className="w-full h-28 rounded-lg overflow-hidden relative bg-slate-100">
                          <img
                            src={fileUrl}
                            alt={att.originalName}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-28 rounded-lg bg-white border border-slate-200 flex flex-col items-center justify-center p-2 text-center">
                          <Paperclip className="w-8 h-8 text-brand-600 mb-1" />
                          <span className="text-[11px] font-semibold text-slate-700 truncate w-full">{att.originalName}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Workflow Progress Stepper */}
        <div className="card p-6 rounded-xl border border-slate-200 mb-8 bg-white">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-6">
            Multi-Stage Approval Workflow Progress
          </h3>

          <div className="relative flex items-center justify-between">
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-slate-200 z-0"></div>

            {steps.map((st, idx) => {
              const isPassed = currentStepIndex >= idx;

              return (
                <div key={st} className="relative z-10 flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition duration-200 ${
                      isPassed
                        ? 'bg-brand-600 text-white shadow-sm'
                        : 'bg-white text-slate-400 border border-slate-300'
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <span className={`text-[10px] font-semibold mt-2 text-center max-w-[80px] ${isPassed ? 'text-slate-900' : 'text-slate-400'}`}>
                    {st.replace('_', ' ')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Technician Work Updates Section */}
        {updates.length > 0 && (
          <div className="card p-6 rounded-xl border border-amber-200 bg-amber-50/40 mb-8">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center space-x-2">
              <Wrench className="w-4 h-4 text-amber-600" />
              <span>Technician Field Updates ({updates.length})</span>
            </h3>

            <div className="space-y-4">
              {updates.map((up) => (
                <div key={up.id} className="bg-white rounded-xl p-4 border border-slate-200">
                  <div className="flex flex-wrap items-center justify-between text-xs mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-amber-800">{up.submittedBy?.name}</span>
                      <span className="text-[10px] text-slate-500">({new Date(up.createdAt).toLocaleString()})</span>
                    </div>

                    {up.approvalStatus === 'APPROVED' && (
                      <span className="inline-flex items-center text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[11px] font-semibold">
                        <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Approved by Admin ({up.reviewedBy?.name})
                      </span>
                    )}

                    {up.approvalStatus === 'PENDING' && (
                      <span className="inline-flex items-center text-cyan-800 bg-cyan-50 border border-cyan-200 px-2 py-0.5 rounded text-[11px] font-semibold">
                        <Hourglass className="w-3.5 h-3.5 mr-1 text-cyan-600" /> Awaiting Admin Approval
                      </span>
                    )}

                    {up.approvalStatus === 'REJECTED' && (
                      <span className="inline-flex items-center text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded text-[11px] font-semibold">
                        <X className="w-3.5 h-3.5 mr-1 text-red-600" /> Rejected by Admin ({up.reviewedBy?.name})
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed mb-3">{up.updateText}</p>

                  {up.reviewComment && (
                    <div className="bg-red-50 border border-red-200 p-2.5 rounded-lg text-xs text-red-700 mb-3">
                      <span className="font-bold">Admin Review Note:</span> "{up.reviewComment}"
                    </div>
                  )}

                  {up.attachments && up.attachments.length > 0 && (
                    <div className="flex gap-2">
                      {up.attachments.map((att) => (
                        <img
                          key={att.id}
                          src={`http://localhost:8082${att.fileUrl}`}
                          alt="technician proof"
                          onClick={() => setActiveAttachment(att)}
                          className="w-16 h-16 object-cover rounded-lg border border-slate-200 cursor-pointer hover:opacity-90"
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Activity & Comment Timeline */}
        <div className="card p-6 rounded-xl border border-slate-200 bg-white">
          <h3 className="text-sm font-bold text-slate-900 mb-6 flex items-center space-x-2">
            <MessageSquare className="w-4 h-4 text-brand-600" />
            <span>Audit Trail & Activity Feed</span>
          </h3>

          <div className="space-y-3 mb-6">
            {complaint.comments && complaint.comments.length > 0 ? (
              complaint.comments.map((cm) => (
                <div key={cm.id} className="bg-slate-50 rounded-xl p-3.5 border border-slate-200">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-800">{cm.commentedBy?.name || 'User'}</span>
                      <span className="text-[10px] text-brand-700 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded font-medium">
                        {cm.commentedBy?.role}
                      </span>
                      {cm.statusChange && (
                        <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded font-semibold">
                          Status ➔ {cm.statusChange}
                        </span>
                      )}
                    </div>
                    <span className="text-slate-400 text-[11px]">
                      {new Date(cm.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{cm.message}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-4">No comments logged yet.</p>
            )}
          </div>

          <form onSubmit={handlePostComment} className="flex items-center space-x-3 pt-4 border-t border-slate-200">
            <input
              type="text"
              placeholder="Add a comment or update note..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="input flex-1 py-2 text-xs"
            />
            <button
              type="submit"
              disabled={postingComment}
              className="btn-primary py-2 px-4 text-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Post Note</span>
            </button>
          </form>
        </div>

      </main>

      {/* Lightbox Modal */}
      <LightboxModal
        attachment={activeAttachment}
        onClose={() => setActiveAttachment(null)}
      />
    </div>
  );
};

export default ComplaintDetailPage;
