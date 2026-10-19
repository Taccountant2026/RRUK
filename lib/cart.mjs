export function readCart(raw) {
  if (typeof raw !== 'string' || raw.length > 5000) return [];
  try {
    let data;
    try { data = JSON.parse(raw); } catch { data = JSON.parse(decodeURIComponent(raw)); }
    if (!Array.isArray(data)) return [];
    const seen = new Set();
    return data.filter(l => {
      if (!l || typeof l.id !== 'string' || !/^[a-zA-Z0-9-]{1,60}$/.test(l.id) || !Number.isInteger(l.quantity) || l.quantity<1 || l.quantity>10 || seen.has(l.id)) return false;
      seen.add(l.id); return true;
    }).slice(0,20).map(l=>({id:l.id,quantity:l.quantity}));
  } catch { return []; }
}
