/* ==CIKIN-START== =========================================================
   YOL ÇIKINI — kampanyanın ağıldaki GİRİŞ NESNESİ.

   Sahibinin kararı (2026-08-19): *"ayarlardan kampanyayı açmak
   istemiyorum. oyunun kullanıcı girdiğinde göreceği sayfayı da kampanya
   kurgumuza uygun şekilde baştan çizdirelim."*

   NİYE DÜĞME DEĞİL NESNE. ADR-024 bağlayıcı: *"harita/bölüm seçme ekranı
   YOK... bu oyunda her şey dünyada duran bir nesnedir."* Ve ölçülmüş bir
   ders var (docs/gelecek-karar.md): yayla denemesi bir kez menüde AYRI
   MOD gibi okunduğu için geri alındı. "KAMPANYA" yazan bir düğme o hatayı
   tekrar ederdi.

   Ağıl zaten nesnelerle konuşuyor: kapı (nöbete çık), tahta (takvim),
   raf (kiler), Kangal, foto, nişan köşesi. Çıkın onların yedincisi —
   duvara dayalı bir değnek ve dibinde bağlanmış bir çıkın. Anlamı bir
   çobana açıklama gerektirmiyor: **yola çıkmaya hazır.**

   İKİ İŞİ BİRDEN GÖRÜYOR:
     sefer YOKSA  -> dokunmak yolculuğu BAŞLATIR
     sefer VARSA  -> dokunmak ROTA TAHTASINI açar
   İkincisi rota tahtasının açık kalan sorusunun da cevabı
   (docs/rota-tahtasi-raporu.md, KARAR GEREKİR #5: "tahta nereden
   açılıyor?"). ADR-024 "istendiği an bakılır" diyordu; bakılacak yer
   çıkının kendisi — yola çıkmadan önce heybeye bakarsın.

   SANAT GEÇİCİ — ve bilerek öyle işaretli. PixelLab kotası dolu
   (2026-08-19: 41/40, kredi 0), yani üretim yapılamıyor. Buradaki çizim
   ağılın kendi piksel dilinde ELDE yazıldı; kredi gelince PixelLab'e
   devredilecek. Sahibi el çizimi pikseli daha önce iki kez reddetti —
   bu yüzden burası "bitmiş sanat" değil, YERİ ve İŞİ doğru bir taslak.
   ========================================================================= */

/* Sprite'ı kutunun tabanına oturtarak çizer. Yayla.cizSprite merkezden
   çiziyor; burada taban hizası isteniyor, o yüzden ince bir sarmalayıcı. */
function ort_ciz(g, sp, cx, tabanY, bitti){
  const yon = 1;
  for(let ry = 0; ry < sp.h; ry++){
    const row = sp.kare[bitti ? (sp.kare.bitti ? 'bitti' : 'dur') : 'dur'] ||
                sp.kare[Object.keys(sp.kare)[0]];
    const r = row[ry];
    if(!r) continue;
    for(let rx = 0; rx < sp.w; rx++){
      const ch = r[rx];
      if(ch === '.' || ch === undefined) continue;
      const c = sp.pal[ch];
      if(!c) continue;
      g.fillStyle = c;
      g.fillRect(Math.round(cx + rx - (sp.w >> 1)) | 0, (tabanY + ry - sp.h) | 0, 1, 1);
    }
  }
}

