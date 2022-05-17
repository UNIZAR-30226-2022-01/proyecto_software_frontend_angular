import { HttpClient } from '@angular/common/http';
import { conditionallyCreateMapObjectLiteral } from '@angular/compiler/src/render3/view/util';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from "sweetalert2";
import {LlamadasAPI} from "../llamadas-api";

@Component({
  selector: 'app-cartas',
  templateUrl: './cartas.component.html',
  styleUrls: ['./cartas.component.css']
})
export class CartasComponent implements OnInit {
  misCartas = new Array<any>();
  cartasSeleccionadas = new Array<any>();
  cartasSeleccionadasVacias = new Array<any>();

  territorios = ["Australia\nOriental", "Indonesia", "Nueva\nGuinea", "Alaska", "Ontario", "Territorio\ndel\nNoroeste", "Venezuela", "Madagascar", "Africa\ndel\nNorte", "Groenlandia",
                  "Islandia", "Reino\nUnido", "Escandinavia", "Japon", "Yakutsk", "Kamchatka", "Siberia", "Ural", "Afganistan", "Oriente\nMedio",
                  "India", "Siam", "China", "Mongolia", "Irkutsk", "Ucrania", "Europa\ndel_Sur", "Europa\nOccidental", "Europa\ndel\nNorte", "Egipto",
                  "Africa\nOriental", "Congo", "Sudafrica", "Brasil", "Argentina", "Este_de\nlos\nEstados_Unidos", "Estados\nUnidos\nOccidental", "Quebec",
                  "America\nCentral", "Peru", "Australia_Occidental", "Alberta"];

  imagenCartas=["assets/soldadoGrande.png","assets/caballoGrande.png","assets/canionGrande.png"]

  constructor(private http : HttpClient,private router:Router) {}

  obtenerCartas(){
    this.http.get(LlamadasAPI.URLApi+'/api/consultarCartas', {observe:'body', responseType:'text', withCredentials: true})
      .subscribe(
        data => {
          console.log(data);
          this.misCartas = JSON.parse(data);
          console.log(this.misCartas);
          this.cartasSeleccionadas = [];
          this.cartasSeleccionadasVacias = Array(3-this.cartasSeleccionadas.length).fill(0).map((x,i)=>i);
        })
  }

  seleccionar(carta:any){
      // Comprobamos si carta esta en las cartas seleccionadas
      if (this.cartasSeleccionadas.find((element: any) => element.IdCarta == carta.IdCarta)){
        document.getElementById(carta.IdCarta)!.style.backgroundColor = "#fafafa";  // Le devolvemos el color original
        //La borramos de cartas seleccionadas
        this.cartasSeleccionadas.forEach((element:any, index:number)=>{
          if(element.IdCarta == carta.IdCarta) {this.cartasSeleccionadas.splice(index,1);}
        });
       this.cartasSeleccionadasVacias = Array(this.cartasSeleccionadasVacias.length+1).fill(0).map((x,i)=>i);
      }
      else{
        if(this.cartasSeleccionadas.length != 3){ //La añadimos si no hay 3 cartas seleccionadas
          document.getElementById(carta.IdCarta)!.style.backgroundColor = "#CCCCCC";  // La marcamos como carta seleccionada
          this.cartasSeleccionadas.push(carta);//La añadimosde cartas seleccionadas
          this.cartasSeleccionadasVacias = Array(this.cartasSeleccionadasVacias.length-1).fill(0).map((x,i)=>i);
        }
      }
  }

  ngOnInit() {
    document.body.style.backgroundColor = "#FFFFFF"
    this.obtenerCartas();
  }

  submit() {
    this.http.post(LlamadasAPI.URLApi+'/api/cambiarCartas/'+this.cartasSeleccionadas[0].IdCarta+'/'+this.cartasSeleccionadas[1].IdCarta+'/'+this.cartasSeleccionadas[2].IdCarta, null, {withCredentials: true})
    .subscribe({
      next : (response) => {
        document.getElementById(this.cartasSeleccionadas[0].IdCarta)!.style.backgroundColor = "#fafafa";  // Le devolvemos el color original
        document.getElementById(this.cartasSeleccionadas[1].IdCarta)!.style.backgroundColor = "#fafafa";  // Le devolvemos el color original
        document.getElementById(this.cartasSeleccionadas[2].IdCarta)!.style.backgroundColor = "#fafafa";  // Le devolvemos el color original
        this.obtenerCartas();

      },
      error: (error) => {
        Swal.fire({
          title: 'Se ha producido un error al cambiar las cartas seleccionadas',
          text: error.error,
          icon: 'error',
          timer: 2000,
        })
      }
      });
  }

  salir(){
    localStorage.setItem('volviendo', "true");
    this.router.navigate(['/juego'])
  }

}

export interface Carta{
  IdCarta:number,
  Tipo:number,
  Region:number,
  EsComodin:boolean
}
