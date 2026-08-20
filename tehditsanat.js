/* ==TEHDITSANAT-START==
   ÜRETİLEN SANAT — PixelLab ile üretilip oyunun paletine çevrilmiş
   kareler. ELLE YAZILMADI, ELLE DE DÜZENLENMEZ: kaynak art/gen/
   altındaki PNG'ler, üretici `node tools/tehditsanat.js --dosya`.
   Bir kare değişecekse PNG değişir ve dosya yeniden üretilir —
   yoksa iki kaynak doğar (bu depoda üç kez bedeli ödendi).

   Biçim yayla.js'teki Y_AYI/Y_VASAK ile AYNI: { w, h, pal, kare }.
   GÖZ elle konuldu (üretim doğru yere koymuyor, ölçüldü).
   ------------------------------------------------------------- */
'use strict';

const Y_AYI_SAHA = {
  w: 37, h: 36,
  pal: { a:'#2e2028', b:'#1c1620', c:'#89615a', d:'#101018', e:'#483436', f:'#604342', g:'#e8b830' },
  kare: { saha: [
    '.............bb..bbbd.bb.............',
    '.............bdbeaaaebdbb............',
    '.............bdafadaeebdb............',
    '.............daabfafaaad.............',
    '.............baaaaffaaaa.............',
    '.............aaaabdbaaaa.............',
    '.............agaadddbaga.............',
    '.............baaadabaaab.............',
    '....d........daaaafebaad........d....',
    '..adbb.......bbaaeeebabb........adad.',
    '.bbaaab.....babbbbbbbbbaa......beabbd',
    'bdbbaaaabbbaaaabbbbbbbaaaab.baaaebadb',
    'bdbaeaaaaaaaaaaaabbaaaaaaaaaaaaaafbdb',
    '....dbaaaaaaaaaaaeeeaaaaaaaaaaaabd...',
    '.....bbaaaaabbaefcccceaabaaaaaab.....',
    '......bbbbbbbbaccccccceaabbbbbb......',
    '.......dbbbbbaecccccccfaabbbbd.......',
    '............bafccccccccaab...........',
    '............bafccccccccaab...........',
    '...........dbafccccccccaab...........',
    '...........dbaccccccccceaa...........',
    '...........dbaccccccccceaa...........',
    '...........baaccccccccceaa...........',
    '...........baafcccccccceaab..........',
    '..........dbaaecccccccfaaab..........',
    '..........bbaaafcccccceaaaa..........',
    '..........baaaaaeffffaaaaaad.........',
    '..........baaaabaaaaabaaaaad.........',
    '..........baaaabbbbbbbaaaaad.........',
    '..........baaaabbbbbbbaaaaad.........',
    '..........dbaabbbbbbbbbaaab..........',
    '..........dbbbbbd...dbbbbbd..........',
    '...........bbbbb.....dbbbb...........',
    '...........bbbbd.....dbbbbb..........',
    '..........aaeabd......baaebe.........',
    '.........ddaabd........babbb.........',
  ] },
};

const Y_VASAK_PUSU = {
  w: 23, h: 16,
  pal: { a:'#89615a', b:'#c99474', c:'#604342', d:'#101018', e:'#2e2028', f:'#ddab91', g:'#e8b830' },
  kare: { pusu: [
    '.......................',
    '....................dd.',
    '....................cd.',
    '......aaaaaa......ccbc.',
    '.....abbbbbbaaaaaaaaba.',
    '....abbbbbbbbbbbbbaabaa',
    '....abbabbbbbbbbbacabaa',
    '...caababbbbbabbbbcgaaa',
    '...eabbbffbbbbbaafa....',
    '...ebaaaaaaabbaaaa.....',
    '..aaaa.eca..abbacc.....',
    '..aba..ccc...aabcaa....',
    'ddcba...cc...aba.aa....',
    'ddeba...cccc.aaa.aba...',
    '...aaa...ccc.aba..cba..',
    '..............aac.eac..',
  ] },
};

