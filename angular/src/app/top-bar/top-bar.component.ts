import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.css']
})
export class TopBarComponent implements OnInit {

  constructor(private router: Router, private http : HttpClient) {
      //display block, none
   }

  cookie:any;       
  nombre_usuario:any; 
  ancho:any;
  variableMostrar:boolean=false;
  puntos:any;
  notificaciones:any;

  ngOnInit(): void {
    this.nombre_usuario = this.getNombre_Usuario(document.cookie), 
    this.ancho = this.nombre_usuario.length > 100 ? this.nombre_usuario.length: 100;
    this.http.get(LlamadasAPI.URLApi+'/api/obtenerPerfil/' + this.nombre_usuario, {observe: 'body',responseType: 'text',withCredentials: true})
      .subscribe({
        next: (response) => {
          var jsonData = JSON.parse(response);

          this.puntos = jsonData.Puntos

          // Marca el dado en uso como tal, e inicializa la vista de dados por defecto
        }
          
      })
  }

  

  getNombre_Usuario(nombre:string) {
    nombre = nombre.split('=')[1];
    nombre = nombre.split('|')[0];
    return nombre;
  }

  cerrarSesion(){
    document.cookie = '';
    this.router.navigate(['/'])
  }

  mostrar(){
    if(this.variableMostrar){
      this.variableMostrar = false;
      document.getElementById("menu")!.style.display = "none";
    }
    else{
      this.variableMostrar = true;
      document.getElementById("menu")!.style.display = "block";
    }
  }
}
