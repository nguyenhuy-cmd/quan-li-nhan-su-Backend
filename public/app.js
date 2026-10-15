/**
 * app.js
 * Điểm khởi chạy chính của Ứng dụng Quản lý Nhân sự (HRM Application)
 * - Import và điều phối 12 module nghiệp vụ độc lập
 * - Quản lý Routing (chuyển đổi module dựa trên Sidebar Menu)
 * - Kiểm soát Session đăng nhập và phân quyền người dùng
 * - Render Dashboard tổng quan với các chỉ số KPI doanh nghiệp
 * - Hỗ trợ công tắc chuyển đổi giữa LocalStorage (chuẩn đề bài) và Backend API
 */

import { AuthModule } from './modules/authModule.js';
import { EmployeeDbModule } from './modules/employeeDbModule.js';
import { AddEmployeeModule } from './modules/addEmployeeModule.js';
import { EditEmployeeModule } from './modules/editEmployeeModule.js';
import { DeleteEmployeeModule } from './modules/deleteEmployeeModule.js';
import { SearchEmployeeModule } from './modules/searchEmployeeModule.js';
import { DepartmentModule } from './modules/departmentModule.js';
import { PositionModule } from './modules/positionModule.js';
import { SalaryModule } from './modules/salaryModule.js';
import { AttendanceModule } from './modules/attendanceModule.js';
import { LeaveModule } from './modules/leaveModule.js';
import { PerformanceModule } from './modules/performanceModule.js';
import { BackendService } from './modules/backendService.js';
import { formatCurrency, formatDate, showToast } from './modules/uiHelper.js';

class App {
  constructor() {
    // 1. Khởi tạo các module nền tảng
    this.authModule = new AuthModule();
    this.deptModule = new DepartmentModule();
    this.posModule = new PositionModule();
    this.employeeDb = new EmployeeDbModule();
    this.backendService = new BackendService();

    // 2. Khởi tạo các module nghiệp vụ nhân sự phụ thuộc
    this.addEmpModule = new AddEmployeeModule(this.employeeDb, this.deptModule, this.posModule);
    this.editEmpModule = new EditEmployeeModule(this.employeeDb, this.deptModule, this.posModule);
    this.deleteEmpModule = new DeleteEmployeeModule(this.employeeDb, this.deptModule, this.posModule);
    this.searchEmpModule = new SearchEmployeeModule(this.employeeDb, this.deptModule, this.posModule);
    this.salaryModule = new SalaryModule(this.employeeDb, this.deptModule, this.posModule);
    this.attendanceModule = new AttendanceModule(this.employeeDb);
    this.leaveModule = new LeaveModule(this.employeeDb);
    this.performanceModule = new PerformanceModule(this.employeeDb, this.deptModule, this.posModule);

    // Trạng thái routing hiện tại
    this.currentRoute = 'dashboard';
    this.routeParams = null;
  }

  // Khởi động ứng dụng
  init() {
    this.checkAuthAndRender();
  }

  // Kiểm tra phiên đăng nhập
  checkAuthAndRender() {
    const mainContainer = document.getElementById('app-root');
    if (!this.authModule.isAuthenticated()) {
      // Chưa đăng nhập -> Render Auth View
      this.authModule.renderAuthView(mainContainer, (session) => {
        this.renderAppShell();
        this.navigateTo('dashboard');
      });
    } else {
      // Đã đăng nhập -> Render App Shell & Dashboard
      this.renderAppShell();
      this.navigateTo('dashboard');
    }
  }

