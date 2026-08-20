/* ==ALET-START==
   ALET BAKIMI — tüfek kirlenir, temizlenmezse tutukluk yapar.
   ---------------------------------------------------------------------
   Tasarımın cümlesi (`ilerleyis-tehdit-yanis-taslak.md` §3.6):
     "Tüfek kirlenir. Temizlemezsen TUTUKLUK başlar: önce nadiren, sonra
      sık. Temizlik bir gece yuvası yer. Hiçbir şey olmuyor gibi görünen
      ama ihmal edilince acıtan bir baskı."

   ÜÇ TASARIM KARARI, hepsi bir ADR'ye bağlı:

   1. **BAŞLANGIÇTA HİÇBİR ŞEY OLMUYOR.** `TEMIZ_ESIK`in altında tutukluk
      şansı SIFIR — rastgele değil, sıfır. Oyuncu ilk günlerde bu sistemi
      hiç fark etmiyor; baskı ancak ihmal edilince doğuyor. Tasarımın
      "hiçbir şey olmuyor gibi görünen" cümlesi bu.
   2. **TEMİZLİK BEDAVA DEĞİL** (ADR-007): bir yuva yiyor, yani o sabah
      sağamadığın süt. Bedeli bu dosya ALMAZ — `yuvaHarca` çağıranın işi;
      burada yalnız "temizlendi" durumu var.
   3. **KİR ATIŞLA ARTIYOR, ustalıkla değil.** Çok ateş eden çok
      kirletiyor; iyi nişancı AZ ateş ettiği için daha az kirletiyor.
      Bu bir ödül değil, fiilin doğal sonucu — ADR-010'un "ustalık ödül
      almaz" kuralını çiğnemiyor, çünkü kazanılan bir şey yok, yalnız
      harcanmayan bir şey var.

   SESSİZDE OYNANABİLİRLİK: tutukluk görselde de var (bu dosya ses
   çağırmıyor); kirin seviyesi konakta NESNE olarak okunuyor (ADR-014).

   ÇİFT KAYNAK YOK: `kir` yalnız burada. Kayıt şeması `kaydet/yukle`.
   ------------------------------------------------------------------ */
'use strict';

