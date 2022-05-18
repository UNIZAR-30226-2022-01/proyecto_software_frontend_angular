import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import {Router} from "@angular/router";
import {Subject} from "rxjs";
import {LlamadasAPI} from "../llamadas-api";

@Component({
  selector: 'app-amigos',
  templateUrl: './amigos.component.html',
  styleUrls: ['./amigos.component.css']
})
export class AmigosComponent implements OnInit {

  constructor(private http: HttpClient, private router:Router){}

  ngOnInit(): void {
    document.body.style.background = "#f8f9fc";
    this.vacio.next(false);
    this.listarAmigos();
  }

  busqueda:any;
  amigos: any;

  vacio: Subject<boolean> = new Subject();

  onChangeEvent(event: any){
    this.http.get(LlamadasAPI.URLApi+'/api/obtenerUsuariosSimilares/'+event.target.value, {withCredentials: true})
    .subscribe(
      data => { this.busqueda = data })

  }

  //get patron() { return this.profileForm.get('patron')!; }
  consultarPerfil(nombre : string) {
    localStorage.setItem('nombre', nombre)
    this.router.navigate(['/perfil/'+nombre])
  }

  listarAmigos() {
    this.http.get(LlamadasAPI.URLApi+'/api/listarAmigos', {observe:'body', responseType:'text', withCredentials: true})
    .subscribe({
    next : (response) => {
      this.amigos = JSON.parse(response);
      if (this.amigos == null) {
        this.vacio.next(true)
      }
      else {
        this.vacio.next(false)
        this.amigos = JSON.parse(response);
      }
    }
    })
  }
}
