import { Children, isValidElement, useEffect, useId, useLayoutEffect, useRef, useState, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from 'react';
import { createPortal } from 'react-dom';
import { ArrowUpRight, Check, ChevronDown, ChevronLeft, ChevronRight, X } from 'lucide-react';
import gsap from 'gsap';

// Text entry keeps native editing, autofill and validation; its visual system is custom.
export function Input({className = '', ...props}: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`crafted-input ${props.type === 'checkbox' ? 'crafted-checkbox' : ''} ${className}`} />;
}

function useFloating(open: boolean, trigger: React.RefObject<HTMLButtonElement | null>, panel: React.RefObject<HTMLDivElement | null>, close: () => void) {
  const [position, setPosition] = useState({top: 0, left: 0, width: 0, maxHeight: 300});
  const [host, setHost] = useState<HTMLElement | null>(null);
  useLayoutEffect(() => {
    if (!open || !trigger.current) return;
    setHost(trigger.current.closest('dialog') || document.body);
    if (!panel.current) {
      const r = trigger.current.getBoundingClientRect();
      const width = Math.min(Math.max(r.width, 280), innerWidth - 24);
      setPosition({top: r.bottom + 8, left: Math.max(12, Math.min(r.left, innerWidth - width - 12)), width, maxHeight: 360});
      return;
    }
    const update = () => {
      if (!trigger.current || !panel.current) return;
      const r = trigger.current.getBoundingClientRect();
      const width = Math.min(Math.max(r.width, 280), innerWidth - 24);
      // Measure at the final width, including the border, before choosing a side.
      panel.current.style.width = `${width}px`;
      const contentHeight = Math.min(360, panel.current.scrollHeight + panel.current.offsetHeight - panel.current.clientHeight);
      const below = Math.max(0, innerHeight - r.bottom - 20);
      const above = Math.max(0, r.top - 20);
      const placeBelow = below >= contentHeight || below >= above;
      const maxHeight = Math.min(360, placeBelow ? below : above);
      const top = placeBelow ? r.bottom + 8 : r.top - Math.min(contentHeight, maxHeight) - 8;
      const next = {left: Math.max(12, Math.min(r.left, innerWidth - width - 12)), top, width, maxHeight};
      setPosition(previous => Object.keys(next).every(key => previous[key as keyof typeof next] === next[key as keyof typeof next]) ? previous : next);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(panel.current);
    return () => observer.disconnect();
  }, [open, host, trigger, panel]);
  useEffect(() => {
    if (!open) return;
    const outside = (e: PointerEvent) => {if (!panel.current?.contains(e.target as Node) && !trigger.current?.contains(e.target as Node)) close();};
    const scroll = (e: Event) => {if (!panel.current?.contains(e.target as Node)) close();};
    const resize = () => close();
    document.addEventListener('pointerdown', outside);
    window.addEventListener('resize', resize);
    window.addEventListener('wheel', scroll, {passive:true});
    window.addEventListener('touchmove', scroll, {passive:true});
    window.addEventListener('scroll', scroll, true);
    return () => {document.removeEventListener('pointerdown', outside); window.removeEventListener('resize', resize); window.removeEventListener('wheel', scroll); window.removeEventListener('touchmove', scroll); window.removeEventListener('scroll', scroll, true);};
  }, [open, close, panel, trigger]);
  return {position, host};
}

type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange' | 'value'> & {value?: string; onChange?: (event: {target: {value: string}}) => void};
export function Select({children, value, defaultValue, onChange, name, 'aria-label': label, disabled, className = ''}: SelectProps) {
  const options = Children.toArray(children).filter(isValidElement).map(child => {
    const props = child.props as {value?: string; children: ReactNode};
    return {value: String(props.value ?? props.children), label: String(props.children)};
  });
  const [internal, setInternal] = useState(String(defaultValue ?? options[0]?.value ?? ''));
  const selected = value ?? internal;
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const trigger = useRef<HTMLButtonElement>(null), panel = useRef<HTMLDivElement>(null);
  const id = useId();
  const search = useRef(''), lastKey = useRef(0);
  const {position, host} = useFloating(open, trigger, panel, () => setOpen(false));
  const choose = (index: number) => {const next = options[index].value; setInternal(next); onChange?.({target: {value: next}}); setOpen(false); trigger.current?.focus();};
  const show = () => {setActive(Math.max(0, options.findIndex(o => o.value === selected))); setOpen(true);};
  useEffect(() => {if (open) panel.current?.focus({preventScroll: true});}, [open, host]);
  useEffect(() => {
    const option = panel.current?.querySelector<HTMLElement>(`[data-index="${active}"]`);
    const list = panel.current;
    if (!option || !list) return;
    if (option.offsetTop < list.scrollTop) list.scrollTop = option.offsetTop;
    if (option.offsetTop + option.offsetHeight > list.scrollTop + list.clientHeight) list.scrollTop = option.offsetTop + option.offsetHeight - list.clientHeight;
  }, [active, open]);
  return <span className={`custom-select ${className}`}>
    {name && <input type="hidden" name={name} value={selected} />}
    <button ref={trigger} type="button" className="select-trigger" role="combobox" aria-label={label} aria-expanded={open} aria-haspopup="listbox" aria-controls={id} disabled={disabled} onClick={() => open ? setOpen(false) : show()} onKeyDown={e => {if (['ArrowDown','ArrowUp','Home','End'].includes(e.key)) {e.preventDefault(); show();}}}>
      <span>{options.find(o => o.value === selected)?.label}</span><ChevronDown size={17} />
    </button>
    {open && host && createPortal(<div ref={panel} id={id} className="control-popover select-options" role="listbox" aria-label={label || 'Choose an option'} aria-activedescendant={`${id}-${active}`} tabIndex={-1} style={position} onKeyDown={e => {
      if (e.key === 'Escape') {e.preventDefault(); e.stopPropagation(); setOpen(false); trigger.current?.focus();}
      else if (e.key === 'Tab') {setOpen(false); trigger.current?.focus();}
      else if (e.key === 'Enter' || e.key === ' ') {e.preventDefault(); choose(active);}
      else if (['ArrowDown','ArrowUp','Home','End'].includes(e.key)) {e.preventDefault(); setActive(e.key === 'Home' ? 0 : e.key === 'End' ? options.length-1 : (active + (e.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length);}
      else if (e.key.length === 1) {search.current = Date.now()-lastKey.current > 700 ? e.key : search.current+e.key; lastKey.current=Date.now(); const index=options.findIndex(o=>o.label.toLowerCase().startsWith(search.current.toLowerCase())); if(index>=0)setActive(index);}
    }}>{options.map((option, index) => <div key={option.value} id={`${id}-${index}`} role="option" aria-selected={option.value === selected} data-index={index} className={active === index ? 'is-active' : ''} onPointerMove={() => setActive(index)} onClick={() => choose(index)}><span>{option.label}</span>{option.value === selected && <Check size={17} />}</div>)}</div>, host)}
  </span>;
}

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
export function DatePicker({name, min, required, label = 'Preferred date'}: {name: string; min: string; required?: boolean; label?: string}) {
  const earliest = new Date(`${min}T12:00:00`);
  const [date, setDate] = useState('');
  const [month, setMonth] = useState(new Date(earliest.getFullYear(), earliest.getMonth(), 1));
  const [open, setOpen] = useState(false);
  const trigger=useRef<HTMLButtonElement>(null), panel=useRef<HTMLDivElement>(null);
  const id=useId();
  const {position, host}=useFloating(open,trigger,panel,()=>setOpen(false));
  const days=new Date(month.getFullYear(),month.getMonth()+1,0).getDate();
  const offset=(month.getDay()+6)%7;
  useEffect(()=>{if(open && host) panel.current?.querySelector<HTMLButtonElement>('[data-selected="true"],.calendar-days button:not(:disabled)')?.focus({preventScroll:true});},[open,host,month]);
  const moveMonth=(step:number)=>setMonth(new Date(month.getFullYear(),month.getMonth()+step,1));
  return <span className="custom-date">
    <input className="date-validation" tabIndex={-1} aria-label={`${label} value`} name={name} required={required} value={date} onChange={()=>{}} onInvalid={e=>{e.preventDefault();setOpen(true);}} />
    <button ref={trigger} type="button" className="select-trigger" aria-label={label} aria-haspopup="dialog" aria-expanded={open} aria-controls={id} onClick={()=>setOpen(!open)}><span>{date ? new Date(`${date}T12:00:00`).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}) : 'Choose a date'}</span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 2v6M17 2v6M3 11h18"/></svg></button>
    {open && host && createPortal(<div ref={panel} id={id} className="control-popover calendar" role="dialog" aria-label="Choose appointment date" style={position} onKeyDown={e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();setOpen(false);trigger.current?.focus();}}}>
      <div className="calendar-heading"><button type="button" aria-label="Previous month" disabled={month.getFullYear()===earliest.getFullYear()&&month.getMonth()===earliest.getMonth()} onClick={()=>moveMonth(-1)}><ChevronLeft size={18}/></button><strong aria-live="polite">{month.toLocaleDateString('en-GB',{month:'long',year:'numeric'})}</strong><button type="button" aria-label="Next month" onClick={()=>moveMonth(1)}><ChevronRight size={18}/></button></div>
      <div className="calendar-week" aria-hidden="true">{['M','T','W','T','F','S','S'].map((day,i)=><span key={i}>{day}</span>)}</div>
      <div className="calendar-days" onKeyDown={e=>{const step:Record<string,number>={ArrowRight:1,ArrowLeft:-1,ArrowDown:7,ArrowUp:-7}; if(step[e.key]){e.preventDefault();const buttons=[...panel.current!.querySelectorAll<HTMLButtonElement>('.calendar-days button')]; const index=buttons.indexOf(e.target as HTMLButtonElement); const target=buttons[index+step[e.key]]; if(target&&!target.disabled)target.focus();}}}>
        {Array.from({length:offset},(_,i)=><span key={`blank-${i}`}/>)}
        {Array.from({length:days},(_,i)=>{const d=new Date(month.getFullYear(),month.getMonth(),i+1), val=iso(d);return <button type="button" key={val} disabled={val<min} data-selected={date===val} aria-pressed={date===val} aria-label={d.toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})} onClick={()=>{setDate(val);setOpen(false);trigger.current?.focus();}}>{i+1}</button>;})}
      </div><p className="calendar-note">Choose a day that works for you.</p>
    </div>,host)}
  </span>;
}

