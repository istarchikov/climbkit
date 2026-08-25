/* ---------- справочники ---------- */
const TYPES={
rope:{ic:'i-rope',c:'rope',g:'soft',ru:'Верёвка',en:'Rope'},
cord:{ic:'i-cord',c:'rope',g:'soft',ru:'Репшнур',en:'Cord'},
sling:{ic:'i-sling',c:'petrol',g:'soft',ru:'Петля',en:'Sling'},
draw:{ic:'i-draw',c:'petrol',g:'soft',ru:'Оттяжки',en:'Quickdraws'},
harness:{ic:'i-harness',c:'petrol',g:'soft',ru:'Обвязка',en:'Harness'},
daisy:{ic:'i-daisy',c:'petrol',g:'soft',ru:'Самостраховка',en:'Daisy chain'},
biner:{ic:'i-biner',c:'slate',g:'hard',ru:'Карабины',en:'Carabiners'},
cam:{ic:'i-cam',c:'slate',g:'hard',ru:'Френды',en:'Cams'},
nut:{ic:'i-nut',c:'slate',g:'hard',ru:'Закладки',en:'Nuts'},
piton:{ic:'i-piton',c:'slate',g:'hard',ru:'Крючья',en:'Pitons'},
belay:{ic:'i-belay',c:'slate',g:'hard',ru:'Спусковое',en:'Belay device'},
eight:{ic:'i-eight',c:'slate',g:'hard',ru:'Восьмёрка',en:'Figure eight'},
grigri:{ic:'i-grigri',c:'slate',g:'hard',ru:'Автоблок',en:'Assisted belay'},
ascender:{ic:'i-ascender',c:'slate',g:'hard',ru:'Жумар',en:'Ascender'},
pulley:{ic:'i-pulley',c:'slate',g:'hard',ru:'Ролик',en:'Pulley'},
screw:{ic:'i-screw',c:'ice',g:'hard',ru:'Ледобур',en:'Ice screw'},
crampons:{ic:'i-crampons',c:'ice',g:'hard',ru:'Кошки',en:'Crampons'},
axe:{ic:'i-axe',c:'ice',g:'hard',ru:'Ледоруб',en:'Ice axe'},
tool:{ic:'i-tool',c:'ice',g:'hard',ru:'Ледовый инструмент',en:'Ice tool'},
helmet:{ic:'i-helmet',c:'ochre',g:'protect',ru:'Каска',en:'Helmet'},
glasses:{ic:'i-glasses',c:'ochre',g:'protect',ru:'Очки',en:'Glasses'},
gloves:{ic:'i-gloves',c:'ochre',g:'protect',ru:'Перчатки',en:'Gloves'},
shoe:{ic:'i-shoe',c:'ochre',g:'misc',ru:'Скальники',en:'Climbing shoes'},
boot:{ic:'i-boot',c:'ochre',g:'misc',ru:'Ботинки',en:'Boots'},
poles:{ic:'i-poles',c:'ice',g:'misc',ru:'Палки',en:'Poles'},
shovel:{ic:'i-shovel',c:'ice',g:'misc',ru:'Лопата',en:'Shovel'},
probe:{ic:'i-probe',c:'ice',g:'misc',ru:'Зонд',en:'Probe'},
beacon:{ic:'i-beacon',c:'clay',g:'misc',ru:'Бипер',en:'Beacon'},
pack:{ic:'i-pack',c:'petrol',g:'misc',ru:'Рюкзак',en:'Backpack'},
haulbag:{ic:'i-haulbag',c:'petrol',g:'misc',ru:'Баул',en:'Haul bag'},
chalk:{ic:'i-chalk',c:'petrol',g:'misc',ru:'Магнезница',en:'Chalk bag'},
lamp:{ic:'i-lamp',c:'ochre',g:'misc',ru:'Налобник',en:'Headlamp'},
sleep:{ic:'i-sleep',c:'petrol',g:'misc',ru:'Спальник',en:'Sleeping bag'},
tent:{ic:'i-tent',c:'petrol',g:'misc',ru:'Палатка',en:'Tent'},
stove:{ic:'i-stove',c:'ochre',g:'misc',ru:'Горелка',en:'Stove'},
firstaid:{ic:'i-firstaid',c:'clay',g:'misc',ru:'Аптечка',en:'First aid'},
flask:{ic:'i-flask',c:'petrol',g:'misc',ru:'Термос',en:'Flask'},
other:{ic:'i-other',c:'slate',g:'misc',ru:'Разное',en:'Other'}};
const LIFE_G={soft:[10,5],protect:[10,5],hard:null,misc:null};
const LIFE_T={glasses:null,gloves:null};
const GKEY={soft:'gSoft',hard:'gHard',protect:'gProtect',misc:'gMisc'};
const SKEY={ok:'stOk',alert:'stAlert',warn:'stWarn',retired:'stRetired'};
const KEY='climbkit-v4';

/* ---------- Capacitor: нативные плагины или веб-фоллбэки ----------
   В браузере (живой прототип) window.Capacitor нет — работают старые пути:
   localStorage для D и base64-dataURL для фото. На устройстве включаются
   Preferences (без лимита 5 МБ), Filesystem (фото файлами) и LocalNotifications. */
const CAP=window.Capacitor||null;
const NATIVE=!!(CAP&&CAP.isNativePlatform&&CAP.isNativePlatform());
const PL=(CAP&&CAP.Plugins)||{};
const FS=PL.Filesystem, Prefs=PL.Preferences, LN=PL.LocalNotifications, App=PL.App;
const DIR='DATA';   // Directory.Data — приватный каталог приложения
const PH={};        // кэш: имя файла фото -> URL, который понимает webview
/* Нативное фото в filesystem — имя файла с префиксом ph_; в вебе и бэкапах —
   data:-URL; демо-фото прототипа — относительный путь (sirocco.jpg). */
const isFile=p=>typeof p==='string'&&p.indexOf('ph_')===0;
function photoSrc(p){ if(!p) return ''; return isFile(p)?(PH[p]||''):p; }
function fileToUri(name){ return FS.getUri({path:name,directory:DIR}).then(function(r){ PH[name]=CAP.convertFileSrc(r.uri); }); }
function resolvePhotos(){
  if(!NATIVE||!FS) return Promise.resolve();
  const jobs=[];
  D.items.forEach(function(it){ (it.photos||[]).forEach(function(p){ if(isFile(p)&&!PH[p]) jobs.push(fileToUri(p).catch(function(){})); }); });
  return Promise.all(jobs).then(function(){ if(jobs.length) render(); });
}

/* ---------- состояние ---------- */
let D=load()||seed();
let S={tab:'gear',screen:'gear',id:null,id2:null,tripId:null,modal:null,q:'',
filters:{g:[],s:[]},reason:'rMelt',reasonText:'',ob:0,obSkip:false,photo:null,
form:{},trip:{name:'',from:'',to:'',items:[]},set:{name:'',items:[]},toast:null};

function sysLang(){ return (navigator.language||'en').toLowerCase().indexOf('ru')===0?'ru':'en'; }
function lang(){ return (D.lang&&D.lang!=='sys')?D.lang:sysLang(); }
function t(k,a,b){ const s=(TXT[lang()]&&TXT[lang()][k])!==undefined?TXT[lang()][k]:k;
  return typeof s==='string'?s.replace('%A',a).replace('%B',b):s; }
function tp(o){ return o[lang()]||o.en; }

