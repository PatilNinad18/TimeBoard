@echo off
cd /d "s:\FullStack\TimeBoard\backend"
echo Running complete analytics fix test...
node test_complete_fix.js
echo.
echo Test complete! Review the output above.
pause