  // Render khung ứng dụng chính (Header, Sidebar, Main Content)
  renderAppShell() {
    const session = this.authModule.getCurrentSession();
    const user = session ? session.user : { fullName: 'Quản trị viên', role: 'ADMIN' };
    const mainContainer = document.getElementById('app-root');

    mainContainer.innerHTML = `
      <div class="app-layout">
        <!-- Sidebar Navigation -->
        <aside class="sidebar" id="app-sidebar">
          <div class="sidebar-brand">
            <div class="brand-icon">HR</div>
            <div class="brand-text">
              <h3>HRM Pro</h3>
              <small>Vanilla JS Management</small>
            </div>
          </div>

          <nav class="sidebar-menu">
            <div class="menu-section-title">TỔNG QUAN</div>
            <a href="#dashboard" class="menu-item active" data-route="dashboard">
              <span class="menu-icon">📊</span>
              <span class="menu-title">Bàn Làm Việc (Dashboard)</span>
            </a>

            <div class="menu-section-title">QUẢN LÝ NHÂN SỰ</div>
            <a href="#search-employee" class="menu-item" data-route="search-employee">
              <span class="menu-icon">🔍</span>
              <span class="menu-title">Tra Cứu & Tìm Kiếm NV</span>
            </a>
            <a href="#add-employee" class="menu-item" data-route="add-employee">
              <span class="menu-icon">➕</span>
              <span class="menu-title">Thêm Nhân Viên Mới</span>
            </a>
            <a href="#edit-employee" class="menu-item" data-route="edit-employee">
              <span class="menu-icon">✏️</span>
              <span class="menu-title">Sửa Thông Tin Nhân Viên</span>
            </a>
            <a href="#delete-employee" class="menu-item" data-route="delete-employee">
              <span class="menu-icon">🗑️</span>
              <span class="menu-title">Xóa Hồ Sơ Nhân Viên</span>
            </a>

            <div class="menu-section-title">CƠ CẤU & DANH MỤC</div>
            <a href="#departments" class="menu-item" data-route="departments">
              <span class="menu-icon">🏢</span>
              <span class="menu-title">Quản Lý Phòng Ban</span>
            </a>
            <a href="#positions" class="menu-item" data-route="positions">
              <span class="menu-icon">💼</span>
              <span class="menu-title">Quản Lý Vị Trí Chức Danh</span>
            </a>

            <div class="menu-section-title">CHẾ ĐỘ & ĐÁNH GIÁ</div>
            <a href="#salaries" class="menu-item" data-route="salaries">
              <span class="menu-icon">💰</span>
              <span class="menu-title">Quản Lý Bảng Lương (Payroll)</span>
            </a>
            <a href="#attendance" class="menu-item" data-route="attendance">
              <span class="menu-icon">⏰</span>
              <span class="menu-title">Theo Dõi Chấm Công</span>
            </a>
            <a href="#leaves" class="menu-item" data-route="leaves">
              <span class="menu-icon">🏖️</span>
              <span class="menu-title">Quản Lý Nghỉ Phép</span>
            </a>
            <a href="#performance" class="menu-item" data-route="performance">
              <span class="menu-icon">⭐</span>
              <span class="menu-title">Đánh Giá Hiệu Suất</span>
            </a>
          </nav>

          <div class="sidebar-footer">
            <div class="version-tag">HRM WD1113 • v1.0.0</div>
          </div>
        </aside>

        <!-- Main Content Area -->
        <div class="main-wrapper">
          <!-- Top Header Bar -->
          <header class="top-header">
            <div class="header-left">
              <button id="btn-toggle-sidebar" class="sidebar-toggle-btn" aria-label="Toggle Sidebar">
                ☰
              </button>
              <h2 id="page-current-title" class="current-page-title">Bàn Làm Việc (Dashboard)</h2>
            </div>

            <div class="header-right">
              <!-- Chế độ lưu trữ dữ liệu Switch -->
              <div class="mode-badge-wrapper" title="Chế độ lưu trữ dữ liệu hiện tại">
                <span class="badge badge-success font-mono">💾 LocalStorage (Đề Bài)</span>
              </div>

              <!-- User Profile Dropdown -->
              <div class="user-profile">
                <div class="user-avatar">${user.fullName.charAt(0).toUpperCase()}</div>
                <div class="user-info">
                  <span class="user-name">${user.fullName}</span>
                  <span class="user-role badge badge-purple">${user.role}</span>
                </div>
                <button id="btn-logout" class="btn btn-sm btn-outline-danger ml-2" title="Đăng xuất khỏi hệ thống">
                  Đăng Xuất
                </button>
              </div>
            </div>
          </header>

          <!-- Dynamic View Container -->
          <main class="page-content" id="module-container">
            <!-- Các module sẽ được render động vào đây -->
          </main>
        </div>
      </div>
    `;

    this.bindGlobalEvents();
  }

