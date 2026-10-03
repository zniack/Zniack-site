(() => {
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const mode = new URL(location.href).searchParams.get('motion');
  // Explicit complete/reduced modes exist for comparing this isolated study.
  let enabled = mode === 'completo' || (mode !== 'reduzido' && !preference.matches);
  let travelFrame = 0;
  let catalogTransition;
  let observer;
  const elements = [];

  function stopTravel() {
    cancelAnimationFrame(travelFrame);
    travelFrame = 0;
    document.documentElement.classList.remove('flow-travelling');
  }
  function travel(top) {
    stopTravel();
    if(!enabled) { window.scrollTo({top,behavior:'instant'}); return; }
    const from = window.scrollY;
    const distance = top-from;
    if(Math.abs(distance)<2) return;
    const start = performance.now();
    const duration = Math.min(900, 550 + Math.abs(distance)*.07);
    document.documentElement.classList.add('flow-travelling');
    function tick(now) {
      const progress = Math.min(1,(now-start)/duration);
      const ease = 1-Math.pow(1-progress,4);
      window.scrollTo({top:from+distance*ease,behavior:'instant'});
      if(progress<1) travelFrame = requestAnimationFrame(tick);
      else stopTravel();
    }
    travelFrame=requestAnimationFrame(tick);
  }
  function cancelCatalogTransition() {
    if(!catalogTransition) return;
    catalogTransition.native.skipTransition();
    releaseCatalog(catalogTransition);
    catalogTransition = undefined;
    document.documentElement.classList.remove('flow-catalog-travel');
  }
  function releaseCatalog(state) {
    state.animations.forEach(animation=>animation.cancel());
    state.chrome.remove();
    state.main.classList.remove('flow-main-out');
    state.main.style.removeProperty('--flow-main-offset');
    state.settled?.classList.remove('flow-catalog-settled');
  }
  function chromeCopy(element) {
    const rect=element.getBoundingClientRect();
    const copy=element.cloneNode(true);
    const originals=[element,...element.querySelectorAll('*')];
    const copies=[copy,...copy.querySelectorAll('*')];
    originals.forEach((original,index)=>{
      const style=getComputedStyle(original);
      const clone=copies[index];
      for(const property of style) clone.style.setProperty(property,style.getPropertyValue(property));
      [...clone.attributes].forEach(attribute=>{
        if(attribute.name==='id'||attribute.name==='href'||attribute.name.startsWith('on')) clone.removeAttribute(attribute.name);
      });
      clone.style.pointerEvents='none';
    });
    Object.assign(copy.style,{position:'fixed',top:rect.top+'px',left:rect.left+'px',width:rect.width+'px',height:rect.height+'px',margin:'0',transform:'none'});
    return copy;
  }
  function transition(callback,{catalog=false}={}) {
    stopTravel();
    cancelCatalogTransition();
    if(!catalog || !enabled || !document.startViewTransition) { callback(); return; }
    const root=document.documentElement;
    const view=document.getElementById('portfolio-view');
    const main=document.getElementById('main-scroll');
    const mainTop=main.getBoundingClientRect().top;
    const chrome=document.createElement('div');
    chrome.className='flow-chrome-copy';
    chrome.inert=true;
    chrome.setAttribute('aria-hidden','true');
    const controls=()=>[document.getElementById('sticky-header'),...view.querySelectorAll('.refined-portfolio-top,#category-nav,#category-desc')]
      .filter(element=>element&&getComputedStyle(element).visibility!=='hidden'&&element.getBoundingClientRect().height>0);
    controls().forEach(element=>chrome.append(chromeCopy(element)));
    document.body.append(chrome);
    const state={main,chrome,animations:[],native:undefined,settled:undefined};
    const animate=(element,entering)=>{
      const animation=element.animate([{opacity:entering?0:1},{opacity:entering?1:0}],{
        duration:entering?500:250,delay:entering?1000/6:0,fill:'both',
        easing:entering?'cubic-bezier(.16,1,.3,1)':'cubic-bezier(.4,0,.6,1)'
      });
      animation.pause();
      state.animations.push(animation);
    };
    animate(chrome,false);
    if(!view.classList.contains('active')) { main.classList.add('flow-main-out'); animate(main,false); }
    root.classList.add('flow-catalog-travel');
    catalogTransition=state;
    // Only media content is captured. Navigation stays live and accepts another click.
    state.native=document.startViewTransition(()=>{
      callback();
      if(catalogTransition!==state) return;
      if(main.classList.contains('flow-main-out')) main.style.setProperty('--flow-main-offset',(mainTop-main.getBoundingClientRect().top)+'px');
      controls().forEach(element=>animate(element,true));
      if(!view.classList.contains('active')) {
        const target=document.getElementById(location.hash.slice(1));
        state.settled=target;
        target?.classList.add('flow-catalog-settled');
        elements.filter(element=>target?.contains(element)).forEach(element=>{
          element.classList.add('flow-in');
          element.style.setProperty('--flow-delay','0ms');
          observer?.unobserve(element);
        });
        animate(main,true);
      }
    });
    state.native.ready.then(()=>{
      if(catalogTransition===state) state.animations.forEach(animation=>animation.play());
    },error=>{
      if(catalogTransition!==state) return;
      finish();
      if(error.name!=='AbortError') console.warn('Transição visual não iniciada:',error);
    });
    const finish=()=>{
      if(catalogTransition!==state) return;
      releaseCatalog(state);
      catalogTransition=undefined;
      root.classList.remove('flow-catalog-travel');
    };
    const nativeFinished=state.native.finished.catch(error=>{
      if(catalogTransition!==state) return;
      finish();
      console.error('Falha na troca de categoria:',error);
    });
    state.native.updateCallbackDone
      .then(()=>Promise.all([nativeFinished,...state.animations.map(animation=>animation.finished)]))
      .then(finish,error=>{
        if(catalogTransition!==state) return;
        finish();
        console.error('Falha na passagem visual:',error);
      });
  }
  function stopNavigation() { stopTravel(); cancelCatalogTransition(); }
  window.ZniackFlow = {transition,travel,stopTravel};
  window.addEventListener('popstate',stopNavigation);
  window.addEventListener('hashchange',stopNavigation);
  window.addEventListener('wheel',stopNavigation,{passive:true});
  window.addEventListener('touchstart',stopNavigation,{passive:true});
  window.addEventListener('pointerdown',stopNavigation,{passive:true,capture:true});
  window.addEventListener('keydown',event=>{
    if(['ArrowUp','ArrowDown','PageUp','PageDown','Home','End'].includes(event.key)) stopTravel();
  });
  window.addEventListener('pagehide',stopNavigation);

  function mark(element,kind,delay=0) {
    if(!element) return;
    element.classList.add(kind);
    element.style.setProperty('--flow-delay',`${delay}ms`);
    elements.push(element);
  }
  function start() {
    const body=document.body;
    document.querySelectorAll('#main-scroll h2.titulo-secao').forEach(heading=>{
      const inner=document.createElement('span');
      inner.className='flow-title-inner';
      inner.append(...heading.childNodes);
      heading.append(inner);
      mark(heading,'flow-title');
    });
    mark(document.querySelector('#capa h1'),'flow-item',100);
    mark(document.querySelector('#capa .cover-kicker'),'flow-item',40);
    const about=document.querySelector('#sobre .texto-corpo');
    mark(about,'flow-item',90);
    const profile=document.getElementById('perfil-img');
    mark(profile?.parentElement.parentElement,'flow-portrait');
    mark(profile,'flow-photo',160);
    mark(document.querySelector('#trabalho .comentario-trabalho'),'flow-item',60);
    document.querySelectorAll('#trabalho .list-item').forEach((row,index)=>mark(row,'flow-item',(index%3)*90));
    mark(document.querySelector('.featured-project-link'),'flow-item',80);
    document.querySelectorAll('#portfolio-grid .portfolio-box').forEach((button,index)=>{
      mark(button,'flow-category',index*70);
      button.addEventListener('pointermove',event=>{
        if(!enabled || event.pointerType!=='mouse') return;
        const rect=button.getBoundingClientRect();
        button.style.setProperty('--flow-hover-x',`${(event.clientX-rect.left-rect.width/2)*.016}px`);
        button.style.setProperty('--flow-hover-y',`${(event.clientY-rect.top-rect.height/2)*.035}px`);
      });
      button.addEventListener('pointerleave',()=>{
        button.style.setProperty('--flow-hover-x','0px');
        button.style.setProperty('--flow-hover-y','0px');
      });
    });
    // Controls remain stable; only the contact introduction joins the section entrance.
    mark(document.querySelector('#contato .comentario-trabalho'),'flow-item',80);
    observer=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(!entry.isIntersecting) return;
        entry.target.classList.add('flow-in');
        entry.target.addEventListener('transitionend',()=>entry.target.style.setProperty('--flow-delay','0ms'),{once:true});
        observer.unobserve(entry.target);
      });
    },{threshold:.04,rootMargin:'0px 0px -5% 0px'});
    body.classList.toggle('flow-on',enabled);
    body.classList.toggle('flow-reduced',!enabled);
    elements.forEach(element=>{
      if(enabled) observer.observe(element);
      else element.classList.add('flow-in');
    });

    const header=document.getElementById('sticky-header');
    const links=[...header.querySelectorAll('a[href^="#"]')];
    const sections=[...document.querySelectorAll('#main-scroll > section')];
    const indicator=document.createElement('span');
    indicator.className='flow-nav-indicator'; indicator.setAttribute('aria-hidden','true');
    header.append(indicator);
    let current='';
    function showIndicator(id,force=false) {
      if(!force&&id===current) return;
      current=id;
      const link=links.find(item=>item.getAttribute('href')===`#${id}`);
      if(!link) { indicator.style.opacity='0'; return; }
      const rootRect=header.getBoundingClientRect();
      const rect=link.getBoundingClientRect();
      indicator.style.width=`${rect.width}px`;
      indicator.style.transform=`translate3d(${rect.left-rootRect.left}px,${rect.bottom-rootRect.top+6}px,0)`;
      indicator.style.opacity='1';
    }
    let pending=false;
    function onScroll() {
      if(pending) return;
      pending=true;
      requestAnimationFrame(()=>{
        pending=false;
        const threshold=innerHeight*.42;
        let active='capa';
        sections.forEach(section=>{if(section.getBoundingClientRect().top<=threshold) active=section.id;});
        showIndicator(active);
        const cover=document.getElementById('capa');
        if(enabled&&cover) {
          const top=cover.getBoundingClientRect().top;
          if(top>-innerHeight&&top<innerHeight) {
            const image=cover.querySelector('.capa-img-full');
            if(image) image.style.setProperty('--cover-drift',`${Math.max(0,Math.min(18,-top/innerHeight*18))}px`);
          }
        }
      });
    }
    window.addEventListener('scroll',onScroll,{passive:true});
    window.addEventListener('resize',()=>showIndicator(current,true),{passive:true});
    onScroll();

    preference.addEventListener('change',()=>{
      if(mode==='completo'||mode==='reduzido') return;
      enabled=!preference.matches;
      stopNavigation();
      body.classList.toggle('flow-on',enabled);
      body.classList.toggle('flow-reduced',!enabled);
      if(!enabled) { observer.disconnect(); elements.forEach(element=>element.classList.add('flow-in')); }
    });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start);
  else start();
})();
