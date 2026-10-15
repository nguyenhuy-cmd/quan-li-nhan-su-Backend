/**
 * editEmployeeModule.js
 * Module Sửa Thông tin Nhân viên:
 * - Tìm kiếm nhân viên bằng mã, ID hoặc họ tên
 * - Preload thông tin nhân sự vào form chỉnh sửa
 * - Sử dụng Closure để quản lý trạng thái phiên sửa (Edit Session State & Dirty Check)
 * - Xác nhận trước khi cập nhật dữ liệu vào EmployeeDbModule
 */

import { showToast, showConfirmModal, validators, formatCurrency } from './uiHelper.js';

// Closure quản lý trạng thái phiên chỉnh sửa (Edit Session Closure)
const createEditSession = () => {
  let originalEmployee = null;
  let currentEmployeeId = null;

  return {
    startSession: (emp) => {
      originalEmployee = { ...emp };
      currentEmployeeId = emp.id;
    },
    getOriginal: () => (originalEmployee ? { ...originalEmployee } : null),
    getCurrentId: () => currentEmployeeId,
    hasChanged: (newData) => {
      if (!originalEmployee) return false;
      return Object.keys(newData).some(key => {
        // So sánh giá trị nếu có
        return String(newData[key] ?? '').trim() !== String(originalEmployee[key] ?? '').trim();
      });
    },
    clearSession: () => {
      originalEmployee = null;
      currentEmployeeId = null;
    }
  };
};

export class EditEmployeeModule {
  constructor(employeeDbModule, departmentModule, positionModule) {
    this.db = employeeDbModule;
    this.deptModule = departmentModule;
    this.posModule = positionModule;
    this.session = createEditSession();
  }

