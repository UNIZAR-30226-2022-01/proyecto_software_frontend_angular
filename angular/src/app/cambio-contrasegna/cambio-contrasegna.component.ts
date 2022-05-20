import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import {LlamadasAPI} from "../llamadas-api";
import Swal from 'sweetalert2';
import { Router } from '@angular/router';


@Component({
  selector: 'app-cambio-contrasegna',
  templateUrl: './cambio-contrasegna.component.html',
  styleUrls: ['./cambio-contrasegna.component.css']
})
export class CambioContrasegnaComponent implements OnInit {
  nombre:string="";
  miEmail:string="";
  descripcion:string="";

  getNombre_Usuario(nombre:string) {
    nombre = nombre.split('=')[1];
    nombre = nombre.split('|')[0];
    return nombre;
  }

  profileForm = this.fb.group({
    passwordAntigua: new FormControl('',[
      Validators.required,]),
    passwordNueva: new FormControl('',[
      Validators.required,
      Validators.minLength(8),]),
    passwordNueva2: new FormControl('',[
        Validators.required,]),
  });
  
  ngOnInit(): void {
    document.body.style.background = "#f8f9fc";
  }

   

 constructor(private fb: FormBuilder,private http: HttpClient,private router: Router) { }

  onSubmit() {
    console.warn(this.profileForm.value);
    console.log(this.profileForm.value);
    var formData: any = new FormData();
    
    formData.append('passwordActual', this.profileForm.get('passwordAntigua')!.value);
      formData.append('passwordNueva', this.profileForm.get('passwordNueva')!.value);
      this.http.post(LlamadasAPI.URLApi+'/api/resetearPasswordEnLogin', formData, {observe:'response', responseType:'text',withCredentials: true})
        .subscribe({
          next :(response) => {Swal.fire({
                                          title: 'Contraseña cambiada con éxito',
                                          icon: 'success',
                                          timer: 2000,
                                          timerProgressBar: true,}),
                              this.router.navigate(['/miPerfil'])
                              },

          error: (error) => {Swal.fire({
                                        title: 'Se ha producido un error al cambiar la contraseña',
                                        text: error.error,
                                        icon: 'error',
                                      });
                            }
          });
  }

  get passwordAntigua() { return this.profileForm.get('passwordAntigua')!; }
  get passwordNueva() { return this.profileForm.get('passwordNueva')!; }
  get passwordNueva2() { return this.profileForm.get('passwordNueva2')!; }

}
