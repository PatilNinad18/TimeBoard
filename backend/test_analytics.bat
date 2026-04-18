@echo off
cd /d "s:\FullStack\TimeBoard\backend"
echo Testing analytics service functions...
node test_analytics_calls.js
echo.
echo Test complete!
pause
