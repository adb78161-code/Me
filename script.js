const scene=new THREE.Scene();
scene.background=new THREE.Color(0x708864);

const camera=new THREE.PerspectiveCamera(45,innerWidth/innerHeight,.1,200);
camera.position.set(17,22,22);

const renderer=new THREE.WebGLRenderer({antialias:true});
renderer.setSize(innerWidth,innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputEncoding=THREE.sRGBEncoding;
document.body.appendChild(renderer.domElement);

const controls=new THREE.OrbitControls(camera,renderer.domElement);
controls.enableDamping=true;
controls.target.set(0,0,0);
controls.maxPolarAngle=Math.PI/2.05;
controls.minDistance=10;
controls.maxDistance=42;

const M={
 wall:new THREE.MeshStandardMaterial({color:0xe8dfd2}),
 floor:new THREE.MeshStandardMaterial({color:0xd3c3aa}),
 wood:new THREE.MeshStandardMaterial({color:0x633a1d}),
 wood2:new THREE.MeshStandardMaterial({color:0x3d2415}),
 sofa:new THREE.MeshStandardMaterial({color:0xb6a594}),
 cloth:new THREE.MeshStandardMaterial({color:0xeee5d7}),
 dark:new THREE.MeshStandardMaterial({color:0x292b2b}),
 glass:new THREE.MeshStandardMaterial({color:0x79aabd,transparent:true,opacity:.55}),
 metal:new THREE.MeshStandardMaterial({color:0x777777,metalness:.7,roughness:.25}),
 plant:new THREE.MeshStandardMaterial({color:0x3c702c})
};

const house=new THREE.Group(); scene.add(house);
const interact=[];

function box(name,x,y,z,w,h,d,mat,parent=house){
 const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);
 o.name=name;o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;
 parent.add(o);return o;
}
function cyl(name,x,y,z,r,h,mat,parent=house){
 const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,20),mat);
 o.name=name;o.position.set(x,y,z);o.castShadow=true;parent.add(o);return o;
}

// Ground + floor
box("Ground",0,-.35,0,34,.5,32,new THREE.MeshStandardMaterial({color:0x708765}),scene);
box("HouseFloor",0,0,0,15,.25,13,M.floor);

// Reference-like walls: living left, bedroom upper right, kitchen/dining lower right
box("BackWall",0,2.5,-6.5,15,5,.35,M.wall);
box("LeftWall",-7.5,2.5,0,.35,5,13,M.wall);
box("RightWall",7.5,2.5,0,.35,13,M.wall);

// front wall split around entrance
box("FrontLeft",-5.3,2.5,6.5,4.4,5,.35,M.wall);
box("FrontRight",5.0,2.5,6.5,4.8,5,.35,M.wall);

// bedroom divider
box("BedroomDivider",2.0,2.5,-2.0,.3,5,9,M.wall);
// kitchen back/side wall
box("KitchenWall",4.8,2.5,2.4,5.4,5,.3,M.wall);

// patio/right garden strip
box("Patio",9.2,.02,0,3,.12,13,new THREE.MeshStandardMaterial({color:0x77746c}));

// plants
function plant(x,z,s=1){
 cyl("pot",x,.45,z,.28*s,.5*s,M.wood2);
 for(let i=0;i<5;i++){
  const leaf=cyl("leaf",x+Math.sin(i)*.25*s,.95*s,z+Math.cos(i)*.25*s,.10*s,.65*s,M.plant);
  leaf.rotation.z=(i-2)*.25;
 }
}
plant(-6.5,-5,.9);plant(-6.5,5,.8);plant(8.7,-4,1);plant(8.7,0,.9);plant(8.7,4,1);plant(6.7,5,.7);

// doors
function makeDoor(name,x,z,w=2.2){
 const g=new THREE.Group();g.name=name;
 const p=box(name+"Panel",w/2,2,z,w,4,.16,M.wood,g);
 g.position.x=x-w/2; // hinge at left edge
 g.userData.closed=0;
 house.add(g);interact.push(g,p);
 return g;
}
const fd=makeDoor("FrontDoor",-1.0,6.48,2.1);
const bd=makeDoor("BedroomDoor",2.0,-.05,1.7);

