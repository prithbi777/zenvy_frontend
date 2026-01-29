import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Camera, User, Mail, Phone, Shield, MapPin, Calendar, Edit3, Save, X, CheckCircle, ChevronRight } from 'lucide-react';
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

        if (!file.type.startsWith('image/')) {
            setError('Please upload an image file');
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            setError('Image must be less than 2MB');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setPhotoPreview(reader.result);
        };
        reader.readAsDataURL(file);

        try {
            setIsUploadingPhoto(true);
            setError('');

            const formData = new FormData();
            formData.append('photo', file);

            const response = await api.uploadProfilePhoto(formData);

            setProfile(prev => ({ ...prev, profilePhoto: response.photoUrl }));
            setSuccess('Profile photo updated!');

            const currentUser = api.getUser();
            if (currentUser) {
                updateUser({ ...currentUser, profilePhoto: response.photoUrl });
            }

            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message || 'Failed to upload photo');
            setPhotoPreview(profile.profilePhoto);
        } finally {
            setIsUploadingPhoto(false);
        }
    };

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
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 border-[3px] border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Synchronizing Identity...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white selection:bg-indigo-100 selection:text-indigo-900">
            {/* Dynamic Background Blur */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-20">
                <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-200 rounded-full blur-[150px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-200 rounded-full blur-[150px]"></div>
            </div>

            <div className="relative mx-auto max-w-7xl px-6 lg:px-12 py-12 lg:py-24">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 pb-12 border-b border-slate-100">
                    <div>
                        <div className="flex items-center gap-2 mb-4 text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500">
                            <User className="h-3 w-3" />
                            <span>Member Dashboard</span>
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-black text-slate-900 tracking-tight leading-[0.9]">
                            My Identity
                        </h1>
                    </div>
                    {!isEditing && (
                        <button
                            onClick={handleEdit}
                            className="group flex items-center gap-3 px-8 h-16 bg-slate-900 text-white rounded-[24px] text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all duration-500 shadow-2xl shadow-slate-200"
                        >
                            <Edit3 className="h-4 w-4 transition-transform group-hover:rotate-12" />
                            <span>Modify Profile</span>
                        </button>
                    )}
                </div>

                {/* Feedback Messages */}
                {error && (
                    <div className="mb-8 p-6 rounded-[28px] bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
                        <X className="h-5 w-5 bg-rose-500 text-white rounded-full p-1" />
                        {error}
                    </div>
                )}
                {success && (
                    <div className="mb-8 p-6 rounded-[28px] bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-bold flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
                        <CheckCircle className="h-5 w-5 bg-emerald-500 text-white rounded-full p-1" />
                        {success}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
                    {/* Left Column: Avatar and Summary */}
                    <div className="lg:col-span-4 lg:sticky lg:top-24 h-fit">
                        <div className="relative p-10 rounded-[48px] bg-[#0a0a0a] text-white shadow-2xl overflow-hidden group">
                            {/* Decorative Background for Card */}
                            <div className="absolute top-[-50%] right-[-50%] w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all duration-1000"></div>

                            <div className="relative z-10 flex flex-col items-center">
                                {/* Photo Section */}
                                <div className="relative mb-8 group/photo">
                                    <div className="w-40 h-40 rounded-[40px] overflow-hidden border-4 border-white/10 shadow-2xl transition-transform duration-700 group-hover/photo:scale-105">
                                        {photoPreview ? (
                                            <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-white/5 flex items-center justify-center text-white/20">
                                                <User size={64} />
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        onClick={handlePhotoClick}
                                        disabled={isUploadingPhoto}
                                        className="absolute -bottom-2 -right-2 p-4 bg-indigo-600 rounded-2xl text-white hover:bg-indigo-500 transition-all duration-300 shadow-xl group-hover/photo:scale-110 active:scale-90"
                                    >
                                        <Camera className="h-5 w-5" />
                                    </button>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        className="hidden"
                                        accept="image/png, image/jpeg, image/webp"
                                    />
                                </div>

                                <div className="text-center">
                                    <h2 className="text-2xl font-black tracking-tight mb-2 uppercase">{profile.name}</h2>
                                    <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] mb-8">{profile.email}</p>

                                    {isUploadingPhoto && (
                                        <div className="flex items-center gap-2 mb-6">
                                            <div className="h-3 w-3 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Uploading Core Data</span>
                                        </div>
                                    )}

                                    <div className="inline-flex items-center gap-2 px-6 py-2 bg-white/5 rounded-full border border-white/10">
                                        <div className={`h-2 w-2 rounded-full ${profile.role === 'admin' ? 'bg-purple-400' : 'bg-indigo-400'} animate-pulse`}></div>
                                        <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Status: {profile.role}</span>
                                    </div>
                                </div>

                                <div className="w-full mt-12 grid grid-cols-1 gap-4">
                                    <div className="p-6 rounded-[32px] bg-white/5 border border-white/5 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <Calendar className="h-4 w-4 text-indigo-400" />
                                            <div className="text-left">
                                                <span className="block text-[8px] font-black uppercase tracking-widest opacity-40">Registered</span>
                                                <span className="text-[10px] font-bold uppercase tracking-widest">
                                                    {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 rounded-[32px] bg-white/5 border border-white/5 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <Shield className="h-4 w-4 text-emerald-400" />
                                            <div className="text-left">
                                                <span className="block text-[8px] font-black uppercase tracking-widest opacity-40">Account Security</span>
                                                <span className="text-[10px] font-bold uppercase tracking-widest">Verified Level 2</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Forms */}
                    <div className="lg:col-span-8">
                        <form onSubmit={handleSubmit} className="space-y-12 pb-12">
                            {/* Section: Basic Intel */}
                            <div className="group relative">
                                <div className="flex items-center gap-4 mb-8">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Section 01 / General</h3>
                                    <div className="flex-1 h-px bg-slate-100"></div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Legal Identity</label>
                                        <div className={`relative transition-all duration-300 ${isEditing ? 'scale-[1.01]' : ''}`}>
                                            <User className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <input
                                                type="text"
                                                name="name"
                                                value={isEditing ? editedProfile.name : profile.name}
                                                onChange={handleChange}
                                                readOnly={!isEditing}
                                                className={`w-full h-16 pl-14 pr-6 rounded-[24px] border border-slate-100 bg-white font-bold text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none ${!isEditing ? 'cursor-default opacity-80' : 'shadow-xl shadow-slate-100'}`}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Communication Link</label>
                                        <div className={`relative transition-all duration-300 ${isEditing ? 'scale-[1.01]' : ''}`}>
                                            <Mail className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <input
                                                type="email"
                                                name="email"
                                                value={isEditing ? editedProfile.email : profile.email}
                                                onChange={handleChange}
                                                readOnly={!isEditing}
                                                className={`w-full h-16 pl-14 pr-6 rounded-[24px] border border-slate-100 bg-white font-bold text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none ${!isEditing ? 'cursor-default opacity-80' : 'shadow-xl shadow-slate-100'}`}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Direct Terminal (Phone)</label>
                                        <div className={`relative transition-all duration-300 ${isEditing ? 'scale-[1.01]' : ''}`}>
                                            <Phone className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <input
                                                type="tel"
                                                name="phone"
                                                placeholder="10-digit number"
                                                value={isEditing ? editedProfile.phone : (profile.phone || '')}
                                                onChange={handleChange}
                                                readOnly={!isEditing}
                                                pattern="[0-9]{10}"
                                                className={`w-full h-16 pl-14 pr-6 rounded-[24px] border border-slate-100 bg-white font-bold text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none ${!isEditing ? 'cursor-default opacity-80' : 'shadow-xl shadow-slate-100'}`}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section: Logistic Coordinates */}
                            <div className="group relative">
                                <div className="flex items-center gap-4 mb-8">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Section 02 / Coordinates</h3>
                                    <div className="flex-1 h-px bg-slate-100"></div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Street Access</label>
                                        <div className={`relative transition-all duration-300 ${isEditing ? 'scale-[1.01]' : ''}`}>
                                            <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <input
                                                type="text"
                                                name="address.street"
                                                value={isEditing ? editedProfile.address.street : (profile.address.street || '')}
                                                onChange={handleChange}
                                                readOnly={!isEditing}
                                                className={`w-full h-16 pl-14 pr-6 rounded-[24px] border border-slate-100 bg-white font-bold text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none ${!isEditing ? 'cursor-default opacity-80' : 'shadow-xl shadow-slate-100'}`}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:col-span-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">City Focus</label>
                                            <input
                                                type="text"
                                                name="address.city"
                                                value={isEditing ? editedProfile.address.city : (profile.address.city || '')}
                                                onChange={handleChange}
                                                readOnly={!isEditing}
                                                className={`w-full h-16 px-8 rounded-[24px] border border-slate-100 bg-white font-bold text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none ${!isEditing ? 'cursor-default opacity-80' : 'shadow-xl shadow-slate-100'}`}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Regional State</label>
                                            <input
                                                type="text"
                                                name="address.state"
                                                value={isEditing ? editedProfile.address.state : (profile.address.state || '')}
                                                onChange={handleChange}
                                                readOnly={!isEditing}
                                                className={`w-full h-16 px-8 rounded-[24px] border border-slate-100 bg-white font-bold text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none ${!isEditing ? 'cursor-default opacity-80' : 'shadow-xl shadow-slate-100'}`}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:col-span-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">System Pincode</label>
                                            <input
                                                type="text"
                                                name="address.pincode"
                                                value={isEditing ? editedProfile.address.pincode : (profile.address.pincode || '')}
                                                onChange={handleChange}
                                                readOnly={!isEditing}
                                                className={`w-full h-16 px-8 rounded-[24px] border border-slate-100 bg-white font-bold text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none ${!isEditing ? 'cursor-default opacity-80' : 'shadow-xl shadow-slate-100'}`}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Nation Jurisdiction</label>
                                            <input
                                                type="text"
                                                name="address.country"
                                                value={isEditing ? editedProfile.address.country : (profile.address.country || '')}
                                                onChange={handleChange}
                                                readOnly={!isEditing}
                                                className={`w-full h-16 px-8 rounded-[24px] border border-slate-100 bg-white font-bold text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none ${!isEditing ? 'cursor-default opacity-80' : 'shadow-xl shadow-slate-100'}`}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Row */}
                            {isEditing && (
                                <div className="pt-12 flex flex-col sm:flex-row gap-4">
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="flex-[2] h-20 bg-slate-900 text-white rounded-[32px] text-[10px] font-black uppercase tracking-[0.2em] relative group overflow-hidden shadow-2xl shadow-slate-200"
                                    >
                                        <span className="relative z-10 flex items-center justify-center gap-3">
                                            {saving ? (
                                                <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                            ) : (
                                                <>
                                                    <Save className="h-5 w-5" />
                                                    <span>Commit Changes</span>
                                                </>
                                            )}
                                        </span>
                                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        disabled={saving}
                                        className="flex-1 h-20 bg-white border border-slate-100 text-slate-900 rounded-[32px] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-50 transition-colors"
                                    >
                                        <span className="flex items-center justify-center gap-3">
                                            <X className="h-5 w-5" />
                                            <span>Abort</span>
                                        </span>
                                    </button>
                                </div>
                            )}
                        </form>

                        {/* Additional Quick Actions */}
                        {!isEditing && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
                                <Link to="/orders" className="group p-8 rounded-[40px] bg-white border border-slate-100 hover:border-indigo-100 transition-all duration-500 hover:shadow-[0_20px_40px_rgba(0,0,0,0.03)] flex items-center justify-between">
                                    <div>
                                        <span className="block text-[8px] font-black uppercase tracking-widest text-slate-400 mb-2">Transaction History</span>
                                        <span className="text-xl font-black text-slate-900 tracking-tight">Purchase Record</span>
                                    </div>
                                    <div className="h-12 w-12 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                                        <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                                    </div>
                                </Link>

                                <Link to="/wishlist" className="group p-8 rounded-[40px] bg-white border border-slate-100 hover:border-indigo-100 transition-all duration-500 hover:shadow-[0_20px_40px_rgba(0,0,0,0.03)] flex items-center justify-between">
                                    <div>
                                        <span className="block text-[8px] font-black uppercase tracking-widest text-slate-400 mb-2">Curated List</span>
                                        <span className="text-xl font-black text-slate-900 tracking-tight">Private Wishlist</span>
                                    </div>
                                    <div className="h-12 w-12 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                                        <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                                    </div>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

