/* ==BITIS-START==
   EPİLOG — yolculuk bitti.
   ---------------------------------------------------------------------
   NE DEĞİŞTİ (2026-08-20, docs/plan-tek-mod.md Faz 5). Önceki hâl bir
   MANZARAYDI: ufuk çizgisi, sürü hattı, kapı. Güzeldi ama sonucu SAYIYLA
   söylüyordu. Üç ayrı danışma aynı yere çıktı: bu oyunun duygusal
   karşılığı sayıda değil İSİMDE. O yüzden ekran artık bir manzara değil
   bir ANMA — kaybedilenlerin adı alt alta yazılı.

   YAŞAYAN SAYIDIR, KAYBEDİLEN İSİMDİR. Üstte tek satır hesap ("6 of 9
   came home"), altında kaybedilenlerin listesi. Sağ kalanları tek tek
   saymıyoruz; kimse yaşayanları anmaz.

   KORUNAN TEK GÖRSEL FİKİR: kaybedilen, kendi BİÇİMİNDEKİ oyuk olarak
   duruyor — adının yanında hayvan biçiminde bir delik. "Üç koyun
   kaybettin" bir sayıdır; Bell'in yerinde onun biçiminde bir delik
   görmek değildir.

   İKİ SON:
     'vardi'      — yolculuk tamamlandı. Kutlama değil HESAP.
     'suru-bitti' — SERT SON (sahibinin kararı): *"Çoban eve sürüsüz
                    döner. Yolculuk biter, 'yeniden dene'ye dönüşmez."*
                    Bu dosya hiçbir "tekrar dene" çağrısı çizmez; yalnız
                    yeni yolculuğun YENİ bir sürüyle başladığını söyler.

   NEREDE KAYBEDİLDİĞİ — UYDURULMUYOR. İstenen biçim "Bell dere konağında
   kurda kapıldı" idi, ama hangi hayvanın hangi durakta kaybolduğunu
   tutan bir alan OYUNDA YOK (docs/yoldefteri.md'de de işaretlenmişti).
   Olmayan veriyi uydurmak, oyuncuya yanlış bir kayıt göstermek olurdu.
   Bu yüzden:
     · veri yoksa satır yalnız ADI taşır — yine de bir anma,
     · `Y.kayipKayit` (id -> bölüm no) VARSA satır kendiliğinden
       "BELL - CANYON MOUTH" hâline gelir.
   Yani ekran bugün çalışıyor, veri gelince kendiliğinden zenginleşiyor.
   Çağrı imzası DEĞİŞMİYOR: alan `Yayla` üzerinden okunuyor.

   ADR-005: skor ve sıralama YOK. ADR-014: bu ekran "yaşadığın yer"
   kaydında, sessiz — bu dosya ses çağırmıyor, zafer fanfarı yok.
   Sessizde hiçbir bilgi kaybolmuyor.
   ------------------------------------------------------------------ */
'use strict';

