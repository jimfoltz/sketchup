'use strict';

var ThreeScene = function (containerId) {
    this.containerId = containerId || '#render-scene';
    this.$container = $(this.containerId);
    this.colors = {
        white: '#FFFFFF',
        black: '#000000',
        darkGrey: '#303030',
        building: '#00dba3'
    };
    this.randomColor = true;
    this.initScene();
    this.status = "stop";
    this.sketchupExport = new SketchupExport()
};

ThreeScene.prototype.initScene = function () {
    var self = this;
    this.width = this.$container.innerWidth();
    this.height = this.$container.innerHeight();

    this.renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
    this.renderer.setClearColor(this.colors.white, 0);
    this.renderer.setSize(this.width, this.height);

    this.camera = new THREE.PerspectiveCamera(90, this.width / this.height, 0.1, 10000);
    this.camera.position.x = 10;
    this.camera.position.y = 10;
    this.camera.position.z = 10;

    this.controls = new THREE.TrackballControls(this.camera, this.renderer.domElement);
    this.controls.minDistance = 500;
    this.controls.maxDistance = 5000;
    this.controls.addEventListener('change', function () {
        self.render()
    });

    this.scene = new THREE.Scene();
    this.scene.add(this.camera);
    this.$container.html(this.renderer.domElement);

    window.addEventListener('resize', function () {
        self.resize()
    }, false);

    this.controls.handleResize();
};

ThreeScene.prototype.animate = function () {
    requestAnimationFrame(_.bind(this.animate, this));
    this.controls.update();
};

ThreeScene.prototype.render = function () {
    this.renderer.render(this.scene, this.camera);
};

ThreeScene.prototype.resize = function () {
    this.$container = $(this.containerId);
    this.width = this.$container.innerWidth();
    this.height = this.$container.innerHeight();

    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(this.width, this.height);
    this.controls.handleResize();

    this.render();
};

ThreeScene.prototype.add = function (element) {
    this.scene.add(element);
};

ThreeScene.prototype.renderBuilding = function (points, level) {
    var self = this;
    level = level * 10;

    this.sketchupExport.addBlock(points, level);

    var shape = new THREE.Shape();
    shape.moveTo(points[points.length - 1][0], points[points.length - 1][1]);
    _.each(points, function (xy) {
        shape.lineTo(xy[0], xy[1]);
    });

    var geom = new THREE.ExtrudeGeometry(shape, {
        amount: level,
        bevelEnabled: false,
        material: 0,
        extrudeMaterial: 1
    });

    var material = new THREE.LineBasicMaterial({
        color: self.randomColor ? randomColor() : self.colors.building,
        linewidth: 20,
        linecap: 'round',
        linejoin: 'round'
    });

    var mesh = new THREE.Mesh(geom, material);
    geom.computeFaceNormals();

    mesh.rotation.x = -Math.PI / 2;
    mesh.rotation.z = Math.PI / 2;

    mesh.castShadow = true;
    mesh.receiveShadow = true;

    this.scene.add(mesh);
};

ThreeScene.prototype.export = function () {
    if (this.status === "stop") {
        var script = this.sketchupExport.toScript();
        var encodedUri = encodeURI(script);
        var link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "sketchup_script");
        link.click();
    }
};
