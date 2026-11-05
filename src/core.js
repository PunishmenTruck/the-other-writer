// Story Co-Writer core logic: shared by browser UI and Node tests.
(function (root) {
'use strict';
const WORDS = (typeof module !== 'undefined') ? require('./words.js') : root.STORY_WORDS;

// ---------- Data from BUILD-LIST.md ----------
const GENRE_GROUPS = {
  'Fiction': ['Literary','General','Psychological','Coming-of-age','Family saga','Satire','Absurdist','Drama','Poetry'],
  'Speculative': ['Sci-fi','Fantasy','Horror','Supernatural','Magical realism','Urban fantasy','Space opera','Gothic','Post-apocalyptic','Alternate history','Biopunk','Solarpunk','Afrofuturism'],
  'Crime and Suspense': ['Mystery','Thriller','Crime','Noir','True crime','Political thriller','Legal thriller'],
  'Romance': ['Romance','Contemporary','Historical romance','Erotica'],
  'Historical and Western': ['Historical','Western','War','Military fiction'],
  'Real life': ['Memoir','Nonfiction','Biography','Religious','Inspirational','Sports','Travel'],
  'Kids and YA': ['Kids','Middle-grade','YA','Fairy tale','Folklore'],
  'World and Other': ['Indigenous literature','Translated fiction','Adventure','Comedy','Dystopian','Medical drama'],
};
const GENRE_TIPS = {
  'Fiction':'Character-driven stories about everyday or inner life.',
  'Speculative':'What-if worlds: science, magic, the uncanny.',
  'Crime and Suspense':'Puzzles, danger, and tension.',
  'Romance':'Love and relationships at the center.',
  'Historical and Western':'Stories set in the past or on the frontier.',
  'Real life':'True or true-to-life writing.',
  'Kids and YA':'Written for younger readers.',
  'World and Other':'Global voices and genre-blending picks.',
};
const TONES = ['Dark','Gritty','Fast-paced','Lighthearted','Serious','Humorous','Romantic','Tense','Calm','Epic','Melancholy','Hopeful','Cynical','Whimsical','Suspenseful','Emotional','Action-packed','Introspective','Soft','Bleak','Uplifting'];
const LENGTH_GOALS = ['Flash fiction','Short','Novelette','Novella','Full','Chapter book'];
const CHARACTER_CHOICES = ['Scenario fills them','Add my own','Copy from book'];
const ROLES = ['Protagonist','Sidekick','Antagonist','Mentor','Love interest','Rival','Ally','Villain','Antihero','Narrator','Supporting','Minor','Custom'];
const VOICES = ['Bold','Shy','Sarcastic','Stoic','Charismatic','Mysterious','Hot-headed','Gentle','Custom'];
const CHARACTER_FIELDS = ['name','age','appearance','description','role','backstory','voice','relationship'];

const COLORS = {
  'ink black':'#141414','dark brown':'#4a2c17','warm charcoal':'#3a3632','deep sepia':'#5b3a1e','navy':'#1f2f5c',
  'forest green':'#1f4a2c','burgundy':'#6b1a2a','deep purple':'#3d1f66',
  'soft white':'#f2f2ee','warm cream':'#f3e6c8','light gray':'#cfcfcf','pale yellow':'#f6eaa0','muted blue':'#9db4d6','light cyan':'#bff0f5',
};
const ORIGINAL_FIVE = ['soft white','warm cream','light gray','pale yellow','muted blue'];
const PAPERS = [
  { id:'lined', name:'Lined', bg:'#fbfaf3', colors:['ink black','dark brown','warm charcoal','deep sepia','navy','forest green','burgundy'] },
  { id:'parchment', name:'Parchment', bg:'#ecdcb4', colors:['ink black','dark brown','deep sepia','warm charcoal','forest green','burgundy'] },
  { id:'watercolor', name:'Watercolor', bg:'#eef1f4', colors:['ink black','warm charcoal','dark brown','navy','forest green','burgundy'] },
  { id:'blank', name:'Blank', bg:'#f8f4ea', colors:['ink black','dark brown','warm charcoal','deep sepia','navy','burgundy'] },
  { id:'washi', name:'Washi', bg:'#f1ead8', origin:'Japan', colors:['ink black','dark brown','deep sepia','warm charcoal','forest green','burgundy'] },
  { id:'vellum', name:'Vellum', bg:'#f0e6d0', origin:'Animal skin, medieval era', colors:['ink black','dark brown','deep sepia','warm charcoal','forest green','burgundy'] },
  { id:'rice', name:'Rice paper', bg:'#f6f3ea', colors:['ink black','dark brown','warm charcoal','navy','forest green','burgundy'] },
  { id:'newsprint', name:'Newsprint', bg:'#dcd8cc', colors:['ink black','dark brown','navy','forest green','burgundy'] },
  { id:'blueprint', name:'Blueprint', bg:'#1d4f8c', colors:['soft white','warm cream','light gray','pale yellow','muted blue','light cyan'] },
  { id:'carbon', name:'Carbon copy', bg:'#e9e4f2', colors:['ink black','dark brown','warm charcoal','deep purple','navy'] },
  { id:'typewriter', name:'Typewriter paper', bg:'#fdfdfb', origin:'20th century offices', binderHoles:true, colors:['ink black','dark brown','warm charcoal','navy','forest green','burgundy'] },
];
const FONTS = [
  ['Serif','Georgia',1,1],['Serif','Times',1,1],['Serif','Palatino',1,1],
  ['Sans','Arial',1,1],['Sans','Helvetica',1,1],['Sans','Verdana',1,1],['Sans','Open Sans',1,1],
  ['Mono','Courier',1,1],['Mono','Monaco',0,0],['Mono','Consolas',1,1],
  ['Display','Impact',0,0],['Display','Playfair',1,1],['Display','Garamond',1,1],
  ['Script','Pacifico',0,0],['Script','Dancing Script',1,0],['Script','Indie Flower',0,0],
].map(([group,name,bold,italic]) => ({group,name,bold:!!bold,italic:!!italic}));
const THEMES = ['follow-os','dark','light','leather'];

// ---------- Color helpers ----------
function lum(hex){ const c=[1,3,5].map(i=>parseInt(hex.substr(i,2),16)/255).map(v=>v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4)); return 0.2126*c[0]+0.7152*c[1]+0.0722*c[2]; }
function contrast(a,b){ const x=lum(a),y=lum(b); return (Math.max(x,y)+0.05)/(Math.min(x,y)+0.05); }
const paperById = id => PAPERS.find(p=>p.id===id);
function colorsForPaper(id){
  const p=paperById(id); if(!p) throw new Error('unknown paper '+id);
  return Object.keys(COLORS).map(name=>({name,hex:COLORS[name],available:p.colors.includes(name),contrast:+contrast(COLORS[name],p.bg).toFixed(2)}));
}
const availableColors = id => paperById(id).colors.slice();
const isColorLocked = (id,c) => !paperById(id).colors.includes(c);

// ---------- Spell check ----------
const MISSPELL_BLOCK = new Set(['teh','alot','seperate','definately']);
const DICT = new Set(WORDS.filter(w=>!MISSPELL_BLOCK.has(w)));
const COMMON_FIXES = {teh:'the',writting:'writing',recieve:'receive',seperate:'separate',definately:'definitely',becuase:'because',wierd:'weird',freind:'friend',untill:'until',tommorow:'tomorrow',thier:'their',adn:'and',taht:'that',wiht:'with',alot:'a lot',occured:'occurred',begining:'beginning',neccessary:'necessary'};
['occurred'].forEach(w=>DICT.add(w));
const RANK = new Map(WORDS.map((w,i)=>[w,i]));
const LETTERS='abcdefghijklmnopqrstuvwxyz';
function edits1(w){ const out=new Set(); for(let i=0;i<=w.length;i++){ const a=w.slice(0,i),b=w.slice(i);
  if(b) out.add(a+b.slice(1)); if(b.length>1) out.add(a+b[1]+b[0]+b.slice(2));
  for(const c of LETTERS){ if(b) out.add(a+c+b.slice(1)); out.add(a+c+b); } } return out; }
const IRREG={"can't":1,"won't":1,"shan't":1,"ain't":1};
function isWord(w){ const l=w.toLowerCase().replace(/'s$/,''); if(IRREG[l]) return true; if(/n't$/.test(l)) return DICT.has(l.slice(0,-3)); return DICT.has(l)||/^\d+$/.test(l)||/^[a-z]+'(t|re|ve|ll|d|m)$/.test(l)&&DICT.has(l.split("'")[0]); }
function suggest(word,max=5){
  const w=word.toLowerCase(); const res=[];
  if(COMMON_FIXES[w]) res.push(COMMON_FIXES[w]);
  const e1=[...edits1(w)].filter(x=>DICT.has(x));
  let cands=e1; if(!cands.length){ const s=new Set(); for(const e of edits1(w)) for(const e2 of edits1(e)) if(DICT.has(e2)) s.add(e2); cands=[...s]; }
  cands.sort((a,b)=>(RANK.get(a)??1e9)-(RANK.get(b)??1e9));
  for(const c of cands) if(!res.includes(c)) res.push(c);
  return res.slice(0,max);
}
function spellcheck(text){
  const out=[]; const re=/[A-Za-z][A-Za-z']*/g; let m;
  while((m=re.exec(text))){ const w=m[0].replace(/'+$/,''); if(!isWord(w)) out.push({word:w,index:m.index,suggestions:suggest(w)}); }
  return out;
}

// ---------- Sound manager ----------
class SoundManager {
  constructor(player){ this.player=player||(()=>{}); this.enabled={typewriter:true,pencil:true,pageTurn:true}; this.playing={}; this.log=[]; this.minGap={typewriter:60,pencil:80,pageTurn:250}; this.dur={typewriter:50,pencil:70,pageTurn:220}; }
  setEnabled(ch,v){ if(!(ch in this.enabled)) throw new Error('channel'); this.enabled[ch]=!!v; }
  play(ch,now=Date.now()){
    if(!this.enabled[ch]) return {played:false,reason:'disabled'};
    const p=this.playing[ch]; if(p && now < p.until) return {played:false,reason:'busy'}; // no self-overlap, never cut off a playing sound
    this.playing[ch]={start:now,until:now+Math.max(this.dur[ch],this.minGap[ch])};
    this.log.push({ch,at:now}); this.player(ch); return {played:true};
  }
}

// ---------- Flow / app state ----------
const SCREENS=['home','setup','chapterTitle','writing','settings','characters','characterBuilder'];
function defaultSettings(){ return { theme:'dark', paper:'blank', fontColor:'ink black', font:'Georgia', bold:false, italic:false, wpm:225,
  sound:{typewriter:true,pencil:true,pageTurn:true}, notify20:true, showDollars:false, model:'gemini-3.8-flash', caps:{daily:'',weekly:'',monthly:''}, age18:false }; }
function emptyDraft(){ return { title:'', genres:[], tones:[], scenario:'', length:null, characterChoice:null, characters:[], skipped:false, subgroup:null }; }
function memStorage(){ const m={}; return { getItem:k=>k in m?m[k]:null, setItem:(k,v)=>{m[k]=String(v);}, removeItem:k=>{delete m[k];}, _m:m }; }
const KEY='storyCoWriter.v1';

class App {
  constructor(storage, sound){ this.storage=storage||memStorage(); this.sound=sound||new SoundManager(); this.listeners=[]; this.load(); }
  load(){ let d=null; try{ d=JSON.parse(this.storage.getItem(KEY)||'null'); }catch(e){}
    this.state=Object.assign({screen:'home', books:[], settings:defaultSettings(), draft:emptyDraft(), savedDraft:null, currentBook:null, currentChapter:0, savedAt:null, refOpen:false, nextId:1}, d||{});
    this.state.settings=Object.assign(defaultSettings(), this.state.settings); this.syncSound(); }
  serialize(){ return JSON.stringify(this.state); }
  persist(){ this.storage.setItem(KEY,this.serialize()); }
  syncSound(){ for(const k of Object.keys(this.state.settings.sound)) this.sound.setEnabled(k,this.state.settings.sound[k]); }
  emit(){ this.persist(); this.listeners.forEach(f=>f(this.state)); }
  go(screen){ if(!SCREENS.includes(screen)) throw new Error('bad screen '+screen); const from=this.state.screen; this.state.screen=screen; if(from!==screen) this.sound.play('pageTurn'); this.emit(); }
  // Home
  newBook(){ this.state.draft = this.state.savedDraft ? JSON.parse(JSON.stringify(this.state.savedDraft)) : emptyDraft(); this.go('setup'); }
  // Setup
  setTitle(t){ this.state.draft.title=t; this.emit(); }
  openSubgroup(g){ if(g!==null && !GENRE_GROUPS[g]) throw new Error('bad group'); this.state.draft.subgroup=g; this.sound.play('typewriter'); this.emit(); }
  genresInView(){ const g=this.state.draft.subgroup; return g?GENRE_GROUPS[g]:Object.keys(GENRE_GROUPS); }
  toggleTag(kind,v){ const a=this.state.draft[kind]; const i=a.indexOf(v); if(i>=0) a.splice(i,1); else a.push(v); this.sound.play('pencil'); this.emit(); }
  removeTag(kind,v){ this.state.draft[kind]=this.state.draft[kind].filter(x=>x!==v); this.emit(); }
  setScenario(s){ this.state.draft.scenario=s; this.emit(); }
  setLength(l){ if(!LENGTH_GOALS.includes(l)) throw new Error('bad length'); this.state.draft.length=l; this.emit(); }
  setCharacterChoice(c){ if(!CHARACTER_CHOICES.includes(c)) throw new Error('bad choice'); this.state.draft.characterChoice=c;
    if(c==='Add my own') this.go('characterBuilder');
    else if(c==='Scenario fills them' && !this.state.draft.characters.length){ const names=(this.state.draft.scenario.match(/\b[A-Z][a-z]+\b/g)||[]).filter((v,i,a)=>a.indexOf(v)===i).slice(0,3);
      (names.length?names:['Hero','Rival']).forEach((n,i)=>this.state.draft.characters.push({name:n,role:i?'Supporting':'Protagonist',generated:true})); this.emit(); }
    else if(c==='Copy from book'){ const src=this.state.books.find(b=>b.characters&&b.characters.length); if(src) src.characters.forEach(ch=>{ if(!this.state.draft.characters.some(x=>x.name===ch.name)) this.state.draft.characters.push({...ch}); }); this.emit(); }
    else this.emit(); }
  saveCharacter(ch){ if(!ch||!ch.name||!ch.name.trim()) throw new Error('name required'); if(ch.role && !ROLES.includes(ch.role)) throw new Error('bad role');
    const c={}; CHARACTER_FIELDS.forEach(f=>c[f]=ch[f]||''); this.state.draft.characters.push(c); this.sound.play('typewriter'); this.go(this.state.currentBook?'writing':'setup'); return c; }
  removeCharacter(name){ this.state.draft.characters=this.state.draft.characters.filter(c=>c.name!==name); this.emit(); }
  saveDraft(){ this.state.savedDraft=JSON.parse(JSON.stringify(this.state.draft)); this.sound.play('typewriter'); this.emit(); return true; }
  continueToWrite(){ this.state.draft.skipped=false; this.go('chapterTitle'); }
  skipSetup(){ this.state.draft.skipped=true; this.go('chapterTitle'); }
  confirmChapterTitle(t){ const d=this.state.draft; const title=(t&&t.trim())||'Chapter 1';
    if(this.state.currentBook && this.state.screen==='chapterTitle' && d._edit){ /* unused */ }
    const book={ id:this.state.nextId++, title:d.title.trim()||'Untitled', genres:d.skipped?[]:d.genres.slice(), tones:d.skipped?[]:d.tones.slice(), scenario:d.skipped?'':d.scenario,
      length:d.skipped?null:d.length, characters:d.skipped?[]:d.characters.slice(), chapters:[{title, text:''}], archived:false, trashed:false, created:Date.now() };
    this.state.books.push(book); this.state.currentBook=book.id; this.state.currentChapter=0; this.state.savedDraft=null; this.state.draft=emptyDraft(); this.go('writing'); return book; }
  // Writing
  book(id){ return this.state.books.find(b=>b.id===(id??this.state.currentBook)); }
  openBook(id){ this.state.currentBook=id; this.state.currentChapter=0; this.go('writing'); }
  type(text){ const b=this.book(); b.chapters[this.state.currentChapter].text=text; this.state.savedAt=Date.now(); this.emit(); return this.state.savedAt; }
  addChapter(title){ const b=this.book(); b.chapters.push({title:title||('Chapter '+(b.chapters.length+1)),text:''}); this.state.currentChapter=b.chapters.length-1; this.sound.play('pageTurn'); this.emit(); }
  selectChapter(i){ this.state.currentChapter=i; this.sound.play('pageTurn'); this.emit(); }
  aiContext(){ const b=this.book(); const ch=b.chapters[this.state.currentChapter];
    return { model:this.state.settings.model||'gemini-3.8-flash', title:b.title, genres:b.genres, tones:b.tones, scenario:b.scenario,
      characters:b.characters, chapterTitle:ch.title, existingText:ch.text, lengthGoal:b.length }; }
  async aiCall(route, body){ const f=this.fetch||(typeof fetch!=='undefined'?fetch:null);
    if(!f){ if(this.aiPlaceholder) return {text:'[AI placeholder] The lantern flickered as the wind rose.'}; throw new Error('AI unavailable (no fetch)'); }
    const r=await f((this.aiBase||'')+route,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
    let j={}; try{ j=await r.json(); }catch(e){}
    if(!r.ok||j.error) throw new Error(j.error||('AI proxy error '+r.status)); if(!j.text) throw new Error('AI returned no text'); return j; }
  aiAction(kind, opts={}){ if(!['keep','redo','quickEdit'].includes(kind)) throw new Error('bad'); const b=this.book(); const ch=b.chapters[this.state.currentChapter];
    if(kind==='keep'){ if(ch.pending){ ch.text+=(ch.text?'\n\n':'')+ch.pending; ch.pending=null; } this.state.savedAt=Date.now(); this.emit(); return Promise.resolve(kind); }
    if(this.state.aiBusy) return Promise.resolve(null);
    this.state.aiBusy=kind; this.state.aiError=null; if(kind==='quickEdit') ch.lastQuickEdit=Date.now(); this.emit();
    let job;
    if(kind==='redo') job=this.aiCall('/ai/continue',this.aiContext()).then(j=>{ ch.pending=j.text.trim(); });
    else { const usePending=!opts.passage&&!!ch.pending; const paras=(ch.text||'').split(/\n\n/);
      const passage=opts.passage||ch.pending||paras[paras.length-1]||'';
      if(!passage.trim()){ this.state.aiBusy=null; this.state.aiError='Nothing to edit yet.'; this.emit(); return Promise.resolve(null); }
      job=this.aiCall('/ai/quick-edit',{model:this.aiContext().model,passage,instruction:opts.instruction||'Improve this passage.',bookContext:this.aiContext()}).then(j=>{ const out=j.text.trim();
        if(usePending) ch.pending=out; else if(opts.passage&&ch.text.includes(opts.passage)) ch.text=ch.text.replace(opts.passage,out);
        else { paras[paras.length-1]=out; ch.text=paras.join('\n\n'); } }); }
    return job.then(()=>{ this.state.aiBusy=null; this.state.savedAt=Date.now(); this.persist&&this.persist(); this.emit(); return kind; },
      e=>{ this.state.aiBusy=null; this.state.aiError=e.message; this.emit(); return null; }); }
  toggleRef(v){ this.state.refOpen = v===undefined?!this.state.refOpen:!!v; this.emit(); }
  editRef(field,value){ const b=this.book(); if(!['scenario','genres','tones','characters'].includes(field)) throw new Error('bad field'); b[field]=value; this.emit(); }
  readingMinutes(text){ const words=(text||'').trim().split(/\s+/).filter(Boolean).length; return words/Math.max(50,this.state.settings.wpm); }
  readingLabel(text){ const m=this.readingMinutes(text); if(m<1) return 'under a minute to read'; return 'about '+Math.round(m)+' minute'+(Math.round(m)===1?'':'s')+' to read'; }
  // Home library
  visibleBooks(){ return this.state.books.filter(b=>!b.archived&&!b.trashed); }
  archive(id){ this.book(id).archived=true; this.emit(); }
  trash(id){ this.book(id).trashed=true; this.emit(); }
  restore(id){ const b=this.book(id); b.archived=false; b.trashed=false; this.emit(); }
  search(q){ q=q.toLowerCase().trim(); if(!q) return []; const r=[];
    for(const b of this.state.books){ if(b.trashed) continue; if(b.title.toLowerCase().includes(q)) r.push({bookId:b.id,where:'title'});
      b.chapters.forEach((c,i)=>{ if(c.title.toLowerCase().includes(q)||c.text.toLowerCase().includes(q)) r.push({bookId:b.id,chapter:i,where:'chapter'}); }); }
    return r; }
  // Settings
  set(path,value){ const parts=path.split('.'); let o=this.state.settings; while(parts.length>1) o=o[parts.shift()]; o[parts[0]]=value;
    if(path==='paper' && isColorLocked(value,this.state.settings.fontColor)) this.state.settings.fontColor=availableColors(value)[0];
    if(path==='fontColor' && isColorLocked(this.state.settings.paper,value)) throw new Error('color locked on this paper');
    if(path==='font'){ const f=FONTS.find(x=>x.name===value); if(!f.bold) this.state.settings.bold=false; if(!f.italic) this.state.settings.italic=false; }
    if(path==='bold'||path==='italic'){ const f=FONTS.find(x=>x.name===this.state.settings.font); if(value && !f[path]) { this.state.settings[path]=false; throw new Error(path+' not available for '+f.name); } }
    if(path.startsWith('sound.')) this.syncSound(); this.emit(); }
  editBookSetup(){ const b=this.book(); this.state.draft=b?{title:b.title,genres:b.genres.slice(),tones:b.tones.slice(),scenario:b.scenario,length:b.length,characterChoice:null,characters:b.characters.slice(),skipped:false,subgroup:null,editing:b.id}:emptyDraft(); this.go('setup'); }
}

const API={GENRE_GROUPS,GENRE_TIPS,TONES,LENGTH_GOALS,CHARACTER_CHOICES,ROLES,VOICES,CHARACTER_FIELDS,COLORS,ORIGINAL_FIVE,PAPERS,FONTS,THEMES,SCREENS,
  contrast,colorsForPaper,availableColors,isColorLocked,paperById,spellcheck,suggest,isWord,SoundManager,App,memStorage,defaultSettings,KEY};
if(typeof module!=='undefined') module.exports=API; else root.StoryCore=API;
})(this);
