"use strict";var ThreeScene=function(a){this.containerId=a||"#render-scene",this.$container=$(this.containerId),this.colors={white:"#FFFFFF",black:"#000000",darkGrey:"#303030",building:"#00dba3"},this.randomColor=!0,this.initScene(),this.status="stop",this.sketchupExport=new SketchupExport};ThreeScene.prototype.initScene=function(){var a=this;this.width=this.$container.innerWidth(),this.height=this.$container.innerHeight(),this.renderer=new THREE.WebGLRenderer({antialias:!0,alpha:!0}),this.renderer.setClearColor(this.colors.white,0),this.renderer.setSize(this.width,this.height),this.camera=new THREE.PerspectiveCamera(90,this.width/this.height,.1,1e4),this.camera.position.x=10,this.camera.position.y=10,this.camera.position.z=10,this.controls=new THREE.TrackballControls(this.camera,this.renderer.domElement),this.controls.minDistance=500,this.controls.maxDistance=5e3,this.controls.addEventListener("change",function(){a.render()}),this.scene=new THREE.Scene,this.scene.add(this.camera),this.$container.html(this.renderer.domElement),window.addEventListener("resize",function(){a.resize()},!1),this.controls.handleResize()},ThreeScene.prototype.animate=function(){requestAnimationFrame(_.bind(this.animate,this)),this.controls.update()},ThreeScene.prototype.render=function(){this.renderer.render(this.scene,this.camera)},ThreeScene.prototype.resize=function(){this.$container=$(this.containerId),this.width=this.$container.innerWidth(),this.height=this.$container.innerHeight(),this.camera.aspect=this.width/this.height,this.camera.updateProjectionMatrix(),this.renderer.setSize(this.width,this.height),this.controls.handleResize(),this.render()},ThreeScene.prototype.add=function(a){this.scene.add(a)},ThreeScene.prototype.renderBuilding=function(a,b){var c=this;b=10*b,this.sketchupExport.addBlock(a,b);var d=new THREE.Shape;d.moveTo(a[a.length-1][0],a[a.length-1][1]),_.each(a,function(a){d.lineTo(a[0],a[1])});var e=new THREE.ExtrudeGeometry(d,{amount:b,bevelEnabled:!1,material:0,extrudeMaterial:1}),f=new THREE.LineBasicMaterial({color:c.randomColor?randomColor():c.colors.building,linewidth:20,linecap:"round",linejoin:"round"}),g=new THREE.Mesh(e,f);e.computeFaceNormals(),g.rotation.x=-Math.PI/2,g.rotation.z=Math.PI/2,g.castShadow=!0,g.receiveShadow=!0,this.scene.add(g)},ThreeScene.prototype["export"]=function(){if("stop"===this.status){var a=this.sketchupExport.toScript(),b=encodeURI(a),c=document.createElement("a");c.setAttribute("href",b),c.setAttribute("download","sketchup_script"),c.click()}};var SketchupExport=function(){this.blocks=[]};SketchupExport.prototype.reset=function(){this.blocks=[]},SketchupExport.prototype.addBlock=function(a,b){var c=new SketchupBlock(a,b);this.blocks.push(c)},SketchupExport.prototype.toScript=function(){var a=["data:text;charset=utf-8,"];return _.each(this.blocks,function(b,c){a.push(b.toScript(c))}),a.join("\n")};var SketchupBlock=function(a,b){this.points=a,this.level=_.clone(b)};SketchupBlock.prototype.toScript=function(a){var b=["ent"+a+" = Sketchup.active_model.entities"];return b.push("main_face"+a+" = ent"+a+".add_face "+_.map(this.points,function(a){return"["+a+"]"})),b.push("main_face"+a+".reverse!"),b.push("main_face"+a+".pushpull "+this.level),b.join("\n")},$(document).ready(function(){function a(){function a(a){var c=_.filter(a.elements,function(a){return"node"===a.type}),g=_.filter(a.elements,function(a){return"way"===a.type&&a.tags.building});_.each(g,function(a){var b=a.tags["building:levels"]||2,g=e(a,c),h=_.map(g,function(a){return f(a)});d.renderBuilding(h,b)}),d.render(),b()}function e(a,b){var c=_(b).chain().filter(function(b){return 0<=a.nodes.indexOf(b.id)}).sortBy(function(b){return a.nodes.indexOf(b.id)}).map(function(a){return[a.lon,a.lat]}).value();return c}function f(a){var b=128,c=h,d=d3.geo.mercator().center([g.lng,g.lat]).translate([0,0]).scale(b<<c),e=d(a);return[-1*e[1],-1*e[0]]}var g=c.getCenter(),h=c.getZoom(),i=c.getBounds(),j=[i.getSouth(),i.getWest(),i.getNorth(),i.getEast()],k="http://overpass-api.de/api/interpreter?data=[out:json];((way("+j.join(",")+")[%22building%22]);(._;node(w);););out;";$.getJSON(k,a)}function b(){$("#modal").show(),$("#export-footer").show()}var c=L.map("map").setView([48.864947,2.398451],18);L.tileLayer("http://{s}.tile.osm.org/{z}/{x}/{y}.png").addTo(c);var d;$("#start").on("click",function(){$("#modal-render").modal(),$("#modal-render").on("shown.bs.modal",function(){d=new ThreeScene("#render-scene"),d.animate(),a()})}),$("#modal").on("click",function(){$("#modal-render").modal()}),$("#export").on("click",function(){d["export"]()})});