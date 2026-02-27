const tg = window.Telegram.WebApp;
tg.expand();

if (!tg.initDataUnsafe.user) {
    document.body.innerHTML = "Откройте через Telegram";
}

const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");

const segments = 20;

let angle = 0;
let speed = 0;
let spinning = false;

let phase = "idle";
let lastPin = -1;

function drawWheel(){

ctx.clearRect(0,0,320,320);

const cx = 160;
const cy = 160;
const r = 140;

for(let i=0;i<segments;i++){

let start = (i/segments)*Math.PI*2 + angle;
let end = ((i+1)/segments)*Math.PI*2 + angle;

ctx.beginPath();
ctx.moveTo(cx,cy);
ctx.arc(cx,cy,r,start,end);

ctx.fillStyle = i%2 ? "#e53935" : "#43a047";
ctx.fill();

}

// пины
for(let i=0;i<segments;i++){

let a = (i/segments)*Math.PI*2 + angle;

let x = cx + Math.cos(a)*150;
let y = cy + Math.sin(a)*150;

ctx.beginPath();
ctx.arc(x,y,4,0,Math.PI*2);
ctx.fillStyle="white";
ctx.fill();

}

}

drawWheel();

document.getElementById("spin").onclick = ()=>{

if(spinning) return;

spinning = true;

phase = "accelerate";

speed = 0.01;

requestAnimationFrame(update);

};

function update(){

if(!spinning) return;

// разгон
if(phase === "accelerate"){

speed += 0.004;

if(speed > 0.55){
phase = "decelerate";
}

}

// торможение
if(phase === "decelerate"){

speed *= 0.985;

}

// вращение
angle += speed;

// пины
let pinIndex = Math.floor((angle%(Math.PI*2))/(Math.PI*2/segments));

if(pinIndex !== lastPin){

speed *= 0.94;

lastPin = pinIndex;

}

// стоп
if(speed < 0.001){

spinning = false;

let normalized = angle%(Math.PI*2);

let sector = Math.floor(normalized/(Math.PI));

let result = sector === 0 ? "Выигрыш 🎉" : "Проигрыш 😢";

document.getElementById("result").innerText = result;

return;

}

drawWheel();

requestAnimationFrame(update);

}ctx.fillStyle = i%2 ? "#e53935" : "#43a047";
ctx.fill();

}

// пины
for(let i=0;i<segments;i++){

let a = (i/segments)*Math.PI*2 + angle;

let x = cx + Math.cos(a)*150;
let y = cy + Math.sin(a)*150;

ctx.beginPath();
ctx.arc(x,y,4,0,Math.PI*2);
ctx.fillStyle="white";
ctx.fill();

}

}

drawWheel();

document.getElementById("spin").onclick = ()=>{

if(spinning) return;

spinning = true;

phase = "accelerate";

speed = 0.01;

requestAnimationFrame(update);

};

function update(){

if(!spinning) return;

if(phase === "accelerate"){

speed += 0.003;

if(speed > 0.5){
phase = "decelerate";
}

}

if(phase === "decelerate"){

speed *= 0.994;

}

angle += speed;

let pinIndex = Math.floor((angle%(Math.PI*2))/(Math.PI*2/segments));

if(pinIndex !== lastPin){

speed *= 0.96;

lastPin = pinIndex;

}

if(speed < 0.002){

spinning = false;

let sector = Math.floor((angle%(Math.PI*2))/(Math.PI));

let result = sector === 0 ? "Выигрыш 🎉" : "Проигрыш 😢";

document.getElementById("result").innerText = result;

}

drawWheel();

requestAnimationFrame(update);

}
