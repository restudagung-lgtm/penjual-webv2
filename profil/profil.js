/*
  profil.js
  ---------
  Halaman /profil/: pusat pengaturan toko -- dibuka lewat avatar bundar di
  pojok kanan atas semua halaman dashboard. Isinya:
  - Foto profil toko (avatar bundar, klik untuk ganti)
  - Info toko (nama, deskripsi, kategori, meja rujukan)
  - QRIS pembayaran (unggah + baca otomatis nominal)
  - Status langganan (Gratis/Premium)
  - Jalan pintas ke Kelola Menu
  - Ganti password akun
  - Keluar
*/

let SELLER, store;

async function init(){
  SELLER = await requireSellerAuth();
  if(!SELLER) return;
  store = await sGet('store:' + SELLER.storeId, true) || {id: SELLER.storeId};
  render();
}

function render(){
  const app = document.getElementById('app');
  const premium = isPremium(store);
  app.innerHTML = `
  <div class="topbar"><button class="backbtn" onclick="goTo('/menu/')">${ic('arrow-left',18)}</button><div><h2>Profil Toko</h2></div></div>
  <div class="content">
    <div class="profile-header">
      <label class="avatar-upload" id="avatarUploadBox">
        <input type="file" accept="image/*" id="avatarPhoto" onchange="uploadAvatarPhoto(this)">
        <div class="avatar-circle-lg" id="avatarCircle">${store.photoURL ? `<img src="${store.photoURL}" alt="">` : ic('store',34)}</div>
        <div class="avatar-edit-badge">${ic('camera',14)}</div>
      </label>
      <h2 style="display:flex;align-items:center;justify-content:center;gap:6px;">${escapeHtml(SELLER.storeName || 'Toko Saya')} ${premiumBadge(store)}</h2>
      <div class="sub">@${escapeHtml(SELLER.username || '')} · ${ratingBadge(store)}</div>
    </div>

    <div class="profile-link-card" onclick="goTo('/menu/')">
      <div class="plc-ic">${ic('utensils',19)}</div>
      <div class="plc-info"><h3>Kelola Menu</h3><p class="muted" style="margin:0;">Tambah, edit, foto menu &amp; kategori</p></div>
      <div class="plc-arrow">${ic('chevron-right',18)}</div>
    </div>
    <div class="profile-link-card" onclick="goTo('/qr-meja/')">
      <div class="plc-ic">${ic('qr-code',19)}</div>
      <div class="plc-info"><h3>QR Kode Meja</h3><p class="muted" style="margin:0;">Cetak &amp; unduh QR untuk tiap meja</p></div>
      <div class="plc-arrow">${ic('chevron-right',18)}</div>
    </div>

    <div class="section-title">Informasi Toko</div>
    <div class="card">
      <div class="field"><label>Nama toko</label><input id="stName" type="text" value="${escapeHtml(store.name || '')}"></div>
      <div class="field"><label>Deskripsi</label><input id="stDesc" type="text" value="${escapeHtml(store.desc || '')}"></div>
      <div class="field"><label>Kategori toko</label>
        <select id="stCat">${catOptionsHTML(store.category)}</select>
      </div>
      <div class="field">
        <label>Toko kamu paling dekat dengan meja nomor berapa?</label>
        <input id="stNearTable" type="number" min="1" max="30" value="${store.nearTable || ''}" placeholder="contoh: 5">
      </div>
      <p class="faint" style="margin-top:-6px;">Dipakai untuk mengurutkan toko dari yang terdekat saat pembeli scan QR di suatu meja.</p>
      <button class="btn btn-primary" onclick="saveStoreInfo()">Simpan Perubahan</button>
      <p id="stMsg" class="muted" style="margin-top:8px;"></p>
    </div>

    <div class="section-title">QRIS Pembayaran</div>
    <div class="card">
      <p class="muted" style="margin:0 0 10px;">Unggah gambar QRIS toko kamu. Nominal transaksi otomatis disisipkan ke kode ini setiap pembeli checkout, dan tetap bisa dipindai GoPay, OVO, DANA, ShopeePay, atau m-banking apa pun.</p>
      <label class="photo-upload" style="height:150px;" id="qrisPhotoBox">
        <input type="file" accept="image/*" id="qrisPhoto" onchange="uploadQrisPhoto(this)">
        <img id="qrisPhotoPreview" src="${store.qrisImage || ''}" style="${store.qrisImage ? 'display:block;object-fit:contain;background:#fff;' : ''}">
        <span class="ph-ic">${ic('qr-code',20)}</span><span id="qrisPhotoLabel">${store.qrisImage ? 'Ganti gambar QRIS' : 'Unggah gambar QRIS'}</span>
      </label>
      <p id="qrisStatusMsg" class="muted" style="margin-top:8px;">${store.qrisPayload ? ic('check',13)+' Nominal otomatis aktif.' : (store.qrisImage ? 'Gambar tersimpan, tapi belum bisa dibaca otomatis untuk nominal.' : '')}</p>
    </div>

    <div class="section-title">Langganan</div>
    <div class="plan-card ${premium ? 'is-premium' : 'is-free'}">
      <div class="row" style="align-items:flex-start;">
        <div>
          <h3 style="display:flex;align-items:center;gap:6px;">${premium ? ic('crown',18) : ic('store',18)} Paket ${premium ? 'Premium' : 'Gratis'}</h3>
          <p class="muted" style="margin-top:2px;">${premium ? (planExpiryLabel(store) || 'Premium aktif') : `Maksimal ${FREE_MENU_LIMIT} menu aktif.`}</p>
        </div>
        ${premium ? premiumBadge(store) : ''}
      </div>
      <div class="plan-compare">
        <div class="pc-col">
          <h4>Gratis</h4>
          <ul>
            <li>Maks. ${FREE_MENU_LIMIT} menu aktif</li>
            <li>QRIS, foto toko &amp; menu</li>
            <li>Cetak/unduh QR meja</li>
          </ul>
        </div>
        <div class="pc-col pc-premium">
          <h4>${ic('crown',12)} Premium</h4>
          <ul>
            <li>Menu tanpa batas</li>
            <li>Badge Premium di web pembeli</li>
            <li>Semua fitur Gratis</li>
          </ul>
        </div>
      </div>
      <p class="faint" style="margin-top:10px;">Upgrade paket dikelola manual oleh admin alun-alun -- hubungi admin untuk aktivasi Premium.</p>
    </div>

    <div class="section-title">Keamanan Akun</div>
    <div class="card">
      <div class="field"><label>Password baru</label>
        <div class="pwd-wrap">
          <input id="newPass" type="password" placeholder="minimal 6 karakter">
          <button type="button" class="pwd-toggle ic-btn" onclick="togglePwd('newPass', this)">${ic('eye',16)}</button>
        </div>
      </div>
      <button class="btn btn-outline" onclick="changePassword()">Simpan Password Baru</button>
      <p id="passMsg" class="muted" style="margin-top:8px;"></p>
    </div>

    <button class="btn btn-danger" style="margin-top:6px;" onclick="doLogout()">${ic('log-out',16)} Keluar</button>
  </div>`;
  mountIcons();
}

