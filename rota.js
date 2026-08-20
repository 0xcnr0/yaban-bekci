/* ==ROTA-START==
   YOL DEFTERİ — göçün kaydı (ADR-024 · Öneri C).
   ---------------------------------------------------------------------
   NE DEĞİŞTİ, NEDEN. Önceki hâl ağılın ÜSTÜNE binen asılı bir kasnaktı.
   Sahibi baktı ve şunu dedi: *"yuvarlak bişey çıkıyor, bu ekran genel
   olarak anlaşılmıyor."* Araştırma (docs/anaekran-arastirma.md) teşhisi
   derinleştirdi: kasnak belirtiydi, hastalık kaydın sahneyle AYNI yüzeyi
   paylaşmasıydı. Sahibi Öneri C'yi seçti: kayıt kendi ekranına çekiliyor.
   Desen Obra Dinn'in kitabı — siyah zemine ortalanmış, kapakları görünür,
   arkada dünya YOK.

   KABUL ÖLÇÜTÜ, sahibinin cümlesi:
     *"umarım herhangi birinin ilk kez oyunu açtığında anlayabileceği bir
       şekilde olur."*
   Aşağıdaki her karar güzellik için değil, o cümle için verildi.

   BEŞ KURAL VE KODDAKİ KARŞILIKLARI:

   1. STEPPER DEĞİL, İZ. Düğme yok, kabartma yok, numara yok, kilit yok.
      Sebebi ölçülmüş: bir oyuncu, seçilebilir GÖRÜNEN ama seçilemeyen bir
      bölüm ekranını oyunun HATASI sanıp bug raporu açmış (Descenders).
      ADR-024 "bölüm seçilemez" diyorsa ekran seçilebilir GÖRÜNMEMELİ.
      Burada duraklar bir bezin üstüne DİKİLMİŞ düğümler — dokunulacak
      şeyler değil, olmuş bitmiş işler.

   2. AD BİR ÖDÜLDÜR. Geçilen durak adını taşır, önündekiler adsız ve
      soluk. (Dead Cells: keşfedilen bölgeler renkli ve ADLI, keşfedilmemiş
      olanlar gri ve yalnız simge.) `durum()` bunu tek yerde uyguluyor.

   3. BULUNULAN YER BAŞKA SINIFTAN BİR İŞARET. Daha büyük bir nokta değil
      — bezde HÂLÂ DURAN İĞNE. "Burada iş yarım" demek, "burası seçili"
      demek değil.

   4. KAPANIŞ ÖNCEDEN HİSSEDİLİR. Dikişin İKİ UCUNDA da aynı işaret var:
      kışlak. Hat evden çıkıp eve dönüyor; iğnenin sağdaki eve olan
      mesafesi gözle azalıyor. Sayı yazmadan "az kaldı" diyor. (Civ:
      Beyond Earth vakası: *"oyun aniden bitti, ilerlememin görsel
      göstergesi hiç yoktu."*)

   5. PARMAK HEDEFİ ÖRTER. Seçilen durağın adı dikişin yanında DEĞİL,
      defterin ÜST bandında. (Loop Hero'yu mobile taşıyan ekibin notu:
      "parmak tam bakman gereken kareyi kapatıyor.")

   AYRICA: defter ekran kenarlarına DEĞMEZ (80 Days'te kritik bir gösterge
   çentiğin altına düşüp okunamaz olmuştu); açılış animasyonu YOK; ses YOK
   (sessizde oynanabilirlik, sahibinin kararı 2026-08-19); kapatma yolu
   İKİ TANE ve ikisi de görünür (bkz. `kapatmaMi`).

   ÇİFT KAYNAK YOK: her şey `Yayla.sefer` + `Yayla.SEFER`den TÜRETİLİR.
   Saklanan tek durum bir parmağın anlık yeri.

   İMZALAR KORUNDU: index.html'in kancaları (ciz/tut/tasi/birak/iptal/
   surukle/nokta/KON_R) aynen duruyor. Yalnız KAYNAK ve KON_R'nin
   DEĞERLERİ yeni yerleşime göre değişti — bkz. docs/yoldefteri.md.
   ------------------------------------------------------------------ */
'use strict';

