import { trigger, transition, style, animate } from '@angular/animations';
import { HttpClient } from '@angular/common/http';
import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import { Router } from '@angular/router';
import {Alerta, Estado, LogicaJuego} from '../logica-juego';
import Swal, {SweetAlertResult} from "sweetalert2";
import { interval, take } from 'rxjs';
import {MapaComponent} from "../mapa/mapa.component";
import { SelectMultipleControlValueAccessor } from '@angular/forms';
import {LlamadasAPI} from "../llamadas-api";

@Component({
  selector: 'juego',
  templateUrl: './juego.component.html',
  styleUrls: ['./juego.component.css'],
  animations: [
    trigger('mostrarSlide', [
      transition(':enter', [
        style({transform: 'translateY(100%)', opacity: '0'}),
        animate('200ms ease-in', style({transform: 'translateY(0%)', opacity: '1'}))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({transform: 'translateY(100%)', opacity: '0'})),
      ])
    ]),
  ]
})

export class JuegoComponent implements OnInit, AfterViewInit {
  @ViewChild(MapaComponent) mapa: any;

  territorios = ["Australia_Oriental", "Indonesia", "Nueva_Guinea", "Alaska", "Ontario", "Territorio_del_Noroeste", "Venezuela", "Madagascar", "Africa_del_Norte", "Groenlandia",
                  "Islandia", "Reino_Unido", "Escandinavia", "Japon", "Yakutsk", "Kamchatka", "Siberia", "Ural", "Afganistan", "Oriente_Medio",
                  "India", "Siam", "China", "Mongolia", "Irkutsk", "Ucrania", "Europa_del_Sur", "Europa_Occidental", "Europa_del_Norte", "Egipto",
                  "Africa_Oriental", "Congo", "Sudafrica", "Brasil", "Argentina", "Este_de_los_Estados_Unidos", "Estados_Unidos_Occidental", "Quebec",
                  "America_Central", "Peru", "Australia_Occidental", "Alberta"];

                  info: number = 0;
  isShow = false;
  source = "https://img.icons8.com/material-rounded/48/000000/bar-chart.png";

  toggleDisplay() { this.isShow = !this.isShow;}

  changeImage() {
    if (!this.isShow) {this.source = "https://img.icons8.com/material-rounded/48/000000/bar-chart.png";}
    else {this.source = "https://img.icons8.com/external-flaticons-lineal-color-flat-icons/64/000000/external-cross-100-most-used-icons-flaticons-lineal-color-flat-icons.png";}
  }

  setMapa() {this.info = 0;}
  setMapaInfo() {this.info = 1;}

  delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }

  constructor(private http: HttpClient, private router:Router){}

  ngOnInit(): void {
    var volviendo = localStorage.getItem("volviendo")

    if (volviendo == null) {
      this.ejecutarAutomata()
    } else {
      localStorage.removeItem("volviendo")
      this.obtenerEstadoCompleto()
      this.ejecutarAutomata()
    }
  }


  jsonData: any;
  intervaloConsultaEstado:any;
  i:any;
  logica:any;

  tiempo = 0;
  vez = 0;
  index = Array<number>();
  jugador = Array<string>();
  intervalos = Array<any>();
  todoOk:boolean = false;
  //primeraVez = 42;

  intervarloConsultaTerritorio : any;
  territorio1 : string = "";
  territorio2 : string = "";

  resultadoAlerta : Promise<SweetAlertResult> | undefined ;

  tropasAMover : number = 0;
  tropasRecibidas:number = 0;

  llamadasAPI : LlamadasAPI = new LlamadasAPI(this.http);

  obtenerEstadoCompleto()  {
    // TODO: Implementar al tener el autómata completo, no mostrando alertas y no pidiendo interactuar en turnos propios,
    // TODO: mirando en cambio si al final el jugador actual somos nosotros
  }

  ejecutarAutomata() {
    this.logica = new LogicaJuego(this.http);

    // Como la petición inicial de jugadores es asíncrona, se espera unos segundos a rellenar las cajas de jugadores
    setTimeout(() =>{
      this.rellenarCajasJugadores()
    }, 4000);


    this.intervaloConsultaEstado = setInterval(() => {
      this.http.get('http://localhost:8090/api/obtenerEstadoPartida', {observe:'body', responseType:'text', withCredentials: true}) // TODO: Sustituir por obtenerEstadoPartida, sin completo
          .subscribe(
            data => {
              //clearInterval(this.intervaloConsultaEstado) // TODO: DEBUG

              this.jsonData = JSON.parse(data);
              console.log(this.jsonData);
              for(var i = 0; i < this.jsonData.length; i++) {
                var obj = this.jsonData[i];
                switch(obj.IDAccion) {
                  case 0: { // IDAccionRecibirRegion
                    this.logica.recibirRegion(obj, document);
                    this.index.push(obj.Region);
                    this.jugador.push(obj.Jugador);
                    
                    this.tiempo = this.tiempo + 200;
                    if (this.vez < 42){
                      this.vez = this.vez + 1;
                      this.intervalos.push(setTimeout(() => 
                      {
                        var velemento = this.index.pop()!
                        var jugador = this.jugador.pop()!
                        document.getElementById(this.territorios[velemento])!.style.fill=this.logica.colorJugador.get(jugador);
                        document.getElementById("c"+this.territorios[velemento])!.style.fill=this.logica.colorJugador.get(jugador);
                        document.getElementById("t"+this.territorios[velemento])!.innerHTML="1"
                      },this.tiempo));
                    }else{
                      clearInterval(this.intervalos.pop()!)
                    }
                    break;
                  }

                  case 1: { // IDAccionCambioFase
                    this.logica.fase = obj.Fase

                    console.log("fase:", this.logica.fase)
                    console.log("jugador:", obj.Jugador)
                    console.log("yo:", this.logica.yo)

                    if (this.logica.fase == 1 && obj.Jugador == this.logica.yo) { // Refuerzo
                      //this.tratarFaseReforzar();
                    } else if (this.logica.fase == 2 && obj.Jugador == this.logica.yo) { // Ataque
                      
                    } else if (this.logica.fase == 3 && obj.Jugador == this.logica.yo) { // Fortificar
                      this.tratarFaseFortificar()
                    }


                    break;
                  }
                  case 2: { // IDAccionInicioTurno
                    this.logica.jugadorTurno = obj.Jugador // Puesto temporalmente para que las otras funciones vayan
                    this.logica.inicioTurno(obj);
                    this.tratarInicioTurno(obj);
                    
                    // TODO
                    break;
                  }
                  case 3: { // IDAccionCambioCartas
                    this.tratarAccionCambioCartas(obj)
                    break;
                  }
                  case 4: { // IDAccionReforzar
                    //this.logica.reforzar(obj) // No se necesita lógica adicional, solo cambiar tropas en el mapa
                    if (obj.Jugador != this.logica.yo) this.tratarAccionReforzar(obj)
                    
                    
                    break;
                  }
                  case 5: { // IDAccionAtaque

                      break;
                  }
                  case 6: { // IDAccionOcupar

                      break;
                  }
                  case 7: { // IDAccionFortificar
                      this.tratarAccionFortificar(obj)

                      break;
                  }
                  case 8: { // IDAccionObtenerCarta
                      this.logica.obtenerCarta(obj)
                      this.aumentarCartasCajaJugadores(obj.Jugador, 1)
                      break;
                  }
                  case 9: { // IDAccionJugadorEliminado
                      this.logica.jugadorEliminado(obj)
                      this.tratarAccionJugadorEliminado(obj)

                      break;
                  }
                  case 10: { // IDAccionJugadorExpulsado
                      this.logica.jugadorExpulsado(obj)
                      // Sabemos que no podemos ser nosotros, ya que estaríamos desvinculados de la partida
                      this.tratarAccionJugadorExpulsado(obj)
                      break;
                  }
                  case 11: { // IDAccionPartidaFinalizada
                      this.tratarAccionPartidaFinalizada(obj)
                      break;
                  }
                }
              }
            })
    }, 5000);
  }

  // Funciones auxiliares sobre el HTML
  obtenerTropasRegion(id : number) {
    return document.getElementById("t"+this.territorios[id])!.innerHTML
  }

  aumentarTropasRegion(id : number, aumento : number) {
    var tropas = parseInt(document.getElementById("t"+this.territorios[id])!.innerHTML) + aumento;

    this.sobreescribirTropasRegion(id, tropas)
  }

  sobreescribirTropasRegion(id : number, tropas : number) {
    document.getElementById("t"+this.territorios[id])!.innerHTML = String(tropas);
  }

  // Inicializa las cajas de jugadores
  rellenarCajasJugadores() {
    var contador = 1

    this.logica.mapaJugadores.forEach((value: Estado, key: string) => {
      document.getElementById("nombreJugador"+contador)!.innerHTML = String(key)
      document.getElementById("tropasJugador"+contador)!.innerHTML = String(0)
      document.getElementById("territoriosJugador"+contador)!.innerHTML = String(0)
      document.getElementById("cartasJugador"+contador)!.innerHTML = String(0)
      document.getElementById("jugador"+contador)!.style.background=this.logica.colorJugador.get(key);
      contador++
    });

    // Oculta los jugadores restantes
    for (var i = contador+1; i <= 6; i++) {
      console.log("Ocultando caja de jugador " + i)
      document.getElementById("jugador" + i)!.style.display = 'none'
    }
  }

  aumentarTropasCajaJugadores(jugador : string, aumento : number) {
    var i = this.obtenerIndiceCajaJugadores(jugador);

    var tropas  = parseInt(document.getElementById("tropasJugador"+i)!.innerHTML)

    document.getElementById("tropasJugador"+i)!.innerHTML = String(tropas+aumento)
  }

  aumentarTerritoriosCajaJugadores(jugador : string, aumento : number) {
    var i = this.obtenerIndiceCajaJugadores(jugador);

    var territorios  = parseInt(document.getElementById("territoriosJugador"+i)!.innerHTML)

    document.getElementById("territoriosJugador"+i)!.innerHTML = String(territorios+aumento)
  }

  aumentarCartasCajaJugadores(jugador : string, aumento : number) {
    var i = this.obtenerIndiceCajaJugadores(jugador);

    console.log("Aumentando cartas para "+jugador)

    var cartas  = parseInt(document.getElementById("cartasJugador"+i)!.innerHTML)

    document.getElementById("cartasJugador"+i)!.innerHTML = String(cartas+aumento)
  }

  // Obtiene el índice de caja dado un jugador. El jugador debe existir.
  obtenerIndiceCajaJugadores(jugador : string) {
    // Busca al jugador en las cajas, ya que pueden estar desordenadas
    for (var i = 1; i <= 6; i++) {
      if (document.getElementById("nombreJugador"+i)!.innerHTML == jugador) {
        return i
      }
    }

    return -1
  }

  // Funciones de alertas

  mostrarAlerta(tituloAlerta: string, textoAlerta: string) {
    var timerInterval : any
    Swal.fire({
      title: tituloAlerta,
      position: 'top',
      width: '30%',
      backdrop: false,
      html: textoAlerta,
      timer: 5000,
      timerProgressBar: true,
      willClose: () => {
        clearInterval(timerInterval)
      }
    })
  }

  mostrarAlertaProyecto(tituloAlerta: string, textoAlerta: string) {
    var timerInterval : any
    Swal.fire({
      title: tituloAlerta,
      position: 'top',
      width: '30%',
      backdrop: false,
      html: textoAlerta,
      timer: 5000,
      timerProgressBar: true,
      willClose: () => {
        clearInterval(timerInterval)
      }
    }).then((result) => {
        this.tratarFaseReforzar();
  });
  }

  
    //var timerInterval : any
  mostrarAlertaDerrotaPropia(tituloAlerta: string, textoAlerta: string) {
    Swal.fire({
      title: tituloAlerta,
      position: 'center',
      width: '45%',
      backdrop: true,
      html: textoAlerta,
      willClose: () => {
        this.terminarAutomataJuego()
        this.router.navigate(['/identificacion'])
      }
    })
  }

  mostrarAlertaDerrotaAjena(tituloAlerta: string, textoAlerta: string) {
    Swal.fire({
      title: tituloAlerta,
      position: 'center',
      width: '45%',
      backdrop: true,//"#0000000",
      html: textoAlerta,
      timer: 5000,
      timerProgressBar: true,
    })
  }

  mostrarAlertaPrueba(tituloAlerta: string, textoAlerta: string) {
    Swal.fire({
      title: tituloAlerta,
      position: 'center',
      width: '45%',
      backdrop: true,//"#0000000",
      background: "#ffff0000",
      color : "#ffffff",
      html: textoAlerta,
      timer: 5000,
      timerProgressBar: true,
      // Ejemplo de imagen
      //imageUrl : "https://s3.getstickerpack.com/storage/uploads/sticker-pack/hide-the-pain-harold/sticker_5.png?35bc9a5413d14b83fb1eabdb6fe2523d&d=200x200",
      //imageWidth : 300,
      //imageHeight : 300,
    })
  }

  mostrarAlertaPermanente(tituloAlerta: string, textoAlerta: string) {
    Swal.fire({
      title: tituloAlerta,
      position: 'top',
      width: '40%',
      backdrop: false,
      html: textoAlerta,
      showConfirmButton: false,
    })
  }

  cerrarAlertaPermanente() {
    Swal.close()
  }

  mostrarAlertaRangoAsincrona(tituloAlerta: string, min: string, max: string) {
    var atributos : Record<string, string> = {
      icon: 'info',
      "min": min,
      "max": max,
      "step": "1"
    };
    return Swal.fire({
      title: tituloAlerta,
      //icon: 'question',
      input: 'range',
      inputAttributes: atributos,
      //inputLabel: textoSelector,
      inputValue: min,
    }).then((result) => {
        this.tropasAMover = result.value;
        this.llamadasAPI.fortificar(this)
    });
  }

  mostrarAlertaRangoRefuerzo(tituloAlerta: string, min: string, max: string) {
    var atributos : Record<string, string> = {
      icon: 'info',
      "min": min,
      "max": max,
      "step": "1"
    };
    return Swal.fire({
      title: tituloAlerta,
      //icon: 'question',
      input: 'range',
      inputAttributes: atributos,
      //inputLabel: textoSelector,
      inputValue: min,
    }).then((result) => {
        this.tropasAMover = result.value;
        
        this.llamadasAPI.reforzarTerritorio(this)
    });
  }

  // Funciones de tratamiento del juego

  tratarFaseFortificar() {
    console.log("Estamos en fase de fortificación!")
    this.territorio1 = "";
    this.territorio2 = "";
    this.tropasAMover = 0;

    this.mostrarAlertaPermanente("Selecciona el territorio origen", "")
    this.mapa.permitirSeleccionTerritorios();
    this.intervarloConsultaTerritorio = setInterval(() =>
      {
        if (this.mapa.territorioSeleccionado != "") { // Ha cambiado

          // Asignar el territorio seleccionado
          // Si es el primer territorio seleccionado, se guarda y resetea en el mapa
          if (this.territorio1 == "") {
            this.territorio1 = this.mapa.territorioSeleccionado;
            this.mapa.territorioSeleccionado = "";
            // Cierra el popup de seleccionar el primer territorio y crea otro para el segundo
            this.cerrarAlertaPermanente()
            this.mostrarAlertaPermanente("Selecciona el territorio destino", "")
          } else {
            // Cierra el popup de seleccionar el segundo territorio
            this.cerrarAlertaPermanente()

            // Deshabilita el intervalo de consulta y las selecciones de territorio
            this.territorio2 = this.mapa.territorioSeleccionado;
            clearInterval(this.intervarloConsultaTerritorio)
            this.mapa.limitarSeleccionTerritorios();

            var tropasTerritorio1 = this.obtenerTropasRegion(this.territorios.indexOf(this.territorio1))

            // Una vez hecho, se llama por callback a la selección de tropas
            this.mostrarAlertaRangoAsincrona("Selecciona el número de tropas", "1", tropasTerritorio1);
          }
        }
      },
      200);
  }

  tratarAccionFortificar(obj : any) {
    var tropasAntes = this.obtenerTropasRegion(obj.Destino)
    console.log("antes:", tropasAntes)

    this.sobreescribirTropasRegion(obj.Origen, obj.TropasOrigen)
    this.sobreescribirTropasRegion(obj.Destino, obj.TropasDestino)

    var nombreTerritorio1 = this.territorios[obj.Origen]
    var nombreTerritorio2 = this.territorios[obj.Destino]

    var tropasFortificacion = parseInt(this.obtenerTropasRegion(obj.Destino)) - parseInt(tropasAntes);

    this.mostrarAlerta("Fortificación",
      "El jugador "+obj.Jugador+" ha fortificado " + nombreTerritorio2 + " con " + tropasFortificacion + " tropas desde " + nombreTerritorio1)
  }

  tratarInicioTurno(obj:any){
    console.log('INICIO DE TURNO', obj.TropasObtenidas)
    var tropasObtenidas = obj.TropasObtenidas;
    this.tropasRecibidas = tropasObtenidas;
    var numTerritorios = obj.RazonNumeroTerritorios
    var numContinentes = obj.RazonContinentesOcupados

    var mensaje = (numContinentes>0)? "y " + numContinentes + " continentes " : "";
    this.mostrarAlertaProyecto("Proyecto",
      "El jugador "+obj.Jugador+" ha recibido " + tropasObtenidas + " por ocupar " + numTerritorios + " territorios " + mensaje)
  
  }

  

  tratarAccionJugadorEliminado(obj : any) {
    if (obj.JugadorEliminado == this.logica.yo) { // Somos el jugador eliminado
      // Oscurece la pantalla, indica que se ha sido derrotado, y permite únicamente volver al menú principal
      this.mostrarAlertaDerrotaPropia("¡Has sido derrotado!", "Presione el botón para volver al menú")
    } else {
      this.mostrarAlertaDerrotaAjena("Jugador eliminado", "¡" + obj.JugadorEliminado + " ha sido eliminado por " + obj.JugadorEliminador + "!")
    }
  }

  tratarFaseReforzar() {
    console.log('tropas:', this.tropasRecibidas, "todoOk:", this.todoOk)
    
    
    if (this.tropasRecibidas == 0) return
    console.log("Estamos en fase de proyecto!", this.tropasRecibidas)
    this.territorio1 = "";
    this.tropasAMover = 0;

    this.mostrarAlertaPermanente("Selecciona el territorio a reforzar", "")
    this.mapa.permitirSeleccionTerritorios();
    this.intervarloConsultaTerritorio = setInterval(() =>
      {
        if (this.mapa.territorioSeleccionado != "") { // Ha cambiado

          // Asignar el territorio seleccionado
          this.territorio1 = this.mapa.territorioSeleccionado;
          this.mapa.territorioSeleccionado = "";
          // Cierra el popup de seleccionar el primer territorio y crea otro para el segundo
          this.cerrarAlertaPermanente()
          
          clearInterval(this.intervarloConsultaTerritorio)
          this.mapa.limitarSeleccionTerritorios();

          // Una vez hecho, se llama por callback a la selección de tropas
          this.mostrarAlertaRangoRefuerzo("Selecciona el número de tropas", "1", this.tropasRecibidas.toString());
          
        }
      },
      200);
  }
  
  tratarAccionJugadorExpulsado(obj : any) {
    this.mostrarAlertaDerrotaAjena("Jugador expulsado", "¡" + obj.JugadorEliminado + " ha sido expulsado de la partida por inactividad!")
  }

  tratarAccionReforzar(obj : any) {
    var jugador = obj.Jugador;
    var territorio = obj.TerritorioReforzado;
    var tropasRefuerzo = obj.TropasRefuerzo;

    this.aumentarTropasRegion(territorio, tropasRefuerzo)

    this.mostrarAlerta("Refuerzo", jugador + " ha reforzado " + this.territorios[territorio] + " con " + tropasRefuerzo + " tropas de refuerzo")
  }

  

  tratarAccionCambioCartas(obj : any) {
    var alerta : Alerta = this.logica.cambioCartas(obj)
    this.aumentarCartasCajaJugadores(this.logica.jugadorTurno, -3)
    this.mostrarAlerta(alerta.titulo, alerta.texto)
  }

  tratarAccionPartidaFinalizada(obj : any) {
    // Información a tratar por la pantalla de fin de partida
    localStorage.setItem("ganador", obj.JugadorGanador)
    if (this.logica.yo == obj.JugadorGanador) {
      localStorage.setItem("esGanador", "1")
    } else {
      localStorage.setItem("esGanador", "0")
    }

    localStorage.setItem("yo", this.logica.yo)
    // Borra la entrada para el jugador actual
    //this.logica.mapaJugadores.delete(this.logica.yo)

    var listaJugadores = new Array<jugadorFinPartida>();

    this.logica.mapaJugadores.forEach((jugador: Estado, i: string) => {
      var jugadorFin : jugadorFinPartida = {
        nombre: i,
        eliminado : jugador.eliminado,
        expulsado : jugador.expulsado,
      };

      listaJugadores.push(jugadorFin);
    });

    localStorage.setItem("jugadores", JSON.stringify(listaJugadores))
    // Se borra el almacen de lógica del juego y pasa a la pantalla de fin de partida
    //delete this.logica

    //clearInterval(this.intervaloMio)

    //this.router.navigate(['/finPartida']) // Comentar para no redirigir al fin de una partida
  }

  // Funciones de terminación

  terminarAutomataJuego() {
    clearInterval(this.intervarloConsultaTerritorio)
    // TODO: Más funciones de parada
  }

  // Funciones para herencia de mapa<->juego

  ngAfterViewInit() {}
}

export class jugadorFinPartida {
  nombre : string = "";
  eliminado : boolean = false;
  expulsado : boolean = false;
}

