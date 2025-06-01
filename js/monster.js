var Input = {
    keys: [],
    mouse: {
        left: false,
        right: false,
        middle: false,
        x: 0,
        y: 0
    }
};

for (var i = 0; i < 230; i++) {
    Input.keys.push(false);
}

document.addEventListener("keydown", function(event) {
    Input.keys[event.keyCode] = true;
});

document.addEventListener("keyup", function(event) {
    Input.keys[event.keyCode] = false;
});

document.addEventListener("mousedown", function(event) {
    if ((event.button = 0)) {
        Input.mouse.left = true;
    }
    if ((event.button = 1)) {
        Input.mouse.middle = true;
    }
    if ((event.button = 2)) {
        Input.mouse.right = true;
    }
});

document.addEventListener("mouseup", function(event) {
    if ((event.button = 0)) {
        Input.mouse.left = false;
    }
    if ((event.button = 1)) {
        Input.mouse.middle = false;
    }
    if ((event.button = 2)) {
        Input.mouse.right = false;
    }
});

document.addEventListener("mousemove", function(event) {
    Input.mouse.x = event.clientX;
    Input.mouse.y = event.clientY;
});

// Sets up canvas
var canvas = document.createElement("canvas");
document.body.appendChild(canvas);
canvas.width = Math.max(window.innerWidth, window.innerWidth);
canvas.height = window.innerHeight;
canvas.style.position = "absolute";
canvas.style.left = "0px";
canvas.style.top = "0px";
canvas.style.pointerEvents = "none"; // Allow clicking through the canvas
document.body.style.overflow = "hidden";
var ctx = canvas.getContext("2d");

// Necessary classes
var segmentCount = 0;

class Segment {
    constructor(parent, size, angle, range, stiffness) {
        segmentCount++;
        this.isSegment = true;
        this.parent = parent;
        if (typeof parent.children == "object") {
            parent.children.push(this);
        }
        this.children = [];
        this.size = size;
        this.relAngle = angle;
        this.defAngle = angle;
        this.absAngle = parent.absAngle + angle;
        this.range = range;
        this.stiffness = stiffness;
        this.updateRelative(false, true);
    }

    updateRelative(iter, flex) {
        this.relAngle = this.relAngle - 2 * Math.PI * Math.floor((this.relAngle - this.defAngle) / 2 / Math.PI + 1 / 2);
        if (flex) {
            this.relAngle = Math.min(
                this.defAngle + this.range / 2,
                Math.max(
                    this.defAngle - this.range / 2,
                    (this.relAngle - this.defAngle) / this.stiffness + this.defAngle
                )
            );
        }
        this.absAngle = this.parent.absAngle + this.relAngle;
        this.x = this.parent.x + Math.cos(this.absAngle) * this.size;
        this.y = this.parent.y + Math.sin(this.absAngle) * this.size;
        if (iter) {
            for (var i = 0; i < this.children.length; i++) {
                this.children[i].updateRelative(iter, flex);
            }
        }
    }

    draw(iter) {
        ctx.beginPath();
        ctx.moveTo(this.parent.x, this.parent.y);
        ctx.lineTo(this.x, this.y);
        ctx.stroke();
        if (iter) {
            for (var i = 0; i < this.children.length; i++) {
                this.children[i].draw(true);
            }
        }
    }

    follow(iter) {
        var x = this.parent.x;
        var y = this.parent.y;
        var dist = ((this.x - x) ** 2 + (this.y - y) ** 2) ** 0.5;
        this.x = x + this.size * (this.x - x) / dist;
        this.y = y + this.size * (this.y - y) / dist;
        this.absAngle = Math.atan2(this.y - y, this.x - x);
        this.relAngle = this.absAngle - this.parent.absAngle;
        this.updateRelative(false, true);
        if (iter) {
            for (var i = 0; i < this.children.length; i++) {
                this.children[i].follow(true);
            }
        }
    }
}

class LimbSystem {
    constructor(end, length, speed, creature) {
        this.end = end;
        this.length = Math.max(1, length);
        this.creature = creature;
        this.speed = speed;
        creature.systems.push(this);
        this.nodes = [];
        var node = end;
        for (var i = 0; i < length; i++) {
            this.nodes.unshift(node);
            node = node.parent;
            if (!node.isSegment) {
                this.length = i + 1;
                break;
            }
        }
        this.hip = this.nodes[0].parent;
    }

