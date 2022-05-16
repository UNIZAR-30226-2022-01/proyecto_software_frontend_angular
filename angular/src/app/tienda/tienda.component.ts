import { Component, OnInit } from '@angular/core';
import {LlamadasAPI} from "../llamadas-api";
import {HttpClient} from "@angular/common/http";
import {Router} from "@angular/router";
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import Swal from "sweetalert2";
import {item} from "../personalizacion/personalizacion.component";

@Component({
  selector: 'tienda',
  templateUrl: './tienda.component.html',
  styleUrls: ['./tienda.component.css']
})
export class TiendaComponent implements OnInit {

  constructor(private http : HttpClient, private sanitizer : DomSanitizer){}

  yo : string = ""
  // Vectores de ítems separados, para las templates
  dados: item[] = []
  avatares: item[] = []

  // Flags de cambio, escritas por callback desde los botones de selección de dados o avatares
  dadoComprado : boolean = false;
  avatarComprado : boolean = false;

  puntos : number = 0

  llamadasAPI : LlamadasAPI = new LlamadasAPI(this.http);

  // Callback de llamadasAPI.obtenerImagenItem, que indica que se debe cambiar la imagen con id indicado por el blob
  introducirImagen(blob : any, id : string) {
    const img = URL.createObjectURL(blob);
    //this.prueba = this.sanitizer.bypassSecurityTrustUrl(unsafeImg);
    //this.avatar = window.URL.createObjectURL(blob);
    var imagen = document.getElementById(String(id))! as HTMLImageElement;

    imagen.src = img;
  }

  async ngOnInit(): Promise<void> {
    document.body.style.background = "#f8f9fc";
    var nombre_usuario = localStorage.getItem("nombre_usuario")!
    nombre_usuario = nombre_usuario.split('=')[1]
    nombre_usuario = nombre_usuario.split('|')[0]

    this.yo = nombre_usuario

    // Consulta la colección de items
    this.http.get('http://localhost:8090/api/consultarTienda', {
      observe: 'body',
      responseType: 'text',
      withCredentials: true
    }).subscribe({
      next: (response) => {
        var jsonData = JSON.parse(response);

        for (var i = 0; i < jsonData.length; i++) {
          var item: item = {
            id: jsonData[i].Id,
            nombre: jsonData[i].Nombre,
            descripcion: jsonData[i].Descripcion,
            precio: jsonData[i].Precio,
            blob: jsonData[i].Imagen,
            comprado: false
          }

          if (jsonData[i].Tipo == "dado") {
            this.dados.push(item)
          } else { // Avatar
            this.avatares.push(item)
          }
        }

        // Obtiene los ítems que tiene comprados
        this.http.get('http://localhost:8090/api/consultarColeccion/' + this.yo, {
          observe: 'body',
          responseType: 'text',
          withCredentials: true
        })
          .subscribe({
            next: (response) => {
              var jsonData = JSON.parse(response);



              // Para cada ítem devuelto, lo marca como comprado en las colecciones de la clase
              for (var i = 0; i < jsonData.length; i++) {
                if (jsonData[i].Tipo == "dado") {
                  this.dados.forEach((dado, index) => {
                    if (jsonData[i].Id == dado.id) {
                      this.dados[index].comprado = true
                    }
                  })
                } else { // Avatar
                  this.avatares.forEach((avatar, index) => {
                    if (jsonData[i].Id == avatar.id) {
                      this.avatares[index].comprado = true
                    }
                  })
                }
              }
            }

          })

        // Obtiene los puntos que tiene el usuario
        this.http.get('http://localhost:8090/api/obtenerPerfil/' + this.yo, {
          observe: 'body',
          responseType: 'text',
          withCredentials: true
        })
          .subscribe({
            next: (response) => {
              var jsonData = JSON.parse(response);

              this.puntos = jsonData.Puntos
            }})
      }
    })
  }

