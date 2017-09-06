var username = '';
var playing = false;
var chrono = 0;
var acertadas = 0;
var falladas = 0;
var walloffame = [];
var chronoId = 0;
var questions = [];

// querySelector, jQuery style: $('.className');
var $ = function (selector) {
	return document.querySelector(selector);
};

String.prototype.toCapitalLetter = function() {
	return this.charAt(0).toUpperCase() + this.slice(1).toLowerCase();
}

window.onload = function() {
	$('#username').addEventListener('keyup', event => {
		if (event.keyCode !== 13) return;
		$('#vamos').click();
		event.preventDefault();
	});

	if (typeof(Storage) !== "undefined") {
		if (localStorage['mtz.pasatarjeta.walloffame']) {
			walloffame = JSON.parse(localStorage['mtz.pasatarjeta.walloffame']);
			console.log('>> Número de jugadores: %d', walloffame.length);
			buildWall();
		}
		else {
			console.log('>> Primera vez q se ejecuta el juego.')
		}
	}

	loadJSON(function(response) {
		questions = JSON.parse(response);
		if (questions.hasOwnProperty('error')) {
			var head = document.getElementsByTagName('head')[0];
			var js = document.createElement("script");
			js.type = "text/javascript";
			js.src = "json/questions.js";
			head.appendChild(js);
		}
		console.log('>> Cargado el fichero Json con las preguntas (%d).', questions.length);
	}, 'json/questions.json');
}

window.onbeforeunload = function() { return saveWall(false); }

function loadJSON(callback, file) {   
	var xobj = new XMLHttpRequest();
	xobj.overrideMimeType("application/json");
	xobj.open('GET', file, true);
	xobj.onreadystatechange = function () {
		if (xobj.readyState == 4) {
			if (xobj.status == '200') {
				callback(xobj.responseText);
			}
			else if (xobj.status == '0') callback('{ "error" : ' + xobj.status + ' }');
		}
	};
	xobj.send(null);  
 }

function beep() {
    var snd = new Audio("data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=");  
    snd.play();
}

function countdown(minutes) {
	var time = minutes * 60;
	var chrono = $('#crono');
	var tmp = time;
	setInterval(function() {
		var c = tmp--, m = (c / 60) >> 0, s = (c - m * 60) + '';
		chrono.textContent = (m.length > 1 ? '' : '0') + m + ':' + (s.length > 1 ? '' : '0') + s;
		tmp != 0 || (tmp = time);
	}, 1000);
}

function chronometer(start) {
	var last_minute = 0;
	var chronos = $('#crono');
	chronoId = setInterval(function() {
		end = new Date();
		var diff = end - start;
		chrono = Math.round(diff / 1000);
		diff = new Date(diff);
		var sec = diff.getSeconds();
		var min = diff.getMinutes();
		if (last_minute !== min) { beep(); last_minute = min; }
		var hr = diff.getHours() - 1;
		/*chrono += 1;
		var hr   = Math.floor(chrono / 3600);
    	var min = Math.floor((chrono - (hr * 3600)) / 60);
    	var sec = chrono - (hr * 3600) - (min * 60);*/
		if (min < 10) { min = '0' + min };
		if (sec < 10) { sec = '0' + sec };
		chronos.textContent = hr + ':' + min + ':' + sec;
	}, 1000);
}

function showUserDiv() {
	$('#empezar').classList.toggle('hideme');
	$('#user').classList.toggle('hideme');
}

function getUserName() {
	username = $('#username').value;
	username = username.toCapitalLetter();
	if (username) {
		$('#bienvenido').innerHTML = '<h1>Hola ' + username + ', mucha suerte!</h1>'
		$('#intro').classList.toggle('hideme');
		$('#bienvenido').classList.toggle('hideme');
		setTimeout(function() {
			$('#bienvenido').classList.toggle('hideme');
			startGame();
		}, 1200);
		/*
		walloffame.push( { user: username, elapsed: 0, right: 0, failed: 0, date: new Date() } );
		localStorage['mtz.pasatarjeta.walloffame'] = JSON.stringify(walloffame);
		*/
	}
}

function flipCard(card) {
	card.classList.toggle('hover');
	if (!playing && card.id !== 'resultados') {
		var start = new Date();
		chronometer(start);
	}
	if (card.id !== 'resultados') { 
		$('#resultados').classList.remove('hover');
		$('#' + card.id.slice(-1)).focus();
		playing = true;
	}
}

function clearWall() {
	var cabecera = $('#cabecera').cloneNode(true);
	$('#muro').innerHTML = '';
	$('#muro').appendChild(cabecera);
}

function buildWall() {
	if (walloffame.length > 0) {
		clearWall();
		var row = '<div class="trow">fila</div>';
		var c1 = '<div class="tcell">usuario</div>';
		var c2 = '<div class="tcell">acertadas</div>';
		var c3 = '<div class="tcell">falladas</div>';
		var c4 = '<div class="tcell">tiempo</div>';
		var wallsize = walloffame.length > 10 ? 10 : walloffame.length;
		var miniwall = walloffame.sort(function(a, b) { return parseInt(b.right) - parseInt(a.right); }).slice(0, wallsize);
		var muro = $('#muro');
		miniwall.forEach(item => {					
			var cols = c1.replace(new RegExp('usuario', 'gi'), item.user);
			cols += c2.replace(new RegExp('acertadas', 'gi'), item.right);
			cols += c3.replace(new RegExp('falladas', 'gi'), item.failed);
			cols += c4.replace(new RegExp('tiempo', 'gi'), item.elapsed);
			muro.innerHTML += row.replace(new RegExp('fila', 'gi'), cols);
		});
	}
}

