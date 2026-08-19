/* ==KONAK-START==
   KONAK EKRANI — günün işleri ve kalan iş hakkı.
   ---------------------------------------------------------------------
   TASARIM ONAYLI: docs/konak-tasarim.md §3 "Öneri B — kanca sırası".
   Kanca hattı hem işleri hem tükenmeyi TEK sistemle anlatıyor; ölçülmüş
   emsali Wingspan'in eylem küpü / Inscryption'ın sönen mumu ("boşalan yer
   sayılır, rakam yazılmaz").

   ÜÇ KAYIT (ADR-014): konak = **yaşadığın yer** — ağılın devamı, "sessiz
   ama CANLI, gürültü yanlıştır". Bu yüzden burada ses YOK, onay tıkı YOK,
   ve hiçbir sayı ekrana yazılmıyor: her şey bir NESNENİN hâli.

   ERİŞİLEBİLİRLİK (sahibinin kararı): bilgi görselde. Bu dosya ses
   çağırmıyor; sessizde hiçbir şey kaybolmuyor.

   ÇİFT KAYNAK YOK: ekran hiçbir şeyin kopyasını tutmaz, her şeyi
   `Yayla`dan TÜRETİR (yuvaKalan, sagimBugun, kirkimYapildi, bahce,
   egitim, kiler, odun). Sakladığı tek şey bir parmağın anlık yeri.

   NEDEN "YAPILAMAZ" DA GÖRÜNÜYOR — üç ayrı sebep, üç ayrı görüntü
   (Stardew'ün crab pot kuralı: tek nesne, üç çizim, sıfır menü):
     · İş bu konakta YOK      -> kanca boş, aletin SİLÜETİ duruyor
     · İş bugün BİTTİ         -> alet asılı ama sönük/kullanılmış
     · YUVA kalmadı           -> aletlerin hepsi soluyor, gün bitti
   Üçü birbirine benzemiyor, yani "neden yapamıyorum" sorusu tek bakışta
   cevaplanıyor.
   ------------------------------------------------------------------ */
'use strict';

