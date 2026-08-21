/* 「自分のテーマでやってみる」ワークシート。授業・探究でそのまま使える。
   Worksheet.make(boxId, {
     fields: [{id, label, hint, rows}],   // 記入欄
     build: (v) => html,                  // 記入内容からまとめを組み立てる
     name: '保存キー',                     // localStorage のキー（省略時は boxId）
     note: '補足'
   })
   ・入力はこの端末のブラウザにだけ保存される（サーバへは送られない）。
   ・「まとめを作る」→ コピー／印刷して 探究のレポートやワークシートに貼れる。        */
(function (global) {
  'use strict';
  const $ = id => document.getElementById(id);
  const esc = s => String(s == null ? '' : s).replace(/[<>&]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));

  function make(boxId, cfg) {
    const box = $(boxId);
    if (!box) return;
    const KEY = 'ws:' + (cfg.name || boxId);
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { saved = {}; }

    box.innerHTML =
      '<div class="wsheet">' +
      cfg.fields.map(function (f) {
        return '<label class="wsf" for="' + boxId + f.id + '"><span class="wsl">' + f.label + '</span>' +
          (f.hint ? '<span class="wsh">' + f.hint + '</span>' : '') +
          '<textarea id="' + boxId + f.id + '" rows="' + (f.rows || 2) + '" ' +
          'placeholder="' + (f.ph || '') + '">' + esc(saved[f.id] || '') + '</textarea></label>';
      }).join('') +
      '</div>' +
      '<div class="btn-row" style="margin-top:12px;flex-wrap:wrap">' +
      '<button class="btn primary" id="' + boxId + 'go">まとめを作る</button>' +
      '<button class="btn" id="' + boxId + 'copy">まとめをコピー</button>' +
      '<button class="btn" id="' + boxId + 'print">印刷する</button>' +
      '<button class="btn ghost" id="' + boxId + 'clear">消す</button>' +
      '</div>' +
      '<div class="note info" style="margin-top:10px">書いた内容は<strong>この端末のブラウザにだけ</strong>残ります' +
      '（どこにも送信されません）。共用のパソコンでは、終わったら「消す」を押してください。' +
      (cfg.note ? '<br>' + cfg.note : '') + '</div>' +
      '<div id="' + boxId + 'out" class="wsout" hidden></div>';

    function values() {
      const v = {};
      cfg.fields.forEach(function (f) { v[f.id] = ($(boxId + f.id).value || '').trim(); });
      return v;
    }
    function save() {
      try { localStorage.setItem(KEY, JSON.stringify(values())); } catch (e) {}
    }
    cfg.fields.forEach(function (f) { $(boxId + f.id).addEventListener('input', save); });

    $(boxId + 'go').addEventListener('click', function () {
      const v = values();
      const empty = cfg.fields.filter(function (f) { return !v[f.id]; });
      const out = $(boxId + 'out');
      out.hidden = false;
      if (empty.length === cfg.fields.length) {
        out.innerHTML = '<p class="wsmsg">まず、上の欄に自分のことばで書いてみましょう。' +
          'とちゅうまででもかまいません。</p>';
        return;
      }
      out.innerHTML = cfg.build(v, esc) +
        (empty.length ? '<p class="wsmsg">空いている欄：' + empty.map(function (f) { return f.label; }).join('、') + '</p>' : '');
      save();
    });

    $(boxId + 'copy').addEventListener('click', function (e) {
      const out = $(boxId + 'out');
      if (out.hidden) $(boxId + 'go').click();
      const txt = out.innerText.trim();
      if (!txt) return;
      const btn = e.currentTarget, old = btn.textContent;
      function done(msg) { btn.textContent = msg; setTimeout(function () { btn.textContent = old; }, 1600); }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(txt).then(function () { done('コピーしました'); }, function () { fallback(txt, done); });
      } else fallback(txt, done);
    });
    function fallback(txt, done) {
      const ta = document.createElement('textarea');
      ta.value = txt; ta.style.cssText = 'position:fixed;left:-9999px';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); done('コピーしました'); } catch (e) { done('コピーできませんでした'); }
      ta.remove();
    }

    $(boxId + 'print').addEventListener('click', function () {
      if ($(boxId + 'out').hidden) $(boxId + 'go').click();
      window.print();
    });

    $(boxId + 'clear').addEventListener('click', function () {
      cfg.fields.forEach(function (f) { $(boxId + f.id).value = ''; });
      try { localStorage.removeItem(KEY); } catch (e) {}
      const out = $(boxId + 'out'); out.hidden = true; out.innerHTML = '';
    });
  }

  global.Worksheet = { make: make };
})(window);
