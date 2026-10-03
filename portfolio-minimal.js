(() => {
  function start() {
    const grid=document.getElementById('portfolio-grid');
    if(!grid) return;
    const creatorNames=['Vídeos Diários','Highlights','Produções Documentais','Aberturas e Trailers','Institucionais'];
    grid.querySelectorAll('.portfolio-box').forEach((button,index)=>{
      const name=document.body.dataset.application==='creators' ? creatorNames[index] : button.dataset.category;
      if(!name) return;
      const label=document.createElement('span');
      label.className='brand-category-label'; label.textContent=name.toLocaleUpperCase('pt-BR');
      button.replaceChildren(label);
      button.setAttribute('aria-label',name + '. Ver trabalhos');
    });
    grid.classList.add('portfolio-minimal');
    // Preserve category names used by the existing active-state comparison.
    document.querySelectorAll('#category-nav button').forEach(button=>{
      const normalized=creatorNames.find(name=>name.toLocaleLowerCase('pt-BR')===button.textContent.trim().replace(/\s+/g,' ').toLocaleLowerCase('pt-BR'));
      if(normalized) button.textContent=normalized;
    });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start);
  else start();
})();
