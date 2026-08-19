/* ==ROTA-START==
   ROTA TAHTASI — göçün on duraklı HALKASI (ADR-024).
   ---------------------------------------------------------------------
   NE OLDUĞU, ve ne OLMADIĞI. ADR-024 harita/bölüm seçme ekranını açıkça
   yasakladı ("bu oyunda her şey dünyada duran bir nesnedir") ve yerine
   bunu koydu. O yüzden buradaki hiçbir dokunuş bir bölüme GİTMİYOR:

     - Bölüm seçilemez, atlanamaz. Tahta bir KAYIT.
     - Geçilen duraklar çentikli ve ADLI; öndekiler yalnız silüet.
     - Halka kapanınca oyun biter ("tamamlamak" = eve varmak).
     - Çentik ELLE atılır — kışlak töreninin dili.

   NESNE, PANEL DEĞİL (ADR-026'nın şartı). Seçilen nesne: eğrilmiş ahşap
   bir KASNAK. Gerekçesi üç katlı:
     1. Halka zaten ADR-024'ün kendi kelimesi — kasnak halkanın kendisi,
        bir halka RESMİ değil.
     2. Çentik ahşaba atılır; kasnağın kenarı çentiği doğal taşır
        (kışlak tahtasının aynı fiili).
     3. Çoban değneği BİLEREK kullanılmadı — o nesne konak tasarımında
        günün iş haklarına aday (docs/konak-tasarim.md). Aynı nesneye iki
        anlam yüklemek, koyun sanatı turunda ölçülen hatanın aynısı
        olurdu ("benek siluetin içinde, boynuz dışında" ayrımı tam da bu
        yüzden gerekmişti).

   ÜÇ KAYIT ATAMASI: ADR-014 rotayı "YAŞADIĞIN YER"e atadı (takvimle aynı
   kategori). Kuralı: sessiz ama CANLI, gürültü yanlıştır. Bu yüzden bu
   dosya HİÇBİR ses çağırmıyor — onay tıkı, punktüasyon sesi yok.

   ÇİFT KAYNAK YOK. Tahta ilerlemenin kendi kopyasını TUTMAZ; her şeyi
   `Yayla.sefer` ile `Yayla.SEFER`den TÜRETİR. Sakladığı tek durum bir
   JEST'in anlık koordinatı (sürükleme), ki o ilerleme değil parmak.

   ERİŞİLEBİLİRLİK: bu dosya ses üretmiyor, dolayısıyla sessizde hiçbir
   bilgi kaybolmuyor (sahibinin kararı, 2026-08-19).
   ------------------------------------------------------------------ */
'use strict';

