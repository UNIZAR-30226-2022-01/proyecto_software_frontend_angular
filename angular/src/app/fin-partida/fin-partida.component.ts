import { Component, OnInit } from '@angular/core';
import {Estado} from "../logica-juego";
import {jugadorFinPartida} from "../juego/juego.component";

@Component({
  selector: 'app-fin-partida',
  templateUrl: './fin-partida.component.html',
  styleUrls: ['./fin-partida.component.css']
})
export class FinPartidaComponent implements OnInit {
  esGanador : string = "";
  ganador : string = "";
  yo : string = "";

  rutaAssetTop : string = "";

  textoGanador : string = "";
  textoGanadorAlt : string = "";

  jugadores  = new Array<jugadorFinPartida>();

  constructor() { }

  ngOnInit(): void {
    this.esGanador = localStorage.getItem("esGanador")!
    this.ganador = localStorage.getItem("ganador")!
    this.yo = localStorage.getItem("yo")!


    if (this.esGanador == "1") {
      this.textoGanador = "¡HAS GANADO!"
      this.textoGanadorAlt = "Bien jugado, " + this.ganador
      this.rutaAssetTop = "/assets/estrella.png"
    } else {
      this.textoGanador =  "¡HAS PERDIDO!"
      this.textoGanadorAlt = "La próxima vez será..."
      this.rutaAssetTop = "/assets/derrota.gif"
    }

    this.jugadores = JSON.parse(localStorage.getItem("jugadores")!)

    console.log("jugadores:", this.jugadores)
  }

}
