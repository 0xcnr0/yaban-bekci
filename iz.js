/* ==IZ-START==
   İZLER — ilerleyişin üçüncü kanalı (ADR-020).
   ---------------------------------------------------------------------
   ADR-020'nin cümlesi: *"İzler — isimli tehditlerden, direnç/zaaf
   TAKASIYLA. Slot sınırlı (2-3): bir izi takmak diğerini çıkarmak
   demek. Build değil KİMLİK."*

   ÜÇ BAĞLAYICI KURAL VE KODDAKİ KARŞILIKLARI:

   1. **KARŞILAŞMAYLA KAZANILIR, USTALIKLA DEĞİL** (ADR-010: "ustalık
      ödül almaz"). Bu yüzden `kazan(k)` hiçbir performans argümanı
      ALMIYOR — nişan isabeti, kaç koyun kurtardığın, kaç atış yaptığın
      buraya hiç girmiyor. İyi nişancı daha çok iz alamaz; izi ALDIRAN
      şey karşılaşmanın kendisidir. (Testle kilitli.)

   2. **BEDAVA İZ YOK** (ADR-007). Her izin `verir` ve `alir` alanı
      DOLU olmak zorunda; boş bırakılan bir iz tanımlanamaz (yükleme
      sırasında elenir, ve testle kilitli). Takas tasarımın kendisi:
      bir izi takmak bir zaafı da takmaktır.

   3. **SLOT SINIRLI.** Takılı iz sayısı `SLOT`u geçemez; yeni bir iz
      takmak eskisini ÇIKARMAYI gerektirir. "Build değil kimlik" cümlesi
      burada: hepsini birden taşıyamıyorsun.

   ÇİFT KAYNAK YOK: kazanılan ve takılı izler yalnız burada; oyun
   etkisini `etki()`den okur, kendi kopyasını tutmaz.
   SESSİZDE OYNANABİLİRLİK: bu dosya ses çağırmıyor; takılı izler
   konakta görünür (ADR-014: nesne olarak).
   ------------------------------------------------------------------ */
'use strict';

/* İz tablosu. `kaynak` izi BIRAKAN karşılaşma (ADR-025'in üç isimli
   karakteri). `etki` makine tarafından okunur; `verir`/`alir` oyuncuya
   anlatılan yüzü.

   ETKİ SÖZLÜĞÜ — küçük ve somut tutuldu ki çağıran belirsizlik
   yaşamasın:
     erkenUyari   : tehdit kaç KARE önce görünür olur (+)
     sagimTavan   : günlük sağım tavanına eklenen fark (-)
     savurYipranma: SAVUR'un köpeği yıpratma çarpanına eklenen fark (+)
     yerGecikme   : yer tehdidinin fark edilmesi kaç kare GECİKİR (+)
     suruToplanir : büyük tehditte sürü kendiliğinden toplanır (bool) */
/* TEK DİL: İngilizce (2026-08-20). Ve asıl iş çeviri değil SADELEŞTİRME:
   cümleler artık ne KAZANDIĞINI ve ne KAYBETTİĞİNİ düz söylüyor.

   Eskisi çoban ağzıydı ve mecazlıydı: "The dog catches the scent — threats
   show earlier" güzel ama oyuncu SAYISAL olarak ne değiştiğini bilmiyor.
   Yeni kural: her cümle kısa, özne belli ('your dog', 'your flock'), ve
   etkinin oyuncuya dokunan hâli yazılı ('one less milk each day').

   İKİ TEKNİK ŞART: em-tire ('—') ve eğik tırnak YOK — oyunun 5x7 bitmap
   fontunda o karakterler yok, ASCII kalmak zorundayız. Kesme işaretli
   sahiplik ("Blackfoot's Trail") da bu yüzden düştü. */
const IZLER = {
  karaayakIzi: {
    en: 'Blackfoot Scent', kaynak: 'karaayak',
    verir: { en: 'Your dog smells danger first. Threats appear earlier.' },
    alir:  { en: 'The flock is nervous. You get one less milk each day.' },
    etki: { erkenUyari: 45, sagimTavan: -1 },
  },
  ayiKorkusu: {
    en: 'Bear Fear', kaynak: 'ayi',
    verir: { en: 'Your flock huddles together when a big threat comes.' },
    alir:  { en: 'Your dog is jumpy. CHARGE tires it out faster.' },
    etki: { suruToplanir: true, savurYipranma: 0.5 },
  },
  kartalGolgesi: {
    en: 'Eagle Shadow', kaynak: 'kartal',
    verir: { en: 'You watch the sky. Diving attacks show up earlier.' },
    alir:  { en: 'Your eyes are up. You spot ground threats late.' },
    etki: { erkenUyari: 30, yerGecikme: 25 },
  },
};

