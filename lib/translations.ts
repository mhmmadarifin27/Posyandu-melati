export type Language = 'id' | 'en';

export const TRANSLATIONS = {
  id: {
    nav: {
      howItWorks: 'Cara Kerja',
      features: 'Fitur Unggulan',
      faq: 'FAQ',
      documentation: 'Dokumentasi',
      login: 'Login',
    },
    hero: {
      titleLine1: 'Presisi Operasional & Standar Antropometri',
      titleHighlight: 'untuk Transformasi Posyandu',
      subtitle:
        'PosyanduGo mengotomatisasi pemantauan balita standar WHO, rekomendasi menu MBG berbasis SPK (metode SAW), dan pelaporan resmi Puskesmas ke dalam alur kerja cerdas terpadu.',
      ctaPrimary: 'Daftarkan Posyandu',
      ctaSecondary: 'Login',
      badge1: 'e-KMS Balita Tervalidasi',
      badge2: 'Menu MBG Terhitung (SAW)',
      badge3: 'KOP Surat Laporan Otomatis',
    },
    stats: {
      stat1: { number: 'SaaS', title: 'Skala Terbuka', desc: 'Bebas digunakan posyandu mana saja' },
      stat2: { number: '100%', title: 'Standar WHO & Kemenkes', desc: 'Z-Score 4 parameter & sinyal 2T' },
      stat3: { number: 'SAW', title: 'SPK Menu MBG', desc: 'Algoritma perankingan multi-kriteria' },
    },
    howItWorks: {
      title: 'Bagaimana PosyanduGo Bekerja Sebagai Platform SaaS?',
      desc:
        'Dirancang untuk mengatasi fragmentasi data kesehatan keluarga, platform ini menghubungkan Puskesmas dengan seluruh posyandu binaan dalam satu sistem terpusat.',
      card1: {
        tag: 'Unit Operasional Posyandu',
        title: 'Admin Posyandu',
        desc: 'Penggabungan peran Kader & Bidan menjadi satu akun operasional lengkap. Memiliki akses penuh untuk:',
        bullets: [
          'Pencatatan antropometri balita & e-KMS WHO realtime.',
          'Skrining Ibu Hamil KEK, Ibu Menyusui, dan Lansia PTM.',
          'Eksekusi algoritma SAW untuk rekomendasi Menu Bergizi Gratis (MBG).',
          'Cetak laporan bulanan dengan kop surat kustom resmi.',
        ],
      },
      card2: {
        tag: 'Keamanan Data',
        title: 'Isolasi Data (Tenant Scoping)',
        desc: 'Arsitektur multi-tenant memastikan data rekam medis keluarga tetap terlindungi dan terpisah antar posyandu:',
        bullets: [
          'Admin hanya dapat mengakses data warga wilayah kerjanya.',
          'Kop surat otomatis menyesuaikan logo dan profil posyandu.',
          'Posyandu baru dapat didaftarkan mandiri kapan saja.',
        ],
      },
    },
    features: {
      title: 'Solusi Digital Lengkap untuk Posyandu Modern',
      desc:
        'Dari deteksi antropometri standar WHO dan sistem pendukung keputusan rekomendasi MBG berbasis SAW, hingga skrining terpadu bagi ibu hamil dan lansia.',
      items: [
        {
          id: 1,
          number: '01',
          title: 'Antropometri e-KMS & WHO Z-Score',
          headline: 'Plotting Otomatis Kurva Pertumbuhan & Deteksi 2T (Weight Faltering)',
          description:
            'Pencatatan antropometri balita (BB, TB, LiLA, LK) dengan standar WHO Anthro 2006. Sistem secara real-time menghitung z-score BB/U, TB/U, BB/TB, dan IMT/U serta memberikan sinyal dini stunting dan risiko gizi buruk.',
          features: [
            'Kalkulasi Z-Score Otomatis (BB/U, TB/U, BB/TB, IMT/U)',
            'Deteksi Dini Stunting, Wasting, dan Underweight',
            'Notifikasi Otomatis Weight Faltering (2T Tidak Naik)',
            'Rekam Medis Digital Terintegrasi Buku KIA Kemenkes',
          ],
          schedule: 'Pelayanan Balita Bulanan',
          lead: 'Admin Posyandu & Bidan Pembina',
          image: '/images/deteksi_stunting_balita.jpg',
          themeGradient: 'from-white via-[#fff7f8] to-[#ffedf0]',
          ctaText: 'Pelajari Protokol Layanan',
        },
        {
          id: 2,
          number: '02',
          title: 'SPK Rekomendasi Menu MBG (Metode SAW)',
          headline: 'Simple Additive Weighting untuk Penentuan Prioritas Makanan Bergizi Gratis',
          description:
            'Sistem Pendukung Keputusan (SPK) berbasis algoritma Simple Additive Weighting (SAW). Menghitung skor preferensi balita secara objektif berdasarkan kriteria usia rentan, defisit antropometri, kepatuhan posyandu, dan status bansos keluarga.',
          features: [
            'Matriks Keputusan & Normalisasi Otomatis SAW',
            'Pembobotan Kriteria Adaptif (Usia, BB/TB, Kepatuhan, Desil)',
            'Perangkingan Balita Penerima MBG Prioritas Tinggi',
            'Katalog Menu Padat Gizi Protein Hewani Lokal',
          ],
          schedule: 'Evaluasi Berkala Tiap Siklus Posyandu',
          lead: 'Tim Pengambil Keputusan Posyandu & Ahli Gizi',
          image: '/images/galeri_pmt.jpg',
          themeGradient: 'from-white via-[#fff9f6] to-[#fff1ea]',
          ctaText: 'Pelajari Protokol Layanan',
        },
        {
          id: 3,
          number: '03',
          title: 'Skrining Bumil KEK & Lansia PTM',
          headline: 'Pemantauan Kesehatan Terpadu Siklus Hidup Keluarga',
          description:
            'Fasilitas pemantauan ibu hamil dengan skrining Kurang Energi Kronis (LiLA < 23.5 cm) dan anemia, serta skrining Penyakit Tidak Menular (PTM) lansia meliputi tekanan darah, gula darah sewaktu (GDS), dan asam urat.',
          features: [
            'Skrining LiLA & Anemia Ibu Hamil (Pemberian TTD)',
            'Pemantauan ASI Eksklusif bagi Ibu Menyusui',
            'Cek Tekanan Darah & Gula Darah Rutin Lansia',
            'Pencatatan Riwayat Penyakit Degeneratif',
          ],
          schedule: 'Pelayanan Ibu Hamil & Posyandu Lansia',
          lead: 'Bidan Desa & Tenaga Kesehatan Puskesmas',
          image: '/images/dok_bumil_checkup.jpg',
          themeGradient: 'from-white via-[#f7f9fc] to-[#eef4fb]',
          ctaText: 'Pelajari Protokol Layanan',
        },
        {
          id: 4,
          number: '04',
          title: 'Rekapitulasi Wilayah & Laporan Otomatis',
          headline: 'Dashboard Monitoring Puskesmas & Cetak Laporan Kop Standar Resmi',
          description:
            'Super Admin Puskesmas dapat memantau capaian seluruh Posyandu di wilayah kerja dalam satu layar. Laporan bulanan dapat langsung diekspor dan dicetak dalam format A4 resmi dengan Kop Surat dinamis per Posyandu.',
          features: [
            'Dashboard Monitoring Lintas Posyandu Real-Time',
            'Kop Surat & Tanda Tangan Resmi Otomatis Per Posyandu',
            'Cetak Laporan Format A4 & Ekspor Rekapitulasi Data',
            'Audit Kinerja Penimbangan & Cakupan Imunisasi Wilayah',
          ],
          schedule: 'Tersedia Kapan Saja (Real-Time)',
          lead: 'Super Admin Puskesmas & Kepala Posyandu',
          image: '/images/mitra_posyandu.jpg',
          themeGradient: 'from-white via-[#f6faf7] to-[#eaf5ec]',
          ctaText: 'Pelajari Protokol Layanan',
        },
      ],
    },
    faq: {
      title: 'Pertanyaan yang Sering Diajukan',
      desc:
        'Pelajari lebih lanjut mengenai arsitektur SaaS, metode ilmiah SPK SAW, standarisasi antropometri WHO, dan kemudahan penggunaan PosyanduGo.',
      items: [
        {
          question: 'Apa itu PosyanduGo dan siapa saja yang dapat menggunakannya?',
          answer:
            'PosyanduGo adalah platform Software-as-a-Service (SaaS) manajemen posyandu modern yang dirancang untuk mendukung transformasi kesehatan primer di Indonesia. Platform ini terbuka untuk seluruh unit Posyandu di seluruh wilayah Indonesia (baik posyandu mandiri maupun posyandu binaan Puskesmas).',
        },
        {
          question: 'Bagaimana alur pendaftaran unit Posyandu baru di PosyanduGo?',
          answer:
            'Pengurus posyandu dapat mengklik tombol "Daftar Sekarang" dan mengisi formulir terpadu 3-tahap (/daftar) yang mencakup identitas unit, unggah logo resmi untuk KOP surat, wilayah kerja Puskesmas pembina, dan akun admin. Setelah diverifikasi oleh Super Admin Puskesmas, detail kredensial login akan dikonfirmasikan via WhatsApp.',
        },
        {
          question: 'Apakah PosyanduGo mendukung perhitungan e-KMS dan deteksi stunting standar WHO?',
          answer:
            'Ya, PosyanduGo mengadopsi standar baku WHO Anthro 2006 dan standar Kemenkes RI. Sistem secara otomatis menghitung Z-score untuk 4 indeks antropometri (BB/U, TB/U, BB/TB, IMT/U), mengidentifikasi stunting, wasting, underweight, serta memberikan notifikasi dini weight faltering (2T - dua kali penimbangan berturut-turut berat badan tidak naik).',
        },
        {
          question: 'Bagaimana metode Simple Additive Weighting (SAW) bekerja pada Rekomendasi Menu MBG?',
          answer:
            'Algoritma SAW bekerja dengan membentuk matriks keputusan berdasarkan kriteria objektif: usia balita rentan (6–23 bulan), defisit antropometri (BB/TB), kepatuhan penimbangan posyandu, dan status desil kesejahteraan keluarga. Sistem melakukan normalisasi matriks dan pembobotan untuk menghasilkan perankingan balita yang paling membutuhkan intervensi Makanan Bergizi Gratis (MBG).',
        },
        {
          question: 'Apakah laporan bulanan bisa dicetak dengan logo dan KOP surat posyandu kami sendiri?',
          answer:
            'Tentu saja. Logo resmi yang Anda unggah saat pendaftaran (atau diatur di Pengaturan Akun) akan otomatis disematkan pada KOP surat resmi laporan bulanan Puskesmas. Laporan siap dicetak dalam format A4 standar resmi atau diekspor ke format Excel (XLSX).',
        },
        {
          question: 'Apakah akun kader dan bidan masih terpisah?',
          answer:
            'Dalam arsitektur SaaS PosyanduGo, peran operasional kader dan bidan telah dilebur menjadi akun terpadu yaitu Admin Posyandu. Hal ini memudahkan kolaborasi pencatatan di balai posyandu sehingga seluruh data balita, ibu hamil, lansia, dan menu MBG dapat dikelola secara terintegrasi.',
        },
      ],
      ctaTitle: 'Ingin Mendaftarkan Unit Posyandu Anda?',
      ctaDesc:
        'Pendaftaran mandiri terbuka gratis untuk seluruh posyandu di Indonesia. Dilengkapi dukungan logo kustom untuk KOP surat resmi.',
      ctaButton: 'Daftar Sekarang',
    },
    gallery: {
      title: 'Potret Dedikasi Tim Posyandu di Lapangan',
      desc:
        'Suasana pelayanan penimbangan balita, pemberian vitamin A, bimbingan ibu hamil, dan pemeriksaan lansia di jaringan Posyandu binaan Puskesmas.',
    },
    footer: {
      tagline: 'Platform SaaS Manajemen Posyandu Multi-Tenant Terpadu Se-Indonesia',
      aboutTitle: 'Tentang PosyanduGo',
      aboutDesc:
        'PosyanduGo adalah platform SaaS modern untuk manajemen posyandu mandiri dan binaan Puskesmas di seluruh Indonesia. Terintegrasi dengan kalkulasi Z-score standar WHO Anthro 2006, SPK rekomendasi menu MBG metode SAW, dan otomatisasi KOP surat laporan resmi.',
      exploreTitle: 'Jelajahi',
      servicesTitle: 'Layanan',
      copyright:
        '© 2026 PosyanduGo • Platform SaaS Multi-Tenant Pelayanan Posyandu Modern Se-Indonesia. All Rights Reserved.',
      consultButton: 'Konsultasi PosyanduGo',
      links: {
        home: 'Beranda',
        howItWorks: 'Cara Kerja',
        features: 'Fitur Unggulan',
        faq: 'Pertanyaan Umum (FAQ)',
        documentation: 'Dokumentasi Pelayanan',
        registerNow: 'Daftar Sekarang',
        login: 'Login',
        ekms: 'e-KMS Balita (WHO Anthro)',
        saw: 'SPK Menu MBG (Metode SAW)',
        screening: 'Skrining Bumil & Lansia',
        kop: 'KOP Surat Laporan Otomatis',
        dashboard: 'Dashboard Super Admin',
        stunting: 'Deteksi Stunting & Notifikasi 2T',
      },
    },
  },
  en: {
    nav: {
      howItWorks: 'How It Works',
      features: 'Features',
      faq: 'FAQ',
      documentation: 'Gallery',
      login: 'Login',
    },
    hero: {
      titleLine1: 'Operational Precision & Growth Monitoring',
      titleHighlight: 'for Next-Gen Community Health',
      subtitle:
        'PosyanduGo streamlines WHO-standard child growth monitoring, SAW-based supplementary nutrition ranking, and official health center reporting into one intelligent SaaS platform.',
      ctaPrimary: 'Register Posyandu',
      ctaSecondary: 'Login',
      badge1: 'Validated Child Growth e-KMS',
      badge2: 'Nutritional Diet Ranked (SAW)',
      badge3: 'Automated Letterhead Reports',
    },
    stats: {
      stat1: { number: 'SaaS', title: 'Open Scale', desc: 'Available for any community health unit' },
      stat2: { number: '100%', title: 'WHO & MoH Standards', desc: '4-parameter Z-Scores & 2T alert signals' },
      stat3: { number: 'SAW', title: 'DSS Nutrition Plan', desc: 'Multi-criteria priority ranking algorithm' },
    },
    howItWorks: {
      title: 'How PosyanduGo Operates as a Modern SaaS Platform',
      desc:
        'Engineered to eliminate health record fragmentation, connecting community healthcare posts with supervisor clinics in one unified system.',
      card1: {
        tag: 'Posyandu Operational Unit',
        title: 'Posyandu Admin',
        desc: 'Unifying healthcare workers and community midwives into a single collaborative workspace with full access to:',
        bullets: [
          'Real-time WHO child anthropometric data entry and e-KMS growth curves.',
          'Targeted health screenings for pregnant women and elderly patients.',
          'Automated SAW algorithm execution for free nutritional meal program recommendations.',
          'Generate and print monthly reports with official custom letterhead and digital signatures.',
        ],
      },
      card2: {
        tag: 'Data Security',
        title: 'Data Isolation (Tenant Scoping)',
        desc: 'Multi-tenant cloud architecture ensures family medical records remain secure and strictly isolated per posyandu unit:',
        bullets: [
          'Staff can strictly access patient records within their assigned operational area.',
          'Official report letterheads dynamically adapt to the registered posyandu logo and profile.',
          'New posyandu units can register independently anytime with zero downtime.',
        ],
      },
    },
    features: {
      title: 'Comprehensive Digital Solution for Modern Community Healthcare',
      desc:
        'From WHO-standard anthropometric evaluation and SAW-based nutrition decision support, to integrated screenings for mothers and seniors.',
      items: [
        {
          id: 1,
          number: '01',
          title: 'e-KMS Anthropometry & WHO Z-Score',
          headline: 'Automated Growth Curves & 2T Weight Faltering Early Detection',
          description:
            'Child anthropometric monitoring (Weight, Height, Mid-Upper Arm, Head Circumference) based on WHO Anthro 2006. Real-time calculation of W/A, H/A, W/H, and BMI/A Z-scores with early stunting alerts.',
          features: [
            'Automated Z-Score Calculation (W/A, H/A, W/H, BMI/A)',
            'Early Detection of Stunting, Wasting, and Underweight',
            'Automated 2T Weight Faltering Alert Notifications',
            'Integrated Digital Health Record aligned with MoH Standards',
          ],
          schedule: 'Monthly Child Checkup Sessions',
          lead: 'Posyandu Admin & Midwife Supervisor',
          image: '/images/deteksi_stunting_balita.jpg',
          themeGradient: 'from-white via-[#fff7f8] to-[#ffedf0]',
          ctaText: 'Learn Service Protocol',
        },
        {
          id: 2,
          number: '02',
          title: 'Nutrition DSS (SAW Method)',
          headline: 'Simple Additive Weighting for Objective Free Nutritious Meal Prioritization',
          description:
            'Decision Support System using Simple Additive Weighting (SAW). Objectively computes preference scores based on vulnerable age, anthropometric deficit, attendance, and welfare status.',
          features: [
            'Automated SAW Decision Matrix & Normalization',
            'Adaptive Criteria Weighting (Age, W/H, Compliance, Decile)',
            'High-Priority Child Ranking for Nutritional Meal Program',
            'Local High-Protein Nutrient-Dense Menu Catalog',
          ],
          schedule: 'Evaluated Per Posyandu Cycle',
          lead: 'Posyandu Leadership & Nutrition Specialists',
          image: '/images/galeri_pmt.jpg',
          themeGradient: 'from-white via-[#fff9f6] to-[#fff1ea]',
          ctaText: 'Learn Service Protocol',
        },
        {
          id: 3,
          number: '03',
          title: 'Maternal & Senior Health Screening',
          headline: 'Comprehensive Family Lifecycle Wellness Monitoring',
          description:
            'Maternal monitoring with Chronic Energy Deficiency (MUAC < 23.5 cm) and anemia screening, plus non-communicable disease (NCD) checks for seniors including blood pressure, blood glucose, and uric acid.',
          features: [
            'Maternal MUAC & Anemia Screening (Iron Supplementation)',
            'Exclusive Breastfeeding Tracking for Nursing Mothers',
            'Routine Senior Blood Pressure & Random Blood Glucose Checks',
            'Degenerative Disease History Documentation',
          ],
          schedule: 'Maternal & Elderly Healthcare Days',
          lead: 'Village Midwives & Primary Clinic Health Officers',
          image: '/images/dok_bumil_checkup.jpg',
          themeGradient: 'from-white via-[#f7f9fc] to-[#eef4fb]',
          ctaText: 'Learn Service Protocol',
        },
        {
          id: 4,
          number: '04',
          title: 'Regional Audit & Automated Reporting',
          headline: 'Supervisor Clinic Dashboard & Dynamic Letterhead Document Generator',
          description:
            'Super Admins can monitor coverage across all registered posyandu units in one dashboard. Monthly reports can be instantly exported and printed in standard A4 with dynamic letterhead per posyandu.',
          features: [
            'Real-Time Multi-Posyandu Regional Monitoring Dashboard',
            'Automated Official Letterhead & Digital Signatures per Posyandu',
            'Standard A4 Report Printing & Data Recapitulation Export',
            'Weigh-In Performance Audit & Immunization Coverage Tracking',
          ],
          schedule: 'Available 24/7 (Real-Time)',
          lead: 'Primary Clinic Super Admin & Posyandu Heads',
          image: '/images/mitra_posyandu.jpg',
          themeGradient: 'from-white via-[#f6faf7] to-[#eaf5ec]',
          ctaText: 'Learn Service Protocol',
        },
      ],
    },
    faq: {
      title: 'Frequently Asked Questions',
      desc:
        'Learn more about multi-tenant SaaS architecture, SAW scientific decision methods, WHO anthropometric standards, and how to get started with PosyanduGo.',
      items: [
        {
          question: 'What is PosyanduGo and who is it designed for?',
          answer:
            'PosyanduGo is a modern Software-as-a-Service (SaaS) management platform designed to accelerate primary healthcare transformation in Indonesia. It is open to all community health posts (Posyandu) across Indonesia, both independent and clinic-supervised units.',
        },
        {
          question: 'What is the registration workflow for new Posyandu units?',
          answer:
            'Posyandu operators can click "Register Now" and complete the 3-stage form (/daftar) covering unit identity, custom letterhead logo upload, supervising clinic selection, and admin credentials. Upon verification by the Clinic Super Admin, login credentials are confirmed via WhatsApp.',
        },
        {
          question: 'Does PosyanduGo support WHO-standard e-KMS and stunting detection?',
          answer:
            'Yes, PosyanduGo strictly adheres to WHO Anthro 2006 and Indonesian Ministry of Health standards. It automatically computes Z-scores across 4 indices (W/A, H/A, W/H, BMI/A), flags stunting/wasting/underweight, and provides early 2T weight-faltering alerts.',
        },
        {
          question: 'How does Simple Additive Weighting (SAW) work for Free Nutritious Meals (MBG)?',
          answer:
            'The SAW algorithm constructs a normalized decision matrix based on objective criteria: vulnerable age (6–23 months), anthropometric deficit (W/H), posyandu attendance compliance, and family welfare decile, producing an objective priority ranking of children most in need of dietary intervention.',
        },
        {
          question: 'Can monthly reports be printed with our custom posyandu letterhead and logo?',
          answer:
            'Absolutely. The official logo uploaded during registration (or configured in Settings) is automatically rendered on official clinic report letterheads, ready for standard A4 printing or Excel (XLSX) export.',
        },
        {
          question: 'Are health worker (Kader) and midwife (Bidan) accounts still separated?',
          answer:
            'In the PosyanduGo multi-tenant SaaS architecture, operational roles have been unified into a single streamlined Posyandu Admin account, facilitating seamless collaboration during checkup days across child, maternal, elderly, and nutrition data.',
        },
      ],
      ctaTitle: 'Ready to Register Your Posyandu Unit?',
      ctaDesc:
        'Self-registration is free and open to all community healthcare centers across Indonesia, complete with custom letterhead logo integration.',
      ctaButton: 'Register Now',
    },
    gallery: {
      title: 'Dedicated Healthcare Teams in Action',
      desc:
        'Real moments of healthcare workers and midwives conducting monthly weigh-ins, vitamin A distribution, maternal care, and elderly health screenings.',
    },
    footer: {
      tagline: 'Integrated Multi-Tenant Community Healthcare Management SaaS Platform',
      aboutTitle: 'About PosyanduGo',
      aboutDesc:
        'PosyanduGo is a modern SaaS platform designed for independent and clinic-supervised community healthcare posts across Indonesia. Integrated with WHO Anthro 2006 Z-score calculations, SAW nutrition decision support, and automated official report letterheads.',
      exploreTitle: 'Explore',
      servicesTitle: 'Services',
      copyright:
        '© 2026 PosyanduGo • Multi-Tenant Community Healthcare SaaS Platform Indonesia. All Rights Reserved.',
      consultButton: 'Consult PosyanduGo',
      links: {
        home: 'Home',
        howItWorks: 'How It Works',
        features: 'Key Features',
        faq: 'FAQ',
        documentation: 'Gallery & Documentation',
        registerNow: 'Register Now',
        login: 'Login',
        ekms: 'Child e-KMS (WHO Anthro)',
        saw: 'Nutrition DSS (SAW Method)',
        screening: 'Maternal & Senior Screening',
        kop: 'Automated Report Letterhead',
        dashboard: 'Super Admin Dashboard',
        stunting: 'Stunting & 2T Alert Detection',
      },
    },
  },
};
