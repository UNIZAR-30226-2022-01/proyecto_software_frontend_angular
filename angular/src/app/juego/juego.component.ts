import { trigger, transition, style, animate } from '@angular/animations';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

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


  cosaJSON: any;
  intervaloMio:any;
  fnCall() {
 
    this.intervaloMio = setInterval(() => {
      this.http.get('http://localhost:8090/api/obtenerEstadoLobby', {observe:'body', responseType:'text', withCredentials: true})
          .subscribe(
            data => {
              console.log(data)
              this.cosaJSON = JSON.parse(data.toString());
              
              if (this.cosaJSON.MaxJugadores == this.cosaJSON.Jugadores) { //iniciarPartida
                clearInterval(this.intervaloMio)
                //this.router.navigate(['/juego'])
              }
            })
      
    }, 1000);
  }
}