const Iz_ = {
  IZLER,
  /* ADR-020 "2-3" diyor; 2 seçildi çünkü takas ancak seçim ACITINCA
     tasarım olur — üç izin üçünü birden taşıyabilseydi takas yok olurdu.
     Komut slotu 3 (Y_SLOT) ile bilerek AYNI DEĞİL: komutlar araçtır,
     izler kimliktir. KARAR GEREKİR md.1 — sahibi 3 isterse tek satır. */
  SLOT: 2,

  kazanilan: [],   // öğrenilmiş iz anahtarları
  takili: [],      // şu an takılı olanlar (<= SLOT)

  /* --- KAZANMA — performans argümanı YOK (ADR-010) ------------------ */
  kazan(k){
    if(!IZLER[k]) return false;
    if(this.kazanilan.indexOf(k) >= 0) return false;   // aynı iz iki kez kazanılmaz
    this.kazanilan.push(k);
    /* Boş slot varsa kendiliğinden takılır — oyuncuyu ilk izde bir
       menüye zorlamamak için. İkinci izden sonra seçim OYUNCUNUN. */
    if(this.takili.length < this.SLOT) this.takili.push(k);
    return { iz: k, takildi: this.takili.indexOf(k) >= 0 };
  },

  /* --- TAKMA / ÇIKARMA --------------------------------------------- */
  tak(k){
    if(!IZLER[k]) return false;
    if(this.kazanilan.indexOf(k) < 0) return false;    // kazanılmamış iz takılamaz
    if(this.takili.indexOf(k) >= 0) return false;
    if(this.takili.length >= this.SLOT) return false;  // önce birini çıkar
    this.takili.push(k);
    return true;
  },
  cikar(k){
    const i = this.takili.indexOf(k);
    if(i < 0) return false;
    this.takili.splice(i, 1);
    return true;
  },
  yerVar(){ return this.takili.length < this.SLOT; },

  /* --- ETKİ — takılı izlerin toplamı ------------------------------- */
  etki(){
    const o = { erkenUyari: 0, sagimTavan: 0, savurYipranma: 0, yerGecikme: 0, suruToplanir: false };
    for(const k of this.takili){
      const e = IZLER[k] && IZLER[k].etki;
      if(!e) continue;
      if(e.erkenUyari) o.erkenUyari += e.erkenUyari;
      if(e.sagimTavan) o.sagimTavan += e.sagimTavan;
      if(e.savurYipranma) o.savurYipranma += e.savurYipranma;
      if(e.yerGecikme) o.yerGecikme += e.yerGecikme;
      if(e.suruToplanir) o.suruToplanir = true;
    }
    return o;
  },

  /* Oyuncuya gösterilecek liste: kazanılmış her iz, takılı mı, ne
     veriyor, ne alıyor. Konak ekranı bunu okur. */
  liste(){
    const d = 'en';
    return this.kazanilan.map(k => ({
      k, ad: IZLER[k][d], takili: this.takili.indexOf(k) >= 0,
      verir: IZLER[k].verir[d], alir: IZLER[k].alir[d],
    }));
  },

  /* Takılı izler konakta NESNE olarak: bir kayışa geçirilmiş
     nişanlar. Dolu nişan = takılı iz, boş yuva = kullanılmamış slot.
     Sayı yazılmıyor. */
  ciz(g, x, y){
    px(g, x, y + 2, this.SLOT * 8 + 2, 2, '#483436');         // kayış
    for(let i = 0; i < this.SLOT; i++){
      const dolu = i < this.takili.length;
      px(g, x + 1 + i * 8, y, 6, 6, dolu ? '#c99474' : '#2e2028');
      if(dolu) px(g, x + 1 + i * 8, y, 6, 1, '#dfd6c7');
    }
  },

  /* --- kayıt -------------------------------------------------------- */
  kaydet(){
    return { kazanilan: this.kazanilan.slice(), takili: this.takili.slice() };
  },
  yukle(d){
    /* Kurcalamaya dayanıklı: tanınmayan anahtar, kazanılmamış takı ve
       slot aşımı elenir. */
    this.kazanilan = (d && Array.isArray(d.kazanilan) ? d.kazanilan : []).filter(k => IZLER[k]);
    this.takili = (d && Array.isArray(d.takili) ? d.takili : [])
      .filter(k => IZLER[k] && this.kazanilan.indexOf(k) >= 0)
      .slice(0, this.SLOT);
  },
  sifirla(){ this.kazanilan = []; this.takili = []; },
};

function px(g, x, y, w, h, renk){
  g.fillStyle = renk;
  g.fillRect(Math.round(x), Math.round(y), Math.max(1, Math.round(w)), Math.max(1, Math.round(h)));
}

const Iz = Iz_;
if (typeof module !== 'undefined' && module.exports) module.exports = Iz;
/* ==IZ-END== */
