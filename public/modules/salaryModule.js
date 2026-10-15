/**
 * salaryModule.js
 * Module Quản lý Lương & Bảng Lương (Payroll Management):
 * - Tính toán thực lĩnh: netSalary = salary + bonus - deduction
 * - Cập nhật lương thưởng và các khoản giảm trừ của nhân viên
 * - Sử dụng Higher-Order Functions map() và reduce() để tính tổng quỹ lương, lương trung bình
 * - Tạo báo cáo bảng lương chi tiết và phiếu lương (Payslip)
 */

import { formatCurrency, showToast, showConfirmModal } from './uiHelper.js';

export class SalaryModule {
  constructor(employeeDbModule, departmentModule, positionModule) {
    this.db = employeeDbModule;
    this.deptModule = departmentModule;
    this.posModule = positionModule;
  }

  // Tính lương thực lĩnh cho 1 nhân viên: netSalary = salary + bonus - deduction
  calculateNetSalary(employee) {
    const base = Number(employee.salary) || 0;
    const bonus = Number(employee.bonus) || 0;
    const deduction = Number(employee.deduction) || 0;
    const net = base + bonus - deduction;
    return Math.max(0, net);
  }

  // Tạo báo cáo bảng lương cho toàn bộ nhân viên (sử dụng map)
  generatePayrollReport() {
    const employees = this.db.getAllEmployeesSync();

    return employees.map(emp => {
      const netSalary = this.calculateNetSalary(emp);
      const dept = this.deptModule.getDepartmentById(emp.departmentId);
      const pos = this.posModule.getPositionById(emp.positionId);

      return {
        id: emp.id,
        code: emp.code,
        name: emp.name,
        departmentName: dept ? dept.name : 'N/A',
        positionTitle: pos ? pos.title : 'N/A',
        baseSalary: emp.salary || 0,
        bonus: emp.bonus || 0,
        deduction: emp.deduction || 0,
        netSalary
      };
    });
  }

  // Tính toán các chỉ số thống kê tài chính bằng reduce()
  calculateStatistics() {
    const report = this.generatePayrollReport();
    if (report.length === 0) {
      return { totalFund: 0, averageSalary: 0, maxSalary: 0, minSalary: 0, count: 0 };
    }

    // Tính tổng quỹ lương bằng reduce
    const totalFund = report.reduce((sum, item) => sum + item.netSalary, 0);
    const totalBonus = report.reduce((sum, item) => sum + item.bonus, 0);
    const totalDeduction = report.reduce((sum, item) => sum + item.deduction, 0);

    const averageSalary = Math.round(totalFund / report.length);
    const maxSalary = report.reduce((max, item) => item.netSalary > max ? item.netSalary : max, report[0].netSalary);
    const minSalary = report.reduce((min, item) => item.netSalary < min ? item.netSalary : min, report[0].netSalary);

    return {
      totalFund,
      totalBonus,
      totalDeduction,
      averageSalary,
      maxSalary,
      minSalary,
      count: report.length
    };
  }

  // Cập nhật lương, thưởng, phạt của nhân viên
  async updateSalaryAdjustment(employeeId, { bonus, deduction, baseSalary }) {
    const updates = {};
    if (bonus !== undefined) updates.bonus = Number(bonus);
    if (deduction !== undefined) updates.deduction = Number(deduction);
    if (baseSalary !== undefined) updates.salary = Number(baseSalary);

    return await this.db.updateEmployee(employeeId, updates);
  }

