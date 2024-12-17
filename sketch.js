let points1 = [], points2 = [], points3 = [], points4 = [];
let outRadius1, inRadius1, pointCount1;
let outRadius2, inRadius2, pointCount2;
let song, amp, fft, peakDetect;
let num_cols = 5;
let num_rows = 4;
let cellSize;
let myHue = 0;
let bgX = 0, bgY = 0;
let lastTime = 0;

function preload() {
    song = loadSound("eastern-thought.mp3");
}

function setup() {
    const cnv = createCanvas(1920, 1080);
    background(0);
    colorMode(HSB);
    noFill();

    // Sound settings
    song.amp(1);
    amp = new p5.Amplitude();
    song.connect(amp);
    fft = new p5.FFT(0.9, 16);
    peakDetect = new p5.peakDetect(20, 20000, 0.25);
    cnv.mouseClicked(togglePlay);
    
    // Noise settings
    // some of good looking seeds:
    // 5389.194457348789
    // 91.35199714311204
    // 5023.246511245181
    noiseSeed(5023.246511245181);


    // Initial polygon creation
    angleMode(DEGREES);
    cellSize = height / num_cols / 1.22;
    updateParams();
    updatePolygons(1, outRadius1, inRadius1, pointCount1);
    updatePolygons(2, outRadius2, inRadius2, pointCount2);
}

function draw() {
    background(0, 0.05);

    changeDetection();      // Detects rythm and updates parameters when peak is detected
    drawFillBG();           // Makes the background effect

    let shiftX = (width - cellSize*num_cols)/2;
    let shiftY = (height - cellSize*num_rows)/2;
    
    angleMode(DEGREES);
    // Draw bottom layer of stars
    strokeWeight(7.5);
    stroke(100);
    drawStarGrid(points1, points2, num_rows, num_cols, false, shiftX, shiftY);
    drawStarGrid(points3, points4, num_rows + 1, num_cols + 1, false, shiftX - cellSize/2, shiftY - cellSize/2);

    // Draw upper layer of stars
    strokeWeight(2.5);
    stroke(0);
    drawStarGrid(points1, points2, num_rows, num_cols, false, shiftX, shiftY);
    drawStarGrid(points3, points4, num_rows + 1, num_cols + 1, false, shiftX - cellSize/2, shiftY - cellSize/2);
}



function drawStarGrid(pointsA, pointsB, rows, cols, mirror, dX, dY) {
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const cx = j * cellSize + cellSize / 2 + dX;
            const cy = i * cellSize + cellSize / 2 + dY;
            drawStar(pointsA, pointsB, cx, cy);
        }
    }
}

function drawStar(pointsA, pointsB, cx, cy) {
    push();
    translate(cx, cy);

    for (let i = 0; i < pointsA.length; i++) {
        let nextIndex = (i + 1) % pointsA.length;
        line(pointsA[i].x, pointsA[i].y, pointsB[i].x, pointsB[i].y);
        line(pointsB[i].x, pointsB[i].y, pointsA[nextIndex].x, pointsA[nextIndex].y);
    }

    pop();
}

function createPolygon(cx, cy, radius, numPoints, angle) {
    let angleIncrement = 360 / numPoints;
    let result_points = [];

    for (let i = 0; i < numPoints; i++) {
        let theta = angleIncrement * i + angle;
        let x = cx + radius * cos(theta);
        let y = cy + radius * sin(theta);
        result_points.push(createVector(x, y));
    }

    return result_points;
}

function updatePolygons(setNum, outR, inR, pCount) {    // Arguments represent points and sliders for given set of objects
    let radius1 = outR;
    let radius2 = inR;
    let numPoints = pCount;

    if (setNum == 1) {
        points1 = createPolygon(0, 0, radius1, numPoints, 0);
        points2 = createPolygon(0, 0, radius2, numPoints, 360 / (numPoints * 2));
    } else {
        points3 = createPolygon(0, 0, radius1, numPoints, 0);
        points4 = createPolygon(0, 0, radius2, numPoints, 360 / (numPoints * 2));
    }
    
}

function updateParams() {       // Analyze the sound and set parameters for stars
    let volume = amp.getLevel();
    let prespectrum = fft.analyze();
    let spectrum = fft.linAverages(6);

    pointCount1 = round(map(noise(volume*50, millis()), 0, 1, 2, 7))*2;
    pointCount2 = round(map(noise(volume*50, millis()), 0, 1, 2, 7))*2;

    let diff = 50;
    let coef = 2.3;
    
    outRadius1 = (round(map((spectrum[1]), 0, 255, 100, 200))
                + map(noise(millis()/1000), 0, 1, -diff, diff)) / coef;
    inRadius1 = (round(map((spectrum[3]), 0, 255, 200, 300))
                + map(noise(millis()/1000), 0, 1, -diff, diff)) / coef;

    outRadius2 = (round(map((spectrum[2]), 0, 255, 150, 250))
                + map(noise(millis()/1000), 0, 1, -diff, diff)) / coef;
    inRadius2 = (round(map((spectrum[4]), 0, 255, 250, 350))
                + map(noise(millis()/1000), 0, 1, -diff, diff)) / coef;
}

function changeDetection() {
    fft.analyze();
    peakDetect.update(fft);
    if (peakDetect.isDetected) {
        updateParams();
        updatePolygons(1, outRadius1, inRadius1, pointCount1);
        updatePolygons(2, outRadius2, inRadius2, pointCount2);
        lastTime = millis();
    }
}

function drawFillBG() {
    angleMode(RADIANS);
    if (millis() - lastTime <= 500) {
        myHue = map(noise(millis()/10000), 0, 1, 0, 360) + 240;
        myHue %= 360;
        fill(myHue, 75,20, 0.01);
        for (let i = 0; i < 10; i++) {
            fillBG();
        }
    }
    noFill();
}

function fillBG() {
    bgX = random(-100, width + 100);
    bgY = random(-100, height + 100);
    noStroke();

    push();
    translate(bgX, bgY);
    for (let k = 0; k < 10; k++) {
        rotate(random(PI * 2));
        beginShape();
        for (m = 0; m < PI * 2; m += 1) {
            r = random(100, 200);
            let x = cos(m) * r;
            let y = sin(m) * r;
            vertex(x, y);
        }
        endShape(CLOSE);
    }
    pop();
}

function togglePlay() {
  if (song.isPlaying()) {
    song.pause();
  } else {
    song.loop();
  }
}