



const API_BASE_URL = import.meta.env.VITE_API_BASE;

class ApiService {
  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;

    const config = {
      method: options.method || 'GET',
      credentials: 'include', // future-proof (cookies / auth)
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      body: options.body,
    };

    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);

      let data = null;
      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        const message =
          data?.message ||
          `Request failed with status ${response.status}`;
        throw new Error(message);
      }

      return data;
    } catch (error) {
      console.error('API Error:', error.message);
      throw error;
    }
  }

  /* ================= AUTH ================= */

  async signup(userData) {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async forgotPassword(email) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token, password, confirmPassword) {
    return this.request(`/auth/reset-password/${token}`, {
      method: 'POST',
      body: JSON.stringify({ password, confirmPassword }),
    });
  }

  async getProfile() {
    return this.request('/auth/profile');
  }

  /* ================= USERS ================= */

  async getUserProfile() {
    return this.request('/users/me');
  }

  async updateUserProfile(userData) {
    return this.request('/users/me', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async uploadProfilePhoto(formData) {
    // Note: Do not stringify formData or set Content-Type header manually
    const url = `${API_BASE_URL}/users/me/photo`;
    const token = localStorage.getItem('token');

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
        // Content-Type is auto-set with boundary
      },
      body: formData
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Upload failed');
    }

    return response.json();
  }

  /* ================= PRODUCTS ================= */

  async getProducts(params = {}) {
    const queryParams = new URLSearchParams();
    if (params.search) queryParams.append('search', params.search);
    if (params.category) queryParams.append('category', params.category);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);

    const queryString = queryParams.toString();
    return this.request(`/products${queryString ? `?${queryString}` : ''}`);
  }

  async getProduct(id) {
    return this.request(`/products/${id}`);
  }

  async createProduct(payload) {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getAdminInventory() {
    return this.request('/products/admin/inventory');
  }

  async updateProduct(id, payload) {
    return this.request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async deleteProduct(id) {
    return this.request(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  /* ================= CLOUDINARY ================= */

  async getCloudinarySignature() {
    return this.request('/cloudinary/signature', {
      method: 'POST',
    });
  }

  async deleteCloudinaryImage(publicId) {
    const encoded = encodeURIComponent(publicId);
    return this.request(`/cloudinary/image?publicId=${encoded}`, {
      method: 'DELETE',
    });
  }

  /* ================= CART ================= */

  async getCart() {
    return this.request('/cart');
  }

  async addToCart(payload) {
    return this.request('/cart/items', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateCartItem(productId, payload) {
    return this.request(`/cart/items/${productId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }

  async removeCartItem(productId) {
    return this.request(`/cart/items/${productId}`, {
      method: 'DELETE',
    });
  }

  /* ================= PAYMENTS ================= */

  async createRazorpayOrder() {
    try {
      return await this.request('/payment/create-order', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Create Razorpay order failed:', error.message);
      throw error;
    }
  }

  async verifyRazorpayPayment(payload) {
    return this.request('/payment/verify', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async markPaymentFailed(payload) {
    return this.request('/payment/fail', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getOrder(id) {
    return this.request(`/orders/${id}`);
  }

  async getActiveOrders() {
    return this.request('/orders/active');
  }

  async getOrderHistory() {
    return this.request('/orders/history');
  }

  async cancelOrder(id) {
    return this.request(`/orders/${id}/cancel`, {
      method: 'PATCH',
    });
  }

  /* ================= ADMIN ================= */

  async getAdminOrders(params = {}) {
    const queryParams = new URLSearchParams();
    if (params.status) queryParams.append('status', params.status);
    if (params.paymentStatus) queryParams.append('paymentStatus', params.paymentStatus);

    const queryString = queryParams.toString();
    return this.request(`/admin/orders${queryString ? `?${queryString}` : ''}`);
  }

  async getAdminOrder(orderId) {
    return this.request(`/admin/orders/${orderId}`);
  }

  async updateOrderStatus(orderId, orderStatus) {
    return this.request(`/admin/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ orderStatus }),
    });
  }

  async deleteAdminOrder(orderId) {
    return this.request(`/admin/orders/${orderId}`, {
      method: 'DELETE',
    });
  }

  /* ================= REVIEWS ================= */

  async getReviews(productId) {
    return this.request(`/reviews/${productId}`);
  }

  async addReview(productId, payload) {
    return this.request(`/reviews/${productId}`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateReview(reviewId, payload) {
    return this.request(`/reviews/${reviewId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async deleteReview(reviewId) {
    return this.request(`/reviews/${reviewId}`, {
      method: 'DELETE',
    });
  }

  /* ================= WISHLIST ================= */

  async getWishlist() {
    return this.request('/wishlist');
  }

  async addToWishlist(productId) {
    return this.request(`/wishlist/${productId}`, {
      method: 'POST',
    });
  }

  async removeFromWishlist(productId) {
    return this.request(`/wishlist/${productId}`, {
      method: 'DELETE',
    });
  }

  /* ================= CHAT ================= */

  async sendMessage(message, conversationHistory = []) {
    return this.request('/chat', {
      method: 'POST',
      body: JSON.stringify({ message, conversationHistory }),
    });
  }

  /* ================= UTILITIES ================= */

  setToken(token) {
    localStorage.setItem('token', token);
  }

  getToken() {
    return localStorage.getItem('token');
  }

  removeToken() {
    localStorage.removeItem('token');
  }

  setUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
  }

  getUser() {
    const user = localStorage.getItem('user');
    return user && user !== 'undefined' ? JSON.parse(user) : null;
  }

  removeUser() {
    localStorage.removeItem('user');
  }

  isAuthenticated() {
    return !!this.getToken();
  }

  isAdmin() {
    const user = this.getUser();
    return (
      user &&
      typeof user.role === 'string' &&
      user.role.toLowerCase() === 'admin'
    );
  }

  logout() {
    this.removeToken();
    this.removeUser();
  }
}

export default new ApiService();
