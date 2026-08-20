/* ==TEHDIT-START== =========================================================
   KAMPANYANIN KALAN TEHDİTLERİ — vaşak · sırtlan · ayı · hırsız · fırtına

   Tasarım: docs/tehdit-davranis.md §2,3,4,6,7 · ADR-021 · ADR-020 ·
   docs/bolum-haritasi.md. Karaayak ayrı dosyada (karaayak.js), çünkü o
   kurdun boğuşma makinesini kullanıyor; buradakilerin hiçbiri kullanmıyor.

   ADR-021'İN TEZİ, BEŞ KEZ: bir tehdidin çeşitlilik değeri ÇÖZÜMÜNÜN
   farklı olmasıyla ölçülür. Beşi de oyuncudan BAŞKA bir fiil istiyor:

     vaşak    tek, kısa, sessiz bir işareti GÖRMEK (refleks değil dikkat)
     sırtlan  görmeden sesin yönüne nişan — asıl silah ODUN (ışık = menzil)
     ayı      çatışmayı REDDETMEK; mermi durdurmaz, YÖN VERİR
     hırsız   ateş edip etmemeye karar vermek — ve ÖLDÜRMEDEN çözmek
     fırtına  düşman yok, ZAMAN var; nişan kapalı, komutlar tek fiil

   AYNI ASİMETRİ, BİLEREK: SUS vaşakta hayat kurtarıyor (sessiz köpek
   pusuyu bozar), sırtlanda KÖR EDİYOR (sürünün alarmı gecedeki tek erken
   uyarın; SUS onu söndürüyor). Komutlar böylece "kesin iyi" olmaktan
   çıkıp gerçek karar oluyor.

   BAĞ: index.html ile aynı kapsamda yükleniyor (yayla.js → karaayak.js →
   bu dosya). Ana koda bağ TEK yerden: `tehOrt()` köprüsü.
   ========================================================================= */

