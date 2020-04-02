let accX,accY,accZ;
let width = 1500,height = 800;

// accelerometer Data
window.addEventListener('devicemotion', function(e) 
{
  // get accelerometer values
  accX = -parseInt(e.accelerationIncludingGravity.x);
  accY = parseInt(e.accelerationIncludingGravity.y);
  accZ = parseInt(e.accelerationIncludingGravity.z); 
});



let Gish;
function setup(){
    width = windowWidth,height = windowHeight
    createCanvas(width,height);
    let m = new Mesh();
    for(let i = 0; i < 128; ++i){
        m.vertices[i] = new Vector2(cos(Math.PI*2/128*i),sin(Math.PI*2/128*i));
    }
    Gish = new JellyObject(new Vector2(width/2,height/2),new Vector2(0.3,0.3),m);
}

let flag = false;
function mousePressed(){
    flag = true;
}
function mouseReleased(){
    flag = false;
}

function draw(){

    clear();
    // if(flag){
    //     stroke(200,40,0);
    //     line(a.position.x,a.position.y,mouseX,mouseY);

    //     let d = Math.sqrt((mouseX - a.position.x)*(mouseX - a.position.x) + (mouseY - a.position.y)*(mouseY - a.position.y));
    //     let norm = new Vector2((mouseX - a.position.x)/d,(mouseY - a.position.y)/d);
    
    //     let angle = Math.acos(norm.x);
    //     if(norm.y < 0) angle = Math.PI*2 - angle;
    
    //     let ind = 0;
    //     let curCos = 1000;
    
    //     for(let i = 0; i < a.numPoints; ++i){
    //         let cs = a.points.x[i]/Math.sqrt((a.points.x[i]*a.points.x[i])+(a.points.y[i]*a.points.y[i]));
    //         let an = Math.acos(cs);
    //         if(a.points.y[i] < 0){
    //             an = 2*Math.PI - an;
    //         }
    //         if(Math.abs(angle - an) < Math.abs(angle - curCos)){
    //             curCos = an;
    //             ind = i;
    //         }
    //     }
    
    //     let start = Math.PI/4;
    //     let step = ((Math.PI - 2*start)/32);
    //     let cur = start;
    
    //     for(let i = ind - 16; i < ind + 16; ++i){
    //         a.points.vx[(i+a.numPoints)%a.numPoints] += norm.x*Math.min(d*0.1,100)*Math.sin(cur);
    //         a.points.vy[(i+a.numPoints)%a.numPoints] += norm.y*Math.min(d*0.1,100)*Math.sin(cur);
    //         cur+=step;
    //     }

    //     // a.position.x = Math.min(Math.max(mouseX,50),width - 50);
    //     // a.position.y = Math.min(Math.max(mouseY,50),height - 50);
    // }else{

    // }

    
    for(let i = 0; i < 3; ++i)
    Gish.idle();

    console.log(accX,accY);
    Gish.render();

    //console.log(a);
}

function windowResized(){
    let rposx = Gish.position.x/width,rposy = Gish.position.y/height;
    width = windowWidth,height = windowHeight;
    resizeCanvas(width,height);
    Gish.position.x = rposx*width;
    Gish.position.y = rposy*height;
}

