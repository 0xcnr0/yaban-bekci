/* ==YAYLA-START==
 * YABAN — YAYLA: 10 bölümlük göç kampanyası (ADR-020 … 026).
 *
 * NİYE AYRI DOSYADA. ADR-018 tek dosyada kalmaya karar vermişti "ama
 * kenarında", dört sayısal tetikle. Sahibi bölme kararını lidere bıraktı
 * (2026-08-18) ve karar BÖL oldu: index.html 12.501 satır, yeni mod
 * tahmini +5.100..7.200, yani 18.000 eşiği bu modla aşılıyor.
 *
 * Ve `docs/bolme-fizibilite.md`nin ölçtüğü kural: YENİ KOD YENİ DOSYADA
 * DOĞAR, var olan bloklar TAŞINMAZ. Taşımak 14+ aracı etkiliyor, burada
 * doğmak 3 aracı — o üçü (harness/build/tetik) bu dosya yazılmadan ÖNCE
 * onarıldı (commit 58adbad), çünkü belgenin sırası bağlayıcıydı:
 * "önce onar, sonra böl."
 *
 * KURALLAR (ADR-018):
 *   - Her üst düzey isim `Y` önekli.
 *   - Ana koda kanca sayısı ≤ 20. Bugün: 2 (updateStrikes + boşta sürüklenme).
 *   - harness.js'e TEK sembol açılıyor: `Yayla`. 214 sembollük liste
 *     150 yeni isimle şişmesin diye.
 *   - Sonsuz/Günlük mod DEĞİŞMİYOR (ADR-003, 008). Kancaların hepsi
 *     `G.yaylaAktif` ile korunuyor; kampanya kapalıyken tek satır fazla
 *     iş yapılmıyor ve davranış birebir eskisi.
 */
"use strict";

/* --- KOMUTLAR (ADR-020, ADR-023) ----------------------------------------
   Köpeğin komutları oyunun ASIL ilerleme kanalı: sayı değil FİİL.
   Konakta eğitimle öğreniliyor, sabahta sol kenardaki düğmelerle
   veriliyor.

   ÜÇ SLOT, DÖRT KOMUT — ve bu bir tasarım tercihi değil ÖLÇÜM sonucu:
   `docs/komut-dugmesi-yeri-olcumu.md` sol kenara üç 52px düğme sığdığını,
   dördüncüsünün baş parmak dinlenme yayına girdiğini (89px, yay 130px)
   ölçtü. Dördüncü komut kesilmedi; oyuncu dördünü ÖĞRENİYOR, konakta
   ÜÇÜNÜ seçip yola çıkıyor — ADR-020'nin iz slotlarıyla aynı dil. */
const Y_KOMUT = {
  dur:   { tr:'DUR',   en:'STAY',    bolum:2 },
  getir: { tr:'GETİR', en:'FETCH',   bolum:3 },
  sus:   { tr:'SUS',   en:'QUIET',   bolum:6 },
  savur: { tr:'SAVUR', en:'DRAW',    bolum:8 },
};
const Y_SLOT = 3;                       // ölçülmüş sınır, keyfi değil

/* Komut ne kadar sürer. DUR süresiz DEĞİL: oyuncu bir daha basana kadar
   ya da köpek başka bir işe zorlanana kadar. Süresiz bir "kapat" hâli
   oyuncunun unutup sabahı köpeksiz geçirmesine yol açar — ve bu ceza
   GÖRÜNMEZ olurdu, bu deponun yasakladığı şey (yaylanın dersi:
   "görünmeyen çarpan yasak"). O yüzden düğme basılı kaldığı sürece
   HUD'da işaretli duruyor (Y.syncHUD). */

