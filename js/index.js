$(document).ready(async function() {

    $('#verde').css('pointer-events','none');   // por defecto, anulados
    $('#rojo').css('pointer-events','none');
    $('#amarillo').css('pointer-events','none');
    $('#azul').css('pointer-events','none');

    $('#pTimer').css('visibility','hidden');

    // variables para el proceso de juego
    let secuenciaJuego = [];    
    let elementoPulsado = null;
    let juegoRunning = false;
    let timer1;
    let tramo1;
    let score = 0;
    let maxScore;

    // tiempos de alumbrado
    const tiempalumbrFacil = 1000;
    const tiempalumbrNormal = 500;
    const tiempalumbrDificil = 250;

    const retraencenFacil = 250;
    const retraencenNormal = 175;
    const retraencenDificil = 125;

    // carga dinamica de tiempos en select
    var options = `<option value="facil" data-tiempalumbr="${tiempalumbrFacil}" data-retraencen="${retraencenFacil}">Facil</option>` +
                   `<option value="normal" data-tiempalumbr="${tiempalumbrNormal}" data-retraencen="${retraencenNormal}" selected>Normal</option>` +
                   `<option value="dificil" data-tiempalumbr="${tiempalumbrDificil}" data-retraencen="${retraencenDificil}">Dificil</option>`;

    $('#dificultadJ').append(options);

    // carga de max-score
    await $.ajax({    
        type: 'get',
        url: 'https://simon-api-two.vercel.app/api/getmaxscore',
        data:'',
        success: function(response) {
            console.log(response);
            if (typeof response.resultado === 'number'){
                maxScore = response.resultado;
            }else{
                maxScore = 0;
                console.log("You Boys Dun Goofed Up");
            }
        }
    });

    document.getElementById("max-score").textContent = maxScore;    // display en pantalla de max score

    // variables para seleccion de modo en funcion de juego
    let currentTiempoModo;
    let currentRetrasoEncendido;

    function resetVariables(){  // para el reseteo entre partidas
        $('#mensaje').css('visibility','visible');
        clearInterval(timer1);
        secuenciaJuego = [];
        juegoRunning = false;
        elementoPulsado = null;
        timer1 = null;
        tramo1 = null;
        score = 0;
        $('#startG').css('pointer-events','auto');
        document.getElementById("mensaje").textContent = 'Pulse el boton central para comenzar';
        document.getElementById("timerM").textContent = '';
        document.getElementById("score").textContent = 0;
        $('#dificultadJCont').css('visibility','visible');
    }

    function randomNum(max){
        return Math.floor(Math.random() * max);
    }

    async function alumbrar(id, tiempoEncendido, retrasoEntreEncendidosNormal) {    // funcion de alumbrado de secuencia
        document.getElementById("timerM").textContent = '';
        return new Promise((resolve) => { // para que espere a la ejecucion del timeout antes de continuar
            switch (id) {
                case "verde":
                    $('#verde').addClass('illuminati');
                    soundGreen();
                    break;
                case "rojo":
                    $('#rojo').addClass('illuminati');
                    soundRed();
                    break;
                case "amarillo":
                    $('#amarillo').addClass('illuminati');
                    soundYellow();
                    break;
                case "azul":
                    $('#azul').addClass('illuminati');
                    soundBlue();
                    break;
            }
    
            setTimeout(() => {
                switch (id) {
                    case "verde":
                        $('#verde').removeClass('illuminati');
                        break;
                    case "rojo":
                        $('#rojo').removeClass('illuminati');
                        break;
                    case "amarillo":
                        $('#amarillo').removeClass('illuminati');
                        break;
                    case "azul":
                        $('#azul').removeClass('illuminati');
                        break;
                }
    
                setTimeout(() => {  // pausa entre encendidos
                    resolve();
                }, retrasoEntreEncendidosNormal);
            }, tiempoEncendido);
        });
        
    }

    function addElementoASecuenciaJuego(){  // añade color (en forma numerica) a la secuencia actual
        let numero = randomNum(4);
        secuenciaJuego.push(numero);
    }

    function leerElementoDeSecuenciaJuego(numero){  // traduce de numero a color
        let color = '';
        switch(numero){
            case 0:
                color = "verde"; 
                break;
            case 1:
                color = "rojo"; 
                break;
            case 2:
                color = "amarillo"; 
                break;
            case 3:
                color = "azul"; 
                break;
        }
        return color;
    }
    
    

    async function timerRonda(){    // timer de tiempo de ronda
        return new Promise((resolve) => {
            let maximo1 = new Date().getTime() + 32000; // aprox 30 sg reales
            timer1 = setInterval(function() {
                let ahora1 = new Date().getTime();
                tramo1 = maximo1 - ahora1;
                let seconds1 = Math.floor(tramo1 / 1000);
                document.getElementById("timerM").textContent = seconds1; // actualizacion de timer

                if (tramo1 <= 0) {  // fin de juego por timeout
                    clearInterval(timer1);
                    document.getElementById("timerM").textContent = '';
                    resolve('timeout');
                }
            }, 1000);
        });
    }

    async function inputJugador() { // se encarga de chequear el input del usuario contra la secuencia actual
        return new Promise((resolve) => {
            let lista = secuenciaJuego.slice(); // copia sin afectar el original
    
            async function checkInput() {
                if (elementoPulsado !== null) { // para que solo furrule cuando hay valor de pulsacion
                    if (elementoPulsado === lista[0]) { // check positivo
                        lista.shift(); // actualizamos lista
                        elementoPulsado = null; // reseteamos elemento pulsado
    
                        if (lista.length === 0) {   // cuando la lista se acaba
                            score+=1;
                            document.getElementById("score").textContent = score;
                            await new Promise(resolve => setTimeout(resolve, 1000));    // timeout antes de volver a visualizar, para que de tiempo a ver el primer color
                            resolve('playerPass');
                        } else {
                            setTimeout(checkInput, 100); // chequeo cada 100ms
                        }
                    } else {
                        resolve('playerFailed'); // fallo del usuario, fin de partida
                    }
                } else {
                    setTimeout(checkInput, 100); // chequeo cada 100ms
                }
            }
    
            checkInput(); // inicio de chequeo
        });
    }

    async function gameOverModal() {    // modal de game over
        const modal = document.getElementById('gameOverModal');
        modal.style.display = 'flex';

        var gOver = $('#soundGameOver')[0]; // coje el elemento de audio del DOM
        gOver.currentTime = 0; // se situa al principio
        gOver.play();

        await new Promise(resolve => setTimeout(resolve, 3500));
    
        modal.style.display = 'none';
    }

    // funciones de reproduccion de sonidos para los colores
    async function soundGreen() {
        var sGreen = $('#soundGreen')[0];
        sGreen.currentTime = 0;
        sGreen.play();
    }

    async function soundRed() {
        var sRed = $('#soundRed')[0];
        sRed.currentTime = 0;
        sRed.play();
    }

    async function soundYellow() {
        var sYellow = $('#soundYellow')[0];
        sYellow.currentTime = 0;
        sYellow.play();
    }

    async function soundBlue() {
        var sBlue = $('#soundBlue')[0];
        sBlue.currentTime = 0;
        sBlue.play();
    }

    // funcion principal de juego
    async function juego(tiempoAlumbrado,retrasoEntreEncendidos) {
        juegoRunning = true;
        while(juegoRunning){   // bucle de juego
            $('#pTimer').css('visibility','hidden');    // por claridad visual
            addElementoASecuenciaJuego();   // actualizacion de secuencia actual
            $('#verde').css('pointer-events','none');   // anulamos los botones
            $('#rojo').css('pointer-events','none');
            $('#amarillo').css('pointer-events','none');
            $('#azul').css('pointer-events','none');
            
            $('#mensaje').css('visibility','hidden');    // por claridad visual

            for(let i = 0;i<secuenciaJuego.length;i++){ // mostramos visualmente la secuencia actual
                let idColor = leerElementoDeSecuenciaJuego(secuenciaJuego[i]);
                console.log(idColor);
                await alumbrar(idColor,tiempoAlumbrado,retrasoEntreEncendidos);
            }

            $('#pTimer').css('visibility','visible');    // por claridad visual

            $('#verde').css('pointer-events','auto');   // habilitamos los botones
            $('#rojo').css('pointer-events','auto');
            $('#amarillo').css('pointer-events','auto');
            $('#azul').css('pointer-events','auto');

            // espera a input usuario
            $('#mensaje').css('visibility','visible');
            document.getElementById("mensaje").textContent = 'Introduzca el patron';

            let result = await Promise.race([timerRonda(), inputJugador()]);    // espera a un resultado entre timer o input usuario
            if (result === 'timeout' || result === 'playerFailed') {    // caso de fallo por tiempo o error
                console.log(result);
                $('main').css({   // restauramos background a opacidad original
                    'background-color': 'rgb(0, 0, 0, 0)'
                });
                clearInterval(timer1);  // eliminamos timer
                juegoRunning = false;
                $('#mensaje').css('visibility','hidden');    // por claridad visual
                gameOverModal();
                $('#verde').css('pointer-events','none');   // anulamos los botones
                $('#rojo').css('pointer-events','none');
                $('#amarillo').css('pointer-events','none');
                $('#azul').css('pointer-events','none');

                $('#pTimer').css('visibility','hidden');    // por claridad visual
                
                if(score>=maxScore){    // caso de record de puntuacion, muestra y actualiza en bbdd 
                    maxScore = score;
                    document.getElementById("max-score").textContent = score;
                    await $.ajax({    
                        type: 'POST',
                        url: 'https://simon-api-two.vercel.app/api/updateScore',
                        contentType: 'application/json',
                        data: JSON.stringify({
                            "nuevaScore": score
                        }),
                        success: function(response) {
                            console.log(response);
                        }
                    });
                }
                await new Promise(resolve => setTimeout(resolve, 3000)); 
                resetVariables();
                break;
            }else if(result === 'playerPass'){  // secuencia correcta, pasa a la siguiente iteracion
                console.log(result);
                clearInterval(timer1);
                continue;
            }
        }
    }

    $('#startG').on('click',async function(){   // boton de comienzo de juego

        var gStart = $('#soundGameStart')[0];
        gStart.currentTime = 0;
        gStart.play();

        $('#startG').css('pointer-events','none');  // deshabilitamos puntero en el propio boton
        $('#dificultadJCont').css('visibility','hidden');   // no hace falta ahora
        $('main').css({   // evecto visual para concentrar la atencion del usuario en el juego
            'background-color': 'rgb(0, 0, 0, 0.9)'
        });
        const selectElement = document.getElementById('dificultadJ');   // mandamos la dificultad seleccionada a la funcion
        const selectedOption = selectElement.options[selectElement.selectedIndex];  

        currentTiempoModo = selectedOption.getAttribute('data-tiempalumbr');;
        currentRetrasoEncendido = selectedOption.getAttribute('data-retraencen');

        document.getElementById("mensaje").textContent = 'Preste atencion';
        await new Promise(resolve => setTimeout(resolve, 3000));    // 3 segundos de retraso antes de empezar
        juego(currentTiempoModo,currentRetrasoEncendido);
    });

    $('#botReboot').on('click',function(){  // reinicio
        window.location = 'index.html';
    });

    $('#botBorrarRecord').on('click',async function(){  // borrar puntuacion record
        await $.ajax({    
            type: 'POST',
            url: 'https://simon-api-two.vercel.app/api/updateScore',
            contentType: 'application/json',
            data: JSON.stringify({
                "nuevaScore": 0
            }),
            success: function(response) {
                console.log(response);
            }
        });
        window.location = 'index.html';
    });

    // funcionalidad de pulsado de colores
    $('#verde').on('click',function(){
        elementoPulsado = 0;    // valor del color
        return new Promise((resolve) => {
            $('#verde').css({   // evecto visual
                'transform': 'scale(1.05)',
                'z-index': '2'
            });
            soundGreen();
            setTimeout(() => {  // timeout antes de volver a forma original
                        $('#verde').css({
                            'transform': 'scale(1)',
                            'z-index': '1'
                        });
                  

                resolve();
            }, 200);
            
        });
    });

    $('#rojo').on('click',function(){
        elementoPulsado = 1;
        return new Promise((resolve) => {
            $('#rojo').css({
                'transform': 'scale(1.05)',
                'z-index': '2'
            });
            soundRed();
            setTimeout(() => {
                        $('#rojo').css({
                            'transform': 'scale(1)',
                            'z-index': '1'
                        });
                  

                resolve();
            }, 200);
            
        });
    });

    $('#amarillo').on('click',function(){
        elementoPulsado = 2;
        return new Promise((resolve) => {
            $('#amarillo').css({
                'transform': 'scale(1.05)',
                'z-index': '2'
            });
            soundYellow();
            setTimeout(() => {
                        $('#amarillo').css({
                            'transform': 'scale(1)',
                            'z-index': '1'
                        });
                  

                resolve();
            }, 200);
            
        });
    });

    $('#azul').on('click',function(){
        elementoPulsado = 3;
        return new Promise((resolve) => {
            $('#azul').css({
                'transform': 'scale(1.05)',
                'z-index': '2'
            });
            soundBlue();
            setTimeout(() => {
                        $('#azul').css({
                            'transform': 'scale(1)',
                            'z-index': '1'
                        });
                  

                resolve();
            }, 200);
            
        });
    });

});