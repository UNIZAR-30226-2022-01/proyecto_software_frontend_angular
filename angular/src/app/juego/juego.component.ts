import { trigger, transition, style, animate } from '@angular/animations';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {Alerta, Estado, LogicaJuego} from '../logica-juego';
import Swal from "sweetalert2";

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

export class JuegoComponent implements OnInit {
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


  constructor(private http: HttpClient, private router:Router){}
  ngOnInit(): void {
    this.fnCall();
  }


  jsonData: any;
  intervaloMio:any;
  i:any;
  logica:any;
  fnCall() {
    this.logica = new LogicaJuego(this.http);
    this.intervaloMio = setInterval(() => {
      this.http.get('http://localhost:8090/api/obtenerEstadoPartidaCompleto', {observe:'body', responseType:'text', withCredentials: true}) // TODO: Sustituir por obtenerEstadoPartida, sin completo
          .subscribe(
            data => {
              this.jsonData = JSON.parse(data);
              //console.log("jsonData:",this.jsonData);

              for(var i = 0; i < this.jsonData.length; i++) {
                var obj = this.jsonData[i];
                console.log("obj[",i,"]:",obj);
                console.log("ID:",obj.IDAccion);
                //this.logica.recibirRegion(obj.IDAccion);
                switch(obj.IDAccion) {
                  case 0: { // IDAccionRecibirRegion
                    //console.log("Region a pintar:", obj.Region);
                    //console.log("territorio a pintar:", this.territorios[obj.Region]);
                    document.getElementById(this.territorios[obj.Region])!.style.fill='red';
                    this.logica.recibirRegion(obj, document);
                    break;
                  }
                  case 1: { // IDAccionCambioFase
                    this.logica.fase = obj.Fase

                    if (this.logica.fase == 1 && this.logica.jugadorTurno == this.logica.yo) { // Refuerzo
                      // TODO
                    } else if (this.logica.fase == 2 && this.logica.jugadorTurno == this.logica.yo) { // Ataque
                      // TODO
                    } else if (this.logica.fase == 3 && this.logica.jugadorTurno == this.logica.yo) { // Fortificar
                      // TODO
                      // Mostrar modal de qué territorio elegir de origen, destino y num tropas
                      // hacer llamada y  mostrar resultado
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
}

export class jugadorFinPartida {
  nombre : string = "";
  eliminado : boolean = false;
  expulsado : boolean = false;
}
