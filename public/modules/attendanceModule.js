/**
 * attendanceModule.js
 * Module Theo dõi Chấm công & Thời gian làm việc:
 * - Ghi nhận Check-in và Check-out hàng ngày
 * - Tính toán chính xác tổng giờ làm việc sử dụng đối tượng Date (Date Objects & Time Arithmetic)
 * - Xác định trạng thái đi làm (Đúng giờ / Đi muộn / Về sớm)
 * - Báo cáo chấm công theo khoảng ngày và theo từng nhân viên
 * - Lưu trữ bền vững trong localStorage ('hrm_attendance')
 */

import { formatDateTime, showToast, showConfirmModal } from './uiHelper.js';

const STORAGE_KEY_ATTENDANCE = 'hrm_attendance';

export class AttendanceModule {
  constructor(employeeDbModule) {
    this.db = employeeDbModule;
    this.initDefaultAttendance();
  }

  // Khởi tạo một số log chấm công mẫu trong tuần
  initDefaultAttendance() {
    const existing = localStorage.getItem(STORAGE_KEY_ATTENDANCE);
    if (!existing) {
      const today = new Date();
      const formatYMD = (d) => d.toISOString().split('T')[0];

      const makeIsoTime = (d, h, m) => {
        const copy = new Date(d);
        copy.setHours(h, m, 0, 0);
        return copy.toISOString();
      };

      const defaultLogs = [
        {
          id: 'att_01',
          date: formatYMD(today),
          employeeId: 'emp_01', // Nguyễn Văn An
          checkIn: makeIsoTime(today, 8, 25),
          checkOut: makeIsoTime(today, 17, 30),
          workHours: 8.0,
          status: 'on_time'
        },
        {
          id: 'att_02',
          date: formatYMD(today),
          employeeId: 'emp_02', // Trần Thị Mai
          checkIn: makeIsoTime(today, 8, 45), // Muộn 15p so với 8h30
          checkOut: makeIsoTime(today, 17, 45),
          workHours: 8.0,
          status: 'late'
        },
        {
          id: 'att_03',
          date: formatYMD(today),
          employeeId: 'emp_03', // Lê Hoàng Nam
          checkIn: makeIsoTime(today, 8, 15),
          checkOut: null, // Chưa check out
          workHours: 0,
          status: 'working'
        },
        {
          id: 'att_04',
          date: formatYMD(today),
          employeeId: 'emp_04', // Phạm Hương Giang
          checkIn: makeIsoTime(today, 8, 20),
          checkOut: makeIsoTime(today, 17, 30),
          workHours: 8.17,
          status: 'on_time'
        }
      ];
      this.saveLogs(defaultLogs);
    }
  }

