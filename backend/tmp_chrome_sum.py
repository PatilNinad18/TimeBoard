import sqlite3
conn = sqlite3.connect('backend/data/timeboard.db')
c = conn.cursor()
rows = c.execute("SELECT id, app_name, timestamp, duration, is_productive, is_idle FROM app_usage WHERE app_name='Google Chrome' AND date(timestamp)=date('now','localtime') ORDER BY timestamp ASC").fetchall()
print('count', len(rows))
print('sum', sum(r[3] for r in rows))
for r in rows:
    print(r)
conn.close()