function seed(){
  const L=sysLang(), T=TXT[L];
  const d=(y,m,dd)=>y+'-'+String(m).padStart(2,'0')+'-'+String(dd).padStart(2,'0');
  const rel=n=>{ const x=new Date(); x.setDate(x.getDate()+n); return d(x.getFullYear(),x.getMonth()+1,x.getDate()); };
  const it=(id,type,name,size,buy,made,days,falls,factor,weight,status,lastInsp,extra)=>
    Object.assign({id:id,type:type,name:name,size:size,buy:buy,made:made,days:days,falls:falls,
      factor:factor,weight:weight,status:status,lastInsp:lastInsp,notes:'',photos:[]},extra||{});
  return {onboarded:false,lang:'sys',theme:'sys',notif:{insp:1,trip:1,home:1},
    items:[
      it(1,'rope','Beal Booster 9.8','70 '+T.mon,d(2023,8,12),d(2022,6,1),96,41,1.4,4180,'alert',d(2026,3,2),{serial:'22F4180',notes:T.demoNote1,first:d(2023,9,1)}),
      it(2,'harness','Petzl Sama','M',d(2019,4,6),d(2018,11,1),210,96,0.9,340,'warn',d(2026,3,2),{first:d(2019,6,10)}),
      it(3,'helmet','Petzl Sirocco','M/L',d(2024,5,18),d(2024,2,1),64,0,0,170,'ok',d(2026,3,2),{photos:['sirocco.jpg'],first:d(2024,6,20)}),
      it(4,'draw','Petzl Djinn × 12','12 '+T.pcs,d(2025,3,4),d(2025,1,1),54,38,1.1,1190,'ok',d(2026,3,2)),
      it(5,'biner','Petzl Attache × 4','4 '+T.pcs,d(2024,2,10),'',62,9,0.8,224,'ok',d(2026,2,18)),
      it(6,'cam','Camp Ballnuts 0.4–3','6 '+T.pcs,d(2024,5,2),'',31,3,1.2,1480,'ok',d(2026,2,18)),
      it(7,'belay','Petzl Reverso','',d(2023,1,20),'',96,0,0,57,'ok',d(2025,6,1),{photos:['reverso.jpg']}),
      it(8,'crampons','Petzl Vasak',T.demoAuto,d(2023,12,1),'',18,0,0,1020,'ok',d(2025,12,1)),
      it(9,'axe','Petzl Summit','59',d(2023,12,1),'',18,0,0,470,'ok',d(2025,12,1)),
      it(10,'lamp','Petzl Actik Core','450 lm',d(2022,6,4),'',120,0,0,75,'ok','',{notes:T.demoNote2}),
      it(11,'sling','Mammut Dyneema 120 × 3','3 '+T.pcs,d(2021,6,10),d(2021,3,1),74,2,0.7,96,'ok',d(2026,3,2)),
      it(12,'rope','Tendon Master 9.4','60 '+T.mon,d(2017,5,5),d(2017,1,1),180,120,1.6,3760,'retired',d(2024,1,1),{reason:'rOther',reasonText:T.demoMelt})
    ],
    trips:[
      {id:1,name:T.demoTrip1,from:'2026-08-24',to:'2026-08-28',items:[1,2,3,4,5,6,7],picked:{2:1,4:1,6:1},state:'draft'},
      {id:2,name:T.demoTrip2,from:'2026-07-11',to:'2026-07-13',items:[1,2,3,4,7],picked:{},state:'done'},
      {id:3,name:T.demoTrip3,from:'2026-09-18',to:'2026-09-21',items:[2,3,8,9,10],picked:{},state:'draft'},
      {id:4,name:T.demoTrip4,from:rel(-2),to:rel(1),items:[1,2,3,7],picked:{},state:'away'}
    ],
    events:[
      {d:'2026-08-14',k:'a',tk:'evFall',m:'Beal Booster 9.8',item:1},
      {d:'2026-07-13',k:'i',tk:'evFinished',mx:T.demoTrip2,m:'',item:0},
      {d:'2026-04-08',k:'a',tk:'evRetired',mx:'',m:'Tendon Master 9.4',item:12,rk:'rOther'},
      {d:'2026-03-02',k:'o',tk:'evInsp',m:'Beal Booster 9.8',item:1},
      {d:'2026-02-18',k:'o',tk:'evInsp',m:'Camp Ballnuts 0.4–3',item:6}
    ],
    sets:[
      {id:20,name:T.demoKit1,items:[1,2,3,4,5,6,7,11]}
    ],seq:100};
}
/* Пустой старт для устройства: демо-данные — только для веб-прототипа. */
function blank(){ return {onboarded:false,lang:'sys',theme:'sys',notif:{insp:1,trip:1,home:1},items:[],trips:[],events:[],sets:[],seq:100}; }
function save(){
  const s=JSON.stringify(D);
  if(NATIVE&&Prefs){ Prefs.set({key:KEY,value:s}).catch(function(){}); scheduleSync(); return; }
  try{ localStorage.setItem(KEY,s); }catch(e){}
}
function load(){ try{ const r=localStorage.getItem(KEY); return r?JSON.parse(r):null; }catch(e){ return null; } }
function loadD(){
  if(NATIVE&&Prefs) return Prefs.get({key:KEY}).then(function(r){ try{ return r.value?JSON.parse(r.value):null; }catch(e){ return null; } }).catch(function(){ return null; });
  return Promise.resolve(load());
}
let _syncT=null;
function scheduleSync(){ if(!NATIVE||!LN) return; clearTimeout(_syncT); _syncT=setTimeout(syncNotifications,600); }