function saveWall(rebuildWall) {
	if (chrono > 0 && acertadas + falladas === questions.length) {
		if (walloffame.length > 0 && walloffame[walloffame.length - 1].user === username) {
			walloffame[walloffame.length - 1].elapsed = chrono;
			walloffame[walloffame.length - 1].right = acertadas;
			walloffame[walloffame.length - 1].failed = falladas;
		}
		else walloffame.push( { user: username, elapsed: chrono, right: acertadas, failed: falladas, date: new Date() } );
		localStorage['mtz.pasatarjeta.walloffame'] = JSON.stringify(walloffame);
	}
	if (rebuildWall) buildWall();;
	//return "Estas seguro que quieres cerrar la ventana?";
	return null;
}

function resetWall(e) {
	e = window.event || e;
	if (e.target === e.currentTarget) {
		e.stopPropagation();
		while (walloffame.length > 0) {
    		walloffame.pop();
		}
		localStorage['mtz.pasatarjeta.walloffame'] = '';
		//$('#muro').innerHTML = '<div class="trow"><div class="thead orangine">nombre</div><div class="thead orangine">&nbsp;+&nbsp;</div><div class="thead orangine">&nbsp;-&nbsp;</div><div class="thead orangine">&nbsp;t (s)&nbsp;</div></div>';
		clearWall();
	}
}

function clickStop(e) {
	e = window.event || e;
	if (e.target === e.currentTarget) {
		e.stopPropagation();
	}
}

function newGame() {
	$('#pasapalabra').classList.toggle('hideme');

	console.log('>> Nueva partida.')
	$('#username').value = '';
	$('#username').focus();
	$('#username').select();

	$('#intro').classList.toggle('hideme');
	$('#user').classList.remove('hideme');

	playing = false;
	saveWall(true);
	clearInterval(chronoId);
	chrono = 0; acertadas = 0; falladas = 0;
	$('#crono').textContent = '0:00:00';
	$('#acertadas').textContent = '00';
	$('#falladas').textContent = '00';
	$('#resultados').classList.remove('hover');

	var results = $('#resultados').cloneNode(true);
	$('#cards').innerHTML = '';
	$('#cards').appendChild(results);
}

function getObjectIdx(arr, key, val) {
	return arr.findIndex(
		function(item){ return item[key] == val }
	);
}

function checkResponse(e) {
	if (e.keyCode == 13) {
		console.log('>> ' + e.target.id + ' : ' + e.target.value);
		var idx = getObjectIdx(questions, 'letter', e.target.id)
		if (e.target.value.toLowerCase() === questions[idx].answer.toLowerCase()) {
			$('#card-' + e.target.id + ' .flipper .back').classList.add('right');
			console.log('>> Correcto.');
			acertadas += 1;
		}
		else {
			$('#card-' + e.target.id + ' .flipper .back').classList.add('failed');
			console.log('>> Incorrecto: ' + questions[idx].answer.toCapitalLetter());
			falladas += 1;
		}
		$('#resp-' + e.target.id).innerHTML = '<p class="resp centerme fitme-20">' + questions[idx].answer.toCapitalLetter() + '</p>'
		$('#acertadas').textContent = acertadas;
		$('#falladas').textContent = falladas;
		if (acertadas + falladas === questions.length) {
			clearInterval(chronoId);
			saveWall(true);
		}
	}
}

function startGame() {
	var letras = 'abcdefghijklmnopqrstuvwxyz';
	$('#jugador').innerHTML = '<i class="orangine noitalic">&raquo;</i>&nbsp;Hola&nbsp;' + username;
	var tarjetas = $('#cards');
	//letras.split('').forEach((letra, index) => {
	questions.forEach((q, index) => {
		var tipo = 'aeiou'.indexOf(q.letter) === -1 ? 'suitconsonants' : 'suitvocals' ;
		var tarjeta = '<div id="card-letra" class="flip-container" onclick="flipCard(this)"><div class="flipper"><div class="front tipo"><p>letra</p></div><div class="back">reverso</div></div></div>';
		tarjeta = tarjeta.replace(new RegExp('tipo', 'gi'), tipo);
		
		var reverso = '<div class="reverse"><p class="orangine centerme">letra</p><span class="grey">pregunta</span>respuesta</div>';
		reverso = reverso.replace(new RegExp('letra', 'gi'), 'con la ' + q.letter.toUpperCase());
		reverso = reverso.replace(new RegExp('pregunta', 'gi'), q.question);

		var respuesta = '<div id="resp-letra" class="downme"><input type="text" class="fitme-42" id="letra" onclick="clickStop()" onkeyup="checkResponse.apply(this, arguments)"></div>'
		reverso = reverso.replace(new RegExp('respuesta', 'gi'), respuesta);

		tarjeta = tarjeta.replace(new RegExp('reverso', 'gi'), reverso);
		tarjeta = tarjeta.replace(new RegExp('letra', 'gi'), q.letter);

		tarjetas.innerHTML += tarjeta;
	});
	$('#pasapalabra').classList.toggle('hideme');
}
