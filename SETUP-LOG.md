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

## Phần 3: Deploy lên EC2 (Claude làm qua SSH), 24/11/2026

Cấu trúc thư mục trên EC2 `hoc-web-1` (Ubuntu 24.04, nginx):
```
/var/www/html/                 # trang gốc "/" (để dành cho project chính sau này)
/var/www/sites/aws-hoc-setup/  # project này (git clone), phục vụ ở /aws-hoc-setup/
/etc/nginx/snippets/aws-hoc-setup.conf   # cấu hình riêng của project này
```

Các lệnh đã chạy:
```bash
ssh -i ~/.ssh/hoc-key.pem ubuntu@<public-ip>
sudo mkdir -p /var/www/sites && sudo chown ubuntu:ubuntu /var/www/sites
cd /var/www/sites && git clone https://github.com/lep7405/aws-hoc-setup.git
```

File `/etc/nginx/snippets/aws-hoc-setup.conf`:
```nginx
location = /aws-hoc-setup { return 301 /aws-hoc-setup/; }   # thiếu dấu / thì chuyển hướng
location /aws-hoc-setup/ {
    alias /var/www/sites/aws-hoc-setup/;   # URL /aws-hoc-setup/x → file /var/www/sites/aws-hoc-setup/x
    index index.html;
    location ~ /\.git { deny all; }      # không cho tải thư mục .git (lộ lịch sử code)
}
```
Gắn snippet vào site mặc định: trong `/etc/nginx/sites-available/default`, ngay sau dòng `server_name _;`, thêm dòng `include snippets/aws-hoc-setup.conf;`. Sau đó chạy:
```bash
sudo nginx -t                # kiểm tra cú pháp trước, sai thì không reload
sudo systemctl reload nginx  # reload: không làm rớt kết nối đang có, khác với restart
```

Kiểm tra từ ngoài:
| URL | Kết quả |
|---|---|
| `/` | 200 (trang nginx mặc định) |
| `/aws-hoc-setup` | 301 → `/aws-hoc-setup/` |
| `/aws-hoc-setup/` | 200, đúng trang này |
| `/aws-hoc-setup/.git/config` | 403 (đã chặn) |

Cập nhật trang sau này: push lên GitHub, rồi trên EC2 chạy:
```bash
git -C /var/www/sites/aws-hoc-setup pull
```
Không cần reload nginx, vì đây là file tĩnh.

Nếu Terminate EC2 thì mất hết. Dựng lại thì làm lại phần 3, hoặc đưa các lệnh trên vào User data.

Thêm project khác sau này: clone vào `/var/www/sites/<tên>`, tạo `snippets/<tên>.conf`, thêm dòng `include`. Hoặc khi có tên miền thì mỗi project một subdomain, mỗi subdomain một file trong `sites-available`.

## Phần 4: Làm lại giao diện kiểu trang docs (Claude làm), 24/11/2026

- Bố cục 3 cột: menu trái chia nhóm (Tài khoản, Mạng, EC2, Công cụ), nội dung ở giữa, mục lục "Trên trang này" bên phải và tô sáng mục đang đọc. Mỗi bước là một trang riêng, địa chỉ dạng `#id`, có nút Trước/Sau. Trên điện thoại, menu trái thu vào nút ☰.
- Thêm trang: Route table, Gói tin đi qua những lớp nào (chiều vào / chiều về, Security Group stateful và NACL stateless), Thí nghiệm 3 (xoá route ra Internet), Deploy lên EC2.
- Bộ mô phỏng thêm bước "Route table (đường về)" ở cuối chuỗi. Xoá route thì request vẫn vào tới nginx nhưng gói trả lời không có đường về, nên ra timeout.
- Kiểm tra bằng Chrome headless: đi qua cả 18 trang ở cỡ 1440px và 390px, không có lỗi JS và không có trang nào tràn ngang. Lỗi đã sửa: tên trang "ERR_CONNECTION_TIMED_OUT" trong menu trái tràn ra ngoài, xử lý bằng `overflow-wrap: anywhere`.

## Phần 5: Thu gọn nhóm trong menu trái (Claude làm), 24/11/2026

- Mỗi nhóm (Tài khoản, Mạng, EC2, Công cụ) có nút đầu nhóm: mũi tên `›` xoay khi mở, bên cạnh có số trang. Bấm vào để thu gọn hoặc mở ra.
- Trạng thái thu gọn được nhớ trên trình duyệt (localStorage). Nếu trình duyệt không cho lưu thì vẫn dùng bình thường, chỉ là không nhớ.
- Nhóm chứa trang đang xem luôn tự mở, để không bị lạc khi bấm nút Trước/Sau.
- Đã kiểm tra bằng Chrome headless: thu gọn nhóm Mạng và Công cụ → mở trang Route table thì nhóm Mạng tự mở ra → tải lại trang thì nhóm Công cụ vẫn thu gọn. Không có lỗi JS.

## Phần 6: Nhóm "Tổng quan" (Claude làm), 24/11/2026

Thêm nhóm "Tổng quan" lên đầu menu trái để có bức tranh chung trước khi đọc từng bước:
- **Hành trình của một request:** sơ đồ hệ thống thật (DNS → CloudFront/WAF → IGW → ALB ở public subnet → EC2 ở private subnet → Redis/RDS, cộng thêm S3, NAT, CloudWatch). Kèm 15 chặng, mỗi chặng mở ra được, ghi rõ chặng đó làm gì, hỏng thì thấy lỗi gì, đã học hay học ở tuần nào. Có thêm bảng so sánh bài lab hiện tại với hệ thống thật.
- **Bản đồ kiến thức:** các tầng (quyền, mạng, máy chủ, chia tải, tên miền/HTTPS, dữ liệu, vận hành, tự động hoá), mỗi tầng ghi đã học hay sắp học ở tuần nào.
- **Bên trong EC2:** gói tin đi từ card mạng → kernel → nginx (master/worker, khớp location) → file tĩnh hoặc PHP-FPM → log. Kèm lệnh để kiểm tra từng bước, và mẹo khoanh vùng: chạy `curl localhost` trong máy trước để biết lỗi nằm ở mạng hay ở nginx/app.

Lỗi gặp khi làm: sơ đồ vẽ bằng ký tự (ASCII) bị lệch hàng và tràn ra ngoài trên điện thoại. Đã đổi sang sơ đồ dựng bằng HTML/CSS: các tầng Internet, VPC, public subnet, private subnet lồng vào nhau, ô nào đã làm trong bài lab có viền xanh. Kiểm tra 21 trang ở cỡ 1440px và 390px: không tràn ngang, không có lỗi JS.

## Phần 7: Mục đích của VPC (Claude làm), 24/11/2026
- Trang "VPC: mạng riêng trên AWS" có thêm mục đầu tiên "Mục đích của VPC": VPC không chạy gì, nó là cái mạng. Bảng 5 mục đích: tách riêng, ai gọi được ai, đường đi, quy hoạch IP, nối với mạng khác. Thêm ghi chú về Flow Logs và cách tách mỗi môi trường một VPC.
