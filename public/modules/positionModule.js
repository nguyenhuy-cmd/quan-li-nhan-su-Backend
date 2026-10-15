/**
 * positionModule.js
 * Module Quản lý Vị trí chức danh công việc:
 * - Thêm, Sửa, Xóa, Lấy danh sách vị trí
 * - Lưu trữ trong localStorage ('hrm_positions')
 * - Cung cấp danh mục chức danh cho Add/Edit Employee
 * - Async/await xử lý I/O
 */

import { showToast, showConfirmModal, formatCurrency, validators } from './uiHelper.js';

const STORAGE_KEY_POSITIONS = 'hrm_positions';

export class PositionModule {
  constructor() {
    this.initDefaultPositions();
  }

  initDefaultPositions() {
    const existing = localStorage.getItem(STORAGE_KEY_POSITIONS);
    if (!existing) {
      const defaultPositions = [
        {
          id: 'pos_01',
          code: 'DEV_SR',
          title: 'Senior Software Engineer',
          description: 'Lập trình viên cấp cao, phụ trách kiến trúc và phát triển hệ thống',
          salaryBase: 28000000
        },
        {
          id: 'pos_02',
          code: 'DEV_MID',
          title: 'Fullstack Developer',
          description: 'Lập trình viên fullstack phát triển các tính năng frontend và backend',
          salaryBase: 18000000
        },
        {
          id: 'pos_03',
          code: 'HR_MGR',
          title: 'Trưởng Phòng Nhân Sự (HR Manager)',
          description: 'Hoạch định chiến lược nhân lực và quản trị văn hóa doanh nghiệp',
          salaryBase: 25000000
        },
        {
          id: 'pos_04',
          code: 'HR_EXEC',
          title: 'Chuyên Viên Tuyển Dụng & C&B',
          description: 'Chuyên trách tìm kiếm nhân tài và theo dõi chính sách lương thưởng',
          salaryBase: 12000000
        },
        {
          id: 'pos_05',
          code: 'SALE_LD',
          title: 'Trưởng Nhóm Kinh Doanh (Sales Leader)',
          description: 'Chỉ đạo đội ngũ tư vấn giải pháp và đảm bảo doanh số kinh doanh',
          salaryBase: 22000000
        },
        {
          id: 'pos_06',
          code: 'ACC_CHE',
          title: 'Kế Toán Trưởng (Chief Accountant)',
          description: 'Kiểm soát tài chính, báo cáo thuế và quản lý tài sản công ty',
          salaryBase: 24000000
        }
      ];
      this.savePositions(defaultPositions);
    }
  }

