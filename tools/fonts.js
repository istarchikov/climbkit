/* Скачивает шрифты Google Fonts в www/fonts и собирает локальный fonts.css,
   чтобы приложение работало без интернета (сценарий: горы, нет связи). */
const fs=require('fs'), path=require('path');
const OUT=path.join(__dirname,'..','www','fonts');
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36';
const CSS='https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap';
const KEEP=['latin','latin-ext','cyrillic','cyrillic-ext']; // ru + en
const slug=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');

(async()=>{
  fs.mkdirSync(OUT,{recursive:true});
  const css=await (await fetch(CSS,{headers:{'User-Agent':UA}})).text();
  // блоки @font-face, каждому предшествует комментарий /* subset */
  const blocks=css.split('@font-face').slice(1);
  let subset=null, out=[], n=0;
  // восстановим соответствие subset по комментарию перед блоком
  const re=/\/\*\s*([a-z-]+)\s*\*\/\s*@font-face\s*{([^}]*)}/g; let m;
  while((m=re.exec(css))){
    subset=m[1]; const body=m[2];
    if(KEEP.indexOf(subset)<0) continue;
    const fam=(body.match(/font-family:\s*'([^']+)'/)||[])[1];
    const wght=(body.match(/font-weight:\s*(\d+)/)||[])[1];
    const url=(body.match(/url\((https:[^)]+\.woff2)\)/)||[])[1];
    if(!fam||!wght||!url) continue;
    const file=slug(fam)+'-'+wght+'-'+subset+'.woff2';
    const buf=Buffer.from(await (await fetch(url,{headers:{'User-Agent':UA}})).arrayBuffer());
    fs.writeFileSync(path.join(OUT,file),buf); n++;
    const uni=(body.match(/unicode-range:\s*([^;]+);/)||[])[1]||'';
    out.push(`@font-face{font-family:'${fam}';font-style:normal;font-weight:${wght};font-display:swap;`+
      `src:url(${file}) format('woff2');`+(uni?`unicode-range:${uni.trim()};`:'')+`}`);
  }
  fs.writeFileSync(path.join(OUT,'fonts.css'),out.join('\n')+'\n');
  console.log('шрифтов скачано:',n,'файлов; fonts.css собран');
})().catch(e=>{ console.error(e); process.exit(1); });
