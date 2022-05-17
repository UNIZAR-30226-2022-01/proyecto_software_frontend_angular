import {AfterViewInit, Component, OnInit} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Estado} from "../logica-juego";
import Swal from "sweetalert2";
import {LlamadasAPI} from "../llamadas-api";
import {DomSanitizer, SafeUrl} from "@angular/platform-browser";

@Component({
  selector: 'personalizacion',
  templateUrl: './personalizacion.component.html',
  styleUrls: ['./personalizacion.component.css']
})
export class PersonalizacionComponent implements OnInit, AfterViewInit{

  constructor(private http : HttpClient, private sanitizer : DomSanitizer){}

  yo : string = ""
  // Vectores de ítems separados, para las templates
  dados: item[] = []
  avatares: item[] = []

  // Índices (no IDs) de los dados y avatares usados, relativos a los vectores
  indiceDadoActual : number = 0;
  indiceAvatarActual : number = 0;

  // Flags de cambio, escritas por callback desde los botones de selección de dados o avatares
  dadoCambiado : boolean = false;
  avatarCambiado : boolean = false;

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
    this.http.get(LlamadasAPI.URLApi+'/api/consultarColeccion/' + this.yo, {
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

          // Obtiene los ítems que tiene equipados
          this.http.get(LlamadasAPI.URLApi+'/api/obtenerPerfil/' + this.yo, {
            observe: 'body',
            responseType: 'text',
            withCredentials: true
          })
            .subscribe({
              next: (response) => {
                var jsonData = JSON.parse(response);

                this.puntos = jsonData.Puntos

                // Marca el dado en uso como tal, e inicializa la vista de dados por defecto
                this.dados.forEach((dado, index) => {
                  if (dado.id == jsonData.ID_dado) {
                    this.indiceDadoActual = index
                    document.getElementById("enUsoDado" + this.indiceDadoActual)!.style.display = "block";
                  }

                  document.getElementById("nombreItemActual")!.innerHTML = this.dados[this.indiceDadoActual].nombre;
                  document.getElementById("descripcionItemActual")!.innerHTML = this.dados[this.indiceDadoActual].descripcion;

                  // Espera a obtener las imagenes, y la inserta en el actual
                  setTimeout(() => {
                    var imagen = document.getElementById("imagenActual")! as HTMLImageElement
                    imagen.src = (document.getElementById(String(dado.id))! as HTMLImageElement).src
                  }, 100);
                })

                // Marca el avatar en uso como tal y oculta su botón de equipar
                this.avatares.forEach((avatar, index) => {
                  if (avatar.id == jsonData.ID_avatar) {
                    this.indiceAvatarActual = index
                    document.getElementById("enUsoAvatar" + this.indiceAvatarActual)!.style.display = "block";
                  }
                })
              }
            })
        }
      })
  }

  // Una vez cargados los datos en la template de HTML, introduce las imagenes
  ngAfterViewInit() {
    // Por algún motivo, solo funciona ejecutándolo asíncronamente
    setTimeout(() => {
      for (let dado of this.dados) {
        this.llamadasAPI.obtenerImagenItem(this, String(dado.id))
      }

      for (let avatar of this.avatares) {
        this.llamadasAPI.obtenerImagenItem(this, String(avatar.id))
      }
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

    // Mostrar el dado actual
    document.getElementById("nombreItemActual")!.innerHTML = this.dados[this.indiceDadoActual].nombre;
    document.getElementById("descripcionItemActual")!.innerHTML = this.dados[this.indiceDadoActual].descripcion;

    // Reemplaza la imagen
    var imagen = document.getElementById("imagenActual")! as HTMLImageElement
    imagen.src = (document.getElementById(String(this.dados[this.indiceDadoActual].id))! as HTMLImageElement).src
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

    // Mostrar el avatar actual
    document.getElementById("nombreItemActual")!.innerHTML = this.avatares[this.indiceAvatarActual].nombre;
    document.getElementById("descripcionItemActual")!.innerHTML = this.avatares[this.indiceAvatarActual].descripcion;

    // Reemplaza la imagen
    var imagen = document.getElementById("imagenActual")! as HTMLImageElement
    imagen.src = (document.getElementById(String(this.avatares[this.indiceAvatarActual].id))! as HTMLImageElement).src
  }

  // Cambia el ítem en uso por uno nuevo con el ID dado, y muestra el texto de "En uso" en dicho ítem, según sea un dado
  // o un avatar
  cambiarItemEnUso(nuevo : number) {
    if (this.dadoCambiado) { // Valor escrito previamente por el callback de llamadasAPI
      this.dadoCambiado = false

      // Deja de mostrar el actual como en uso
      document.getElementById("enUsoDado"+this.indiceDadoActual)!.style.display ="none";

      // Y muestra el nuevo como en uso
      this.dados.forEach((dado, index) => {
        if (dado.id == nuevo) {
          this.indiceDadoActual = index
          document.getElementById("enUsoDado"+this.indiceDadoActual)!.style.display ="block";
        }
      })

      document.getElementById("nombreItemActual")!.innerHTML = this.dados[this.indiceDadoActual].nombre;
      document.getElementById("descripcionItemActual")!.innerHTML = this.dados[this.indiceDadoActual].descripcion;

      // Reemplaza la imagen
      var imagen = document.getElementById("imagenActual")! as HTMLImageElement
      imagen.src = (document.getElementById(String(this.dados[this.indiceDadoActual].id))! as HTMLImageElement).src
    } else {
      this.avatarCambiado = false

      // Deja de mostrar el actual como en uso
      document.getElementById("enUsoAvatar"+this.indiceAvatarActual)!.style.display ="none";

      // Y muestra el nuevo como en uso
      this.avatares.forEach((avatar, index) => {
        if (avatar.id == nuevo) {
          this.indiceAvatarActual = index
          document.getElementById("enUsoAvatar"+this.indiceAvatarActual)!.style.display ="block";
        }
      })

      document.getElementById("nombreItemActual")!.innerHTML = this.avatares[this.indiceAvatarActual].nombre;
      document.getElementById("descripcionItemActual")!.innerHTML = this.avatares[this.indiceAvatarActual].descripcion;

      // Reemplaza la imagen
      var imagen = document.getElementById("imagenActual")! as HTMLImageElement
      imagen.src = (document.getElementById(String(this.avatares[this.indiceAvatarActual].id))! as HTMLImageElement).src
    }

  }

  // Diálogos de cambio con llamadas a llamadasAPI

  cambiarDado(i : number) {
    this.dadoCambiado = true

    Swal.fire({
      title: "¿Quieres cambiar tus dados por "+ this.dados[i].nombre +" ?",
      icon: 'question',
      showDenyButton: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.llamadasAPI.cambiarAspecto(this.dados[i].id, this) // Hace callback a this.cambiarItemEnUso(item)
      }
    });
  }

  cambiarAvatar(i : number) {
    this.avatarCambiado = true

    Swal.fire({
      title: "¿Quieres cambiar tu avatar por "+ this.avatares[i].nombre +" ?",
      icon: 'question',
      showDenyButton: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.llamadasAPI.cambiarAspecto(this.avatares[i].id, this) // Hace callback a this.cambiarItemEnUso(item)
      }
    });
  }

  // Callback de llamadasAPI.cambiarAspecto para indicar que no se ha cambiado ningún ítem (caso de error)
  sinCambioEnItemEnUso(viejo : number, nuevo : number) {
    this.dadoCambiado = false
    this.avatarCambiado = false
  }
}

export class item {
  id: number = 0
  nombre: string = ""
  descripcion: string = ""
  precio: number = 0
  blob : Blob | undefined
  comprado: boolean = false
}
