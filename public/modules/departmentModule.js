/**
 * departmentModule.js
 * Module Quản lý Phòng ban:
 * - Thêm, Sửa, Xóa, Lấy danh sách phòng ban
 * - Lưu trữ trong localStorage ('hrm_departments')
 * - Liên kết phòng ban với nhân viên
 * - Render giao diện quản lý phòng ban
 */

import { showToast, showConfirmModal, validators } from './uiHelper.js';

const STORAGE_KEY_DEPARTMENTS = 'hrm_departments';

export class DepartmentModule {
  constructor() {
    this.initDefaultDepartments();
  }

  // Khởi tạo phòng ban mẫu nếu chưa có dữ liệu
  initDefaultDepartments() {
    const existing = localStorage.getItem(STORAGE_KEY_DEPARTMENTS);
    if (!existing) {
      const defaultDepartments = [
        {
          id: 'dept_01',
          code: 'TECH',
          name: 'Phòng Công Nghệ Thông Tin',
          description: 'Phát triển phần mềm, hạ tầng kỹ thuật và bảo mật',
          createdAt: '2024-01-15'
        },
        {
          id: 'dept_02',
          code: 'HR',
          name: 'Phòng Nhân Sự',
          description: 'Tuyển dụng, đào tạo, quản lý chế độ và phúc lợi nhân viên',
          createdAt: '2024-01-15'
        },
        {
          id: 'dept_03',
          code: 'SALE',
          name: 'Phòng Kinh Doanh & Bán Hàng',
          description: 'Tìm kiếm khách hàng, mở rộng thị trường và quản lý hợp đồng',
          createdAt: '2024-02-01'
        },
        {
          id: 'dept_04',
          code: 'MKT',
          name: 'Phòng Tiếp Thị & Truyền Thông',
          description: 'Xây dựng thương hiệu, chiến dịch quảng cáo và tiếp thị số',
          createdAt: '2024-02-10'
        },
        {
          id: 'dept_05',
          code: 'ACC',
          name: 'Phòng Tài Chính - Kế Toán',
          description: 'Quản trị dòng tiền, hạch toán kế toán và chi trả lương thưởng',
          createdAt: '2024-01-20'
        }
      ];
      this.saveDepartments(defaultDepartments);
    }
  }

