(()=>{
const dialog=document.getElementById('ad-dialog'),video=document.getElementById('ad-full-video'),root=document.documentElement,status=document.getElementById('ad-status');
const names={motion:'Motion',narrado:'Narrado',ugc:'Estilo UGC'};let opener;
const sync=()=>document.dispatchEvent(new Event('landing:demo-visibility'));
document.querySelectorAll('[data-open-ad]').forEach(button=>button.addEventListener('click',()=>{
opener=button;const key=button.dataset.openAd;document.getElementById('ad-title').textContent=names[key];video.setAttribute('aria-label',`Anúncio completo de ${names[key]} com áudio`);status.hidden=true;
root.classList.add('hook-demo-open');dialog.showModal();sync();
video.src=`media/${key}-completo.mp4`;video.muted=false;video.volume=0.5;video.currentTime=0;video.load();
video.play().catch(error=>{if(error.name==='AbortError'||!dialog.open)return;status.textContent='Use o controle de reprodução para assistir.';status.hidden=false});
}));
document.querySelector('[data-close-ad]').addEventListener('click',()=>dialog.close());
document.querySelector('[data-ad-packages]').addEventListener('click',()=>dialog.close());
let backdropDown=false;dialog.addEventListener('pointerdown',event=>{const r=dialog.getBoundingClientRect();backdropDown=event.target===dialog&&(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)});
dialog.addEventListener('click',event=>{const r=dialog.getBoundingClientRect();if(backdropDown&&event.target===dialog&&(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom))dialog.close();backdropDown=false});
dialog.addEventListener('close',()=>{video.pause();video.removeAttribute('src');video.load();root.classList.remove('hook-demo-open');sync();opener?.focus({preventScroll:true})});
video.addEventListener('error',()=>{if(!dialog.open)return;status.textContent='Não foi possível carregar o vídeo. Tente abrir novamente.';status.hidden=false});
document.addEventListener('visibilitychange',()=>{if(document.hidden)video.pause()});
})();
