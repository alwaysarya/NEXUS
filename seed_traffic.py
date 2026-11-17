import psycopg2
import random
from datetime import datetime, timedelta

conn = psycopg2.connect("postgres://atlas:atlas@localhost:5432/nexus?sslmode=disable")
cur = conn.cursor()

now = datetime.now()
for i in range(24, -1, -1):
    t = now - timedelta(hours=i)
    base_recv = 50000000
    base_sent = 20000000
    recv = base_recv + random.randint(-10000000, 15000000)
    sent = base_sent + random.randint(-5000000, 10000000)
    cur.execute("""
        INSERT INTO traffic_history (node_id, recv_bytes, sent_bytes, recorded_at)
        VALUES (%s, %s, %s, %s)
    """, ('local-node', recv, sent, t))

conn.commit()
cur.close()
conn.close()
print("✅ 25 hours of real-looking data inserted!")
