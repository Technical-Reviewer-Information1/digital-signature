(function () {
  'use strict';
  const T = window.Tools, $ = id => document.getElementById(id);
  const NS = 'http://www.w3.org/2000/svg';
  function el(n, a, t) { const e = document.createElementNS(NS, n); for (const k in a) if (a[k] != null) e.setAttribute(k, a[k]); if (t != null) e.textContent = t; return e; }
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  /* かんたんなハッシュ関数（教材用・16進6桁） */
  function hash(s) {
    let h1 = 0x811c9dc5, h2 = 0x1000193;
    for (let i = 0; i < s.length; i++) {
      const c = s.charCodeAt(i);
      h1 = (h1 ^ c) >>> 0; h1 = (h1 * 16777619) >>> 0;
      h2 = (h2 + c * (i + 7)) >>> 0; h2 = (h2 * 2654435761) >>> 0;
    }
    const v = ((h1 ^ h2) >>> 0).toString(16).toUpperCase().padStart(8, '0');
    return v.slice(0, 6);
  }
  const ORIG = '明日の集合時間は9時です。';

  /* ---------- STEP1 ---------- */
  let prevHash = null;
  function drawHash() {
    const s = $('doc1').value;
    const h = hash(s);
    const changed = prevHash !== null && prevHash !== h;
    $('hash1').textContent = h;
    $('hash1').className = 'hashout' + (changed ? ' changed' : '');
    const n = $('hashNote');
    if (prevHash === null) { n.className = 'note info'; n.textContent = '文書を書きかえると、ハッシュ値がどう変わるか見てください。'; }
    else if (changed) {
      n.className = 'note ok';
      n.innerHTML = 'ハッシュ値が <span class="mono">' + prevHash + '</span> → <span class="mono">' + h +
        '</span> と<strong>まったく別の値</strong >になりました。1文字の変更でも大きく変わるので、改ざんに気づけます。';
    } else { n.className = 'note info'; n.innerHTML = '同じ文書からは<strong>必ず同じハッシュ値</strong>になります。'; }
    prevHash = h;
  }

  /* ---------- STEP2 手順 ---------- */
  const SIG = [
    { d: '<strong>手順1</strong>　送信者は、送る文書から<strong>要約文（ハッシュ値）</strong>を作ります。' },
    { d: '<strong>手順2</strong>　その要約文を<strong>送信者の秘密鍵</strong>で暗号化します。これがデジタル署名です。' },
    { d: '<strong>手順3</strong>　暗号化された要約文と、元の文書をまとめて送ります。<strong>文書自体は暗号化されていません。</strong>' },
    { d: '<strong>手順4</strong>　受信者は<strong>送信者の公開鍵</strong>で署名を復号し、受け取った文書から自分で作った要約文と<strong>照合</strong>します。一致すれば本物です。' }
  ];
  let ss = 0;
  function drawSig() {
    const W = 660, H = 250;
    const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, width: '100%', role: 'img', 'aria-label': 'デジタル署名の手順' });
    [['送信者', 110], ['受信者', 550]].forEach(([t, x]) => {
      svg.appendChild(el('rect', { x: x - 58, y: 24, width: 116, height: 40, rx: 3, class: 'actor' }));
      svg.appendChild(el('text', { x, y: 48, class: 'atxt' }, t));
    });
    if (ss >= 0) {
      svg.appendChild(el('rect', { x: 60, y: 90, width: 100, height: 34, class: 'doc' }));
      svg.appendChild(el('text', { x: 110, y: 110, class: 'stxt' }, '文書'));
    }
    if (ss >= 0) {
      svg.appendChild(el('rect', { x: 60, y: 140, width: 100, height: 30, class: 'doc' }));
      svg.appendChild(el('text', { x: 110, y: 159, class: 'stxt' }, 'ハッシュ値'));
      svg.appendChild(el('line', { x1: 110, y1: 126, x2: 110, y2: 138, class: 'flow' + (ss === 0 ? ' hot' : '') }));
    }
    if (ss >= 1) {
      svg.appendChild(el('rect', { x: 60, y: 186, width: 100, height: 30, class: 'sig' }));
      svg.appendChild(el('text', { x: 110, y: 205, class: 'stxt' }, '署名'));
      svg.appendChild(el('line', { x1: 110, y1: 172, x2: 110, y2: 184, class: 'flow' + (ss === 1 ? ' hot' : '') }));
      svg.appendChild(el('text', { x: 190, y: 182, class: 'stxt', fill: '#b3261e', 'text-anchor': 'start' }, '送信者の秘密鍵で暗号化'));
    }
    if (ss >= 2) {
      svg.appendChild(el('line', { x1: 168, y1: 108, x2: 492, y2: 108, class: 'flow' + (ss === 2 ? ' hot' : '') }));
      svg.appendChild(el('line', { x1: 168, y1: 201, x2: 492, y2: 201, class: 'flow' + (ss === 2 ? ' hot' : '') }));
      svg.appendChild(el('text', { x: 330, y: 100, class: 'stxt' }, '文書（そのまま）'));
      svg.appendChild(el('text', { x: 330, y: 194, class: 'stxt' }, '署名'));
      svg.appendChild(el('rect', { x: 500, y: 90, width: 100, height: 34, class: 'doc' }));
      svg.appendChild(el('text', { x: 550, y: 110, class: 'stxt' }, '文書'));
      svg.appendChild(el('rect', { x: 500, y: 186, width: 100, height: 30, class: 'sig' }));
      svg.appendChild(el('text', { x: 550, y: 205, class: 'stxt' }, '署名'));
    }
    if (ss >= 3) {
      svg.appendChild(el('rect', { x: 500, y: 138, width: 100, height: 32, class: 'doc' }));
      svg.appendChild(el('text', { x: 550, y: 158, class: 'stxt' }, '照合'));
      svg.appendChild(el('line', { x1: 550, y1: 126, x2: 550, y2: 136, class: 'flow hot' }));
      svg.appendChild(el('line', { x1: 550, y1: 184, x2: 550, y2: 172, class: 'flow hot' }));
      svg.appendChild(el('text', { x: 470, y: 232, class: 'stxt', fill: '#1f7a3d', 'text-anchor': 'start' }, '送信者の公開鍵で復号して照合'));
    }
    const box = $('sigBox'); box.innerHTML = ''; box.appendChild(svg);
    $('sigStage').textContent = (ss + 1) + ' / ' + SIG.length;
    const n = $('sigNote');
    n.className = 'note ' + (ss === SIG.length - 1 ? 'ok' : 'info');
    n.innerHTML = SIG[ss].d;
  }

  /* ---------- STEP3 改ざん ---------- */
  let signedDoc = ORIG, signedHash = hash(ORIG);
  function drawVerify() {
    $('origDoc').textContent = signedDoc;
    $('sigVal').textContent = '【' + signedHash + '】を秘密鍵で暗号化したもの';
    const recv = $('recvDoc').value;
    const hr = hash(recv);
    $('hashRecv').textContent = hr;
    $('hashSig').textContent = signedHash;
    const ok = hr === signedHash;
    const v = $('verdict');
    v.className = 'verdict ' + (ok ? 'ok' : 'ng');
    v.textContent = ok ? '✓ 一致しました → 本人のもので、改ざんされていません' : '✗ 一致しません → 改ざんされています';
    const n = $('verNote');
    n.className = 'note ' + (ok ? 'ok' : 'ng');
    n.innerHTML = ok
      ? '受け取った文書から計算したハッシュ値と、署名を公開鍵で復号したハッシュ値が同じです。' +
        '<strong>公開鍵で復号できたということは、対になる秘密鍵で暗号化された＝送信者本人</strong>だとわかります。'
      : '2つのハッシュ値がちがうので、<strong>文書が途中で書きかえられた</strong>とわかります。' +
        'ただし<strong>どこが書きかえられたかまではわかりません</strong>。また、内容は暗号化されていないので<strong>盗み見は防げません</strong>。';
  }

  /* ---------- STEP5 クイズ ---------- */
  const QUIZ = [
    { t: 'デジタル署名で確認できることはどれか。',
      choices: ['送信されたデータが改ざんされていないこと', '通信経路上での盗み見を防止できること',
                'どこが改ざんされたのか特定できること', 'データを暗号化して情報漏洩を防げること'],
      a: '送信されたデータが改ざんされていないこと',
      why: 'デジタル署名でわかるのは「本人か」と「変えられていないか」。<strong>盗み見の防止や改ざん箇所の特定はできません</strong>。' },
    { t: 'デジタル署名でもう一つ確認できることはどれか。',
      choices: ['送信されたデータが送信者本人のものであること', 'データが暗号化されていること',
                '受信者以外に読まれていないこと', 'データが最短経路で届いたこと'],
      a: '送信されたデータが送信者本人のものであること',
      why: '送信者の公開鍵で復号できたということは、対になる秘密鍵を持つ本人が署名したということです。' },
    { t: '要約文（ハッシュ値）を暗号化するのに使う鍵はどれか。',
      choices: ['送信者の秘密鍵', '送信者の公開鍵', '受信者の秘密鍵', '受信者の公開鍵'], a: '送信者の秘密鍵',
      why: '本人しか持っていない鍵で閉めるからこそ、本人の証明になります。<strong>暗号化のときとは逆</strong>です。' },
    { t: '受信者が署名を復号するのに使う鍵はどれか。',
      choices: ['送信者の公開鍵', '送信者の秘密鍵', '受信者の公開鍵', '受信者の秘密鍵'], a: '送信者の公開鍵',
      why: '送信者の秘密鍵で閉めたものは、送信者の公開鍵でしか開けられません。' },
    { t: 'ハッシュ値の性質として正しいものはどれか。',
      choices: ['少しでも内容が変わると値が大きく変わる', '文書が長いほどハッシュ値も長くなる',
                'ハッシュ値から元の文書を復元できる', '異なる文書からは必ず異なる長さの値になる'],
      a: '少しでも内容が変わると値が大きく変わる',
      why: 'どんな長さの文書でもハッシュ値の長さは同じで、元の文書は復元できません。' },
    { t: 'デジタル署名をつけた文書は、途中で内容を読まれるか。',
      choices: ['読まれる（文書は暗号化されていない）', '読まれない（署名が暗号化しているため）',
                '読まれない（ハッシュ値になっているため）', '受信者以外は読めない'],
      a: '読まれる（文書は暗号化されていない）',
      why: '署名されるのは<strong>ハッシュ値だけ</strong>で、文書本体はそのまま送られます。内容を隠したいなら別に暗号化が必要です。' }
  ];
  let qList = [], qi = 0, qScore = 0;
  function startQuiz() { qList = shuffle(QUIZ); qi = 0; qScore = 0; renderQ(); }
  function renderQ() {
    if (qi >= qList.length) {
      $('qText').textContent = qScore + ' / ' + qList.length + ' 問正解';
      $('qChoices').innerHTML = ''; $('qFb').hidden = true; $('qNext').disabled = true;
      $('qProgress').textContent = qList.length + ' / ' + qList.length; return;
    }
    const it = qList[qi];
    $('qProgress').textContent = (qi + 1) + ' / ' + qList.length;
    $('qScore').textContent = qScore;
    $('qText').textContent = it.t;
    const box = $('qChoices'); box.className = 'choice4'; box.innerHTML = '';
    shuffle(it.choices).forEach(c => {
      const b = document.createElement('button');
      b.className = 'btn'; b.textContent = c; b.dataset.c = c;
      b.addEventListener('click', () => answerQ(c));
      box.appendChild(b);
    });
    $('qFb').hidden = true; $('qNext').disabled = true;
    $('qNext').textContent = (qi === qList.length - 1) ? '結果を見る' : '次の問題';
  }
  function answerQ(c) {
    const it = qList[qi], ok = c === it.a, box = $('qChoices');
    box.classList.add('locked');
    [...box.children].forEach(b => {
      if (b.dataset.c === it.a) b.classList.add('correct');
      else if (b.dataset.c === c) b.classList.add('wrong');
    });
    if (ok) qScore++;
    const fb = $('qFb');
    fb.className = 'note ' + (ok ? 'ok' : 'ng');
    fb.innerHTML = (ok ? '正解。' : '正解は「<strong>' + it.a + '</strong>」。') + it.why;
    fb.hidden = false;
    $('qScore').textContent = qScore; $('qNext').disabled = false;
  }

  /* 本文の問題 */
  function drawBook() {
    if (!document.getElementById('bookBox')) return;
    window.Quiz.choice('bookBox', 'bookNote', [{"k": "ア・イ", "q": "デジタル署名に関する記述として適当なもの（2つのうちの1つ）。", "ch": ["通信経路上での第三者による盗み見を防止できる", "データを暗号化して送信できるため情報漏洩を防げる", "送信されたデータが改ざんされていないことを確認できる", "送信されたデータのどこが改ざんされたのか特定できる", "送信されたデータが送信者本人のものであるか確認できる"], "a": "2|4", "why": "署名でできるのは<strong>改ざんの検出</strong>と<strong>本人確認</strong>の2つ。⓪①は暗号化の話で、署名では本文は隠れません。③の「どこが」までは分かりません。STEP 4 で確かめられます。"}, {"k": "ウ", "q": "手順2：要約文（ハッシュ値）を暗号化するのに使う鍵は。", "ch": ["送信者の公開鍵", "送信者の秘密鍵", "送信者の共通鍵", "受信者の公開鍵", "受信者の秘密鍵", "受信者の共通鍵"], "a": 1, "why": "<strong>送信者の秘密鍵</strong>です。本人しか持っていない鍵で暗号化するからこそ、本人の署名になります。"}, {"k": "エ", "q": "手順4：受信者が暗号化された要約文を復号するのに使う鍵は。", "ch": ["送信者の公開鍵", "送信者の秘密鍵", "送信者の共通鍵", "受信者の公開鍵", "受信者の秘密鍵", "受信者の共通鍵"], "a": 0, "why": "<strong>送信者の公開鍵</strong>です。暗号化とは鍵の使い方が逆（秘密鍵で閉めて公開鍵で開ける）になるのが署名の特徴です。"}], "本文の答えは【ア】・【イ】②・④（順不同）　【ウ】①　【エ】⓪ です。");
  }

  function init() {
    $('doc1').addEventListener('input', drawHash);
    document.querySelectorAll('[data-edit]').forEach(b => b.addEventListener('click', () => {
      const [a, c] = b.dataset.edit.split('→');
      $('doc1').value = $('doc1').value.replace(a, c);
      drawHash();
    }));
    $('resetDoc').addEventListener('click', () => { $('doc1').value = ORIG; drawHash(); });
    $('sigNext').addEventListener('click', () => { ss = (ss + 1) % SIG.length; drawSig(); });
    $('sigReset').addEventListener('click', () => { ss = 0; drawSig(); });
    $('recvDoc').addEventListener('input', drawVerify);
    $('tamper').addEventListener('click', () => {
      const s = $('recvDoc').value;
      const i = Math.floor(Math.random() * s.length);
      const alt = '一二三四五六七八九十時分日'[Math.floor(Math.random() * 12)];
      $('recvDoc').value = s.slice(0, i) + alt + s.slice(i + 1);
      drawVerify();
    });
    $('restore').addEventListener('click', () => { $('recvDoc').value = signedDoc; drawVerify(); });
    $('qNext').addEventListener('click', () => { qi++; renderQ(); });
    $('qReset').addEventListener('click', startQuiz);
    window.Terms.glossary($('glossBox'), ['デジタル署名', 'ハッシュ値', '公開鍵暗号方式', '共通鍵暗号方式', '認証局', 'SSL/TLS']);
    $('doc1').value = ORIG; $('recvDoc').value = ORIG;
    drawHash(); drawSig(); drawVerify(); startQuiz();
    drawBook();
    window.Terms.attach();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
