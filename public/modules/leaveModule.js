/**
 * leaveModule.js
 * Module Quản lý Nghỉ phép:
 * - Tiếp nhận đơn xin nghỉ phép (Nghỉ phép năm, Nghỉ ốm, Nghỉ không lương)
 * - Tự động tính số ngày nghỉ dựa trên khoảng startDate - endDate
 * - Quản lý quỹ phép năm cá nhân (Leave Balance - mặc định 20 ngày phép/năm)
 * - Phê duyệt (Approve) hoặc Từ chối (Reject) đơn nghỉ phép
 * - Lưu trữ trong localStorage ('hrm_leaves')
 */

import { formatDate, showToast, showConfirmModal } from './uiHelper.js';

const STORAGE_KEY_LEAVES = 'hrm_leaves';
const DEFAULT_ANNUAL_LEAVE_ALLOWANCE = 20; // 20 ngày phép tiêu chuẩn mỗi năm

export class LeaveModule {
  constructor(employeeDbModule) {
    this.db = employeeDbModule;
    this.initDefaultLeaves();
  }

  // Khởi tạo các đơn nghỉ mẫu
  initDefaultLeaves() {
    const existing = localStorage.getItem(STORAGE_KEY_LEAVES);
    if (!existing) {
      const defaultLeaves = [
        {
          id: 'leave_01',
          employeeId: 'emp_01', // Nguyễn Văn An
          type: 'annual',
          startDate: '2025-05-10',
          endDate: '2025-05-12',
          days: 3,
          reason: 'Nghỉ du lịch hè cùng gia đình',
          status: 'approved',
          createdAt: '2025-05-01'
        },
        {
          id: 'leave_02',
          employeeId: 'emp_03', // Lê Hoàng Nam
          type: 'sick',
          startDate: '2025-06-15',
          endDate: '2025-06-16',
          days: 2,
          reason: 'Bị sốt xuất huyết có giấy chứng nhận y tế',
          status: 'approved',
          createdAt: '2025-06-15'
        },
        {
          id: 'leave_03',
          employeeId: 'emp_04', // Phạm Hương Giang
          type: 'annual',
          startDate: '2025-07-20',
          endDate: '2025-07-21',
          days: 2,
          reason: 'Giải quyết việc riêng gia đình',
          status: 'pending',
          createdAt: '2025-07-15'
        }
      ];
      this.saveLeaves(defaultLeaves);
    }
  }

