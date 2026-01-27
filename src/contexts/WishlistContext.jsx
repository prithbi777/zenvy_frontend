import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import apiService from '../services/api';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

const initialState = {
    wishlist: [],
    isLoading: false,
    error: null
};

const ACTIONS = {
    LOAD_START: 'LOAD_START',
    LOAD_SUCCESS: 'LOAD_SUCCESS',
    LOAD_FAILURE: 'LOAD_FAILURE',
    CLEAR_ERROR: 'CLEAR_ERROR'
};

const reducer = (state, action) => {
    switch (action.type) {
        case ACTIONS.LOAD_START:
            return { ...state, isLoading: true, error: null };
        case ACTIONS.LOAD_SUCCESS:
            return { ...state, isLoading: false, wishlist: action.payload, error: null };
        case ACTIONS.LOAD_FAILURE:
            return { ...state, isLoading: false, error: action.payload };
        case ACTIONS.CLEAR_ERROR:
            return { ...state, error: null };
        default:
            return state;
    }
};

export const WishlistProvider = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const [state, dispatch] = useReducer(reducer, initialState);

    const refresh = async () => {
        if (!isAuthenticated) {
            dispatch({ type: ACTIONS.LOAD_SUCCESS, payload: [] });
            return;
        }

        try {
            dispatch({ type: ACTIONS.LOAD_START });
            const response = await apiService.getWishlist();
            dispatch({ type: ACTIONS.LOAD_SUCCESS, payload: response.data || [] });
        } catch (e) {
            console.error("Wishlist refresh error:", e);
            // Don't overwrite state with error if just a background refresh fails? 
            // Maybe just keep old state? But usually we want to know.
            dispatch({ type: ACTIONS.LOAD_FAILURE, payload: e.message || 'Failed to load wishlist' });
        }
    };

    useEffect(() => {
        refresh();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated]);

    const addToWishlist = async (productId) => {
        if (!isAuthenticated) throw new Error('Please login to use wishlist');

        // Optimistic or wait? Let's wait for consistency
        const response = await apiService.addToWishlist(productId);
        // Response data is the full wishlist
        dispatch({ type: ACTIONS.LOAD_SUCCESS, payload: response.data });
    };

    const removeFromWishlist = async (productId) => {
        if (!isAuthenticated) throw new Error('Please login to use wishlist');
        const response = await apiService.removeFromWishlist(productId);
        dispatch({ type: ACTIONS.LOAD_SUCCESS, payload: response.data });
    };

    const isInWishlist = (productId) => {
        return state.wishlist.some(item => item._id === productId);
    };

    const value = useMemo(() => ({
        ...state,
        refresh,
        addToWishlist,
        removeFromWishlist,
        isInWishlist
    }), [state]);

    return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

export const useWishlist = () => {
    const ctx = useContext(WishlistContext);
    if (!ctx) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return ctx;
};

export default WishlistContext;
