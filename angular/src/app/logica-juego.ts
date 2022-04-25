export class LogicaJuego {
    //mapaJugadores: Map<string, Estado> = new Map();
    mapaJugadores = new Map<string, Estado>();

    fase = 0;
    /*
        Inicio      = 0 (Poblar el mapa)
        Refuerzo    = 1
        Ataque      = 2
        Fortificar  = 3
    */

    jugadorTurno = "";


    constructor() {

    }

    metodoPrueba(){
        console.log("hola!");
    }


    recibirRegion(json: any, document:Document) {
        var jugador = json.Jugador;
        var Region = json.Region;

        var estadoJugador = this.mapaJugadores.get(jugador)!

        estadoJugador.tropas = json.TropasRestantes; // mostrar en la barra inferior
        estadoJugador.territorios.push(json.Region)

        document.getElementById("Kamchatka")!.style.fill='red';
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

      var estadoJugador = this.mapaJugadores.get(eliminado)!

      estadoJugador.eliminado = true;

      // Si eliminador == yo y cartas > 0
      //    llamada a API de obtener cartas y almacenarlas
    }

    jugadorExpulsado(json: any) {
      var jugador = json.JugadorEliminado;

      var estadoJugador = this.mapaJugadores.get(jugador)!

      estadoJugador.expulsado = true;
    }

    /*partidaFinalizada(json: JSON) {

    }*/

    ////////////


}

export interface Estado{
    tropas: number;
    carta: Carta[];
    territorios: number[];
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


// Estado
//      tropas
//      cartas
//      territorios (array de numRegion)
//      eliminado
//      expulsado
//
