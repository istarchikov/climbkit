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
/* Фото на устройстве — это имя файла; в вебе и в бэкапах — data:-URL. */
const isFile=p=>typeof p==='string'&&p.indexOf('data:')!==0&&p.indexOf('blob:')!==0&&p.indexOf('http')!==0;
function photoSrc(p){ return !p?'':(isFile(p)?(PH[p]||''):p); }
function fileToUri(name){ return FS.getUri({path:name,directory:DIR}).then(function(r){ PH[name]=CAP.convertFileSrc(r.uri); }); }
function resolvePhotos(){
  if(!NATIVE||!FS) return Promise.resolve();
  const jobs=[];
  D.items.forEach(function(it){ (it.photos||[]).forEach(function(p){ if(isFile(p)&&!PH[p]) jobs.push(fileToUri(p).catch(function(){})); }); });
  return Promise.all(jobs).then(function(){ if(jobs.length) render(); });
}

/* ---------- демо-фото прототипа (заполняются tools/demophotos.js) ---------- */
var DEMO_SIROCCO="data:image/jpeg;base64,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";
var DEMO_REVERSO="data:image/jpeg;base64,/9j/2wBDAA0JCgwKCA0MCwwPDg0QFCIWFBISFCkdHxgiMSszMjArLy42PE1CNjlJOi4vQ1xESVBSV1dXNEFfZl5UZU1VV1P/2wBDAQ4PDxQSFCcWFidTNy83U1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1P/wAARCAJYAeADASIAAhEBAxEB/8QAGwABAQADAQEBAAAAAAAAAAAAAAEEBQYDBwL/xABAEAEAAgECAgQJCgUDBQEAAAAAAQIDBBEFEgYTITEVQVFUcZGSwdEUFiJSYYGCobGyMjZTk+EjNXIkMzRic/D/xAAWAQEBAQAAAAAAAAAAAAAAAAAAAQL/xAAWEQEBAQAAAAAAAAAAAAAAAAAAARH/2gAMAwEAAhEDEQA/APoSAqAAAAAgAAACAqAIAAAAAgKgAAAAgKgAAAAgKgAAKAAAgAAACAqAAAACAqAAAACAqAACAygEUEAAAAQFQBAAAAAEBUAAAAEBUAAAAEBUAABQAAEAAAAQFQAAAAQFQAAAAQFQAAQFQAAAZICKAgKgCAAAAAICoAAAAICoAAAAICoAACgAAIAAAAgKgAAAAgKgAAAAgKgAAgKgAAAAACAMpAQAAAAAQFQAAAAQFQAAAAQFQAAFAAAQAAABAVAAAABAVAAAABAVAABAVAAAAAAEAAAAAZICACAqAAAACAqAAAACAqAAAoAACAAAAICoAAAAICoAAAAICoAAICoAAAAAAgAAAAACAqADKQEAAAEBUAAAAEBUAABQAAEAAAAQFQAAAAQFQAAAAQFQAAQFQAAAAABAAAAAAEBUAAAAQBlAiCoAAAAICoAACgAAIAAAAgKgAAAAgKgAAAAgKgAAgKgAAAAACAAAAAAICoAAAAgAAAADJAQAQFQFAAAAAQAAABAVAAAABAVAAAABAVAABAVAAAAAAEAAAAAAQFQAAABAAAAAAEBUAGUgAAAAACAAAAICoAAAAICoAAAAICoAAAAgAAAAAIAAAAAAgKgAAACAAAAAAACAAAACAygABAAAAEBUAAAAEBUAAAAEBUAAAAQAAAAAEAAAAAAQFQAAABAAAAAAAAQAAABAVAEAAZIAoCAqAAAACAqAAAACAqAAAAx9ZrNPosM5dTlrjp9vj9EeM12rx6HR5NRl/hpG+3lnxQ+ccR1+fiOqtnz23mf4a+KseSCRHT6nplhraY0+lvkj617cv5drG+eeXzOntz8HLi4muo+eeXzOntz8D555fM6e3PwcuGDqPnnl8zp7c/A+eeXzOntz8HLi4Oo+eWXzOntz8D55ZfM6e3PwcuGGuo+eWXzOntz8D55ZfM6e3PwcuGGuo+eWXzOntz8D55ZfM6e3PwcuGGuo+eWXzOntz8D55ZfM6e3PwcuJhrp/nll8zp7c/BkafphhtaI1Glvjj61Lc35djkAw19P0mswa3D1umy1yU+zvj0x4nu+ZcP1+fh+prmwW2mP4q+K0eSX0XRarHrdJj1GL+G8b7eSfHCYuvcAUAAAAEAAAAQFQBAAAAAQBlIAoAACAqAAAACAqAAAAIAAA5fpvqJrg0uniey9pvb7u79Zce6zpxjnbR5fF9Ks/l/lyaxmuo6OdHsGq0savWRN63meTHE7RtHjlvfAHC/M6eufi8eiubreA4Y8eObVn17+9uEVrfAHC/M6eufieAOF+Z09c/FsgGt8AcL8zp65+J4A4X5nT1z8WyAa3wBwvzOnrn4p4A4X5nT1z8WzQGt8AcL8zp65+J4A4X5nT1z8WyAa3wDwvzOnrn4ngHhnmdPXPxbIBrfAPDPM6eufieAeF+Z09c/FsQGt8A8M8zp65+LR9Iuj+HS6WdXo4mlazHPjmd42nxw65qOlOXquBZo8eSa1j17+4HAuu6FZ5tg1OCZ7KWi9fv7/0hyLq+hOOdtXl8X0ax+f+FqR1QCNAgAAACAqAIAAAACAAAAAMkEFVAAAABAVAAAAEAAAAABAGj6YYus4Lz7f9rJW3u97hH0rjWHr+D6unfPVzMemO33PmqxK7DoRm30uqw/VvFvXG3udO4noZm5OKZMcz2ZMU+uJj/LtkpAEFVHE8V6TavJqr00eTqcNZ2iYiJm329rY9G+PZtbqPkmrmLZJiZpeI2328UmJrpQBQQAHN9JOPZtHqPkmkmK5IiJveY3238UNdwrpNq8eqpTWZOtw2naZmIia/b2Lia7UBFHM9Ns22m0uH615t6o297pnFdMs3PxTHjiezHjj1zM/4WJXPu56I4ur4Nz/1clre73OGfR+DYuo4PpKd09XEz6Z7feVIzQEaAQFQBAAAAAQAAAAABAVABkgCgICoAAAAgAAAAAIAAAAAlqxes1ntiY2l8szY5xZr4576Wms/c+qPnPSDD1PHNXXy35vX2+9YlOj2bqeOaW3lvy+uNve+ivlmHJOHPjyR30tFo+6X1KtotWLR2xMbwUigIr5S2vRf+YNL+L9stU2vRf8AmDS/i/bLTL6AAy0AA+f9J/5g1X4f2w1Ta9J/5g1X4f2w1TTL6qIMtD550gy9dxvVW8l+X1Rt7n0K1orWbT2REby+X5sk5s+TJPfe02n75WJTDjnLmpjjvvaKx976hWIrWKx3RG0PnnAMXXcb0tfJfm9Xb7n0MpFQEAAAAAQAAAAABAVAAAAEAZSAKAACAAAAAAgAAAAACAqAA4npnh5OK48kR2ZMUeuJn/DtnMdNsO+m0ub6t5r6439xErkH0ng2br+D6TJvvPVxE+mOyf0fNnc9EM3WcFin9LJavv8AetSN4AjT5U2vRj+YNL+L9stU2vRj+YNL+L9stMvoADLQIA4DpP8AzBqvw/thqm16T/zBqfw/thqmmX1QEZaYfGM3UcI1V99p6uYj0z2e984dx0uy9Xwaaf1Mla+/3OHWM1v+h2Ln4pkyT3Y8c+uZj/LtHM9C8W2m1Ob614r6o397pirABAEAAAAAAQFQAAABAAAABRkiCKAAAACAAAAAAICoAAAAICtP0qw9bwLNO2845rePXt+ktux+I4uv4dqcXfN8doj07CPmTquhOb/y8M/+t4/OJ9zlW76I5ur41FP6uO1ff7mqkd0Ay0+VNr0Y/mDS/i/bLVNr0Y/mDTfi/bLTLvwGWgEBwPSf+YNT+H9sNU2vSf8A3/U/h/bDVNMvqYDKuV6a5v8AxcMT9a0/lEe9yzd9LcvWcZmn9PHWvv8Ae0jSO86L4uq4Hinback2tPr29zbsbh+LqOH6fF46Y6xPp2ZDKgAAAAICoAAAAgAAAAoAgKgAyQEUEAAAAAAQFQAAAAQFQAAAAAfMNbi6jW58P1Mlq+qXtwfN1HF9Lk7ojJET6J7J/Vk9JsXVcdz9nZfa0ffHx3auszW0TE7TE7w0y+pj8YMkZsGPJHdesWj74ftlp8svWaXmto2tWdphtei9Ztx7TzEbxWLTP2fRmPe6TiXRzS67POat7Yclu23LG8T9uzJ4VwfTcLrbqua2S3Za9u/0fZC6zjYoCKAA4LpRWa8e1EzG0Wisx9v0Yj3NVWs3vFaxva07RD6FxXhGm4pWvW81cleyt69/oYvDejml0OeM1r2zZK9teaNoj7dl1MboR+M+SMODJknupWbT90Ir53xjN1/FtVffeJyTEeiOyP0eWixdfrcGL6+StfXLxtM2tMz2zM7y2nRnF1vHMHkpvafuj47NI74BlQEBUAAAAQAAAAUAQFQAAAAAZACKAAAgKgAAAAgKgAAAAACAAAOP6aYuXW6fN9fHNfVP+XNu46WaSdRwvraRvbBbm/D4/d6nDtRmvoXR7N1/BNNO+81ryT93Y2LiOjfGK8Py2waiZjT5J35vqT5fQ7XHkplpF8d63pPdas7xKK/QCAAAIAAANd0gzRg4JqZ37bV5I+/sZ+TJTFSb5L1pSO+1p2iHFdJOMV4hlrg08zOnxzvzfXny+hRo3R9DMXNrNRl+pSK+uf8ADnHb9FNJOn4X1t42tntzfh8Xv9ao3iAyoAAIAAAAKAICoAAAAAAgAADJBEVUAAAAEBUAAAAAAQAAABAVAES9a3pNbRE1tG0xPjhwHHOE34Zqp5YmdPef9O3un7X0B558GLU4bYs1Ivjt31lR8wfvHmy4v+3kvTf6tph0mv6J3i030OWJr/Tydkx6JajJwPiWOdp0mSf+O0/oqMb5ZqvOc39yU+W6rznN/cl7+B+I+Z5vZPA/EfM83sg8Pluq85zf3JPluq85zf3Je/gfiPmeb2TwPxHzPN7IPD5bqvOc39yT5bqvOc39yXv4H4j5nm9k8D8R8zzeyDw+W6rznN/ck+WarznN/cl7+B+I+Z5vZPA/EPM83sgxMmbLl/7mS99vrWmX4bHHwPiWSdo0l4/5bR+rbaDonebRfXZYiv8ATx9sz6ZBq+CcKvxLVRvExp6T/qW90fa76ta0pFaxEVrG0RHih+MGDFpsNcWGkUx17oh6IoIIAAACgCAqAAAAAACAAAAACAMkBFAQFQAAAAABAAAAEBUAQAAAAEAAAAAAQFQAAABAAAABQAAEAAAAAAQFQAAABAAAAEBlICKAAAACAAAAICoAgAAAAIAAAAAAgKgAAACAAAACgAAIAAAAAAgKgAAACAAAAICoAAAMkBFBAAAAEBUAQAAAAEAAAAAAQFQAAABAAAABQAAEAAAAAAQFQAAABAAAAABAAAAEAAAZICKAgKgCAAAAAgAAAAACAqAAAAIAAAAKAAAgAAAAACAqAAAAIAAAAACAAAAgAAAAACAykBAAAAAEAAAAAAQFQAAABAAAABQAAEAAAAAAQFQAAABAAAAAAQAAAEAAAAAAQFQAAAZICAIAAAAAAgKgAAACAAAACgAAIAAAAAAgKgAAACAAAAAAgAAAIAAAAAAgKgAAAAAAgMkBAAABAVAAAABAVAAAUAABAAAAAAEBUAAAAQAAAAAEAAABAAAAAAEBUAAAAAAEBUAAAGSCIKgAAAAgKgAAKAAAgAAAAACAqAAAAIAAAAACAAAAgAAAAACAqAAAAAACAqAAAICAAAMkBFAQFQAAAAFAQAAAAABjX1+jx3ml9VgravZNbZIiYBko8Ka7SZLRXHqsN7T3RXJEvcAAAQAB45dVp8N4plz4sd7d1bXiJkHsDzzZ8WCkWzZaY6zO0Te0RG/3g9Bi+EtD55p/7tfi9sWbFmjfFlpkiPHW0SD9gACAAAAAAICoAAAAAAICoAAAgIAAAAACAMpARQAAAAQUAAAAAQFQAHDZNHj1/S7Lpss2rS+S281nt7Imfc7lweox6nL0rzU0d+TPOS3Lbfbbsnf8twrM430c0+g4ffU4M2SZpMb1yTE77zt2bRHlbfoxq8mo4NFs9t5xWmnNafFG09vrarLwLjOt2pq9ZWccTvta8z+WzN4xp68K6L20+CZ2mYra3jnee0R7ZelPDseWaROXJETtz0r2fqz68S02TQX1mPJz4aRMzNY7Y28W3lcvwfURh4byeBcuqjJvzZYpMxbt9DJ6LafUY9RqsOo0uWmnyU35cuOdp7e7tjySDD4fxyuPjebV6vLkvimtq07N9omYmOzxdkOh1nSDRaPVXwZpyc9Nt9q7x2xv72h4Bp8OXpHq8eTDjvjrF9q2rExH0o8TecbycP0OC2o1GlwZc9+ykWpEzafhAPOvSjh1rRWJy7zO38DV9Kv990f/AAr+6To9widbn+X6vHWuLm3pjiu0Wn0eSDpV/vuj/wCFf3SDrmg6Z/7Ti/8AvH7bN+5/pn/tOL/7x+2wrF4X0b0es4dg1GTJni+Su8xW0bd/oa/U4J4Hx/DTS5bXj6M9vftM9tZfvFwviU8Hpq9Pq7zTl5uqre0TEfY9ui+DR6rVzlz3vfV0nmrW89k/b9sqjqdZrMGhwTl1GSKU7o8sz5Ia3B0n4dmyxSZyYt52i167R+UtR0uyWvxbT4Zi1qVpExSPHMzO+3qg4ne+t0UYcXA8+G9ZjkvGOez7O5B0fEeKafh1cds/Py5N9prG8MrHlplwVzVtvS1YtE/Y0PyPNreiVcWfHeuoxVmaxeJifozO3Z6Oxr9Nxbq+imXDzf6tbdVX0W7f03B0XD+LabiOS9NPzzyRvMzXaGNquknD9NmnFzXyzWdpnHXeI+/dhaDBbh/RPPnr9HNmpN9/HET2R+Xb97W8Bz/J9PkmOF5NZNrbTkrTeIjbu7pB1uh1+n4hinJpsnNEdkxPZMemGLk49ocWfNhyXvW2Hfm3r37eKGm4Di1OHj17xo8+n0+WLfRtSYivjiN9nhg02PV9MMuPNWLY+tvaaz49twdFpeN6PU6TLqYm+PFina05I2/TvYnzq4fz7cufb63JG36v3xrhMZuFWw6HFTHaMkZOSsRWLTtt/wDvQ0VeJZ9HpY0fEOHUthiOXa1ZpM/f7wdjptTi1WCubBeL47d0w1+t6QaHR5ZxWvbJevZaMcb7fe8NFrNJHANVl4bjnDOOtpmkzvNbbd7B6JaLBmxZ9Rmx1yZIvyxzxvt2bg3fD+L6TiMzXBeYvHbNLxtLPcbxvFThvH9Pl0lYxzaK35a9kb7zH5uxBUAUAEBAAAAAAQAAAABkgIoIKAAAAAICoAAAAgA5rT8L1lOlc6y2HbT8955+aO6azEdm+7pQBjcR0dNfocumvO0XjsnyT4pZIDk9Lh4/wvDbS4MFMuPeeW28Tt6O2PzbbgOi1mlwWtrtRfJkv3UtebRSPi2oDkbcO4toOM59RosMXjJNuW28bbTO/jl+OLcK4vruI3zdRz0idqb3rtEeTbd2II5avzopWK1pWtYjaIjqtoevHeGazWcT0ubDh56UpWLzzVjad5me+XRgDUdJtFqNdw/Hi02PrLxli0xzRHZtPl9LbgrD4PgyabhWnw5q8uSldrRvE7dv2NFxDgms0/Fq6vheOJiZ59otEcs+OO2e6XUgjRcc4Tm4liwanDXqtVjr20taPTtv5YliZY6Ra2lMFscYOWe3LW3LM+mYn9HUIDy0uK2DTY8d8lst6xtN7d9pcrqejeptxe0Y8f8A0dskTzRaOys9/Zvv2drrwHlmwY82lvp7R/p2rybR4o2c1ptJxrg18mPSYqajDed4me707bxMS6oBpuCaPiOPLk1HEM95m++2Hn3iJnx+SGNouGavF0my6u+LbBa15i/NHj7uzfd0QDA4vpM+s0fJpc98OWs7xNbTEW+ydmm5uPxo50d9JTJE15OstMTO3p32dQgNRwPg86HQZcepmLXz/wAdY7ojbbb85azHw3i3B9Rknh8Vz4b+Kdvu3jy+h1QDmtDwjW6viVddxWYiazE1pvHbt3d3dDpQAEAAAAABAAAAAAAAAGQAKAAAgKgAAACAAAAAAgAAAIAD8ZstcOPmmJnt2iI75nyMaNRaNXbra2x1ri5piZ3jv7+wGYMemp3vSL4r44v/AAzO3b8H4jXRy1v1OTktPLFuzv8AQDLGN8rrFcnWUtS2Pbevfvv3bP1TPNssY8mO2O0xvXeYnf1A90fm1605eaduado+2X41WWcOnvkiN5iOyPtB6jGnT5orzV1F5y/+38M/c/GTLNb6jmtaK15NuWe7cRmDFyavktk2xXtGKfpzG3Z2LGp5p5Zx2pzVm1Jnbt2FZIw9NqrThw9ZS8ReIjnnbtl511dua+GtonLbLatZt3VjcRsEY8zOK+KnNkvaa2nvj6Xd3rosl82lpfJH0pjv8oPcAAQAAAAAEAAAAAAAAAAAAAZAIKqAAAAIAAAAACAAAAgAAAADx1OK2XHHJMc9bRau/dvDxvgy58mSckVpW2KaRETvMTuzEBh4dNaMmOZw4qcnfaJ339HkWunvGmw4+zmpki09vi5t2WCMXNpr5Mma0TEc0U5ZnyxMy/VaZcmopky1rSMcTtEW33mWQCjzz4ozYb45naLR3+R6AMWY1d6dXMUpM9k5It+kPzl0179ftt9Pk23nyd7MQRjWwXnHqo7N8u/L6tlvhta+KY22pS1Z++IZAKw6Yc84sGLJFIrjmszaJ3327o2fqukicWal9om+SbRMd8eSWUCMamPNOTBfLy70i0WmJ799tpfrSUvi09cd4iJr2RMTvvD2AAAAABAAAAAAAAAAAAAAAAAHuAKCAAAAAAgAAAIAAAAAAgKgAAAAAAgKgAACAgAAAAAIAAAAAAAAAAAAAAAAAAAAA9gBQAAQAAAEAAAAAAQFQAAAAAAQFQAABAQAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAewgKAACAAAAAAICoAAAAAAICoAAAAgIAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPUEFVAAAABAVAAAAAABAVAAAAEBAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB6ACgICoAAAAAAICoAAAAgIAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPRAFAAAAAAEAAAAARABQAQABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf/Z";

