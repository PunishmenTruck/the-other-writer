// Runs all categories and writes TEST-RESULTS.md. Usage: node tests/run.js
const assert=require('node:assert/strict'); const fs=require('fs'); const path=require('path'); const {performance}=require('perf_hooks');
const {JSDOM}=require('jsdom'); const C=require('../src/core.js'); const UI=require('../src/app.js');
const cats=[]; let cur; const cat=(name)=>{cur={name,tests:[]};cats.push(cur);}; const t=(name,fn)=>cur.tests.push({name,fn});
const speed=[];
function mk(storage){ const dom=new JSDOM('<div id="app"></div>',{url:'http://localhost/'}); const sounds=[]; const sm=new C.SoundManager(ch=>sounds.push(ch));
  const app=new C.App(storage||C.memStorage(),sm); app.autosaveDelay=5; const ui=UI.mount(dom.window.document.getElementById('app'),app); const root=dom.window.document.getElementById('app');
  const click=(sel)=>{ const el=root.querySelector(sel); if(!el) throw new Error('missing '+sel); el.dispatchEvent(new dom.window.MouseEvent('click',{bubbles:true})); };
  return {dom,app,ui,root,click,sounds,sm,w:dom.window}; }
const tick=ms=>new Promise(r=>setTimeout(r,ms));
// spaced sounds: advance fake clock so manager throttling doesn't hide events in UI tests
function makeBook(e,title='Book',skip=false){ e.click('[data-action=newBook]'); const i=e.root.querySelector('[data-input=title]'); i.value=title; i.dispatchEvent(new e.w.Event('input',{bubbles:true}));
  e.click(skip?'[data-action=skipSetup]':'[data-action=continueToWrite]'); e.click('[data-action=confirmChapter]'); return e.app.book(); }
const SAMPLE=('The knight walked slowly toward the ancient castle as the moon rose over the forest. She whispered a secret to her friend and opened the door. ').repeat(40);
const time=(name,fn,n=1)=>{ fn(); const s=performance.now(); for(let i=0;i<n;i++) fn(); const ms=(performance.now()-s)/n; speed.push({name,ms}); return ms; };

cat('A) SPEED');
t('spellcheck ~1,000 words of clean text',()=>{ const ms=time('spellcheck 1,040-word clean sample',()=>C.spellcheck(SAMPLE),5); assert.ok(ms<500,ms+'ms'); });
t('spellcheck 300 words with 30 typos (suggestions)',()=>{ const txt=('teh knight was writting a lettr and did not recieve it ').repeat(30); const ms=time('spellcheck 330 words w/ 120 typos + suggestions',()=>C.spellcheck(txt),3); assert.ok(ms<500,ms+'ms'); });
t('paper color lookup (all 11 papers)',()=>{ const ms=time('paper-aware color lookup ×11 papers',()=>C.PAPERS.forEach(p=>C.colorsForPaper(p.id)),200); assert.ok(ms<500); });
t('auto-save serialize (20 books × 25 chapters)',()=>{ const a=new C.App(); for(let i=0;i<20;i++){ a.state.books.push({id:i,title:'B'+i,genres:[],tones:[],characters:[],chapters:Array.from({length:25},(_,j)=>({title:'Ch'+j,text:SAMPLE.slice(0,6000)})),archived:false,trashed:false}); }
  const ms=time('auto-save serialize+persist (~3 MB state)',()=>a.persist(),5); assert.ok(ms<500,ms+'ms'); });
t('navigation state change',()=>{ const a=new C.App(); const ms=time('navigation state change (go)',()=>{a.go('settings');a.go('home');},500); assert.ok(ms<500); });
t('full UI render of settings screen',()=>{ const e=mk(); const ms=time('UI render: settings screen (jsdom)',()=>e.app.go('settings'),20); assert.ok(ms<500,ms+'ms'); });

