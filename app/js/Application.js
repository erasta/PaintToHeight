class Application {
    init() {
        this.initGui();

        this.material = new THREE.LineBasicMaterial({ color: 'red' });
        this.mesh = new THREE.LineSegments(new THREE.Geometry(), this.material);
        this.sceneManager.scene.add(this.mesh);

        // this.applyGuiChanges();
        this.createCanvas();
    }
    static resampleSegment(p, q, step) {
        var dist = p.distanceTo(q);
        var ret = [p];
        for (var d = step; d < dist; d += step) {
            ret.push(new THREE.Vector3().lerpVectors(p, q, d / dist));
        }
        ret.push(q);
        return ret;
    }
    static resampleLine(line, step) {
        var ret = [line[0]];
        for (var i = 1; i < line.length; ++i) {
            var p = line[i - 1], q = line[i];
            var dist = p.distanceTo(q);
            for (var d = step; d < dist; d += step) {
                ret.push(new THREE.Vector3().lerpVectors(p, q, d / dist));
            }
            ret.push(q);
        }
        return ret;
    }

    drawLine(line) {
        this.context.beginPath();
        for (var i = 1; i < line.length; ++i) {
            this.context.moveTo(line[i-1].x, line[i-1].y);
            this.context.lineTo(line[i].x, line[i].y);
        }
        this.context.closePath();
        this.context.stroke();

        var l = Application.resampleLine(line.map(p => {
            return new THREE.Vector3((p.x - this.canvasWidth / 2.0) / 10.0, (-p.y + this.canvasHeight / 2.0) / 10.0);
        }));
        for (var i = 1; i < l.length; ++i) {
            for (var z = -this.totalHeight / 2; z <= +this.totalHeight / 2; z += this.thickness) {
                var p = l[i-1], q = l[i];
                var f = 1 + (z / this.totalHeight * 2) * this.trapezoid;
                p = new THREE.Vector3(f * p.x, f * p.y, z);
                q = new THREE.Vector3(f * q.x, f * q.y, z);
                this.mesh.geometry.vertices.push(p, q);
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
        for (var i = 0; i < this.lines.length; i++) {
            if (this.lines[i].length > 1) {
                this.drawLine(this.lines[i]);
            } else {
                this.drawLine([new THREE.Vector2(this.lines[i][0].x - 1, this.lines[i][0].y), this.lines[i][0]]);
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
        // this.clickX = new Array();
        // this.clickY = new Array();
        // this.clickDrag = new Array();
        this.lines = [];
        var paint;
        // var geom = this.mesh.geometry;
        var that = this;

        function addClick(x, y, dragging) {
            if (dragging && that.lines.length > 0) {
                that.lines[that.lines.length - 1].push(new THREE.Vector2(x, y));
            } else {
                that.lines.push([new THREE.Vector2(x, y)]);
            }
            // that.clickX.push(x);
            // that.clickY.push(y);
            // that.clickDrag.push(dragging);
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
