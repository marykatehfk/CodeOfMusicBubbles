"use strict";

document.addEventListener("DOMContentLoaded", init);

var force;
var manybodyforce;
var soundeffects = {};
function init() {
    // initialized the force simulation
    var nodes = []
    for (let i = 0; i < 200; i++) {
    	nodes.push({type:"b", radius: randrange(3, 10), bounce:false})
    }
    for (let i = 0; i < 100; i++) {
    	nodes.push({type:"b", radius: randrange(5, 20), bounce:false})
    }
    for (let i = 0; i < 20; i++) {
    	nodes.push({type:"b", radius: randrange(10, 25), bounce:false})
    }
    nodes = shuffle(nodes)
    var wordnodes = []
    wordnodes.push({x:0, y:0, type:"w", radius: 35, text:"teapot", _id:"teapot", bounce:false});
    wordnodes.push({type:"w", radius: 35, text:"pure", _id:"pure", bounce:false});
    wordnodes.push({type:"w", radius: 35, text:"dog", _id:"dog", bounce:false});
    wordnodes.push({type:"w", radius: 35, text:"closure", _id:"closure", bounce:false});
    for (let i = 0; i < wordnodes.length; i++) {
    	let width = getTextWidth(wordnodes[i].text, "30px Cormorant Garamond") / 2 + 1;
    	wordnodes[i].radius =  width;
    	wordnodes[i].offset = -width;
    	nodes.push(wordnodes[i])
    }



    manybodyforce = d3.forceManyBody().strength(function(d,i){
    			  	return 0;
    			  });

    force = d3.forceSimulation(nodes)
    			  .force("gravity", d3.forceManyBody().strength(0.5))
    			  .force("charge", manybodyforce)
    			  .force("collide", d3.forceCollide()
    			  				      .radius(function(d) { 
					    			  	return d.radius + 0.5; 
					    			  })
					    			  .iterations(4))
    			  .force("boundingX", d3.forceX().strength(0.01))
    			  .force("boundingY", d3.forceY().strength(0.01))
    			  .on("tick", function(){doTick(nodes);})
    			  // .alphaMin(0)
    			  .alphaDecay(0.01)
    			  // .alpha(0.6)
    			  .restart();

    var color = d3.scaleOrdinal(d3.schemeCategory10);
	d3.select("svg")
	  .append("g")
	    .attr("transform", "translate(400, 400)")
	  .selectAll("circle").data(nodes).enter()
	  	.append("g")
	  	.classed("bubble", true)
	  	.each(function(d,i){
	  		let selection = d3.select(this);
	  		selection.attr("transform", "translate(" + d.x + "," + d.y + ")");
	        selection.append("circle")
	        		 .classed("bubblecircle", "true")
			         .attr("cx", 0)
			         .attr("cy", 0)
			         .attr("r",  d.radius)
			         .style("fill", rgbaFromHex(color(i%4), 0.7));
	        if (d.type == "w") {
	        	selection.select("circle")
	        			 .style("fill", rgbaFromHex(color(i%4+4), 0.2))
	        			 .style("stroke", "rgba(0,0,0,0.1)");

	        	selection.append("text")
					     .classed("wordshadow", true)
					     .classed("bubbletext", true)
					     .attr("id", d._id + "_shadow")
					     .attr("x", d.offset)
					     .attr("y", 35/4)
					     .attr("transform", "skewX(0) translate(0)")
					     .text(d.text);

	        	selection.append("text")
					     .classed("word", true)
					     .classed("bubbletext", true)
					     .attr("id", d._id)
					     .attr("x", d.offset)
					     .attr("y", 35/4)
					     .attr("transform", "skewX(0) translate(0)")
					     .text(d.text)
					     .on("mouseover", mouseover)
					     .on("click", doBounce);
	        }
	  	})
	
	// Load sound effects.
	d3.json("sounds.json", function(e, d){
		for (let i = 0; i < d.length; i++) {
			let sound = d[i];
			let soundname = sound.name;
			let effectname = sound.effect;
			let config = sound.config;
			let filename = "resources/" + sound.filename;
			let player = new Tone.Player(filename);
			let effect;
			// bitcrusher is a special snowflake and doesn't have optional variables
			if (effectname == "BitCrusher") {
				effect = new Tone.BitCrusher(config.bits);
			}
			else {
				effect = new Tone[effectname]();
				for (let key in config) {
					if (typeof(effect[key]) != "object") {
						effect[key] = config[key]
					}
					else {
						effect[key].value = config[key];
					}
				}
			}
			
			player.connect(effect);
			effect.toMaster();
			soundeffects[soundname + "_mod"] = player;
			let player2 = new Tone.Player(filename);
			soundeffects[soundname] = player2;
		}
	});

	var synth = new Tone.SimpleSynth(
		 {"oscillator":{
		 "type":"triangle"
		 },
		 "envelope":{
		 "attack": 0.001,
		       "decay": 0.001,
		       "sustain": 0.5,
		       "release": 0.001
		 }
	});

	synth.toMaster();
	 
	  
	  var pattern = new Tone.Pattern(function(time, note){
	      synth.triggerAttackRelease(note, 0.50);
	  }, ["E3", "A3", "C4", "E4", "A4", "E4", "C4", "A3"]);
	  
	  pattern.start(0);
	  Tone.Transport.bpm.value = 200;
	  Tone.Transport.start();


	  var kitPart = new Tone.Part(function(time, value){
	  	soundeffects[value].start(time);
	   
	    },  [
	          ["0:0:2", "babycry"],
	          //["0:0:10", "dog"],
	          ["0:2:3", "escalator"],
	          
	          
	          ["0:4:0", "babycry"],
	          ["0:5:3", "babycry"],
	          ["5:0:0", "babycry"],
	          ["5:0:", "tingting"],
	          ["5:0:2", "tingting"],
	          ["5:1:2", "tingting"],
	         
	          ["7:0:3", "dog"],
	          
	          ["9:0:0", "tingting_mod"]
	         
	      
	          
	        ]);
	        
	  kitPart.start(5);
	  //kitPart.loop = true;
	  Tone.Transport.start();  	
}