// windows
function makeWindow(name,x,y,z,rot=0){
 const g=new THREE.Group();g.name=name;
 g.rotation.y=rot;g.position.set(x,y,z);
 box("Frame",0,0,0,2.1,1.25,.14,M.wood,g);
 box("Glass",0,0,-.08,1.7,.9,.05,M.glass,g);
 house.add(g);g.userData.open=false;interact.push(g);return g;
}
const w1=makeWindow("LivingWindow",-2,3,-6.3);
const w2=makeWindow("KitchenWindow",5,3,2.25,Math.PI/2);
const w3=makeWindow("FrontWindow",4.5,3,6.3);

// living sofa
const sofa=new THREE.Group();sofa.name="Sofa";
box("Seat",-4.8,.95,-2.7,4.1,.55,1.65,M.sofa,sofa);
box("Back",-4.8,1.9,-3.35,4.1,1.8,.35,M.sofa,sofa);
box("Arm",-6.7,1.55,-2.7,.4,1.4,1.7,M.sofa,sofa);
box("Arm",-2.9,1.55,-2.7,.4,1.4,1.7,M.sofa,sofa);
house.add(sofa);interact.push(sofa);

// coffee table
box("CoffeeTable",-4.7,.72,-.7,2.4,.22,1.35,M.wood2);
cyl("Decor",-4.7,1.0,-.7,.22,.25,M.plant);

// TV wall
box("TVUnit",-1.9,1.0,-.1,.45,2.4,4.5,M.wood2);
box("TV",-1.62,2.4,-.1,.12,2.0,3.0,M.dark);

// bedroom
box("BedBase",5,.55,-3.8,4.2,.65,5.0,M.wood2);
const bed= new THREE.Group();bed.name="Bed";
box("Mattress",5,1.05,-3.8,4,.45,4.8,M.cloth,bed);
box("Blanket",5,1.31,-2.55,3.9,.12,2.0,new THREE.MeshStandardMaterial({color:0xc7b39a}),bed);
box("Headboard",5,2.0,-6.15,4.3,2.3,.25,M.wood2,bed);
for(let x of [4,5,6])box("Pillow",x,1.36,-5.25,.8,.18,.6,M.cloth,bed);
house.add(bed);interact.push(bed);

// wardrobe
box("Wardrobe",4.8,2.2,-5.8,2.2,3.6,.65,M.wood);

// kitchen
box("Counter",5.1,1.0,3.6,5.2,1.8,1.0,M.wood2);
box("CounterTop",5.1,1.95,3.6,5.35,.18,1.08,M.dark);
box("Sink",4.3,2.07,3.6,1.4,.08,.7,M.metal);
box("Stove",6.7,2.07,3.6,1.0,.08,.75,M.metal);
for(let i=0;i<4;i++)cyl("Burner",6.45+(i%2)*.45,2.13,3.4+Math.floor(i/2)*.4,.12,.03,M.dark);

// refrigerator
box("Fridge",7.0,1.9,1.8,1.0,3.8,1.0,M.dark);

// dining table + chairs
box("DiningTable",4.5,1.0,5.2,3.5,.25,2,M.wood);
for(const x of [3.2,5.8])for(const z of [4.0,6.4]){
 box("Chair",x,.75,z,.6,1.2,.6,M.wood2);
}

// character
const person=new THREE.Group();person.name="Character";
const skin=new THREE.MeshStandardMaterial({color:0xd39b74});
const shirt=new THREE.MeshStandardMaterial({color:0x45658a});
const pants=new THREE.MeshStandardMaterial({color:0x252b35});
cyl("Body",0,1.45,0,.42,1.3,shirt,person);
const head=new THREE.Mesh(new THREE.SphereGeometry(.38,20,20),skin);head.position.y=2.35;head.castShadow=true;person.add(head);
box("Leg1",-0.2,.65,0,.25,1.2,.25,pants,person);
box("Leg2",0.2,.65,0,.25,1.2,.25,pants,person);
person.position.set(-4.8,0,-1.1);house.add(person);

// lights
const ambient=new THREE.HemisphereLight(0xffffff,0x555555,.75);scene.add(ambient);
const sun=new THREE.DirectionalLight(0xffffff,1.35);sun.position.set(-10,20,10);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);scene.add(sun);

function lamp(x,y,z,color=0xffd6a0){
 const l=new THREE.PointLight(color,2.2,10);l.position.set(x,y,z);scene.add(l);
 const bulb=new THREE.Mesh(new THREE.SphereGeometry(.12,12,12),new THREE.MeshStandardMaterial({color:0xffffdd,emissive:0xffcc77,emissiveIntensity:2}));
 bulb.position.set(x,y,z);house.add(bulb);
 l.userData.bulb=bulb;l.userData.on=true;return l;
}
const livingL=lamp(-4,4,-1);
const bedL=lamp(5,4,-3.5);
const kitchenL=lamp(5,4,3.8);

