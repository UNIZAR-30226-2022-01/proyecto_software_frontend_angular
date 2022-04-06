import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-buscar-partida',
  templateUrl: './buscar-partida.component.html',
  styleUrls: ['./buscar-partida.component.css']
})
export class BuscarPartidaComponent implements OnInit {

  hola = 5;
  jsonArray: any;
  constructor(private http: HttpClient) {
  }

  ngOnInit(): void {
    console.log(document.cookie),
    this.http.get('http://localhost:8090/api/obtenerPartidas', {withCredentials: true}).subscribe(data => {
      console.log(data);
      this.jsonArray = data;
    })
  }

}
