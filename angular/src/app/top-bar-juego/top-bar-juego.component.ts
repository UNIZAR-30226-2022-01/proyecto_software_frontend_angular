import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import {LlamadasAPI} from "../llamadas-api";

@Component({
  selector: 'top-bar-juego',
  templateUrl: './top-bar-juego.component.html',
  styleUrls: ['./top-bar-juego.component.css']
})
export class TopBarJuegoComponent implements OnInit {

  constructor(private http: HttpClient, private router: Router) { }

  ngOnInit(): void {
  }

  rendirse(){
    Swal.fire({
      title: '¿Salir del juego?',
      text: '¡Rindete ahora y perderás este juego!',
      showDenyButton: true,
      confirmButtonText: 'Salir',
      denyButtonText: `Cancelar`,
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        this.http.post(LlamadasAPI.URLApi+'/api/abandonarPartida', null, { observe:'response', responseType:'text', withCredentials: true})
          .subscribe({
            next :(response) => {Swal.fire({
                                            title: 'Se ha abando la partida con éxito',
                                            icon: 'success',
                                            timer: 2000,
                                            timerProgressBar: true,
                                          });

                                  this.router.navigate(['/'])
                                },
            error: (error) => {Swal.fire({
                                        title: 'Se ha producido un error al abandonar la partida',
                                        text: error.error,
                                        icon: 'error',
                                        })
                              }
          });
      }
    })
  

  }
}

