// window.jpeg, loaded through index.html
import imageUrl from '../static/cat_eye.jpeg?url';
import * as JpegUtils from './JpegUtils.js'
import DragAndDrop from './DragAndDrop.js';

const canvas = document.querySelector("#main");
const selectedBlockCanvas = document.querySelector("#selected-block");
const dctGridCanvas = document.querySelector("#dct-grid")

const textArea = document.querySelector("#dct-textbox");
const resetBtn = document.querySelector("#reset");
const slider = document.querySelector("#slider");
const reverseCheckbox = document.querySelector("#reverse");
let chosenBlock = { block: null, acValues: null, x: 0, y: 0, sortedIndices: [], originalAC: []};
let originalDCTValues;
let dctSourceCanvas;

async function fetchImage() {
  dctSourceCanvas = await JpegUtils.generateDCTCoefficientCanvas();

  const response = await fetch(imageUrl);
  const buffer = await response.arrayBuffer();
  decodedImage = jpeg.decode(buffer, { useTArray:true });
  originalDCTValues = JpegUtils.getAllDCTValues(decodedImage);

  JpegUtils.drawDecodedImage(decodedImage, canvas)
  selectedBlockCanvas.width = canvas.width;
  selectedBlockCanvas.height = canvas.height;
  selectedBlockCanvas.getContext('2d').scale(8, 8);
}
fetchImage();

DragAndDrop(canvas, async (files) => {
  const fileUrl = URL.createObjectURL(files[0]);

  const response = await fetch(fileUrl);
  const buffer = await response.arrayBuffer();
  decodedImage = jpeg.decode(buffer, { useTArray:true });
  originalDCTValues = JpegUtils.getAllDCTValues(decodedImage);

   JpegUtils.drawDecodedImage(decodedImage, canvas)
  selectedBlockCanvas.width = canvas.width;
  selectedBlockCanvas.height = canvas.height;
  selectedBlockCanvas.getContext('2d').scale(8, 8);
})


let decodedImage;
canvas.addEventListener("click", function(event) {
  if (!decodedImage) return;

  const { block, x, y } = JpegUtils.getDCTBlockFromClick(event, decodedImage, canvas);
  
  if (block.length > 0) {
    textArea.value = JpegUtils.formatDCTBlockText(block)
    chosenBlock.block = block
    chosenBlock.x = x * 8;
    chosenBlock.y = y * 8;
    chosenBlock.acValues = block.slice(1)
    chosenBlock.sortedIndices = JpegUtils.getSortedDCTIndices(chosenBlock.acValues)
    chosenBlock.originalAC = block.slice(1)
    updateCoefficientTable();

    // Set the sliders' min value to the first non-zero coefficient
    for (let i = 0; i < chosenBlock.sortedIndices.length; i++) {
      const index = chosenBlock.sortedIndices[i];
      if (chosenBlock.acValues[index] != 0) {
        slider.value = i;
        break;
      }
    }

    if (reverseCheckbox.checked) {
      slider.value = 0;
    }
  }

  // Redraw to remove the red outline
  JpegUtils.drawDecodedImage(decodedImage, canvas)
  // Display the chosen block in the 2nd canvas
  updateZoomedInCanvas(chosenBlock.x, chosenBlock.y)

  
});

textArea.oninput = function() {
  readDCTText();
}

resetBtn.onclick = function() {
    JpegUtils.resetAllDCTValues(decodedImage, originalDCTValues)
    JpegUtils.regenerateFromeDCT(decodedImage);
  JpegUtils.drawDecodedImage(decodedImage, canvas)
  updateZoomedInCanvas(chosenBlock.x, chosenBlock.y)

  const block = chosenBlock.block
  if (block && block.length > 0) {
    textArea.value = JpegUtils.formatDCTBlockText(block)
  }

  chosenBlock.acValues = block.slice(1)
    chosenBlock.sortedIndices = JpegUtils.getSortedDCTIndices(chosenBlock.acValues)
    chosenBlock.originalAC = block.slice(1)
}

