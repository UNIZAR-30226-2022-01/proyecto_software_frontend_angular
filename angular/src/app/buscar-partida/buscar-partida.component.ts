import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormControl, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-buscar-partida',
  templateUrl: './buscar-partida.component.html',
  styleUrls: ['./buscar-partida.component.css']
})
export class BuscarPartidaComponent implements OnInit {

  hola = 5;
  jsonArray: any;
  constructor(private fb: FormBuilder, private http: HttpClient) {
  }

  profileForm = this.fb.group({
    idPartida: new FormControl('7'),
    password: new FormControl('',),
  });

  ngOnInit(): void {
    this.http.get('http://localhost:8090/api/obtenerPartidas', {withCredentials: true}).subscribe(data => {
      console.log(data);
      this.jsonArray = data;
    })
  }

  onSubmit(){
    //"password" e "idPartida"
    var formData: any = new FormData();
    formData.append('idPartida', "7");
    formData.append('password', "");
    this.http.post('http://localhost:8090/api/unirseAPartida', formData, {withCredentials: true})
      .subscribe(data => {
          console.log(data);
      })
  }
}