const Rota_ = {
  /* Tahta kendi 320x180 alanına çizer; nereye konacağı çağıranın işi. */
  W: 320, H: 180,
  MERKEZ: { x: 160, y: 92 },
  YARICAP: 56,
  KALINLIK: 7,                       // kasnağın et kalınlığı (piksel)

  /* Çentik bıçağının beklediği yer — kasnağın altında, ortada.
     Kışlak töreninin dili: nesne bir yerde DURUR ve hedefe SÜRÜKLENİR. */
  KAYNAK: { x: 160, y: 166 },
  TUT_R: 15,                         // bıçağı tutma yarıçapı
  KON_R: 13,                         // durağa konma yarıçapı

  PAL: {
    ahsap:    '#604342',
    ahsapUst: '#89615a',
    ahsapAlt: '#2e2028',
    oyuk:     '#101018',             // çentiğin kesiği
    dudak:    '#c99474',             // kesiğin ışık alan dudağı
    ad:       '#89615a',             // ad izi — yer tutucu, kısık
    silue:    '#101018',             // öndeki duraklar: yalnız silüet (çukur)
    simdi:    '#F8D878',             // bulunulan durak
    bicak:    '#dfd6c7',             // ağız
    sap:      '#483436',             // bıçağın sapı
    ip:       '#604342',             // asma ipi
  },

  /* ===== GEOMETRİ — saf, durumsuz ===================================
     Durak 1 EN ALTTA (evden çıkılır), sonrası saat yönünde. Böylece
     çıkış bir yandan tırmanır, dönüş öbür yandan iner ve halkanın TEPESİ
     yaylaya denk gelen bölge olur — bolum-haritasi.md'nin "çıkış/iniş
     farkı" bölümünün görsel karşılığı.
     NOT: 10 durak eşit aralıklı (36°) olduğu için Yayla (5) tepenin tam
     kendisine değil, bir adım öncesine düşüyor. Eşitsiz aralık sahibinin
     kararı — raporda KARAR GEREKİR md.2. */
  aci(i, n){
    const adet = n || 10;
    return Math.PI / 2 + (i - 1) * (2 * Math.PI / adet);
  },
  nokta(i, n){
    const a = this.aci(i, n);
    return { x: this.MERKEZ.x + Math.cos(a) * this.YARICAP,
             y: this.MERKEZ.y + Math.sin(a) * this.YARICAP };
  },

  /* ===== DURUM — sefer'den TÜRETİLİR, saklanmaz =====================
     Dönüş: her durak için { i, ad, hal }
       hal: 'gecildi' | 'simdi' | 'ilerde'
     `ad` YALNIZ geçilen ve bulunulan duraklarda dolu; ilerdekiler
     ADR-024 gereği isimsiz (yalnız silüet). */
  durum(sefer, SEFER){
    const liste = SEFER || [];
    const n = liste.length;
    const centik = (sefer && Array.isArray(sefer.centik)) ? sefer.centik : [];
    const simdi = (sefer && sefer.bolum) ? sefer.bolum : 0;
    const out = [];
    for(let i = 1; i <= n; i++){
      const gecildi = centik.indexOf(i) >= 0;
      const hal = gecildi ? 'gecildi' : (i === simdi ? 'simdi' : 'ilerde');
      out.push({
        i,
        ad: (hal === 'ilerde') ? null : ((liste[i - 1] && liste[i - 1].ad) || null),
        hal,
      });
    }
    return out;
  },

  /* Halka kapandı mı — "tamamlamak = eve varmak" (ADR-024). */
  halkaKapandi(sefer, SEFER){
    const n = (SEFER || []).length;
    if(!n || !sefer || !Array.isArray(sefer.centik)) return false;
    return sefer.centik.length >= n;
  },

  /* ===== ÇENTİK TÖRENİ — girdi yolu =================================
     Töreni BU DOSYA BAŞLATMAZ. `Yayla.gunBitir` çentiği zaten sefer'e
     itiyor (tek kaynak orası). Çağıran, töreni oynatırken hangi durağın
     işlendiğini `toren` ile bildirir; tahta yalnız o durağı hedef kabul
     eder. Başka hiçbir durak dokunuşa cevap VERMEZ — "bölüm seçilemez"
     kuralının kodda karşılığı budur.

     Saklanan tek şey `surukle`: bir parmağın anlık yeri. İlerlemenin
     kopyası DEĞİL. */
  surukle: null,                     // { x, y } ya da null

  /* Töreni bekleyen durak; yoksa 0. */
  torenDuragi(sefer, toren){
    const t = toren | 0;
    if(!t || !sefer || !Array.isArray(sefer.centik)) return 0;
    return sefer.centik.indexOf(t) >= 0 ? t : 0;   // yalnız KAZANILMIŞ çentik törenle atılır
  },

  tut(x, y, sefer, toren){
    if(!this.torenDuragi(sefer, toren)) return false;
    const d = Math.hypot(x - this.KAYNAK.x, y - this.KAYNAK.y);
    if(d > this.TUT_R) return false;
    this.surukle = { x, y };
    return true;
  },
  tasi(x, y){
    if(!this.surukle) return false;
    this.surukle.x = x; this.surukle.y = y;
    return true;
  },
  /* Bırakma. Dönüş: { kondu, durak }.
     Hedefi tutturamayan jest bıçağı kaynağına geri bırakır — kışlak
     töreninin dersi: jest yarıda kalırsa oyun KİLİTLENMEMELİ. */
  birak(x, y, sefer, toren, SEFER){
    if(!this.surukle) return { kondu: false, durak: 0 };
    this.surukle = null;
    const t = this.torenDuragi(sefer, toren);
    if(!t) return { kondu: false, durak: 0 };
    const p = this.nokta(t, (SEFER || []).length || 10);
    const d = Math.hypot(x - p.x, y - p.y);
    return d <= this.KON_R ? { kondu: true, durak: t } : { kondu: false, durak: 0 };
  },
  iptal(){ this.surukle = null; },

  /* ===== ÇİZİM ======================================================
     Yalnız fillStyle/fillRect kullanır: hem gerçek 2D bağlamda hem
     tools/pixcanvas.js'te çalışsın diye (araç bu sayede kareyi başsız
     basabiliyor).

     opts.yaz(g, metin, x, y, renk) — İSTEĞE BAĞLI yazı geri çağrımı.
     Oyunun kendi yazı yolu index.html'de ve orası bu oturumun bölgesi
     değil; verilmezse durak adı yerine oyulmuş bir ETİKET plakası
     çizilir, harfler sonra takılır. (Rapor: teslim notu md.1) */
  ciz(g, sefer, SEFER, opts){
    const o = opts || {};
    const liste = SEFER || [];
    const n = liste.length || 10;
    const P = this.PAL;
    const d = this.durum(sefer, liste);

    this.cizKasnak(g, n);

    for(const s of d){
      const p = this.nokta(s.i, n);
      if(s.hal === 'ilerde'){ this.cizSilue(g, p.x, p.y); continue; }   // ad YOK
      if(s.hal === 'gecildi'){
        this.cizCentik(g, p.x, p.y);
        this.cizAd(g, s.ad, p.x, p.y, o.yaz, P.ad);
      } else {
        /* Bulunulan durak: çentik YOK (henüz geçilmedi), ama canlı.
           "Sessiz ama CANLI" — parlak tek nokta, gürültü değil. */
        this.px(g, p.x - 1, p.y - 1, 3, 3, P.simdi);
        this.cizAd(g, s.ad, p.x, p.y, o.yaz, P.ad);
      }
    }

    /* Tören bekliyorsa: hedef durakta OYUK (henüz kesilmemiş iz) ve
       kaynağında bıçak. Sürükleme varsa bıçak parmakta. */
    const t = this.torenDuragi(sefer, o.toren);
    if(t){
      const p = this.nokta(t, n);
      this.px(g, p.x - 2, p.y - 2, 4, 4, P.ahsapAlt);      // kesilecek yer işaretli
      const b = this.surukle || this.KAYNAK;
      this.cizBicak(g, b.x, b.y);
    }
    return true;
  },

  /* Kasnağın kendisi — İKİNCİ YAZIM.
     Birincisi basıldı ve BAKILDI: ince bir tel çember gibi okunuyordu,
     ahşap değil. ADR-026'nın şartı "panel değil NESNE" ve tel çember bir
     şema, nesne değil. Üç düzeltme:
       1. Et kalınlaştı (4 -> 7) ve kalınlık boyunca TONLANIYOR: ortası
          açık, iki kenarı koyu — yuvarlak bir çıtanın ışık alışı.
       2. Işık YÖNÜ var: halkanın üstü açık, altı koyu (oyunun güneşi
          yukarıdan).
       3. Tepeden bir İP çıkıyor — kasnak havada durmuyor, ASILI. Nesne
          olmasını sağlayan şeylerden biri bu.
     Ahşap rampası dünyanın kendi paletinden: 2e2028 / 483436 / 604342 /
     89615a. */
  AHSAP: ['#2e2028', '#483436', '#604342', '#89615a'],

  cizKasnak(g, n){
    const R = this.YARICAP, yari = (this.KALINLIK - 1) / 2;
    const adim = 1 / (R * 3);
    for(let a = 0; a < Math.PI * 2; a += adim){
      const ca = Math.cos(a), sa = Math.sin(a);
      /* Işık: üst taraf (sa<0) bir kademe açık, alt taraf bir kademe koyu. */
      const isik = sa < -0.35 ? 1 : (sa > 0.35 ? -1 : 0);
      for(let k = -yari; k <= yari; k++){
        /* Kalınlık boyunca: ortada açık, kenarda koyu. */
        const et = 2 - Math.min(2, Math.abs(k));
        const i = Math.max(0, Math.min(this.AHSAP.length - 1, et + isik));
        this.px(g, this.MERKEZ.x + ca * (R + k), this.MERKEZ.y + sa * (R + k), 1, 1, this.AHSAP[i]);
      }
    }
    /* Asma ipi: tepeden yukarı. */
    const tepe = this.MERKEZ.y - R - yari;
    this.px(g, this.MERKEZ.x, Math.max(0, tepe - 10), 1, 10, this.PAL.ip);
  },

  /* Çentik — İKİNCİ YAZIM. Birincisi kenarın ÜSTÜNE 2x6 koyu bir çubuk
     koyuyordu ve kenar zaten koyu olduğu için KAYBOLUYORDU (basılıp
     bakıldı). Şimdi çentik kasnağın etini GERÇEKTEN kesiyor: dıştan içe
     doğru radyal bir oyuk, ve kesiğin bir dudağında ışık.
     Kısaca: çentik kenarın üstüne çizilen bir işaret değil, kenardan
     ALINAN bir parça. */
  cizCentik(g, x, y){
    const a = Math.atan2(y - this.MERKEZ.y, x - this.MERKEZ.x);
    const ca = Math.cos(a), sa = Math.sin(a);
    const px = -sa, py = ca;                       // teğet (kesiğin genişliği)
    const R = this.YARICAP, yari = (this.KALINLIK - 1) / 2;
    for(let k = -yari - 1; k <= yari; k++){
      const bx = this.MERKEZ.x + ca * (R + k), by = this.MERKEZ.y + sa * (R + k);
      this.px(g, bx - px, by - py, 1, 1, this.PAL.oyuk);
      this.px(g, bx,      by,      1, 1, this.PAL.oyuk);
      this.px(g, bx + px, by + py, 1, 1, this.PAL.dudak);   // kesiğin ışık alan dudağı
    }
  },

  /* İlerdeki durak — yalnız SİLÜET. Birinci yazımda '#483436' kullandım
     ve kasnağın kendi tonuna çok yakın olduğu için karede HİÇ
     görünmüyordu. Artık en koyu tonla, etin ortasına oturan bir çukur. */
  cizSilue(g, x, y){
    const a = Math.atan2(y - this.MERKEZ.y, x - this.MERKEZ.x);
    const ca = Math.cos(a), sa = Math.sin(a), R = this.YARICAP;
    /* ÜÇÜNCÜ değer denemesi. '#483436' ve '#2e2028' ikisi de kasnağın
       kendi kenar tonlarıyla aynıydı ve karede HİÇ görünmüyordu — iki
       kez basılıp bakılarak elendi. Şimdi dünyanın dip rengi (#101018)
       ve etin AÇIK ortasına oturuyor, yani en yüksek kontrastlı yere.
       Çentikten hâlâ açıkça daha az: çentik eti baştan sona kesiyor ve
       ışıklı dudağı var, silüet yalnız bir çukur. */
    for(let k = -1; k <= 1; k++)
      this.px(g, this.MERKEZ.x + ca * (R + k), this.MERKEZ.y + sa * (R + k), 1, 1, this.PAL.silue);
  },

  /* Durak adı. Yazı geri çağrımı yoksa OYULMUŞ İZ çizilir.
     Birinci yazımda plaka 5 piksel kalın ve 34 piksele kadar uzundu;
     karede kasnaktan daha gürültülü çıkıyor, anten gibi havada
     duruyordu. Şimdi: kenara DEĞEN kısa bir tırnak + ince bir alt çizgi.
     Yer tutucu kahramanın önüne geçmemeli. */
  cizAd(g, ad, x, y, yaz, renk){
    if(!ad) return;
    const disari = (x < this.MERKEZ.x) ? -1 : 1;
    const ex = x + disari * (this.KALINLIK / 2 + 2), ey = y;
    if(typeof yaz === 'function'){ yaz(g, ad, ex, ey, renk); return; }
    const w = Math.min(18, 5 + ad.length);
    const x0 = disari < 0 ? ex - w : ex;
    this.px(g, x0, ey, w, 1, this.PAL.ad);                 // ince iz
  },

  /* Bıçak — kaynağında ya da parmakta. Birinci yazımda 2x6 düz bir
     çubuktu ve "bıçak" okunmuyordu; şimdi sap + ağız. */
  cizBicak(g, x, y){
    this.px(g, x, y + 2, 1, 4, this.PAL.sap);              // sap
    this.px(g, x, y - 3, 1, 5, this.PAL.bicak);            // ağız
    this.px(g, x - 1, y - 3, 1, 3, this.PAL.bicak);
  },

  /* Tek çizim ilkesi — tam sayıya oturur (yarım piksel bulanıklığı yok). */
  px(g, x, y, w, h, renk){
    g.fillStyle = renk;
    g.fillRect(Math.round(x), Math.round(y), Math.max(1, Math.round(w)), Math.max(1, Math.round(h)));
  },
};

/* Tek sembol (ADR-018 deseni: yayla.js ile aynı). */
const Rota = Rota_;

/* Başsız araç bu dosyayı doğrudan yükleyebilsin diye. Tarayıcıda
   `module` tanımsız olduğu için bu satır orada hiçbir şey yapmaz;
   build.js harici script'i satır içine gömerken de zararsız. */
if (typeof module !== 'undefined' && module.exports) module.exports = Rota;
/* ==ROTA-END== */
