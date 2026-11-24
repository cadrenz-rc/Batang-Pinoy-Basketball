(()=>{'use strict';const d=window.BPBL,t=d.teams,$=id=>document.getElementById(id),esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));let mode='total';const catNames={4:'Points',5:'Rebounds',6:'Assists',7:'Steals',8:'Blocks',9:'3-Pointers Made'};function navigate(name){if(!$(name)||!$(name).classList.contains('view'))name='home';try{sessionStorage.setItem('bpbl-active-tab',name)}catch(e){};document.querySelectorAll('.view').forEach(e=>e.classList.toggle('active',e.id===name));document.querySelectorAll('#nav button').forEach(e=>{let on=e.dataset.page===name;e.classList.toggle('active',on);e.setAttribute('aria-current',on?'page':'false')});history.replaceState({},'','#'+name);if(typeof window.gtag==='function')window.gtag('event','bpbl_tab_view',{tab_name:name});window.scrollTo({top:0,behavior:'instant'});if(name==='awards')renderAwards()}document.querySelectorAll('[data-page],[data-go]').forEach(b=>b.addEventListener('click',()=>navigate(b.dataset.page||b.dataset.go)));window.addEventListener('hashchange',()=>navigate(location.hash.slice(1)||'home'));

function renderPlayoffPicture(){
 const rows=d.standings[0];
 for(const [id,subset] of [['playoff-tier-one',rows.slice(0,8)],['playoff-tier-two',rows.slice(8,12)],['playoff-tier-out',rows.slice(12,14)]]){
  const el=$(id);if(!el)continue;
  el.innerHTML=subset.map(r=>`<div class="playoff-team"><span class="playoff-seed">${r[0]}</span><span class="playoff-name">${esc(t[r[1]])}</span><span class="playoff-record">${r[3]}–${r[4]}</span></div>`).join('');
 }
}
renderPlayoffPicture();
function renderHomeExtra(){
 const newest=d.games.map((g,i)=>({g,i})).slice(-4).reverse();
 const resultEl=$('home-recent-games');
 if(resultEl){resultEl.innerHTML=newest.map(({g,i})=>`<button type="button" class="home-score-row" data-feature-game="${i}"><span><small>${esc(g[0])}/2026 · ${g[1]?'35+':'Open'}</small><strong>${esc(t[g[2]])}<br>${esc(t[g[4]])}</strong></span><b>${g[3]}–${g[5]}</b></button>`).join('');resultEl.querySelectorAll('[data-feature-game]').forEach(el=>el.addEventListener('click',()=>openBox(Number(el.dataset.featureGame))))}
 const awardsEl=$('home-awards');
 if(awardsEl){awardsEl.innerHTML=d.awards.slice(-3).map(a=>`<button type="button" class="home-award-link" data-home-award="${esc(a.name)}" aria-label="View ${esc(a.name)} award poster"><img loading="lazy" src="${esc(a.file)}" alt="Award poster for ${esc(a.name)}"></button>`).join('');awardsEl.querySelectorAll('[data-home-award]').forEach(el=>el.addEventListener('click',()=>navigate('awards')))}
 document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>navigate(b.dataset.go));
}
function standings(){let rows=d.standings[Number($('stand-div').value)];$('standings-body').innerHTML=rows.map(r=>`<tr><td class="highlight">#${r[0]}</td><td><strong>${esc(t[r[1]])}</strong></td><td class="num">${r[2]}</td><td class="num highlight">${r[3]}</td><td class="num">${r[4]}</td><td class="num">${(100*r[3]/r[2]).toFixed(1)}%</td><td class="num">${r[5]}</td><td class="num">${r[6]}</td><td class="num ${r[5]>=r[6]?'highlight':''}">${r[5]-r[6]>0?'+':''}${r[5]-r[6]}</td></tr>`).join('')}$('stand-div').onchange=standings;
let leaderVisibleCount=10;
function leaders(){
 const dv=$('leader-div').value,c=Number($('leader-cat').value),search=$('leader-search').value.trim().toLowerCase();
 const all=d.players.filter(p=>(dv==='all'||p[2]===Number(dv))&&(!search||p[0].toLowerCase().includes(search)||t[p[1]].toLowerCase().includes(search)));
 const metric=p=>mode==='average'?p[c]/p[3]:p[c];
 all.sort((a,b)=>metric(b)-metric(a)||b[c]-a[c]||a[0].localeCompare(b[0]));
 const shown=all.slice(0,leaderVisibleCount);
 const caption=$('leader-count');
 if(caption)caption.textContent=shown.length?`Showing top ${shown.length} players${search?' matching your search':''} · ${dv==='all'?'All Divisions':dv==='0'?'Open Division':'Baliklaro 35+'}`:'No players match your filters';
 $('leaders-body').innerHTML=shown.length?shown.map((p,i)=>`<tr><td class="highlight">${i+1}</td><td><strong>${esc(p[0])}</strong><br><small style="color:#67758c">${esc(t[p[1]])} · ${p[2]?'35+':'Open'}</small></td><td class="num">${p[3]}</td><td class="num ${mode==='total'?'highlight':''}">${p[c]}</td><td class="num ${mode==='average'?'highlight':''}">${(p[c]/p[3]).toFixed(1)}</td></tr>`).join(''):'<tr><td colspan="5" class="empty">No players match your filters.</td></tr>';
 $('leader-spotlight').innerHTML=all.length?`<div class="leader-title"><div class="number">#1</div><div><strong>${esc(all[0][0])}</strong><small>${esc(t[all[0][1]])} · ${catNames[c]} · ${all[0][3]} games with stats</small></div></div><div style="display:flex;gap:26px;flex-wrap:wrap"><div><small class="kicker">Total</small><strong style="font-size:27px">${all[0][c]}</strong></div><div><small class="kicker">Per game</small><strong style="font-size:27px">${(all[0][c]/all[0][3]).toFixed(1)}</strong></div></div>`:'<p class="empty">No matching players</p>';
 const more=$('leader-show-more'),less=$('leader-show-less');
 if(more){more.hidden=shown.length===all.length;more.textContent=`Show More Players (${Math.min(10,all.length-shown.length)} more)`;}
 if(less)less.hidden=leaderVisibleCount<=10;
}
function resetLeaders(){leaderVisibleCount=10;leaders();}
['leader-div','leader-cat','leader-search'].forEach(id=>$(id).addEventListener(id==='leader-search'?'input':'change',resetLeaders));
for(const [id,value] of [['mode-total','total'],['mode-average','average']])$(id).onclick=()=>{mode=value;$('mode-total').classList.toggle('on',mode==='total');$('mode-average').classList.toggle('on',mode==='average');$('mode-total').setAttribute('aria-pressed',mode==='total');$('mode-average').setAttribute('aria-pressed',mode==='average');resetLeaders()};
$('leader-show-more').addEventListener('click',()=>{leaderVisibleCount+=10;leaders()});
$('leader-show-less').addEventListener('click',()=>{leaderVisibleCount=10;leaders();$('leader-count').scrollIntoView({behavior:'smooth',block:'start'})});
function gameHTML(g){let winner=g[3]>g[5]?2:4;const team=(id,sc,idx)=>`<div class="teamline ${winner===idx?'winner':''}"><span>${esc(t[id])}</span><b>${sc}</b></div>`;return `<button type="button" class="panel game game-open" data-game-index="${d.games.indexOf(g)}" aria-label="Open box score for ${esc(t[g[2]])} versus ${esc(t[g[4]])}"><div class="meta"><span>${g[1]?'Baliklaro 35+':'Open Division'}</span><span>${g[0]}/2026 · FINAL</span></div>${team(g[2],g[3],2)}${team(g[4],g[5],4)}<span class="game-cta">VIEW FULL BOX SCORE →</span></button>`}function games(){let dv=$('match-div').value,date=$('match-date').value,s=$('match-search').value.toLowerCase().trim();let a=d.games.filter(g=>(dv==='all'||g[1]===Number(dv))&&(date==='all'||g[0]===date)&&(!s||t[g[2]].toLowerCase().includes(s)||t[g[4]].toLowerCase().includes(s))).reverse();$('games-list').innerHTML=a.length?a.map(gameHTML).join(''):'<div class="panel empty">No matchups found.</div>';document.querySelectorAll('.game-open').forEach(b=>b.addEventListener('click',()=>openBox(Number(b.dataset.gameIndex))))}['match-div','match-date','match-search'].forEach(id=>$(id).addEventListener(id==='match-search'?'input':'change',games));
function renderAwards(){let sea=$('award-season').value,dv=$('award-div').value,s=$('award-search').value.trim().toLowerCase(),a=d.awards.filter(x=>(sea==='all'||x.season===Number(sea))&&(dv==='all'||x.division===dv)&&(!s||x.name.toLowerCase().includes(s)));$('awards-list').innerHTML=a.length?a.map(x=>`<button class="award" data-image="${esc(x.file)}" data-name="${esc(x.name)}"><img src="${esc(x.file)}" loading="lazy" alt="Award poster for ${esc(x.name)}"><div class="award-info"><b>${esc(x.name)}</b><small>Season ${x.season} · ${x.division==='35+'?'Baliklaro 35+':'Open Division'}</small></div></button>`).join(''):'<div class="panel empty">No award posters match your filters.</div>';document.querySelectorAll('.award').forEach(b=>b.addEventListener('click',()=>{$('lightbox-image').src=b.dataset.image;$('lightbox-image').alt='Full award poster for '+b.dataset.name;$('lightbox-caption').textContent=b.dataset.name;$('lightbox').classList.add('show');document.body.style.overflow='hidden'}))}['award-season','award-div','award-search'].forEach(id=>$(id).addEventListener(id==='award-search'?'input':'change',renderAwards));function close(){ $('lightbox').classList.remove('show');document.body.style.overflow=''}$('close-lightbox').onclick=close;$('lightbox').addEventListener('click',e=>{if(e.target===$('lightbox'))close()});window.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
function openBox(i){if(typeof window.gtag==='function')window.gtag('event','bpbl_box_score_open',{game_index:i+1});const g=d.games[i],b=d.boxScores[i],headers=['PLAYER','PTS','2PM','3PM','FTM','REB','AST','STL','BLK','PF'];
const tbl=(side)=>{const rows=b.rows[side],total=b.totals[side];if(!rows.length)return '<p class="box-unavailable">Individual player statistics unavailable for this game. The official final score is shown above.</p>';const tr=(r,team)=>'<tr'+(team?' class="team-total"':'')+'>'+r.map((v,k)=>'<td'+(k?' class="num"':'')+'>'+esc(v)+'</td>').join('')+'</tr>';return '<div class="box-table-wrap"><table class="box-table"><thead><tr>'+headers.map(x=>'<th>'+x+'</th>').join('')+'</tr></thead><tbody>'+rows.map(r=>tr(r,false)).join('')+(total?tr(['TEAM TOTAL',...total],true):'')+'</tbody></table></div>'};
$('box-title').textContent=t[g[2]]+' vs '+t[g[4]];$('box-meta').textContent=g[0]+'/2026 · '+b.time+' · '+(g[1]?'Baliklaro 35+':'Open Division');$('box-score').innerHTML='<div>'+esc(t[g[2]])+' <b>'+g[3]+'</b></div><span>FINAL</span><div>'+esc(t[g[4]])+' <b>'+g[5]+'</b></div>';$('box-content').innerHTML='<h3>'+esc(t[g[2]])+'</h3>'+tbl(0)+'<h3>'+esc(t[g[4]])+'</h3>'+tbl(1)+'<p class="box-note">Source: iTala Game Box Score Book, November 23, 2026. Blank tracking is not zero. Game totals may differ from official scores.</p>';$('box-modal').classList.add('show');$('box-modal').setAttribute('aria-hidden','false');document.body.style.overflow='hidden';$('box-close').focus()}
function closeBox(){$('box-modal').classList.remove('show');$('box-modal').setAttribute('aria-hidden','true');document.body.style.overflow=''}$('box-close').onclick=closeBox;$('box-modal').addEventListener('click',e=>{if(e.target===$('box-modal'))closeBox()});window.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('box-modal').classList.contains('show'))closeBox()});
$('quick-stats').innerHTML=[[d.teams.length,'Teams'],[d.games.length,'Recorded results'],['10','Top league leaders'],[d.awards.length,'Award posters']].map(v=>`<div class="stat"><b>${v[0]}</b><small>${v[1]}</small></div>`).join('');$('home-standings').innerHTML=d.standings[0].slice(0,5).map(r=>`<div class="mini-row"><span class="rank">${r[0]}</span><strong>${esc(t[r[1]])}</strong><span class="win">${r[3]}–${r[4]}</span></div>`).join('');let top=d.players.slice().sort((a,b)=>b[4]-a[4])[0];$('home-leader').innerHTML=`<div class="leader-title"><span class="number">${top[4]}</span><div><strong>${esc(top[0])}</strong><small>Recorded points · ${esc(t[top[1]])}</small></div></div><button class="btn" data-go="leaders">View Top 10 Leaders</button>`;document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>navigate(b.dataset.go));renderHomeExtra();
function setupTeamStats(){
 if (!document.getElementById('team-stats-body') || !Array.isArray(d.games) || !Array.isArray(d.standings)) return;
 const stats=d.teams.map((name,id)=>({name,id,gp:0,w:0,pf:0,pa:0,tracked:0,reb:0,ast:0,stl:0,blk:0,tpm:0}));
 d.games.forEach((g,i)=>{const box=d.boxScores[i];[[g[2],g[3],g[5],0],[g[4],g[5],g[3],1]].forEach(([id,pts,opp,side])=>{let x=stats[id];x.gp++;x.pf+=pts;x.pa+=opp;if(pts>opp)x.w++;const total=box&&box.totals&&box.totals[side];if(Array.isArray(total)&&total.length>=9){x.tracked++;x.tpm+=Number(total[2]||0);x.reb+=Number(total[4]||0);x.ast+=Number(total[5]||0);x.stl+=Number(total[6]||0);x.blk+=Number(total[7]||0)}})});
 const avg=(x,k)=>x.tracked?(x[k]/x.tracked).toFixed(1):'—';
 const percent=x=>x.gp?(100*x.w/x.gp).toFixed(1)+'%':'—';
 const metric=(x,k)=>({ppg:x.pf/x.gp,opp:-x.pa/x.gp,margin:(x.pf-x.pa)/x.gp,reb:x.tracked?x.reb/x.tracked:-1,ast:x.tracked?x.ast/x.tracked:-1,stl:x.tracked?x.stl/x.tracked:-1,blk:x.tracked?x.blk/x.tracked:-1,tpm:x.tracked?x.tpm/x.tracked:-1,pct:x.w/x.gp})[k];
 function render(){const div=Number($('team-stat-div').value),sort=$('team-stat-sort').value;const divTeams=new Set(d.standings[div].map(r=>r[1]));const rows=stats.filter(x=>divTeams.has(x.id)).sort((a,b)=>metric(b,sort)-metric(a,sort)||b.w-a.w||a.name.localeCompare(b.name));$('team-stats-body').innerHTML=rows.map((x,i)=>`<tr><td class="highlight">${i+1}</td><td><strong>${esc(x.name)}</strong></td><td class="num">${x.gp}</td><td class="num">${percent(x)}</td><td class="num">${(x.pf/x.gp).toFixed(1)}</td><td class="num">${(x.pa/x.gp).toFixed(1)}</td><td class="num">${((x.pf-x.pa)/x.gp).toFixed(1)}</td><td class="num">${avg(x,'reb')}</td><td class="num">${avg(x,'ast')}</td><td class="num">${avg(x,'stl')}</td><td class="num">${avg(x,'blk')}</td><td class="num">${avg(x,'tpm')}</td></tr>`).join('')}
 function compare(){let a=stats[Number($('compare-a').value)],b=stats[Number($('compare-b').value)];$('team-compare').innerHTML=[a,b].map(x=>`<div class="panel"><h3>${esc(x.name)}</h3>${[['Record',x.w+'–'+(x.gp-x.w)],['Games',x.gp],['Win rate',percent(x)],['Points/game',(x.pf/x.gp).toFixed(1)],['Opponent points/game',(x.pa/x.gp).toFixed(1)],['Scoring margin/game',((x.pf-x.pa)/x.gp).toFixed(1)],['Rebounds/tracked game',avg(x,'reb')],['Assists/tracked game',avg(x,'ast')],['Steals/tracked game',avg(x,'stl')],['Blocks/tracked game',avg(x,'blk')],['3PM/tracked game',avg(x,'tpm')]].map(([label,val])=>`<div class="mini-row"><span>${label}</span><strong>${val}</strong></div>`).join('')}</div>`).join('')}
 for(const id of ['compare-a','compare-b'])$(id).innerHTML=stats.map(x=>`<option value="${x.id}">${esc(x.name)}</option>`).join('');$('compare-a').value='0';$('compare-b').value='1';
 $('team-stat-div').onchange=render;$('team-stat-sort').onchange=render;$('compare-a').onchange=compare;$('compare-b').onchange=compare;render();compare();
}

