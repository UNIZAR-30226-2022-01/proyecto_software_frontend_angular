import {JuegoComponent} from "./juego/juego.component";
import Swal from "sweetalert2";
import {HttpClient} from "@angular/common/http";
import {Estado, LogicaJuego} from "./logica-juego";

export class LlamadasAPI {
  constructor(private http : HttpClient){}

  fortificar(juego : JuegoComponent) {
    console.log("fortificando...")
    var idTerritorio1 = juego.territorios.indexOf(juego.territorio1)
    var idTerritorio2 = juego.territorios.indexOf(juego.territorio1)

    this.http.post('http://localhost:8090/api/fortificar/'+idTerritorio1+'/'+idTerritorio2+'/'+juego.tropasAMover, null, { observe:'response', responseType:'text', withCredentials: true})
      .subscribe({
        next :(response) => {
          console.log("fortificar con éxito!")
        },
        error: (error) => {Swal.fire({
          title: 'Se ha producido un error al fortificar',
          text: error.error,
          icon: 'error',
          timer: 2000,
        }).then((result) => {
          // Reintenta de nuevo todo el proceso de fortificación
          juego.tratarFaseFortificar();
        });
        }
      });
  }

  obtenerJugadoresPartida(logica : LogicaJuego) {
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

            logica.mapaJugadores.set(jsonData[i], estado);
            logica.colorJugador.set(jsonData[i], logica.colores[i]);
          }
        })
  }

  reforzarTerritorio(juego : JuegoComponent){
    console.log('reforzando')
    var idTerritorio1 = juego.territorios.indexOf(juego.territorio1)

    this.http.post('http://localhost:8090/api/reforzarTerritorio/'+idTerritorio1+'/'+juego.tropasAMover, null, { observe:'response', responseType:'text', withCredentials: true})
      .subscribe({
        next :(response) => {
          console.log("Refuerzo con éxito!")
          juego.tropasRecibidas -= juego.tropasAMover;
        },
        
        error: (error) => {Swal.fire({
          title: 'Se ha producido un error al reforzar',
          text: error.error,
          icon: 'error',
          timer: 2000,
        }).then((result) => {
          // Reintenta de nuevo todo el proceso de fortificación
          juego.tratarFaseReforzar();
        });
        }
      });
  }

}