/* ---------- утилиты ---------- */
const $=s=>document.querySelector(s);
const ico=(n,c)=>'<svg class="'+(c||'')+'"><use href="#'+n+'"/></svg>';
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const today=()=>new Date();
const parse=s=>s?new Date(s+'T00:00:00'):null;
const loc=()=>lang()==='ru'?'ru-RU':'en-GB';
const fmt=s=>{ const d=parse(s); return d?d.toLocaleDateString(loc(),{day:'2-digit',month:'2-digit',year:'numeric'}):'—'; };
const fmtShort=s=>{ const d=parse(s); return d?d.toLocaleDateString(loc(),{day:'numeric',month:'short'}):''; };
const iso=d=>d.toISOString().slice(0,10);
const yb=(a,b)=>(b-a)/(365.25*24*3600*1000);
const db=(a,b)=>Math.round((b-a)/(24*3600*1000));
function ageText(y){ const w=Math.floor(y),m=Math.round((y-w)*12); return (m&&w<10)?(w+' '+t('yr')+' '+m+' '+t('mo')):(w+' '+t('yr')); }
function tripDays(x){ const a=parse(x.from),b=parse(x.to); return (a&&b)?Math.max(1,db(a,b)+1):1; }
function tripW(x){ return x.items.reduce((s,id)=>{ const i=item(id); return s+(i?i.weight:0); },0); }
function item(id){ return D.items.find(i=>i.id===id); }
function life(it){ if(it.type in LIFE_T) return LIFE_T[it.type]; return LIFE_G[(TYPES[it.type]||{}).g]||null; }
function firstUse(it){ return it.first||it.buy||''; }  // начало эксплуатации: первое использование, иначе покупка
function ageOf(it){ const f=firstUse(it); return f?Math.max(0,yb(parse(f),today())):0; }
function storeOf(it){ const f=firstUse(it); return (it.made&&f)?Math.max(0,yb(parse(it.made),parse(f))):0; }
function yticks(n){ n=Math.round(n); if(!n||n<2) return ''; let s=''; for(let i=1;i<n;i++) s+='<i class="yt" style="left:'+(i/n*100)+'%"></i>'; return s; }
function wg(g){ return String(Math.round(g||0)).replace(/\B(?=(\d{3})+(?!\d))/g,' ')+' '+t('gram'); }  // вес в граммах с разделителем разрядов
function hap(style){ try{ if(NATIVE&&PL.Haptics) PL.Haptics.impact({style:style||'Light'}); }catch(e){} }
function tlabel(k){ return tp(TYPES[k]||TYPES.other); }
function toast(m){ S.toast=m; render(); clearTimeout(window._tt); window._tt=setTimeout(function(){ S.toast=null; render(); },2600); }
function applyTheme(){
  const th=D.theme||'sys';
  const dark = th==='dark' || (th==='sys' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.setAttribute('data-theme',dark?'dark':'light');
  const m=document.querySelector('meta[name=theme-color]'); if(m) m.setAttribute('content',dark?'#141917':'#FBFCFA');
}

/* ---------- напоминания ----------
   Один источник правды. Каждому напоминанию считаем дату срабатывания `when`
   (для системного планировщика) и флаг `due` — показывать ли его в приложении
   прямо сейчас. UI (экран уведомлений и бейдж) фильтрует по `due`, планировщик
   берёт будущие `when`. `nid` — стабильный целочисленный id для отмены/замены. */
function atDate(str,offDays,hour){ const d=parse(str); if(!d) return null; d.setDate(d.getDate()+offDays); d.setHours(hour,0,0,0); return d; }
function reminders(){
  const out=[],now=today();
  D.items.filter(i=>i.status!=='retired').forEach(function(i){
    if(!D.notif.insp||!i.lastInsp) return;
    const when=parse(i.lastInsp); if(!when) return;
    when.setMonth(when.getMonth()+6); when.setHours(9,0,0,0);
    out.push({k:'warn',kind:'insp',nid:10000+i.id,ref:i.id,when:when,due:yb(parse(i.lastInsp),now)*12>=6,
      t:i.name+' — '+t('remInsp'),s:t('remLast')+' '+fmt(i.lastInsp),go:function(){ openItem(i.id); }});
  });
  D.trips.forEach(function(x){
    if(D.notif.trip&&(x.state==='draft'||x.state==='ready')&&parse(x.from)){
      const dTo=db(now,parse(x.from));
      out.push({k:'info',kind:'trip',nid:20000+x.id,ref:x.id,when:atDate(x.from,-2,9),due:dTo>=0&&dTo<=2,
        t:x.name+' — '+(dTo===0?t('remToday'):t('remIn')+' '+dTo+' '+t('dShort')),s:t('remPackS'),go:function(){ openTrip(x.id); }});
    }
    if(D.notif.home&&x.state==='away'&&parse(x.to)){
      const dH=db(now,parse(x.to));
      out.push({k:'info',kind:'trip',nid:30000+x.id,ref:x.id,when:atDate(x.to,-1,9),due:dH<=1,
        t:x.name+' — '+t('remHome'),s:t('remHomeS'),go:function(){ openTrip(x.id); }});
    }
  });
  return out;
}
/* Пересобрать план: отменить всё запланированное и поставить будущие напоминания.
   Вызывается на старте и (с дебаунсом через scheduleSync) после каждого save(). */
function syncNotifications(){
  if(!NATIVE||!LN) return;
  LN.checkPermissions().then(function(p){ return p.display==='granted'?p:LN.requestPermissions(); }).then(function(p){
    if(!p||p.display!=='granted') return;
    return LN.getPending().then(function(res){
      const pend=(res&&res.notifications)||[];
      const cancel=pend.length?LN.cancel({notifications:pend.map(function(n){ return {id:n.id}; })}):Promise.resolve();
      return cancel.then(function(){
        const now=Date.now();
        const plan=reminders().filter(function(r){ return r.nid&&r.when&&r.when.getTime()>now; });
        if(!plan.length) return;
        return LN.schedule({notifications:plan.map(function(r){
          return {id:r.nid,title:'ClimbKit',body:r.t,schedule:{at:r.when},extra:{kind:r.kind,ref:r.ref}};
        })});
      });
    });
  }).catch(function(){});
}
function testNotification(){
  if(NATIVE&&LN){
    LN.requestPermissions().then(function(p){
      if(p.display!=='granted') return toast(t('toNotifDenied'));
      toast(t('toNotif5'));
      LN.schedule({notifications:[{id:99999,title:'ClimbKit',body:t('notifBody'),schedule:{at:new Date(Date.now()+5000)}}]}).catch(function(){});
    });
    return;
  }
  if(!('Notification' in window)) return toast(t('toNotifNo'));
  Notification.requestPermission().then(function(p){
    if(p!=='granted') return toast(t('toNotifDenied'));
    toast(t('toNotif5'));
    setTimeout(function(){ new Notification('ClimbKit',{body:t('notifBody')}); },5000);
  });
}

/* ---------- блоки ---------- */
function badge(k,dim,size){
  const T=TYPES[k]||TYPES.other;
  const st=size?('width:'+size+'px;height:'+size+'px;border-radius:'+Math.round(size/3.2)+'px;'):'';
  return '<div class="badge" style="'+st+'background:'+(dim?'var(--panel)':'var(--'+T.c+'-bg)')+';color:'+(dim?'var(--ink-3)':'var(--'+T.c+')')+'">'+ico(T.ic)+'</div>';
}
function pill(it){
  if(it.status==='alert') return '<span class="pill alert">'+t('pInsp')+'</span>';
  if(it.status==='warn') return '<span class="pill warn">'+t('pWarn')+'</span>';
  if(it.status==='retired') return '<span class="pill mute">'+t('pRetired')+'</span>';
  return '';
}
function subLine(it){
  if(it.status==='retired') return t('retiredDot')+' · '+t(it.reason||'rOther');
  const L=life(it);
  return (L?(ageText(ageOf(it))+' / '+L[0]):t('noTerm'))+' · '+it.days+' '+t('dShort');
}
function row(it){
  const d=it.status==='retired';
  return '<button class="item '+(d?'dim':'')+'" onclick="openItem('+it.id+')">'+badge(it.type,d)+
    '<span class="grow"><span class="name">'+esc(it.name)+'</span><span class="meta">'+subLine(it)+'</span></span>'+
    pill(it)+'<span class="chev">'+ico('u-next','check')+'</span></button>';
}
window._rems=[];
function noteBlock(r,n){
  return '<button class="note '+r.k+'" onclick="rem('+n+')">'+ico('u-bell')+
    '<span><p>'+esc(r.t)+'</p><p class="s">'+esc(r.s)+'</p></span></button>';
}
function rem(n){ const r=window._rems[n]; if(r&&r.go) r.go(); }
function emptyBlock(ttl,txt,tap){
  return '<div class="empty">'+(tap?'<button class="logobtn" onclick="startManual()">'+ico('logo','logo-ghost')+'</button>':ico('logo','logo-ghost'))+
    '<h2>'+esc(ttl)+'</h2><p>'+esc(txt)+'</p>'+
    (tap?'<button class="btn" style="margin-top:22px;max-width:260px" onclick="startManual()">'+t('addBtn')+'</button>':'')+'</div>';
}

/* ---------- экраны ---------- */
function scGear(){
  const f=S.filters;
  let list=D.items.slice();
  if(f.g.length) list=list.filter(i=>f.g.indexOf(TYPES[i.type].g)>=0);
  if(f.s.length) list=list.filter(i=>f.s.indexOf(i.status)>=0);
  else list=list.filter(i=>i.status!=='retired');
  const prio=s=>s==='alert'?0:(s==='warn'?1:2);   // проблемные наверх
  list.sort((a,b)=>prio(a.status)-prio(b.status));
  const active=D.items.filter(i=>i.status!=='retired').length;
  const nf=f.g.length+f.s.length;
  let chips='';
  if(nf) chips='<div class="chips" style="margin-bottom:12px">'+
    f.g.map(g=>'<button class="chip lite" onclick="unfilter(\'g\',\''+g+'\')">'+t(GKEY[g])+ico('u-x')+'</button>').join('')+
    f.s.map(s=>'<button class="chip lite" onclick="unfilter(\'s\',\''+s+'\')">'+t(SKEY[s])+ico('u-x')+'</button>').join('')+
    '<button class="chip" onclick="clearFilters()">'+t('reset')+'</button></div>';
  let body;
  if(!D.items.length) body=emptyBlock(t('emptyT'),t('emptyP'),true);
  else if(!active&&!nf) body=emptyBlock(t('allRetiredT'),t('allRetiredP'),true);
  else if(!list.length) body=emptyBlock(t('nothingT'),t('nothingP'),false);
  else{
    const att=list.filter(i=>i.status==='alert'||i.status==='warn');
    const rest=list.filter(i=>i.status!=='alert'&&i.status!=='warn');
    body=(!nf&&att.length)
      ?('<p class="label first">'+t('needsAttn')+'</p>'+att.map(row).join('')+(rest.length?('<p class="label">'+t('gearAll')+'</p>'+rest.map(row).join('')):''))
      :list.map(row).join('');
  }
  return '<div class="top"><div><p class="title">'+t('gearTitle')+'</p><p class="meta">'+active+' '+t('itemsN')+'</p></div>'+
    '<div class="acts"><button class="icobtn" onclick="go(\'search\')">'+ico('u-search')+'</button>'+
    '<button class="icobtn'+(nf?' on':'')+'" onclick="modal(\'filters\')">'+ico('u-filter')+'</button>'+
    '<button class="icobtn" onclick="modal(\'add\')">'+ico('u-plus')+'</button></div></div>'+
    '<div class="body">'+chips+body+'</div>';
}

function scItem(){
  const it=item(S.id); if(!it) return scGear();
  const T=TYPES[it.type],L=life(it),age=ageOf(it),st=storeOf(it);
  const pct=L?Math.min(100,age/L[0]*100):0;
  const cls=it.status==='alert'?'a':(it.status==='warn'?'w':'');
  const log=D.events.filter(e=>e.item===it.id);
  let card;
  if(L) card='<div class="gauge"><div class="grow-row"><span>'+t('lifeActive')+'</span><span class="n">'+ageText(age)+' / '+L[0]+'</span></div>'+
    '<div class="track"><span class="'+cls+'" style="width:'+pct+'%"></span>'+yticks(L[0])+'</div>'+
    '<div class="slegend"><span>'+t('sinceUse')+' '+fmt(firstUse(it))+'</span><span>'+L[0]+' '+t('yearsShort')+'</span></div></div>'+
    '<div class="gauge"><div class="grow-row"><span>'+t('lifeStore')+'</span><span class="n">'+ageText(st)+' / '+L[1]+'</span></div>'+
    '<div class="track"><span style="width:'+Math.min(100,st/L[1]*100)+'%"></span>'+yticks(L[1])+'</div>'+
    '<div class="slegend"><span>'+(it.made?(t('madeOn')+' '+fmt(it.made)):t('noMade'))+'</span><span>'+t('totalMax')+' '+(L[0]+L[1])+'</span></div></div>';
  else card='<p class="lead">'+t('noLifeT')+' «'+t(GKEY[T.g])+'»</p><p class="sub">'+t('noLifeP')+'</p>';
  return '<div class="top"><button class="icobtn" onclick="go(\'gear\')">'+ico('u-back')+'</button>'+
    '<p class="title sm">'+esc(tlabel(it.type))+'</p>'+
    '<button class="icobtn" onclick="startEdit('+it.id+')">'+ico('u-edit')+'</button></div><div class="body cardview">'+
    '<div class="hero">'+badge(it.type,it.status==='retired',60)+
    '<div><p class="hname">'+esc(it.name)+'</p><p class="meta">'+[tlabel(it.type),it.size,it.serial?('№ '+it.serial):''].filter(Boolean).map(esc).join(' · ')+'</p>'+
    '<span class="pw">'+(pill(it)||'<span class="pill ok">'+t('pOk')+'</span>')+'</span></div></div>'+
    ((it.status==='retired'&&it.reasonText)?('<div class="note alert nb">'+ico('u-warn')+'<span><p>'+t(it.reason||'rOther')+'</p><p class="s">'+esc(it.reasonText)+'</p></span></div>'):'')+
    '<p class="label first">'+t('lifeTitle')+'</p><div class="card">'+card+'</div>'+
    '<p class="label">'+t('usage')+'</p><div class="stats">'+
    '<div class="card"><p class="k">'+t('days')+'</p><p class="v">'+it.days+'</p></div>'+
    '<div class="card"><p class="k">'+t('falls')+'</p><p class="v">'+it.falls+'</p></div>'+
    '<div class="card"><p class="k">'+t('factor')+'</p><p class="v">'+(it.factor||'—')+'</p></div></div>'+
    '<p class="label">'+t('photos')+'</p><div class="gallery">'+
    (it.photos||[]).map((p,n)=>'<button style="background-image:url('+photoSrc(p)+')" onclick="openPhoto('+it.id+','+n+')"></button>').join('')+
    '<label>'+ico('u-camera')+'<input type="file" accept="image/*" onchange="addPhoto('+it.id+',this)" /></label></div>'+
    '<p class="label">'+t('notes')+'</p><textarea rows="3" maxlength="500" placeholder="'+t('notesPh')+'" oninput="saveNotes('+it.id+',this.value)">'+esc(it.notes||'')+'</textarea>'+
    '<p class="label">'+t('histTitle')+'</p>'+
    (log.length?log.map(evRow).join(''):'<p class="sub">'+t('nothingLogged')+'</p>')+
    (it.status==='retired'?'':('<div class="brow"><button class="btn ghost" onclick="mark('+it.id+',\'insp\')">'+t('insp')+'</button>'+
    '<button class="btn ghost" onclick="mark('+it.id+',\'fall\')">'+t('fall')+'</button>'+
    '<button class="btn dangerghost" onclick="modal(\'retire\','+it.id+')">'+t('retire')+'</button></div>'))+'</div>';
}
function evText(e){ return t(e.tk)+(e.rk?(' '+t(e.rk).toLowerCase()):'')+(e.mx?(' '+e.mx):''); }
function evRow(e){
  return '<div class="log"'+(e.item?(' onclick="openItem('+e.item+')" style="cursor:pointer"'):'')+'>'+
    '<span class="dot '+e.k+'"></span><div><p class="t">'+esc(evText(e))+'</p><p class="meta">'+fmt(e.d)+(e.m?(' · '+esc(e.m)):'')+'</p></div></div>';
}

const TSTATE={draft:['sDraft','mute'],ready:['sReady','ok'],away:['sAway','warn'],done:['sDone','mute']};
function setW(s){ return tripW(s); }  // у набора тоже .items — переиспользуем tripW
function setRow(s){
  const ic=(s.items.length&&item(s.items[0]))?item(s.items[0]).type:'pack';
  return '<button class="item" onclick="openSet('+s.id+')">'+badge(ic)+
    '<span class="grow"><span class="name">'+esc(s.name)+'</span><span class="meta">'+s.items.length+' '+t('posShort')+' · '+wg(setW(s))+'</span></span>'+
    '<span class="chev">'+ico('u-next','check')+'</span></button>';
}
function scTrips(){
  const sorted=D.trips.slice().sort((a,b)=>((a.state==='done')-(b.state==='done'))||String(a.from).localeCompare(String(b.from)));
  return '<div class="top"><div><p class="title">'+t('trips')+'</p><p class="meta">'+D.trips.filter(x=>x.state!=='done').length+' '+t('tripsActive')+'</p></div>'+
    '<div class="acts"><button class="icobtn" onclick="newTrip()">'+ico('u-plus')+'</button></div></div><div class="body">'+
    '<p class="label first">'+t('kits')+'</p>'+
    ((D.sets||[]).length?D.sets.map(setRow).join(''):'<p class="sub">'+t('kitsEmpty')+'</p>')+
    '<button class="btn ghost" style="margin:10px 0 4px" onclick="newSet()">'+t('kitNew')+'</button>'+
    '<p class="label">'+t('trips')+'</p>'+
    (sorted.length?sorted.map(function(x){
      const st=TSTATE[x.state];
      return '<button class="item" onclick="openTrip('+x.id+')">'+badge('pack',x.state==='done')+
      '<span class="grow"><span class="name">'+esc(x.name)+'</span><span class="meta">'+fmtShort(x.from)+' — '+fmtShort(x.to)+' · '+x.items.length+' '+t('posShort')+' · '+wg(tripW(x))+'</span></span>'+
      '<span class="pill '+st[1]+'">'+t(st[0])+'</span></button>';
    }).join(''):emptyBlock(t('noTripsT'),t('noTripsP'),false))+
    '<button class="btn ghost" style="margin-top:16px" onclick="newTrip()">'+t('newTrip')+'</button></div>';
}

function scTrip(){
  const x=D.trips.find(y=>y.id===S.tripId); if(!x) return scTrips();
  const list=x.items.map(item).filter(Boolean);
  const done=list.filter(i=>x.picked[i.id]).length;
  const all=done===list.length&&list.length>0;
  const dead=list.filter(i=>i.status==='retired');
  const w=list.filter(i=>x.picked[i.id]).reduce((s,i)=>s+i.weight,0);
  const C=2*Math.PI*15.5, off=C*(1-(list.length?done/list.length:0));
  const st=TSTATE[x.state];
  const canDel=(x.state==='draft'||x.state==='ready');
  let btn,hint;
  if(canDel){ btn='<button class="btn" '+(all?'':'disabled')+' onclick="depart()">'+t('goBtn')+'</button>'; hint=t('hintAll'); }
  else if(x.state==='away'){ btn='<button class="btn" '+(all?'':'disabled')+' onclick="comeHome()">'+t('homeBtn')+'</button>'; hint=t('hintHome'); }
  else { btn='<button class="btn ghost" onclick="go(\'trips\')">'+t('doneBtn')+'</button>'; hint=''; }
  return '<div class="top"><button class="icobtn" onclick="go(\'trips\')">'+ico('u-back')+'</button>'+
    '<div class="grow"><p class="title sm">'+esc(x.name)+'</p><p class="meta">'+fmt(x.from)+' — '+fmt(x.to)+' · '+t(st[0])+'</p></div>'+
    (canDel?('<button class="icobtn" onclick="delTrip()">'+ico('u-trash')+'</button>'):'<span class="sp"></span>')+'</div><div class="body cardview">'+
    '<div class="card ring-card"><svg class="ring" viewBox="0 0 36 36"><circle cx="18" cy="18" r="15.5" fill="none" class="rbg" stroke-width="4"/>'+
    '<circle cx="18" cy="18" r="15.5" fill="none" stroke="'+(all?'var(--petrol)':'var(--slate)')+'" stroke-width="4" stroke-linecap="round" stroke-dasharray="'+C+'" stroke-dashoffset="'+off+'" transform="rotate(-90 18 18)"/></svg>'+
    '<div><p class="hname">'+t('markedOf',done,list.length)+'</p><p class="meta">'+wg(w)+' · '+t('totalW')+' '+wg(tripW(x))+'</p></div></div>'+
    (dead.length?('<div class="note warn">'+ico('u-warn')+'<span><p>'+t('deadWarn')+'</p><p class="s">'+dead.map(i=>esc(i.name)).join(', ')+'</p></span></div>'):'')+
    list.map(function(i){
      return '<button class="item" onclick="pick('+i.id+')" '+(x.state==='done'?'disabled':'')+'>'+
      '<span class="tick" style="color:'+(x.picked[i.id]?'var(--petrol)':'var(--line-2)')+'">'+ico(x.picked[i.id]?'u-check':'u-circle','check')+'</span>'+
      badge(i.type,i.status==='retired')+
      '<span class="grow"><span class="name"'+(i.status==='retired'?' style="color:var(--clay)"':'')+'>'+esc(i.name)+'</span>'+
      '<span class="meta">'+wg(i.weight)+'</span></span></button>';
    }).join('')+
    (list.length?('<button class="btn ghost" style="margin-top:14px" onclick="saveAsKit()">'+t('kitSaveAs')+'</button>'):'')+
    (hint?('<p class="hint">'+hint+'</p>'):'')+'</div><div class="foot">'+btn+'</div>';
}

function scTripNew(){
  const x=S.trip;
  return '<div class="top"><button class="icobtn" onclick="go(\'trips\')">'+ico('u-back')+'</button>'+
    '<p class="title sm">'+t('tripNewT')+'</p><span class="sp"></span></div><div class="body">'+
    '<div class="field"><label>'+t('fName')+' <span class="req">*</span></label><input value="'+esc(x.name)+'" oninput="S.trip.name=this.value" placeholder="'+t('tripName')+'" /></div>'+
    '<div class="two"><div class="field"><label>'+t('start')+'</label><input type="date" value="'+x.from+'" oninput="S.trip.from=this.value" /></div>'+
    '<div class="field"><label>'+t('end')+'</label><input type="date" value="'+x.to+'" oninput="S.trip.to=this.value" /></div></div>'+
    ((D.sets||[]).length?('<div class="field"><label>'+t('fromKit')+'</label><select onchange="applyKit(this.value)"><option value="">'+t('kitPick')+'</option>'+D.sets.map(s=>'<option value="'+s.id+'">'+esc(s.name)+' · '+s.items.length+'</option>').join('')+'</select></div>'):'')+
    '<p class="label">'+t('gearSelected')+' '+x.items.length+' · '+wg(tripW(x))+'</p>'+
    D.items.filter(i=>i.status!=='retired').map(function(i){
      const on=x.items.indexOf(i.id)>=0;
      return '<button class="item" onclick="tripPick('+i.id+')"><span class="tick" style="color:'+(on?'var(--petrol)':'var(--line-2)')+'">'+ico(on?'u-check':'u-circle','check')+'</span>'+
      badge(i.type)+'<span class="grow"><span class="name">'+esc(i.name)+'</span><span class="meta">'+wg(i.weight)+'</span></span></button>';
    }).join('')+
    '<p class="hint">'+t('tripHint')+'</p></div>'+
    '<div class="foot"><button class="btn" '+((x.name.trim()&&x.items.length)?'':'disabled')+' onclick="saveTrip()">'+t('createTrip')+'</button></div>';
}

function scNotif(){
  const R=reminders().filter(r=>r.due); window._rems=R;
  const tr=R.filter(r=>r.kind==='trip'), ins=R.filter(r=>r.kind==='insp');
  if(!R.length) return '<div class="top"><div><p class="title">'+t('notif')+'</p><p class="meta">'+t('allCalm')+'</p></div></div>'+
    '<div class="body">'+emptyBlock(t('noRemT'),t('noRemP'),false)+'</div>';
  return '<div class="top"><div><p class="title">'+t('notif')+'</p><p class="meta">'+R.length+' '+t('activeN')+'</p></div></div><div class="body">'+
    '<p class="label first">'+t('packing')+' · '+tr.length+'</p>'+
    (tr.length?tr.map(r=>noteBlock(r,R.indexOf(r))).join(''):'<p class="sub">'+t('noTripsSoon')+'</p>')+
    '<p class="label">'+t('inspect')+' · '+ins.length+'</p>'+
    (ins.length?ins.map(r=>noteBlock(r,R.indexOf(r))).join(''):'<p class="sub">'+t('allInspected')+'</p>')+
    '<p class="hint">'+t('notifHint')+'</p></div>';
}

function scHistory(){
  const ev=D.events.slice().sort((a,b)=>String(b.d).localeCompare(String(a.d)));
  if(!ev.length) return '<div class="top"><p class="title">'+t('history')+'</p></div><div class="body">'+emptyBlock(t('emptyHistT'),t('emptyHistP'),false)+'</div>';
  const by={},order=[];
  ev.forEach(function(e){ const k=(parse(e.d)||today()).toLocaleDateString(loc(),{month:'long',year:'numeric'});
    if(!by[k]){ by[k]=[]; order.push(k); } by[k].push(e); });
  return '<div class="top"><div><p class="title">'+t('history')+'</p><p class="meta">'+ev.length+' '+t('recordsN')+'</p></div></div><div class="body">'+
    order.map(k=>'<p class="label">'+esc(k)+'</p>'+by[k].map(evRow).join('')).join('')+'</div>';
}

function scSettings(){
  const TG=(k,l,s)=>'<div class="item static"><span class="grow"><span class="name">'+l+'</span><span class="meta">'+s+'</span></span>'+
    '<span class="toggle '+(D.notif[k]?'':'off')+'" onclick="toggleNotif(\''+k+'\')"><i></i></span></div>';
  const LN=(l,s,fn)=>'<button class="item'+(fn?'':' static')+'" '+(fn?('onclick="'+fn+'"'):'')+'><span class="grow"><span class="name">'+l+'</span><span class="meta">'+s+'</span></span>'+
    (fn?'<span class="chev">'+ico('u-next','check')+'</span>':'')+'</button>';
  const SEL=(l,val,opts,fn)=>'<div class="item static"><span class="grow"><span class="name">'+l+'</span></span>'+
    '<select class="mini" onchange="'+fn+'(this.value)">'+opts.map(o=>'<option value="'+o[0]+'"'+(val===o[0]?' selected':'')+'>'+o[1]+'</option>').join('')+'</select></div>';
  return '<div class="top"><p class="title">'+t('settings')+'</p></div><div class="body">'+
    '<p class="label first">'+t('reminders')+'</p><div class="card tight">'+
    TG('insp',t('inspEvery'),t('inspEveryP'))+TG('trip',t('packRem'),t('packRemP'))+TG('home',t('homeRem'),t('homeRemP'))+'</div>'+
    '<button class="btn ghost" style="margin-top:10px" onclick="testNotification()">'+t('testNotif')+'</button>'+
    '<p class="hint" style="margin-top:8px">'+t('notifHint2')+'</p>'+
    '<p class="label">'+t('appearance')+'</p><div class="card tight">'+
    SEL(t('language'),D.lang||'sys',[['sys',t('sysOpt')],['ru','Русский'],['en','English']],'setLang')+
    SEL(t('theme'),D.theme||'sys',[['sys',t('sysOpt')],['light',t('lightOpt')],['dark',t('darkOpt')]],'setTheme')+'</div>'+
    '<p class="label">'+t('help')+'</p><div class="card tight">'+LN(t('howWorks'),t('howWorksP'),'startOb()')+'</div>'+
    '<p class="label">'+t('transfer')+'</p><div class="card tight">'+
    LN(t('saveFile'),t('saveFileP'),"modal('transfer')")+LN(t('openFile'),t('openFileP'),"modal('restore')")+'</div>'+
    '<p class="label">'+t('otherSec')+'</p><div class="card tight">'+
    LN(t('impExcel'),t('impExcelP'),"modal('import')")+LN(t('expCsv'),t('expCsvP'),'exportCsv()')+LN(t('resetProto'),t('resetProtoP'),'reset()')+'</div>'+
    '<p class="label">'+t('appSec')+'</p><div class="card tight">'+LN(t('about'),t('aboutP'),'')+'</div>'+
    '<p class="hint">'+t('storageHint')+'</p></div>';
}

function scSearch(){
  const q=S.q.trim().toLowerCase();
  const found=q?D.items.filter(i=>i.name.toLowerCase().indexOf(q)>=0||tlabel(i.type).toLowerCase().indexOf(q)>=0):[];
  return '<div class="top" style="gap:10px"><button class="icobtn" onclick="go(\'gear\')">'+ico('u-back')+'</button>'+
    '<input id="q" placeholder="'+t('searchPh')+'" value="'+esc(S.q)+'" oninput="S.q=this.value;render(true)" /></div><div class="body">'+
    (q?(found.length?('<p class="label first">'+t('foundN')+' · '+found.length+'</p>'+found.map(row).join('')):'<p class="sub center">'+t('notFound')+'</p>')
    :('<p class="label first">'+t('quick')+'</p><div class="chips">'+(TXT[lang()].qs).map(x=>'<button class="chip" onclick="quick(\''+x+'\')">'+x+'</button>').join('')+'</div>'))+'</div>';
}
function quick(x){ S.q=x; render(); }

function lifeHint(type){
  const g=(TYPES[type]||{}).g, L=(type in LIFE_T)?LIFE_T[type]:LIFE_G[g];
  const body='«'+t(GKEY[g])+'» '+(L?t('hintYes',L[0],L[1]):t('hintNo'));
  return '<div class="note info nb">'+ico('u-warn')+'<span><p>'+t('lifeTitle')+'</p><p class="s">'+body+'</p></span></div>';
}
function setFormType(v){ S.form.type=v; render(); }

function scAdd(){
  const f=S.form,type=f.type||'rope';
  const opts=Object.keys(GKEY).map(function(g){
    return '<optgroup label="'+t(GKEY[g])+'">'+Object.keys(TYPES).filter(k=>TYPES[k].g===g).map(function(k){
      return '<option value="'+k+'"'+(type===k?' selected':'')+'>'+tlabel(k)+'</option>'; }).join('')+'</optgroup>'; }).join('');
  const edit=!!f.id;
  return '<div class="top"><button class="icobtn" onclick="cancelForm()">'+ico('u-back')+'</button>'+
    '<p class="title sm">'+t(edit?'editTitle':'addTitle')+'</p><span class="sp"></span></div><div class="body">'+
    '<div class="field"><label>'+t('fName')+' <span class="req">*</span></label><input value="'+esc(f.name||'')+'" oninput="S.form.name=this.value" placeholder="Beal Booster 9.8" /></div>'+
    '<div class="field"><label>'+t('category')+'</label><select onchange="setFormType(this.value)">'+opts+'</select></div>'+lifeHint(type)+
    '<div class="field"><label>'+t('fSize')+'</label><input value="'+esc(f.size||'')+'" oninput="S.form.size=this.value" /></div>'+
    '<div class="two"><div class="field"><label>'+t('fBuy')+'</label><input type="date" value="'+(f.buy||'')+'" oninput="S.form.buy=this.value" /></div>'+
    '<div class="field"><label>'+t('fMade')+'</label><input type="date" value="'+(f.made||'')+'" oninput="S.form.made=this.value" /></div></div>'+
    '<div class="field"><label>'+t('fFirst')+'</label><input type="date" value="'+(f.first||'')+'" oninput="S.form.first=this.value" /></div>'+
    '<div class="two"><div class="field"><label>'+t('fWeight')+'</label><input type="number" value="'+(f.weight||'')+'" oninput="S.form.weight=this.value" /></div>'+
    '<div class="field"><label>'+t('fSerial')+'</label><input value="'+esc(f.serial||'')+'" oninput="S.form.serial=this.value" /></div></div>'+
    (edit?('<p class="label">'+t('usage')+'</p><div class="two">'+
      '<div class="field"><label>'+t('days')+'</label><input type="number" min="0" value="'+(f.days||0)+'" oninput="S.form.days=this.value" /></div>'+
      '<div class="field"><label>'+t('falls')+'</label><input type="number" min="0" value="'+(f.falls||0)+'" oninput="S.form.falls=this.value" /></div></div>'+
      '<div class="two"><div class="field"><label>'+t('factor')+'</label><input type="number" step="0.1" min="0" value="'+(f.factor||0)+'" oninput="S.form.factor=this.value" /></div>'+
      '<div class="field"><label>'+t('fLastInsp')+'</label><input type="date" value="'+(f.lastInsp||'')+'" oninput="S.form.lastInsp=this.value" /></div></div>'):'')+
    '<div class="field"><label>'+t('notes')+'</label><textarea rows="2" maxlength="500" placeholder="'+t('optional')+'" oninput="S.form.notes=this.value">'+esc(f.notes||'')+'</textarea></div></div>'+
    '<div class="foot"><button class="btn" '+((f.name||'').trim()?'':'disabled')+' onclick="saveItem()">'+t(edit?'editBtn':'addBtn')+'</button></div>';
}

/* ---------- онбординг ---------- */
function obSlides(){ return [
  {t:'ClimbKit',p:t('ob1p'),a:'logo'},
  {t:t('ob2t'),p:t('ob2p'),a:'i-rope'},
  {t:t('ob3t'),p:t('ob3p'),a:'i-pack'},
  {t:t('ob4t'),p:t('ob4p'),a:'u-bell'},
  {t:t('ob5t'),p:t('ob5p'),a:'u-clock'}]; }
function scOb(){
  const OB=obSlides(),s=OB[S.ob],last=S.ob===OB.length-1,first=S.ob===0;
  return '<div class="obwrap"><div class="ob-nav">'+
    (first?'<span class="sp"></span>':('<button class="icobtn" onclick="prevOb()">'+ico('u-back')+'</button>'))+
    '<button class="icobtn txt" onclick="finishOb()">'+t('skip')+'</button></div>'+
    '<div class="ob-mid"><div class="ob-art'+(first?' big':'')+'">'+ico(s.a)+'</div>'+
    '<h2 class="'+(first?'brand':'')+'">'+esc(s.t)+'</h2></div>'+
    '<div class="ob-bot"><p>'+esc(s.p)+'</p>'+
    '<div class="dots">'+OB.map((_,n)=>'<i class="'+(n===S.ob?'on':'')+'"></i>').join('')+'</div></div></div>'+
    '<div class="foot"><button class="btn" onclick="'+(last?'finishOb()':'nextOb()')+'">'+(last?t('startBtn'):t('next'))+'</button>'+
    '<div class="skiprow" onclick="toggleSkip()"><span class="box '+(S.obSkip?'on':'')+'">'+(S.obSkip?ico('u-tick'):'')+'</span>'+t('dontShow')+'</div></div>';
}
function nextOb(){ S.ob++; render(); }
function prevOb(){ if(S.ob>0){ S.ob--; render(); } }
function toggleSkip(){ S.obSkip=!S.obSkip; render(); }
function startOb(){ S.ob=0; S.obSkip=false; S.screen='ob'; render(); }
function finishOb(){ const OB=obSlides(); if(S.obSkip||S.ob===OB.length-1) D.onboarded=true; save(); S.screen='gear'; S.tab='gear'; render(); }

/* ---------- модалки ---------- */
function sheet(inner){ return '<div class="scrim bottom" onclick="if(event.target===this)closeModal()"><div class="sheet"><div class="grip"></div>'+inner+'</div></div>'; }
function mFilters(){
  const f=S.filters;
  return sheet('<p class="mt">'+t('filters')+'</p>'+
    '<p class="label first">'+t('category')+'</p><div class="chips">'+
    Object.keys(GKEY).map(g=>'<button class="chip '+(f.g.indexOf(g)>=0?'on':'')+'" onclick="toggleFilter(\'g\',\''+g+'\')">'+t(GKEY[g])+'</button>').join('')+'</div>'+
    '<p class="label">'+t('condition')+'</p><div class="chips">'+
    Object.keys(SKEY).map(s=>'<button class="chip '+(f.s.indexOf(s)>=0?'on':'')+'" onclick="toggleFilter(\'s\',\''+s+'\')">'+t(SKEY[s])+'</button>').join('')+'</div>'+
    '<div class="row2"><button class="btn ghost" onclick="clearFilters()">'+t('reset')+'</button>'+
    '<button class="btn" onclick="closeModal()">'+t('show')+'</button></div>');
}
function mRetire(){
  const it=item(S.id2); if(!it) return '';
  const other=S.reason==='rOther';
  return '<div class="scrim center" onclick="if(event.target===this)closeModal()"><div class="dlg">'+
    '<p class="mt">'+t('retireQ')+' «'+esc(it.name)+'»?</p><p class="sub">'+t('retireP')+'</p>'+
    '<p class="label">'+t('reason')+'</p><div class="chips">'+
    ['rMelt','rAge','rFall','rWear','rOther'].map(r=>'<button class="chip '+(S.reason===r?'on':'')+'" onclick="setReason(\''+r+'\')">'+t(r)+'</button>').join('')+'</div>'+
    (other?('<div style="margin-top:14px"><textarea rows="3" maxlength="200" placeholder="'+t('otherPh')+'" oninput="onReasonText(this)">'+esc(S.reasonText)+'</textarea>'+
      '<p class="counter" id="rc">'+S.reasonText.length+' / 200</p></div>'):'')+
    '<div class="row2"><button class="btn ghost" onclick="closeModal()">'+t('cancel')+'</button>'+
    '<button class="btn danger" '+((other&&!S.reasonText.trim())?'disabled':'')+' onclick="retire()">'+t('retire')+'</button></div></div></div>';
}
function mAdd(){
  return sheet('<p class="mt">'+t('addSheetT')+'</p><p class="meta mb">'+t('addSheetP')+'</p>'+
    '<button class="item" onclick="startManual()"><div class="badge plain">'+ico('u-edit')+'</div>'+
    '<span class="grow"><span class="name">'+t('manual')+'</span><span class="meta">'+t('manualP')+'</span></span><span class="chev">'+ico('u-next','check')+'</span></button>'+
    '<button class="item" onclick="modal(\'import\')"><div class="badge plain">'+ico('u-file')+'</div>'+
    '<span class="grow"><span class="name">'+t('excel')+'</span><span class="meta">'+t('excelP')+'</span></span><span class="chev">'+ico('u-next','check')+'</span></button>');
}
function mImport(){
  return sheet('<p class="mt">'+t('importT')+'</p><p class="meta mb">'+t('importP')+'</p>'+
    '<div class="card"><p class="sub" style="margin:0">'+t('importCols')+'</p></div>'+
    '<input type="file" accept=".xlsx,.xls,.csv" onchange="doImport(this)" class="file" />'+
    '<button class="btn ghost" style="margin-top:10px" onclick="downloadTemplate()">'+t('template')+'</button>');
}
function mTransfer(){
  return sheet('<p class="mt">'+t('transferT')+'</p><p class="meta mb">'+t('transferP')+'</p>'+
    '<div class="card"><div class="grow-row"><span>'+t('tGear')+'</span><span class="n">'+D.items.length+'</span></div>'+
    '<div class="grow-row gap"><span>'+t('tTrips')+'</span><span class="n">'+D.trips.length+'</span></div>'+
    '<div class="grow-row gap"><span>'+t('tEvents')+'</span><span class="n">'+D.events.length+'</span></div></div>'+
    '<p class="sub">'+t('transferNote')+'</p>'+
    '<button class="btn" onclick="exportBackup()">'+t('saveBtn')+'</button>');
}
function mRestore(){
  return sheet('<p class="mt">'+t('restoreT')+'</p><p class="meta mb">'+t('restoreP')+'</p>'+
    '<div class="note warn">'+ico('u-warn')+'<span><p>'+t('restoreWarn')+'</p><p class="s">'+t('restoreWarnP',D.items.length)+'</p></span></div>'+
    '<input type="file" accept=".json,application/json" onchange="importBackup(this)" class="file" />');
}
function mPhoto(){
  if(!S.photo) return '';
  const it=item(S.photo.id);
  if(!it||!it.photos||!it.photos[S.photo.n]) return '';
  return '<div class="scrim center" onclick="if(event.target===this)closeModal()"><div class="dlg pad">'+
    '<img src="'+photoSrc(it.photos[S.photo.n])+'" class="full" />'+
    '<div class="row2"><button class="btn ghost" onclick="closeModal()">'+t('close')+'</button>'+
    '<button class="btn dangerghost" onclick="deletePhoto()">'+t('del')+'</button></div></div></div>';
}

/* ---------- действия ---------- */
function go(s){ S.screen=s; S.modal=null; if(s!=='search') S.q=''; if(['gear','trips','notif','history','settings'].indexOf(s)>=0) S.tab=s; render(); $('#view').scrollTop=0; }
function openItem(id){ S.id=id; S.screen='item'; S.modal=null; S.tab='gear'; render(); $('#view').scrollTop=0; }
function openTrip(id){ S.tripId=id; S.screen='trip'; S.modal=null; S.tab='trips'; render(); $('#view').scrollTop=0; }
function modal(k,id){ S.modal=k; if(k==='retire'){ S.id2=id; S.reason='rMelt'; S.reasonText=''; } render(); }
function closeModal(){ S.modal=null; render(); }
/* Назад: модалка -> экран -> вкладка. true = было куда вернуться (иначе корень). */
function goBack(){
  if(S.modal){ closeModal(); return true; }
  const s=S.screen;
  if(s==='item'||s==='search'||s==='add'){ go('gear'); return true; }
  if(s==='trip'||s==='tripNew'){ go('trips'); return true; }
  if(s!=='gear'&&s!=='ob'){ go('gear'); return true; }
  return false;
}
function setReason(r){ S.reason=r; render(); }
function onReasonText(el){ S.reasonText=el.value; const c=document.getElementById('rc'); if(c) c.textContent=el.value.length+' / 200';
  const b=document.querySelector('.btn.danger'); if(b) b.disabled=!el.value.trim(); }
function startManual(){ S.modal=null; S.form={type:'rope'}; go('add'); }
function startEdit(id){
  const it=item(id); if(!it) return;
  S.form={id:it.id,type:it.type,name:it.name,size:it.size||'',buy:it.buy||'',made:it.made||'',first:it.first||'',
    weight:it.weight||'',serial:it.serial||'',days:it.days||0,falls:it.falls||0,factor:it.factor||0,
    lastInsp:it.lastInsp||'',notes:it.notes||''};
  S.modal=null; go('add');
}
function cancelForm(){ const id=S.form.id; S.form={}; if(id) openItem(id); else go('gear'); }
function toggleNotif(k){ D.notif[k]=D.notif[k]?0:1; save(); render(); }
function setLang(v){ D.lang=v; save(); render(); }
function setTheme(v){ D.theme=v; save(); applyTheme(); render(); }
function toggleFilter(k,v){ const a=S.filters[k],i=a.indexOf(v); if(i<0) a.push(v); else a.splice(i,1); render(); }
function unfilter(k,v){ const a=S.filters[k]; a.splice(a.indexOf(v),1); render(); }
function clearFilters(){ S.filters={g:[],s:[]}; render(); }
function saveNotes(id,v){ const it=item(id); if(!it) return; it.notes=v; save(); }
function addPhoto(id,inp){
  const f=inp.files[0]; if(!f) return;
  const r=new FileReader();
  r.onload=function(e){
    const img=new Image();
    img.onload=function(){
      const max=1200; let w=img.width,h=img.height;
      if(w>max||h>max){ const k=max/Math.max(w,h); w=Math.round(w*k); h=Math.round(h*k); }
      const c=document.createElement('canvas'); c.width=w; c.height=h;
      c.getContext('2d').drawImage(img,0,0,w,h);
      const it=item(id); if(!it) return;
      it.photos=it.photos||[];
      const dataUrl=c.toDataURL('image/jpeg',0.72);
      const done=function(){ logEvent('i','evPhoto',it.name,it.id); save(); render(); toast(t('toPhoto')); };
      if(NATIVE&&FS){
        const name='ph_'+id+'_'+Date.now()+'.jpg';
        FS.writeFile({path:name,data:dataUrl.split(',')[1],directory:DIR}).then(function(res){
          PH[name]=CAP.convertFileSrc(res.uri); it.photos.push(name); done();
        }).catch(function(){ toast(t('toReadFail')); });
      } else { it.photos.push(dataUrl); done(); }
    };
    img.src=e.target.result;
  };
  r.readAsDataURL(f);
}
function openPhoto(id,n){ S.photo={id:id,n:n}; S.modal='photo'; render(); }
function deletePhoto(){
  const it=item(S.photo.id);
  if(it&&it.photos){
    const p=it.photos[S.photo.n];
    if(NATIVE&&FS&&isFile(p)){ FS.deleteFile({path:p,directory:DIR}).catch(function(){}); delete PH[p]; }
    it.photos.splice(S.photo.n,1);
  }
  save(); S.modal=null; render(); toast(t('toPhotoDel'));
}
function logEvent(k,tk,m,id,extra){ D.events.unshift(Object.assign({d:iso(today()),k:k,tk:tk,m:m||'',item:id||0},extra||{})); }
function mark(id,kind){
  const it=item(id);
  if(kind==='insp'){ it.lastInsp=iso(today()); if(it.status==='alert') it.status='ok'; logEvent('o','evInsp',it.name,id); toast(t('toInsp')); }
  else { it.falls++; it.status='alert'; logEvent('a','evFall',it.name,id); toast(t('toFall')); }
  hap(); save(); render();
}
function retire(){
  const it=item(S.id2);
  it.status='retired'; it.reason=S.reason; it.reasonText=(S.reason==='rOther')?S.reasonText.trim():'';
  D.trips.forEach(function(x){ delete x.picked[it.id]; });
  logEvent('a','evRetired',it.name+(it.reasonText?(' · '+it.reasonText):''),it.id,{rk:S.reason});
  S.modal=null; S.screen='gear'; save(); render(); toast(t('toRetired'));
}
function saveItem(){
  const f=S.form;
  if(f.id){ // редактирование существующего; срок пересчитается сам из дат/типа при рендере
    const it=item(f.id); if(!it) return;
    it.type=f.type||it.type; it.name=(f.name||'').trim(); it.size=f.size||'';
    it.buy=f.buy||''; it.made=f.made||''; it.first=f.first||''; it.weight=+f.weight||0; it.serial=(f.serial||'').trim();
    it.days=Math.max(0,Math.round(+f.days||0)); it.falls=Math.max(0,Math.round(+f.falls||0));
    it.factor=Math.max(0,+f.factor||0); it.lastInsp=f.lastInsp||''; it.notes=f.notes||'';
    hap(); logEvent('o','evEdited',it.name,it.id);
    S.form={}; save(); openItem(it.id); toast(t('toSaved'));
    return;
  }
  const it={id:++D.seq,type:f.type||'rope',name:f.name.trim(),size:f.size||'',buy:f.buy||iso(today()),made:f.made||'',first:f.first||'',
    days:0,falls:0,factor:0,weight:+f.weight||0,status:'ok',lastInsp:iso(today()),notes:f.notes||'',photos:[],serial:(f.serial||'').trim()};
  D.items.unshift(it); logEvent('i','evAdded',it.name,it.id);
  S.form={}; save(); openItem(it.id); toast(t('toAdded'));
}
function newTrip(){ S.trip={name:'',from:iso(today()),to:iso(new Date(Date.now()+2*864e5)),items:[]}; S.screen='tripNew'; S.modal=null; render(); }
function tripPick(id){ const a=S.trip.items,i=a.indexOf(id); if(i<0){a.push(id);hap();} else a.splice(i,1); render(); }
/* ---------- наборы (киты) ---------- */
function scSet(){
  const s=S.set,edit=!!s.id;
  return '<div class="top"><button class="icobtn" onclick="go(\'trips\')">'+ico('u-back')+'</button>'+
    '<p class="title sm">'+t(edit?'kitEdit':'kitNew')+'</p>'+
    (edit?('<button class="icobtn" onclick="delSet()">'+ico('u-trash')+'</button>'):'<span class="sp"></span>')+'</div><div class="body">'+
    '<div class="field"><label>'+t('fName')+' <span class="req">*</span></label><input value="'+esc(s.name)+'" oninput="S.set.name=this.value" placeholder="'+t('kitNamePh')+'" /></div>'+
    '<p class="label">'+t('gearSelected')+' '+s.items.length+' · '+wg(setW(s))+'</p>'+
    D.items.filter(i=>i.status!=='retired').map(function(i){
      const on=s.items.indexOf(i.id)>=0;
      return '<button class="item" onclick="setPick('+i.id+')"><span class="tick" style="color:'+(on?'var(--petrol)':'var(--line-2)')+'">'+ico(on?'u-check':'u-circle','check')+'</span>'+
      badge(i.type)+'<span class="grow"><span class="name">'+esc(i.name)+'</span><span class="meta">'+wg(i.weight)+'</span></span></button>';
    }).join('')+
    '<p class="hint">'+t('kitHint')+'</p></div>'+
    '<div class="foot"><button class="btn" '+((s.name.trim()&&s.items.length)?'':'disabled')+' onclick="saveSet()">'+t(edit?'editBtn':'kitCreate')+'</button></div>';
}
function newSet(){ S.set={name:'',items:[]}; S.screen='setNew'; S.modal=null; render(); }
function openSet(id){ const s=(D.sets||[]).find(y=>y.id===id); if(!s) return; S.set={id:s.id,name:s.name,items:s.items.slice()}; S.screen='setNew'; S.modal=null; render(); }
function setPick(id){ const a=S.set.items,i=a.indexOf(id); if(i<0){a.push(id);hap();} else a.splice(i,1); render(); }
function saveSet(){
  const s=S.set; if(!s.name.trim()||!s.items.length) return;
  if(!D.sets) D.sets=[];
  if(s.id){ const o=D.sets.find(y=>y.id===s.id); if(o){ o.name=s.name.trim(); o.items=s.items.slice(); } toast(t('toKitSaved')); }
  else { D.sets.push({id:++D.seq,name:s.name.trim(),items:s.items.slice()}); toast(t('toKitNew')); }
  save(); go('trips');
}
function delSet(){ if(!S.set.id) return; if(!confirm(t('kitDelQ'))) return; D.sets=(D.sets||[]).filter(y=>y.id!==S.set.id); save(); go('trips'); toast(t('toKitDel')); }
function applyKit(id){ id=+id; if(!id) return; const s=(D.sets||[]).find(y=>y.id===id); if(!s) return;
  S.trip.items=s.items.filter(function(i){ const it=item(i); return it&&it.status!=='retired'; }); hap(); render(); }
function saveAsKit(){ const x=D.trips.find(y=>y.id===S.tripId); if(!x||!x.items.length) return;
  if(!D.sets) D.sets=[]; D.sets.push({id:++D.seq,name:x.name,items:x.items.slice()}); save(); toast(t('toKitNew')); }
function saveTrip(){
  const x={id:++D.seq,name:S.trip.name.trim(),from:S.trip.from,to:S.trip.to,items:S.trip.items.slice(),picked:{},state:'draft'};
  D.trips.push(x); logEvent('i','evTripNew','',0,{mx:x.name}); save(); openTrip(x.id); toast(t('toTripNew'));
}
function delTrip(){
  const x=D.trips.find(y=>y.id===S.tripId); if(!x) return;
  if(x.state!=='draft'&&x.state!=='ready') return;
  if(!confirm(t('delTripQ'))) return;
  D.trips=D.trips.filter(y=>y.id!==x.id); save(); go('trips'); toast(t('toTripDel'));
}
function pick(id){
  const x=D.trips.find(y=>y.id===S.tripId); if(!x||x.state==='done') return;
  if(x.picked[id]) delete x.picked[id]; else { x.picked[id]=1; hap(); }
  const all=x.items.every(i=>x.picked[i]);
  if(x.state==='draft'&&all) x.state='ready'; else if(x.state==='ready'&&!all) x.state='draft';
  save(); render();
}
function depart(){
  const x=D.trips.find(y=>y.id===S.tripId);
  x.state='away'; x.picked={}; hap('Medium');
  logEvent('i','evDeparted','',0,{mx:x.name}); save(); render(); toast(t('toDeparted'));
}
function comeHome(){
  const x=D.trips.find(y=>y.id===S.tripId);
  const d=tripDays(x);
  x.items.forEach(function(id){ const i=item(id); if(i) i.days+=d; });
  x.state='done'; hap('Medium');
  logEvent('i','evFinished',d+' '+t('dShort'),0,{mx:x.name}); save(); go('trips'); toast(t('toHome',d));
}
function reset(){ if(confirm(t('resetQ'))){ D=NATIVE?blank():seed(); save(); applyTheme(); go('gear'); } }

/* ---------- импорт/экспорт ---------- */
function catFromText(s){
  const q=String(s||'').toLowerCase().trim(); if(!q) return 'other';
  const k=Object.keys(TYPES).find(k=>TYPES[k].ru.toLowerCase()===q||TYPES[k].en.toLowerCase()===q);
  return k||'other';
}
function normDate(v){
  if(!v) return '';
  if(v instanceof Date) return iso(v);
  const s=String(v).trim();
  const m=s.match(/^(\d{2})[.\/](\d{2})[.\/](\d{4})$/); if(m) return m[3]+'-'+m[2]+'-'+m[1];
  if(/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  return '';
}
function doImport(inp){
  const file=inp.files[0]; if(!file) return;
  if(typeof XLSX==='undefined'){ toast(t('toReadFail')); return; }
  const r=new FileReader();
  r.onload=function(e){
    try{
      const wb=XLSX.read(e.target.result,{type:'binary',cellDates:true});
      const rows=XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]],{defval:''});
      let n=0;
      rows.forEach(function(row){
        const g=function(keys){ const key=Object.keys(row).find(x=>keys.some(k=>x.toLowerCase().trim().indexOf(k)===0)); return key?row[key]:''; };
        const name=String(g(['назв','name'])||'').trim(); if(!name) return;
        D.items.unshift({id:++D.seq,type:catFromText(g(['катег','categ'])),name:name,size:String(g(['разм','size'])||''),
          buy:normDate(g(['дата покупки','purchase']))||iso(today()),made:normDate(g(['дата произ','manufact','made'])),
          days:0,falls:0,factor:0,weight:+String(g(['вес','weight'])).replace(/\D/g,'')||0,status:'ok',lastInsp:iso(today()),notes:'',photos:[]});
        n++;
      });
      if(n){ logEvent('i','evImport',n+' '+t('evPositions')+' '+file.name,0); save(); closeModal(); go('gear'); toast(t('toImported',n)); }
      else toast(t('toNoName'));
    }catch(err){ toast(t('toReadFail')); }
  };
  r.readAsBinaryString(file);
}
/* Бэкап всегда переносит фото как data:-URL, чтобы файл был самодостаточным
   и одинаково читался в вебе и на устройстве. На устройстве фото лежат файлами,
   поэтому читаем их из filesystem и встраиваем. */
