import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'top-bar-juego',
  templateUrl: './top-bar-juego.component.html',
  styleUrls: ['./top-bar-juego.component.css']
})
export class TopBarJuegoComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  mostrarHistorial(){
    console.log('Mostrar historial')
  }

  mostrarAyuda(){
    console.log('Mostrar ayuda')
  }

  rendirse(){
    console.log('Mostrar rendirse')
  }

  configuracion(){
    console.log('Mostrar configuracion')
  }
}
