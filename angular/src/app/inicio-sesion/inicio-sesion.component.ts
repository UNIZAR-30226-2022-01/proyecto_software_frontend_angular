import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

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

  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router) { }

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
          next :(response) => {this.cookie = response.body,
                              localStorage.setItem('cookie', this.cookie),
                              this.router.navigate(['/'])
                            },
                              
          error: (error) => {alert(error.error)}
        });  
 }

  get nombre() { return this.profileForm.get('nombre')!; }
  get password() { return this.profileForm.get('password')!; }
}