function buildBackup(){
  if(!NATIVE||!FS) return Promise.resolve(D);
  const payload=JSON.parse(JSON.stringify(D)), jobs=[];
  payload.items.forEach(function(it){
    (it.photos||[]).forEach(function(p,n){
      if(!isFile(p)) return;
      jobs.push(FS.readFile({path:p,directory:DIR}).then(function(r){ it.photos[n]='data:image/jpeg;base64,'+r.data; }).catch(function(){ it.photos[n]=null; }));
    });
  });
  return Promise.all(jobs).then(function(){ payload.items.forEach(function(it){ if(it.photos) it.photos=it.photos.filter(Boolean); }); return payload; });
}
function exportBackup(){
  buildBackup().then(function(payload){
    const json=JSON.stringify({app:'climbkit',version:4,exported:new Date().toISOString(),data:payload});
    const fname='climbkit-'+iso(today())+'.json';
    if(NATIVE&&FS){
      FS.writeFile({path:fname,data:json,directory:'DOCUMENTS',encoding:'utf8',recursive:true})
        .then(function(){ closeModal(); toast(t('toFileSaved')); }).catch(function(){ toast(t('toReadFail')); });
      return;
    }
    const b=new Blob([json],{type:'application/json'});
    const a=document.createElement('a'); a.href=URL.createObjectURL(b); a.download=fname; a.click();
    closeModal(); toast(t('toFileSaved'));
  });
}
/* Обратная операция: встроенные в бэкап data:-URL пишем в файлы,
   в предмете оставляем имена. В вебе фото так и остаются data:-URL. */
