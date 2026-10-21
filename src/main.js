import './style.css';
import { lessons } from './content.js';

const key = 'little-step-progress-v1';
const empty = () => ({ completed: [], learned: [], days: [], attempts: 0, correct: 0 });
function readProgress() {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    if (!value || !['completed', 'learned', 'days'].every(k => Array.isArray(value[k]) && value[k].every(x => typeof x === 'string')) || !['attempts', 'correct'].every(k => Number.isFinite(value[k]) && value[k] >= 0)) return empty();
    return value;
  } catch { return empty(); }
}
let progress = readProgress();
let page = 'home';
let session = null;
let card = 0;
let flipped = false;
let storageError = false;
const app = document.querySelector('#app');
const words = lessons.flatMap(l => l.words.map((w, i) => ({ id: `${l.id}-${i}`, word: w, category: l.category })));
const today = () => new Date().toLocaleDateString('sv-SE');
const save = () => { try { localStorage.setItem(key, JSON.stringify(progress)); } catch { storageError = true; } };
function streak() {
  let result = 0;
  const date = new Date();
  if (!progress.days.includes(today())) date.setDate(date.getDate() - 1);
  while (progress.days.includes(date.toLocaleDateString('sv-SE'))) { result++; date.setDate(date.getDate() - 1); }
  return result;
}
const icon = (name) => ({ home: '⌂', lessons: '▦', words: '▤', progress: '◷' }[name]);
function render() {
  app.innerHTML = `
    <aside class="sidebar">
      <a class="brand" href="#home" aria-label="Little Step – domů"><span class="brand-symbol">l<span>↗</span></span><span>little step<span class="brand-dot">.</span></span></a>
      <div class="workspace-label">TVŮJ KOUSEK ANGLIČTINY</div>
      <nav aria-label="Hlavní navigace">${[['home','Můj přehled'],['lessons','Lekce'],['words','Slovíčka'],['progress','Můj pokrok']].map(([id,title])=>`<a href="#${id}" class="nav-link ${page===id?'active':''}" ${page===id?'aria-current="page"':''}><span aria-hidden="true">${icon(id)}</span>${title}${id==='lessons'?'<small>4</small>':''}</a>`).join('')}</nav>
      <div class="sidebar-note"><span class="note-spark">✳</span><strong>Malé kroky.<br>Velké možnosti.</strong><p>I pět minut denně<br>dělá rozdíl.</p><div class="note-line"></div></div>
      <div class="profile"><div class="avatar">T</div><div><strong>Tvůj učební prostor</strong><span>Úroveň A1 · začátečník</span></div></div>
    </aside>
    <main>
      <header class="topbar"><span>Angličtina pro každý den <span class="header-dot">·</span> <span class="muted">Pěkně po svém.</span></span><div class="topbar-right"><span class="level-pill"><span class="level-dot"></span> Začátečník · A1</span><span class="mini-avatar" aria-hidden="true">T</span></div></header>
      <div class="main-content">${page==='home'?home():page==='lessons'?lessonPage():page==='words'?wordPage():progressPage()}
      ${storageError?'<p class="storage-warning" role="status">Prohlížeč nepovolil uložení pokroku. Pokrok zůstane jen do zavření této stránky.</p>':''}
      <footer><span>little step. <span class="footer-divider">/</span> Každé nové slovo otevírá dveře.</span><span>Vytvořeno pro zvídavé hlavy <span class="footer-flower">✳</span></span></footer></div>
    </main>
    <dialog id="practice" aria-labelledby="practice-title"></dialog>`.replaceAll('↗', '<svg class="arrow-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 18 18 6M6 6h12v12"/></svg>');
  bind();
}
function heading(eyebrow, title, sub) { return `<div class="page-heading"><div><p class="eyebrow">${eyebrow}</p><h1>${title}</h1><p class="subtitle">${sub}</p></div><span class="date-label">${new Date().toLocaleDateString('cs-CZ',{day:'numeric',month:'long'})}</span></div>`; }
function home() {
  const next = lessons.find(l=>!progress.completed.includes(l.id)) || lessons[0];
  return `${heading('MALÝ KROK, KAŽDÝ DEN','Hello, nový den<span class="wave">✺</span>','Na velké cíle stačí malé kroky. Dáme si dnes trochu angličtiny?')}
    <section class="hero"><div class="hero-copy"><span class="hero-badge"><span></span> TVÝCH 5 MINUT PRO SEBE</span><h2>Svět je větší,<br>když mu <em>rozumíš.</em></h2><p>Slovíčko po slovíčku. Vlastním tempem.<br>Angličtina, kterou opravdu použiješ.</p><button class="button button-dark" data-start="${next.id}">${progress.completed.length?'Pokračovat v učení':'Začít první lekci'} <span>↗</span></button><span class="hero-caption">Bez stresu. Chyby jsou součást cesty.</span></div>
      <div class="hero-art" aria-hidden="true"><span class="art-orbit orbit-one"></span><span class="art-orbit orbit-two"></span><span class="art-star star-one">✳</span><span class="art-star star-two">✦</span><div class="speech speech-hi">Hello! <span>✺</span></div><div class="passport"><span class="passport-label">A LITTLE STEP TO</span><div class="passport-globe">◎</div><strong>everywhere.</strong><span class="passport-bottom">YOUR NEXT CHAPTER ↗</span></div><div class="speech speech-ahoj">Ahoj! <span>↗</span></div><span class="art-dots">·······</span></div>
    </section>
    <section class="stats" aria-label="Tvůj pokrok"><div class="stat"><span class="stat-icon green">♨</span><div><strong>${streak()} <span>dní v řadě</span></strong><p>${streak()?'Jen tak dál!':'Dnes může začít tvá série.'}</p></div></div><div class="stat"><span class="stat-icon lavender">▤</span><div><strong>${progress.learned.length} <span>slovíček</span></strong><p>Každé se jednou bude hodit.</p></div></div><div class="stat"><span class="stat-icon peach">⚑</span><div><strong>${progress.completed.length} <span>hotové lekce</span></strong><p>Malé úspěchy se počítají.</p></div></div></section>
    <section><div class="section-heading"><div><p class="eyebrow">PŘIPRAVENO PRO TEBE</p><h2>Kam se dnes vydáme?</h2></div><a href="#lessons" class="text-link">Všechny lekce <span>↗</span></a></div><div class="lesson-grid">${lessons.slice(0,3).map(lessonCard).join('')}</div></section>
    <section class="daily-note"><div class="daily-icon">“</div><div><span class="eyebrow">MALÁ PŘIPOMÍNKA</span><p>Nemusíš umět všechno. Stačí začít jedním slovem.</p></div><span class="daily-flower" aria-hidden="true">✳</span></section>`;
}
function lessonCard(l) {
  const done = progress.completed.includes(l.id);
  return `<button class="lesson-card" data-start="${l.id}"><div class="card-top"><span class="lesson-icon ${l.color}" aria-hidden="true">${l.icon}</span><span class="lesson-level">A1 <span>·</span> 5 min</span></div><span class="card-category">${l.category}</span><h3>${l.title}</h3><p>${l.description}</p><div class="card-bottom"><span>${done?'✓ Dokončeno · zopakovat':'5 slovíček · krátký kvíz'}</span><span class="card-arrow">↗</span></div></button>`;
}
function lessonPage() { return `${heading('POZNÁVEJ A PROCVIČUJ','Tvoje další malé kroky','Praktická angličtina pro situace, které znáš. Vyber si, co tě láká.')}<div class="filter-label"><span class="level-dot"></span> Začátečník A1 <span>4 lekce · 20 slovíček</span></div><section class="lesson-grid all-lessons">${lessons.map(lessonCard).join('')}</section>`; }
function wordPage() {
  const item = words[card];
  return `${heading('SLOVÍČKO PO SLOVÍČKU','Malá slova, velký svět','Otoč kartičku, poslechni si výslovnost a zkus si překlad vybavit.')}<div class="vocab-toolbar"><span>${item.category}</span><span>${card+1} / ${words.length}</span></div><button class="flashcard" id="flip" aria-label="Otočit kartičku"><span class="eyebrow">${flipped?'ČESKY':'ANGLICKY'}</span><strong lang="${flipped?'cs':'en'}">${item.word[flipped?1:0]}</strong><p lang="${flipped?'cs':'en'}">${item.word[flipped?3:2]}</p><span class="flip-hint">↻ Klikni pro ${flipped?'angličtinu':'překlad'}</span></button><div class="vocab-actions"><button class="button button-outline" id="prev-word" ${card===0?'disabled':''}>← Předchozí</button><button class="button button-outline" id="speak">◖ Poslechnout</button><button class="button button-dark" id="next-word">${card===words.length-1?'Znovu od začátku':'Další slovíčko'} →</button></div><p class="vocab-note" id="speech-status" role="status">Slovíčka si upevníš v kvízu na konci každé lekce.</p>`;
}
function progressPage() {
  const pct = Math.round(progress.completed.length / lessons.length * 100);
  return `${heading('KAŽDÝ KROK SE POČÍTÁ','Podívej, kam už jsi došel','Tvůj pokrok se ukládá do tohoto prohlížeče. Vracej se a pokračuj.')}<section class="progress-panel"><div class="progress-circle" style="--pct:${pct}%"><span>${pct}<small>%</small></span></div><div><span class="eyebrow">TVOJE CESTA ÚROVNÍ A1</span><h2>${progress.completed.length} ze ${lessons.length} lekcí za tebou</h2><p>${progress.completed.length?'Každá dokončená lekce je další krok k jistotě.':'První krok je ten nejdůležitější. Jdeme na něj?'}</p><button class="button button-dark" data-start="${(lessons.find(l=>!progress.completed.includes(l.id))||lessons[0]).id}">Pustit se do učení ↗</button></div></section><section class="progress-numbers"><div><strong>${progress.learned.length}</strong><span>procvičených slovíček</span></div><div><strong>${streak()}</strong><span>dní v aktuální sérii</span></div><div><strong>${progress.attempts?Math.round(progress.correct/progress.attempts*100)+' %':'—'}</strong><span>správných odpovědí ze všech pokusů</span></div></section><div class="section-heading"><h2>Tvoje lekce</h2></div><div class="lesson-grid all-lessons">${lessons.map(lessonCard).join('')}</div>`;
}
function bind() {
  document.querySelectorAll('[data-start]').forEach(el=>el.addEventListener('click',()=>startLesson(el.dataset.start)));
  document.querySelector('#flip')?.addEventListener('click',()=>{flipped=!flipped; render();document.querySelector('#flip').focus();});
  document.querySelector('#prev-word')?.addEventListener('click',()=>{card=Math.max(0,card-1);flipped=false;render();document.querySelector('#prev-word').focus();});
  document.querySelector('#next-word')?.addEventListener('click',()=>{card=(card+1)%words.length;flipped=false;render();document.querySelector('#next-word').focus();});
  document.querySelector('#speak')?.addEventListener('click',()=>speak(words[card].word[0]));
}
function speak(text) {
  const status = document.querySelector('#speech-status');
  if (!('speechSynthesis' in window)) { if(status)status.textContent='Tento prohlížeč nepodporuje hlasovou výslovnost.';return; }
  const utterance = new SpeechSynthesisUtterance(text); utterance.lang='en-GB'; utterance.rate=0.85;
  utterance.onerror=()=>{if(status)status.textContent='Výslovnost není nyní dostupná. Zkus jiný prohlížeč s anglickým hlasem.';};
  speechSynthesis.cancel();speechSynthesis.speak(utterance);
}
function shuffle(list) {
  const result=[...list];
  for(let i=result.length-1;i>0;i--) {
    const j=Math.floor(Math.random()*(i+1));
    [result[i],result[j]]=[result[j],result[i]];
  }
  return result;
}
function startLesson(id) {
  session={lesson:lessons.find(l=>l.id===id),stage:'learn',index:0,correct:0,answers:[],answered:false};
  const dialog = document.querySelector('#practice');
  dialog.addEventListener('cancel',(event)=>{event.preventDefault();dialog.close();session=null;render();});
  renderPractice();dialog.showModal();
}
function renderPractice() {
  const dialog = document.querySelector('#practice');
  const s=session,l=s.lesson,w=l.words[s.index];
  const close='<button class="close-dialog" aria-label="Zavřít lekci">×</button>';
  if(s.stage==='done') {
    const perfect=s.correct===l.words.length;
    dialog.innerHTML=`${close}<div class="result-icon">${perfect?'✳':'↗'}</div><p class="eyebrow">DALŠÍ MALÝ KROK ZA TEBOU</p><h2 id="practice-title">${perfect?'Skvělá práce!':'Dobrý začátek!'}</h2><p>Správně ${s.correct} z ${l.words.length} odpovědí.</p><p>${perfect?'Lekce je dokončená. Těchto pět slov už tě jen tak nezaskočí.':'Pro dokončení lekce zkus správně zodpovědět všech pět otázek. S opakováním to půjde.'}</p><div class="result-actions"><button class="button button-outline" id="retry">Zopakovat lekci</button><button class="button button-dark" id="finish">Zpět na přehled ↗</button></div>`;
    dialog.querySelector('#retry').onclick=()=>{session={lesson:l,stage:'learn',index:0,correct:0,answers:[],answered:false};renderPractice();};
    dialog.querySelector('#finish').onclick=()=>{dialog.close();session=null;render();};
  } else {
    const quiz=s.stage==='quiz';
    dialog.innerHTML=`${close}<p class="eyebrow">${l.title} · ${quiz?'KRÁTKÝ KVÍZ':'NEJDŘÍV SE SEZNAMTE'}</p><div class="lesson-progress"><span style="width:${s.index/l.words.length*100}%"></span></div><span class="step-count">${s.index+1} / ${l.words.length}</span><h2 id="practice-title">${quiz?'Co znamená „'+w[0]+'“?':w[0]}</h2>${quiz?`<p>Vyber správný český překlad.</p><div class="answers">${shuffle(l.words.map(x=>x[1])).map((answer,i)=>`<button class="answer" data-answer="${l.words.findIndex(x=>x[1]===answer)}"><span>${i+1}</span>${answer}</button>`).join('')}</div><div id="feedback" role="status"></div><button class="button button-dark continue-button" id="continue" hidden>${s.index===4?'Zobrazit výsledek':'Další otázka'} →</button>`:`<p class="translation">${w[1]}</p><div class="example"><p lang="en">${w[2]}</p><span>${w[3]}</span></div><button class="button button-outline" id="listen">◖ Poslechnout výslovnost</button><div class="learn-bottom"><span>Řekni si slovíčko nahlas.</span><button class="button button-dark" id="learn-next">${s.index===4?'Jdeme na kvíz':'Další slovíčko'} →</button></div>`}`;
    if(!quiz) {
      dialog.querySelector('#listen').onclick=()=>speak(w[0]);
      dialog.querySelector('#learn-next').onclick=()=>{s.index++;if(s.index===5){s.stage='quiz';s.index=0;}renderPractice();};
    } else {
      dialog.querySelectorAll('[data-answer]').forEach(button=>button.onclick=()=>{
        if(s.answered)return;s.answered=true;
        const right=Number(button.dataset.answer)===s.index;
        if(right) {s.correct++;s.answers.push(`${l.id}-${s.index}`);}
        dialog.querySelectorAll('[data-answer]').forEach(b=>{b.disabled=true;if(Number(b.dataset.answer)===s.index)b.classList.add('correct');});
        if(!right)button.classList.add('wrong');
        dialog.querySelector('#feedback').textContent=right?'✓ Přesně tak!':`Ještě si to připomeneme: ${w[0]} = ${w[1]}.`;
        dialog.querySelector('#continue').hidden=false;dialog.querySelector('#continue').focus();
      });
      dialog.querySelector('#continue').onclick=()=>{
        if(!s.answered)return;
        s.index++;s.answered=false;
        if(s.index===5) {
          s.stage='done';progress.attempts+=5;progress.correct+=s.correct;
          progress.learned=[...new Set([...progress.learned,...s.answers])];
          if(s.correct===5)progress.completed=[...new Set([...progress.completed,l.id])];
          progress.days=[...new Set([...progress.days,today()])];save();
        }
        renderPractice();
      };
    }
  }
  dialog.querySelector('.close-dialog').onclick=()=>{dialog.close();session=null;render();};
  // Move focus away from controls replaced by the next step.
  dialog.querySelector('h2').tabIndex=-1;dialog.querySelector('h2').focus();
}
function navigate() {
  const next=location.hash.slice(1)||'home';page=['home','lessons','words','progress'].includes(next)?next:'home';
  session=null;render();window.scrollTo(0,0);
}
window.addEventListener('hashchange',navigate);
navigate();
