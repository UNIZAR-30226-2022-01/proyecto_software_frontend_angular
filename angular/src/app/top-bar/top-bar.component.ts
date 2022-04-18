import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.css']
})
export class TopBarComponent implements OnInit {

  constructor(private router: Router) {
    
   }

  cookie:any;       
  nombre_usuario:any; 
  ancho:any;

  ngOnInit(): void {
    this.cookie = localStorage.getItem('cookie'),
    this.nombre_usuario = this.getNombre_Usuario(localStorage.getItem('nombre_usuario')!), 
    this.ancho = this.nombre_usuario.length > 100 ? this.nombre_usuario.length: 100;
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
}
