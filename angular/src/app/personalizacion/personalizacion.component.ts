import { Component, OnInit } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Estado} from "../logica-juego";
import Swal from "sweetalert2";
import {LlamadasAPI} from "../llamadas-api";

@Component({
  selector: 'personalizacion',
  templateUrl: './personalizacion.component.html',
  styleUrls: ['./personalizacion.component.css']
})
export class PersonalizacionComponent implements OnInit {

  constructor(private http : HttpClient){}

  yo : string = ""
  dados: item[] = []
  avatares: item[] = []

  indiceDadoActual : number = 0;
  indiceAvatarActual : number = 0;

  dadoCambiado : boolean = false;
  avatarCambiado : boolean = false;

  puntos : number = 0

  llamadasAPI : LlamadasAPI = new LlamadasAPI(this.http);

  ngOnInit(): void {
    var nombre_usuario = localStorage.getItem("nombre_usuario")!
    nombre_usuario = nombre_usuario.split('=')[1]
    nombre_usuario = nombre_usuario.split('|')[0]

    this.yo = nombre_usuario
    this.dados = []

    // Consulta la colección de items
    this.http.get('http://localhost:8090/api/consultarColeccion/'+this.yo, {observe:'body', responseType:'text', withCredentials: true})
      .subscribe({
        next :(response) => {
          var jsonData = JSON.parse(response);

          for(var i = 0; i < jsonData.length; i++) {
            var item: item = {
              id: jsonData[i].Id,
              nombre: jsonData[i].Nombre,
              descripcion: jsonData[i].Descripcion,
              precio: jsonData[i].Precio,
            }

            if (jsonData[i].Tipo == "dado") {
              this.dados.push(item)
            } else { // Avatar
              this.avatares.push(item)
            }
          }

          // Obtiene los que tiene equipados
          this.http.get('http://localhost:8090/api/obtenerPerfil/'+this.yo, {observe:'body', responseType:'text', withCredentials: true})
            .subscribe({
              next :(response) => {
                var jsonData = JSON.parse(response);

                this.puntos = jsonData.Puntos

                this.dados.forEach((dado, index) => {
                  if (dado.id == jsonData.ID_dado) {
                    //this.dadoActual = item
                    this.indiceDadoActual = index
                    document.getElementById("enUsoDado"+this.indiceDadoActual)!.style.display ="block";
                  }

                  document.getElementById("nombreItemActual")!.innerHTML = this.dados[this.indiceDadoActual].nombre;
                  document.getElementById("descripcionItemActual")!.innerHTML = this.dados[this.indiceDadoActual].descripcion;
                })

                this.avatares.forEach((avatar, index) => {
                  if (avatar.id == jsonData.ID_avatar) {
                    //this.dadoActual = item
                    this.indiceAvatarActual = index
                    document.getElementById("enUsoAvatar"+this.indiceAvatarActual)!.style.display ="block";
                  }
                })
              }})
        }})
  }

  mostrarDados() {
    var avatares = Array.from(document.getElementsByClassName("avatar") as HTMLCollectionOf<HTMLElement>)
    for (let i = 0; i < avatares.length; i++) {
      avatares[i].style.display = "none";
    }

    var dados = Array.from(document.getElementsByClassName("dado") as HTMLCollectionOf<HTMLElement>)
    for (let i = 0; i < dados.length; i++) {
      dados[i].style.display = "block";
    }

    document.getElementById("nombreItemActual")!.innerHTML = this.dados[this.indiceDadoActual].nombre;
    document.getElementById("descripcionItemActual")!.innerHTML = this.dados[this.indiceDadoActual].descripcion;
  }

  mostrarAvatares() {
    var avatares = Array.from(document.getElementsByClassName("avatar") as HTMLCollectionOf<HTMLElement>)
    for (let i = 0; i < avatares.length; i++) {
      avatares[i].style.display = "block";
    }

    var dados = Array.from(document.getElementsByClassName("dado") as HTMLCollectionOf<HTMLElement>)
    for (let i = 0; i < dados.length; i++) {
      dados[i].style.display = "none";
    }

    document.getElementById("nombreItemActual")!.innerHTML = this.avatares[this.indiceAvatarActual].nombre;
    document.getElementById("descripcionItemActual")!.innerHTML = this.avatares[this.indiceAvatarActual].descripcion;
  }

  cambiarItemEnUso(nuevo : number) {
    if (this.dadoCambiado) {
      this.dadoCambiado = false

      document.getElementById("enUsoDado"+this.indiceDadoActual)!.style.display ="none";

      this.dados.forEach((dado, index) => {
        if (dado.id == nuevo) {
          this.indiceDadoActual = index
          document.getElementById("enUsoDado"+this.indiceDadoActual)!.style.display ="block";
        }
      })

      document.getElementById("nombreItemActual")!.innerHTML = this.dados[this.indiceDadoActual].nombre;
      document.getElementById("descripcionItemActual")!.innerHTML = this.dados[this.indiceDadoActual].descripcion;

    } else {
      this.avatarCambiado = false
      document.getElementById("enUsoAvatar"+this.indiceAvatarActual)!.style.display ="none";

      this.avatares.forEach((avatar, index) => {
        if (avatar.id == nuevo) {
          this.indiceAvatarActual = index
          document.getElementById("enUsoAvatar"+this.indiceAvatarActual)!.style.display ="block";
        }
      })

      document.getElementById("nombreItemActual")!.innerHTML = this.avatares[this.indiceAvatarActual].nombre;
      document.getElementById("descripcionItemActual")!.innerHTML = this.avatares[this.indiceAvatarActual].descripcion;
    }

  }

  sinCambioEnItemEnUso(viejo : number, nuevo : number) {
    this.dadoCambiado = false
    this.avatarCambiado = false
  }

  cambiarDado(i : number) {
    this.dadoCambiado = true

    Swal.fire({
      title: "¿Quieres cambiar tus dados por"+ this.dados[i].nombre +" ?",
      icon: 'question',
      showDenyButton: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.llamadasAPI.cambiarAspecto(this.dados[i].id, this)
      }
    });
  }

  cambiarAvatar(i : number) {
    this.avatarCambiado = true

    Swal.fire({
      title: "¿Quieres cambiar tu avatar por"+ this.avatares[i].nombre +" ?",
      icon: 'question',
      showDenyButton: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.llamadasAPI.cambiarAspecto(this.avatares[i].id, this)
      }
    });
  }
}

export class item {
  id: number = 0
  nombre: string = ""
  descripcion: string = ""
  precio: number = 0
}