const Y_HIRSIZ = {
  w: 25, h: 24,
  pal: { a:'#2e2028', b:'#101018', c:'#ddab91', d:'#604342', e:'#483436', f:'#89615a' },
  kare: { kacar: [
    '..................bab....',
    '.........addddde..baaab..',
    '........dcfdddeebbaaaaaa.',
    '.......dccfeddccebaaaaaab',
    '....addccccfdfcfcebaaabab',
    '...dccccccccccdcfdaaaaeb.',
    '...dccccccccccebaabaadfa.',
    '..acccccccccfdaeeababee..',
    '..efccccccffdaaeeebbbaae.',
    '..affffffffdebbaaabbbfda.',
    '...dfffffddfaabbeebbafea.',
    '..aaffdddddaaabbaeaaea...',
    '..eedeaabbbaababbaeea....',
    '.aefeaabaaabaaaabaab.....',
    'aeafa.baaaaaaaabab.......',
    'ba.d..baaaaaabaaaa.......',
    '..edb..baaabbbbaaaa......',
    '..ba...bbbbbb.bbaaa......',
    '...b..bbbbbbb.abbab......',
    '.....bbabbb....bbab......',
    '....babbb......bab.......',
    '....bbbb.......bab.......',
    '.....bbbb.....baaaaab....',
    '......bbbb....bbbbaab....',
  ] },
};

const Y_CIKIN = {
  w: 13, h: 28,
  pal: { a:'#ddab91', b:'#89615a', c:'#483436', d:'#101018', e:'#604342', f:'#2e2028' },
  kare: { dur: [
    '......cf.....',
    '.....dbc.....',
    '.....dbc.....',
    '.....dbd.....',
    '.....dbd.....',
    '.....dbd.....',
    '.....dbd.....',
    '.....fbf.....',
    '....eebee....',
    '....cbbae....',
    '....cbbbc....',
    '....fcccf....',
    '....cbaac....',
    '...daaaabd...',
    '...caaaabc...',
    '...eaaaabe...',
    '..caaaaaabf..',
    '..eaaaaaabe..',
    '.caaaaaaabbc.',
    'daaaaaaaaabbd',
    'caaaaaaaaaabc',
    'caaaaaaaaaabc',
    'cbaaaaaaaaabc',
    'cbaaaaaaaabbc',
    'cbbbaaaaaabbc',
    'debbbaaabbbed',
    '.febbbbbbbef.',
    '..ffcccccff..',
  ] },
};

const A_MAKAS = {
  w: 21, h: 14,
  pal: { a:'#101018', b:'#2e2028', c:'#483436', d:'#604342', e:'#89615a', f:'#ddab91' },
  kare: { dur: [
    '....aa..........a....',
    '....bd.........cda...',
    '.....cca......bdb....',
    '.....aeba...abfca....',
    '......ceebcccfdb.....',
    '.......bbccbdba......',
    '......cbbbbabcda.....',
    '...aacdcbbccbbdeaaa..',
    '..cdcebaa.aa.abceccc.',
    '.cbafb..........deaca',
    'adadb...........accac',
    'abacb...........acbab',
    'acbbba..........bcacb',
    '.abdba..........bacb.',
  ] },
};

const A_BALTA = {
  w: 12, h: 14,
  pal: { a:'#2e2028', b:'#483436', c:'#89615a', d:'#604342', e:'#101018', f:'#ddab91' },
  kare: { dur: [
    '.......a....',
    '.....baba...',
    '....afcdaa..',
    '....accbdcdb',
    '....ebbadccb',
    '....bbbebfca',
    '...edde.aca.',
    '...bca..aa..',
    '..acde......',
    '..bdb.......',
    '.acbe.......',
    '.bda........',
    'edde........',
    '.aa.........',
  ] },
};

const A_TAKIM = {
  w: 15, h: 14,
  pal: { a:'#2e2028', b:'#483436', c:'#604342', d:'#101018', e:'#ddab91' },
  kare: { dur: [
    '...........ba..',
    '..........bbccb',
    '..........cccba',
    '..........aabaa',
    '..........abaaa',
    '..........caaaa',
    '.........cadad.',
    '.bc.....ca.....',
    '.bcd...cb......',
    'ccbc..cb.......',
    'beecdaa........',
    'dbbdd..........',
    'aaaad..........',
    'abbb...........',
  ] },
};

const TehditSanat = { Y_AYI_SAHA, Y_VASAK_PUSU, Y_HIRSIZ, Y_CIKIN, A_MAKAS, A_BALTA, A_TAKIM };
if (typeof module !== 'undefined' && module.exports) module.exports = TehditSanat;
/* ==TEHDITSANAT-END== */