  // Render view tìm kiếm & form chỉnh sửa
  renderView(container, initialEmpId = null, onUpdatedCallback = null) {
    const departments = this.deptModule.getDepartmentsSync();
    const positions = this.posModule.getPositionsSync();
    const allEmployees = this.db.getAllEmployeesSync();

    container.innerHTML = `
      <div class="module-card animate-fade-in">
        <div class="module-header">
          <h2 class="module-title">Cập Nhật Thông Tin Nhân Viên</h2>
          <p class="module-desc">Tìm kiếm nhân sự theo Mã hoặc Tên để tải dữ liệu và chỉnh sửa</p>
        </div>

        <!-- Thanh tìm kiếm nhanh nhân viên -->
        <div class="search-panel mb-4">
          <div class="flex-gap">
            <div class="form-group flex-1">
              <label for="select-emp-to-edit">Chọn nhân viên từ danh sách</label>
              <select id="select-emp-to-edit" class="form-control">
                <option value="">-- Chọn nhân viên cần chỉnh sửa --</option>
                ${allEmployees.map(e => `<option value="${e.id}" ${initialEmpId === e.id ? 'selected' : ''}>[${e.code}] ${e.name} - ${e.email}</option>`).join('')}
              </select>
            </div>
            <div class="form-group flex-1">
              <label for="input-search-edit">Hoặc nhập Mã / Tên để tìm</label>
              <div class="input-with-button">
                <input type="text" id="input-search-edit" class="form-control" placeholder="Ví dụ: NV001 hoặc Hoàng" />
                <button type="button" id="btn-search-edit" class="btn btn-secondary">Tìm kiếm</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Khung Form Chỉnh Sửa (ẩn ban đầu nếu chưa chọn) -->
        <div id="edit-form-wrapper" class="${initialEmpId ? '' : 'hidden'}">
          <div class="alert alert-info flex-between mb-3">
            <span>Đang chỉnh sửa hồ sơ nhân viên: <strong id="lbl-editing-name">---</strong> (<span id="lbl-editing-code" class="font-mono">---</span>)</span>
            <button id="btn-cancel-edit" class="btn btn-sm btn-outline-secondary">Đóng / Hủy</button>
          </div>

          <form id="form-edit-employee" class="form-grid">
            <input type="hidden" id="edit-id" />

            <div class="form-group">
              <label for="edit-code">Mã Nhân Viên <span class="text-danger">*</span></label>
              <input type="text" id="edit-code" class="form-control font-mono font-bold" required />
            </div>

            <div class="form-group">
              <label for="edit-name">Họ và Tên <span class="text-danger">*</span></label>
              <input type="text" id="edit-name" class="form-control" required />
            </div>

            <div class="form-group">
              <label for="edit-email">Email <span class="text-danger">*</span></label>
              <input type="email" id="edit-email" class="form-control" required />
            </div>

            <div class="form-group">
              <label for="edit-phone">Số Điện Thoại</label>
              <input type="tel" id="edit-phone" class="form-control" />
            </div>

            <div class="form-group">
              <label for="edit-gender">Giới Tính</label>
              <select id="edit-gender" class="form-control">
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
              </select>
            </div>

            <div class="form-group">
              <label for="edit-dob">Ngày Sinh</label>
              <input type="date" id="edit-dob" class="form-control" />
            </div>

            <div class="form-group">
              <label for="edit-dept">Phòng Ban <span class="text-danger">*</span></label>
              <select id="edit-dept" class="form-control" required>
                <option value="">-- Chọn phòng ban --</option>
                ${departments.map(d => `<option value="${d.id}">${d.name} (${d.code})</option>`).join('')}
              </select>
            </div>

            <div class="form-group">
              <label for="edit-pos">Vị Trí / Chức Danh <span class="text-danger">*</span></label>
              <select id="edit-pos" class="form-control" required>
                <option value="">-- Chọn chức danh --</option>
                ${positions.map(p => `<option value="${p.id}" data-salary="${p.salaryBase}">${p.title} - ${formatCurrency(p.salaryBase)}</option>`).join('')}
              </select>
            </div>

            <div class="form-group">
              <label for="edit-salary">Lương Cơ Bản (VND) <span class="text-danger">*</span></label>
              <input type="number" id="edit-salary" class="form-control" min="1000000" step="500000" required />
            </div>

            <div class="form-group">
              <label for="edit-hiredate">Ngày Vào Làm <span class="text-danger">*</span></label>
              <input type="date" id="edit-hiredate" class="form-control" required />
            </div>

            <div class="form-group">
              <label for="edit-bonus">Phụ Cấp / Thưởng (VND)</label>
              <input type="number" id="edit-bonus" class="form-control" min="0" step="100000" />
            </div>

            <div class="form-group">
              <label for="edit-deduction">Khoản Khấu Trừ / Giảm Trừ (VND)</label>
              <input type="number" id="edit-deduction" class="form-control" min="0" step="100000" />
            </div>

            <div class="form-group">
              <label for="edit-status">Trạng Thái Làm Việc</label>
              <select id="edit-status" class="form-control">
                <option value="active">Chính thức (Active)</option>
                <option value="probation">Thử việc (Probation)</option>
                <option value="resigned">Đã nghỉ việc (Resigned)</option>
              </select>
            </div>

            <div class="form-actions col-span-2 flex-end">
              <button type="button" id="btn-reset-original" class="btn btn-secondary">Khôi Phục Ban Đầu</button>
              <button type="submit" id="btn-submit-edit" class="btn btn-warning">
                <span class="btn-text">Lưu Cập Nhật Hồ Sơ</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    // DOM Elements
    const selectEmp = container.querySelector('#select-emp-to-edit');
    const inputSearch = container.querySelector('#input-search-edit');
    const btnSearch = container.querySelector('#btn-search-edit');
    const formWrapper = container.querySelector('#edit-form-wrapper');
    const form = container.querySelector('#form-edit-employee');
    const lblName = container.querySelector('#lbl-editing-name');
    const lblCode = container.querySelector('#lbl-editing-code');
    const btnCancel = container.querySelector('#btn-cancel-edit');
    const btnResetOriginal = container.querySelector('#btn-reset-original');

    // Hàm nạp dữ liệu nhân viên vào form thông qua Closure
    const loadEmployeeData = (emp) => {
      if (!emp) return;
      this.session.startSession(emp); // Khởi tạo closure session

      lblName.textContent = emp.name;
      lblCode.textContent = emp.code;

      form.querySelector('#edit-id').value = emp.id;
      form.querySelector('#edit-code').value = emp.code || '';
      form.querySelector('#edit-name').value = emp.name || '';
      form.querySelector('#edit-email').value = emp.email || '';
      form.querySelector('#edit-phone').value = emp.phone || '';
      form.querySelector('#edit-gender').value = emp.gender || 'male';
      form.querySelector('#edit-dob').value = emp.dateOfBirth || '';
      form.querySelector('#edit-dept').value = emp.departmentId || '';
      form.querySelector('#edit-pos').value = emp.positionId || '';
      form.querySelector('#edit-salary').value = emp.salary || 0;
      form.querySelector('#edit-hiredate').value = emp.hireDate || '';
      form.querySelector('#edit-bonus').value = emp.bonus || 0;
      form.querySelector('#edit-deduction').value = emp.deduction || 0;
      form.querySelector('#edit-status').value = emp.status || 'active';

      formWrapper.classList.remove('hidden');
      form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    // Nếu có initialEmpId thì load luôn
    if (initialEmpId) {
      const targetEmp = allEmployees.find(e => e.id === initialEmpId);
      if (targetEmp) loadEmployeeData(targetEmp);
    }

    // Event khi chọn từ dropdown
    selectEmp.addEventListener('change', () => {
      const id = selectEmp.value;
      if (!id) {
        formWrapper.classList.add('hidden');
        this.session.clearSession();
        return;
      }
      const emp = allEmployees.find(e => e.id === id);
      loadEmployeeData(emp);
    });

    // Event khi tìm kiếm qua ô input
    btnSearch.addEventListener('click', () => {
      const q = inputSearch.value.trim().toLowerCase();
      if (!q) {
        showToast('Vui lòng nhập mã hoặc tên nhân viên cần tìm', 'warning');
        return;
      }
      const match = allEmployees.find(e =>
        e.code?.toLowerCase().includes(q) ||
        e.name?.toLowerCase().includes(q)
      );

      if (match) {
        selectEmp.value = match.id;
        loadEmployeeData(match);
        showToast(`Đã tìm thấy nhân viên: ${match.name}`, 'success');
      } else {
        showToast(`Không tìm thấy nhân viên khớp với từ khóa "${q}"`, 'error');
      }
    });

    // Enter để tìm kiếm
    inputSearch.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        btnSearch.click();
      }
    });

    // Đóng form
    btnCancel.addEventListener('click', () => {
      formWrapper.classList.add('hidden');
      this.session.clearSession();
      selectEmp.value = '';
    });

    // Khôi phục ban đầu từ closure
    btnResetOriginal.addEventListener('click', () => {
      const original = this.session.getOriginal();
      if (original) {
        loadEmployeeData(original);
        showToast('Đã khôi phục dữ liệu ban đầu', 'info');
      }
    });

    // Submit form edit
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const id = form.querySelector('#edit-id').value;
      const updatedData = {
        code: form.querySelector('#edit-code').value.trim().toUpperCase(),
        name: form.querySelector('#edit-name').value.trim(),
        email: form.querySelector('#edit-email').value.trim().toLowerCase(),
        phone: form.querySelector('#edit-phone').value.trim(),
        gender: form.querySelector('#edit-gender').value,
        dateOfBirth: form.querySelector('#edit-dob').value || null,
        departmentId: form.querySelector('#edit-dept').value,
        positionId: form.querySelector('#edit-pos').value,
        salary: Number(form.querySelector('#edit-salary').value),
        bonus: Number(form.querySelector('#edit-bonus').value) || 0,
        deduction: Number(form.querySelector('#edit-deduction').value) || 0,
        hireDate: form.querySelector('#edit-hiredate').value,
        status: form.querySelector('#edit-status').value
      };

      // Kiểm tra validation
      if (!validators.isNotEmpty(updatedData.name)) {
        showToast('Họ tên không được để trống', 'error');
        return;
      }
      if (!validators.isEmail(updatedData.email)) {
        showToast('Email không đúng định dạng', 'error');
        return;
      }
      if (!validators.isPositiveNumber(updatedData.salary)) {
        showToast('Lương cơ bản phải lớn hơn 0', 'error');
        return;
      }

      // Kiểm tra xem có thay đổi nào so với bản ghi gốc qua Closure không
      if (!this.session.hasChanged(updatedData)) {
        showToast('Bạn chưa thực hiện bất kỳ thay đổi nào để lưu!', 'warning');
        return;
      }

      // Xác nhận trước khi cập nhật
      const confirmed = await showConfirmModal(
        'Xác Nhận Cập Nhật Hồ Sơ',
        `Bạn có chắc chắn muốn lưu các thay đổi cho nhân viên "${updatedData.name}"?`
      );

      if (!confirmed) return;

      const submitBtn = container.querySelector('#btn-submit-edit');
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner-small"></span> Đang lưu...';

      try {
        const saved = await this.db.updateEmployee(id, updatedData);
        this.session.startSession(saved); // Cập nhật lại closure session
        showToast(`Cập nhật thông tin nhân viên "${saved.name}" thành công!`, 'success');
        if (typeof onUpdatedCallback === 'function') {
          onUpdatedCallback(saved);
        }
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span class="btn-text">Lưu Cập Nhật Hồ Sơ</span>';
      }
    });
  }
}
