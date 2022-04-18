import { animate, style, transition, trigger } from '@angular/animations';
import { Component, Inject, Injectable, OnInit } from '@angular/core';

@Component({
  selector: 'app-partida',
  templateUrl: './partida.component.html',
  styleUrls: ['./partida.component.css'],
  animations: [
    trigger('mostrarSlide', [
      transition(':enter', [
        style({transform: 'translateY(100%)', opacity: '0'}),
        animate('200ms ease-in', style({transform: 'translateY(0%)', opacity: '1'}))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({transform: 'translateY(100%)', opacity: '0'})),
      ])
    ]),
  ]
})


export class PartidaComponent implements OnInit {
  mapaInfo: number = 0;
  isShow = false;
  source = "https://img.icons8.com/material-rounded/48/000000/bar-chart.png";


  toggleDisplay() {
    this.isShow = !this.isShow;
  }

  changeImage() {
    if (!this.isShow) {
      this.source = "https://img.icons8.com/material-rounded/48/000000/bar-chart.png";
      
    }
    else {
      this.source = "https://img.icons8.com/external-flaticons-lineal-color-flat-icons/64/000000/external-cross-100-most-used-icons-flaticons-lineal-color-flat-icons.png";
    }

  }

  public setMapaInfo(): void {
    this.mapaInfo = 1;
  }

  public setMapa(): void {
    this.mapaInfo = 0;
  }
  ngOnInit(): void {
  }

}
