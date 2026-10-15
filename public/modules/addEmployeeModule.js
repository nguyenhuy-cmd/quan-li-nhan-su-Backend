/**
 * addEmployeeModule.js
 * Module Thêm Nhân viên Mới:
 * - Render Form DOM động với tự động điền mã nhân viên tiếp theo
 * - Tự động cập nhật mức lương cơ bản khi chọn chức danh (Position)
 * - Validation đầu vào chặt chẽ (Tên không rỗng, Email chuẩn regex, Lương > 0, SĐT)
 * - Thêm vào kho dữ liệu thông qua EmployeeDbModule
 * - Event listeners: submit, change, input
 */

import { showToast, validators, formatCurrency } from './uiHelper.js';

export class AddEmployeeModule {
  constructor(employeeDbModule, departmentModule, positionModule) {
    this.db = employeeDbModule;
    this.deptModule = departmentModule;
    this.posModule = positionModule;
  }

  // Render form thêm nhân viên vào container
  renderView(container, onSuccessCallback) {
    const nextCode = this.db.generateNextCode();
    const departments = this.deptModule.getDepartmentsSync();
    const positions = this.posModule.getPositionsSync();

    container.innerHTML = `
      <div class="module-card animate-fade-in">
        <div class="module-header">
          <h2 class="module-title">Thêm Nhân Viên Mới</h2>
          <p class="module-desc">Nhập đầy đủ thông tin để tạo hồ sơ nhân sự vào hệ thống</p>
        </div>

        <form id="form-add-employee" class="form-grid">
          <!-- Hàng 1: Mã nhân viên & Họ tên -->
          <div class="form-group">
            <label for="emp-code">Mã Nhân Viên <span class="text-danger">*</span></label>
            <input type="text" id="emp-code" class="form-control font-mono font-bold" value="${nextCode}" required />
            <small class="form-hint">Mã được tự động khởi tạo theo thứ tự tăng dần</small>
          </div>

          <div class="form-group">
            <label for="emp-name">Họ và Tên <span class="text-danger">*</span></label>
            <input type="text" id="emp-name" class="form-control" placeholder="Ví dụ: Nguyễn Văn Hoàng" required />
            <div id="err-emp-name" class="invalid-feedback"></div>
          </div>

          <!-- Hàng 2: Email & Số điện thoại -->
          <div class="form-group">
            <label for="emp-email">Địa chỉ Email <span class="text-danger">*</span></label>
            <input type="email" id="emp-email" class="form-control" placeholder="hoang.nguyen@company.vn" required />
            <div id="err-emp-email" class="invalid-feedback"></div>
          </div>

          <div class="form-group">
            <label for="emp-phone">Số Điện Thoại</label>
            <input type="tel" id="emp-phone" class="form-control" placeholder="09xxxxxxxx" />
            <div id="err-emp-phone" class="invalid-feedback"></div>
          </div>

          <!-- Hàng 3: Giới tính & Ngày sinh -->
          <div class="form-group">
            <label for="emp-gender">Giới Tính</label>
            <select id="emp-gender" class="form-control">
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
              <option value="other">Khác</option>
            </select>
          </div>

          <div class="form-group">
            <label for="emp-dob">Ngày Sinh</label>
            <input type="date" id="emp-dob" class="form-control" />
          </div>

          <!-- Hàng 4: Phòng ban & Chức danh -->
          <div class="form-group">
            <label for="emp-dept">Phòng Ban <span class="text-danger">*</span></label>
            <select id="emp-dept" class="form-control" required>
              <option value="">-- Chọn phòng ban --</option>
              ${departments.map(d => `<option value="${d.id}">${d.name} (${d.code})</option>`).join('')}
            </select>
          </div>

          <div class="form-group">
            <label for="emp-pos">Vị Trí / Chức Danh <span class="text-danger">*</span></label>
            <select id="emp-pos" class="form-control" required>
              <option value="">-- Chọn chức danh --</option>
              ${positions.map(p => `<option value="${p.id}" data-salary="${p.salaryBase}">${p.title} - ${formatCurrency(p.salaryBase)}</option>`).join('')}
            </select>
            <small class="form-hint">Mức lương chuẩn sẽ tự động điền theo chức danh</small>
          </div>

          <!-- Hàng 5: Lương chính thức & Ngày vào làm -->
          <div class="form-group">
            <label for="emp-salary">Mức Lương Cơ Bản (VND) <span class="text-danger">*</span></label>
            <input type="number" id="emp-salary" class="form-control" placeholder="Ví dụ: 15000000" min="1000000" step="500000" required />
            <div id="err-emp-salary" class="invalid-feedback"></div>
          </div>

          <div class="form-group">
            <label for="emp-hiredate">Ngày Vào Làm <span class="text-danger">*</span></label>
            <input type="date" id="emp-hiredate" class="form-control" value="${new Date().toISOString().split('T')[0]}" required />
          </div>

          <!-- Hàng 6: Phụ cấp thưởng & Trạng thái -->
          <div class="form-group">
            <label for="emp-bonus">Phụ Cấp / Thưởng Dự Kiến (VND)</label>
            <input type="number" id="emp-bonus" class="form-control" value="0" min="0" step="100000" />
          </div>

          <div class="form-group">
            <label for="emp-status">Trạng Thái Làm Việc</label>
            <select id="emp-status" class="form-control">
              <option value="active">Chính thức (Active)</option>
              <option value="probation">Thử việc (Probation)</option>
              <option value="resigned">Đã nghỉ việc (Resigned)</option>
            </select>
          </div>

          <div class="form-actions col-span-2 flex-end">
            <button type="reset" id="btn-reset-form" class="btn btn-secondary">Làm Mới Form</button>
            <button type="submit" id="btn-submit-add" class="btn btn-primary">
              <span class="btn-text">Thêm Hồ Sơ Nhân Viên</span>
            </button>
          </div>
        </form>
      </div>
    `;

    // DOM Elements
    const form = container.querySelector('#form-add-employee');
    const codeInput = container.querySelector('#emp-code');
    const nameInput = container.querySelector('#emp-name');
    const emailInput = container.querySelector('#emp-email');
    const phoneInput = container.querySelector('#emp-phone');
    const genderSelect = container.querySelector('#emp-gender');
    const dobInput = container.querySelector('#emp-dob');
    const deptSelect = container.querySelector('#emp-dept');
    const posSelect = container.querySelector('#emp-pos');
    const salaryInput = container.querySelector('#emp-salary');
    const hireDateInput = container.querySelector('#emp-hiredate');
    const bonusInput = container.querySelector('#emp-bonus');
    const statusSelect = container.querySelector('#emp-status');
    const submitBtn = container.querySelector('#btn-submit-add');

    // Tự động điền lương khi chọn vị trí (Event listener: change)
    posSelect.addEventListener('change', () => {
      const selectedOption = posSelect.options[posSelect.selectedIndex];
      const baseSalary = selectedOption.getAttribute('data-salary');
      if (baseSalary && Number(baseSalary) > 0) {
        salaryInput.value = baseSalary;
      }
    });

    // Live validation trên input name
    nameInput.addEventListener('input', () => {
      const val = nameInput.value.trim();
      const errEl = container.querySelector('#err-emp-name');
      if (!validators.isNotEmpty(val)) {
        errEl.textContent = 'Họ tên không được để trống';
        nameInput.classList.add('is-invalid');
      } else {
        errEl.textContent = '';
        nameInput.classList.remove('is-invalid');
      }
    });

    // Live validation trên email
    emailInput.addEventListener('input', () => {
      const val = emailInput.value.trim();
      const errEl = container.querySelector('#err-emp-email');
      if (!validators.isEmail(val)) {
        errEl.textContent = 'Email không đúng định dạng (vd: user@domain.com)';
        emailInput.classList.add('is-invalid');
      } else {
        errEl.textContent = '';
        emailInput.classList.remove('is-invalid');
      }
    });

    // Form Submit Listener
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Validate toàn bộ
      const name = nameInput.value.trim();
      const email = emailInput.value.trim();
      const phone = phoneInput.value.trim();
      const salary = Number(salaryInput.value);

      if (!validators.isNotEmpty(name)) {
        showToast('Vui lòng nhập họ tên nhân viên', 'error');
        nameInput.focus();
        return;
      }

      if (!validators.isEmail(email)) {
        showToast('Vui lòng nhập định dạng email hợp lệ', 'error');
        emailInput.focus();
        return;
      }

      if (!validators.isPositiveNumber(salary)) {
        showToast('Mức lương phải là một số lớn hơn 0', 'error');
        salaryInput.focus();
        return;
      }

      if (!deptSelect.value) {
        showToast('Vui lòng chọn phòng ban trực thuộc', 'error');
        deptSelect.focus();
        return;
      }

      if (!posSelect.value) {
        showToast('Vui lòng chọn chức danh vị trí', 'error');
        posSelect.focus();
        return;
      }

      const employeeData = {
        code: codeInput.value,
        name,
        email,
        phone,
        gender: genderSelect.value,
        dateOfBirth: dobInput.value || null,
        departmentId: deptSelect.value,
        positionId: posSelect.value,
        salary,
        bonus: Number(bonusInput.value) || 0,
        deduction: 0,
        hireDate: hireDateInput.value,
        status: statusSelect.value
      };

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner-small"></span> Đang xử lý...';

      try {
        const created = await this.db.addEmployee(employeeData);
        showToast(`Thêm nhân viên "${created.name}" thành công!`, 'success');
        form.reset();
        // Cập nhật mã tự sinh mới
        codeInput.value = this.db.generateNextCode();
        if (typeof onSuccessCallback === 'function') {
          onSuccessCallback(created);
        }
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span class="btn-text">Thêm Hồ Sơ Nhân Viên</span>';
      }
    });
  }
}
