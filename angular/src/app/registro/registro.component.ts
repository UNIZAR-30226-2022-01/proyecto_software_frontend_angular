import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl  } from '@angular/forms';
import { EnviarFormularioService } from '../enviar-formulario.service';
import { HttpClient } from '@angular/common/http';



@Component({
  selector: 'registro',
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css']
})

export class RegistroComponent  {

  profileForm = this.fb.group({
    nombre: new FormControl('',[
      Validators.required,
      Validators.minLength(5),
      Validators.pattern('[A-Za-z0-9-_]+'),
    ]),
    email: new FormControl('',[
      Validators.required,
      Validators.email,
    ]),
    password: new FormControl('',[
      Validators.required,
      Validators.minLength(8),
    ]),
    password2: new FormControl('',[
      Validators.required,]),
  });
  
  
  constructor(private fb: FormBuilder, private enviar: EnviarFormularioService, private http: HttpClient) {}
  
  cookie:any;       
  nombre_usuario:any; 

  getNombre_Usuario(nombre:string) {
    nombre = nombre.split('=')[1];
    nombre = nombre.split('|')[0];
    return nombre;
  }

  getCookie(nombre:string) {
    nombre = nombre.split('|')[1];
    nombre = nombre.split(';')[0];
    return nombre;
}

  onSubmit() {
    var formData: any = new FormData();
    formData.append('nombre', this.profileForm.get('nombre')!.value);
    formData.append('email', this.profileForm.get('email')!.value);
    formData.append('password', this.profileForm.get('password')!.value);
    
    this.http.post('http://localhost:8090/registro', formData, {observe:'response', responseType:'text'})
        .subscribe({
          next :(response) => {this.cookie = this.getCookie(response.body!),
                              this.nombre_usuario = this.getNombre_Usuario(response.body!),
                              localStorage.setItem('cookie', this.cookie),
                              localStorage.setItem('nombre_usuario', this.nombre_usuario)
                            },
                              
          error: (error) => {alert(error.error)}//console.log('El error:',error.error)}, 
        });  
  }


  get nombre() { return this.profileForm.get('nombre')!; }
  get email() { return this.profileForm.get('email')!; }
  get password() { return this.profileForm.get('password')!; }
  get password2() { return this.profileForm.get('password2')!; }



}

 