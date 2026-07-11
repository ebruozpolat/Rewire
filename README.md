# rewire

**Zihnindeki hikâyeyi yeniden yaz. Her gün tekrar et. Yeni yol, eskisini geride bıraksın.**

---

## Nedir?

Rewire, nöroplastisite ilkelerine dayanan günlük bir zihin pratiği uygulamasıdır. Beyin, tekrar ettiğin hikâyeleri saklar — Rewire, bu döngüyü senin lehine çevirir: eski hikâyeyi yazarsın, yenisini kurarsın ve her gün bilinçli tekrarla yeni sinir yolunu güçlendirirsin.

Geçmiş koşullar geçerli değil; geçerli olan tek şey bugün hangi yolu ateşlediğin.

---

## Canlı

https://rewire-daily-practice.netlify.app/

Netlify production. Yerelde `npx netlify deploy --prod` ile yeniden yayınlanır; GitHub `main` ile de bağlanabilir.

### Telefona yükle (PWA)

- **Android (Chrome):** siteyi aç → banner’daki *Yükle*, veya ⋮ → *Ana ekrana ekle*.
- **iPhone (Safari):** Paylaş → *Ana Ekrana Ekle*.

Yüklendikten sonra tam ekran açılır, çevrimdışı çalışır; bahçen cihazında kalır.

## Çalıştırma

Bağımlılık yok, derleme yok. `index.html` dosyasını tarayıcıda aç — hepsi bu.

> Service worker ve yükleme istemi için **HTTPS** gerekir (yerel `localhost` da çalışır). Netlify bunu otomatik sağlar.

```bash
# İstersen küçük bir yerel sunucuyla:
python3 -m http.server 8000
# → http://localhost:8000
```

Verilerin tarayıcının `localStorage`'ında saklanır; oturumlar arasında kalıcıdır.

---

## Nasıl çalışır?

### 1. Eski hikâyeyi yaz
Zihninde tekrar eden cümleyi olduğu gibi kâğıda dök.
> *"Başladığım hiçbir şeyi bitiremiyorum."*

### 2. Yeni hikâyeyi kur
Şimdiki zamanda, inandırıcı ve sana ait bir cümleyle yeniden yaz.
> *"Ben önemli olanı bitiren biriyim — her gün küçük bir adım."*

### 3. Dik (Plant it)
Yeni hikâye, zihin bahçende bir filiz olarak yerini alır. Eski hikâye silinmez — üstü çizili kalır. Beyin de böyle çalışır: eski yollar yok olmaz, sadece yarışı kaybeder.

### 4. Her gün tekrarla (Repeat today)
Günde bir kez, bilinçli olarak yeni hikâyeni ateşle. Aralıklı tekrar, yoğun tekrardan daha güçlü iz bırakır — bu yüzden günde tek tekrar hakkın var.

---

## Zihin bahçesi

| Öğe | Anlamı |
|---|---|
| 🌱 Sap | Diktiğin her yeni hikâye |
| ✨ Altın çiçek | Tekrar sayısı arttıkça büyür |
| 〰 Sinaps kavisleri | Hikâyeler güçlendikçe kalınlaşan bağlantılar |
| 🔥 Seri (streak) | Kesintisiz pratik günlerin |

Bahçen kalıcıdır: hikâyelerin, tekrarların ve serin oturumlar arasında saklanır. Bu hafta ektiğin, gelecek ay hâlâ orada.

---

## Neden işe yarıyor? (Bilimsel temel)

- **Hebb kuralı:** Birlikte ateşlenen nöronlar birlikte bağlanır. Her tekrar aynı sinaptik yolu güçlendirir.
- **Miyelinasyon:** Sık kullanılan yollar yalıtılır; yeni hikâye, eskisinden daha hızlı ateşlenmeye başlar.
- **Aralıklı tekrar:** Günde bir dürüst tekrar, bir saatte on tekrardan daha kalıcı iz bırakır.
- **Yazmanın gücü:** Yazmak, yalnızca düşünmekten daha fazla devreyi çalıştırır — motor, görsel ve dil ağları yeni hikâyeyi birlikte kodlar.
- **Dikkatle yönlendirilen nöroplastisite:** Neyi prova edersen onu pekiştirirsin.

> **Dürüst not:** Hiçbir uygulama yeni hücre üretmez. Ama uygulamanın yapılandırdığı günlük tekrar, sinaptik güçlenmeyi ve miyelinasyonu gerçekten tetikler. Kozmik güçler opsiyonel; tekrar değil. 🌱

---

## Özellikler

- ✍️ Eski hikâye → yeni hikâye yeniden yazım akışı
- 🌌 Tekrarla büyüyen görsel zihin bahçesi (gece bahçesi estetiği)
- 🔁 Günde bir kez "Repeat today" ile bilinçli ateşleme
- 🔥 Gün serisi takibi
- 🧠 Her açılışta dönen "neden işe yarıyor" bilim notları
- 💾 Oturumlar arası kalıcı kayıt
- 📱 Ana ekrana yükle (PWA) — çevrimdışı app shell
- ✕ Artık taşımak istemediğin hikâyeyi serbest bırakma

---

## Renk paleti

| Renk | Kod | Rol |
|---|---|---|
| Mürekkep moru | `#0D0A1C` | Gece zemini |
| Şampanya altını | `#D9BA79` | Ateşlenen sinaps, vurgu |
| Adaçayı yeşili | `#9CC79B` | Büyüme, saplar |
| Lavanta grisi | `#8F86AE` | İkincil metin |

Tipografi: **Fraunces** (serif, hikâyeler için) + **Karla** (arayüz).

---

*rewire — geçmiş koşullar geçerli değil.*
