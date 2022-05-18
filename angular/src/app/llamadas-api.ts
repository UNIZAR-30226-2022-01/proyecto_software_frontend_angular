import {JuegoComponent} from "./juego/juego.component";
import Swal from "sweetalert2";
import {HttpClient} from "@angular/common/http";
import {Estado, LogicaJuego} from "./logica-juego";
import {NotificacionesComponent} from "./notificaciones/notificaciones.component";

export class LlamadasAPI {

  //public static URLApi: string = "https://api.pruebecita.tk";
  public static URLApi: string = "http://localhost:8090";

  constructor(private http : HttpClient){}


  atacar(juego : JuegoComponent)  {
    var idTerritorio1 = juego.territorios.indexOf(juego.territorio1);
    var idTerritorio2 = juego.territorios.indexOf(juego.territorio2);
    var nDados = juego.nDadosAtaque;
    this.http.post(LlamadasAPI.URLApi+'/api/atacar/'+idTerritorio1+'/'+idTerritorio2+'/'+ nDados, null, { observe:'response', responseType:'text', withCredentials: true})
      .subscribe({
        next :(response) => {
          console.log("atacar con éxito!")
          console.log("Territorio desde el que atacar: " + juego.territorio1);
          console.log("Territorio al que atacar: " + juego.territorio2);
          console.log("Numero de dados: " + nDados);
          console.log(response);
          console.log()
        },
        error: (error) => {Swal.fire({
          title: 'Se ha producido un error al atacar',
          text: error.error,
          icon: 'error',
          timer: 2000,
        }).then((result) => {
          // Reintenta de nuevo todo el proceso de ataque
          juego.tratarFaseAtacar();
        });
        }
      });
  }


  ocupar(juego : JuegoComponent) {
    var idTerritorio = juego.territorioDestino;
    var nTropas = juego.nTropasOcupar;
    this.http.post(LlamadasAPI.URLApi+'/api/ocupar/'+idTerritorio+'/'+ nTropas, null, { observe:'response', responseType:'text', withCredentials: true})
      .subscribe({
        next :(response) => {
          console.log(response)
          console.log("Territorio " + idTerritorio + " ocupado con " + nTropas + " tropas");
        },
        error: (error) => {Swal.fire({
          title: 'Se ha producido un error al ocupar el territorio',
          text: error.error,
          icon: 'error',
          timer: 2000,
        }).then((result) => {
          juego.reiniciarOcupar();
        });
        }
      });
  }

