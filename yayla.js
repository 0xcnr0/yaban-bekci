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
  /* seans: kaç eğitim seansı ister (his-düğmesi, ölçüm değil — oynanışta
     ayarlanacak). Sıraya göre ağırlaşıyor: köpek zorlaşan işleri daha
     geç kavrıyor, ve geç komutların bedeli (yuva) daha yüksek. */
  dur:   { en:'STAY',   bolum:2, seans:2 },
  getir: { en:'FETCH',  bolum:3, seans:3 },
  sus:   { en:'QUIET',  bolum:6, seans:3 },
  savur: { en:'CHARGE', bolum:8, seans:4 },
};
const Y_SLOT = 3;                       // ölçülmüş sınır, keyfi değil

/* Komut ne kadar sürer. DUR süresiz DEĞİL: oyuncu bir daha basana kadar
   ya da köpek başka bir işe zorlanana kadar. Süresiz bir "kapat" hâli
   oyuncunun unutup sabahı köpeksiz geçirmesine yol açar — ve bu ceza
   GÖRÜNMEZ olurdu, bu deponun yasakladığı şey (yaylanın dersi:
   "görünmeyen çarpan yasak"). O yüzden düğme basılı kaldığı sürece
   HUD'da işaretli duruyor (Y.syncHUD). */

/* --- KOMUT İKONLARI (ADR-026) --------------------------------------------
   Düğmeler PANEL DEĞİL: her düğme, komutu verince köpeğin ALACAĞI HÂLİ
   gösteriyor — oturan Kangal (DUR), sinmiş Kangal (SUS), şaha kalkıp
   havlayan Kangal (SAVUR); GETİR ise getirilen şeyin kendisi, koyun.
   Harf/ok yok; oyunun kendi nesne dili.

   ÜÇÜNCÜ TUR — PIXELLAB (2026-08-19). El çizimi iki kez reddedildi
   ("pixeller iç içe geçmiş", "ne işe yaradığını anlatmıyor") ve üçüncü
   kez elle denemek aynı duvara toslamak olurdu. Sahibi PixelLab'i
   onaylayıp anahtarı verdi; ikonlar `tools/pixellab.js` ile üretildi
   (üslup sabitleri orada, tek yerde). 48x48, ikon başına kendi paleti,
   şeffaf zemin. Üretim TEKRARLANABİLİR: aynı betik aynı tarifle yeniden
   koşturulabilir.
   SUS iki kez ıskaladı ("crouching low" ayakta duran bir hayvan verdi),
   üçüncü tarif tuttu: yerde yatan, başı pençelerinde. Ve AÇIK RENKLİ
   olanı seçildi — koyu bir sinme pozu koyu zeminde kaybolmuştu, o zaten
   v4'ün ölçülmüş kusuruydu.

   Eski el çizimi notu (v2/v4) tarih olarak duruyor:
   (1) 24px kanvas 44px'e çiziliyordu — 1,83x TAM SAYI OLMAYAN büyütme,
       pikselleri düzensiz eziyor. Artık 48px = tam 2x (CSS).
   (2) Pozlar arası fark hikâye anlatmıyordu. v3 dili: DUR oturan köpek;
       GETİR çoban değneği (kancasıyla) + koyun — koyunu geri ÇEKEN alet;
       SUS sinmiş köpek + üstü BEYAZ çizili ses (koyu çizik koyu zeminde
       görünmüyordu, basılıp bakıldı); SAVUR havlayan baş + altın ses
       yayları. Ve her ikonun ALTINDA ADI var — ağılın kendi dili zaten
       nesneye yazı yazar (NÖBET/GÜNLER/KİLER).
   24x24, iç gölgesiz 2 renk + vurgu; 6x ve gerçek boy (2x) basılıp
   BAKILDI. Palet ana koddan; ART bloğuna dokunulmuyor. */
const Y_IKON = {
  dur: { p:['#3b3437','#40393d','#383034','#b89875','#4d464a','#eedbbc','#332b2e','#2a2327','#767377','#ab2542','#8f8d93','#fcfbf8','#625b62','#bda180','#8d653c','#a6845a','#9d7749'], r:[
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '................a...............................',
    '...............aab....caa.......................',
    '..............baddabaceaaa......................',
    '..............bacffffggeac......................',
    '.............hhbffffffheaaa.....................',
    '.............hbhfffffffhaaaa....................',
    '............habdaffcgffhaaca....................',
    '............hhbbbfbiacfaaaaac...................',
    '............hecfffajkbfcaaaaa...................',
    '............hlaaaaaaaacfhhhh....................',
    '.............hkkgaaaaaafbbc.....................',
    '.............himaaaachffbbha....................',
    '.............hbaaaaaafffbnna....................',
    '..............hhhhhhhfffffnc....................',
    '..............hhhhhhffflfnnnc...................',
    '..............hllddfffllfnfng...................',
    '..............gffffffllfnffnna..................',
    '.............allffffllfffffnnca.................',
    '.............alllffffffffffnnna.................',
    '.............alllffffffllffnfnng................',
    '.............bflllfflllllffffnnn................',
    '..............clllffllllffffnnnna...............',
    '..............gdlllllllffffnnnnnna..............',
    '..............gonlllllfffffnnonnna..............',
    '...............polllllffffnnollonna.............',
    '...............dnollafffffnolffffna.............',
    '...............gnnolaffffndlfffffna.............',
    '...............cfnnacfffnnofffffffda............',
    '...............afnnpcfffnnofffffffna............',
    '...............cffqqcfffdcnnfffffnna............',
    '...............cffqgnfffaaanfffffnnb............',
    '...............cffqggffdcdaanffnnnnnb...........',
    '..............bffqhcfffebbaannnnnbanng..........',
    '.............bfffqcfffdhhllacccccnnndg..........',
    '.............bbbbbfffnhglonnnnnnnnnnb...........',
    '..................ccch.ggggggcccccca............',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
  ]},
  getir: { p:['#4a4643','#454240','#83583c','#9b7d67','#4d4948','#5b514d','#564a47','#fcfcea','#ddcaa7','#6d5551','#cfb997','#866b61','#b39680'], r:[
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '..........aabbb.................................',
    '.........bccccca................................',
    '........accbbbcda...............................',
    '........bcbe.eaab...............................',
    '........bab...acb...............................',
    '........bcb...bcb...............................',
    '........bcb...bcb...............................',
    '........aee...bcb.....eeeeae....................',
    '.........f....acb....ghihhhhg...................',
    '..............bcb...ghhhhhhhhf..................',
    '..............acb...ghhhfhhhhhe.................',
    '..............bcb....eeegjhgekkg................',
    '..............bcb...blljbjaiaabkaee.............',
    '..............bcb..egaaaalbiajlahhhg............',
    '..............ccb..ejaddjjbhkeeahhhha...........',
    '..............ccb...aammgahihhghhhhhhg..........',
    '..............ccb....eaabhhhhhhhhhhhhga.........',
    '..............acb....ehhhhhhhhhhhhhhhia.........',
    '..............bcb....ehihhhhihhhhhhhiib.........',
    '..............acb....ehhiihhhhhhhhhhhib.........',
    '..............acb....ehhhhhhhhhhhhhhika.........',
    '..............bcb....fkhihhhhhhhhhiiia..........',
    '..............agb.....bhhihhhhhiiihba...........',
    '..............aaa......eihihhhiihiabj...........',
    '..............bja......abbaaaaiaaaagb...........',
    '..............aaa......ab..ecafga.bjb...........',
    '..............ala.....ajb..acb.ee.aab...........',
    '...............f......ale..ebb.....f............',
    '.......................g...acb..................',
    '............................g...................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
  ]},
  sus: { p:['#13110e','#151312','#1a1614','#fbe9ce','#feecd5','#720705','#b79070','#bc9576','#b48c6a','#966836','#9c7043','#7f5727','#895f30'], r:[
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '..............ababbb.......babc.................',
    '............bcdeeeeebbcbbbbdeeecb...............',
    '...........addeeeeeeddddddeeeeeddbc.............',
    '..........ceeeeeeeeefdeeeeeeeeeeeedc............',
    '.........adeeeeeeeeedaeeeeeeeeeeeeedb...........',
    '........bdeeeeeeeeeeedcdeeeeeeeeeeeedb..........',
    '.......cgdeeeeeeehggggiceeeeeeeeeeeeda..........',
    '.......biaeeeeeeehiiggicdeeeeeeeeeeeedc.........',
    '.......aiadeeeeeedaiigiibeeeegeeeeeeeec.........',
    '......bjadgdeedhhddaiiiiadeegiideeeeeec.........',
    '......bjadbieeibaddbiiigadeegiaeeeeeeebbb.......',
    '......bkadaieeibaidaiiiibeeeiialdeeeeebddccc....',
    '......bkadideedggddbimmcdeeebllcgdeeeebddddda...',
    '.....bdciadeeeeeeedcmmmcceeedbabbggggdalllldlb..',
    '....bddiaaddeeeeeedmabbddeeedbdddddiifabaaabb...',
    '...cdeedajdbbdeeedlabddeeeeedbdddhgibc..........',
    '..addedgbgaaabeegjaddeeeeeedfadbiaab............',
    '..afdbiiaiibbidmmaddeeddiiilabccc...............',
    '...caaaa.bmhhkkaaadededfaabaa...................',
    '..........bcbbb..cfdadfc........................',
    '..................bbbba.........................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
  ]},
  savur: { p:['#241a2b','#201628','#dfb17f','#d7a574','#96625b','#905c58','#e2b682','#70484e','#baab98','#f2e2c6','#e6ccad','#fbf8f6','#3e354c','#ca3035','#afa7b9'], r:[
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '.................aa......ab.....................',
    '................bcda....aefb....................',
    '...............acfdga..adhfb....................',
    '...............bceega..aeefb....................',
    '...............adeffcaaiiiiab...................',
    '...............ageegcjjjjjjjka..................',
    '...............ageggjjjjbalkbcbbbb..............',
    '...............bggggggkalbcjjjjamb..............',
    '..............bgggggggclbbcjjjjabb..............',
    '..............bgggggggbadjjjjjjjjb..............',
    '.............aggggggggjjjjjjjbbbbb..............',
    '.............bcjgggggjjjjjbbb.b.a...............',
    '............biiggggggjjjjabbbbba................',
    '............biijjjgjjjjjjanbbba.................',
    '...........aiiijjjjjjjjjjjbnbb.ab...............',
    '............biijjjjjjjjjjjjabbbbiab.............',
    '............biiijjjjjjiiiijjjjjaiiia............',
    '...........biifiijjjjjjjjiaaaaaccciia...........',
    '...........biiiijjjjjjjjjkiaggggcciib...........',
    '...........abiijjjjjjjjjjjieggggggcib...........',
    '............biijjjjjjjjjjjjeggggggeib...........',
    '............biijjjjjjjjjjjgggggggcfib...........',
    '.............biijjjjcjcjjgggggggggfeb...........',
    '.............bfiijjjjjjjggggeggggcfa............',
    '.............bfeijjjjjcjgggeeeggceb.............',
    '..............beiijjjjjggggeeeeecea.............',
    '..............beeefjjjjgggcbbffffa..............',
    '..............beeebbicgggggabbfffb..............',
    '...............bffb.baagggeb.abffb..............',
    '...............bffb...agggb..obffb..............',
    '..............bfffb...agccb..abffb..............',
    '.............oefffa...aeega..afffao.............',
    '.............oaaaaoooaiiiebooobbboo.............',
    '...............oooooooaaaaoooooooo..............',
    '....................oooooooo....................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
  ]},
};

/* ===== SÜRÜ BİREYLERİ (ADR-020) ========================================
   "Sekiz özdeş koyun arasında seçim aslında yazı-tura" — eski araştırmanın
   bulgusu. Bireyler o yazı-turayı gerçek bir karara çeviriyor: hangisini
   kurtaracağını biliyorsun, çünkü hangisi olduğunu biliyorsun.

   ÜRETİM YOLU BİLEREK PIXELLAB DEĞİL: taban oyunun kendi SHEEP.rows'u,
   birebir kopya; her birey ona uygulanan TEK işaret. Böylece "sekiz tür
   değil sekiz BİREY" şartı kanıt değil TANIM gereği doğru — ve sanat
   turunun kendi ölçümü de aynı yönü gösteriyordu (aynı karakterin ikinci
   pozu bile başka hayvan çıkıyor).

   ÖLÇÜLEN SÜRÜ EŞİĞİ (docs/koyun-sanat.md): işaretler 14 piksel adımdan
   itibaren yaşıyor; 11 pikselde yapağılar tek şeride birleşiyor ve
   yalnız BACAK BANDINA konan işaretler kurtuluyor. Kural: baş bölgesine
   konan işaret kalabalığa dayanmıyor.

   Bakarak yakalanan hata (üretim turu): kara ayak önce #38282e ile
   yapılmıştı — tabanın toynakları ZATEN #2e2028, yani karartmak yerine
   AÇILMIŞTI. Palet okuyarak değil basıp bakınca çıktı. */
