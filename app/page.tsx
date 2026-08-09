"use client";

import { useEffect, useMemo, useState } from "react";

type Post = { id:number; name:string; handle:string; avatar:string; tone:string; time:string; body:string; media?:string; likes:number; comments:number; liked?:boolean };

const seed: Post[] = [
  {id:1,name:"Maya Rivers",handle:"@mayarivers",avatar:"MR",tone:"pink",time:"18m",body:"The best communities make room for unfinished thoughts. What are you exploring lately? 🌱",media:"✦",likes:84,comments:16},
  {id:2,name:"Nova Chen",handle:"@novachen",avatar:"NC",tone:"blue",time:"42m",body:"Built a tiny digital garden today. No algorithmic pressure, just a place to wander and connect ideas.",media:"◌",likes:126,comments:24},
  {id:3,name:"Jules Hart",handle:"@julesh",avatar:"JH",tone:"gold",time:"1h",body:"Hot take: social apps should feel more like neighborhoods and less like casinos. 🐝",likes:53,comments:9},
];

const people=[{name:"Sage Kim",handle:"@sage",avatar:"SK",tone:"blue"},{name:"Rio Vale",handle:"@riov",avatar:"RV",tone:"pink"},{name:"Tess Morgan",handle:"@tessm",avatar:"TM",tone:"gold"}];