  // Realiza una acción de fortificar y llama por callback a juego para repetir la fase si ocurre un error
  fortificar(juego : JuegoComponent) {
    var idTerritorio1 = juego.territorios.indexOf(juego.territorio1)
    var idTerritorio2 = juego.territorios.indexOf(juego.territorio2)

    this.http.post(LlamadasAPI.URLApi+'/api/fortificar/'+idTerritorio1+'/'+idTerritorio2+'/'+juego.tropasAMover, null, { observe:'response', responseType:'text', withCredentials: true})
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

  // Obtiene los jugadores de la partida y llama por callback a logica para almacenarlos
  obtenerJugadoresPartida(logica : LogicaJuego) {
    this.http.get(LlamadasAPI.URLApi+'/api/obtenerJugadoresPartida', {observe:'body', responseType:'text', withCredentials: true})
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

    this.http.post(LlamadasAPI.URLApi+'/api/reforzarTerritorio/'+idTerritorio1+'/'+juego.tropasAMover, null, { observe:'response', responseType:'text', withCredentials: true})
      .subscribe({
        next :(response) => {
          juego.refuerzoConExito()
          juego.aumentarTropasRegion(juego.territorios.indexOf(juego.territorio1), juego.tropasAMover)
          juego.tratarFaseReforzar();
        },

        error: (error) => {Swal.fire({
          title: 'Se ha producido un error al reforzar',
          text: error.error,
          icon: 'error',
          timer: 2000,
        }
        ).then((result) => {
          // Reintenta de nuevo todo el proceso de fortificación
          console.log("Se ha fallado el refuerzo, volviendo a tratar la fase..,")
          juego.tratarFaseReforzar();
        });
        }
      });
  }
  // Obtiene la lista de notificaciones pendientes y las almacena en pantallaNotificaciones
  obtenerNotificaciones(pantallaNotificaciones : NotificacionesComponent) : any {
    this.http.get(LlamadasAPI.URLApi+'/api/obtenerNotificaciones', {observe:'body', responseType:'text', withCredentials: true})
      .subscribe({
        next :(response) => {
          var jsonData = JSON.parse(response);

          console.log("jsondata:", jsonData)

          pantallaNotificaciones.notificaciones = jsonData
        },
        error: (error) => {
          console.log("Error:", error)
          return null
        }
      });
  }

  // Acepta una solicitud de amistad. Devuelve "" en caso de éxito, o la respuesta de error si ocurre
  aceptarAmistad(jugador : string) : string {
    this.http.post(LlamadasAPI.URLApi+'/api/aceptarSolicitudAmistad/'+jugador, null, { observe:'response', responseType:'text', withCredentials: true})
      .subscribe({
        next :(response) => {
          return ""
        },
        error: (error) => {
          return String(error)
        }
      });

    return ""
  }

  // Rechaza una solicitud de amistad. Devuelve "" en caso de éxito, o la respuesta de error si ocurre
  rechazarAmistad(jugador : string) : string {
    this.http.post(LlamadasAPI.URLApi+'/api/rechazarSolicitudAmistad/'+jugador, null, { observe:'response', responseType:'text', withCredentials: true})
      .subscribe({
        next :(response) => {
          return ""
        },
        error: (error) => {
          return String(error)
        }
      });

    return ""
  }

  // Intenta cambiar un aspecto al item dado su id, mostrando una alerta como feedback,
  // y llama por callback para mostrar el item si se ha cambiado, o para indicar que ha
  // habido fallo y no se ha cambiado el item
  cambiarAspecto(item : number, llamador : any) {
    this.http.post(LlamadasAPI.URLApi+'/api/modificarAspecto/'+item, null, { observe:'response', responseType:'text', withCredentials: true})
      .subscribe({
        next :(response) => {
          Swal.fire({
            title: 'Aspecto modificado con éxito',
            icon: 'success',
            timer: 2000,
          })

          llamador.cambiarItemEnUso(item)

        },
        error: (error) => {
          Swal.fire({
            title: 'Se ha producido un error al intentar cambiar el aspecto',
            text: error.error,
            icon: 'error',
            timer: 2000,
          })

          llamador.sinCambioItemEnUso(item)
        }
      });
  }

  obtenerAvatar(llamador : any, usuario : string) : any {
    this.http.get(LlamadasAPI.URLApi+'/api/obtenerFotoPerfil/'+usuario, {observe:'body', responseType:'blob', withCredentials: true})
      .subscribe({
        next :(response) => {
          llamador.introducirAvatar(response, usuario)
        },
        error: (error) => {
          console.log("Error:", error)
        }
      });
  }

  obtenerDados(llamador : any, usuario : string) : any {
    this.http.get(LlamadasAPI.URLApi+'/api/obtenerDados/'+usuario+'/5', {observe:'body', responseType:'blob', withCredentials: true})
      .subscribe({
        next :(response) => {
          llamador.devolverDados(response, usuario)
        },
        error: (error) => {
          console.log("Error:", error)
        }
      });
  }

  // Obtiene el blob de imagen dado su id, y llama por callback para devolverlo
  obtenerImagenItem(llamador : any, id : string) : any {
    this.http.get(LlamadasAPI.URLApi+'/api/obtenerImagenItem/'+id, {observe:'body', responseType:'blob', withCredentials: true})
      .subscribe({
        next :(response) => {
          llamador.introducirImagen(response, id)
        },
        error: (error) => {
          console.log("Error:", error)
        }
      });
  }


  comprarAspecto(item : number, llamador : any) {
    this.http.post(LlamadasAPI.URLApi+'/api/comprarObjeto/'+item, null, { observe:'response', responseType:'text', withCredentials: true})
      .subscribe({
        next :(response) => {
          Swal.fire({
            title: 'Ítem comprado con éxito',
            icon: 'success',
            timer: 2000,
          })

          llamador.marcarItemComprado(item)

        },
        error: (error) => {
          Swal.fire({
            title: 'Se ha producido un error al intentar cambiar el aspecto',
            text: error.error,
            icon: 'error',
            timer: 2000,
          })

          llamador.sinCambioItemComprado()
        }
      });
  }

  enviarMensaje(mensaje : string) {
    var formData: any = new FormData();
    formData.append('mensaje', mensaje);

    console.log("enviando ", mensaje)

    this.http.post(LlamadasAPI.URLApi+'/api/enviarMensaje', formData, { observe:'response', responseType:'text', withCredentials: true})
      .subscribe({
        next :(response) => {
          return ""
        },
        error: (error) => {
          return String(error)
        }
      });

    return ""
  }


}

