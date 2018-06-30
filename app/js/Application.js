class Application {
    init() {
        this.initGui();

        this.material = new THREE.LineBasicMaterial({ color: 'red' });
        this.mesh = new THREE.LineSegments(new THREE.Geometry(), this.material);
        this.sceneManager.scene.add(this.mesh);

        // this.applyGuiChanges();
        this.createCanvas();
    }
    addSegment(x1, y1, x2, y2) {
        this.context.beginPath();
        this.context.moveTo(x1, y1);
        this.context.lineTo(x2, y2);
        this.context.closePath();
        this.context.stroke();
        for (var z = -this.totalHeight / 2; z <= +this.totalHeight / 2; z += this.thickness) {
            var f = 1+(z / this.totalHeight * 2) * this.trapezoid;
            // f = ((f >= 0) ? 1+f : 1-f);
            var rx1 = f * (x1 - this.canvasWidth / 2.0) / 10.0;
            var rx2 = f * (x2 - this.canvasWidth / 2.0) / 10.0;
            var ry1 = f * (-y1 + this.canvasHeight / 2.0) / 10.0;
            var ry2 = f * (-y2 + this.canvasHeight / 2.0) / 10.0;
            this.mesh.geometry.vertices.push(new THREE.Vector3(rx1, ry1, z));
            this.mesh.geometry.vertices.push(new THREE.Vector3(rx2, ry2, z));
        }
    }

    redraw() {
        this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height); // Clears the canvas

        this.context.strokeStyle = "#df4b26";
        this.context.lineJoin = "round";
        this.context.lineWidth = 2;

        this.sceneManager.scene.remove(this.mesh);
        this.mesh = new THREE.LineSegments(new THREE.Geometry(), this.material);
        for (var i = 0; i < this.clickX.length; i++) {
            if (this.clickDrag[i] && i) {
                this.addSegment(this.clickX[i - 1], this.clickY[i - 1], this.clickX[i], this.clickY[i]);
            } else {
                this.addSegment(this.clickX[i] - 1, this.clickY[i], this.clickX[i], this.clickY[i]);
            }
        }
        this.sceneManager.scene.add(this.mesh);
    }

    applyGuiChanges() {
        // console.log(guiParams.ballSize);
        // this.mesh.scale.set(this.ballSize, this.ballSize, this.ballSize);
        this.redraw();
    }

    initGui() {
        this.applyGuiChanges = this.applyGuiChanges.bind(this);
        this.gui = new dat.GUI({ autoPlace: true, width: 500 });
        this.totalHeight = 20;
        this.thickness = 0.5;
        this.trapezoid = 0;
        this.gui.add(this, 'totalHeight').name('Total Height').min(1).max(100).step(1).onChange(this.applyGuiChanges);
        this.gui.add(this, 'thickness').name('Thickness').min(0.001).max(3).step(0.001).onChange(this.applyGuiChanges);
        this.gui.add(this, 'trapezoid').name('Trapezoid').min(-1).max(1).step(0.001).onChange(this.applyGuiChanges);
    }

    // onClick(inter) {
    //     this.sceneManager.scene.remove(this.dot);
    //     if (inter[0].object !== this.mesh) return;
    //     this.dot = new THREE.Mesh(new THREE.SphereGeometry(0.1), new THREE.MeshNormalMaterial());
    //     this.dot.position.copy(inter[0].point);
    //     this.sceneManager.scene.add(this.dot);
    // }

    createCanvas() {
        var canvas = document.getElementById('canvasInAPerfectWorld');
        this.context = canvas.getContext("2d");
        this.canvasHeight = canvas.height = this.context.canvas.clientHeight;
        this.canvasWidth = canvas.width = this.context.canvas.clientWidth;
        this.clickX = new Array();
        this.clickY = new Array();
        this.clickDrag = new Array();
        var paint;
        // var geom = this.mesh.geometry;
        var that = this;

        function addClick(x, y, dragging) {
            that.clickX.push(x);
            that.clickY.push(y);
            that.clickDrag.push(dragging);
        }
        $('#canvasInAPerfectWorld').mousedown(function (e) {
            paint = true;
            addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop);
            (that.redraw).bind(that)();
        });

        $('#canvasInAPerfectWorld').mousemove(function (e) {
            if (paint) {
                addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, true);
                (that.redraw).bind(that)();
            }
        });

        $('#canvasInAPerfectWorld').mouseup(function (e) {
            paint = false;
        });

        $('#canvasInAPerfectWorld').mouseleave(function (e) {
            paint = false;
        });
    }
}
