class Application {
    init() {
        this.initGui();

        this.material = new THREE.LineBasicMaterial({ color: 'red' });
        this.mesh = new THREE.LineSegments(new THREE.Geometry(), this.material);
        this.sceneManager.scene.add(this.mesh);

        // this.applyGuiChanges();
        this.createCanvas();
    }

    drawLine(line) {
        line = line.removeDuplicates();
        if (line.points.length <= 1) return;

        this.context.beginPath();
        for (var i = 1; i < line.points.length; ++i) {
            this.context.moveTo(line.points[i - 1].x, line.points[i - 1].y);
            this.context.lineTo(line.points[i].x, line.points[i].y);
        }
        this.context.closePath();
        this.context.stroke();

        line = line.translate(new THREE.Vector3(-this.canvasWidth / 2.0, -this.canvasHeight / 2.0, 0));
        line = line.scale(new THREE.Vector3(1/10.0, -1/10.0, 1.0));
        line = line.resample(0.1);
        
        var normals = line.calcNormals();
        line = line.sinModulation(this.intensity, this.frequency);
        for (var i = 1; i < line.points.length; ++i) {
            for (var z = -this.totalHeight / 2; z <= +this.totalHeight / 2; z += this.thickness) {
                var p = line.points[i - 1], q = line.points[i];
                var f = 1 + (z / this.totalHeight * 2) * this.trapezoid;
                p = new THREE.Vector3(f * p.x, f * p.y, z);
                q = new THREE.Vector3(f * q.x, f * q.y, z);
                this.mesh.geometry.vertices.push(p, q);
                if (this.showNormals) this.normalsObj.geometry.vertices.push(q, q.clone().add(normals[i]));
            }
        }
    }

    redraw() {
        this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height); // Clears the canvas

        this.context.strokeStyle = "#df4b26";
        this.context.lineJoin = "round";
        this.context.lineWidth = 2;

        this.sceneManager.scene.remove(this.mesh);
        this.mesh = new THREE.LineSegments(new THREE.Geometry(), this.material);
        if (this.showNormals) this.mesh.add(this.normalsObj = new THREE.LineSegments(new THREE.Geometry(), new THREE.LineBasicMaterial({ color: 'green' })));
        for (var i = 0; i < this.lines.length; i++) {
            this.drawLine(this.lines[i]);
        }
        this.sceneManager.scene.add(this.mesh);
    }

    applyGuiChanges() {
        // console.log(guiParams.ballSize);
        // this.mesh.scale.set(this.ballSize, this.ballSize, this.ballSize);
        this.redraw();
    }

    showGrid() {
        this.sceneManager.grid.visible = !this.sceneManager.grid.visible;
    }
    initGui() {
        this.applyGuiChanges = this.applyGuiChanges.bind(this);
        this.gui = new dat.GUI({ autoPlace: true, width: 500 });
        this.totalHeight = 20;
        this.thickness = 0.5;
        this.trapezoid = 0;
        this.intensity = 0;
        this.frequency = 1;
        this.showNormals = false;
        this.gui.add(this, 'totalHeight').name('Total Height').min(1).max(100).step(1).onChange(this.applyGuiChanges);
        this.gui.add(this, 'thickness').name('Thickness').min(0.001).max(3).step(0.001).onChange(this.applyGuiChanges);
        this.gui.add(this, 'trapezoid').name('Trapezoid').min(-1).max(1).step(0.001).onChange(this.applyGuiChanges);
        this.gui.add(this, 'intensity').name('Intensity').min(0).max(10).step(0.001).onChange(this.applyGuiChanges);
        this.gui.add(this, 'frequency').name('Frequency').min(0.001).max(10).step(0.001).onChange(this.applyGuiChanges);
        this.gui.add(this, 'showNormals').onChange(this.applyGuiChanges);
        this.gui.add(this, 'showGrid').name('Show Grid');
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
        // this.clickX = new Array();
        // this.clickY = new Array();
        // this.clickDrag = new Array();
        this.lines = [];
        var paint;
        // var geom = this.mesh.geometry;
        var that = this;

        function addClick(x, y, dragging) {
            if (dragging && that.lines.length > 0) {
                that.lines[that.lines.length - 1].push(new THREE.Vector3(x, y));
            } else {
                that.lines.push(new Polyline().push(new THREE.Vector3(x, y)));
            }
            // that.clickX.push(x);
            // that.clickY.push(y);
            // that.clickDrag.push(dragging);
            (that.redraw).bind(that)();
        }
        $('#canvasInAPerfectWorld').mousedown(function (e) {
            paint = true;
            addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop);
        });

        $('#canvasInAPerfectWorld').mousemove(function (e) {
            if (paint) {
                addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, true);
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
