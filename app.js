// Trang docs một file: mỗi phần tử PAGES là một trang (hash #id). Nội dung là HTML tĩnh do mình viết.
const ul = (items) => '<ul>' + items.map((x) => `<li>${x}</li>`).join('') + '</ul>';
const callout = (kind, title, body) => `<div class="callout ${kind}"><b>${title}</b><div>${body}</div></div>`;

const PAGES = [
  // ---------- Tài khoản ----------
  { id: 'tai-khoan', group: 'Tài khoản', title: 'Tạo tài khoản, hiểu gói Free plan',
    lead: 'Tài khoản mới ở gói Free: có credit, không bị trừ tiền thẻ.',
    sections: [
      { h: 'Làm gì', html: ul(['Đăng ký tài khoản AWS mới, chọn gói <b>Free</b>.', 'Đợi email <i>"Your account with Free plan is ready"</i>.']) },
      { h: 'Vì sao', html: ul(['Free plan có <b>100 USD credit</b> (làm thêm việc trong "Explore AWS" thì được cộng tối đa 100 USD nữa). Dùng được tới <b>24/5/2027</b> hoặc tới khi hết credit.', 'Ở gói Free, AWS <b>không trừ tiền thẻ</b>. Hết credit thì dừng, không tự tính tiền.']) },
      { h: 'Sai lầm đã gặp', html: callout('bad', 'Vào trang nào cũng bị chuyển sang "Complete your account setup"', 'Lúc đó tài khoản <b>chưa kích hoạt xong</b>: đang xác minh thẻ và danh tính, mất tới 24 giờ. Không phải lỗi. Chờ có email "ready" rồi vào lại là được. <b>Đừng bấm "Upgrade plan"</b>: lên gói Paid thì dùng vượt sẽ trừ tiền thẻ thật.') },
      { h: 'Bẫy cần tránh', html: callout('warn', 'AWS Organizations', 'Dùng Organizations (kể cả nút "Try out the new page" ở trang Account, hay Control Tower) thì tài khoản <b>tự lên gói Paid</b>.') },
    ] },
  { id: 'mfa', group: 'Tài khoản', title: 'Bật MFA cho root',
    lead: 'Root là tài khoản gốc, làm được mọi thứ. Phải khoá thêm một lớp.',
    sections: [
      { h: 'Làm gì', html: ul(['Search <code>IAM</code> → Dashboard → <b>Add MFA for root user</b> → dùng app Authenticator hoặc passkey.']) },
      { h: 'Vì sao', html: ul(['<b>Root</b> (email + mật khẩu) làm được mọi thứ, kể cả đóng tài khoản. Lộ mật khẩu root là mất tất cả.', 'MFA bắt nhập thêm mã 6 số từ điện thoại. Có mật khẩu mà không có điện thoại thì vẫn không vào được.']) },
    ] },
  { id: 'billing', group: 'Tài khoản', title: 'Cho IAM user xem được Billing',
    lead: 'Mặc định chỉ root xem được tiền, kể cả admin cũng bị chặn.',
    sections: [
      { h: 'Làm gì', html: ul(['Đăng nhập <b>root</b> → Billing → <b>Account</b> → cuộn xuống cuối, mục <i>IAM user and role access to Billing information</i> → Edit → tick <b>Activate IAM Access</b> → <b>Update</b>.']) },
      { h: 'Vì sao', html: ul(['IAM user có quyền <code>AdministratorAccess</code> vào trang Billing vẫn bị "Access denied" nếu chưa bật mục này.', 'Bật rồi thì user nào có quyền billing mới xem được. User không có quyền vẫn bị chặn, nên tài khoản không kém an toàn hơn.']) },
    ] },
  { id: 'iam-user', group: 'Tài khoản', title: 'Tạo IAM user admin để dùng hằng ngày', bug: true,
    lead: 'Không dùng root cho việc hằng ngày. Và trong AWS, mặc định là không được làm gì.',
    sections: [
      { h: 'Làm gì', html: ul(['IAM → Users → <b>Create user</b> → tick <i>Provide user access to the AWS Management Console</i> (cho đăng nhập trang web console) → Custom password.', 'Gán quyền: <b>Add user to group</b> → group <code>Admins</code> có policy <code>AdministratorAccess</code>.', 'Lưu link đăng nhập <code>https://&lt;số-tài-khoản&gt;.signin.aws.amazon.com/console</code>. Từ nay chỉ dùng user này.']) },
      { h: 'Quyền AdministratorAccess là gì', html: '<pre><code>{ "Effect": "Allow", "Action": "*", "Resource": "*" }</code></pre>' + ul(['Được làm <b>mọi hành động trên mọi tài nguyên</b>: tạo/xoá EC2, S3, IAM, xem Billing…', 'Những việc chỉ root làm được: đóng tài khoản, đổi email root, đổi gói hỗ trợ, một số cài đặt thanh toán.', 'Ở công ty không ai được giao quyền này cho việc hằng ngày. Mỗi người chỉ được đúng quyền cho việc của mình (最小権限 saishou kengen, quyền tối thiểu).']) },
      { h: 'Sai lầm đã gặp', html: callout('bad', 'Tạo user xong mà mở trang nào cũng "Access denied"', 'User <b>chưa được gán policy nào</b>. Thông báo ghi <code>no identity-based policy allows the action</code>, nghĩa là không có policy nào cho phép hành động này. User đó cũng không tự cấp quyền cho mình được.<br><b>Sửa:</b> đăng nhập root → IAM → Users → chọn user → Permissions → Add permissions → <code>AdministratorAccess</code>.<br><b>Bài học:</b> mặc định là bị chặn hết. Phải có policy Allow thì mới làm được.') },
    ] },
  { id: 'budget', group: 'Tài khoản', title: 'Đặt cảnh báo tiền (Budget)',
    lead: 'Budget chỉ gửi email, không tự tắt dịch vụ.',
    sections: [
      { h: 'Làm gì', html: ul(['Billing → Budgets → Create budget → template <b>Monthly cost budget</b> → <code>5</code> USD → điền email.']) },
      { h: 'Hiểu đúng', html: callout('warn', 'Budget không phải giới hạn chi tiêu', 'Vượt 5 USD thì mọi thứ <b>vẫn chạy</b> và vẫn bị trừ credit. Budget chỉ báo qua email. Muốn tự dừng thì phải cài thêm Budget actions. Cách chắc ăn nhất: học xong buổi nào thì xoá tài nguyên buổi đó.') },
    ] },
  { id: 'cli', group: 'Tài khoản', title: 'Cài CLI với profile riêng',
    lead: 'Đặt tên profile riêng để không bao giờ chạy lệnh nhầm sang tài khoản đang tính tiền.',
    sections: [
      { h: 'Làm gì', html: '<pre><code>aws login --profile hoc\naws configure set region ap-northeast-1 --profile hoc\naws sts get-caller-identity --profile hoc   # phải ra đúng số tài khoản học\nexport AWS_PROFILE=hoc                       # trước mỗi buổi lab</code></pre>' },
      { h: 'Vì sao', html: ul(['Máy đã có profile <code>default</code> trỏ vào <b>tài khoản cũ gói Paid</b>. Chạy nhầm sang đó là mất tiền thật.', '<code>aws login</code> dùng tài khoản đăng nhập web, <b>không tạo access key</b>, nên không có file key nào bị lộ.', 'CLI dùng để tự động hoá và để viết 手順書 (tejunsho, tài liệu các bước). Terraform cũng đăng nhập theo cùng cách.']) },
    ] },

  // ---------- Mạng ----------
  { id: 'vpc', group: 'Mạng', title: 'VPC: mạng riêng trên AWS',
    lead: 'Giống mạng wifi ở nhà, nhưng nằm trong data center AWS và thiết bị cắm vào là máy chủ.',
    sections: [
      { h: 'Làm gì', html: ul(['Đổi region sang <b>Tokyo</b>. Search <code>VPC</code> → <b>Create VPC</b> → <b>VPC and more</b>.', 'Name <code>hoc</code>, IPv4 CIDR <code>10.0.0.0/16</code>, No IPv6, Tenancy Default, <b>2 AZ</b>, 2 public + 2 private subnet, <b>NAT gateways: None</b>, bật cả 2 tuỳ chọn DNS.']) },
      { h: 'Các thành phần', html: ul([
        '<b>VPC</b>: mạng riêng, <b>cách ly hoàn toàn</b> với VPC khác. Chỉ vào được khi chính bạn mở cửa: Internet Gateway, peering, hoặc VPN.',
        '<b>CIDR <code>10.0.0.0/16</code></b>: dải IP của mạng. <code>/16</code> = 2 số đầu cố định, nên có 65.536 địa chỉ (<code>10.0.0.0</code>–<code>10.0.255.255</code>). <code>/24</code> = 256 địa chỉ. Mỗi subnet AWS giữ lại 5 địa chỉ.',
        '<b>AZ</b>: một data center riêng trong region. 2 AZ = có <i>chỗ</i> ở 2 nơi (冗長化 jouchouka, làm dự phòng). Tạo VPC thì <b>chưa có server nào</b>.',
        '<b>Subnet</b>: phần nhỏ cắt ra từ VPC, nằm trong một AZ. Máy đặt vào subnet nào thì nhận <b>private IP</b> trong dải của subnet đó.',
        '<b>Internet Gateway</b>: cổng nối VPC với Internet, giống router ở nhà.',
        '<b>NAT Gateway ($)</b>: cửa <b>chỉ cho đi ra</b>, dành cho máy ở private subnet. Gần 45 USD/tháng nếu quên, nên chọn None.',
        '<b>DNS options</b>: cho phép gọi máy bằng tên (vd endpoint của RDS).',
      ]) },
      { h: 'Đọc Resource map', html: ul(['<b>Xanh lá</b> = subnet public, <b>xanh dương</b> = subnet private. Chữ A/C = AZ <code>1a</code>/<code>1c</code>.', 'Trước khi tạo đã có sẵn 1 VPC và 3 subnet: đó là <b>default VPC</b> AWS tạo sẵn ở mỗi region.', 'VPC, subnet, route table, IGW đều <b>miễn phí</b>.']) },
      { h: 'So với DigitalOcean', html: '<p>DigitalOcean làm sẵn cho đơn giản: Droplet tạo ra là có public IP, không có subnet public/private hay route table để chỉnh. AWS đưa từng phần nhỏ để bạn tự lắp: tự chia subnet, tự quyết máy nào được ra Internet. Doanh nghiệp cần sự chi tiết này để giấu database khỏi Internet.</p>' },
    ] },
  { id: 'route-table', group: 'Mạng', title: 'Route table: bảng chỉ đường',
    lead: 'Subnet là "public" vì route table của nó có đường ra Internet Gateway, không phải vì tên.',
    sections: [
      { h: 'Hai dòng của hoc-rtb-public', html: '<div class="tablewrap"><table><thead><tr><th>Destination</th><th>Target</th><th>Đọc thành lời</th></tr></thead><tbody><tr><td><code>10.0.0.0/16</code></td><td><code>local</code></td><td>Gửi tới máy trong VPC thì <b>đi nội bộ</b>. Dòng này AWS không cho xoá.</td></tr><tr><td><code>0.0.0.0/0</code></td><td><code>igw-…</code></td><td>Gửi tới <b>mọi địa chỉ còn lại</b> (Internet) thì đi qua Internet Gateway.</td></tr></tbody></table></div>' },
      { h: 'Khớp cụ thể nhất thắng', html: '<p>Địa chỉ <code>10.0.5.9</code> khớp cả <code>/16</code> lẫn <code>/0</code>. AWS chọn dòng <b>cụ thể hơn</b> (số sau dấu <code>/</code> lớn hơn), nên đi nội bộ. Gói tin gửi về IP nhà bạn không khớp <code>10.0.0.0/16</code>, nên rơi vào dòng <code>0.0.0.0/0</code>.</p>' },
      { h: 'Private subnet', html: '<p>Route table của private subnet chỉ có dòng <code>local</code> (và đường tắt tới S3 qua VPC endpoint). Không có đường ra Internet, nên dù máy có public IP thì người ngoài vẫn không vào được. Đó là lý do database luôn đặt ở private subnet.</p>' },
    ] },
  { id: 'ip', group: 'Mạng', title: 'Private IP và public IP',
    lead: 'Subnet cấp số máy lẻ. AWS cấp thêm số điện thoại thật. Internet Gateway là tổng đài nối hai số.',
    sections: [
      { h: 'Hai loại IP', html: '<div class="tablewrap"><table><thead><tr><th></th><th>Private IP <code>10.0.3.176</code></th><th>Public IP <code>52.x.x.x</code></th></tr></thead><tbody><tr><td>Ai cấp</td><td><b>Subnet</b></td><td><b>AWS</b>, từ kho IP công khai, khi bật Auto-assign public IP</td></tr><tr><td>Giống</td><td>Số máy lẻ trong công ty</td><td>Số điện thoại thật</td></tr><tr><td>Duy nhất</td><td>Chỉ trong một VPC. VPC khác dùng trùng cũng được (trừ khi nối 2 VPC với nhau)</td><td>Trên toàn Internet</td></tr><tr><td>Máy có thấy không</td><td>Có (<code>ip a</code>)</td><td><b>Không</b>. Nó nằm ở Internet Gateway</td></tr></tbody></table></div>' },
      { h: 'Internet Gateway ghép cặp hai IP', html: '<pre><code>Gọi 52.x.x.x  →  IGW đổi thành 10.0.3.176  →  EC2 nhận\nEC2 trả lời từ 10.0.3.176  →  IGW đổi lại 52.x.x.x  →  Internet</code></pre><p>Cách đổi địa chỉ này gọi là NAT. Router wifi ở nhà cũng làm đúng việc đó. Stop rồi Start máy thì public IP đổi; muốn giữ cố định thì dùng Elastic IP (tính tiền khoảng 0,005 USD/giờ).</p>' },
    ] },
  { id: 'goi-tin', group: 'Mạng', title: 'Gói tin đi qua những lớp nào',
    lead: 'Chiều đi vào và chiều trả lời về gặp những lớp khác nhau.',
    sections: [
      { h: 'Chiều đi vào', html: '<pre><code>Trình duyệt → Internet\n → ① Internet Gateway (đổi public IP → private IP)\n → ② NACL của subnet        (mặc định cho qua hết)\n → ③ Security Group, inbound  ← lỗi 1 bị chặn ở đây\n → ④ Ubuntu / nginx có nghe cổng 80 không  ← lỗi 2 ở đây</code></pre>' },
      { h: 'Chiều trả lời về', html: '<pre><code>nginx trả lời\n → ③ Security Group (stateful: tự cho ra)\n → ② NACL\n → ⑤ Route table: gói tin gửi về IP nhà bạn đi đường nào?  ← thí nghiệm 3 ở đây\n → ① Internet Gateway → Internet → trình duyệt</code></pre>' },
      { h: 'Security Group và NACL', html: '<div class="tablewrap"><table><thead><tr><th></th><th>Security Group</th><th>NACL</th></tr></thead><tbody><tr><td>Gắn với</td><td>Từng máy</td><td>Cả subnet</td></tr><tr><td>Loại rule</td><td>Chỉ có <b>Allow</b>; không có rule thì bị chặn</td><td>Allow và Deny, xét theo số thứ tự</td></tr><tr><td>Có nhớ kết nối không</td><td><b>Stateful</b>: đã cho vào thì gói trả lời tự được cho ra</td><td><b>Stateless</b>: phải mở cả hai chiều</td></tr><tr><td>Thực tế</td><td>Cấu hình chủ yếu ở đây</td><td>Thường để mặc định</td></tr></tbody></table></div>' },
      { h: 'Một inbound rule gồm gì', html: ul(['<b>Type</b>: mẫu điền sẵn (HTTP = TCP 80, SSH = TCP 22).', '<b>Protocol</b>: TCP, UDP, ICMP.', '<b>Port</b>: 22, 80, 443, 3306…', '<b>Source</b>: <code>0.0.0.0/0</code> (mọi người), <code>x.x.x.x/32</code> (đúng 1 IP), <code>10.0.0.0/16</code>, hoặc <b>một Security Group khác</b> (vd database chỉ nhận kết nối từ <code>hoc-web-sg</code>).', 'Security Group không biết gói tin là của chương trình nào, chỉ nhìn giao thức, cổng và IP nguồn.']) },
      { h: 'Muốn người ngoài vào được máy', html: callout('ok', 'Cần đủ 3 thứ', 'Subnet có đường ra IGW + máy có public IP + Security Group mở cổng. Thiếu một thứ là không vào được. Thử tắt từng thứ trong trang <a href="#mo-phong">Mô phỏng</a>.') },
    ] },

  // ---------- EC2 ----------
  { id: 'ec2', group: 'EC2', title: 'Tạo EC2 Ubuntu + nginx',
    lead: 'EC2 là máy chủ ảo thuê theo giờ. VPC là mạng, EC2 là máy cắm vào mạng đó.',
    sections: [
      { h: 'Form Launch instance', html: ul([
        'Name <code>hoc-web-1</code>, AMI <b>Ubuntu 24.04</b> (đã quen; Amazon Linux thuộc dòng RHEL, mặc định của AWS, sẽ thử sau), <code>t3.micro</code>, Number of instances <b>1</b> (số máy giống hệt nhau tạo cùng lúc).',
        'Key pair <code>hoc-key</code> (ED25519, .pem) → lưu ở <code>~/.ssh/</code> trong WSL → <code>chmod 400</code>. Không commit, không gửi qua chat.',
        'Network → <b>Edit</b>: form mặc định chọn <b>default VPC</b>, phải đổi sang <code>hoc-vpc</code> → subnet <code>public1</code> → <b>Auto-assign public IP: Enable</b>.',
        'Security Group <code>hoc-web-sg</code>: SSH 22 nguồn <b>My IP</b> (<code>/32</code> = đúng 1 IP); HTTP 80 nguồn <b>Anywhere</b>.',
        'Advanced details → <b>User data</b> (script chạy một lần lúc máy khởi động lần đầu):',
      ]) + '<pre><code>#!/bin/bash\napt update &amp;&amp; apt install -y nginx\necho "&lt;h1&gt;Xin chao tu $(hostname)&lt;/h1&gt;" &gt; /var/www/html/index.html\nsystemctl enable --now nginx</code></pre>' },
      { h: 'SSH từ nhiều nơi', html: ul(['EC2 mặc định <b>không cho đăng nhập bằng mật khẩu</b>, chỉ bằng key, nên bot không dò được. Nhưng mở cổng 22 cho mọi người vẫn bị quét liên tục.', 'Đi nhiều chỗ thì: <b>Session Manager</b> (không mở cổng 22; cần IAM role <code>AmazonSSMManagedInstanceCore</code>), hoặc VPN WireGuard, hoặc sửa lại rule "My IP" mỗi lần đổi chỗ.']) },
    ] },
  { id: 'loi-timeout', group: 'EC2', title: 'Lỗi 1: ERR_CONNECTION_TIMED_OUT', bug: true,
    lead: 'Trình duyệt quay một lúc lâu rồi mới báo lỗi.',
    sections: [
      { h: 'Nguyên nhân', html: ul(['Kiểm tra bằng CLI: <code>aws ec2 describe-security-groups</code> → chỉ có rule SSH 22. Rule HTTP 80 bị sót lúc tạo.', 'Security Group <b>bỏ gói tin lặng lẽ</b> (DROP), không trả lời gì. Trình duyệt không biết là bị chặn hay mạng chậm nên cứ chờ, hết giờ thì báo timeout.', 'Gói tin <b>chưa hề tới máy</b>, nên log nginx không có gì.']) },
      { h: 'Sửa', html: '<p>EC2 → Security Groups → <code>hoc-web-sg</code> → Edit <b>inbound</b> rules → Add rule HTTP, nguồn Anywhere-IPv4 → Save. Có hiệu lực ngay, không cần khởi động lại máy.</p>' },
      { h: 'Ghi nhớ', html: callout('warn', 'Timeout = không có phản hồi nào', 'Gói tin bị chặn hoặc bị lạc trên đường: Security Group, NACL, route table thiếu đường, sai IP, máy đang tắt, hoặc IP nhà đã đổi nên không còn khớp rule "My IP".') },
    ] },
  { id: 'loi-refused', group: 'EC2', title: 'Lỗi 2: ERR_CONNECTION_REFUSED', bug: true,
    lead: 'Báo lỗi ngay lập tức. Lỗi đổi kiểu là tin tốt: gói tin đã qua được Security Group.',
    sections: [
      { h: 'Nguyên nhân', html: ul(['Gói tin <b>tới được máy</b>, nhưng không có chương trình nào nghe cổng 80, nên hệ điều hành trả lời ngay: từ chối.', 'Kiểm tra bằng CLI: <code>aws ec2 describe-instance-attribute --attribute userData</code> → <code>None</code>. Chưa dán User data, nên nginx chưa được cài.']) },
      { h: 'Sửa', html: '<pre><code>ssh -i ~/.ssh/hoc-key.pem ubuntu@&lt;public-ip&gt;\nsudo ss -tlnp            # chưa có gì nghe :80\nsudo apt update &amp;&amp; sudo apt install -y nginx\nsystemctl status nginx   # active (running)\nsudo ss -tlnp            # đã có :80</code></pre>' },
      { h: 'Ghi nhớ', html: callout('warn', 'Refused = tới máy rồi, nhưng dịch vụ không chạy', 'Không phải lỗi quyền. Lỗi quyền là <code>Permission denied</code> (SSH sai key) hoặc <code>403 Forbidden</code>: tới được dịch vụ nhưng không được phép.') },
    ] },
  { id: 'thi-nghiem-3', group: 'EC2', title: 'Thí nghiệm 3: xoá route ra Internet', bug: true,
    lead: 'Tự tay phá để thấy route table quan trọng thế nào.',
    sections: [
      { h: 'Làm gì', html: ul(['VPC → Route tables → <code>hoc-rtb-public</code> → Routes → Edit routes → <b>Remove</b> dòng <code>0.0.0.0/0 → igw</code> → Save.']) },
      { h: 'Kết quả', html: ul(['Web: <b>timeout</b>, giống lỗi 1, dù nguyên nhân khác hẳn.', 'SSH: cũng timeout. Mất luôn đường để vào máy sửa.', 'Gói tin <b>vào được</b> tới nginx (Security Group cho qua), nginx có trả lời, nhưng <b>gói trả lời không có đường về</b> Internet nên bị bỏ.']) },
      { h: 'Phân biệt với lỗi 1', html: '<div class="tablewrap"><table><thead><tr><th></th><th>Dừng ở</th><th>Tới được nginx chưa</th><th>Log nginx</th></tr></thead><tbody><tr><td>Lỗi 1 (thiếu rule 80)</td><td>Security Group, chiều vào</td><td>Chưa</td><td>Không có dòng nào</td></tr><tr><td>Thí nghiệm 3 (xoá route)</td><td>Route table, chiều về</td><td>Rồi</td><td>Có dòng request</td></tr></tbody></table></div><p>Cả hai đều timeout. Muốn phân biệt thì xem log. Nhưng lúc mất route thì SSH cũng không vào được, nên phải dùng Session Manager hoặc VPN.</p>' },
      { h: 'Trả lại', html: '<p>Edit routes → Add route → Destination <code>0.0.0.0/0</code>, Target <b>Internet Gateway</b> → <code>hoc-igw</code> → Save.</p>' },
    ] },
  { id: 'deploy', group: 'EC2', title: 'Deploy trang này lên EC2 (đường dẫn con)',
    lead: 'Mỗi project một thư mục và một file cấu hình nginx riêng. Trang gốc "/" để dành cho project chính.',
    sections: [
      { h: 'Cấu trúc thư mục', html: '<pre><code>/var/www/html/                           # trang gốc "/"\n/var/www/sites/aws-hoc-setup/            # project này (git clone)\n/etc/nginx/snippets/aws-hoc-setup.conf   # cấu hình nginx riêng</code></pre>' },
      { h: 'Cấu hình nginx', html: '<pre><code>location = /aws-hoc-setup { return 301 /aws-hoc-setup/; }\nlocation /aws-hoc-setup/ {\n    alias /var/www/sites/aws-hoc-setup/;\n    index index.html;\n    location ~ /\\.git { deny all; }   # chặn tải thư mục .git\n}</code></pre><p>Gắn vào site mặc định: thêm dòng <code>include snippets/aws-hoc-setup.conf;</code> ngay sau <code>server_name _;</code>. Chạy <code>sudo nginx -t</code> để kiểm tra cú pháp trước, rồi <code>sudo systemctl reload nginx</code> (reload không làm rớt kết nối đang có).</p>' },
      { h: 'Cập nhật', html: '<pre><code>git -C /var/www/sites/aws-hoc-setup pull</code></pre><p>Đây là file tĩnh nên không cần reload nginx. Terminate EC2 thì mất hết, phải dựng lại.</p>' },
    ] },
  { id: 'don-dep', group: 'EC2', title: 'Thí nghiệm tiếp theo và dọn dẹp',
    lead: 'Mỗi lần chỉ phá một thứ, đoán trước rồi mới thử.',
    sections: [
      { h: 'Còn lại', html: ul(['Tạo máy ở private subnet có bật public IP: vào được không?', 'Tạo máy ở public subnet nhưng tắt public IP.', 'Đổi rule SSH sang một IP sai.']) },
      { h: 'Dọn dẹp', html: ul(['EC2 → Instances → <b>Terminate</b>. Stop vẫn bị tính tiền ổ đĩa và public IP.', 'VPC, subnet, route table, Security Group để lại được, chúng miễn phí.']) },
    ] },

  // ---------- Công cụ ----------
  { id: 'mo-phong', group: 'Công cụ', title: 'Mô phỏng đường đi của request', sim: true,
    lead: 'Bỏ tick một điều kiện để xem request dừng ở đâu và trình duyệt báo lỗi gì.',
    sections: [{ h: 'Bộ mô phỏng', html: '<div class="sim"><div class="toggles" id="toggles"></div><div class="path" id="path" aria-live="polite"></div><div class="result" id="result"></div></div>' }] },
  { id: 'doc-loi', group: 'Công cụ', title: 'Bảng đọc lỗi',
    lead: 'Nhìn thông báo lỗi là khoanh được tầng bị hỏng. Đây là kỹ năng 障害対応 (shougai taiou, xử lý sự cố).',
    sections: [
      { h: 'Theo mức độ đi được xa', html: '<div class="tablewrap"><table><thead><tr><th>Lỗi</th><th>Gói tin đi được tới đâu</th><th>Thường do</th><th>Kiểm tra</th></tr></thead><tbody>'
        + '<tr><td><code>ERR_NAME_NOT_RESOLVED</code></td><td>Chưa đi được: không đổi được tên miền ra IP</td><td>Sai DNS record</td><td><code>dig ten-mien</code></td></tr>'
        + '<tr><td><code>ERR_CONNECTION_TIMED_OUT</code></td><td>Không tới được, hoặc không về được</td><td>Security Group, NACL, route table, sai IP, máy tắt</td><td>Inbound rules, Routes</td></tr>'
        + '<tr><td><code>ERR_CONNECTION_REFUSED</code></td><td>Tới máy, nhưng cổng không có ai nghe</td><td>Dịch vụ chưa chạy, sai cổng</td><td><code>sudo ss -tlnp</code></td></tr>'
        + '<tr><td><code>Permission denied</code> / <code>403</code></td><td>Tới dịch vụ, nhưng không được phép</td><td>Sai key, sai user, bị chặn có chủ đích</td><td>User <code>ubuntu</code>/<code>ec2-user</code>, quyền file</td></tr>'
        + '<tr><td><code>502 Bad Gateway</code></td><td>nginx chạy, app phía sau chết</td><td>PHP-FPM, container app</td><td>Log nginx, <code>docker ps</code></td></tr>'
        + '<tr><td><code>200 OK</code></td><td>Thành công</td><td></td><td></td></tr>'
        + '</tbody></table></div>' },
      { h: 'Lỗi SSH hay gặp', html: ul(['<code>UNPROTECTED PRIVATE KEY FILE</code> → <code>chmod 400 ~/.ssh/hoc-key.pem</code>.', 'Timeout khi SSH → IP nhà đổi, sửa lại rule "My IP".', '<code>Permission denied (publickey)</code> → sai user (Ubuntu dùng <code>ubuntu</code>) hoặc sai key.']) },
    ] },
];

