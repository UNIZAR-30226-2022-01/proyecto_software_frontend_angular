import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-amigos',
  templateUrl: './amigos.component.html',
  styleUrls: ['./amigos.component.css']
})
export class AmigosComponent implements OnInit {

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
  }

  patron = new FormControl('')
  
  busqueda:any;
  onChangeEvent(event: any){
    this.http.get('http://localhost:8090/api/obtenerUsuariosSimilares/'+this.patron.value, {withCredentials: true})
    .subscribe(
      data => { this.busqueda = data })

  }

  //get patron() { return this.profileForm.get('patron')!; }
  
}