function rehydratePhotos(d){
  if(!NATIVE||!FS) return Promise.resolve();
  const jobs=[];
  d.items.forEach(function(it){
    (it.photos||[]).forEach(function(p,n){
      if(typeof p!=='string'||p.indexOf('data:')!==0) return;
      const name='ph_'+(it.id||'x')+'_'+Date.now()+'_'+n+'.jpg';
      jobs.push(FS.writeFile({path:name,data:p.split(',')[1],directory:DIR})
        .then(function(){ return fileToUri(name); }).then(function(){ it.photos[n]=name; }).catch(function(){ it.photos[n]=null; }));
    });
  });
  return Promise.all(jobs).then(function(){ d.items.forEach(function(it){ if(it.photos) it.photos=it.photos.filter(Boolean); }); });
}
function importBackup(inp){
  const file=inp.files[0]; if(!file) return;
  const r=new FileReader();
  r.onload=function(e){
    let d;
    try{
      const p=JSON.parse(e.target.result);
      d=(p&&p.data)?p.data:p;
      if(!d||!Array.isArray(d.items)) return toast(t('toBadFile'));
    }catch(err){ return toast(t('toReadFail')); }
    d.notif=d.notif||{insp:1,trip:1,home:1}; d.trips=d.trips||[]; d.events=d.events||[]; d.sets=d.sets||[];
    d.seq=d.seq||1000; d.onboarded=true; d.lang=d.lang||'sys'; d.theme=d.theme||'sys';
    rehydratePhotos(d).then(function(){
      D=d; save(); applyTheme(); closeModal(); go('gear'); toast(t('toTransferred',d.items.length,d.trips.length));
    });
  };
  r.readAsText(file);
}
function csvHead(){ return lang()==='ru'
  ?'Название;Категория;Размер;Дата покупки;Дата производства;Вес'
  :'Name;Category;Size;Purchase date;Date of manufacture;Weight'; }
