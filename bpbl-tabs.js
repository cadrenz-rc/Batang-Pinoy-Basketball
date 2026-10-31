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
