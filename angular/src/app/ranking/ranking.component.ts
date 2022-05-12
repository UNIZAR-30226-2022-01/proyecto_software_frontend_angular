import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'ranking',
  templateUrl: './ranking.component.html',
  styleUrls: ['./ranking.component.css']
})
export class RankingComponent implements OnInit {
  //api/ranking Tipo: GET
  yo:any;
  miPosicion:any;
  noSoyTop:any;
  misPartidasGanadas:any;
  misPartidasTotales:any; 

  getNombreUsuario(nombre:string) {
    nombre = nombre.split('=')[1];
    nombre = nombre.split('|')[0];
    return nombre;
  }

  constructor(private http: HttpClient) { }
  jugadores:any;
  
  ngOnInit(): void {
    this.yo = this.getNombreUsuario(document.cookie);

    this.http.get('http://localhost:8090/api/ranking', {observe:'body', responseType:'text', withCredentials: true})
      .subscribe({
        next :(response) => {
          var todosJugadores = JSON.parse(response);
          var misDatos = todosJugadores.find((element: any) => element.NombreUsuario == this.yo);
          this.misPartidasGanadas = misDatos!.PartidasGanadas;
          this.miPosicion = todosJugadores.findIndex((element: any) => element.NombreUsuario == this.yo);
          
          if (this.miPosicion > 10){
            this.noSoyTop = true;
          }
          else{
            this.noSoyTop = false;
          }
          this.jugadores = todosJugadores.slice(0,10);
        }})
    
    
  }

}
