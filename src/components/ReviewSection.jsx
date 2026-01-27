import React, { useState, useEffect } from 'react';
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
        <div className="mt-16 border-t border-gray-200 pt-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h2>

            {/* Review Form */}
            {isAuthenticated ? (
                <form onSubmit={handleSubmit} className="mb-10 bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Write a Review</h3>
                    {error && <div className="mb-4 text-red-600 text-sm">{error}</div>}

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                        <StarRating rating={rating} onRatingChange={setRating} readOnly={false} size="md" />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Comment</label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                            rows={4}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                        {submitting ? 'Submitting...' : 'Submit Review'}
                    </button>
                </form>
            ) : (
                <div className="mb-10 bg-gray-50 p-6 rounded-lg text-center">
                    <p className="text-gray-600">Please <a href="/login" className="text-indigo-600 font-medium">login</a> to write a review.</p>
                </div>
            )}

            {/* Reviews List */}
            {loading ? (
                <div className="text-center text-gray-500">Loading reviews...</div>
            ) : reviews.length === 0 ? (
                <div className="text-center text-gray-500 italic">No reviews yet. Be the first to review this product!</div>
            ) : (
                <div className="space-y-8">
                    {reviews.map((review) => (
                        <div key={review._id} className="border-b border-gray-200 pb-8 last:border-0 last:pb-0">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center">
                                    <img
                                        src={review.user?.profilePhoto || "https://res.cloudinary.com/demo/image/upload/v1633036643/user_avatar_placeholder.png"}
                                        alt={review.user?.name}
                                        className="h-10 w-10 rounded-full mr-4 object-cover"
                                    />
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-900">{review.user?.name || 'Anonymous'}</h4>
                                        <div className="flex items-center mt-1">
                                            {editingReviewId === review._id ? (
                                                <StarRating rating={editRating} onRatingChange={setEditRating} readOnly={false} size="sm" />
                                            ) : (
                                                <>
                                                    <StarRating rating={review.rating} size="sm" />
                                                    <span className="ml-2 text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {(user && ((user.id === (review.user?._id || review.user?.id)) || user.role === 'admin')) && (
                                    <div className="flex gap-2">
                                        {editingReviewId === review._id ? (
                                            <>
                                                <button
                                                    onClick={() => handleUpdateReview(review._id)}
                                                    disabled={updating}
                                                    className="text-green-600 hover:text-green-800 text-xs font-medium disabled:opacity-50"
                                                >
                                                    {updating ? 'Saving...' : 'Save'}
                                                </button>
                                                <button
                                                    onClick={handleCancelEdit}
                                                    className="text-gray-600 hover:text-gray-800 text-xs font-medium"
                                                >
                                                    Cancel
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                {(user.id === (review.user?._id || review.user?.id)) && (
                                                    <button
                                                        onClick={() => handleEdit(review)}
                                                        className="text-indigo-600 hover:text-indigo-800 text-xs font-medium"
                                                    >
                                                        Edit
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(review._id)}
                                                    className="text-red-600 hover:text-red-800 text-xs font-medium"
                                                >
                                                    Delete
                                                </button>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                            {editingReviewId === review._id ? (
                                <textarea
                                    value={editComment}
                                    onChange={(e) => setEditComment(e.target.value)}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border mt-2"
                                    rows={3}
                                />
                            ) : (
                                <p className="text-gray-600 mt-2">{review.comment}</p>
                            )}
                        </div>
                    ))}
                </div>
            )}

        </div>
    );
};

export default ReviewSection;
