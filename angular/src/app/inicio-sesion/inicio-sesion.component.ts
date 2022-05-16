import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'inicio-sesion',
  templateUrl: './inicio-sesion.component.html',
  styleUrls: ['./inicio-sesion.component.css']
})
export class InicioSesionComponent  {

    profileForm = this.fb.group({
        nombre: new FormControl('',[
          Validators.required,
        ]),
        password: new FormControl('',[
          Validators.required,]),
      });

  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router) { 
    document.body.style.background = "##4e73df;";
    document.body.style.backgroundImage= "linear-gradient(180deg,#4e73df 10%,#224abe 100%)"
  }

  cookie:any;
  //nombre_usuario:any;

  /*getNombre_Usuario(nombre:string) {
    nombre = nombre.split('=')[1];
    nombre = nombre.split('|')[0];
    return nombre;
  }

  getCookie(nombre:string) {
    nombre = nombre.split('|')[1];
    nombre = nombre.split(';')[0];
    return nombre;
  }*/

  onSubmit() {
    console.log(this.profileForm.value);

    var formData: any = new FormData();
    formData.append('nombre', this.profileForm.get('nombre')!.value);
    formData.append('password', this.profileForm.get('password')!.value);

    this.http.post('http://localhost:8090/login', formData, {observe:'response', responseType:'text'})
        .subscribe({
          next :(response) => {Swal.fire({
                                          title: 'Inicio de sesión completado con éxito',
                                          icon: 'success',
                                          timer: 2000,
                                          timerProgressBar: true,}),
                              //this.cookie = response.body,
                              //localStorage.setItem('cookie', this.cookie),
                              document.cookie = response.body!,
                              localStorage.setItem('nombre_usuario', response.body! );
                              this.router.navigate(['/identificacion'])
                              },

          error: (error) => {Swal.fire({
                                        title: 'Se ha producido un error al iniciar sesión',
                                        text: error.error,
                                        icon: 'error',
                                      });
                            }
          });
 }

  resetearPassword() {

  }

  introducirToken() {

  }

  get nombre() { return this.profileForm.get('nombre')!; }
  get password() { return this.profileForm.get('password')!; }
}
