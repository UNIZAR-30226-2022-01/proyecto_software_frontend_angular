import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import {Router} from "@angular/router";

@Component({
  selector: 'app-amigos',
  templateUrl: './amigos.component.html',
  styleUrls: ['./amigos.component.css']
})
export class AmigosComponent implements OnInit {

  constructor(private http: HttpClient, private router:Router){}

  ngOnInit(): void {
    this.listarAmigos();
  }

  busqueda:any;
  amigos: any;
  vacio: boolean = true;
  onChangeEvent(event: any){
    this.http.get('http://localhost:8090/api/obtenerUsuariosSimilares/'+event.target.value, {withCredentials: true})
    .subscribe(
      data => { this.busqueda = data })

  }

  //get patron() { return this.profileForm.get('patron')!; }
  consultarPerfil(nombre : string) {
    localStorage.setItem('nombre', nombre)
    this.router.navigate(['/perfil/'+nombre])
  }

  listarAmigos() {
    this.http.get(`http://localhost:8090/api/listarAmigos`, {observe:'body', responseType:'text', withCredentials: true})
    .subscribe({
    next : (response) => {
      this.amigos = JSON.parse(response);
      if (Object.keys(response).length == 0) {
        this.vacio = true;
      }
      else {
        this.vacio = false;
        this.amigos = JSON.parse(response);
      }
    }
    })
  }
}