  // Una vez cargados los datos en la template de HTML, introduce las imagenes
  ngAfterViewInit() {
    // Por algún motivo, solo funciona ejecutándolo asíncronamente
    setTimeout(() => {
      for (let i = 0; i < this.dados.length; i++) {
        this.llamadasAPI.obtenerImagenItem(this, String(this.dados[i].id))

        // Indicar que está comprado con una alerta y en el botón
        if (this.dados[i].comprado) {
          document.getElementById("botonEquiparDado"+i)!.className = "btn btn-success"
          document.getElementById("botonEquiparDado"+i)!.innerHTML = "Comprado"
          document.getElementById("botonEquiparDado"+i)!.setAttribute('disabled',"");
        }

      }

      for (let i = 0; i < this.avatares.length; i++) {
        this.llamadasAPI.obtenerImagenItem(this, String(this.avatares[i].id))

        if (this.avatares[i].comprado) {
          document.getElementById("botonEquiparAvatar"+i)!.className = "btn btn-success"
          document.getElementById("botonEquiparAvatar"+i)!.innerHTML = "Comprado"
          document.getElementById("botonEquiparAvatar"+i)!.setAttribute('disabled',"");
        }
      }

      this.mostrarDados()
    }, 100);
  }

  // Cambia la vista de ítems a los dados
  mostrarDados() {
    // Ocultar avatares
    var avatares = Array.from(document.getElementsByClassName("avatar") as HTMLCollectionOf<HTMLElement>)
    for (let i = 0; i < avatares.length; i++) {
      avatares[i].style.display = "none";
    }

    // Mostrar dados
    var dados = Array.from(document.getElementsByClassName("dado") as HTMLCollectionOf<HTMLElement>)
    for (let i = 0; i < dados.length; i++) {
      dados[i].style.display = "block";
    }
  }

  // Cambia la vista de ítems a los avatares
  mostrarAvatares() {
    // Mostrar avatares
    var avatares = Array.from(document.getElementsByClassName("avatar") as HTMLCollectionOf<HTMLElement>)
    for (let i = 0; i < avatares.length; i++) {
      avatares[i].style.display = "block";
    }

    // Ocultar dados
    var dados = Array.from(document.getElementsByClassName("dado") as HTMLCollectionOf<HTMLElement>)
    for (let i = 0; i < dados.length; i++) {
      dados[i].style.display = "none";
    }
  }


  marcarItemComprado(nuevo : number) {
    if (this.dadoComprado) { // Valor escrito previamente por el callback de llamadasAPI
      this.dadoComprado = false

      // Muestra el nuevo como comprado
      this.dados.forEach((dado, index) => {
        if (dado.id == nuevo) {
          this.puntos = this.puntos - dado.precio

          document.getElementById("botonEquiparDado"+index)!.className = "btn btn-success"
          document.getElementById("botonEquiparDado"+index)!.innerHTML = "Comprado"
          document.getElementById("botonEquiparDado"+index)!.setAttribute('disabled',"");
        }
      })
    } else {
      this.avatarComprado = false

      // Muestra el nuevo como comprado
      this.avatares.forEach((avatar, index) => {
        if (avatar.id == nuevo) {
          this.puntos = this.puntos - avatar.precio

          document.getElementById("botonEquiparAvatar"+index)!.className = "btn btn-success"
          document.getElementById("botonEquiparAvatar"+index)!.innerHTML = "Comprado"
          document.getElementById("botonEquiparAvatar"+index)!.setAttribute('disabled',"");
        }
      })
    }

  }

  sinCambioItemComprado() {
    this.dadoComprado = false
    this.avatarComprado = false
  }

  // Diálogos de compra con llamadas a llamadasAPI

  comprarDado(i : number) {
    this.dadoComprado = true

    Swal.fire({
      title: "¿Quieres comprar los dados "+ this.dados[i].nombre +" por " + this.dados[i].precio  +" puntos?",
      icon: 'question',
      showDenyButton: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.llamadasAPI.comprarAspecto(this.dados[i].id, this) // Hace callback a this.marcarItemComprado(item)
      }
    });
  }

  comprarAvatar(i : number) {
    this.avatarComprado = true

    Swal.fire({
      title: "¿Quieres comprar el avatar "+ this.avatares[i].nombre +" por " + this.avatares[i].precio  +" puntos?",
      icon: 'question',
      showDenyButton: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.llamadasAPI.comprarAspecto(this.avatares[i].id, this) // Hace callback a this.marcarItemComprado(item)
      }
    });
  }

  // Callback de llamadasAPI.cambiarAspecto para indicar que no se ha cambiado ningún ítem (caso de error)
  sinCambioEnItemEnUso(viejo : number, nuevo : number) {
    this.dadoComprado = false
    this.avatarComprado = false
  }
}
