
class PhotoGrid {
  constructor(isLeft) {
    this.images = [];
    if (isLeft) {
      this.x = width / 2 - 480;
    } else {
      this.x = width / 2 + 300;
    }

    this.y = height / 2.5;
    this.numRows = 3;
    this.numCols = 2;
    this.imageSize = 120;
    this.padding = 20;
  }

  addImage(img) {
    this.images.push(img);
    if (this.images.length > 9) {
      this.images.shift();

    }
  }

  render() {

    for (let i = 0; i < this.images.length; i++) {

      let currImage = this.images[i];
      let row = i % 3;
      let col = int(i / 3);
      fill(255);
      noStroke();
      rectMode(CORNER);
      rect(this.x + (this.imageSize + this.padding) * col, this.y + (this.imageSize + this.padding) * row,
        this.imageSize, this.imageSize, 3, 3, 3, 3);

      image(currImage, this.x + (this.imageSize + this.padding) * col + 5, this.y + (this.imageSize + this.padding) * row + 5,
        this.imageSize - 10, this.imageSize - 10);
    }
  }
}

function debounce(func, wait, immediate) {
  var timeout;
  return function() {
    var context = this,
      args = arguments;
    var later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

class Splash {

  constructor(isLeft) {
    if (isLeft) {
      this.x = width / 2 + 314;
    } else {
      this.x = width / 2 - 314
    }
    this.y = height / 3.3;
    this.color = color(22, 79, 200);
    this.isExploding = false;
    this.isInbetweenUpdates = false;
    this.explosionRadius = 100;
    this.explosionIndex = 0;
    this.numRadius = 4;
    this.radiusOffset = 10;
    this.width = 243;
    this.height = 53;
  }

  updatePosition(x, y) {
    this.x = x;
    this.y = y;
  }


  trigger() {
    this.isExploding = true;
  }

  updateIndex() {
    this.explosionIndex++;
    this.isInbetweenUpdates = false;
  }

  render() {
    if (!this.isExploding) {
      fill(this.color);
      // rect(this.x, this.y, this.width, this.height);
    } else {
      noFill();
      strokeWeight(3);
      stroke(this.color);
      rect(this.x, this.y, this.width + (this.radiusOffset * this.explosionIndex),
        this.height + (this.radiusOffset * this.explosionIndex), 9, 9, 9, 9);
    }

    if (this.isExploding && !this.isInbetweenUpdates) {
      setTimeout(() => {
        this.updateIndex()
      }, 100);
      this.isInbetweenUpdates = true;
    }

    if (this.explosionIndex >= this.numRadius) {
      this.isExploding = false;
      this.isInbetweenUpdates = false;
      this.explosionIndex = 0;
    }

  }
}

class ClassificationBar {
  constructor() {
    this.width = min(width / 4, 341);
    this.height = 28;
    this.x = width / 2;
    this.y = height / 3.3;
    this.radius = 5;

    this.classificationLeft = 0;
    this.classificationMaxWidth = this.width / 2;
    this.classificationRight = 0.0;
    this.hasSetTimeout = false;
  }


  updateClassification(results) {
    // Create a map to easily find confidence scores by label
    const confidenceMap = {};
    results.forEach(result => {
      confidenceMap[result.label] = result.confidence;
    });

    // Use the SELECTED dropdown values instead of labels[0] and labels[1]
    const leftSelectedClass = leftClassDropdown.value();
    const rightSelectedClass = rightClassDropdown.value();

    console.log('Left dropdown selected:', leftSelectedClass);
    console.log('Right dropdown selected:', rightSelectedClass);

    // Get confidence scores for the SELECTED classes
    const leftClassConfidence = confidenceMap[leftSelectedClass] || 0;
    const rightClassConfidence = confidenceMap[rightSelectedClass] || 0;

    console.log(`${leftSelectedClass} confidence:`, leftClassConfidence);
    console.log(`${rightSelectedClass} confidence:`, rightClassConfidence);

    // Map the confidence values to the bar widths
    this.classificationLeft = map(leftClassConfidence, 0, 1.0, 0, this.classificationMaxWidth);
    this.classificationRight = map(rightClassConfidence, 0, 1.0, 0, this.classificationMaxWidth);

    let view = new Uint8Array(1);

    if (leftClassConfidence > 0.90) {
      view[0] = 1;
      try {
        shouldFreezeFrame = true;
        splashRight.trigger();
        isLeftPic = true;
        connection.sendEvent('redEvent');
      } catch (e) {}
    } else if (rightClassConfidence > 0.90) {
      view[0] = 2;
      try {
        shouldFreezeFrame = true;
        splashLeft.trigger();
        isLeftPic = false;
        connection.sendEvent('blueEvent');
      } catch (e) {}
    }
  }

  render() {
    //Draw Background rectangle
    rectMode(CENTER);
    fill('rgba(174, 203, 250, 0.4)');
    stroke(255);
    strokeWeight(5);
    rect(this.x, this.y, this.width, this.height, this.radius, this.radius, this.radius, this.radius);
    noStroke();

    fill('#1967d2');
    rect(this.x - this.classificationLeft / 2, this.y, this.classificationLeft, this.height, this.radius, this.radius, this.radius, this.radius);
    rect(this.x + this.classificationRight / 2, this.y, this.classificationRight, this.height, this.radius, this.radius, this.radius, this.radius);
    stroke(0);
    strokeWeight(7);
    strokeCap(ROUND);
    line(this.x, this.y - this.height / 2, this.x, this.y + this.height / 2);
  }
}

class ClassInput {

  constructor(isLeft) {
    this.width = 243;
    this.height = 53;
    this.radius = 9;
    this.textLineOffset = 40;
    this.isLeft = isLeft;
    this.hoverOne = false;
    this.hoverTwo = false;
    this.hoverThree = true;
    if (isLeft === true) {
      this.x = width / 2 + 314;
    } else {
      this.x = width / 2 - 314;
    }

    this.y = height / 3.3;
    this.isActive = false;
    this.currentValue = null;

  }

  onClick(x, y) {
    const leftBound = this.x - this.width / 2;
    const rightBound = this.x + this.width / 2;
    const bottomBound = this.y + this.height / 2;
    const topBound = this.y - this.height / 2;
    const isInside = (x >= leftBound && x <= rightBound && y <= bottomBound && y >= topBound);

    if (isInside) {
      this.isActive = !this.isActive;
    }
  }

  onHover(x, y) {
    console.log("hover")
    this.detectZone(x, y);
  }

  detectZone(x, y) {
    console.log("detecting")
    const leftBound = this.x - this.width / 2;
    const rightBound = this.x + this.width / 2;
    const zoneOneBottom = this.y + this.height / 2;
    const zoneOneTop = this.y - this.height / 2;

    if (x >= leftBound && x <= rightBound && y <= zoneOneTop && y >= zoneOneBottom) {
      this.hoverOne = true;
      this.hoverTwo = false;
      this.hoverThree = false;
      return 1;
    }
  }

  render() {
    if (isModelLoaded) {
      console.log('here')
      fill(255);
      rectMode(CENTER);
      noStroke();
      textFont(poppinsBold);
      textSize(24);
      if (!this.isActive) {
        rect(this.x, this.y, this.width, this.height, this.radius, this.radius, this.radius, this.radius);

      } else {
        console.log("active")
        rect(this.x, this.y + this.textLineOffset, this.width, this.height + this.textLineOffset * 2, this.radius, this.radius, this.radius, this.radius);
        if (this.hoverOne) {
          fill('rgba(154,160,166, 0.2)');
          rect(this.x, this.y, this.width, this.height, this.radius, this.radius, 0, 0);
        } else if (this.hoverTwo) {
          fill('rgba(154, 160, 166, 0.2)');
          rect(this.x, this.y + this.textLineOffset, this.width, this.height - 10, 0, 0, 0, 0);
        } else if (this.hoverThree) {
          fill('rgba(154, 160, 166, 0.2)');
          rect(this.x, this.y + this.textLineOffset * 2 + 6, this.width, this.height - 11, 0, 0, this.radius, this.radius);
        }
      }
      if (labels.length >= 2) {
        fill('#1967D2');
        if (this.isLeft) {
          textAlign(LEFT, CENTER);
          text(labels[0], this.x - this.width / 2 + 10, this.y - 4);
          if (this.isActive) {
            text(labels[1], this.x - this.width / 2 + 10, this.y + this.textLineOffset);
            text(labels[2], this.x - this.width / 2 + 10, this.y + this.textLineOffset * 2);

          }
          image(pencil, this.x - this.width / 2 + 200, this.y - this.height / 2 + 10, pencil.width / 2, pencil.height / 2);
        } else {
          textAlign(RIGHT, CENTER);
          if (labels.length > 2) {
            text(labels[1], this.x + this.width / 2 - 13, this.y - 4);
          }

          if (this.isActive) {
            text(labels[1], this.x + this.width / 2 - 13, this.y + this.textLineOffset);
            text(labels[2], this.x + this.width / 2 - 13, this.y + this.textLineOffset * 2);
          }
          image(pencil, this.x + this.width / 2 - 235, this.y - this.height / 2 + 10, pencil.width / 2, pencil.height / 2);
        }
      }
    }
  }
}




// Classifier Variable
let classifier;
let input;

// Video
let video;
let videoSize;
let classificationIndicator;

let leftGrid;
let leftAdd
let rightGrid;
let rightAdd;

let isLeftPic;

let leftClassDropdown;
let rightClassDropdown;
let leftClassValue = "";
let rightClassValue = "";

let cameraBorder;
let putSorter;
let splashLeft;
let splashRight;
let selectPic;

let connect;
let pencil;
let bgColor = '#e8f0fe';
let shouldFreezeFrame;
let modeInput;
let loadModel;
let connection;
let labels = [];

let poppinsRegular;
let poppinsBold;
let hasSetPauseTimer;
// To store the classification
let label = "";
let isModelLoaded = false;
let modelURL = "https://teachablemachine.withgoogle.com/models/9L4-MDs0/";

function inputModelURLEvent() {
  modelURL = this.value();
}

async function connectEvent() {
  connection = SimpleWebSerial.setupSerialConnection();
  connection.startConnection();
  connection.on('connection-ok', function(data) {
    console.log('connection OK')
    connect.html("DISCONNECT");
  });
}

function setup() {
  createCanvas(window.innerWidth, window.innerHeight);
  // Create the video
  videoSize = 250;
  video = createCapture(VIDEO);
  video.hide();

  cameraBorder = loadImage('camera_border.png');
  putsorter = loadImage('put_sorter.png');

  loadModel = new Clickable();

  loadModel.resize(145, 40);

  loadModel.locate(300, 15);
  loadModel.strokeWeight = 0;
  loadModel.color = bgColor;
  loadModel.text = 'LOAD MODEL';
  loadModel.textSize = 18;
  loadModel.textColor = '#1967d2';
  loadModel.onPress = () => {
    try {
      console.log(modelURL + 'metadata.json');
      classifier = ml5.imageClassifier(modelURL + 'model.json');

      httpGet(modelURL + 'metadata.json', 'json', false, (response) => {
        if (response.labels.length <= 2) {
          alert("Train a model with at least three classes: one for each type of object you want to sort, and one for the empty sorter");
        } else {
          labels = response.labels;
          isModelLoaded = true;
          classifyVideo();
        }

      }, (error) => alert("invalid TM2 url"));
    } catch (e) {
      loadModel.text = 'INVALID URL';
    }
    if (labels.length > 1) {
      loadModel.text = 'MODEL LOADED';
      setTimeout(() => {
        loadModel.text = 'REFRESH MODEL'
      }, 3000);
    }
  }

  leftGrid = new PhotoGrid(true);
  pencil = loadImage('pencil_icon.png');
  classificationIndicator = new ClassificationBar();
  leftClassDropdown = createSelect();
  leftClassDropdown.size(200, 35)
  leftClassDropdown.position(
    Math.round(width / 2 - 200 - 200),
    Math.round(height / 3.3 - 35 / 2)
  );


  leftClassDropdown.style('font-size', '18px');
  leftClassDropdown.style('font-family', 'Poppins');
  leftClassDropdown.changed(() => {
    leftClassValue = leftClassDropdown.value();
  });

  rightClassDropdown = createSelect();
  rightClassDropdown.size(200, 35)
  rightClassDropdown.position(
    Math.round(width / 2 + 200),
    Math.round(height / 3.3 - 35 / 2)
  );
  rightClassDropdown.style('font-size', '18px');
  rightClassDropdown.style('font-family', 'Poppins');
  rightClassDropdown.changed(() => {
    rightClassValue = rightClassDropdown.value();
  });
  splashRight = new Splash(false);
  splashLeft = new Splash(true);
  rightGrid = new PhotoGrid(false);
  poppinsRegular = loadFont('Poppins-Regular.ttf');
  poppinsBold = loadFont('Poppins-Bold.ttf');

  loadModel.textFont = poppinsRegular;
  shouldFeezeFrame = false;
  hasSetPauseTimer = false;

  modelInput = createInput('Paste model link here');
  modelInput.input(inputModelURLEvent);
  modelInput.position(20, 20);
  modelInput.style('height', '35px');
  modelInput.style('width', '267px');
  modelInput.style('border-width', '0px');
  modelInput.style('border-radius', '4px 4px 0px 0px');
  modelInput.style('border-bottom', '2px solid #1967d2');
  modelInput.style('font-family', 'Poppins');
  modelInput.style('font-size', '16px');
  modelInput.style('padding-left', '5px');
  modelInput.style('color', '#669df6');

  connect = createButton('CONNECT ARDUINO');
  connect.mouseClicked(connectEvent);
  connect.position(width - 200, 20);
  connect.id("connect");
  connect.style('height', '40px');
  connect.style('border-width', '0px');
  connect.style('background-color', bgColor);
  connect.style('font-family', 'Poppins');
  connect.style('font-size', '18px');
  connect.style('width', '200px');
  connect.style('color', '#1967D2');
  leftAdd = debounce(() => {
    leftGrid.addImage(selectPic)
  }, 500, true);
  rightAdd = debounce(() => {
    rightGrid.addImage(selectPic)
  }, 500, true);

  // Start classifying
  if (isModelLoaded) {
    classifyVideo();
  }
}

function draw() {
  if (width > 700) {
    background(bgColor);
    video.get();
    if (shouldFreezeFrame && !hasSetPauseTimer) {
      video.pause();
      selectPic = video.get(150, 0, videoSize / 1.6, videoSize / 1.6);
      if (isLeftPic) {
        leftAdd();
      } else {
        rightAdd();
      }
      setTimeout(() => {

        video.play();
        hasSetPauseTimer = false;
        shouldFreezeFrame = false

      }, 2000);
    }
    image(putsorter, width / 2 - putsorter.width / 5, 0, putsorter.width / 2.5, putsorter.height / 2.5);
    noStroke();
    textFont(poppinsBold);
      textAlign(CENTER, CENTER);
      textSize(14);
      text("enable webcam access", width / 2, height / 1.6);
      text("and refresh page to use", width / 2, height / 1.5);
    image(video, width / 2 - videoSize / 2, height / 1.6 - videoSize / 2, videoSize, videoSize, 150, 0, videoSize * 1.5, videoSize * 1.5);
    image(cameraBorder, width / 2 - videoSize / 2 - 3, height / 1.6 - videoSize / 2 - 3, videoSize + 6, videoSize + 6);

    // leftGrid.render();
    // rightGrid.render();
    rectMode(CORNER);
    loadModel.draw();
    classificationIndicator.render();
    if (isModelLoaded && leftClassDropdown.elt.options.length !== labels.length) {
      leftClassDropdown.elt.innerHTML = '';
      rightClassDropdown.elt.innerHTML = '';
      labels.forEach(label => {
        leftClassDropdown.option(label);
        rightClassDropdown.option(label);
      });
      leftClassDropdown.selected(leftClassValue || labels[0]);
      rightClassDropdown.selected(rightClassValue || labels[1] || labels[0]);
    }
    splashLeft.render();
    splashRight.render();
  } else {
    noStroke();
    
    text("expand page or ", width / 2, height / 1.6);
    text("load on a computer to use", width / 2, height / 1.5);
  }
}

// Get a prediction for the current video frame
function classifyVideo() {
  classifier.classify(video, gotResult);
}

// When we get a result
function gotResult(error, results) {
  // If there is an error
  if (error) {
    console.error(error);
    return;
  }
  console.log('Got result')
  // The results are in an array ordered by confidence.
  // console.log(results[0]);
  classificationIndicator.updateClassification(results);
  
  label = results[0].label;
  // Classify again!
  classifyVideo();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  const leftPhotos = leftGrid.images;
  const rightPhotos = rightGrid.images;
  leftGrid = new PhotoGrid(true);
  rightGrid = new PhotoGrid(false);
  leftGrid.images = leftPhotos;
  rightGrid.images = rightPhotos;
  classificationIndicator = new ClassificationBar();
  splashRight = new Splash(false);
  splashLeft = new Splash(true);
  loadModel = new Clickable();
  connect.position(width - 200, 20);
  loadModel.resize(145, 40);
  loadModel.locate(300, 15);
  loadModel.strokeWeight = 0;
  loadModel.color = '#E8F0FE';
  loadModel.text = 'LOAD MODEL';
  loadModel.textSize = 18;
  loadModel.textColor = '#1967d2';
  loadModel.onPress = () => {
    loadModel.text = 'MODEL LOADED';
    setTimeout(() => {
      loadModel.text = 'REFRESH MODEL'
    }, 3000);
  }
  loadModel.textFont = poppinsRegular;
}