const Konak_ = {
  W: 320, H: 180,

  /* Kanca hattı — saçak altı. */
  /* İKİNCİ ÖLÇÜ. Birinci basımda hat 58->262 idi ve aletler 9-11 piksellik
     lekeler hâlinde okunmuyordu: 190 piksele altı alet, yani araları
     boyutlarının üç katı — sahne "asılı aletler" değil "uzak noktalar"
     gibi duruyordu. Hat kısaldı, aletler büyüdü. */
  HAT: { x0: 74, x1: 230, y: 44 },
  ALET_Y: 52,                       // aletlerin asıldığı üst kenar
  /* Çoban değneği: günün iş HAKLARI burada. Rota tahtası kasnağı aldı,
     değnek konağa kaldı — aynı nesneye iki anlam yüklenmedi. */
  /* YER ÇAKIŞMAYA GÖRE SEÇİLDİ, göz kararı değil. index.html'deki
     FOLD_LAYOUT okundu: raf(KİLER) x4-45, tahta(GÜNLER) x76-116,
     nisan x56-84 (y150+). Değnek önce x26'daydı ve rafın ÜSTÜNE
     biniyordu. x45-76 bandı dikeyde boş; değnek oraya, nişan taşının
     soluna alındı. Katman ağılın üstüne bindiği için bu çakışma
     denetimi zorunlu — konak ayrı bir ekran değil (konak-katmani.md). */
  DEGNEK: { x: 50, y0: 40, y1: 148 },
  /* Kiler küçüldü (34x40 -> 22x28): birinci basımda aletlerin hepsinden
     büyüktü ve ikincil bir gösterge kompozisyonun kahramanı olmuştu. */
  KILER:  { x: 272, y: 116, w: 22, h: 28 },

  PAL: {
    kiris:   '#483436',   // saçak kirişi
    kanca:   '#2e2028',
    ahsap:   '#604342',
    ahsapLt: '#89615a',
    metal:   '#c99474',
    bez:     '#dfd6c7',
    silue:   '#101018',   // "bu konakta yok"
    sonuk:   '#38282e',   // "bugün bitti"
    halka:   '#F8D878',   // harcanmamış iş hakkı
    halkaB:  '#483436',   // harcanmış
    tane:    '#ddab91',   // kilerdeki tane
    esik:    '#E8B830',   // yol azığı çizgisi
  },

  /* ===== İŞ TABLOSU ===================================================
     YALNIZ kodda karşılığı OLAN işler. ADR-022 sekiz iş onayladı ama
     `alet bakımı` ve `iz sürme` için `yayla.js`'te fonksiyon YOK — onları
     çizmek olmayan bir şeyi vaat etmek olurdu (rapor: eksikler md.1). */
  IS: [
    { k: 'sagim',  tr: 'Sağım',  en: 'Milking' },
    { k: 'egitim', tr: 'Eğitim', en: 'Training' },
    { k: 'bakim',  tr: 'Bakım',  en: 'Care' },
    { k: 'bahce',  tr: 'Bahçe',  en: 'Garden' },
    { k: 'kirkim', tr: 'Kırkım', en: 'Shearing' },
    { k: 'odun',   tr: 'Odun',   en: 'Firewood' },
  ],

  /* ===== DURUM — Yayla'dan TÜRETİLİR ==================================
     hal: 'hazir' | 'bitti' | 'yok' | 'yuvasiz'
       hazir   — bugün yapılabilir
       bitti   — bugün yapıldı / tavana ulaşıldı
       yok     — bu konakta hiç yok (bölüm şartı tutmuyor)
       yuvasiz — yapılabilirdi ama iş hakkı kalmadı */
  durum(Y){
    if(!Y) return [];
    const bolum = (Y.sefer && Y.sefer.bolum) || 0;
    const yuva = Y.yuvaKalan | 0;
    const out = [];
    for(const is of this.IS){
      let hal = 'hazir';
      if(is.k === 'sagim'){
        if(Y.sagimBugun >= ((Y.YUVA && Y.YUVA.sagimTavan) || 5)) hal = 'bitti';
      } else if(is.k === 'kirkim'){
        if(!Y.KIRKIM || bolum !== Y.KIRKIM.bolum) hal = 'yok';
        else if(Y.kirkimYapildi) hal = 'bitti';
      } else if(is.k === 'bahce'){
        if(!Y.BAHCE || bolum !== Y.BAHCE.ekimBolum) hal = 'yok';
        else if(Y.bahce && Y.bahce.ekili >= Y.BAHCE.tavan) hal = 'bitti';
      } else if(is.k === 'egitim'){
        if(!Y.egitim) hal = 'yok';            // konakta bir komut seçilmemiş
      }
      if(hal === 'hazir' && yuva <= 0) hal = 'yuvasiz';
      out.push({ k: is.k, tr: is.tr, en: is.en, hal });
    }
    return out;
  },

  /* Kancanın x'i — hat boyunca eşit aralıklı. */
  kancaX(i, n){
    const adet = n || this.IS.length;
    if(adet <= 1) return (this.HAT.x0 + this.HAT.x1) / 2;
    return this.HAT.x0 + (this.HAT.x1 - this.HAT.x0) * (i / (adet - 1));
  },

  /* ===== GİRDİ — aleti almak ==========================================
     Ekran kendi başına iş BAŞLATMAZ; hangi işe dokunulduğunu döndürür,
     kararı çağıran verir (yuvaHarca orada). Böylece ilerlemenin tek
     kaynağı yayla.js kalıyor. */
  vur(x, y, Y){
    const d = this.durum(Y);
    for(let i = 0; i < d.length; i++){
      const cx = this.kancaX(i, d.length);
      if(Math.abs(x - cx) <= 14 && y >= this.ALET_Y - 10 && y <= this.ALET_Y + 24){
        return d[i].hal === 'hazir' ? d[i].k : null;   // yalnız YAPILABİLİR iş cevap verir
      }
    }
    return null;
  },

  /* ===== ÇİZİM ======================================================== */
  ciz(g, Y, opts){
    const o = opts || {};
    this.cizKiris(g);
    const d = this.durum(Y);
    for(let i = 0; i < d.length; i++) this.cizAlet(g, d[i], this.kancaX(i, d.length));
    this.cizDegnek(g, Y);
    this.cizKiler(g, Y);
    if(typeof o.yaz === 'function') this.cizAdlar(g, d, o);
    return true;
  },

  cizKiris(g){
    const P = this.PAL, H = this.HAT;
    this.px(g, H.x0 - 8, H.y, (H.x1 - H.x0) + 16, 3, P.kiris);
    this.px(g, H.x0 - 8, H.y, (H.x1 - H.x0) + 16, 1, P.ahsapLt);   // kirişin ışık alan sırtı
  },

  /* Bir alet + kancası. Kancanın kendisi HER ZAMAN duruyor: boş kanca
     "burada bir iş VAR ama şu an olmuyor" diyor — yokluk da bilgi. */
  cizAlet(g, is, cx){
    const P = this.PAL, y = this.ALET_Y;
    this.px(g, cx, this.HAT.y + 3, 2, 6, P.kanca);                 // çengel
    this.px(g, cx - 2, this.HAT.y + 7, 4, 2, P.kanca);
    if(is.hal === 'yok'){ this.aletSekli(g, is.k, cx, y, P.silue, true); return; }
    const sonuk = (is.hal === 'bitti' || is.hal === 'yuvasiz');
    this.aletSekli(g, is.k, cx, y, sonuk ? P.sonuk : null, false);
  },

  /* Alet siluetleri — 11x14 bandında, hepsi AYRI silüet.
     Renk `zorla` verilirse tek tonda çizilir (silüet / sönük hâl). */
  aletSekli(g, k, cx, y, zorla, ince){
    const P = this.PAL;
    const c = (renk) => zorla || renk;
    const x = Math.round(cx);
    if(k === 'sagim'){                        // güğüm: sap + gövde
      this.px(g, x - 5, y, 11, 2, c(P.metal));
      this.px(g, x - 6, y + 3, 13, 13, c(P.ahsap));
      if(!zorla){ this.px(g, x - 6, y + 3, 13, 2, P.ahsapLt); this.px(g, x - 6, y + 3, 2, 13, P.ahsapLt); }
    } else if(k === 'egitim'){                 // ıslık: kordon + gövde + ağız deliği
      this.px(g, x, y, 2, 5, c(P.kanca));
      this.px(g, x - 4, y + 5, 9, 11, c(P.ahsapLt));
      if(!zorla){ this.px(g, x + 1, y + 8, 2, 2, P.kanca); this.px(g, x - 4, y + 5, 9, 2, P.bez); }
    } else if(k === 'bakim'){                  // sargı: sarılı bez topu
      this.px(g, x - 5, y + 2, 11, 14, c(P.bez));
      if(!zorla){ this.px(g, x - 5, y + 7, 11, 2, P.ahsap); this.px(g, x - 5, y + 12, 11, 1, P.ahsap); }
    } else if(k === 'bahce'){                  // kova: çemberli
      this.px(g, x - 5, y, 11, 2, c(P.metal));
      this.px(g, x - 6, y + 3, 13, 13, c(P.ahsapLt));
      if(!zorla){ this.px(g, x - 6, y + 6, 13, 2, P.metal); this.px(g, x - 6, y + 11, 13, 2, P.metal); }
    } else if(k === 'kirkim'){                 // makas: çaprazlanmış iki ağız
      for(let t = 0; t < 15; t++){
        this.px(g, x - 6 + t, y + 2 + t, 2, 1, c(P.metal));
        this.px(g, x + 7 - t, y + 2 + t, 2, 1, c(P.metal));
      }
      if(!zorla) this.px(g, x, y + 9, 2, 2, P.kanca);        // perçin
    } else if(k === 'odun'){                   // balta: sap + geniş ağız
      /* Birinci basımda ağız 7x7 idi ve kenarda küçük bir tik gibi
         okunuyordu; balta olduğu anlaşılmıyordu. Ağız genişledi ve
         sapın İKİ yanına taşarak gerçek bir balta silueti kurdu. */
      this.px(g, x + 2, y + 1, 2, 16, c(P.ahsap));
      this.px(g, x - 6, y + 2, 9, 8, c(P.metal));
      this.px(g, x - 4, y + 10, 6, 2, c(P.metal));
      if(!zorla){ this.px(g, x - 6, y + 2, 2, 8, P.bez); this.px(g, x - 6, y + 2, 9, 1, P.bez); }
    }
    void ince;
  },

  /* Çoban değneği: günün iş HAKLARI. Sapına geçirilmiş halkalar —
     dolu halka = harcanmamış hak. Dikey olduğu için üç hak 13x6'lık
     yatay bir dizi yerine gerçekten SAYILABİLİR duruyor (konak
     tasarımının teşhisi: eski gösterge sahnenin %0,7'siydi). */
  cizDegnek(g, Y){
    const P = this.PAL, D = this.DEGNEK;
    this.px(g, D.x, D.y0, 2, D.y1 - D.y0, P.ahsap);
    this.px(g, D.x, D.y0, 1, D.y1 - D.y0, P.ahsapLt);
    this.px(g, D.x - 2, D.y0, 4, 3, P.ahsapLt);                    // kanca ucu
    const kalan = Y ? (Y.yuvaKalan | 0) : 0;
    const harcanan = Y ? (Y.harcanan | 0) : 0;
    const toplam = kalan + harcanan;
    for(let i = 0; i < toplam; i++){
      const yy = D.y0 + 16 + i * 11;
      this.px(g, D.x - 3, yy, 8, 5, i < kalan ? P.halka : P.halkaB);
      if(i < kalan) this.px(g, D.x - 3, yy, 8, 1, P.bez);          // parlayan üst kenar
    }
  },

  /* Kiler — çuval. Sayı YAZILMIYOR: tane seviyesi yükseliyor, ve
     çuvalın üstünde YOL AZIĞI eşiği bir çizgi olarak duruyor.
     Böylece kilerin okunuşu "kaç birim" değil, ADR-024'ün gerçekten
     sorduğu soru: "yola çıkacak kadar var mı?" */
  cizKiler(g, Y){
    const P = this.PAL, K = this.KILER;
    this.px(g, K.x, K.y, K.w, K.h, P.ahsap);
    this.px(g, K.x, K.y, K.w, 1, P.ahsapLt);
    const kiler = Y ? Math.max(0, Y.kiler || 0) : 0;
    const esik = (Y && Y.GIDER && Y.GIDER.yolAzik) || 3;
    const tam = Math.max(esik * 2, 1);                              // eşiğin iki katı = dolu çuval
    const h = Math.min(K.h - 2, Math.round((kiler / tam) * (K.h - 2)));
    if(h > 0) this.px(g, K.x + 1, K.y + K.h - h, K.w - 2, h, P.tane);
    const ey = K.y + K.h - Math.min(K.h - 2, Math.round((esik / tam) * (K.h - 2)));
    this.px(g, K.x - 2, ey, K.w + 4, 1, P.esik);                    // yol azığı eşiği
  },

  /* Adlar YALNIZ çağıran yazı fonksiyonu verirse. Oyunun yazı yolu
     index.html'de ve orası bu oturumun bölgesi değil. */
  cizAdlar(g, d, o){
    const dil = o.dil === 'en' ? 'en' : 'tr';
    for(let i = 0; i < d.length; i++)
      o.yaz(g, d[i][dil], this.kancaX(i, d.length), this.ALET_Y + 22, this.PAL.bez);
  },

  px(g, x, y, w, h, renk){
    g.fillStyle = renk;
    g.fillRect(Math.round(x), Math.round(y), Math.max(1, Math.round(w)), Math.max(1, Math.round(h)));
  },
};

const Konak = Konak_;
if (typeof module !== 'undefined' && module.exports) module.exports = Konak;
/* ==KONAK-END== */
