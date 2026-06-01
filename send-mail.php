<?php
// TRUSTEP JAPAN - Contact Form Mail Handler
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'POST only']);
    exit;
}

// Honeypot check
if (!empty($_POST['_honey'])) {
    echo json_encode(['success' => true]);
    exit;
}

// === スパムフィルター v1.0 ===
$spamCompany = isset($_POST['company']) ? trim($_POST['company']) : '';
$spamName    = isset($_POST['name'])    ? trim($_POST['name'])    : '';
$spamPhone   = isset($_POST['phone'])   ? trim($_POST['phone'])   : '';
$spamMsg     = '';
foreach ($_POST as $v) { if (is_string($v)) $spamMsg .= $v . ' '; }

$isSpam = false;

// 1. 会社名に日本語が含まれない → スパム
if (!preg_match('/[\x{3000}-\x{9FFF}\x{30A0}-\x{30FF}\x{3040}-\x{309F}]/u', $spamCompany)) {
    $isSpam = true;
}

// 2. 名前に日本語が含まれない → スパム
if (!preg_match('/[\x{3000}-\x{9FFF}\x{30A0}-\x{30FF}\x{3040}-\x{309F}]/u', $spamName)) {
    $isSpam = true;
}

// 3. 電話番号が日本形式でない → スパム
if (!empty($spamPhone)) {
    $telClean = preg_replace('/[\s\-\(\)]/', '', $spamPhone);
    if (!preg_match('/^(0\d{9,10}|\+?81\d{9,10})$/', $telClean)) {
        $isSpam = true;
    }
}

// 4. キリル文字・アラビア文字・特殊外国語を含む → スパム
if (preg_match('/[\x{0400}-\x{04FF}\x{0600}-\x{06FF}\x{1E00}-\x{1EFF}]/u', $spamMsg)) {
    $isSpam = true;
}

// 5. ダミー会社名ブラックリスト
$dummyNames = ['google','test','facebook','amazon','apple','microsoft','yahoo','asdf','sample','example','twitter'];
if (in_array(strtolower(trim($spamCompany)), $dummyNames)) {
    $isSpam = true;
}

// 6. IPブラックリスト
$blockedIPs = ['80.94.95.202'];
$clientIP = $_SERVER['REMOTE_ADDR'] ?? '';
if (in_array($clientIP, $blockedIPs)) {
    $isSpam = true;
}

// 7. 同一IPから1分以内の連続送信
$rlFile = sys_get_temp_dir() . '/tj_rl_' . md5($clientIP) . '.txt';
if (file_exists($rlFile) && (time() - (int)file_get_contents($rlFile)) < 60) {
    $isSpam = true;
}
file_put_contents($rlFile, time());

// スパムならログだけ残して終了（ボットにはバレないように成功を返す）
if ($isSpam) {
    error_log("[SPAM] ip={$clientIP} company={$spamCompany} name={$spamName} phone={$spamPhone}");
    echo json_encode(['success' => true]);
    exit;
}
// === スパムフィルター ここまで ===

// Required fields
$company = isset($_POST['company']) ? trim($_POST['company']) : '';
$name    = isset($_POST['name'])    ? trim($_POST['name'])    : '';
$email   = isset($_POST['email'])   ? trim($_POST['email'])   : '';
$phone   = isset($_POST['phone'])   ? trim($_POST['phone'])   : '';
$topic   = isset($_POST['topic'])   ? trim($_POST['topic'])   : '';
$message = isset($_POST['message']) ? trim($_POST['message']) : '';
$budget  = isset($_POST['budget'])  ? trim($_POST['budget'])  : '';

