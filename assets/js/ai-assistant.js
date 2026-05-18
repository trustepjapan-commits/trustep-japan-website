/* TRUSTEP JAPAN — AI Assistant Widget (self-contained)
   Inject CSS + HTML + JS for the chatbot label & panel on any page.
   Skips initialisation if the page already has #chatbotToggle (e.g. index.html). */
(function(){
  if (typeof document === 'undefined') return;
  const ready = (cb) => {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', cb, { once: true });
    else cb();
  };

  ready(function init(){
    const existingToggle = document.getElementById('chatbotToggle');
    const existingPanel = document.getElementById('chatbotPanel');

    // ============ Label-only mode ============
    // If a chatbot already exists on the page (e.g. from chatbot.js or inline),
    // just add the AI label bubble and wire it to open the existing chatbot.
    if (existingToggle){
      if (document.getElementById('chatbotLabel')) return; // label already present too
      const labelCss = `
.chatbot-label{position:fixed;right:112px;bottom:38px;z-index:9991;background:linear-gradient(135deg,rgba(10,26,56,.95),rgba(15,42,83,.95));border:1px solid rgba(232,199,106,.45);border-radius:14px;padding:10px 16px 10px 14px;color:#fff;font-size:13px;letter-spacing:.04em;font-weight:500;box-shadow:0 12px 32px rgba(0,0,0,.4),0 0 0 1px rgba(75,156,251,.15);backdrop-filter:blur(14px);white-space:nowrap;display:flex;align-items:center;gap:8px;animation:labelInAI .8s cubic-bezier(.22,1,.36,1) .8s backwards, labelBobAI 3.5s ease-in-out 2s infinite;cursor:pointer;font-family:Inter,"Noto Sans JP",sans-serif;}
.chatbot-label::after{content:"";position:absolute;right:-7px;top:50%;transform:translateY(-50%) rotate(45deg);width:12px;height:12px;background:rgba(15,42,83,.95);border-right:1px solid rgba(232,199,106,.45);border-top:1px solid rgba(232,199,106,.45);border-bottom-left-radius:2px;}
.chatbot-label .dot-online{width:8px;height:8px;border-radius:50%;background:#52d869;box-shadow:0 0 0 0 rgba(82,216,105,.7);animation:onlineDotAI 1.8s ease-in-out infinite;flex-shrink:0;}
@keyframes onlineDotAI{0%,100%{box-shadow:0 0 0 0 rgba(82,216,105,.7);}70%{box-shadow:0 0 0 8px rgba(82,216,105,0);}}
.chatbot-label strong{color:#e8c76a;font-weight:700;letter-spacing:.06em;}
.chatbot-label .small{display:block;font-size:10px;color:#95c7ff;letter-spacing:.12em;text-transform:uppercase;margin-top:1px;}
.chatbot-label.hidden{display:none;}
@keyframes labelInAI{from{opacity:0;transform:translateX(20px) scale(.9);}to{opacity:1;transform:translateX(0) scale(1);}}
@keyframes labelBobAI{0%,100%{transform:translateX(0);}50%{transform:translateX(-4px);}}
@media (max-width:640px){.chatbot-label{right:84px;bottom:30px;font-size:12px;padding:8px 12px;}.chatbot-label .small{display:none;}}
@media (prefers-reduced-motion: reduce){.chatbot-label,.chatbot-label .dot-online{animation:none !important;}}
`;
      const labelStyle = document.createElement('style');
      labelStyle.id = 'ai-assistant-label-css';
      labelStyle.textContent = labelCss;
      document.head.appendChild(labelStyle);

      const labelEl = document.createElement('div');
      labelEl.id = 'chatbotLabel';
      labelEl.className = 'chatbot-label';
      labelEl.setAttribute('role', 'button');
      labelEl.setAttribute('tabindex', '0');
      labelEl.setAttribute('aria-label', 'AIアシスタントに相談する');
      labelEl.innerHTML = '<span class="dot-online" aria-hidden="true"></span><span><strong>AIアシスタント</strong>に相談<span class="small">24h Online · Free</span></span>';
      document.body.appendChild(labelEl);

      const fireOpen = () => {
        if (existingPanel && existingPanel.classList.contains('is-open')) return;
        existingToggle.click();
      };
      labelEl.addEventListener('click', fireOpen);
      labelEl.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); fireOpen(); } });

      // Hide label when panel/toggle becomes open
      const watchTarget = existingPanel || existingToggle;
      const sync = () => {
        const open = (existingPanel && existingPanel.classList.contains('is-open')) ||
                     existingToggle.classList.contains('is-open');
        if (open) labelEl.classList.add('hidden');
        else labelEl.classList.remove('hidden');
      };
      new MutationObserver(sync).observe(watchTarget, { attributes: true, attributeFilter: ['class'] });
      sync();
      return;
    }

    // ============ Full self-contained mode (page has no chatbot at all) ============

    /* ============ CSS ============ */
    const css = `
.chatbot-toggle{position:fixed;right:22px;bottom:22px;z-index:9990;width:78px;height:78px;border-radius:50%;border:0;cursor:pointer;background:linear-gradient(135deg,#4b9cfb 0%,#007cff 55%,#0a1f4a 100%);box-shadow:0 14px 36px rgba(75,156,251,.55),0 0 0 0 rgba(75,156,251,.4),inset 0 0 0 2px rgba(232,199,106,.55);color:#fff;display:grid;place-items:center;transition:transform .3s cubic-bezier(0.22,1,0.36,1),box-shadow .3s ease;animation:chatbotPulse 2.8s ease-in-out infinite, chatbotFloat 4s ease-in-out infinite;}
.chatbot-toggle:hover{transform:translateY(-4px) scale(1.06);}
.chatbot-toggle svg{width:38px;height:38px;stroke:#fff;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;transition:transform .3s ease;}
.chatbot-toggle .robot-eye{fill:#e8c76a;stroke:none;animation:eyeBlink 4.5s ease-in-out infinite;transform-origin:center;}
.chatbot-toggle .robot-eye.right{animation-delay:.15s;}
@keyframes eyeBlink{0%,42%,46%,100%{opacity:1;transform:scaleY(1);}44%{opacity:.4;transform:scaleY(.1);}}
.chatbot-toggle .robot-antenna-tip{fill:#f84f65;stroke:none;animation:antennaPulse 1.6s ease-in-out infinite;}
@keyframes antennaPulse{0%,100%{opacity:.5;}50%{opacity:1;filter:drop-shadow(0 0 6px #f84f65);}}
@keyframes chatbotFloat{0%,100%{transform:translateY(0);}50%{transform:translateY(-6px);}}
.chatbot-toggle.is-open svg.icon-robot{display:none;}
.chatbot-toggle:not(.is-open) svg.icon-close{display:none;}
.chatbot-toggle.is-open{animation:none;}
.chatbot-toggle.is-open svg.icon-close{stroke:#fff;}
.chatbot-badge{position:absolute;top:-4px;right:-4px;width:20px;height:20px;border-radius:50%;background:linear-gradient(135deg,#f84f65,#e8c76a);color:#fff;font-size:11px;font-weight:700;display:grid;place-items:center;box-shadow:0 3px 8px rgba(248,79,101,.4);animation:chatbotBadge .6s cubic-bezier(0.22,1,0.36,1) .5s backwards;}
.chatbot-toggle.is-open .chatbot-badge{display:none;}
@keyframes chatbotBadge{from{transform:scale(0);}to{transform:scale(1);}}
@keyframes chatbotPulse{0%,100%{box-shadow:0 10px 30px rgba(75,156,251,.45),0 0 0 0 rgba(75,156,251,.5);}50%{box-shadow:0 10px 30px rgba(75,156,251,.5),0 0 0 16px rgba(75,156,251,0);}}
.chatbot-label{position:fixed;right:112px;bottom:38px;z-index:9991;background:linear-gradient(135deg,rgba(10,26,56,.95),rgba(15,42,83,.95));border:1px solid rgba(232,199,106,.45);border-radius:14px;padding:10px 16px 10px 14px;color:#fff;font-size:13px;letter-spacing:.04em;font-weight:500;box-shadow:0 12px 32px rgba(0,0,0,.4),0 0 0 1px rgba(75,156,251,.15);backdrop-filter:blur(14px);white-space:nowrap;display:flex;align-items:center;gap:8px;animation:labelIn .8s cubic-bezier(.22,1,.36,1) .8s backwards, labelBob 3.5s ease-in-out 2s infinite;cursor:pointer;font-family:Inter,"Noto Sans JP",sans-serif;}
.chatbot-label::after{content:"";position:absolute;right:-7px;top:50%;transform:translateY(-50%) rotate(45deg);width:12px;height:12px;background:linear-gradient(135deg,rgba(15,42,83,.95),rgba(15,42,83,.95));border-right:1px solid rgba(232,199,106,.45);border-top:1px solid rgba(232,199,106,.45);border-bottom-left-radius:2px;}
.chatbot-label .dot-online{width:8px;height:8px;border-radius:50%;background:#52d869;box-shadow:0 0 0 0 rgba(82,216,105,.7);animation:onlineDot 1.8s ease-in-out infinite;}
@keyframes onlineDot{0%,100%{box-shadow:0 0 0 0 rgba(82,216,105,.7);}70%{box-shadow:0 0 0 8px rgba(82,216,105,0);}}
.chatbot-label strong{color:#e8c76a;font-weight:700;letter-spacing:.06em;}
.chatbot-label .small{display:block;font-size:10px;color:#95c7ff;letter-spacing:.12em;text-transform:uppercase;margin-top:1px;}
.chatbot-label.hidden{display:none;}
@keyframes labelIn{from{opacity:0;transform:translateX(20px) scale(.9);}to{opacity:1;transform:translateX(0) scale(1);}}
@keyframes labelBob{0%,100%{transform:translateX(0);}50%{transform:translateX(-4px);}}
.chatbot-panel{position:fixed;right:22px;bottom:100px;z-index:9989;width:380px;max-width:calc(100vw - 44px);height:580px;max-height:calc(100vh - 140px);background:linear-gradient(180deg,#0a1a38 0%,#0c1f42 100%);border:1px solid rgba(120,160,220,.2);border-radius:20px;box-shadow:0 24px 60px rgba(0,0,0,.5),0 0 0 1px rgba(75,156,251,.1);display:none;flex-direction:column;overflow:hidden;opacity:0;transform:translateY(14px) scale(.98);transition:opacity .3s cubic-bezier(0.22,1,0.36,1),transform .3s cubic-bezier(0.22,1,0.36,1);backdrop-filter:blur(20px);font-family:Inter,"Noto Sans JP",sans-serif;}
.chatbot-panel.is-open{display:flex;opacity:1;transform:translateY(0) scale(1);}
.chatbot-panel .chatbot-header{padding:18px 20px;background:linear-gradient(135deg,rgba(75,156,251,.18),rgba(0,124,255,.08));border-bottom:1px solid rgba(120,160,220,.12);display:flex;align-items:center;gap:12px;}
.chatbot-avatar{width:42px;height:42px;border-radius:50%;background:linear-gradient(135deg,#4b9cfb,#007cff);display:grid;place-items:center;color:#fff;font-family:"Playfair Display",serif;font-weight:700;font-size:18px;box-shadow:0 4px 12px rgba(75,156,251,.4);flex-shrink:0;position:relative;}
.chatbot-avatar::after{content:"";position:absolute;bottom:2px;right:2px;width:10px;height:10px;border-radius:50%;background:#52d869;border:2px solid #0a1a38;}
.chatbot-title{flex:1;min-width:0;}
.chatbot-title .name{color:#fff;font-weight:600;font-size:14px;letter-spacing:.02em;font-family:"Playfair Display","Noto Serif JP",serif;}
.chatbot-title .status{color:#95c7ff;font-size:11px;letter-spacing:.08em;display:flex;align-items:center;gap:6px;}
.chatbot-close-btn{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);color:#b8c5d8;width:30px;height:30px;border-radius:50%;cursor:pointer;display:grid;place-items:center;font-size:14px;transition:background .2s ease,color .2s ease;}
.chatbot-close-btn:hover{background:rgba(248,79,101,.2);color:#fff;}
.chatbot-messages{flex:1;overflow-y:auto;padding:18px 18px 8px;display:flex;flex-direction:column;gap:10px;scrollbar-width:thin;scrollbar-color:rgba(75,156,251,.3) transparent;}
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
@media (max-width:640px){.chatbot-panel{right:10px;bottom:86px;width:calc(100vw - 20px);height:calc(100vh - 110px);}.chatbot-toggle{width:64px;height:64px;right:16px;bottom:16px;}.chatbot-label{right:84px;bottom:30px;font-size:12px;padding:8px 12px;}.chatbot-label .small{display:none;}}
@media (prefers-reduced-motion: reduce){.chatbot-toggle,.chatbot-toggle .robot-eye,.chatbot-toggle .robot-antenna-tip,.chatbot-label,.chatbot-label .dot-online{animation:none !important;}}
`;
    const styleEl = document.createElement('style');
    styleEl.id = 'ai-assistant-css';
    styleEl.textContent = css;
    document.head.appendChild(styleEl);

    /* ============ HTML ============ */
    const html = `
<div id="chatbotLabel" class="chatbot-label" role="button" tabindex="0" aria-label="AIアシスタントに相談する">
  <span class="dot-online" aria-hidden="true"></span>
  <span><strong>AIアシスタント</strong>に相談<span class="small">24h Online · Free</span></span>
</div>
<button id="chatbotToggle" class="chatbot-toggle" aria-label="AIアシスタントを開く" aria-expanded="false">
  <svg class="icon-robot" viewBox="0 0 48 48" aria-hidden="true">
    <line x1="24" y1="6" x2="24" y2="12"/>
    <circle class="robot-antenna-tip" cx="24" cy="5" r="2.4"/>
    <rect x="9" y="12" width="30" height="22" rx="6" ry="6"/>
    <circle class="robot-eye" cx="18" cy="22" r="2.6"/>
    <circle class="robot-eye right" cx="30" cy="22" r="2.6"/>
    <line x1="17" y1="29" x2="31" y2="29" stroke-width="1.6"/>
    <line x1="6" y1="20" x2="6" y2="26"/>
    <line x1="42" y1="20" x2="42" y2="26"/>
    <line x1="20" y1="38" x2="28" y2="38"/>
    <line x1="14" y1="42" x2="34" y2="42"/>
  </svg>
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
    <button type="submit" class="chatbot-send" aria-label="送信">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 21l21-9L2 3v7l15 2-15 2z"/></svg>
    </button>
  </form>
  <div class="chatbot-footer">※ AI による自動応答｜詳しいご相談はお問い合わせフォームから</div>
</div>`;
    const wrap = document.createElement('div');
    wrap.id = 'ai-assistant-root';
    wrap.innerHTML = html;
    document.body.appendChild(wrap);

    /* ============ JS ============ */
    const toggle = document.getElementById('chatbotToggle');
    const panel = document.getElementById('chatbotPanel');
    const closeBtn = document.getElementById('chatbotCloseBtn');
    const messages = document.getElementById('chatbotMessages');
    const form = document.getElementById('chatbotForm');
    const input = document.getElementById('chatbotInput');
    const quickReplies = document.getElementById('chatbotQuickReplies');
    const label = document.getElementById('chatbotLabel');

    const INTENTS = [
      { id:'services-overview', keywords:['サービス','何ができ','事業内容','支援内容','事業','メニュー','一覧','全体'],
        answer:'TRUSTEP JAPAN では以下 7 つのサービスを提供しています。<br>① <a href="advisory-and-outside-director-consulting.html">顧問・社外取締役コンサル</a><br>② <a href="ai-talent-development-consulting.html">人材育成 × AI</a><br>③ <a href="corporate-custom-ai-training.html" target="_blank" rel="noopener">法人向け AI 研修</a><br>④ <a href="trust-forge-lp.html" target="_blank" rel="noopener">TRUST FORGE（AI システム開発）</a><br>⑤ <a href="top-seller-advance-lp.html">Top Seller Advance（営業コンサル）</a><br>⑥ <a href="mitasu-consul.html">ミタス・コンサル（補助金活用）</a><br>⑦ <a href="claude-training-lp.html">Claude Training Program（生成AI研修）</a><br>気になるサービスについて、さらに詳しくお聞かせできます。' },
      { id:'claude-training', keywords:['claude','クロード','生成ai研修','claude研修','プロンプト','クロード研修'],
        answer:'<strong>Claude Training Program</strong> は、Claude を中心とした生成AI活用研修です。<br>基礎 × 実践 × 定着の 3 フェーズ・全 11 時間で、業務で再現可能なスキルを習得。<br>経費助成活用で <strong>1 名あたり実質負担 89,000 円</strong>。<br>詳細 → <a href="claude-training-lp.html">こちら</a>' },
      { id:'advisory', keywords:['顧問','社外取締役','右腕','経営相談','経営課題','経営者','幹部'],
        answer:'<strong>顧問・社外取締役コンサルティング</strong>では、社長の右腕として経営課題の整理から、利益が上がる仕組みづくりまで伴走します。会議体・数値管理・実行支援までセットでお引き受けします。<br>詳細 → <a href="advisory-and-outside-director-consulting.html">こちら</a>' },
      { id:'ai-training', keywords:['研修','人材育成','教育','学習','ai研修','生成ai','社員教育','勉強会'],
        answer:'生成AI活用から人材開発まで、2 つのプログラムをご用意しています。<br>• <a href="ai-talent-development-consulting.html">人材育成 × AI コンサル</a>（現場定着まで伴走）<br>• <a href="corporate-custom-ai-training.html" target="_blank" rel="noopener">法人向けオーダーメイド AI 研修</a>（企業固有の業務に合わせて設計）' },
      { id:'trust-forge', keywords:['ai開発','システム開発','trust forge','trustforge','dx','業務自動化','rpa','自動化'],
        answer:'<strong>TRUST FORGE</strong> は中小企業向け AI システム開発サービスです。<br>最短 <strong>2 週間・10 万円台〜</strong> のスモールスタートで、現場に必要な仕組みだけをつくります。<br>詳細 → <a href="trust-forge-lp.html" target="_blank" rel="noopener">こちら</a>' },
      { id:'sales', keywords:['営業','top seller','topseller','売上','販路','セールス','営業改革'],
        answer:'<strong>Top Seller Advance</strong> は「人 × AI × 組織」を同時に変える次世代型営業コンサルです。属人化の解消から定着まで一気通貫で支援します。<br>詳細 → <a href="top-seller-advance-lp.html">こちら</a>' },
      { id:'subsidy', keywords:['補助金','助成金','ミタス','支援金','申請','採択','資金調達'],
        answer:'<strong>ミタス・コンサル</strong>は認定経営革新等支援機関として、補助金・助成金を年間で活用する伴走型コンサルです。<br>採択率 <strong>80%以上</strong>、支援実績 <strong>700 社超</strong>。<br>詳細 → <a href="mitasu-consul.html">こちら</a>' },
      { id:'price', keywords:['料金','費用','価格','金額','見積','コスト','プラン'],
        answer:'料金は内容によって異なります。<br>• 無料相談で課題を整理 → 最適なプランをご提案します。<br>• 補助金や助成金の活用で実質負担を抑えるご提案も可能です。<br><a href="contact.html">お問い合わせフォーム</a> から、まずは無料相談をお申し込みください。' },
      { id:'contact', keywords:['問い合わせ','お問い合わせ','相談','連絡','コンタクト','聞きたい','質問'],
        answer:'お問い合わせは以下からお気軽に：<br>• <a href="contact.html">お問い合わせフォーム</a>（24h 受付）<br>• 📞 03-6869-5250（平日 8:30-17:30）<br>無料相談をご希望の場合はその旨ご記入ください。' },
      { id:'achievements', keywords:['実績','支援実績','事例','導入','クライアント','会社','お客様'],
        answer:'400 社以上の経営支援実績、認定経営革新等支援機関として 1,000 社超の補助金支援実績があります。紹介・リファラル中心で継続的にご支援しています。' },
      { id:'company', keywords:['会社概要','会社','所在地','住所','法人','運営','組織'],
        answer:'<strong>TRUSTEP JAPAN株式会社</strong><br>〒102-0074 東京都千代田区九段南 1-5-6 りそな九段ビル 5F<br>TEL 03-6869-5250' },
      { id:'area', keywords:['エリア','地域','地方','対応','全国','出張','オンライン'],
        answer:'全国対応しています。オンライン／対面どちらもご相談可能です。' },
      { id:'duration', keywords:['期間','いつまで','長さ','スパン','短期','長期','どれくらい'],
        answer:'サービスにより異なります。TRUST FORGE は最短 2 週間、顧問コンサルは月次伴走型、補助金は年間伴走型が基本です。ご希望に合わせて設計します。' },
      { id:'greet', keywords:['こんにちは','はじめまして','はじめて','よろしく','hello','hi','こんばんは','おはよう'],
        answer:'こんにちは！TRUSTEP JAPAN の AI アシスタントです。サービス内容・料金・お問い合わせ方法など、お気軽にご質問ください。' },
      { id:'thanks', keywords:['ありがとう','サンクス','感謝','助かり'],
        answer:'ありがとうございます！他にも気になる点があれば、どうぞお気軽にお聞きください。' }
    ];

    const QUICK_REPLIES = ['サービス一覧','料金について','無料相談したい','補助金活用について','AIシステム開発','営業改革について'];

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

    function escapeHtml(s){ return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

    function addMessage(role, html){
      const wrap = document.createElement('div');
      wrap.className = 'chat-msg ' + role;
      const avatar = document.createElement('div');
      avatar.className = 'chat-msg-avatar';
      avatar.textContent = role === 'bot' ? 'T' : 'U';
      const bubble = document.createElement('div');
      bubble.className = 'chat-msg-bubble';
      bubble.innerHTML = html;
      wrap.appendChild(avatar); wrap.appendChild(bubble);
      messages.appendChild(wrap);
      messages.scrollTop = messages.scrollHeight;
      return wrap;
    }

    function addTyping(){
      const wrap = document.createElement('div');
      wrap.className = 'chat-msg bot'; wrap.id = 'typingIndicator';
      const avatar = document.createElement('div'); avatar.className = 'chat-msg-avatar'; avatar.textContent = 'T';
      const bubble = document.createElement('div'); bubble.className = 'chat-msg-bubble';
      bubble.innerHTML = '<span class="typing-dots"><span></span><span></span><span></span></span>';
      wrap.appendChild(avatar); wrap.appendChild(bubble);
      messages.appendChild(wrap);
      messages.scrollTop = messages.scrollHeight;
    }
    function removeTyping(){ const t = document.getElementById('typingIndicator'); if (t) t.remove(); }

    function renderQuickReplies(){
      quickReplies.innerHTML = '';
      for (const qr of QUICK_REPLIES){
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'quick-reply-btn'; b.textContent = qr;
        b.addEventListener('click', () => handleUserInput(qr));
        quickReplies.appendChild(b);
      }
    }

    function handleUserInput(text){
      const q = (text || '').trim(); if (!q) return;
      addMessage('user', escapeHtml(q));
      input.value = '';
      addTyping();
      setTimeout(() => {
        removeTyping();
        const intent = findIntent(q);
        if (intent) addMessage('bot', intent.answer);
        else addMessage('bot', 'ご質問ありがとうございます。その内容は専門スタッフが直接お答えした方が確実です。<br>お手数ですが<a href="contact.html">お問い合わせフォーム</a>または 📞 03-6869-5250 までご連絡ください。<br><br>他にもサービスや料金など、気になる項目があればお聞かせください。');
      }, 520);
    }

    function openPanel(){
      panel.classList.add('is-open');
      panel.setAttribute('aria-hidden','false');
      toggle.classList.add('is-open');
      toggle.setAttribute('aria-expanded','true');
      setTimeout(() => input.focus(), 320);
      if (messages.childElementCount === 0){
        addMessage('bot','こんにちは！<strong>TRUSTEP JAPAN</strong> の AI アシスタントです。<br>サービス・料金・ご相談方法など、なんでもお気軽にお聞きください。');
        renderQuickReplies();
      }
    }
    function closePanel(){
      panel.classList.remove('is-open');
      panel.setAttribute('aria-hidden','true');
      toggle.classList.remove('is-open');
      toggle.setAttribute('aria-expanded','false');
    }

    toggle.addEventListener('click', () => { if (panel.classList.contains('is-open')) closePanel(); else openPanel(); });
    closeBtn.addEventListener('click', closePanel);
    form.addEventListener('submit', e => { e.preventDefault(); handleUserInput(input.value); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && panel.classList.contains('is-open')) closePanel(); });

    // Label entry point + auto-hide while panel is open
    const openIfClosed = () => { if (!panel.classList.contains('is-open')) openPanel(); };
    if (label){
      label.addEventListener('click', openIfClosed);
      label.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); openIfClosed(); } });
      const syncLabel = () => {
        if (panel.classList.contains('is-open')) label.classList.add('hidden');
        else label.classList.remove('hidden');
      };
      new MutationObserver(syncLabel).observe(panel, { attributes: true, attributeFilter: ['class'] });
      syncLabel();
    }

    // Optional header AI button on the page
    const headerBtn = document.getElementById('headerAiBtn');
    if (headerBtn) headerBtn.addEventListener('click', openIfClosed);
  });
})();
