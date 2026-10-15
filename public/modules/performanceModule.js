/**
 * performanceModule.js
 * Module Đánh giá Hiệu suất Nhân sự (KPI & Performance Reviews):
 * - Đánh giá theo thang điểm 1 - 5 sao kèm nhận xét chi tiết
 * - Tính điểm trung bình (Average Rating) sử dụng Higher-Order Function reduce()
 * - Vinh danh Top Performers (Top nhân viên xuất sắc) bằng Higher-Order Function sort()
 * - Lưu trữ trong localStorage ('hrm_reviews')
 */

import { formatDate, showToast } from './uiHelper.js';

const STORAGE_KEY_REVIEWS = 'hrm_reviews';

export class PerformanceModule {
  constructor(employeeDbModule, departmentModule, positionModule) {
    this.db = employeeDbModule;
    this.deptModule = departmentModule;
    this.posModule = positionModule;
    this.initDefaultReviews();
  }

  // Khởi tạo các đánh giá mẫu
  initDefaultReviews() {
    const existing = localStorage.getItem(STORAGE_KEY_REVIEWS);
    if (!existing) {
      const defaultReviews = [
        {
          id: 'rev_01',
          employeeId: 'emp_01', // Nguyễn Văn An
          reviewerName: 'Ban Giám Đốc',
          rating: 5,
          feedback: 'Hoàn thành xuất sắc dự án kiến trúc hệ thống, tinh thần trách nhiệm rất cao.',
          date: '2025-06-30'
        },
        {
          id: 'rev_02',
          employeeId: 'emp_01',
          reviewerName: 'Tech Lead',
          rating: 4.8,
          feedback: 'Hỗ trợ đồng nghiệp nhiệt tình, chất lượng code tối ưu.',
          date: '2025-03-31'
        },
        {
          id: 'rev_03',
          employeeId: 'emp_02', // Trần Thị Mai
          reviewerName: 'Ban Giám Đốc',
          rating: 4.9,
          feedback: 'Quản trị nhân sự hiệu quả, giữ vững văn hóa doanh nghiệp và gắn kết đội ngũ.',
          date: '2025-06-30'
        },
        {
          id: 'rev_04',
          employeeId: 'emp_03', // Lê Hoàng Nam
          reviewerName: 'Trưởng Phòng Kỹ Thuật',
          rating: 4.2,
          feedback: 'Nhiệt huyết, tiến bộ nhanh, cần chủ động hơn trong giao tiếp.',
          date: '2025-06-30'
        },
        {
          id: 'rev_05',
          employeeId: 'emp_04', // Phạm Hương Giang
          reviewerName: 'Trưởng Bộ Phận Kinh Doanh',
          rating: 4.7,
          feedback: 'Đạt 130% chỉ tiêu doanh số quý, kỹ năng đàm phán rất tốt.',
          date: '2025-06-30'
        }
      ];
      this.saveReviews(defaultReviews);
    }
  }

