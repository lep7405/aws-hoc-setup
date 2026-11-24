# Ghi chép quá trình setup

## Phần 1: Setup tài khoản AWS (người học tự làm trên console, Claude hướng dẫn), 24/11/2026

1. Tạo tài khoản mới, gói Free plan (100 USD credit, hết hạn 24/5/2027). Lúc chưa kích hoạt xong, vào trang nào cũng bị chuyển sang trang "Complete your account setup".
2. Bật MFA cho root.
3. Root bật "IAM user and role access to Billing information".
4. Tạo IAM user để dùng hằng ngày. **Lỗi:** quên gán policy, nên trang nào cũng "Access denied". Sửa: dùng root gán `AdministratorAccess`.
5. Tạo Budget 5 USD/tháng. Budget chỉ gửi email cảnh báo, không tự tắt dịch vụ.
6. CLI: `aws login --profile hoc`, region `ap-northeast-1`. Kiểm tra bằng `aws sts get-caller-identity`.
7. Tạo VPC `hoc-vpc`: `10.0.0.0/16`, 2 AZ, 2 subnet public + 2 subnet private, không NAT Gateway. Wizard tự tạo thêm S3 gateway endpoint (miễn phí).
8. Tạo EC2 `hoc-web-1`: Ubuntu 24.04, t3.micro, subnet public1, có public IP, Security Group `hoc-web-sg`.
   - **Lỗi 1:** `ERR_CONNECTION_TIMED_OUT`. Claude kiểm tra bằng `aws ec2 describe-security-groups` thì thấy chỉ có rule SSH 22. Thêm rule HTTP 80 thì hết lỗi này.
   - **Lỗi 2:** `ERR_CONNECTION_REFUSED`. Claude kiểm tra bằng `aws ec2 describe-instance-attribute --attribute userData` thì ra `None` (không dán User data, nên nginx chưa được cài). SSH vào máy, `apt install nginx`, sau đó thấy được trang "Welcome to nginx!".

## Phần 2: Làm trang này (Claude làm)

1. Viết trang tĩnh `index.html` + `style.css` + `app.js`, không dùng framework.
   - `app.js` chứa nội dung 12 bước (mảng `STEPS`) và bộ mô phỏng.
   - Bộ mô phỏng có 4 điều kiện: public IP, route tới IGW, Security Group mở cổng 80, nginx đang chạy. Trang xét lần lượt theo thứ tự đó, điều kiện đầu tiên bị sai là nơi request dừng, kèm lỗi trình duyệt tương ứng.
2. Kiểm tra bằng Chrome headless (Playwright) ở 2 cỡ: máy tính 1200px (sáng) và điện thoại 390px (tối).
   - Lỗi gặp: tiêu đề "ERR_CONNECTION_TIMED_OUT" là một từ rất dài, không xuống dòng được, làm trang tràn ngang trên điện thoại (rộng 419px > 390px).
   - Sửa: thêm `overflow-wrap: anywhere; min-width: 0` cho tiêu đề và các phần tử con trong grid.
3. Che thông tin riêng trước khi đưa lên mạng: số tài khoản AWS, IP nhà, public IP của EC2, ID tài nguyên. Kiểm tra bằng `grep` trước khi commit.
4. Tạo repo công khai `lep7405/aws-hoc-setup`, push qua SSH alias `github-lep7405`, bật GitHub Pages (nhánh `main`, thư mục gốc).

### Sửa nội dung
- Nội dung từng bước: sửa mảng `STEPS` trong `app.js`.
- Bảng đọc lỗi: sửa trong `index.html`, phần `#doc-loi`.
- Sửa xong thì commit và push lên `main`. GitHub Pages tự cập nhật sau khoảng 1 phút.
