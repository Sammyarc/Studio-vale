import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

/** All timelines are scoped and reverted, including when the OS motion preference changes. */
export function useBrandMotion(reduced: boolean) {
  useEffect(() => {
    if(reduced)return;
    const cleanups: (()=>void)[]=[];
    const ctx=gsap.context(()=>{
      const hero=document.querySelector('.hero-copy,.property-hero-copy,.fashion-hero-copy');
      if(hero){
        const heading=hero.querySelector('h1');
        gsap.fromTo(heading,{clipPath:'inset(0 0 100% 0)',y:28},{clipPath:'inset(0 0 0% 0)',y:0,duration:1.15,ease:'power4.out',delay:.12,clearProps:'clipPath,transform'});
        gsap.fromTo(hero.querySelectorAll('p,.button'),{y:18,opacity:0},{y:0,opacity:1,stagger:.09,duration:.85,delay:.3,ease:'power3.out',clearProps:'transform,opacity'});
      }
      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach(el=>{
        gsap.from(el,{y:28,opacity:0,duration:.85,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 92%',once:true},clearProps:'transform,opacity'});
        const heading=el.querySelector('h2');
        if(heading)gsap.from(heading,{clipPath:'inset(0 0 95% 0)',duration:1.05,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 92%',once:true},clearProps:'clipPath'});
      });
      const images=gsap.utils.toArray<HTMLElement>('.craft-image,.living-image,.story-photo,.property-hero-image,.campaign-photo');
      images.forEach((frame)=>{
        const img=frame.querySelector('img');if(!img)return;
        gsap.from(frame,{clipPath:'inset(12% 6% 12% 6%)',duration:1.3,ease:'power4.out',scrollTrigger:{trigger:frame,start:'top 88%',once:true},clearProps:'clipPath'});
        gsap.fromTo(img,{yPercent:-4,scale:1.1},{yPercent:4,scale:1.1,ease:'none',scrollTrigger:{trigger:frame,start:'top bottom',end:'bottom top',scrub:1.2}});
      });
      const car=document.querySelector('.hero-car');
      if(car)gsap.fromTo(car,{scale:1.06,yPercent:0},{scale:1.13,yPercent:7,ease:'none',scrollTrigger:{trigger:'.car-hero',start:'top top',end:'bottom top',scrub:1.1}});
      const cards=gsap.utils.toArray<HTMLElement>('.property-card,.product-card,.fashion-promises article');
      cards.forEach((card,index)=>gsap.from(card,{y:35,opacity:0,duration:.8,delay:(index%3)*.07,ease:'power3.out',scrollTrigger:{trigger:card,start:'top 96%',once:true},clearProps:'transform,opacity'}));
      const star=document.querySelector('.story-asterisk');
      if(star)gsap.to(star,{rotation:130,ease:'none',scrollTrigger:{trigger:'.fashion-story',start:'top bottom',end:'bottom top',scrub:1}});
      const rule=document.querySelector('.route-line');
      if(rule)gsap.from(rule,{scaleX:0,transformOrigin:'left',duration:1.5,ease:'power2.inOut',scrollTrigger:{trigger:'.drive-cta',start:'top 80%',once:true}});
      // Restrained pointer response on the automotive product image, only with a fine pointer.
      if(matchMedia('(hover: hover) and (pointer: fine)').matches){
        const frame=document.querySelector<HTMLElement>('.model-photo');
        const image=frame?.querySelector('img');
        if(frame&&image){
          const x=gsap.quickTo(image,'x',{duration:.9,ease:'power3.out'}),y=gsap.quickTo(image,'y',{duration:.9,ease:'power3.out'});
          const move=(event:PointerEvent)=>{const r=frame.getBoundingClientRect();x((event.clientX-r.left-r.width/2)*.018);y((event.clientY-r.top-r.height/2)*.025);};
          const leave=()=>{x(0);y(0);};frame.addEventListener('pointermove',move);frame.addEventListener('pointerleave',leave);
          cleanups.push(()=>{frame.removeEventListener('pointermove',move);frame.removeEventListener('pointerleave',leave);});
        }
      }
    });
    const refresh=()=>ScrollTrigger.refresh();document.fonts.ready.then(refresh);
    window.addEventListener('load',refresh);
    return()=>{cleanups.forEach(fn=>fn());window.removeEventListener('load',refresh);ctx.revert();};
  },[reduced]);
}

export function CountUp({value}:{value:string}) {
  const ref=useRef<HTMLSpanElement>(null);
  const [display,setDisplay]=useState(value);
  useEffect(()=>{
    if(matchMedia('(prefers-reduced-motion: reduce)').matches){setDisplay(value);return;}
    const number={value:0};const decimals=value.includes('.')?1:0;
    const tween=gsap.to(number,{value:Number(value),duration:1.5,ease:'power3.out',onUpdate:()=>setDisplay(number.value.toFixed(decimals)),scrollTrigger:{trigger:ref.current,start:'top 95%',once:true}});
    return()=>{tween.scrollTrigger?.kill();tween.kill();};
  },[value]);
  return <span ref={ref} aria-label={value}><span aria-hidden="true">{display}</span></span>;
}

export function EditorialRail() {
  const host=useRef<HTMLElement>(null), track=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const media=gsap.matchMedia();
    media.add('(min-width: 901px) and (prefers-reduced-motion: no-preference)',()=>{
      const el=host.current!,rail=track.current!;
      const distance=()=>rail.scrollWidth-el.clientWidth;
      const tween=gsap.to(rail,{x:()=>-distance(),ease:'none',scrollTrigger:{trigger:el,start:'top 100px',end:()=>`+=${distance()+350}`,pin:true,scrub:.8,invalidateOnRefresh:true,anticipatePin:1}});
      return()=>{tween.scrollTrigger?.kill();tween.kill();gsap.set(rail,{clearProps:'transform'});};
    });
    return()=>media.revert();
  },[]);
  const edits=[{image:'blazer.webp',number:'01',title:'The 9-to-whenever.',copy:'A considered shoulder. An unstructured day.',label:'Shop tailoring'},{image:'shirt.webp',number:'02',title:'Out of office.',copy:'Easy layers for a slower kind of Sunday.',label:'Shop essentials'},{image:'tote.webp',number:'03',title:'Take the long way.',copy:'Good company for everything you carry.',label:'Shop accessories'}];
  return <section ref={host} className="editorial-rail" aria-label="Three ways to wear the everyday edit"><div className="edit-heading"><span>THE EVERYDAY, IN THREE ACTS</span><span>Scroll to find your rhythm <span aria-hidden="true">↗</span></span></div><div ref={track} className="edit-track">{edits.map(edit=><article className="edit-panel" key={edit.number}><div className="edit-image"><img src={`/images/${edit.image}`} loading="lazy" alt=""/><span>{edit.number}</span></div><div className="edit-copy"><h2>{edit.title}</h2><p>{edit.copy}</p><a href="#shop">{edit.label}<span aria-hidden="true">↗</span></a></div></article>)}</div></section>;
}
