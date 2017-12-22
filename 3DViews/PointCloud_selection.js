export function getPointCloudGeometry(view){

	var uniforms = {

		color:     { value: new THREE.Color( 0xffffff ) },
		texture:   { value: new THREE.TextureLoader().load( "textures/sprites/disc.png" ) }

	};

	var shaderMaterial = new THREE.ShaderMaterial( {

		uniforms:       uniforms,
		vertexShader:   document.getElementById( 'vertexshader' ).textContent,
		fragmentShader: document.getElementById( 'fragmentshader' ).textContent,

		blending:       THREE.AdditiveBlending,
		depthTest:      false,
		transparent:    true

	});

	var options = view.options;
	var scene = view.scene;


	var particles = options.pointCloudParticles;
	var num_blocks = view.data.length;
	var points_in_block = new Float32Array(num_blocks);
	var total = 100;
	var count = 0;

	for ( var k = 0; k < num_blocks; k ++) {
		var num_points  = Math.min(Math.floor((view.data[k][options.density] / total) * particles), options.pointCloudMaxPointPerBlock);
		points_in_block[k] = num_points;
		count += num_points;
	}
	console.log("total points in cloud: ", count)

	var geometry = new THREE.BufferGeometry();

	var positions = new Float32Array(count*3);
	var colors = new Float32Array(count *3);
	var sizes = new Float32Array( count);
	var alphas = new Float32Array( count);
	var parentBlock = new Float32Array( count);

	var colorMap = options.colorMap;
	var numberOfColors = 512;

	var lut = new THREE.Lut( colorMap, numberOfColors );
	lut.setMax( options.pointCloudColorSettingMax );
	lut.setMin( options.pointCloudColorSettingMin );
	view.lut = lut;

	var i = 0, i3 = 0;
	var temp_num_points = 0;
	for ( var k = 0; k < num_blocks; k ++) {
		temp_num_points  =  points_in_block[k];
		if (temp_num_points > 0){

			var x_start = view.data[k]['xPlot'];
			var y_start = view.data[k]['yPlot'];
			var z_start = view.data[k]['zPlot'];
			var x_end = x_start + 1;
			var y_end = y_start + 1;
			var z_end = z_start + 1;
			
			for (var j = 0; j < temp_num_points; j ++){

				var x = Math.random()*1  + x_start;
				var y = Math.random()*1  + y_start;
				var z = Math.random()*1  + z_start;
				
				positions[ i3 + 0 ] = x*10;
				positions[ i3 + 1 ] = y*10;
				positions[ i3 + 2 ] = z*10;

				var color = lut.getColor( view.data[k][options.propertyOfInterest] );
				
				colors[ i3 + 0 ] = color.r;
				colors[ i3 + 1 ] = color.g;
				colors[ i3 + 2 ] = color.b;
				
				if (	(x_start >= options.x_low) 	&& (x_end <= options.x_high) 	&&
					(y_start >= options.y_low) 	&& (y_end <= options.y_high)	&&
					(z_start >= options.z_low) 	&& (z_end <= options.z_high)	&& view.data[k].selected)
					{
						alphas[ i ] = options.pointCloudAlpha;
						if (options.animate) {sizes[ i ] = Math.random() *(options.pointCloudSize-0.5) + 0.5;}
						else { sizes[ i ] = options.pointCloudSize; }
						
					}
				else {
					alphas[ i ] = 0;
					sizes[ i ] = 0;
				}

				parentBlock[i] = k;

				
				i++;
				i3+=3;
			}
		}			
	}
		


	geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
	geometry.addAttribute( 'customColor', new THREE.BufferAttribute( colors, 3 ) );
	geometry.addAttribute( 'size', new THREE.BufferAttribute( sizes, 1 ) );
	geometry.addAttribute( 'alpha', new THREE.BufferAttribute( alphas, 1 ) );
	geometry.parentBlockMap = parentBlock;

	var System = new THREE.Points( geometry, shaderMaterial );
	view.System = System;
	scene.add( System );

}




