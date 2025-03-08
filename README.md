# **ACTIVIDAD: Simon**
## *Interfaces 2ºCS DAW 24/25*  
>Creación de un juego tipo Simon (Memory).
## Propuesta de práctica

    Unidad 4_Práctica 2

    (Version normal)

    Crearemos con este método un juego estilo Simon Dice o juego de memoria que
    consistirá en mostrar una cantidad de círculos rojos en la pantalla y solo alguno de
    ellos se mostraran en una secuencia en azul, el jugador deberá hacer clic repitiendo la
    secuencia, si logra acertar la secuencia la pantalla se redibujara añadiendo más círculos
    y elevando el nivel de dificultad. Si el jugador falla la secuencia deberá repetir ese nivel
    de juego hasta completarlo correctamente. También un aviso le indicará si completo el
    nivel y así pasará al próximo nivel.
    El juego iniciará con 2 filas y 2 columnas, 4 círculos de los cuales 2 de ellos se
    mostrarán por unos segundos en azul. Luego deberemos hacer clic en los dos que
    estuvieron en azul. Así en cada nivel se añadirá una columna y en otro nivel una fila,
    además también se añadirán mas círculos activos en azul para luego tratar de recordar
    la misma secuencia.
    No importa el orden de aparición, sino que se haga clic en todos los círculos que estén
    en azul.
    El máximo tamaño de tablero o escenario será de 6 columnas por 6 filas lo que dará
    una grilla de 36 círculos.

    (Version Simon)

    El mismo principio pero aplicando la estética y estilo del juego de memoria "Simon".
	
Caracteristicas generales:

- Una sola página. Parte superior, logo, controles, mensajes, puntos y dificultad. Parte media e inferior, tablero de juego.

- Modos de juego: la dificultad se ajusta mediante los tiempos de alumbrado y retraso entre cada tecla de color, mas dificultad, menos tiempo.

- Puntuaciones: local y record. La local pasa a convertirse en record si lo iguala o supera y se guarda en bbdd.

- API: pequeño backend hecho con Express, simplemente es un setter/getter de la puntuacion maxima guardada en bbdd (MongoDb).

- Sonidos al empezar la partida, game over y pulsado/alumbrado de teclas.

- Botones de control: reiniciar juego y resetear puntuacion máxima.

## **Archivos:**

```
Front
==================================================
├── css/
│   └── index.css
├── fonts/
│   └── toxigenesis.otf
├── html/
│   └── index.html
├── img/
│   ├── gameOver.png
│   ├── logo.png
│   └── wave-energy.png
├── js/
│   └── index.js
├── sound/
│   ├── beep-original.mp3
│   ├── blue.aup3
│   ├── blue.mp3
│   ├── gameOver.mp3
│   ├── gameStart.mp3
│   ├── green.aup3
│   ├── green.mp3
│   ├── red.aup3
│   ├── red.mp3
│   ├── yellow.aup3
│   └── yellow.mp3
├── README.md
└── vercel.json

==================================================

Back
==================================================

├── api/
│   ├── app.js
│   └── index.js
├── package-lock.json
├── package.json
└── vercel.json

==================================================


```

    

## Tecnologías
+ Front: HTML, CSS, Bootstrap, Jquery.

+ Back: Express, MongoDB.


## Recursos
[Logos: Canva AI](https://www.canva.com/es_es/generador-imagenes-ia/)  
[Sample de sonido: Pixabay](https://pixabay.com/)  
[Editor de sonido: Audacity](https://www.audacityteam.org/)  
[Fuente: dafont](https://www.dafont.com/)  
[Iconos: font awesome](https://fontawesome.com/)
