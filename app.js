// Nội dung từng bước (HTML tĩnh do mình viết) + bộ mô phỏng đường đi của request.
const STEPS = [
  {
    id: 'tai-khoan', title: 'Tạo tài khoản, hiểu gói Free plan',
    lam: ['Đăng ký tài khoản AWS mới, chọn gói <b>Free</b>.', 'Đợi email <i>"Your account with Free plan is ready"</i>.'],
    viSao: ['Free plan có <b>100 USD credit</b> (làm thêm việc trong "Explore AWS" thì được cộng tối đa 100 USD nữa). Dùng được tới <b>24/5/2027</b> hoặc tới khi hết credit.', 'Ở gói Free, AWS <b>không trừ tiền thẻ</b>. Hết credit thì dừng, không tự tính tiền.'],
    sai: { tieuDe: 'Bấm vào trang tài khoản thì bị chuyển sang trang "Complete your account setup"', noiDung: 'Lúc đó tài khoản <b>chưa kích hoạt xong</b>: đang xác minh thẻ và danh tính, mất tới 24 giờ. Không phải lỗi. Chờ có email "ready" rồi vào lại là được. <b>Đừng bấm "Upgrade plan"</b>: lên gói Paid thì dùng vượt sẽ trừ tiền thẻ thật.' },
    meo: 'Bẫy: dùng <b>AWS Organizations</b> (kể cả nút "Try out the new page" ở trang Account, hay Control Tower) thì tài khoản <b>tự lên gói Paid</b>.',
  },
  {
    id: 'mfa', title: 'Bật MFA cho root',
    lam: ['Search <code>IAM</code> → Dashboard → <b>Add MFA for root user</b> → dùng app Authenticator hoặc passkey.'],
    viSao: ['<b>Root</b> là tài khoản gốc (email + mật khẩu), làm được mọi thứ, kể cả đóng tài khoản. Lộ mật khẩu root là mất tất cả.', 'MFA bắt nhập thêm mã 6 số từ điện thoại. Có mật khẩu mà không có điện thoại thì vẫn không vào được.'],
  },
  {
    id: 'billing', title: 'Cho IAM user xem được Billing',
    lam: ['Đăng nhập <b>root</b> → Billing → <b>Account</b> → cuộn xuống cuối, mục <i>IAM user and role access to Billing information</i> → Edit → tick <b>Activate IAM Access</b> → <b>Update</b>.'],
    viSao: ['Mặc định <b>chỉ root xem được tiền</b>. Kể cả IAM user có quyền <code>AdministratorAccess</code> vào trang Billing cũng bị "Access denied".', 'Bật mục này thì user nào có quyền billing mới xem được. User không có quyền vẫn bị chặn, nên tài khoản không kém an toàn hơn.'],
  },
  {
    id: 'iam-user', title: 'Tạo IAM user admin để dùng hằng ngày',
    lam: ['IAM → Users → <b>Create user</b> → tick <i>Provide user access to the AWS Management Console</i> (cho đăng nhập web) → Custom password.', 'Gán quyền: <b>Add user to group</b> → group <code>Admins</code> có policy <code>AdministratorAccess</code>.', 'Lưu link đăng nhập dạng <code>https://&lt;số-tài-khoản&gt;.signin.aws.amazon.com/console</code>. Từ nay chỉ dùng user này, không dùng root nữa.'],
    viSao: ['Root quá mạnh, chỉ dùng cho việc chỉ root làm được (đóng tài khoản, đổi gói hỗ trợ…).', '<code>AdministratorAccess</code> = <code>"Action": "*", "Resource": "*"</code>: được làm mọi hành động trên mọi tài nguyên. Ở công ty không ai được giao quyền này cho việc hằng ngày. Mỗi người chỉ được đúng quyền cho việc của mình (quyền tối thiểu, 最小権限 saishou kengen).'],
    sai: { tieuDe: 'Tạo user xong mà mở trang nào cũng "Access denied"', noiDung: 'Lý do: user <b>chưa được gán policy nào</b>. Thông báo ghi <code>Context: no identity-based policy allows the action</code>, nghĩa là không có policy nào cho phép hành động này. User đó cũng <b>không tự cấp quyền cho mình</b> được, vì vào IAM cũng bị chặn.<br><b>Sửa:</b> đăng nhập root → IAM → Users → chọn user → Permissions → Add permissions → <code>AdministratorAccess</code>.<br><b>Bài học:</b> trong AWS, mặc định là <b>không được làm gì cả</b>. Phải có policy cho phép (Allow) thì mới làm được.' },
  },
  {
    id: 'budget', title: 'Đặt cảnh báo tiền (Budget)',
    lam: ['Billing → Budgets → Create budget → template <b>Monthly cost budget</b> → <code>5</code> USD → điền email.'],
    viSao: ['Có email báo sớm khi credit đang hao nhanh, ví dụ quên xoá RDS hay NAT Gateway.'],
    meo: 'Budget <b>chỉ gửi email</b>, <b>không tự tắt</b> dịch vụ nào. Vượt 5 USD thì mọi thứ vẫn chạy và vẫn bị trừ credit. Muốn tự dừng thì phải cài thêm Budget actions. Cách chắc ăn nhất: học xong buổi nào thì xoá tài nguyên buổi đó.',
  },
  {
    id: 'cli', title: 'Cài CLI với profile riêng',
    lam: ['<pre><code>aws login --profile hoc\naws configure set region ap-northeast-1 --profile hoc\naws sts get-caller-identity --profile hoc   # phải ra đúng số tài khoản học\nexport AWS_PROFILE=hoc                       # trước mỗi buổi lab</code></pre>'],
    viSao: ['Máy đã có profile <code>default</code> trỏ vào <b>tài khoản cũ gói Paid</b>. Chạy nhầm sang đó là mất tiền thật. Đặt tên profile riêng để không bao giờ nhầm.', '<code>aws login</code> dùng tài khoản đăng nhập web, <b>không tạo access key</b>, nên không có file key nào bị lộ.', 'CLI cần cho tự động hoá, cho viết 手順書 (tejunsho, tài liệu các bước), và Terraform cũng đăng nhập theo cùng cách.'],
  },
  {
    id: 'vpc', title: 'Tạo VPC: mạng riêng trên AWS',
    lam: ['Đổi region sang <b>Tokyo</b>. Search <code>VPC</code> → <b>Create VPC</b> → <b>VPC and more</b>.', 'Name <code>hoc</code>, IPv4 CIDR <code>10.0.0.0/16</code>, No IPv6, Tenancy Default, <b>2 AZ</b>, 2 public + 2 private subnet, <b>NAT gateways: None</b>, bật cả 2 tuỳ chọn DNS.'],
    viSao: [
      '<b>VPC</b> = mạng riêng của bạn trong data center AWS, giống mạng wifi ở nhà nhưng thiết bị cắm vào là máy chủ. Mỗi VPC cách ly hoàn toàn với VPC khác.',
      '<b>CIDR <code>10.0.0.0/16</code></b>: dải IP của mạng. <code>/16</code> = 2 số đầu cố định, nên có 65.536 địa chỉ từ <code>10.0.0.0</code> tới <code>10.0.255.255</code>. Dải <code>10.x</code> dành cho mạng riêng.',
      '<b>AZ</b> (Availability Zone) = một data center riêng trong region. 2 AZ = có chỗ ở 2 nơi; một nơi mất điện thì nơi kia vẫn chạy (冗長化 jouchouka, làm dự phòng). Tạo VPC thì <b>chưa có server nào</b>; số server do bạn quyết sau.',
      '<b>Subnet</b> = một phần nhỏ cắt ra từ VPC, nằm trong một AZ. Máy đặt vào subnet nào sẽ nhận <b>private IP</b> trong dải của subnet đó.',
      '<b>Route table</b> = biển chỉ đường của subnet. Subnet là <b>"public"</b> khi route table có dòng <code>0.0.0.0/0 → Internet Gateway</code>. Không có dòng đó thì là <b>"private"</b>. Tên subnet chỉ để đặt cho dễ nhớ.',
      '<b>Internet Gateway (IGW)</b> = cổng nối VPC với Internet, giống router ở nhà.',
      '<b>NAT Gateway ($)</b> = cửa <b>chỉ cho đi ra</b>, dành cho máy ở private subnet (tải gói, gọi API). Tính tiền theo giờ, gần 45 USD/tháng nếu quên, nên chọn None.',
      '<b>DNS options</b>: cho phép gọi máy bằng tên (ví dụ endpoint của RDS) thay vì IP.',
    ],
    meo: 'Trước khi tạo đã thấy VPCs = 1, Subnets = 3. Đó là <b>default VPC</b> AWS tạo sẵn ở mỗi region, không phải VPC của mình. Ở Resource map: <b>xanh lá</b> = subnet public, <b>xanh dương</b> = subnet private, chữ A/C = AZ <code>1a</code>/<code>1c</code>. VPC, subnet, route table, IGW đều <b>miễn phí</b>.',
  },
  {
    id: 'ip', title: 'Private IP và public IP',
    lam: ['Không có thao tác. Bước này để hiểu trước khi tạo EC2.'],
    viSao: [
      '<b>Private IP</b> (vd <code>10.0.3.176</code>): <b>subnet cấp</b>, máy nào cũng có. Chỉ dùng được trong VPC, giống <b>số máy lẻ</b> trong tổng đài công ty. Các VPC khác dùng trùng số cũng không sao.',
      '<b>Public IP</b> (vd <code>52.x.x.x</code>): <b>AWS cấp từ kho IP công khai</b> khi bật <i>Auto-assign public IP</i>. Duy nhất trên Internet, giống <b>số điện thoại thật</b>. Stop rồi Start máy thì đổi IP; muốn giữ cố định thì dùng Elastic IP.',
      '<b>Internet Gateway ghép cặp hai IP</b> (NAT 1:1): ai gọi <code>52.x.x.x</code> thì IGW đổi thành <code>10.0.3.176</code> rồi chuyển vào máy; máy trả lời thì đổi ngược lại. Vì vậy trong máy chạy <code>ip a</code> chỉ thấy <code>10.x</code>, không thấy public IP.',
      'Muốn người ngoài vào được máy cần đủ: <b>subnet có đường ra IGW</b> + <b>máy có public IP</b> + <b>Security Group mở cổng</b>. Thử tắt từng cái trong <a href="#mo-phong">bộ mô phỏng</a>.',
    ],
  },
  {
    id: 'ec2', title: 'Tạo EC2 Ubuntu + nginx',
    lam: [
      'Search <code>EC2</code> → <b>Launch instance</b>: Name <code>hoc-web-1</code>, AMI <b>Ubuntu 24.04</b>, <code>t3.micro</code>, Number of instances <b>1</b>.',
      'Key pair: tạo <code>hoc-key</code> (ED25519, .pem), lưu ở <code>~/.ssh/</code> trong WSL, rồi chạy <code>chmod 400 ~/.ssh/hoc-key.pem</code>. Không commit file key, không gửi qua chat.',
      'Network → <b>Edit</b>: VPC <code>hoc-vpc</code> (form mặc định chọn <b>default VPC</b>, phải đổi), subnet <code>public1</code>, <b>Auto-assign public IP: Enable</b>.',
      'Security Group <code>hoc-web-sg</code>: SSH 22 nguồn <b>My IP</b> (<code>x.x.x.x/32</code> = đúng 1 IP); HTTP 80 nguồn <b>Anywhere</b>.',
      'Advanced details → <b>User data</b> (script chạy một lần khi máy khởi động lần đầu):<pre><code>#!/bin/bash\napt update &amp;&amp; apt install -y nginx\necho "&lt;h1&gt;Xin chao tu $(hostname)&lt;/h1&gt;" &gt; /var/www/html/index.html\nsystemctl enable --now nginx</code></pre>',
    ],
    viSao: [
      '<b>EC2</b> = máy chủ ảo thuê theo giờ, giống Droplet của DigitalOcean. VPC là mạng, EC2 là máy cắm vào mạng đó.',
      'Chọn Ubuntu vì đã quen. Amazon Linux (mặc định của AWS) cùng họ với RHEL, mà doanh nghiệp Nhật dùng nhiều, nên lần sau thử.',
      '<b>Security Group</b> = firewall của từng máy. Inbound (chiều đi vào) mặc định chặn hết; rule nào có thì mới cho qua. SSH chỉ cho "My IP" để bot trên Internet không chạm tới được cổng 22.',
    ],
    sai: null,
  },
  {
    id: 'loi-timeout', title: 'Lỗi 1: ERR_CONNECTION_TIMED_OUT', bug: true,
    lam: ['Mở <code>http://&lt;public-ip&gt;</code> → trình duyệt quay một lúc lâu rồi báo <code>ERR_CONNECTION_TIMED_OUT</code>.'],
    viSao: [
      'Kiểm tra bằng CLI: <code>aws ec2 describe-security-groups</code> → Security Group <b>chỉ có rule SSH 22</b>. Rule HTTP 80 bị sót lúc tạo.',
      'Gói tin tới cổng 80 thì Security Group <b>bỏ đi lặng lẽ</b>, không trả lời gì. Trình duyệt không biết là bị chặn hay mạng chậm, nên cứ chờ, hết giờ chờ thì báo <b>timeout</b>.',
    ],
    sai: { tieuDe: 'Sửa', noiDung: 'EC2 → Security Groups → <code>hoc-web-sg</code> → Edit inbound rules → Add rule <b>HTTP</b>, nguồn <b>Anywhere-IPv4</b> → Save. Rule có hiệu lực ngay, không cần khởi động lại máy.<br><b>Ghi nhớ: timeout = bị chặn trên đường đi</b> (Security Group, route table, NACL, IP nhà đổi).' },
  },
  {
    id: 'loi-refused', title: 'Lỗi 2: ERR_CONNECTION_REFUSED', bug: true,
    lam: ['Thêm rule HTTP xong, tải lại trang → lỗi <b>đổi</b> thành <code>ERR_CONNECTION_REFUSED</code>, và báo ngay lập tức, không phải chờ.'],
    viSao: [
      'Lỗi đổi kiểu là tin tốt: gói tin <b>đã qua được Security Group và tới được máy</b>.',
      'Máy nhận gói tin ở cổng 80 nhưng <b>không có chương trình nào đang nghe cổng đó</b>, nên hệ điều hành trả lời ngay: "từ chối".',
      'Kiểm tra bằng CLI: <code>aws ec2 describe-instance-attribute --attribute userData</code> → <code>None</code>. Script cài nginx <b>chưa được dán</b> lúc tạo máy, nên nginx chưa được cài.',
    ],
    sai: { tieuDe: 'Sửa (cài tay trong máy)', noiDung: '<pre><code>ssh -i ~/.ssh/hoc-key.pem ubuntu@&lt;public-ip&gt;\nsudo ss -tlnp            # chưa có gì nghe :80\nsudo apt update &amp;&amp; sudo apt install -y nginx\nsystemctl status nginx   # active (running)\nsudo ss -tlnp            # đã có :80</code></pre>Tải lại trang → thấy <b>"Welcome to nginx!"</b>.<br><b>Ghi nhớ: refused = tới máy rồi nhưng dịch vụ không chạy.</b>' },
  },
  {
    id: 'tiep', title: 'Thí nghiệm tiếp theo và dọn dẹp',
    lam: [
      'Mỗi lần chỉ phá <b>một thứ</b>. <b>Đoán trước</b> lỗi sẽ ra sao rồi mới thử, thử xong thì trả lại như cũ: (1) xoá route <code>0.0.0.0/0</code> trong <code>hoc-rtb-public</code>; (2) tạo máy ở private subnet có bật public IP; (3) tạo máy ở public subnet nhưng tắt public IP; (4) đổi rule SSH sang một IP sai.',
      'Học xong: EC2 → Instances → <b>Terminate</b>. Không dùng Stop, vì Stop vẫn bị tính tiền ổ đĩa và public IP. VPC và Security Group để lại, chúng miễn phí.',
    ],
    viSao: ['Công việc vận hành thực tế phần lớn là <b>sửa thứ đang hỏng</b>. Tự phá rồi tự sửa thì sau này gặp lỗi thật sẽ nhận ra ngay.'],
  },
];

