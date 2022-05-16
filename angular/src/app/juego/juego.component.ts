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
//import * as QueryString from "Querystring";

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
  ],
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
  source = "assets/bar-chart.png";

  toggleDisplay() { this.isShow = !this.isShow;}

  changeImage() {
    if (!this.isShow) {this.source = "assets/bar-chart.png";}
    else {this.source = "assets/cross.png";}
  }

  cambiarFase() {
    this.rellenarFase(0);
    console.log("Cambiando de fase");
      this.http.post('http://localhost:8090/api/pasarDeFase', null, { observe:'response', responseType:'text', withCredentials: true})
      .subscribe({
        next :(response) => {
          console.log("Exito en el cambio de fase");
        },
        error: (error) => {Swal.fire({
          title: 'Se ha producido un error al cambiar de fase',
          text: error.error,
          icon: 'error',
          timer: 2000,
        })}
      });
  }

  setMapa() {this.info = 0; this.resumirPartida();}
  setMapaInfo() {this.info = 1;}

  irCartas(){
    if (this.logica.fase == 1 && this.logica.jugadorTurno  == this.logica.yo) {
      this.router.navigate(['/cartas'])
      Swal.close()
    }
  }

  delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }

  constructor(private http: HttpClient, private router:Router){}

  ngOnInit(): void {
    // Fuerza el background-color en el body en el constructor, Angular no lo aplica si no.
    document.body.style.backgroundColor = "#20BCE7";

    var volviendo = localStorage.getItem("volviendo")

    console.log("volviendo es", volviendo)

    if (volviendo == null) {
      this.logica = new LogicaJuego(this.http, true);

      // Como la petición inicial de jugadores es asíncrona, se espera unos segundos a rellenar las cajas de jugadores
      setTimeout(() =>{
        this.rellenarCajasJugadores()
      }, 2000);

      // Del mismo modo, se espera para los avatares
      setTimeout(() =>{
        this.obtenerAvataresJugadores()
      }, 3000);

    } else {
      localStorage.removeItem("volviendo")
      console.log("Se ha vuelto, resumiendo partida...")
      this.logica = new LogicaJuego(this.http, false);
      this.resumirPartida()
    }

    this.ejecutarAutomata()
  }

  // Solicita los avatares de los jugadores presentes, que se rellenarán mediante callback
  obtenerAvataresJugadores() {
    this.logica.mapaJugadores.forEach((estado: any, key: string) => {
      this.llamadasAPI.obtenerAvatar(this, key)
    })
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
  territorioDestino : string = "";
  territorioOrigen : string = "";
  nTropasOrigen : number = 0;
  nDadosAtaque : number = 0;
  nTropasOcupar : number = 0;
  turno : string = "-------";
  dadoUno: string = "";
  dadoDos: string = "";
  dadoTres: string = "";
  hayUno: boolean = false;
  hayDos: boolean = false;
  hayTres: boolean = false;

  resultadoAlerta : Promise<SweetAlertResult> | undefined ;

  tropasAMover : number = 0;
  tropasRecibidas:number = 0;

  jugadorChat : string = "";
  mensajeChat : string ="";
  objetoOcuparGuardado : any;
  tropasOrigenFalloOcuparResumir : string = "";

  llamadasAPI : LlamadasAPI = new LlamadasAPI(this.http);
  resumirPartida()  {
    this.http.get('http://localhost:8090/api/resumirPartida', {observe:'body', responseType:'text', withCredentials: true})
      .subscribe({
        next :(response) => {
          var jsonData = JSON.parse(response);

          if (!jsonData.Terminada) {
            // Recuperar el estado de cada jugador
            for (let i = 0; i < jsonData.Jugadores.length; i++) {
              var jugador = jsonData.Jugadores[i]

              var estadoJSON = jsonData.EstadosJugadores[jugador]

              console.log("estadoJSON:", estadoJSON)

              var estado : Estado = {
                tropas: estadoJSON.Tropas,
                territorios: [],
                numCartas: estadoJSON.NumCartas,
                eliminado: estadoJSON.Eliminado,
                expulsado: estadoJSON.Expulsado,
              }
              document.getElementById('jugador'+(i+1))!.style.background = this.logica.colores[i];

              // Si somos nosotros, se comprueba que no estemos eliminados y guardan las cartas
              if (jugador == this.logica.yo) {
                if(estado.eliminado) { // Si hemos sido eliminados, se sale de la partida
                  this.mostrarAlertaDerrotaPropia("¡Has sido derrotado!", "Presione el botón para volver al menú")
                } else {
                  for (let j = 0; j < estadoJSON.Cartas; j++) {
                    this.logica.cartas.push(this.logica.Carta = {
                      idCarta : estadoJSON.Cartas[j].IdCarta,
                      tipo : estadoJSON.Cartas[j].Tipo,
                      region : estadoJSON.Cartas[j].Region,
                      esComodin : estadoJSON.Cartas[j].EsComodin,
                    })
                  }
                }
              }

              this.logica.mapaJugadores.set(jugador, estado);
              this.logica.colorJugador.set(jugador, this.logica.colores[i]);
            }

            var estadoMapa = jsonData.Mapa

            var territoriosPorOcupar = false

            // Recuperar estado de todas las regiones
            for (let i = 0; i < 42; i++) {
              var estadoJugador = this.logica.mapaJugadores.get(estadoMapa[i].Ocupante)

              if (estadoJugador == null) { // Es un territorio por ocupar
                territoriosPorOcupar = true
                continue
              }

              estadoJugador.territorios.push(i)
              this.logica.mapaJugadores.set(estadoMapa[i].Ocupante, estadoJugador)

              this.sobreescribirTropasRegion(i, estadoMapa[i].NumTropas)

              // Rellenar con el color del jugador
              document.getElementById(this.territorios[i])!.style.fill=this.logica.colorJugador.get(estadoMapa[i].Ocupante);
              document.getElementById("c"+this.territorios[i])!.style.fill=this.logica.colorJugador.get(estadoMapa[i].Ocupante);
            }

            // Recuperar fase, turno y estado global de la partida
            this.logica.jugadorTurno = jsonData.TurnoJugador
            this.logica.fase = jsonData.Fase

            this.rellenarCajasJugadores()
            this.obtenerAvataresJugadores()

            console.log("Resumir: turno de " + this.logica.jugadorTurno)
            console.log("Resumir: fase " + this.logica.fase)
            // Si era nuestro turno, hay que pasar a ejecutar la fase
            if (this.logica.jugadorTurno == this.logica.yo) {
              if (this.logica.fase == 0) { // Inicio
                this.rellenarFase(1);
                console.log("Tratando fase de inicio desde resumen")
                this.tropasRecibidas = this.logica.mapaJugadores.get(this.logica.yo)!.tropas
                this.tratarFaseReforzar()
              } else if (this.logica.fase == 1) { // Refuerzo
                console.log("Tratando fase de refuerzo desde resumen")
                this.rellenarFase(1);
                this.tropasRecibidas = this.logica.mapaJugadores.get(this.logica.yo)!.tropas;
                this.tratarFaseReforzar()
              } else if (this.logica.fase == 2) { // Ataque
                this.rellenarFase(2);
                console.log("Tratando fase de ataque desde resumen")
                if (territoriosPorOcupar) {
                  console.log("Hay territorios por ocupar")
                  this.territorioDestino = jsonData.TerritorioOcupacionDestino
                  this.territorioOrigen = jsonData.TerritorioOcupacionOrigen
                  var tropasOrigen : string = this.obtenerTropasRegion(jsonData.TerritorioOcupacionOrigen)
                  this.tropasOrigenFalloOcuparResumir = tropasOrigen // Se guarda en caso de error
                  this.reiniciarOcuparResumen(Number.parseInt(tropasOrigen))
                } else {
                  this.tratarFaseAtacar()
                }

              } else if (this.logica.fase == 3) { // Fortificar
                this.rellenarFase(3);
                console.log("Tratando fase de fortificar desde resumen")
                this.tratarFaseFortificar()
              }
            }
          } else { // Sabemos que hemos perdido si hemos vuelto, y ya estaba terminada
            // TODO alerta de perder
          }
      }
    });


  }

  ejecutarAutomata() {
    this.intervaloConsultaEstado = setInterval(() => {
      this.http.get('http://localhost:8090/api/obtenerEstadoPartida', {observe:'body', responseType:'text', withCredentials: true})
          .subscribe(
            data => {
              //clearInterval(this.intervaloConsultaEstado) // Para debugging
              //console.log(this.jsonData);
              this.jsonData = JSON.parse(data);
              for(var i = 0; i < this.jsonData.length; i++) {
                var obj = this.jsonData[i];
                console.log(obj.IDAccion)
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

                    this.turno = obj.Jugador;

                    if (this.logica.fase == 0 && obj.Jugador == this.logica.yo) { // Refuerzo
                      // Rellenar primer rectangulito
                      this.rellenarFase(1);
                      this.tropasRecibidas = this.logica.mapaJugadores.get(this.logica.yo)!.tropas
                      this.tratarFaseReforzar()
                    } else if (this.logica.fase == 1 && obj.Jugador == this.logica.yo) { // Refuerzo
                      // Rellenar primer rectangulito
                      this.tropasRecibidas = this.logica.mapaJugadores.get(this.logica.yo)!.tropas
                      this.rellenarFase(1);
                      this.tratarFaseReforzar()
                    } else if (this.logica.fase == 2 && obj.Jugador == this.logica.yo) { // Ataque
                      // Rellenar segundo rectangulito
                      this.rellenarFase(2);
                      this.tratarFaseAtacar()
                    } else if (this.logica.fase == 3 && obj.Jugador == this.logica.yo) { // Fortificar
                      // Rellenar tercer rectangulito
                      this.rellenarFase(3);
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
                      console.log("Mostrando dados");
                      this.mostrarAlertaDados(obj);
                      console.log("Tratar accion atacar");
                      this.tratarAccionAtacar(obj);
                      break;
                  }
                  case 6: { // IDAccionOcupar
                    this.tratarAccionOcupar(obj);
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

                  case 12: { // IDAccionMensaje
                    this.tratarAccionMensaje(obj)
                    break;
                  }
                }
              }
            })
    }, 5000);
  }

  mostrarFase() {
    switch(this.logica.fase) {
      case 0: {
        return "REFUERZO INICIAL";
      }
      case 1: {
        return "REFUERZO";
      }
      case 2: {
        return "ATAQUE";
      }
      case 3: {
        return "FORTIFICACION";
      }
      default: {
        return "-------";
      }
    }
  }

  rellenarFase(id : number) {
    document.getElementById("rReforzar")!.style.background="white";
    document.getElementById("rAtacar")!.style.background="white";
    document.getElementById("rFortificar")!.style.background="white";
    console.log("Antes switch: " + id)
    switch(id) {
      case 0: {
        break;
      }
      case 1: {
        console.log("ID Fase 1 Antes: " + id)
        document.getElementById("rReforzar")!.style.background="black";
        console.log("ID Fase 1 Despues: " + id)
        break;
      }
      case 2: {
        document.getElementById("rAtacar")!.style.background="black";
        break;
      }
      case 3: {
        document.getElementById("rFortificar")!.style.background="black";
        break;
      }
    }
  }


  // Funciones auxiliares sobre el HTML
  obtenerTropasRegion(id : number) {
    return document.getElementById("t"+this.territorios[id])!.innerHTML
  }


  aumentarTropasRegion(id : number, aumento : number) {
    var tropas = Number.parseInt(document.getElementById("t"+this.territorios[id])!.innerHTML.toString()) + Number(aumento)

    this.sobreescribirTropasRegion(id, tropas)
  }


  sobreescribirTropasRegion(id : number, tropas : number) {
    document.getElementById("t"+this.territorios[id])!.innerHTML = String(tropas);
  }


  // Inicializa las cajas de jugadores
  rellenarCajasJugadores() {
    var contador = 1

    console.log("Ocultando jugador", contador)

    console.log("Ocultando jugador", this.logica.mapaJugadores.size)

    this.logica.mapaJugadores.forEach((estado: Estado, jugador: string) => {
      document.getElementById("nombreJugador"+contador)!.innerHTML = String(jugador)

      var tropasActuales : number = 0
      estado.territorios.forEach((territorio : number) => {
        tropasActuales += Number.parseInt(this.obtenerTropasRegion(territorio))
      })

      document.getElementById("tropasJugador"+contador)!.innerHTML = String(tropasActuales)
      document.getElementById("territoriosJugador"+contador)!.innerHTML = String(estado.territorios.length)
      document.getElementById("cartasJugador"+contador)!.innerHTML = String(estado.numCartas)
      contador++
    });

    console.log("Hay que ocultar desde", contador)

    // Oculta los jugadores restantes
    for (var i = contador; i <= 6; i++) {
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


  mostrarAlertaRefuerzo(tituloAlerta: string, textoAlerta: string, obj : any) {
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

      if (obj.Jugador == this.logica.yo) this.tratarFaseReforzar();
  });
  }


  mostrarAlertaAtaque(tituloAlerta: string, textoAlerta: string) {
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
      this.tratarFaseAtacar();
    });
  }

  mostrarAlertaDerrotaPropia(tituloAlerta: string, textoAlerta: string) {
    Swal.fire({
      title: tituloAlerta,
      position: 'center',
      width: '45%',
      backdrop: true,
      icon: 'error',
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
      icon: 'success',
      html: textoAlerta,
      timer: 5000,
      timerProgressBar: true,
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

  mostrarAlertaRangoAsincrona(tituloAlerta: string, min: string, max: string, fase: string) {
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
      if (fase == "fortificar") {
        this.tropasAMover = result.value;
        this.llamadasAPI.fortificar(this)
      }
      else if (fase == "atacar") {
        this.nDadosAtaque = result.value;
        this.llamadasAPI.atacar(this)
      }
      else if (fase == "ocupar") {
        this.nTropasOcupar = result.value;
        this.llamadasAPI.ocupar(this)
      }
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


  mostrarAlertaChat() {
    var atributos : Record<string, any> = {
      autocapitalize: 'off',
      maxlength: 32
    };

    Swal.fire({
      title: 'Escribe en el chat',
      input: 'text',
      inputAttributes: atributos,
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Enviar',
      reverseButtons: true,
      showLoaderOnConfirm: true,
      preConfirm: (mensaje) => {
        this.llamadasAPI.enviarMensaje(mensaje)
      }
    })
  }


  mostrarAlertaInformativaAvatar(titulo : string, texto : string, usuario : string) {
    var imagen : any;

    // Busca al jugador en las cajas, y obtiene la URL de su avatar
    for (var i = 0; i < this.logica.mapaJugadores.size; i++) {
      if (document.getElementById("nombreJugador" + (i + 1))!.innerHTML == usuario) {
        imagen = document.getElementById("avatarJugador" + (i + 1))! as HTMLImageElement;
        break
      }
    }

    Swal.fire({
      title: titulo,
      text: texto,
      imageUrl: imagen.src,
      imageWidth: 200,
      imageHeight: 200,
      imageAlt: 'Avatar usuario',
      customClass: {image: "imagenJugador"},
      confirmButtonText: 'OK',
      confirmButtonColor: '#3085d6',
      allowOutsideClick: false
    })
  }


  // Funciones de tratamiento del juego

  mostrarAlertaDados(obj : any) {
    this.dadoUno = "";
    this.dadoDos = "";
    this.dadoTres = "";
    this.hayUno = false;
    this.hayDos = false;
    this.hayTres = false;

    // Atacante
    console.log("Numero de dados es igual a " + obj.DadosAtacante.length);
    for (var i = 0; i < obj.DadosAtacante.length; i++) {
      this.obtenerDados(i, obj)
    }
  }

  obtenerDados(i : number, obj : any) {
    this.http.get('http://localhost:8090/api/obtenerDados/' + obj.JugadorAtacante + '/' + obj.DadosAtacante[i], {observe:'body', responseType:'blob', withCredentials: true})
      .subscribe({
        next : (response) => {
            // mostrar los resultados de cada dado
            var url = URL.createObjectURL(response);

            if(i == 0) {
              console.log("Mostrando primer dado: ", url);
              this.hayUno = true;
              //this.dadoUno = url;

              var imagen = document.getElementById("dadoUno")! as HTMLImageElement;
              imagen.src = url;
            }
            if(i == 1) {
              console.log("Mostrando segundo dado: ", url);
              this.hayUno = true;
              this.hayDos = true;
              //this.dadoDos = url;
              var imagen = document.getElementById("dadoDos")! as HTMLImageElement;
              imagen.src = url;
            }
            if(i == 2) {
              console.log("Mostrando tercer dado: ", url);
              this.hayUno = true;
              this.hayDos = true;
              this.hayTres = true;
              //this.dadoTres = url;
              var imagen = document.getElementById("dadoTres")! as HTMLImageElement;
              imagen.src = url;
            }
          }
      });
  }


  tratarFaseAtacar() {
    console.log("Estamos en fase de ataque!")
    this.territorio1 = "";
    this.territorio2 = "";

    this.mostrarAlertaPermanente("Selecciona el territorio desde el que atacar", "");
    this.mapa.permitirSeleccionTerritorios();
    this.intervarloConsultaTerritorio = setInterval(() =>
      {
        if (this.mapa.territorioSeleccionado != "") { // Ha cambiado

          // Asignar el territorio seleccionado
          // Si es el primer territorio seleccionado, se guarda y resetea en el mapa
          if (this.territorio1 == "") {
            this.territorio1 = this.mapa.territorioSeleccionado;
            this.nTropasOrigen = Number(this.obtenerTropasRegion(this.territorios.indexOf(this.territorio1)));
            console.log("Numero de tropas origen: " + this.nTropasOrigen);

            this.mapa.territorioSeleccionado = "";
            // Cierra el popup de seleccionar el primer territorio y crea otro para el segundo
            this.cerrarAlertaPermanente()
            this.mostrarAlertaPermanente("Selecciona el territorio al que atacar", "")
          } else {
            // Cierra el popup de seleccionar el segundo territorio
            this.cerrarAlertaPermanente()

            // Deshabilita el intervalo de consulta y las selecciones de territorio
            this.territorio2 = this.mapa.territorioSeleccionado;
            clearInterval(this.intervarloConsultaTerritorio)
            this.mapa.limitarSeleccionTerritorios();

            // Una vez hecho, se llama por callback a la selección de tropas
            this.mostrarAlertaRangoAsincrona("Selecciona el número de dados", "1", "3", "atacar");
          }
        }
      },
      200);

  }


  tratarFaseFortificar() {
    console.log("Estamos en fase de fortificación!")
    this.territorio1 = "";
    this.territorio2 = "";
    this.tropasAMover = 0;

    this.mostrarAlertaPermanente("Selecciona el territorio origen", "")
    this.mapa.permitirSeleccionTerritorios();
    clearInterval(this.intervarloConsultaTerritorio) // Limpia el intervalo de la fase de ataque, si existe

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
            this.mostrarAlertaRangoAsincrona("Selecciona el número de tropas", "1", tropasTerritorio1, "fortificar");
          }
        }
      },
      200);
  }


  tratarAccionAtacar(obj : any) {
    var tropasAntesDestino = this.obtenerTropasRegion(obj.Destino);
    var tropasPerdidasDestino = obj.TropasPerdidasDefensor;
    var tropasAntesOrigen = this.obtenerTropasRegion(obj.Origen);
    var tropasPerdidasOrigen = obj.TropasPerdidasAtacante;
    var restantesDestino = Number(tropasAntesDestino) - tropasPerdidasDestino;
    var restantesOrigen = Number(tropasAntesOrigen) - tropasPerdidasOrigen;

    console.log("Antes defensor: " + tropasAntesDestino);
    console.log("Tropas perdidas en la defensa: " + tropasPerdidasDestino);
    console.log("Antes atacante: " + tropasAntesOrigen);
    console.log("Tropas perdidas en el ataque: " + tropasPerdidasOrigen);



    // Comprobamos si se pasa a ocupar el territorio atacado
    console.log("Tropas restantes Destino" + restantesDestino);
    if (restantesDestino < 1) {
      this.tratarOcupar(obj);

    }
    else {
      this.sobreescribirTropasRegion(obj.Destino, restantesDestino);
      this.sobreescribirTropasRegion(obj.Origen, restantesOrigen);
      this.aumentarTropasCajaJugadores(obj.JugadorAtacante, -obj.TropasPerdidasAtacante)
      this.aumentarTropasCajaJugadores(obj.JugadorDefensor, -obj.TropasPerdidasDefensor)

      this.mostrarAlertaAtaque("Resultados del ataque", "El atacante " + obj.JugadorAtacante + " ha perdido " + tropasPerdidasOrigen + " tropas (" + restantesOrigen +
                        " tropas restantes) " + " y el defensor " + obj.JugadorDefensor + " ha perdido " + tropasPerdidasDestino + " tropas (" + restantesDestino +
                        " tropas restantes)");
    }

  }


  tratarOcupar(obj : any) {
    this.objetoOcuparGuardado = obj // Guarda el objeto JSON usado para ocupar, en caso de fallo

    this.territorioDestino = obj.Destino;
    var tropasAntesOrigen = this.obtenerTropasRegion(obj.Origen);
    var tropasPerdidasOrigen = obj.TropasPerdidasAtacante;
    var restantesOrigen = Number(tropasAntesOrigen) - tropasPerdidasOrigen;
    this.mostrarAlertaRangoAsincrona("¡Has ocupado el territorio! Selecciona el número de tropas de ocupación", "1", String(restantesOrigen - 1), "ocupar");
  }

  reiniciarOcuparResumen(tropasOrigen : number) {
    console.log("Reiniciando ocupar por resumen...")

    var nombreTerritorioOrigen : string = this.territorios[Number.parseInt(this.territorioOrigen)]

    this.mostrarAlertaRangoAsincrona("Selecciona el número de tropas de ocupación desde "+nombreTerritorioOrigen, "1", String(tropasOrigen), "ocupar");
  }

  reiniciarOcupar() {
    console.log("reiniciando ocupar por fallo...")
    if (this.objetoOcuparGuardado == null) { // Ha habido un fallo tras resumir
      this.reiniciarOcuparResumen(Number.parseInt(this.tropasOrigenFalloOcuparResumir))
    } else {
      this.tratarOcupar(this.objetoOcuparGuardado)
    }

  }


  tratarAccionOcupar(obj : any) {
    var idTerritorioOrigen = obj.Origen;
    var idTerritorioDestino = obj.Destino;
    var nTropasOrigen = obj.TropasOrigen;
    var nTropasOcupar = obj.TropasDestino;
    var jugadorAtacante = obj.JugadorOcupante;

    document.getElementById(this.territorios[idTerritorioDestino])!.style.fill=this.logica.colorJugador.get(jugadorAtacante);
    document.getElementById("c"+this.territorios[idTerritorioDestino])!.style.fill=this.logica.colorJugador.get(jugadorAtacante);
    this.sobreescribirTropasRegion(idTerritorioOrigen, nTropasOrigen);
    this.sobreescribirTropasRegion(idTerritorioDestino, nTropasOcupar);

    this.mostrarAlertaAtaque("Ataque", "El jugador " + obj.JugadorOcupante + " ha ocupado " + this.territorios[idTerritorioDestino] + " con "
                + nTropasOcupar + " procedentes de " + this.territorios[idTerritorioOrigen] + " previamente capturado por "
                + obj.JugadorOcupado);
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
    //console.log('INICIO DE TURNO', obj.TropasObtenidas)
    var tropasObtenidas = obj.TropasObtenidas;
    this.tropasRecibidas = tropasObtenidas;
    var numTerritorios = obj.RazonNumeroTerritorios
    var numContinentes = obj.RazonContinentesOcupados

    var mensaje = (numContinentes>0)? "y " + numContinentes + " continentes " : "";
    if(this.logica.fase != 0) {
        this.mostrarAlertaRefuerzo("Refuerzo",
        "El jugador "+obj.Jugador+" ha recibido " + tropasObtenidas + " tropas por ocupar " + numTerritorios + " territorios " + mensaje, obj)
    }

  }


  tratarAccionJugadorEliminado(obj : any) {
    if (obj.JugadorEliminado == this.logica.yo) { // Somos el jugador eliminado
      // Oscurece la pantalla, indica que se ha sido derrotado, y permite únicamente volver al menú principal
      this.mostrarAlertaDerrotaPropia("Fin de la partida", "El jugador " + obj.JugadorEliminador + " te ha eliminado.")
    } else if (obj.JugadorEliminador == this.logica.yo) {
      this.mostrarAlertaDerrotaAjena("Has eliminado a un jugador",
        "Has obtenido " + obj.CartasRecibidas + " cartas de " + obj.JugadorEliminado + ".");
    } else {
      this.mostrarAlertaDerrotaAjena("Jugador eliminado", "El jugador " + obj.JugadorEliminador + " ha eliminado a " + obj.JugadorEliminado + ".")
    }

    // Busca la caja de jugador, y sobreescribe su color por uno gris
    /*for (var i = 0; i < this.logica.mapaJugadores.size; i++) {
      if (document.getElementById("nombreJugador" + (i+1))!.innerHTML == obj.JugadorEliminado) {
        document.getElementById("jugador" + (i+1))!.style.backgroundColor = "#808080"
        return
      }
    }*/
  }


  tratarFaseReforzar() {
    console.log('tropas:', this.tropasRecibidas, "todoOk:", this.todoOk)

    if (this.tropasRecibidas == 0) return
    console.log("Estamos en fase de refuerzo!", this.tropasRecibidas)
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
    this.mostrarAlertaDerrotaAjena("Jugador eliminado",
      "El jugador " + obj.JugadorEliminado + " ha sido desconectado de la partida por inactividad." +
      "Sus territorios pueden ser conquistados sin restricciones.");

    // Busca la caja de jugador, y sobreescribe su color por uno gris
    /*for (var i = 0; i < this.logica.mapaJugadores.size; i++) {
      if (document.getElementById("nombreJugador" + (i+1))!.innerHTML == obj.JugadorEliminado) {
        document.getElementById("jugador" + (i+1))!.style.backgroundColor = "#808080"
        return
      }
    }*/
  }


  tratarAccionReforzar(obj : any) {
    var jugador = obj.Jugador;
    var territorio = obj.TerritorioReforzado;
    var tropasRefuerzo = obj.TropasRefuerzo;

    this.aumentarTropasRegion(territorio, tropasRefuerzo)
    this.aumentarTropasCajaJugadores(jugador, tropasRefuerzo)
    this.mostrarAlerta("Refuerzo", jugador + " ha reforzado " + this.territorios[territorio] + " con " + tropasRefuerzo + " tropas de refuerzo")
  }


  tratarAccionCambioCartas(obj : any) {
    if (obj.Jugador === this.logica.yo) {
      Swal.fire({
        title: 'Cambio de cartas',
        text: 'Has obtenido ' + obj.NumTropasObtenidas + ' tropas.',
        icon: 'info',
      });
    } else {
      Swal.fire({
        title: 'Cambio de cartas',
        text: 'El jugador ' + obj.Jugador + " ha recibido " + obj.NumTropasObtenidas + ' tropas.',
        icon: 'info',
      });
    }
    this.aumentarCartasCajaJugadores(this.logica.jugadorTurno, -3)

  }


  tratarAccionPartidaFinalizada(obj : any) {
    if (obj.JugadorGanador === this.logica.yo) {
      Swal.fire({
        title: "Fin de la partida",
        text: "Enhorabuena. Has ganado al resto de jugadores.",
        icon: 'success',
        confirmButtonText: 'OK',
        confirmButtonColor: '#3085d6',
        willClose: () => {
          this.terminarAutomataJuego()
          this.router.navigate(['/identificacion'])
        }
      })
    } else {
      Swal.fire({
        title: "Fin de la partida",
        text: "El jugador " + obj.JugadorGanador + " es el ganador.",
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#3085d6',
        willClose: () => {
          this.terminarAutomataJuego()
          this.router.navigate(['/identificacion'])
        }
      })
    }
  }


  tratarAccionMensaje(obj : any) {
    document.getElementById("cajaChat")!.innerHTML = obj.JugadorEmisor + ": "+obj.Mensaje
  }


  // Funciones de terminación

  terminarAutomataJuego() {
    clearInterval(this.intervarloConsultaTerritorio)
  }


  // Funciones de carga de assets

  // Carga de un avatar
  introducirAvatar(blob : any, jugador : string) {
    const img = URL.createObjectURL(blob);

    // Busca la caja de jugador, y escribe la URL de la imagen parseada
    for (var i = 0; i < this.logica.mapaJugadores.size; i++) {
      if (document.getElementById("nombreJugador" + (i+1))!.innerHTML == jugador) {
        var imagen = document.getElementById("avatarJugador" + (i+1))! as HTMLImageElement;
        imagen.src = img;
        return
      }
    }
  }

  // Funciones para herencia de mapa<->juego

  ngAfterViewInit() {}
}

