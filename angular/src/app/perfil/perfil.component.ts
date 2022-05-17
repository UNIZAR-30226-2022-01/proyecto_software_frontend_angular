import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import {LlamadasAPI} from "../llamadas-api";

@Component({
  selector: 'perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})

export class PerfilComponent implements OnInit {
  nombre:any;
  puntos:any;
  descripcion:any;
  partidas_ganadas:any;
  partidas_totales:any;
  esAmigo:any;

  constructor(private http: HttpClient, private router:Router){

  }

  ngOnInit(): void {
    document.body.style.background = "#f8f9fc";
    this.nombre = localStorage.getItem('nombre')

    this.http.get<Perfil>(LlamadasAPI.URLApi+'/api/obtenerPerfil/' + this.nombre, {observe:'body',withCredentials: true})
        .subscribe(
          data => {console.log(data);
            //this.nombre = data.NombreUsuario,
            this.descripcion = data.Biografia,
            this.partidas_ganadas = data.PartidasGanadas,
            this.partidas_totales = data.PartidasTotales,
            this.puntos = data.Puntos;
            this.esAmigo = data.EsAmigo;
        })
  }

  enviarSolicitudAmistad(nombre : string) {
    this.http.post(LlamadasAPI.URLApi+'/api/enviarSolicitudAmistad/' + nombre, null, { observe:'response', responseType:'text', withCredentials: true})
      .subscribe({
        next :(response) => {Swal.fire({
                                        title: 'Solicitud de amistad enviada con exito',
                                        icon: 'success',
                                      });
                              this.router.navigate(['/amigos'])
                            },
        error: (error) => {Swal.fire({
                                    title: 'Se ha producido un error al enviar la solicitud de amistad',
                                    text: error.error,
                                    icon: 'error',
                                    })
                          }
      });
  }

  eliminarAmigo(nombre : string) {
    this.http.get(LlamadasAPI.URLApi+'/api/eliminarAmigo/'+nombre, { observe:'response', responseType:'text', withCredentials: true})
      .subscribe({
        next :(response) => {Swal.fire({
          title: 'Amigo eliminado con éxito',
          icon: 'success',
        });
          this.router.navigate(['/amigos'])
        },
        error: (error) => {Swal.fire({
          title: 'Se ha producido un error al eliminar el amigo',
          text: error.error,
          icon: 'error',
        })
        }
      });
  }


}
export interface Perfil {
  NombreUsuario: string;
  Email: string;
  Biografia: any;
  PartidasGanadas: any;
  PartidasTotales: any;
  Puntos:any;
  EsAmigo:any;
}
