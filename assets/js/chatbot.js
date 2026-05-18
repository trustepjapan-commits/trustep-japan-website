/* =====================================================
   TRUSTEP JAPAN — Shared Chatbot Widget
   ===================================================== */
(function(){
  'use strict';
  if (document.getElementById('chatbotToggle')) return; // already injected

  const css = `
  .chatbot-toggle{position:fixed;right:22px;bottom:22px;z-index:9990;width:64px;height:64px;border-radius:50%;border:0;cursor:pointer;background:linear-gradient(135deg,#4b9cfb 0%,#007cff 50%,#0a1f4a 100%);box-shadow:0 10px 30px rgba(75,156,251,.45);color:#fff;display:grid;place-items:center;transition:transform .3s cubic-bezier(0.22,1,0.36,1),box-shadow .3s ease;animation:chatbotPulse 2.8s ease-in-out infinite;}
  .chatbot-toggle:hover{transform:translateY(-3px) scale(1.05);}
  .chatbot-toggle svg{width:28px;height:28px;stroke:#fff;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;}
  .chatbot-toggle.is-open svg.icon-chat{display:none;}
  .chatbot-toggle:not(.is-open) svg.icon-close{display:none;}
  .chatbot-badge{position:absolute;top:-4px;right:-4px;width:20px;height:20px;border-radius:50%;background:linear-gradient(135deg,#f84f65,#e8c76a);color:#fff;font-size:11px;font-weight:700;display:grid;place-items:center;box-shadow:0 3px 8px rgba(248,79,101,.4);animation:chatbotBadge .6s cubic-bezier(0.22,1,0.36,1) .5s backwards;}
  .chatbot-toggle.is-open .chatbot-badge{display:none;}
  @keyframes chatbotBadge{from{transform:scale(0);}to{transform:scale(1);}}
  @keyframes chatbotPulse{0%,100%{box-shadow:0 10px 30px rgba(75,156,251,.45),0 0 0 0 rgba(75,156,251,.5);}50%{box-shadow:0 10px 30px rgba(75,156,251,.5),0 0 0 16px rgba(75,156,251,0);}}
  .chatbot-panel{position:fixed;right:22px;bottom:100px;z-index:9989;width:380px;max-width:calc(100vw - 44px);height:580px;max-height:calc(100vh - 140px);background:linear-gradient(180deg,#0a1a38 0%,#0c1f42 100%);border:1px solid rgba(120,160,220,.2);border-radius:20px;box-shadow:0 24px 60px rgba(0,0,0,.5);display:none;flex-direction:column;overflow:hidden;opacity:0;transform:translateY(14px) scale(.98);transition:opacity .3s cubic-bezier(0.22,1,0.36,1),transform .3s cubic-bezier(0.22,1,0.36,1);backdrop-filter:blur(20px);}
  .chatbot-panel.is-open{display:flex;opacity:1;transform:translateY(0) scale(1);}
  .chatbot-header{padding:18px 20px;background:linear-gradient(135deg,rgba(75,156,251,.18),rgba(0,124,255,.08));border-bottom:1px solid rgba(120,160,220,.12);display:flex;align-items:center;gap:12px;}
  .chatbot-avatar{width:42px;height:42px;border-radius:50%;background:linear-gradient(135deg,#4b9cfb,#007cff);display:grid;place-items:center;color:#fff;font-family:"Playfair Display",serif;font-weight:700;font-size:18px;box-shadow:0 4px 12px rgba(75,156,251,.4);flex-shrink:0;position:relative;}
  .chatbot-avatar::after{content:"";position:absolute;bottom:2px;right:2px;width:10px;height:10px;border-radius:50%;background:#52d869;border:2px solid #0a1a38;}
  .chatbot-title{flex:1;min-width:0;}
  .chatbot-title .name{color:#fff;font-weight:600;font-size:14px;letter-spacing:.02em;font-family:"Playfair Display","Noto Serif JP",serif;}
  .chatbot-title .status{color:#95c7ff;font-size:11px;letter-spacing:.08em;display:flex;align-items:center;gap:6px;}
  .chatbot-close-btn{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);color:#b8c5d8;width:30px;height:30px;border-radius:50%;cursor:pointer;display:grid;place-items:center;font-size:14px;transition:background .2s ease,color .2s ease;}
  .chatbot-close-btn:hover{background:rgba(248,79,101,.2);color:#fff;}
  .chatbot-messages{flex:1;overflow-y:auto;padding:18px 18px 8px;display:flex;flex-direction:column;gap:10px;}
  .chatbot-messages::-webkit-scrollbar{width:5px;}
  .chatbot-messages::-webkit-scrollbar-thumb{background:rgba(75,156,251,.3);border-radius:3px;}
  .chat-msg{display:flex;gap:8px;max-width:86%;animation:chatMsgIn .35s cubic-bezier(0.22,1,0.36,1);}
  @keyframes chatMsgIn{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
  .chat-msg.bot{align-self:flex-start;}
  .chat-msg.user{align-self:flex-end;flex-direction:row-reverse;}
  .chat-msg-avatar{width:28px;height:28px;border-radius:50%;flex-shrink:0;display:grid;place-items:center;font-size:11px;font-weight:700;color:#fff;font-family:"Playfair Display",serif;}
  .chat-msg.bot .chat-msg-avatar{background:linear-gradient(135deg,#4b9cfb,#007cff);}
  .chat-msg.user .chat-msg-avatar{background:linear-gradient(135deg,#e8c76a,#b8963e);}
  .chat-msg-bubble{padding:10px 14px;border-radius:14px;font-size:13.5px;line-height:1.7;color:#f0f4fa;letter-spacing:.02em;word-wrap:break-word;}
  .chat-msg.bot .chat-msg-bubble{background:rgba(255,255,255,.06);border:1px solid rgba(120,160,220,.14);border-bottom-left-radius:4px;}
  .chat-msg.user .chat-msg-bubble{background:linear-gradient(135deg,rgba(75,156,251,.3),rgba(0,124,255,.25));border:1px solid rgba(75,156,251,.35);border-bottom-right-radius:4px;}
  .chat-msg-bubble a{color:#95c7ff;text-decoration:underline;text-underline-offset:2px;}
  .chat-msg-bubble a:hover{color:#e8c76a;}
  .chat-msg-bubble strong{color:#fff;}
  .typing-dots{display:inline-flex;gap:3px;align-items:center;padding:2px 0;}
  .typing-dots span{width:6px;height:6px;border-radius:50%;background:#95c7ff;animation:typingBounce 1.2s ease-in-out infinite;}
  .typing-dots span:nth-child(2){animation-delay:.2s;}
  .typing-dots span:nth-child(3){animation-delay:.4s;}
  @keyframes typingBounce{0%,80%,100%{opacity:.3;transform:scale(.8);}40%{opacity:1;transform:scale(1);}}
  .quick-replies{display:flex;flex-wrap:wrap;gap:6px;padding:4px 18px 12px;border-top:1px dashed rgba(120,160,220,.1);margin-top:4px;}
  .quick-reply-btn{background:rgba(75,156,251,.1);border:1px solid rgba(75,156,251,.3);color:#d8e6ff;font-size:12px;padding:7px 12px;border-radius:16px;cursor:pointer;transition:all .25s ease;font-family:inherit;letter-spacing:.02em;}
  .quick-reply-btn:hover{background:rgba(75,156,251,.25);border-color:rgba(75,156,251,.5);transform:translateY(-1px);}
  .chatbot-input{padding:14px 16px;background:rgba(10,20,40,.6);border-top:1px solid rgba(120,160,220,.12);display:flex;gap:8px;align-items:center;}
  .chatbot-input input{flex:1;background:rgba(255,255,255,.05);border:1px solid rgba(120,160,220,.18);border-radius:20px;padding:10px 16px;color:#fff;font-size:13px;font-family:inherit;outline:none;transition:border-color .2s ease,background .2s ease;}
  .chatbot-input input::placeholder{color:#6a87b3;}
  .chatbot-input input:focus{border-color:#4b9cfb;background:rgba(255,255,255,.08);}
  .chatbot-send{width:38px;height:38px;border-radius:50%;border:0;cursor:pointer;background:linear-gradient(135deg,#4b9cfb,#007cff);color:#fff;display:grid;place-items:center;transition:transform .2s ease,box-shadow .2s ease;box-shadow:0 4px 12px rgba(75,156,251,.4);}
  .chatbot-send:hover{transform:translateY(-1px) scale(1.05);box-shadow:0 6px 16px rgba(75,156,251,.55);}
  .chatbot-send svg{width:16px;height:16px;fill:#fff;}
  .chatbot-footer{text-align:center;font-size:10px;color:#6a87b3;padding:6px 0;letter-spacing:.05em;background:rgba(10,20,40,.4);}
  @media (max-width:640px){.chatbot-panel{right:10px;bottom:86px;width:calc(100vw - 20px);height:calc(100vh - 110px);}.chatbot-toggle{width:56px;height:56px;right:16px;bottom:16px;}}
  `;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  const html = `
  <button id="chatbotToggle" class="chatbot-toggle" aria-label="チャットを開く" aria-expanded="false">
    <svg class="icon-chat" viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12a9 9 0 1 1-3.5-7.1M21 4v5h-5"/><path d="M8 10.5h8M8 14h5"/></svg>
    <svg class="icon-close" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M6 18L18 6"/></svg>
    <span class="chatbot-badge" aria-hidden="true">1</span>
  </button>
  <div id="chatbotPanel" class="chatbot-panel" role="dialog" aria-labelledby="chatbotTitle" aria-hidden="true">
    <div class="chatbot-header">
      <div class="chatbot-avatar" aria-hidden="true">T</div>
      <div class="chatbot-title">
        <div class="name" id="chatbotTitle">TRUSTEP AI アシスタント</div>
        <div class="status"><span>●</span> オンライン｜お気軽にご質問ください</div>
      </div>
      <button id="chatbotCloseBtn" class="chatbot-close-btn" aria-label="チャットを閉じる">✕</button>
    </div>
    <div id="chatbotMessages" class="chatbot-messages" aria-live="polite"></div>
    <div id="chatbotQuickReplies" class="quick-replies"></div>
    <form id="chatbotForm" class="chatbot-input" autocomplete="off">
      <input id="chatbotInput" type="text" placeholder="ご質問を入力…" aria-label="メッセージを入力" maxlength="200">
      <button type="submit" class="chatbot-send" aria-label="送信"><svg viewBox="0 0 24 24"><path d="M2 21l21-9L2 3v7l15 2-15 2z"/></svg></button>
    </form>
    <div class="chatbot-footer">※ AI による自動応答｜詳しいご相談はお問い合わせフォームから</div>
  </div>
  `;
  const wrap = document.createElement('div');
  wrap.innerHTML = html;
  while (wrap.firstChild) document.body.appendChild(wrap.firstChild);

  const toggle = document.getElementById('chatbotToggle');
  const panel = document.getElementById('chatbotPanel');
  const closeBtn = document.getElementById('chatbotCloseBtn');
  const messages = document.getElementById('chatbotMessages');
  const form = document.getElementById('chatbotForm');
  const input = document.getElementById('chatbotInput');
  const quickReplies = document.getElementById('chatbotQuickReplies');

  const INTENTS = [
    {id:'services-overview', keywords:['サービス','何ができ','事業内容','支援内容','事業','メニュー','一覧','全体'],
     answer:'TRUSTEP JAPAN では以下 7 つのサービスを提供しています。<br>① <a href="advisory-and-outside-director-consulting.html">顧問・社外取締役コンサル</a><br>② <a href="ai-talent-development-consulting.html">人材育成 × AI</a><br>③ <a href="https://trustep-japan.co.jp/corporate-custom-ai-training.html" target="_blank" rel="noopener">法人向け AI 研修</a><br>④ <a href="https://trustep-japan.co.jp/trustforge-lp%20.html" target="_blank" rel="noopener">TRUST FORGE（AI システム開発）</a><br>⑤ <a href="top-seller-advance-lp.html">Top Seller Advance（営業コンサル）</a><br>⑥ <a href="mitasu-consul.html">ミタス・コンサル（補助金活用）</a><br>⑦ <a href="claude-training-lp.html">Claude Training Program（生成AI研修）</a><br>気になるサービスについて、さらに詳しくお聞かせできます。'},
    {id:'claude-training', keywords:['claude','クロード','生成ai研修','プロンプト'],
     answer:'<strong>Claude Training Program</strong> は、Claude を中心とした生成AI活用研修。基礎×実践×定着の 3 フェーズ・全 11 時間で、業務で再現可能なスキルを習得。経費助成活用で <strong>1 名あたり実質負担 89,000 円</strong>。<br>詳細 → <a href="claude-training-lp.html">こちら</a>'},
    {id:'advisory', keywords:['顧問','社外取締役','右腕','経営相談','経営課題','経営者','幹部'],
     answer:'<strong>顧問・社外取締役コンサルティング</strong>では、社長の右腕として経営課題の整理から、利益が上がる仕組みづくりまで伴走します。<br>詳細 → <a href="advisory-and-outside-director-consulting.html">こちら</a>'},
    {id:'ai-training', keywords:['研修','人材育成','教育','学習','ai研修','社員教育'],
     answer:'生成AI活用から人材開発まで、複数のプログラムをご用意しています。<br>• <a href="ai-talent-development-consulting.html">人材育成 × AI コンサル</a><br>• <a href="https://trustep-japan.co.jp/corporate-custom-ai-training.html" target="_blank" rel="noopener">法人向けオーダーメイド AI 研修</a><br>• <a href="claude-training-lp.html">Claude Training Program</a>'},
    {id:'trust-forge', keywords:['trust forge','trustforge','dx','業務自動化','rpa','自動化','ai開発','システム開発'],
     answer:'<strong>TRUST FORGE</strong> は中小企業向け AI システム開発サービスです。最短 <strong>2 週間・10 万円台〜</strong> のスモールスタート可能。<br>詳細 → <a href="https://trustep-japan.co.jp/trustforge-lp%20.html" target="_blank" rel="noopener">こちら</a>'},
    {id:'sales', keywords:['営業','top seller','topseller','売上','販路','セールス','営業改革'],
     answer:'<strong>Top Seller Advance</strong> は「人 × AI × 組織」を同時に変える次世代型営業コンサル。<br>詳細 → <a href="top-seller-advance-lp.html">こちら</a>'},
    {id:'subsidy', keywords:['補助金','助成金','ミタス','支援金','申請','採択','資金調達'],
     answer:'<strong>ミタス・コンサル</strong>は認定経営革新等支援機関による補助金・助成金の年間伴走型コンサル。採択率 <strong>80%以上</strong>。<br>詳細 → <a href="mitasu-consul.html">こちら</a>'},
    {id:'pricing', keywords:['料金','費用','価格','見積','いくら','値段','コスト','プラン'],
     answer:'料金はサービス内容と規模により異なります。具体的なお見積りは、まず<a href="contact.html">無料相談</a>でヒアリングさせてください。'},
    {id:'consult', keywords:['相談','問い合わせ','連絡','コンタクト','打合せ','初回','無料'],
     answer:'初回の<strong>無料相談</strong>を承っています。<br>📞 03-6869-5250（平日 9:00-18:00）<br>📝 <a href="contact.html">お問い合わせフォーム</a>'},
    {id:'cases', keywords:['事例','実績','支援実績','導入','クライアント'],
     answer:'400 社以上の経営支援実績、補助金支援 1,000 社超。<a href="case-studies.html">導入事例ページ</a>で具体例をご覧いただけます。'},
    {id:'company', keywords:['会社','所在地','住所','法人','運営','組織'],
     answer:'<strong>TRUSTEP JAPAN株式会社</strong><br>〒102-0074 東京都千代田区九段南 1-5-6 りそな九段ビル 5F<br>TEL 03-6869-5250<br>会社概要 → <a href="about.html">こちら</a>'},
    {id:'recruit', keywords:['採用','求人','求めて','応募','働き','キャリア','募集'],
     answer:'TRUSTEP JAPAN では一緒に成長してくれる仲間を募集中です。<br>採用情報 → <a href="recruit.html">こちら</a>'},
    {id:'faq', keywords:['よくある','faq','質問','疑問'],
     answer:'よくある質問は <a href="faq.html">FAQ ページ</a> にまとめています。'},
    {id:'greet', keywords:['こんにちは','はじめまして','よろしく','hello','hi','こんばんは','おはよう'],
     answer:'こんにちは！TRUSTEP JAPAN の AI アシスタントです。サービス・料金・お問い合わせ方法など、お気軽にご質問ください。'},
    {id:'thanks', keywords:['ありがとう','サンクス','感謝','助かり'],
     answer:'ありがとうございます！他にも気になる点があれば、どうぞお気軽にお聞きください。'}
  ];

  const QUICK_REPLIES = ['サービス一覧','料金について','無料相談したい','補助金活用','AIシステム開発','導入事例'];

  function findIntent(text){
    const q = text.toLowerCase();
    let best = null, bestScore = 0;
    for (const intent of INTENTS){
      let score = 0;
      for (const kw of intent.keywords){ if (q.includes(kw.toLowerCase())) score++; }
      if (score > bestScore){ bestScore = score; best = intent; }
    }
    return best;
  }

  function addMessage(role, html){
    const wrap = document.createElement('div');
    wrap.className = 'chat-msg ' + role;
    const av = document.createElement('div');
    av.className = 'chat-msg-avatar';
    av.textContent = role === 'bot' ? 'T' : 'U';
    const bb = document.createElement('div');
    bb.className = 'chat-msg-bubble';
    bb.innerHTML = html;
    wrap.appendChild(av);
    wrap.appendChild(bb);
    messages.appendChild(wrap);
    messages.scrollTop = messages.scrollHeight;
  }
  function addTyping(){
    const wrap = document.createElement('div');
    wrap.className = 'chat-msg bot';
    wrap.id = 'typingIndicator';
    wrap.innerHTML = '<div class="chat-msg-avatar">T</div><div class="chat-msg-bubble"><span class="typing-dots"><span></span><span></span><span></span></span></div>';
    messages.appendChild(wrap);
    messages.scrollTop = messages.scrollHeight;
  }
  function removeTyping(){ const t = document.getElementById('typingIndicator'); if (t) t.remove(); }
  function renderQuick(){
    quickReplies.innerHTML = '';
    QUICK_REPLIES.forEach(qr => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'quick-reply-btn';
      b.textContent = qr;
      b.addEventListener('click', () => handleInput(qr));
      quickReplies.appendChild(b);
    });
  }
  function escapeHtml(s){ return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function handleInput(text){
    const q = (text || '').trim();
    if (!q) return;
    addMessage('user', escapeHtml(q));
    input.value = '';
    addTyping();
    setTimeout(() => {
      removeTyping();
      const intent = findIntent(q);
      if (intent) addMessage('bot', intent.answer);
      else addMessage('bot', 'ご質問ありがとうございます。専門スタッフが直接お答えした方が確実です。<br><a href="contact.html">お問い合わせフォーム</a> または 📞 03-6869-5250 までご連絡ください。');
    }, 520);
  }
  function open(){
    panel.classList.add('is-open');
    panel.setAttribute('aria-hidden','false');
    toggle.classList.add('is-open');
    toggle.setAttribute('aria-expanded','true');
    setTimeout(() => input.focus(), 320);
    if (messages.childElementCount === 0){
      addMessage('bot', 'こんにちは！<strong>TRUSTEP JAPAN</strong> の AI アシスタントです。<br>サービス・料金・ご相談方法など、なんでもお気軽にお聞きください。');
      renderQuick();
    }
  }
  function close(){
    panel.classList.remove('is-open');
    panel.setAttribute('aria-hidden','true');
    toggle.classList.remove('is-open');
    toggle.setAttribute('aria-expanded','false');
  }
  toggle.addEventListener('click', () => panel.classList.contains('is-open') ? close() : open());
  closeBtn.addEventListener('click', close);
  form.addEventListener('submit', e => { e.preventDefault(); handleInput(input.value); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && panel.classList.contains('is-open')) close(); });
})();