const Y_BIREY = {
  cingirakli: { en:'Bell', w:17, h:11,
    pal:{ a:'#dfd6c7', b:'#e7be95', c:'#ddab91', d:'#483436', e:'#c99474', f:'#38282e', g:'#89615a', h:'#d39273', i:'#e8b830', j:'#2e2028' },
    rows:[
      '....aaaaa........',
      '..aaaaaaaaaaa....',
      'abaaaaaaaaaaaa...',
      'bcaaaaaaaaaaacc..',
      '.baaaaaaaaaaabdec',
      '..aabbaaabaabbdfg',
      '..bachccchaaffdfd',
      '.fdd.ehhheee.i.ff',
      '.ffj......jf.....',
      '.f.j......jf.....',
      '.g.d......dg.....',
    ]},
  karaayakli: { en:'Blackfoot', w:17, h:11,
    pal:{ a:'#dfd6c7', b:'#e7be95', c:'#ddab91', d:'#483436', e:'#c99474', f:'#38282e', g:'#89615a', h:'#d39273', i:'#2e2028', j:'#101018' },
    rows:[
      '....aaaaa........',
      '..aaaaaaaaaaa....',
      'abaaaaaaaaaaaa...',
      'bcaaaaaaaaaaacc..',
      '.baaaaaaaaaaabdec',
      '..aabbaaabaabbdfg',
      '..bachccchaaccdfd',
      '.fdd.ehhheee...ff',
      '.ffi......if.....',
      '.j.j......jj.....',
      '.j.j......jj.....',
    ]},
  benekli: { en:'Speckle', w:17, h:11,
    pal:{ a:'#dfd6c7', b:'#e7be95', c:'#89615a', d:'#ddab91', e:'#483436', f:'#c99474', g:'#38282e', h:'#d39273', i:'#2e2028' },
    rows:[
      '....aaaaa........',
      '..aaaaaaaaaaa....',
      'abaaaccaaaaaaa...',
      'bdaaaaaaaaaaadd..',
      '.baaaaaaacaaabefd',
      '..aacbaaabaabbegc',
      '..badhdddhaaddege',
      '.gee.fhhhfff...gg',
      '.ggi......ig.....',
      '.g.i......ig.....',
      '.c.e......ec.....',
    ]},
  topal: { en:'Limp', w:17, h:11,
    pal:{ a:'#dfd6c7', b:'#e7be95', c:'#ddab91', d:'#483436', e:'#c99474', f:'#38282e', g:'#89615a', h:'#d39273', i:'#2e2028' },
    rows:[
      '....aaaaa........',
      '..aaaaaaaaaaa....',
      'abaaaaaaaaaaaa...',
      'bcaaaaaaaaaaacc..',
      '.baaaaaaaaaaabdec',
      '..aabbaaabaabbdfg',
      '..bachccchaaccdfd',
      '.fdd.ehhheee...ff',
      '.ffi......if.....',
      '.f.i.....d.f.....',
      '.g.d.......g.....',
    ]},
  kuzuluana: { en:'Ewe', w:17, h:11,
    pal:{ a:'#dfd6c7', b:'#e7be95', c:'#ddab91', d:'#483436', e:'#c99474', f:'#38282e', g:'#89615a', h:'#d39273', i:'#2e2028' },
    rows:[
      '....aaaaa........',
      '..aaaaaaaaaaa....',
      'abaaaaaaaaaaaa...',
      'bcaaaaaaaaaaacc..',
      '.baaaaaaaaaaabdec',
      '..aabbaaabaabbdfg',
      '..bachccchaaccdfd',
      '.fdd.ehhheee...ff',
      '.ffi..hhh.if.....',
      '.f.i......if.....',
      '.g.d......dg.....',
    ]},
  karayuz: { en:'Blackface', w:17, h:11,
    pal:{ a:'#dfd6c7', b:'#e7be95', c:'#ddab91', d:'#38282e', e:'#483436', f:'#89615a', g:'#d39273', h:'#c99474', i:'#2e2028' },
    rows:[
      '....aa.aa........',
      '..aaaaaaaaaaa....',
      'abaaaaaaaaaaaa...',
      'bcaaaaaaaaaaacc..',
      '.baaaaaaaaaaadedd',
      '..aabbaaabaabdedf',
      '..bacgcccgaacdede',
      '.dee.hggghhh...dd',
      '.ddi......id.....',
      '.d.i......id.....',
      '.f.e......ef.....',
    ]},
  koc: { en:'Ram', w:17, h:11,
    pal:{ a:'#dfd6c7', b:'#89615a', c:'#e7be95', d:'#ddab91', e:'#483436', f:'#c99474', g:'#38282e', h:'#d39273', i:'#2e2028' },
    rows:[
      '....aaaaa........',
      '..aaaaaaaaaaa..bb',
      'acaaaaaaaaaaaa..b',
      'cdaaaaaaaaaaadd.b',
      '.caaaaaaaaaaacefd',
      '..aaccaaacaaccegb',
      '..cadhdddhaaddege',
      '.gee.fhhhfff...gg',
      '.ggi......ig.....',
      '.g.i......ig.....',
      '.b.e......eb.....',
    ]},
  kuzu: { en:'Lamb', w:9, h:7,
    pal:{ a:'#dfd6c7', b:'#483436', c:'#ddab91', d:'#38282e', e:'#d39273' },
    rows:[
      '...aaaa..',
      '.aaaaaaa.',
      'aaaaaaabc',
      'aaaaaaabd',
      '.aaeeabdb',
      '.bb..bb..',
      '.dd..dd..',
    ]},
};

/* ===== TEHDİT SPRITE'LARI (ADR-021) ====================================
   PixelLab'le üretildi (28 üretim, 7 seçim), `tools/tehdit-aile.js` ile
   kurdun renk rampasına çevrildi ve KURT'un veri şekline dönüştürüldü —
   yani `drawKurt` ile AYNI çizici basabiliyor, yeni çizim yolu yok.

   Üretim turunun ölçtükleri (docs/tehdit-sanat.md):
     - 128px'te üret, 48'de değil (küçükte model üç çeyrek görünüm veriyor)
     - Ölçek YÜKSEKLİKTEN verilir; genişlikten verilince ayakta duran poz
       kurdun iki katı boyunda çıkıyor ve aynı dünyada durmuyorlar
     - Çok kareli karakter poz poz ürettirilemez — kareler seçilen TEK
       kareden türetilir (iki poz iki ayrı hayvan gibi çıktı)

   Şu an her tehdidin TEK karesi var ('dur'). Hareket kareleri o tek
   kareden türetilecek — yukarıdaki üçüncü kural bağlayıcı. */
const Y_VASAK = {
  w: 20, h: 16,
  pal: { a:'#101018', b:'#2e2028', c:'#604342', d:'#89615a', e:'#c99474', f:'#e8b830', g:'#ddab91' },
  kare: { dur: [
      '.aab................',
      '.cbcb...............',
      '.cdcc...............',
      '.ccddc..............',
      'bdedddc.............',
      '.fdgdddccccccc......',
      '..dgddddddddddc.....',
      '..dgeddddddddddc....',
      '..beeddddddddddc....',
      '..bdeddcddeecddc....',
      '..ccccdcdddccddc....',
      '..cdbcdc..bccdddc...',
      '..cdb.dc...bcbcdc..a',
      '..cc..cc....bbbdc.ba',
      '.ccc..dc...bbbcdccdb',
      '.ccb.ccc..bbb.ccbbb.',
  ]},
};

const Y_SIRTLAN = {
  w: 36, h: 17,
  pal: { a:'#1c1a26', b:'#2e2b38', c:'#46414f', d:'#8d8078', e:'#645d63', f:'#e8b830', g:'#101018' },
  kare: { dur: [
      '...........abab.....................',
      '........aaaacbbbbccccccb............',
      '.......aaaccddcdcdecdcdcccc.........',
      '..accaaabcdcddcdcddbdbddcecc........',
      '..bbcebcecdcddcdeedbdcedcdcdb.......',
      '..bcceebecdcddcdeedcddbdbebebb......',
      '..fddeccdcebedbecddcdebdccebba......',
      '..cdddeeceeeedecbdebddbbcddeaaa.....',
      '..cadddcccadcddbbcacecacdecbaabb....',
      '.ccedddb..aebcdbcbaccagabccbaaba....',
      '.bcdccc....aceca....aaaacdcc.aaaa...',
      'aaaa......abcdc.....bbba.bec.aaaba..',
      'gba.....cccaaba......ccb..cbcbgaaaba',
      '.gg....cccb.cec......aba...cecggaaag',
      '.......ceb..ceb.....bbb....bec..ggg.',
      '........aag.bc.....aab.....ca.......',
      '.........ggaaa.....g......aaa.......',
  ]},
};

const Y_KARAAYAK = {
  w: 20, h: 17,
  pal: { a:'#101018', b:'#2e2028', c:'#483436', d:'#775752', e:'#b3897d', f:'#e8b830', g:'#dfd6c7' },
  kare: { dur: [
      '...ab...............',
      '...ab...............',
      '...cb...............',
      '..dedd..............',
      '.fbbbgd.............',
      'abbacggdddddddd.....',
      '.ca.dggggggggggddd..',
      '.....dggggggggggd...',
      '.....dggeeedddggd...',
      '......bbbbb..degd...',
      '......bbb....degd...',
      '......aa......ded...',
      '......aa......dddd..',
      '......aa.......d.dd.',
      '......aaa......d..d.',
      '......aaa.....dd..d.',
      '......aa.....bd..dd.',
  ]},
};