function downloadTemplate(){
  dl(csvHead()+'\nBeal Booster 9.8;'+tlabel('rope')+';70;12.08.2023;01.06.2022;4180\nPetzl Sirocco;'+tlabel('helmet')+';M/L;18.05.2024;01.02.2024;170\n','climbkit-template.csv');
}
function exportCsv(){
  const head=csvHead()+';'+t('days')+';'+t('falls')+';'+t('condition')+'\n';
  const body=D.items.map(i=>[i.name,tlabel(i.type),i.size,fmt(i.buy),i.made?fmt(i.made):'',i.weight,i.days,i.falls,t(SKEY[i.status])].join(';')).join('\n');
  dl(head+body,'climbkit-export.csv'); toast(t('toCsv'));
}
function dl(text,name){
  const b=new Blob(['\ufeff'+text],{type:'text/csv;charset=utf-8'});
  const a=document.createElement('a'); a.href=URL.createObjectURL(b); a.download=name; a.click();
}

/* ---------- рендер ---------- */
function render(keepFocus){
  const s=S.screen;
  const M={gear:scGear,item:scItem,trips:scTrips,trip:scTrip,tripNew:scTripNew,setNew:scSet,notif:scNotif,history:scHistory,settings:scSettings,search:scSearch,add:scAdd,ob:scOb};
  $('#view').className=(s==='ob')?'full':'';
  $('#view').innerHTML=(M[s]||scGear)();
  const MD={filters:mFilters,retire:mRetire,add:mAdd,import:mImport,transfer:mTransfer,restore:mRestore,photo:mPhoto};
  $('#modal').innerHTML=MD[S.modal]?MD[S.modal]():'';
  $('#toast').innerHTML=S.toast?('<div class="toast">'+esc(S.toast)+'</div>'):'';
  const nR=reminders().filter(r=>r.due).length;
  const tabs=[['gear','u-list','gear'],['trips','i-pack','trips'],['notif','u-bell','notif'],['history','u-clock','history'],['settings','u-gear','more']];
  $('#nav').innerHTML=tabs.map(function(x){
    const b=(x[0]==='notif'&&nR)?('<i class="navdot">'+nR+'</i>'):'';
    return '<button class="'+(S.tab===x[0]?'on':'')+'" title="'+t(x[2])+'" aria-label="'+t(x[2])+'" onclick="go(\''+x[0]+'\')"><span class="navico">'+ico(x[1])+b+'</span></button>';
  }).join('');
  $('#nav').style.display=(['search','ob','add','tripNew','setNew'].indexOf(s)>=0)?'none':'flex';
  document.documentElement.lang=lang();
  if(keepFocus&&$('#q')){ const el=$('#q'); el.focus(); el.setSelectionRange(el.value.length,el.value.length); }
}
if(window.matchMedia) try{ window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change',function(){ applyTheme(); }); }catch(e){}
/* Свайп от левого края вправо — назад (веб-жест, как системный на Android/iOS). */
(function(){
  let x0=null,y0=null,t0=0;
  addEventListener('touchstart',function(e){
    if(e.touches.length!==1||S.screen==='ob'){ x0=null; return; }
    const p=e.touches[0];
    if(p.clientX>28){ x0=null; return; }   // только у самого края
    x0=p.clientX; y0=p.clientY; t0=Date.now();
  },{passive:true});
  addEventListener('touchend',function(e){
    if(x0===null) return;
    const p=e.changedTouches[0], dx=p.clientX-x0, dy=Math.abs(p.clientY-y0);
    x0=null;
    if(dx>60&&dy<45&&Date.now()-t0<600) goBack();
  },{passive:true});
})();
/* Старт асинхронный: на устройстве D грузится из Preferences до первого рендера. */
function boot(){
  loadD().then(function(real){
    if(real) D=real;
    else if(NATIVE) D=blank();   // на устройстве чистая установка — без демо
    if(!D.sets) D.sets=[];       // совместимость со старыми сохранениями
    applyTheme();
    if(!D.onboarded) S.screen='ob';
    render();
    if(NATIVE){
      resolvePhotos();
      scheduleSync();
      if(LN) LN.addListener('localNotificationActionPerformed',function(a){
        const ex=a&&a.notification&&a.notification.extra; if(!ex) return;
        if(ex.kind==='insp') openItem(ex.ref); else openTrip(ex.ref);
      });
      if(App) App.addListener('backButton',function(){ if(!goBack()) App.exitApp(); });
    }
  });
}
boot();