  // Gắn sự kiện toàn cục
  bindGlobalEvents() {
    // 1. Sidebar menu click routing
    const menuItems = document.querySelectorAll('.sidebar-menu .menu-item');
    menuItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const route = item.getAttribute('data-route');
        this.navigateTo(route);

        // Đóng sidebar trên màn hình nhỏ
        if (window.innerWidth <= 992) {
          document.getElementById('app-sidebar')?.classList.remove('open');
        }
      });
    });

    // 2. Toggle sidebar mobile
    const toggleBtn = document.getElementById('btn-toggle-sidebar');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        document.getElementById('app-sidebar')?.classList.toggle('open');
      });
    }

    // 3. Đăng xuất
    const logoutBtn = document.getElementById('btn-logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        this.authModule.logout();
        this.checkAuthAndRender();
      });
    }
  }

  // Điều hướng chuyển đổi giữa các module (Client-Side Router)
  navigateTo(route, params = null) {
    this.currentRoute = route;
    this.routeParams = params;

    // Cập nhật class active trong sidebar menu
    document.querySelectorAll('.sidebar-menu .menu-item').forEach(item => {
      if (item.getAttribute('data-route') === route) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    const container = document.getElementById('module-container');
    const titleEl = document.getElementById('page-current-title');
    if (!container) return;

    // Định tuyến và gọi hàm render tương ứng cho từng module
    switch (route) {
      case 'dashboard':
        if (titleEl) titleEl.textContent = 'Bàn Làm Việc (Dashboard)';
        this.renderDashboard(container);
        break;

      case 'search-employee':
        if (titleEl) titleEl.textContent = 'Tra Cứu & Tìm Kiếm Nhân Viên';
        this.searchEmpModule.renderView(container, (action, empId) => {
          if (action === 'edit') this.navigateTo('edit-employee', { empId });
          if (action === 'delete') this.navigateTo('delete-employee', { empId });
        });
        break;

      case 'add-employee':
        if (titleEl) titleEl.textContent = 'Thêm Hồ Sơ Nhân Viên Mới';
        this.addEmpModule.renderView(container, () => {
          this.navigateTo('search-employee');
        });
        break;

      case 'edit-employee':
        if (titleEl) titleEl.textContent = 'Cập Nhật Hồ Sơ Nhân Viên';
        const empIdToEdit = this.routeParams?.empId || null;
        this.editEmpModule.renderView(container, empIdToEdit, () => {
          this.navigateTo('search-employee');
        });
        break;

      case 'delete-employee':
        if (titleEl) titleEl.textContent = 'Xóa Hồ Sơ Nhân Viên';
        this.deleteEmpModule.renderView(container, () => {
          this.navigateTo('search-employee');
        });
        break;

      case 'departments':
        if (titleEl) titleEl.textContent = 'Quản Lý Phòng Ban Doanh Nghiệp';
        this.deptModule.renderView(
          container,
          (deptId) => this.employeeDb.countByDepartment(deptId),
          (deptId) => this.employeeDb.countByDepartment(deptId) > 0
        );
        break;

      case 'positions':
        if (titleEl) titleEl.textContent = 'Quản Lý Vị Trí Chức Danh';
        this.posModule.renderView(
          container,
          (posId) => this.employeeDb.countByPosition(posId),
          (posId) => this.employeeDb.countByPosition(posId) > 0
        );
        break;

      case 'salaries':
        if (titleEl) titleEl.textContent = 'Quản Lý Bảng Lương (Payroll)';
        this.salaryModule.renderView(container);
        break;

      case 'attendance':
        if (titleEl) titleEl.textContent = 'Theo Dõi Chấm Công Hàng Ngày';
        this.attendanceModule.renderView(container);
        break;

      case 'leaves':
        if (titleEl) titleEl.textContent = 'Quản Lý Đơn Nghỉ Phép';
        this.leaveModule.renderView(container);
        break;

      case 'performance':
        if (titleEl) titleEl.textContent = 'Đánh Giá Hiệu Suất Nhân Sự';
        this.performanceModule.renderView(container);
        break;

      default:
        this.renderDashboard(container);
        break;
    }

    // Scroll lên đầu trang khi chuyển view
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Render Dashboard chính
  renderDashboard(container) {
    const employees = this.employeeDb.getAllEmployeesSync();
    const departments = this.deptModule.getDepartmentsSync();
    const positions = this.posModule.getPositionsSync();
    const leaves = this.leaveModule.getLeavesSync();
    const payrollStats = this.salaryModule.calculateStatistics();
    const topPerformers = this.performanceModule.getTopPerformers(3);

    const pendingLeaves = leaves.filter(l => l.status === 'pending').length;

    container.innerHTML = `
      <div class="dashboard-wrapper animate-fade-in">
        <!-- Banner chào mừng -->
        <div class="welcome-banner mb-4">
          <div class="banner-content">
            <h1>Chào mừng trở lại hệ thống Quản Trị Nhân Sự! 👋</h1>
            <p>Hệ thống HRM 12 Modules xây dựng hoàn toàn bằng Vanilla JavaScript ES6+, LocalStorage, và Higher-Order Functions.</p>
          </div>
          <div class="banner-quick-actions">
            <button class="btn btn-light" id="dash-btn-add-emp">+ Thêm Nhân Viên</button>
            <button class="btn btn-outline-light" id="dash-btn-payroll">Bảng Lương</button>
          </div>
        </div>

        <!-- 4 Thẻ KPI thống kê chính -->
        <div class="grid grid-4 gap-4 mb-4">
          <div class="kpi-card">
            <div class="kpi-icon-wrapper bg-blue-subtle text-primary">👥</div>
            <div class="kpi-info">
              <span class="kpi-title">Tổng Số Nhân Sự</span>
              <h2 class="kpi-value">${employees.length}</h2>
              <span class="kpi-note text-success">Đang hoạt động trên hệ thống</span>
            </div>
          </div>

          <div class="kpi-card">
            <div class="kpi-icon-wrapper bg-purple-subtle text-purple">🏢</div>
            <div class="kpi-info">
              <span class="kpi-title">Phòng Ban & Khối</span>
              <h2 class="kpi-value">${departments.length}</h2>
              <span class="kpi-note text-muted">Cơ cấu tổ chức công ty</span>
            </div>
          </div>

          <div class="kpi-card">
            <div class="kpi-icon-wrapper bg-green-subtle text-success">💵</div>
            <div class="kpi-info">
              <span class="kpi-title">Tổng Quỹ Lương / Tháng</span>
              <h2 class="kpi-value text-success">${formatCurrency(payrollStats.totalFund)}</h2>
              <span class="kpi-note text-muted">Lương bình quân: ${formatCurrency(payrollStats.averageSalary)}</span>
            </div>
          </div>

          <div class="kpi-card">
            <div class="kpi-icon-wrapper bg-amber-subtle text-warning">🏖️</div>
            <div class="kpi-info">
              <span class="kpi-title">Đơn Nghỉ Chờ Duyệt</span>
              <h2 class="kpi-value text-warning">${pendingLeaves}</h2>
              <span class="kpi-note ${pendingLeaves > 0 ? 'text-danger font-bold' : 'text-muted'}">
                ${pendingLeaves > 0 ? 'Cần xem xét phê duyệt' : 'Đã duyệt tất cả'}
              </span>
            </div>
          </div>
        </div>

        <!-- Phần 2: Thống kê cơ cấu phòng ban & Top Nhân viên xuất sắc -->
        <div class="grid grid-3 gap-4 mb-4">
          <!-- Phân bổ nhân sự theo phòng ban (CSS Bar Chart) -->
          <div class="card col-span-2">
            <div class="card-header flex-between">
              <h3 class="card-title">Phân Bổ Nhân Sự Theo Phòng Ban</h3>
              <span class="badge badge-info">Tổng: ${departments.length} Phòng Ban</span>
            </div>
            <div class="card-body">
              <div class="dept-distribution-list">
                ${departments.map(dept => {
                  const count = this.employeeDb.countByDepartment(dept.id);
                  const percent = employees.length > 0 ? Math.round((count / employees.length) * 100) : 0;
                  return `
                    <div class="dept-dist-item mb-3">
                      <div class="flex-between mb-1">
                        <span class="font-bold">${dept.name} (${dept.code})</span>
                        <span class="text-sm font-mono">${count} nhân viên (${percent}%)</span>
                      </div>
                      <div class="progress-bar-bg">
                        <div class="progress-bar-fill" style="width: ${percent}%;"></div>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          </div>

          <!-- Top Performers Widget -->
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">⭐ Nhân Viên Tiêu Biểu</h3>
            </div>
            <div class="card-body">
              <div class="top-list">
                ${topPerformers.map((emp, idx) => {
                  const pos = this.posModule.getPositionById(emp.positionId);
                  const medals = ['🥇', '🥈', '🥉'];
                  return `
                    <div class="top-item flex items-center gap-3 py-2 border-b">
                      <span class="text-xl">${medals[idx] || '🎖️'}</span>
                      <div class="flex-1">
                        <div class="font-bold text-sm">${emp.name}</div>
                        <div class="text-xs text-muted">${pos ? pos.title : 'Nhân sự'}</div>
                      </div>
                      <div class="font-bold text-warning font-mono">${emp.avgRating} ★</div>
                    </div>
                  `;
                }).join('')}
              </div>
              <div class="mt-3 text-center">
                <button id="dash-btn-all-perf" class="btn btn-sm btn-outline-primary btn-block">Xem Toàn Bộ Đánh Giá</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Phần 3: Bảng danh sách nhân viên gia nhập gần đây -->
        <div class="card">
          <div class="card-header flex-between">
            <h3 class="card-title">Hồ Sơ Nhân Sự Gần Đây</h3>
            <button id="dash-btn-view-all-emp" class="btn btn-sm btn-outline-primary">Xem Tất Cả & Lọc</button>
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
                  <th>Ngày Tuyển Dụng</th>
                  <th>Trạng Thái</th>
                  <th class="text-right">Tác Vụ</th>
                </tr>
              </thead>
              <tbody>
                ${employees.slice(0, 5).map(emp => {
                  const dept = this.deptModule.getDepartmentById(emp.departmentId);
                  const pos = this.posModule.getPositionById(emp.positionId);
                  return `
                    <tr>
                      <td><span class="badge badge-purple font-mono font-bold">${emp.code}</span></td>
                      <td class="font-bold">${emp.name}</td>
                      <td>${dept ? dept.name : 'N/A'}</td>
                      <td>${pos ? pos.title : 'N/A'}</td>
                      <td class="font-bold text-success font-mono">${formatCurrency(emp.salary)}</td>
                      <td>${formatDate(emp.hireDate)}</td>
                      <td><span class="badge badge-success">Chính thức</span></td>
                      <td class="text-right">
                        <button class="btn btn-sm btn-outline-warning dash-quick-edit" data-id="${emp.id}">Sửa</button>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    // Gắn sự kiện các nút trên Dashboard
    container.querySelector('#dash-btn-add-emp').addEventListener('click', () => this.navigateTo('add-employee'));
    container.querySelector('#dash-btn-payroll').addEventListener('click', () => this.navigateTo('salaries'));
    container.querySelector('#dash-btn-view-all-emp').addEventListener('click', () => this.navigateTo('search-employee'));
    container.querySelector('#dash-btn-all-perf').addEventListener('click', () => this.navigateTo('performance'));

    container.querySelectorAll('.dash-quick-edit').forEach(btn => {
      btn.addEventListener('click', () => {
        const empId = btn.getAttribute('data-id');
        this.navigateTo('edit-employee', { empId });
      });
    });
  }
}

// Khởi chạy khi DOM đã sẵn sàng
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});