  getLeavesSync() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY_LEAVES)) || [];
    } catch {
      return [];
    }
  }

  saveLeaves(leaves) {
    localStorage.setItem(STORAGE_KEY_LEAVES, JSON.stringify(leaves));
  }

  // Tính số ngày nghỉ từ ngày bắt đầu đến ngày kết thúc
  calculateDays(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return 0;
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Tính cả ngày bắt đầu và kết thúc
  }

  // Lấy số ngày phép còn lại của nhân viên (Higher-Order Function reduce)
  getLeaveBalance(employeeId) {
    const leaves = this.getLeavesSync();
    const usedDays = leaves
      .filter(l => l.employeeId === employeeId && l.type === 'annual' && l.status === 'approved')
      .reduce((sum, item) => sum + item.days, 0);

    const pendingDays = leaves
      .filter(l => l.employeeId === employeeId && l.type === 'annual' && l.status === 'pending')
      .reduce((sum, item) => sum + item.days, 0);

    const remaining = Math.max(0, DEFAULT_ANNUAL_LEAVE_ALLOWANCE - usedDays);

    return {
      totalAllowance: DEFAULT_ANNUAL_LEAVE_ALLOWANCE,
      usedDays,
      pendingDays,
      remainingDays: remaining
    };
  }

  // Gửi đơn xin nghỉ phép
  async requestLeave({ employeeId, startDate, endDate, type, reason }) {
    await new Promise(r => setTimeout(r, 200));

    if (!employeeId) throw new Error('Vui lòng chọn nhân viên xin nghỉ phép');
    if (!startDate || !endDate) throw new Error('Vui lòng chọn đầy đủ ngày bắt đầu và kết thúc');
    if (new Date(endDate) < new Date(startDate)) throw new Error('Ngày kết thúc không thể trước ngày bắt đầu');

    const days = this.calculateDays(startDate, endDate);
    if (days <= 0) throw new Error('Số ngày nghỉ không hợp lệ');

    // Nếu là nghỉ phép năm, kiểm tra xem có vượt quá hạn mức còn lại không
    if (type === 'annual') {
      const balance = this.getLeaveBalance(employeeId);
      if (days > balance.remainingDays) {
        throw new Error(`Số ngày xin nghỉ (${days} ngày) vượt quá số ngày phép năm còn lại (${balance.remainingDays} ngày)!`);
      }
    }

    const leaves = this.getLeavesSync();
    const newLeave = {
      id: 'leave_' + Date.now(),
      employeeId,
      type: type || 'annual',
      startDate,
      endDate,
      days,
      reason: (reason || '').trim() || 'Lý do cá nhân',
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0]
    };

    leaves.unshift(newLeave);
    this.saveLeaves(leaves);
    return newLeave;
  }

  // Phê duyệt đơn nghỉ phép
  async approveLeave(leaveId) {
    await new Promise(r => setTimeout(r, 150));
    const leaves = this.getLeavesSync();
    const item = leaves.find(l => l.id === leaveId);
    if (!item) throw new Error('Không tìm thấy đơn nghỉ phép');

    // Kiểm tra lại balance
    if (item.type === 'annual') {
      const balance = this.getLeaveBalance(item.employeeId);
      if (item.days > balance.remainingDays && item.status !== 'approved') {
        throw new Error('Số ngày phép của nhân viên không còn đủ để duyệt đơn này!');
      }
    }

    item.status = 'approved';
    item.reviewedAt = new Date().toISOString();
    this.saveLeaves(leaves);
    return item;
  }

  // Từ chối đơn nghỉ phép
  async rejectLeave(leaveId) {
    await new Promise(r => setTimeout(r, 150));
    const leaves = this.getLeavesSync();
    const item = leaves.find(l => l.id === leaveId);
    if (!item) throw new Error('Không tìm thấy đơn nghỉ phép');

    item.status = 'rejected';
    item.reviewedAt = new Date().toISOString();
    this.saveLeaves(leaves);
    return item;
  }

  // Render view quản lý nghỉ phép
  renderView(container) {
    const allEmployees = this.db.getAllEmployeesSync();
    const leaves = this.getLeavesSync();

    const pendingCount = leaves.filter(l => l.status === 'pending').length;
    const approvedCount = leaves.filter(l => l.status === 'approved').length;

    container.innerHTML = `
      <div class="module-card animate-fade-in">
        <div class="module-header flex-between">
          <div>
            <h2 class="module-title">Quản Lý Nghỉ Phép (Leave Management)</h2>
            <p class="module-desc">Theo dõi hạn mức 20 ngày phép/năm, xét duyệt và xử lý đơn xin nghỉ của nhân sự</p>
          </div>
          <button id="btn-open-request-leave" class="btn btn-primary">
            <span>+ Tạo Đơn Xin Nghỉ Mới</span>
          </button>
        </div>

        <!-- Thống kê trạng thái -->
        <div class="grid grid-3 gap-3 mb-4">
          <div class="stat-card stat-warning">
            <div class="stat-label">Đơn Chờ Xét Duyệt</div>
            <div class="stat-value text-warning">${pendingCount}</div>
            <div class="stat-sub">Cần người quản lý duyệt</div>
          </div>
          <div class="stat-card stat-success">
            <div class="stat-label">Đơn Đã Chấp Thuận</div>
            <div class="stat-value text-success">${approvedCount}</div>
            <div class="stat-sub">Đã trừ vào hạn mức phép</div>
          </div>
          <div class="stat-card stat-primary">
            <div class="stat-label">Hạn Mức Phép Năm Mặc Định</div>
            <div class="stat-value text-primary">${DEFAULT_ANNUAL_LEAVE_ALLOWANCE} Ngày</div>
            <div class="stat-sub">Áp dụng cho nhân viên chính thức</div>
          </div>
        </div>

        <!-- Bảng danh sách đơn nghỉ phép -->
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Mã Đơn</th>
                <th>Nhân Viên</th>
                <th>Loại Nghỉ</th>
                <th>Thời Gian Nghỉ</th>
                <th>Số Ngày</th>
                <th>Lý Do Xin Nghỉ</th>
                <th>Trạng Thái</th>
                <th class="text-right">Xét Duyệt</th>
              </tr>
            </thead>
            <tbody id="leave-table-tbody">
              ${leaves.length === 0 ? `<tr><td colspan="8" class="text-center py-4 text-muted">Chưa có đơn nghỉ phép nào.</td></tr>` : ''}
              ${leaves.map(l => {
                const emp = allEmployees.find(e => e.id === l.employeeId);
                const typeLabels = {
                  annual: '<span class="badge badge-primary">Phép năm</span>',
                  sick: '<span class="badge badge-warning">Nghỉ ốm</span>',
                  unpaid: '<span class="badge badge-neutral">Không lương</span>'
                };
                const statusBadges = {
                  pending: '<span class="badge badge-warning">Chờ duyệt</span>',
                  approved: '<span class="badge badge-success">Đã duyệt</span>',
                  rejected: '<span class="badge badge-danger">Từ chối</span>'
                };

                return `
                  <tr data-id="${l.id}">
                    <td><span class="font-mono text-muted text-xs">${l.id}</span></td>
                    <td>
                      <div class="font-bold">${emp ? emp.name : 'N/A'}</div>
                      <div class="text-xs text-muted">${emp ? emp.code : ''}</div>
                    </td>
                    <td>${typeLabels[l.type] || l.type}</td>
                    <td>
                      <div class="font-mono text-sm">${formatDate(l.startDate)} &rarr; ${formatDate(l.endDate)}</div>
                    </td>
                    <td><span class="badge badge-purple">${l.days} ngày</span></td>
                    <td class="text-muted" style="max-width: 200px;">${l.reason}</td>
                    <td>${statusBadges[l.status] || l.status}</td>
                    <td class="text-right">
                      ${l.status === 'pending' ? `
                        <button class="btn btn-sm btn-outline-success btn-approve-leave" data-id="${l.id}">Duyệt</button>
                        <button class="btn btn-sm btn-outline-danger btn-reject-leave" data-id="${l.id}">Bác</button>
                      ` : `
                        <span class="text-muted text-xs">Đã xử lý</span>
                      `}
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        <!-- Modal Tạo Đơn Nghỉ Phép Mới -->
        <div id="modal-leave" class="modal-backdrop hidden">
          <div class="modal-card animate-scale-up">
            <div class="modal-header">
              <h3 class="modal-title">Tạo Đơn Xin Nghỉ Phép Mới</h3>
              <button id="btn-close-leave-modal" class="modal-close-btn">&times;</button>
            </div>
            <form id="form-leave-request" class="modal-body">
              <div class="form-group">
                <label for="leave-emp">Nhân viên xin nghỉ <span class="text-danger">*</span></label>
                <select id="leave-emp" class="form-control" required>
                  <option value="">-- Chọn nhân viên --</option>
                  ${allEmployees.map(e => `<option value="${e.id}">[${e.code}] ${e.name}</option>`).join('')}
                </select>
              </div>

              <!-- Hộp hiển thị số ngày phép còn lại -->
              <div id="leave-balance-info" class="alert alert-info hidden mb-3">
                <span>Số ngày phép năm còn lại: <strong id="val-leave-balance" class="font-bold">20</strong> ngày</span>
              </div>

              <div class="form-group">
                <label for="leave-type">Hình thức nghỉ phép <span class="text-danger">*</span></label>
                <select id="leave-type" class="form-control" required>
                  <option value="annual">Nghỉ phép năm (Có hưởng nguyên lương)</option>
                  <option value="sick">Nghỉ ốm đau / Y tế</option>
                  <option value="unpaid">Nghỉ việc riêng không hưởng lương</option>
                </select>
              </div>

              <div class="grid grid-2 gap-3">
                <div class="form-group">
                  <label for="leave-start">Từ ngày <span class="text-danger">*</span></label>
                  <input type="date" id="leave-start" class="form-control" required />
                </div>
                <div class="form-group">
                  <label for="leave-end">Đến ngày <span class="text-danger">*</span></label>
                  <input type="date" id="leave-end" class="form-control" required />
                </div>
              </div>

              <div class="alert alert-neutral mb-3">
                Tổng số ngày nghỉ dự tính: <strong id="calc-days-display" class="font-bold text-primary font-mono">0 ngày</strong>
              </div>

              <div class="form-group">
                <label for="leave-reason">Lý do xin nghỉ</label>
                <textarea id="leave-reason" class="form-control" rows="2" placeholder="Nêu rõ lý do xin nghỉ phép..."></textarea>
              </div>

              <div class="modal-footer">
                <button type="button" id="btn-cancel-leave-modal" class="btn btn-secondary">Đóng</button>
                <button type="submit" class="btn btn-primary">Gửi Đơn Xin Nghỉ</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    const modal = container.querySelector('#modal-leave');
    const form = container.querySelector('#form-leave-request');
    const openBtn = container.querySelector('#btn-open-request-leave');
    const closeBtn = container.querySelector('#btn-close-leave-modal');
    const cancelBtn = container.querySelector('#btn-cancel-leave-modal');

    const empSelect = container.querySelector('#leave-emp');
    const balanceBox = container.querySelector('#leave-balance-info');
    const balanceVal = container.querySelector('#val-leave-balance');
    const startInput = container.querySelector('#leave-start');
    const endInput = container.querySelector('#leave-end');
    const typeSelect = container.querySelector('#leave-type');
    const reasonInput = container.querySelector('#leave-reason');
    const daysDisplay = container.querySelector('#calc-days-display');

    const updateDaysCalculation = () => {
      const s = startInput.value;
      const e = endInput.value;
      if (s && e) {
        const days = this.calculateDays(s, e);
        daysDisplay.textContent = `${days} ngày`;
      } else {
        daysDisplay.textContent = '0 ngày';
      }
    };

    empSelect.addEventListener('change', () => {
      const id = empSelect.value;
      if (id) {
        const balance = this.getLeaveBalance(id);
        balanceVal.textContent = balance.remainingDays;
        balanceBox.classList.remove('hidden');
      } else {
        balanceBox.classList.add('hidden');
      }
    });

    startInput.addEventListener('change', updateDaysCalculation);
    endInput.addEventListener('change', updateDaysCalculation);

    const openModal = () => {
      form.reset();
      balanceBox.classList.add('hidden');
      daysDisplay.textContent = '0 ngày';
      modal.classList.remove('hidden');
    };

    const closeModal = () => modal.classList.add('hidden');

    openBtn.addEventListener('click', openModal);
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);

    // Gửi đơn
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        await this.requestLeave({
          employeeId: empSelect.value,
          startDate: startInput.value,
          endDate: endInput.value,
          type: typeSelect.value,
          reason: reasonInput.value
        });
        showToast('Đã gửi đơn xin nghỉ phép thành công!', 'success');
        closeModal();
        this.renderView(container);
      } catch (err) {
        showToast(err.message, 'error');
      }
    });

    // Duyệt đơn
    container.querySelectorAll('.btn-approve-leave').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        try {
          await this.approveLeave(id);
          showToast('Đã phê duyệt đơn nghỉ phép!', 'success');
          this.renderView(container);
        } catch (err) {
          showToast(err.message, 'error');
        }
      });
    });

    // Bác đơn
    container.querySelectorAll('.btn-reject-leave').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        try {
          await this.rejectLeave(id);
          showToast('Đã từ chối đơn nghỉ phép', 'info');
          this.renderView(container);
        } catch (err) {
          showToast(err.message, 'error');
        }
      });
    });
  }
}
