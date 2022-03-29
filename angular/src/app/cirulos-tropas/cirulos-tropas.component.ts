import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'cirulos-tropas',
  templateUrl: './cirulos-tropas.component.html',
  styleUrls: ['./cirulos-tropas.component.css']
})
export class CirulosTropasComponent implements OnInit {

  @Input() nTropas: any;
  @Input() coordX: any;
  @Input() coordY: any;

  constructor() { }

  ngOnInit(): void {
  }

}