  // Render view bảng lương
  renderView(container) {
    const report = this.generatePayrollReport();
    const stats = this.calculateStatistics();

    container.innerHTML = `
      <div class="module-card animate-fade-in">
        <div class="module-header flex-between">
          <div>
            <h2 class="module-title">Quản Lý Bảng Lương & Chi Trả</h2>
            <p class="module-desc">Tính toán lương thực lĩnh (Net = Lương cơ bản + Thưởng - Khấu trừ) sử dụng Map & Reduce</p>
          </div>
          <button id="btn-print-payroll" class="btn btn-secondary">
            <span>🖨 In Bảng Lương</span>
          </button>
        </div>

        <!-- Thống kê tổng quỹ lương (Higher-Order Functions Reduce) -->
        <div class="grid grid-4 gap-3 mb-4">
          <div class="stat-card stat-primary">
            <div class="stat-label">Tổng Quỹ Lương Thực Lĩnh</div>
            <div class="stat-value text-primary">${formatCurrency(stats.totalFund)}</div>
            <div class="stat-sub">Chi trả cho ${stats.count} nhân sự</div>
          </div>

          <div class="stat-card stat-success">
            <div class="stat-label">Lương Trung Bình / Người</div>
            <div class="stat-value text-success">${formatCurrency(stats.averageSalary)}</div>
            <div class="stat-sub">Mức lương bình quân</div>
          </div>

          <div class="stat-card stat-warning">
            <div class="stat-label">Tổng Khoản Thưởng / Phụ Cấp</div>
            <div class="stat-value text-warning">${formatCurrency(stats.totalBonus)}</div>
            <div class="stat-sub">Đãi ngộ bổ sung</div>
          </div>

          <div class="stat-card stat-danger">
            <div class="stat-label">Tổng Khoản Khấu Trừ</div>
            <div class="stat-value text-danger">${formatCurrency(stats.totalDeduction)}</div>
            <div class="stat-sub">Bảo hiểm, thuế, kỷ luật</div>
          </div>
        </div>

        <!-- Bảng chi tiết lương -->
        <div class="table-responsive">
          <table class="data-table" id="payroll-table">
            <thead>
              <tr>
                <th>Mã NV</th>
                <th>Họ và Tên</th>
                <th>Phòng Ban</th>
                <th class="text-right">Lương Cơ Bản</th>
                <th class="text-right">Thưởng / Phụ Cấp</th>
                <th class="text-right">Giảm Trừ / Phạt</th>
                <th class="text-right font-bold text-primary">Lương Thực Lĩnh</th>
                <th class="text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              ${report.map(item => `
                <tr data-id="${item.id}">
                  <td><span class="badge badge-purple font-mono">${item.code}</span></td>
                  <td class="font-bold">${item.name}</td>
                  <td>${item.departmentName}</td>
                  <td class="text-right font-mono">${formatCurrency(item.baseSalary)}</td>
                  <td class="text-right font-mono text-success">+${formatCurrency(item.bonus)}</td>
                  <td class="text-right font-mono text-danger">-${formatCurrency(item.deduction)}</td>
                  <td class="text-right font-mono font-bold text-primary">${formatCurrency(item.netSalary)}</td>
                  <td class="text-center">
                    <button class="btn btn-sm btn-outline-primary btn-adjust-salary" data-id="${item.id}">Điều Chỉnh</button>
                    <button class="btn btn-sm btn-outline-secondary btn-view-slip" data-id="${item.id}">Phiếu Lương</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr class="font-bold bg-neutral">
                <td colspan="3" class="text-right">TỔNG CỘNG:</td>
                <td class="text-right font-mono">${formatCurrency(report.reduce((s, i) => s + i.baseSalary, 0))}</td>
                <td class="text-right font-mono text-success">+${formatCurrency(stats.totalBonus)}</td>
                <td class="text-right font-mono text-danger">-${formatCurrency(stats.totalDeduction)}</td>
                <td class="text-right font-mono text-primary font-bold">${formatCurrency(stats.totalFund)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- Modal Điều Chỉnh Lương Thưởng -->
        <div id="modal-salary-adjust" class="modal-backdrop hidden">
          <div class="modal-card animate-scale-up">
            <div class="modal-header">
              <h3 class="modal-title">Điều Chỉnh Lương & Thưởng Phạt</h3>
              <button id="btn-close-salary-modal" class="modal-close-btn">&times;</button>
            </div>
            <form id="form-salary-adjust" class="modal-body">
              <input type="hidden" id="adj-emp-id" />
              <div class="alert alert-neutral mb-3">
                Nhân viên: <strong id="adj-emp-name">---</strong> (<span id="adj-emp-code" class="font-mono">---</span>)
              </div>
              <div class="form-group">
                <label for="adj-base-salary">Lương cơ bản (VND)</label>
                <input type="number" id="adj-base-salary" class="form-control" min="0" step="500000" required />
              </div>
              <div class="form-group">
                <label for="adj-bonus">Thưởng / Phụ cấp KPI (VND)</label>
                <input type="number" id="adj-bonus" class="form-control" min="0" step="100000" />
              </div>
              <div class="form-group">
                <label for="adj-deduction">Khoản giảm trừ / Phạt (VND)</label>
                <input type="number" id="adj-deduction" class="form-control" min="0" step="100000" />
              </div>
              <div class="p-3 bg-neutral rounded mt-2">
                <strong>Dự kiến Thực Lĩnh:</strong>
                <span id="adj-preview-net" class="font-bold font-mono text-primary float-right">0 VND</span>
              </div>
              <div class="modal-footer mt-3">
                <button type="button" id="btn-cancel-salary-modal" class="btn btn-secondary">Đóng</button>
                <button type="submit" class="btn btn-primary">Lưu Điều Chỉnh</button>
              </div>
            </form>
          </div>
        </div>

        <!-- Modal Phiếu Lương Chi Tiết (Payslip) -->
        <div id="modal-payslip" class="modal-backdrop hidden">
          <div class="modal-card animate-scale-up">
            <div class="modal-header">
              <h3 class="modal-title">Phiếu Báo Lương Cá Nhân (Payslip)</h3>
              <button id="btn-close-slip-modal" class="modal-close-btn">&times;</button>
            </div>
            <div class="modal-body" id="payslip-content">
              <!-- Render chi tiết phiếu lương -->
            </div>
            <div class="modal-footer">
              <button id="btn-print-slip" class="btn btn-primary">In Phiếu Này</button>
              <button id="btn-dismiss-slip" class="btn btn-secondary">Đóng</button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Modal điều chỉnh lương
    const modalAdjust = container.querySelector('#modal-salary-adjust');
    const formAdjust = container.querySelector('#form-salary-adjust');
    const adjIdInput = container.querySelector('#adj-emp-id');
    const adjNameEl = container.querySelector('#adj-emp-name');
    const adjCodeEl = container.querySelector('#adj-emp-code');
    const adjBaseInput = container.querySelector('#adj-base-salary');
    const adjBonusInput = container.querySelector('#adj-bonus');
    const adjDeductionInput = container.querySelector('#adj-deduction');
    const adjPreviewNet = container.querySelector('#adj-preview-net');

    const updatePreview = () => {
      const base = Number(adjBaseInput.value) || 0;
      const bonus = Number(adjBonusInput.value) || 0;
      const ded = Number(adjDeductionInput.value) || 0;
      adjPreviewNet.textContent = formatCurrency(Math.max(0, base + bonus - ded));
    };

    adjBaseInput.addEventListener('input', updatePreview);
    adjBonusInput.addEventListener('input', updatePreview);
    adjDeductionInput.addEventListener('input', updatePreview);

    const closeAdjustModal = () => {
      modalAdjust.classList.add('hidden');
    };

    container.querySelector('#btn-close-salary-modal').addEventListener('click', closeAdjustModal);
    container.querySelector('#btn-cancel-salary-modal').addEventListener('click', closeAdjustModal);

    // Gắn sự kiện nút Điều Chỉnh
    container.querySelectorAll('.btn-adjust-salary').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const emp = this.db.getAllEmployeesSync().find(e => e.id === id);
        if (!emp) return;

        adjIdInput.value = emp.id;
        adjNameEl.textContent = emp.name;
        adjCodeEl.textContent = emp.code;
        adjBaseInput.value = emp.salary || 0;
        adjBonusInput.value = emp.bonus || 0;
        adjDeductionInput.value = emp.deduction || 0;
        updatePreview();
        modalAdjust.classList.remove('hidden');
      });
    });

    // Submit form điều chỉnh lương
    formAdjust.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = adjIdInput.value;
      const baseSalary = adjBaseInput.value;
      const bonus = adjBonusInput.value;
      const deduction = adjDeductionInput.value;

      try {
        await this.updateSalaryAdjustment(id, { baseSalary, bonus, deduction });
        showToast('Đã lưu điều chỉnh lương thành công!', 'success');
        closeAdjustModal();
        this.renderView(container);
      } catch (err) {
        showToast(err.message, 'error');
      }
    });

    // Modal Phiếu lương (Payslip)
    const modalSlip = container.querySelector('#modal-payslip');
    const slipContent = container.querySelector('#payslip-content');
    const closeSlipModal = () => modalSlip.classList.add('hidden');

    container.querySelector('#btn-close-slip-modal').addEventListener('click', closeSlipModal);
    container.querySelector('#btn-dismiss-slip').addEventListener('click', closeSlipModal);
    container.querySelector('#btn-print-slip').addEventListener('click', () => window.print());
    container.querySelector('#btn-print-payroll').addEventListener('click', () => window.print());

    container.querySelectorAll('.btn-view-slip').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const emp = this.db.getAllEmployeesSync().find(e => e.id === id);
        if (!emp) return;

        const dept = this.deptModule.getDepartmentById(emp.departmentId);
        const pos = this.posModule.getPositionById(emp.positionId);
        const net = this.calculateNetSalary(emp);

        slipContent.innerHTML = `
          <div class="payslip-box p-4 border rounded">
            <div class="text-center mb-4">
              <h3 class="font-bold text-uppercase">PHIẾU BÁO LƯƠNG NHÂN VIÊN</h3>
              <p class="text-muted text-sm">Kỳ thanh toán: Tháng ${new Date().getMonth() + 1} / ${new Date().getFullYear()}</p>
            </div>
            <div class="grid grid-2 gap-2 mb-3">
              <div><strong>Mã NV:</strong> <span class="font-mono font-bold">${emp.code}</span></div>
              <div><strong>Họ và tên:</strong> <span class="font-bold">${emp.name}</span></div>
              <div><strong>Phòng ban:</strong> ${dept ? dept.name : 'N/A'}</div>
              <div><strong>Chức danh:</strong> ${pos ? pos.title : 'N/A'}</div>
            </div>
            <hr class="my-3"/>
            <table class="w-full text-sm mb-3">
              <tr>
                <td class="py-1">1. Lương cơ bản theo hợp đồng:</td>
                <td class="text-right font-mono font-bold">${formatCurrency(emp.salary)}</td>
              </tr>
              <tr>
                <td class="py-1 text-success">2. Phụ cấp / Thưởng KPI:</td>
                <td class="text-right font-mono text-success">+${formatCurrency(emp.bonus || 0)}</td>
              </tr>
              <tr>
                <td class="py-1 text-danger">3. Các khoản khấu trừ (BHXH, Phạt):</td>
                <td class="text-right font-mono text-danger">-${formatCurrency(emp.deduction || 0)}</td>
              </tr>
              <tr class="font-bold text-lg border-t">
                <td class="py-2 text-primary">THỰC LĨNH CHUYỂN KHOẢN (Net):</td>
                <td class="text-right font-mono text-primary py-2">${formatCurrency(net)}</td>
              </tr>
            </table>
            <div class="text-center text-muted text-xs mt-4">
              Mọi thắc mắc về bảng lương vui lòng liên hệ Phòng Tài chính - Kế toán trước ngày 05 hàng tháng.
            </div>
          </div>
        `;

        modalSlip.classList.remove('hidden');
      });
    });
  }
}
