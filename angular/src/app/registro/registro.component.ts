import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, AbstractControl  } from '@angular/forms';
import { Observable } from 'rxjs';
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
      Validators.minLength(4),
      Validators.pattern('[A-Za-z0-9-_]+'),
    ]),
    email: new FormControl('',[
      Validators.required,
      Validators.email,
    ]),
    password: new FormControl('',[
      Validators.required,]),
    password2: new FormControl('',[
      Validators.required,]),
    //password2: [''],
  });
  

  
  constructor(private fb: FormBuilder, private enviar: EnviarFormularioService, private http: HttpClient) {}
  
  

  onSubmit() {
    var formData: any = new FormData();
    formData.append('nombre', this.profileForm.get('nombre')!.value);
    formData.append('email', this.profileForm.get('email')!.value);
    formData.append('password', this.profileForm.get('password')!.value);

    console.log(this.profileForm.value);
    /*this.enviar.enviarFormularioRegistro(this.profileForm)
      .subscribe(
        data => console.log('No hay errores!', data),
        error => console.error('Error', error)
      )*/
    var respuesta1 = this.http.post('http://localhost:8090/registro', formData, {observe:'response', responseType:'text'})
        .subscribe(
          respuesta  => {console.log(respuesta);}
          
        );
    console.log(respuesta1); 
    
    
 }


  get nombre() { return this.profileForm.get('nombre')!; }
  get email() { return this.profileForm.get('email')!; }
  get password() { return this.profileForm.get('password')!; }
  get password2() { return this.profileForm.get('password2')!; }

}

export interface Config {
  respuesta: string;
}