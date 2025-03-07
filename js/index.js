$(document).ready(async function() {

    $('#verde').css('pointer-events','none');   // por defecto, anulados
    $('#rojo').css('pointer-events','none');
    $('#amarillo').css('pointer-events','none');
    $('#azul').css('pointer-events','none');

    $('#pTimer').css('visibility','hidden');

    let secuenciaJuego = [];
    let elementoPulsado = null;
    let juegoRunning = false;
    let timer1;
    let tramo1;
    let score = 0;
    let maxScore;


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

    document.getElementById("max-score").textContent = maxScore;

    let currentTiempoModo;
    let currentRetrasoEncendido;

    function resetVariables(){
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

    async function alumbrar(id, tiempoEncendido, retrasoEntreEncendidosNormal) {
        document.getElementById("timerM").textContent = '';
        return new Promise((resolve) => { // para que espere a la ejecucion del timeout antes de continuar
            switch (id) {
                case "verde":
                    $('#verde').addClass('illuminati');
                    break;
                case "rojo":
                    $('#rojo').addClass('illuminati');
                    break;
                case "amarillo":
                    $('#amarillo').addClass('illuminati');
                    break;
                case "azul":
                    $('#azul').addClass('illuminati');
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

    function addElementoASecuenciaJuego(){
        let numero = randomNum(4);
        secuenciaJuego.push(numero);
    }

    function leerElementoDeSecuenciaJuego(numero){
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
    
    

    async function timerRonda(){
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

    async function inputJugador() {
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
                            await new Promise(resolve => setTimeout(resolve, 1000));    // timeout antes de volver a visualizar, para que de tiempo a ver la primera
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

    async function juego(tiempoAlumbrado,retrasoEntreEncendidos) {
        juegoRunning = true;
        while(juegoRunning){   // bucle de juego
            $('#pTimer').css('visibility','hidden');
            addElementoASecuenciaJuego();   // actualizacion de secuencia actual
            //console.log(secuenciaJuego.length);
            //console.log(secuenciaJuego);
            $('#verde').css('pointer-events','none');   // anulamos los botones
            $('#rojo').css('pointer-events','none');
            $('#amarillo').css('pointer-events','none');
            $('#azul').css('pointer-events','none');
            
            document.getElementById("mensaje").textContent = 'Preste atencion';

            for(let i = 0;i<secuenciaJuego.length;i++){ // mostramos visualmente la secuencia actual
                let idColor = leerElementoDeSecuenciaJuego(secuenciaJuego[i]);
                console.log(idColor);
                await alumbrar(idColor,tiempoAlumbrado,retrasoEntreEncendidos);
            }

            $('#pTimer').css('visibility','visible');

            $('#verde').css('pointer-events','auto');   // habilitamos los botones
            $('#rojo').css('pointer-events','auto');
            $('#amarillo').css('pointer-events','auto');
            $('#azul').css('pointer-events','auto');

            // espera a input usuario
            document.getElementById("mensaje").textContent = 'Introduzca el patron';

            let result = await Promise.race([timerRonda(), inputJugador()]);    // espera a resultado entre timer e input usuario
            if (result === 'timeout' || result === 'playerFailed') {
                console.log(result);
                $('main').css({   // restauramos background a opacidad original
                    'background-color': 'rgb(0, 0, 0, 0)'
                });
                clearInterval(timer1);
                juegoRunning = false;
                document.getElementById("mensaje").textContent = 'Game Over';
                $('#verde').css('pointer-events','none');   // anulamos los botones
                $('#rojo').css('pointer-events','none');
                $('#amarillo').css('pointer-events','none');
                $('#azul').css('pointer-events','none');

                $('#pTimer').css('visibility','hidden');
                
                if(score>=maxScore){
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
            }else if(result === 'playerPass'){
                console.log(result);
                clearInterval(timer1);
                continue;
            }
        }
    }

    $('#startG').on('click',async function(){
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

    $('#botReboot').on('click',function(){
        window.location = 'index.html';
    });

    $('#botBorrarRecord').on('click',async function(){
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

    $('#verde').on('click',function(){
        elementoPulsado = 0;    // valor del color
        return new Promise((resolve) => {
            $('#verde').css({   // evecto visual
                'transform': 'scale(1.05)',
                'z-index': '2'
            });

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