if ($company === '' || $name === '' || $email === '' || $message === '') {
    echo json_encode(['success' => false, 'message' => 'Required fields missing']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Invalid email']);
    exit;
}

// Topic mapping
$topics = [
    'advisory'         => '顧問・社外取締役コンサルティング',
    'ai-talent'        => '人材育成 × AI',
    'ai-training'      => '法人向け AI 研修',
    'trust-forge'      => 'TRUST FORGE（AIシステム開発）',
    'top-seller'       => 'Top Seller Advance（営業改革）',
    'mitasu'           => 'ミタス・コンサル（補助金活用）',
    'claude'           => 'Claude Training Program',
    '0to1'             => '0to1 Service（新規事業開発）',
    'early-management' => '早期経営改善計画策定支援',
    'other'            => 'その他・複合的なご相談',
];
$topicLabel = isset($topics[$topic]) ? $topics[$topic] : $topic;

// Budget mapping
$budgets = [
    'under-100' => '100万円未満',
    '100-300'   => '100〜300万円',
    '300-500'   => '300〜500万円',
    '500-1000'  => '500〜1,000万円',
    'over-1000' => '1,000万円以上',
];
$budgetLabel = isset($budgets[$budget]) ? $budgets[$budget] : '未定／不明';

// Build email
$to = 'info@trustep-japan.co.jp';
$subject = '【TRUSTEP JAPAN】お問い合わせがありました - ' . $company;

$body  = "━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
$body .= "  TRUSTEP JAPAN お問い合わせフォーム\n";
$body .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
$body .= "【会社名】 " . $company . "\n";
$body .= "【お名前】 " . $name . "\n";
$body .= "【メール】 " . $email . "\n";
$body .= "【電話番号】 " . ($phone ?: '未入力') . "\n";
$body .= "【ご相談内容】 " . $topicLabel . "\n";
$body .= "【想定予算】 " . $budgetLabel . "\n\n";
$body .= "【具体的なご相談内容】\n";
$body .= $message . "\n\n";
$body .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
$body .= "送信日時: " . date('Y-m-d H:i:s') . "\n";
$body .= "送信元IP: " . ($_SERVER['REMOTE_ADDR'] ?? 'unknown') . "\n";

$headers  = "From: TRUSTEP JAPAN <noreply@trustep-japan.co.jp>\r\n";
$headers .= "Reply-To: " . $name . " <" . $email . ">\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "X-Mailer: TRUSTEP-JAPAN-ContactForm\r\n";

$result = mb_send_mail($to, $subject, $body, $headers);

if ($result) {
    // Auto-reply to customer
    $replySubject = '【TRUSTEP JAPAN】お問い合わせありがとうございます';
    $replyBody  = $name . " 様\n\n";
    $replyBody .= "この度はTRUSTEP JAPANにお問い合わせいただき、\n";
    $replyBody .= "誠にありがとうございます。\n\n";
    $replyBody .= "以下の内容でお問い合わせを受け付けました。\n";
    $replyBody .= "原則1営業日以内にご返信いたします。\n\n";
    $replyBody .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
    $replyBody .= "【ご相談内容】 " . $topicLabel . "\n";
    $replyBody .= "【具体的なご相談内容】\n" . $message . "\n";
    $replyBody .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
    $replyBody .= "お急ぎの場合は下記までお電話ください。\n";
    $replyBody .= "TEL: 03-6869-5250（平日 9:00-18:00）\n\n";
    $replyBody .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
    $replyBody .= "TRUSTEP JAPAN株式会社\n";
    $replyBody .= "〒102-0074 東京都千代田区九段南 1-5-6 りそな九段ビル 5F\n";
    $replyBody .= "TEL: 03-6869-5250 / FAX: 03-4216-7051\n";
    $replyBody .= "https://trustep-japan.co.jp/\n";

    $replyHeaders  = "From: TRUSTEP JAPAN <noreply@trustep-japan.co.jp>\r\n";
    $replyHeaders .= "Content-Type: text/plain; charset=UTF-8\r\n";

    mb_send_mail($email, $replySubject, $replyBody, $replyHeaders);

    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => 'Mail send failed']);
}