// Fisher-Yates shuffle
// code from http://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array-in-javascript
function shuffle(array) {
    let counter = array.length;

    // While there are elements in the array
    while (counter > 0) {
        // Pick a random index
        let index = Math.floor(Math.random() * counter);

        // Decrease counter by 1
        counter--;

        // And swap the last element with it
        let temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }

    return array;
}

/**
 * Uses canvas.measureText to compute and return the width of the given text of given font in pixels.
 * 
 * @param {String} text The text to be rendered.
 * @param {String} font The css font descriptor that text is to be rendered with (e.g. "bold 14px verdana").
 * 
 * @see http://stackoverflow.com/questions/118241/calculate-text-width-with-javascript/21015393#21015393
 */
function getTextWidth (text, font) {
	// re-use canvas object for better performance
	var canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
	var context = canvas.getContext("2d");
	context.font = font;
	var metrics = context.measureText(text);
	return metrics.width;
};

function rgbaFromHex(hex, a) {
	let r = parseInt(hex.slice(1, 3), 16)
	let g = parseInt(hex.slice(3, 5), 16)
	let b = parseInt(hex.slice(5, 7), 16)
	return "rgba(" + r + "," + g + "," + b + "," + a + ")"
}

function randrange(a, b) {
	return Math.random() * (b - a) + a;
}

function doTick(nodes) {
	d3.select("svg")
	  .selectAll(".bubble").data(nodes).each(function(d,i){
	  	 var sel = d3.select(this);
	     sel.attr("transform", "translate(" + d.x + "," + d.y + ")")
	  })


	manybodyforce.strength(function(d,i){
		if (d.type == "w") {
			if (d.bounce) return -1000;
			return 0.1;
		}
		return 0;
	});
}

// the stuff that happens when you click
function doBounce(d, i){
	force.alpha(1);
	force.restart();
	d.bounce = true;
	setTimeout(function(){
		d.bounce = false;
	}, 500);

	d3.select("#" + d._id + "_shadow")
	  .transition()
	  .ease(d3.easeExpOut)
	  .duration(1000)
	  .tween("wobble", function(){
	  	var node = this;
	  	return function(t) {
	  		node.setAttribute("transform", transform_a(t, 1.5, 40));
	  	}
	  });
    d3.select("#" + d._id)
	  .transition()
	  .ease(d3.easeExpOut)
	  .duration(1000)
	  .tween("wobble", function(){
	  	var node = this;
	  	return function(t) {
	  		node.setAttribute("transform", transform_a(t, -1.5, 40));
	  	}
	  });
}

function sincurve(x, a) {
	return Math.sin(x * a  * Math.PI);
}

function transform(t, n) {
	return "skewX(" + (n * 0.5 * sincurve(t, 20)) + ") translate(" + (n * sincurve(t, 20)) + ")";
}

function transform_a(t, n, a) {
	return "skewX(" + (n * 0.5 * sincurve(t, a)) + ") translate(" + (n * sincurve(t, a)) + ")";
}

function transform_skewonly(t, n, a) {
	return "skewX(" + (n * 0.5 * sincurve(t, a)) + ")";
}


function mouseover(d) {
	d3.select("#" + d._id)
	  .transition()
	  .ease(d3.easeExpInOut)
	  .duration(1000)
	  .tween("wobble", function(){
	  	var node = this;
	  	return function(t) {
	  		node.setAttribute("transform", transform_a(t, 1, 20));
	  	}
	  });
    d3.select("#" + d._id + "_shadow")
	  .transition()
	  .ease(d3.easeExpInOut)
	  .duration(1000)
	  .tween("wobble", function(){
	  	var node = this;
	  	return function(t) {
	  		node.setAttribute("transform", transform_a(t, -1, 20));
	  	}
	  });
}