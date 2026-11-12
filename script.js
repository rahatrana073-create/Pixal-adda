const $ = id => document.getElementById(id);
const KEY = "pixelAddaPosts";
let currentUser = localStorage.getItem("pixelAddaUser") || "";
const samplePosts = [
  {id:1,user:"Aarav",game:"Minecraft",title:"Show me your best survival base!",message:"I just finished building a cozy mountain house. What should I build next?",likes:12,likedBy:[],comments:[{user:"Riya",text:"Try a treehouse!"}],createdAt:Date.now()-7200000},
  {id:2,user:"Riya",game:"Valorant",title:"Any tips for improving aim?",message:"Looking for a simple warm-up routine before ranked matches. What works for you?",likes:8,likedBy:[],comments:[],createdAt:Date.now()-3600000},
  {id:3,user:"Kabir",game:"BGMI",title:"What is your favourite landing spot?",message:"Drop your favourite location and tell us why!",likes:15,likedBy:[],comments:[],createdAt:Date.now()-1800000}
];
let posts = JSON.parse(localStorage.getItem(KEY) || "null") || samplePosts;

function save(){localStorage.setItem(KEY,JSON.stringify(posts));}
function clean(text){return String(text).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function setUser(name){currentUser=name.trim().slice(0,24);localStorage.setItem("pixelAddaUser",currentUser);$("userBtn").textContent="☺ "+currentUser;}
function chooseUser(){const name=prompt("Choose your gamer name:",currentUser);if(name&&name.trim()){setUser(name);render();}}
function needUser(){if(!currentUser)chooseUser();return Boolean(currentUser);}
function ago(time){const m=Math.floor((Date.now()-time)/60000);return m<1?"Just now":m<60?m+"m ago":Math.floor(m/60)<24?Math.floor(m/60)+"h ago":Math.floor(m/1440)+"d ago";}
function render(){
  const query=$("search").value.toLowerCase().trim(), category=$("category").value, sort=$("sort").value;
  let list=posts.filter(p=>(category==="All"||p.game===category)&&(p.title+" "+p.message+" "+p.user).toLowerCase().includes(query));
  list.sort((a,b)=>sort==="popular"?b.likes-a.likes:b.createdAt-a.createdAt);
  $("postCount").textContent=posts.length;
  $("memberCount").textContent=new Set(posts.map(p=>p.user)).size;
  $("resultCount").textContent=list.length+" POSTS";
  $("posts").innerHTML=list.length?list.map(p=>{
    const liked=currentUser&&p.likedBy.includes(currentUser);
    return `<article class="post"><div class="post-top"><span class="avatar">${clean(p.user[0].toUpperCase())}</span><div><div class="author">${clean(p.user)}</div><div class="time">${ago(p.createdAt)}</div></div><span class="tag">${clean(p.game)}</span></div><h3>${clean(p.title)}</h3><p>${clean(p.message)}</p><div class="actions"><button class="${liked?"liked":""}" onclick="likePost(${p.id})">${liked?"♥":"♡"} ${p.likes} Likes</button><button onclick="toggleComments(${p.id})">▤ ${p.comments.length} Comments</button><button onclick="sharePost(${p.id})">↗ Share</button>${p.user===currentUser?`<button class="delete" onclick="deletePost(${p.id})">Delete</button>`:""}</div><div class="comments" id="comments-${p.id}" hidden>${p.comments.map(c=>`<p class="comment"><b>${clean(c.user)}:</b> ${clean(c.text)}</p>`).join("")}<form class="comment-form" onsubmit="addComment(event,${p.id})"><input maxlength="180" placeholder="Write a comment..." required><button>Send</button></form></div></article>`;
  }).join(""):'<div class="empty">No discussions found. Start one! ✳</div>';
}
function likePost(id){if(!needUser())return;const p=posts.find(x=>x.id===id);if(p.likedBy.includes(currentUser)){p.likedBy=p.likedBy.filter(x=>x!==currentUser);p.likes--;}else{p.likedBy.push(currentUser);p.likes++;}save();render();}
function toggleComments(id){const box=$("comments-"+id);box.hidden=!box.hidden;}
function addComment(e,id){e.preventDefault();if(!needUser())return;const text=e.target.querySelector("input").value.trim();if(!text)return;posts.find(p=>p.id===id).comments.push({user:currentUser,text});save();render();$("comments-"+id).hidden=false;}
function deletePost(id){if(confirm("Delete your discussion?")){posts=posts.filter(p=>p.id!==id);save();render();}}
function sharePost(id){const p=posts.find(x=>x.id===id),text=p.title+" — "+p.message;if(navigator.clipboard){navigator.clipboard.writeText(text).then(()=>alert("Post copied!"));}else{prompt("Copy this post:",text);}}
$("userBtn").addEventListener("click",chooseUser);
$("newPost").addEventListener("click",()=>{if(!needUser())return;$("postUser").value=currentUser;$("postModal").showModal();});
$("closeModal").addEventListener("click",()=>$("postModal").close());
$("postForm").addEventListener("submit",e=>{e.preventDefault();const user=$("postUser").value.trim(),title=$("title").value.trim(),message=$("message").value.trim();if(!user||!title||!message)return;setUser(user);posts.unshift({id:Date.now(),user:currentUser,game:$("game").value,title,message,likes:0,likedBy:[],comments:[],createdAt:Date.now()});save();render();e.target.reset();$("postModal").close();});
$("search").addEventListener("input",render);$("category").addEventListener("change",render);$("sort").addEventListener("change",render);
if(currentUser)$("userBtn").textContent="☺ "+currentUser;
render();
