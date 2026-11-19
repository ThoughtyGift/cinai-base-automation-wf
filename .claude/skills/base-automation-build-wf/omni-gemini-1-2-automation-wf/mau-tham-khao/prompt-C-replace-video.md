# Mẫu C – Giữ nguyên video trend gốc, thay quần áo (Kling 4.0 Flash edit-video)

- Canvas gốc: `6afd6ec24a7f7b0d78000a34` – Fork: Korean fashion style
- Node: `video-generator-mwaekiq4gyc5` – model **Kling Video 4.0 Flash** – settings `{"aspect_ratio":"auto","duration":10,"generate_audio":true,"keep_original_sound":false,"model":"kling-video-v4_0_flash","resolution":"720p","video_modes":"edit-video"}`
- videoInput (video gốc) → handle reference_video; @Image 1..6 = ảnh người mẫu đã mặc từng outfit (CinGen 1.0 pro image).

## Prompt nguyên văn

```text
Edit @Video 1. Replace only what the request below names, using the reference pictures (@Image 1, @Image 2, @Image 3, @Image 4, @Image 5 and @Image 6) for how the new elements look.
Keep everything else exactly as in @Video 1: the same shots, action, timing, camera moves, framing, lighting and sound.
Request: Replace the girl's clothes in @Video 1 
 with the images in @Image 1 @Image 2 @Image 3 @Image 4 @Image 5 @Image 6 
 in sequence.
Return the whole video at the same length as @Video 1.
```
