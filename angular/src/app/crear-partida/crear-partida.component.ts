import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import {  FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'crear-partida',
  templateUrl: './crear-partida.component.html',
  styleUrls: ['./crear-partida.component.css']
})


export class CrearPartidaComponent implements OnInit {
  //cookie:any;

  ngOnInit() {
    document.body.style.background = "#f8f9fc";
    //this.nombre_usuario = localStorage.getItem('nombre_usuario'),
    //this.cookie = localStorage.getItem('cookie')
  }

  profileForm = this.fb.group({
    maxJugadores: new FormControl('',[
      Validators.required,]),
    password: new FormControl('',[
      Validators.required,]),
  });

  privada: boolean = false;
  publica: boolean = false;

  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router) {}

  actualizar(nombre:string){
    console.log(this.privada,this.publica);
    if (nombre == 'privada' ){
      this.privada = true;
      this.publica = false;
      document.getElementById('contrasenia')!.style.visibility="visible";
    }else if (nombre == 'publica' ){
      this.privada = false;
      this.publica = true;
      document.getElementById('contrasenia')!.style.visibility="hidden";

    }
  }


  onSubmit() {

  var formData: any = new FormData();
  formData.append('maxJugadores', this.profileForm.get('maxJugadores')!.value);
  formData.append('password', this.profileForm.get('password')!.value);

  //document.cookie = this.cookie;

  if (this.publica == true){
    formData.append('tipo', 'Publica');
  }else{
    formData.append('tipo', 'Privada');
  }

  console.log('hola, max jugadores antes de post:', this.profileForm.get('maxJugadores')!.value);
  
  this.http.post('http://localhost:8090/api/crearPartida', formData, { observe:'response', responseType:'text', withCredentials: true})
      .subscribe({
        next :(response) => {Swal.fire({
                                        title: 'Partida creada con éxito',
                                        text: "Espera a que el resto de jugadores se unan a la partida",
                                        icon: 'success',
                                      });
 
                              this.router.navigate(['/lobby'])
                            },
        error: (error) => {Swal.fire({
                                    title: 'Se ha producido un error al crear la partida',
                                    text: error.error,
                                    icon: 'error',
                                    })
                          }
      });
  }
  
  get maxJugadores() { return this.profileForm.get('maxJugadores')!; }
  get esPrivada() { return this.privada; }
  get esPublica() { return this.publica; }
  get password() { return this.profileForm.get('password')!; }
  
}
