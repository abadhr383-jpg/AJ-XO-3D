# AJ XO 3D

لعبة XO ثلاثية الأبعاد بـ HTML5 + CSS3 + JavaScript فقط، بدون أي محرك أو مكتبة خارجية.

## التشغيل
افتح `index.html` مباشرة في المتصفح، أو شغّل `npx serve .`

## الملفات
- `index.html` — الهيكل والشاشات
- `style.css` — التصميم والـ CSS 3D والحركات
- `script.js` — المنطق (Minimax) والصوت والإحصائيات واللغات
- `assets/` — الأيقونة وملف manifest (الأصوات تُولَّد برمجياً عبر WebAudio)
- `test/logic.test.js` — اختبار منطق اللعبة: `npm test`

## التحويل إلى APK (Capacitor)
```
npm install
npm run build:web
npx cap add android
npm run cap:sync
npm run cap:open     # يفتح Android Studio ثم Build > Build APK
```
لتوليد أيقونات التطبيق: ضع `icon.png` (1024×1024) في `resources/` ثم `npx @capacitor/assets generate --android`.
