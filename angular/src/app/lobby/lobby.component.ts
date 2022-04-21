import { Component, OnInit } from '@angular/core';
import { interval } from 'rxjs';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { max } from 'rxjs';


@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.css']
})
export class LobbyComponent implements OnInit {
  value = 0;

  constructor(private http: HttpClient, private router:Router){}
  ngOnInit(): void {
    //this.fnCall();
    
  }

  //maxJugadores:any;
  //nombresJugadores: any;
  //jugadores: any;

  nombresJugadores = ['jamon', 'lolito','pancetita']
  jugadoresEsperando = [1,3];


  colores = ['red', 'purple','green', 'blue', 'orange']
  /*fnCall() {
    const i = interval(1000); // change timer value
    i.subscribe(() => {
      this.value += 1;
      console.log(this.value);

      this.http.get<Lobby>('http://localhost:8090/api/api/obtenerEstadoLobby/', {observe:'body',withCredentials: true})
          .subscribe(
            data => {
              this.maxJugadores = data.MaxJugadores,
              this.nombresJugadores = data.NombresJugadores,
              this.jugadores = data.Jugadores;
              if (data.MaxJugadores == data.Jugadores) { //iniciarPartida

              }
              this.jugadoresEsperando = Array(data.MaxJugadores-data.Jugadores).fill(0).map((x,i)=>i);;

            })

    });
    ///api/obtenerEstadoLobby/{id}
  }
  */
  salir(){
    this.http.post('http://localhost:8090/api/abandonarLobby', {observe:'response', responseType:'text'})
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