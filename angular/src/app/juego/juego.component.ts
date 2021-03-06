import { trigger, transition, style, animate } from '@angular/animations';
import { HttpClient } from '@angular/common/http';
import {AfterViewInit, Component, HostListener, OnInit, ViewChild} from '@angular/core';
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

  constructor(private http: HttpClient, private router:Router){}

  @HostListener('unloaded')
  ngOnDestroy() {
    console.log('Componente de juego destru??do');
    this.terminarAutomataJuego()
  }


  async ngOnInit() {
    // Fuerza el background-color en el body en el constructor, Angular no lo aplica si no.
    document.body.style.backgroundColor = "#20BCE7";

    var volviendo = localStorage.getItem("volviendo")

    if (volviendo == null) {
      console.log("Iniciando sin resumen...", volviendo)
      this.logica = new LogicaJuego(this.http);
      await this.logica.obtenerJugadoresPartida()

      // Como la petici??n inicial de jugadores es as??ncrona, se espera unos segundos a rellenar las cajas de jugadores
      console.log("rellenando cajas...")
      this.rellenarCajasJugadores()

      // Del mismo modo, se espera para los avatares
      console.log("rellenando avatares...")
      this.obtenerAvataresJugadores()
      this.ejecutarAutomata()
    } else {
      localStorage.removeItem("volviendo")
      console.log("Iniciando con resumen..")
      this.logica = new LogicaJuego(this.http);
      this.resumirPartida()
    }
  }

  // Variables auxiliares del juego
  jsonData: any;
  intervaloConsultaEstado:any;
  i:any;
  logica:any;
  tiempo = 0;
  vez = 0;
  index = Array<number>();
  jugador = Array<string>();
  intervalos = Array<any>();
  intervarloConsultaTerritorio : any;
  territorio1 : string = "";
  territorio2 : string = "";
  territorioDestino : string = "";
  territorioOrigen : string = "";
  nTropasOrigen : number = 0;
  nDadosAtaque : number = 0;
  nTropasOcupar : number = 0;
  cartaRobada : boolean = false;

  tropasAMover : number = 0;

  objetoOcuparGuardado : any;
  tropasOrigenFalloOcuparResumir : string = "";

  llamadasAPI : LlamadasAPI = new LlamadasAPI(this.http);

  primerRefuerzo : boolean = true;

  faseActual : string = ""; // Texto de la caja de fases

  resumirPartida()  {
    this.primerRefuerzo = false;

    console.log("Terminando aut??mata anterior...")
    this.terminarAutomataJuego()

    console.log("Limpiando intervalo y alertas de la anterior fase...")
    clearInterval(this.intervarloConsultaTerritorio)
    this.delay(100) // Hace una espera del doble de tiempo tiempo que tarda un intervalo de consulta de territorios
    Swal.close()

    console.log("Resumiendo la partida...")
    this.http.get(LlamadasAPI.URLApi+'/api/resumirPartida', {observe:'body', responseType:'text', withCredentials: true})
      .subscribe({
        next :(response) => {
          var jsonData = JSON.parse(response);

          console.log("resumen:",jsonData)

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
                  this.mostrarAlertaDerrotaPropia("??Has sido derrotado!", "Presione el bot??n para volver al men??")
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
            if (this.logica.fase == 0) { // Inicio
              this.rellenarFase(1);
              console.log("Tratando fase de inicio desde resumen")
              this.faseActual = "REFUERZO INICIAL"

              if (this.logica.jugadorTurno == this.logica.yo) {
                this.tratarFaseReforzar()
              }
            } else if (this.logica.fase == 1) { // Refuerzo
              console.log("Tratando fase de refuerzo desde resumen")
              this.rellenarFase(1);
              this.faseActual = "REFUERZO"

              if (this.logica.jugadorTurno == this.logica.yo) {
                this.tratarFaseReforzar()
              }
            } else if (this.logica.fase == 2) { // Ataque
              this.rellenarFase(2);
              this.faseActual = "ATAQUE"

              if (this.logica.jugadorTurno == this.logica.yo) {
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
              }
            } else if (this.logica.fase == 3) { // Fortificar
              this.rellenarFase(3);
              this.faseActual = "FORTIFICAR"

              console.log("Tratando fase de fortificar desde resumen")
              if (this.logica.jugadorTurno == this.logica.yo) {
                this.tratarFaseFortificar()
              }
            }

          } else { // Sabemos que hemos perdido si hemos vuelto, y ya estaba terminada
            if (jsonData.TurnoJugador == this.logica.yo) {
              console.log("La partida estaba terminada!")
              this.mostrarAlertaDerrotaPropia("??La partida ya ha terminado!", "Presione el bot??n para volver al men??")
            }
          }

          this.ejecutarAutomata()
      }
    });
  }

  ejecutarAutomata() {
    this.intervaloConsultaEstado = setInterval(() => {
      this.http.get(LlamadasAPI.URLApi+'/api/obtenerEstadoPartida', {observe:'body', responseType:'text', withCredentials: true})
          .subscribe(
            async data => {
              console.log("json en obtenerEstado:", this.jsonData);
              this.jsonData = JSON.parse(data);
              for (var i = 0; i < this.jsonData.length; i++) {
                var obj = this.jsonData[i];
                console.log("IDaccion:", obj.IDAccion)

                switch (obj.IDAccion) {
                  case 0: { // IDAccionRecibirRegion
                    this.logica.recibirRegion(obj, document);
                    this.index.push(obj.Region);
                    this.jugador.push(obj.Jugador);

                    // Actualiza las tropas
                    this.logica.mapaJugadores.get(obj.Jugador)!.tropas = obj.TropasRestantes

                    if (this.obtenerTropasCajaJugadores(obj.Jugador) == 0) {
                      this.sobreescribirTropasCajaJugadores(obj.Jugador, obj.TropasRestantes)
                    }

                    this.aumentarTerritoriosCajaJugadores(obj.Jugador, 1)

                    // Muestra cada 200ms un cambio de territorio
                    this.tiempo = this.tiempo + 200;
                    if (this.vez < 42) {
                      this.vez = this.vez + 1;
                      this.intervalos.push(setTimeout(() => {
                        var velemento = this.index.pop()!
                        var jugador = this.jugador.pop()!
                        document.getElementById(this.territorios[velemento])!.style.fill = this.logica.colorJugador.get(jugador);
                        document.getElementById("c" + this.territorios[velemento])!.style.fill = this.logica.colorJugador.get(jugador);
                        document.getElementById("t" + this.territorios[velemento])!.innerHTML = "1"
                      }, this.tiempo));
                    } else {
                      clearInterval(this.intervalos.pop()!)
                    }
                    break;
                  }

                  case 1: { // IDAccionCambioFase
                    this.logica.fase = obj.Fase

                    console.log("fase:", this.logica.fase)
                    console.log("jugador:", obj.Jugador)
                    console.log("yo:", this.logica.yo)

                    this.logica.jugadorTurno = obj.Jugador;

                    // Fuerza incondicionalmente cualquier alerta activa y el intervalo de consulta de territorio,
                    // para evitar condiciones de carrera entre una fase y otra
                    console.log("Limpiando intervalo y alertas de la anterior fase...")
                    clearInterval(this.intervarloConsultaTerritorio)
                    await this.delay(100) // Hace una espera del doble de tiempo que tarda un intervalo de consulta de territorios
                    Swal.close()

                    // Duerme en el primer refuerzo de la fase inicial, para esperar a que se rellene el mapa
                    if (this.logica.fase == 0 && this.primerRefuerzo) {
                      console.log("Primer refuerzo en fase inicial, durmiendo...")
                      await new Promise(r => setTimeout(r, 200 * 42));
                      console.log("Fin de dormir en primer refuerzo en fase inicial")
                      this.primerRefuerzo = false
                    }

                    if (this.logica.fase == 0) { // Refuerzo en fase inicial
                      // Rellenar primer indicador de fase
                      this.rellenarFase(1);
                      this.faseActual = "REFUERZO INICIAL"

                      if (obj.Jugador == this.logica.yo) {
                        await this.delay(500) // Espera a tratar la acci??n de inicio de turno y obtener las tropas
                        this.tratarFaseReforzar()
                      }
                    } else if (this.logica.fase == 1) { // Refuerzo
                      // Rellenar primer indicador de fase
                      this.rellenarFase(1);
                      this.faseActual = "REFUERZO"

                      if (obj.Jugador == this.logica.yo) {
                        await this.delay(500) // Espera a tratar la acci??n de inicio de turno y obtener las tropas
                        this.tratarFaseReforzar()
                      }
                    } else if (this.logica.fase == 2) { // Ataque
                      // Rellenar segundo indicador de fase
                      this.rellenarFase(2);
                      this.faseActual = "ATAQUE"

                      if (obj.Jugador == this.logica.yo) {
                        this.tratarFaseAtacar()
                      }
                    } else if (this.logica.fase == 3) { // Fortificar
                      // Rellenar tercer indicador de fase
                      this.rellenarFase(3);
                      this.faseActual = "FORTIFICAR"

                      if (obj.Jugador == this.logica.yo) {
                        this.tratarFaseFortificar()
                      }
                    }

                    break;
                  }
                  case 2: { // IDAccionInicioTurno
                    //var tropasAntes = this.logica.mapaJugadores.get(this.logica.yo)!.tropas
                    this.logica.jugadorTurno = obj.Jugador
                    this.logica.inicioTurno(obj);
                    this.tratarInicioTurno(obj);
                    /*
                    if (obj.Jugador == this.logica.yo && tropasAntes == 0) { // Primer refuerzo tras inicio de partida
                      this.logica.mapaJugadores.get(this.logica.yo)!.tropas = obj.TropasObtenidas
                      this.tratarFaseReforzar()
                    }
                    */
                    break;
                  }
                  case 3: { // IDAccionCambioCartas
                    this.tratarAccionCambioCartas(obj)
                    break;
                  }
                  case 4: { // IDAccionReforzar
                    //this.logica.reforzar(obj) // No se necesita l??gica adicional, solo cambiar tropas en el mapa
                    if (obj.Jugador != this.logica.yo) this.tratarAccionReforzar(obj)
                    break;
                  }
                  case 5: { // IDAccionAtaque
                    console.log("Mostrando dados");
                    this.mostrarAlertaDados(obj);
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

                    this.cartaRobada = true

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
                    // Sabemos que no podemos ser nosotros, ya que estar??amos desvinculados de la partida
                    this.tratarAccionJugadorExpulsado(obj)
                    break;
                  }
                  case 11: { // IDAccionPartidaFinalizada
                    this.logica.fase = -1
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
    }, 750);
  }

  mostrarFase() {
    console.log("Mostrando fase...")
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
        return "FORTIFICACI??N";
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
        document.getElementById("rReforzar")!.style.background="#373737";
        console.log("ID Fase 1 Despues: " + id)
        break;
      }
      case 2: {
        document.getElementById("rAtacar")!.style.background="#373737";
        break;
      }
      case 3: {
        document.getElementById("rFortificar")!.style.background="#373737";
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

  truncarNombreJugador(nombre : string) : string {
    if (nombre.length > 13) {
      nombre = nombre.substring(0, 13)
      nombre = nombre.concat("...")
    }

    return nombre
  }

  // Inicializa las cajas de jugadores
  rellenarCajasJugadores() {
    var contador = 1

    console.log("Ocultando jugador", contador)

    console.log("Ocultando jugador", this.logica.mapaJugadores.size)

    this.logica.mapaJugadores.forEach((estado: Estado, jugador: string) => {
      document.getElementById("nombreJugador"+contador)!.innerHTML = this.truncarNombreJugador(String(jugador))

      var tropasActuales : number = 0
      estado.territorios.forEach((territorio : number) => {
        tropasActuales += Number.parseInt(this.obtenerTropasRegion(territorio))
      })

      // Rellena los indicadores, y configura el color
      document.getElementById("tropasJugador"+contador)!.innerHTML = String(tropasActuales)
      document.getElementById("territoriosJugador"+contador)!.innerHTML = String(estado.territorios.length)
      document.getElementById("cartasJugador"+contador)!.innerHTML = String(estado.numCartas)
      document.getElementById('jugador'+(contador))!.style.background = this.logica.colores[contador-1];
      contador++
    });

    console.log("Hay que ocultar desde", contador)

    // Oculta los jugadores restantes
    for (var i = contador; i <= 6; i++) {
      console.log("Ocultando caja de jugador " + i)
      document.getElementById("jugador" + i)!.style.display = 'none'
    }
  }

  obtenerTropasCajaJugadores(jugador : string) : number {
    var i = this.obtenerIndiceCajaJugadores(jugador);
    return Number.parseInt(document.getElementById("tropasJugador"+i)!.innerHTML)
  }

  sobreescribirTropasCajaJugadores(jugador : string, valor : number) {
    var i = this.obtenerIndiceCajaJugadores(jugador);

    document.getElementById("tropasJugador"+i)!.innerHTML = String(valor)
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

  // Obtiene el ??ndice de caja dado un jugador. El jugador debe existir.
  obtenerIndiceCajaJugadores(jugador : string) {
    // Busca al jugador en las cajas, ya que pueden estar desordenadas
    for (var i = 1; i <= 6; i++) {
      if (document.getElementById("nombreJugador"+i)!.innerHTML == this.truncarNombreJugador(jugador)) {
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
      if (this.logica.jugadorTurno == this.logica.yo) {
        this.tratarFaseAtacar();
      }
    });
  }

  mostrarAlertaDerrotaPropia(tituloAlerta: string, textoAlerta: string) {
    Swal.fire({
      title: tituloAlerta,
      position: 'center',
      width: '35%',
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
      width: '35%',
      backdrop: true,//"#0000000",
      icon: 'success',
      html: textoAlerta,
      timer: 5000,
      timerProgressBar: true,
    }).then((result) => {
      if (this.logica.jugadorTurno == this.logica.yo) {
        this.resumirPartida() // La alerta puede haber cortado la ocupaci??n, por simplicidad se resume la partida
      }
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
      input: 'range',
      inputAttributes: atributos,
      allowOutsideClick: false,
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
      input: 'range',
      inputAttributes: atributos,
      allowOutsideClick: false,
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

  mostrarAlertaDados(obj : any) {
    // Atacante
    console.log("Numero de dados es igual a " + obj.DadosAtacante.length);
    for (var i = 0; i < obj.DadosAtacante.length; i++) {
      this.obtenerDadosAtacante(i, obj)
    }
    console.log("Numero de dados del defensor es igual a " + obj.DadosDefensor.length);
    for (var i = 0; i < obj.DadosDefensor.length; i++) {
      this.obtenerDadosDefensor(i, obj)
    }
    window.setTimeout(() =>{
      document.getElementById("dadoUno")!.style.visibility="hidden";
      document.getElementById("dadoDos")!.style.visibility="hidden";
      document.getElementById("dadoTres")!.style.visibility="hidden";
      document.getElementById("dadoUnoD")!.style.visibility="hidden";
      document.getElementById("dadoDosD")!.style.visibility="hidden";
      console.log("Tratar accion atacar");
      this.tratarAccionAtacar(obj);
    }, 5000);
  }

  obtenerDadosAtacante(i : number, obj : any) {
    this.http.get(LlamadasAPI.URLApi+'/api/obtenerDados/' + obj.JugadorAtacante + '/' + obj.DadosAtacante[i], {observe:'body', responseType:'blob', withCredentials: true})
      .subscribe({
        next : (response) => {
            // mostrar los resultados de cada dado
            var url = URL.createObjectURL(response);

            if(i == 0 && obj.DadosAtacante.length == 1) {
              document.getElementById("dadoDos")!.style.visibility="visible";
              console.log("Mostrando primer dado: ", url);
              var imagen = document.getElementById("dadoDos")! as HTMLImageElement;
              imagen.src = url;
            }
            else if (i == 0 && (obj.DadosAtacante.length == 2 || obj.DadosAtacante.length == 3)) {
              document.getElementById("dadoUno")!.style.visibility="visible";
              console.log("Mostrando primer dado: ", url);
              var imagen = document.getElementById("dadoUno")! as HTMLImageElement;
              imagen.src = url;
            }
            if(i == 1 && obj.DadosAtacante.length == 2) {
              document.getElementById("dadoTres")!.style.visibility="visible";
              console.log("Mostrando segundo dado: ", url);
              //this.dadoDos = url;
              var imagen = document.getElementById("dadoTres")! as HTMLImageElement;
              imagen.src = url;
            }
            else if (i == 1 && obj.DadosAtacante.length == 3) {
              document.getElementById("dadoDos")!.style.visibility="visible";
              console.log("Mostrando primer dado: ", url);
              var imagen = document.getElementById("dadoDos")! as HTMLImageElement;
              imagen.src = url;
            }
            if(i == 2) {
              document.getElementById("dadoTres")!.style.visibility="visible";
              console.log("Mostrando tercer dado: ", url);
              var imagen = document.getElementById("dadoTres")! as HTMLImageElement;
              imagen.src = url;
            }
          }
      });
  }

  obtenerDadosDefensor(i : number, obj : any) {
    this.http.get(LlamadasAPI.URLApi+'/api/obtenerDados/' + obj.JugadorDefensor + '/' + obj.DadosDefensor[i], {observe:'body', responseType:'blob', withCredentials: true})
      .subscribe({
        next : (response) => {
            // mostrar los resultados de cada dado
            var url = URL.createObjectURL(response);

            if(i == 0) {
              document.getElementById("dadoUnoD")!.style.visibility="visible";
              console.log("Mostrando primer dado del defensor: ", url);
              var imagen = document.getElementById("dadoUnoD")! as HTMLImageElement;
              imagen.src = url;
            }
            if(i == 1) {
              document.getElementById("dadoDosD")!.style.visibility="visible";
              console.log("Mostrando segundo dado del defensor: ", url);
              //this.dadoDos = url;
              var imagen = document.getElementById("dadoDosD")! as HTMLImageElement;
              imagen.src = url;
            }
          }
      });
  }


  // Funciones de tratamiento del juego

  tratarFaseReforzar() {
    // Fuerza incondicionalmente cualquier alerta activa y el intervalo de consulta de territorio,
    // para evitar condiciones de carrera entre una fase y otra
    clearInterval(this.intervarloConsultaTerritorio)
    this.delay(50) // Hace una espera del mismo tiempo que tarda un intervalo de consulta de territorios
    Swal.close()

    console.log("mapa en tratarFaseReforzar: "+this.logica.mapaJugadores)
    var tropasRecibidas : number = this.logica.mapaJugadores.get(this.logica.yo)!.tropas

    console.log('tropas:', tropasRecibidas)

    if (tropasRecibidas == 0) return
    console.log("Estamos en fase de refuerzo!", tropasRecibidas)
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

          // Una vez hecho, se llama por callback a la selecci??n de tropas
          this.mostrarAlertaRangoRefuerzo("Selecciona el n??mero de tropas", "1", tropasRecibidas.toString());
        }

        console.log("Fin de intervalo de tratarFaseReforzar en fase", this.logica.fase)
      },
      50);
  }

  tratarFaseAtacar() {
    // Fuerza incondicionalmente cualquier alerta activa y el intervalo de consulta de territorio,
    // para evitar condiciones de carrera entre una fase y otra
    clearInterval(this.intervarloConsultaTerritorio)
    this.delay(50) // Hace una espera del mismo tiempo que tarda un intervalo de consulta de territorios
    Swal.close()

    console.log("Estamos en fase de ataque!")
    this.territorio1 = "";
    this.territorio2 = "";

    this.mostrarAlertaPermanente("Selecciona el territorio desde el que atacar", "");
    console.log("permitiendo seleccionar territorios")
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

            // Una vez hecho, se llama por callback a la selecci??n de tropas
            this.mostrarAlertaRangoAsincrona("Selecciona el n??mero de dados", "1", "3", "atacar");
          }
        }

        // Ha acabado la partida y estamos en ataque, se termina
        if (this.logica.fase == -1) {
          console.log("Terminando fase de ataque por fin de partida...")
          clearInterval(this.intervarloConsultaTerritorio)
        }
        // Prevenci??n de condiciones de carrera (Se pulsa el bot??n de fase inmediatamente despu??s de entrar a Ataque)
        else if (this.logica.fase != 2) {
          console.log("Detectado bucle de consulta en atacar fuera de fase, terminando...")
          clearInterval(this.intervarloConsultaTerritorio)
          if (this.logica.jugadorTurno == this.logica.yo) {
            console.log("Detectado bucle de consulta en atacar fuera de fase, pasando a fortificar...")
            this.tratarFaseFortificar()
          }
        }
        console.log("Fin de intervalo de tratarFaseAtacar en fase", this.logica.fase)
      },
      50);
  }

  tratarFaseFortificar() {
    // Fuerza incondicionalmente cualquier alerta activa y el intervalo de consulta de territorio,
    // para evitar condiciones de carrera entre una fase y otra
    clearInterval(this.intervarloConsultaTerritorio)
    this.delay(50) // Hace una espera del mismo tiempo que tarda un intervalo de consulta de territorios
    Swal.close()

    console.log("Estamos en fase de fortificaci??n!")
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

            if (Number.parseInt(tropasTerritorio1)-1 <= 0) {
              Swal.fire({
                title: 'No puedes fortificar desde un territorio con 1 tropa',
                //text: error.error,
                icon: 'error',
                timer: 2000,
                willClose: () => {
                  this.tratarFaseFortificar()
                  return
                }
              })
            } else {
              // Una vez hecho, se llama por callback a la selecci??n de tropas
              this.mostrarAlertaRangoAsincrona("Selecciona el n??mero de tropas", "1", String(Number.parseInt(tropasTerritorio1)-1), "fortificar");
            }
          }
        }
        console.log("Fin de intervalo de tratarFaseFortificar en fase", this.logica.fase)
      },
      50);
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
    if (restantesDestino < 1 && (obj.JugadorAtacante == this.logica.yo)) {
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
    this.mostrarAlertaRangoAsincrona("??Has ocupado el territorio! Selecciona el n??mero de tropas de ocupaci??n", "1", String(restantesOrigen - 1), "ocupar");
  }

  reiniciarOcuparResumen(tropasOrigen : number) {
    console.log("Reiniciando ocupar por resumen...")

    var nombreTerritorioOrigen : string = this.territorios[Number.parseInt(this.territorioOrigen)]

    this.mostrarAlertaRangoAsincrona("Selecciona el n??mero de tropas de ocupaci??n desde "+nombreTerritorioOrigen, "1", String(tropasOrigen-1), "ocupar");
  }

  reiniciarOcupar() {
    console.log("reiniciando ocupar por fallo...")
    if (this.objetoOcuparGuardado == null) { // Ha habido un fallo tras resumir
      this.reiniciarOcuparResumen(Number.parseInt(this.tropasOrigenFalloOcuparResumir)-1)
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
    this.aumentarTerritoriosCajaJugadores(obj.JugadorOcupante, 1)
    this.aumentarTerritoriosCajaJugadores(obj.JugadorOcupado, -1)

    this.mostrarAlertaAtaque("Ocupaci??n", "El jugador " + obj.JugadorOcupante + " ha ocupado " + this.territorios[idTerritorioDestino] + " con "
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

    this.mostrarAlerta("Fortificaci??n",
      "El jugador "+obj.Jugador+" ha fortificado " + nombreTerritorio2 + " con " + tropasFortificacion + " tropas desde " + nombreTerritorio1)
  }

  tratarInicioTurno(obj:any){
    console.log("Inicio de turno de "+obj.Jugador)

    var tropasObtenidas = obj.TropasObtenidas;

    this.aumentarTropasCajaJugadores(obj.Jugador, tropasObtenidas)
    var numTerritorios = obj.RazonNumeroTerritorios
    var numContinentes = obj.RazonContinentesOcupados

    var mensajeExtraContinentes = (numContinentes>0)? " y " + numContinentes + " continentes" : "";
    var mensajeExtraCartas = (this.cartaRobada)? ". Ha robado una carta por conquistar un territorio en su turno." : ".";
    this.cartaRobada = false
    if (this.logica.fase != 0) {
        this.mostrarAlertaRefuerzo("Inicio de turno de "+obj.Jugador,
        "El jugador "+obj.Jugador+" ha recibido " + tropasObtenidas + " tropas por ocupar " + numTerritorios + " territorios" + mensajeExtraContinentes + mensajeExtraCartas, obj)
    }

  }

  tratarAccionJugadorEliminado(obj : any) {
    if (obj.JugadorEliminado == this.logica.yo) { // Somos el jugador eliminado
      // Oscurece la pantalla, indica que se ha sido derrotado, y permite ??nicamente volver al men?? principal
      this.mostrarAlertaDerrotaPropia("Fin de la partida", "El jugador " + obj.JugadorEliminador + " te ha eliminado.")
    } else if (obj.JugadorEliminador == this.logica.yo) {
      this.mostrarAlertaDerrotaAjena("Has eliminado a un jugador",
        "Has obtenido " + obj.CartasRecibidas + " cartas de " + obj.JugadorEliminado + ".");
    } else {
      this.mostrarAlertaDerrotaAjena("Jugador eliminado", "El jugador " + obj.JugadorEliminador + " ha eliminado a " + obj.JugadorEliminado + ".")
    }
  }

  refuerzoConExito() {
    console.log("mapa en refuerzoConExito: "+this.logica.mapaJugadores)

    console.log("Refuerzo con ??xito! antes de refuerzo: "+this.logica.mapaJugadores.get(this.logica.yo)!.tropas+" tropas")
    this.logica.mapaJugadores.get(this.logica.yo)!.tropas -= this.tropasAMover
    console.log("despues refuerzo: "+this.logica.mapaJugadores.get(this.logica.yo)!.tropas+" tropas")
  }

  tratarAccionJugadorExpulsado(obj : any) {
    this.mostrarAlertaDerrotaAjena("Jugador eliminado",
      "El jugador " + obj.JugadorEliminado + " ha sido desconectado de la partida por rendirse o por inactividad." +
      "Sus territorios pueden ser conquistados sin restricciones.");
  }

  tratarAccionReforzar(obj : any) {
    var jugador = obj.Jugador;
    var territorio = obj.TerritorioReforzado;
    var tropasRefuerzo = obj.TropasRefuerzo;

    this.aumentarTropasRegion(territorio, tropasRefuerzo)
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

  async tratarAccionPartidaFinalizada(obj: any) {
    console.log("Recibida partida finalizada")
    // Termina todo el aut??mata por completo
    this.terminarAutomataJuego()
    // Espera a que se cierren alertas permanentes pendientes en la siguiente iteraci??n pendiente de los intervalos de consulta
    await this.delay(6000)
    this.terminarAutomataJuego()
    if (obj.JugadorGanador === this.logica.yo) {
      Swal.fire({
        title: "Fin de la partida",
        text: "Enhorabuena. Has ganado al resto de jugadores.",
        icon: 'success',
        confirmButtonText: 'OK',
        confirmButtonColor: '#3085d6',
        willClose: () => {

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
          this.router.navigate(['/identificacion'])
        }
      })
    }
  }

  tratarAccionMensaje(obj : any) {
    document.getElementById("cajaChat")!.innerHTML = obj.JugadorEmisor + ": "+obj.Mensaje
  }


  // Funciones de terminaci??n

  terminarAutomataJuego() {
    console.log("Terminando aut??mata del juego...")
    clearInterval(this.intervarloConsultaTerritorio)
    clearInterval(this.intervaloConsultaEstado)
    Swal.close()
  }


  // Funciones de carga de assets

  // Solicita los avatares de los jugadores presentes, que se rellenar??n mediante callback
  obtenerAvataresJugadores() {
    this.logica.mapaJugadores.forEach((estado: any, key: string) => {
      this.llamadasAPI.obtenerAvatar(this, key)
    })
  }

  // Carga de un avatar
  introducirAvatar(blob : any, jugador : string) {
    const img = URL.createObjectURL(blob);

    // Busca la caja de jugador, y escribe la URL de la imagen parseada
    for (var i = 0; i < this.logica.mapaJugadores.size; i++) {
      console.log("mirando si ", document.getElementById("nombreJugador" + (i+1))!.innerHTML, "coincide con", jugador, "truncado a", this.truncarNombreJugador(jugador))
      if (document.getElementById("nombreJugador" + (i+1))!.innerHTML == this.truncarNombreJugador(jugador)) {
        console.log("coincide :)")
        var imagen = document.getElementById("avatarJugador" + (i+1))! as HTMLImageElement;
        if (imagen.src == "") { // Si no, coincide con el nombre de otro usuario, y ya se ha introducido su imagen
          imagen.src = img;
          return
        }
      }
    }
  }

  // Funciones de cambio de botones inferiores

  toggleDisplay() { this.isShow = !this.isShow;}

  changeImage() {
    if (!this.isShow) {this.source = "assets/bar-chart.png";}
    else {this.source = "assets/cross.png";}
  }

  cambiarFase() {
    this.rellenarFase(0);
    console.log("Cambiando de fase");
    this.http.post(LlamadasAPI.URLApi+'/api/pasarDeFase', null, { observe:'response', responseType:'text', withCredentials: true})
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

  setMapaInfo() {
    console.log("Terminando aut??mata al cambiar a vista de informaci??n...")
    this.terminarAutomataJuego()
    this.info = 1;
  }

  irCartas(){
    if (this.logica.fase == 1 && this.logica.jugadorTurno  == this.logica.yo) {
      this.router.navigate(['/cartas'])
      console.log("Terminando aut??mata al cambiar a vista de cartas...")
      this.terminarAutomataJuego()
    }
  }

  // Funci??n de Sleep

  delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }

  // Funciones para herencia de mapa<->juego

  ngAfterViewInit() {}
}

