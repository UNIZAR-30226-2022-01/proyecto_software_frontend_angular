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
    this.http.get('http://localhost:8090/api/jugandoEnPartida', { observe:'response', responseType:'text', withCredentials: true})
      .subscribe({
        next :(response) => {
          var enPartida = JSON.parse(response.body!);

          if (enPartida) {
            localStorage.setItem('volviendo', "true");

            document.getElementById("botonLobby")!.style.display = "none"
            document.getElementById("botonJuego")!.style.display = "block"
          }
        }
      })
  }

}