  getLogsSync() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY_ATTENDANCE)) || [];
    } catch {
      return [];
    }
  }

  saveLogs(logs) {
    localStorage.setItem(STORAGE_KEY_ATTENDANCE, JSON.stringify(logs));
  }

  // Tính số giờ làm việc giữa 2 mốc thời gian bằng Date Object
  calculateWorkHours(checkInIso, checkOutIso) {
    if (!checkInIso || !checkOutIso) return 0;
    const start = new Date(checkInIso);
    const end = new Date(checkOutIso);
    const diffMs = end.getTime() - start.getTime();
    if (diffMs <= 0) return 0;
    // Đổi ra giờ làm việc (trừ 1 tiếng nghỉ trưa nếu làm trên 5 tiếng)
    let hours = diffMs / (1000 * 60 * 60);
    if (hours > 5) {
      hours = Math.max(0, hours - 1); // 1 giờ nghỉ trưa
    }
    return Math.round(hours * 100) / 100;
  }

  // Check-In cho nhân viên
  async checkIn(employeeId, customDateTime = null) {
    await new Promise(r => setTimeout(r, 150));
    const logs = this.getLogsSync();
    const now = customDateTime ? new Date(customDateTime) : new Date();
    const dateStr = now.toISOString().split('T')[0];

    // Kiểm tra xem hôm nay nhân viên đã check-in chưa
    const existing = logs.find(l => l.employeeId === employeeId && l.date === dateStr);
    if (existing) {
      throw new Error(`Nhân viên này đã điểm danh Check-In trong ngày hôm nay lúc ${new Date(existing.checkIn).toLocaleTimeString()}!`);
    }

    // Tiêu chuẩn giờ vào làm là 08:30:00
    const standardIn = new Date(now);
    standardIn.setHours(8, 30, 0, 0);
    const isLate = now.getTime() > standardIn.getTime();

    const newLog = {
      id: 'att_' + Date.now(),
      date: dateStr,
      employeeId,
      checkIn: now.toISOString(),
      checkOut: null,
      workHours: 0,
      status: isLate ? 'late' : 'on_time'
    };

    logs.unshift(newLog);
    this.saveLogs(logs);
    return newLog;
  }

  // Check-Out cho nhân viên
  async checkOut(employeeId, customDateTime = null) {
    await new Promise(r => setTimeout(r, 150));
    const logs = this.getLogsSync();
    const now = customDateTime ? new Date(customDateTime) : new Date();
    const dateStr = now.toISOString().split('T')[0];

    const currentLog = logs.find(l => l.employeeId === employeeId && l.date === dateStr);
    if (!currentLog) {
      throw new Error('Chưa tìm thấy bản ghi Check-In hôm nay của nhân viên này! Vui lòng Check-In trước.');
    }
    if (currentLog.checkOut) {
      throw new Error(`Nhân viên đã Check-Out lúc ${new Date(currentLog.checkOut).toLocaleTimeString()} rồi!`);
    }

    const checkOutIso = now.toISOString();
    const workHours = this.calculateWorkHours(currentLog.checkIn, checkOutIso);

    currentLog.checkOut = checkOutIso;
    currentLog.workHours = workHours;

    this.saveLogs(logs);
    return currentLog;
  }

  // Báo cáo chấm công theo nhân viên hoặc khoảng ngày (Higher-Order Functions filter)
  getAttendanceReport(employeeId = null, fromDate = null, toDate = null) {
    let logs = this.getLogsSync();

    if (employeeId) {
      logs = logs.filter(l => l.employeeId === employeeId);
    }
    if (fromDate) {
      logs = logs.filter(l => l.date >= fromDate);
    }
    if (toDate) {
      logs = logs.filter(l => l.date <= toDate);
    }

    return logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  // Render view chấm công
  renderView(container) {
    const allEmployees = this.db.getAllEmployeesSync();
    const todayStr = new Date().toISOString().split('T')[0];
    const initialLogs = this.getAttendanceReport(null, null, null);

    container.innerHTML = `
      <div class="module-card animate-fade-in">
        <div class="module-header flex-between">
          <div>
            <h2 class="module-title">Theo Dõi Chấm Công & Giờ Làm</h2>
            <p class="module-desc">Ghi nhận Check-in / Check-out và tự động tính tổng giờ làm việc bằng Date Objects</p>
          </div>
          <div class="digital-clock" id="live-clock">--:--:--</div>
        </div>

        <!-- Bảng Check-In / Check-Out Nhanh Hôm Nay -->
        <div class="quick-action-panel p-4 mb-4 rounded border">
          <h4 class="font-bold mb-3">📍 Điểm Danh Chấm Công Trong Ngày (${todayStr})</h4>
          <div class="grid grid-3 gap-3">
            <div class="form-group">
              <label for="att-select-emp">Chọn Nhân Viên Điểm Danh</label>
              <select id="att-select-emp" class="form-control">
                <option value="">-- Chọn nhân viên --</option>
                ${allEmployees.map(e => `<option value="${e.id}">[${e.code}] ${e.name}</option>`).join('')}
              </select>
            </div>
            <div class="form-group flex items-end gap-2 col-span-2">
              <button id="btn-quick-checkin" class="btn btn-success flex-1">
                <span>🕒 Điểm Danh Vào (Check-In)</span>
              </button>
              <button id="btn-quick-checkout" class="btn btn-warning flex-1">
                <span>🚪 Điểm Danh Ra (Check-Out)</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Bộ lọc nhật ký chấm công -->
        <div class="filter-bar flex-gap mb-3">
          <div class="form-group flex-1">
            <label for="filter-att-emp">Lọc theo nhân viên</label>
            <select id="filter-att-emp" class="form-control">
              <option value="">-- Tất cả nhân viên --</option>
              ${allEmployees.map(e => `<option value="${e.id}">${e.name} (${e.code})</option>`).join('')}
            </select>
          </div>
          <div class="form-group flex-1">
            <label for="filter-att-from">Từ ngày</label>
            <input type="date" id="filter-att-from" class="form-control" />
          </div>
          <div class="form-group flex-1">
            <label for="filter-att-to">Đến ngày</label>
            <input type="date" id="filter-att-to" class="form-control" />
          </div>
          <div class="form-group flex items-end">
            <button id="btn-filter-att" class="btn btn-secondary">Lọc Báo Cáo</button>
          </div>
        </div>

        <!-- Bảng nhật ký chấm công -->
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Ngày</th>
                <th>Mã NV</th>
                <th>Họ và Tên</th>
                <th>Giờ Check-In</th>
                <th>Giờ Check-Out</th>
                <th class="text-right">Tổng Giờ Làm</th>
                <th>Trạng Thái</th>
              </tr>
            </thead>
            <tbody id="att-tbody">
              <!-- Render động -->
            </tbody>
          </table>
        </div>
      </div>
    `;

    // Đồng hồ số trực tiếp
    const clockEl = container.querySelector('#live-clock');
    const updateClock = () => {
      if (clockEl.isConnected) {
        clockEl.textContent = new Date().toLocaleTimeString('vi-VN');
      }
    };
    setInterval(updateClock, 1000);
    updateClock();

    const tbody = container.querySelector('#att-tbody');
    const empSelect = container.querySelector('#att-select-emp');
    const btnCheckIn = container.querySelector('#btn-quick-checkin');
    const btnCheckOut = container.querySelector('#btn-quick-checkout');

    const filterEmp = container.querySelector('#filter-att-emp');
    const filterFrom = container.querySelector('#filter-att-from');
    const filterTo = container.querySelector('#filter-att-to');
    const btnFilter = container.querySelector('#btn-filter-att');

    // Hàm render bảng log
    const renderTable = (logs) => {
      if (logs.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-muted">Chưa có bản ghi chấm công nào phù hợp.</td></tr>`;
        return;
      }

      tbody.innerHTML = logs.map(l => {
        const emp = allEmployees.find(e => e.id === l.employeeId);
        const formatTimeOnly = (iso) => iso ? new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '---';

        let statusBadge = '<span class="badge badge-success">Đúng giờ</span>';
        if (l.status === 'late') {
          statusBadge = '<span class="badge badge-warning">Đi muộn</span>';
        } else if (!l.checkOut) {
          statusBadge = '<span class="badge badge-info">Đang làm việc</span>';
        }

        return `
          <tr>
            <td class="font-bold">${l.date}</td>
            <td><span class="badge badge-purple font-mono">${emp ? emp.code : 'N/A'}</span></td>
            <td class="font-bold">${emp ? emp.name : 'Nhân viên đã xóa'}</td>
            <td class="font-mono">${formatTimeOnly(l.checkIn)}</td>
            <td class="font-mono">${formatTimeOnly(l.checkOut)}</td>
            <td class="text-right font-mono font-bold">${l.workHours ? l.workHours + ' giờ' : (l.checkOut ? '0 giờ' : 'Đang tính')}</td>
            <td>${statusBadge}</td>
          </tr>
        `;
      }).join('');
    };

    renderTable(initialLogs);

    // Xử lý Check-in
    btnCheckIn.addEventListener('click', async () => {
      const empId = empSelect.value;
      if (!empId) {
        showToast('Vui lòng chọn nhân viên cần Check-In', 'warning');
        return;
      }

      try {
        await this.checkIn(empId);
        showToast('Điểm danh Check-In thành công!', 'success');
        renderTable(this.getAttendanceReport(filterEmp.value, filterFrom.value, filterTo.value));
      } catch (err) {
        showToast(err.message, 'error');
      }
    });

    // Xử lý Check-out
    btnCheckOut.addEventListener('click', async () => {
      const empId = empSelect.value;
      if (!empId) {
        showToast('Vui lòng chọn nhân viên cần Check-Out', 'warning');
        return;
      }

      try {
        const res = await this.checkOut(empId);
        showToast(`Check-Out thành công! Tổng giờ làm hôm nay: ${res.workHours} giờ`, 'success');
        renderTable(this.getAttendanceReport(filterEmp.value, filterFrom.value, filterTo.value));
      } catch (err) {
        showToast(err.message, 'error');
      }
    });

    // Lọc báo cáo
    btnFilter.addEventListener('click', () => {
      const filtered = this.getAttendanceReport(filterEmp.value, filterFrom.value, filterTo.value);
      renderTable(filtered);
      showToast(`Đã lọc danh sách chấm công (${filtered.length} kết quả)`, 'info');
    });
  }
}
