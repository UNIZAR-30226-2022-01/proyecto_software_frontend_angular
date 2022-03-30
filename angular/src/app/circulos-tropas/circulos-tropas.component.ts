import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'circulos-tropas',
  templateUrl: './circulos-tropas.component.html',
  styleUrls: ['./circulos-tropas.component.css']
})
export class CirculosTropasComponent implements OnInit {

  @Input() nTropas: any = 1;
  @Input() coordX: any = 1;
  @Input() coordY: any = 1;

  constructor() { }

  ngOnInit(): void {
  }

}
