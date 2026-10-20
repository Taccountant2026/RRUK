import sqlite3,json,sys
p=json.load(sys.stdin); d=sqlite3.connect(':memory:'); d.executescript(p['schema'])
row=('11111111-1111-4111-8111-111111111111','request','payload','question','Visitor','visitor@example.invalid','Bytova website enquiry','Please help with a useful business website.',0,1,1)
meta=json.dumps({'brand':'bytova','route':'websites','stage':'new'})
for _ in range(2):
    d.execute(p['insert'],row)
    d.execute(p['meta'],('funnel:'+row[0],meta,1,row[0]))
    d.execute(p['alert'],('alert','dedupe','request-owner',row[0],'owner@example.invalid','{}',1,1,1,row[0]))
assert d.execute('select count(*) from community_submissions').fetchone()[0]==1
assert d.execute('select count(*) from email_outbox').fetchone()[0]==1
d.execute(p['meta'],('funnel:missing',meta,1,'missing'))
assert d.execute("select count(*) from settings where key='funnel:missing'").fetchone()[0]==0
assert d.execute("select id from community_submissions where kind='story' and status='published' and consent=1").fetchall()==[]
try:
    d.execute("update community_submissions set status='published' where id=?",(row[0],))
except sqlite3.IntegrityError: pass
else: raise AssertionError('A private Bytova lead became a public story')
# Successful metadata revision closes the private source record.
d.execute('update settings set value=?,updated_at=? where key=? and updated_at=?',(meta,2,'funnel:'+row[0],1))
d.execute(p['progress'],('closed',2,row[0],'funnel:'+row[0],2))
assert d.execute('select status from community_submissions').fetchone()[0]=='closed'
# A stale writer with the same candidate timestamp cannot overwrite that closure.
d.execute('update settings set value=?,updated_at=? where key=? and updated_at=?',(meta,2,'funnel:'+row[0],1))
d.execute(p['progress'],('new',2,row[0],'funnel:'+row[0],2))
assert d.execute('select status from community_submissions').fetchone()[0]=='closed'
# A retry must not reset pipeline metadata, and a closed old record can be purged.
d.execute(p['meta'],('funnel:'+row[0],meta,3,row[0]))
assert d.execute('select updated_at from settings where key=?',('funnel:'+row[0],)).fetchone()[0]==2
assert d.execute('select count(*) from orders').fetchone()[0]==0
assert d.execute('select count(*) from products').fetchone()[0]==0
print('funnel SQL scenarios passed')
