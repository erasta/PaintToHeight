class Polyline {
    constructor(pts) {
        this.points = pts;
        return this;
    }
    push(p) {
        if (!this.points || !this.points.length) this.points = [];
        this.points.push(p);
        return this;
    }
    calcNormals() {
        if (this.points.length == 0) return [];
        if (this.points.length == 1) return [new THREE.Vector3(0, 1, 0)];
        return this.points.map((p, i) => {
            var q = this.points[Math.max(0, i - 1)];
            if (i == 0) p = this.points[1];
            var d = p.distanceTo(q);
            return new THREE.Vector3((p.y - q.y) / d, (q.x - p.x) / d);
        });
    }

    resample(step) {
        var ret = new Polyline();
        ret.push(this.points[0]);
        for (var i = 1; i < this.points.length; ++i) {
            var p = this.points[i - 1], q = this.points[i];
            var dist = p.distanceTo(q);
            for (var d = step, dl = dist - step / 2.0; d <= dl; d += step) {
                ret.push(new THREE.Vector3().lerpVectors(p, q, d / dist));
            }
            ret.push(q);
        }
        return ret;
    }

    removeDuplicates() {
        if (this.points.length == 0) return new Polyline();
        var ret = new Polyline([this.points[0]]);
        for (var i = 1; i < this.points.length; ++i) {
            if (this.points[i].manhattanDistanceTo(this.points[i - 1]) < 0.001) continue;
            ret.push(this.points[i]);
        }
        return ret;
    }

    scale(mult) {
        return new Polyline(this.points.map(p => {
            return p.clone().multiply(mult);
        }));
    }

    translate(offset) {
        return new Polyline(this.points.map(p => {
            return p.clone().add(offset);
        }));
    }

    sinModulation(intensity, frequency) {
        var normals = this.calcNormals();
        var dist = 0;
        return new Polyline(this.points.map((p, i) => {
            dist += ((i == 0) ? 0 : p.distanceTo(this.points[i - 1]));
            var s = Math.sin(dist * frequency) * intensity, c = Math.cos(dist * frequency) * intensity;
            var v = new THREE.Vector3(p.x + c * normals[i].x, p.y + s * normals[i].y, p.z);
            return v;
        }));
    }
}