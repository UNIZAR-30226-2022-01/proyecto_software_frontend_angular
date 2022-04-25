import { trigger, transition, style, animate } from '@angular/animations';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LogicaJuego } from '../logica-juego';

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
    this.intervaloMio = setInterval(() => {
      this.http.get('http://localhost:8090/api/obtenerEstadoPartidaCompleto', {observe:'body', responseType:'text', withCredentials: true}) // TODO: Sustituir por obtenerEstadoPartida, sin completo
          .subscribe(
            data => {
              this.jsonData = JSON.parse(data);
              console.log("jsonData:",this.jsonData);
              //this.jsonData = JSON.parse(data.toString());
              //console.log("jsonData string:",this.jsonData);
              this.logica = new LogicaJuego();
              //this.logica.metodoPrueba();
              //console.log("tamaño:",this.jsonData.length);
              //console.log("jsonData[0]", this.jsonData.at(0))
              //var territorios = ["Kamchatka"];
              for(var i = 0; i < this.jsonData.length; i++) {
                var obj = this.jsonData[i];
                console.log("obj[",i,"]:",obj);
                console.log("ID:",obj.IDAccion);
                //this.logica.recibirRegion(obj.IDAccion);
                switch(obj.IDAccion) {
                  case 0: { // IDAccionRecibirRegion
                    console.log("Region a pintar:", obj.Region);
                    console.log("territorio a pintar:", this.territorios[obj.Region]);
                    document.getElementById(this.territorios[obj.Region])!.style.fill='red';
                    this.logica.recibirRegion(obj.IDAccion, document);
                    break;
                  }
                  case 1: { // IDAccionCambioFase
                      console.log("Region a pintar:", obj.Region);
                      console.log("territorio a pintar:", this.territorios[obj.Region]);
                      document.getElementById(this.territorios[obj.Region])!.style.fill='red';
                      this.logica.recibirRegion(obj, document);
                      break;
                  }
                  case 2: { // IDAccionInicioTurno

                    break;
                  }
                  case 3: { // IDAccionCambioCartas

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

                      break;
                  }
                  case 8: { // IDAccionObtenerCarta

                      break;
                  }
                  case 9: { // IDAccionJugadorEliminado

                      break;
                  }
                  case 10: { // IDAccionJugadorExpulsado
                      this.logica.jugadorExpulsado()
                      break;
                  }
                  case 11: { // IDAccionPartidaFinalizada
                      // Destruir almacen
                      // Redirigir a pantalla de fin de partida teniendo en cuenta qué jugador ha ganado

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
}
