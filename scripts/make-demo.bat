@echo off
setlocal

set FFMPEG=C:\ffmpeg\ffmpeg-2022-10-30-git-ed5a438f05-full_build\bin\ffmpeg.exe
set SS=C:\Users\muham\Documents\loommcp\website\assets\screenshots
set OUT=C:\Users\muham\Documents\loommcp\website\assets

echo Building demo video and GIF...

REM === Step 1: Scale all screenshots to exact 1440x900 ===
for %%F in (dashboard topology active-lens blur diff search history settings shortcuts docs) do (
  "%FFMPEG%" -y -i "%SS%\%%F.jpg" -vf "scale=1440:900:force_original_aspect_ratio=decrease,pad=1440:900:(ow-iw)/2:(oh-ih)/2:white" "%SS%\%%F_scaled.jpg" 2>nul
)

REM === Step 2: Create input list for video (4s per slide) ===
(
echo file '%SS%\dashboard_scaled.jpg'
echo duration 5
echo file '%SS%\topology_scaled.jpg'
echo duration 4
echo file '%SS%\active-lens_scaled.jpg'
echo duration 4
echo file '%SS%\blur_scaled.jpg'
echo duration 3
echo file '%SS%\diff_scaled.jpg'
echo duration 4
echo file '%SS%\search_scaled.jpg'
echo duration 3
echo file '%SS%\history_scaled.jpg'
echo duration 3
echo file '%SS%\settings_scaled.jpg'
echo duration 3
echo file '%SS%\shortcuts_scaled.jpg'
echo duration 3
echo file '%SS%\docs_scaled.jpg'
echo duration 4
echo file '%SS%\docs_scaled.jpg'
echo duration 0.01
) > "%TEMP%\demo_input.txt"

REM === Step 3: Build MP4 (high quality, 1440x900) ===
"%FFMPEG%" -y -f concat -safe 0 -i "%TEMP%\demo_input.txt" ^
  -vf "fps=30,format=yuv420p" ^
  -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p ^
  -movflags +faststart ^
  "%OUT%\demo.mp4" 2>nul

echo MP4 created: %OUT%\demo.mp4

REM === Step 4: Build animated GIF (optimised, 960px wide) ===
REM Create palette first
"%FFMPEG%" -y -f concat -safe 0 -i "%TEMP%\demo_input.txt" ^
  -vf "fps=2,scale=960:-1:flags=lanczos,palettegen=max_colors=128:stats_mode=diff" ^
  "%TEMP%\palette.png" 2>nul

REM Render GIF using palette
"%FFMPEG%" -y -f concat -safe 0 -i "%TEMP%\demo_input.txt" -i "%TEMP%\palette.png" ^
  -filter_complex "fps=2,scale=960:-1:flags=lanczos[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle" ^
  "%OUT%\demo.gif" 2>nul

echo GIF created: %OUT%\demo.gif

REM === Cleanup scaled files ===
for %%F in (dashboard topology active-lens blur diff search history settings shortcuts docs) do (
  del "%SS%\%%F_scaled.jpg" 2>nul
)

echo Done.
endlocal
