/**
 * deleteEmployeeModule.js
 * Module Xóa Nhân viên:
 * - Tìm kiếm nhân viên cần xóa theo ID, Mã hoặc Tên
 * - Hiển thị thẻ thông tin chi tiết của nhân viên trước khi xóa
 * - Modal xác nhận bảo vệ dữ liệu (confirm dialog)
 * - Thực thi xóa an toàn qua EmployeeDbModule và gọi callback refresh
 */

import { showToast, showConfirmModal, formatCurrency, formatDate } from './uiHelper.js';

export class DeleteEmployeeModule {
  constructor(employeeDbModule, departmentModule, positionModule) {
    this.db = employeeDbModule;
    this.deptModule = departmentModule;
    this.posModule = positionModule;
  }

  // Render giao diện tìm và xóa nhân sự
  renderView(container, onDeletedCallback = null) {
    const allEmployees = this.db.getAllEmployeesSync();

    container.innerHTML = `
      <div class="module-card animate-fade-in">
        <div class="module-header">
          <h2 class="module-title text-danger">Xóa Hồ Sơ Nhân Viên</h2>
          <p class="module-desc">Tìm kiếm nhân viên để tiến hành xóa khỏi hệ thống cơ sở dữ liệu</p>
        </div>

        <div class="search-panel mb-4">
          <div class="flex-gap">
            <div class="form-group flex-1">
              <label for="select-emp-to-delete">Chọn nhân viên cần xóa</label>
              <select id="select-emp-to-delete" class="form-control">
                <option value="">-- Chọn nhân viên từ danh sách --</option>
                ${allEmployees.map(e => `<option value="${e.id}">[${e.code}] ${e.name} - ${e.email}</option>`).join('')}
              </select>
            </div>
            <div class="form-group flex-1">
              <label for="input-search-delete">Hoặc nhập Mã / Tên để tìm</label>
              <div class="input-with-button">
                <input type="text" id="input-search-delete" class="form-control" placeholder="Ví dụ: NV002 hoặc Mai" />
                <button type="button" id="btn-search-delete" class="btn btn-secondary">Tìm kiếm</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Khung chi tiết nhân viên được chọn để xóa -->
        <div id="delete-preview-card" class="card card-danger hidden animate-scale-up">
          <div class="card-header flex-between">
            <h4 class="text-danger font-bold">Xác nhận thông tin hồ sơ cần xóa</h4>
            <span class="badge badge-danger">Thao tác nguy hiểm</span>
          </div>
          <div class="card-body">
            <div class="grid grid-2 gap-3" id="delete-emp-details">
              <!-- Render động bằng JS -->
            </div>
            <div class="alert alert-warning mt-4">
              <strong>Lưu ý quan trọng:</strong> Hành động này sẽ xóa hoàn toàn thông tin nhân viên khỏi cơ sở dữ liệu. Vui lòng kiểm tra kỹ trước khi nhấn Xác nhận xóa.
            </div>
          </div>
          <div class="card-footer flex-end gap-2">
            <button id="btn-cancel-delete" class="btn btn-secondary">Hủy bỏ</button>
            <button id="btn-confirm-delete" class="btn btn-danger">
              <span class="btn-text">Tiến Hành Xóa Nhân Viên Này</span>
            </button>
          </div>
        </div>
      </div>
    `;

    const selectEmp = container.querySelector('#select-emp-to-delete');
    const inputSearch = container.querySelector('#input-search-delete');
    const btnSearch = container.querySelector('#btn-search-delete');
    const previewCard = container.querySelector('#delete-preview-card');
    const detailsContainer = container.querySelector('#delete-emp-details');
    const btnCancel = container.querySelector('#btn-cancel-delete');
    const btnConfirm = container.querySelector('#btn-confirm-delete');

    let currentSelectedEmp = null;

    const showEmployeePreview = (emp) => {
      currentSelectedEmp = emp;
      if (!emp) {
        previewCard.classList.add('hidden');
        return;
      }

      const dept = this.deptModule.getDepartmentById(emp.departmentId);
      const pos = this.posModule.getPositionById(emp.positionId);

      detailsContainer.innerHTML = `
        <div><strong>Mã Nhân Viên:</strong> <span class="font-mono font-bold">${emp.code}</span></div>
        <div><strong>Họ và Tên:</strong> <span class="font-bold">${emp.name}</span></div>
        <div><strong>Email:</strong> ${emp.email}</div>
        <div><strong>Số Điện Thoại:</strong> ${emp.phone || 'Chưa cập nhật'}</div>
        <div><strong>Phòng Ban:</strong> ${dept ? dept.name : 'Chưa phân bổ'}</div>
        <div><strong>Chức Danh:</strong> ${pos ? pos.title : 'Chưa phân bổ'}</div>
        <div><strong>Mức Lương:</strong> <span class="text-success font-bold">${formatCurrency(emp.salary)}</span></div>
        <div><strong>Ngày Vào Làm:</strong> ${formatDate(emp.hireDate)}</div>
      `;

      previewCard.classList.remove('hidden');
      previewCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    selectEmp.addEventListener('change', () => {
      const id = selectEmp.value;
      if (!id) {
        showEmployeePreview(null);
        return;
      }
      const emp = allEmployees.find(e => e.id === id);
      showEmployeePreview(emp);
    });

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
        showEmployeePreview(match);
        showToast(`Đã tìm thấy nhân viên: ${match.name}`, 'success');
      } else {
        showToast(`Không tìm thấy nhân viên khớp với từ khóa "${q}"`, 'error');
      }
    });

    inputSearch.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        btnSearch.click();
      }
    });

    btnCancel.addEventListener('click', () => {
      showEmployeePreview(null);
      selectEmp.value = '';
    });

    btnConfirm.addEventListener('click', async () => {
      if (!currentSelectedEmp) return;

      // Sử dụng cả window.confirm theo yêu cầu đề bài hoặc showConfirmModal
      const confirmed = window.confirm(`Bạn có chắc chắn muốn xóa nhân viên "${currentSelectedEmp.name}" (Mã: ${currentSelectedEmp.code})?`);
      if (!confirmed) return;

      btnConfirm.disabled = true;
      btnConfirm.innerHTML = '<span class="spinner-small"></span> Đang xóa...';

      try {
        await this.db.deleteEmployee(currentSelectedEmp.id);
        showToast(`Đã xóa vĩnh viễn nhân viên "${currentSelectedEmp.name}" khỏi hệ thống`, 'success');
        showEmployeePreview(null);
        if (typeof onDeletedCallback === 'function') {
          onDeletedCallback(currentSelectedEmp.id);
        }
        this.renderView(container, onDeletedCallback);
      } catch (err) {
        showToast(err.message, 'error');
        btnConfirm.disabled = false;
        btnConfirm.innerHTML = '<span class="btn-text">Tiến Hành Xóa Nhân Viên Này</span>';
      }
    });
  }
}
