/**
 * backendService.js
 * Module tích hợp kết nối với Backend API NestJS:
 * - Hỗ trợ chuyển đổi giữa chế độ LocalStorage (mặc định nộp bài) và Backend API (NestJS http://localhost:3000)
 * - Tự động phát hiện Backend đang chạy hay tắt
 * - Cung cấp hàm đồng bộ dữ liệu giữa LocalStorage và MongoDB
 */

import { showToast } from './uiHelper.js';

const STORAGE_KEY_MODE = 'hrm_data_mode'; // 'local' | 'backend'
// Khi frontend được serve cùng backend (NestJS ServeStatic), API nằm chung origin — dùng '' để gọi relative
// Khi dev local riêng lẻ (server.cjs trên 5500), set localStorage 'hrm_api_url' = 'http://localhost:3000'
const DEFAULT_API_URL =
  localStorage.getItem('hrm_api_url') ||
  (typeof window !== 'undefined' && window.location.port === '5500'
    ? 'http://localhost:3000'
    : '');

export class BackendService {
  constructor() {
    this.mode = localStorage.getItem(STORAGE_KEY_MODE) || 'local';
    this.apiUrl = DEFAULT_API_URL;
    this.token = null;
  }

  getMode() {
    return this.mode;
  }

  setMode(newMode) {
    this.mode = newMode;
    localStorage.setItem(STORAGE_KEY_MODE, newMode);
  }

  setToken(token) {
    this.token = token;
  }

  // Kiểm tra tình trạng kết nối tới NestJS Backend
  async checkBackendHealth() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(`${this.apiUrl}/employees`, {
        method: 'GET',
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return res.status === 200 || res.status === 401; // Server đang phản hồi
    } catch {
      return false;
    }
  }

  // Đăng nhập qua API Backend NestJS
  async apiLogin(username, password) {
    const res = await fetch(`${this.apiUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || 'Đăng nhập API Backend thất bại');
    }
    return json.data || json;
  }
}
