import {BrowserAnimationsModule} from '@angular/platform-browser/animations'
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Observable } from 'rxjs/internal/Observable';

@Component({
  selector: 'mapa',
  templateUrl: './mapa.component.html',
  styleUrls: ['./mapa.component.css'],

})
export class MapaComponent implements OnInit {

  paisSeleccionado : string = "";// = new Observable<string>();

  escucharClicks : boolean = false;

  ngOnInit(): void {

  }
  // cosa1 | cosan

  cambiarTerritorioSeleccionado(pais:string) {
    if (this.escucharClicks) {
      this.paisSeleccionado = pais;
      console.log(pais)
    }
  }
  
  limitarSeleccionTerritorios() {
    this.escucharClicks = false;
  }

  permitirSeleccionTerritorios() {
    this.escucharClicks = true;
    this.paisSeleccionado = "";

    console.log("adelante señor")
  }
}