const Alet_ = {
  /* --- ölçülmedi, HİS DÜĞMESİ (raporda da böyle yazılı) ------------- */
  TEMIZ_ESIK: 6,     // bu kirin altında tutukluk YOK
  KIR_TAVAN: 20,     // birikimin tavanı
  SANS_ADIM: 0.025,  // eşiğin üstündeki her kir biriminin kattığı şans
  SANS_TAVAN: 0.30,  // en kötü hâlde bile atışların %70'i tutuyor
  ATIS_BOLEN: 12,    // her N atış bir ek kir

  kir: 0,

  /* Bir sabah bitti. `atis` o sabah kaç kez ateş edildiği.
     Taban 1 + atış payı: hiç ateş etmeyen bile azıcık kirletir (nem,
     toz), çok ateş eden çok. */
  sabahBitti(atis){
    const ek = 1 + Math.floor(Math.max(0, atis | 0) / this.ATIS_BOLEN);
    this.kir = Math.min(this.KIR_TAVAN, this.kir + ek);
    return this.kir;
  },

  /* Tutukluk şansı 0..1. Eşiğin altında TAM SIFIR. */
  tutuklukSansi(){
    const asim = this.kir - this.TEMIZ_ESIK;
    if(asim <= 0) return 0;
    return Math.min(this.SANS_TAVAN, asim * this.SANS_ADIM);
  },

  /* Ana kod ateş yolunda çağırır: bu atış tutukluk yaptı mı?
     `rnd` dışarıdan verilebilir (test için); verilmezse Math.random. */
  tutuklukMu(rnd){
    const s = this.tutuklukSansi();
    if(s <= 0) return false;
    return ((typeof rnd === 'function') ? rnd() : Math.random()) < s;
  },

  /* Temizlik. Yuvayı ÇAĞIRAN harcar (ADR-007 bedeli orada ödenir);
     burada yalnız kir sıfırlanır. Zaten temizse false döner ki çağıran
     boşa yuva yakmasın. */
  temizle(){
    if(this.kir === 0) return false;
    const onceki = this.kir;
    this.kir = 0;
    return { onceki, kir: 0 };
  },

  /* Görsel/anlatı durumu — dört kademe. Sayı DEĞİL, bir hâl.
     Konak ekranı bunu okuyup tüfeği ona göre çiziyor. */
  /* Durum, RİSKİN KENDİSİNDEN türetiliyor — eşik sayısından değil.
     Eskiden `kir < TEMIZ_ESIK` diye bakıyordu ve kir tam 6 iken durum
     'kirli' oluyordu, oysa o noktada tutukluk şansı hâlâ TAM SIFIR.
     Bir adım erken "tehlikedesin" diyordu; artık tehlike başlayınca
     diyor. */
  hal(){
    if(this.kir === 0) return 'temiz';
    const s = this.tutuklukSansi();
    if(s <= 0) return 'tozlu';                           // hâlâ tutukluk YOK
    if(s < this.SANS_TAVAN) return 'kirli';
    return 'tikali';
  },

  /* OYUNCUYA SÖYLENECEK TEK SATIR — ateş etmeden ÖNCE.
     Sebebi ölçüldü (docs/gece-okunabilirlik.md): tüfeğin kiri oyunda
     HİÇBİR YERDE çizilmiyordu (`Alet.ciz` yalnız testten çağrılıyor) ve
     tek geri bildirim tutukluk anındaki mesajdı. Yani ceza başlamadan
     önce hiçbir uyarı yoktu — bu deponun "görünmeyen ceza" yasağının ta
     kendisi.

     Metin ASCII: bitmap fontta em-tire ve Türkçe harf yok. */
  UYARI: {
    tozlu:  'THE RIFLE IS GETTING DIRTY',
    kirli:  'THE RIFLE MAY JAM. CLEAN IT',
    tikali: 'THE RIFLE JAMS OFTEN NOW',
  },
  uyari(){ return this.UYARI[this.hal()] || ''; },
  /* Tutukluk şansı yüzde olarak — çağıran isterse gösterir. */
  riskYuzde(){ return Math.round(this.tutuklukSansi() * 100); },

  /* Konakta asılı tüfeğin kir göstergesi — namlu boyunca ilerleyen bir
     kurum bandı. Sayı yazılmıyor: bant ne kadar yükselirse o kadar kirli.
     ÇİZİM ÇAĞRILDI MI testi çağıranın tarafında (bkz. rapor). */
  ciz(g, x, y, boy){
    const h = Math.max(6, boy | 0 || 14);
    const oran = this.KIR_TAVAN ? Math.min(1, this.kir / this.KIR_TAVAN) : 0;
    const kurum = Math.round(h * oran);
    px(g, x, y, 2, h, '#604342');                      // namlu
    px(g, x, y, 1, h, '#89615a');                      // ışık alan yüzü
    if(kurum > 0) px(g, x, y + h - kurum, 2, kurum, '#2e2028');
    if(this.hal() === 'tikali') px(g, x - 1, y + h - 2, 4, 2, '#101018');
  },

  /* --- kayıt (Yayla.kaydet içine gömülecek) ------------------------- */
  kaydet(){ return { kir: this.kir | 0 }; },
  yukle(d){
    this.kir = (d && typeof d.kir === 'number')
      ? Math.max(0, Math.min(this.KIR_TAVAN, d.kir | 0)) : 0;
  },
  sifirla(){ this.kir = 0; },
};

function px(g, x, y, w, h, renk){
  g.fillStyle = renk;
  g.fillRect(Math.round(x), Math.round(y), Math.max(1, Math.round(w)), Math.max(1, Math.round(h)));
}

const Alet = Alet_;
if (typeof module !== 'undefined' && module.exports) module.exports = Alet;
/* ==ALET-END== */
