import sqlite3,json,sys
p=json.load(sys.stdin)
d=sqlite3.connect(':memory:')
d.executescript(p['schema'])
values=('story-id','request','payload','story','Player','private@example.test','A memory','An original memory that is long enough.',1,1,1)
d.execute(p['insert'],values)
d.execute(p['insert'],values)
assert d.execute('select count(*) from community_submissions').fetchone()[0]==1
assert d.execute("select count(*) from community_submissions where status='published'").fetchone()[0]==0
d.execute("update community_submissions set status='published' where id='story-id' and revision=0")
row=d.execute("select id,name,title,body,created_at from community_submissions where kind='story' and status='published' and consent=1").fetchone()
assert row and 'private@example.test' not in row
d.execute(p['insert'],('hunt-id','hunt-request','payload','hunt','Private','private@example.test','Console Hunt','Please find a console for my next adventure.',0,1,1))
try:
    d.execute("update community_submissions set status='published' where id='hunt-id'")
except sqlite3.IntegrityError:
    pass
else:
    raise AssertionError('Private request was published')
print('ok')
