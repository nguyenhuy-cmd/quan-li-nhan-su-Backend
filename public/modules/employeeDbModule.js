/**
 * employeeDbModule.js
 * Module Cơ sở dữ liệu Nhân viên:
 * - Lưu trữ dữ liệu nhân sự trong localStorage ('hrm_employees')
 * - CRUD operations: getAll, getById, add, update, delete
 * - Sử dụng Higher-Order Functions (filter, sort, map, reduce, find)
 * - Async/await mô phỏng trễ lưu trữ
 * - Tự động khởi tạo dữ liệu mẫu nếu chưa có
 */

const STORAGE_KEY_EMPLOYEES = 'hrm_employees';

export class EmployeeDbModule {
  constructor() {
    this.initDefaultEmployees();
  }

  // Khởi tạo danh sách nhân viên mẫu nếu localStorage rỗng
  initDefaultEmployees() {
    const existing = localStorage.getItem(STORAGE_KEY_EMPLOYEES);
    if (!existing) {
      const defaultEmployees = [
        {
          id: 'emp_01',
          code: 'NV001',
          name: 'Nguyễn Văn An',
          email: 'an.nguyen@company.vn',
          phone: '0912345678',
          gender: 'male',
          dateOfBirth: '1992-05-14',
          departmentId: 'dept_01', // TECH
          positionId: 'pos_01',   // Senior Engineer
          salary: 32000000,
          bonus: 3000000,
          deduction: 1500000,
          hireDate: '2021-03-15',
          status: 'active'
        },
        {
          id: 'emp_02',
          code: 'NV002',
          name: 'Trần Thị Mai',
          email: 'mai.tran@company.vn',
          phone: '0987654321',
          gender: 'female',
          dateOfBirth: '1995-08-20',
          departmentId: 'dept_02', // HR
          positionId: 'pos_03',   // HR Manager
          salary: 26000000,
          bonus: 2000000,
          deduction: 1000000,
          hireDate: '2022-01-10',
          status: 'active'
        },
        {
          id: 'emp_03',
          code: 'NV003',
          name: 'Lê Hoàng Nam',
          email: 'nam.le@company.vn',
          phone: '0903112233',
          gender: 'male',
          dateOfBirth: '1997-11-03',
          departmentId: 'dept_01', // TECH
          positionId: 'pos_02',   // Fullstack Dev
          salary: 20000000,
          bonus: 1500000,
          deduction: 800000,
          hireDate: '2023-04-01',
          status: 'active'
        },
        {
          id: 'emp_04',
          code: 'NV004',
          name: 'Phạm Hương Giang',
          email: 'giang.pham@company.vn',
          phone: '0977889900',
          gender: 'female',
          dateOfBirth: '1996-02-18',
          departmentId: 'dept_03', // SALE
          positionId: 'pos_05',   // Sales Leader
          salary: 24000000,
          bonus: 5000000,
          deduction: 1200000,
          hireDate: '2022-06-15',
          status: 'active'
        },
        {
          id: 'emp_05',
          code: 'NV005',
          name: 'Vũ Đức Thịnh',
          email: 'thinh.vu@company.vn',
          phone: '0934556677',
          gender: 'male',
          dateOfBirth: '1998-09-12',
          departmentId: 'dept_02', // HR
          positionId: 'pos_04',   // HR Specialist
          salary: 13500000,
          bonus: 800000,
          deduction: 500000,
          hireDate: '2023-09-01',
          status: 'probation'
        },
        {
          id: 'emp_06',
          code: 'NV006',
          name: 'Đỗ Bích Phương',
          email: 'phuong.do@company.vn',
          phone: '0945667788',
          gender: 'female',
          dateOfBirth: '1991-04-25',
          departmentId: 'dept_05', // ACC
          positionId: 'pos_06',   // Chief Accountant
          salary: 25000000,
          bonus: 2500000,
          deduction: 1100000,
          hireDate: '2021-08-01',
          status: 'active'
        }
      ];
      this.saveEmployeesSync(defaultEmployees);
    }
  }

