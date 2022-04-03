import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-buscar-partida',
  templateUrl: './buscar-partida.component.html',
  styleUrls: ['./buscar-partida.component.css']
})
export class BuscarPartidaComponent implements OnInit {

  hola = 7;
  tipoPartida: string = "Partida privada";
  nAmigos: number = 0;
  jugadores: number = 0;
  constructor() { }

  ngOnInit(): void {
  }

}