slider.oninput = (e) => {
    if (chosenBlock.block == null) return;
    const finalIndex = e.target.value;
    const reversed = reverseCheckbox.checked

    // Update the acValues in sequence to 0
    // then update the block, then update the text
    // then update the drawings
    const indices = chosenBlock.sortedIndices
    const acValues = chosenBlock.acValues
    const originalAC = chosenBlock.originalAC

    if (reversed) {
      let count = 0;
      for (let i = indices.length - 1; i >= 0; i--) {
        const index = indices[i];// This index is of the nth largest 
        if (count >= finalIndex) {
          // Restore original value
          acValues[index] = originalAC[index]
        } else {
          acValues[index] = 0;
        }
        count++;
      }
    } else {
      let count = 0;

      for (let i = 0; i < indices.length; i++) {
        const index = indices[i];
        if (count >= finalIndex) {
          // Restore original value
          acValues[index] = originalAC[index]
        } else {
          acValues[index] = 0;
        }
        count++;
      }
    }
    

    for (let i = 0; i < 63; i++) {
      chosenBlock.block[i + 1] = chosenBlock.acValues[i]
    }

    updateCoefficientTable();
    
    textArea.value = JpegUtils.formatDCTBlockText(chosenBlock.block)   
    JpegUtils.regenerateFromeDCT(decodedImage);
    JpegUtils.drawDecodedImage(decodedImage, canvas)
    updateZoomedInCanvas(chosenBlock.x, chosenBlock.y) 
}

function readDCTText() {
  if (!chosenBlock.block) return;
  let numbers = textArea.value.split("\n").join(" ").split(" ").map(v => parseFloat(v))
  if (numbers.length > 64) {
    numbers = numbers.slice(0, 64);
  }
  if (numbers.length < 64) {
    for (let i = numbers.length; i < 64; i++) {
      numbers[i] = 0;
    }
  }

  for (let i = 0; i < 64; i++) {
    chosenBlock.block[i] = numbers[i];
  }

  JpegUtils.regenerateFromeDCT(decodedImage);
  JpegUtils.drawDecodedImage(decodedImage, canvas)
  updateZoomedInCanvas(chosenBlock.x, chosenBlock.y)

    chosenBlock.acValues = chosenBlock.block.slice(1)
  chosenBlock.sortedIndices = JpegUtils.getSortedDCTIndices(chosenBlock.acValues)
  chosenBlock.originalAC = chosenBlock.block.slice(1)
  updateCoefficientTable();
}


function updateZoomedInCanvas(x, y) {
  let ctx = selectedBlockCanvas.getContext('2d');
  const sx = x; const sy = y;
  const sWidth = 8; const sHeight = 8;
  const dx = 0; const dy = 0;
  const dWidth = sWidth; const dHeight = sHeight;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(canvas, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);

  // Draw a red square around chosen block in original canvas
  ctx = canvas.getContext('2d');  
  ctx.strokeStyle = 'rgb(255, 0, 0)'
  ctx.lineWidth = 1;
  const p = 1;//padding
  ctx.strokeRect(sx - p, sy - p, sWidth + p, sHeight + p);
}

function updateCoefficientTable() {
  // Draw all non-zero indices in descending order
  let indicesToDraw = [];
  for (let i = chosenBlock.sortedIndices.length - 1; i >= 0; i--) {
    const index = chosenBlock.sortedIndices[i];
    if (chosenBlock.acValues[index] != 0) {
      indicesToDraw.push(index)
    }
    
  }
  drawDCTCoefficients(indicesToDraw);
}

function drawDCTCoefficients(indices) {
  // Given an array of indices, draw those coefficients
  // in order in the grid canvas
  const padding = 2;
  const spacing = (8+padding)
  dctGridCanvas.width = 8 * spacing + 20;
  dctGridCanvas.height = dctGridCanvas.width;

  const ctx = dctGridCanvas.getContext('2d');
  ctx.clearRect(0, 0, dctGridCanvas.width, dctGridCanvas.height);

  function draw(index, x, y) {
    const sx = (index % 8) * 8; 
    const sy = Math.floor(index / 8) * 8;
    const sWidth = 8; const sHeight = 8;

    const dx = x; const dy = y;
    const dWidth = sWidth; const dHeight = sHeight;
    ctx.drawImage(dctSourceCanvas, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
  }

  for (let i = 0; i < indices.length; i++) {
    const x = (i % 8) * spacing + padding;
    const y = Math.floor(i / 8) * spacing;
    draw(indices[i] + 1, x, y)
  }

}