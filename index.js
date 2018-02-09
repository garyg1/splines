var canvas;
var ctx;
var width;
var height;

var selectedPoint;
var highlightedPoint;
var pointRadius = 6;
var distThresh = 20;
var pointColor = 'white';
var selectedColor = 'blue';
var highlightedColor = 'seagreen';


var spline = new Spline();

window.onload = function() {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');

    width = canvas.width;
    height = canvas.height;

    canvas.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp)
    canvas.addEventListener("mousemove", onMouseMove);

    canvas.addEventListener("contextmenu", function(ev) {
        ev.preventDefault();
    });

    window.addEventListener('resize', function() {
        ctx.canvas.width = window.innerWidth;
        ctx.canvas.height = window.innerHeight;

        window.requestAnimationFrame(draw);
    });


    let undoButton = document.getElementById("undo");
    undoButton.addEventListener("click", undo);

    let clearButton = document.getElementById("clear");
    clearButton.addEventListener("click", clear);


    requestAnimationFrame(draw);
}

/**
 * Selects a point currently highlighted on left-click.
 * Deletes the currently highlighted point on right-click.
 * @param {MouseEvent} event A MouseEvent.
 */
function onMouseDown(event) {
    let target = spline.getNearestPoint(event.offsetX, event.offsetY, distThresh);

    // if right-button pressed
    if (event.buttons % 4 >= 2) {
        if (target) {

            spline.removePoint(target);

        }
    } else if (event.buttons % 2 == 1) {
        if (target) {

            selectedPoint = target;
        
        } else {

            addPoint(event);

        }
    }

    requestAnimationFrame(draw);
}


/**
 * If `selectedPoint`, moves the point with the mouse.
 * Checks if mousing over a point, and sets it as `highlightedPoint`.
 * @param {MouseEvent} event 
 */
function onMouseMove(event) {
    if (selectedPoint) {
        selectedPoint.i = event.offsetX;
        selectedPoint.j = event.offsetY;

        spline.setcurve();
        window.requestAnimationFrame(draw);
    }

    let target = spline.getNearestPoint(event.offsetX, event.offsetY, distThresh);

    if (target) {
        if (!target.equals(highlightedPoint)) {
        
            highlightedPoint = target;
            window.requestAnimationFrame(draw);

        }
    } else if (highlightedPoint) {
        
        highlightedPoint = undefined;
        window.requestAnimationFrame(draw);
    
    }
}

/**
 * Releases the current `selectedPoint`.
 * @param {MouseEvent} event A mouse event. 
 */
function onMouseUp(event) {
    selectedPoint = undefined;
    window.requestAnimationFrame(draw);
}


/**
 * Adds a point to the spline and redraws.
 * @param {MouseEvent} event A mouse event.
 */
function addPoint(event) {
    spline.addPoint(event.offsetX, event.offsetY);
    window.requestAnimationFrame(draw);
}


/**
 * Removes the last point from the spline and redraws.
 */
function undo() {
    spline.removeLastPoint();
    window.requestAnimationFrame(draw);
}

/**
 * Clears the spline and redraws the canvas.
 */
function clear() {
    spline = new Spline();
    window.requestAnimationFrame(draw);
}


/**
 * Draws the canvas.
 */
function draw() {
    if (ctx.canvas.width != window.innerWidth || ctx.canvas.height != window.innerHeight) {
        ctx.canvas.width = window.innerWidth;
        ctx.canvas.height = window.innerHeight;
    }

    width = canvas.width;
    height = canvas.height;

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, width, height);
    
    drawLine(spline.curve);
    
    spline.points.forEach((point) => {
        let color = pointColor;

        if (point.equals(highlightedPoint)) {
            color = highlightedColor;
        }

        if (point.equals(selectedPoint)) {
            color = selectedColor;
        }
          
        drawCircle(point.i, point.j, pointRadius, color); 
    });
}

/**
 * Draws a circle centered at (`i`, `j`) with radius `radius`.
 * @param {Number} i The i-coordinate of the center.
 * @param {Number} j The j-coordinate of the center.
 * @param {Number} radius The radius.
 */
function drawCircle(i, j, radius, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(i, j, radius, 0, 2*Math.PI);
    ctx.fill();
}

/**
 * Wrapper around fillRect(j, i, 1, 1)
 * @param {Number} i 
 * @param {Number} j 
 * @param {String} color A valid CSS color. 
 */
function putPixel(i, j, color) {
    i = Math.floor(i);
    j = Math.floor(j);

    ctx.fillStyle = color;
    ctx.fillRect(j, i, 1, 1);
}

/**
 * Draws a cubic spline given by `params`.
 * @param {`Spline.curve`} params 
 */
function drawLine(params) {

    for (let n = 0; n < spline.points.length - 1; n++) {
        for (let t = 0; t < 1; t += 0.001) {

            var j = params.A[n][0] + params.B[n][0] * t + params.C[n][0] * t*t + params.D[n][0] * t*t*t;
            var i = params.A[n][1] + params.B[n][1] * t + params.C[n][1] * t*t + params.D[n][1] * t*t*t;
            putPixel(i, j, 'red');
        
        }
    }
}
