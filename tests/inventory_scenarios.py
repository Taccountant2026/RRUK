"""Execute the production SQL against the real migrations, including concurrent connections."""
import json, sqlite3, sys, tempfile, threading
from pathlib import Path
p=json.load(sys.stdin)
with tempfile.TemporaryDirectory() as tmp:
 path=Path(tmp)/'shop.sqlite'
 def connection(): return sqlite3.connect(path, timeout=10)
 c=connection();c.executescript(p['schema']);c.execute('PRAGMA journal_mode=WAL')
 def product(pid,stock):
  c.execute('INSERT INTO products(id,slug,title,category,description,condition,condition_notes,price_pence,stock,active,compatibility,delivery_estimate,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)',(pid,pid,pid,'consoles','description','Good','tested',1000,stock,1,'UK','2–4 working days',1))
 def insert_order(conn,oid,items):
  conn.execute("INSERT INTO orders(id,request_hash,basket_hash,status,mode,account_id,total_pence,shipping_pence,items_json,policy_version,policy_text,expires_at,created_at) VALUES(?,?,?,'open','test','acct_fixture',1000,0,?,'2026-10-18','terms',9999999999999,1)",(oid,oid,oid,json.dumps(items)))
 product('last',1);product('available',3);product('empty',0);c.commit()
 barrier=threading.Barrier(2);outcomes=[]
 def buy(oid):
  conn=connection();rev=conn.execute("SELECT revision FROM products WHERE id='last'").fetchone()[0];barrier.wait()
  try:
   conn.execute('BEGIN IMMEDIATE');insert_order(conn,oid,[{'product':{'id':'last'},'quantity':1}]);conn.execute(p['reserve'],(rev,1,1,'last'));conn.commit();outcomes.append(('ok',oid))
  except sqlite3.IntegrityError: conn.rollback();outcomes.append(('sold',oid))
  finally:conn.close()
 threads=[threading.Thread(target=buy,args=(f'order-{i}',)) for i in range(2)]
 for t in threads:t.start()
 for t in threads:t.join()
 assert sorted(x[0] for x in outcomes)==['ok','sold'],outcomes
 winner=next(oid for result,oid in outcomes if result=='ok')
 assert c.execute("SELECT stock FROM products WHERE id='last'").fetchone()[0]==0
 assert c.execute('SELECT COUNT(*) FROM orders').fetchone()[0]==1
 try:
  c.execute('BEGIN IMMEDIATE');insert_order(c,'bad-basket',[]);c.execute(p['reserve'],(0,1,1,'available'));c.execute(p['reserve'],(0,1,1,'empty'));c.commit();raise AssertionError('Expected stock constraint')
 except sqlite3.IntegrityError:c.rollback()
 assert c.execute("SELECT stock FROM products WHERE id='available'").fetchone()[0]==3
 assert not c.execute("SELECT id FROM orders WHERE id='bad-basket'").fetchone()
 def release(conn,oid):
  conn.execute('BEGIN IMMEDIATE');conn.execute(p['release'],(1,'last',oid));conn.execute("UPDATE orders SET status='expired',restocked=1 WHERE id=? AND restocked=0 AND status IN ('creating','open','processing')",(oid,));conn.commit()
 release(c,winner);release(c,winner)
 assert c.execute("SELECT stock FROM products WHERE id='last'").fetchone()[0]==1
 c.execute(p['paid'],('paid',2,'{}',winner));c.commit()
 assert c.execute('SELECT status FROM orders WHERE id=?',(winner,)).fetchone()[0]=='review'
 # Payment wins the race: an expiry must not return its stock.
 c.execute('BEGIN IMMEDIATE');insert_order(c,'already-paid',[{'product':{'id':'last'},'quantity':1}]);rev=c.execute("SELECT revision FROM products WHERE id='last'").fetchone()[0];c.execute(p['reserve'],(rev,1,1,'last'));c.execute(p['paid'],('paid',2,'{}','already-paid'));c.commit()
 release(c,'already-paid')
 assert c.execute("SELECT stock FROM products WHERE id='last'").fetchone()[0]==0
 assert c.execute("SELECT status FROM orders WHERE id='already-paid'").fetchone()[0]=='paid'
 print('all inventory scenarios passed')
