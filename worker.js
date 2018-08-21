onmessage = function(e) {
    var imageData = draw(e.data.coords.x, e.data.coords.y, e.data.coords.z, e.data.type);
    
    postMessage({id:e.data.id, imageData: imageData});
}

const settings = {
	tileSize : 256,
	iterations : 1024,
	colourDepth : 256,
	minX : -2,
	maxX : 2,
	minY : -2,
	maxY : 2,
	stride : 4,
	CR: -.8,
	CI: .156,
}

function draw(x, y, z, type){
	const imageData = new ImageData(settings.tileSize, settings.tileSize);
    const numberOfTiles = Math.pow(2,z)
    const x1 = (settings.maxX - settings.minX) * (x - (numberOfTiles / 2)) / numberOfTiles;
    const y1 = (settings.maxY - settings.minY) * (y - (numberOfTiles / 2)) / numberOfTiles;
	const pixelSize = (settings.maxX - settings.minX) / (numberOfTiles * settings.tileSize);
	const renderingFunction = renderingFunctions[type || 'mandlebrot'];

    for (let i = 0; i < imageData.data.length; i += settings.stride) {
        const p = i / settings.stride;
        const dx = p % settings.tileSize;
        const dy = (p - dx) / settings.tileSize;

		const value = renderingFunction(x1 + (dx * pixelSize), y1 + (dy * pixelSize));
		
		if (value >= 0) {
			const rgb = hslToRgb((value / settings.colourDepth) % 1, 0.5, 0.5);
            imageData.data[i]     = rgb[0]; // red
            imageData.data[i + 1] = rgb[1]; // green
            imageData.data[i + 2] = rgb[2]; // blue
            imageData.data[i + 3] = 255;    // alpha
        } else {
            imageData.data[i + 3] = 255;    // alpha
        }
	}
	
	return imageData;
}

const renderingFunctions = {};
renderingFunctions.julia = (real,imag) => {
	let zr = real;
	let zi = imag;
	let iterations = 0;

	while (iterations < settings.iterations) {
		const zr_next = zr * zr - zi * zi + settings.CR;
		const zi_next = 2 * zi * zr + settings.CI;
		zr = zr_next;
		zi = zi_next;
		if ( zr > 4 ) return iterations;
		if ( zi > 4 ) return iterations;
		iterations++;
	}
	return -1
}

renderingFunctions.mandlebrot = (real, imag) => {
	let zRe = 0;
	let zIm = 0;

	//Variables to store the squares of the real and imaginary part.
	let multZre = 0;
	let multZim = 0;

	//Start iterating the with the complex number to determine it's escape time (mandelValue)
	let mandelValue  = 0;
	while (mandelValue < settings.iterations) {
		if (multZre + multZim >= 4) return mandelValue;

		/*The new real part equals re(z)^2 - im(z)^2 + re(c), we store it in a temp variable
		  tempRe because we still need re(z) in the next calculation
		*/

		/*The new imaginary part is equal to 2*re(z)*im(z) + im(c)
		 * Instead of multiplying these by 2 I add re(z) to itself and then multiply by im(z), which
		 * means I just do 1 multiplication instead of 2.
		 */
		zRe += zRe
		zIm = zRe*zIm + imag

		zRe = multZre - multZim + real // We can now put the temp value in its place.

		// Do the squaring now, they will be used in the next calculation.
		multZre = zRe * zRe
		multZim = zIm * zIm

		//Increase the mandelValue by one, because the iteration is now finished.
		mandelValue++
	}
	return -1
}


function hue2rgb(p, q, t) {
	if (t < 0) t++;
	if (t > 1) t--;
	if (t < 1/6) return p + (q - p) * 6 * t;
	if (t < 1/2) return q;
	if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
	return p;
}

function hslToRgb(h, s, l) {
	let r, g, b;
  
	if (s == 0) {
		r = g = b = l; // achromatic
	} else {

		const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
		const p = 2 * l - q;

		r = hue2rgb(p, q, h + 1/3);
		g = hue2rgb(p, q, h);
	  b = hue2rgb(p, q, h - 1/3);
	}
  
	return [ r * 255, g * 255, b * 255 ];
  }
  