
const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];

function keyFor(el){
  return location.pathname + "::" + (el.dataset.key || el.name || el.id || "");
}
function loadInputs(){
  $$("[data-save]").forEach(el=>{
    const v = localStorage.getItem(keyFor(el));
    if(v !== null){
      if(el.type === "checkbox") el.checked = v === "1";
      else el.value = v;
    }
    el.addEventListener("change", ()=>{
      localStorage.setItem(keyFor(el), el.type === "checkbox" ? (el.checked?"1":"0") : el.value);
    });
    el.addEventListener("input", ()=>{
      if(el.type !== "checkbox") localStorage.setItem(keyFor(el), el.value);
    });
  });
}
function highlightToday(){
  const names=["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];
  const day=names[new Date().getDay()];
  const card=document.querySelector(`[data-day="${day}"]`);
  if(card) card.classList.add("today");
}
let timerId=null, endAt=0;
function startTimer(sec){
  clearInterval(timerId);
  endAt=Date.now()+sec*1000;
  const box=$("#restTimer"), out=$("#timerOut");
  box.classList.add("show");
  const tick=()=>{
    const left=Math.max(0,Math.ceil((endAt-Date.now())/1000));
    const m=Math.floor(left/60), s=left%60;
    out.textContent=`${m}:${String(s).padStart(2,"0")}`;
    if(left<=0){clearInterval(timerId); if(navigator.vibrate) navigator.vibrate([200,100,200]);}
  };
  tick(); timerId=setInterval(tick,250);
}
function closeTimer(){ clearInterval(timerId); $("#restTimer")?.classList.remove("show"); }
function clearWorkout(){
  if(!confirm("Clear the saved checkboxes, weights, and notes on this page?")) return;
  $$("[data-save]").forEach(el=>{
    localStorage.removeItem(keyFor(el));
    if(el.type==="checkbox") el.checked=false; else el.value="";
  });
}
function saveProgress(){
  const fields=["weight","waist","broad","sprint","frontsquat","trapbar"];
  fields.forEach(id=>{
    const el=$("#"+id); if(el) localStorage.setItem("progress::"+id, el.value);
  });
  renderProgress();
}
function renderProgress(){
  const ids=["weight","waist","broad","sprint","frontsquat","trapbar"];
  ids.forEach(id=>{const el=$("#"+id); if(el){const v=localStorage.getItem("progress::"+id); if(v!==null)el.value=v;}});
  const start=235, goal=195;
  const w=parseFloat(localStorage.getItem("progress::weight")||"235");
  const pct=Math.max(0,Math.min(100,((start-w)/(start-goal))*100));
  const bar=$("#goalBar"); if(bar) bar.style.width=pct+"%";
  const txt=$("#goalText"); if(txt) txt.textContent=`${w.toFixed(1)} lb current • ${Math.max(0,w-goal).toFixed(1)} lb to goal`;
}
window.addEventListener("DOMContentLoaded", ()=>{
  loadInputs(); highlightToday(); renderProgress();
  $$(".timer-btn").forEach(b=>b.addEventListener("click",()=>startTimer(parseInt(b.dataset.seconds))));
  $("#clearWorkout")?.addEventListener("click",clearWorkout);
  $("#saveProgress")?.addEventListener("click",saveProgress);
  $("#timerClose")?.addEventListener("click",closeTimer);
});
if("serviceWorker" in navigator){window.addEventListener("load",()=>navigator.serviceWorker.register("./service-worker.js"));}