  getReviewsSync() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY_REVIEWS)) || [];
    } catch {
      return [];
    }
  }

  saveReviews(reviews) {
    localStorage.setItem(STORAGE_KEY_REVIEWS, JSON.stringify(reviews));
  }

  // Tính điểm đánh giá trung bình cho 1 nhân viên sử dụng reduce()
  getAverageRating(employeeId) {
    const reviews = this.getReviewsSync().filter(r => r.employeeId === employeeId);
    if (reviews.length === 0) return 0;

    // Sử dụng Higher-Order Function reduce()
    const totalScore = reviews.reduce((sum, item) => sum + Number(item.rating), 0);
    return Math.round((totalScore / reviews.length) * 10) / 10;
  }

  // Lấy danh sách Top Performers sử dụng sort()
  getTopPerformers(limit = 5) {
    const employees = this.db.getAllEmployeesSync();

    // Map tính điểm trung bình cho từng nhân viên
    const ranked = employees.map(emp => {
      const avg = this.getAverageRating(emp.id);
      const reviews = this.getReviewsSync().filter(r => r.employeeId === emp.id);
      return {
        ...emp,
        avgRating: avg,
        reviewCount: reviews.length
      };
    });

    // Sắp xếp giảm dần theo điểm trung bình bằng Higher-Order Function sort()
    return ranked
      .sort((a, b) => b.avgRating - a.avgRating)
      .slice(0, limit);
  }

  // Thêm đánh giá mới
  async addReview({ employeeId, reviewerName, rating, feedback }) {
    await new Promise(r => setTimeout(r, 200));

    if (!employeeId) throw new Error('Vui lòng chọn nhân viên cần đánh giá');
    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      throw new Error('Điểm đánh giá phải từ 1 đến 5 sao');
    }

    const reviews = this.getReviewsSync();
    const newRev = {
      id: 'rev_' + Date.now(),
      employeeId,
      reviewerName: (reviewerName || 'Quản lý trực tiếp').trim(),
      rating: numRating,
      feedback: (feedback || '').trim() || 'Hoàn thành nhiệm vụ',
      date: new Date().toISOString().split('T')[0]
    };

    reviews.unshift(newRev);
    this.saveReviews(reviews);
    return newRev;
  }

  // Render view đánh giá hiệu suất
  renderView(container) {
    const allEmployees = this.db.getAllEmployeesSync();
    const reviews = this.getReviewsSync();
    const topPerformers = this.getTopPerformers(4);

    const renderStars = (rating) => {
      const full = Math.floor(rating);
      let stars = '★'.repeat(full);
      if (rating % 1 >= 0.5) stars += '⯪';
      const empty = 5 - Math.ceil(rating);
      if (empty > 0) stars += '☆'.repeat(empty);
      return `<span class="rating-stars">${stars}</span> (${rating}/5)`;
    };

    container.innerHTML = `
      <div class="module-card animate-fade-in">
        <div class="module-header flex-between">
          <div>
            <h2 class="module-title">Đánh Giá Hiệu Suất & Xếp Hạng Nhân Viên</h2>
            <p class="module-desc">Tính điểm trung bình bằng Reduce và vinh danh Top Performers bằng Sort</p>
          </div>
          <button id="btn-open-add-review" class="btn btn-primary">
            <span>+ Thêm Đánh Giá Mới</span>
          </button>
        </div>

        <!-- Bảng Vinh Danh Top Performers -->
        <h4 class="font-bold mb-3">🏆 Bảng Vinh Danh Nhân Viên Xuất Sắc (Top Performers)</h4>
        <div class="grid grid-4 gap-3 mb-4">
          ${topPerformers.map((emp, index) => {
            const pos = this.posModule.getPositionById(emp.positionId);
            const dept = this.deptModule.getDepartmentById(emp.departmentId);
            const medals = ['🥇', '🥈', '🥉', '🎖️'];

            return `
              <div class="top-performer-card">
                <div class="rank-badge">${medals[index] || `#${index + 1}`}</div>
                <div class="performer-avatar">${emp.name.charAt(0)}</div>
                <h4 class="performer-name">${emp.name}</h4>
                <div class="performer-role">${pos ? pos.title : 'Nhân sự'}</div>
                <div class="performer-dept text-muted text-xs">${dept ? dept.name : ''}</div>
                <div class="performer-score mt-2">
                  <strong class="text-warning text-lg">${emp.avgRating}</strong> / 5.0
                </div>
                <div class="text-xs text-muted">${emp.reviewCount} lượt đánh giá</div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Danh sách tất cả đánh giá gần đây -->
        <h4 class="font-bold mb-3">📋 Nhật Ký Đánh Giá Gần Đây</h4>
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Ngày ĐG</th>
                <th>Nhân Viên</th>
                <th>Người Đánh Giá</th>
                <th>Điểm Số (1-5 Sao)</th>
                <th>Nhận Xét & Đóng Góp</th>
              </tr>
            </thead>
            <tbody>
              ${reviews.length === 0 ? `<tr><td colspan="5" class="text-center py-4 text-muted">Chưa có đánh giá nào.</td></tr>` : ''}
              ${reviews.map(r => {
                const emp = allEmployees.find(e => e.id === r.employeeId);
                return `
                  <tr>
                    <td>${formatDate(r.date)}</td>
                    <td>
                      <div class="font-bold">${emp ? emp.name : 'N/A'}</div>
                      <div class="text-xs text-muted font-mono">${emp ? emp.code : ''}</div>
                    </td>
                    <td class="font-bold text-muted">${r.reviewerName}</td>
                    <td>${renderStars(r.rating)}</td>
                    <td style="max-width: 320px;">${r.feedback}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        <!-- Modal Thêm Đánh Giá Mới -->
        <div id="modal-review" class="modal-backdrop hidden">
          <div class="modal-card animate-scale-up">
            <div class="modal-header">
              <h3 class="modal-title">Đánh Giá Hiệu Suất Nhân Viên</h3>
              <button id="btn-close-review-modal" class="modal-close-btn">&times;</button>
            </div>
            <form id="form-review" class="modal-body">
              <div class="form-group">
                <label for="rev-emp">Nhân viên được đánh giá <span class="text-danger">*</span></label>
                <select id="rev-emp" class="form-control" required>
                  <option value="">-- Chọn nhân viên --</option>
                  ${allEmployees.map(e => `<option value="${e.id}">[${e.code}] ${e.name}</option>`).join('')}
                </select>
              </div>

              <div class="form-group">
                <label for="rev-reviewer">Họ tên người đánh giá</label>
                <input type="text" id="rev-reviewer" class="form-control" placeholder="Ví dụ: Trưởng Bộ Phận / Giám Đốc" />
              </div>

              <div class="form-group">
                <label for="rev-rating">Điểm đánh giá: <strong id="lbl-rating-val" class="text-warning text-lg">5.0</strong> / 5.0</label>
                <input type="range" id="rev-rating" class="form-range" min="1" max="5" step="0.5" value="5" />
                <div class="flex-between text-xs text-muted">
                  <span>1 Sao (Kém)</span>
                  <span>3 Sao (Đạt)</span>
                  <span>5 Sao (Xuất sắc)</span>
                </div>
              </div>

              <div class="form-group">
                <label for="rev-feedback">Nhận xét chi tiết & Góp ý phát triển <span class="text-danger">*</span></label>
                <textarea id="rev-feedback" class="form-control" rows="3" placeholder="Nhập nhận xét cụ thể về kết quả công việc, tinh thần làm việc nhóm..." required></textarea>
              </div>

              <div class="modal-footer">
                <button type="button" id="btn-cancel-review-modal" class="btn btn-secondary">Đóng</button>
                <button type="submit" class="btn btn-primary">Lưu Đánh Giá</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    const modal = container.querySelector('#modal-review');
    const form = container.querySelector('#form-review');
    const openBtn = container.querySelector('#btn-open-add-review');
    const closeBtn = container.querySelector('#btn-close-review-modal');
    const cancelBtn = container.querySelector('#btn-cancel-review-modal');

    const empSelect = container.querySelector('#rev-emp');
    const reviewerInput = container.querySelector('#rev-reviewer');
    const ratingInput = container.querySelector('#rev-rating');
    const ratingLabel = container.querySelector('#lbl-rating-val');
    const feedbackInput = container.querySelector('#rev-feedback');

    ratingInput.addEventListener('input', () => {
      ratingLabel.textContent = Number(ratingInput.value).toFixed(1);
    });

    const openModal = () => {
      form.reset();
      ratingInput.value = '5';
      ratingLabel.textContent = '5.0';
      modal.classList.remove('hidden');
    };

    const closeModal = () => modal.classList.add('hidden');

    openBtn.addEventListener('click', openModal);
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        await this.addReview({
          employeeId: empSelect.value,
          reviewerName: reviewerInput.value,
          rating: ratingInput.value,
          feedback: feedbackInput.value
        });
        showToast('Đã lưu đánh giá hiệu suất thành công!', 'success');
        closeModal();
        this.renderView(container);
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  }
}
