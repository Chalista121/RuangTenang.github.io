(function () {
  'use strict';

  // ===== Pengaturan: ganti sesuai kebutuhan =====
  var WA_NUMBER = '6282135888462'; // format internasional tanpa + atau 0 di depan
  var BRAND = 'RuangTenang';

  function waLink(text) {
    return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(text);
  }

  // Tahun di footer
  document.getElementById('year').textContent = new Date().getFullYear();

  // Tombol WhatsApp melayang
  document.getElementById('waFloat').href = waLink('Halo ' + BRAND + ', saya ingin bertanya tentang konsultasi psikolog online.');

  // ===== Header: bayangan saat scroll =====
  var header = document.getElementById('header');
  function onScroll() {
    header.classList.toggle('scrolled', window.scrollY > 10);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ===== Menu mobile =====
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');
  function setMenu(open) {
    nav.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
  }
  burger.addEventListener('click', function () {
    setMenu(burger.getAttribute('aria-expanded') !== 'true');
  });
  nav.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') setMenu(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setMenu(false);
  });

  // ===== Form booking -> WhatsApp =====
  var form = document.getElementById('booking');
  var nama = document.getElementById('nama');
  var telepon = document.getElementById('telepon');
  var topik = document.getElementById('topik');
  var ahli = document.getElementById('ahli');
  var tanggal = document.getElementById('tanggal');
  var pilihTanggal = document.getElementById('pilihTanggal');
  var labelTanggal = document.getElementById('labelTanggal');
  var paket = document.getElementById('paket');
  var waktu = document.getElementById('waktu');
  var statusTanggal = document.getElementById('statusTanggal');
  var statusPaket = document.getElementById('statusPaket');
  var statusWaktu = document.getElementById('statusWaktu');
  var error = document.getElementById('error');
  var kalender = document.getElementById('kalender');
  var bulanKalender = document.getElementById('bulanKalender');
  var hariKalender = document.getElementById('hariKalender');
  var bulanLalu = document.getElementById('bulanLalu');
  var bulanDepan = document.getElementById('bulanDepan');
  var tanggalBulan;
  var paketPilihan = '';
  var fieldError;

  // Hari mengikuti getUTCDay(): Minggu = 0. Jam praktik menggunakan WIB.
  var konsultan = [
    { id: 'anindya', nama: 'Anindya R., M.Psi., Psikolog', topik: ['cemas', 'stres', 'sedih', 'lainnya'], hari: [1, 2, 3, 4, 5], mulai: 9, selesai: 17 },
    { id: 'dimas', nama: 'Dimas P., M.Psi., Psikolog', topik: ['anak'], hari: [2, 3, 4, 5, 6], mulai: 10, selesai: 18 },
    { id: 'sekar', nama: 'Sekar M., M.Psi., Psikolog', topik: ['keluarga'], hari: [1, 2, 3, 4, 5, 6], mulai: 13, selesai: 21 },
    { id: 'raka', nama: 'dr. Raka Pratama, Sp.KJ', topik: ['cemas', 'stres', 'sedih'], hari: [1, 2, 3, 4], mulai: 8, selesai: 15 },
    { id: 'maya', nama: 'dr. Maya Kusuma, Sp.KJ', topik: ['anak'], hari: [3, 4, 5, 6], mulai: 9, selesai: 16 },
    { id: 'bayu', nama: 'dr. Bayu Santoso, Sp.KJ', topik: ['adiksi'], hari: [1, 2, 3, 4, 5], mulai: 15, selesai: 21 },
    { id: 'tiara', nama: 'dr. Tiara Wulandari, Sp.KJ', topik: ['fisik', 'stres', 'cemas'], hari: [2, 3, 4, 5], mulai: 10, selesai: 17 },
    { id: 'hendra', nama: 'dr. Hendra Wijaya, Sp.S', topik: ['tidur'], hari: [1, 2, 3], mulai: 8, selesai: 14 },
    { id: 'nadia', nama: 'dr. Nadia Safitri, Sp.KJ', topik: ['perinatal', 'sedih'], hari: [4, 5, 6, 0], mulai: 9, selesai: 17 }
  ];
  var durasiPaket = {
    'Sesi tunggal (60 menit)': 60,
    'Paket 4 sesi': 60,
    'Konseling pasangan': 90
  };

  // Isi dari jadwal admin. Format: { raka: { 'YYYY-MM-DD': ['08:00', '10:00', '12:30'] } }.
  // Satu jam mulai yang terisi diblokir untuk semua paket.
  var sesiTerisi = {};
  var jamWib = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
  });
  var formatHari = new Intl.DateTimeFormat('id-ID', {
    timeZone: 'UTC', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });
  var formatBulan = new Intl.DateTimeFormat('id-ID', {
    timeZone: 'UTC', month: 'long', year: 'numeric'
  });

  function sekarangWib() {
    var bagian = {};
    jamWib.formatToParts(new Date()).forEach(function (part) { bagian[part.type] = part.value; });
    return {
      tanggal: bagian.year + '-' + bagian.month + '-' + bagian.day,
      menit: Number(bagian.hour) * 60 + Number(bagian.minute)
    };
  }

  function hariDariIso(iso) {
    return new Date(iso + 'T00:00:00Z');
  }

  function formatJam(menit) {
    return String(Math.floor(menit / 60)).padStart(2, '0') + ':' + String(menit % 60).padStart(2, '0');
  }

  function namaPilihan(select) {
    return select.selectedOptions[0].textContent;
  }

  function konsultanTerpilih() {
    return konsultan.find(function (orang) {
      return orang.id === ahli.value && orang.topik.includes(topik.value);
    });
  }

  function jadwalHarian(orang, iso, sekarang) {
    if (!orang || !iso || iso < sekarang.tanggal) return { status: 'lewat', sesi: [] };
    if (!orang.hari.includes(hariDariIso(iso).getUTCDay())) return { status: 'libur', sesi: [] };

    var rentang = (orang.selesai - orang.mulai) * 60;
    // Bagi jam praktik menjadi tiga blok dan gunakan awal setiap blok.
    var mulai = [0, 1, 2].map(function (i) {
      return orang.mulai * 60 + Math.floor(i * rentang / 90) * 30;
    });
    if (iso === sekarang.tanggal) {
      mulai = mulai.filter(function (menit) { return menit > sekarang.menit; });
    }
    if (!mulai.length) return { status: 'lewat', sesi: [] };

    var terisi = (sesiTerisi[orang.id] || {})[iso] || [];
    var kosong = mulai.filter(function (menit) { return !terisi.includes(formatJam(menit)); });
    return { status: kosong.length ? 'tersedia' : 'penuh', sesi: kosong };
  }

  function isiKonsultan() {
    ahli.replaceChildren(new Option(topik.value ? 'Pilih konsultan' : 'Pilih tipe masalah dulu', ''));
    ahli.disabled = !topik.value;
    konsultan.filter(function (orang) { return orang.topik.includes(topik.value); })
      .forEach(function (orang) { ahli.add(new Option(orang.nama, orang.id)); });
    ubahKonsultan();
  }

  function ubahKonsultan() {
    tanggal.value = '';
    pilihTanggal.disabled = !konsultanTerpilih();
    labelTanggal.textContent = pilihTanggal.disabled ? 'Pilih konsultan dulu' : 'Buka kalender';
    statusTanggal.textContent = '';
    perbaruiPaket();
  }

  function perbaruiPaket() {
    var jadwal = jadwalHarian(konsultanTerpilih(), tanggal.value, sekarangWib());
    paket.disabled = !tanggal.value || jadwal.status !== 'tersedia';
    paket.value = paket.disabled ? '' : paketPilihan;
    perbaruiWaktu();
  }

  function perbaruiWaktu() {
    var jadwal = jadwalHarian(konsultanTerpilih(), tanggal.value, sekarangWib());
    var durasi = durasiPaket[paket.value];
    waktu.replaceChildren(new Option(durasi ? 'Pilih waktu sesi' : 'Pilih paket sesi dulu', ''));
    waktu.disabled = !durasi || !jadwal.sesi.length;
    statusPaket.textContent = paket.value === 'Paket 4 sesi'
      ? 'Tanggal dan waktu ini untuk sesi pertama. Tiga sesi berikutnya diatur bersama admin.'
      : paketPilihan && paket.disabled ? 'Paket sudah dipilih dan akan terisi setelah tanggal tersedia dipilih.' : '';
    statusWaktu.textContent = waktu.disabled ? '' : jadwal.sesi.length + ' pilihan waktu tersedia.';
    if (waktu.disabled) return;
    jadwal.sesi.forEach(function (mulai) {
      var label = formatJam(mulai) + '–' + formatJam(mulai + durasi) + ' WIB';
      waktu.add(new Option(label, formatJam(mulai)));
    });
  }

  function pilihHari(iso) {
    tanggal.value = iso;
    labelTanggal.textContent = formatHari.format(hariDariIso(iso));
    var jadwal = jadwalHarian(konsultanTerpilih(), iso, sekarangWib());
    statusTanggal.textContent = {
      penuh: 'Penuh. Semua sesi yang tersisa pada tanggal ini sudah terisi. Pilih tanggal lain.',
      libur: 'Konsultan tidak praktik pada tanggal ini. Pilih tanggal lain.',
      lewat: 'Jam praktik pada tanggal ini sudah lewat. Pilih tanggal lain.',
      tersedia: 'Tanggal ini memiliki pilihan sesi.'
    }[jadwal.status];
    statusTanggal.classList.toggle('booking-unavailable', jadwal.status !== 'tersedia');
    perbaruiPaket();
  }

  function tampilkanBulan() {
    var sekarang = sekarangWib();
    var orang = konsultanTerpilih();
    var tahun = tanggalBulan.getUTCFullYear();
    var bulan = tanggalBulan.getUTCMonth();
    var jumlahHari = new Date(Date.UTC(tahun, bulan + 1, 0)).getUTCDate();
    var offset = (tanggalBulan.getUTCDay() + 6) % 7;
    bulanKalender.textContent = formatBulan.format(tanggalBulan);
    bulanLalu.disabled = tanggalBulan.toISOString().slice(0, 7) <= sekarang.tanggal.slice(0, 7);
    hariKalender.replaceChildren();
    for (var i = 0; i < offset; i++) hariKalender.append(document.createElement('span'));
    for (var hari = 1; hari <= jumlahHari; hari++) {
      var date = new Date(Date.UTC(tahun, bulan, hari));
      var iso = date.toISOString().slice(0, 10);
      var jadwal = jadwalHarian(orang, iso, sekarang);
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'calendar-day';
      button.dataset.tanggal = iso;
      button.disabled = jadwal.status === 'lewat' || jadwal.status === 'libur';
      button.setAttribute('aria-label', formatHari.format(date) + ', ' + jadwal.status);
      button.setAttribute('aria-pressed', String(iso === tanggal.value));
      button.textContent = hari;
      if (jadwal.status === 'penuh') {
        button.classList.add('calendar-full');
        var badge = document.createElement('small');
        badge.textContent = 'Penuh';
        button.append(badge);
      }
      hariKalender.append(button);
    }
  }

  function geserBulan(jarak) {
    tanggalBulan.setUTCMonth(tanggalBulan.getUTCMonth() + jarak);
    tampilkanBulan();
    if (bulanLalu.disabled && document.activeElement === bulanLalu) bulanDepan.focus();
  }

  pilihTanggal.addEventListener('click', function () {
    if (!konsultanTerpilih()) return;
    tanggalBulan = hariDariIso((tanggal.value || sekarangWib().tanggal).slice(0, 7) + '-01');
    tampilkanBulan();
    kalender.showModal();
  });
  bulanLalu.addEventListener('click', function () { geserBulan(-1); });
  bulanDepan.addEventListener('click', function () { geserBulan(1); });
  document.getElementById('tutupKalender').addEventListener('click', function () { kalender.close(); });
  hariKalender.addEventListener('click', function (e) {
    var hari = e.target.closest('button[data-tanggal]');
    if (!hari || hari.disabled) return;
    pilihHari(hari.dataset.tanggal);
    clearError();
    kalender.close();
  });

  function clearError() {
    if (fieldError) fieldError.removeAttribute('aria-invalid');
    fieldError = null;
    error.hidden = true;
  }

  function showError(msg, field) {
    clearError();
    error.textContent = msg;
    error.hidden = false;
    fieldError = field;
    field.setAttribute('aria-invalid', 'true');
    field.focus();
  }

  form.addEventListener('input', clearError);
  topik.addEventListener('change', isiKonsultan);
  ahli.addEventListener('change', ubahKonsultan);
  paket.addEventListener('change', function () {
    paketPilihan = paket.value;
    perbaruiWaktu();
  });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = nama.value.trim();
    var nomor = telepon.value.trim().replace(/[\s().-]/g, '');
    var orang = konsultanTerpilih();
    if (!name) return showError('Isi nama panggilan dulu ya.', nama);
    if (!/^\+?\d{8,15}$/.test(nomor)) return showError('Masukkan nomor telepon yang valid.', telepon);
    if (!topik.value) return showError('Pilih tipe masalah yang ingin dibahas.', topik);
    if (!orang) return showError('Pilih konsultan yang sesuai dengan tipe masalahmu.', ahli);
    if (!tanggal.value) return showError('Pilih tanggal sesi pertama dari kalender.', pilihTanggal);
    var jadwal = jadwalHarian(orang, tanggal.value, sekarangWib());
    if (jadwal.status !== 'tersedia') {
      pilihHari(tanggal.value);
      return showError('Pilih tanggal lain yang masih memiliki sesi.', pilihTanggal);
    }
    if (!durasiPaket[paket.value]) return showError('Pilih paket sesi.', paket);
    if (!jadwal.sesi.some(function (menit) { return formatJam(menit) === waktu.value; })) {
      perbaruiWaktu();
      return showError('Pilih waktu sesi yang masih tersedia.', waktu);
    }
    clearError();

    var pesan =
      'Halo ' + BRAND + ', saya ' + name + '.\n' +
      'Nomor telepon: ' + nomor + '\n' +
      'Topik: ' + namaPilihan(topik) + '\n' +
      'Psikolog/Dokter: ' + orang.nama + '\n' +
      'Tanggal sesi pertama: ' + formatHari.format(hariDariIso(tanggal.value)) + '\n' +
      'Paket: ' + paket.value + '\n' +
      'Waktu: ' + namaPilihan(waktu) + '\n' +
      'Mohon konfirmasi jadwalnya, terima kasih.';
    window.open(waLink(pesan), '_blank', 'noopener');
  });

  function bukaForm() {
    clearError();
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    nama.focus({ preventScroll: true });
  }

  document.querySelectorAll('[data-paket]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      paketPilihan = btn.dataset.paket;
      perbaruiPaket();
      bukaForm();
    });
  });

  document.querySelectorAll('[data-ahli]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var orang = konsultan.find(function (item) { return item.nama === btn.dataset.ahli; });
      if (!orang) return;
      if (!orang.topik.includes(topik.value)) {
        topik.value = orang.topik[0];
        isiKonsultan();
      }
      if (ahli.value !== orang.id) {
        ahli.value = orang.id;
        ubahKonsultan();
      }
      bukaForm();
    });
  });

  // ===== Posisi panel profil berdasarkan ruang di sekitar kartu =====
  var team = document.querySelector('.team');

  function clamp(value, min, max) {
    return Math.max(min, Math.min(value, max));
  }

  function positionProfile(card) {
    var pop = card.querySelector('.pop');
    var rect = card.getBoundingClientRect();
    var viewport = document.documentElement;
    var gap = 8;
    var margin = 12;
    var viewportTop = header.getBoundingClientRect().bottom + margin;
    var viewportBottom = viewport.clientHeight - margin;
    var right = viewport.clientWidth - margin - rect.right - gap;
    var left = rect.left - gap - margin;
    var sideSpace = Math.floor(Math.max(right, left));
    var preferredWidth = Math.min(320, Math.floor(viewport.clientWidth * 0.88));
    var fitsBeside = sideSpace >= 248;
    var width = fitsBeside ? Math.min(preferredWidth, sideSpace) : preferredWidth;
    pop.style.setProperty('--pop-width', width + 'px');
    var height = pop.offsetHeight;
    var centerX = rect.left + rect.width / 2;
    var centerY = rect.top + rect.height / 2;
    var side, x, y, arrow;

    if (fitsBeside) {
      side = right >= left ? 'right' : 'left';
      x = side === 'right' ? rect.right + gap : rect.left - width - gap;
      y = centerY - height / 2;
      if (rect.bottom > viewportTop && rect.top < viewportBottom) {
        y = clamp(y, viewportTop, viewportBottom - height);
      }
      arrow = clamp(centerY - y, 14, height - 14);
    } else {
      var below = viewportBottom - rect.bottom - gap;
      var above = rect.top - gap - viewportTop;
      side = below >= height || below >= above ? 'below' : 'above';
      x = clamp(centerX - width / 2, margin, viewport.clientWidth - width - margin);
      y = side === 'below' ? rect.bottom + gap : rect.top - height - gap;
      arrow = clamp(centerX - x, 14, width - 14);
    }

    pop.dataset.side = side;
    pop.style.setProperty('--pop-left', (x - rect.left - card.clientLeft) + 'px');
    pop.style.setProperty('--pop-top', (y - rect.top - card.clientTop) + 'px');
    pop.style.setProperty('--pop-arrow', arrow + 'px');
  }

  team.querySelectorAll('.pro').forEach(function (card) {
    function showProfile() {
      card.classList.remove('pop-dismissed');
      positionProfile(card);
    }

    card.addEventListener('pointerenter', showProfile);
    card.addEventListener('focusin', showProfile);
    card.addEventListener('click', function (e) {
      if (window.matchMedia('(hover: none)').matches && !e.target.closest('button, .pop')) {
        card.focus({ preventScroll: true });
        showProfile();
      }
    });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    team.querySelectorAll('.pro:hover, .pro:focus-within').forEach(function (card) {
      card.classList.add('pop-dismissed');
    });
  });

  var profileFrame;
  function refreshProfiles() {
    if (profileFrame) return;
    profileFrame = requestAnimationFrame(function () {
      profileFrame = null;
      team.querySelectorAll('.pro:hover, .pro:focus-within').forEach(positionProfile);
    });
  }

  window.addEventListener('resize', refreshProfiles);
  window.addEventListener('scroll', refreshProfiles, { passive: true });

  // ===== FAQ accordion =====
  var items = document.querySelectorAll('.faq-item');
  items.forEach(function (item) {
    var q = item.querySelector('.faq-q');
    q.addEventListener('click', function () {
      var willOpen = !item.classList.contains('open');
      items.forEach(function (other) {
        other.classList.remove('open');
        other.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
      });
      if (willOpen) {
        item.classList.add('open');
        q.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // ===== Hitung angka statistik saat terlihat =====
  var counters = document.querySelectorAll('[data-count]');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function format(n) {
    return n.toLocaleString('id-ID');
  }
  function run(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    var suffix = el.getAttribute('data-suffix') || '';
    if (reduce) { el.textContent = format(target) + suffix; return; }
    var start = null, dur = 1400;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = format(Math.round(target * eased)) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { run(en.target); obs.unobserve(en.target); }
      });
    }, { threshold: 0.4 });
    counters.forEach(function (c) { io.observe(c); });
  } else {
    counters.forEach(run);
  }
})();
