onmessage = function(e) {
    draw(e.data.coords.x, e.data.coords.y, e.data.coords.z, e.data.imageData.data)
    
    postMessage({id:e.data.id, imageData: e.data.imageData});
}

var tileSize = 256
var minX = -2
var maxX = 2
var minY = -2
var maxY = 2

function draw(x,y,z, data){
        
    var numberOfTiles = Math.pow(2,z)
    var x1 = (maxX - minX) * (x - (numberOfTiles / 2)) / numberOfTiles;
    var y1 = (maxY - minY) * (y - (numberOfTiles / 2)) / numberOfTiles;
    var pixelSize = (maxX - minX) / (numberOfTiles * tileSize);

    for (var i = 0; i < data.length; i += 4) {
        var p = i / 4;
        var dx = p % tileSize;
        var dy = (p - dx) / tileSize;

        var tx = x1 + (dx * pixelSize);
        var ty = y1 + (dy * pixelSize);

        value = getColour(tx, ty);

        if (value >= 0) {
            var sinVal = Math.floor(255 * Math.sin(value * Math.PI/255))
            data[i]     = sinVal;     // red
            data[i + 1] = value; // green
            data[i + 2] = 255 - sinVal; // blue
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
	var zRe = 0;
	var zIm = 0;

	//Variables to store the squares of the real and imaginary part.
	var multZre = 0;
	var multZim = 0;

	//Start iterating the with the complex number to determine it's escape time (mandelValue)
	var mandelValue  = 0;
	while(mandelValue < 255) {
		if (multZre+multZim >= 4) return mandelValue;

		/*The new real part equals re(z)^2 - im(z)^2 + re(c), we store it in a temp variable
		  tempRe because we still need re(z) in the next calculation
		*/
		var tempRe = multZre - multZim + re;

		/*The new imaginary part is equal to 2*re(z)*im(z) + im(c)
		 * Instead of multiplying these by 2 I add re(z) to itself and then multiply by im(z), which
		 * means I just do 1 multiplication instead of 2.
		 */
		zRe += zRe
		zIm = zRe*zIm + im

		zRe = tempRe // We can now put the temp value in its place.

		// Do the squaring now, they will be used in the next calculation.
		multZre = zRe * zRe
		multZim = zIm * zIm

		//Increase the mandelValue by one, because the iteration is now finished.
		mandelValue++
	}
	return -1
}