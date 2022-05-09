import { Component, OnInit } from '@angular/core';
import {LlamadasAPI} from "../llamadas-api";
import {HttpClient} from "@angular/common/http";
import {Router} from "@angular/router";
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';

@Component({
  selector: 'tienda',
  templateUrl: './tienda.component.html',
  styleUrls: ['./tienda.component.css']
})
export class TiendaComponent implements OnInit {

  constructor(private http: HttpClient, private router:Router, private sanitizer : DomSanitizer){}

  llamadasAPI : LlamadasAPI = new LlamadasAPI(this.http);

  avatar: SafeUrl | null = null;

  ngOnInit(): void {
    //var avatar = this.llamadasAPI.obtenerAvatar(this, "jugador1")
    this.llamadasAPI.obtenerImagenItem(this, "1")
  }

  cambiarAvatar(blob : any, usuario : string) {
    const unsafeImg = URL.createObjectURL(blob);
    this.avatar = this.sanitizer.bypassSecurityTrustUrl(unsafeImg);
    //this.avatar = window.URL.createObjectURL(blob);
  }

  introducirImagen(blob : any, id : string) {
    const unsafeImg = URL.createObjectURL(blob);
    this.avatar = this.sanitizer.bypassSecurityTrustUrl(unsafeImg);
    //this.avatar = window.URL.createObjectURL(blob);
  }
}