  // Lấy dữ liệu đồng bộ
  getAllEmployeesSync() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY_EMPLOYEES)) || [];
    } catch {
      return [];
    }
  }

  // Lưu dữ liệu đồng bộ
  saveEmployeesSync(employees) {
    localStorage.setItem(STORAGE_KEY_EMPLOYEES, JSON.stringify(employees));
  }

  // Lấy toàn bộ nhân viên (sử dụng async/await)
  async getAllEmployees() {
    await new Promise(r => setTimeout(r, 120)); // Delay mô phỏng I/O
    return this.getAllEmployeesSync();
  }

  // Lấy nhân viên theo ID hoặc mã nhân viên (code)
  async getEmployeeById(idOrCode) {
    await new Promise(r => setTimeout(r, 100));
    const employees = this.getAllEmployeesSync();
    return employees.find(e => e.id === idOrCode || e.code?.toLowerCase() === idOrCode.toLowerCase()) || null;
  }

  // Lưu danh sách nhân viên với async/await
  async saveEmployees(employees) {
    await new Promise(r => setTimeout(r, 150));
    this.saveEmployeesSync(employees);
    return true;
  }

  // Sinh mã nhân viên tự động (VD: NV007)
  generateNextCode() {
    const employees = this.getAllEmployeesSync();
    const numbers = employees
      .map(e => {
        const match = (e.code || '').match(/\d+/);
        return match ? parseInt(match[0], 10) : 0;
      })
      .filter(n => !isNaN(n));
    const maxNum = numbers.length > 0 ? Math.max(...numbers) : 0;
    return `NV${String(maxNum + 1).padStart(3, '0')}`;
  }

  // Thêm nhân viên mới
  async addEmployee(employeeData) {
    await new Promise(r => setTimeout(r, 200));
    const employees = this.getAllEmployeesSync();

    const code = employeeData.code?.trim().toUpperCase() || this.generateNextCode();

    // Kiểm tra trùng code và trùng email bằng HOF `some`
    if (employees.some(e => e.code?.toUpperCase() === code)) {
      throw new Error(`Mã nhân viên "${code}" đã tồn tại!`);
    }
    if (employeeData.email && employees.some(e => e.email?.toLowerCase() === employeeData.email.toLowerCase())) {
      throw new Error(`Email "${employeeData.email}" đã được đăng ký!`);
    }

    const newEmployee = {
      id: 'emp_' + Date.now(),
      code,
      name: employeeData.name.trim(),
      email: (employeeData.email || '').trim().toLowerCase(),
      phone: (employeeData.phone || '').trim(),
      gender: employeeData.gender || 'male',
      dateOfBirth: employeeData.dateOfBirth || null,
      departmentId: employeeData.departmentId || null,
      positionId: employeeData.positionId || null,
      salary: Number(employeeData.salary) || 0,
      bonus: Number(employeeData.bonus) || 0,
      deduction: Number(employeeData.deduction) || 0,
      hireDate: employeeData.hireDate || new Date().toISOString().split('T')[0],
      status: employeeData.status || 'active'
    };

    employees.push(newEmployee);
    this.saveEmployeesSync(employees);
    return newEmployee;
  }

  // Cập nhật nhân viên
  async updateEmployee(id, updates) {
    await new Promise(r => setTimeout(r, 200));
    const employees = this.getAllEmployeesSync();
    const index = employees.findIndex(e => e.id === id);

    if (index === -1) {
      throw new Error('Không tìm thấy nhân viên cần cập nhật!');
    }

    // Kiểm tra trùng lặp email nếu email thay đổi
    if (updates.email) {
      const duplicateEmail = employees.find(e => e.id !== id && e.email?.toLowerCase() === updates.email.trim().toLowerCase());
      if (duplicateEmail) {
        throw new Error(`Email "${updates.email}" đã thuộc về nhân viên khác!`);
      }
    }

    employees[index] = {
      ...employees[index],
      ...updates,
      salary: updates.salary !== undefined ? Number(updates.salary) : employees[index].salary,
      bonus: updates.bonus !== undefined ? Number(updates.bonus) : employees[index].bonus,
      deduction: updates.deduction !== undefined ? Number(updates.deduction) : employees[index].deduction
    };

    this.saveEmployeesSync(employees);
    return employees[index];
  }

  // Xóa nhân viên theo ID
  async deleteEmployee(id) {
    await new Promise(r => setTimeout(r, 200));
    const employees = this.getAllEmployeesSync();
    const filtered = employees.filter(e => e.id !== id);

    if (filtered.length === employees.length) {
      throw new Error('Không tìm thấy nhân viên để xóa!');
    }

    this.saveEmployeesSync(filtered);
    return true;
  }

  // Higher-Order Functions: Lọc theo phòng ban
  filterByDepartment(departmentId) {
    const employees = this.getAllEmployeesSync();
    return employees.filter(e => !departmentId || e.departmentId === departmentId);
  }

  // Higher-Order Functions: Sắp xếp theo lương
  sortBySalary(ascending = true) {
    const employees = this.getAllEmployeesSync();
    return [...employees].sort((a, b) => ascending ? a.salary - b.salary : b.salary - a.salary);
  }

  // Higher-Order Functions: Sắp xếp theo ngày vào làm
  sortByHireDate(ascending = false) {
    const employees = this.getAllEmployeesSync();
    return [...employees].sort((a, b) => {
      const dateA = new Date(a.hireDate || 0).getTime();
      const dateB = new Date(b.hireDate || 0).getTime();
      return ascending ? dateA - dateB : dateB - dateA;
    });
  }

  // Thống kê tổng số nhân viên theo phòng ban (Higher-Order Function `reduce`)
  countByDepartment(departmentId) {
    const employees = this.getAllEmployeesSync();
    return employees.reduce((acc, curr) => curr.departmentId === departmentId ? acc + 1 : acc, 0);
  }

  // Thống kê tổng số nhân viên theo vị trí (Higher-Order Function `reduce`)
  countByPosition(positionId) {
    const employees = this.getAllEmployeesSync();
    return employees.reduce((acc, curr) => curr.positionId === positionId ? acc + 1 : acc, 0);
  }
}
