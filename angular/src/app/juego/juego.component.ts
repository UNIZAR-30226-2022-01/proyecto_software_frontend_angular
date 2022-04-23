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
              this.logica.metodoPrueba();
              //console.log("tamaño:",this.jsonData.length);
              //console.log("jsonData[0]", this.jsonData.at(0))
              
              for(var i = 0; i < this.jsonData.length; i++) {
                var obj = this.jsonData[i];
                console.log("obj[",i,"]:",obj);
                console.log("ID:",obj.IDAccion);
                
                switch(obj.IDAccion) { 
                  case 0: { //IDAccionRecibirRegion
                      
                      break; 
                  } 
                  case 1: { // IDAccionCambioFase
                 
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
                  case 8: { // IDAccionFortificar
                    
                      break; 
                  }
                  case 9: { // IDAccionObtenerCarta
                      
                      break; 
                  } 
                  case 10: { // IDAccionJugadorEliminado
                 
                      break; 
                  } 
                  case 11: { // IDAccionPartidaFinalizada
                    
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