const renderList = (items) => '<ul>' + items.map((x) => `<li>${x}</li>`).join('') + '</ul>';
document.getElementById('steps').innerHTML = STEPS.map((s, i) => `
  <article class="step" id="${s.id}">
    <header><span class="n">${String(i + 1).padStart(2, '0')}</span><h2>${s.title}</h2></header>
    <div class="part"><b>Làm gì</b>${renderList(s.lam)}</div>
    <div class="part"><b>${s.bug ? 'Vì sao bị lỗi' : 'Vì sao'}</b>${renderList(s.viSao)}</div>
    ${s.sai ? `<div class="mistake"><b>${s.bug ? '' : 'Sai lầm đã gặp: '}${s.sai.tieuDe}</b><div>${s.sai.noiDung}</div></div>` : ''}
    ${s.meo ? `<div class="tip"><b>Lưu ý:</b> ${s.meo}</div>` : ''}
  </article>`).join('');
document.getElementById('toc').innerHTML = STEPS.map((s, i) => `<a href="#${s.id}" class="${s.bug || s.sai ? 'has-bug' : ''}">${i + 1}. ${s.title.replace(/:.*/, '')}</a>`).join('')
  + '<a href="#mo-phong">Mô phỏng</a><a href="#doc-loi">Đọc lỗi</a>';