/* ---------- состояние ---------- */
let D=load()||seed();
let S={tab:'gear',screen:'gear',id:null,id2:null,tripId:null,modal:null,q:'',
filters:{g:[],s:[]},reason:'rMelt',reasonText:'',ob:0,obSkip:false,photo:null,
form:{},trip:{name:'',from:'',to:'',items:[]},toast:null};

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
      it(1,'rope','Beal Booster 9.8','70 '+T.mon,d(2023,8,12),d(2022,6,1),96,41,1.4,4180,'alert',d(2026,3,2),{serial:'22F4180',notes:T.demoNote1}),
      it(2,'harness','Petzl Sama','M',d(2019,4,6),d(2018,11,1),210,96,0.9,340,'warn',d(2026,3,2)),
      it(3,'helmet','Petzl Sirocco','M/L',d(2024,5,18),d(2024,2,1),64,0,0,170,'ok',d(2026,3,2),{photos:[DEMO_SIROCCO].filter(Boolean)}),
      it(4,'draw','Petzl Djinn × 12','12 '+T.pcs,d(2025,3,4),d(2025,1,1),54,38,1.1,1190,'ok',d(2026,3,2)),
      it(5,'biner','Petzl Attache × 4','4 '+T.pcs,d(2024,2,10),'',62,9,0.8,224,'ok',d(2026,2,18)),
      it(6,'cam','Camp Ballnuts 0.4–3','6 '+T.pcs,d(2024,5,2),'',31,3,1.2,1480,'ok',d(2026,2,18)),
      it(7,'belay','Petzl Reverso','',d(2023,1,20),'',96,0,0,57,'ok',d(2025,6,1),{photos:[DEMO_REVERSO].filter(Boolean)}),
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
    ],seq:100};
}
/* Пустой старт для устройства: демо-данные — только для веб-прототипа. */
function blank(){ return {onboarded:false,lang:'sys',theme:'sys',notif:{insp:1,trip:1,home:1},items:[],trips:[],events:[],seq:100}; }
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
function ageOf(it){ return it.buy?Math.max(0,yb(parse(it.buy),today())):0; }
function storeOf(it){ return (it.made&&it.buy)?Math.max(0,yb(parse(it.made),parse(it.buy))):0; }
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
  else body=list.map(row).join('');
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
    '<div class="track"><span class="'+cls+'" style="width:'+pct+'%"></span></div>'+
    '<div class="slegend"><span>'+t('bought')+' '+fmt(it.buy)+'</span><span>'+L[0]+' '+t('yearsShort')+'</span></div></div>'+
    '<div class="gauge"><div class="grow-row"><span>'+t('lifeStore')+'</span><span class="n">'+ageText(st)+' / '+L[1]+'</span></div>'+
    '<div class="track"><span style="width:'+Math.min(100,st/L[1]*100)+'%"></span></div>'+
    '<div class="slegend"><span>'+(it.made?(t('madeOn')+' '+fmt(it.made)):t('noMade'))+'</span><span>'+t('totalMax')+' '+(L[0]+L[1])+'</span></div></div>';
  else card='<p class="lead">'+t('noLifeT')+' «'+t(GKEY[T.g])+'»</p><p class="sub">'+t('noLifeP')+'</p>';
  return '<div class="top"><button class="icobtn" onclick="go(\'gear\')">'+ico('u-back')+'</button>'+
    '<p class="title sm">'+esc(tlabel(it.type))+'</p><span class="sp"></span></div><div class="body">'+
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
function scTrips(){
  const sorted=D.trips.slice().sort((a,b)=>((a.state==='done')-(b.state==='done'))||String(a.from).localeCompare(String(b.from)));
  return '<div class="top"><div><p class="title">'+t('trips')+'</p><p class="meta">'+D.trips.filter(x=>x.state!=='done').length+' '+t('tripsActive')+'</p></div>'+
    '<div class="acts"><button class="icobtn" onclick="newTrip()">'+ico('u-plus')+'</button></div></div><div class="body">'+
    (sorted.length?sorted.map(function(x){
      const st=TSTATE[x.state];
      return '<button class="item" onclick="openTrip('+x.id+')">'+badge('pack',x.state==='done')+
      '<span class="grow"><span class="name">'+esc(x.name)+'</span><span class="meta">'+fmtShort(x.from)+' — '+fmtShort(x.to)+' · '+x.items.length+' '+t('posShort')+' · '+(tripW(x)/1000).toFixed(1)+' '+t('kg')+'</span></span>'+
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
    (canDel?('<button class="icobtn" onclick="delTrip()">'+ico('u-trash')+'</button>'):'<span class="sp"></span>')+'</div><div class="body">'+
    '<div class="card ring-card"><svg class="ring" viewBox="0 0 36 36"><circle cx="18" cy="18" r="15.5" fill="none" class="rbg" stroke-width="4"/>'+
    '<circle cx="18" cy="18" r="15.5" fill="none" stroke="'+(all?'var(--petrol)':'var(--slate)')+'" stroke-width="4" stroke-linecap="round" stroke-dasharray="'+C+'" stroke-dashoffset="'+off+'" transform="rotate(-90 18 18)"/></svg>'+
    '<div><p class="hname">'+t('markedOf',done,list.length)+'</p><p class="meta">'+(w/1000).toFixed(1)+' '+t('kg')+' · '+t('totalW')+' '+(tripW(x)/1000).toFixed(1)+' '+t('kg')+'</p></div></div>'+
    (dead.length?('<div class="note warn">'+ico('u-warn')+'<span><p>'+t('deadWarn')+'</p><p class="s">'+dead.map(i=>esc(i.name)).join(', ')+'</p></span></div>'):'')+
    list.map(function(i){
      return '<button class="item" onclick="pick('+i.id+')" '+(x.state==='done'?'disabled':'')+'>'+
      '<span class="tick" style="color:'+(x.picked[i.id]?'var(--petrol)':'var(--line-2)')+'">'+ico(x.picked[i.id]?'u-check':'u-circle','check')+'</span>'+
      badge(i.type,i.status==='retired')+
      '<span class="grow"><span class="name"'+(i.status==='retired'?' style="color:var(--clay)"':'')+'>'+esc(i.name)+'</span>'+
      '<span class="meta">'+i.weight+' g</span></span></button>';
    }).join('')+
    (hint?('<p class="hint">'+hint+'</p>'):'')+'</div><div class="foot">'+btn+'</div>';
}

function scTripNew(){
  const x=S.trip;
  return '<div class="top"><button class="icobtn" onclick="go(\'trips\')">'+ico('u-back')+'</button>'+
    '<p class="title sm">'+t('tripNewT')+'</p><span class="sp"></span></div><div class="body">'+
    '<div class="field"><label>'+t('fName')+' <span class="req">*</span></label><input value="'+esc(x.name)+'" oninput="S.trip.name=this.value" placeholder="'+t('tripName')+'" /></div>'+
    '<div class="two"><div class="field"><label>'+t('start')+'</label><input type="date" value="'+x.from+'" oninput="S.trip.from=this.value" /></div>'+
    '<div class="field"><label>'+t('end')+'</label><input type="date" value="'+x.to+'" oninput="S.trip.to=this.value" /></div></div>'+
    '<p class="label">'+t('gearSelected')+' '+x.items.length+'</p>'+
    D.items.filter(i=>i.status!=='retired').map(function(i){
      const on=x.items.indexOf(i.id)>=0;
      return '<button class="item" onclick="tripPick('+i.id+')"><span class="tick" style="color:'+(on?'var(--petrol)':'var(--line-2)')+'">'+ico(on?'u-check':'u-circle','check')+'</span>'+
      badge(i.type)+'<span class="grow"><span class="name">'+esc(i.name)+'</span><span class="meta">'+i.weight+' g</span></span></button>';
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
  return '<div class="top"><button class="icobtn" onclick="go(\'gear\')">'+ico('u-back')+'</button>'+
    '<p class="title sm">'+t('addTitle')+'</p><span class="sp"></span></div><div class="body">'+
    '<div class="field"><label>'+t('fName')+' <span class="req">*</span></label><input value="'+esc(f.name||'')+'" oninput="S.form.name=this.value" placeholder="Beal Booster 9.8" /></div>'+
    '<div class="field"><label>'+t('category')+'</label><select onchange="setFormType(this.value)">'+opts+'</select></div>'+lifeHint(type)+
    '<div class="field"><label>'+t('fSize')+'</label><input value="'+esc(f.size||'')+'" oninput="S.form.size=this.value" /></div>'+
    '<div class="two"><div class="field"><label>'+t('fBuy')+'</label><input type="date" value="'+(f.buy||'')+'" oninput="S.form.buy=this.value" /></div>'+
    '<div class="field"><label>'+t('fMade')+'</label><input type="date" value="'+(f.made||'')+'" oninput="S.form.made=this.value" /></div></div>'+
    '<div class="field"><label>'+t('fWeight')+'</label><input type="number" value="'+(f.weight||'')+'" oninput="S.form.weight=this.value" /></div>'+
    '<div class="field"><label>'+t('notes')+'</label><textarea rows="2" maxlength="500" placeholder="'+t('optional')+'" oninput="S.form.notes=this.value">'+esc(f.notes||'')+'</textarea></div></div>'+
    '<div class="foot"><button class="btn" '+((f.name||'').trim()?'':'disabled')+' onclick="saveItem()">'+t('addBtn')+'</button></div>';
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
  save(); render();
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
  const it={id:++D.seq,type:f.type||'rope',name:f.name.trim(),size:f.size||'',buy:f.buy||iso(today()),made:f.made||'',
    days:0,falls:0,factor:0,weight:+f.weight||0,status:'ok',lastInsp:iso(today()),notes:f.notes||'',photos:[]};
  D.items.unshift(it); logEvent('i','evAdded',it.name,it.id);
  S.form={}; save(); openItem(it.id); toast(t('toAdded'));
}
function newTrip(){ S.trip={name:'',from:iso(today()),to:iso(new Date(Date.now()+2*864e5)),items:[]}; S.screen='tripNew'; S.modal=null; render(); }
function tripPick(id){ const a=S.trip.items,i=a.indexOf(id); if(i<0) a.push(id); else a.splice(i,1); render(); }
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
  if(x.picked[id]) delete x.picked[id]; else x.picked[id]=1;
  const all=x.items.every(i=>x.picked[i]);
  if(x.state==='draft'&&all) x.state='ready'; else if(x.state==='ready'&&!all) x.state='draft';
  save(); render();
}
function depart(){
  const x=D.trips.find(y=>y.id===S.tripId);
  x.state='away'; x.picked={};
  logEvent('i','evDeparted','',0,{mx:x.name}); save(); render(); toast(t('toDeparted'));
}
function comeHome(){
  const x=D.trips.find(y=>y.id===S.tripId);
  const d=tripDays(x);
  x.items.forEach(function(id){ const i=item(id); if(i) i.days+=d; });
  x.state='done';
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
    d.notif=d.notif||{insp:1,trip:1,home:1}; d.trips=d.trips||[]; d.events=d.events||[];
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
  const M={gear:scGear,item:scItem,trips:scTrips,trip:scTrip,tripNew:scTripNew,notif:scNotif,history:scHistory,settings:scSettings,search:scSearch,add:scAdd,ob:scOb};
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
  $('#nav').style.display=(['search','ob','add','tripNew'].indexOf(s)>=0)?'none':'flex';
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