const Yayla_ = {
  /* Kampanya açık mı. Sonsuz modda HER ZAMAN false — bütün kancalar
     bunun üstünden korunuyor. */
  aktif: false,

  ogrenilen: [],        // öğrenilmiş komut anahtarları
  tasinan: [],          // bu yola çıkarken taşınan (en fazla Y_SLOT)
  verilen: null,        // şu an verili komut ('dur' | ... | null)

  /* KAMPANYAYI AÇ/KAPAT — TEK GİRİŞ NOKTASI.
     İki bayrak var ve olmak zorunda: ana kod `G.yaylaAktif`i okuyor
     (kısa devre için, ve `Yayla` sabitine TDZ riski olmadan dokunmamak
     için), yayla.js kendi `aktif`ini okuyor. İkisini elle set etmek
     senkronsuzluk demek — ilk testimde tam bu oldu: `G.yaylaAktif` açık,
     `Yayla.aktif` kapalı, komut sessizce hiç verilmedi ve düğme yalan
     söyledi. O yüzden ikisini SADECE burası set ediyor. */
  ac(G){ this.aktif = true; if(G) G.yaylaAktif = true; },
  kapat(G){ this.aktif = false; this.verilen = null; if(G) G.yaylaAktif = false; },

  /* --- konak: öğrenme ve taşıma ---------------------------------------- */
  ogren(k){
    if(!Y_KOMUT[k] || this.ogrenilen.includes(k)) return false;
    this.ogrenilen.push(k);
    /* Yeni öğrenilen komut boş slot varsa kendiliğinden taşınır — oyuncu
       yeni bir şey öğrenip sonra onu takmayı unutmasın. Slotlar doluysa
       DOKUNULMUYOR: seçim oyuncunun. */
    if(this.tasinan.length < Y_SLOT) this.tasinan.push(k);
    return true;
  },
  tasi(k){
    if(!this.ogrenilen.includes(k)) return false;
    if(this.tasinan.includes(k)) return true;
    if(this.tasinan.length >= Y_SLOT) return false;   // önce birini çıkar
    this.tasinan.push(k);
    return true;
  },
  cikar(k){
    const i = this.tasinan.indexOf(k);
    if(i < 0) return false;
    this.tasinan.splice(i, 1);
    if(this.verilen === k) this.verilen = null;
    return true;
  },

  /* --- sabah: komut verme ---------------------------------------------- */
  /* Aynı düğmeye ikinci basış komutu KALDIRIR. Ayrı bir "bırak" düğmesi
     dördüncü bir hedef olurdu ve ölçüm üç sığdığını söylüyor. */
  ver(k){
    if(!this.aktif || !this.tasinan.includes(k)) return false;
    this.verilen = (this.verilen === k) ? null : k;
    return true;
  },
  birak(){ this.verilen = null; },

  /* --- ana koda kanca #1: köpek ataması ------------------------------- */
  /* updateStrikes'ın en başından çağrılıyor. `true` dönerse ana kodun
     otomatik ataması O KARE ÇALIŞMAZ.

     Bugün yalnız DUR uygulanıyor, ve bu kasıtlı bir kapsam kararı:
     DUR var olan sabah makinesinin üstünde tek başına çalışıyor. GETİR
     geride kalan koyun (yol sahnesi) olmadan, SUS ve SAVUR tehdit
     davranışına dokunmadan yazılamaz — ikisi de henüz yok. Aynı dikişten
     geçecekler; dikiş burada kanıtlanıyor. */
  updateKomut(G, dog){
    if(!this.aktif) return false;
    if(this.verilen !== 'dur') return false;
    /* Boğuşma DEVAM EDER: köpek kurda yetişmişse DUR onu kavgadan
       çekemez. Kavgayı yarıda kesmek "kurdu Kangal durdurur" cümlesini
       çiğner — kurşun durdurmuyor, tek durduran şey o. */
    if(G.dogTask && G.dogTask.phase === 'fight') return false;
    /* Atanmış ama henüz yetişmemiş bir iş varsa BIRAKILIYOR: oyuncu
       "dur" dediyse köpek gerçekten durmalı, yoksa düğme yalan söyler. */
    if(G.dogTask){ G.dogTask.claimed = false; G.dogTask = null; }
    return true;
  },

  /* --- ana koda kanca #2: boşta sürüklenme --------------------------- */
  /* Ana kod boştaki köpeği sürünün ortasına doğru sakin sakin çekiyor.
     DUR verildiyse o çekiş de durmalı — yoksa köpek "durdu" ama yavaşça
     kayıyor olur ve düğme yine yalan söyler. */
  bostaKilitli(){ return this.aktif && this.verilen === 'dur'; },

  /* --- HUD ------------------------------------------------------------- */
  /* Hangi düğme hangi slotta. Ölçülmüş üst değerler (ekran ortasına göre):
     -113 / -55 / +3. Sıra taşıma sırası. */
  hudSlotlari(){
    return this.tasinan.slice(0, Y_SLOT).map((k, i) => ({
      k, tr: Y_KOMUT[k].tr, en: Y_KOMUT[k].en, slot: i,
      verili: this.verilen === k,
    }));
  },

  /* --- kayıt ----------------------------------------------------------- */
  /* ADR-018 ölçümü: SAVE_V YÜKSELTİLMEYECEK — beyaz liste göçü zaten
     ücretsiz yapıyor, yükseltmek eski sürüme dönen oyuncunun kaydını
     siliyor. Bu yüzden kampanya verisi `Save.d.campaign` altında kendi
     alanında duruyor ve şeması burada. */
  kaydet(){
    return { ogrenilen: this.ogrenilen.slice(), tasinan: this.tasinan.slice() };
  },
  yukle(d){
    if(!d) return;
    this.ogrenilen = Array.isArray(d.ogrenilen) ? d.ogrenilen.filter(k => Y_KOMUT[k]) : [];
    this.tasinan = Array.isArray(d.tasinan)
      ? d.tasinan.filter(k => this.ogrenilen.includes(k)).slice(0, Y_SLOT) : [];
    this.verilen = null;
  },

  /* Ölçüm/test için: her şeyi başlangıca al. */
  sifirla(G){
    this.kapat(G); this.ogrenilen = []; this.tasinan = [];
    this.odun = 0; this.atesOdun = 0;
  },

  /* ===== GECE: GÖRÜNÜRLÜK SÖZLEŞMESİ (ADR-023 bölüm 2) ==================
     Gecenin tek mekaniği yok — gecenin mekaniği BİLGİ EKSİKLİĞİ
     (ADR-020: zorluk sayı büyütmekle değil bilgi eksiltmekle artar).
     Sözleşme: ateşin ışık çemberi İÇİNDEKİ tehdit GÖRÜNÜR, dışındaki
     yalnız DUYULUR. Oyuncu sese ateş eder.

     Odun gündüz yolda toplanıyor, gece yakılıyor. Çok odun = geniş
     çember = kolay gece; az odun = karanlık. Taşıdığın odun sırtında
     yer kaplıyor (yolculuk çıkını, ADR-004).

     NİYE BURADA ÇİZİM YOK: `==ART==` bloğunun kuralı "dışarıya
     bağlanamaz" ve 11 araç o bloğu kesip tek başına koşturuyor
     (tools/artizole.js). Gece perdesinin ÇİZİMİ ışık yığınına
     (dawnDark/drawGokIsik) dokunacağı için ayrı bir adım — ve o adım
     BASILAN KAREYE BAKILARAK yapılmalı, çünkü gece perdesi bir kez
     zaten güneşi boz-yeşile çevirmişti (docs/agil-gece-perdesi-olcum).
     Burada yalnız SÖZLEŞME var: yarıçap ve görünürlük hükmü. */
  ATES: {
    odunsuzR: 22,     // ateş yoksa/söndüyse: yalnız köpeğin dibi
    odunBasiR: 9,     // her odun çemberi bu kadar büyütür
    maxR: 108,        // tavan — ekranın yarısını aşarsa gece gece olmaz
    sonme: 0.02,      // her gece diliminde tükenen odun oranı ölçüsü
  },

  odun: 0,            // elde taşınan odun
  atesOdun: 0,        // ateşe atılmış (yanan) odun

  /* Işık çemberinin yarıçapı — TEK KAYNAK. Çizim de, görünürlük hükmü de,
     testler de buradan okuyor; ikinci bir yerde hesaplanırsa senkronsuz
     kalır (bu oturumda iki kez o hatanın bedeli ödendi). */
  isikR(){
    const a = this.ATES;
    return Math.min(a.maxR, a.odunsuzR + a.odunBasiR * Math.max(0, this.atesOdun));
  },

  /* Odun at: elden ateşe. Ateş büyür, sırttaki yük azalır. */
  odunAt(n){
    n = Math.max(0, Math.min(this.odun, n | 0));
    this.odun -= n; this.atesOdun += n;
    return n;
  },

  /* Bir tehdit GÖRÜNÜR mü? Çemberin dışı yalnız duyulur.
     Merkez ateş/köpek değil KONAK: ateş sabit, köpek gezer — köpeği
     merkez yapmak "köpeği gönderince ortalık kararıyor" gibi tuhaf bir
     davranış üretirdi. */
  gorunur(nesneX, nesneY, atesX, atesY){
    const dx = nesneX - atesX, dy = (nesneY - atesY) * 1.6;  // dikeyde daha dar: ışık yerde yayılır
    return Math.hypot(dx, dy) <= this.isikR();
  },

  /* Görünmeyen tehdit için DUYULABİLİR yön. Oyuncuya verilen tek bilgi:
     hangi taraftan. Mesafe VERİLMİYOR — verilirse karanlığın anlamı
     kalmaz. */
  duyulanYon(nesneX, atesX){
    return nesneX < atesX ? 'sol' : 'sag';
  },

  KOMUT: Y_KOMUT,
  SLOT: Y_SLOT,
};

/* harness.js'e açılan TEK sembol (ADR-018). */
const Yayla = Yayla_;
/* ==YAYLA-END== */