// ---------- dựng trang ----------
const slug = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const groups = [...new Set(PAGES.map((p) => p.group))];
const sidebar = document.getElementById('sidebar');
sidebar.innerHTML = groups.map((g) => `<h4>${g}</h4>` + PAGES.filter((p) => p.group === g)
  .map((p) => `<a href="#${p.id}" data-id="${p.id}">${p.bug ? '<span class="dot" title="Có lỗi đã gặp"></span>' : ''}${p.title}</a>`).join('')).join('');

function render() {
  const id = location.hash.slice(1).split('--')[0];
  const i = Math.max(0, PAGES.findIndex((p) => p.id === id));
  const p = PAGES[i];
  const prev = PAGES[i - 1], next = PAGES[i + 1];
  document.getElementById('content').innerHTML = `<div class="inner">
    <div><div class="eyebrow">${p.group}</div><h1>${p.title}</h1></div>
    <p class="lead">${p.lead}</p>
    ${p.sections.map((s) => `<h2 id="${p.id}--${slug(s.h)}">${s.h}<a class="anchor" href="#${p.id}--${slug(s.h)}" aria-label="Link tới mục">#</a></h2>${s.html}`).join('')}
    <nav class="pager">${prev ? `<a href="#${prev.id}"><span class="k">← Trước</span>${prev.title}</a>` : ''}${next ? `<a class="next" href="#${next.id}"><span class="k">Sau →</span>${next.title}</a>` : ''}</nav>
  </div>`;
  document.getElementById('onpage').innerHTML = '<h5>☰ Trên trang này</h5>' + p.sections.map((s) => `<a href="#${p.id}--${slug(s.h)}">${s.h}</a>`).join('');
  sidebar.querySelectorAll('a').forEach((a) => a.classList.toggle('active', a.dataset.id === p.id));
  document.title = p.title + ' · Nhật ký setup AWS';
  if (p.sim) setupSim();
  const sub = location.hash.includes('--') ? document.getElementById(location.hash.slice(1)) : null;
  if (sub) sub.scrollIntoView(); else if (id) window.scrollTo(0, 0);
  sidebar.classList.remove('open');
  document.getElementById('menuBtn').setAttribute('aria-expanded', 'false');
}
let lastPage = null;
window.addEventListener('hashchange', () => {
  const pageId = location.hash.slice(1).split('--')[0];
  if (pageId === lastPage && location.hash.includes('--')) { const el = document.getElementById(location.hash.slice(1)); if (el) el.scrollIntoView(); return; }
  lastPage = pageId; render();
});
lastPage = location.hash.slice(1).split('--')[0]; render();

document.getElementById('menuBtn').addEventListener('click', (e) => {
  const open = sidebar.classList.toggle('open'); e.currentTarget.setAttribute('aria-expanded', String(open));
});

// mục "Trên trang này": tô mục đang đọc
window.addEventListener('scroll', () => {
  const hs = [...document.querySelectorAll('.content h2')];
  let cur = hs[0];
  hs.forEach((h) => { if (h.getBoundingClientRect().top < 120) cur = h; });
  document.querySelectorAll('.onpage a').forEach((a) => a.classList.toggle('active', cur && a.getAttribute('href') === '#' + cur.id));
}, { passive: true });

// ---------- mô phỏng ----------
function setupSim() {
  const CONDS = [
    { id: 'ip', label: 'Máy có public IP', note: 'Auto-assign public IP = Enable' },
    { id: 'route', label: 'Route table có 0.0.0.0/0 → IGW', note: 'Subnet là public' },
    { id: 'sg', label: 'Security Group mở cổng 80', note: 'Inbound rule HTTP, nguồn Anywhere' },
    { id: 'svc', label: 'nginx đang chạy, nghe cổng 80', note: 'sudo ss -tlnp có :80' },
  ];
  const NODES = ['Trình duyệt', 'Internet', 'Internet Gateway', 'NACL', 'Security Group', 'EC2 :80 nginx', 'Route table (đường về)'];
  const st = { ip: true, route: true, sg: true, svc: true };
  document.getElementById('toggles').innerHTML = CONDS.map((c) => `<label><input type="checkbox" id="c-${c.id}" checked><span>${c.label}<small>${c.note}</small></span></label>`).join('');
  CONDS.forEach((c) => document.getElementById('c-' + c.id).addEventListener('change', (e) => { st[c.id] = e.target.checked; run(); }));
  function run() {
    let stop = -1, r;
    if (!st.ip) { stop = 0; r = { ok: false, code: 'Không có địa chỉ để gõ', why: 'Máy chỉ có private IP <code>10.x</code>. Internet không định tuyến tới IP riêng, nên từ ngoài không gọi tới được.', fix: 'Bật public IP (máy mới: Auto-assign = Enable; máy cũ: gắn Elastic IP).' }; }
    else if (!st.sg) { stop = 4; r = { ok: false, code: 'ERR_CONNECTION_TIMED_OUT', why: 'Security Group <b>bỏ gói tin lặng lẽ</b> ở chiều đi vào. Gói tin chưa tới máy, log nginx không có gì. Đây là lỗi 1.', fix: 'Thêm inbound rule HTTP 80.' }; }
    else if (!st.svc) { stop = 5; r = { ok: false, code: 'ERR_CONNECTION_REFUSED', why: 'Gói tin tới máy, nhưng không có chương trình nào nghe cổng 80, nên máy từ chối ngay. Đây là lỗi 2.', fix: '<code>sudo systemctl start nginx</code>, hoặc cài nginx.' }; }
    else if (!st.route) { stop = 6; r = { ok: false, code: 'ERR_CONNECTION_TIMED_OUT', why: 'Gói tin vào tới nginx, nginx có trả lời, nhưng <b>gói trả lời không có đường về</b> Internet. Log nginx <b>có</b> dòng request. SSH cũng chết theo. Đây là thí nghiệm 3.', fix: 'Thêm lại route <code>0.0.0.0/0 → IGW</code>.' }; }
    else { r = { ok: true, code: '200 OK', why: 'Đủ cả 4 điều kiện: có địa chỉ, firewall cho qua, có dịch vụ trả lời, và có đường về.', fix: '' }; }
    document.getElementById('path').innerHTML = NODES.map((n, i) => {
      const cls = stop === -1 ? 'pass' : i < stop ? 'pass' : i === stop ? 'stop' : 'skip';
      return `<span class="node ${cls}">${n}</span>` + (i < NODES.length - 1 ? '<span class="arrow">→</span>' : '');
    }).join('');
    const el = document.getElementById('result');
    el.className = 'result ' + (r.ok ? 'ok' : 'bad');
    el.innerHTML = `<span class="code">${r.code}</span><span>${r.why}</span>${r.fix ? `<span><b>Sửa:</b> ${r.fix}</span>` : ''}`;
  }
  run();
}