export type MenuLink = {label:string; href:string; description:string};
export function MenuButton({open,onClick}:{open:boolean;onClick:()=>void}) {
  return <button className="mobile-menu-button menu-toggle" aria-label="Toggle navigation" aria-expanded={open} aria-controls="mobile-navigation" onClick={onClick}><span className="menu-toggle-label">Menu</span><span className={`hamburger ${open?'is-open':''}`} aria-hidden="true"><i/><i/></span></button>;
}
export function MobileMenu({open,onClose,brand,tagline,links,feature,action}:{open:boolean;onClose:()=>void;brand:string;tagline:string;links:MenuLink[];feature:{image?:string;eyebrow:string;title:string;href:string};action?:{label:string;onClick:()=>void}}) {
  const dialog=useRef<HTMLDialogElement>(null), sheet=useRef<HTMLDivElement>(null), backdrop=useRef<HTMLDivElement>(null);
  const closing=useRef(false), drag=useRef<{y:number;time:number}|null>(null);
  const closeRef=useRef(onClose);closeRef.current=onClose;
  const reduced=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finishClose=(after?:()=>void)=>{
    if(closing.current)return;closing.current=true;
    gsap.killTweensOf([sheet.current,backdrop.current]);
    const duration=reduced()?0:.32;
    gsap.to(backdrop.current,{opacity:0,duration});
    gsap.to(sheet.current,{y:'105%',duration,ease:'power3.in',onComplete:()=>{closeRef.current();after?.();}});
  };
  useEffect(()=>{
    if(!open)return;
    const el=dialog.current!;closing.current=false;
    const previous=document.activeElement as HTMLElement;
    const old=document.body.style.overflow;
    document.body.style.overflow='hidden';
    el.showModal();
    gsap.fromTo(backdrop.current,{opacity:0},{opacity:1,duration:reduced()?0:.4});
    gsap.fromTo(sheet.current,{y:'105%'},{y:0,duration:reduced()?0:.65,ease:'expo.out'});
    const rows=sheet.current!.querySelectorAll('.sheet-reveal');
    gsap.fromTo(rows,{y:20,opacity:0},{y:0,opacity:1,stagger:reduced()?0:.045,delay:reduced()?0:.12,duration:reduced()?0:.5,ease:'power3.out'});
    const resize=()=>{if(innerWidth>900)finishClose();};window.addEventListener('resize',resize);
    return()=>{gsap.killTweensOf([sheet.current,backdrop.current,...rows]);el.close();document.body.style.overflow=old;previous?.focus({preventScroll:true});window.removeEventListener('resize',resize);};
  },[open]);
  const follow=(href:string)=>finishClose(()=>{const target=document.querySelector(href);target?.scrollIntoView({behavior:reduced()?'auto':'smooth'});if(target instanceof HTMLElement){target.setAttribute('tabindex','-1');target.focus({preventScroll:true});target.addEventListener('blur',()=>target.removeAttribute('tabindex'),{once:true});}});
  return <dialog ref={dialog} id="mobile-navigation" className="menu-dialog" aria-label={`${brand} navigation`} onCancel={e=>{e.preventDefault();finishClose();}}>
    <div ref={backdrop} className="sheet-backdrop" onClick={()=>finishClose()}/>
    <div ref={sheet} className="navigation-sheet">
      <div className="sheet-drag" onPointerDown={e=>{drag.current={y:e.clientY,time:performance.now()};e.currentTarget.setPointerCapture(e.pointerId);}} onPointerMove={e=>{if(drag.current)gsap.set(sheet.current,{y:Math.max(0,e.clientY-drag.current.y)*.85});}} onPointerUp={e=>{if(!drag.current)return;const distance=e.clientY-drag.current.y;const velocity=distance/(performance.now()-drag.current.time);drag.current=null;if(distance>80||velocity>.55)finishClose();else gsap.to(sheet.current,{y:0,duration:.4,ease:'power3.out'});}} onPointerCancel={()=>{drag.current=null;gsap.to(sheet.current,{y:0,duration:.3});}}><span/></div>
      <div className="sheet-heading sheet-reveal"><div><span className="sheet-brand">{brand}</span><p>{tagline}</p></div><button autoFocus className="sheet-close" aria-label="Close navigation" onClick={()=>finishClose()}><X size={20}/></button></div>
      <nav className="sheet-links" aria-label="Main navigation">{links.map((link,index)=><a className="sheet-reveal" href={link.href} key={link.href} onClick={e=>{e.preventDefault();follow(link.href);}}><span className="sheet-link-number">0{index+1}</span><span><strong>{link.label}</strong><small>{link.description}</small></span><ArrowUpRight size={21}/></a>)}</nav>
      <a href={feature.href} className="sheet-feature sheet-reveal" onClick={e=>{e.preventDefault();follow(feature.href);}}>{feature.image&&<img src={feature.image} alt=""/>}<span><small>{feature.eyebrow}</small><strong>{feature.title}</strong></span><ArrowUpRight size={21}/></a>
      <div className="sheet-footer sheet-reveal"><span>Considered in every detail.</span>{action?<button onClick={()=>finishClose(action.onClick)}>{action.label}<ArrowUpRight size={16}/></button>:<span className="sheet-online"><i/>Explore at your pace</span>}</div>
    </div>
  </dialog>;
}
