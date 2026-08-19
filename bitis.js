/* ==BITIS-START==
   BİTİŞ EKRANI — yolculuk bitti.
   ---------------------------------------------------------------------
   İKİ SON, TEK EKRAN (liderin şartı):
     'vardi'      — halka kapandı, EVE VARILDI. Kutlama değil, DÖNÜŞ.
     'suru-bitti' — yolculuk orada bitti.
   İkisi aynı yerleşimin iki hâli; ayrı ekran değil. Fark ışıkta ve
   sağdaki EŞİKTE: vardıysan kapı orada, bittiyse yol boş.

   ADR-005: leaderboard DEĞİL, sonuç paylaşım kartı. **Skor ve sıralama
   YOK** — bu dosyada tek bir puan hesabı geçmiyor.

   ADR-008'İN TEK GERÇEK KARŞILIĞI — kayıp İSİMLE anlatılıyor:
   sürü hattında sekiz isimli koyunun HEPSİ duruyor. Hayatta olanlar
   kendi sprite'larıyla; KAYBEDİLENLER aynı siluetin OYUĞU olarak, yani
   yerleri boş değil, BOŞLUKLARI hayvan biçiminde. "Üç koyun kaybettin"
   bir sayıdır; Çıngıraklı'nın yerinde onun biçiminde bir delik görmek
   değildir. (Sprite verisi Yayla.BIREY'den okunuyor, kopyalanmıyor.)

   ÜÇ KAYIT (ADR-014): bitiş **"yaşadığın yer"** kaydında — kışlak
   töreninin kardeşi, sessiz. Zafer fanfarı yok; bu dosya ses çağırmıyor.
   ERİŞİLEBİLİRLİK: her şey görselde, sessizde kayıp yok.
   ------------------------------------------------------------------ */
'use strict';