const TEHDIT = {
  /* Hangi bölümde, hangi gün tipinde, hangi tehdit.
     Harita bağlayıcı (docs/bolum-haritasi.md); ayının iki gelişi
     ADR-021'in 2026-08-19 düzeltmesi: bölüm 5 GÖRÜLME (mekaniksiz),
     bölüm 8 KARŞILAŞMA (SAVUR/SUS/GETİR üçü de elde).
     Bölüm 8 iki olay taşıyor (harita bunu biliyor): ayı büyük günde,
     hırsız konak gününde — aynı sabaha yığılmasınlar. */
  /* Anahtar SAHNE adı — gün tipi değil. Sebebi ölçerek bulundu: hırsızı
     "konak günü" diye yazmıştım, ama konak gününün 'buyukgun' sahnesi
     YOK (SAHNE_SIRA.K = sabah/konak/gece), yani hırsız hiç gelemiyordu.
     Sahneye bağlamak hem doğru hem okunur: zirve 'buyukgun'da, gece
     tehdidi 'gece'de, sıradan olan 'sabah'ta. */
  /* DAĞITIM 2026-08-20 (docs/bolge-farklari.md). Önceki hâlde on bölümün
     ALTISINDA hiçbir isimli olay yoktu ve bölüm 8'de ÜÇÜ birden vardı.
     Yığılma dağıtıldı, boş bölgeler dolduruldu:
       vaşak   6 -> 3   pusu dar geçide ait; kolonun kuyruğu zaten açıkta
       hırsız  8 -> 4   ağaç hattı örtü demek, örtü insan tehdidine ait
       sırtlan 8 -> 6   dere gecesi; su sesi duymayı zorlaştırıyor
       ayı     8'de KALDI — artık bölümün tek olayı, zirve zirve oldu

     1 ve 2 BİLEREK boş: 1 kalibrasyon (oyuncu "normal"i öğrenmeden sapmayı
     göremez), 2'nin tehdidi GECENİN KENDİSİ (ilk gece burada). Karanlık
     zaten olayken üstüne hayvan koymak ADR-020'nin "zorluk bilgi
     eksilterek artar" kuralını bozardı.

     Karaayak burada YOK — onun takvimi karaayak.js'te (4, 7, 10) ve tek
     kaynak orası kalıyor. */
  TAKVIM: {
    3: { buyukgun: 'vasak' },
    4: { sabah: 'hirsiz' },
    5: { buyukgun: 'ayiGorulme' },
    6: { gece: 'sirtlan' },
    8: { buyukgun: 'ayi' },
    9: { buyukgun: 'firtina' },
  },

  /* TEK SEFERLİK: bir tehdit bir seferde bir kez gelir. Bu olmadan
     bölüm 8'in üç konak gününün üçünde de hırsız çıkıyordu — "tek
     seferlik ahlaki an" (ADR-021) günlük bir taciz oluyordu. Sefer
     boyunca yaşıyor, sifirla ile temizleniyor. */
  olanlar: {},
  seferSifirla(){ this.olanlar = {}; this.sabahSifirla(); },

  aktif: null,          // o sabahki tehdit anahtarı
  d: null,              // o tehdidin durumu
  geldi: false,

  sabahSifirla(){ this.aktif = null; this.d = null; this.geldi = false; },

  /* Bu sabah hangi tehdit? Yalnız kampanyada, yalnız nöbet sahnesinde. */
  secim(Yayla){
    if(this.geldi) return null;
    if(!Yayla || !Yayla.aktif || !Yayla.sefer || Yayla.sefer.bitti) return null;
    /* BÜYÜK GÜN kendi sahnesi (SAHNE_SIRA.B: sabah→buyukgun→konak→gece).
       İsimli tehdit oraya ait: ADR-025 büyük günü "bölümün öğrettiği her
       şeyi aynı anda isteyen tek uzun sahne" diye tanımlıyor. İlk yazımda
       tehditler sıradan 'sabah' sahnesine düşüyordu ve 'buyukgun' bomboş
       atlanıyordu — zirve, zirve olmayan bir sahnede yaşanıyordu. */
    const s = Yayla.sahne();
    if(s !== 'buyukgun' && s !== 'gece' && s !== 'sabah') return null;
    const b = this.TAKVIM[Yayla.sefer.bolum];
    if(!b) return null;
    const k = b[s];
    if(!k || this.olanlar[k]) return null;
    return k;
  },

  basla(ort, k){
    this.aktif = k; this.geldi = true; this.olanlar[k] = true;
    const kur = this['kur_' + k];
    this.d = kur ? kur.call(this, ort) : null;
    /* İZLERİN VERDİĞİ TARAF (ADR-020). Bedeli zaten sağımda ve SAVUR'da
       ısırıyor; karşılığı burada ödeniyor, yoksa iz salt ceza olurdu.
         erkenUyari  tehdit bu kadar KARE önce belli olur (bekleme kısalır)
         yerGecikme  yer tehdidi bu kadar GEÇ fark edilir (bekleme uzar —
                     Kartal Gölgesi'nin bedeli: gözün yukarıda)
       Bekleme tabana çakılmıyor: telgraf penceresi tümüyle kaybolursa
       "zar haksız hissettirir" kuralı çiğnenirdi. */
    const iz = ort.Iz ? ort.Iz.etki() : null;
    if(iz && this.d && typeof this.d.bekle === 'number'){
      const yerde = (k === 'vasak' || k === 'sirtlan' || k === 'ayi' || k === 'hirsiz');
      const kaydir = (iz.erkenUyari || 0) - (yerde ? (iz.yerGecikme || 0) : 0);
      this.d.bekle = Math.max(60, this.d.bekle - kaydir);
    }
    return this.d;
  },

  /* Her karede. Ana kod bunu update() içinden çağırıyor. */
  guncelle(ort){
    if(!this.aktif || !this.d) return;
    const f = this['gun_' + this.aktif];
    if(f) f.call(this, ort, this.d);
  },

  /* Çizim — dünya katmanı (sürünün arasına). */
  ciz(ort, g){
    if(!this.aktif || !this.d) return;
    const f = this['ciz_' + this.aktif];
    if(f) f.call(this, ort, g, this.d);
  },

  /* Nişan bu sabah kapalı mı (fırtına). ADR-020: zorluk sayı büyütmekle
     değil BİLGİ/ARAÇ eksiltmekle artar — bunun en uç hâli. */
  nisanKapali(){ return this.aktif === 'firtina' && this.d && this.d.evre === 'firtina'; },

  /* Atış: bir tehdit bu atışı karşıladı mı? Dönüş: true = karşılandı. */
  atis(ort, x, y){
    if(!this.aktif || !this.d) return false;
    const f = this['atis_' + this.aktif];
    return f ? !!f.call(this, ort, x, y, this.d) : false;
  },

  /* ======================================================================
     VAŞAK — bölüm 6 (yağmur). SUS aynı bölümde açılıyor.
     Oyuncudan: refleks değil DİKKAT.

     Vuruş penceresi bu tasarımın çekirdeği: kurt boyunca vurulabilir
     (uzun sinsi yaklaşma), vaşak YALNIZ yarım saniyelik bir işaret
     penceresinde. ADR-021'in "tek işaret, ikinci şans yok" cümlesinin
     mekanik karşılığı.

     Pusu bir G.ducks VARLIĞI DEĞİL — ekranda yok, yalnız bir x. Bu
     yüzden nişan onu bulamaz; bulabilseydi "tek işaret" diye bir şey
     kalmazdı.

     ADİL OLMA KURALI (kodun kendi yorumu: "beceri oyununda zar haksız
     hissettirir"): işaret, başka bir tehdidin telgrafı açıkken
     TETİKLENMEZ. Yoksa pencere kaçırılabilir değil KAÇINILMAZ olur.
     ====================================================================== */
  VASAK: { pusuMin: 300, pusuMax: 600, isaret: 46, sicrama: 20, susR: 46 },

  kur_vasak(ort){
    return {
      evre: 'pusu', t: 0,
      bekle: this.VASAK.pusuMin + Math.floor(ort.lrnd() * (this.VASAK.pusuMax - this.VASAK.pusuMin)),
      x: 40 + ort.lrnd() * (ort.W - 80),
      y: ort.FLOCK.y0 + ort.lrnd() * (ort.FLOCK.y1 - ort.FLOCK.y0),
      tgt: null, bozuldu: false, vuruldu: false,
    };
  },

  gun_vasak(ort, d){
    d.t++;
    if(d.evre === 'pusu'){
      /* SUS = tasarlanmış cevap: sessiz köpek pusu yarıçapındaysa vaşak
         hamleyi HİÇ başlatmaz — pusuyu bozup çekilir. SUS'un bölüm 6'da
         öğretilmesinin gerekçesi tam olarak bu. */
      if(ort.komut() === 'sus' && Math.abs(ort.dog.x - d.x) < this.VASAK.susR){
        d.evre = 'bitti'; d.bozuldu = true;
        if(ort.showMsg) ort.showMsg('THE LYNX GAVE UP AND LEFT', 170);
        return;
      }
      if(d.t < d.bekle) return;
      if(ort.baskaTelgrafAcik()) { d.t = d.bekle - 30; return; }   // adil olma kuralı
      d.evre = 'isaret'; d.t = 0;
      if(ort.Snd && ort.Snd.flap) ort.Snd.flap();
      return;
    }
    if(d.evre === 'isaret'){
      if(d.t >= this.VASAK.isaret){ d.evre = 'sicrama'; d.t = 0; d.tgt = ort.enYakinKoyun(d.x); }
      return;
    }
    if(d.evre === 'sicrama'){
      const a = d.tgt && ort.koyun(d.tgt);
      if(!a || a.state === 'gone'){ d.evre = 'bitti'; return; }
      a.state = 'alert'; a.alarm = 40;
      d.x += (a.x - d.x) * 0.28; d.y += (a.y - d.y) * 0.28;
      if(d.t >= this.VASAK.sicrama){
        ort.kap(a);                       // koyunu alıp karanlığa
        d.evre = 'bitti';
      }
      return;
    }
  },

  /* İşaret = KULAKLAR. tehdit-sanat.md ölçtü: vaşağın kimliği kulak
     silueti ("püsküllü kulaklar 14-16 pikselde hayatta kaldı"). Pusuda
     hiçbir şey çizilmiyor — görünmezlik sözleşmenin kendisi. */
  ciz_vasak(ort, g, d){
    if(d.evre === 'isaret'){
      /* ÜRETİLEN PUSU KARESİ (tehditsanat.js). Elle çizilmiş dört
         pikselin yerini aldı. tehdit-sanat.md ölçmüştü: vaşağın kimliği
         kürk deseninde değil KULAK SİLUETİNDE — üretim onu tutturdu.
         Titreşim BİLEREK duruyor: sabit bir siluet arka planda kaybolur,
         kıpırdayan gözü çeker (telgrafın işi görülmek). */
      const k = (d.t >> 2) & 1;
      const sp = (typeof TehditSanat !== 'undefined') && TehditSanat.Y_VASAK_PUSU;
      if(sp) ort.Yayla.cizSprite(g, sp, d.x, d.y - k, 1, 'pusu');
      return;
    }
    if(d.evre === 'sicrama') ort.Yayla.cizTehdit(g, 'vasak', d.x, d.y, 1);
  },

  atis_vasak(ort, x, y, d){
    if(d.evre !== 'isaret' && d.evre !== 'sicrama') return false;
    if(d.evre === 'sicrama' && d.t > 10) return false;      // ilk ~10 kare
    if(Math.abs(x - d.x) > 12 || Math.abs(y - d.y) > 14) return false;
    d.evre = 'bitti'; d.vuruldu = true;
    if(ort.showMsg) ort.showMsg('YOU DROVE THE LYNX OFF', 180);
    if(ort.Snd && ort.Snd.hit) ort.Snd.hit();
    return true;
  },

  /* ======================================================================
     SIRTLAN — bölüm 8 (gece).
     Oyuncudan: görmeden, sesin YÖNÜNE nişan almak — ve asıl silahı olan
     ATEŞİ (odunu) yönetmek.

     ODUN SİLAHIN MENZİLİDİR. Gece sözleşmesi zaten yazılı ve sayısal
     (yayla.js: odunsuzR 22, odunBasiR 9, maxR 108). Bu tasarım o sayıyı
     oynanışa bağlıyor: vuruş penceresi = ışık çemberinin kendisi.
     Çok odun = geniş çember = uzun pencere.

     ERİŞİLEBİLİRLİK (sahibinin kararı, kampanya-ses.md sonu): ses ÖNCÜ
     sinyal, YÖN dünyadan okunur. Sesi kapalı oyuncu da oynayabilmeli —
     bu yüzden yön hem sesle hem GÖRSEL olarak veriliyor (köpek başını
     çevirir + o yandaki koyunlar alarma geçer). "Bir şey orada" bilgisi
     iki kanaldan da geliyor.
     ====================================================================== */
  SIRTLAN: { duyulmaMin: 200, duyulmaMax: 400, dolanma: 200, isikta: 48, kapma: 30, hiz: 0.55 },

  kur_sirtlan(ort){
    const soldan = ort.lrnd() < 0.5;
    return {
      evre: 'duyulma', t: 0,
      bekle: this.SIRTLAN.duyulmaMin + Math.floor(ort.lrnd() * (this.SIRTLAN.duyulmaMax - this.SIRTLAN.duyulmaMin)),
      x: soldan ? -14 : ort.W + 14, dir: soldan ? 1 : -1,
      /* Yerde yürüyor, ateşin hizasında. İlk yazımda sürü bandında
         rastgele bir y'deydi ve ölçünce görüldü: ışık çemberi küresel
         olduğu için (gorunur mesafeye bakıyor) yüksekte duran sırtlan
         odunsuz gecede HİÇ görünmüyordu — pencere sıfırdı, oyuncunun
         tüfeği bütünüyle ölüydü. Az odun KARANLIK demek, ama HİÇ
         pencere yok demek değil; "zar haksız hissettirir" kuralı. */
      y: ort.GROUND - 4,
      tgt: null, vuruldu: false, sesT: 0,
    };
  },

  gun_sirtlan(ort, d){
    d.t++; d.sesT++;
    const ates = ort.gece;
    const isikR = ort.Yayla.isikR();

    if(d.evre === 'duyulma' || d.evre === 'dolanma'){
      /* Çemberin dışında dolanıyor: yaklaşıyor ama girmiyor. */
      const hedefX = ates ? ates.x + d.dir * (isikR + 16) : d.x;
      d.x += Math.sign(hedefX - d.x) * this.SIRTLAN.hiz;
      /* Yön değişimi — sol↔sağ. Oyuncu nereden geldiğini takip etmeli. */
      if(d.evre === 'duyulma' && d.t > d.bekle){ d.evre = 'dolanma'; d.t = 0; }
      if(d.evre === 'dolanma'){
        if(d.t % 90 === 0) d.dir = -d.dir;
        if(d.t > this.SIRTLAN.dolanma){ d.evre = 'isikta'; d.t = 0; }
      }
      /* SES + DÜNYA: ikisi birlikte. Sesi kapalı oyuncu köpeğin başından
         ve o yandaki koyunların alarmından anlıyor. */
      if(d.sesT % 70 === 0){
        if(ort.Snd && ort.Snd.laugh) ort.Snd.laugh();
        ort.yonIsareti(d.x < (ates ? ates.x : ort.W / 2) ? -1 : 1);
      }
      return;
    }

    if(d.evre === 'isikta'){
      /* TEK GERÇEK PENCERE: çembere giriyor, görülüyor, vurulabiliyor.

         PENCERENİN UZUNLUĞU ÇEMBERİN YARIÇAPI — sabit bir kare sayısı
         DEĞİL. İlk yazımda sabit 48 kareydi ve ölçünce görüldü ki 3 odunla
         (R=49) da odunsuz (R=22) da pencere AYNI uzunlukta çıkıyordu:
         sırtlan çemberin kenarında konumlandığı için odun hiçbir şey
         değiştirmiyordu. Oysa tasarımın tezi bu — "odun silahın
         menzilidir" (odunBasiR 9 zaten sayısal olarak kurmuş).
         Şimdi sabit hızla ateşe yürüyor: içeride geçirdiği süre
         doğrudan yarıçapla orantılı. Çok odun = uzun pencere. */
      if(ates){
        d.x += Math.sign(ates.x - d.x) * this.SIRTLAN.hiz * 1.6;
        if(Math.abs(d.x - ates.x) < 14){ d.evre = 'kapma'; d.t = 0; d.tgt = ort.enYakinKoyun(d.x); }
      } else if(d.t >= this.SIRTLAN.isikta){
        d.evre = 'kapma'; d.t = 0; d.tgt = ort.enYakinKoyun(d.x);
      }
      return;
    }

    if(d.evre === 'kapma'){
      const a = d.tgt && ort.koyun(d.tgt);
      if(!a || a.state === 'gone'){ d.evre = 'bitti'; return; }
      a.state = 'alert'; a.alarm = 50;
      d.x += (a.x - d.x) * 0.2;
      if(d.t >= this.SIRTLAN.kapma){ ort.kap(a); d.evre = 'bitti'; }
      return;
    }
  },

  ciz_sirtlan(ort, g, d){
    if(d.evre === 'bitti') return;
    const Y = ort.Yayla, ates = ort.gece;
    /* GÖRÜNÜRLÜK SÖZLEŞMESİ: çemberin dışındaki tehdit ÇİZİLMEZ.
       Bu bir kusur değil mekaniğin kendisi (tehdit-sanat.md lider notu).
       Şart: çembere girdiğinde OKUNMASI. */
    if(ates && !Y.gorunur(d.x, d.y, ates.x, ates.y)) return;
    Y.cizTehdit(g, 'sirtlan', d.x, d.y, d.dir);
  },

  atis_sirtlan(ort, x, y, d){
    if(d.evre === 'bitti') return false;
    const ates = ort.gece;
    /* Karanlığa körlemesine ateş KUMAR olurdu ("zar haksız hissettirir").
       Panzehir: yön bilgisi hep doğru, ve tek öldürücü bölge ışık
       çemberi. Beceri "tahmin etmek" değil "ateşi büyütmek" oluyor. */
    if(ates && !ort.Yayla.gorunur(d.x, d.y, ates.x, ates.y)) return false;
    if(Math.abs(x - d.x) > 16 || Math.abs(y - d.y) > 16) return false;
    d.evre = 'bitti'; d.vuruldu = true;
    if(ort.showMsg) ort.showMsg('YOU DROVE THE HYENA OFF', 180);
    if(ort.Snd && ort.Snd.hit) ort.Snd.hit();
    return true;
  },

  /* ======================================================================
     AYI — İKİ GELİŞ (ADR-021 düzeltmesi, sahibi 2026-08-19)

     bölüm 5  GÖRÜLME    uzakta, sırtı dönük, geçip gider. Vurulmuyor,
                         komut istemiyor, oyuncu YALNIZ BAKIYOR.
                         Zirvenin yoğunluğu tehditten değil DEHŞETTEN.
                         Oyunun kendi ilkesi: "önce göster, gerekirse
                         adlandır" (Yırtıkkulak da böyle tanıtılmıştı).
     bölüm 8  KARŞILAŞMA gerçek. Üç çözüm de elde (SAVUR/SUS/GETİR).

     KARŞILAŞMADA VURUŞ PENCERESİ YOK — ama tüfek ölü tuş DEĞİL:
       **mermi ayıyı DURDURMAZ, ONA YÖN VERİR.** Vurulan ayı ateş eden
       tarafa döner. Silah çalışıyor — sana karşı.
     Ölü tuş bırakmak oyuncuya "oyun bozuk" öğretir; ceza veren tuş
     "bu farklı bir şey" öğretir.
     ====================================================================== */
  AYI: { hiz: 0.24, basincR: 70, yonelmeR: 40, gecisSure: 900 },

  kur_ayiGorulme(ort){
    const soldan = ort.lrnd() < 0.5;
    return { evre: 'gecer', t: 0, x: soldan ? -30 : ort.W + 30,
             dir: soldan ? 1 : -1, y: ort.FLOCK.y0 - 16, uzak: true };
  },

  /* GÖRÜLME: dokunulmaz. Ufukta geçer, koyunlar huzursuzlanır, gider. */
  gun_ayiGorulme(ort, d){
    d.t++;
    d.x += d.dir * this.AYI.hiz * 1.4;
    if(d.t === 40 && ort.showMsg) ort.showMsg('SOMETHING IS OUT THERE', 200);
    /* Sürü onu görüyor — ve oyuncu sürüden anlıyor. Mekanik yok, his var. */
    ort.aliveFlock().forEach(a => { if(a.alarm < 8) a.alarm = 8; a.state = 'alert'; });
    if(d.x < -40 || d.x > ort.W + 40) d.evre = 'bitti';
  },

  ciz_ayiGorulme(ort, g, d){
    if(d.evre === 'bitti') return;
    /* Uzakta: sırtı dönük ve puslu. Ölçek küçültülmüyor (sprite tek
       boyut) ama ufuk çizgisinin üstünde durması mesafeyi veriyor. */
    ort.Yayla.cizTehdit(g, 'ayi', d.x, d.y, d.dir);
  },

  atis_ayiGorulme(){ return false; },   // dokunulmuyor — bilerek

  kur_ayi(ort){
    const soldan = ort.lrnd() < 0.5;
    return { evre: 'varlik', t: 0, x: soldan ? -30 : ort.W + 30,
             dir: soldan ? 1 : -1,
             y: ort.FLOCK.y0 + (ort.FLOCK.y1 - ort.FLOCK.y0) * 0.5,
             hedefKopek: false, vurusSay: 0 };
  },

  gun_ayi(ort, d){
    d.t++;
    const dog = ort.dog;

    /* YÖNELME: köpek yarıçapa girdiyse ayı KÖPEĞE döner. Köpeğin
       varsayılan yapay zekâsı tehdide koşuyor — ayı, o varsayılanın
       ÖLDÜRÜCÜ olduğu tek tehdit. DUR o varsayılanı kesiyor. */
    const dk = Math.abs(dog.x - d.x);
    if(dk < this.AYI.yonelmeR) d.hedefKopek = true;
    else if(dk > this.AYI.yonelmeR * 2) d.hedefKopek = false;

    if(d.hedefKopek){
      d.dir = Math.sign(dog.x - d.x) || d.dir;
      d.x += d.dir * this.AYI.hiz * 1.5;
      if(dk < 12) ort.dogHurt(20);
    } else {
      d.x += d.dir * this.AYI.hiz;
    }

    /* BASINÇ: yaklaştıkça alarm yarıçapı genişler, koyunlar dağılır.
       GETİR'in işi tam bu — dağılanları ayının yolundan çekmek. */
    ort.aliveFlock().forEach(a => {
      const m = Math.abs(a.x - d.x);
      if(m < this.AYI.basincR){
        a.state = 'alert';
        a.alarm = Math.max(a.alarm || 0, Math.round(40 * (1 - m / this.AYI.basincR)));
        a.x += Math.sign(a.x - d.x) * 0.5;      // yoldan çekiliyorlar
      }
    });

    /* SUS: provoke etmemek. Ayı köpeği daha geç fark eder. */
    if(ort.komut() === 'sus') d.hedefKopek = false;

    if(d.t > this.AYI.gecisSure || d.x < -50 || d.x > ort.W + 50) d.evre = 'bitti';
  },

  ciz_ayi(ort, g, d){
    if(d.evre === 'bitti') return;
    const Y = ort.Yayla;
    if(Y.geceMi && Y.geceMi() && ort.gece && !Y.gorunur(d.x, d.y, ort.gece.x, ort.gece.y)) return;
    /* ŞAHA KALKMA — yalnız KÖPEĞE YÖNELDİĞİNDE. Ayı sahneyi geçmeyi
       bırakıp sana döndüğü an bu; ADR-021'in "vurulmayan bir GÜÇ"
       tanımının görsel karşılığı. Geçip giderken duruş pozunda kalıyor,
       yoksa şaha kalkma sıradanlaşır ve anlamını yitirir.
       ADAY B kurulu (üçgen siluet, açık göbek, gece okunurluğu çözülmüş);
       aday A `art/gen/tehdit/ayi-saha-a.png`'de duruyor — GEÇİCİ, sahibi
       telefonda bakacak (docs/tehdit-sanat-uretim.md KARAR GEREKİR md.1). */
    const sp = d.hedefKopek && (typeof TehditSanat !== 'undefined') && TehditSanat.Y_AYI_SAHA;
    if(sp){ Y.cizSprite(g, sp, d.x, d.y, d.dir, 'saha'); return; }
    Y.cizTehdit(g, 'ayi', d.x, d.y, d.dir);
  },

  /* MERMİ DURDURMAZ, YÖN VERİR — bu tehdidin tek kuralı. */
  atis_ayi(ort, x, y, d){
    if(d.evre === 'bitti') return false;
    if(Math.abs(x - d.x) > 20 || Math.abs(y - d.y) > 20) return false;
    d.vurusSay++;
    d.dir = Math.sign(x - d.x) || d.dir;   // ateş eden tarafa döner
    d.hedefKopek = false;
    d.x -= d.dir * 2;                       // irkilir, geri adım — sonra gelir
    if(ort.shake) ort.shake(3);
    if(ort.Snd && ort.Snd.ping) ort.Snd.ping();
    if(d.vurusSay === 1 && ort.showMsg) ort.showMsg('THE BEAR TURNED ON YOU', 200);
    return true;
  },

  /* ======================================================================
     KOYUN HIRSIZI — bölüm 8, konak günü, tek seferlik.
     Oyuncudan: ateş edip etmemeye karar vermek.

     ÖLDÜRME YOK — sahibinin kararı (ADR-021, 2026-08-19):
       "insana direkt ateş edip öldürmeyiz — havaya ateş edip
        kaçırabiliriz, veya buna benzer öldürme eylemi içermeyen bir
        çözüm."
     Bağlayıcı sonuç: insana isabet eden bir atış YOKTUR. İnsanın
     ÜSTÜNE ateş etmek hiçbir şey yapmaz; HAVAYA ateş (insanın belirgin
     biçimde ÜSTÜNE) onu kaçırır. Oyunun kendi diline de uyuyor: kurşun
     bu oyunda öldüren şey değil — hırsızda o cümle en uç hâline varıyor,
     kurşun kimseyi durdurmaz, SES durdurur.

     PUANLANMIYOR. Skor yok, "iyi son/kötü son" yok (ADR-005/025). Ahlaki
     an ölçülürse ahlak olmaktan çıkar, bulmaca olur.
     ====================================================================== */
  HIRSIZ: { pencere: 480, havaEsik: 26, kopekR: 30, hiz: 0.16 },

  kur_hirsiz(ort){
    const live = ort.aliveFlock();
    const a = live.length ? live[ort.lri(live.length)] : null;
    const soldan = ort.lrnd() < 0.5;
    return { evre: 'farket', t: 0, x: a ? a.x : ort.W / 2,
             y: ort.FLOCK.y1, dir: soldan ? -1 : 1,
             tgt: a ? a.id : null, cozum: null };
  },

  gun_hirsiz(ort, d){
    d.t++;
    if(d.evre === 'farket'){
      if(d.t === 30 && ort.showMsg) ort.showMsg('SOMEONE IS AT THE EDGE OF THE FLOCK', 220);
      if(d.t > 60){ d.evre = 'pencere'; d.t = 0; }
      return;
    }
    if(d.evre === 'pencere'){
      /* Kaçmıyor — GİDİYOR. Sakin, uzun. Oyunun en kolay atışı, ve
         zorluk mekanik değil. */
      d.x += d.dir * this.HIRSIZ.hiz;
      const a = d.tgt && ort.koyun(d.tgt);
      if(a && a.state !== 'gone'){ a.x = d.x + d.dir * 8; a.state = 'alert'; a.alarm = 20; }

      /* SAVUR / köpek gösterme = öldürücü olmayan cevap. */
      if(Math.abs(ort.dog.x - d.x) < this.HIRSIZ.kopekR &&
         (ort.komut() === 'savur' || ort.dogTask)){
        d.cozum = 'kopek'; d.evre = 'kacti';
        if(ort.showMsg) ort.showMsg('HE SAW YOUR DOG AND DROPPED THE SHEEP', 220);
        if(ort.Snd && ort.Snd.bark) ort.Snd.bark();
        return;
      }
      if(d.t > this.HIRSIZ.pencere){
        d.cozum = 'gitti'; d.evre = 'bitti';
        if(a) ort.kap(a);                       // koyun gitti — kalıcı (ADR-008)
        if(ort.showMsg) ort.showMsg('HE GOT AWAY WITH A SHEEP', 220);
      }
      return;
    }
    if(d.evre === 'kacti'){
      d.x += d.dir * this.HIRSIZ.hiz * 6;
      if(d.x < -30 || d.x > ort.W + 30) d.evre = 'bitti';
    }
  },

  ciz_hirsiz(ort, g, d){
    if(d.evre === 'bitti') return;
    /* ÜRETİLEN SİLUET (tehditsanat.js). Geçici dört dikdörtgenin yerini
       aldı. Duruşu tehditkâr DEĞİL telaşlı — bu bir düşman değil,
       kaçırılacak biri (ADR-021: öldürme yok). */
    const sp = (typeof TehditSanat !== 'undefined') && TehditSanat.Y_HIRSIZ;
    if(sp){ ort.Yayla.cizSprite(g, sp, d.x, d.y, d.dir, 'kacar'); return; }
    const p = ort.Yayla.TEHDIT.karaayak.pal;
    ort.px(g, d.x - 2, d.y - 16, 4, 12, p.a);
    ort.px(g, d.x - 2, d.y - 20, 4, 4, p.b);
    ort.px(g, d.x - 2, d.y - 4, 2, 4, p.a);
  },

  /* HAVAYA ATEŞ: insanın belirgin biçimde ÜSTÜNE. İnsanın kendisine
     nişan almak HİÇBİR ŞEY yapmaz — bilerek. */
  atis_hirsiz(ort, x, y, d){
    if(d.evre !== 'pencere') return false;
    if(Math.abs(x - d.x) > 34) return false;
    if(y > d.y - this.HIRSIZ.havaEsik){
      /* İnsana nişan alındı: atış geçersiz, ve oyun bunu SÖYLÜYOR —
         sessizce yutmak "oyun bozuk" öğretir. */
      if(ort.showMsg) ort.showMsg('WE DO NOT SHOOT PEOPLE', 200);
      return true;
    }
    d.cozum = 'hava'; d.evre = 'kacti';
    const a = d.tgt && ort.koyun(d.tgt);
    if(a){ a.alarm = 60; }
    if(ort.showMsg) ort.showMsg('WARNING SHOT. HE RAN, THE SHEEP STAYED', 220);
    return true;
  },

  /* ======================================================================
     FIRTINA / SEL — bölüm 9.
     Oyuncudan: sürüyü zamanında barınağa sokmak — NİŞAN TAMAMEN KAPALIYKEN.

     Oyunun TERSİ: tüfek ana fiilken ölü, GETİR ara sıraysa sürekli ana
     fiil, DUR konumlamaysa köpeği duvar olarak dikmek. Düşman yok,
     ZAMAN var. ADR-020'nin "zorluk bilgi/araç eksilterek artar"
     kuralının en uç hâli.
     ====================================================================== */
  FIRTINA: { uyari: 260, sure: 1100, barinakR: 34, itis: 0.35 },

  kur_firtina(ort){
    return { evre: 'yaklasan', t: 0,
             barinakX: ort.W * (ort.lrnd() < 0.5 ? 0.22 : 0.78),
             kurtarilan: 0, kaybedilen: 0, bitti: false };
  },

  gun_firtina(ort, d){
    d.t++;
    if(d.evre === 'yaklasan'){
      if(d.t === 30 && ort.showMsg) ort.showMsg('THE WEATHER IS TURNING. GET TO SHELTER', 240);
      if(ort.Snd && ort.Snd.startWind && d.t === 30) ort.Snd.startWind();
      if(d.t > this.FIRTINA.uyari){ d.evre = 'firtina'; d.t = 0; }
      return;
    }
    if(d.evre === 'firtina'){
      /* Sürü dağılır: rüzgâr onları barınaktan UZAĞA iter. GETİR bunun
         tek panzehiri, DUR ise köpeği duvar olarak dikmek. */
      ort.aliveFlock().forEach(a => {
        a.state = 'alert'; a.alarm = Math.max(a.alarm || 0, 30);
        const barinakta = Math.abs(a.x - d.barinakX) < this.FIRTINA.barinakR;
        if(!barinakta) a.x += Math.sign(a.x - d.barinakX) * this.FIRTINA.itis;
      });
      if(d.t > this.FIRTINA.sure){
        /* ZİRVE: barınakta olmayan kaybedilir — kalıcı (ADR-008). */
        ort.aliveFlock().slice().forEach(a => {
          if(Math.abs(a.x - d.barinakX) < this.FIRTINA.barinakR) d.kurtarilan++;
          else { ort.kap(a); d.kaybedilen++; }
        });
        d.evre = 'bitti'; d.bitti = true;
        if(ort.Snd && ort.Snd.stopWind) ort.Snd.stopWind();
        if(ort.showMsg) ort.showMsg('THE STORM PASSED. SAFE IN SHELTER: ' + d.kurtarilan + ' barinakta', 260);
      }
    }
  },

  /* Barınak dünyada duran bir NESNE (ADR-014) — kaya çıkıntısı. */
  ciz_firtina(ort, g, d){
    if(d.evre === 'bitti') return;
    const p = ort.Yayla.TEHDIT.ayi.pal;
    const y = ort.GROUND;
    ort.px(g, d.barinakX - 22, y - 20, 44, 4, p.c);
    ort.px(g, d.barinakX - 18, y - 16, 36, 16, p.a);
    ort.px(g, d.barinakX - 14, y - 12, 28, 12, p.b);
    /* Fırtınada dikey çizgiler — yağmur. Sessizde de okunmalı. */
    if(d.evre === 'firtina'){
      for(let i = 0; i < 22; i++){
        const rx = (i * 37 + (d.t * 3)) % ort.W;
        const ry = ((i * 53 + d.t * 7) % (y - 10));
        ort.px(g, rx, ry, 1, 5, p.d || '#8d8078');
      }
    }
  },

  atis_firtina(){ return true; },    // nişan kapalı: atış hiç çıkmıyor

  /* Sabah dökümü — bölüm sonu ve bitiş ekranı bunu okuyacak. */
  ozet(){
    if(!this.aktif) return { geldi: false };
    return { geldi: true, tehdit: this.aktif, evre: this.d ? this.d.evre : null,
             vuruldu: !!(this.d && this.d.vuruldu), cozum: this.d ? this.d.cozum : null,
             kurtarilan: this.d ? this.d.kurtarilan : undefined };
  },
};
/* ==TEHDIT-END== ========================================================= */
