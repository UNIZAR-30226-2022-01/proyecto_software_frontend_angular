import { Component, OnInit } from '@angular/core';
import {LlamadasAPI} from "../llamadas-api";
import {HttpClient} from "@angular/common/http";
import {Router} from "@angular/router";
import Swal from "sweetalert2";

@Component({
  selector: 'notificaciones',
  templateUrl: './notificaciones.component.html',
  styleUrls: ['./notificaciones.component.css']
})
export class NotificacionesComponent implements OnInit {

  constructor(private http: HttpClient, private router:Router){}

  llamadasAPI : LlamadasAPI = new LlamadasAPI(this.http);

  notificaciones : any;

  ngOnInit(): void {
    this.llamadasAPI.obtenerNotificaciones(this)
  }

  rechazarAmistad(jugador : string, id : number) {
    var error = this.llamadasAPI.rechazarAmistad(jugador)

    if (error == "") {
      document.getElementById("texto"+id)!.innerHTML = "¡Solicitud de " + jugador + " rechazada!";
      document.getElementById("botonAceptar"+id)!.style.display = 'none';
      document.getElementById("botonRechazar"+id)!.style.display = 'none';
    } else {
      Swal.fire({
        title: "Ha ocurrido un error al rechazar la solicitud de amistad",
        position: 'top',
        width: '50%',
        backdrop: false,
        html: error
      })
    }
  }

  aceptarAmistad(jugador : string, id : number) {
    var error = this.llamadasAPI.aceptarAmistad(jugador)

    if (error == "") {
      document.getElementById("texto"+id)!.innerHTML = "¡Solicitud de " + jugador + " aceptada!";
      document.getElementById("botonAceptar"+id)!.style.display = 'none';
      document.getElementById("botonRechazar"+id)!.style.display = 'none';
    } else {
      Swal.fire({
        title: "Ha ocurrido un error al aceptar la solicitud de amistad",
        position: 'top',
        width: '50%',
        backdrop: false,
        html: error
      })
    }
  }
}
