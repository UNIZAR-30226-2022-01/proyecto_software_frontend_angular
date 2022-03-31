import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import {  FormBuilder, FormControl, Validators } from '@angular/forms';


@Component({
  selector: 'crear-partida',
  templateUrl: './crear-partida.component.html',
  styleUrls: ['./crear-partida.component.css']
})


export class CrearPartidaComponent implements OnInit {
  cookie:any;
  nombre_usuario:any;

  ngOnInit() {
    this.nombre_usuario = localStorage.getItem('nombre_usuario'),
    this.cookie = localStorage.getItem('cookie')
  }

  profileForm = this.fb.group({
    maxJugadores: new FormControl('',[
      Validators.required,]),
    password: new FormControl('',[
      Validators.required,]),
  });

  privada: boolean = false;
  publica: boolean = false;

  constructor(private fb: FormBuilder, private http: HttpClient) {}

  actualizar(nombre:string){
    console.log(this.privada,this.publica);
    if (nombre == 'privada' && this.publica == true){
      this.privada = true;
      this.publica = false;
    }else if (nombre == 'publica' && this.privada == true){
      this.privada = false;
      this.publica = true;
    }else if(nombre == 'privada'){
      this.privada = true;
      this.publica = false;
    }else if (nombre == 'publica'){
      this.publica = true;
      this.privada = false;
    }
  }


  onSubmit() {
  //let hcookie = new HttpHeaders();
  //hcookie = hcookie.append('Cookie', this.cookie);
  //console.log('meto en header Cookie:' , hcookie.get('Cookie'));

  var formData: any = new FormData();
  formData.append('maxJugadores', this.profileForm.get('maxJugadores')!.value);
  formData.append('password', this.profileForm.get('password')!.value);

  console.log('Meto cookie en document.cookie:', this.cookie);
  document.cookie = this.cookie;

  if (this.publica = true){
    formData.append('tipo', 'Publica');
  }else{
    formData.append('tipo', 'Privada');
  }


  this.http.post('http://localhost:8090/api/crearPartida', formData, { observe:'response', responseType:'text', withCredentials: true})
      .subscribe({
        next :(response) => {console.log('Todo ok')},

        error: (error) => {alert(error.error)}
      });
  }

  get maxJugadores() { return this.profileForm.get('maxJugadores')!; }
  get esPrivada() { return this.privada; }
  get esPublica() { return this.publica; }
  get password() { return this.profileForm.get('password')!; }
}
