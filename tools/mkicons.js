/* Иконка приложения — баул с горным хребтом, для светлой и тёмной темы.
   Запускать после `npx cap add android` (каталог android/ не в гите).
   Генерирует всё в android/app/src/main/res:
   - легаси-PNG (API < 26): графитовый тайл + кремовые линии;
   - адаптивную иконку (API 26+): фон и цвет линий тема-зависимые
     (values / values-night), плюс монохромный слой для тематических иконок 13+. */
const sharp=require('sharp'), fs=require('fs'), path=require('path');
const RES=path.join(__dirname,'..','android','app','src','main','res');
const w=(rel,body)=>{ const p=path.join(RES,rel); fs.mkdirSync(path.dirname(p),{recursive:true}); fs.writeFileSync(p,body); };

const PATHS=[
  'M15 23h34c1.6 0 2.8 1.4 2.6 3l-2.7 24c-.3 2-2.2 3.6-4.4 3.6H19.5c-2.2 0-4.1-1.5-4.4-3.6L12.4 26c-.2-1.6 1-3 2.6-3Z',
  'M23.6 23v-3.6a4.9 4.9 0 0 1 9.8 0V23',
  'M19.5 43l6.8-10 5 6.8 4.5-5.9L45 43',
  'M11 28h42'];
const baulSvg=c=>`<g fill="none" stroke="${c}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">`+
  PATHS.map(d=>`<path d="${d}"/>`).join('')+`</g>`;
const square=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#131715"/>${baulSvg('#FBFCFA')}</svg>`;
const round=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="32" fill="#131715"/>${baulSvg('#FBFCFA')}</svg>`;
const D={mdpi:48,hdpi:72,xhdpi:96,xxhdpi:144,xxxhdpi:192};

// векторный баул для адаптивной иконки (108dp, вписан в безопасную зону)
const vector=color=>`<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp" android:height="108dp" android:viewportWidth="108" android:viewportHeight="108">
    <group android:translateX="17.2" android:translateY="13.75" android:scaleX="1.15" android:scaleY="1.15">
`+PATHS.map(d=>`        <path android:pathData="${d}" android:strokeColor="${color}" android:strokeWidth="3.2" android:strokeLineCap="round" android:strokeLineJoin="round" android:fillColor="#00000000"/>`).join('\n')+`
    </group>
</vector>
`;
const adaptive=`<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@drawable/ic_baul_fg"/>
    <monochrome android:drawable="@drawable/ic_baul_mono"/>
</adaptive-icon>
`;

(async()=>{
  // легаси-PNG
  for(const[d,sz] of Object.entries(D)){
    await sharp(Buffer.from(square),{density:512}).resize(sz,sz).png().toFile(path.join(RES,'mipmap-'+d,'ic_launcher.png'));
    await sharp(Buffer.from(round),{density:512}).resize(sz,sz).png().toFile(path.join(RES,'mipmap-'+d,'ic_launcher_round.png'));
    const fg=path.join(RES,'mipmap-'+d,'ic_launcher_foreground.png'); if(fs.existsSync(fg)) fs.unlinkSync(fg); // дефолт Capacitor
  }
  await sharp(Buffer.from(square),{density:1024}).resize(512,512).png().toFile(path.join(RES,'..','ic_launcher-playstore.png'));
  // адаптивная иконка
  w('drawable/ic_baul_fg.xml',vector('@color/ic_baul_ink'));
  w('drawable/ic_baul_mono.xml',vector('#FFFFFFFF'));
  w('mipmap-anydpi-v26/ic_launcher.xml',adaptive);
  w('mipmap-anydpi-v26/ic_launcher_round.xml',adaptive);
  w('values/ic_launcher_background.xml','<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">#FBFCFA</color>\n    <color name="ic_baul_ink">#131715</color>\n</resources>\n');
  w('values-night/ic_launcher_background.xml','<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">#131715</color>\n    <color name="ic_baul_ink">#FBFCFA</color>\n</resources>\n');
  console.log('иконка (светлая/тёмная) сгенерирована');
})().catch(e=>{ console.error(e); process.exit(1); });
