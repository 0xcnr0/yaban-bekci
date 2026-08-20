/* ==BOOT-START== ===========================================================
   OYUNUN TEK GİRİŞ NOKTASI.

   NİYE AYRI BİR DOSYA — bu bir düzen tercihi değil, ödenmiş bir hatanın
   onarımı:

   Yolculuk kaydını geri yükleyen çağrı, index.html'in gömülü <script>
   bloğunun sonunda duruyordu. Tarayıcı o bloğu harici `<script src>`
   dosyalarından ÖNCE çalıştırır; yani çağrı koştuğunda `Yayla` henüz hiç
   tanımlı değildi ve ReferenceError atıyordu. Çağrı bir try/catch içinde
   olduğu için hata yutuluyordu ve ekranda hiçbir iz kalmıyordu.

   Sonucu şuydu: **oyuncu uygulamayı her kapattığında yolculuğunu
   kaybediyordu.** Kodun üstündeki yorum tam olarak bu tehlikeyi
   uyarıyordu; kod yazılmıştı ama koşamayacağı yere konmuştu. Yorumun
   doğru olması kodun doğru yerde olduğunu göstermiyor.

   NİYE İKİNCİ BİR INLINE <script> DEĞİL. O da işe yarardı, ama
   `tools/harness.js` oyunu tarayıcısız koştururken yalnız İLK inline
   bloğu okuyor; ikinci bir inline blok ölçüm ortamında hiç koşmazdı ve
   testler tarayıcıdan sapardı — bu deponun daha önce yaşadığı bir hata
   sınıfı. Harici dosya ikisinde de aynı sırayla koşuyor.

   Bu dosya index.html'de EN SON yüklenen betiktir ve öyle kalmalıdır.
   ======================================================================== */
yolculugaAc();
/* ==BOOT-END== =========================================================== */
