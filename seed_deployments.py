import psycopg2
from datetime import datetime, timedelta

conn = psycopg2.connect("postgres://atlas:atlas@localhost:5432/nexus?sslmode=disable")
cur = conn.cursor()

data = [
    ('v2.8.4', 'Improve API response time', 'Aman Verma', 'Production', 'Deploying', 2),
    ('v2.8.3', 'Add request caching', 'Rahul Singh', 'Production', 'Succeeded', 24),
    ('v2.8.2', 'Fix session timeout', 'Priya Sharma', 'Staging', 'Succeeded', 72),
]

for version, msg, author, env, status, hours_ago in data:
    t = datetime.now() - timedelta(hours=hours_ago)
    cur.execute("""
        INSERT INTO deployments (version, message, author, environment, status, created_at)
        VALUES (%s, %s, %s, %s, %s, %s)
    """, (version, msg, author, env, status, t))

conn.commit()
cur.close()
conn.close()
print("✅ Deployments data inserted!")