const Y_AYI = {
  w: 36, h: 26,
  pal: { a:'#483436', b:'#2e2028', c:'#1c1620', d:'#101018', e:'#e8b830', f:'#604342', g:'#89615a' },
  kare: { dur: [
      '.............aaab...................',
      '...........baaaaaaa.................',
      '..........aaaaaaaaaaaaaaaaaaa.......',
      '........baaaaaaaaaaaaaaaaaaaaaa.....',
      '......baaaaaaaaaaaaaaaaaaaaaaaaa....',
      '..c..bbbbaaaaaaaaaaaaaaaaaaaaaaaa...',
      '..cbabbdcaaaaaaaaaaaaaaaaaaaaaaaaa..',
      '..cbaabdcaaaabaaaaaaaaaaaaaaaaaaaab.',
      '..eaaaaabaaaabaaaaabaaaaaaaaaaaaaaa.',
      '..aaaaaaaababbaaaaaabaaaaaaaaaaaaaab',
      '.cabfbaaaababaaaaaaabaaaaaabaaaaaaab',
      '..abbaaaaababaaaaaaaabaaaabbaaaaaaaa',
      '.agfaaaaaabacaaaaaaaabaaaabaaaaaaaab',
      'cbfgfaaabcdccaaaaaaaabaaaabaaaaaaaab',
      'ddfgfabbdddddbaaaaaaacbabcbaaaaaaaab',
      '.baabc...ddddcaaaaaabdccccbaaaaaaaa.',
      '..bc.....cddddbaaaaabccccccaaaaaaac.',
      '.........cccddbaaaaabdddddcaaaaaaad.',
      '.........ccccccaaaaab.....dbaaaaabd.',
      '........dccccccaaaaab.....cbaaaaacd.',
      '........dcccccbaaaab.......caaaabdcd',
      '........dccccd.baaab.......daaaabccc',
      '........dcccc..aaaab........baaabccd',
      '......ddcccd.dcaaab.......dcbaaabcc.',
      '.....ddcccc.cbbaaac......cbbaaabccd.',
      '.....ddddd..cdcccc.......cccccccd...',
  ]},
};

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

  /* --- konak: EĞİTİM SEANSLARI (ADR-020 md.2, ADR-023) ------------------
     Komut bir yuvada bir seferde ÖĞRENİLMEZ; seans ister. Her seans bir
     konak yuvası yer — yani sağımdan/bahçeden çalar (ADR-022 kural 1).
     Burada yalnız MODEL var; ekran (yakın çekim Kangal, bakım dili)
     HUD araştırması dönünce yazılacak — iki kez reddedilen ekran işine
     üçüncü kez tasarım raporu olmadan girilmiyor. */
  egitim: null,                 // { k, seans } — süren eğitim

  egitimSec(k){
    if(!Y_KOMUT[k] || this.ogrenilen.includes(k)) return false;
    if(this.egitim && this.egitim.k === k) return true;
    this.egitim = { k, seans: 0 };
    return true;
  },

  /* Bir seans işle — konak yuvası harcandığında çağrılır.
     Dönüş: null (eğitim yok) ya da { k, seans, gerek, bitti }.
     Tamamlanınca komut kendiliğinden ÖĞRENİLİR (ogren üzerinden — slot
     kuralları oraya bağlı, ikinci bir yol açılmıyor). */
  egitimSeans(){
    if(!this.egitim) return null;
    const e = this.egitim, gerek = Y_KOMUT[e.k].seans;
    e.seans++;
    const bitti = e.seans >= gerek;
    if(bitti){ this.ogren(e.k); this.egitim = null; }
    return { k: e.k, seans: Math.min(e.seans, gerek), gerek, bitti };
  },

  /* --- konak: YUVA SİSTEMİ (ADR-019 "aktif seçim", ADR-022 kural 1) -----
     "Bu sabah N iş yapabilirsin." Üretim koyun sayısına değil AYIRDIĞIN
     VAKTE bağlı — 010'un ölçümle doğrulanan çözümü. İki sabit ölçülmüş:
       - sağım ziyaret başına ≤5 (ADR-019: 6'da gradyan geri geliyor,
         8'de karar çiğneniyor — sürü tabanı değişirse YENİDEN ölçülür)
       - yuva sayısı his-düğmesi (haritada 3-5 arası; kampanya.js yeniden
         koşturulunca kalibre edilir)
     Burada yalnız çerçeve: kim tüketiyor (sağım/eğitim/bakım/bahçe),
     sınırlar nerede. Ekran konak sahnesiyle gelecek. */
  YUVA: { sagimTavan: 5 },      // ADR-019, ölçülmüş — değiştirme, yeniden ölç
  yuvaKalan: 0,
  sagimBugun: 0,

  gunBasla(yuva){
    this.yuvaKalan = Math.max(0, yuva | 0);
    this.harcanan = 0;
    this.sagimBugun = 0;
    this.birak();               // dünkü komut sabaha taşınmaz
    this.egitimHazirla();
  },

  /* SIRASI GELEN KOMUTU GÜNÜN BAŞINDA SEÇ.

     NİYE BURADA: konak ekranı "eğitim yapılabilir mi" sorusunu
     `this.egitim` dolu mu diye soruyor. Seçim yalnız DOKUNUŞTA yapılsaydı
     ekran hep "eğitim yok" derdi ve dokunmak da mümkün olmazdı — tavuk
     yumurta. Ölçüldü: oyuncu HİÇBİR komutu öğrenemiyordu.

     SEÇİM MENÜ DEĞİL SIRA: harita komutları bölümlere bağlıyor
     (DUR@2, GETİR@3, SUS@6, SAVUR@8), yani cevap zaten belli. Bir seçim
     ekranı ADR-024'ün yasakladığı menü katmanını geri getirirdi.

     Süren bir eğitim varsa DOKUNULMUYOR — seanslar boşa yanmasın. */
  egitimAdayi(){
    if(!this.sefer) return null;
    const bolum = this.sefer.bolum;
    const sira = Object.keys(Y_KOMUT)
      .filter(k => !this.ogrenilen.includes(k) && Y_KOMUT[k].bolum <= bolum)
      .sort((a, b) => Y_KOMUT[a].bolum - Y_KOMUT[b].bolum);
    return sira.length ? sira[0] : null;
  },

  egitimHazirla(){
    if(this.egitim) return this.egitim.k;
    const k = this.egitimAdayi();
    if(k) this.egitimSec(k);
    return k;
  },

  /* Bir yuva harca. tur: 'sagim' | 'egitim' | 'bakim' | 'bahce'.
     Dönüş: false (yuva yok / sınır) ya da iş-özel sonuç nesnesi.
     Sağım tavanı BURADA: ekran ne çizerse çizsin ekonomik sınır tek
     yerden geçer. */
  yuvaHarca(tur){
    if(this.yuvaKalan <= 0) return false;
    if(tur === 'sagim'){
      if(this.sagimBugun >= this.YUVA.sagimTavan) return false;
      this.yuvaKalan--; this.harcanan++; this.sagimBugun++;
      return { tur, sagim: this.sagimBugun };
    }
    if(tur === 'egitim'){
      if(!this.egitim) return false;          // önce egitimSec
      this.yuvaKalan--; this.harcanan++;
      return { tur, seans: this.egitimSeans() };
    }
    if(tur === 'bakim' || tur === 'bahce'){
      this.yuvaKalan--; this.harcanan++;
      return { tur };                         // iş-özel etki kendi sahnesinde
    }
    return false;
  },

  /* ===== KAMPANYA KİLERİ (ADR-018 kayıt ayrımı + ADR-019 varyant V2) ====
     Kampanyanın kileri ana modunkinden AYRI, ve bu bir tercih değil
     ZORUNLULUK — ölçümle bulundu (tools/kosum.js, ilk koşu):

       Kampanya sağımı ana modun applySagim'ini çağırdığında 504
       denemenin yalnız 8'i süt verdi; kiler 45 gün boyunca 0'da kaldı
       ve sefer hiç kapanmadı.

     Sebep: applySagim `Save.d.milkedThisCycle` sayacına bağlı ve o sayaç
     MEVSİMDE bir kez sıfırlanıyor (ana modun 30 günlük takvimi). Kampanya
     onu günlük sıfırlayamaz — ana modun kaydını bozar (ADR-008: sonsuz
     mod DEĞİŞMİYOR). tools/kampanya.js zaten "kampanya kileri AYRI bir
     birikim" varsayımıyla ölçülmüştü; burası o varsayımın kodu.

     ÜRETİM V2 — ADR-019'da 1.00× gradyan veren, yani "ustalık ödül almaz"
     kararını koruyan varyant: **bir yuva BİR koyun sağar.** Üretimin
     tavanını yuva belirler, sürü yalnız yuvadan AZ olduğunda tavan olur.

     TÜKETİM sabitleri kampanyanın KENDİSİNİN (GIDER, aşağıda) —
     sahibinin 2026-08-19 kararı. Gerekçesi ve "bu neden çift kaynak
     değil" ayrımı GIDER bloğunun başında yazılı.

     TAVAN YOK: ana modun 36'lık kiler kapasitesi sezonun kuralı
     (larderCap, sanat ölçtü — üç raf x altı güğüm). Kampanya sonlu ve
     45 günlük; o tavan buraya taşınmadı (tools/kampanya.js aynı kararı
     vermişti). Tavan gerekirse ÖLÇÜLEREK konur. */
  kiler: 0,

  /* Bir koyun sağ. `suru` o anki canlı sürü — V2'nin "sürüden çok
     sağılamaz" tavanı. Dönüş: false ya da { kiler, sagim }.
     Sıra önemli: sürü tavanı yuva HARCANMADAN önce bakılıyor, yoksa
     sürüsü biten oyuncu yuvasını da kaybederdi. */
  sag(suru){
    if(this.sagimBugun >= Math.max(0, suru | 0)) return false;
    /* İZİN BEDELİ (ADR-007: bedava güç yok). Karaayak izi sürüyü tedirgin
       ediyor — günlük sağım tavanı bir eksiliyor. Takas BURADA acıtıyor,
       yoksa iz bedava bir güç olurdu. */
    const iz = this.Iz ? this.Iz.etki() : null;
    const tavan = this.YUVA.sagimTavan + (iz ? iz.sagimTavan : 0);
    if(this.sagimBugun >= Math.max(1, tavan)) return false;
    if(!this.yuvaHarca('sagim')) return false;
    this.kiler++;
    return { kiler: this.kiler, sagim: this.sagimBugun };
  },

  /* Günün tüketimi — YALNIZ günlük pay: köpeğin sabit payı + kuzu başına
     pay. Ana oyunun startRun()'daki kuralıyla aynı sabitler.

     GÖÇ AZIĞI BURADA DEĞİL, bilerek. İlk yazımda buradaydı ve kendi
     ölçüm aracım onu yakaladı: yol günü azığı YİYORDU, sonra aynı gün
     yeterlilik kapısı aynı azığın ELDE OLMASINI istiyordu — bir sayı iki
     kez sayılıyordu ve sefer bölüm 1'de sonsuza kadar takılıyordu.
     ADR-024 ikisini tek olay sayıyor ("yolun azığı yeterli" = yola
     çıkmanın şartı), ana oyun da öyle (göç sabahı azığı TAKVİM DONARKEN
     tüketiyor, index.html ~7686). Azık artık yolAzik() ile, yalnız
     gerçekten yola çıkılınca gidiyor.

     "Kimse aç kalmaz" (ana oyunun bağlayıcı kuralı, ~7710): kiler
     yetmezse yalnız KISILIR, asla negatife inmez ve başka hiçbir cezaya
     bağlanmaz. Açlık kendi başına ceza değil — bedelini yeterlilik
     kapısı keser (ADR-024: azık yoksa yola çıkılamaz, TAKILMA). */
  /* ===== KAMPANYANIN KENDİ GİDERİ — sahibinin kararı, 2026-08-19 ======
     "Yol 1 olarak ilerletelim." Kampanya kendi gider sabitlerini alıyor;
     sonsuz mod hiç etkilenmiyor.

     NİYE — ölçüm (docs/kosum-raporu.md §D):
       Kampanyanın en cömert üretimi 45 günde en çok 180 birim; çünkü
       sağım tavanı 5 (ADR-019, "ustalık ödül almaz" kararını korumak
       için ÖLÇÜLMÜŞ sayı). 180/45 = günde 4,00. Ana modun köpek payı da
       tam 4 (SAGIM.dogUpkeep 3,5 yuvarlanmış). Yani en iyi ihtimalle
       üretim köpeğin payını ANCAK karşılıyor — göç azığına, kuzulara
       hiçbir şey kalmıyor. Açık 222 birim, yapısal.

       Sonsuz modda bu sayılar sorun değil: orada üretim sabah başına tüm
       sürü kadar (8-14), yani giderin iki-üç katı. Kampanyada üretim
       yuvaya bağlı ve günde en çok 5.

     BU "ÇİFT KAYNAK" DEĞİL — ayrımı yazıyorum çünkü kural katı:
       Çift kaynak, AYNI şeyin iki yerde tanımlanmasıdır. Burada tanımlar
       AYNI şey değil: SAGIM.dogUpkeep 30 günlük mevsimin sabahı için
       kalibre edilmiş, GIDER.kopek 45 günlük sonlu yolculuk için. İkisi
       farklı bağlamın sayısı ve BİRBİRİNDEN TÜRETİLMİYOR. Kampanya
       ana modun sayısını artık HİÇ okumuyor — yarı yarıya okumak asıl
       tehlikeli olurdu (biri değişince öteki sessizce kayardı).

     SAYILAR ÖLÇÜLEREK BULUNDU, uydurulmadı — tools/kosum.js kabul
     ölçütü taraması, docs/kosum-raporu.md. Sürü tabanı, yuva sayısı ya
     da sağım tavanı değişirse YENİDEN ÖLÇÜLMELİ. */
  GIDER: {
    kopek: 1,        // köpeğin günlük payı
    kuzuBasi: 0.35,  // kuzu başına ek pay (sürü büyüyünce gider de büyür)
    yolAzik: 3,      // göç sabahının azığı — yeterlilik kapısının eşiği
  },

  gunTuket(kuzu){
    const ister = Math.round(this.GIDER.kopek + Math.max(0, kuzu | 0) * this.GIDER.kuzuBasi);
    const verilen = Math.min(this.kiler, ister);
    this.kiler -= verilen;
    return { ister, verilen, ac: verilen < ister };
  },

  /* Yola çıkıldı: göç azığı gider. Kapının okuduğu sayının TA KENDİSİ
     (GIDER.yolAzik) — "yeter mi" ile "ne gitti" tek kaynaktan. */
  yolAzik(){
    const ister = this.GIDER.yolAzik;
    const verilen = Math.min(this.kiler, ister);
    this.kiler -= verilen;
    return { ister, verilen };
  },

  /* ===== KIRKIM (ADR-022, docs/bolum-haritasi.md bölüm 5) =============
     "Kampanyada bir kez, yaylada" — gerçek yaylacılıkta kırkım yaylada
     olur, kültürel olarak doğru. "Bir tam günü yer ve kampanyanın en
     büyük tek geliri."

     "Bir tam gün" burada ŞU demek: kırkım o günün KALAN BÜTÜN yuvasını
     yer. Yani kırkım günü sağım da, eğitim de, bakım da yapılamaz —
     ADR-022 kural 1 ("aynı havuzdan yer") en sert hâliyle.

     Gelir sürüye bağlı (her koyun kırkılır), ustalığa DEĞİL — ADR-010
     korunuyor: iyi nişancının sürüsü büyük kalır ve daha çok yün alır,
     ama bu bir ÖDÜL değil sürünün kendisi (ADR-020: sürü ilerleme
     değil BAHİS). Aynı gerekçe sağım için de geçerli.

     El işi (acele kesersen koyunu kesersin, iz kalır) SAHNENİN işi —
     burada yalnız ekonomik çerçeve var. */
  KIRKIM: { bolum: 5, koyunBasi: 4 },
  kirkimYapildi: false,

  kirkim(suru){
    if(this.kirkimYapildi) return false;
    if(!this.sefer || this.sefer.bolum !== this.KIRKIM.bolum) return false;
    if(this.yuvaKalan <= 0) return false;
    const n = Math.max(0, suru | 0);
    const gelir = n * this.KIRKIM.koyunBasi;
    this.harcanan += this.yuvaKalan;
    this.yuvaKalan = 0;                 // bir tam gün
    this.kiler += gelir;
    this.kirkimYapildi = true;
    return { gelir, koyun: n, kiler: this.kiler };
  },

  /* ===== BAHÇE (ADR-015 KESİN, harita: ekim bölüm 2, hasat bölüm 9) ===
     "Ekiyorsun, iki bölüm sonra karşılığını alıyorsun" taslağın sözüydü;
     BAĞLAYICI harita daha güzelini söylüyor: **çıkarken ekiyorsun,
     dönerken biçiyorsun.** Bölüm 2'de ekilen, bölüm 9'da hasat ediliyor.
     Bir göç oyununda bundan doğru bir "sonucu SONRA görünüyor" (ADR-022
     kural 3) yok — ve ADR-015'in "yalnız alçak konaklarda" kuralına da
     kendiliğinden uyuyor (2 ve 9 kışlağa yakın bölümler).

     Bu yüzden bahçe YOLA ÇIKIŞI finanse ETMEZ, dönüşün son ayağını
     finanse eder. Ekonomi eğrisinin şekli: sağım her gün (ince),
     kırkım bölüm 5 (kalın, dönüşü fonlar), bahçe bölüm 9 (son tampon).

     `kayip` domuz/tilki/karga baskınları için AÇIK BIRAKILDI (ADR-015) —
     baskın mekaniği tehdit işinin parçası, ekonomi tarafı burada hazır.
     Kayıp geçici ve can sıkıcı, kalıcı değil (ADR-002). */
  BAHCE: { ekimBolum: 2, hasatBolum: 9, ekimBasi: 5, tavan: 6 },
  bahce: { ekili: 0, kayip: 0, hasat: false },

  ek(){
    const b = this.BAHCE;
    if(!this.sefer || this.sefer.bolum !== b.ekimBolum) return false;
    if(this.bahce.ekili >= b.tavan) return false;
    if(!this.yuvaHarca('bahce')) return false;
    this.bahce.ekili++;
    return { ekili: this.bahce.ekili, tavan: b.tavan };
  },

  /* Baskın: ekilenin bir kısmı gider. Kalıcı değil — yalnız bu hasadı
     küçültür (ADR-002: bahçe kaybı geçici ve can sıkıcı). */
  bahceBaskin(n){
    const d = Math.max(0, Math.min(this.bahce.ekili - this.bahce.kayip, n | 0));
    this.bahce.kayip += d;
    return d;
  },

  hasat(){
    const b = this.BAHCE;
    if(this.bahce.hasat) return false;
    if(!this.sefer || this.sefer.bolum !== b.hasatBolum) return false;
    const sag = Math.max(0, this.bahce.ekili - this.bahce.kayip);
    if(sag <= 0) return false;
    if(!this.yuvaHarca('bahce')) return false;
    const gelir = sag * b.ekimBasi;
    this.kiler += gelir;
    this.bahce.hasat = true;
    return { gelir, sag, kiler: this.kiler };
  },

  /* ===== TEK KANGAL DÜĞMESİ (HUD raporları, 2026-08-18) =================
     İki bağımsız araştırma aynı yere çıktı: üç çip TEK çıpaya iner ve
     modeller rakip değil KATMAN olur.
       katman 1  dokun     -> hedef-bağlamlı komut (nişangâh neye bakıyor)
       katman 2  bas-tut   -> yelpaze (öğrenilen komutlar)
       katman 3  sürükle   -> hedefli GETİR (yalnız jiroskop; sonra)
     Bağlayıcı iki kural raporlardan:
       - ÇİFT DOKUNUŞ YASAK: sözlüğe girerse her tek dokunuşa 350-500ms
         gecikme ya da kaza biner (ACM kaynaklı ölçüm).
       - Bağlam BASMADAN ÖNCE gösterilir (Overlord'un şikâyet alan
         ihlalinin tersi) — cizBaglamIpucu bunun için var. */
  YELPAZE: { esikMs: 300 },     // tut eşiği — HİS DÜĞMESİ, telefonda ayarlanacak

  yelpaze: null,                // { dilimler:[k], secili:index|null }

  /* --- katman 1: hedef-bağlamlı komut --------------------------------
     Nişangâhın altında ne var? Dönüş: taşınan komutlardan biri ya da
     null. Yakınlık yarıçapı görsel: oyuncu "şunun üstündeyim" diyorsa
     öyle olmalı; sayı his düğmesi. */
  BAGLAM: { r: 26 },

  baglamKomut(nesneler, ax, ay){
    if(!this.aktif) return null;
    const yakin = (liste) => {
      for(const n of (liste || [])){
        if(n == null) continue;
        if(Math.hypot((n.x || 0) - ax, (n.y || 0) - ay) <= this.BAGLAM.r) return true;
      }
      return false;
    };
    /* Sıra ÖNEMLİ: tehdit koyundan önce bakılır — ikisi üst üsteyse
       oyuncunun niyeti neredeyse hep tehdittir (kurtarma anı). */
    if(this.tasinan.includes('savur') && yakin(nesneler.tehditler)) return 'savur';
    if(this.tasinan.includes('getir') && yakin(nesneler.suru))      return 'getir';
    /* Boşluğa bakıyorsa: verili komut varsa KALDIR (aynı düğme), yoksa
       duruş komutu (DUR öncelikli, yoksa SUS). */
    if(this.verilen) return null;
    if(this.tasinan.includes('dur')) return 'dur';
    if(this.tasinan.includes('sus')) return 'sus';
    return null;
  },

  /* Dokunuşun sonucu — girdi katmanı bunu çağırır. */
  dokun(nesneler, ax, ay){
    if(!this.aktif) return null;
    const k = this.baglamKomut(nesneler, ax, ay);
    if(k === null){ const vardi = this.verilen; this.birak(); return vardi ? 'kaldirildi' : null; }
    this.ver(k);
    return this.verilen === k ? k : 'kaldirildi';
  },

  /* --- katman 2: yelpaze --------------------------------------------- */
  yelpazeAc(){
    if(!this.aktif || !this.tasinan.length) return false;
    this.yelpaze = { dilimler: this.tasinan.slice(), secili: null };
    return true;
  },
  yelpazeSec(i){
    if(!this.yelpaze) return false;
    this.yelpaze.secili = (i >= 0 && i < this.yelpaze.dilimler.length) ? i : null;
    return true;
  },
  /* Bırak: seçili dilim varsa komut verilir, yoksa İPTAL (dışarı
     sürükleyip bırakmak = vazgeçmek, Wild Rift kalıbı). */
  yelpazeBirak(){
    if(!this.yelpaze) return null;
    const y = this.yelpaze; this.yelpaze = null;
    if(y.secili === null) return null;
    const k = y.dilimler[y.secili];
    this.ver(k);
    return this.verilen === k ? k : 'kaldirildi';
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

  /* --- ana koda kanca #1: KÖPEĞİ KOMUT YÖNETİR -------------------------
     updateStrikes'ın en başından çağrılıyor. `true` dönerse ana kodun
     otomatik ataması O KARE ÇALIŞMAZ ve köpeği BURASI sürer.

     Tasarım kararı: komut verildiğinde köpeğin hareketini de Yayla
     üstlenir. Alternatif (ana kodun `G.dogTask` makinesine sahte görev
     yazmak) daha az kod olurdu ama varış anında `resolveStrike` çağrısı
     tetikleniyor — GETİR'de yanlış, ve düzeltmek iki kanca daha isterdi.
     Böylece kanca sayısı sabit kaldı (ADR-018 bütçesi).

     BOĞUŞMA HİÇBİR KOMUTLA KESİLMEZ: "Kurşun kurdu durdurmaz, kurdu
     Kangal durdurur" cümlesi bağlayıcı — kavgadan çekilen bir köpek o
     cümleyi çiğner. */
  KOMUT_HIZ: { savur: 1.35, sus: 0.6, getir: 1.0 },

  updateKomut(G, dog){
    if(!this.aktif) return false;
    const k = this.verilen;
    if(!k) return false;
    if(G.dogTask && G.dogTask.phase === 'fight') return false;

    /* DUR — köpek olduğu yerde kalır. Atanmış ama yetişmemiş iş bırakılır:
       oyuncu "dur" dediyse köpek gerçekten durmalı, yoksa düğme yalan
       söyler. */
    if(k === 'dur'){
      if(G.dogTask){ G.dogTask.claimed = false; G.dogTask = null; }
      return true;
    }

    const hiz = (G.DOGRUN_SPEED || 1.9) * (this.KOMUT_HIZ[k] || 1);
    const sur = (hx, hy) => {
      const dx = hx - dog.x;
      dog.x += Math.max(-hiz, Math.min(hiz, dx));
      dog.y += (hy - dog.y) * 0.18;
      dog.pose = 'run'; dog.show = true; dog.f = (G.t >> 2) & 3;
      return Math.abs(dx) < 5;
    };

    /* SAVUR — köpek kendini gösterip tehdidi ÜSTÜNE çeker. Yetiştiği
       sürece baskının sayacı ilerlemiyor (tehdit köpekle meşgul, koyun
       alınmıyor) ama köpek bedelini ödüyor: yıpranma birikiyor ve
       GÖRÜNÜR (dogHurt kırmızı titreşimi ana kodda zaten çiziliyor).
       Bedava kurtarma yok — ADR-007. */
    if(k === 'savur'){
      const s2 = (G.strikes || []).find(x => x.phase !== 'fight');
      if(!s2){ return true; }              // ortada baskın yok: köpek bekler
      if(sur(s2.x, s2.y)){
        s2.t = 0;                          // tehdit köpekle meşgul
        this.savurKare = (this.savurKare || 0) + 1;
        /* İZİN BEDELİ: Ayı Korkusu köpeği ürkek yapıyor, SAVUR onu daha
           çok yıpratıyor (ADR-007). */
        if(this.savurKare % 30 === 0){
          const iz = this.Iz ? this.Iz.etki() : null;
          const carpan = 1 + (iz ? iz.savurYipranma : 0);
          G.dogHurt = Math.max(G.dogHurt || 0, Math.round(24 * carpan));
        }
      }
      return true;
    }

    /* GETİR — sürüden en çok ayrılmış hayvanı kolona geri katar.
       Ürkmüş/alarmda olan öncelikli: "geride kalan" tam olarak o.
       Bedeli örtük ama gerçek: köpek o sırada tehditlere yetişmiyor. */
    if(k === 'getir'){
      const canli = (G.flock || []).filter(a => a.alive !== false && !a.gone);
      if(!canli.length) return true;
      const cx = canli.reduce((t, a) => t + a.x, 0) / canli.length;
      /* ÖNCE ÜRKMÜŞ OLANLAR. İlk yazımda alarm yalnız puana eklenen bir
         bonustu (+40) ve ölçüldü: uzaktaki SAKİN bir koyun ürkmüş olanı
         141'e 124 ile zor geçiyordu — yani "geride kalanı getir" komutu
         bazen sağlam koyunu getiriyordu. Niyet sıralamayla söylenmeli,
         bonusla değil: ürkmüş varsa hedef onlardan biri, yoksa en ayrık
         olan. */
      /* YOLDA KOPAN ÖNCE. GETİR'in tasarım gerekçesi zaten buydu
         ("geride kalanı kolona kat"); yol sahnesi ona ilk gerçek işini
         veriyor. Sıra: kopan > ürkmüş > en ayrık. */
      const kopan = canli.filter(a => a.kopuk);
      const urkmus = canli.filter(a => a.alarm > 0 || a.startle > 0);
      const aday = kopan.length ? kopan : (urkmus.length ? urkmus : canli);
      let hedef = null, en = -1;
      for(const a of aday){
        const puan = Math.abs(a.x - cx);
        if(puan > en){ en = puan; hedef = a; }
      }
      if(hedef && sur(hedef.x, hedef.y)){
        hedef.alarm = 0; hedef.startle = 0; hedef.state = 'graze';
        this.yolKat(hedef);                          // kopmuşsa kolona katıldı
        hedef.x += Math.sign(cx - hedef.x) * 1.4;   // kolona doğru itilir
      }
      return true;
    }

    /* SUS — sessiz yaklaşma. Köpek YAVAŞ (%60) ama geçtiği yerdeki sürü
       ürkmüyor: yakınındaki hayvanların alarmı sönüyor. Takas net —
       panik yatışıyor ama yetişme şansı düşüyor. */
    if(k === 'sus'){
      for(const a of (G.flock || [])){
        if(Math.hypot(a.x - dog.x, a.y - dog.y) < 34){
          if(a.alarm > 0) a.alarm = Math.max(0, a.alarm - 2);
          if(a.alarm === 0 && a.state === 'alert') a.state = 'graze';
        }
      }
      const s3 = (G.strikes || []).find(x => x.phase !== 'fight');
      if(s3) sur(s3.x, s3.y);
      return true;
    }
    return false;
  },

  /* --- ana koda kanca #2: boşta sürüklenme --------------------------- */
  /* Ana kod boştaki köpeği sürünün ortasına doğru sakin sakin çekiyor.
     DUR verildiyse o çekiş de durmalı — yoksa köpek "durdu" ama yavaşça
     kayıyor olur ve düğme yine yalan söyler. */
  bostaKilitli(){ return this.aktif && this.verilen === 'dur'; },

  /* --- HUD -------------------------------------------------------------
     Not: eskiden `hudSlotlari()` üç çipin listesini üretiyordu. Üç çip
     tasarımı sahibi tarafından kapatıldı (tek Kangal düğmesi kabul
     edildi, 2026-08-19) ve fonksiyon ölü ağırlık olarak SİLİNDİ —
     `docs/tek-dugme-prototip.md`. Düğmenin yüzü artık `verilen` ya da
     bağlamın önerdiği komuttan türüyor (syncKangal). */

  /* --- kayıt ----------------------------------------------------------- */
  /* ADR-018 ölçümü: SAVE_V YÜKSELTİLMEYECEK — beyaz liste göçü zaten
     ücretsiz yapıyor, yükseltmek eski sürüme dönen oyuncunun kaydını
     siliyor. Bu yüzden kampanya verisi `Save.d.campaign` altında kendi
     alanında duruyor ve şeması burada. */
  kaydet(){
    return { ogrenilen: this.ogrenilen.slice(), tasinan: this.tasinan.slice(),
             kiler: this.kiler, kirkimYapildi: this.kirkimYapildi,
             /* Alet ve izler kendi modüllerinde yaşıyor; şemaları onların.
                Kampanya kaydı TEK yerden geçiyor (Save.put) — ikinci bir
                kayıt kapısı açmak birinin unutulması demekti. */
             alet: (typeof Alet !== 'undefined') ? Alet.kaydet() : null,
             iz: (typeof Iz !== 'undefined') ? Iz.kaydet() : null,
             bahce: { ekili: this.bahce.ekili, kayip: this.bahce.kayip, hasat: this.bahce.hasat },
             egitim: this.egitim ? { k: this.egitim.k, seans: this.egitim.seans } : null,
             sefer: this.sefer ? JSON.parse(JSON.stringify(this.sefer)) : null };
  },
  yukle(d){
    if(!d) return;
    this.ogrenilen = Array.isArray(d.ogrenilen) ? d.ogrenilen.filter(k => Y_KOMUT[k]) : [];
    this.tasinan = Array.isArray(d.tasinan)
      ? d.tasinan.filter(k => this.ogrenilen.includes(k)).slice(0, Y_SLOT) : [];
    /* Eğitim durumu: tanınmayan komut ya da ZATEN öğrenilmiş komut için
       süren eğitim kaydı atılır (kayıt kurcalanmasına dayanıklılık —
       öğrenilmişi yeniden eğitmek seansları boşa yakardı). */
    this.egitim = (d.egitim && Y_KOMUT[d.egitim.k] && !this.ogrenilen.includes(d.egitim.k))
      ? { k: d.egitim.k, seans: Math.max(0, d.egitim.seans | 0) } : null;
    this.verilen = null;
    /* Kiler: negatif ya da sayı olmayan kayıt sıfıra düşer (kurcalama). */
    this.kiler = Math.max(0, Number(d.kiler) || 0);
    this.kirkimYapildi = d.kirkimYapildi === true;
    if(typeof Alet !== 'undefined') Alet.yukle(d.alet);
    if(typeof Iz !== 'undefined') Iz.yukle(d.iz);
    /* Bahçe: kurcalanmış kayıt tavanı aşamaz, kayıp ekiliyi geçemez. */
    const bh = (d.bahce && typeof d.bahce === 'object') ? d.bahce : {};
    const ekili = Math.max(0, Math.min(this.BAHCE.tavan, Number(bh.ekili) || 0));
    this.bahce = { ekili, kayip: Math.max(0, Math.min(ekili, Number(bh.kayip) || 0)),
                   hasat: bh.hasat === true };
    /* Sefer: bölüm/gün sınırları dışına taşan kayıt atılır (kurcalama). */
    const sf = d.sefer;
    this.sefer = (sf && sf.bolum >= 1 && sf.bolum <= this.SEFER.length
                  && sf.gun >= 1 && sf.gun <= this.SEFER[sf.bolum - 1].gunler.length)
      ? { bolum: sf.bolum | 0, gun: sf.gun | 0, takilma: Math.max(0, sf.takilma | 0),
          centik: Array.isArray(sf.centik) ? sf.centik.slice(0, this.SEFER.length) : [],
          bitti: sf.bitti === 'vardi' || sf.bitti === 'suru-bitti' ? sf.bitti : null }
      : null;
  },

  /* Ölçüm/test için: her şeyi başlangıca al. */
  sifirla(G){
    this.kapat(G); this.ogrenilen = []; this.tasinan = [];
    this.odun = 0; this.atesOdun = 0; this.egitim = null; this.sefer = null;
    this.yuvaKalan = 0; this.harcanan = 0; this.sagimBugun = 0; this.kiler = 0;
    this.kirkimYapildi = false; this.bahce = { ekili: 0, kayip: 0, hasat: false };
    if(typeof Alet !== 'undefined') Alet.sifirla();
    if(typeof Iz !== 'undefined') Iz.sifirla();
    this.gun = null; this.geceZorla = false; this.yol = null; this._tohum = 12345;
  },

  /* ===== GÜNÜN AKIŞI (ADR-023) =========================================
     Bir gün dört sahne: sabah nöbeti · konak işleri · yol · gece.
     Gün tipine göre hangileri oynanır (SEFER'in K/Y/B harfleri):
       K konak günü : sabah + işler + gece
       Y yol günü   : sabah + yol + işler + gece
       B büyük gün  : bölümün zirvesi — tek uzun sahne, diğerleri kısa
     Bu makine sahneleri ÇİZMİYOR, SIRAYI tutuyor: hangi sahnedeyiz,
     sıradaki ne, gün bitti mi. Sahnelerin kendisi ayrı ayrı yazılıyor
     (sabah var, gece perdesi var, yol henüz yok).

     Neden burada: gece perdesi ve görünürlük sözleşmesi yazıldı ama
     gece günün bir PARÇASI değildi — yalnız gizli panelden elle
     açılıyordu. Akış olmadan hiçbir sahne "gelmiyor". */
  SAHNE_SIRA: {
    K: ['sabah', 'konak', 'gece'],
    Y: ['sabah', 'yol', 'konak', 'gece'],
    B: ['sabah', 'buyukgun', 'konak', 'gece'],
  },
  YUVA_GUN: { K: 3, Y: 1, B: 0 },   // gün tipine göre iş hakkı (kampanya.js ile AYNI model)

  gun: null,   // { tip, sira:[], i, sahne }

  /* Günü başlat — sefer makinesinden gün tipini alır, yuvaları kurar. */
  gunAc(){
    if(!this.aktif) return null;
    const tip = this.gunTipi() || 'K';
    const sira = this.SAHNE_SIRA[tip].slice();
    this.gun = { tip, sira, i: 0, sahne: sira[0] };
    this.gunBasla(this.YUVA_GUN[tip] || 0);
    /* Gece durumu her gün sıfırlanır: dünkü ateş bugüne kalmaz, odun
       taşınır (sırttaki yük) ama yanan ateş sönmüştür. */
    this.atesOdun = 0;
    return this.gun;
  },

  /* Sıradaki sahneye geç. Dönüş: yeni sahne adı ya da null (gün bitti). */
  sahneBitir(){
    if(!this.gun) return null;
    this.gun.i++;
    if(this.gun.i >= this.gun.sira.length){ this.gun.sahne = null; return null; }
    this.gun.sahne = this.gun.sira[this.gun.i];
    return this.gun.sahne;
  },

  sahne(){ return this.gun ? this.gun.sahne : null; },

  /* ===== AKIŞ SÜRÜCÜSÜ — günün TEK yolu ===============================
     Niye ayrı bir katman: gün döngüsü (sahneleri tüket → tüketimi işle →
     kapıyı çalıştır → azığı öde) ÜÇ adımdan oluşuyor ve sırası önemli.
     Bu sıra iki yerde ayrı ayrı yazılsaydı (oyun bir türlü, ölçüm aracı
     başka türlü) araç oyunu değil KENDİ kurgusunu ölçerdi — bu deponun
     "mantığı test etmek girdi yolunu test etmek DEĞİLDİR" dersinin
     ekonomi tarafı. Şimdi `tools/kosum.js` de `prototype/index.html` de
     aynı üç fonksiyonu çağırıyor.

     Kancalar bilerek ÜÇ: gün başlat · sahne bitir · gün kapat. Kanca
     bütçesi bu depoda ölçülen bir kısıt (ADR-018). */

  /* Günü başlat. Dönüş: ilk sahnenin adı, ya da null. */
  gunuBaslat(){
    const g = this.gunAc();
    return g ? g.sahne : null;
  },

  /* Bu sahne bitti. Dönüş: sıradaki sahne adı, ya da null (gün doldu —
     sıradaki adım gunuKapat). */
  sahneyiBitir(){ return this.sahneBitir(); },

  /* Günü kapat: tüketim → yeterlilik kapısı → yola çıkıldıysa azık.
     `d` = { suru, kuzu, kopekYuruyebilir }.
     Dönüş: gunBitir'in olayı + o gün ekonomide ne olduğu. */
  gunuKapat(d){
    if(!this.aktif || !this.sefer || this.sefer.bitti) return null;
    const o = d || {};
    const t = this.gunTuket(o.kuzu | 0);
    const r = this.gunBitir({
      suru: o.suru | 0,
      kiler: this.kiler,
      kopekYuruyebilir: o.kopekYuruyebilir !== false,
    });
    if(!r) return null;
    /* Azık kapı ile TEK olay (ADR-024): yalnız gerçekten yola
       çıkıldığında gidiyor. Takılmada hiçbir azık gitmez — yürünmedi. */
    const az = (r.olay === 'gecis' || r.olay === 'vardi') ? this.yolAzik() : null;
    return Object.assign({}, r, {
      tuketim: t, azik: az, kiler: this.kiler, ac: t.ac,
    });
  },

  gunBittiMi(){ return !!this.gun && this.gun.sahne === null; },

  /* Gece sahnesi mi — çizim kancaları bunu soruyor. Tek kaynak: elle
     açılan deneme kapısı da bunu set ediyor, akış da. */
  geceMi(){ return this.aktif && (this.sahne() === 'gece' || !!this.geceZorla); },

  /* ===== YOL SAHNESİ (ADR-023) =========================================
     Günün dört sahnesinden biri. Mevcut göç makinesi (gecitMode, kolon
     dizilişi, yürüyüş karesi, kayan zemin) zaten var — yol sahnesi onu
     YENİDEN YAZMIYOR, üstüne iki şey ekliyor:

       1. GERİDE KALANLAR — kolondan düşen hayvan. GETİR komutu tam
          bunun için tasarlanmıştı ("geride kalanı kolona kat"); yol
          sahnesi o komuta ilk gerçek işini veriyor.
       2. YÜRÜYÜŞ HIZI — sahibinin isteği (2026-08-18): "başta yavaş
          başlayıp çeşitli durumlara göre hızlanıp yavaşlayan bir model."
          Karar oyuncunun ve BEDELİ VAR (ADR-007: bedava güç yok).

     HIZ TAKASI — ölçülebilir, gizli çarpan yok (yaylanın dersi):
       ağır  : yol uzun sürer (gün ışığı yenir), sürü dinç kalır
       normal: taban
       sıkı  : erken varılır, ama hayvanlar YORULUR ve geride kalma
               olasılığı artar — yani hızlanmanın bedeli GETİR yuvası. */
  YOL: {
    hiz: { agir: 0.7, normal: 1.0, siki: 1.35 },
    yorulmaTaban: 0.0016,     // kare başına geride kalma olasılığı (normal)
    kopmaMesafe: 26,          // kolondan bu kadar geri düşen "geride kalmış" sayılır
  },

  yol: null,   // { uzunluk, alinan, hiz, kopan:[] }

  yolBasla(uzunluk, hiz){
    this.yol = {
      uzunluk: Math.max(1, uzunluk | 0),
      alinan: 0,
      hiz: this.YOL.hiz[hiz] ? hiz : 'normal',
      kopan: [],
      kopmaSayisi: 0,        // OLAY sayacı — doyuma ulaşmaz (bkz. yolIsle)
    };
    return this.yol;
  },

  yolHiz(h){ if(this.yol && this.YOL.hiz[h]) this.yol.hiz = h; },

  /* Bir kare işle. Dönüş: { bitti, oran, kopan } */
  yolIsle(flock){
    if(!this.aktif || !this.yol) return null;
    const y = this.yol;
    /* BÖLGE FARKI BURADA GERÇEKLEŞİYOR (docs/bolge-farklari.md).
       `cekis` sürünün KENDİ isteği: Winter Camp'te eksi (ağıldan
       kopmuyorlar, yol uzuyor), Home'da artı (eve koşuyorlar, seçtiğin
       hızdan hızlı gidiyorlar). Oyuncunun hız seçimiyle ÇARPILMIYOR,
       ona EKLENİYOR — yoksa sıkı yürüyüş bölge farkını yutardı ve
       "aynı gece daha kalabalık" tuzağına geri düşerdik.
       Taban 0.35'in altına inmiyor: sürü isteksiz olabilir, DURMAZ. */
    const bl = this.bolge();
    const carpan = Math.max(0.35, this.YOL.hiz[y.hiz] + (bl.cekis || 0));
    y.alinan = Math.min(y.uzunluk, y.alinan + carpan);

    /* Geride kalma: hız arttıkça olasılık artıyor. "Gizli çarpan yok"
       kuralı gereği kopan hayvan GÖRÜNÜR (kolondan geri düşüyor).

       İKİ SAYAÇ, ve ayrımı ÖLÇÜMLE öğrenildi: ilk yazımda yalnız "şu an
       kopuk olanlar" sayılıyordu ve o sayaç DOYUMA ULAŞIYORDU — her
       hayvan bir kez kopunca tavan doluyor. 20 hayvanlık sürüde ölçüm
       TERSİNE döndü (ağır yürüyüş sıkıdan çok kopan gösterdi), çünkü
       ağır yürüyüş daha çok kare sürüyor ve düşük oranla da tavana
       varıyor. Bu, ekonomi aracının bir kez düştüğü tuzağın aynısı
       (docs/kampanya-ekonomi-olcumu.md, "doyuma ulaşan sayaç").

       Çözüm: kopma bir OLAY olarak da sayılıyor (kopmaSayisi). Kolona
       katılan hayvan yeniden kopabilir — ki oyunun gerçeği de bu:
       köpek toplamayı bırakırsa sürü yine dağılır. Hızın bedeli
       olaylardan okunuyor, anlık kopuk sayısından değil. */
    if(flock && flock.length){
      /* Bölgenin kopma çarpanı: dar geçitte kuyruk sürekli kopar, açık
         ovada kopmaz. Hız bedeli KARESEL kalıyor (ölçülmüş model), bölge
         farkı onun ÜSTÜNE çarpan olarak biniyor. */
      const olasilik = this.YOL.yorulmaTaban * carpan * carpan * (bl.dagilma || 1);
      for(const a of flock){
        if(a.state === 'gone' || a.kopuk) continue;
        if(this.rnd() < olasilik){
          a.kopuk = true;
          y.kopan.push(a.id);
          y.kopmaSayisi++;
        }
      }
    }
    return { bitti: y.alinan >= y.uzunluk, oran: y.alinan / y.uzunluk,
             kopan: y.kopan.length, olay: y.kopmaSayisi };
  },

  /* Kopan hayvan kolona katıldı — GETİR bunu çağırıyor. */
  yolKat(a){
    if(!a || !a.kopuk) return false;
    a.kopuk = false;
    if(this.yol) this.yol.kopan = this.yol.kopan.filter(id => id !== a.id);
    return true;
  },

  /* Şu an kopuk olan sayısı (ekranda görünen). */
  yolKopan(){ return this.yol ? this.yol.kopan.length : 0; },
  /* Yolun BEDELİ: toplam kopma olayı. Doyuma ulaşmaz, hızla ölçeklenir. */
  yolOlay(){ return this.yol ? this.yol.kopmaSayisi : 0; },

  /* Tekrarlanabilir rastgelelik: ölçüm araçları aynı sonucu alsın.
     Oyunun kendi lrnd'sine bağlanmıyor çünkü o seviye tohumundan
     besleniyor ve yol sahnesi onun çağrı sırasını BOZAR.

     ÜRETEÇ DEĞİŞTİ ve sebebi ölçüm: ilk yazım klasik LCG'ydi
     (1103515245) ve ardışık çağrılar arasında güçlü korelasyon
     bırakıyordu — yol maliyeti ölçümü kuramsal beklentinin (1.93x)
     yerine 1.00x/2.00x/1.18x gibi tutarsız değerler veriyordu. Sorun
     tasarımda değil ÜRETEÇTEYDİ. xorshift32 karıştırması kuramla
     örtüşüyor (aşağıdaki test bunu doğruluyor). */
  _tohum: 12345,
  rnd(){
    let x = this._tohum;
    x ^= x << 13; x >>>= 0;
    x ^= x >>> 17;
    x ^= x << 5;  x >>>= 0;
    this._tohum = x;
    return x / 4294967296;
  },

  /* ===== KONAK KATMANI — ağılın kampanya yüzü (ADR-014) ================
     Konak AYRI BİR EKRAN DEĞİL: ADR-014 onu "yaşadığın yer" kaydına,
     ağılın doğrudan devamı olarak atadı ("aynı sessiz-canlı dil").
     O yüzden yeni bir sahne icat etmek yerine ağılın üstüne KAMPANYA
     KATMANI biniyor: günün iş hakları, süren eğitim, ve yola çıkma
     yeterliliği.

     Neden çizim burada, ağılın kendi kodunda değil: `renderFold` sonsuz
     modun yolu (ADR-003/008 — dokunulmuyor). Katman tek kancadan
     çağrılıyor ve kampanya kapalıyken hiçbir şey yapmıyor.

     "Sessiz ama CANLI, gürültü yanlıştır" (ADR-014) — o yüzden yazı
     yok, çentik var: yuvalar tahta kenarına atılmış çentikler gibi
     duruyor, ağılın kendi dili. */
  /* KONAK GÖSTERGESİ ÇİZİLMİYOR — ve bu bilinçli bir GERİ ALMA.
     Çentikli ilk sürüm (2026-08-19) konak tasarım turunda çürütüldü
     (`docs/konak-tasarim.md`). En ciddi bulgu ANLAM ÇAKIŞMASI:

       Çentik bu oyunda ZATEN başka bir şey demek — ADR-024'te geçilen
       duraklar çentikli, kışlak töreninde çentik tahtaya ELLE atılıyor.
       Aynı görsel sözcük hem BİRİKEN KALICI GEÇMİŞİ hem TÜKENEN BUGÜNÜ
       anlatıyordu, üstelik ters yönlerde (biri dolar, öbürü boşalır).
       Oyuncu iki anlamı tek sözcükten ayıramaz.

     Ayrıca: gösterge sahnenin %0,7'si (görünmez), hiçbir nesneye
     tutunmuyor, ve altın rengi HUD'da zaten iki başka anlam taşıyor.

     ONAYLANAN YÖN — "kanca sırası": aletler yuvaların KENDİSİ olacak.
     Saçak altında bir kanca hattı, o günün hak sayısı kadar alet asılı
     (güğüm=sağım, ıslık=eğitim, kova=bahçe, sargı=bakım). Aleti alırsan
     iş başlar, kanca boşalır; kalan hak = duran alet sayısı. Tek sistem
     hem "kaç iş kaldı"yı hem "iş nereden başlar"ı çözüyor ve sekiz işe
     ölçekleniyor (yeni iş = yeni alet, yeni hotspot değil). Oyunun kendi
     grameri de bu: bakım çekiminde üç fiziksel nesne alt sırada durur ve
     köpeğe sürüklenir.

     Alet sanatı üretilene kadar EKRANDA GÖSTERGE YOK. Yanlış bir sözcükle
     konuşmaktansa susmak doğru — veri (yuvaKalan/harcanan/egitim) yerinde
     ve testli, yalnız görüntüsü bekliyor. */
  cizKonak(){ /* kanca sırası sanatı bekleniyor — bkz. yukarı */ },

  harcanan: 0,   // bugün harcanan yuva (çentik çizimi için)

  /* ===== SEFER İSKELETİ — 10 bölüm / 45 gün (docs/bolum-haritasi.md) ====
     Bağlayıcı haritanın durum makinesi. Gün tipleri: K konak · Y yol ·
     B büyük gün. Bölümün son günü bitince GEÇİŞ denenir (yolKapisi):
       yol          -> çentik atılır, sonraki bölüm
       takilma      -> AYNI konakta fazladan gün (bedava değil — ekonomik
                       bedeli dış katman işletir: bir gece daha, tüketim)
       gericekilme  -> çentik SİLİNİR, önceki bölüme dönülür (ADR-024:
                       bir göç oyununda en doğru yenilgi mesafe kaybı)
       bitis        -> sefer biter, o son gösterilir
     Sahnelerin GÖRSELİ HUD araştırmasını bekliyor; buradaki şey akışın
     kendisi. Tehdit/yan iş bağlantıları kendi sahneleriyle gelecek. */
  SEFER: [
    /* Durak adları İngilizce (2026-08-20, oyunun tamamı İngilizce oldu).
       Sonuncusu bilerek 'Home' — "Kışlak (dönüş)" yerine, yolculuğun eve
       döndüğü tek bakışta anlaşılsın diye. */
    { ad:'Winter Camp',   gunler:'KKY',    hava:'acik' },
    { ad:'The Flatlands', gunler:'KKKB',   hava:'ilkgece' },
    { ad:'Canyon Mouth',  gunler:'KYKYB',  hava:'sis' },
    { ad:'Treeline',      gunler:'KKYKB',  hava:'karisik' },
    { ad:'The Highland',  gunler:'YKKKKB', hava:'acik' },
    { ad:'Riverside',     gunler:'YKKB',   hava:'yagmur' },
    { ad:'Canyon Return', gunler:'YKKKB',  hava:'ruzgar' },
    { ad:'Second Peak',   gunler:'KKYKB',  hava:'gece' },
    { ad:'Last Plain',    gunler:'YKKB',   hava:'firtina' },
    { ad:'Home',          gunler:'YKKB',   hava:'kar' },
  ],

  sefer: null,   // { bolum, gun, takilma, centik:[], bitti:null|'vardi'|'suru-bitti' }

  seferBasla(){
    this.sefer = { bolum: 1, gun: 1, takilma: 0, centik: [], bitti: null };
    return this.sefer;
  },
  /* ===== BÖLGE FARKLARI (docs/bolge-farklari.md) ========================
     Tek mod kararının (docs/plan-tek-mod.md) asıl işi: takvim kalktı,
     ilerlemenin birimi BÖLGE oldu. Ölçüt: "bu bölge, oyuncunun sürüyü
     koruma FİKRİNİ değiştiriyor mu?"

     TEŞHİS, koda bakarak: on bölümün ALTISINDA hiçbir isimli olay yoktu
     (TEHDIT.TAKVIM yalnız 5,6,8,9'u tanıyordu; KARAAYAK 4,7,10'u), ve
     sürünün davranışı HİÇBİR bölgede farklı değildi — `YOL.yorulmaTaban`
     tek bir sabitti. Yani bölgeler yalnız benzer değil, çoğu hiç
     TANIMLANMAMIŞTI.

     Her satırda üç eksenden en az ikisi değişiyor: manzara · sürünün
     hâli · köpeğin işi. Tehdit BURADA YOK — tek kaynağı TEHDIT.TAKVIM ve
     KARAAYAK.GELIS; iki yerde tutmak "çift kaynak"ın kendisi olurdu.

     ALANLAR
       zemin        manzara anahtarı (arka plan seçimi — çağıranın işi)
       dagilma      kopma çarpanı; yolIsle bunu OKUYOR, bugün çalışıyor
       cekis        sürünün kendi hızı: eksi = gitmek istemiyor,
                    artı = öne kaçıyor. yolIsle bunu da okuyor
       dizilis      'serbest' | 'tekSira' | 'genis'  (yol sahnesi — VERİ)
       geceToplanir gece kendiliğinden toplanır mı  (gece sahnesi — VERİ)
       ise/yanlis   o bölgede işe yarayan / geri tepen komut (VERİ)

     `dizilis`, `geceToplanir`, `ise`, `yanlis` şu an YALNIZ VERİ: onları
     işleten sahneler index.html'de ve orası bu oturumun bölgesi değil.
     Bağlanınca oyunun en büyük eksiği kapanır — dört komut var ve
     hangisinin nerede doğru olduğu oyuncuya hiç öğretilmiyor. */
  BOLGE: {
    1:  { zemin:'kislak',   dagilma:0.6, cekis:-0.20, dizilis:'serbest',
          geceToplanir:true,  ise:null,      yanlis:null ,
          yer:'THE HOME PEN', suruUyari:'THEY STAY PUT', isUyari:'GET THEM MOVING' ,
          gece:{ r:1.00, dikey:1.40, titrek:0.00, uyari:  0 } },
    2:  { zemin:'ova',      dagilma:1.0, cekis: 0.00, dizilis:'genis',
          geceToplanir:true,  ise:'dur',     yanlis:null ,
          yer:'OPEN PLAIN', suruUyari:'THEY SPREAD WIDE', isUyari:'FIRST NIGHT OUT' ,
          gece:{ r:1.15, dikey:1.15, titrek:0.00, uyari:  0 } },
    3:  { zemin:'gecit',    dagilma:1.8, cekis:-0.05, dizilis:'tekSira',
          geceToplanir:true,  ise:'getir',   yanlis:null ,
          yer:'A NARROW PASS', suruUyari:'SINGLE FILE', isUyari:'WATCH THE TAIL' ,
          gece:{ r:1.00, dikey:2.60, titrek:0.00, uyari:  0 } },
    4:  { zemin:'agachat',  dagilma:1.3, cekis: 0.00, dizilis:'serbest',
          geceToplanir:true,  ise:'getir',   yanlis:'dur' ,
          yer:'THICK TREES', suruUyari:'THEY VANISH', isUyari:'DO NOT HOLD STILL' ,
          gece:{ r:0.90, dikey:1.60, titrek:0.00, uyari:-30 } },
    5:  { zemin:'yayla',    dagilma:1.2, cekis:-0.10, dizilis:'genis',
          geceToplanir:true,  ise:null,      yanlis:null ,
          yer:'HIGH PASTURE', suruUyari:'THEY GRAZE WIDE', isUyari:'REST, BUT WATCH' ,
          gece:{ r:1.10, dikey:1.30, titrek:0.00, uyari:  0 } },
    6:  { zemin:'dere',     dagilma:1.1, cekis:-0.25, dizilis:'serbest',
          geceToplanir:true,  ise:'sus',     yanlis:'savur' ,
          yer:'A RIVER CROSSING', suruUyari:'THEY FEAR WATER', isUyari:'QUIET THE DOG' ,
          gece:{ r:0.95, dikey:1.60, titrek:0.00, uyari:-45 } },
    7:  { zemin:'gecit2',   dagilma:1.6, cekis: 0.25, dizilis:'tekSira',
          geceToplanir:true,  ise:'dur',     yanlis:'savur' ,
          yer:'THE PASS AGAIN', suruUyari:'THEY RUSH AHEAD', isUyari:'HOLD THE FRONT' ,
          gece:{ r:1.00, dikey:2.40, titrek:0.10, uyari:-20 } },
    8:  { zemin:'zirve',    dagilma:1.4, cekis: 0.00, dizilis:'serbest',
          geceToplanir:false, ise:'savur',   yanlis:null ,
          yer:'COLD HIGH GROUND', suruUyari:'THEY WILL SCATTER', isUyari:'A LONG NIGHT' ,
          gece:{ r:0.90, dikey:1.50, titrek:0.00, uyari: 45 } },
    9:  { zemin:'bozkir',   dagilma:1.9, cekis:-0.15, dizilis:'genis',
          geceToplanir:true,  ise:'sus',     yanlis:'savur' ,
          yer:'OPEN GROUND AGAIN', suruUyari:'THEY ARE TIRED', isUyari:'STORM COMING' ,
          gece:{ r:1.00, dikey:1.30, titrek:0.18, uyari:-50 } },
    10: { zemin:'kislak',   dagilma:1.5, cekis: 0.35, dizilis:'serbest',
          geceToplanir:true,  ise:'dur',     yanlis:'savur' ,
          yer:'THE LAST SLOPE', suruUyari:'THEY RUN FOR HOME', isUyari:'HOLD THEM BACK' ,
          gece:{ r:1.15, dikey:1.30, titrek:0.00, uyari:  0 } },
  },
  /* Bulunulan bölgenin tanımı. Tanımsız bölüm için nötr taban döner —
     bir bölge eklenirse oyun ÇÖKMEZ, yalnız farksız olur. */
  BOLGE_TABAN: { zemin:'ova', dagilma:1.0, cekis:0, dizilis:'serbest',
                 geceToplanir:true, ise:null, yanlis:null },
  bolge(no){
    const b = (no | 0) || (this.sefer ? this.sefer.bolum : 0);
    return this.BOLGE[b] || this.BOLGE_TABAN;
  },
  /* Komut bu bölgede doğru mu / geri teper mi. Çağıran sonucu buna göre
     kurar; bu dosya bir CEZA uygulamıyor, yalnız cevabı söylüyor. */
  /* SIRADAKİ BÖLGE — takvim silindikten sonra (2026-08-20, f4f9623)
     ilerlemeyi gösteren tek şey coğrafya kaldı. Oyuncu "kaçıncı
     gündeyim" diye soramıyor; "ne kadar kaldı ve SIRADA NE VAR"
     sorusunun cevabı buradan çıkıyor.

     ADI VERMİYOR — bilerek. Yol Defteri'nin kuralı "ad ancak VARILINCA
     kazanılır" (Dead Cells); önizleme o kuralı çiğnemeden yapılıyor:
     nereye gideceğini değil, NEYLE karşılaşacağını söylüyor. Üç kısa
     satır — yer, sürünün ne yapacağı, senin işin.

     Dönüş null ise sıradaki yok, yani eve varılıyor. */
  sirada(){
    if(!this.sefer || this.sefer.bitti) return null;
    const n = this.sefer.bolum + 1;
    if(n > this.SEFER.length) return null;
    const b = this.BOLGE[n];
    if(!b || !b.yer) return null;
    return { bolum: n, yer: b.yer, suru: b.suruUyari, is: b.isUyari };
  },

  komutIse(k){ return this.bolge().ise === k; },
  komutYanlis(k){ return this.bolge().yanlis === k; },

  seferBolum(){ return this.sefer ? this.SEFER[this.sefer.bolum - 1] : null; },
  /* TAKILMA GÜNÜ HER ZAMAN KONAK GÜNÜ — ve bu bir tercih değil, bir
     kilitlenmenin onarımı (tools/kosum.js gün-gün izi, 2026-08-19).

     ÖLÇÜLEN KİLİT: her bölüm bir BÜYÜK GÜN'le bitiyor (ADR-025) ve büyük
     günün yuvası 0 (zirveyi oynuyorsun, iş yapmıyorsun). Yeterlilik
     kapısı da bölümün SON gününde işliyor. Yani kapıda takılan oyuncu
     yuvası 0 olan bir günü tekrar tekrar yaşıyordu: hiç gelir üretemiyor,
     kiler 0'a inip orada donuyor, azık bir daha ASLA birikmiyor. Ölçümde
     3. bölümde sonsuza kadar takılı kalındı — geri çekilme bile
     tetiklenmiyor, çünkü sürü sağlam.

     ADR-024 takılmayı zaten "konakta bir gün daha... yavaş sıkışan
     kıskaç" diye tanımlıyor: KISKAÇ, kilit değil. Ve tanımın kendisi
     cevabı veriyor — takıldığın gün KONAKTASIN. Zirve yaşandı ve bitti;
     tekrar edilen şey büyük gün değil, konakta beklenen gün. Bu yüzden
     takılma günü tip 'K': yuvası var, oyuncu çalışıp azığını
     toparlayabiliyor, ama her gün bir gece ve bir tüketim daha ödüyor.
     Kıskaç sıkıyor, kapı kilitlemiyor. */
  gunTipi(){
    const b = this.seferBolum();
    if(!b) return null;
    if(this.sefer.takilma > 0) return 'K';
    return b.gunler[this.sefer.gun - 1];
  },

  /* Günü kapat. Bölüm içinde gün ilerler; son gündeyse geçiş denenir ve
     kapının hükmü uygulanır. Dönüş: { olay, ... } — dış katman (vinyet,
     çentik töreni, ekonomik bedel) buna bakarak sahne kurar. */
  gunBitir(kapiDurum){
    const sf = this.sefer;
    if(!sf || sf.bitti) return null;
    const b = this.SEFER[sf.bolum - 1];
    if(sf.gun < b.gunler.length){
      sf.gun++;
      return { olay: 'gun', bolum: sf.bolum, gun: sf.gun, tip: this.gunTipi() };
    }
    const hukum = this.yolKapisi(kapiDurum || {}).hukum;
    if(hukum === 'yol'){
      sf.centik.push(sf.bolum);
      if(sf.bolum >= this.SEFER.length){ sf.bitti = 'vardi'; return { olay: 'vardi', centik: sf.centik.length }; }
      sf.bolum++; sf.gun = 1; sf.takilma = 0;
      return { olay: 'gecis', bolum: sf.bolum, ad: this.SEFER[sf.bolum - 1].ad };
    }
    if(hukum === 'takilma'){
      sf.takilma++;
      return { olay: 'takilma', kez: sf.takilma, eksik: this.yolKapisi(kapiDurum || {}).eksik };
    }
    if(hukum === 'gericekilme'){
      if(sf.centik.length) sf.centik.pop();
      sf.bolum = Math.max(1, sf.bolum - 1); sf.gun = 1; sf.takilma = 0;
      return { olay: 'gericekilme', bolum: sf.bolum };
    }
    sf.bitti = 'suru-bitti';
    return { olay: 'bitis' };
  },

  /* ===== YETERLİLİK KAPISI (ADR-024) ====================================
     Yola çıkmak bir SINAV değil YETERLİLİK: azık + yürüyebilen köpek +
     yol tutacak sürü. Tutmuyorsa TAKILMA (konakta bir gün daha — bedava
     değil, kıskaç); sürü tabanın altına düştüyse GERİ ÇEKİLME (çentik
     silinir, mesafe kaybı); sürü biterse BİTİŞ.

     Azık eşiği kampanyanın kendi GIDER.yolAzik'ı — kapının istediği
     sayı ile yola çıkınca GİDEN sayı aynı yerden geliyor (yolAzik()).
     Ana modun GECIT.costPerMorning'i ARTIK OKUNMUYOR: sahibinin
     2026-08-19 kararı, gerekçesi GIDER bloğunda. Köpeğin yürüyebilirliği çağırandan
     gelir: "ağır yara" tanımı bakım sahnesinin işi, kapı karar vermez. */
  KAPI: { suruMin: 2 },         // yol tutacak asgari sürü — his-düğmesi

  yolKapisi(d){
    const suru = Math.max(0, d.suru | 0);
    if(suru === 0) return { hukum: 'bitis' };
    if(suru < this.KAPI.suruMin) return { hukum: 'gericekilme' };
    const eksik = [];
    if((d.kiler | 0) < this.GIDER.yolAzik) eksik.push('azik');
    if(!d.kopekYuruyebilir) eksik.push('kopek');
    return eksik.length ? { hukum: 'takilma', eksik } : { hukum: 'yol' };
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
    /* SIRTTA TAŞINAN ODUNUN TAVANI. Yolculuk çıkını sınırlı (ADR-004):
       odun yer kaplıyor, sonsuz biriktirilemiyor. 10 odun ışığı tavana
       (maxR 108) çıkarmaya yetiyor — daha fazlası zaten işe yaramaz. */
    tasimaTavan: 10,
  },

  odun: 0,            // elde taşınan odun
  atesOdun: 0,        // ateşe atılmış (yanan) odun

  /* Işık çemberinin yarıçapı — TEK KAYNAK. Çizim de, görünürlük hükmü de,
     testler de buradan okuyor; ikinci bir yerde hesaplanırsa senkronsuz
     kalır (bu oturumda iki kez o hatanın bedeli ödendi). */
  /* ===== BÖLGE FARKI GECEYE İNİYOR ===================================
     Bölgeler defterde ve haritada ayrışmıştı ama GECEDE ayrışmıyordu —
     ve oyuncunun zamanının çoğu gecede geçiyor.

     ŞİŞİRME DEĞİL, BİÇİM. Aynı geceyi daha kalabalık dalgayla tekrar
     etmek bölge farkı değildir (üç danışmanın da uyarısı). Gecenin
     mekaniği zaten SAYI değil BİLGİ EKSİKLİĞİ (ADR-020). O yüzden
     bölgeler gecede ışığın MİKTARINI değil BİÇİMİNİ değiştiriyor:

       dikey   ışığın dikey ezilmesi. Dar geçitte duvarlar ışığı ince
               uzun bir şeride sıkıştırıyor (2.6); açık ovada havuz
               yuvarlağa yakın (1.15). Aynı odun, bambaşka bir görüş.
       titrek  rüzgâr ateşi kırpıyor: yarıçap nabız gibi inip çıkıyor.
               Yalnız rüzgârlı/fırtınalı bölgelerde, ve KÜÇÜK — tehdidin
               gözden kaybolup çıkması "zar haksız hissettirir"e
               düşmemeli.
       r       yarıçap çarpanı. Bilerek 0.90-1.15 arasında tutuldu;
               ağır işi biçim yapıyor, sayı değil.
       uyari   telgraf kaç kare ERKEN/GEÇ. Dere ve fırtına duymayı
               zorlaştırıyor (eksi); soğuk ve durgun zirvede ses uzağa
               gidiyor (artı) — en zor bölgenin kendi ödülü.

     Titremede `kare` kullanılıyor, rastgele DEĞİL: ölçüm yapılabilsin
     ve aynı kare aynı sonucu versin. */
  geceBicim(){
    const g = this.bolge().gece;
    return g || { r: 1, dikey: 1.6, titrek: 0, uyari: 0 };
  },

  isikR(){
    const a = this.ATES, g = this.geceBicim();
    const taban = a.odunsuzR + a.odunBasiR * Math.max(0, this.atesOdun);
    const nabiz = g.titrek ? (1 + g.titrek * Math.sin((this.kare || 0) / 11)) : 1;
    return Math.min(a.maxR, taban * (g.r || 1) * nabiz);
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
    /* Dikey ezme artık BÖLGEDEN geliyor (eskiden sabit 1.6). Işık yerde
       yayılır, ama dar geçitte duvarlar onu şeride çevirir. */
    const dx = nesneX - atesX, dy = (nesneY - atesY) * this.geceBicim().dikey;
    return Math.hypot(dx, dy) <= this.isikR();
  },

  /* Görünmeyen tehdit için DUYULABİLİR yön. Oyuncuya verilen tek bilgi:
     hangi taraftan. Mesafe VERİLMİYOR — verilirse karanlığın anlamı
     kalmaz. */
  duyulanYon(nesneX, atesX){
    return nesneX < atesX ? 'sol' : 'sag';
  },

  /* ===== GECE PERDESİ — çizim ==========================================
     Kural: görsel çember ile görünürlük hükmü (gorunur) AYNI kaynaktan
     okur — isikR(). Ayrışırlarsa oyun yalan söyler: "görüyorum ama
     vuramıyorum" ya da tersi.

     Ağıl gece perdesi ölçümünün dersi burada bağlayıcı
     (docs/agil-gece-perdesi-olcum-2026-08-18.md): perde GÖKCİSİMLERİNİ
     boğmamalı — o ölçümde tek satırlık perde güneşi boz-yeşile
     çevirmişti. Gecede güneş yok ama ay/yıldız var; perde satır satır
     yalnız DÜNYAYA biniyor, gök şeridinin üst bandı hafif pay alıyor.

     Çizim tek geçişte, satır bazlı dilimlerle: her satırda üç çemberin
     yatay kesitleri hesaplanıyor ve halka halka farklı koyulukta
     boyanıyor — üst üste boyama yok (alfa birikmesi yasak, ölçülemez
     hâle getirir). Titreme KADEMELİ (sürekli sin değil): bu depoda
     sürekli salınım bir kez örnekleme aralığıyla çakışıp donmuş göründü. */
  GECE: {
    disKoyu: 0.62,     // çemberin tamamen dışı
    ortaKoyu: 0.42,    // dış halka
    icKoyu: 0.20,      // iç halka
    merkezKoyu: 0.06,  // ateşin dibi
    gokPay: 0.35,      // gök şeridinin aldığı pay (yıldız/ay boğulmasın)
    gokSinir: 52,      // bu satırın üstü "gök" sayılır (skyBands bölgesi)
  },

  /* ===== ÇİZİM GİRİŞ NOKTALARI — ana koda yalnız İKİ çağrı ============
     ADR-018'in kanca tetiği %80'e (16/20) dayandı ve kuralı bağlayıcı:
     "kancayı gizlemek YASAK, mimariyi yeniden düşün."

     Aracı değiştirip sayıyı düşürmek de yasak (aracı ölçtüğü şeye
     uydurmak). O yüzden ASIL BAĞLANMA azaltıldı: render() içinde dört
     ayrı çağrı vardı (gece perdesi, tehdit sergisi, varlık perdesi,
     bağlam ipucu) — ikiye indi. Sıra korunuyor ve neden ikiye indiği
     sırayla ilgili: bir kısım varlıklardan ÖNCE, bir kısım SONRA
     çizilmek zorunda; tek çağrıya inemez.

       cizDunya(g)  — varlıklardan ÖNCE: gece perdesi (dünya payı)
       cizUstu(g)   — varlıklardan SONRA: varlık perdesi, tehdit sergisi,
                      bağlam ipucu

     Hangisinin çizileceğine Yayla karar veriyor; ana kod ne çizildiğini
     bilmiyor. Yeni bir katman eklemek artık ana koda DOKUNMUYOR. */
  cizDunya(g){
    if(!this.aktif) return;
    if(this.geceMi() && this.geceKonum) this.cizGece(g, this.geceKonum.x, this.geceKonum.y, this.kare);
  },

  cizUstu(g){
    if(!this.aktif) return;
    if(this.geceMi() && this.geceKonum)
      this.cizGeceVarlik(g, this.geceKonum.x, this.geceKonum.y, this.kare);
    /* Sergi: yalnız ölçüm/önizleme yolu, oyunda hiç dolmuyor. */
    if(this.sergi) for(const t of this.sergi) this.cizTehdit(g, t.k, t.x, t.y, t.dir || 1);
    if(this.ipucu) this.cizBaglamIpucu(g, this.ipucu.k, this.ipucu.x, this.ipucu.y);
  },

  geceKonum: null,   // ateşin dünya konumu (sahne verisi)
  sergi: null,       // ölçüm yolu
  ipucu: null,       // { k, x, y } — ana kod her karede tazeliyor
  kare: 0,           // G.t aynası (çizim zamanlaması)

  /* Ana koda kanca #3: render() sabah perdesinden SONRA çağırır.
     atesX/atesY: ateşin dünya konumu. t: kare sayacı (titreme için). */
  cizGece(g, atesX, atesY, t){
    if(!this.aktif) return;
    const K = this.GECE;
    // kademeli titreme: 16 karede bir adım, ±2 piksel
    const tit = [0, 1, 2, 1][((t >> 4) & 3)];
    const r3 = this.isikR() + tit;
    const r2 = Math.max(6, Math.round(r3 * 0.72));
    const r1 = Math.max(3, Math.round(r3 * 0.44));
    const W = 320, H = 180;
    for(let y = 0; y < H; y++){
      /* Gök payı KESKİN DEĞİL: sınırda 12 satırlık geçiş bandı — basılan
         karede y=52'de dikiş görünüyordu (gök açık, dünya koyu, düz çizgi). */
      const gd = (y - K.gokSinir) / 12;
      const pay = gd <= 0 ? K.gokPay : gd >= 1 ? 1 : K.gokPay + (1 - K.gokPay) * gd;
      const dy = (y - atesY) * 1.6;                 // sözleşmeyle AYNI basıklık
      const kesit = r => { const q = r * r - dy * dy; return q <= 0 ? 0 : Math.sqrt(q); };
      const x3 = kesit(r3), x2 = kesit(r2), x1 = kesit(r1);
      const seg = (a, b, koyu) => {
        a = Math.max(0, Math.round(a)); b = Math.min(W, Math.round(b));
        if(b > a) px(g, a, y, b - a, 1, 'rgba(6,8,14,' + (koyu * pay).toFixed(3) + ')');
      };
      if(x3 <= 0){ seg(0, W, K.disKoyu); continue; }
      seg(0, atesX - x3, K.disKoyu);  seg(atesX + x3, W, K.disKoyu);
      seg(atesX - x3, atesX - x2, K.ortaKoyu); seg(atesX + x2, atesX + x3, K.ortaKoyu);
      seg(atesX - x2, atesX - x1, K.icKoyu);   seg(atesX + x1, atesX + x2, K.icKoyu);
      seg(atesX - x1, atesX + x1, K.merkezKoyu);
    }
    this.cizAtes(g, atesX, atesY, t);
  },

  /* Ana koda kanca #4: varlıklar (sürü/köpek/kuşlar) çizildikten SONRA.
     Basılan karede bulundu: perde varlıklardan önce biniyordu ve çemberin
     çok dışındaki koyunlar bembeyaz kalıyordu — sözleşme "dışarısı yalnız
     duyulur" derken görüntü tam görünür diyordu, oyun yalan söylüyordu.
     Varlık payı dünyadan HAFİF (sabahın entityMul ayrımıyla aynı ilke):
     silüet okunmaya devam etsin, ama karanlıkta olduğu belli olsun. */
  cizGeceVarlik(g, atesX, atesY, t){
    if(!this.aktif) return;
    const K = this.GECE;
    const tit = [0, 1, 2, 1][((t >> 4) & 3)];
    const r3 = this.isikR() + tit;
    const W = 320, H = 180;
    for(let y = 0; y < H; y++){
      const dy = (y - atesY) * 1.6;
      const q = r3 * r3 - dy * dy;
      const x3 = q <= 0 ? 0 : Math.sqrt(q);
      const seg = (a, b) => {
        a = Math.max(0, Math.round(a)); b = Math.min(W, Math.round(b));
        if(b > a) px(g, a, y, b - a, 1, 'rgba(6,8,14,' + (K.disKoyu * 0.55).toFixed(3) + ')');
      };
      if(x3 <= 0){ seg(0, W); continue; }
      seg(0, atesX - x3); seg(atesX + x3, W);
    }
  },

  /* Ateşin kendisi: odun yığını + iki karelik alev + közler. */
  cizAtes(g, x, y, t){
    const f = (t >> 3) & 1;                        // 2 kare, 8 karede bir
    px(g, x - 4, y - 1, 8, 2, '#38282e');          // odunlar
    px(g, x - 3, y - 2, 3, 1, '#604342');
    px(g, x + 1, y - 2, 3, 1, '#604342');
    if(this.atesOdun > 0){
      px(g, x - 2, y - 5 + f, 4, 3, '#FC9838');    // alev gövdesi
      px(g, x - 1, y - 7 + f, 2, 3, '#F8D878');    // alev ucu (altın)
      px(g, x + (f ? 2 : -3), y - 8 - f, 1, 1, '#F8D878');  // kıvılcım
    } else {
      px(g, x - 1, y - 3, 2, 1, '#C05800');        // sönmüş köz
    }
  },

  /* Bağlam ipucu — nişangâhın DİBİNDE, basmadan ÖNCE.
     Raporun altın kuralı: "bağlamı basmadan önce göster" (ihlal eden tek
     oyun Overlord şikâyet almış). Yazı DEĞİL, küçük bir ikon: aynı
     Y_IKON ızgarası, 12x12'ye indirilmiş (çift piksel atlanarak). */
  cizBaglamIpucu(g, k, ax, ay){
    if(!this.aktif || !k) return;
    const ik = Y_IKON[k];
    if(!ik) return;
    const KAR = 'abcdefghijklmnopqrstuvwxyz0123456789';
    const x0 = Math.round(ax) + 10, y0 = Math.round(ay) - 8;
    px(g, x0 - 1, y0 - 1, 18, 18, 'rgba(6,8,14,0.55)');       // okunurluk zemini
    for(let y = 0; y < 48; y += 3){
      for(let x = 0; x < 48; x += 3){
        const ch = ik.r[y][x];
        if(ch === '.') continue;
        const c = ik.p[KAR.indexOf(ch)];
        if(c) px(g, x0 + (x / 3 | 0), y0 + (y / 3 | 0), 1, 1, c);
      }
    }
  },

  BIREY: Y_BIREY,

  /* --- TEHDİT ÇÖZÜM KÜMELERİ ve SLOT GÜVENLİĞİ -------------------------
     Tehdit davranış tasarımının (docs/tehdit-davranis.md) en sert açık
     maddesi: oyuncu bölüm 10'a "yanlış" üçlüyle girerse Karaayak
     çözümsüz kalabilir mi?

     ARİTMETİK BUNU KESİN SÖYLÜYOR. Dört komuttan üçü taşınıyor, yani
     her komut tam BİR kombinasyonda eksik — hiçbir komut her zaman elde
     değil. Bir tehdit yalnız TEK komutla çözülüyorsa, o komutun
     olmadığı üçlüyle giren oyuncu için çözümsüzdür.

     BAĞLAYICI KURAL: her tehdidin çözüm kümesi en az İKİ komut
     içermeli (ya da hiç komut gerektirmemeli — saf atış). Bu kural
     `tools/yayla.js`'te sınanıyor ve yeni tehdit eklendiğinde otomatik
     ateşleniyor.

     Neden kural, kapı değil: büyük gün konak işlerinden ÖNCE geliyor
     (SAHNE_SIRA.B), yani oyuncu o sabah takımını değiştiremiyor. Kapıyı
     açmak yerine tehdidi her takımla yaşanabilir kılmak, "bedava güç
     yok" ile de tutarlı: yanlış takım oyunu KAYBETTİRMEZ, PAHALILAŞTIRIR.

     Kümeler tasarım belgesinden alındı; belge değişirse burası da
     değişmeli (tek kaynak DEĞİL — bilinen ve kabul edilen bir kopya,
     çünkü belge metin, bu tablo çalıştırılabilir sözleşme). */
  COZUM: {
    vasak:    ['sus', 'dur'],              // SUS tasarlanmış cevap, DUR zayıf ama geçerli
    sirtlan:  ['dur', 'getir'],            // DUR çapa (ateş yanında), GETİR dağılanı toplar
    karaayak: ['savur', 'dur', 'getir'],   // SAVUR belirleyici, ötekiler pahalı ama yaşatır
    /* Ayı bölüm 5'ten 8'e taşındı (sahibi, 2026-08-19): 'ayı büyük bir
       tehdit, hak ettiği araçlarla karşılanmalı'. Bölüm 8'de SAVUR da
       elde, yani ADR-021'in üç çözümü ilk kez TAM geçerli. Bölüm 5'te
       ayı yalnız GÖRÜLÜYOR — mekaniksiz, dokunulmuyor. */
    ayi:      ['savur', 'dur', 'getir'],
    hirsiz:   [],                          // saf atış — komut gerektirmiyor
    firtina:  ['getir', 'dur', 'sus'],     // tüfek ölü, üç komut birden canlı
  },

  /* Bir çözüm kümesi her üçlüyle yaşanabilir mi? */
  cozumGuvenli(k){
    const c = this.COZUM[k];
    if(!c) return false;
    return c.length === 0 || c.length >= 2;
  },

  /* --- BİREY DAVRANIŞLARI (ADR-020) ------------------------------------
     Görsel işaret gerçek ışıkta zayıf kaldı — ÖLÇÜLDÜ (docs/koyun-sanat.md
     sonu): DAWNS tinti + varlık perdesi + sürünün 11-14px'e düşen adımı
     birleşince benek/karayüz gibi işaretler kayboluyor, yalnız bacak
     bandı yaşıyor.

     Davranış o boşluğu ışıktan bağımsız kapatıyor: karanlıkta da,
     kalabalıkta da okunur. Ve tasarımın kendi tarifi zaten buydu —
     "topal hep geride kalır, ana kuzusundan ayrılmaz".

     KURAL: davranış SESSİZ olacak. Hiçbiri yeni bir gösterge, sayı ya da
     metin getirmiyor; hepsi hayvanın nerede DURDUĞUNDAN okunuyor. */
  HUY: {
    topal:      { geride: 22 },   // sürünün ortalamasından bu kadar geride kalır
    kuzuluana:  { kuzuya: 14 },   // kuzudan bu mesafeden fazla ayrılmaz
    cingirakli: { onde: 18 },     // öncü: kolonun önünde durur
    koc:        { kenar: 20 },    // kenarda durur, sürünün dışını tutar
  },

  /* Her karede sürüye huy uygular. Konum İTİLİYOR, ışınlanmıyor —
     ani sıçrama bu oyunun diline aykırı ve ölçümü de bozar. */
  huyIsle(flock){
    if(!this.aktif || !flock || !flock.length) return;
    const canli = flock.filter(a => a.state !== 'gone');
    if(canli.length < 2) return;
    const cx = canli.reduce((t, a) => t + a.x, 0) / canli.length;
    /* Kuzu: kimliği 'kuzu' olan hayvan yoksa ana kendi başına. */
    const kuzu = canli.find(a => this.bireyler[a.id] === 'kuzu');

    for(const a of canli){
      /* Alarm/ürkme sırasında huy DEVRE DIŞI: o an hayvan tehdide tepki
         veriyor ve "hangisi tehlikede" sorusu huydan önce gelir —
         drawFlock'taki kimlik istisnasıyla aynı ilke. */
      if(a.state === 'alert' || a.startle > 0) continue;
      const k = this.bireyler[a.id];
      const h = this.HUY[k];
      if(!h) continue;
      let hedef = null;
      if(h.geride !== undefined)  hedef = cx - h.geride * (a.dir >= 0 ? 1 : -1);
      if(h.onde !== undefined)    hedef = cx + h.onde * (a.dir >= 0 ? 1 : -1);
      if(h.kenar !== undefined)   hedef = a.x < cx ? cx - h.kenar : cx + h.kenar;
      if(h.kuzuya !== undefined && kuzu){
        const d = a.x - kuzu.x;
        if(Math.abs(d) > h.kuzuya) hedef = kuzu.x + Math.sign(d) * h.kuzuya;
      }
      if(hedef === null) continue;
      const fark = hedef - a.x;
      if(Math.abs(fark) > 1) a.x += Math.sign(fark) * 0.18;   // yavaş, sessiz
    }
  },

  /* Sürüdeki hangi hayvan hangi birey? Kimlikler kayda yazılır (kalıcı —
     ADR-008: kayıp kalıcı, o hâlde kimlik de kalıcı olmalı, yoksa
     "Topal'ı kaybettim" cümlesi kurulamaz). */
  bireyler: {},          // { hayvanId: bireyAnahtari }

  bireyDagit(flock){
    if(!this.aktif || !flock) return;
    /* KUZU DAHİL — ilk yazımda dışlanmıştı ve test yakaladı: kuzu yoksa
       "kuzulu ana kuzusundan ayrılmaz" huyu tanımsız kalıyor, yani bir
       kimlik ötekine BAĞIMLI. Kuzu en sona konuyor ki küçük sürüde önce
       yetişkinler dağılsın.
       DİKKAT — ölçülmedi: gerçek oyunda kuzu doğuyor (lambCount) ve
       burada kimlik STATİK dağıtılıyor. Doğum/kayıpla kimliklerin nasıl
       güncelleneceği açık bir soru. */
    const yetiskin = Object.keys(Y_BIREY).filter(k => k !== 'kuzu');
    const anahtarlar = yetiskin.concat(['kuzu']);
    this.bireyler = {};
    flock.forEach((a, i) => {
      if(i < anahtarlar.length) this.bireyler[a.id] = anahtarlar[i];
    });
  },

  bireyAdi(id){
    const k = this.bireyler[id];
    if(!k || !Y_BIREY[k]) return null;
    return Y_BIREY[k];
  },

  /* Bir hayvanı BİREY olarak bas. Dönüş false ise çağıran taban
     sprite'ı çizer — yani kimliği olmayan hayvan eskisi gibi görünür. */
  cizBirey(g, id, x, y, dir){
    const b = this.bireyAdi(id);
    if(!b) return false;
    const yon = dir < 0 ? -1 : 1;
    for(let ry = 0; ry < b.h; ry++){
      for(let rx = 0; rx < b.w; rx++){
        const ch = b.rows[ry][rx];
        if(ch === '.') continue;
        const c = b.pal[ch];
        if(!c) continue;
        const px0 = yon > 0 ? (x + rx - (b.w >> 1)) : (x - rx + (b.w >> 1));
        px(g, px0, y + ry - b.h, 1, 1, c);
      }
    }
    return true;
  },

  TEHDIT: { vasak: Y_VASAK, sirtlan: Y_SIRTLAN, karaayak: Y_KARAAYAK, ayi: Y_AYI },

  /* Tehdit sprite'ını dünyaya bas. KURT'un veri şeklinde olduğu için
     ana kodun `drawKurt`u da basabilir; bu sarmalayıcı yalnız yön ve
     ölçek için var (drawKurt'a bağlanmadan da çalışsın diye — ART
     bloğunun izolasyon kuralı). */
  /* Herhangi bir {w,h,pal,kare} sprite'ını çizer — üretilen sanat
     (tehditsanat.js) da bu biçimde geldiği için ikinci bir çizici
     yazılmadı. `poz` verilmezse 'dur'. */
  cizSprite(g, t, x, y, dir, poz){
    if(!t) return false;
    const kare = t.kare[poz || 'dur'] || t.kare[Object.keys(t.kare)[0]];
    if(!kare) return false;
    const yon = dir < 0 ? -1 : 1;
    for(let ry = 0; ry < t.h; ry++){
      const row = kare[ry];
      if(!row) continue;
      for(let rx = 0; rx < t.w; rx++){
        const ch = row[rx];
        if(ch === '.' || ch === undefined) continue;
        const c = t.pal[ch];
        if(!c) continue;
        const px0 = yon > 0 ? (x + rx - (t.w >> 1)) : (x - rx + (t.w >> 1));
        px(g, px0, y + ry - t.h, 1, 1, c);
      }
    }
    return true;
  },

  cizTehdit(g, k, x, y, dir){
    const t = this.TEHDIT[k];
    if(!t) return false;
    const kare = t.kare.dur;
    const yon = dir < 0 ? -1 : 1;
    for(let ry = 0; ry < t.h; ry++){
      const row = kare[ry];
      for(let rx = 0; rx < t.w; rx++){
        const ch = row[rx];
        if(ch === '.') continue;
        const c = t.pal[ch];
        if(!c) continue;
        const px0 = yon > 0 ? (x + rx - (t.w >> 1)) : (x - rx + (t.w >> 1));
        px(g, px0, y + ry - t.h, 1, 1, c);
      }
    }
    return true;
  },

  /* Bir komut ikonunu düğmenin kanvasına çizer. 24x24 grid, kanvas da
     24x24 — büyütmeyi CSS yapıyor (image-rendering:pixelated, 48px).
     Testte (sahte DOM) kanvasın getContext'i yok; çağıran taraf onu
     kontrol ediyor, burada varsayılıyor. */
  cizIkon(cv, k){
    const ik = Y_IKON[k];
    if(!ik) return false;
    const g = cv.getContext('2d');
    g.clearRect(0, 0, 48, 48);
    const KAR = 'abcdefghijklmnopqrstuvwxyz0123456789';
    ik.r.forEach((row, y) => { for(let x = 0; x < 48; x++){
      const ch = row[x];
      if(ch === '.') continue;
      const c = ik.p[KAR.indexOf(ch)];
      if(c){ g.fillStyle = c; g.fillRect(x, y, 1, 1); }
    }});
    return true;
  },

  get Alet(){ return (typeof Alet !== 'undefined') ? Alet : null; },
  get Iz(){ return (typeof Iz !== 'undefined') ? Iz : null; },
  IKON: Y_IKON,
  KOMUT: Y_KOMUT,
  SLOT: Y_SLOT,
};

/* harness.js'e açılan TEK sembol (ADR-018). */
const Yayla = Yayla_;
/* ==YAYLA-END== */
