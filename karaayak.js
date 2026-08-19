/* ==KARAAYAK-START== ======================================================
   KARAAYAK ve BAŞIBOŞ KÖPEK SÜRÜSÜ — kampanyanın ilk isimli tehdidi.

   Tasarım: docs/tehdit-davranis.md §5 · ADR-021 · ADR-025 ·
   docs/bolum-haritasi.md (bölüm 4, 7, 10).

   TEZİN KENDİSİ (ADR-021): bir tehdidin çeşitlilik değeri ÇÖZÜMÜNÜN
   farklı olmasıyla ölçülür. Kurtta köpek ÇÖZÜMDÜR; Karaayak'ta köpek
   HEDEFTİR. Aynı sprite'ı boyayıp "yeni tehdit" demek değil bu — oyuncu
   bambaşka bir soruyla karşılaşıyor: *köpeğimi nereye harcayacağım?*

   NİYE AYRI DOSYA: ADR-018 EK 3 — yeni kod yeni dosyada doğar. index.html
   ve yayla.js ile AYNI kapsamda yükleniyor (script sırası: gömülü blok →
   yayla.js → bu dosya), yani G / WOLF / steer / strike hepsi elde.

   YENİDEN KULLANIM (uretim-hacmi-olcumu: türeme 8 kat ucuz):
   sürünün küçük bireyleri kurdun `approach → attack → fight → retreat`
   makinesini BİREBİR kullanıyor (`wolf:true`), yalnız `kara` etiketiyle
   çiziliyor. Sıfırdan yazılan tek şey liderin kendi davranışı ve
   sürünün eşzamanlılığı — çünkü tasarımın yeni olan yeri orası.

   ÜÇ GELİŞ (ADR-025'in yayı — aynı hayvan, her seferinde bir şey
   ÖĞRENMİŞ):
     bölüm 4  doğrudan  iki küçük baskı yapar, lider geride bekler
     bölüm 7  böler     lider kama gibi girip sürüyü İKİYE ayırır
     bölüm 10 gece      geceyi seçer; SAVUR belirleyici cevap
   ========================================================================= */

