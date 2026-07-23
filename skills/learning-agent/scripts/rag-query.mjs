import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, extname } from 'path';

const KB = process.argv.find(a=>a.startsWith('--kb='))?.slice(5) || join(process.env.USERPROFILE,'knowledge-base');
const TOP = parseInt(process.argv.find(a=>a.startsWith('--top-k='))?.slice(8))||5;
const EXT = new Set(['.md','.txt','.text','.c','.h','.cpp','.hpp']);

function tok(t) {
    const r=[];
    (t.match(/[a-zA-Z_]\w*/g)||[]).forEach(w=>r.push(w.toLowerCase()));
    (t.match(/[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]+/g)||[]).forEach(s=>{
        for(let i=0;i<s.length;i++) r.push(s[i]);
        for(let i=0;i<s.length-1;i++) r.push(s.substring(i,i+2));
    });
    return r;
}

function load(root) {
    const docs=[];
    function walk(d) {
        if(!existsSync(d)) return;
        for(const e of readdirSync(d)) {
            const f=join(d,e);
            if(e==='index'||e.startsWith('.')) continue;
            if(statSync(f).isDirectory()){walk(f);continue;}
            if(EXT.has(extname(f).toLowerCase())) {
                try {
                    const text=readFileSync(f,'utf-8');
                    const rel=f.replace(root,'').replace(/^[/\\]/,'');
                    text.split(/\n\s*\n/).filter(p=>p.trim().length>30).forEach(p=>{
                        docs.push({text:p.trim(),src:rel,tokens:tok(p)});
                    });
                } catch(e){}
            }
        }
    }
    walk(root);
    return docs;
}

const k1=1.5,b=0.75;
const docs=load(KB);
const N=docs.length;
if(N===0){console.log(JSON.stringify({error:'empty_kb'}));process.exit(1);}
const avgdl=docs.reduce((s,d)=>s+d.tokens.length,0)/N;
const df=new Map();
docs.forEach(d=>{[...new Set(d.tokens)].forEach(t=>df.set(t,(df.get(t)||0)+1));});

// 查询参数：不包含 -- 前缀、不是 node 路径、不是脚本路径
const q=process.argv.slice(2).find(a=>!a.startsWith('--'));
if(!q){console.log(JSON.stringify({error:'no_query'}));process.exit(1);}
const qt=tok(q);

const results=docs.map(d=>{
    const freq=new Map(); d.tokens.forEach(t=>freq.set(t,(freq.get(t)||0)+1));
    const dl=d.tokens.length;
    let s=0;
    qt.forEach(t=>{
        const qf=freq.get(t)||0; if(qf===0) return;
        const n=df.get(t)||0;
        const idf=Math.log((N-n+0.5)/(n+0.5)+1);
        s+=idf*((qf*(k1+1))/(qf+k1*(1-b+b*(dl/avgdl))));
    });
    return {s,src:d.src,text:d.text.substring(0,300)};
}).filter(r=>r.s>0).sort((a,b)=>b.s-a.s).slice(0,TOP);

console.log(JSON.stringify(results.map(r=>({source:r.src,score:r.s,text:r.text})),null,2));
if(results.length===0) console.error('[RAG] No matching results for query:', q);
