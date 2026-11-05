// Story Co-Writer UI (vanilla JS). mount(root, app) renders screens; all buttons use data-action → ACTIONS.
(function(g){
'use strict';
const C = g.StoryCore || (typeof require!=='undefined' && require('./core.js'));
const esc = s => String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const WELCOME_KEY='storyCoWriter.welcomeSeen';

function synthPlayer(){
  let ctx=null; return ch=>{ try{ ctx=ctx||new (g.AudioContext||g.webkitAudioContext)(); const len={typewriter:.04,pencil:.07,pageTurn:.22}[ch];
    const buf=ctx.createBuffer(1,ctx.sampleRate*len,ctx.sampleRate), d=buf.getChannelData(0);
    for(let i=0;i<d.length;i++){ const t=i/d.length; d[i]=(Math.random()*2-1)*Math.pow(1-t,ch==='pageTurn'?1.5:4)*(ch==='pencil'?.15:.25); }
    const s=ctx.createBufferSource(), f=ctx.createBiquadFilter(), v=ctx.createGain(); f.type=ch==='typewriter'?'highpass':'bandpass'; f.frequency.value=ch==='typewriter'?2000:ch==='pencil'?4000:1200; v.gain.value=.35;
    s.buffer=buf; s.connect(f).connect(v).connect(ctx.destination); s.start(); }catch(e){} }; }

function themeClass(app){ let t=app.state.settings.theme; if(t==='follow-os') t=(g.matchMedia&&g.matchMedia('(prefers-color-scheme: light)').matches)?'light':'dark'; return 'theme-'+t+(t==='leather'?' theme-dark-base':''); }
const TAB_META={home:['⌂','Home'],characters:['☺','Characters'],settings:['⚙','Settings']};
const tabs = active => `<nav class="tabs">${['home','characters','settings'].map(t=>`<button data-action="tab" data-arg="${t}" class="${active===t?'on':''}"><span class="ticon" aria-hidden="true">${TAB_META[t][0]}</span>${TAB_META[t][1]}</button>`).join('')}</nav>`;
const tags = (kind,arr) => arr.map(v=>`<span class="tag">${esc(v)} <button data-action="removeTag" data-kind="${kind}" data-arg="${esc(v)}" aria-label="remove">×</button></span>`).join('');
function welcomeSeen(storage){ try{ return storage && storage.getItem(WELCOME_KEY)==='1'; }catch(e){ return true; } }
function markWelcomeSeen(storage){ try{ storage && storage.setItem(WELCOME_KEY,'1'); }catch(e){} }

const VIEWS = {
  home(app){ const s=app.state, q=app._q||''; const results=q?app.search(q):[];
    const books=app.visibleBooks(); const archived=s.books.filter(b=>b.archived||b.trashed);
    return `<div class="home-hero"><h1>The Other Writer</h1><p class="hint">Your shelf · write with AI when you want a push</p></div>
    <div class="home-top"><button class="pinned primary" data-action="newBook"><span class="plus">＋</span><br>New book</button>
      <div class="shelf" id="shelf">${books.map(b=>`<div class="book ${app._menu===b.id?'menu-open':''}" data-book="${b.id}">
        <button data-action="openBook" data-arg="${b.id}" style="background:none;border:0">${esc(b.title)}</button>
        <div class="menu"><button data-action="archive" data-arg="${b.id}">Archive</button><button data-action="trash" data-arg="${b.id}">Trash</button></div></div>`).join('')}</div></div>
    ${!books.length?`<div class="empty-state"><b>Start your first book</b><div class="muted">Tap New book — set genre, tone, and a scenario, or skip straight to the page.</div></div>`:''}
    <div class="search-wrap"><span class="ico" aria-hidden="true">⌕</span><input id="search" placeholder="Search all books" value="${esc(q)}" data-input="search"></div>
    <div id="results" class="results">${results.map(r=>{const b=app.book(r.bookId);return `<div><button data-action="openBook" data-arg="${b.id}">${esc(b.title)}${r.where==='chapter'?' — '+esc(b.chapters[r.chapter].title):''}</button></div>`;}).join('')}</div>
    ${archived.length?`<div class="section"><b>Archive / Trash</b>${archived.map(b=>`<div class="settings-row"><span>${esc(b.title)} <span class="muted">(${b.trashed?'trash':'archived'})</span></span> <button data-action="restore" data-arg="${b.id}">Restore</button></div>`).join('')}</div>`:''}
    <p class="warn">Long-press or swipe a book for Archive / Trash.</p>${tabs('home')}`; },
  setup(app){ const d=app.state.draft, sg=d.subgroup;
    return `<h2>${d.editing?'Edit book setup':'New book'}</h2>
    <input class="field" data-input="title" placeholder="Untitled" value="${esc(d.title)}" style="font-size:20px">
    <div class="section"><span class="info" title="Pick one or more genres">i</span><b>Genre</b>
      ${sg?`<div><button data-action="subgroup" data-arg="">‹ All groups</button> <span class="info" title="${esc(C.GENRE_TIPS[sg])}">i</span><b>${esc(sg)}</b></div>
        ${C.GENRE_GROUPS[sg].map(x=>`<button class="chip ${d.genres.includes(x)?'on':''}" data-action="toggleTag" data-kind="genres" data-arg="${esc(x)}">${esc(x)}</button>`).join('')}`
      : Object.keys(C.GENRE_GROUPS).map(x=>`<button data-action="subgroup" data-arg="${esc(x)}"><span class="info" title="${esc(C.GENRE_TIPS[x])}">i</span>${esc(x)} ›</button>`).join('')}
      <div>${tags('genres',d.genres)}</div></div>
    <div class="section"><span class="info" title="Mood of the writing">i</span><b>Tone</b><div>${C.TONES.map(x=>`<button class="chip ${d.tones.includes(x)?'on':''}" data-action="toggleTag" data-kind="tones" data-arg="${x}">${x}</button>`).join('')}</div><div>${tags('tones',d.tones)}</div></div>
    <div class="section"><span class="info" title="Premise for the AI">i</span><b>Scenario</b><textarea class="field" data-input="scenario" placeholder="Describe your story world">${esc(d.scenario)}</textarea></div>
    <div class="section"><span class="info" title="Target size">i</span><b>Length goal</b><div>${C.LENGTH_GOALS.map(x=>`<button class="chip ${d.length===x?'on':''}" data-action="length" data-arg="${x}">${x}</button>`).join('')}</div></div>
    <div class="section"><span class="info" title="Who's in the story">i</span><b>Character choice</b><div>${C.CHARACTER_CHOICES.map(x=>`<button class="chip ${d.characterChoice===x?'on':''}" data-action="charChoice" data-arg="${x}">${x}</button>`).join('')}</div>
      <div>${d.characters.map(c=>`<span class="tag">${esc(c.name)}${c.role?' · '+esc(c.role):''} <button data-action="removeChar" data-arg="${esc(c.name)}">×</button></span>`).join('')}</div></div>
    <div class="ai-bar"><button data-action="saveDraft">Save draft</button><button class="primary" data-action="continueToWrite">Continue to write</button></div>
    <div><button class="ghost" data-action="skipSetup">Skip setup</button><div class="warn">You can always add genres, tones, and scenarios later in settings.</div></div>
    ${app._flash?`<div class="saved">${esc(app._flash)}</div>`:''}<button data-action="tab" data-arg="home">‹ Back</button>`; },
  chapterTitle(){ return `<h2>Name your first chapter</h2><input class="field" id="chTitle" placeholder="Chapter 1" style="font-size:20px"><p class="warn">Leave blank for "Chapter 1".</p>
    <button class="primary" data-action="confirmChapter">Continue</button>`; },
  writing(app){ const s=app.state, b=app.book(); if(!b) return '<p>No book</p>'+tabs('home'); const ch=b.chapters[s.currentChapter], st=s.settings;
    const color=C.COLORS[st.fontColor], paper=C.paperById(st.paper), errs=C.spellcheck(ch.text);
    return `<div class="toolbar-top"><button class="icon-btn" data-action="tab" data-arg="home" aria-label="Back">‹</button><b>${esc(b.title)}</b>
      <span class="saved ${s.savedAt?'':'hidden'}" id="savedInd">Saved ✓</span><button class="icon-btn" data-action="toggleRef" title="Reference panel" aria-label="Reference panel">📖</button></div>
    <div class="writing"><div class="side">${b.chapters.map((c,i)=>`<button data-action="selectChapter" data-arg="${i}" class="${i===s.currentChapter?'primary':''}">${esc(c.title)}</button>`).join('')}<button data-action="addChapter">＋ Chapter</button></div>
      <div class="page paper-${paper.id}" style="background-color:${paper.bg};color:${color};font-family:'${st.font}';font-weight:${st.bold?700:400};font-style:${st.italic?'italic':'normal'}">
        <textarea id="writeArea" data-input="write" spellcheck="false" placeholder="Start writing…">${esc(ch.text)}</textarea>
        ${s.aiBusy?`<div class="section" id="aiBusy">Writing…</div>`:''}${s.aiError?`<div class="warn" id="aiError" role="alert">AI error: ${esc(s.aiError)}</div>`:''}${ch.pending?`<div class="section" id="aiPending" style="color:inherit"><b>AI draft:</b> <i>${esc(ch.pending)}</i></div>`:''}</div></div>
    <div class="warn" id="readTime">${app.readingLabel(ch.text)} · ${st.wpm} WPM</div>
    <div id="spell">${errs.slice(0,8).map(e=>`<div><span class="misspell">${esc(e.word)}</span> → ${e.suggestions.slice(0,3).map(x=>`<button data-action="fixWord" data-word="${esc(e.word)}" data-arg="${esc(x)}">${esc(x)}</button>`).join('')||'<i>no suggestions</i>'}</div>`).join('')}</div>
    <div class="ai-bar"><button data-action="ai" data-arg="keep">Keep</button><button data-action="ai" data-arg="redo">Redo</button><button data-action="ai" data-arg="quickEdit">Quick edit</button></div>
    ${s.refOpen?`<aside class="refpanel" id="refPanel"><h3>Reference <button data-action="toggleRef">✕</button></h3>
      <label>Scenario<textarea class="field" data-input="refScenario">${esc(b.scenario)}</textarea></label>
      <label>Genres (comma)<input class="field" data-input="refGenres" value="${esc(b.genres.join(', '))}"></label>
      <label>Tones (comma)<input class="field" data-input="refTones" value="${esc(b.tones.join(', '))}"></label>
      <div>Characters: ${b.characters.map(c=>`<span class="tag">${esc(c.name)}</span>`).join('')||'none'} <button data-action="refAddChar">＋ Add</button></div></aside>`:''}`; },
  characters(app){ const all=[]; app.state.books.forEach(b=>b.characters.forEach(c=>all.push([b,c])));
    return `<h2>Characters</h2>
    ${all.map(([b,c])=>`<div class="section"><b>${esc(c.name)}</b> ${esc(c.role||'')} <div class="muted">in ${esc(b.title)}</div></div>`).join('')||'<div class="empty-state"><b>No characters yet</b><div class="muted">Add people from New book setup or the writing reference panel.</div></div>'}
    <button class="primary" data-action="newCharacter">＋ New character</button>${tabs('characters')}`; },
  characterBuilder(app){ const others=app.state.draft.characters.map(c=>c.name); const f=(k,l,t='input')=>`<label>${l}<${t} class="field" data-field="${k}"></${t}></label>`;
    return `<h2>Character builder</h2>${f('name','Name')}${f('age','Age')}${f('appearance','Appearance','textarea')}${f('description','Short description','textarea')}
    <label>Role<select class="field" data-field="role">${C.ROLES.map(r=>`<option>${r}</option>`).join('')}</select></label>
    ${f('backstory','Backstory or motivation','textarea')}
    <label>Voice or personality<select class="field" data-field="voice">${C.VOICES.map(r=>`<option>${r}</option>`).join('')}</select></label>
    <label>Relationship<select class="field" data-field="relationship"><option>None</option>${others.map(o=>`<option>${esc(o)}</option>`).join('')}</select></label>
    <div class="ai-bar"><button class="primary" data-action="saveCharacter">Save</button><button data-action="tab" data-arg="setup">Cancel</button></div>`; },
  settings(app){ const st=app.state.settings; const tog=(p,l)=>`<label class="settings-row"><span>${l}</span><input type="checkbox" data-setting="${p}" ${p.split('.').reduce((o,k)=>o[k],st)?'checked':''}></label>`;
    return `<h2>Settings</h2>
    <div class="section"><b>Account</b>
      <div class="settings-row"><span>Google account <span class="stub-badge">Coming soon</span></span><button data-action="stub" data-arg="Sign in">Sign in</button></div>
      ${tog('age18','I confirm I am 18+')}
      <div class="settings-row"><span>Edit book setup</span><button data-action="editBookSetup">Open</button></div>
    </div>
    <div class="section"><b>Sound</b>${tog('sound.typewriter','Typewriter sound')}${tog('sound.pencil','Pencil writing sound')}${tog('sound.pageTurn','Page-turn sound')}</div>
    <div class="section"><b>Font</b><div class="fontlist">${C.FONTS.map(f=>`<div class="fontrow"><button data-action="font" data-arg="${f.name}" class="${st.font===f.name?'primary':''}" style="font-family:'${f.name}'">${f.name} <small>${f.group}</small></button>
      <span style="font-family:'${f.name}'">The quick fox</span>
      ${f.bold?`<button data-action="fontStyle" data-arg="bold" data-font="${f.name}" class="${st.font===f.name&&st.bold?'primary':''}"><b>B</b></button>`:''}${f.italic?`<button data-action="fontStyle" data-arg="italic" data-font="${f.name}" class="${st.font===f.name&&st.italic?'primary':''}"><i>I</i></button>`:''}</div>`).join('')}</div></div>
    <div class="section"><b>Font color</b> <span class="warn">for ${C.paperById(st.paper).name}</span><div>${C.colorsForPaper(st.paper).map(c=>c.available
      ?`<button class="swatch ${st.fontColor===c.name?'primary':''}" data-action="fontColor" data-arg="${c.name}" style="background:${C.paperById(st.paper).bg};color:${c.hex}">Aa ${c.name}</button>`
      :`<span class="swatch locked" title="locked on this paper">🔒 ${c.name}</span>`).join('')}</div></div>
    <div class="section"><b>Reading speed</b><div class="settings-row"><input type="range" min="100" max="600" step="5" data-setting-num="wpm" value="${st.wpm}"> <span><input type="number" min="50" max="1000" data-setting-num="wpm" value="${st.wpm}" style="width:70px"> WPM</span></div></div>
    <div class="section"><b>Theme</b><p class="hint">Dark is the default. Leather-bound is optional. Follow phone uses your OS light/dark.</p><div>${[['follow-os','Follow phone'],['dark','Dark'],['light','Light'],['leather','Leather-bound']].map(([k,l])=>`<button class="chip ${st.theme===k?'on':''}" data-action="theme" data-arg="${k}">${l}</button>`).join('')}</div></div>
    <div class="section"><b>Writing background</b><div class="paper-grid">${C.PAPERS.map(p=>`<button class="paper-opt ${st.paper===p.id?'on':''}" data-action="paper" data-arg="${p.id}"><div class="prev paper-${p.id}" style="background-color:${p.bg}"></div>${p.name}${p.origin?`<div class="origin" data-origin>${p.origin}</div>`:''}</button>`).join('')}</div></div>
    <div class="section"><b>Usage <span class="stub-badge">Stub</span></b>
      <div class="muted" style="margin-bottom:8px">Caps and meter are placeholders for a later pass.</div>
      Caps: ${['daily','weekly','monthly'].map(k=>`${k} <input data-setting-text="caps.${k}" value="${esc(st.caps[k])}" style="width:50px">`).join(' ')}<br>
      AI model (Google AI test): Gemini 3.8 Flash (free test) — <code>${esc(st.model)}</code>
      ${tog('notify20','Notify at 20% left')}${tog('showDollars','Show dollars (owner)')}
    </div>
    <div class="section"><b>Account actions <span class="stub-badge">Stub</span></b>
      ${['Export book','Unsubscribe','Delete account','Sign out'].map(x=>`<button data-action="stub" data-arg="${x}">${x}</button>`).join('')}
    </div>
    ${app._flash?`<div class="saved">${esc(app._flash)}</div>`:''}${tabs('settings')}`; },
};

function mount(root, app){
  const doc=root.ownerDocument; app._flash=''; app._menu=null;
  const storage=app.storage;
  let showWelcome=!welcomeSeen(storage);
  const ACTIONS = {
    tab:a=>app.go(a), newBook:()=>app.newBook(), openBook:a=>app.openBook(+a), archive:a=>{app._menu=null;app.archive(+a);}, trash:a=>{app._menu=null;app.trash(+a);}, restore:a=>app.restore(+a),
    subgroup:a=>app.openSubgroup(a||null), toggleTag:(a,el)=>app.toggleTag(el.dataset.kind,a), removeTag:(a,el)=>app.removeTag(el.dataset.kind,a),
    length:a=>app.setLength(a), charChoice:a=>app.setCharacterChoice(a), removeChar:a=>app.removeCharacter(a),
    saveDraft:()=>{app._flash='Draft saved ✓';app.saveDraft();}, continueToWrite:()=>app.continueToWrite(), skipSetup:()=>app.skipSetup(),
    confirmChapter:()=>app.confirmChapterTitle(root.querySelector('#chTitle').value),
    selectChapter:a=>app.selectChapter(+a), addChapter:()=>app.addChapter(), ai:a=>{ if(a==='quickEdit'){ const ins=g.prompt?g.prompt('Quick edit — what should change? (e.g. "make him sound tougher")'):''; if(ins===null) return; return app.aiAction(a,{instruction:ins||undefined}); } return app.aiAction(a); }, toggleRef:()=>app.toggleRef(),
    refAddChar:()=>{ const b=app.book(); app.state.draft={...app.state.draft,characters:b.characters}; app._refBook=b.id; app.go('characterBuilder'); },
    fixWord:(a,el)=>{ const b=app.book(), ch=b.chapters[app.state.currentChapter]; ch.text=ch.text.replace(new RegExp('\\b'+el.dataset.word+'\\b'),a); app.type(ch.text); },
    newCharacter:()=>{ app.state.draft=app.state.draft||{characters:[]}; app.go('characterBuilder'); },
    saveCharacter:()=>{ const c={}; root.querySelectorAll('[data-field]').forEach(i=>c[i.dataset.field]=i.value); if(c.relationship==='None') c.relationship='';
      if(!c.name.trim()){ g.alert&&g.alert('Name required'); return; }
      if(app._refBook){ const b=app.book(app._refBook); app._refBook=null; app.state.draft.characters=b.characters; app.saveCharacter(c); b.characters=app.state.draft.characters; app.go('writing'); }
      else app.saveCharacter(c); },
    editBookSetup:()=>app.editBookSetup(), font:a=>app.set('font',a),
    fontStyle:(a,el)=>{ if(app.state.settings.font!==el.dataset.font) app.set('font',el.dataset.font); app.set(a,!app.state.settings[a]); },
    fontColor:a=>app.set('fontColor',a), theme:a=>app.set('theme',a), paper:a=>app.set('paper',a), stub:a=>{ app._flash=a+' (stub)'; render(); },
    dismissWelcome:()=>{
      const card=root.querySelector('.welcome-card');
      const finish=()=>{ showWelcome=false; markWelcomeSeen(storage); render(); };
      if(card){ card.classList.add('turn-out'); setTimeout(finish,520); }
      else finish();
    },
  };
  function render(){
    const v=VIEWS[app.state.screen];
    const body=`<div class="screen ${themeClass(app)}" data-screen="${app.state.screen}">${v(app)}</div>`;
    const welcome=showWelcome?`<div class="welcome" role="dialog" aria-label="Welcome"><div class="welcome-card"><div class="welcome-mark" aria-hidden="true">✍</div><h1>The Other Writer</h1><p>A quiet shelf for your stories — dark pages, orange accents, AI when you ask for it.</p><button class="primary" data-action="dismissWelcome">Open your shelf</button></div></div>`:'';
    root.innerHTML=body+welcome;
  }
  root.addEventListener('click',e=>{ const el=e.target.closest('[data-action]'); if(!el) return; const fn=ACTIONS[el.dataset.action]; if(!fn) throw new Error('No handler for '+el.dataset.action); fn(el.dataset.arg,el); });
  root.addEventListener('change',e=>{ const el=e.target; if(el.dataset.setting) app.set(el.dataset.setting,el.checked); else if(el.dataset.settingNum) app.set('wpm',Math.max(50,+el.value||225)); else if(el.dataset.settingText) app.set(el.dataset.settingText,el.value); });
  let saveTimer=null;
  root.addEventListener('input',e=>{ const el=e.target, k=el.dataset.input; if(!k) return;
    if(k==='write'){ const b=app.book(); b.chapters[app.state.currentChapter].text=el.value; app.sound.play('typewriter'); app.sound.play('pencil');
      clearTimeout(saveTimer); const ind=root.querySelector('#savedInd'); if(ind){ind.textContent='Saving…';ind.classList.remove('hidden');}
      saveTimer=setTimeout(()=>{ app.state.savedAt=Date.now(); app.persist(); const i=root.querySelector('#savedInd'); if(i){i.textContent='Saved ✓';}
        const rt=root.querySelector('#readTime'); if(rt) rt.textContent=app.readingLabel(el.value)+' · '+app.state.settings.wpm+' WPM';
        const sp=root.querySelector('#spell'); if(sp) sp.innerHTML=C.spellcheck(el.value).slice(0,8).map(x=>`<div><span class="misspell">${esc(x.word)}</span> → ${x.suggestions.slice(0,3).map(s=>`<button data-action="fixWord" data-word="${esc(x.word)}" data-arg="${esc(s)}">${esc(s)}</button>`).join('')}</div>`).join(''); }, app.autosaveDelay??400);
      return; }
    const d=app.state.draft, b=app.book();
    if(k==='title') d.title=el.value; else if(k==='scenario') d.scenario=el.value;
    else if(k==='refScenario') b.scenario=el.value; else if(k==='refGenres') b.genres=el.value.split(',').map(s=>s.trim()).filter(Boolean); else if(k==='refTones') b.tones=el.value.split(',').map(s=>s.trim()).filter(Boolean);
    else if(k==='search'){ app._q=el.value; render(); const s=root.querySelector('#search'); s.focus(); s.setSelectionRange(s.value.length,s.value.length); return; }
    app.persist(); });
  // long-press / swipe on book covers → reveal Archive/Trash
  let press=null;
  root.addEventListener('pointerdown',e=>{ const bk=e.target.closest('.book'); if(!bk) return; press={id:+bk.dataset.book,x:e.clientX,y:e.clientY,t:setTimeout(()=>{app._menu=press.id;render();},550)}; });
  root.addEventListener('pointerup',e=>{ if(!press) return; clearTimeout(press.t); if(Math.abs(e.clientY-press.y)>40){ app._menu=press.id; render(); } press=null; });
  root.addEventListener('contextmenu',e=>{ const bk=e.target.closest('.book'); if(bk){ e.preventDefault(); app._menu=+bk.dataset.book; render(); } });
  app.listeners.push(render); render();
  return {render, ACTIONS, longPress:id=>{app._menu=id;render();}};
}
const API={mount,VIEWS,synthPlayer,WELCOME_KEY};
if(typeof module!=='undefined') module.exports=API;
else { g.StoryUI=API; g.addEventListener('DOMContentLoaded',()=>{ let ls; try{ ls=g.localStorage; ls.getItem('x'); }catch(e){ ls=C.memStorage(); } const app=new C.App(ls,new C.SoundManager(synthPlayer())); g.storyApp=app; mount(g.document.getElementById('app'),app); }); }
})(typeof window!=='undefined'?window:globalThis);
