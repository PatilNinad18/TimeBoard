@echo off
cd /d "s:\FullStack\TimeBoard\backend"
echo Creating sample data for yesterday...
node create_yesterday_data.js
echo.
echo Data creation complete!
pause
