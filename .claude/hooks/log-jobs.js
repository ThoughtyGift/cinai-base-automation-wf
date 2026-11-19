#!/usr/bin/env node
/**
 * PostToolUse hook – ghi log mọi lần gọi cinai.tv MCP vào logs/cinai-jobs.jsonl
 * để truy vết chi phí, job_id, lỗi. (Đồng bộ lên Bitable do agent/n8n đảm nhận.)
 */
const fs = require('fs');
const path = require('path');

let raw = '';
process.stdin.on('data', (c) => (raw += c));
process.stdin.on('end', () => {
  try {
    const evt = JSON.parse(raw || '{}');
    const dir = path.join(process.env.CLAUDE_PROJECT_DIR || process.cwd(), 'logs');
    fs.mkdirSync(dir, { recursive: true });
    const resp = JSON.stringify(evt.tool_response ?? '');
    const line = {
      ts: new Date().toISOString(),
      env: process.env.PIPELINE_ENV || 'test',
      session: evt.session_id,
      tool: evt.tool_name,
      input: evt.tool_input,
      response_preview: resp.slice(0, 2000),
    };
    fs.appendFileSync(path.join(dir, 'cinai-jobs.jsonl'), JSON.stringify(line) + '\n');
  } catch (e) {
    process.stderr.write(`[log-jobs] ${e.message}\n`);
  }
  process.exit(0); // không bao giờ chặn
});
