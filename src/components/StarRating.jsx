import React from 'react';

const StarRating = ({ rating, totalReviews, size = 'sm', onRatingChange, readOnly = true }) => {
    const stars = [1, 2, 3, 4, 5];

    // Size classes
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-5 w-5',
        lg: 'h-6 w-6'
    };

    const starClass = sizeClasses[size] || sizeClasses.sm;

    return (
        <div className="flex items-center">
            <div className="flex text-yellow-400">
                {stars.map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={(e) => {
                            if (!readOnly && onRatingChange) {
                                e.preventDefault(); // Prevent navigating if inside a link
                                e.stopPropagation();
                                onRatingChange(star);
                            }
                        }}
                        disabled={readOnly}
                        className={`${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110 transition-transform'} focus:outline-none`}
                        aria-label={`Rate ${star} stars`}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill={star <= rating ? "currentColor" : "none"}
                            stroke="currentColor"
                            strokeWidth="1.5"
                            className={starClass}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                            />
                        </svg>
                    </button>
                ))}
            </div>
            {totalReviews !== undefined && (
                <span className="ml-2 text-xs text-gray-500 font-medium">({totalReviews})</span>
            )}
        </div>
    );
};

export default StarRating;
