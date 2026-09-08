@echo off
chcp 65001 > nul
title بناء برنامج ويندوز (Desktop .exe) - صادق الظاهري 2026
color 0A

echo ===================================================================
echo     برنامج تحويل الفواتير الورقية إلى إكسل ذكي - إصدار ويندوز
echo     تطوير وإعداد: صادق الظاهري 2026 - للتواصل: 772092700
echo ===================================================================
echo.
echo [1/4] جاري التحقق من بيئة Node.js...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [خطأ]: برنامج Node.js غير مثبت على هذا الجهاز!
    echo يرجى تنزيل وتثبيت Node.js أولاً من الموقع الرسمي: https://nodejs.org
    pause
    exit /b
)

echo [2/4] جاري تثبيت حزم Electron و Electron-Builder المكتبية...
call npm install --save-dev electron electron-builder

echo.
echo [3/4] جاري بناء وتجهيز واجهة التطبيق المكتبي (Vite + Dist)...
call npm run build

echo.
echo [4/4] جاري تجميع ملف التثبيت المكتبي التنفيذي (.exe) المشفر...
call npx electron-builder --config electron-builder.json --win

echo.
echo ===================================================================
echo     تهانينا! تم تجميع البرنامج التنفيذي بنجاح!
echo     ستجد ملف التثبيت المكتبي (Setup.exe) داخل مجلد: dist-desktop
echo     الكود المصدري محمي بالكامل ومغلق داخل حزمة ASAR مشفرة.
echo ===================================================================
echo.
pause
