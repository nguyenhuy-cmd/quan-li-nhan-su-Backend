/**
 * authModule.js
 * Module Xác thực:
 * - Đăng nhập & Đăng ký tài khoản (Admin, HR Manager)
 * - Hash mật khẩu sử dụng Closure
 * - Quản lý Session / Token trong localStorage
 * - Async/await mô phỏng delay xác thực
 */

import { showToast } from './uiHelper.js';

// Closure tạo thuật toán Hashing và Token bí mật (Encapsulated Salt & Hash Logic)
const createSecurityManager = () => {
  const salt = 'HRM_SECRET_SALT_2026';

  // Hàm băm mật khẩu đơn giản bằng closure
  const hashPassword = (password) => {
    let hash = 0;
    const combined = `${salt}_${password}_${salt}`;
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0; // Convert to 32bit integer
    }
    return 'h_' + Math.abs(hash).toString(36) + '_' + btoa(password.slice(0, 3));
  };

  // Hàm tạo token ngẫu nhiên
  const generateToken = (username, role) => {
    const timestamp = Date.now();
    const raw = `${username}:${role}:${timestamp}:${Math.random().toString(36).substring(2)}`;
    return btoa(raw);
  };

  return {
    hashPassword,
    generateToken,
    verifyPassword: (password, hashedPassword) => hashPassword(password) === hashedPassword
  };
};

const securityManager = createSecurityManager();

const STORAGE_KEY_USERS = 'hrm_users';
const STORAGE_KEY_SESSION = 'hrm_current_session';

export class AuthModule {
  constructor() {
    this.initDefaultUsers();
  }

