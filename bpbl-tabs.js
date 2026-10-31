(function(){
  const ids=['standings','leaders','results'];
  const main=document.querySelector('main');
  const sections=ids.map(id=>document.getElementById(id));
  if(!main || sections.some(x=>!x)) return;
  const bar=document.createElement('div');
  bar.id='bpbl-navigation-tabs';
  bar.setAttribute('role','tablist');
  bar.setAttribute('aria-label','League sections');
  bar.className='grid grid-cols-3 gap-2 rounded-2xl bg-[#030917] border border-ph-blue/60 p-2 shadow-xl';
  const labels=['Standings','League Leaders','Previous Matchups'];
  ids.forEach((id,i)=>{
    const b=document.createElement('button');b.type='button';b.id='bpbl-tab-'+id;
    b.textContent=labels[i];b.setAttribute('role','tab');b.setAttribute('aria-controls',id);
    b.className='px-2 sm:px-5 py-3 rounded-xl font-extrabold text-xs sm:text-sm uppercase tracking-wide transition';
    b.addEventListener('click',()=>show(id,true));bar.append(b);
  });
  main.insertBefore(bar, sections[0]);
  ids.forEach(id=>main.append(document.getElementById(id)));
  const heading=document.querySelector('#results h2');
  if(heading)heading.textContent='Season 9 Previous Matchups';
  document.querySelectorAll('a[href="#standings"],a[href="#leaders"],a[href="#results"]').forEach(a=>{
    a.addEventListener('click',()=>show(a.getAttribute('href').substring(1),false));
    if(a.getAttribute('href')==='#results')a.textContent='Previous Matchups';
  });
  function show(id,setHash){
    if(!ids.includes(id))id='standings';
    ids.forEach(k=>{
      const active=k===id;
      document.getElementById(k).classList.toggle('hidden',!active);
      const b=document.getElementById('bpbl-tab-'+k);
      b.setAttribute('aria-selected',String(active));
      b.className='px-2 sm:px-5 py-3 rounded-xl font-extrabold text-xs sm:text-sm uppercase tracking-wide transition '+(active?'bg-ph-gold text-ph-navy shadow-lg':'bg-ph-blue/40 text-white hover:bg-ph-blue');
    });
    if(setHash)history.replaceState(null,'','#'+id);
  }
  show(ids.includes(location.hash.slice(1))?location.hash.slice(1):'standings',false);
  window.addEventListener('hashchange',()=>{if(ids.includes(location.hash.slice(1)))show(location.hash.slice(1),false)});
})();