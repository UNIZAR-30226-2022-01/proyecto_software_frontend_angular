import { HttpClient } from '@angular/common/http';

export class LogicaJuego {
    colores = ["#f94144","#f8961e","#f9c74f","#90be6d","#4d908e","#577590",]
    http: HttpClient
    colorJugador = new Map<string, string>();
    mapaJugadores = new Map<string, Estado>();
    cartas : Array<Carta> = new Array<Carta>()
    yo: any

    fase = 0;
    /*
        Inicio      = 0 (Poblar el mapa)
        Refuerzo    = 1
        Ataque      = 2
        Fortificar  = 3
    */

    jugadorTurno = "";


    constructor(http: HttpClient) {
      this.http = http

      var nombre_usuario = localStorage.getItem("nombre_usuario")!

      nombre_usuario = nombre_usuario.split('=')[1]
      nombre_usuario = nombre_usuario.split('|')[0]

      this.yo = nombre_usuario;

      this.http.get('http://localhost:8090/api/obtenerJugadoresPartida', {observe:'body', responseType:'text', withCredentials: true})
        .subscribe(
          data => {
            var jsonData = JSON.parse(data);

            for(var i = 0; i < jsonData.length; i++) {
              var estado : Estado = {
                tropas: 0,
                territorios: [],
                numCartas: 0,
                eliminado: false,
                expulsado: false,
              }
              this.mapaJugadores.set(jsonData[i], estado);
              console.log('jugador logica:', jsonData[i])
              this.colorJugador.set(jsonData[i],this.colores[i]);
            }
          })
    }

    recibirRegion(json: any, document:Document) {
        var jugador = json.Jugador;
        var Region = json.Region;

        var estadoJugador = this.mapaJugadores.get(jugador)!
        estadoJugador.tropas = json.TropasRestantes; // mostrar en la barra inferior
        estadoJugador.territorios.push(json.Region)

        //document.getElementById("Kamchatka")!.style.fill='red';
        this.mapaJugadores.set(jugador, estadoJugador);
    }

    cambioFase(json: any) {

    }

    inicioTurno(json: any) {

    }

    cambioCartas(json: any) {

    }

    reforzar(json: any) {

    }

    ataque(json: any) {

    }

    ocupar(json: any) {

    }

    fortificar(json: any) {

    }

    obtenerCarta(json: any) {

    }

    jugadorEliminado(json: any) {
      var eliminado = json.JugadorEliminado;
      var eliminador = json.JugadorEliminador;
      var cartasRecibidas = json.CartasRecibidas;

      // Se contabiliza al jugador eliminado como tal
      var estadoJugador = this.mapaJugadores.get(eliminado)!

      estadoJugador.eliminado = true;
      this.mapaJugadores.set(eliminado, estadoJugador)

      if (eliminador == this.yo && cartasRecibidas > 0) {
        // Se reinicia el almacén y el contador de cartas
        this.consultarCartas()
      }
    }

    jugadorExpulsado(json: any) {
      var jugador = json.JugadorEliminado;

      // Marca al jugador como expulsado
      var estadoJugador = this.mapaJugadores.get(jugador)!
      estadoJugador.expulsado = true;
      this.mapaJugadores.set(jugador, estadoJugador)
    }

    /*partidaFinalizada(json: JSON) {

    }*/

    // Auxiliares
    private consultarCartas() {
      this.http.get('http://localhost:8090/api/consultarCartas', {observe:'body', responseType:'text', withCredentials: true})
        .subscribe(
          data => {
            var jsonData = JSON.parse(data);

            // Actualiza el número de cartas
            var estadoMio = this.mapaJugadores.get(this.yo)!
            estadoMio.numCartas = jsonData.length;
            this.mapaJugadores.set(this.yo, estadoMio)

            // Y reinicializa el almacén de cartas
            this.cartas = new Array<Carta>()
            for(var i = 0; i < jsonData.length; i++) {
              var carta : Carta = {
                idCarta: jsonData[i].IdCarta,
                tipo:  jsonData[i].Tipo,
                region: jsonData[i].Region,
                esComodin:  jsonData[i].EsComodin,
              }

              this.cartas.push(carta)
            }

            console.log("Cartas nuevas:", this.cartas)
          })
    }
}

export interface Estado{
    tropas: number;
    territorios: number[];
    numCartas: number;
    eliminado: boolean;
    expulsado: boolean;
}

export interface Carta {
    idCarta: number; // para la API
    tipo: number;
    /*
        Infanteria = 0
        Caballeria = 1
        Artilleria = 2
    */
    region: number;
    esComodin: boolean;
}