const Rota_ = {
  W: 320, H: 180,

  /* YERLEŞİM — İKİNCİ YAZIM, çünkü birincisi basıldı ve KALDI.
     İlk hâl bütün sayıları tutturuyordu ama kareye bakınca defter değil
     DÜZ BİR PANELDİ: kapak 2 piksellik bir çerçeveydi (görünmüyordu),
     sırt ince bir ayraç çizgisiydi (kitap sırtı değil), sayfa yüzeyi
     kapakla neredeyse aynı tondaydı, ve boş sağ sayfa "yazılmamış" değil
     "bozuk" okunuyordu. ADR-026'nın yasakladığı şeyin ta kendisi.
     Dört düzeltme:
       1. Kapak GERÇEKTEN kalın, üstü ışıklı altı gölgeli — bir cisim.
       2. Sayfa yüzeyi krem (#dfd6c7), kapak koyu: kontrast kitabı açıyor.
          Yazı da artık krem üstünde koyu, yani okunaklı.
       3. Sırt bir BANT ve üstünde dikiş var; iki yanında sayfa gölgesi.
       4. Sayfalar ÇİZGİLİ. Boş bir çizgili sayfa "daha yazılmadı" der;
          bomboş bir dikdörtgen "bir şey bozuldu" der. Frame 1'deki koca
          boşluğu çözen şey bu.

     YAZI ÖLÇÜSÜ ÖLÇÜLDÜ: oyunun fontu 5x7 bitmap, adım 6px (index.html'de
     FONT/textW). Satır 7 piksel yüksek, aralık en az 8 olmalı. */
  KAPAK:  { x: 20, y: 14, w: 280, h: 152 },   // cismin kendisi
  SAYFA:  { y: 22, dip: 158 },                // sayfa yüzeyi (üst / alt kenar)
  SOL:    { x0: 28,  x1: 156 },
  SAG:    { x0: 164, x1: 292 },
  SIRT:   { x: 156, w: 8 },                   // dikişli kitap sırtı
  SERIT:  { x: 258, y: 14, w: 40, h: 12 },    // kapaktaki bez şerit = KAPAT

  /* Satır ızgarası. Sayfa çizgileri de bu adımla çiziliyor, yani yazı
     çizgiye OTURUYOR — defteri defter yapan şeylerden biri. */
  SATIR: 9,
  IC: 6,                                      // sayfa kenar boşluğu
  AD_Y: 32, HAL_Y: 41,                        // seçili durağın adı + durumu
  BASLIK_Y: 54, ILK_Y: 66, DIP_Y: 124,
  MAX_SOL: 5,                                 // sayfada duran kayıt (bkz. cizSolSayfa)
  MAX_SAG: 3,

  /* Alt bant: yol haritası iki sayfaya BİRDEN çiziliyor — sırtın üstünden
     geçen bir çizim, gerçek bir defterde de böyle yapılır. */
  AYRAC_Y: 130,
  HAT:    { x0: 44, x1: 276, y: 145 },        // dikilmiş yol (adım ~25.8px)
  IGNE_BOY: 11,

  /* Tören: iğne bir İĞNELİKTE bekler, durağa SÜRÜKLENİR.
     İĞNELİĞİN YERİ ÖLÇÜLDÜ: ilk denemede tam ortadaydı (x160) ve orası
     kitabın SIRTI — koyu iğne koyu sırtın üstüne düşünce karede hiç
     görünmedi, yani törenin başlatılacağı yer görünmez olmuştu. Şimdi sağ
     sayfada, iki durağın tam ortasında (8. ve 9. durak arası): sırttan da
     düğümlerden de uzak. */
  KAYNAK: { x: 211, y: 155 },
  TUT_R: 15,
  KON_R: 10,                                  // hat adımı 25.8 — komşuya taşmıyor

  PAL: {
    zemin:    '#0b0a0e',       // defterin arkası: dünya YOK
    kapak:    '#2e2028',
    kapakUst: '#483436',       // ışık yukarıdan
    kenar:    '#ddab91',       // sayfa destesinin kenarı
    sayfa:    '#dfd6c7',       // sayfa yüzeyi
    cizgi:    '#ddab91',       // sayfa çizgileri
    golge:    '#c99474',       // sırtın iki yanındaki kıvrım gölgesi
    sirt:     '#604342',
    dikisIz:  '#483436',       // yürünen yol: kalın, sürekli
    dikisOn:  '#c99474',       // önündeki yol: kesik, soluk
    dugum:    '#2e2028',
    ev:       '#604342',       // iki uçtaki kışlak
    igne:     '#89615a',
    igneUc:   '#dfd6c7',
    iplik:    '#89615a',
    yazi:     '#2e2028',
    ikincil:  '#89615a',
    vurgu:    '#F8D878',
  },

  /* Arayüz metinleri. TEK DİL: İngilizce (sahibinin kararı, 2026-08-20).
     Oyunu ilk kez açan bir oyuncu bu ekranda yarı Türkçe yarı İngilizce
     bir şey gördü ve bozuk sandı; Türkçe yol tamamen kaldırıldı, durak
     adları da artık İngilizce (`Yayla.SEFER`).

     DİL SADE OLACAK — bu turun asıl işi buydu, çeviri değil. Ölçüt:
     çobanlık bilmeyen biri anlayacak. O yüzden:
       'THE ROAD BEHIND'  -> 'THE ROAD SO FAR'    (gündelik kalıp)
       'THE DOG LEARNED'  -> 'YOUR DOG LEARNED'   (köpek OYUNCUNUN)
       'WHAT WE LOST'     -> 'LOST ALONG THE WAY' (neyin kaybı olduğu açık)
       'WE CAME HOME'     -> 'WE MADE IT HOME'    (başarma duygusu)

     İKİ SAPMA VAR, ikisi de ÖLÇÜLDÜ — bkz. docs/dil-sadelestirme.md. */
  S: {
    yol:    { en: 'THE ROAD SO FAR'     },
    tasir:  { en: 'YOUR DOG LEARNED'    },
    kayip:  { en: 'LOST ALONG THE WAY'  },
    burada: { en: 'WE ARE HERE'         },
    evde:   { en: 'WE MADE IT HOME'     },
    yolda:  { en: 'NOT STARTED YET'     },
    kapat:  { en: 'CLOSE'               },
    centik: { en: 'SEW THE MARK'        },
  },
  s(k){ const o = this.S[k]; return o ? o.en : ''; },

  /* ===== GEOMETRİ ====================================================
     Duraklar bir HAT üzerinde eşit aralıklı. Halka olduğu için hattın iki
     ucunda da ev var; hat düz ama yolculuk kapalı. */
  nokta(i, n){
    const adet = Math.max(1, n || 10), H = this.HAT;
    if(adet === 1) return { x: (H.x0 + H.x1) / 2, y: H.y };
    return { x: H.x0 + (H.x1 - H.x0) * ((i - 1) / (adet - 1)), y: H.y };
  },

  /* ===== DURUM — sefer'den TÜRETİLİR ================================= */
  durum(sefer, SEFER){
    const liste = SEFER || [];
    const centik = (sefer && Array.isArray(sefer.centik)) ? sefer.centik : [];
    const simdi = (sefer && sefer.bolum) ? sefer.bolum : 0;
    const out = [];
    for(let i = 1; i <= liste.length; i++){
      const hal = centik.indexOf(i) >= 0 ? 'gecildi' : (i === simdi ? 'simdi' : 'ilerde');
      out.push({
        i, hal,
        /* AD BİR ÖDÜL: ilerdeki durak adsız. */
        ad: hal === 'ilerde' ? null : ((liste[i - 1] && liste[i - 1].ad) || null),
      });
    }
    return out;
  },

  halkaKapandi(sefer, SEFER){
    const n = (SEFER || []).length;
    if(!n || !sefer || !Array.isArray(sefer.centik)) return false;
    return sefer.centik.length >= n;
  },

  /* ===== ÇENTİK TÖRENİ — imzalar AYNI ================================
     Töreni bu dosya BAŞLATMAZ; `Yayla.gunBitir` çentiği sefer'e iter.
     Burada yalnız jest var: iğneyi al, durağa götür, bırak. Hedef
     dışındaki hiçbir durak cevap vermez — "bölüm seçilemez"in kodda
     karşılığı bu. */
  surukle: null,

  torenDuragi(sefer, toren){
    const t = toren | 0;
    if(!t || !sefer || !Array.isArray(sefer.centik)) return 0;
    return sefer.centik.indexOf(t) >= 0 ? t : 0;
  },
  tut(x, y, sefer, toren){
    if(!this.torenDuragi(sefer, toren)) return false;
    if(Math.hypot(x - this.KAYNAK.x, y - this.KAYNAK.y) > this.TUT_R) return false;
    this.surukle = { x, y };
    return true;
  },
  tasi(x, y){
    if(!this.surukle) return false;
    this.surukle.x = x; this.surukle.y = y;
    return true;
  },
  /* Hedefi tutturamayan jest iğneyi kaynağına bırakır — jest yarıda
     kalırsa oyun KİLİTLENMEZ (kışlak töreninin dersi). */
  birak(x, y, sefer, toren, SEFER){
    if(!this.surukle) return { kondu: false, durak: 0 };
    this.surukle = null;
    const t = this.torenDuragi(sefer, toren);
    if(!t) return { kondu: false, durak: 0 };
    const p = this.nokta(t, (SEFER || []).length || 10);
    return Math.hypot(x - p.x, y - p.y) <= this.KON_R
      ? { kondu: true, durak: t } : { kondu: false, durak: 0 };
  },
  iptal(){ this.surukle = null; },

  /* ===== KAPATMA — çok net olmalı ====================================
     Modalın bedelini kendi raporumda yazdım: kapatma yolu bulunamayan
     tam ekran, oyuncunun oyunu donmuş sanmasıdır. O yüzden İKİ yol var
     ve ikisi de görünür:
       1. defterin DIŞINDAKİ siyah alan — kitabı masaya bırakmak,
       2. kapaktaki bez ŞERİT, üstünde KAPAT/CLOSE yazılı.
     İkisi de bu tek fonksiyondan geçer, yani çağıran tek soru sorar. */
  kapatmaMi(x, y){
    const D = this.KAPAK, S = this.SERIT;
    if(x >= S.x && x <= S.x + S.w && y >= S.y && y <= S.y + S.h) return true;
    return !(x >= D.x && x <= D.x + D.w && y >= D.y && y <= D.y + D.h);
  },

  /* Bir durağa dokunmak onu SEÇMEZ, hiçbir yere GİTMEZ — yalnız adını
     üst banda yazdırır. Törenle karıştırılmasın diye ayrı fonksiyon. */
  durakVur(x, y, SEFER){
    const n = (SEFER || []).length || 10;
    for(let i = 1; i <= n; i++){
      const p = this.nokta(i, n);
      if(Math.hypot(x - p.x, y - p.y) <= this.KON_R) return i;
    }
    return 0;
  },
  /* ===== ÇİZİM =======================================================
     opts: { yaz(g, metin, xOrta, y, renk), toren, secili,
             durakAdi(i), ogrenilen: [], kayip: [], yaziEn(metin) }

     `yaz` metni x'e GÖRE ORTALAR (index.html'deki textC). Liste satırları
     ise SOLA YASLI olmalı — ilk yazımda ortalıydılar ve kareye bakınca
     liste değil şiir gibi duruyordu, kenardaki durum işaretiyle metin
     arasındaki bağ da kopuyordu. Sola yaslamak için metnin genişliği
     gerekiyor: `opts.yaziEn` verilirse o kullanılır, verilmezse oyunun
     kendi sabit adımından hesaplanır (5x7 font, 6px adım). */
  ADIM: 6,
  en(metin, o){
    if(o && typeof o.yaziEn === 'function') return o.yaziEn(String(metin));
    return String(metin).length * this.ADIM - 1;
  },
  yazSol(g, o, metin, xSol, y, renk){
    o.yaz(g, metin, xSol + this.en(metin, o) / 2, y, renk);
  },

  ciz(g, sefer, SEFER, opts){
    const o = opts || {};
    const liste = SEFER || [];
    const n = liste.length || 10;
    const d = this.durum(sefer, liste);

    this.cizKitap(g);
    this.cizSerit(g, o);
    this.cizSolSayfa(g, d, sefer, liste, o);
    this.cizSagSayfa(g, o);
    this.cizHat(g, d, n, sefer, o);
    return d;
  },

  /* ===== KİTABIN KENDİSİ =============================================
     Sıra önemli: zemin, kapak, sayfa destesinin kenarı, sayfa yüzeyi,
     çizgiler, sırt, sırt gölgesi. Her katman bir öncekinin üstünde 1-2
     piksel içeride — cismi kalın gösteren şey bu. */
  cizKitap(g){
    const P = this.PAL, K = this.KAPAK, S = this.SAYFA;

    /* Arkada DÜNYA YOK: kayıt kendi yüzeyine çekiliyor. Bu dolgu ağıl
       sahnesini tamamen kapatır, o yüzden index.html'de değişiklik
       gerekmedi. */
    this.px(g, 0, 0, this.W, this.H, P.zemin);

    this.px(g, K.x, K.y, K.w, K.h, P.kapak);
    this.px(g, K.x, K.y, K.w, 2, P.kapakUst);                  // ışık yukarıdan
    this.px(g, K.x, K.y + K.h - 1, K.w, 1, '#101018');         // gölge aşağıda

    /* Sayfa destesinin kenarı: kapakla sayfa yüzeyi arasında ince bir
       şerit. Kitaba kalınlık veren detay. */
    this.px(g, this.SOL.x0 - 2, S.y - 1, (this.SAG.x1 + 2) - (this.SOL.x0 - 2), S.dip - S.y + 2, P.kenar);

    for(const C of [this.SOL, this.SAG]){
      this.px(g, C.x0, S.y, C.x1 - C.x0, S.dip - S.y, P.sayfa);
      /* Sayfa çizgileri. Yazı bu ızgaraya oturuyor, yani satırlar
         çizgiye yazılmış gibi duruyor. */
      for(let y = this.ILK_Y; y <= this.DIP_Y; y += this.SATIR)
        this.px(g, C.x0 + this.IC, y + 8, C.x1 - C.x0 - this.IC * 2, 1, P.cizgi);
    }

    /* Sırt: dikişli bir bant, iki yanında sayfanın kıvrım gölgesi. */
    this.px(g, this.SIRT.x, S.y, this.SIRT.w, S.dip - S.y, P.sirt);
    for(let y = S.y + 4; y < S.dip - 3; y += 7)
      this.px(g, this.SIRT.x + 2, y, this.SIRT.w - 4, 2, P.iplik);
    this.px(g, this.SIRT.x - 2, S.y, 2, S.dip - S.y, P.golge);
    this.px(g, this.SIRT.x + this.SIRT.w, S.y, 2, S.dip - S.y, P.golge);

    /* Haritayı listelerden ayıran tam genişlikte çizgi. */
    this.px(g, this.SOL.x0 + this.IC, this.AYRAC_Y, this.SIRT.x - this.SOL.x0 - this.IC, 1, P.golge);
    this.px(g, this.SIRT.x + this.SIRT.w, this.AYRAC_Y,
            this.SAG.x1 - this.IC - this.SIRT.x - this.SIRT.w, 1, P.golge);
  },

  /* Kapaktaki bez şerit. Yazı geri çağrımı yoksa şeridin kendi biçimi
     (kapaktan sarkan dil) hâlâ "buradan kapat" diyor. */
  cizSerit(g, o){
    const S = this.SERIT, P = this.PAL;
    this.px(g, S.x, S.y, S.w, S.h, P.sirt);
    this.px(g, S.x, S.y, S.w, 1, P.iplik);
    this.px(g, S.x + 3, S.y + S.h - 2, S.w - 6, 1, P.iplik);
    if(typeof o.yaz === 'function')
      o.yaz(g, this.s('kapat'), S.x + S.w / 2, S.y + 3, P.sayfa);
  },

  /* Sayfa başlığı + altındaki ince çizgi. */
  cizBaslik(g, o, metin, C, y){
    this.yazSol(g, o, metin, C.x0 + this.IC, y, this.PAL.ikincil);
    this.px(g, C.x0 + this.IC, y + 8, C.x1 - C.x0 - this.IC * 2, 1, this.PAL.golge);
  },

  /* Durak adı: çağıran kendi çevirisini verebilir; vermezse SEFER'in
     kendi Türkçe adı (özel isim, bilerek çevrilmiyor). */
  adAl(s, o){
    if(typeof o.durakAdi === 'function'){ const v = o.durakAdi(s.i); if(v) return v; }
    return s.ad;
  },

  /* ===== SOL SAYFA ===================================================
     Üstte seçili (yoksa bulunulan) durağın ADI ve tek satır durumu;
     altında geçtiğimiz yolun son kayıtları.

     ADIN YERİ: parmak alt banttaki haritada olacak, o yüzden ad en ÜSTTE.
     (Loop Hero'yu mobile taşıyan ekibin notu: "parmak tam bakman gereken
     kareyi kapatıyor.") Sırtın üstüne yazmıyoruz — açık bir defterde
     başlık sol sayfanın tepesine yazılır, ortasına değil.

     NEDEN HEPSİ DEĞİL, SON BEŞ: on kaydın hepsi haritanın içine taşıyor
     (ölçüldü). Ama asıl gerekçe yer değil: gerçek bir defterde de açık
     duran şey SON SAYFADIR. Yolculuğun BÜTÜNÜ zaten altta, haritada
     duruyor. Daha eskisini görmek isteyen haritadaki düğüme dokunur, adı
     yukarı çıkar (`durakVur` + `opts.secili`). Hiçbir kayıt erişilemez
     olmuyor, yalnız hepsi aynı anda bağırmıyor. */
  cizSolSayfa(g, d, sefer, liste, o){
    if(typeof o.yaz !== 'function') return;
    const P = this.PAL, C = this.SOL, x = C.x0 + this.IC;

    const secili = o.secili || (sefer && sefer.bolum) || 0;
    const sec = d.find(s => s.i === secili);
    const ad = sec ? (this.adAl(sec, o) || '') : '';
    const hal = this.halkaKapandi(sefer, liste) ? this.s('evde')
      : (sec && sec.hal === 'simdi') ? this.s('burada')
      : (!sec ? this.s('yolda') : '');
    if(ad) this.yazSol(g, o, ad, x, this.AD_Y, P.yazi);
    if(hal) this.yazSol(g, o, hal, x, ad ? this.HAL_Y : this.AD_Y, P.ikincil);

    this.cizBaslik(g, o, this.s('yol'), C, this.BASLIK_Y);
    let y = this.ILK_Y;
    const tum = d.filter(s => s.hal !== 'ilerde');
    const gorunen = tum.slice(-this.MAX_SOL);
    /* Daha eski kayıt varsa: kenarda üç soluk nokta — "önceki sayfalar".
       Sayı yazmıyoruz; bu bir sayaç değil, bir kıvrım. */
    if(tum.length > gorunen.length) this.cizDevam(g, C.x0 + 2, y + 2);
    for(const s of gorunen){
      if(y > this.DIP_Y) break;
      const isim = this.adAl(s, o);
      if(!isim) continue;
      if(s.hal === 'simdi') this.px(g, x, y + 2, 3, 3, P.vurgu);
      else this.px(g, x + 1, y + 3, 2, 2, P.dugum);
      this.yazSol(g, o, isim, x + 6, y, s.hal === 'simdi' ? P.yazi : P.ikincil);
      y += this.SATIR;
    }
  },

  /* ===== SAĞ SAYFA — ne kazandık, ne kaybettik =======================
     İÇERİK ÇAĞIRANDAN GELİR (`opts.ogrenilen`, `opts.kayip`). Bu dosya
     köpeğin ne bildiğini ya da kimin kaybolduğunu KENDİ bilmiyor ve
     UYDURMUYOR; veri verilmezse o blok hiç çizilmez ve sayfa ÇİZGİLİ ama
     boş kalır — bir defterin henüz yazılmamış sayfası zaten böyledir. */
  cizSagSayfa(g, o){
    if(typeof o.yaz !== 'function') return;
    const P = this.PAL, C = this.SAG, x = C.x0 + this.IC;
    let y = this.BASLIK_Y;
    const blok = (baslik, satirlar, isaret) => {
      if(!Array.isArray(satirlar) || !satirlar.length) return;
      if(y + this.SATIR > this.DIP_Y) return;
      this.cizBaslik(g, o, baslik, C, y);
      y += this.SATIR + 3;
      const gorunen = satirlar.slice(0, this.MAX_SAG);
      for(const t of gorunen){
        if(y > this.DIP_Y) break;
        isaret(y);
        this.yazSol(g, o, String(t), x + 6, y, P.yazi);
        y += this.SATIR;
      }
      /* Sığmayan kalanı: üç nokta, solda olduğu gibi. Bir sonraki bloğun
         başlığına binmesin diye kendi satırını harcıyor. */
      if(satirlar.length > gorunen.length) this.cizDevam(g, C.x1 - 3, y - this.SATIR + 2);
      y += 6;
    };
    blok(this.s('tasir'), o.ogrenilen,
         (yy) => this.px(g, x + 1, yy + 3, 2, 2, P.iplik));
    /* Kaybedilenin işareti KESİK bir dikiş: iplik orada kopmuş. */
    blok(this.s('kayip'), o.kayip, (yy) => {
      this.px(g, x, yy + 3, 2, 1, P.dugum);
      this.px(g, x + 3, yy + 3, 2, 1, P.dugum);
    });
  },

  /* ===== YOL HARİTASI — ekranın kalbi ================================
     İKİNCİ YAZIM. Birincisi saç teli inceliğinde bir çizgiydi; karede
     "yolculuğum" diye okunmuyordu, iki uçtaki ev iki leke gibiydi ve
     "buradayız" iğnesi hiç görünmüyordu. Şimdi:
       - yürünen iplik 3 piksel kalın ve gerçek DİKİŞ gibi kesikli,
       - düğümler büyük ve ışıklı,
       - iki uçtaki kışlak tanınır bir KULÜBE (çatı + gövde + kapı),
       - bulunulan yerde iplikli bir İĞNE duruyor.

     Soldan sağa: ev · duraklar · ev. İki uçta AYNI kulübe var, çünkü
     yolculuk evden çıkıp eve dönüyor; iğnenin sağdaki eve olan mesafesi
     gözle azalıyor. Sayı yazmadan "az kaldı" diyor. (Civ: Beyond Earth
     vakası: "oyun aniden bitti, ilerlememin görsel göstergesi hiç
     yoktu.") */
  cizHat(g, d, n, sefer, o){
    const P = this.PAL, H = this.HAT;
    let son = -1;
    d.forEach((s, i) => { if(s.hal !== 'ilerde') son = i; });
    const kx = son >= 0 ? this.nokta(son + 1, n).x : H.x0;

    /* Yürünen yol: kalın, dikiş dikiş. */
    for(let x = H.x0; x < kx; x += 5) this.px(g, x, H.y - 1, 4, 3, P.dikisIz);
    /* Önündeki yol: ince, soluk, kesik — henüz dikilmemiş. */
    for(let x = Math.round(kx); x < H.x1; x += 5) this.px(g, x, H.y, 2, 1, P.dikisOn);

    const kapandi = d.length > 0 && d.every(s => s.hal === 'gecildi');
    this.cizEv(g, H.x0 - 9, H.y - 8, P.ev, false);
    this.cizEv(g, H.x1 + 2, H.y - 8, kapandi ? P.vurgu : P.ev, kapandi);

    /* Tören hedefi: çentik KAZANILMIŞ ama daha DİKİLMEMİŞ. Karede bunun
       karşılığı olmalıydı ve ilk yazımda yoktu — ekran "ÇENTİĞİ AT" diyor,
       oyuncu nereye atacağını göremiyordu. Hedef artık boş bir dikiş
       deliği: kenarları işaretli, içi boş. Dikilince düğüme dönüşüyor. */
    const hedef = this.torenDuragi(sefer, o.toren);

    for(const s of d){
      const p = this.nokta(s.i, n);
      if(s.i === hedef){
        this.px(g, p.x - 2, p.y - 4, 5, 1, P.dugum);            // delik: üst
        this.px(g, p.x - 2, p.y + 3, 5, 1, P.dugum);            // delik: alt
        this.px(g, p.x - 2, p.y - 3, 1, 6, P.dugum);
        this.px(g, p.x + 2, p.y - 3, 1, 6, P.dugum);
        this.px(g, p.x - 1, p.y - 4, 3, 1, P.vurgu);            // "buraya"
        this.px(g, p.x - 1, p.y + 3, 3, 1, P.vurgu);
      } else if(s.hal === 'gecildi'){
        this.px(g, p.x - 2, p.y - 3, 5, 7, P.dugum);            // dikilmiş düğüm
        this.px(g, p.x - 1, p.y - 2, 3, 2, P.iplik);            // düğümün ışığı
      } else if(s.hal === 'simdi'){
        this.cizToplu(g, p.x, p.y);                             // BAŞKA SINIFTAN işaret
      } else {
        this.px(g, p.x, p.y, 2, 1, P.dikisOn);                  // adsız, soluk
      }
    }

    /* Tören bekliyorsa: iğnelik ve içindeki iğne (ya da parmaktaki iğne),
       üstünde ne yapılacağını söyleyen tek satır. Yazı da sırtın üstüne
       değil SAĞ SAYFAYA ortalanıyor — iğnelikle aynı yarıda dursun ki
       ikisinin ilgili olduğu görülsün. */
    if(this.torenDuragi(sefer, o.toren)){
      const K = this.KAYNAK;
      /* İğnelikten deliğe noktalı kılavuz. "ÇENTİĞİ AT" yazısı ne
         yapılacağını söylüyordu ama NEREYE sorusunu cevapsız bırakıyordu;
         jestin iki ucunu birleştiren şey bu. Sürükleme başlayınca
         kayboluyor — parmak zaten yolu biliyor. */
      const hp = this.nokta(hedef, n);
      if(!this.surukle){
        const uz = Math.hypot(hp.x - K.x, hp.y - K.y);
        for(let t = 10; t < uz - 6; t += 6)
          this.px(g, K.x + (hp.x - K.x) * t / uz, K.y + (hp.y - K.y) * t / uz, 1, 1, P.golge);
      }
      this.px(g, K.x - 6, K.y - 3, 13, 7, P.sirt);              // iğnelik
      this.px(g, K.x - 6, K.y - 3, 13, 1, P.iplik);
      const b = this.surukle || K;
      this.cizIgne(g, b.x, b.y);
      if(typeof o.yaz === 'function' && !this.surukle)
        o.yaz(g, this.s('centik'), (this.SAG.x0 + this.SAG.x1) / 2,
              this.AYRAC_Y + 4, P.ikincil);
    }
  },

  /* Kışlak — hattın iki ucunda aynı kulübe. Çatı + gövde + kapı; 8x9.
     Halka kapanınca sağdakinin penceresi yanıyor: "eve vardık". */
  cizEv(g, x, y, renk, yanik){
    for(let r = 0; r < 3; r++) this.px(g, x + 3 - r, y + r, 2 + r * 2, 1, renk);   // çatı
    this.px(g, x + 1, y + 3, 6, 6, renk);                                          // gövde
    this.px(g, x + 3, y + 6, 2, 3, this.PAL.dugum);                                // kapı
    if(yanik) this.px(g, x + 2, y + 4, 2, 2, this.PAL.vurgu);                       // pencere
  },

  /* TOPLU İĞNE — "BURADAYIZ". Haritaya saplanmış, sarı başlı bir toplu
     iğne: bir haritada bulunduğun yeri gösteren evrensel nesne.

     NEDEN DİKİŞ İĞNESİ DEĞİL: ilk yazımda burası da dikiş iğnesiydi ve iki
     sorun çıktı. (1) Karede 1 piksellik ince bir çizgiydi, bulunamıyordu.
     (2) Tören sırasında ekranda İKİ iğne oluyordu — biri "buradasın", biri
     "bunu sürükle" — ve hangisinin tutulacağı belirsizdi. Şimdi iki AYRI
     nesne var: saplı duran toplu iğne (bilgi) ve iğnelikteki dikiş iğnesi
     (alet). Karıştırılamaz.

     Yine de bir DÜĞME değil: kafası yuvarlak, gövdesi eğik saplanmış, ve
     tek tane. Düğme sırası değil, haritaya batırılmış tek bir işaret. */
  cizToplu(g, x, y){
    const P = this.PAL;
    this.px(g, x, y - 7, 1, 8, P.igne);            // gövde (saplanmış)
    /* Baş: koyu halka içinde parlak sarı. Halka ŞART — sarı tek başına
       krem sayfanın üstünde eriyordu (basılıp bakıldı). Düğümlerden
       belirgin şekilde daha büyük, çünkü haritadaki en önemli şey bu. */
    this.px(g, x - 1, y - 13, 3, 5, P.dugum);
    this.px(g, x - 2, y - 12, 5, 3, P.dugum);
    this.px(g, x - 1, y - 12, 3, 3, P.vurgu);
  },

  /* DİKİŞ İĞNESİ — törenin ALETİ. İğnelikte durur, çentiğe sürüklenir. */
  cizIgne(g, x, y){
    const P = this.PAL, b = this.IGNE_BOY;
    this.px(g, x, y - b, 1, b, P.igne);            // gövde
    this.px(g, x, y - b, 1, 3, P.igneUc);          // parlak uç
    this.px(g, x, y - b + 4, 1, 2, P.dugum);       // iğnenin gözü
    this.px(g, x + 1, y - b + 5, 2, 1, P.iplik);   // iplik
    this.px(g, x + 2, y - b + 6, 1, 2, P.iplik);
  },

  /* "DEVAMI VAR" işareti — sayfa kenarına dikey üç nokta. Yatay üç nokta
     denendi ve karede yükleniyor animasyonu gibi okundu; dikey ve KENAR
     BOŞLUĞUNDA olunca metnin parçası olmaktan çıkıp sayfa işaretine
     dönüşüyor. Sayı yazmıyoruz: bu bir sayaç değil. */
  cizDevam(g, x, y){
    for(let k = 0; k < 3; k++) this.px(g, x, y + k * 3, 1, 1, this.PAL.ikincil);
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
   `module` tanımsız olduğu için bu satır orada hiçbir şey yapmaz. */
if (typeof module !== 'undefined' && module.exports) module.exports = Rota;
/* ==ROTA-END== */
