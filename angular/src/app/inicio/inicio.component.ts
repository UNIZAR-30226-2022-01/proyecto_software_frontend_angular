import { Component, OnInit } from '@angular/core';
@Component({
  selector: 'inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css']
})
export class InicioComponent implements OnInit {

  constructor() { }

  videoID = "../../assets/videoInicio.mp4"

  ngOnInit(): void {
  }

}