const Bitis_ = {
  W: 320, H: 180,

  /* YERLEŞİM — ölçüyle. Font 5x7 bitmap, adım 6px; satır 7 piksel yüksek.
     Sekiz isimli birey var (Y_BIREY), yani liste EN ÇOK 8 satır. 12'şer
     piksellik satırla 8 satır y50..y145 arasına oturuyor ve alt bandın
     üstünde 19 piksel boşluk kalıyor. Yani "en çok N isim + N tane daha"
     kırpmasına GEREK YOK: hepsi sığıyor. (Yine de bir gün birey sayısı
     artarsa diye kırpma kodu duruyor, ama bugün hiç çalışmıyor.) */
  BASLIK_Y: 14, ALT_BASLIK_Y: 24,
  AYRAC_Y: 34,
  /* Liste DİKEYDE ORTALANIYOR. İlk basımda y56'ya sabitti ve üç isimlik
     bir listede ekranın alt yarısı bomboş kalıyordu. Blok yüksekliği
     başlık + satır sayısı; boşluk ikiye bölünüyor. */
  ROLL_UST: 44, ROLL_DIP: 150,
  ROLL_ADIM: 12, MAX_SATIR: 8,
  SIL_X: 18,                   // oyuk siluetinin sol kenarı
  AD_X: 42,                    // adın sol kenarı
  SURU_Y: 96,                  // kayıpsız turda yaşayan sürü hattı
  DIP1_Y: 158, DIP2_Y: 168,    // kapanış satırları

  PAL: {
    gokVardi:   '#2e2028',
    gokBitti:   '#151119',
    ayrac:      '#483436',
    baslik:     '#dfd6c7',
    altBaslik:  '#89615a',
    rollBaslik: '#775752',
    ad:         '#c99474',
    yer:        '#775752',
    oyuk:       '#0b0a0e',     // kaybedilenin biçimindeki delik
    oyukKenar:  '#483436',
    centik:     '#F8D878',
    centikBos:  '#38282e',
    tasma:      '#c99474',
    tasmaBos:   '#38282e',
  },

  /* Tek dil: İngilizce (2026-08-20). Sade tutuldu; ölçüt "çobanlık
     bilmeyen biri anlayacak". ASCII: em-tire ve eğik tırnak YOK. */
  S: {
    hepsi:    'ALL {n} CAME HOME.',
    kismi:    '{a} OF {n} CAME HOME.',
    hicbiri:  'YOU CAME HOME WITHOUT THEM.',
    yolTamam: 'YOU WALKED THE WHOLE ROAD.',
    yeniSuru: 'A NEW JOURNEY STARTS WITH A NEW FLOCK.',
    temiz:    'NOT ONE OF THEM WAS LOST.',
    kayipBas: 'LOST ALONG THE WAY',
    dahaVar:  'AND {n} MORE',
    ogrendi:  'YOUR DOG LEARNED: {k}',
    kadar:    'YOU GOT AS FAR AS {yer}.',
  },
  s(k, d){
    let m = this.S[k] || '';
    for(const a in (d || {})) m = m.split('{' + a + '}').join(String(d[a]));
    return m;
  },

  /* Yazı geri çağrımı metni x'e GÖRE ORTALAR (index.html'deki textC).
     Liste satırları SOLA yaslı olmalı, o yüzden genişlik gerekiyor:
     `opts.yaziEn` verilirse o kullanılır, verilmezse oyunun kendi sabit
     adımından hesaplanır (5x7 font, 6px adım). */
  ADIM: 6,
  en(metin, o){
    if(o && typeof o.yaziEn === 'function') return o.yaziEn(String(metin));
    return String(metin).length * this.ADIM - 1;
  },
  yazSol(g, o, metin, xSol, y, renk){
    o.yaz(g, metin, xSol + this.en(metin, o) / 2, y, renk);
  },

  /* ===== DURUM — Yayla + hayatta kalan sürüden TÜRETİLİR ==============
     `flock` hayatta kalan hayvanlar (id alanı yeter). Ekran hiçbir şeyin
     kopyasını tutmaz.
     Dönüş: { son, centik, toplam, bireyler:[{k, ad, yasiyor, yer}], kayipSayi }
     `yer` yalnız `Y.kayipKayit` varsa dolar; yoksa null (uydurulmaz). */
  durum(Y, flock){
    if(!Y) return { son: null, centik: 0, toplam: 0, bireyler: [], kayipSayi: 0 };
    const sf = Y.sefer || {};
    const SEFER = Y.SEFER || [];
    const toplam = SEFER.length || 10;
    const centik = Array.isArray(sf.centik) ? sf.centik.length : 0;
    const yasayanId = {};
    for(const a of (flock || [])) if(a && a.id != null) yasayanId[a.id] = true;
    /* Kimlik haritası ters çevriliyor: hangi birey hangi hayvandaydı. */
    const bireyler = [];
    const harita = Y.bireyler || {};
    const kayit = Y.kayipKayit || null;
    const B = Y.BIREY || {};
    for(const k of Object.keys(B)){
      let atandi = false, yasiyor = false, olenId = null;
      for(const id in harita){
        if(harita[id] !== k) continue;
        atandi = true;
        if(yasayanId[id]) yasiyor = true;
        else if(olenId === null) olenId = id;
      }
      if(!atandi) continue;              // bu sefer bu kimlik hiç dağıtılmamış
      let yer = null;
      if(!yasiyor && kayit && olenId !== null){
        const b = kayit[olenId] | 0;
        if(b >= 1 && SEFER[b - 1] && SEFER[b - 1].ad) yer = SEFER[b - 1].ad;
      }
      bireyler.push({ k, ad: (B[k] && B[k].en) || k, yasiyor, yer });
    }
    return {
      son: sf.bitti || null,
      centik, toplam, bireyler,
      kayipSayi: bireyler.filter(b => !b.yasiyor).length,
    };
  },

  /* ===== ÇİZİM ========================================================
     İmza DEĞİŞMEDİ: index.html `Bitis.ciz(g, Yayla, aliveFlock(), {...})`
     diye çağırıyor ve çağrılmaya devam edecek. */
  ciz(g, Y, flock, opts){
    const o = opts || {};
    const d = this.durum(Y, flock);
    const vardi = d.son === 'vardi';
    this.px(g, 0, 0, this.W, this.H, vardi ? this.PAL.gokVardi : this.PAL.gokBitti);
    if(typeof o.yaz === 'function'){
      this.cizBaslik(g, d, vardi, o);
      if(d.kayipSayi === 0) this.cizSuruTam(g, Y, d);
      else this.cizRoll(g, Y, d, o);
      this.cizDip(g, Y, d, vardi, o);
    }
    return d;
  },

  /* ÜST — tek satır hesap. Kutlama cümlesi YOK; "yola şu kadar çıktın,
     şu kadar döndün" demek yeterli ve daha ağır. */
  cizBaslik(g, d, vardi, o){
    const P = this.PAL;
    const n = d.bireyler.length;
    const donen = n - d.kayipSayi;
    let ust, alt = '';
    if(!vardi){
      ust = this.s('hicbiri');
      /* Sert sonun kuralı burada YAZILI: yeniden deneme değil, yeni
         yolculuk. Bu dosya bir düğme çizmiyor — yalnız kuralı söylüyor. */
      alt = this.s('yeniSuru');
    } else if(d.kayipSayi === 0){
      ust = this.s('hepsi', { n });
      alt = this.s('temiz');
    } else {
      ust = this.s('kismi', { a: donen, n });
      if(d.centik >= d.toplam) alt = this.s('yolTamam');
    }
    o.yaz(g, ust, this.W / 2, this.BASLIK_Y, P.baslik);
    if(alt) o.yaz(g, alt, this.W / 2, this.ALT_BASLIK_Y, P.altBaslik);
    this.px(g, 40, this.AYRAC_Y, this.W - 80, 1, P.ayrac);
  },

  /* ANMA LİSTESİ — her kaybedilen bir satır: kendi biçimindeki oyuk,
     adı, ve (veri varsa) nerede kaybedildiği.
     Yaşayanlar burada YOK; üstteki sayıda zaten varlar. */
  cizRoll(g, Y, d, o){
    const P = this.PAL;
    const kayip = d.bireyler.filter(b => !b.yasiyor);
    if(!kayip.length) return;
    const B = (Y && Y.BIREY) || {};
    const gorunen = kayip.slice(0, this.MAX_SATIR);
    const yukseklik = 14 + gorunen.length * this.ROLL_ADIM;
    const bas = this.ROLL_UST + Math.max(0, (this.ROLL_DIP - this.ROLL_UST - yukseklik) / 2);
    this.yazSol(g, o, this.s('kayipBas'), this.SIL_X, bas, P.rollBaslik);
    let y = bas + 14;
    for(const b of gorunen){
      if(y + 7 > this.ROLL_DIP) break;
      const sp = B[b.k];
      const sy = y - Math.max(0, (((sp && sp.h) || 11) - 7) / 2);
      /* Oyuk: biçim duruyor, hayvan yok. Kenarı bir ton açık, yoksa koyu
         zeminde delik hiç okunmuyor. */
      this.cizSprite(g, sp, this.SIL_X, sy, P.oyuk);
      this.cizSprite(g, sp, this.SIL_X, sy, P.oyukKenar, true);
      this.yazSol(g, o, b.ad, this.AD_X, y, P.ad);
      if(b.yer)
        this.yazSol(g, o, '- ' + b.yer, this.AD_X + this.en(b.ad, o) + 8, y, P.yer);
      y += this.ROLL_ADIM;
    }
    if(kayip.length > gorunen.length)
      this.yazSol(g, o, this.s('dahaVar', { n: kayip.length - gorunen.length }),
                  this.AD_X, y, P.rollBaslik);
  },

  /* Y_BIREY satırlarını basar. `zorla` verilirse tek tonda (oyuk).
     `yalnizKenar` yalnız dış hattı çizer — oyuğun kenarı için. */
  cizSprite(g, sp, x, y, zorla, yalnizKenar){
    if(!sp || !sp.rows) return;
    for(let ry = 0; ry < sp.h; ry++){
      const satir = sp.rows[ry];
      if(!satir) continue;
      for(let rx = 0; rx < sp.w; rx++){
        const ch = satir[rx];
        if(ch === '.') continue;
        if(yalnizKenar){
          const bos = (dx, dy) => {
            const sy = ry + dy, sx = rx + dx;
            if(sy < 0 || sy >= sp.h || sx < 0 || sx >= sp.w) return true;
            return !sp.rows[sy] || sp.rows[sy][sx] === '.';
          };
          if(!(bos(1,0) || bos(-1,0) || bos(0,1) || bos(0,-1))) continue;
        }
        const renk = zorla || (sp.pal && sp.pal[ch]);
        if(!renk) continue;
        this.px(g, x + rx, y + ry, 1, 1, renk);
      }
    }
  },

  /* KAYIPSIZ TUR — liste boş kalıyor ve ekranın ortası bomboş oluyordu.
     O boşluk, oyunun en iyi sonucunun ödülüyle dolduruluyor: sürünün
     KENDİSİ, hepsi ayakta. Yolculuk boyunca bir daha görülmeyecek kare.
     Ad yazılmıyor — hepsi burada, saymaya gerek yok. */
  cizSuruTam(g, Y, d){
    const B = (Y && Y.BIREY) || {};
    const n = d.bireyler.length;
    if(!n) return;
    const adim = Math.min(36, Math.floor((this.W - 40) / n));
    const genis = (n - 1) * adim + 17;
    let x = Math.round((this.W - genis) / 2);
    for(const b of d.bireyler){
      const sp = B[b.k];
      this.cizSprite(g, sp, x, this.SURU_Y - ((sp && sp.h) || 11), null);
      x += adim;
    }
  },

  /* KAPANIŞ SATIRLARI — ikisi de SÖZ, diyagram değil.
     İlk basımda burada iki küçük gösterge vardı: on noktalı bir halka
     (yolun ne kadarı yürünmüştü) ve dört tokalı bir tasma (köpeğin
     öğrendikleri). Kareye bakınca ikisinin de ETİKETİ YOKTU — oyunu ilk
     kez bitiren biri o noktaların ne anlama geldiğini bilemezdi, ve bu
     ekranın tek işi anlaşılmak. İkisi de cümleye çevrildi.

     Halka ayrıca gereksizdi: 'vardi' sonunda zaten "bütün yolu yürüdün"
     yazıyor, 'suru-bitti' sonunda ise nereye kadar gelindiği artık
     ADIYLA söyleniyor — nokta saymaktan iyi. */
  cizDip(g, Y, d, vardi, o){
    const P = this.PAL;
    let y = this.DIP1_Y;
    const KOM = (Y && Y.KOMUT) || {};
    /* ANAHTAR ADI EKRANA BASILMAZ. İlk yazımda adı bulunamayan komut için
       anahtarın kendisi büyütülüp yazılıyordu ve kare "YOUR DOG LEARNED:
       DUR GETIR SUS" çıktı — anahtarlar Türkçe. Tam da bir önceki turda
       temizlenen kusurun sessizce geri gelme yolu. Adı olmayan komut
       artık ATLANIYOR: eksik satır, yanlış satırdan iyidir. */
    const ogrenilen = ((Y && Y.ogrenilen) || []).filter(k => KOM[k] && KOM[k].en);
    if(ogrenilen.length){
      const adlar = ogrenilen.map(k => KOM[k].en);
      o.yaz(g, this.s('ogrendi', { k: adlar.join(' ') }), this.W / 2, y, P.altBaslik);
      y = this.DIP2_Y;
    }
    /* Sert sonda "buraya kadar gelmiştin" — kalıcı olan bilgi ve rota
       (plan-tek-mod.md: bilgi/rota evet, GÜÇ hayır). */
    if(!vardi && d.centik > 0){
      const SEFER = (Y && Y.SEFER) || [];
      const son = SEFER[Math.min(d.centik, SEFER.length) - 1];
      if(son && son.ad) o.yaz(g, this.s('kadar', { yer: son.ad }), this.W / 2, y, P.rollBaslik);
    }
  },

  px(g, x, y, w, h, renk){
    g.fillStyle = renk;
    g.fillRect(Math.round(x), Math.round(y), Math.max(1, Math.round(w)), Math.max(1, Math.round(h)));
  },
};

const Bitis = Bitis_;
if (typeof module !== 'undefined' && module.exports) module.exports = Bitis;
/* ==BITIS-END== */
