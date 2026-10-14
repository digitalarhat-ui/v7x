
(()=>{
  const hero=document.querySelector(".hero");
  const scene=hero?.querySelector(".wr-cinematic-scene");
  if(!scene||window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
  let frame=0,activeTimeout=0,opacity=0,started=false;
  const image=new Image();
  image.decoding="async";
  image.src="https://memoriesforevents.com/dashboard/uploads/halls/04-02-231675485068229934374.jpg";
  const fadeTo=(target,duration)=>{
    cancelAnimationFrame(frame);
    const initial=opacity,start=performance.now();
    const step=now=>{
      const t=Math.min(1,(now-start)/duration),smooth=t*t*(3-2*t);
      opacity=initial+(target-initial)*smooth;
      scene.style.opacity=String(opacity);
      if(t<1)frame=requestAnimationFrame(step);
    };
    frame=requestAnimationFrame(step);
  };
  const cycle=()=>{
    if(document.hidden){activeTimeout=setTimeout(cycle,2600);return}
    fadeTo(opacity>.5?0:1,950);
    activeTimeout=setTimeout(cycle,5600);
  };
  image.onload=()=>{
    if(started)return;
    started=true;
    activeTimeout=setTimeout(cycle,4300);
  };
  if(image.complete&&image.naturalWidth>0)image.onload();
  window.addEventListener("pagehide",()=>{clearTimeout(activeTimeout);cancelAnimationFrame(frame)},{once:true});
})();
