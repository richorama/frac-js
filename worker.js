onmessage = function(e) {
    draw(e.data.coords.x, e.data.coords.y, e.data.coords.z, e.data.imageData.data)
    
    postMessage({id:e.data.id, imageData: e.data.imageData});
}

const tileSize = 256
const minX = -2
const maxX = 2
const minY = -2
const maxY = 2

function draw(x,y,z, data){
        
    const numberOfTiles = Math.pow(2,z)
    const x1 = (maxX - minX) * (x - (numberOfTiles / 2)) / numberOfTiles;
    const y1 = (maxY - minY) * (y - (numberOfTiles / 2)) / numberOfTiles;
    const pixelSize = (maxX - minX) / (numberOfTiles * tileSize);

    for (let i = 0; i < data.length; i += 4) {
        const p = i / 4;
        const dx = p % tileSize;
        const dy = (p - dx) / tileSize;

        value = getColour(x1 + (dx * pixelSize), y1 + (dy * pixelSize));

        if (value >= 0) {
			const rgb = hslToRgb(value / 255, 0.5, 0.5);
            data[i]     = rgb[0];     // red
            data[i + 1] = rgb[1]; // green
            data[i + 2] = rgb[2]; // blue
            data[i + 3] = 255; // alpha
        } else {
            //data[i]     = 0;     // red
            //data[i + 1] = 0; // green
            //data[i + 2] = 0; // blue
            data[i + 3] = 255; // alpha
        }
    }
}

function getColour(re, im) {
	let zRe = 0;
	let zIm = 0;

	//Variables to store the squares of the real and imaginary part.
	let multZre = 0;
	let multZim = 0;

	//Start iterating the with the complex number to determine it's escape time (mandelValue)
	let mandelValue  = 0;
	while (mandelValue < 255) {
		if (multZre + multZim >= 4) return mandelValue;

		/*The new real part equals re(z)^2 - im(z)^2 + re(c), we store it in a temp variable
		  tempRe because we still need re(z) in the next calculation
		*/

		/*The new imaginary part is equal to 2*re(z)*im(z) + im(c)
		 * Instead of multiplying these by 2 I add re(z) to itself and then multiply by im(z), which
		 * means I just do 1 multiplication instead of 2.
		 */
		zRe += zRe
		zIm = zRe*zIm + im

		zRe = multZre - multZim + re // We can now put the temp value in its place.

		// Do the squaring now, they will be used in the next calculation.
		multZre = zRe * zRe
		multZim = zIm * zIm

		//Increase the mandelValue by one, because the iteration is now finished.
		mandelValue++
	}
	return -1
}

function hslToRgb(h, s, l) {
	var r, g, b;
  
	if (s == 0) {
	  r = g = b = l; // achromatic
	} else {
	  function hue2rgb(p, q, t) {
		if (t < 0) t += 1;
		if (t > 1) t -= 1;
		if (t < 1/6) return p + (q - p) * 6 * t;
		if (t < 1/2) return q;
		if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
		return p;
	  }
  
	  var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
	  var p = 2 * l - q;
  
	  r = hue2rgb(p, q, h + 1/3);
	  g = hue2rgb(p, q, h);
	  b = hue2rgb(p, q, h - 1/3);
	}
  
	return [ r * 255, g * 255, b * 255 ];
  }
  