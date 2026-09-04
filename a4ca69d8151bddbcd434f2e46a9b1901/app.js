
const API='https://api.pokemontcg.io/v2/cards';
let cards=[], selected=null, chart=null, news=[];
const $=x=>document.querySelector(x);
const eur=n=>Number.isFinite(+n)?new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR'}).format(n):'—';
const usd=n=>Number.isFinite(+n)?new Intl.NumberFormat('fr-FR',{style:'currency',currency:'USD'}).format(n):'—';
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const cm=c=>c?.cardmarket?.prices?.trendPrice??null;
const watch=()=>JSON.parse(localStorage.getItem('pp-watch')||'[]');
function setWatch(a){localStorage.setItem('pp-watch',JSON.stringify(a));$('#watchCount').textContent=a.length}
function watched(id){return watch().includes(id)}
function toggleWatch(id){let a=watch();a=watched(id)?a.filter(x=>x!==id):[...a,id];setWatch(a);renderCards();if(selected?.id===id)$('#watch').textContent=watched(id)?'★ Retirer de la watchlist':'☆ Watchlist'}
function pct(a,b){return Number.isFinite(+a)&&Number.isFinite(+b)&&+b?((+a-+b)/+b)*100:null}
function signal(c){let p=c.cardmarket?.prices||{},x=pct(p.avg7,p.avg30);if(!Number.isFinite(x))return ['NEUTRE','Pas assez de données'];return x>10?['HAUSSIER',`+${x.toFixed(1)}% 7j vs 30j`]:x<-10?['BAISSIER',`${x.toFixed(1)}% 7j vs 30j`]:['STABLE',`${x>=0?'+':''}${x.toFixed(1)}%`]}
async function search(q){
 if(!q){return}
 $('#cards').innerHTML='<div class="empty">Analyse des cartes et des prix…</div>';
 try{let r=await fetch(`${API}?q=${encodeURIComponent(`name:"*${q.replace(/"/g,'')}*"`) }&pageSize=25&orderBy=-set.releaseDate`);if(!r.ok)throw Error(r.status);let j=await r.json();cards=j.data||[];$('#marketCount').textContent=j.totalCount??cards.length;$('#feedState').textContent='● marché synchronisé '+new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});renderCards()}catch(e){$('#cards').innerHTML=`<div class="empty">API indisponible (${e.message}). Pour une utilisation publique à grande échelle, configure le proxy serverless prévu dans /api.</div>`}}
function renderCards(){
 let a=[...cards];if($('#sort').value==='name')a.sort((x,y)=>x.name.localeCompare(y.name));else a.sort((x,y)=>(cm(y)||-1)-(cm(x)||-1));
 $('#cards').innerHTML=a.map(c=>`<article class="card" data-id="${esc(c.id)}"><button class="star" data-star="${esc(c.id)}">${watched(c.id)?'★':'☆'}</button><img loading="lazy" src="${esc(c.images?.small)}" alt="${esc(c.name)}"><div class="cb"><h3>${esc(c.name)}</h3><p>${esc(c.set?.name)} • ${esc(c.number)} • ${esc(c.rarity||'—')}</p><div class="price"><div><small>CM TREND</small><br><b>${eur(cm(c))}</b></div><small>${esc(c.cardmarket?.updatedAt||'')}</small></div></div></article>`).join('')||'<div class="empty">Aucun résultat.</div>'}
function tcg(c){let p=c?.tcgplayer?.prices||{},v=Object.values(p).map(x=>x?.market).filter(x=>Number.isFinite(+x)).map(Number);return v.length?Math.max(...v):null}
function localHist(id){return JSON.parse(localStorage.getItem('pp-h-'+id)||'[]')}
function snapshot(c){let p=cm(c);if(!Number.isFinite(+p))return;let h=localHist(c.id);h.push({t:new Date().toISOString(),p:+p});localStorage.setItem('pp-h-'+c.id,JSON.stringify(h.slice(-180)));draw(c)}
function draw(c){
 let p=c.cardmarket?.prices||{},pts=[];if(Number.isFinite(+p.avg30))pts.push(['30j',+p.avg30]);if(Number.isFinite(+p.avg7))pts.push(['7j',+p.avg7]);if(Number.isFinite(+p.avg1))pts.push(['1j',+p.avg1]);localHist(c.id).forEach(x=>pts.push([new Date(x.t).toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit'}),x.p]));if(Number.isFinite(+p.trendPrice))pts.push(['Trend',+p.trendPrice]);
 if(chart)chart.destroy();chart=new Chart($('#chart'),{type:'line',data:{labels:pts.map(x=>x[0]),datasets:[{data:pts.map(x=>x[1]),label:'EUR',tension:.25,pointRadius:4}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:x=>eur(x.parsed.y)}}},scales:{y:{ticks:{callback:v=>eur(v)}},x:{grid:{display:false}}}}})
}
function openCard(id){
 selected=cards.find(c=>c.id===id);if(!selected)return;let c=selected,p=c.cardmarket?.prices||[],s=signal(c);
 $('#heroImg').src=c.images?.large||c.images?.small;$('#dSet').textContent=`${c.set?.name||''} • ${c.number||''}`;$('#dName').textContent=c.name;$('#dBadges').innerHTML=`<span class="impact">${esc(c.rarity||'Rareté inconnue')}</span>`;$('#cmTrend').textContent=eur(p.trendPrice);$('#cm30').textContent=eur(p.avg30);$('#tcg').textContent=usd(tcg(c));$('#sig').textContent=s[0];$('#summary').textContent=summary(c,s);$('#watch').textContent=watched(c.id)?'★ Retirer de la watchlist':'☆ Watchlist';draw(c);$('#modal').classList.remove('hidden')}
function summary(c,s){let p=c.cardmarket?.prices||{},parts=[];if(p.trendPrice!=null)parts.push(`Cardmarket affiche une tendance à ${eur(p.trendPrice)}.`);if(p.avg30!=null)parts.push(`La moyenne 30 jours est ${eur(p.avg30)}.`);if(tcg(c)!=null)parts.push(`Le marché TCGplayer disponible dans la réponse est autour de ${usd(tcg(c))}.`);parts.push(`Signal mécanique : ${s[0]} (${s[1]}).`);parts.push('Le signal news ci-dessous sert de contexte et ne remplace pas une observation de ventes réalisées.');return parts.join(' ')}
async function loadNews(){
 const rss=['https://www.pokemon.com/us/pokemon-news/','https://www.pokebeach.com/category/pokemon-tcg-news','https://www.pokemon.com/uk/news/'];
 $('#news').innerHTML='<div class="empty">Collecte des flux…</div>';
 try{let r=await fetch('./api/news.json');if(r.ok){news=await r.json();renderNews();return}}catch(e){}
 // Fallback: curated current links, deliberately labelled as external discovery.
 news=[
 {source:'Pokémon.com',title:'Pokémon TCG product releases — September 2026',date:'Récent',summary:'Surveille les sorties officielles du mois, notamment les produits liés au 30e anniversaire.',url:'https://www.pokemon.com/us/news/check-out-every-pokemon-tcg-product-release-in-september-2026',impact:'RELEASE'},
 {source:'Pokémon.com',title:'Mega Evolution — Delta Reign arrives November 6, 2026',date:'Récent',summary:'Annonce officielle d’une prochaine expansion avec Mega Rayquaza ex comme vedette.',url:'https://www.pokemon.com/uk/news/the-pokemon-tcg-mega-evolution-delta-reign-expansion-arrives-november-6-2026',impact:'RELEASE'},
 {source:'PokéBeach',title:'30th Celebration: worldwide release and Futuristic Rare',date:'2026',summary:'Source spécialisée à utiliser pour compléter les annonces officielles et suivre le sentiment collectionneur.',url:'https://www.pokebeach.com/2026/06/30th-celebration-set-revealed',impact:'HYPE'}
 ];renderNews()
}
function renderNews(){$('#news').innerHTML=news.map(n=>`<article class="story"><div class="meta">${esc(n.source)} • ${esc(n.date)}</div><h3>${esc(n.title)}</h3><p>${esc(n.summary)}</p><span class="impact">${esc(n.impact||'INFO')}</span><br><a target="_blank" rel="noopener" href="${esc(n.url)}">Lire la source →</a></article>`).join('');$('#releaseCount').textContent=news.filter(n=>n.impact==='RELEASE').length;$('#newsScore').textContent=news.length?`${news.length} signaux`:'—'}
$('#search').onclick=()=>search($('#q').value.trim());$('#q').onkeydown=e=>{if(e.key==='Enter')search($('#q').value.trim())};$('#sort').onchange=renderCards;$('#newsRefresh').onclick=loadNews;
document.querySelectorAll('[data-q]').forEach(b=>b.onclick=()=>{$('#q').value=b.dataset.q;search(b.dataset.q)});
$('#cards').onclick=e=>{let s=e.target.closest('[data-star]');if(s){e.stopPropagation();toggleWatch(s.dataset.star);return}let c=e.target.closest('.card');if(c)openCard(c.dataset.id)};
$('#close').onclick=()=>$('#modal').classList.add('hidden');$('#modal').onclick=e=>{if(e.target.id==='modal')$('#modal').classList.add('hidden')};$('#watch').onclick=()=>selected&&toggleWatch(selected.id);$('#snap').onclick=()=>selected&&snapshot(selected);
$('#theme').onclick=()=>document.body.classList.toggle('light');setWatch(watch());loadNews();
