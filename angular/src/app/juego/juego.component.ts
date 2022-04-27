import { trigger, transition, style, animate } from '@angular/animations';
import { HttpClient } from '@angular/common/http';
import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import { Router } from '@angular/router';
import {Alerta, Estado, LogicaJuego} from '../logica-juego';
import Swal, {SweetAlertResult} from "sweetalert2";
import { interval, take } from 'rxjs';
import {MapaComponent} from "../mapa/mapa.component";
import { SelectMultipleControlValueAccessor } from '@angular/forms';
import {LlamadasAPI} from "../llamadas-api";

@Component({
  selector: 'juego',
  templateUrl: './juego.component.html',
  styleUrls: ['./juego.component.css'],
  animations: [
    trigger('mostrarSlide', [
      transition(':enter', [
        style({transform: 'translateY(100%)', opacity: '0'}),
        animate('200ms ease-in', style({transform: 'translateY(0%)', opacity: '1'}))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({transform: 'translateY(100%)', opacity: '0'})),
      ])
    ]),
  ]
})

export class JuegoComponent implements OnInit, AfterViewInit {
  @ViewChild(MapaComponent) mapa: any;

  territorios = ["Australia_Oriental", "Indonesia", "Nueva_Guinea", "Alaska", "Ontario", "Territorio_del_Noroeste", "Venezuela", "Madagascar", "Africa_del_Norte", "Groenlandia",
                  "Islandia", "Reino_Unido", "Escandinavia", "Japon", "Yakutsk", "Kamchatka", "Siberia", "Ural", "Afganistan", "Oriente_Medio",
                  "India", "Siam", "China", "Mongolia", "Irkutsk", "Ucrania", "Europa_del_Sur", "Europa_Occidental", "Europa_del_Norte", "Egipto",
                  "Africa_Oriental", "Congo", "Sudafrica", "Brasil", "Argentina", "Este_de_los_Estados_Unidos", "Estados_Unidos_Occidental", "Quebec",
                  "America_Central", "Peru", "Australia_Occidental", "Alberta"];

  circulosTerritorios = ["cAustralia_Oriental", "cIndonesia",
                  "cNueva_Guinea", "cAlaska", "cOntario", "cTerritorio_del_Noroeste", "cVenezuela", "cMadagascar", "cAfrica_del_Norte", "cGroenlandia",
                  "cIslandia", "cReino_Unido", "cEscandinavia", "cJapon", "cYakutsk", "cKamchatka", "cSiberia", "cUral", "cAfganistan", "cOriente_Medio",
                  "cIndia", "cSiam", "cChina", "cMongolia", "cIrkutsk", "cUcrania", "cEuropa_del_Sur", "cEuropa_Occidental", "cEuropa_del_Norte", "cEgipto",
                  "cAfrica_Oriental", "cCongo", "cSudafrica", "cBrasil", "cArgentina", "cEste_de_los_Estados_Unidos", "cEstados_Unidos_Occidental", "cQuebec",
                  "cAmerica_Central", "cPeru", "cAustralia_Occidental", "cAlberta"];
                  info: number = 0;
  isShow = false;
  source = "https://img.icons8.com/material-rounded/48/000000/bar-chart.png";

  toggleDisplay() { this.isShow = !this.isShow;}

  changeImage() {
    if (!this.isShow) {this.source = "https://img.icons8.com/material-rounded/48/000000/bar-chart.png";}
    else {this.source = "https://img.icons8.com/external-flaticons-lineal-color-flat-icons/64/000000/external-cross-100-most-used-icons-flaticons-lineal-color-flat-icons.png";}
  }

  setMapa() {this.info = 0;}
  setMapaInfo() {this.info = 1;}

  delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }

  constructor(private http: HttpClient, private router:Router){}

  ngOnInit(): void {
    this.fnCall();
  }


  jsonData: any;
  intervaloConsultaEstado:any;
  i:any;
  logica:any;

  tiempo = 0;
  vez = 0;
  index = Array<number>();
  jugador = Array<string>();

  intervarloConsultaTerritorio : any;
  territorio1 : string = "";
  territorio2 : string = "";

  resultadoAlerta : Promise<SweetAlertResult> | undefined ;

  tropasAMover : number = 0;

  llamadasAPI : LlamadasAPI = new LlamadasAPI(this.http);

  fnCall() {
    this.logica = new LogicaJuego(this.http);

    this.intervaloConsultaEstado = setInterval(() => {
      this.http.get('http://localhost:8090/api/obtenerEstadoPartidaCompleto', {observe:'body', responseType:'text', withCredentials: true}) // TODO: Sustituir por obtenerEstadoPartida, sin completo
          .subscribe(
            data => {
              clearInterval(this.intervaloConsultaEstado) // TODO: DEBUG

              this.jsonData = JSON.parse(data);
              console.log("jsonData:",this.jsonData);

              for(var i = 0; i < this.jsonData.length; i++) {
                var obj = this.jsonData[i];
                switch(obj.IDAccion) {
                  case 0: { // IDAccionRecibirRegion
                    this.logica.recibirRegion(obj, document);
                    this.index.push(obj.Region);
                    this.jugador.push(obj.Jugador);

                    /*this.tiempo = this.tiempo + 100;
                    var inter = setInterval(() =>
                      {
                        this.vez = this.vez + 1;
                        console.log(this.vez)
                        if (true) clearInterval(inter)
                        var velemento = this.index.pop()!
                        var jugador = this.jugador.pop()!
                        document.getElementById(this.territorios[velemento])!.style.fill=this.logica.colorJugador.get(jugador);
                        document.getElementById("c"+this.territorios[velemento])!.style.fill=this.logica.colorJugador.get(jugador);
                        document.getElementById("t"+this.territorios[velemento])!.innerHTML="1"

                      },this.tiempo);*/

                    break;
                  }
                  case 1: { // IDAccionCambioFase
                    this.logica.fase = obj.Fase

                    console.log("fase:", this.logica.fase)
                    console.log("jugador:", obj.Jugador)
                    console.log("yo:", this.logica.yo)

                    if (this.logica.fase == 1 && obj.Jugador == this.logica.yo) { // Refuerzo
                      // TODO
                    } else if (this.logica.fase == 2 && obj.Jugador == this.logica.yo) { // Ataque
                      // TODO
                    } else if (this.logica.fase == 3 && obj.Jugador == this.logica.yo) { // Fortificar
                      this.tratarFaseFortificar()
                    }


                    break;
                  }
                  case 2: { // IDAccionInicioTurno

                    break;
                  }
                  case 3: { // IDAccionCambioCartas
                    var alerta : Alerta = this.logica.cambioCartas(obj)

                    this.mostrarAlerta(alerta.titulo, alerta.texto)
                    break;
                  }
                  case 4: { // IDAccionReforzar

                      break;
                  }
                  case 5: { // IDAccionAtaque

                      break;
                  }
                  case 6: { // IDAccionOcupar

                      break;
                  }
                  case 7: { // IDAccionFortificar
                      // TODO
                      break;
                  }
                  case 8: { // IDAccionObtenerCarta
                      // TODO
                      break;
                  }
                  case 9: { // IDAccionJugadorEliminado
                      this.logica.jugadorEliminado(obj)
                      // TODO: Señalar al jugador eliminado como tal

                      // clearInterval(this.intervaloMio)
                      break;
                  }
                  case 10: { // IDAccionJugadorExpulsado
                      this.logica.jugadorExpulsado(obj)
                      // TODO: Señalar al jugador expulsado como tal

                      // clearInterval(this.intervaloMio)
                      break;
                  }
                  case 11: { // IDAccionPartidaFinalizada
                      // Información a tratar por la pantalla de fin de partida
                      localStorage.setItem("ganador", obj.JugadorGanador)
                      if (this.logica.yo == obj.JugadorGanador) {
                        localStorage.setItem("esGanador", "1")
                      } else {
                        localStorage.setItem("esGanador", "0")
                      }

                      localStorage.setItem("yo", this.logica.yo)
                      // Borra la entrada para el jugador actual
                      //this.logica.mapaJugadores.delete(this.logica.yo)

                      var listaJugadores = new Array<jugadorFinPartida>();

                      this.logica.mapaJugadores.forEach((jugador: Estado, i: string) => {
                        var jugadorFin : jugadorFinPartida = {
                          nombre: i,
                          eliminado : jugador.eliminado,
                          expulsado : jugador.expulsado,
                        };

                        listaJugadores.push(jugadorFin);
                      });

                      localStorage.setItem("jugadores", JSON.stringify(listaJugadores))
                      // Se borra el almacen de lógica del juego y pasa a la pantalla de fin de partida
                      //delete this.logica

                      //clearInterval(this.intervaloMio)

                      //this.router.navigate(['/finPartida']) // Comentar para no redirigir al fin de una partida
                      break;
                  }
                }
              }

              /*if (this.cosaJSON.MaxJugadores == this.cosaJSON.Jugadores) { //iniciarPartida
                clearInterval(this.intervaloMio)
                //this.router.navigate(['/juego'])
              }*/
            })

    }, 5000);
  }

  mostrarAlerta(tituloAlerta: string, textoAlerta: string) {
    var timerInterval : any
    Swal.fire({
      title: tituloAlerta,
      position: 'top',
      width: '30%',
      backdrop: false,
      html: textoAlerta,
      timer: 5000,
      timerProgressBar: true,
      willClose: () => {
        clearInterval(timerInterval)
      }
    })
  }

  mostrarAlertaPermanente(tituloAlerta: string, textoAlerta: string) {
    //var timerInterval : any

    Swal.fire({
      title: tituloAlerta,
      position: 'top',
      width: '40%',
      backdrop: false,
      html: textoAlerta,
      showConfirmButton: false,
      //timer: 5000,
      //timerProgressBar: true,
      //willClose: () => {
      //  clearInterval(timerInterval)
      //}
    })
  }

  cerrarAlertaPermanente() {
    Swal.close()
  }

  mostrarAlertaRangoAsincrona(tituloAlerta: string, min: string, max: string) {
    var atributos : Record<string, string> = {
      "min": min,
      "max": max,
      "step": "1"
    };
    return Swal.fire({
      title: tituloAlerta,
      //icon: 'question',
      input: 'range',
      inputAttributes: atributos,
      //inputLabel: textoSelector,
      inputValue: min,
    }).then((result) => {
        this.tropasAMover = result.value;
        this.llamadasAPI.fortificar(this)
    });
  }


  ngAfterViewInit() {}


  // Funciones de tratamiento del juego

  tratarFaseFortificar() {
    console.log("Estamos en fase de fortificación!")
    this.territorio1 = "";
    this.territorio2 = "";
    this.tropasAMover = 0;


    this.mostrarAlertaPermanente("Selecciona el territorio origen", "")
    this.mapa.permitirSeleccionTerritorios();
    this.intervarloConsultaTerritorio = setInterval(() =>
      {
        if (this.mapa.territorioSeleccionado != "") { // Ha cambiado

          // Asignar el territorio seleccionado
          // Si es el primer territorio seleccionado, se guarda y resetea en el mapa
          if (this.territorio1 == "") {
            this.territorio1 = this.mapa.territorioSeleccionado;
            this.mapa.territorioSeleccionado = "";
            // Cierra el popup de seleccionar el primer territorio y crea otro para el segundo
            this.cerrarAlertaPermanente()
            this.mostrarAlertaPermanente("Selecciona el territorio destino", "")
          } else {
            // Cierra el popup de seleccionar el segundo territorio
            this.cerrarAlertaPermanente()

            // Deshabilita el intervalo de consulta y las selecciones de territorio
            this.territorio2 = this.mapa.territorioSeleccionado;
            clearInterval(this.intervarloConsultaTerritorio)
            this.mapa.limitarSeleccionTerritorios();

            // Una vez hecho, se llama por callback a la selección de tropas
            this.mostrarAlertaRangoAsincrona("Selecciona el número de tropas", "1", "12");
          }
        }
      },
      200);
  }
}

export class jugadorFinPartida {
  nombre : string = "";
  eliminado : boolean = false;
  expulsado : boolean = false;
}