function msg(t){const e=document.getElementById("msg");e.textContent=t;e.style.opacity=1;clearTimeout(window.mt);window.mt=setTimeout(()=>e.style.opacity=0,1400)}

function rotateDoor(g){
 g.userData.closed=1-g.userData.closed;
 const target=g.userData.closed?-Math.PI/2:0;
 const start=g.rotation.y,t0=performance.now();
 function a(){
  const p=Math.min((performance.now()-t0)/450,1);
  g.rotation.y=THREE.MathUtils.lerp(start,target,p);
  if(p<1)requestAnimationFrame(a);
 }
 a();msg(g.userData.closed?"Door opened":"Door closed");
}
function toggleWindow(g){
 g.userData.open=!g.userData.open;
 const target=g.userData.open?Math.PI/2:0,start=g.rotation.y,t0=performance.now();
 function a(){const p=Math.min((performance.now()-t0)/400,1);g.rotation.y=THREE.MathUtils.lerp(start,target,p);if(p<1)requestAnimationFrame(a)}
 a();msg(g.userData.open?"Window opened":"Window closed");
}
function toggleLight(l){l.userData.on=!l.userData.on;l.intensity=l.userData.on?2.2:0;l.userData.bulb.visible=l.userData.on;msg(l.userData.on?"Light ON":"Light OFF")}

function movePerson(target,rotation,action){
 const start=person.position.clone(),t0=performance.now(),dur=700;
 function a(){
  const p=Math.min((performance.now()-t0)/dur,1);
  person.position.lerpVectors(start,target,p);
  if(p<1)requestAnimationFrame(a);else{person.rotation.set(rotation.x,rotation.y,rotation.z);action()}
 }
 a();
}
function sit(){movePerson(new THREE.Vector3(-4.8,.65,-2.5),new THREE.Vector3(-Math.PI/2,0,0),()=>msg("Sitting on sofa"))}
function lie(){movePerson(new THREE.Vector3(5,1.45,-3.8),new THREE.Vector3(0,Math.PI/2,Math.PI/2),()=>msg("Lying on bed"))}
function stand(){person.rotation.set(0,0,0);movePerson(new THREE.Vector3(-4.8,0,-1),new THREE.Vector3(0,0,0),()=>msg("Standing"))}

function frontDoor(){rotateDoor(fd)}
function bedDoor(){rotateDoor(bd)}
function windowOpen(){toggleWindow(w1);toggleWindow(w2);toggleWindow(w3)}
function lightLiving(){toggleLight(livingL)}
function lightBed(){toggleLight(bedL)}
function lightKitchen(){toggleLight(kitchenL)}
function resetHouse(){
 [fd,bd].forEach(g=>{g.rotation.y=0;g.userData.closed=0});
 [w1,w2,w3].forEach(g=>{g.rotation.y=0;g.userData.open=false});
 [livingL,bedL,kitchenL].forEach(l=>{l.userData.on=true;l.intensity=2.2;l.userData.bulb.visible=true});
 person.position.set(-4.8,0,-1);person.rotation.set(0,0,0);msg("House reset");
}

// click interaction
const ray=new THREE.Raycaster(),mouse=new THREE.Vector2();
renderer.domElement.addEventListener("pointerdown",e=>{
 mouse.x=e.clientX/innerWidth*2-1;mouse.y=-(e.clientY/innerHeight)*2+1;
 ray.setFromCamera(mouse,camera);
 const hits=ray.intersectObjects(interact,true);
 if(!hits.length)return;
 let o=hits[0].object;
 while(o.parent&&o.parent!==house)o=o.parent;
 if(o===fd)frontDoor();
 else if(o===bd)bedDoor();
 else if(o===w1||o===w2||o===w3)toggleWindow(o);
 else if(o===sofa)sit();
 else if(o===bed)lie();
});

addEventListener("resize",()=>{
 camera.aspect=innerWidth/innerHeight;
 camera.updateProjectionMatrix();
 renderer.setSize(innerWidth,innerHeight);
});

function animate(){requestAnimationFrame(animate);controls.update();renderer.render(scene,camera)}
animate();