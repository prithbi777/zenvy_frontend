import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

export default function Profile() {
    const { updateUser } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    // Photo upload state
    const fileInputRef = useRef(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

    const [profile, setProfile] = useState({
        name: '',
        email: '',
        phone: '',
        profilePhoto: '',
        address: {
            street: '',
            city: '',
            state: '',
            pincode: '',
            country: 'India'
        },
        role: '',
        createdAt: ''
    });

    const [editedProfile, setEditedProfile] = useState({ ...profile });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await api.getUserProfile();
            const userData = response.user;

            const profileData = {
                name: userData.name || '',
                email: userData.email || '',
                phone: userData.phone || '',
                profilePhoto: userData.profilePhoto || '',
                address: {
                    street: userData.address?.street || '',
                    city: userData.address?.city || '',
                    state: userData.address?.state || '',
                    pincode: userData.address?.pincode || '',
                    country: userData.address?.country || 'India'
                },
                role: userData.role || '',
                createdAt: userData.createdAt || ''
            };

            setProfile(profileData);
            setEditedProfile(profileData);
            setPhotoPreview(userData.profilePhoto);
        } catch (err) {
            setError(err.message || 'Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handlePhotoClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validations
        if (!file.type.startsWith('image/')) {
            setError('Please upload an image file');
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            setError('Image must be less than 2MB');
            return;
        }

        // Preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPhotoPreview(reader.result);
        };
        reader.readAsDataURL(file);

        // Upload immediately
        try {
            setIsUploadingPhoto(true);
            setError('');

            const formData = new FormData();
            formData.append('photo', file);

            const response = await api.uploadProfilePhoto(formData);

            setProfile(prev => ({ ...prev, profilePhoto: response.photoUrl }));
            setSuccess('Profile photo updated!');

            // Update user in context
            const currentUser = api.getUser();
            if (currentUser) {
                updateUser({ ...currentUser, profilePhoto: response.photoUrl });
            }

            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message || 'Failed to upload photo');
            setPhotoPreview(profile.profilePhoto); // Revert preview
        } finally {
            setIsUploadingPhoto(false);
        }
    };

    // ... rest of handlers (handleEdit, handleCancel, handleChange, handleSubmit) ...

    const handleEdit = () => {
        setIsEditing(true);
        setEditedProfile({ ...profile });
        setError('');
        setSuccess('');
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditedProfile({ ...profile });
        setError('');
        setSuccess('');
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name.startsWith('address.')) {
            const addressField = name.split('.')[1];
            setEditedProfile(prev => ({
                ...prev,
                address: {
                    ...prev.address,
                    [addressField]: value
                }
            }));
        } else {
            setEditedProfile(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);
            setError('');
            setSuccess('');

            const response = await api.updateUserProfile(editedProfile);

            setProfile(editedProfile);
            setIsEditing(false);
            setSuccess('Profile updated successfully!');

            // Update user in context
            const currentUser = api.getUser();
            if (currentUser) {
                updateUser({
                    ...currentUser,
                    ...response.user
                });
            }

            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="w-full min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
                    <p className="mt-2 text-gray-600">Manage your account information</p>
                </div>

                {/* Messages */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                {success && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-green-800">{success}</p>
                    </div>
                )}

                {/* Profile Card */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row items-center gap-6">
                        {/* Photo Section */}
                        <div className="relative group">
                            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200">
                                {photoPreview ? (
                                    <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                                        <Camera size={32} />
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={handlePhotoClick}
                                disabled={isUploadingPhoto}
                                className="absolute bottom-0 right-0 p-1.5 bg-blue-600 rounded-full text-white hover:bg-blue-700 transition-colors shadow-sm"
                                title="Change photo"
                            >
                                <Camera size={16} />
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                                accept="image/png, image/jpeg, image/webp"
                            />
                        </div>

                        <div className="text-center md:text-left">
                            <h2 className="text-xl font-bold text-gray-900">{profile.name}</h2>
                            <p className="text-gray-500">{profile.email}</p>
                            {isUploadingPhoto && <p className="text-xs text-blue-600 mt-1">Uploading photo...</p>}
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {/* Basic Information */}
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
                                {!isEditing && (
                                    <button
                                        type="button"
                                        onClick={handleEdit}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Edit Profile
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Name
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="name"
                                            value={editedProfile.name}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        />
                                    ) : (
                                        <p className="text-gray-900 py-2">{profile.name}</p>
                                    )}
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="email"
                                            name="email"
                                            value={editedProfile.email}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        />
                                    ) : (
                                        <p className="text-gray-900 py-2">{profile.email}</p>
                                    )}
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Phone Number
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={editedProfile.phone}
                                            onChange={handleChange}
                                            placeholder="10-digit phone number"
                                            pattern="[0-9]{10}"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    ) : (
                                        <p className="text-gray-900 py-2">{profile.phone || 'Not provided'}</p>
                                    )}
                                </div>

                                {/* Role (Read-only) */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Account Type
                                    </label>
                                    <p className="text-gray-900 py-2 capitalize">
                                        <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${profile.role === 'admin'
                                            ? 'bg-purple-100 text-purple-800'
                                            : 'bg-blue-100 text-blue-800'
                                            }`}>
                                            {profile.role}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Address Information */}
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">Address</h2>

                            <div className="grid grid-cols-1 gap-6">
                                {/* Street */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Street Address
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="address.street"
                                            value={editedProfile.address.street}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    ) : (
                                        <p className="text-gray-900 py-2">{profile.address.street || 'Not provided'}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* City */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            City
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                name="address.city"
                                                value={editedProfile.address.city}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        ) : (
                                            <p className="text-gray-900 py-2">{profile.address.city || 'Not provided'}</p>
                                        )}
                                    </div>

                                    {/* State */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            State
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                name="address.state"
                                                value={editedProfile.address.state}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        ) : (
                                            <p className="text-gray-900 py-2">{profile.address.state || 'Not provided'}</p>
                                        )}
                                    </div>

                                    {/* Pincode */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Pincode
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                name="address.pincode"
                                                value={editedProfile.address.pincode}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        ) : (
                                            <p className="text-gray-900 py-2">{profile.address.pincode || 'Not provided'}</p>
                                        )}
                                    </div>

                                    {/* Country */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Country
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                name="address.country"
                                                value={editedProfile.address.country}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        ) : (
                                            <p className="text-gray-900 py-2">{profile.address.country}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Account Information (Read-only) */}
                        <div className="p-6 bg-gray-50">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">Account Information</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Member Since
                                    </label>
                                    <p className="text-gray-900 py-2">
                                        {new Date(profile.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        {isEditing && (
                            <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end gap-4">
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                                    disabled={saving}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={saving}
                                >
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}