const Bitis_ = {
  W: 320, H: 180,

  /* İKİNCİ ÖLÇÜ — ilk basımda İKİ kusur karede görüldü:
     (1) SURU.y 118 iken zemin 132'deydi, yani koyunlar hattın 14 piksel
         ÜSTÜNDE, havada duruyordu;
     (2) zemin bandı 48 piksel kalınlığında boş bir şerittı ve alt yarıyı
         yutuyordu.
     Zemin indi, sürü hatta OTURDU, tasma zemine yerleşti. */
  ZEMIN: 142,                  // sürünün durduğu hat
  HALKA: { x: 96, y: 30, adim: 13 },   // on durak izi
  SURU:  { x: 40, y: 143, adim: 30 },  // sekiz birey — ayakları hatta
  ESIK:  { x: 276, y: 104 },           // eve varış kapısı (yalnız 'vardi')
  TASMA: { x: 22, y: 158 },            // köpeğin öğrendikleri

  PAL: {
    gokVardi:  '#3a2a3a',
    gokBitti:  '#1b1620',
    zeminVardi:'#604342',
    zeminBitti:'#2e2028',
    centik:    '#F8D878',
    centikBos: '#38282e',
    oyuk:      '#101018',      // kaybedilenin biçimindeki delik
    oyukKenar: '#483436',
    kapi:      '#89615a',
    kapiKoyu:  '#483436',
    ad:        '#89615a',
    adKayip:   '#775752',
    tasma:     '#c99474',
    tasmaBos:  '#38282e',
  },

  /* ===== DURUM — Yayla + hayatta kalan sürüden TÜRETİLİR ==============
     `flock` hayatta kalan hayvanlar (id alanı yeter). Ekran hiçbir şeyin
     kopyasını tutmaz.
     Dönüş: { son, centik, toplam, bireyler:[{k, ad, yasiyor}], kayipSayi } */
  durum(Y, flock){
    if(!Y) return { son: null, centik: 0, toplam: 0, bireyler: [], kayipSayi: 0 };
    const sf = Y.sefer || {};
    const toplam = (Y.SEFER || []).length || 10;
    const centik = Array.isArray(sf.centik) ? sf.centik.length : 0;
    const yasayanId = {};
    for(const a of (flock || [])) if(a && a.id != null) yasayanId[a.id] = true;
    /* Kimlik haritası ters çevriliyor: hangi birey hangi hayvandaydı. */
    const bireyler = [];
    const harita = Y.bireyler || {};
    const B = Y.BIREY || {};
    const sira = Object.keys(B);
    for(const k of sira){
      let atandi = false, yasiyor = false;
      for(const id in harita){
        if(harita[id] !== k) continue;
        atandi = true;
        if(yasayanId[id]) yasiyor = true;
      }
      if(!atandi) continue;              // bu sefer bu kimlik hiç dağıtılmamış
      bireyler.push({ k, ad: B[k] && B[k].tr, en: B[k] && B[k].en, yasiyor });
    }
    return {
      son: sf.bitti || null,
      centik, toplam, bireyler,
      kayipSayi: bireyler.filter(b => !b.yasiyor).length,
    };
  },

  /* ===== ÇİZİM ======================================================== */
  ciz(g, Y, flock, opts){
    const o = opts || {};
    const d = this.durum(Y, flock);
    const vardi = d.son === 'vardi';
    this.cizZemin(g, vardi);
    this.cizHalka(g, d);
    this.cizSuru(g, Y, d, o);
    this.cizTasma(g, Y);
    if(vardi) this.cizEsik(g);
    return d;
  },

  cizZemin(g, vardi){
    const P = this.PAL;
    this.px(g, 0, 0, this.W, this.ZEMIN, vardi ? P.gokVardi : P.gokBitti);
    this.px(g, 0, this.ZEMIN, this.W, this.H - this.ZEMIN, vardi ? P.zeminVardi : P.zeminBitti);
    this.px(g, 0, this.ZEMIN, this.W, 1, vardi ? P.kapi : P.oyukKenar);
  },

  /* Halkanın ne kadarı kapandı — on iz, dolu olanlar çentikli.
     Kasnağın KENDİSİ çizilmiyor: o nesne rota tahtasının (rota.js),
     burada yalnız kaydı okunuyor. Aynı nesneyi iki dosyada çizmek
     "çift kaynak"ın görsel hâli olurdu. */
  cizHalka(g, d){
    const P = this.PAL, H = this.HALKA;
    for(let i = 0; i < d.toplam; i++){
      const x = H.x + i * H.adim;
      const dolu = i < d.centik;
      this.px(g, x, H.y, 3, 9, dolu ? P.centik : P.centikBos);
      if(dolu) this.px(g, x, H.y, 3, 2, '#dfd6c7');
    }
  },

  /* Sürü hattı — sekiz isimli koyun. Yaşayan kendi sprite'ıyla,
     kaybedilen kendi BİÇİMİNDEKİ oyukla. */
  cizSuru(g, Y, d, o){
    const S = this.SURU, P = this.PAL;
    const B = (Y && Y.BIREY) || {};
    for(let i = 0; i < d.bireyler.length; i++){
      const b = d.bireyler[i];
      const sp = B[b.k];
      const x = S.x + i * S.adim, y = S.y - ((sp && sp.h) || 11);
      if(b.yasiyor) this.cizSprite(g, sp, x, y, null);
      else {
        this.cizSprite(g, sp, x, y, P.oyuk);            // biçim duruyor, hayvan yok
        this.cizSprite(g, sp, x - 1, y, P.oyukKenar, true);
      }
      if(typeof o.yaz === 'function'){
        const ad = (o.dil === 'en' ? b.en : b.ad) || b.k;
        o.yaz(g, ad, x + ((sp && sp.w) || 17) / 2, S.y + 4, b.yasiyor ? P.ad : P.adKayip);
      }
    }
  },

  /* Y_BIREY satırlarını basar. `zorla` verilirse tek tonda (oyuk).
     `yalnizKenar` yalnız dış hattı çizer — oyuğun kenarı için. */
  cizSprite(g, sp, x, y, zorla, yalnizKenar){
    if(!sp || !sp.rows) return;
    for(let ry = 0; ry < sp.h; ry++){
      const satir = sp.rows[ry];
      for(let rx = 0; rx < sp.w; rx++){
        const ch = satir[rx];
        if(ch === '.') continue;
        if(yalnizKenar){
          const bos = (dx, dy) => {
            const sy = ry + dy, sx = rx + dx;
            if(sy < 0 || sy >= sp.h || sx < 0 || sx >= sp.w) return true;
            return sp.rows[sy][sx] === '.';
          };
          if(!(bos(1,0) || bos(-1,0) || bos(0,1) || bos(0,-1))) continue;
        }
        const renk = zorla || (sp.pal && sp.pal[ch]);
        if(!renk) continue;
        this.px(g, x + rx, y + ry, 1, 1, renk);
      }
    }
  },

  /* Köpeğin tasması: öğrenilen her komut için bir toka.
     Köpeğin KENDİSİ burada çizilmiyor — sprite'ı index.html'in ART
     bloğunda ve orası bu oturumun bölgesi değil; çağıran çizer. */
  cizTasma(g, Y){
    const P = this.PAL, T = this.TASMA;
    const komutlar = (Y && Y.KOMUT) ? Object.keys(Y.KOMUT) : [];
    const ogrenilen = (Y && Y.ogrenilen) || [];
    this.px(g, T.x, T.y, komutlar.length * 7 + 2, 5, '#483436');
    for(let i = 0; i < komutlar.length; i++)
      this.px(g, T.x + 1 + i * 7, T.y + 1, 5, 3,
              ogrenilen.indexOf(komutlar[i]) >= 0 ? P.tasma : P.tasmaBos);
  },

  /* Eşik — yalnız EVE VARILDIYSA. Kapının açık olması "dönüş"ün
     kendisi; kutlama değil, bir kapı. */
  cizEsik(g){
    const P = this.PAL, E = this.ESIK;
    this.px(g, E.x, E.y, 4, this.ZEMIN - E.y, P.kapiKoyu);
    this.px(g, E.x + 20, E.y, 4, this.ZEMIN - E.y, P.kapiKoyu);
    this.px(g, E.x, E.y, 24, 3, P.kapi);
  },

  px(g, x, y, w, h, renk){
    g.fillStyle = renk;
    g.fillRect(Math.round(x), Math.round(y), Math.max(1, Math.round(w)), Math.max(1, Math.round(h)));
  },
};

const Bitis = Bitis_;
if (typeof module !== 'undefined' && module.exports) module.exports = Bitis;
/* ==BITIS-END== */
