const tg = window.Telegram.WebApp;
tg.expand();

if (!tg.initDataUnsafe.user) {
    document.body.innerHTML = "Откройте приложение через Telegram бота";
}

const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");

const segments = 20;
let wheelAngle = 0;

let speed = 0;
let spinning = false;

let phase = "idle";
let lastPin = 0;

function draw() {

    ctx.clearRect(0,0,320,320);

    drawWheel();
    drawArrow();

}

function drawWheel(){

    const cx = 160;
    const cy = 160;
    const r = 140;

    ctx.save();
    ctx.translate(cx,cy);
    ctx.rotate(wheelAngle);

    for(let i=0;i<segments;i++){

        let start = (i/segments)*Math.PI*2;
        let end = ((i+1)/segments)*Math.PI*2;

        ctx.beginPath();
        ctx.moveTo(0,0);
        ctx.arc(0,0,r,start,end);

        ctx.fillStyle = i%2 ? "#e53935" : "#43a047";
        ctx.fill();

    }

    // пины
    for(let i=0;i<segments;i++){

        let a = (i/segments)*Math.PI*2;

        let x = Math.cos(a)*150;
        let y = Math.sin(a)*150;

        ctx.beginPath();
        ctx.arc(x,y,4,0,Math.PI*2);
        ctx.fillStyle="white";
        ctx.fill();

    }

    ctx.restore();

}

function drawArrow(){

    ctx.beginPath();

    ctx.moveTo(160,15);
    ctx.lineTo(150,45);
    ctx.lineTo(170,45);

    ctx.fillStyle="yellow";
    ctx.fill();

}

draw();

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

        speed += 0.002;

        if(speed > 0.5){
            phase = "decelerate";
        }

    }

    if(phase === "decelerate"){

        speed *= 0.992;

    }

    wheelAngle += speed;

    // удары по пинам
    let pinIndex = Math.floor((wheelAngle%(Math.PI*2))/(Math.PI*2/segments));

    if(pinIndex !== lastPin){

        speed *= 0.97;

        lastPin = pinIndex;

    }

    if(speed < 0.002){

        spinning = false;

        let sector = Math.floor((wheelAngle%(Math.PI*2))/(Math.PI));

        let result = sector === 0 ? "Выигрыш 🎉" : "Проигрыш 😢";

        document.getElementById("result").innerText = result;

    }

    draw();

    requestAnimationFrame(update);

}
