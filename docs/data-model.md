# Data Model – Lark Bitable "Content Hub"

Tạo **2 base riêng**: `Content Hub [TEST]` và `Content Hub [PROD]`. Token PROD thêm vào `live_bitable_app_tokens` trong `.claude/hooks/protected-resources.json`.

## Ideas
| Field | Type | Ghi chú |
|---|---|---|
| idea_id | Text (PK) | `ID-0001` |
| title | Text | |
| niche / market | Single select | |
| source_url | URL | dùng để chống trùng |
| platform | Single select | tiktok, youtube, meta_ads, store, news |
| evidence | Long text | số liệu + link |
| pain_quotes | Long text | trích nguyên văn comment |
| score | Number | skill `win-scoring` |
| score_breakdown | Long text (JSON) | |
| status | Single select | `new → scored → approved / rejected` |

## Channels
| Field | Type | Ghi chú |
|---|---|---|
| channel_id | Text (PK) | `CH-001` |
| platform | Single select | |
| handle / page_id | Text | |
| is_test | Checkbox | **bắt buộc** đúng với môi trường |
| market / language / timezone | Text | |
| style_pack | Long text (JSON) | skill `channel-style-pack` |
| character_sheet_url, character_prompt, voice_id | Text/URL | skill `character-lock` |
| golden_hours | Text | |
| kpi | Long text (JSON) | ngưỡng thắng/thua riêng |

## Briefs
| Field | Type | Ghi chú |
|---|---|---|
| brief_id | Text (PK) | |
| idea_id, channel_id | Link | |
| parent_post_id | Link | khi là brief scale |
| product_lock_text, product_ref_urls | Long text | |
| angles | Long text (JSON) | 3 góc × 2 hook |
| status | Single select | `draft → ready → in_production → done` |

## Jobs
| Field | Type | Ghi chú |
|---|---|---|
| job_id | Text (PK) | |
| brief_id | Link | |
| variant | Number | |
| script_json | Long text | `docs/schemas/script.schema.json` |
| cinai_job_ids | Long text | |
| asset_url / preview_url | URL | |
| status | Single select | `queued → rendering → done / failed` |
| qc_status | Single select | `pending / qc_pass / qc_fail` |
| qc_notes, error, retries, cost_estimate | | |

## Posts
| Field | Type | Ghi chú |
|---|---|---|
| post_id | Text (PK) | |
| job_id, channel_id | Link | |
| caption, hashtags | Long text | |
| scheduled_at | DateTime | |
| approval | Single select | `pending_approval / approved / rejected` |
| status | Single select | `scheduled → published / error` |
| platform_post_id, url | Text/URL | |

## Metrics
| Field | Type | Ghi chú |
|---|---|---|
| post_id | Link | |
| captured_at | DateTime | |
| views, retention_3s, completion_rate, likes, comments, shares, ctr, orders | Number | |
| label | Single select | `winner / loser / pending` |

## State machine tổng
```
Idea(approved) → Brief(ready) → Job(done, qc_pass) → [Telegram duyệt] → Post(scheduled → published) → Metrics(winner → /scale | loser → stop)
```
