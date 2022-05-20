import { Component, OnInit } from '@angular/core';
import { interval } from 'rxjs';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import Swal from 'sweetalert2';
import { max } from 'rxjs';
import {LlamadasAPI} from "../llamadas-api";


@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.css']
})
export class LobbyComponent implements OnInit {

  constructor(private http: HttpClient, private router:Router){}
  ngOnInit(): void {
    document.body.style.background = "#f8f9fc";
    this.fnCall();

  }

  maxJugadores:any;
  nombresJugadores: any;
  jugadores: any;
  jugadoresEsperando:any;
  cosaJSON: any;
  intervaloMio:any;
  enCurso:any;

  colores = ["#f94144", // Rojo
    "#f9c74f",            // Amarillo
    "#90be6d",            // Verde
    "#0a9396",            // Azul
    "#6a4c93",            // Morado
    "#f9844a",           // Naranja
    ]
  fnCall() {

    this.intervaloMio = setInterval(() => {
      this.http.get(LlamadasAPI.URLApi+'/api/obtenerEstadoLobby', {observe:'body', responseType:'text' as 'json', withCredentials: true})
          .subscribe(
            data => {
              console.log(data)
              this.cosaJSON = JSON.parse(data.toString());

              console.log(this.cosaJSON)

              this.maxJugadores = this.cosaJSON.MaxJugadores,
              this.nombresJugadores = this.cosaJSON.NombresJugadores,
              this.jugadores = this.cosaJSON.Jugadores;
              this.enCurso = this.cosaJSON.EnCurso;

              if (this.enCurso) { //iniciarPartida
                clearInterval(this.intervaloMio)
                this.router.navigate(['/juego'])
              }

              this.jugadoresEsperando = Array(this.cosaJSON.MaxJugadores-this.cosaJSON.Jugadores).fill(0).map((x,i)=>i);
            })

    }, 1000);

/*
    this.i = interval(1000); // change timer value
    this.i.subscribe(() => {
      this.value += 1;
      console.log(this.value);
      if (this.value == 10){
        this.i.unsubscribe();
        this.i.cancel();
        this.i.stop();
        console.log('Termine');
      }
*/
      /*
      */
    //}
    ///api/obtenerEstadoLobby/{id}
  }

  salir(){
    clearInterval(this.intervaloMio)
    const httpPostOptions =
    {
      headers:
          new HttpHeaders (
            {observe:'response', responseType:'text'}),
      withCredentials: true,
    }

    this.http.post(LlamadasAPI.URLApi+'/api/abandonarLobby',  null, httpPostOptions)
    .subscribe({
      next :(response) => {Swal.fire({
                                      title: 'Has abandonado el lobby con éxito',
                                      icon: 'success',
                                      timer: 2000,
                                      timerProgressBar: true,}),
                          this.router.navigate(['/identificacion'])
                          },

      error: (error) => {Swal.fire({
                                    title: 'Se ha producido un error al abandonar el lobby',
                                    text: error.error,
                                    icon: 'error',
                                  });
                        }
      });
  }
}

export interface Lobby {
  EnCurso:any,
 	EsPublico:any,
  Jugadores:any,
  MaxJugadores:any,
  NombresJugadores: any,
}
