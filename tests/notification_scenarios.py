import json, sqlite3, sys
p=json.load(sys.stdin)
db=sqlite3.connect(':memory:')
db.executescript(p['schema'])
def args(identifier='message',key='one',reference='order',now=1000):
    return (identifier,key,'dispatch',reference,'buyer@example.test','{"text":"saved contract"}',now,now,now)
db.execute(p['guarded'],args()+('missing-order',))
assert db.execute('SELECT COUNT(*) FROM email_outbox').fetchone()[0]==0
db.execute(p['insert'],args())
db.execute(p['insert'],args('other','one'))
assert db.execute('SELECT COUNT(*) FROM email_outbox').fetchone()[0]==1
def claim(at,token='lease'):
    return db.execute(p['claim'],(at,at,token,at+120000,'message',8,at-23*3600000,at,at)).fetchone()
assert claim(1001) is not None
assert claim(1002,'racing-worker') is None
assert claim(121002,'recovered-lease') is not None
db.execute("UPDATE email_outbox SET status='accepted',payload_json='{}',recipient='' WHERE id='message'")
assert claim(122000) is None
db.execute(p['insert'],args('retry-after-erasure','one',now=999999))
assert db.execute('SELECT COUNT(*) FROM email_outbox').fetchone()[0]==1
assert db.execute('SELECT payload_json,recipient FROM email_outbox').fetchone()==('{}','')
# Atomic rollback preserves the originating business action if its notification cannot be persisted.
db.commit()
try:
    with db:
        db.execute("UPDATE email_outbox SET status='review' WHERE id='message'")
        db.execute("INSERT INTO email_outbox(id,dedupe_key,kind,reference_id,recipient,payload_json,status,attempts,created_at,updated_at,next_attempt_at) VALUES('bad','bad','x','x','x','{}','invalid',0,1,1,1)")
except sqlite3.IntegrityError:
    pass
else:
    raise AssertionError('status constraint missing')
assert db.execute("SELECT status FROM email_outbox WHERE id='message'").fetchone()[0]=='accepted'
print('ok')
