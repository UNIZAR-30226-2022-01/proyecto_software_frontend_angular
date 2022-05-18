import { Component, OnInit } from '@angular/core';
import {LlamadasAPI} from "../llamadas-api";
import {HttpClient} from "@angular/common/http";
import {Router} from "@angular/router";

@Component({
  selector: 'identificacionUsuario',
  templateUrl: './identificacion.component.html',
  styleUrls: ['./identificacion.component.css']
})
export class IdentificacionComponent implements OnInit {

  constructor(private http: HttpClient, private router:Router) {}

  llamadasAPI : LlamadasAPI = new LlamadasAPI(this.http);

  ngOnInit(): void {
    document.body.style.overflow = "hidden";
    document.body.style.background = "#f8f9fc";

    this.http.get(LlamadasAPI.URLApi+'/api/jugandoEnPartida', { observe:'response', responseType:'text', withCredentials: true})
      .subscribe({
        next :(response) => {
          var enPartida = JSON.parse(response.body!);

          if (enPartida) {
            document.getElementById("botonBuscar")!.style.display = "none"
            document.getElementById("botonCrear")!.style.display = "none"

            this.http.get(LlamadasAPI.URLApi+'/api/obtenerEstadoLobby', {observe:'body', responseType:'text' as 'json', withCredentials: true})
              .subscribe(
                data => {
                  console.log(data)
                  var estadoLobby = JSON.parse(data.toString());

                  var enCurso = estadoLobby.EnCurso;

                  if (enCurso) {
                    localStorage.setItem('volviendo', "true");

                    document.getElementById("botonLobby")!.style.display = "none"
                    document.getElementById("botonJuego")!.style.display = "block"
                  }
                })
          } else {
            document.getElementById("botonLobby")!.style.display = "none"
            document.getElementById("botonJuego")!.style.display = "none"
          }

        }
      })
  }

}