async function uploadAvatarPhoto(input){
  const file = input.files && input.files[0];
  if(!file) return;
  const circle = document.getElementById('avatarCircle');
  const oldHTML = circle.innerHTML;
  circle.innerHTML = `<span style="font-size:11px;">Mengunggah…</span>`;
  try{
    const blob = await resizeImageToBlob(file, 1000, 0.78);
    const url = await sUploadImage(`stores/${SELLER.storeId}/photo.jpg`, blob);
    store.photoURL = url;
    await sSet('store:' + SELLER.storeId, store, true);
    circle.innerHTML = `<img src="${url}" alt="">`;
  }catch(e){
    console.error('Gagal unggah foto profil:', e);
    alert('Gagal mengunggah foto.\n\nPesan error: ' + (e.code || e.message || e) +
      '\n\nKalau errornya menyebut "unauthorized" atau "permission", cek komentar di shared/firebase-config.js bagian Storage Rules.');
    circle.innerHTML = oldHTML;
  }
}

async function uploadQrisPhoto(input){
  const file = input.files && input.files[0];
  if(!file) return;
  const label = document.getElementById('qrisPhotoLabel');
  const preview = document.getElementById('qrisPhotoPreview');
  const statusMsg = document.getElementById('qrisStatusMsg');
  const oldLabel = label.textContent;
  label.textContent = 'Mengunggah…';
  statusMsg.textContent = 'Membaca kode QRIS…';
  previewImageInput(input, 'qrisPhotoPreview');
  preview.style.objectFit = 'contain';
  preview.style.background = '#fff';
  try{
    const payload = await decodeQRISFromFile(file);
    const blob = await resizeImageToBlob(file, 700, 0.85);
    const url = await sUploadImage(`stores/${SELLER.storeId}/qris.jpg`, blob);
    store.qrisImage = url;
    store.qrisPayload = payload || null;
    await sSet('store:' + SELLER.storeId, store, true);
    label.textContent = 'Ganti gambar QRIS';
    statusMsg.innerHTML = payload
      ? ic('check',13) + ' Terbaca! Nominal transaksi akan otomatis terisi untuk pembeli.'
      : 'Gambar tersimpan, tapi kodenya belum terbaca otomatis (coba foto lebih tegak lurus & terang). Pembeli tetap bisa bayar manual dengan mencocokkan nominal.';
    mountIcons();
  }catch(e){
    console.error('Gagal unggah QRIS:', e);
    statusMsg.textContent = '';
    alert('Gagal mengunggah QRIS.\n\nPesan error: ' + (e.code || e.message || e) +
      '\n\nKalau errornya menyebut "unauthorized" atau "permission", cek komentar di shared/firebase-config.js bagian Storage Rules.');
    label.textContent = oldLabel;
  }
}

async function saveStoreInfo(){
  store.name = document.getElementById('stName').value.trim();
  store.desc = document.getElementById('stDesc').value.trim();
  store.category = document.getElementById('stCat').value;
  const nt = Number(document.getElementById('stNearTable').value);
  store.nearTable = nt || null;
  await sSet('store:' + SELLER.storeId, store, true);
  const acc = await sGet('seller:' + SELLER.username, true);
  if(acc){ acc.storeName = store.name; await sSet('seller:' + SELLER.username, acc, true); }
  SELLER.storeName = store.name;
  document.getElementById('stMsg').textContent = 'Tersimpan.';
  render();
}

async function changePassword(){
  const p = document.getElementById('newPass').value;
  const msg = document.getElementById('passMsg');
  if(!p || p.length < 6){ msg.textContent = 'Password minimal 6 karakter.'; return; }
  const acc = await sGet('seller:' + SELLER.username, true);
  if(!acc){ msg.textContent = 'Gagal memuat akun.'; return; }
  acc.password = p;
  await sSet('seller:' + SELLER.username, acc, true);
  msg.textContent = 'Password diperbarui.';
  document.getElementById('newPass').value = '';
}

init();
