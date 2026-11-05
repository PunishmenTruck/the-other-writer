// The Other Writer — local Gemini proxy. Key comes ONLY from env GEMINI_API_KEY or ../.env.local (gitignored).
const http=require('http'), fs=require('fs'), path=require('path');
const ROOT=path.join(__dirname,'..'), SRC=path.join(ROOT,'src'), PORT=+process.env.PORT||8787, DEFAULT_MODEL='gemini-3.8-flash';
function loadKey(){ if(process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY.trim();
  try{ const m=fs.readFileSync(path.join(ROOT,'.env.local'),'utf8').match(/^\s*GEMINI_API_KEY\s*=\s*"?([^"\r\n]+)"?/m); return m?m[1].trim():''; }catch(e){ return ''; } }
const list=x=>Array.isArray(x)?x.join(', '):(x||'');
const chars=c=>(c||[]).map(x=>typeof x==='string'?x:[x.name,x.role&&`(${x.role})`,x.personality,x.appearance,x.backstory,x.relationship&&`relationship: ${x.relationship}`].filter(Boolean).join(' ')).join('; ');
function storyBrief(b){ return [`Book title: ${b.title||'Untitled'}`,`Genres: ${list(b.genres)||'any'}`,`Tones: ${list(b.tones)||'any'}`,`Scenario: ${b.scenario||'(none given)'}`,`Characters: ${chars(b.characters)||'(none given)'}`,`Chapter: ${b.chapterTitle||''}`].join('\n'); }
function lengthHint(g){ const s=String(g||'').toLowerCase(); if(/novel|long|epic/.test(s)) return 'two to three paragraphs'; return 'about one paragraph'; }
function continuePrompt(b){ const t=(b.existingText||'').slice(-6000);
  return `You are a co-writer of fiction. Match the genres, tones, scenario and characters below.\n${storyBrief(b)}\n\n`+
    (t.trim()?`Story so far (continue directly from where it stops, do not repeat it):\n"""\n${t}\n"""\n`:`The chapter is empty. Write the opening of this chapter.\n`)+
    `Write ${lengthHint(b.lengthGoal)} of new story prose. Plain prose only: no headings, no markdown, no notes, no quotation of these instructions.`; }
function editPrompt(b){ const ctx=b.bookContext||{};
  return `You are a fiction editor. Rewrite ONLY the passage below according to the instruction. Keep the same story events, point of view and style unless told otherwise. Return only the rewritten passage as plain prose — no markdown, no commentary.\n${storyBrief(ctx)}\n\nInstruction: ${b.instruction||'Improve it.'}\n\nPassage:\n"""\n${b.passage||''}\n"""`; }
const FALLBACK_MODEL='gemini-2.5-flash-lite';
function isBusy(e){ return [429,500,503].includes(e.upstream)||/high demand|overloaded|unavailable|quota|exhausted/i.test(e.message||''); }
async function geminiWithFallback(model,prompt,key){ try{ return await gemini(model,prompt,key); }catch(e){ if(model!==FALLBACK_MODEL&&isBusy(e)) return await gemini(FALLBACK_MODEL,prompt,key); throw e; } }
async function gemini(model,prompt,key){
  const r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`,
    {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({contents:[{role:'user',parts:[{text:prompt}]}],generationConfig:{temperature:0.9}})});
  const j=await r.json().catch(()=>({}));
  if(!r.ok) throw Object.assign(new Error((j.error&&j.error.message)||('Gemini HTTP '+r.status)),{status:502,upstream:r.status});
  const text=(((j.candidates||[])[0]||{}).content||{}).parts?.map(p=>p.text||'').join('').trim();
  if(!text) throw Object.assign(new Error('Gemini returned no text'+(j.promptFeedback?.blockReason?' ('+j.promptFeedback.blockReason+')':'')),{status:502});
  return text.replace(/^```\w*\n?|```$/g,'').trim(); }
const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.txt':'text/plain','.webmanifest':'application/manifest+json'};
function send(res,code,obj){ res.writeHead(code,{'Content-Type':'application/json','Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Content-Type','Access-Control-Allow-Methods':'POST, GET, OPTIONS'}); res.end(JSON.stringify(obj)); }
const server=http.createServer((req,res)=>{
  if(req.method==='OPTIONS') return send(res,204,{});
  if(req.method==='POST'&&(req.url==='/ai/continue'||req.url==='/ai/quick-edit')){
    let raw=''; req.on('data',d=>{ raw+=d; if(raw.length>2e6) req.destroy(); });
    req.on('end',async()=>{ let b; try{ b=JSON.parse(raw||'{}'); }catch(e){ return send(res,400,{error:'Bad JSON'}); }
      const key=loadKey(); if(!key) return send(res,503,{error:'GEMINI_API_KEY is not set. Start the proxy with GEMINI_API_KEY=... npm start (or put it in .env.local).'});
      if(req.url==='/ai/quick-edit'&&!(b.passage||'').trim()) return send(res,400,{error:'No passage to edit'});
      try{ const text=await geminiWithFallback(b.model||DEFAULT_MODEL, req.url==='/ai/continue'?continuePrompt(b):editPrompt(b), key); send(res,200,{text}); }
      catch(e){ send(res,e.status||500,{error:e.message}); } });
    return; }
  if(req.method==='GET'&&req.url==='/ai/health') return send(res,200,{ok:true,keyLoaded:!!loadKey(),model:DEFAULT_MODEL});
  if(req.method==='GET'){ const u=decodeURIComponent(req.url.split('?')[0]); const f=path.join(SRC,u==='/'?'index.html':u);
    if(!f.startsWith(SRC)) return send(res,403,{error:'forbidden'});
    return fs.readFile(f,(e,d)=>{ if(e) return send(res,404,{error:'not found'}); res.writeHead(200,{'Content-Type':MIME[path.extname(f)]||'application/octet-stream'}); res.end(d); }); }
  send(res,404,{error:'not found'}); });
if(require.main===module) server.listen(PORT,process.env.HOST||(process.env.RENDER?'0.0.0.0':'127.0.0.1'),()=>console.log(`The Other Writer: port ${PORT}  (AI key ${loadKey()?'loaded':'MISSING — set GEMINI_API_KEY'})`));
module.exports={server,continuePrompt,editPrompt};
