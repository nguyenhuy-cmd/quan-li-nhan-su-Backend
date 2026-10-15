/**
 * searchEmployeeModule.js
 * Module Tìm kiếm Nhân viên Nâng cao:
 * - Tìm kiếm đa tiêu chí: Tên/Mã (RegExp), Phòng ban, Vị trí, Khoảng lương (Min - Max)
 * - Sử dụng Higher-Order Functions: filter, sort, map
 * - Biểu thức chính quy RegExp hỗ trợ tìm kiếm linh hoạt không phân biệt hoa thường
 * - Hiển thị kết quả qua bảng DOM động, hỗ trợ sắp xếp linh hoạt
 */

import { formatCurrency, formatDate, showToast } from './uiHelper.js';

export class SearchEmployeeModule {
  constructor(employeeDbModule, departmentModule, positionModule) {
    this.db = employeeDbModule;
    this.deptModule = departmentModule;
    this.posModule = positionModule;
  }

  // Thuật toán lọc nâng cao sử dụng filter() và RegExp
  filterEmployees({ keyword, departmentId, positionId, minSalary, maxSalary, sortBy, sortOrder }) {
    const employees = this.db.getAllEmployeesSync();

    // Chuẩn bị RegExp cho tìm kiếm từ khóa
    let regex = null;
    if (keyword && keyword.trim()) {
      try {
        // Thoát các ký tự đặc biệt trong regex nếu người dùng nhập ký tự lạ
        const escaped = keyword.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        regex = new RegExp(escaped, 'i');
      } catch {
        regex = null;
      }
    }

    // Sử dụng Higher-Order Function `filter`
    let filtered = employees.filter(emp => {
      // 1. Kiểm tra từ khóa qua RegExp trên cả Tên, Mã nhân viên và Email
      if (regex) {
        const matchesName = regex.test(emp.name || '');
        const matchesCode = regex.test(emp.code || '');
        const matchesEmail = regex.test(emp.email || '');
        if (!matchesName && !matchesCode && !matchesEmail) {
          return false;
        }
      }

      // 2. Lọc theo phòng ban
      if (departmentId && emp.departmentId !== departmentId) {
        return false;
      }

      // 3. Lọc theo vị trí
      if (positionId && emp.positionId !== positionId) {
        return false;
      }

      // 4. Lọc theo khoảng lương min
      if (minSalary !== undefined && minSalary !== '' && Number(minSalary) >= 0) {
        if (emp.salary < Number(minSalary)) return false;
      }

      // 5. Lọc theo khoảng lương max
      if (maxSalary !== undefined && maxSalary !== '' && Number(maxSalary) > 0) {
        if (emp.salary > Number(maxSalary)) return false;
      }

      return true;
    });

    // Sắp xếp bằng Higher-Order Function `sort`
    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'salary') {
        comparison = a.salary - b.salary;
      } else if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name, 'vi');
      } else if (sortBy === 'hireDate') {
        comparison = new Date(a.hireDate || 0) - new Date(b.hireDate || 0);
      } else if (sortBy === 'code') {
        comparison = a.code.localeCompare(b.code);
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }

  // Render view tìm kiếm
  renderView(container, onActionCallback = null) {
    const departments = this.deptModule.getDepartmentsSync();
    const positions = this.posModule.getPositionsSync();

    container.innerHTML = `
      <div class="module-card animate-fade-in">
        <div class="module-header">
          <h2 class="module-title">Tra Cứu & Tìm Kiếm Nhân Viên</h2>
          <p class="module-desc">Lọc nâng cao bằng biểu thức chính quy (RegExp) kết hợp phòng ban, vị trí và khoảng lương</p>
        </div>

        <!-- Bộ lọc tìm kiếm nâng cao -->
        <form id="form-search-filter" class="search-filter-box mb-4">
          <div class="grid grid-3 gap-3">
            <div class="form-group">
              <label for="search-keyword">Từ khóa tìm kiếm (RegExp)</label>
              <input type="text" id="search-keyword" class="form-control" placeholder="Tên, mã NV, hoặc email..." />
            </div>

            <div class="form-group">
              <label for="search-dept">Phòng Ban</label>
              <select id="search-dept" class="form-control">
                <option value="">-- Tất cả phòng ban --</option>
                ${departments.map(d => `<option value="${d.id}">${d.name}</option>`).join('')}
              </select>
            </div>

            <div class="form-group">
              <label for="search-pos">Vị Trí / Chức Danh</label>
              <select id="search-pos" class="form-control">
                <option value="">-- Tất cả chức danh --</option>
                ${positions.map(p => `<option value="${p.id}">${p.title}</option>`).join('')}
              </select>
            </div>
          </div>

          <div class="grid grid-4 gap-3 mt-3">
            <div class="form-group">
              <label for="search-min-salary">Lương từ (VND)</label>
              <input type="number" id="search-min-salary" class="form-control" placeholder="0" min="0" step="1000000" />
            </div>

            <div class="form-group">
              <label for="search-max-salary">Lương đến (VND)</label>
              <input type="number" id="search-max-salary" class="form-control" placeholder="Không giới hạn" min="0" step="1000000" />
            </div>

            <div class="form-group">
              <label for="search-sort-by">Sắp xếp theo</label>
              <select id="search-sort-by" class="form-control">
                <option value="salary">Mức lương</option>
                <option value="name">Họ và tên</option>
                <option value="hireDate">Ngày vào làm</option>
                <option value="code">Mã nhân viên</option>
              </select>
            </div>

            <div class="form-group">
              <label for="search-sort-order">Thứ tự</label>
              <select id="search-sort-order" class="form-control">
                <option value="desc">Giảm dần (Cao -> Thấp)</option>
                <option value="asc">Tăng dần (Thấp -> Cao)</option>
              </select>
            </div>
          </div>

          <div class="flex-end gap-2 mt-3">
            <button type="reset" id="btn-reset-filter" class="btn btn-secondary">Đặt Lại Bộ Lọc</button>
            <button type="submit" class="btn btn-primary">Áp Dụng Lọc</button>
          </div>
        </form>

        <!-- Bảng hiển thị kết quả -->
        <div class="results-header flex-between mb-2">
          <span id="results-count-badge" class="font-bold text-muted">Đang tải kết quả...</span>
          <span class="text-hint text-sm">💡 Nhấp vào nút "Sửa" hoặc "Xóa" trên từng dòng để thao tác nhanh</span>
        </div>

        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Mã NV</th>
                <th>Họ và Tên</th>
                <th>Phòng Ban</th>
                <th>Chức Danh</th>
                <th>Mức Lương</th>
                <th>Ngày Vào Làm</th>
                <th>Trạng Thái</th>
                <th class="text-right">Tác Vụ</th>
              </tr>
            </thead>
            <tbody id="search-results-tbody">
              <!-- Render động -->
            </tbody>
          </table>
        </div>
      </div>
    `;

    const form = container.querySelector('#form-search-filter');
    const keywordInput = container.querySelector('#search-keyword');
    const deptSelect = container.querySelector('#search-dept');
    const posSelect = container.querySelector('#search-pos');
    const minSalaryInput = container.querySelector('#search-min-salary');
    const maxSalaryInput = container.querySelector('#search-max-salary');
    const sortBySelect = container.querySelector('#search-sort-by');
    const sortOrderSelect = container.querySelector('#search-sort-order');
    const resultsCountEl = container.querySelector('#results-count-badge');
    const tbody = container.querySelector('#search-results-tbody');

    // Hàm render bảng kết quả
    const renderTable = (results) => {
      resultsCountEl.textContent = `Tìm thấy ${results.length} nhân viên phù hợp`;

      if (results.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="8" class="text-center py-4 text-muted">
              Không tìm thấy nhân viên nào phù hợp với tiêu chí lọc đã chọn.
            </td>
          </tr>
        `;
        return;
      }

      tbody.innerHTML = results.map(emp => {
        const dept = this.deptModule.getDepartmentById(emp.departmentId);
        const pos = this.posModule.getPositionById(emp.positionId);
        const statusBadges = {
          active: '<span class="badge badge-success">Chính thức</span>',
          probation: '<span class="badge badge-warning">Thử việc</span>',
          resigned: '<span class="badge badge-danger">Đã nghỉ</span>'
        };

        return `
          <tr data-id="${emp.id}">
            <td><span class="badge badge-purple font-mono font-bold">${emp.code}</span></td>
            <td>
              <div class="font-bold">${emp.name}</div>
              <div class="text-sm text-muted">${emp.email}</div>
            </td>
            <td>${dept ? dept.name : '<span class="text-muted">Chưa gắn</span>'}</td>
            <td>${pos ? pos.title : '<span class="text-muted">Chưa gắn</span>'}</td>
            <td class="font-bold text-success">${formatCurrency(emp.salary)}</td>
            <td>${formatDate(emp.hireDate)}</td>
            <td>${statusBadges[emp.status] || '<span class="badge badge-neutral">Chưa rõ</span>'}</td>
            <td class="text-right">
              <button class="btn btn-sm btn-outline-warning btn-quick-edit" data-id="${emp.id}">Sửa</button>
              <button class="btn btn-sm btn-outline-danger btn-quick-delete" data-id="${emp.id}">Xóa</button>
            </td>
          </tr>
        `;
      }).join('');

      // Gắn sự kiện cho các nút hành động nhanh
      tbody.querySelectorAll('.btn-quick-edit').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          if (typeof onActionCallback === 'function') {
            onActionCallback('edit', id);
          }
        });
      });

      tbody.querySelectorAll('.btn-quick-delete').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          if (typeof onActionCallback === 'function') {
            onActionCallback('delete', id);
          }
        });
      });
    };

    // Hàm thực hiện tìm kiếm dựa trên form state
    const executeSearch = () => {
      const results = this.filterEmployees({
        keyword: keywordInput.value,
        departmentId: deptSelect.value,
        positionId: posSelect.value,
        minSalary: minSalaryInput.value,
        maxSalary: maxSalaryInput.value,
        sortBy: sortBySelect.value,
        sortOrder: sortOrderSelect.value
      });
      renderTable(results);
    };

    // Tìm kiếm thời gian thực khi gõ từ khóa
    keywordInput.addEventListener('input', executeSearch);
    deptSelect.addEventListener('change', executeSearch);
    posSelect.addEventListener('change', executeSearch);
    sortBySelect.addEventListener('change', executeSearch);
    sortOrderSelect.addEventListener('change', executeSearch);

    // Form submit
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      executeSearch();
      showToast('Đã cập nhật danh sách tìm kiếm', 'info');
    });

    // Reset form
    container.querySelector('#btn-reset-filter').addEventListener('click', () => {
      setTimeout(executeSearch, 50);
    });

    // Khởi tạo hiển thị ban đầu với toàn bộ nhân viên
    executeSearch();
  }
}
