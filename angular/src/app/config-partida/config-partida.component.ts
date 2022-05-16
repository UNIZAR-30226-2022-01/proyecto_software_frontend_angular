import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-config-partida',
  templateUrl: './config-partida.component.html',
  styleUrls: ['./config-partida.component.css']
})
export class ConfigPartidaComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    document.body.style.background = "#f8f9fc";
  }

}
