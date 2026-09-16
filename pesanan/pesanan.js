/*
  pesanan.js
  ----------
  Halaman /pesanan/: daftar pesanan masuk untuk toko ini, bisa menandai
  progres (diproses -> diantar -> selesai), lihat denah meja, dan lihat
  lokasi GPS pembeli (kalau pembeli mengizinkan lokasi saat checkout).
*/

let SELLER, dashContent, mapOpenFor = null;

async function init(){
  SELLER = await requireSellerAuth();
  if(!SELLER) return;
  purgeOldOrders(); // jalan di latar belakang, tidak menahan tampilan
  dashContent = renderDashShell(SELLER, 'pesanan');
  await renderOrders();
}

async function renderOrders(){
  dashContent.innerHTML = `<div class="empty">${ic('loader-2',24)} Memuat pesanan…</div>`;
  mountIcons();
  const keys = await sList('order:', true);
  let orders = (await Promise.all(keys.map(k => sGet(k, true)))).filter(Boolean);
  orders = orders.filter(o => o.storeId === SELLER.storeId).sort((a,b) => b.createdAt - a.createdAt);
  if(orders.length === 0){ dashContent.innerHTML = `<div class="empty">${ic('receipt',30)}<br>Belum ada pesanan masuk.</div>`; mountIcons(); return; }
  const totalTables = await getTotalTables();
  dashContent.innerHTML = `<p class="faint" style="text-align:center;margin-bottom:10px;">${ic('clock',11)} Nota pesanan tersimpan 30 hari, lalu terhapus otomatis.</p>` + orders.map(o => {
    const canceled = o.status === 'dibatalkan';
    const idx = STATUS_FLOW.indexOf(o.status);
    const next = !canceled ? STATUS_FLOW[idx + 1] : null;
    const mapOpen = mapOpenFor === o.id;
    const payLabel = o.paymentMethod === 'qris' ? 'QRIS' : 'Tunai';
    const payStatus = o.paymentStatus || (o.paymentMethod === 'qris' ? 'lunas' : 'bayar_ditempat');
    const gmaps = mapsLink(o.location);
    return `<div class="card">
      <div class="row">
        <div><strong>Meja No. ${o.table}</strong> <span class="muted">· ${new Date(o.createdAt).toLocaleTimeString('id-ID')}</span></div>
        <span class="badge badge-${o.status}">${STATUS_LABEL[o.status]}</span>
      </div>
      <div style="margin:10px 0;">
        ${o.items.map(it => `<div class="muted" style="display:flex;justify-content:space-between;font-size:13.5px;"><span>${it.qty}× ${escapeHtml(it.name)}</span><span>${rupiah(it.price*it.qty)}</span></div>`).join('')}
      </div>
      <div class="row"><strong>${rupiah(o.total)}</strong><span class="badge badge-${payStatus}">${payLabel} ${payStatus === 'lunas' ? '· Lunas' : '· Bayar di tempat'}</span></div>
      <div style="margin-top:10px;display:flex;gap:14px;flex-wrap:wrap;align-items:center;">
        <button class="linklike" onclick="toggleMap('${o.id}')">${mapOpen ? 'Sembunyikan denah' : 'Lihat denah meja'}</button>
        ${gmaps ? `<a class="linklike" href="${gmaps}" target="_blank" style="text-decoration:none;">${ic('navigation',13)} Lokasi GPS pembeli</a>` : ''}
        ${next ? `<button class="btn btn-sm btn-primary" style="margin-left:auto;" onclick="advanceOrder('${o.id}')">Tandai: ${STATUS_LABEL[next]}</button>` : (canceled ? `<span class="muted" style="margin-left:auto;">Dibatalkan pembeli</span>` : `<span class="muted" style="margin-left:auto;">Pesanan selesai</span>`)}
      </div>
      ${mapOpen ? `<div class="map-wrap" style="margin-top:10px;">${tableMapSVG(o.table, totalTables)}</div>` : ''}
    </div>`;
  }).join('');
  mountIcons();
}

function toggleMap(orderId){
  mapOpenFor = mapOpenFor === orderId ? null : orderId;
  renderOrders();
}

async function advanceOrder(orderId){
  const key = 'order:' + orderId;
  const o = await sGet(key, true);
  if(!o || o.status === 'dibatalkan') return;
  const idx = STATUS_FLOW.indexOf(o.status);
  if(idx < STATUS_FLOW.length - 1){ o.status = STATUS_FLOW[idx + 1]; await sSet(key, o, true); }
  renderOrders();
}

init();
