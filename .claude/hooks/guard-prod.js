#!/usr/bin/env node
/**
 * PreToolUse hook – bảo vệ production.
 * Claude Code gửi JSON qua stdin: { tool_name, tool_input, ... }
 * Exit 0 = cho phép; Exit 2 = chặn (stderr được gửi lại cho Claude).
 */
const fs = require('fs');
const path = require('path');

const cfg = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'protected-resources.json'), 'utf8')
);

let raw = '';
process.stdin.on('data', (c) => (raw += c));
process.stdin.on('end', () => {
  let evt = {};
  try { evt = JSON.parse(raw || '{}'); } catch { process.exit(0); }

  const tool = String(evt.tool_name || '');
  const payload = JSON.stringify(evt.tool_input || {});
  const env = process.env.PIPELINE_ENV || 'test';
  const block = (msg) => {
    process.stderr.write(`[guard-prod] CHẶN: ${msg}\nXem CLAUDE.md mục 2 (cô lập test/prod).\n`);
    process.exit(2);
  };

  // 1) File/dịch vụ production dùng chung
  for (const p of cfg.protected_paths) {
    if (payload.includes(p)) block(`đụng tài nguyên production "${p}".`);
  }

  // 2) Account / Page / Bitable live – không bao giờ đụng khi đang test
  const liveIds = [
    ...cfg.live_account_ids,
    ...cfg.live_page_ids,
    ...cfg.live_bitable_app_tokens,
  ].filter(Boolean);
  if (env !== 'production') {
    for (const id of liveIds) {
      if (payload.includes(id)) block(`tham chiếu account/Page/Bitable LIVE "${id}" khi PIPELINE_ENV=${env}.`);
    }
  }

  // 3) Cờ thử nghiệm nguy hiểm
  for (const f of cfg.dangerous_flags) {
    if (tool === 'Bash' && payload.includes(f)) block(`dùng cờ thử nghiệm "${f}".`);
  }

  // 4) Đăng bài thật chỉ khi PIPELINE_ENV=production được đặt rõ ràng
  const isPublish = tool.startsWith('mcp__') &&
    cfg.publish_tool_patterns.some((k) => tool.toLowerCase().includes(k));
  if (isPublish && env === 'production' && !process.env.PUBLISH_CONFIRMED) {
    block('đăng bài production cần PUBLISH_CONFIRMED=1 (user đã xác nhận).');
  }

  process.exit(0);
});
