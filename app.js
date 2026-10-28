const $ = id => document.getElementById(id);
const KEY = "testcraft-cases-v1";
const starter = [
  {id:1,title:"Login with valid credentials",steps:"1. Open login page\n2. Enter valid username and password\n3. Select Login",expected:"User reaches dashboard",actual:"",status:"Not Run",priority:"High"},
  {id:2,title:"Login with incorrect password",steps:"1. Open login page\n2. Enter valid username and incorrect password\n3. Select Login",expected:"Helpful error appears; user remains signed out",actual:"",status:"Not Run",priority:"High"},
  {id:3,title:"Required field validation",steps:"1. Open registration form\n2. Leave required fields empty\n3. Submit",expected:"Required-field validation is shown",actual:"",status:"Not Run",priority:"Medium"}
];
let cases = JSON.parse(localStorage.getItem(KEY) || "null") || starter;
function save(){localStorage.setItem(KEY,JSON.stringify(cases));render();}
function esc(s){return String(s ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function render(){
  const counts = ["All","Pass","Fail","Not Run","Blocked"].map(s=>[s,s==="All"?cases.length:cases.filter(c=>c.status===s).length]);
  $("stats").innerHTML = counts.slice(0,4).map(([name,n])=>`<div class="stat"><span>${name}</span><strong>${n}</strong></div>`).join("");
  const q=$("search").value.toLowerCase(), f=$("filter").value;
  const shown=cases.filter(c=>(f==="All"||c.status===f)&&[c.title,c.steps,c.expected,c.actual,c.priority].join(" ").toLowerCase().includes(q));
  $("case-list").innerHTML = shown.length ? shown.map(c=>`<article class="case-card">
    <div class="case-top"><div><h3>#${c.id} · ${esc(c.title)}</h3><div class="muted">Priority: ${esc(c.priority)} · Status: <span class="pill">${esc(c.status)}</span></div></div>
    <select aria-label="Update status" onchange="updateStatus(${c.id},this.value)">${["Not Run","Pass","Fail","Blocked"].map(s=>`<option ${s===c.status?"selected":""}>${s}</option>`).join("")}</select></div>
    <p><b>Steps</b><br><span class="muted">${esc(c.steps)}</span></p><p><b>Expected</b><br><span class="muted">${esc(c.expected)}</span></p>
    ${c.actual?`<p><b>Actual</b><br><span class="muted">${esc(c.actual)}</span></p>`:""}
    <div class="actions"><button onclick="editCase(${c.id})">Edit</button><button class="danger" onclick="deleteCase(${c.id})">Delete</button></div>
  </article>`).join("") : '<div class="empty">No test cases match your search.</div>';
}
window.updateStatus=(id,status)=>{cases=cases.map(c=>c.id===id?{...c,status}:c);save();};
window.deleteCase=id=>{if(confirm("Delete this test case?")){cases=cases.filter(c=>c.id!==id);save();}};
window.editCase=id=>{const c=cases.find(x=>x.id===id);if(!c)return;const title=prompt("Test case title",c.title);if(title===null)return;const expected=prompt("Expected result",c.expected);if(expected===null)return;cases=cases.map(x=>x.id===id?{...x,title:title.trim()||x.title,expected}:x);save();};
$("case-form").addEventListener("submit",e=>{e.preventDefault();cases.unshift({id:Math.max(0,...cases.map(c=>c.id))+1,title:$("title").value.trim(),steps:$("steps").value.trim(),expected:$("expected").value.trim(),actual:$("actual").value.trim(),status:$("status").value,priority:$("priority").value});e.target.reset();save();});
$("search").addEventListener("input",render);$("filter").addEventListener("change",render);
$("export").addEventListener("click",()=>{const cols=["id","title","steps","expected","actual","status","priority"];const csv=[cols.join(","),...cases.map(c=>cols.map(k=>'"'+String(c[k]??"").replace(/"/g,'""')+'"').join(","))].join("\r\n");const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));a.download="test_cases.csv";a.click();URL.revokeObjectURL(a.href);});
render();