  // Lấy toàn bộ phòng ban (hỗ trợ async/await)
  async getAllDepartments() {
    await new Promise(r => setTimeout(r, 100)); // Delay mô phỏng
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY_DEPARTMENTS)) || [];
    } catch {
      return [];
    }
  }

  // Lấy đồng bộ cho dropdowns
  getDepartmentsSync() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY_DEPARTMENTS)) || [];
    } catch {
      return [];
    }
  }

  getDepartmentById(id) {
    const depts = this.getDepartmentsSync();
    return depts.find(d => d.id === id) || null;
  }

  saveDepartments(departments) {
    localStorage.setItem(STORAGE_KEY_DEPARTMENTS, JSON.stringify(departments));
  }

  // Thêm phòng ban mới
  async addDepartment({ name, code, description }) {
    await new Promise(r => setTimeout(r, 200));

    if (!validators.isNotEmpty(name)) {
      throw new Error('Tên phòng ban không được để trống');
    }

    const depts = await this.getAllDepartments();
    const finalCode = (code || 'DPT_' + (depts.length + 1)).trim().toUpperCase();

    if (depts.some(d => d.name.toLowerCase() === name.trim().toLowerCase())) {
      throw new Error('Tên phòng ban đã tồn tại');
    }

    const newDept = {
      id: 'dept_' + Date.now(),
      code: finalCode,
      name: name.trim(),
      description: (description || '').trim(),
      createdAt: new Date().toISOString().split('T')[0]
    };

    depts.push(newDept);
    this.saveDepartments(depts);
    return newDept;
  }

  // Sửa thông tin phòng ban
  async editDepartment(id, updates) {
    await new Promise(r => setTimeout(r, 200));
    const depts = await this.getAllDepartments();
    const index = depts.findIndex(d => d.id === id);

    if (index === -1) {
      throw new Error('Không tìm thấy phòng ban cần sửa');
    }

    if (updates.name && updates.name.trim()) {
      const duplicate = depts.find(d => d.id !== id && d.name.toLowerCase() === updates.name.trim().toLowerCase());
      if (duplicate) {
        throw new Error('Tên phòng ban này đã được sử dụng');
      }
    }

    depts[index] = {
      ...depts[index],
      ...updates,
      name: updates.name ? updates.name.trim() : depts[index].name,
      description: updates.description !== undefined ? updates.description.trim() : depts[index].description
    };

    this.saveDepartments(depts);
    return depts[index];
  }

  // Xóa phòng ban
  async deleteDepartment(id, checkEmployeesExistFn) {
    await new Promise(r => setTimeout(r, 200));

    // Kiểm tra xem có nhân viên nào đang thuộc phòng ban này không
    if (typeof checkEmployeesExistFn === 'function') {
      const hasEmployees = checkEmployeesExistFn(id);
      if (hasEmployees) {
        throw new Error('Không thể xóa phòng ban đang có nhân viên trực thuộc! Vui lòng điều chuyển nhân viên trước.');
      }
    }

    const depts = await this.getAllDepartments();
    const filtered = depts.filter(d => d.id !== id);
    if (filtered.length === depts.length) {
      throw new Error('Phòng ban không tồn tại');
    }

    this.saveDepartments(filtered);
    return true;
  }

  // Render giao diện quản lý phòng ban
  async renderView(container, getEmployeeCountByDeptFn) {
    const departments = await this.getAllDepartments();

    container.innerHTML = `
      <div class="module-card animate-fade-in">
        <div class="module-header flex-between">
          <div>
            <h2 class="module-title">Quản Lý Phòng Ban</h2>
            <p class="module-desc">Thiết lập cơ cấu tổ chức và các phòng ban trong doanh nghiệp</p>
          </div>
          <button id="btn-open-add-dept" class="btn btn-primary">
            <span>+ Thêm Phòng Ban Mới</span>
          </button>
        </div>

        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Mã PB</th>
                <th>Tên Phòng Ban</th>
                <th>Mô Tả Chức Năng</th>
                <th>Số Nhân Viên</th>
                <th>Ngày Thành Lập</th>
                <th class="text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody id="dept-table-body">
              ${departments.map(dept => {
                const count = typeof getEmployeeCountByDeptFn === 'function' ? getEmployeeCountByDeptFn(dept.id) : 0;
                return `
                  <tr data-id="${dept.id}">
                    <td><span class="badge badge-info font-mono">${dept.code || dept.id}</span></td>
                    <td class="font-bold">${dept.name}</td>
                    <td class="text-muted">${dept.description || 'Chưa có mô tả'}</td>
                    <td><span class="badge badge-neutral">${count} nhân sự</span></td>
                    <td>${dept.createdAt || '---'}</td>
                    <td class="text-right">
                      <button class="btn btn-sm btn-outline-warning btn-edit-dept" data-id="${dept.id}">Sửa</button>
                      <button class="btn btn-sm btn-outline-danger btn-del-dept" data-id="${dept.id}" ${count > 0 ? 'title="Có nhân viên, cần điều chuyển trước"' : ''}>Xóa</button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        <!-- Modal Form Thêm / Sửa Phòng Ban -->
        <div id="modal-dept" class="modal-backdrop hidden">
          <div class="modal-card animate-scale-up">
            <div class="modal-header">
              <h3 id="modal-dept-title" class="modal-title">Thêm Phòng Ban Mới</h3>
              <button id="btn-close-dept-modal" class="modal-close-btn">&times;</button>
            </div>
            <form id="form-dept" class="modal-body">
              <input type="hidden" id="dept-edit-id" value="" />
              <div class="form-group">
                <label for="dept-code">Mã phòng ban <span class="text-danger">*</span></label>
                <input type="text" id="dept-code" class="form-control" placeholder="Ví dụ: TECH, HR, SALE" required />
              </div>
              <div class="form-group">
                <label for="dept-name">Tên phòng ban <span class="text-danger">*</span></label>
                <input type="text" id="dept-name" class="form-control" placeholder="Ví dụ: Phòng Kỹ Thuật" required />
              </div>
              <div class="form-group">
                <label for="dept-desc">Mô tả nhiệm vụ / chức năng</label>
                <textarea id="dept-desc" class="form-control" rows="3" placeholder="Mô tả sơ lược về nhiệm vụ của phòng ban..."></textarea>
              </div>
              <div class="modal-footer">
                <button type="button" id="btn-cancel-dept-modal" class="btn btn-secondary">Đóng</button>
                <button type="submit" class="btn btn-primary">Lưu Thay Đổi</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    // Event handlers
    const modal = container.querySelector('#modal-dept');
    const form = container.querySelector('#form-dept');
    const modalTitle = container.querySelector('#modal-dept-title');
    const editIdInput = container.querySelector('#dept-edit-id');
    const codeInput = container.querySelector('#dept-code');
    const nameInput = container.querySelector('#dept-name');
    const descInput = container.querySelector('#dept-desc');

    const openModal = (dept = null) => {
      if (dept) {
        modalTitle.textContent = 'Chỉnh Sửa Phòng Ban';
        editIdInput.value = dept.id;
        codeInput.value = dept.code || '';
        nameInput.value = dept.name || '';
        descInput.value = dept.description || '';
      } else {
        modalTitle.textContent = 'Thêm Phòng Ban Mới';
        editIdInput.value = '';
        form.reset();
      }
      modal.classList.remove('hidden');
    };

    const closeModal = () => {
      modal.classList.add('hidden');
      form.reset();
    };

    container.querySelector('#btn-open-add-dept').addEventListener('click', () => openModal());
    container.querySelector('#btn-close-dept-modal').addEventListener('click', closeModal);
    container.querySelector('#btn-cancel-dept-modal').addEventListener('click', closeModal);

    // Form submit
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = editIdInput.value;
      const code = codeInput.value;
      const name = nameInput.value;
      const description = descInput.value;

      try {
        if (id) {
          await this.editDepartment(id, { code, name, description });
          showToast('Cập nhật phòng ban thành công!', 'success');
        } else {
          await this.addDepartment({ code, name, description });
          showToast('Thêm mới phòng ban thành công!', 'success');
        }
        closeModal();
        this.renderView(container, getEmployeeCountByDeptFn);
      } catch (err) {
        showToast(err.message, 'error');
      }
    });

    // Edit button click
    container.querySelectorAll('.btn-edit-dept').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const dept = this.getDepartmentById(id);
        if (dept) openModal(dept);
      });
    });

    // Delete button click
    container.querySelectorAll('.btn-del-dept').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        const dept = this.getDepartmentById(id);
        if (!dept) return;

        const confirmed = await showConfirmModal(
          'Xóa Phòng Ban',
          `Bạn có chắc chắn muốn xóa phòng ban "${dept.name}" không? Thao tác này không thể hoàn tác.`
        );

        if (confirmed) {
          try {
            await this.deleteDepartment(id, checkEmployeesExistFn);
            showToast('Đã xóa phòng ban thành công', 'success');
            this.renderView(container, getEmployeeCountByDeptFn);
          } catch (err) {
            showToast(err.message, 'error');
          }
        }
      });
    });
  }
}