const Cikin_ = {
  /* Ağılın kutusunda yeri: kapının SAĞINDA, sürünün ÜSTÜNDE.
     Neden orası — FOLD_LAYOUT okunarak seçildi, tahmin edilmedi:
       kapi   x129-181  y104-148     tahta  x76-116  y112-142
       kangal x100-126  y142-164     suru   x186-304 y146-172
       raf    x4-45     y118-142
     x186-212 / y112-144 bandı boş: sürünün üstü, kapının sağı. Anlamı da
     doğru — çıkın kapının yanında durur, çıkmaya hazır.

     KUTUNUN TEK KAYNAĞI index.html (FOLD_LAYOUT.cikin), burası DEĞİL:
     ağıl kancaları (initFoldHotspots) gömülü blokta ve harici
     dosyalardan ÖNCE koşuyor. Kutuyu burada tanımlamak "başlatılmadan
     erişim" hatası veriyordu — açılışta çöküyordu, ölçüldü. */
  get KUTU(){ return FOLD_LAYOUT.cikin; },

  PAL: {
    degnek:  '#8d653c',
    degnekK: '#5c4225',
    bez:     '#bda180',
    bezK:    '#8d7a5e',
    ip:      '#4d464a',
    golge:   '#2e2028',
    isik:    '#eedbbc',
    centik:  '#e8b830',
  },

  /* Sefer var mı — çizim ve dokunuş ikisi de buna bakıyor. */
  seferVar(Y){ return !!(Y && Y.sefer && !Y.sefer.bitti); },
  seferBitti(Y){ return !!(Y && Y.sefer && Y.sefer.bitti); },

  /* Dokunuldu mu? Kutu FOLD ölçeğinde (320x180). */
  vur(x, y){
    const k = this.KUTU;
    return x >= k.x && x <= k.x + k.w && y >= k.y && y <= k.y + k.h;
  },

  px(g, x, y, w, h, renk){ g.fillStyle = renk; g.fillRect(x | 0, y | 0, w, h); },

  /* Çizim. `Y` = Yayla (okunur, değiştirilmez).
     Üç hâl, üçü de GÖRSEL olarak ayrı — sessizde de okunmalı:
       hazır   çıkın bağlı, değnek dik, üstünde hiç çentik yok
       yolda   değnekte çentikler var (kaç bölüm geçildi), çıkın açık
       bitti   değnek eğik, çıkın yere konmuş — yolculuk bitti */
  ciz(g, Y, opts){
    const o = opts || {}, k = this.KUTU, P = this.PAL;
    const yolda = this.seferVar(Y);
    const bitti = this.seferBitti(Y);
    const centik = (Y && Y.sefer && Y.sefer.centik) ? Y.sefer.centik.length : 0;

    /* --- ÜRETİLEN ÇIKIN (tehditsanat.js) -------------------------------
       Elle çizdiğim değnek+bohça geçiciydi ve öyle işaretliydi; PixelLab
       kredisi gelince üretildi ve yerini aldı. Üç hâl hâlâ GÖRSEL olarak
       ayrı — sessizde de okunmalı:
         hazır  düğüm sıkı (iki kulak yukarı), değnek dik
         yolda  düğüm açık, değnekte çentikler
         bitti  değnek eğik, çıkın yere konmuş
       Çentikler sprite'ın ÜSTÜNE çiziliyor: geçilen bölüm sayısı üretim
       zamanı bilinemez, oyun zamanı bilinir. */
    const tabanY = k.y + k.h;
    const sp = (typeof TehditSanat !== 'undefined') && TehditSanat.Y_CIKIN;
    if(sp){
      ort_ciz(g, sp, k.x + k.w / 2, tabanY - (bitti ? 0 : 2), bitti);
    } else {
      /* Yedek: sprite yüklenmediyse en azından bir şey dursun. */
      this.px(g, k.x + 4, k.y + 4, 2, k.h - 6, P.degnek);
      this.px(g, k.x + 8, tabanY - 9, 11, 9, P.bez);
    }

    /* --- ÇENTİKLER: geçilen her bölüm bir kertik (ADR-024, çentik ELLE
       atılır). Değneğin üst yarısında, sayılabilir aralıkla. --- */
    for(let c = 0; c < Math.min(centik, 10); c++){
      this.px(g, k.x + 3, k.y + 4 + c * 2, 1, 1, P.centik);
    }

    /* --- ETİKET: ağılın ÖTEKİ nesneleriyle AYNI dil — tabela.
       Öneri A (sahibi seçti, 2026-08-20): havada yazı kalmaz, her
       etiketin altına değen bir plaka çakılır. Çıkın ağılın yedinci
       nesnesi; ötekiler tabelaya geçerken bu yüzen yazı olarak kalsaydı
       tam da düzeltilen kusur tek başına ayakta kalırdı (basıldı,
       bakıldı: "YOLA ÇIK" havada duruyordu).
       Çizici ana koddan geliyor (`o.tabela`) — burada ikinci bir tabela
       çizimi YAZILMIYOR, yoksa iki kaynak doğar. */
    const etiket = bitti ? o.metinBitti : (yolda ? o.metinYolda : o.metinHazir);
    if(etiket){
      if(o.tabela) o.tabela(g, etiket, k.x + k.w / 2, k.y + 2);
      else if(o.yaz) o.yaz(g, etiket, k.x + k.w / 2, k.y - 5, P.isik);
    }
  },
};

const Cikin = Cikin_;
/* ==CIKIN-END== ========================================================== */
