import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {LlamadasAPI} from "../llamadas-api";

@Component({
  selector: 'app-mi-perfil',
  templateUrl: './mi-perfil.component.html',
  styleUrls: ['./mi-perfil.component.css']
})
export class MiPerfilComponent implements OnInit {
   nombre:any;
    email:any;
    descripcion:any;
    partidas_ganadas:any;
    partidas_totales:any;
    constructor(private http: HttpClient, private router:Router){}

    getNombre_Usuario(nombre:string) {
      nombre = nombre.split('=')[1];
      nombre = nombre.split('|')[0];
      return nombre;
    }

    amigos:any;
    ngOnInit(): void {
      document.body.style.background = "#f8f9fc";
      this.nombre = this.getNombre_Usuario(document.cookie),
      this.http.get<Perfil>(LlamadasAPI.URLApi+'/api/obtenerPerfil/'+this.nombre, {observe:'body',withCredentials: true})
          .subscribe(
            data => {console.log(data);
              //this.nombre = data.NombreUsuario,
              //this.descripcion = data.Biografia,
              this.partidas_ganadas = data.PartidasGanadas,
              this.partidas_totales = data.PartidasTotales,
              this.email = data.Email;
          })
      this.descripcion='Apasionado de los juegos de mesa. En mis tiempos libres soy ingeniero'
    }

    listaAmigos(){
      this.http.get<any>(LlamadasAPI.URLApi+'/api/listarAmigos', {observe:'body',withCredentials: true})
          .subscribe(
            data => {this.amigos = data})
    }

    perfil(amigo:string){
      this.router.navigate(['/perfil', amigo])
    }
  }
  export interface Perfil {
    NombreUsuario: string;
    Email: string;
    Biografia: any;
    PartidasGanadas: any;
    PartidasTotales: any;

  }