const KARAAYAK = {
  /* Hangi bölümde hangi geliş. Harita bağlayıcı (docs/bolum-haritasi.md). */
  GELIS: { 4: 'dogrudan', 7: 'boler', 10: 'gece' },

  kucukSay: { dogrudan: 2, boler: 2, gece: 3 },

  /* Lider "bekleme" mesafesi: sürünün kenarında, ekranda ama uzakta.
     Telgrafın kendisi bu — oyuncu onu GÖRÜYOR ve hiçbir şey yapmıyor. */
  bekleMesafe: 58,

  /* Lider köpeğe hamle eder: köpek boştaysa ve yakınsa. Hamle köpeği
     yıpratır ama ÖLDÜRMEZ. */
  hamleMesafe: 46,
  hamleHiz: 1.5,
  hamleAra: 150,          // iki hamle arası en az bu kadar kare
  hamleYara: 18,          // hamle başına dogHurt

  /* KÖPEK YARALANMA TAVANI — tasarımın kendi uyarısı (§5 "ihlal
     edebileceği karar"): DOGRUN.soreMornings = 2, yani bir kavga köpeği
     iki sabah yavaşlatıyor. Bölüm 4'te sürü köpeği ağır yıpratırsa
     bölüm 5 (ayı) ve 6 (vaşak) oynanamaz hâle gelir. Bu yüzden bir
     sabahta Karaayak'ın verebileceği yıpranma SINIRLI; kaçış valfi
     ADR-024'ün geri çekilmesi, köpeğin çökmesi değil. */
  yaraTavan: 54,

  /* Lider VURULUR ama DURDURULAMAZ (ADR-025: "kurşun kurdu durdurmaz").
     Vuruş onu geri çeker ve kızdırır; hızının altına inemeyeceği bir
     taban var. Kurdun hitSlow'u burada UYGULANMIYOR — fark bu. */
  liderHizTaban: 0.9,
  liderGeriKare: 70,      // vuruş sonrası çekilme süresi

  /* Bölüm 7: sürünün bu oranı kopartılıp öteki yana sürülüyor. */
  bolmeOran: 0.4,
  bolmeItis: 52,          // kopan grup bu kadar uzağa sürülür

  /* --- durum (sabah başına) ------------------------------------------- */
  aktif: false,
  kip: null,              // 'dogrudan' | 'boler' | 'gece'
  lider: null,
  kucukler: [],
  verilenYara: 0,
  bolduMu: false,
  geldi: false,           // bu sabah zaten geldi mi (sabah başına tek sürü)

  /* Sabah başında sıfırla. Kampanya kapalıysa hiçbir şey yapmıyor. */
  sabahSifirla(){
    this.aktif = false; this.kip = null; this.lider = null;
    this.kucukler = []; this.verilenYara = 0; this.bolduMu = false;
    this.geldi = false;
  },

  /* Bu sabah Karaayak gelmeli mi? Yalnız kampanyada, yalnız üç bölümün
     BÜYÜK GÜNÜNDE. Büyük gün bölümün zirvesi (ADR-025) — isimli tehdit
     oraya ait, sıradan sabaha değil. */
  gelmeliMi(Yayla){
    if(this.geldi) return false;
    if(!Yayla || !Yayla.aktif || !Yayla.sefer || Yayla.sefer.bitti) return false;
    /* Büyük gün KENDİ sahnesi — zirve orada yaşanır, sıradan sabahta
       değil (ADR-025). */
    if(Yayla.sahne() !== 'buyukgun' && Yayla.sahne() !== 'gece') return false;
    if(Yayla.gunTipi() !== 'B') return false;
    return !!this.GELIS[Yayla.sefer.bolum];
  },

  kipFor(Yayla){ return Yayla && Yayla.sefer ? this.GELIS[Yayla.sefer.bolum] : null; },

  /* --- sürüyü kur ------------------------------------------------------ */
  /* `ort` = ana koddan gelen köprü: { W, GROUND, FLOCK, aliveFlock, lrnd,
     lri, makeWolf, ducks }. Doğrudan global okumak yerine köprü, çünkü
     bu dosyanın ana koda bağı TEK yerde görünsün istiyorum — bir gün
     ==ART== gibi izole edilmek istenirse bağ listesi burada. */
  basla(ort, kip){
    const live = ort.aliveFlock();
    if(!live.length) return null;
    this.aktif = true; this.geldi = true; this.kip = kip;
    this.verilenYara = 0; this.bolduMu = false;
    this.kucukler = [];

    const soldan = ort.lrnd() < 0.5;
    const dir = soldan ? 1 : -1;
    const kenarX = soldan ? -24 : ort.W + 24;

    /* KÜÇÜKLER — kurdun makinesi birebir. Aynı anda AÇILAN iki kayıt
       tasarımın çekirdeği: G.dogTask tek olduğu için köpek birini alır,
       öteki geçer. "Köpek aynı anda tek yerde olabilir" kuralı ilk kez
       gerçekten ısırıyor. */
    const n = this.kucukSay[kip] || 2;
    for(let i = 0; i < n; i++){
      const w = ort.makeWolf(false);
      if(!w) break;
      w.kara = true; w.karaLider = false;
      w.visitsLeft = 0;                 // küçükler tek ziyaret; yay liderin
      w.x = kenarX - dir * (i * 26);    // ardışık girsinler, üst üste değil
      w.dir = dir;
      /* Ayrı hedefler: ikisi aynı koyuna gitmesin, yoksa tek baskı olur
         ve tasarımın tek yeni şeyi (eşzamanlılık) kaybolur. */
      if(live.length > 1) w.tgt = live[(ort.lri(live.length) + i) % live.length].id;
      this.kucukler.push(w);
      ort.ducks.push(w);
    }

    /* LİDER — kurt girdisi gibi görünür ama kendi döngüsünü koşar
       (`kUpdate`). Koyun hedeflemiyor: hedefi KÖPEK. */
    const l = ort.makeWolf(false);
    if(l){
      l.kara = true; l.karaLider = true;
      l.wState = 'bekle';
      l.visitsLeft = 0;
      l.x = kenarX; l.dir = dir;
      l.y = ort.FLOCK.y0 + (ort.FLOCK.y1 - ort.FLOCK.y0) * 0.5;
      l.kHamle = 0; l.kGeri = 0; l.kBakis = 0;
      this.lider = l;
      ort.ducks.push(l);
    }
    return this.lider;
  },

  /* --- lider davranışı -------------------------------------------------
     Dört durum:
       bekle  — sürünün kenarında durur, izler. Telgraf. Hiçbir şey yapmaz.
       hamle  — köpeğe koşar; varınca köpeği yıpratır ve geri çekilir.
       geri   — vuruldu ya da hamlesini yaptı; kenara çekilir, BAKAR.
       boler  — (yalnız bölüm 7) sürüye kama gibi girer.
     Dönüş: true = bu girdiyi ben sürdüm, updateWolf çağrılmasın. */
  liderGuncelle(ort, l){
    if(!l.kara || !l.karaLider) return false;
    l.life++;
    if(l.flash > 0) l.flash--;
    if(l.kGeri > 0) l.kGeri--;
    if(l.kHamle > 0) l.kHamle--;

    const dog = ort.dog;

    /* Bölüm 7: bölme bir kez olur ve olur olmaz lidere geri döner. */
    if(this.kip === 'boler' && !this.bolduMu && l.life > 90){
      this.bol(ort, l);
      l.wState = 'geri'; l.kGeri = this.liderGeriKare;
      return true;
    }

    if(l.wState === 'geri'){
      /* Kenara çekilir ama GİTMEZ — omzunun üstünden bakar (kurdun
         'bakis' dilinin aynısı: gidiyor ama vazgeçmiyor). */
      const hedefX = l.dir > 0 ? -18 : ort.W + 18;
      ort.steer(l, hedefX, l.y, 0.9, 0.06);
      if(l.kGeri <= 0){ l.wState = 'bekle'; }
      return true;
    }

    if(l.wState === 'hamle'){
      const d = ort.steer(l, dog.x, dog.y, this.hamleHiz, 0.22);
      if(d < 10){
        /* Köpeği yıprat — ama tavana kadar. Tavan tasarımın kendi
           uyarısı: sonraki bölümler oynanabilir kalmalı. */
        const kalan = Math.max(0, this.yaraTavan - this.verilenYara);
        const ver = Math.min(this.hamleYara, kalan);
        if(ver > 0){ ort.dogHurt(ver); this.verilenYara += ver; }
        l.wState = 'geri'; l.kGeri = this.liderGeriKare;
        l.kHamle = this.hamleAra;
      }
      return true;
    }

    /* bekle: sürünün kenarında bir noktada asılı durur. */
    const live = ort.aliveFlock();
    if(!live.length){ l.done = true; return true; }
    let mx = 0; live.forEach(a => { mx += a.x; }); mx /= live.length;
    const durX = mx - l.dir * this.bekleMesafe;
    ort.steer(l, durX, l.y, 0.55, 0.05);

    /* Köpek boştaysa ve yakınsa hamle. Köpek bir kavgaya bağlıysa lider
       ona dokunmaz — zaten kazanıyor, sürüsü serbest çalışıyor.
       Bu, oyuncuyu gerçek bir ikilemde bırakıyor: köpeği bir küçüğe
       gönderirsen lider serbest kalır ve öteki küçük geçer; köpeği
       tutarsan (DUR) lider hamle edemez ama koyun gider. */
    const bagli = ort.dogTask && ort.dogTask.phase === 'fight';
    const uzak = Math.abs(dog.x - l.x);
    if(!bagli && l.kHamle <= 0 && uzak < this.hamleMesafe * 2.2 &&
       this.verilenYara < this.yaraTavan){
      l.wState = 'hamle';
    }
    return true;
  },

  /* Bölüm 7 — SÜRÜYÜ BÖLER.
     Kama gibi girip sürünün bir kısmını öteki yana sürüyor. Köpek yalnız
     bir grubun yanında olabilir; GETİR'in bölüm 3'te öğretilmesinin
     karşılığı tam burada ödeniyor (kolona geri katma). */
  bol(ort, l){
    const live = ort.aliveFlock();
    if(live.length < 3) { this.bolduMu = true; return 0; }
    /* Liderin geldiği yönün UZAĞINDAKİ hayvanlar kopuyor — kama oradan
       giriyor, yani kopan grup görsel olarak da açıklanıyor. */
    const sirali = live.slice().sort((a, b) => (a.x - b.x) * l.dir);
    const n = Math.max(1, Math.round(live.length * this.bolmeOran));
    const kopan = sirali.slice(0, n);
    kopan.forEach(a => {
      a.x -= l.dir * this.bolmeItis;
      a.state = 'alert'; a.alarm = 60; a.startle = 1;
      a.kopuk = true;                      // GETİR'in okuyacağı işaret
    });
    this.bolduMu = true;
    if(ort.showMsg) ort.showMsg('SURU BOLUNDU — kopanlari topla', 200);
    if(ort.Snd && ort.Snd.bark) ort.Snd.bark();
    return kopan.length;
  },

  /* --- vuruş ------------------------------------------------------------
     Lider VURULUR ama DURDURULAMAZ. Kurdun hitSlow'u ona uygulanmıyor;
     bunun yerine geri çekilir ve döner. ADR-025'in bağlayıcı cümlesi:
     "can barı olan, mermiyle eritilen bir boss bu cümleyi çöpe atar."
     Dönüş: true = vuruş BU dosya tarafından karşılandı. */
  vuruldu(ort, d){
    if(!d.kara) return false;
    if(!d.karaLider) return false;         // küçükler normal kurt kuralı
    d.hitsTaken = (d.hitsTaken || 0) + 1;
    d.flash = 16;
    /* Hız tabanının ALTINA inmiyor — yavaşlatılabilir ama durdurulamaz. */
    d.slowMul = Math.max(this.liderHizTaban, (d.slowMul || 1) * 0.97);
    d.wState = 'geri'; d.kGeri = this.liderGeriKare;
    d.kHamle = Math.max(d.kHamle || 0, 60);
    if(ort.shake) ort.shake(3);
    if(ort.Snd && ort.Snd.ping) ort.Snd.ping();
    if(ort.showMsg && d.hitsTaken === 1) ort.showMsg('KARAAYAK — durmuyor', 170);
    return true;
  },

  /* --- çizim ------------------------------------------------------------
     Lider ve küçükler AYNI türden (başıboş köpek), sprite da aynı; lider
     bir tık daha büyük çizilmiyor — ayrımı DAVRANIŞ veriyor, boyut değil.
     Oyuncu onu "hep geride duran, vurulunca dönen" olarak tanıyor.
     Dönüş: true = çizdim. */
  ciz(ort, g, d){
    if(!d.kara) return false;
    const Y = ort.Yayla;
    if(!Y || !Y.cizTehdit) return false;
    /* Gece sözleşmesi (ADR-020/023): ışık çemberinin dışındaki tehdit
       GÖRÜNMEZ, yalnız duyulur. Karaayak'ın kremi (#dfd6c7) karanlıkta
       parlıyordu — tasarımın kendi uyarısı (§5 sanat notu). Çember
       dışındaysa hiç çizilmiyor; ses ve dünya işaretleri kalıyor. */
    if(Y.geceMi && Y.geceMi() && ort.gece){
      if(!Y.gorunur(d.x, d.y, ort.gece.x, ort.gece.y)) return true;
    }
    Y.cizTehdit(g, 'karaayak', d.x, d.y, d.dir);
    return true;
  },

  /* Sabah bitti: bu sürüden geriye kalan ne? Bölüm dökümü ve rota
     tahtası bunu okuyacak. */
  ozet(){
    return {
      geldi: this.geldi, kip: this.kip,
      yara: this.verilenYara, boldu: this.bolduMu,
      vurus: this.lider ? (this.lider.hitsTaken || 0) : 0,
    };
  },
};
/* ==KARAAYAK-END== ======================================================= */
