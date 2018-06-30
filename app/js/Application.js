class Application {
    init() {
        this.ballSize = 3;

        this.initGui();

        this.material = new THREE.LineBasicMaterial({ color: 'red' });
        this.mesh = new THREE.LineSegments(new THREE.Geometry(), this.material);
        // this.mesh.geometry.vertices.push(new THREE.Vector3(0,0,0), new THREE.Vector3(10,0,10));
        // this.mesh.position.set(0, 0, 3);
        this.sceneManager.scene.add(this.mesh);

        this.applyGuiChanges();
        this.createCanvas();
    }
    addSegment(x1, y1, x2, y2, context) {
        context.beginPath();
        context.moveTo(x1, y1);
        context.lineTo(x2, y2);
        context.closePath();
        context.stroke();
        for (var z = -20; z <= +20; ++z) {
            this.mesh.geometry.vertices.push(new THREE.Vector3((x1 - this.canvasWidth / 2.0) / 10.0, (-y1 + this.canvasHeight / 2.0) / 10.0, z));
            this.mesh.geometry.vertices.push(new THREE.Vector3((x2 - this.canvasWidth / 2.0) / 10.0, (-y2 + this.canvasHeight / 2.0) / 10.0, z));
        }
    }
    createCanvas() {
        var canvas = document.getElementById('canvasInAPerfectWorld');
        var context = canvas.getContext("2d");
        this.canvasHeight = canvas.height = context.canvas.clientHeight;
        this.canvasWidth = canvas.width = context.canvas.clientWidth;
        var clickX = new Array();
        var clickY = new Array();
        var clickDrag = new Array();
        var paint;
        // var geom = this.mesh.geometry;
        var that = this;

        function addClick(x, y, dragging) {
            clickX.push(x);
            clickY.push(y);
            clickDrag.push(dragging);
        }
        function redraw() {
            context.clearRect(0, 0, context.canvas.width, context.canvas.height); // Clears the canvas

            context.strokeStyle = "#df4b26";
            context.lineJoin = "round";
            context.lineWidth = 2;

            that.sceneManager.scene.remove(that.mesh);
            that.mesh = new THREE.LineSegments(new THREE.Geometry(), that.material);
            for (var i = 0; i < clickX.length; i++) {
                if (clickDrag[i] && i) {
                    that.addSegment(clickX[i - 1], clickY[i - 1], clickX[i], clickY[i], context);
                } else {
                    that.addSegment(clickX[i] - 1, clickY[i], clickX[i], clickY[i], context);
                }
            }
            that.sceneManager.scene.add(that.mesh);
        }
        $('#canvasInAPerfectWorld').mousedown(function (e) {
            paint = true;
            addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop);
            redraw();
        });

        $('#canvasInAPerfectWorld').mousemove(function (e) {
            if (paint) {
                addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, true);
                redraw();
            }
        });

        $('#canvasInAPerfectWorld').mouseup(function (e) {
            paint = false;
        });

        $('#canvasInAPerfectWorld').mouseleave(function (e) {
            paint = false;
        });
    }

    applyGuiChanges() {
        // console.log(guiParams.ballSize);
        // this.mesh.scale.set(this.ballSize, this.ballSize, this.ballSize);
    }

    initGui() {
        this.applyGuiChanges = this.applyGuiChanges.bind(this);
        this.gui = new dat.GUI({ autoPlace: true, width: 500 });
        // this.gui.add(this, 'ballSize').name('Ball size').min(0.1).max(16).step(0.01).onChange(this.applyGuiChanges);
    }

    onClick(inter) {
        this.sceneManager.scene.remove(this.dot);
        if (inter[0].object !== this.mesh) return;
        this.dot = new THREE.Mesh(new THREE.SphereGeometry(0.1), new THREE.MeshNormalMaterial());
        this.dot.position.copy(inter[0].point);
        this.sceneManager.scene.add(this.dot);
    }
}
