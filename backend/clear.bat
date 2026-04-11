@echo off
echo Clearing database...
node -e "const db=require('./db/database.js').default; db.prepare('DELETE FROM app_usage').run(); console.log('Database cleared');"
echo Done!
