export function drawDecodedImage(decodedImage, canvas) {
	canvas.width = decodedImage.width;
  canvas.height = decodedImage.height;
  const ctx = canvas.getContext('2d');
  const imageData = new ImageData(
      new Uint8ClampedArray(decodedImage.data), 
      decodedImage.width, 
      decodedImage.height);
  ctx.putImageData(imageData, 0, 0);
}

/*
 * Updates image data from the DCT Values. 
*/
export function regenerateFromeDCT(decodedImage) {
	decodedImage._decoder.components = [];
	const frame = decodedImage._decoder.frames[0];
  for (let i = 0; i < frame.componentsOrder.length; i++) {
    const component = frame.components[frame.componentsOrder[i]];
    decodedImage._decoder.components.push({
      lines: decodedImage._decoder.buildComponentData(frame, component),
      scaleX: component.h / frame.maxH,
      scaleY: component.v / frame.maxV
    });
  }
  decodedImage._decoder.copyToImageData({
    width: decodedImage.width,
    height: decodedImage.height,
    data: decodedImage.data
  });
}

/*
 * Returns a DCT block (64 values) closest to the pixel clicked on
*/
export function getDCTBlockFromClick(event, decodedImage, canvas) {
	const rect = event.target.getBoundingClientRect();
  let x = event.clientX - rect.left; //x position within the element.
  let y = event.clientY - rect.top;  //y position within the element.

  // Need to know which component, to get the scale.
  let componentData = decodedImage._decoder.frames[0].components[1];// Hardcoded to 'Y';
  let scale = 1;

  // Then divide x and y by 8
  x /= 8; y/= 8;
  x /= scale; y/= scale;
  let cssScaleX = canvas.width / canvas.offsetWidth;
  let cssScaleY = canvas.height / canvas.offsetHeight;
  x *= cssScaleX;
  y *= cssScaleY;

  x = Math.floor(x);
  y = Math.floor(y);

  let block = []

  try {
  	block = decodedImage._decoder.frames[0].components[1].blocks[y][x];
  } catch(e) {
  	console.log(e);
  }

  return {
  	block, x, y
  }
}

/*
 * Returns an array of all DCT values in the image
*/
export function getAllDCTValues(decodedImage) {
	const blocks = decodedImage._decoder.frames[0].components[1].blocks;
	const dctValues = [];
	for (let i = 0; i < blocks.length; i++) {
		for (let j = 0; j < blocks[i].length; j++) {
		  for (let k = 0; k < blocks[i][j].length; k++) {
		    dctValues.push(blocks[i][j][k])
		  }
		}
	}

	return dctValues;
}

export function resetAllDCTValues(decodedImage, originalDCTValues) {
	const blocks = decodedImage._decoder.frames[0].components[1].blocks;
	let c = 0;
	for (let i = 0; i < blocks.length; i++) {
		for (let j = 0; j < blocks[i].length; j++) {
		  for (let k = 0; k < blocks[i][j].length; k++) {
		    blocks[i][j][k] = originalDCTValues[c];
		    c++;
		  }
		}
	}
}

export function formatDCTBlockText(block) {
		// Split into 8 values per line
    let lines = [];
    let totalVal = ''
    let count = 0;
    for (let i = 0; i < 8; i++) {
      let line = []
      for (let j = 0; j < 8; j++) {
        line.push(block[count])
        count++
      }
      lines.push(line)

      totalVal += line.join(' ') + '\n'
    }
    return totalVal	
}

// https://stackoverflow.com/a/3730579
function sortWithIndeces(toSort) {
  for (var i = 0; i < toSort.length; i++) {
    toSort[i] = [toSort[i], i];
  }
  toSort.sort(function(left, right) {
    return Math.abs(left[0]) < Math.abs(right[0]) ? -1 : 1;
  });
  toSort.sortIndices = [];
  for (var j = 0; j < toSort.length; j++) {
    toSort.sortIndices.push(toSort[j][1]);
    toSort[j] = toSort[j][0];
  }
  return toSort;
}

export function getSortedDCTIndices(block) {
		return sortWithIndeces(Array.from(block)).sortIndices;
}

import dctBaseURL from '../static/dct_base.jpeg?url';
export async function generateDCTCoefficientCanvas() {
	// Fetch 64 by 64
	// Override all its DCT's 1 by 1
	// Draw it to a hidden canvas
	// Use that to draw pieces from it as needed
	const response = await fetch(dctBaseURL);
  const buffer = await response.arrayBuffer();
  const decodedImage = jpeg.decode(buffer, { useTArray:true });

  const blocks = decodedImage._decoder.frames[0].components[1].blocks;
  const allBlocks = [];
  for (let i = 0; i < blocks.length; i++) {
    for (let j = 0; j < blocks[i].length; j++) {
    	allBlocks.push(blocks[i][j]);
    }
  }

  for (let i = 0; i < allBlocks.length; i++) {
  	const block = allBlocks[i];
  	for (let j = 0; j < block.length; j++) {
  		if (j == i) {
  			block[j] = 200;
  		} else {
  			block[j] = 0;
  		}
  	}
  }

  regenerateFromeDCT(decodedImage);

  const hiddenCanvas = document.createElement("canvas")
  hiddenCanvas.style.imageRendering = 'pixelated'
  //document.body.appendChild(hiddenCanvas)
  drawDecodedImage(decodedImage, hiddenCanvas);

  return hiddenCanvas
}