cat('B) ACCURACY');
t('11 papers in the locked order',()=>assert.deepEqual(C.PAPERS.map(p=>p.name),['Lined','Parchment','Watercolor','Blank','Washi','Vellum','Rice paper','Newsprint','Blueprint','Carbon copy','Typewriter paper']));
t('every paper has ≥3 colors',()=>C.PAPERS.forEach(p=>assert.ok(p.colors.length>=3,p.id)));
t('color counts match build list (7,6,6,6,6,6,6,5,6,5,6)',()=>assert.deepEqual(C.PAPERS.map(p=>p.colors.length),[7,6,6,6,6,6,6,5,6,5,6]));
t('blank locks soft white, warm cream, light gray, pale yellow, muted blue',()=>['soft white','warm cream','light gray','pale yellow','muted blue'].forEach(c=>assert.ok(C.isColorLocked('blank',c),c)));
t('blueprint has light colors (incl. light cyan) and locks ink black',()=>{ assert.ok(C.availableColors('blueprint').includes('light cyan')); assert.ok(C.isColorLocked('blueprint','ink black')); });
t('pale yellow locked on blueprint? no — available; locked on carbon copy',()=>{ assert.ok(!C.isColorLocked('blueprint','pale yellow')); assert.ok(C.isColorLocked('carbon','pale yellow')); });
t('all available colors pass WCAG ≥3:1 contrast on their paper',()=>C.PAPERS.forEach(p=>p.colors.forEach(c=>assert.ok(C.contrast(C.COLORS[c],p.bg)>=3,`${c} on ${p.id}: ${C.contrast(C.COLORS[c],p.bg).toFixed(2)}`))));
t('length goals exact',()=>assert.deepEqual(C.LENGTH_GOALS,['Flash fiction','Short','Novelette','Novella','Full','Chapter book']));
t('genre subgroups exact (8)',()=>assert.deepEqual(Object.keys(C.GENRE_GROUPS),['Fiction','Speculative','Crime and Suspense','Romance','Historical and Western','Real life','Kids and YA','World and Other']));
t('every subgroup has an info tip',()=>Object.keys(C.GENRE_GROUPS).forEach(g=>assert.ok(C.GENRE_TIPS[g])));
t('added genres in right groups (Noir, Supernatural, Military fiction)',()=>{ assert.ok(C.GENRE_GROUPS['Crime and Suspense'].includes('Noir')); assert.ok(C.GENRE_GROUPS['Speculative'].includes('Supernatural')); assert.ok(C.GENRE_GROUPS['Historical and Western'].includes('Military fiction')); });
t('origin sidebars only on washi/vellum/typewriter',()=>assert.deepEqual(C.PAPERS.filter(p=>p.origin).map(p=>[p.id,p.origin]),[['washi','Japan'],['vellum','Animal skin, medieval era'],['typewriter','20th century offices']]));
t('character choice + roles + voices per build list',()=>{ assert.deepEqual(C.CHARACTER_CHOICES,['Scenario fills them','Add my own','Copy from book']); assert.equal(C.ROLES.length,13); assert.ok(C.VOICES.includes('Hot-headed')); });
t('skip-setup flow still routes to chapter title step',()=>{ const a=new C.App(); a.newBook(); a.skipSetup(); assert.equal(a.state.screen,'chapterTitle'); assert.equal(a.state.draft.skipped,true); });
t('default WPM within 200–250',()=>{ const w=C.defaultSettings().wpm; assert.ok(w>=200&&w<=250); });

cat('C) SPELL CHECK');
t('correct prose not flagged',()=>assert.deepEqual(C.spellcheck(SAMPLE),[]));
t('contractions/possessives/numbers not flagged',()=>assert.deepEqual(C.spellcheck("She didn't know. They're here, it's 1999 and Kyle's book can't wait. I'm fine, we'll go."),[]));
const typos={teh:'the',writting:'writing',recieve:'receive',seperate:'separate',definately:'definitely',becuase:'because',wierd:'weird',freind:'friend',untill:'until',tommorow:'tomorrow',thier:'their',adn:'and',wiht:'with',lettr:'letter',chaptr:'chapter',castel:'castle',knigth:'knight',dragn:'dragon'};
for(const [bad,good] of Object.entries(typos)) t(`flags "${bad}" and suggests "${good}"`,()=>{ const r=C.spellcheck('The '+bad+' here.'); assert.equal(r.length,1); assert.equal(r[0].word,bad); assert.ok(r[0].suggestions.includes(good),JSON.stringify(r[0].suggestions)); });
t('capitalized typo flagged with fix (Teh→the)',()=>{ const r=C.spellcheck('Teh end.'); assert.equal(r[0].word,'Teh'); assert.equal(r[0].suggestions[0],'the'); });
t('reports index positions',()=>{ const r=C.spellcheck('Hello wrld'); assert.equal(r[0].index,6); });
t('checker works across all 11 papers × 16 fonts × bold/italic (settings don’t break it)',()=>{ const a=new C.App(); const txt='Teh knight was writting.'; let n=0;
  for(const p of C.PAPERS) for(const f of C.FONTS){ a.set('paper',p.id); a.set('font',f.name); if(f.bold) a.set('bold',true); if(f.italic) a.set('italic',true);
    const r=C.spellcheck(txt); assert.deepEqual(r.map(x=>x.word),['Teh','writting']); n++; } assert.equal(n,176); });
t('UI writing screen shows misspelling + fix button that corrects text',async()=>{ const e=mk(); makeBook(e); const ta=e.root.querySelector('#writeArea'); ta.value='Teh dragon'; ta.dispatchEvent(new e.w.Event('input',{bubbles:true})); await tick(30);
  assert.match(e.root.querySelector('#spell').textContent,/Teh/); e.click('[data-action=fixWord][data-arg=the]'); assert.equal(e.app.book().chapters[0].text,'the dragon'); });