  // Khởi tạo tài khoản mẫu mặc định
  initDefaultUsers() {
    const existing = localStorage.getItem(STORAGE_KEY_USERS);
    if (!existing) {
      const defaultUsers = [
        {
          id: 'usr_admin',
          username: 'admin',
          fullName: 'Nguyễn Văn Quản Trị',
          role: 'ADMIN',
          passwordHash: securityManager.hashPassword('admin123'),
          createdAt: new Date().toISOString()
        },
        {
          id: 'usr_hr',
          username: 'hr_manager',
          fullName: 'Trần Thị Thu Thảo',
          role: 'HR',
          passwordHash: securityManager.hashPassword('hr123456'),
          createdAt: new Date().toISOString()
        }
      ];
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(defaultUsers));
    }
  }

  // Lấy tất cả người dùng từ localStorage
  getUsers() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY_USERS)) || [];
    } catch {
      return [];
    }
  }

  // Đăng ký tài khoản mới (sử dụng async/await giả lập delay)
  async register({ username, fullName, password, role = 'HR' }) {
    await new Promise((resolve) => setTimeout(resolve, 600)); // Giả lập mạng 600ms

    const trimmedUsername = username.trim().toLowerCase();
    if (trimmedUsername.length < 3) {
      throw new Error('Tên đăng nhập phải có ít nhất 3 ký tự');
    }
    if (password.length < 6) {
      throw new Error('Mật khẩu phải có ít nhất 6 ký tự');
    }

    const users = this.getUsers();
    const isExisted = users.some(u => u.username.toLowerCase() === trimmedUsername);
    if (isExisted) {
      throw new Error('Tên đăng nhập đã tồn tại trong hệ thống');
    }

    const newUser = {
      id: 'usr_' + Date.now(),
      username: trimmedUsername,
      fullName: fullName.trim() || trimmedUsername,
      role: role.toUpperCase(),
      passwordHash: securityManager.hashPassword(password),
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
    return newUser;
  }

  // Đăng nhập người dùng (sử dụng async/await)
  async login(username, password) {
    await new Promise((resolve) => setTimeout(resolve, 500)); // Giả lập delay mạng

    const trimmedUsername = username.trim().toLowerCase();
    const users = this.getUsers();
    const user = users.find(u => u.username.toLowerCase() === trimmedUsername);

    if (!user) {
      throw new Error('Tài khoản không tồn tại trên hệ thống');
    }

    const isValid = securityManager.verifyPassword(password, user.passwordHash);
    if (!isValid) {
      throw new Error('Mật khẩu không chính xác');
    }

    // Tạo phiên làm việc (Session Token)
    const token = securityManager.generateToken(user.username, user.role);
    const session = {
      token,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role
      },
      loginAt: new Date().toISOString()
    };

    localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(session));
    return session;
  }

  // Kiểm tra phiên đăng nhập hiện tại
  getCurrentSession() {
    try {
      const data = localStorage.getItem(STORAGE_KEY_SESSION);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  // Kiểm tra trạng thái đã đăng nhập chưa
  isAuthenticated() {
    return !!this.getCurrentSession();
  }

  // Đăng xuất và xóa phiên làm việc
  logout() {
    localStorage.removeItem(STORAGE_KEY_SESSION);
    showToast('Đã đăng xuất khỏi hệ thống', 'info');
  }

  // Render giao diện Form Đăng nhập & Đăng ký
  renderAuthView(container, onAuthSuccess) {
    container.innerHTML = `
      <div class="auth-wrapper animate-fade-in">
        <div class="auth-card">
          <div class="auth-brand">
            <div class="brand-logo">HRM</div>
            <h2>Hệ Thống Quản Lý Nhân Sự</h2>
            <p class="auth-subtitle">Đăng nhập để truy cập trang quản trị</p>
          </div>

          <div class="auth-tabs">
            <button id="tab-login" class="auth-tab-btn active">Đăng nhập</button>
            <button id="tab-register" class="auth-tab-btn">Đăng ký mới</button>
          </div>

          <!-- Form Đăng nhập -->
          <form id="form-login" class="auth-form">
            <div class="form-group">
              <label for="login-username">Tên đăng nhập</label>
              <div class="input-icon-wrapper">
                <input type="text" id="login-username" class="form-control" placeholder="Ví dụ: admin hoặc hr_manager" required autocomplete="username" />
              </div>
            </div>

            <div class="form-group">
              <label for="login-password">Mật khẩu</label>
              <div class="input-icon-wrapper">
                <input type="password" id="login-password" class="form-control" placeholder="Nhập mật khẩu (admin123 / hr123456)" required autocomplete="current-password" />
              </div>
            </div>

            <button type="submit" id="btn-submit-login" class="btn btn-primary btn-block btn-lg">
              <span class="btn-text">Đăng Nhập</span>
            </button>
          </form>

          <!-- Form Đăng ký -->
          <form id="form-register" class="auth-form hidden">
            <div class="form-group">
              <label for="reg-fullname">Họ và tên</label>
              <input type="text" id="reg-fullname" class="form-control" placeholder="Nhập họ và tên đầy đủ" required />
            </div>

            <div class="form-group">
              <label for="reg-username">Tên đăng nhập</label>
              <input type="text" id="reg-username" class="form-control" placeholder="Chọn tên đăng nhập (>=3 ký tự)" required />
            </div>

            <div class="form-group">
              <label for="reg-password">Mật khẩu</label>
              <input type="password" id="reg-password" class="form-control" placeholder="Tối thiểu 6 ký tự" required />
            </div>

            <div class="form-group">
              <label for="reg-role">Vai trò quản lý</label>
              <select id="reg-role" class="form-control">
                <option value="HR">HR Manager (Nhân sự)</option>
              </select>
            </div>

            <button type="submit" id="btn-submit-reg" class="btn btn-success btn-block btn-lg">
              <span class="btn-text">Tạo Tài Khoản Mới</span>
            </button>
          </form>
        </div>
      </div>
    `;

    const tabLogin = container.querySelector('#tab-login');
    const tabRegister = container.querySelector('#tab-register');
    const formLogin = container.querySelector('#form-login');
    const formRegister = container.querySelector('#form-register');

    tabLogin.addEventListener('click', () => {
      tabLogin.classList.add('active');
      tabRegister.classList.remove('active');
      formLogin.classList.remove('hidden');
      formRegister.classList.add('hidden');
    });

    tabRegister.addEventListener('click', () => {
      tabRegister.classList.add('active');
      tabLogin.classList.remove('active');
      formRegister.classList.remove('hidden');
      formLogin.classList.add('hidden');
    });

    // Xử lý submit Login
    formLogin.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = formLogin.querySelector('#btn-submit-login');
      const username = formLogin.querySelector('#login-username').value;
      const password = formLogin.querySelector('#login-password').value;

      btn.disabled = true;
      btn.innerHTML = '<span class="spinner-small"></span> Đang xác thực...';

      try {
        const session = await this.login(username, password);
        showToast(`Xin chào mừng, ${session.user.fullName}!`, 'success');
        if (typeof onAuthSuccess === 'function') onAuthSuccess(session);
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<span class="btn-text">Đăng Nhập</span>';
      }
    });

    // Xử lý submit Register
    formRegister.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = formRegister.querySelector('#btn-submit-reg');
      const fullName = formRegister.querySelector('#reg-fullname').value;
      const username = formRegister.querySelector('#reg-username').value;
      const password = formRegister.querySelector('#reg-password').value;
      const role = formRegister.querySelector('#reg-role').value;

      btn.disabled = true;
      btn.innerHTML = '<span class="spinner-small"></span> Đang tạo tài khoản...';

      try {
        await this.register({ username, fullName, password, role });
        showToast('Đăng ký tài khoản thành công! Hãy đăng nhập.', 'success');
        tabLogin.click();
        formLogin.querySelector('#login-username').value = username;
        formLogin.querySelector('#login-password').focus();
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<span class="btn-text">Tạo Tài Khoản Mới</span>';
      }
    });
  }
}
