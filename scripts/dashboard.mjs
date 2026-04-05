#!/usr/bin/env node
/**
 * Local-only web dashboard for monitoring cursor-power task state.
 * Binds to 127.0.0.1 only. No external dependencies.
 *
 * Usage:
 *   node ~/.cursor-power/scripts/dashboard.mjs [--port <number>]
 */
import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { parseArgs } from "node:util";
import { CONFIG_PATH } from "./paths.mjs";
import { getTaskStatuses } from "./task-reader.mjs";

function readConfig() {
  try {
    return JSON.parse(readFileSync(CONFIG_PATH, "utf-8"));
  } catch {
    return {};
  }
}

const { values } = parseArgs({
  options: {
    port: { type: "string", short: "p" },
  },
  allowPositionals: false,
});

const config = readConfig();
const port = values.port ? Number(values.port) : (config.dashboardPort ?? 3820);

if (Number.isNaN(port) || port < 1 || port > 65535) {
  console.error(`Invalid port: ${values.port}`);
  process.exit(1);
}

// ---------- HTML ----------

const HTML = /* html */ `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>cursor-power dashboard</title>
<style>
  :root {
    --bg: #0d1117; --surface: #161b22; --border: #30363d;
    --text: #e6edf3; --muted: #8b949e; --accent: #58a6ff;
    --green: #3fb950; --yellow: #d29922; --red: #f85149;
    --orange: #db6d28; --purple: #bc8cff;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
    background: var(--bg); color: var(--text); line-height: 1.5;
    padding: 1.5rem; max-width: 960px; margin: 0 auto;
  }
  header { display: flex; align-items: center; gap: .75rem; margin-bottom: 1.5rem; }
  header h1 { font-size: 1.25rem; font-weight: 600; }
  .meta { color: var(--muted); font-size: .8rem; }
  .stats { display: flex; gap: .75rem; flex-wrap: wrap; margin-bottom: 1.25rem; }
  .stat {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 8px; padding: .5rem 1rem; font-size: .85rem;
  }
  .stat strong { font-variant-numeric: tabular-nums; }
  .card-list { display: flex; flex-direction: column; gap: .75rem; }
  .card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 8px; padding: 1rem; transition: border-color .15s;
  }
  .card:hover { border-color: var(--accent); }
  .card-header { display: flex; align-items: center; gap: .5rem; margin-bottom: .35rem; flex-wrap: wrap; }
  .task-id { font-family: ui-monospace, SFMono-Regular, monospace; font-size: .85rem; color: var(--accent); }
  .badge {
    display: inline-block; font-size: .7rem; font-weight: 600;
    padding: 2px 8px; border-radius: 999px; text-transform: uppercase; letter-spacing: .02em;
  }
  .badge-pending   { background: var(--muted); color: var(--bg); }
  .badge-running   { background: var(--green); color: var(--bg); }
  .badge-blocked   { background: var(--yellow); color: var(--bg); }
  .badge-fixing    { background: var(--orange); color: var(--bg); }
  .badge-pr_created { background: var(--purple); color: var(--bg); }
  .badge-failed    { background: var(--red); color: #fff; }
  .badge-done      { background: var(--border); color: var(--text); }
  .prompt { color: var(--text); font-size: .875rem; line-height: 1.45; }
  .details {
    margin-top: .5rem; font-size: .8rem; color: var(--muted);
    display: flex; flex-wrap: wrap; gap: .35rem 1rem;
  }
  .details a { color: var(--accent); text-decoration: none; }
  .details a:hover { text-decoration: underline; }
  .detail-label { color: var(--muted); }
  .detail-value { color: var(--text); }
  .detail-none  { color: var(--muted); font-style: italic; }
  .session-short { font-family: ui-monospace, SFMono-Regular, monospace; font-size: .75rem; }
  .question-box {
    margin-top: .5rem; padding: .5rem .75rem; font-size: .8rem;
    background: rgba(210, 153, 34, .1); border-left: 3px solid var(--yellow);
    border-radius: 4px; color: var(--yellow);
  }
  .empty { text-align: center; color: var(--muted); padding: 3rem 0; }
  .poll-indicator { width: 8px; height: 8px; border-radius: 50%; background: var(--green); display: inline-block; }
  .poll-indicator.error { background: var(--red); }
  .card { cursor: pointer; }

  .modal-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,.6);
    display: flex; align-items: center; justify-content: center;
    z-index: 1000; opacity: 0; visibility: hidden; transition: opacity .15s, visibility .15s;
  }
  .modal-overlay.open { opacity: 1; visibility: visible; }
  .modal-panel {
    background: var(--surface); border: 1px solid var(--border); border-radius: 12px;
    width: 90%; max-width: 640px; max-height: 80vh; overflow-y: auto;
    padding: 1.5rem; position: relative;
  }
  .modal-close {
    position: absolute; top: .75rem; right: .75rem;
    background: none; border: none; color: var(--muted); font-size: 1.25rem;
    cursor: pointer; line-height: 1; padding: 4px 8px; border-radius: 4px;
  }
  .modal-close:hover { color: var(--text); background: var(--border); }
  .modal-title { display: flex; align-items: center; gap: .5rem; margin-bottom: 1rem; flex-wrap: wrap; }
  .modal-section { margin-bottom: 1rem; }
  .modal-section:last-child { margin-bottom: 0; }
  .modal-label { font-size: .75rem; color: var(--muted); text-transform: uppercase; letter-spacing: .04em; margin-bottom: .25rem; }
  .modal-value { font-size: .875rem; color: var(--text); line-height: 1.5; }
  .modal-value a { color: var(--accent); text-decoration: none; }
  .modal-value a:hover { text-decoration: underline; }
  .modal-prompt { white-space: pre-wrap; word-break: break-word; font-size: .875rem; line-height: 1.6; color: var(--text); }
  .modal-meta-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: .75rem; }
  .modal-question {
    padding: .5rem .75rem; font-size: .85rem;
    background: rgba(210, 153, 34, .1); border-left: 3px solid var(--yellow);
    border-radius: 4px; color: var(--yellow); white-space: pre-wrap; word-break: break-word;
  }
</style>
</head>
<body>
<header>
  <h1>cursor-power dashboard</h1>
  <span class="poll-indicator" id="indicator" title="polling"></span>
  <span class="meta" id="updated"></span>
</header>
<div class="stats" id="stats"></div>
<div class="card-list" id="tasks"></div>

<div class="modal-overlay" id="modal">
  <div class="modal-panel" id="modalPanel">
    <button class="modal-close" id="modalClose" title="閉じる">&times;</button>
    <div id="modalBody"></div>
  </div>
</div>

<script>
var POLL_INTERVAL = 5000;
var _taskData = [];

function badge(status) {
  return '<span class="badge badge-' + status + '">' + status.replace('_', ' ') + '</span>';
}

function relativeTime(iso) {
  if (!iso) return '';
  var diff = Date.now() - new Date(iso).getTime();
  var s = Math.floor(diff / 1000);
  if (s < 60) return s + '秒前';
  var m = Math.floor(s / 60);
  if (m < 60) return m + '分前';
  var h = Math.floor(m / 60);
  if (h < 24) return h + '時間前';
  return Math.floor(h / 24) + '日前';
}

function formatDateTime(iso) {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleString('ja-JP'); } catch { return escapeHtml(iso); }
}

function promptPreview(text) {
  if (!text) return '';
  var lines = text.split('\\n').filter(function(l) { return l.trim() !== ''; });
  var preview = lines.slice(0, 2).join('\\n');
  if (lines.length > 2) preview += ' …';
  return preview;
}

function shortSession(sid) {
  if (!sid) return '<span class="detail-none">未設定</span>';
  return '<span class="session-short">' + escapeHtml(sid.slice(0, 8)) + '</span>';
}

function renderStats(tasks) {
  var counts = {};
  for (var i = 0; i < tasks.length; i++) counts[tasks[i].status] = (counts[tasks[i].status] || 0) + 1;
  var el = document.getElementById('stats');
  var html = '<div class="stat">合計 <strong>' + tasks.length + '</strong></div>';
  var entries = Object.entries(counts);
  for (var j = 0; j < entries.length; j++) {
    html += '<div class="stat">' + badge(entries[j][0]) + ' <strong>' + entries[j][1] + '</strong></div>';
  }
  el.innerHTML = html;
}

function renderTasks(tasks) {
  var el = document.getElementById('tasks');
  if (tasks.length === 0) {
    el.innerHTML = '<div class="empty">タスクがありません</div>';
    return;
  }
  var html = '';
  for (var i = 0; i < tasks.length; i++) {
    var t = tasks[i];
    html += '<div class="card" data-task-id="' + escapeHtml(t.id) + '">';
    html += '<div class="card-header"><span class="task-id">' + escapeHtml(t.id) + '</span>' + badge(t.status) + '</div>';
    html += '<div class="prompt">' + escapeHtml(promptPreview(t.prompt)) + '</div>';
    html += '<div class="details">';
    html += '<span><span class="detail-label">PR:</span> ';
    if (t.prUrl) {
      html += '<a href="' + escapeHtml(t.prUrl) + '" target="_blank" rel="noopener">' + escapeHtml(t.prUrl.replace(/^https:\\/\\/github\\.com\\//, '')) + '</a>';
    } else {
      html += '<span class="detail-none">なし</span>';
    }
    html += '</span>';
    html += '<span><span class="detail-label">session:</span> ' + shortSession(t.sessionId) + '</span>';
    if (t.updatedAt) html += '<span><span class="detail-label">更新:</span> <span class="detail-value">' + relativeTime(t.updatedAt) + '</span></span>';
    html += '</div>';
    if (t.blocked && t.question) {
      html += '<div class="question-box">質問: ' + escapeHtml(t.question) + '</div>';
    }
    html += '</div>';
  }
  el.innerHTML = html;
}

/* ---------- Modal ---------- */

var modalOverlay = null;
var modalBody = null;

function openModal(task) {
  if (!modalOverlay) {
    modalOverlay = document.getElementById('modal');
    modalBody = document.getElementById('modalBody');
  }
  modalBody.innerHTML = buildModalContent(task);
  modalOverlay.classList.add('open');
}

function closeModal() {
  if (modalOverlay) modalOverlay.classList.remove('open');
}

function buildModalContent(t) {
  var h = '';
  h += '<div class="modal-title"><span class="task-id" style="font-size:1rem">' + escapeHtml(t.id) + '</span>' + badge(t.status) + '</div>';

  h += '<div class="modal-section"><div class="modal-label">Prompt</div>';
  h += '<div class="modal-prompt">' + escapeHtml(t.prompt || '') + '</div></div>';

  h += '<div class="modal-section"><div class="modal-label">メタ情報</div><div class="modal-meta-grid">';

  h += metaItem('PR URL', t.prUrl
    ? '<a href="' + escapeHtml(t.prUrl) + '" target="_blank" rel="noopener">' + escapeHtml(t.prUrl) + '</a>'
    : '<span class="detail-none">なし</span>');
  h += metaItem('Session ID', t.sessionId ? escapeHtml(t.sessionId) : '<span class="detail-none">未設定</span>');
  h += metaItem('Branch', t.branch ? escapeHtml(t.branch) : '—');
  h += metaItem('Repo', t.repoPath ? escapeHtml(t.repoPath) : '—');
  h += metaItem('作成日時', formatDateTime(t.createdAt));
  h += metaItem('更新日時', formatDateTime(t.updatedAt));
  if (t.acceptance) h += metaItem('受け入れテスト', '有効');
  if (t.acceptancePid) h += metaItem('受け入れ PID', '' + t.acceptancePid);

  h += '</div></div>';

  if (t.blocked && t.question) {
    h += '<div class="modal-section"><div class="modal-label">質問（blocked）</div>';
    h += '<div class="modal-question">' + escapeHtml(t.question) + '</div></div>';
  }

  return h;
}

function metaItem(label, valueHtml) {
  return '<div><div class="modal-label">' + escapeHtml(label) + '</div><div class="modal-value">' + valueHtml + '</div></div>';
}

document.addEventListener('click', function(e) {
  if (e.target.closest('a')) return;
  var card = e.target.closest('.card[data-task-id]');
  if (card) {
    var id = card.getAttribute('data-task-id');
    var task = _taskData.find(function(t) { return t.id === id; });
    if (task) openModal(task);
    return;
  }
  if (modalOverlay && modalOverlay.classList.contains('open')) {
    if (e.target === modalOverlay || e.target.id === 'modalClose' || e.target.closest('#modalClose')) {
      closeModal();
    }
  }
});

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeModal();
});

/* ---------- Polling ---------- */

function escapeHtml(s) {
  var d = document.createElement('div');
  d.appendChild(document.createTextNode(s));
  return d.innerHTML;
}

async function poll() {
  var ind = document.getElementById('indicator');
  try {
    var res = await fetch('/api/status');
    var data = await res.json();
    _taskData = data;
    renderStats(data);
    renderTasks(data);
    ind.className = 'poll-indicator';
    document.getElementById('updated').textContent = new Date().toLocaleTimeString();
  } catch (e) {
    ind.className = 'poll-indicator error';
  }
}

poll();
setInterval(poll, POLL_INTERVAL);
</script>
</body>
</html>`;

// ---------- Server ----------

const server = createServer((req, res) => {
  if (req.method === "GET" && req.url === "/api/status") {
    const data = getTaskStatuses({ includeDone: false });
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify(data));
    return;
  }

  if (req.method === "GET" && (req.url === "/" || req.url === "/index.html")) {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(HTML);
    return;
  }

  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("Not Found");
});

server.listen(port, "127.0.0.1", () => {
  console.log(`cursor-power dashboard: http://127.0.0.1:${port}`);
});
