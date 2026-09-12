/*
  nav.js
  ------
  Kerangka tampilan yang sama dipakai di keempat halaman dashboard
  (/menu/, /pesanan/, /toko/, /ringkasan/): topbar dengan nama toko +
  tombol keluar, dan tab bar bawah untuk pindah antar halaman.
  renderDashShell() mengembalikan elemen <div id="dashContent"> supaya
  skrip halaman tinggal mengisi innerHTML-nya.
*/
function renderDashShell(seller, activeTab){
  const app = document.getElementById('app');
  app.innerHTML = `
  <div class="topbar">
    <div style="flex:1;"><h2>${escapeHtml(seller.storeName || 'Toko Saya')}</h2><div class="sub">@${escapeHtml(seller.username || '')}</div></div>
    <button class="btn btn-sm btn-outline" onclick="doLogout()">${ic('log-out',14)} Keluar</button>
  </div>
  <div class="content" id="dashContent"></div>
  <div class="tabbar">
    <button class="${activeTab==='menu'?'active':''}" onclick="goTo('/menu/')">${ic('utensils',20)}<span>Menu</span></button>
    <button class="${activeTab==='pesanan'?'active':''}" onclick="goTo('/pesanan/')">${ic('receipt',20)}<span>Pesanan</span></button>
    <button class="${activeTab==='toko'?'active':''}" onclick="goTo('/toko/')">${ic('store',20)}<span>Toko &amp; QR</span></button>
    <button class="${activeTab==='ringkasan'?'active':''}" onclick="goTo('/ringkasan/')">${ic('bar-chart-3',20)}<span>Ringkasan</span></button>
  </div>`;
  mountIcons();
  return document.getElementById('dashContent');
}
