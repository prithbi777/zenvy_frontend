import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import apiService from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

const initialState = {
  cart: null,
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
      return { ...state, isLoading: false, cart: action.payload, error: null };
    case ACTIONS.LOAD_FAILURE:
      return { ...state, isLoading: false, error: action.payload };
    case ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };
    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [state, dispatch] = useReducer(reducer, initialState);

  const refresh = async () => {
    if (!isAuthenticated) {
      dispatch({ type: ACTIONS.LOAD_SUCCESS, payload: null });
      return;
    }

    try {
      dispatch({ type: ACTIONS.LOAD_START });
      const data = await apiService.getCart();
      dispatch({ type: ACTIONS.LOAD_SUCCESS, payload: data.cart });
    } catch (e) {
      dispatch({ type: ACTIONS.LOAD_FAILURE, payload: e.message || 'Failed to load cart' });
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const addItem = async (productId, quantity = 1) => {
    if (!isAuthenticated) {
      throw new Error('Please login to add items to cart');
    }

    const data = await apiService.addToCart({ productId, quantity });
    dispatch({ type: ACTIONS.LOAD_SUCCESS, payload: data.cart });
    return data.cart;
  };

  const setQuantity = async (productId, quantity) => {
    if (!isAuthenticated) {
      throw new Error('Please login to update cart');
    }

    const data = await apiService.updateCartItem(productId, { quantity });
    dispatch({ type: ACTIONS.LOAD_SUCCESS, payload: data.cart });
    return data.cart;
  };

  const removeItem = async (productId) => {
    if (!isAuthenticated) {
      throw new Error('Please login to update cart');
    }

    const data = await apiService.removeCartItem(productId);
    dispatch({ type: ACTIONS.LOAD_SUCCESS, payload: data.cart });
    return data.cart;
  };

  const clearError = () => dispatch({ type: ACTIONS.CLEAR_ERROR });

  const value = useMemo(
    () => ({
      ...state,
      refresh,
      addItem,
      setQuantity,
      removeItem,
      clearError
    }),
    [state]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return ctx;
};

export default CartContext;
