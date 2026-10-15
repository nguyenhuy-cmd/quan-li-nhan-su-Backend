/**
 * uiHelper.js
 * Tiện ích hỗ trợ giao diện người dùng:
 * - Hiển thị Toast notifications
 * - Modal xác nhận / cảnh báo / tùy chỉnh
 * - Định dạng tiền tệ VND, ngày tháng
 * - Hàm validate dùng chung (modular, tái sử dụng theo yêu cầu đề bài)
 */

// Hàm định dạng tiền tệ Việt Nam Đồng (VND)
export const formatCurrency = (amount) => {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(num);
};

// Hàm định dạng ngày tháng DD/MM/YYYY
export const formatDate = (dateString) => {
  if (!dateString) return '---';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '---';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

// Định dạng giờ phút HH:mm:ss
export const formatDateTime = (dateString) => {
  if (!dateString) return '---';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '---';
  return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' ' + formatDate(dateString);
};

// Hàm validate dữ liệu (Higher-Order Validation Utilities)
export const validators = {
  isNotEmpty: (val) => String(val || '').trim().length > 0,
  isEmail: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim()),
  isPhone: (phone) => /^(0[3|5|7|8|9])[0-9]{8}$/.test(String(phone || '').trim()),
  isPositiveNumber: (num) => !isNaN(num) && Number(num) > 0,
  isNonNegativeNumber: (num) => !isNaN(num) && Number(num) >= 0,
};

// Hệ thống Toast Notification
export const showToast = (message, type = 'info', duration = 3500) => {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type} animate-slide-in`;

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };

  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || 'ℹ'}</span>
    <span class="toast-message">${message}</span>
    <button class="toast-close" aria-label="Đóng">&times;</button>
  `;

  const closeBtn = toast.querySelector('.toast-close');
  closeBtn.addEventListener('click', () => {
    toast.classList.add('animate-slide-out');
    setTimeout(() => toast.remove(), 300);
  });

  container.appendChild(toast);

  setTimeout(() => {
    if (toast.isConnected) {
      toast.classList.add('animate-slide-out');
      setTimeout(() => toast.remove(), 300);
    }
  }, duration);
};

// Modal xác nhận tùy chỉnh (trả về Promise)
export const showConfirmModal = (title, message, confirmText = 'Xác nhận', cancelText = 'Hủy bỏ') => {
  return new Promise((resolve) => {
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop animate-fade-in';

    backdrop.innerHTML = `
      <div class="modal-card animate-scale-up">
        <div class="modal-header">
          <h3 class="modal-title">${title}</h3>
          <button class="modal-close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <p>${message}</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary cancel-btn">${cancelText}</button>
          <button class="btn btn-danger confirm-btn">${confirmText}</button>
        </div>
      </div>
    `;

    const cleanUp = (result) => {
      backdrop.classList.add('animate-fade-out');
      setTimeout(() => {
        backdrop.remove();
        resolve(result);
      }, 200);
    };

    backdrop.querySelector('.confirm-btn').addEventListener('click', () => cleanUp(true));
    backdrop.querySelector('.cancel-btn').addEventListener('click', () => cleanUp(false));
    backdrop.querySelector('.modal-close-btn').addEventListener('click', () => cleanUp(false));
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) cleanUp(false);
    });

    document.body.appendChild(backdrop);
  });
};

// Loading indicator helper
export const showLoading = (containerEl, text = 'Đang xử lý dữ liệu...') => {
  const loading = document.createElement('div');
  loading.className = 'loading-overlay';
  loading.innerHTML = `
    <div class="spinner"></div>
    <span class="loading-text">${text}</span>
  `;
  containerEl.style.position = 'relative';
  containerEl.appendChild(loading);
  return () => loading.remove();
};