// ---- Bộ mô phỏng ----
const CONDS = [
  { id: 'ip', label: 'Máy có public IP', note: 'Auto-assign public IP = Enable' },
  { id: 'route', label: 'Route table có 0.0.0.0/0 → IGW', note: 'Subnet là public' },
  { id: 'sg', label: 'Security Group mở cổng 80', note: 'Rule HTTP, nguồn Anywhere' },
  { id: 'svc', label: 'nginx đang chạy, nghe cổng 80', note: 'sudo ss -tlnp có :80' },
];
const NODES = ['Trình duyệt', 'Internet', 'Internet Gateway', 'Route table (subnet)', 'Security Group', 'EC2 :80 nginx'];
const state = { ip: true, route: true, sg: true, svc: true };

document.getElementById('toggles').innerHTML = CONDS.map((c) => `
  <label><input type="checkbox" id="c-${c.id}" checked><span>${c.label}<small>${c.note}</small></span></label>`).join('');
CONDS.forEach((c) => document.getElementById('c-' + c.id).addEventListener('change', (e) => { state[c.id] = e.target.checked; simulate(); }));

function simulate() {
  let stopAt = -1; let res;
  if (!state.ip) {
    stopAt = 0;
    res = { ok: false, code: 'Không có địa chỉ để gõ', why: 'Máy chỉ có private IP <code>10.x</code>. Internet không định tuyến tới IP riêng, nên từ ngoài không có cách nào gọi tới máy, kể cả khi mọi thứ khác đều đúng.', fix: 'Bật public IP (máy mới: Auto-assign = Enable; máy cũ: gắn Elastic IP).' };
  } else if (!state.route) {
    stopAt = 3;
    res = { ok: false, code: 'ERR_CONNECTION_TIMED_OUT', why: 'Gói tin vào được tới máy, nhưng <b>gói trả lời không có đường về</b> Internet, vì route table thiếu <code>0.0.0.0/0 → IGW</code>. Trình duyệt không nhận được gì nên chờ tới hết giờ. SSH cũng bị timeout tương tự.', fix: 'Thêm lại route <code>0.0.0.0/0</code> trỏ tới Internet Gateway.' };
  } else if (!state.sg) {
    stopAt = 4;
    res = { ok: false, code: 'ERR_CONNECTION_TIMED_OUT', why: 'Security Group <b>bỏ gói tin lặng lẽ</b>, không trả lời. Đây chính là lỗi 1 đã gặp.', fix: 'Thêm inbound rule HTTP 80.' };
  } else if (!state.svc) {
    stopAt = 5;
    res = { ok: false, code: 'ERR_CONNECTION_REFUSED', why: 'Gói tin <b>đã tới máy</b>, nhưng không có chương trình nào nghe cổng 80, nên máy từ chối ngay. Đây chính là lỗi 2 đã gặp.', fix: 'Cài hoặc khởi động nginx: <code>sudo systemctl start nginx</code>.' };
  } else {
    res = { ok: true, code: '200 OK: "Welcome to nginx!"', why: 'Đủ cả 4 điều kiện: có địa chỉ, có đường đi, firewall cho qua, có dịch vụ trả lời.', fix: '' };
  }
  document.getElementById('path').innerHTML = NODES.map((n, i) => {
    const cls = stopAt === -1 ? 'pass' : i < stopAt ? 'pass' : i === stopAt ? 'stop' : 'skip';
    return `<span class="node ${cls}">${n}</span>` + (i < NODES.length - 1 ? '<span class="arrow">→</span>' : '');
  }).join('');
  const el = document.getElementById('result');
  el.className = 'result ' + (res.ok ? 'ok' : 'bad');
  el.innerHTML = `<span class="code">${res.code}</span><span>${res.why}</span>${res.fix ? `<span><b>Sửa:</b> ${res.fix}</span>` : ''}`;
}
simulate();
