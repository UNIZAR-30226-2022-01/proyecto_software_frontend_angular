import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit {

  nombre:any;
  email:any;
  descripcion:any;
  partidas_ganadas:any;
  partidas_totales:any;
  constructor(private http: HttpClient){}
  getNombre_Usuario(nombre:string) {
    nombre = nombre.split('=')[1];
    nombre = nombre.split('|')[0];
    return nombre;
  }

  ngOnInit(): void {
    this.nombre = this.getNombre_Usuario(document.cookie), 
    this.http.get<Perfil>('http://localhost:8090/api/obtenerPerfil/'+this.nombre, {observe:'body',withCredentials: true})
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
}
export interface Perfil {
  NombreUsuario: string;
  Email: string;
  Biografia: any;
  PartidasGanadas: any;
  PartidasTotales: any;

}