// All playoff bracket previews open the existing full-poster lightbox.
document.querySelectorAll('[data-bracket-image]').forEach(el=>el.addEventListener('click',()=>{
 const image=$('lightbox-image'),dialog=$('lightbox');
 if(!image||!dialog)return;
 image.src=el.dataset.bracketImage;
 image.alt='Full-size playoff bracket: '+el.dataset.bracketTitle;
 $('lightbox-caption').textContent=el.dataset.bracketTitle+' · BPBL Season 9 · Playoffs begin November 28';
 dialog.classList.add('show');document.body.style.overflow='hidden';
}));

// November 21 game result scorecards open each original iTala box score.
document.querySelectorAll('#nov21-schedule [data-feature-game]').forEach(el=>{
 el.addEventListener('click',()=>openBox(Number(el.dataset.featureGame)));
});

// November 28, 2026 Playoff Game Day previews. Scores and player stats derive from existing Season 9 data.
const playoffSchedule=[
 {time:'12:00 PM',a:2,b:4,stage:'Open Division · Quarterfinal 2',group:'top8'},
 {time:'1:00 PM',a:3,b:6,stage:'Open Division · Quarterfinal 4',group:'top8'},
 {time:'2:00 PM',a:9,b:7,stage:'Division 2 · Semifinal',group:'div2'},
 {time:'3:00 PM',a:11,b:12,stage:'Division 2 · Semifinal',group:'div2'},
 {time:'4:00 PM',a:0,b:8,stage:'Open Division · Quarterfinal 1',group:'top8'},
 {time:'5:00 PM',a:1,b:5,stage:'Open Division · Quarterfinal 3',group:'top8'},
 {time:'6:00 PM',a:17,b:18,stage:'Baliklaro 35+ · Quarterfinal 2',group:'35plus'},
 {time:'7:00 PM',a:16,b:19,stage:'Baliklaro 35+ · Quarterfinal 1',group:'35plus'}
];
function buildMatchupStats(){
 const stat=d.teams.map((name,id)=>({name,id,pts:0,opp:0,played:0,tracked:0,reb:0,ast:0,stl:0,blk:0,tpm:0,results:[]}));
 d.games.forEach((g,i)=>{
  const admin=(g[3]===0&&g[5]===30)||(g[3]===30&&g[5]===0);
  [[g[2],g[3],g[5],g[4],0],[g[4],g[5],g[3],g[2],1]].forEach(([id,points,opponent,oppId,side])=>{
   const row=stat[id];row.results.push({date:g[0],opponent:oppId,points,allowed:opponent,win:points>opponent,admin});
   if(admin)return;
   row.played++;row.pts+=points;row.opp+=opponent;
   const box=d.boxScores[i],tot=box&&box.totals&&box.totals[side];
   if(Array.isArray(tot)&&tot.length>=9){row.tracked++;row.tpm+=Number(tot[2]||0);row.reb+=Number(tot[4]||0);row.ast+=Number(tot[5]||0);row.stl+=Number(tot[6]||0);row.blk+=Number(tot[7]||0)}
  });
 });
 return stat;
}
const playoffTeamStats=buildMatchupStats();
const previewSeed=new Map(d.standings.flatMap(rows=>rows.map(r=>[r[1],{seed:r[0],w:r[3],l:r[4]}])));
function previewAvg(row,metric){const denom=['pts','opp'].includes(metric)?row.played:row.tracked;return denom?row[metric]/denom:null}
function previewNum(n){return n===null?'—':n.toFixed(1)}
function previewPlayer(team,metric){
 const eligible=d.players.filter(p=>p[1]===team&&p[3]>0);const selection=eligible.some(p=>p[3]>=3)?eligible.filter(p=>p[3]>=3):eligible;
 const idx={ppg:4,rpg:5,apg:6}[metric];
 return selection.slice().sort((a,b)=>b[idx]/b[3]-a[idx]/a[3]||b[idx]-a[idx]||a[0].localeCompare(b[0]))[0]||null;
}
function previewPlayerCell(team,label,metric){
 const p=previewPlayer(team,metric);if(!p)return `<div class="bpbl-preview-playerrow"><span>${label}</span><b>Unavailable</b></div>`;
 const val=p[{ppg:4,rpg:5,apg:6}[metric]]/p[3];
 return `<div class="bpbl-preview-playerrow"><span>${label}</span><b>${esc(p[0])} · ${val.toFixed(1)} ${metric.toUpperCase()}</b><small>${p[3]} recorded stat games</small></div>`;
}
function previewRecent(team){return playoffTeamStats[team].results.slice(-3).reverse().map(g=>`<p><span class="${g.win?'bpbl-preview-result-w':'bpbl-preview-result-l'}">${g.win?'W':'L'}</span> · ${esc(g.date)} · ${esc(t[g.opponent])} · ${g.points}–${g.allowed}${g.admin?' (30–0 score-only result)':''}</p>`).join('')}
function previewMeeting(a,b){
 const games=d.games.filter(g=>(g[2]===a&&g[4]===b)||(g[2]===b&&g[4]===a));
 if(!games.length)return 'No regular-season meeting in the available results.';
 return games.map(g=>`${esc(g[0])}: <strong>${esc(t[g[2]])} ${g[3]}–${g[5]} ${esc(t[g[4]])}</strong>${(g[3]===0&&g[5]===30)||(g[3]===30&&g[5]===0)?' (30–0 score-only result)':''}`).join('<br>');
}
function previewEdge(a,b){
 const x=playoffTeamStats[a],y=playoffTeamStats[b],details=[];
 const scoring=previewAvg(x,'pts'),other=previewAvg(y,'pts');
 if(scoring!==null&&other!==null&&Math.abs(scoring-other)>=1)details.push(`<strong>${esc(t[scoring>other?a:b])}</strong> scores more points per game (${previewNum(Math.max(scoring,other))} vs ${previewNum(Math.min(scoring,other))})`);
 const allowed=previewAvg(x,'opp'),otherAllowed=previewAvg(y,'opp');
 if(allowed!==null&&otherAllowed!==null&&Math.abs(allowed-otherAllowed)>=1)details.push(`<strong>${esc(t[allowed<otherAllowed?a:b])}</strong> allows fewer points per game (${previewNum(Math.min(allowed,otherAllowed))} vs ${previewNum(Math.max(allowed,otherAllowed))})`);
 const threes=previewAvg(x,'tpm'),otherThrees=previewAvg(y,'tpm');
 if(threes!==null&&otherThrees!==null&&Math.abs(threes-otherThrees)>=.5)details.push(`<strong>${esc(t[threes>otherThrees?a:b])}</strong> averages more made threes in recorded games`);
 return details.length?details.slice(0,3).join('; ')+'.':'Their available statistical profiles are close in the compared categories.';
}
function previewStatRow(a,b,label,metric,lowerIsBetter=false){
 const aVal=previewAvg(playoffTeamStats[a],metric),bVal=previewAvg(playoffTeamStats[b],metric);
 const delta=aVal===null||bVal===null?0:(lowerIsBetter?bVal-aVal:aVal-bVal);
 const aEdge=delta>0.05,bEdge=delta<-.05;
 return `<div class="bpbl-preview-statrow"><strong${aEdge?' class="stat-edge"':''}>${previewNum(aVal)}</strong><span class="bpbl-stat-name">${label}</span><strong${bEdge?' class="stat-edge"':''}>${previewNum(bVal)}</strong></div>`;
}
function previewHTML(game){
 const {a,b,time,stage,group}=game,seedA=previewSeed.get(a),seedB=previewSeed.get(b);
 const [sa,sb]=[seedA,seedB].map(x=>x||{seed:'?',w:'–',l:'–'});
 return `<details class="bpbl-matchup-card" data-matchup-group="${group}"><summary aria-label="View matchup preview: ${esc(t[a])} versus ${esc(t[b])}, ${time}">
  <span class="bpbl-matchup-time">${time.replace(' ','&nbsp;')}<small>PACIFIC</small></span>
  <span class="bpbl-matchup-summary-text"><span class="bpbl-matchup-division">${esc(stage)}</span><span class="bpbl-matchup-names">${esc(t[a])}<span class="bpbl-matchup-vs">vs</span>${esc(t[b])}</span></span>
  <span class="bpbl-matchup-open-label">View Preview</span><span class="bpbl-matchup-toggle" aria-hidden="true">+</span></summary>
  <div class="bpbl-matchup-expanded">
   <div class="bpbl-matchup-teams"><div class="bpbl-matchup-team"><strong>#${sa.seed} ${esc(t[a])}</strong><span>${sa.w}–${sa.l} regular season</span></div><div class="bpbl-matchup-versus">VS</div><div class="bpbl-matchup-team"><strong>#${sb.seed} ${esc(t[b])}</strong><span>${sb.w}–${sb.l} regular season</span></div></div>
   <div class="bpbl-preview-stats" role="table" aria-label="Season 9 team averages for ${esc(t[a])} versus ${esc(t[b])}">
    <div class="bpbl-preview-statrow bpbl-preview-stathead" role="row"><strong>${esc(t[a])}</strong><span class="bpbl-stat-name">SEASON 9 AVERAGES</span><strong>${esc(t[b])}</strong></div>
    ${previewStatRow(a,b,'Points per game (PPG)','pts')}
    ${previewStatRow(a,b,'Opponent PPG','opp',true)}
    ${'<div class="bpbl-preview-statrow"><strong'+(previewAvg(playoffTeamStats[a],'pts')!==null&&previewAvg(playoffTeamStats[b],'pts')!==null&&((previewAvg(playoffTeamStats[a],'pts')-previewAvg(playoffTeamStats[a],'opp'))>(previewAvg(playoffTeamStats[b],'pts')-previewAvg(playoffTeamStats[b],'opp')))?' class="stat-edge"':'')+'>'+previewNum(previewAvg(playoffTeamStats[a],'pts')!==null?previewAvg(playoffTeamStats[a],'pts')-previewAvg(playoffTeamStats[a],'opp'):null)+'</strong><span class="bpbl-stat-name">Scoring margin / game</span><strong'+(previewAvg(playoffTeamStats[a],'pts')!==null&&previewAvg(playoffTeamStats[b],'pts')!==null&&((previewAvg(playoffTeamStats[b],'pts')-previewAvg(playoffTeamStats[b],'opp'))>(previewAvg(playoffTeamStats[a],'pts')-previewAvg(playoffTeamStats[a],'opp')))?' class="stat-edge"':'')+'>'+previewNum(previewAvg(playoffTeamStats[b],'pts')!==null?previewAvg(playoffTeamStats[b],'pts')-previewAvg(playoffTeamStats[b],'opp'):null)+'</strong></div>'}
    ${previewStatRow(a,b,'Rebounds / game*','reb')}
    ${previewStatRow(a,b,'Assists / game*','ast')}
    ${previewStatRow(a,b,'Steals / game*','stl')}
    ${previewStatRow(a,b,'Blocks / game*','blk')}
    ${previewStatRow(a,b,'Made 3s / game*','tpm')}
   </div>
   <div class="bpbl-preview-block-title">Players to Watch · Per Game</div>
   <div class="bpbl-preview-watch"><div class="bpbl-preview-playercard"><strong>${esc(t[a])}</strong>${previewPlayerCell(a,'Leading scorer','ppg')}${previewPlayerCell(a,'Leading rebounder','rpg')}${previewPlayerCell(a,'Leading playmaker','apg')}</div><div class="bpbl-preview-playercard"><strong>${esc(t[b])}</strong>${previewPlayerCell(b,'Leading scorer','ppg')}${previewPlayerCell(b,'Leading rebounder','rpg')}${previewPlayerCell(b,'Leading playmaker','apg')}</div></div>
   <div class="bpbl-preview-block-title">Previous Meeting</div><div class="bpbl-preview-h2h">${previewMeeting(a,b)}</div>
   <div class="bpbl-preview-block-title">Recent Form · Last 3 Results</div><div class="bpbl-preview-match-history"><div class="bpbl-preview-history-card"><strong>${esc(t[a])}</strong>${previewRecent(a)}</div><div class="bpbl-preview-history-card"><strong>${esc(t[b])}</strong>${previewRecent(b)}</div></div>
   <div class="bpbl-preview-block-title">Statistical Edge</div><div class="bpbl-preview-keys">${previewEdge(a,b)} <strong>Season averages describe past results, not a prediction.</strong></div>
   <p class="bpbl-preview-coverage">* Non-scoring averages use games with tracked player/team box scores only. Featured player averages prioritize those with at least 3 recorded stat games. Team PPG, opponent PPG and scoring margin exclude 30–0 score-only results; win–loss records keep the recorded results.</p>
  </div></details>`;
}
function renderPlayoffSchedule(){
 const list=$('bpbl-playoff-matchups');if(!list)return;
 list.innerHTML=playoffSchedule.map(previewHTML).join('');
 const cards=Array.from(list.querySelectorAll('details.bpbl-matchup-card'));
 cards.forEach(card=>card.addEventListener('toggle',()=>{if(card.open){cards.forEach(other=>{if(other!==card)other.open=false});if(typeof window.gtag==='function')window.gtag('event','bpbl_matchup_preview_open',{matchup:card.querySelector('.bpbl-matchup-names').textContent})}}));
 const filters=$('bpbl-schedule-filters');if(filters)filters.querySelectorAll('button[data-playoff-filter]').forEach(button=>button.addEventListener('click',()=>{
  const value=button.dataset.playoffFilter;filters.querySelectorAll('button').forEach(b=>{const selected=b===button;b.classList.toggle('is-active',selected);b.setAttribute('aria-pressed',String(selected))});
  cards.forEach(card=>{card.open=false;card.hidden=value!=='all'&&card.dataset.matchupGroup!==value});
 }));
 const posterBtn=$('bpbl-schedule-poster-trigger');if(posterBtn)posterBtn.addEventListener('click',()=>{
  const image=$('lightbox-image'),dialog=$('lightbox');if(!image||!dialog)return;
  image.src=posterBtn.querySelector('img').src;image.alt='Full-size November 28 BPBL Season 9 playoff schedule';
  $('lightbox-caption').textContent='BPBL Season 9 · November 28 · Middle School Gym';
  dialog.classList.add('show');document.body.style.overflow='hidden';
 });
 document.querySelectorAll('[data-playoff-schedule-link]').forEach(button=>button.addEventListener('click',()=>{
  navigate('brackets');if(filters){const all=filters.querySelector('[data-playoff-filter="all"]');if(all)all.click();}
  requestAnimationFrame(()=>{const target=$('bpbl-playoff-schedule');if(target)target.scrollIntoView({behavior:'smooth',block:'start'})});
 }));
}
renderPlayoffSchedule();

setupTeamStats();

standings();leaders();games();renderAwards();let initialTab=location.hash.slice(1);if(!initialTab){try{initialTab=sessionStorage.getItem('bpbl-active-tab')}catch(e){}}navigate(initialTab||'home');})();