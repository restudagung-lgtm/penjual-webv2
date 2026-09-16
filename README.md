# Lapak Alun-Alun — Web Penjual

Dashboard untuk penjual/pedagang: kelola menu, pantau pesanan masuk, atur
profil toko + QRIS, dan cetak/unduh QR meja. Tanpa proses build (HTML/CSS/JS
polos) + Firebase (Firestore untuk data, Storage untuk foto).

## Struktur folder

Setiap layar dashboard adalah **halaman HTML sungguhan** di folder sendiri:

```
penjual-web/
├── index.html            halaman utama: masuk / daftar toko baru
├── login.js               skrip untuk index.html
├── menu/
│   ├── index.html         tambah / edit / hapus menu
│   └── menu.js
├── pesanan/
│   ├── index.html         pesanan masuk, ubah status, lihat lokasi pembeli
│   └── pesanan.js
├── toko/
│   ├── index.html         profil toko, foto toko, QRIS, cetak/unduh QR meja
│   └── toko.js
├── ringkasan/
│   ├── index.html         statistik ringkas (pesanan, pendapatan, rating)
│   └── ringkasan.js
└── shared/                 file yang dipakai bersama semua halaman di atas
    ├── firebase-config.js
    ├── storage.js
    ├── utils.js            fungsi bantu umum, ikon, QRIS dinamis, rating, dst.
    ├── categories.js        daftar kategori menu/toko
    ├── auth-guard.js        cek sesi login di tiap halaman dashboard
    ├── nav.js                kerangka topbar + tab bar bawah dashboard
    ├── paths.js              BASE_PATH & fungsi pindah halaman (goTo/pageUrl)
    ├── site-config.js        alamat web PEMBELI
    └── style.css
```

Karena tiap halaman dashboard berdiri sendiri (bukan SPA), setiap halaman
yang butuh login memanggil `requireSellerAuth()` (dari `shared/auth-guard.js`)
di awal skripnya sendiri — kalau sesi tidak ditemukan, otomatis dilempar
balik ke halaman masuk.

## PENTING: `BASE_PATH` di `shared/paths.js`

Karena semua tombol/link di sini memakai path seperti `/menu/`, `/toko/`,
dst., situs ini perlu tahu di subfolder mana dia berjalan kalau di-deploy
lewat **GitHub Pages project site** (`https://username.github.io/nama-repo/`).

Buka `shared/paths.js`:

```js
const BASE_PATH = '/penjual-web';
```

- Kalau nama repo GitHub kamu **persis** `penjual-web`, biarkan seperti itu.
- Kalau beda, ganti jadi `/nama-repo-kamu`.
- Kalau pakai domain sendiri / hosting yang filenya di root, ganti jadi
  string kosong: `const BASE_PATH = '';`

## Setup sebelum dipakai

1. **Firebase**: isi `shared/firebase-config.js` dengan konfigurasi project
   Firebase kamu.
2. **Firebase Storage**: aktifkan di Firebase Console supaya fitur unggah
   foto toko, foto menu, dan QRIS jalan.
3. **Alamat web pembeli**: isi `shared/site-config.js` dengan alamat situs
   pembeli kamu setelah di-deploy (dipakai untuk membuat QR meja).
4. **Deploy**: push folder ini ke repo GitHub, aktifkan GitHub Pages, lalu
   cek `BASE_PATH` di atas sudah cocok dengan nama repo-nya.

## Paket Gratis vs Premium

Toko baru otomatis mulai di paket **Gratis** (maksimal 5 menu aktif). Status
**Premium** (menu tanpa batas + badge di web pembeli) **dikelola manual oleh
admin alun-alun** lewat halaman `/toko/` di web admin — situs ini tidak
tersambung ke payment gateway apa pun, jadi tidak ada tagihan otomatis.
Alurnya: penjual bayar langganan langsung ke pengelola alun-alun (tunai/
transfer di luar sistem), lalu admin menekan tombol "Aktifkan Premium" di
web admin. Aturan & batasnya ada di `shared/plan.js`.

## Retensi nota pesanan (30 hari)

Nota/riwayat pesanan otomatis dihapus setelah 30 hari lewat `shared/cleanup.js`.
Karena situs ini file statis tanpa server sendiri, pembersihan ini berjalan
**setiap kali halaman "Pesanan" dibuka** (dibatasi maksimal sekali tiap 6 jam
per perangkat) — bukan proses latar belakang 24 jam yang jalan sendiri tanpa
ada yang membuka situsnya. Kalau butuh retensi yang benar-benar berjalan
sendiri tanpa bergantung kunjungan, itu perlu Firebase Cloud Functions
berjadwal (paket Blaze) yang di luar cakupan situs statis ini.

## Fitur QRIS dinamis

Saat mengunggah foto QRIS di halaman **Toko & QR**, sistem otomatis mencoba
membaca kode QR di gambar itu (pakai library jsQR). Kalau berhasil terbaca,
nominal transaksi akan otomatis disisipkan setiap kali pembeli checkout —
satu kode ini tetap bisa dipindai GoPay, OVO, DANA, ShopeePay, atau
m-banking apa pun karena semuanya memakai standar QRIS yang sama. Kalau
gambar gagal terbaca (misalnya buram/miring), fitur nominal otomatis tidak
aktif, tapi gambar tetap tersimpan sebagai QRIS statis biasa (pembeli
mencocokkan nominal secara manual).
