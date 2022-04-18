import {BrowserAnimationsModule} from '@angular/platform-browser/animations'
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { PartidaComponent } from '../partida/partida.component';

@Component({
  selector: 'mapa',
  templateUrl: './mapa.component.html',
  styleUrls: ['./mapa.component.css'],

})
export class MapaComponent implements OnInit {

  ngOnInit(): void {

  }

}
