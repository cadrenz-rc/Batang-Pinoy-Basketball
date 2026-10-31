(() => {
  function initializeBPBLTabs() {
    const ids=['standings','leaders','results'];
    const main=document.querySelector('main');
    if (!main || ids.some(id=>!document.getElementById(id))) return;

    document.getElementById('bpbl-navigation-tabs')?.remove();
    const bar=document.createElement('nav');
    bar.id='bpbl-navigation-tabs';
    bar.setAttribute('role','tablist');
    bar.setAttribute('aria-label','BPBL site navigation');
    bar.className='grid grid-cols-3 gap-2 sm:gap-3 rounded-xl bg-[#030917] border border-ph-blue/60 p-2 shadow-xl';
    const labels=['Standings','League Leaders','Previous Matchups'];

    // Show the tabs immediately below the site header on every screen size.
    main.insertBefore(bar,main.firstElementChild);
    ids.forEach((id,i)=>{
      const b=document.createElement('button');
      b.type='button';b.id='bpbl-tab-'+id;b.textContent=labels[i];
      b.setAttribute('role','tab');b.setAttribute('aria-controls',id);
      b.addEventListener('click',()=>show(id,true));
      bar.appendChild(b);
    });

    // Move the three existing panels directly below the tabs.
    let anchor=bar;
    ids.forEach(id=>{
      const section=document.getElementById(id);
      section.setAttribute('role','tabpanel');
      section.style.scrollMarginTop='150px';
      anchor.after(section);
      anchor=section;
    });

    const heading=document.querySelector('#results h2');
    if(heading)heading.textContent='Season 9 Previous Matchups';
    document.querySelectorAll('a[href="#standings"],a[href="#leaders"],a[href="#results"]').forEach(a=>{
      const id=a.getAttribute('href').slice(1);
      a.addEventListener('click',()=>show(id,false));
      if(id==='results')a.textContent='Previous Matchups';
    });

    function show(id,setHash) {
      if(!ids.includes(id))id='standings';
      ids.forEach(k=>{
        const active=k===id;
        document.getElementById(k).classList.toggle('hidden',!active);
        const b=document.getElementById('bpbl-tab-'+k);
        b.setAttribute('aria-selected',String(active));
        b.className='min-w-0 px-2 sm:px-5 py-3 rounded-lg font-extrabold text-[11px] sm:text-sm uppercase tracking-wide transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-ph-gold '+
          (active?'bg-ph-gold text-ph-navy shadow-lg':'bg-ph-blue/50 text-white hover:bg-ph-blue');
      });
      if(setHash)history.replaceState(null,'','#'+id);
    }

    show(ids.includes(location.hash.slice(1))?location.hash.slice(1):'standings',false);
    window.addEventListener('hashchange',()=>{
      const id=location.hash.slice(1);
      if(ids.includes(id)) show(id,false);
    });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',initializeBPBLTabs);
  else initializeBPBLTabs();
})();


/* BPBL Season 9: ranking by total or average per tracked game. */
(function () {
  function setupRankings() {
    const leaderSection = document.getElementById('leaders');
    const categories = {pts:['PTS','PPG'],reb:['REB','RPG'],ast:['AST','APG'],stl:['STL','SPG'],blk:['BLK','BPG'],tpm:['3PM','3PM/G']};
    if (!leaderSection || !document.getElementById('leader-tbody') || typeof BPBL_DATA === 'undefined') return;
    if (document.getElementById('bpbl-ranking-toggle')) return;
    let mode = 'total';
    const toolbar = document.createElement('div');
    toolbar.id = 'bpbl-ranking-toggle';
    toolbar.className = 'flex flex-wrap gap-3 items-center';
    toolbar.innerHTML = '<strong class="uppercase text-xs text-ph-gold">Rank by</strong><div class="inline-flex gap-1 bg-[#030917] border border-ph-blue/60 rounded-xl p-1" role="group" aria-label="Leader ranking metric"><button data-mode="total" type="button">Totals</button><button data-mode="average" type="button">Per Game</button></div><small class="text-blue-200">Averages use each player’s tracked games played.</small>';
    const categoryButtons = leaderSection.querySelector('#cat-pts')?.parentElement;
    if (categoryButtons) categoryButtons.after(toolbar); else leaderSection.prepend(toolbar);
    const initialRenderer = renderLeaderboards;
    function selectedCategory() {
      const active = ['pts','reb','ast','stl','blk','tpm'].find(c => {
        const btn=document.getElementById('cat-'+c);
        return btn && btn.className.includes('border-2');
      });
      return active || 'pts';
    }
    function selectedDivision() {
      if(document.getElementById('ldr-div-open')?.className.includes('bg-ph-gold')) return 'OPEN';
      if(document.getElementById('ldr-div-35')?.className.includes('bg-ph-gold')) return '35+';
      return 'ALL';
    }
    function render() {
      // Original renderer retains the existing desktop/mobile styling and all interactions.
      initialRenderer();
      const category=selectedCategory(), division=selectedDivision();
      const q=(document.getElementById('leader-search')?.value || '').trim().toLowerCase();
      const list=BPBL_DATA.players.filter(p=>p.gp>0 && (division==='ALL'||p.div===division) && (!q||p.name.toLowerCase().includes(q)||p.team.toLowerCase().includes(q)));
      const score=p=>mode==='average'?p[category]/p.gp:p[category];
      list.sort((a,b)=>score(b)-score(a)||b[category]-a[category]||a.name.localeCompare(b.name));
      const body=document.getElementById('leader-tbody'), spot=document.getElementById('leader-spotlight');
      const label=categories[category][0],averageLabel=categories[category][1];
      const title=document.getElementById('leader-table-title');
      if(title)title.textContent=label+' Leaders — '+(mode==='average'?'Per Game':'Totals');
      const head=document.getElementById('leader-thead');
      if(head)head.innerHTML='<th class="py-3 px-4">Rank</th><th class="py-3 px-4">Player</th><th class="py-3 px-3 text-center">GP</th><th class="py-3 px-3 text-right">Total '+label+'</th><th class="py-3 px-4 text-right">'+averageLabel+'</th>';
      if(body)body.innerHTML=list.length?list.slice(0,15).map((p,i)=>'<tr class="hover:bg-ph-blue/30 transition"><td class="py-3 px-4 font-mono font-bold '+(i<3?'text-ph-gold':'text-blue-200')+'">#'+(i+1)+'</td><td class="py-3 px-4"><div class="font-bold text-white"></div><div class="text-xs text-blue-200"></div></td><td class="py-3 px-3 text-center font-mono">'+p.gp+'</td><td class="py-3 px-3 text-right font-mono '+(mode==='total'?'font-extrabold text-ph-gold':'')+'">'+p[category]+'</td><td class="py-3 px-4 text-right font-mono '+(mode==='average'?'font-extrabold text-ph-gold':'')+'">'+(p[category]/p.gp).toFixed(1)+'</td></tr>').join(''):'<tr><td colspan="5" class="py-8 text-center text-blue-200">No players match your filters.</td></tr>';
      if(body)list.slice(0,15).forEach((p,i)=>{const cells=body.rows[i]?.cells[1]?.querySelectorAll('div');if(cells?.length===2){cells[0].textContent=p.name+(p.div==='35+'?' (35+)':' (Open)');cells[1].textContent=p.team;}});
      if(spot) {
        if(!list.length){spot.textContent='No players match your filters.';}
        else {const p=list[0];spot.innerHTML='<div class="space-y-4"><div class="text-xs font-bold text-ph-gold uppercase">#1 '+(mode==='average'?'Per Game':'Total')+' '+label+' Leader</div><h3 class="font-display text-4xl uppercase font-bold"></h3><p class="text-sm text-blue-200"></p><div class="bg-[#030917]/90 border border-ph-gold/60 rounded-xl p-4"><div class="text-xs text-blue-200">'+(mode==='average'?averageLabel:'Total '+label)+'</div><div class="font-display text-5xl text-ph-gold font-bold">'+(mode==='average'?(p[category]/p.gp).toFixed(1):p[category])+'</div><div class="mt-2 text-sm text-white">Total: '+p[category]+' · '+averageLabel+': '+(p[category]/p.gp).toFixed(1)+' · GP: '+p.gp+'</div></div></div>';spot.querySelector('h3').textContent=p.name;spot.querySelector('p').textContent=p.team+' · '+(p.div==='35+'?'Baliklaro 35+':'Open Division');}
      }
      toolbar.querySelectorAll('button').forEach(btn=>{const active=btn.dataset.mode===mode;btn.setAttribute('aria-pressed',String(active));btn.className='px-4 py-2 rounded-lg font-extrabold text-xs uppercase '+(active?'bg-ph-gold text-ph-navy':'bg-ph-blue/50 text-white hover:bg-ph-blue');});
    }
    // The existing division and category buttons call renderLeaderboards by name.
    renderLeaderboards=render;
    toolbar.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{mode=b.dataset.mode;render();}));
    render();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setupRankings);
  else setupRankings();
})();