export default function Home(){
  const [posts,setPosts]=useState<Post[]>(seed);
  const [tab,setTab]=useState("For You");
  const [draft,setDraft]=useState("");
  const [search,setSearch]=useState("");
  const [active,setActive]=useState("Home");
  const [following,setFollowing]=useState<string[]>([]);
  const [comment,setComment]=useState<Record<number,string>>({});
  const [toast,setToast]=useState("");

  useEffect(()=>{ const saved=localStorage.getItem("neuralhive-posts"); if(saved) setPosts(JSON.parse(saved)); },[]);
  useEffect(()=>{ localStorage.setItem("neuralhive-posts",JSON.stringify(posts)); },[posts]);
  useEffect(()=>{ if(!toast)return; const t=setTimeout(()=>setToast(""),2200); return()=>clearTimeout(t)},[toast]);

  const visible=useMemo(()=>posts.filter(p=>`${p.name} ${p.handle} ${p.body}`.toLowerCase().includes(search.toLowerCase())),[posts,search]);
  function publish(){if(!draft.trim())return; const p:Post={id:Date.now(),name:"Alana Sky",handle:"@alanasky",avatar:"AS",tone:"",time:"now",body:draft.trim(),likes:0,comments:0};setPosts([p,...posts]);setDraft("");setToast("Posted to the Hive ✦")}
  function like(id:number){setPosts(posts.map(p=>p.id===id?{...p,liked:!p.liked,likes:p.likes+(p.liked?-1:1)}:p))}
  function addComment(id:number){if(!comment[id]?.trim())return;setPosts(posts.map(p=>p.id===id?{...p,comments:p.comments+1}:p));setComment({...comment,[id]:""});setToast("Comment added")}

  const nav=["⌂ Home","⌕ Explore","✚ Create","♡ Notifications","◎ Profile"];
  return <div className="app">
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">Neural<span>Hive</span></div>
        <nav className="nav">{nav.map(n=>{const label=n.slice(2);return <button key={n} className={active===label?"active":""} onClick={()=>{setActive(label);if(label==="Create")document.getElementById("composer")?.scrollIntoView({behavior:"smooth"})}}>{n}</button>})}</nav>
        <div className="profile-mini"><div className="avatar">AS</div><div><b>Alana Sky</b><div className="handle">@alanasky</div></div></div>
      </aside>

      <main className="main">
        <header className="topbar"><h1>{active==='Home'?'Your Hive':active}</h1><button className="iconbtn" onClick={()=>document.getElementById("search")?.focus()}>⌕</button></header>
        <section className="stories">{[{a:"+",n:"Add story"},{a:"MR",n:"Maya",t:"pink"},{a:"NC",n:"Nova",t:"blue"},{a:"JH",n:"Jules",t:"gold"},{a:"SK",n:"Sage",t:"blue"}].map((s,i)=><div className="story" key={s.n}><div className="ring"><div className={`avatar small ${s.t||""}`}>{s.a}</div></div>{s.n}</div>)}</section>

        <section className="composer" id="composer"><div className="compose-row"><div className="avatar">AS</div><input className="compose-input" value={draft} onChange={e=>setDraft(e.target.value)} onKeyDown={e=>e.key==='Enter'&&publish()} placeholder="Share something with your hive..." /></div><div className="compose-tools"><div className="toolrow"><button className="tool">▧ Photo</button><button className="tool">◉ Feeling</button><button className="tool">✦ Moment</button></div><button className="primary" onClick={publish}>Post</button></div></section>

        <div className="feedtabs">{["For You","Following","Latest"].map(x=><button key={x} className={tab===x?"selected":""} onClick={()=>setTab(x)}>{x}</button>)}</div>
        {visible.map(p=><article className="post" key={p.id}><div className="posthead"><div className={`avatar ${p.tone}`}>{p.avatar}</div><div><div className="postname">{p.name} <span className="handle">{p.handle}</span></div><div className="time">{p.time} · Public</div></div><button className="iconbtn" style={{marginLeft:"auto",border:0,background:"transparent"}}>•••</button></div><div className="postbody">{p.body}</div>{p.media&&<div className="media">{p.media}</div>}<div className="actions"><button className={p.liked?"liked":""} onClick={()=>like(p.id)}>♡ {p.likes}</button><button onClick={()=>document.getElementById(`c${p.id}`)?.focus()}>◯ {p.comments}</button><button onClick={()=>{navigator.clipboard?.writeText(window.location.href);setToast("Post link copied")}}>↗ Share</button><button onClick={()=>setToast("Saved to your collection")}>⌑ Save</button></div><div className="commentbox"><input id={`c${p.id}`} value={comment[p.id]||""} onChange={e=>setComment({...comment,[p.id]:e.target.value})} onKeyDown={e=>e.key==='Enter'&&addComment(p.id)} placeholder="Add a thoughtful reply..."/><button className="primary" onClick={()=>addComment(p.id)}>Send</button></div></article>)}
      </main>

      <aside className="rightbar"><label className="search">⌕<input id="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search the Hive" /></label><section className="trend"><h2 className="side-title">Trending in the Hive</h2>{[["#digitalgardens","1.8k posts"],["#communityfirst","932 posts"],["#slowinternet","614 posts"],["#creativecoding","403 posts"]].map(t=><div className="trenditem" key={t[0]}><b>{t[0]}</b><span>{t[1]}</span></div>)}</section><section className="suggestions"><h2 className="side-title">People to discover</h2>{people.map(p=><div className="suggest" key={p.handle}><div className={`avatar small ${p.tone}`}>{p.avatar}</div><div className="suggest-info"><b>{p.name}</b><span className="handle">{p.handle}</span></div><button className="follow" onClick={()=>setFollowing(following.includes(p.handle)?following.filter(x=>x!==p.handle):[...following,p.handle])}>{following.includes(p.handle)?"Following":"Follow"}</button></div>)}</section><div className="footer">NeuralHive · A social community built around people, not engagement traps.<br/>Guidelines · Privacy · Terms · About</div></aside>
    </div>
    <nav className="mobile-nav">{nav.map(n=>{const label=n.slice(2);return <button key={n} className={active===label?"active":""} onClick={()=>{setActive(label);if(label==="Create")document.getElementById("composer")?.scrollIntoView({behavior:"smooth"})}}>{n.slice(0,1)}</button>})}</nav>
    {toast&&<div style={{position:"fixed",left:"50%",bottom:25,transform:"translateX(-50%)",background:"#eef8f2",color:"#07100d",padding:"11px 16px",borderRadius:12,fontWeight:700,zIndex:20}}>{toast}</div>}
  </div>
}
