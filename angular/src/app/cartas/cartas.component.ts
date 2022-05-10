import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-cartas',
  templateUrl: './cartas.component.html',
  styleUrls: ['./cartas.component.css']
})
export class CartasComponent implements OnInit {
  misCartas = [{IdCarta:1, Tipo:1, Region:4,EsComodin:false},
    {IdCarta:2, Tipo:2, Region:9,EsComodin:false},
    {IdCarta:9, Tipo:0, Region:0,EsComodin:true},
    {IdCarta:7, Tipo:0, Region:0,EsComodin:true}
  ];
  cosa:string="hola"
  cartasSeleccionadas = new Array<any>();
  cartasSeleccionadasVacias:any;

  territorios = ["Australia\nOriental", "Indonesia", "Nueva\nGuinea", "Alaska", "Ontario", "Territorio\ndel\nNoroeste", "Venezuela", "Madagascar", "Africa\ndel\nNorte", "Groenlandia",
                  "Islandia", "Reino\nUnido", "Escandinavia", "Japon", "Yakutsk", "Kamchatka", "Siberia", "Ural", "Afganistan", "Oriente\nMedio",
                  "India", "Siam", "China", "Mongolia", "Irkutsk", "Ucrania", "Europa\ndel_Sur", "Europa\nOccidental", "Europa\ndel\nNorte", "Egipto",
                  "Africa\nOriental", "Congo", "Sudafrica", "Brasil", "Argentina", "Este_de\nlos\nEstados_Unidos", "Estados\nUnidos\nOccidental", "Quebec",
                  "America\nCentral", "Peru", "Australia_Occidental", "Alberta"];

  imagenCartas=["https://img.icons8.com/ios-filled/100/000000/soldier.png","https://img.icons8.com/ios-filled/100/000000/horseback-riding.png","https://img.icons8.com/ios-filled/100/000000/cannon.png"]
  constructor() { 
    console.log(this.misCartas)
    console.log(this.cartasSeleccionadas)
    this.cartasSeleccionadasVacias = Array(3-this.cartasSeleccionadas.length).fill(0).map((x,i)=>i);
  }

  escribir(algo:any){
    console.log(algo)
    console.log(algo.Tipo)
    console.log(algo.Region)
    console.log(algo.EsComodin)
  }

  deseleccionar(carta:Carta){

  }

  seleccionar(carta:any){
      // Comprobamos si carta esta en las cartas seleccionadas
      if (this.cartasSeleccionadas.find((element: any) => element.IdCarta == carta.IdCarta)){
        document.getElementById(carta.IdCarta)!.style.backgroundColor = "#fafafa";  // Le devolvemos el color original
        //La borramos de cartas seleccionadas
        this.cartasSeleccionadas.forEach((element:any, index:number)=>{
          if(element.IdCarta == carta.IdCarta) {this.cartasSeleccionadas.splice(index,1);console.log('borro')}
        });
       this.cartasSeleccionadasVacias = Array(this.cartasSeleccionadasVacias.length+1).fill(0).map((x,i)=>i);
      }
      else{ 
        if(this.cartasSeleccionadas.length != 3){ //La añadimos si no hay 3 cartas seleccionadas
          document.getElementById(carta.IdCarta)!.style.backgroundColor = "#858686";  // La marcamos como carta seleccionada
          this.cartasSeleccionadas.push(carta);//La añadimosde cartas seleccionadas
          this.cartasSeleccionadasVacias = Array(this.cartasSeleccionadasVacias.length-1).fill(0).map((x,i)=>i);
        }
      } 
  }

  ngOnInit(): void {}

  


}

export interface Carta{
  IdCarta:number, 
  Tipo:number, 
  Region:number,
  EsComodin:boolean
}