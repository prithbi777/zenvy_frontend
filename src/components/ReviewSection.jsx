import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Send, MessageSquare } from 'lucide-react';
import apiService from '../services/api';
import StarRating from './StarRating';
import { useAuth } from '../contexts/AuthContext';

const ReviewSection = ({ productId, onReviewSubmitted }) => {
    const { isAuthenticated, user } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // Edit state
    const [editingReviewId, setEditingReviewId] = useState(null);
    const [editRating, setEditRating] = useState(5);
    const [editComment, setEditComment] = useState('');
    const [updating, setUpdating] = useState(false);

    const fetchReviews = async () => {
        try {
            const data = await apiService.getReviews(productId);
            setReviews(data.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [productId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!comment.trim()) return;

        setSubmitting(true);
        setError(null);
        try {
            await apiService.addReview(productId, { rating, comment });
            setComment('');
            setRating(5);
            fetchReviews(); // Re-fetch to show new review
            // Notify parent component to refresh product data
            if (onReviewSubmitted) {
                onReviewSubmitted();
            }
        } catch (err) {
            setError(err.message || 'Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (review) => {
        setEditingReviewId(review._id);
        setEditRating(review.rating);
        setEditComment(review.comment);
    };

    const handleCancelEdit = () => {
        setEditingReviewId(null);
        setEditRating(5);
        setEditComment('');
    };

    const handleUpdateReview = async (reviewId) => {
        if (!editComment.trim()) return;

        setUpdating(true);
        try {
            await apiService.updateReview(reviewId, { rating: editRating, comment: editComment });
            setEditingReviewId(null);
            fetchReviews();
            // Notify parent component to refresh product data
            if (onReviewSubmitted) {
                onReviewSubmitted();
            }
        } catch (err) {
            alert(err.message || 'Failed to update review');
        } finally {
            setUpdating(false);
        }
    };

    const handleDelete = async (reviewId) => {
        if (!window.confirm('Are you sure you want to delete this review?')) return;
        try {
            await apiService.deleteReview(reviewId);
            fetchReviews();
            // Notify parent component to refresh product data
            if (onReviewSubmitted) {
                onReviewSubmitted();
            }
        } catch (err) {
            alert(err.message);
        }
    }

    return (
        <div className="mt-40">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 pb-8 border-b border-slate-100">
                <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500 mb-4 block">Client Feedback</span>
                    <h2 className="text-5xl font-black text-slate-900 tracking-tight">The Experience</h2>
                </div>
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="text-right">
                        <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Average Rating</span>
                        <span className="text-xl font-black text-slate-900">{reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : '0.0'}</span>
                    </div>
                    <div className="h-8 w-px bg-slate-200"></div>
                    <div>
                        <StarRating rating={reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length) : 0} size="sm" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                {/* Left: Review Submission Card */}
                <div className="lg:col-span-4 lg:sticky lg:top-32 h-fit">
                    {isAuthenticated ? (
                        <form onSubmit={handleSubmit} className="p-8 rounded-[40px] bg-[#0a0a0a] text-white shadow-2xl relative overflow-hidden group">
                            {/* Decorative Glow */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl group-hover:bg-indigo-500/30 transition-all duration-700"></div>

                            <h3 className="text-xl font-black mb-8 relative z-10 tracking-tight">Express Your Experience</h3>

                            {error && (
                                <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold leading-relaxed">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-8 relative z-10">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 text-center">Assign Rating</label>
                                    <div className="flex justify-center p-4 bg-white/5 rounded-2xl border border-white/10">
                                        <StarRating rating={rating} onRatingChange={setRating} readOnly={false} size="md" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Narrative</label>
                                    <textarea
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder="Share your detailed impressions..."
                                        className="w-full bg-white/5 rounded-2xl border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm p-5 transition-all outline-none min-h-[160px] placeholder:text-slate-600"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full relative h-16 group/btn overflow-hidden bg-white text-slate-900 rounded-2xl transition-all duration-500 hover:tracking-[0.1em] disabled:opacity-50"
                                >
                                    <div className="relative z-10 text-[10px] font-black uppercase flex items-center justify-center gap-2">
                                        {submitting ? (
                                            <div className="h-4 w-4 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
                                        ) : (
                                            <>
                                                <Send className="h-4 w-4" />
                                                <span>Transmit Review</span>
                                            </>
                                        )}
                                    </div>
                                    <div className="absolute inset-0 bg-indigo-50 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500"></div>
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="p-8 rounded-[40px] bg-slate-50 border border-slate-100 text-center">
                            <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                                <MessageSquare className="h-6 w-6 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-black text-slate-900 mb-2">Authenticated Feedback</h3>
                            <p className="text-xs font-medium text-slate-500 leading-relaxed mb-6">
                                To maintain the integrity of our collection, reviews are restricted to verified accounts.
                            </p>
                            <Link to="/login" className="inline-block py-3 px-8 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-colors">
                                Access Account
                            </Link>
                        </div>
                    )}
                </div>

                {/* Right: Reviews List */}
                <div className="lg:col-span-8">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 grayscale opacity-20">
                            <div className="h-12 w-12 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mb-4"></div>
                            <span className="text-[10px] font-black uppercase tracking-widest">Synchronizing...</span>
                        </div>
                    ) : reviews.length === 0 ? (
                        <div className="p-20 border-2 border-dashed border-slate-100 rounded-[48px] text-center">
                            <p className="text-slate-400 font-medium italic">"The catalog awaits its first discourse on this selection."</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {reviews.map((review) => (
                                <div key={review._id} className="group relative p-8 rounded-[40px] bg-white border border-slate-100 hover:border-indigo-100 transition-all duration-500 hover:shadow-[0_20px_40px_rgba(0,0,0,0.03)] hover:-translate-y-1">
                                    <div className="flex items-start justify-between gap-4 mb-8">
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <img
                                                    src={review.user?.profilePhoto || "https://res.cloudinary.com/demo/image/upload/v1633036643/user_avatar_placeholder.png"}
                                                    alt={review.user?.name}
                                                    className="h-14 w-14 rounded-2xl object-cover border-2 border-white shadow-md"
                                                />
                                                <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-emerald-400 border-2 border-white rounded-full"></div>
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">{review.user?.name || 'Anonymous Collector'}</h4>
                                                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Verified Session • {new Date(review.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end gap-2">
                                            <StarRating rating={review.rating} size="xs" />
                                            {(user && ((user.id === (review.user?._id || review.user?.id)) || user.role === 'admin')) && (
                                                <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => editingReviewId === review._id ? handleUpdateReview(review._id) : handleEdit(review)}
                                                        className="text-[10px] font-black text-indigo-500 uppercase tracking-widest hover:text-indigo-700 transition-colors"
                                                    >
                                                        {editingReviewId === review._id ? 'Commit' : 'Edit'}
                                                    </button>
                                                    <button
                                                        onClick={() => editingReviewId === review._id ? handleCancelEdit() : handleDelete(review._id)}
                                                        className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:text-rose-700 transition-colors"
                                                    >
                                                        {editingReviewId === review._id ? 'Abort' : 'Delete'}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {editingReviewId === review._id ? (
                                        <div className="space-y-4">
                                            <StarRating rating={editRating} onRatingChange={setEditRating} readOnly={false} size="sm" />
                                            <textarea
                                                value={editComment}
                                                onChange={(e) => setEditComment(e.target.value)}
                                                className="w-full bg-slate-50 rounded-2xl border border-slate-100 focus:border-indigo-500 p-5 text-sm transition-all outline-none min-h-[100px]"
                                            />
                                        </div>
                                    ) : (
                                        <p className="text-slate-600 font-medium leading-[1.8] italic group-hover:text-slate-900 transition-colors">
                                            "{review.comment}"
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReviewSection;