export function updatePointCloudGeometry(view){

	var options = view.options;
	var positionArray = view.System.geometry.attributes.position.array;
	var parentBlock = view.System.geometry.parentBlockMap;


	var particles = options.pointCloudParticles;
	var num_blocks = view.data.length;
	var points_in_block = new Float32Array(num_blocks);
	var count = view.System.geometry.attributes.size.array.length;


	var colors = new Float32Array(count *3);
	var sizes = new Float32Array( count);
	var alphas = new Float32Array( count);

	var colorMap = options.colorMap;
	var numberOfColors = 512;

	var lut = new THREE.Lut( colorMap, numberOfColors );
	lut.setMax( options.pointCloudColorSettingMax );
	lut.setMin( options.pointCloudColorSettingMin );
	view.lut = lut;

	for (var i = 0, i3 = 0; i < count; i++){
		var x = positionArray[ i3 + 0 ]/10;
		var y = positionArray[ i3 + 1 ]/10;
		var z = positionArray[ i3 + 2 ]/10;
		var k = parentBlock[i];

		var color = lut.getColor( view.data[k][options.propertyOfInterest] );
				
		colors[ i3 + 0 ] = color.r;
		colors[ i3 + 1 ] = color.g;
		colors[ i3 + 2 ] = color.b;
		
		if (	(x >= options.x_low) 	&& (x <= options.x_high) 	&&
				(y >= options.y_low) 	&& (y <= options.y_high)	&&
				(z >= options.z_low) 	&& (z <= options.z_high)	&& 	view.data[k].selected)
		{
			alphas[ i ] = options.pointCloudAlpha;
			if (options.animate) {sizes[ i ] = Math.random() *(options.pointCloudSize-0.5) + 0.5;}
			else { sizes[ i ] = options.pointCloudSize; }
		}
		else {
			alphas[ i ] = 0;
			sizes[ i ] = 0;
		}
		i3 += 3;

	}

	view.System.geometry.addAttribute( 'customColor', new THREE.BufferAttribute( colors, 3 ) );
	view.System.geometry.addAttribute( 'size', new THREE.BufferAttribute( sizes, 1 ) );
	view.System.geometry.addAttribute( 'alpha', new THREE.BufferAttribute( alphas, 1 ) );
}



export function animatePointCloudGeometry(view){
	//console.log('updated')

	var options = view.options;
	var positionArray = view.System.geometry.attributes.position.array;
	var sizeArray = view.System.geometry.attributes.size.array;
	var parentBlock = view.System.geometry.parentBlockMap;


	var particles = options.pointCloudParticles;
	var num_blocks = view.data.length;
	var points_in_block = new Float32Array(num_blocks);
	var count = view.System.geometry.attributes.size.array.length;


	//var colors = new Float32Array(count *3);
	var sizes = new Float32Array( count);
	//var alphas = new Float32Array( count);

	//var colorMap = options.colorMap;
	//var numberOfColors = 512;

	//var lut = new THREE.Lut( colorMap, numberOfColors );
	//lut.setMax( options.pointCloudColorSettingMax );
	//lut.setMin( options.pointCloudColorSettingMin );
	//view.lut = lut;

	for (var i = 0, i3 = 0; i < count; i++){
		var x = positionArray[ i3 + 0 ]/10;
		var y = positionArray[ i3 + 1 ]/10;
		var z = positionArray[ i3 + 2 ]/10;
		var k = parentBlock[i];

		/*var color = lut.getColor( view.data[k][options.propertyOfInterest] );
				
		colors[ i3 + 0 ] = color.r;
		colors[ i3 + 1 ] = color.g;
		colors[ i3 + 2 ] = color.b;*/
		
		if (	(x >= options.x_low) 	&& (x <= options.x_high) 	&&
				(y >= options.y_low) 	&& (y <= options.y_high)	&&
				(z >= options.z_low) 	&& (z <= options.z_high)	&& 	view.data[k].selected)
		{
			//alphas[ i ] = options.pointCloudAlpha;
			var temp = sizeArray[i]-0.1;
			//console.log(temp)
			//sizeArray[i] = Math.random() *(options.pointCloudSize-0.5) + 0.5;
			if (temp >= 0.5) {sizeArray[i] = temp;}
			else {sizeArray[i] = options.pointCloudSize;}
			//sizes[ i ] = sizeArray[i]*0.95;
		}
		else {
			//alphas[ i ] = 0;
			sizes[ i ] = 0;
		}
		i3 += 3;

	}

	//view.System.geometry.addAttribute( 'customColor', new THREE.BufferAttribute( colors, 3 ) );
	//view.System.geometry.addAttribute( 'size', new THREE.BufferAttribute( sizes, 1 ) );
	//view.System.geometry.addAttribute( 'alpha', new THREE.BufferAttribute( alphas, 1 ) );
}




export function changePointCloudGeometry(view){
	view.scene.remove(view.System);
	getPointCloudGeometry(view);
}