    moveTo(x, y) {
        this.nodes[0].updateRelative(true, true);
        var dist = ((x - this.end.x) ** 2 + (y - this.end.y) ** 2) ** 0.5;
        var len = Math.max(0, dist - this.speed);
        for (var i = this.nodes.length - 1; i >= 0; i--) {
            var node = this.nodes[i];
            var ang = Math.atan2(node.y - y, node.x - x);
            node.x = x + len * Math.cos(ang);
            node.y = y + len * Math.sin(ang);
            x = node.x;
            y = node.y;
            len = node.size;
        }
        for (var i = 0; i < this.nodes.length; i++) {
            var node = this.nodes[i];
            node.absAngle = Math.atan2(node.y - node.parent.y, node.x - node.parent.x);
            node.relAngle = node.absAngle - node.parent.absAngle;
            for (var ii = 0; ii < node.children.length; ii++) {
                var childNode = node.children[ii];
                if (!this.nodes.includes(childNode)) {
                    childNode.updateRelative(true, false);
                }
            }
        }
    }

    update() {
        this.moveTo(Input.mouse.x, Input.mouse.y);
    }
}

class Creature {
    constructor(x, y, angle, fAccel, fFric, fRes, fThresh, rAccel, rFric, rRes, rThresh) {
        this.x = x;
        this.y = y;
        this.absAngle = angle;
        this.fSpeed = 0;
        this.fAccel = fAccel;
        this.fFric = fFric;
        this.fRes = fRes;
        this.fThresh = fThresh;
        this.rSpeed = 0;
        this.rAccel = rAccel;
        this.rFric = rFric;
        this.rRes = rRes;
        this.rThresh = rThresh;
        this.children = [];
        this.systems = [];
    }

    follow(x, y) {
        var dist = ((this.x - x) ** 2 + (this.y - y) ** 2) ** 0.5;
        var angle = Math.atan2(y - this.y, x - this.x);
        
        var accel = this.fAccel;
        if (this.systems.length > 0) {
            var sum = 0;
            for (var i = 0; i < this.systems.length; i++) {
                sum += this.systems[i].step == 0;
            }
            accel *= sum / this.systems.length;
        }
        this.fSpeed += accel * (dist > this.fThresh);
        this.fSpeed *= 1 - this.fRes;
        this.speed = Math.max(0, this.fSpeed - this.fFric);

        var dif = this.absAngle - angle;
        dif -= 2 * Math.PI * Math.floor(dif / (2 * Math.PI) + 1 / 2);
        if (Math.abs(dif) > this.rThresh && dist > this.fThresh) {
            this.rSpeed -= this.rAccel * (2 * (dif > 0) - 1);
        }
        this.rSpeed *= 1 - this.rRes;
        if (Math.abs(this.rSpeed) > this.rFric) {
            this.rSpeed -= this.rFric * (2 * (this.rSpeed > 0) - 1);
        } else {
            this.rSpeed = 0;
        }

        this.absAngle += this.rSpeed;
        this.absAngle -= 2 * Math.PI * Math.floor(this.absAngle / (2 * Math.PI) + 1 / 2);
        this.x += this.speed * Math.cos(this.absAngle);
        this.y += this.speed * Math.sin(this.absAngle);
        this.absAngle += Math.PI;
        for (var i = 0; i < this.children.length; i++) {
            this.children[i].follow(true, true);
        }
        for (var i = 0; i < this.systems.length; i++) {
            this.systems[i].update(x, y);
        }
        this.absAngle -= Math.PI;
        this.draw(true);
    }

    draw(iter) {
        var r = 4;
        ctx.beginPath();
        ctx.arc(this.x, this.y, r, Math.PI / 4 + this.absAngle, 7 * Math.PI / 4 + this.absAngle);
        ctx.moveTo(
            this.x + r * Math.cos(7 * Math.PI / 4 + this.absAngle),
            this.y + r * Math.sin(7 * Math.PI / 4 + this.absAngle)
        );
        ctx.lineTo(
            this.x + r * Math.cos(this.absAngle) * 2 ** 0.5,
            this.y + r * Math.sin(this.absAngle) * 2 ** 0.5
        );
        ctx.lineTo(
            this.x + r * Math.cos(Math.PI / 4 + this.absAngle),
            this.y + r * Math.sin(Math.PI / 4 + this.absAngle)
        );
        ctx.stroke();
        if (iter) {
            for (var i = 0; i < this.children.length; i++) {
                this.children[i].draw(true);
            }
        }
    }
}

// Initialize monster
function initMonster() {
    canvas.style.backgroundColor = "transparent";
    ctx.strokeStyle = "#ff69b4";
    ctx.lineWidth = 2;
    
    var critter = new Creature(
        window.innerWidth / 2,
        window.innerHeight / 2,
        0,
        12,
        1,
        0.5,
        16,
        0.5,
        0.085,
        0.5,
        0.3
    );

    var node = critter;
    for (var i = 0; i < 32; i++) {
        node = new Segment(node, 8, 0, 2, 1);
    }
    
    var tentacle = new LimbSystem(node, 32, 8, critter);
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        critter.follow(Input.mouse.x, Input.mouse.y);
        requestAnimationFrame(animate);
    }
    
    animate();
}

// Initialize when DOM is loaded
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initMonster);
} else {
    initMonster();
}

// Handle window resize
window.addEventListener("resize", function() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});
