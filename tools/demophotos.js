/* Генерирует два демо-«снимка» (плейсхолдеры с глифом снаряжения) и
   вшивает их data:-URL прямо в www/app.js (переменные DEMO_SIROCCO / DEMO_REVERSO).
   Идемпотентно: заменяет уже вшитые значения. Только для веб-прототипа. */
const sharp=require('sharp'), fs=require('fs'), path=require('path');
const APP=path.join(__dirname,'..','www','app.js');

const HELMET='<path d="M2.9 15.9c0-5.9 4-9.7 9.1-9.7 5 0 8.6 3.4 8.6 8 0 .7-.1 1.3-.3 1.9"/><path d="M2.9 15.9h17.4"/><path d="M9.5 16.1l-.7 2.6c-.2.6.2 1.2.8 1.3l1.6.4"/><path d="M15.7 16.1l.9 2.6"/><path d="M11.2 20.4h2.8"/><path d="M7.3 12.1h2.8M11.4 10.9h3.4M11.4 13.4h3.4"/>';
const BELAY='<path d="M6.5 5.4h11c.9 0 1.6.8 1.4 1.7l-1.6 9.1c-.2 1-1 1.7-2 1.7H8.7c-1 0-1.8-.7-2-1.7L5.1 7.1c-.2-.9.5-1.7 1.4-1.7Z"/><path d="M9.5 9.2v5.2M14.5 9.2v5.2"/>';

function card(bg1,bg2,ink,glyph,name){
  return `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="900" viewBox="0 0 720 900">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0.4" y2="1">
    <stop offset="0" stop-color="${bg1}"/><stop offset="1" stop-color="${bg2}"/></linearGradient></defs>
  <rect width="720" height="900" fill="url(#g)"/>
  <g transform="translate(180,175) scale(15)" fill="none" stroke="${ink}" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" opacity="0.92">${glyph}</g>
  <text x="360" y="705" font-family="Arial, sans-serif" font-size="48" font-weight="700" fill="${ink}" text-anchor="middle">${name}</text>
  <text x="360" y="752" font-family="Arial, sans-serif" font-size="25" fill="${ink}" opacity="0.55" text-anchor="middle">demo · ClimbKit</text>
</svg>`;
}
async function url(svg){
  const b=await sharp(Buffer.from(svg)).resize(480,600).jpeg({quality:58}).toBuffer();
  return 'data:image/jpeg;base64,'+b.toString('base64');
}
(async()=>{
  const sir=await url(card('#F5EBD8','#D9C79B','#7A5610',HELMET,'Petzl Sirocco'));
  const rev=await url(card('#E8ECEE','#B4C0C7','#33414B',BELAY,'Petzl Reverso'));
  let app=fs.readFileSync(APP,'utf8');
  app=app.replace(/var DEMO_SIROCCO="[^"]*";/, 'var DEMO_SIROCCO="'+sir+'";');
  app=app.replace(/var DEMO_REVERSO="[^"]*";/, 'var DEMO_REVERSO="'+rev+'";');
  fs.writeFileSync(APP,app);
  console.log('демо-фото вшиты: Sirocco '+(sir.length/1024|0)+'КБ, Reverso '+(rev.length/1024|0)+'КБ');
})().catch(e=>{ console.error(e); process.exit(1); });
