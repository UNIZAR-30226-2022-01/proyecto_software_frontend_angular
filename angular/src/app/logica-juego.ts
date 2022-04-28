import { HttpClient } from '@angular/common/http';
import Swal from "sweetalert2";
import {LlamadasAPI} from "./llamadas-api";

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

    llamadasAPI : LlamadasAPI;

    constructor(http: HttpClient) {
      this.http = http
      this.llamadasAPI = new LlamadasAPI(this.http)

      var nombre_usuario = localStorage.getItem("nombre_usuario")!

      nombre_usuario = nombre_usuario.split('=')[1]
      nombre_usuario = nombre_usuario.split('|')[0]

      this.yo = nombre_usuario;

      this.llamadasAPI.obtenerJugadoresPartida(this)
    }

    recibirRegion(json: any, document:Document) {
        var jugador = json.Jugador;
        var region = json.Region;

        var estadoJugador = this.mapaJugadores.get(jugador)!
        estadoJugador.tropas = json.TropasRestantes; // mostrar en la barra inferior
        estadoJugador.territorios.push(region)

        //document.getElementById("Kamchatka")!.style.fill='red';
        this.mapaJugadores.set(jugador, estadoJugador);
    }

    cambioFase(json: any) {

    }

    inicioTurno(json: any) {

    }

    cambioCartas(json: any) {
      var tropasObtenidas = json.NumTropasObtenidas
      var bonificacionObtenida = json.BonificacionObtenida
      //var regionesQueOtorganBonificacion = json.RegionesQueOtorganBonificacion // No usado de momento
      var obligadoAHacerCambios = json.ObligadoAHacerCambios

      var textoAlerta
      if (obligadoAHacerCambios == true && bonificacionObtenida) {
        textoAlerta = this.jugadorTurno + " ha recibido "+ tropasObtenidas + " tropas tras ser obligado a cambiar cartas, con bonificación"
      } else if (obligadoAHacerCambios) {
        textoAlerta = this.jugadorTurno + " ha recibido "+ tropasObtenidas + " tropas tras ser obligado a cambiar cartas"
      } else if (bonificacionObtenida) {
        textoAlerta = this.jugadorTurno + " ha recibido "+ tropasObtenidas + " tropas, con bonificación"
      } else {
        textoAlerta = this.jugadorTurno + " ha recibido "+ tropasObtenidas
      }

      var valorRetorno = new Alerta()
      valorRetorno.titulo = "Robo de cartas"
      valorRetorno.texto = textoAlerta
      return valorRetorno
    }

    reforzar(json: any) {
    }

    ataque(json: any) {

    }

    ocupar(json: any) {

    }

    fortificar(json: any) {

    }

    // Almacena la carta para el jugador si somos nosotros,
    // o contabiliza que uno de los rivales tiene una carta más
    // Devuelve una carta si la carta obtenida es para el jugador,
    // null en caso contrario
    obtenerCarta(json: any) {
      var tipo = json.Carta.Tipo
      var region = json.Carta.Region
      var esComodin = json.Carta.EsComodin

      var jugador = json.Jugador

      if (jugador == this.yo) {
        var carta : Carta = {
          idCarta: 0,
          tipo:  tipo,
          region: region,
          esComodin:  esComodin,
        }

        // Almacena la nueva carta, consultándolas de nuevo para conocer su ID
        this.consultarCartas()
        // TODO: Mostrar cartas o indicar que hay una carta nueva?

        return carta
      } else {
        // Contabiliza una carta más para el receptor
        var estado = this.mapaJugadores.get(jugador)!
        estado.numCartas++;
        this.mapaJugadores.set(jugador, estado)

        return null
      }

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

export class Alerta {
  titulo: string = "";
  texto: string = "";
}