  async getAllPositions() {
    await new Promise(r => setTimeout(r, 100));
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY_POSITIONS)) || [];
    } catch {
      return [];
    }
  }

  getPositionsSync() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY_POSITIONS)) || [];
    } catch {
      return [];
    }
  }

  getPositionById(id) {
    const positions = this.getPositionsSync();
    return positions.find(p => p.id === id) || null;
  }

  savePositions(positions) {
    localStorage.setItem(STORAGE_KEY_POSITIONS, JSON.stringify(positions));
  }

  async addPosition({ title, code, description, salaryBase }) {
    await new Promise(r => setTimeout(r, 200));

    if (!validators.isNotEmpty(title)) {
      throw new Error('Chức danh công việc không được để trống');
    }
    if (!validators.isNonNegativeNumber(salaryBase)) {
      throw new Error('Lương cơ bản phải là số không âm');
    }

    const positions = await this.getAllPositions();
    if (positions.some(p => p.title.toLowerCase() === title.trim().toLowerCase())) {
      throw new Error('Chức danh này đã tồn tại trong danh mục');
    }

    const newPos = {
      id: 'pos_' + Date.now(),
      code: (code || 'POS_' + (positions.length + 1)).trim().toUpperCase(),
      title: title.trim(),
      description: (description || '').trim(),
      salaryBase: Number(salaryBase) || 0
    };

    positions.push(newPos);
    this.savePositions(positions);
    return newPos;
  }

  async editPosition(id, updates) {
    await new Promise(r => setTimeout(r, 200));
    const positions = await this.getAllPositions();
    const index = positions.findIndex(p => p.id === id);

    if (index === -1) {
      throw new Error('Không tìm thấy chức danh cần chỉnh sửa');
    }

    if (updates.title && updates.title.trim()) {
      const duplicate = positions.find(p => p.id !== id && p.title.toLowerCase() === updates.title.trim().toLowerCase());
      if (duplicate) {
        throw new Error('Chức danh này đã tồn tại');
      }
    }

    positions[index] = {
      ...positions[index],
      ...updates,
      title: updates.title ? updates.title.trim() : positions[index].title,
      description: updates.description !== undefined ? updates.description.trim() : positions[index].description,
      salaryBase: updates.salaryBase !== undefined ? Number(updates.salaryBase) : positions[index].salaryBase
    };

    this.savePositions(positions);
    return positions[index];
  }

  async deletePosition(id, checkEmployeesExistFn) {
    await new Promise(r => setTimeout(r, 200));

    if (typeof checkEmployeesExistFn === 'function') {
      const hasEmployees = checkEmployeesExistFn(id);
      if (hasEmployees) {
        throw new Error('Không thể xóa chức danh đang có nhân viên đảm nhiệm! Vui lòng thay đổi vị trí nhân viên trước.');
      }
    }

    const positions = await this.getAllPositions();
    const filtered = positions.filter(p => p.id !== id);
    if (filtered.length === positions.length) {
      throw new Error('Chức danh không tồn tại');
    }

    this.savePositions(filtered);
    return true;
  }

  async renderView(container, getEmployeeCountByPositionFn) {
    const positions = await this.getAllPositions();

    container.innerHTML = `
      <div class="module-card animate-fade-in">
        <div class="module-header flex-between">
          <div>
            <h2 class="module-title">Quản Lý Vị Trí & Chức Danh</h2>
            <p class="module-desc">Định nghĩa danh mục chức vụ và mức lương cơ sở chuẩn theo vị trí</p>
          </div>
          <button id="btn-open-add-pos" class="btn btn-primary">
            <span>+ Thêm Vị Trí Mới</span>
          </button>
        </div>

        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Mã Vị Trí</th>
                <th>Tên Chức Danh</th>
                <th>Mô Tả Công Việc</th>
                <th>Mức Lương Cơ Bản</th>
                <th>Số Lượng Nhân Sự</th>
                <th class="text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody id="pos-table-body">
              ${positions.map(pos => {
                const count = typeof getEmployeeCountByPositionFn === 'function' ? getEmployeeCountByPositionFn(pos.id) : 0;
                return `
                  <tr data-id="${pos.id}">
                    <td><span class="badge badge-purple font-mono">${pos.code || pos.id}</span></td>
                    <td class="font-bold">${pos.title}</td>
                    <td class="text-muted">${pos.description || 'Chưa có mô tả'}</td>
                    <td class="font-bold text-success">${formatCurrency(pos.salaryBase)}</td>
                    <td><span class="badge badge-neutral">${count} nhân sự</span></td>
                    <td class="text-right">
                      <button class="btn btn-sm btn-outline-warning btn-edit-pos" data-id="${pos.id}">Sửa</button>
                      <button class="btn btn-sm btn-outline-danger btn-del-pos" data-id="${pos.id}">Xóa</button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        <!-- Modal Thêm / Sửa Vị Trí -->
        <div id="modal-pos" class="modal-backdrop hidden">
          <div class="modal-card animate-scale-up">
            <div class="modal-header">
              <h3 id="modal-pos-title" class="modal-title">Thêm Chức Danh Mới</h3>
              <button id="btn-close-pos-modal" class="modal-close-btn">&times;</button>
            </div>
            <form id="form-pos" class="modal-body">
              <input type="hidden" id="pos-edit-id" value="" />
              <div class="form-group">
                <label for="pos-code">Mã chức danh <span class="text-danger">*</span></label>
                <input type="text" id="pos-code" class="form-control" placeholder="Ví dụ: DEV_SR, HR_MGR" required />
              </div>
              <div class="form-group">
                <label for="pos-title">Tên chức vụ / vị trí <span class="text-danger">*</span></label>
                <input type="text" id="pos-title" class="form-control" placeholder="Ví dụ: Senior Frontend Developer" required />
              </div>
              <div class="form-group">
                <label for="pos-salary">Mức lương cơ bản (VND) <span class="text-danger">*</span></label>
                <input type="number" id="pos-salary" class="form-control" placeholder="20000000" min="0" step="500000" required />
              </div>
              <div class="form-group">
                <label for="pos-desc">Mô tả công việc</label>
                <textarea id="pos-desc" class="form-control" rows="3" placeholder="Mô tả trách nhiệm chính..."></textarea>
              </div>
              <div class="modal-footer">
                <button type="button" id="btn-cancel-pos-modal" class="btn btn-secondary">Đóng</button>
                <button type="submit" class="btn btn-primary">Lưu Thay Đổi</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    const modal = container.querySelector('#modal-pos');
    const form = container.querySelector('#form-pos');
    const modalTitle = container.querySelector('#modal-pos-title');
    const editIdInput = container.querySelector('#pos-edit-id');
    const codeInput = container.querySelector('#pos-code');
    const titleInput = container.querySelector('#pos-title');
    const salaryInput = container.querySelector('#pos-salary');
    const descInput = container.querySelector('#pos-desc');

    const openModal = (pos = null) => {
      if (pos) {
        modalTitle.textContent = 'Chỉnh Sửa Chức Danh';
        editIdInput.value = pos.id;
        codeInput.value = pos.code || '';
        titleInput.value = pos.title || '';
        salaryInput.value = pos.salaryBase || 0;
        descInput.value = pos.description || '';
      } else {
        modalTitle.textContent = 'Thêm Chức Danh Mới';
        editIdInput.value = '';
        form.reset();
      }
      modal.classList.remove('hidden');
    };

    const closeModal = () => {
      modal.classList.add('hidden');
      form.reset();
    };

    container.querySelector('#btn-open-add-pos').addEventListener('click', () => openModal());
    container.querySelector('#btn-close-pos-modal').addEventListener('click', closeModal);
    container.querySelector('#btn-cancel-pos-modal').addEventListener('click', closeModal);

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = editIdInput.value;
      const code = codeInput.value;
      const title = titleInput.value;
      const salaryBase = salaryInput.value;
      const description = descInput.value;

      try {
        if (id) {
          await this.editPosition(id, { code, title, salaryBase, description });
          showToast('Cập nhật chức danh thành công!', 'success');
        } else {
          await this.addPosition({ code, title, salaryBase, description });
          showToast('Thêm mới chức danh thành công!', 'success');
        }
        closeModal();
        this.renderView(container, getEmployeeCountByPositionFn);
      } catch (err) {
        showToast(err.message, 'error');
      }
    });

    container.querySelectorAll('.btn-edit-pos').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const pos = this.getPositionById(id);
        if (pos) openModal(pos);
      });
    });

    container.querySelectorAll('.btn-del-pos').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        const pos = this.getPositionById(id);
        if (!pos) return;

        const confirmed = await showConfirmModal(
          'Xóa Chức Danh',
          `Bạn có chắc muốn xóa chức vụ "${pos.title}" khỏi danh mục?`
        );

        if (confirmed) {
          try {
            await this.deletePosition(id, checkEmployeesExistFn);
            showToast('Đã xóa chức danh thành công', 'success');
            this.renderView(container, getEmployeeCountByPositionFn);
          } catch (err) {
            showToast(err.message, 'error');
          }
        }
      });
    });
  }
}