cat('1) No hanging / unresponsive buttons');
t('every data-action on every screen has a handler and clicking each does not throw',()=>{ const e=mk(); makeBook(e,'Seed'); e.app.state.books[0].characters.push({name:'Ann'});
  const seen=new Set(); for(const s of C.SCREENS){ e.app.state.screen=s; e.ui.render(); const els=[...e.root.querySelectorAll('[data-action]')]; assert.ok(els.length>0,s+' has controls');
    for(const el of els){ const a=el.dataset.action; assert.ok(e.ui.ACTIONS[a],'no handler: '+a+' on '+s); seen.add(a); } }
  for(const a of ['newBook','continueToWrite','saveDraft','skipSetup','confirmChapter','ai','toggleRef','tab','paper','font','fontStyle','fontColor','theme','saveCharacter','editBookSetup']) assert.ok(seen.has(a),'missing control '+a); });
t('primary flow click-through: New book → Save draft → Continue → Chapter Continue → Keep/Redo/Quick edit',async()=>{ const e=mk(); const calls=[]; e.app.fetch=async(u,o)=>{ calls.push([u,JSON.parse(o.body)]); return {ok:true,json:async()=>({text:u.endsWith('continue')?'The lantern flickered as the wind rose.':'A tougher line.'})}; }; e.click('[data-action=newBook]'); assert.equal(e.app.state.screen,'setup');
  e.click('[data-action=saveDraft]'); assert.ok(e.app.state.savedDraft); e.click('[data-action=continueToWrite]'); assert.equal(e.app.state.screen,'chapterTitle');
  e.click('[data-action=confirmChapter]'); assert.equal(e.app.state.screen,'writing');
  e.click('[data-action=ai][data-arg=redo]'); assert.ok(e.root.querySelector('#aiBusy')); await tick(5); assert.match(e.app.book().chapters[0].pending,/lantern/); assert.ok(e.root.querySelector('#aiPending')); e.click('[data-action=ai][data-arg=keep]'); assert.match(e.app.book().chapters[0].text,/lantern/); globalThis.prompt=()=>'make it tougher'; e.click('[data-action=ai][data-arg=quickEdit]'); await tick(5); assert.ok(e.app.book().chapters[0].lastQuickEdit); assert.match(e.app.book().chapters[0].text,/tougher line/); assert.equal(calls[1][1].instruction,'make it tougher'); assert.equal(calls[0][1].model,'gemini-3.8-flash'); });
t('AI redo: proxy error shows error text, no pending set',async()=>{ const e=mk(); makeBook(e); e.app.fetch=async()=>({ok:false,status:503,json:async()=>({error:'GEMINI_API_KEY not set'})}); e.click('[data-action=ai][data-arg=redo]'); await tick(5); assert.ok(!e.app.book().chapters[0].pending); assert.match(e.root.querySelector('#aiError').textContent,/GEMINI_API_KEY/); });
t('AI quick edit rewrites pending draft only',async()=>{ const e=mk(); makeBook(e); const ch=e.app.book().chapters[0]; ch.text='Keep me.'; ch.pending='He said hi.'; e.app.fetch=async(u,o)=>({ok:true,json:async()=>({text:'He growled hello.'})}); await e.app.aiAction('quickEdit',{instruction:'tougher'}); assert.equal(ch.pending,'He growled hello.'); assert.equal(ch.text,'Keep me.'); });
t('Settings toggles respond (checkbox change updates state)',()=>{ const e=mk(); e.app.go('settings'); for(const p of ['sound.typewriter','sound.pencil','sound.pageTurn','age18','notify20','showDollars']){ const cb=e.root.querySelector(`[data-setting="${p}"]`); const before=cb.checked; cb.checked=!before; cb.dispatchEvent(new e.w.Event('change',{bubbles:true})); assert.equal(p.split('.').reduce((o,k)=>o[k],e.app.state.settings),!before,p); } });
t('every click handler completes < 50 ms (not hanging)',()=>{ const e=mk(); const s=performance.now(); e.click('[data-action=newBook]'); e.click('[data-action=skipSetup]'); e.click('[data-action=confirmChapter]'); e.click('[data-action=toggleRef]'); assert.ok((performance.now()-s)/4<50); });

cat('2) Dark mode on every screen');
t('each of 7 screens renders with theme-dark class and dark background rule',()=>{ const e=mk(); makeBook(e); const css=fs.readFileSync(path.join(__dirname,'../src/styles.css'),'utf8'); assert.match(css,/\.theme-dark\{background:#15161a/);
  for(const s of C.SCREENS){ e.app.state.screen=s; e.ui.render(); const sc=e.root.querySelector('.screen'); assert.ok(sc.classList.contains('theme-dark'),s); assert.equal(sc.dataset.screen,s); } });
t('default theme is dark; follow-os resolves to dark when OS is dark',()=>{ assert.equal(C.defaultSettings().theme,'dark'); const e=mk(); e.app.set('theme','follow-os'); assert.ok(e.root.querySelector('.screen').classList.contains('theme-dark')); });

cat('3) Sound effects: no overlap / no cut-out');
t('same channel cannot overlap (busy rejected, playing sound not cut)',()=>{ const sm=new C.SoundManager(); assert.ok(sm.play('pageTurn',1000).played); const r=sm.play('pageTurn',1100); assert.equal(r.played,false); assert.equal(r.reason,'busy'); assert.ok(sm.play('pageTurn',1300).played); });
t('typewriter, pencil, page-turn play independently at same instant',()=>{ const sm=new C.SoundManager(); ['typewriter','pencil','pageTurn'].forEach(c=>assert.ok(sm.play(c,5000).played,c)); assert.equal(sm.log.length,3); });
t('rapid typing (100 keys @10ms) throttled, never stacks',()=>{ const sm=new C.SoundManager(); let n=0; for(let i=0;i<100;i++) if(sm.play('typewriter',i*10).played) n++; assert.ok(n>=15&&n<=20,String(n)); const at=sm.log.map(x=>x.at); for(let i=1;i<at.length;i++) assert.ok(at[i]-at[i-1]>=60); });

cat('4) Data persistence across reload');
t('settings survive app close/reload',()=>{ const st=C.memStorage(); const a=new C.App(st); a.set('paper','washi'); a.set('wpm',310); a.set('theme','leather'); a.set('sound.pencil',false);
  const b=new C.App(st); assert.equal(b.state.settings.paper,'washi'); assert.equal(b.state.settings.wpm,310); assert.equal(b.state.settings.theme,'leather'); assert.equal(b.state.settings.sound.pencil,false); assert.equal(b.sound.enabled.pencil,false); });
t('saved draft survives reload and refills setup fields',()=>{ const st=C.memStorage(); const a=new C.App(st); a.newBook(); a.setTitle('Night Train'); a.toggleTag('genres','Noir'); a.toggleTag('tones','Dark'); a.setScenario('A train'); a.setLength('Novella'); a.saveDraft();
  const b=new C.App(st); b.go('home'); b.newBook(); assert.equal(b.state.draft.title,'Night Train'); assert.deepEqual(b.state.draft.genres,['Noir']); assert.equal(b.state.draft.length,'Novella'); });
t('book text survives reload; jsdom localStorage round-trip',async()=>{ const dom=new JSDOM('',{url:'http://localhost/'}); const ls=dom.window.localStorage; const e=mk(ls); makeBook(e,'Persist');
  const ta=e.root.querySelector('#writeArea'); ta.value='Saved words'; ta.dispatchEvent(new e.w.Event('input',{bubbles:true})); await tick(30);
  const b=new C.App(ls); assert.equal(b.state.books[0].chapters[0].text,'Saved words'); });

cat('5) Multi-select genre & tone tags');
t('select multiple across subgroups, tags render, remove works',()=>{ const e=mk(); e.click('[data-action=newBook]'); e.click('[data-action=subgroup][data-arg="Speculative"]'); e.click('[data-action=toggleTag][data-arg="Fantasy"]'); e.click('[data-action=toggleTag][data-arg="Horror"]');
  e.click('[data-action=subgroup][data-arg=""]'); e.click('[data-action=subgroup][data-arg="Crime and Suspense"]'); e.click('[data-action=toggleTag][data-arg="Noir"]');
  e.click('[data-kind=tones][data-action=toggleTag][data-arg="Dark"]'); e.click('[data-kind=tones][data-action=toggleTag][data-arg="Hopeful"]');
  assert.deepEqual(e.app.state.draft.genres,['Fantasy','Horror','Noir']); assert.deepEqual(e.app.state.draft.tones,['Dark','Hopeful']); assert.equal(e.root.querySelectorAll('.tag').length,5);
  e.click('[data-action=removeTag][data-kind=genres][data-arg="Horror"]'); e.click('[data-action=removeTag][data-kind=tones][data-arg="Dark"]');
  assert.deepEqual(e.app.state.draft.genres,['Fantasy','Noir']); assert.deepEqual(e.app.state.draft.tones,['Hopeful']); assert.equal(e.root.querySelectorAll('.tag').length,3); });
t('tapping a selected chip toggles it off',()=>{ const a=new C.App(); a.newBook(); a.toggleTag('tones','Calm'); a.toggleTag('tones','Calm'); assert.deepEqual(a.state.draft.tones,[]); });

cat('6) Nested genre drill-down');
t('Genre → 8 subgroup tabs → genre list → back',()=>{ const e=mk(); e.click('[data-action=newBook]'); assert.equal(e.root.querySelectorAll('[data-action=subgroup]').length,8); assert.equal(e.root.querySelectorAll('[data-kind=genres][data-action=toggleTag]').length,0);
  for(const g of Object.keys(C.GENRE_GROUPS)){ e.click(`[data-action=subgroup][data-arg="${g}"]`); const shown=[...e.root.querySelectorAll('[data-kind=genres][data-action=toggleTag]')].map(x=>x.dataset.arg); assert.deepEqual(shown,C.GENRE_GROUPS[g],g); e.click('[data-action=subgroup][data-arg=""]'); assert.equal(e.root.querySelectorAll('[data-action=subgroup]').length,8); } });
t('each subgroup row has an info (i) tip',()=>{ const e=mk(); e.click('[data-action=newBook]'); e.root.querySelectorAll('[data-action=subgroup]').forEach(b=>assert.ok(b.querySelector('.info').title)); });

cat('7) Character builder saves & shows tags');
t('Add my own → builder with all fields → Save → tag on setup',()=>{ const e=mk(); e.click('[data-action=newBook]'); e.click('[data-action=charChoice][data-arg="Add my own"]'); assert.equal(e.app.state.screen,'characterBuilder');
  for(const f of C.CHARACTER_FIELDS) assert.ok(e.root.querySelector(`[data-field=${f}]`),f);
  const set=(f,v)=>{e.root.querySelector(`[data-field=${f}]`).value=v;}; set('name','Mara'); set('age','34'); set('appearance','scar'); set('description','pilot'); set('role','Antihero'); set('backstory','revenge'); set('voice','Stoic');
  e.click('[data-action=saveCharacter]'); assert.equal(e.app.state.screen,'setup'); const c=e.app.state.draft.characters[0]; assert.equal(c.name,'Mara'); assert.equal(c.role,'Antihero'); assert.equal(c.voice,'Stoic');
  assert.match(e.root.textContent,/Mara · Antihero/); e.click('[data-action=continueToWrite]'); e.click('[data-action=confirmChapter]'); assert.equal(e.app.book().characters[0].name,'Mara'); });
t('relationship dropdown lists existing characters; remove tag works',()=>{ const a=new C.App(); a.newBook(); a.saveCharacter({name:'A'}); a.go('characterBuilder'); const e=mk(); e.app.state=a.state; e.ui.render(); assert.match(e.root.querySelector('[data-field=relationship]').innerHTML,/>A</); a.removeCharacter('A'); assert.equal(a.state.draft.characters.length,0); });
t('Scenario fills them generates starter cast; Copy from book copies',()=>{ const a=new C.App(); a.newBook(); a.setScenario('Lena and Marco flee the city.'); a.setCharacterChoice('Scenario fills them'); assert.deepEqual(a.state.draft.characters.map(c=>c.name),['Lena','Marco']);
  a.continueToWrite(); a.confirmChapterTitle(''); a.newBook(); a.setCharacterChoice('Copy from book'); assert.equal(a.state.draft.characters.length,2); });

cat('8) First chapter title step — both flows');
t('Continue to write → chapter title step → custom title used',()=>{ const e=mk(); e.click('[data-action=newBook]'); e.click('[data-action=continueToWrite]'); assert.equal(e.app.state.screen,'chapterTitle');
  const i=e.root.querySelector('#chTitle'); assert.equal(i.placeholder,'Chapter 1'); i.value='The Arrival'; e.click('[data-action=confirmChapter]'); assert.equal(e.app.state.screen,'writing'); assert.equal(e.app.book().chapters[0].title,'The Arrival'); });
t('Skip setup → chapter title step → blank defaults to Chapter 1; warning shown',()=>{ const e=mk(); e.click('[data-action=newBook]'); assert.match(e.root.textContent,/You can always add genres, tones, and scenarios later in settings/);
  e.click('[data-action=skipSetup]'); assert.equal(e.app.state.screen,'chapterTitle'); e.click('[data-action=confirmChapter]'); const b=e.app.book(); assert.equal(b.chapters[0].title,'Chapter 1'); assert.equal(b.title,'Untitled'); assert.deepEqual(b.genres,[]); });

cat('9) Reference panel');
t('icon opens panel showing scenario/genres/tones/characters; edits persist; closes',()=>{ const e=mk(); e.click('[data-action=newBook]'); e.app.toggleTag('genres','Noir'); e.app.toggleTag('tones','Tense'); e.app.setScenario('Rainy city'); e.click('[data-action=continueToWrite]'); e.click('[data-action=confirmChapter]');
  e.click('[data-action=toggleRef]'); const p=e.root.querySelector('#refPanel'); assert.ok(p); assert.equal(p.querySelector('[data-input=refScenario]').value,'Rainy city'); assert.equal(p.querySelector('[data-input=refGenres]').value,'Noir');
  const g=p.querySelector('[data-input=refGenres]'); g.value='Noir, Thriller'; g.dispatchEvent(new e.w.Event('input',{bubbles:true})); const sc=p.querySelector('[data-input=refScenario]'); sc.value='Snowy city'; sc.dispatchEvent(new e.w.Event('input',{bubbles:true}));
  assert.deepEqual(e.app.book().genres,['Noir','Thriller']); assert.equal(e.app.book().scenario,'Snowy city'); assert.equal(e.app.state.screen,'writing');
  e.click('#refPanel [data-action=toggleRef]'); assert.equal(e.root.querySelector('#refPanel'),null); });
t('add character from panel returns to writing with tag',()=>{ const e=mk(); makeBook(e); e.click('[data-action=toggleRef]'); e.click('[data-action=refAddChar]'); e.root.querySelector('[data-field=name]').value='Zed'; e.click('[data-action=saveCharacter]');
  assert.equal(e.app.state.screen,'writing'); assert.equal(e.app.book().characters[0].name,'Zed'); assert.match(e.root.querySelector('#refPanel').textContent,/Zed/); });

cat('10) Auto-save indicator');
t('typing shows Saving… then Saved ✓ and persists without a save button',async()=>{ const st=C.memStorage(); const e=mk(st); makeBook(e); assert.ok(e.root.querySelector('#savedInd').classList.contains('hidden'));
  const ta=e.root.querySelector('#writeArea'); ta.value='Once upon a time'; ta.dispatchEvent(new e.w.Event('input',{bubbles:true})); assert.equal(e.root.querySelector('#savedInd').textContent,'Saving…');
  await tick(30); assert.equal(e.root.querySelector('#savedInd').textContent,'Saved ✓'); assert.ok(!e.root.querySelector('#savedInd').classList.contains('hidden')); assert.match(st.getItem(C.KEY),/Once upon a time/);
  assert.equal(e.root.querySelectorAll('[data-action=save]').length,0); });

cat('11) Trash / archive / restore');
t('long-press reveals menu; archive & trash hide from shelf; restore brings back',()=>{ const e=mk(); makeBook(e,'One'); e.click('[data-action=tab][data-arg=home]'); makeBook(e,'Two'); e.click('[data-action=tab][data-arg=home]'); makeBook(e,'Three'); e.click('[data-action=tab][data-arg=home]');
  assert.equal(e.root.querySelectorAll('.book').length,3); e.ui.longPress(1); assert.ok(e.root.querySelector('.book.menu-open')); e.click('.book[data-book="1"] [data-action=archive]'); e.ui.longPress(2); e.click('.book[data-book="2"] [data-action=trash]');
  assert.equal(e.root.querySelectorAll('.book').length,1); assert.equal(e.root.querySelectorAll('[data-action=restore]').length,2);
  e.click('[data-action=restore][data-arg="1"]'); e.click('[data-action=restore][data-arg="2"]'); assert.equal(e.root.querySelectorAll('.book').length,3); });
t('contextmenu (long-press on touch) opens book menu',()=>{ const e=mk(); makeBook(e); e.click('[data-action=tab][data-arg=home]'); e.root.querySelector('.book').dispatchEvent(new e.w.MouseEvent('contextmenu',{bubbles:true,cancelable:true})); assert.ok(e.root.querySelector('.book.menu-open')); });
t('New book stays pinned outside the scrolling shelf',()=>{ const e=mk(); for(let i=0;i<6;i++){ makeBook(e,'B'+i); e.click('[data-action=tab][data-arg=home]'); } const pin=e.root.querySelector('.home-top > .pinned'); assert.ok(pin); assert.ok(!e.root.querySelector('#shelf').contains(pin)); assert.equal(e.root.querySelectorAll('#shelf .book').length,6); });

cat('12) Search across books');
t('finds titles and chapter text across multiple books; trashed excluded',()=>{ const a=new C.App(); for(const [t2,txt] of [['Dragon Road','the dragon slept'],['Sea Story','a dragon in the waves'],['Quiet','nothing here']]){ a.newBook(); a.setTitle(t2); a.continueToWrite(); a.confirmChapterTitle(''); a.type(txt); }
  const r=a.search('dragon'); assert.deepEqual([...new Set(r.map(x=>x.bookId))],[1,2]); assert.equal(a.search('quiet')[0].where,'title'); a.trash(2); assert.deepEqual([...new Set(a.search('dragon').map(x=>x.bookId))],[1]); assert.deepEqual(a.search(''),[]); });
t('home search box renders results',()=>{ const e=mk(); makeBook(e,'Alpha'); e.click('[data-action=tab][data-arg=home]'); makeBook(e,'Beta'); e.click('[data-action=tab][data-arg=home]'); const s=e.root.querySelector('#search'); s.value='beta'; s.dispatchEvent(new e.w.Event('input',{bubbles:true})); assert.match(e.root.querySelector('#results').textContent,/Beta/); assert.doesNotMatch(e.root.querySelector('#results').textContent,/Alpha/); });

cat('13) Background picker — 11 papers');
t('picker shows 11 options with previews; each switches writing page bg',()=>{ const e=mk(); makeBook(e); e.app.go('settings'); assert.equal(e.root.querySelectorAll('[data-action=paper]').length,11);
  for(const p of C.PAPERS){ e.app.go('settings'); e.click(`[data-action=paper][data-arg="${p.id}"]`); assert.equal(e.app.state.settings.paper,p.id); assert.ok(e.root.querySelector(`[data-arg="${p.id}"] .prev`));
    e.app.go('writing'); const page=e.root.querySelector('.page'); assert.ok(page.classList.contains('paper-'+p.id),p.id); } });
t('origin sidebars rendered only on washi, vellum, typewriter paper',()=>{ const e=mk(); e.app.go('settings'); const w=[...e.root.querySelectorAll('[data-origin]')].map(o=>o.closest('[data-action]').dataset.arg); assert.deepEqual(w,['washi','vellum','typewriter']); });

cat('14) Font picker bold/italic');
t('16 fonts listed; B/I toggles only where available',()=>{ const e=mk(); e.app.go('settings'); assert.equal(e.root.querySelectorAll('[data-action=font]').length,16);
  for(const f of C.FONTS){ assert.equal(!!e.root.querySelector(`[data-action=fontStyle][data-arg=bold][data-font="${f.name}"]`),f.bold,f.name+' bold'); assert.equal(!!e.root.querySelector(`[data-action=fontStyle][data-arg=italic][data-font="${f.name}"]`),f.italic,f.name+' italic'); } });
t('toggling bold/italic applies to writing page; unavailable style rejected & cleared on font switch',()=>{ const e=mk(); makeBook(e); e.app.go('settings'); e.click('[data-action=fontStyle][data-arg=bold][data-font="Georgia"]'); e.click('[data-action=fontStyle][data-arg=italic][data-font="Georgia"]');
  e.app.go('writing'); const st=e.root.querySelector('.page').getAttribute('style'); assert.match(st,/font-weight:700/); assert.match(st,/font-style:italic/);
  e.app.set('font','Impact'); assert.equal(e.app.state.settings.bold,false); assert.throws(()=>e.app.set('italic',true)); });

cat('15) Font color paper-aware locking');
t('settings shows locked swatches per paper (unclickable) for every paper',()=>{ const e=mk(); e.app.go('settings'); for(const p of C.PAPERS){ e.app.set('paper',p.id);
  const avail=[...e.root.querySelectorAll('[data-action=fontColor]')].map(b=>b.dataset.arg); assert.deepEqual(avail.sort(),p.colors.slice().sort(),p.id); assert.equal(e.root.querySelectorAll('.swatch.locked').length,14-p.colors.length); } });
t('choosing a locked color throws; switching paper auto-replaces a now-locked color',()=>{ const a=new C.App(); a.set('paper','parchment'); assert.throws(()=>a.set('fontColor','pale yellow')); a.set('fontColor','burgundy'); a.set('paper','blueprint'); assert.equal(a.state.settings.fontColor,'soft white'); });

cat('16) Reading speed → reading time');
t('estimate changes with WPM (4,500 words: 225→20 min, 450→10 min)',()=>{ const a=new C.App(); const txt='word '.repeat(4500); assert.equal(a.readingLabel(txt),'about 20 minutes to read'); a.set('wpm',450); assert.equal(a.readingLabel(txt),'about 10 minutes to read'); });
t('slider/number field updates writing screen label',()=>{ const e=mk(); makeBook(e); e.app.type('word '.repeat(3000)); e.app.go('settings'); const n=e.root.querySelector('input[type=number][data-setting-num]'); n.value='300'; n.dispatchEvent(new e.w.Event('change',{bubbles:true}));
  e.app.go('writing'); assert.match(e.root.querySelector('#readTime').textContent,/about 10 minutes to read · 300 WPM/); });

cat('17) Leather-bound theme');
t('leather class applied on all 7 screens + gold trim/brown texture CSS present',()=>{ const e=mk(); makeBook(e); e.app.go('settings'); e.click('[data-action=theme][data-arg=leather]');
  const css=fs.readFileSync(path.join(__dirname,'../src/styles.css'),'utf8'); assert.match(css,/\.theme-leather\{background:#3b2414[^}]*#c9a24a/);
  for(const s of C.SCREENS){ e.app.state.screen=s; e.ui.render(); assert.ok(e.root.querySelector('.screen').classList.contains('theme-leather'),s); } });

cat('18) Page-turn on all navigation');
t('every screen-to-screen transition plays page-turn once',()=>{ const sounds=[]; let now=0; const sm=new C.SoundManager(c=>sounds.push(c)); const real=sm.play.bind(sm); sm.play=(c)=>real(c,now+=1000); const a=new C.App(C.memStorage(),sm);
  const path2=['setup','chapterTitle','writing','settings','characters','characterBuilder','setup','home','settings','home']; for(const s of path2) a.go(s); assert.equal(sounds.filter(x=>x==='pageTurn').length,path2.length); });
t('no page-turn when staying on same screen; chapter flips also turn page',()=>{ const sounds=[]; let now=0; const sm=new C.SoundManager(c=>sounds.push(c)); const real=sm.play.bind(sm); sm.play=(c)=>real(c,now+=1000); const a=new C.App(C.memStorage(),sm);
  a.go('home'); assert.equal(sounds.length,0); a.newBook(); a.skipSetup(); a.confirmChapterTitle('x'); const n=sounds.length; a.addChapter(); a.selectChapter(0); assert.equal(sounds.length-n,2); });
t('page-turn toggle off silences navigation',()=>{ const sounds=[]; const sm=new C.SoundManager(c=>sounds.push(c)); const a=new C.App(C.memStorage(),sm); a.set('sound.pageTurn',false); a.go('settings'); a.go('home'); assert.equal(sounds.length,0); });

cat('19) Typewriter & pencil toggles independent');
t('all four on/off combos behave independently (UI typing)',()=>{ for(const [tw,pc] of [[true,true],[true,false],[false,true],[false,false]]){ const e=mk(); makeBook(e); e.app.set('sound.typewriter',tw); e.app.set('sound.pencil',pc); e.sounds.length=0;
  const ta=e.root.querySelector('#writeArea'); ta.value='a'; ta.dispatchEvent(new e.w.Event('input',{bubbles:true}));
  assert.equal(e.sounds.includes('typewriter'),tw); assert.equal(e.sounds.includes('pencil'),pc); assert.equal(e.app.state.settings.sound.pageTurn,true); } });
t('both ON by default',()=>{ const s=C.defaultSettings().sound; assert.ok(s.typewriter&&s.pencil&&s.pageTurn); });

(async()=>{
  const out=[]; let P=0,F=0;
  for(const c of cats){ c.pass=0; c.fail=0; for(const x of c.tests){ try{ await x.fn(); x.ok=true; c.pass++; }catch(e){ x.ok=false; x.err=(e.message||String(e)).split('\n')[0]; c.fail++; } } P+=c.pass; F+=c.fail;
    console.log(`${c.fail?'FAIL':'PASS'}  ${c.name}  ${c.pass}/${c.tests.length}`); c.tests.filter(x=>!x.ok).forEach(x=>console.log('   ✗',x.name,'—',x.err)); }
  const ts=new Date().toLocaleString('en-US',{timeZone:'America/Chicago'});
  out.push(`# Test Results — AI Story Co-Writer local prototype`,``,`Run: ${ts} (CT) · Node ${process.version} · jsdom for UI/state tests · command: \`node tests/run.js\``,``,`**Overall: ${P} passed, ${F} failed (${P+F} tests, ${cats.length} categories)**`,``,`| Category | Result | Passed | Failed |`,`|---|---|---|---|`);
  cats.forEach(c=>out.push(`| ${c.name} | ${c.fail?'FAIL':'PASS'} | ${c.pass} | ${c.fail} |`));
  out.push('','## SPEED timings (avg ms per op; threshold 500 ms)','','| Operation | ms | Over 500ms? |','|---|---|---|'); speed.forEach(s=>out.push(`| ${s.name} | ${s.ms.toFixed(3)} | ${s.ms>500?'YES ⚠':'no'} |`));
  for(const c of cats){ out.push('',`## ${c.name} — ${c.fail?'FAIL':'PASS'} (${c.pass}/${c.tests.length})`,''); c.tests.forEach(x=>out.push(`- ${x.ok?'PASS':'FAIL'} — ${x.name}${x.ok?'':' — '+x.err}`)); }
  out.push('','## Notes','- UI tests run against the real `src/app.js` rendering in jsdom (no real browser); audio is simulated through the SoundManager player hook, so overlap/cut-out is verified by scheduling logic, not by listening.','- Spell check uses a bundled ~20k-word English list + common-typo map; rare/proper nouns may be flagged.','- Construction paper was dropped Nov 4 (contrast too tight); 11 papers remain.\n- AI writing (Redo/Quick edit) calls the local Gemini proxy (server/ai-proxy.js); tests mock fetch and never call Gemini.');
  fs.writeFileSync(path.join(__dirname,'../TEST-RESULTS.md'),out.join('\n')+'\n'); console.log(`\n${P} passed, ${F} failed`); process.exitCode=F?1:0;
})();
