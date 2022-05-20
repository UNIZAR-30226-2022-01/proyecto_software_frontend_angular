import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import {LlamadasAPI} from "../llamadas-api";
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-config-perfil',
  templateUrl: './config-perfil.component.html',
  styleUrls: ['./config-perfil.component.css']
})
export class ConfigPerfilComponent implements OnInit {
  nombre:string="";
  descripcion:string="";
  email:string="";

  getNombre_Usuario(nombre:string) {
    nombre = nombre.split('=')[1];
    nombre = nombre.split('|')[0];
    return nombre;
  }

  ngOnInit(): void {
    document.body.style.background = "#f8f9fc";
    this.nombre = this.getNombre_Usuario(document.cookie),
      this.http.get<Perfil>(LlamadasAPI.URLApi+'/api/obtenerPerfil/'+this.nombre, {observe:'body',withCredentials: true})
          .subscribe(
            data => {console.log(data);
              this.descripcion = data.Biografia;
              this.email = data.Email;
              console.log(data);
          })
  }

  profileForm = this.fb.group({
    email: new FormControl(this.email,[]),
    descripcion: new FormControl(this.descripcion,[]),
  });

  constructor(private fb: FormBuilder,private http: HttpClient, private router: Router) { }

  onSubmit() {
    var formData: any = new FormData();
    if (this.profileForm.get('descripcion')!.value && this.profileForm.get('email')!.value){
      formData.append('biografia', this.profileForm.get('descripcion')!.value);
      formData.append('email', this.profileForm.get('email')!.value);
      this.http.post(LlamadasAPI.URLApi+'/api/modificarEmailYBiografia', formData, {observe:'response', responseType:'text',withCredentials: true})
        .subscribe({
          next :(response) => {Swal.fire({
                                          title: 'Perfil editado con éxito',
                                          icon: 'success',
                                          timer: 2000,
                                          timerProgressBar: true,}),
                              this.router.navigate(['/miPerfil'])
                              },

          error: (error) => {Swal.fire({
                                        title: 'Se ha producido un error al editar el perfil',
                                        text: error.error,
                                        icon: 'error',
                                      });
                            }
          });
    }
    else if (this.profileForm.get('descripcion')!.value){
      formData.append('biografia', this.profileForm.get('descripcion')!.value);
      this.http.post(LlamadasAPI.URLApi+'/api/modificarBiografia', formData, {observe:'response', responseType:'text',withCredentials: true})
        .subscribe({
          next :(response) => {Swal.fire({
                                          title: 'Biografía editado con éxito',
                                          icon: 'success',
                                          timer: 2000,
                                          timerProgressBar: true,}),
                              this.router.navigate(['/miPerfil'])
                              },

          error: (error) => {Swal.fire({
                                        title: 'Se ha producido un error al editar el perfil',
                                        text: error.error,
                                        icon: 'error',
                                      });
                            }
          });
      
    } else if (this.profileForm.get('email')!.value){
      formData.append('email', this.profileForm.get('email')!.value);
      this.http.post(LlamadasAPI.URLApi+'/api/modificarEmail', formData, {observe:'response', responseType:'text',withCredentials: true})
        .subscribe({
          next :(response) => {Swal.fire({
                                          title: 'Email editado con éxito',
                                          icon: 'success',
                                          timer: 2000,
                                          timerProgressBar: true,}),
                              this.router.navigate(['/miPerfil'])
                              },

          error: (error) => {Swal.fire({
                                        title: 'Se ha producido un error al editar el perfil',
                                        text: error.error,
                                        icon: 'error',
                                      });
                            }
          });
    }
   
    
  }

  }

export interface Perfil {
  Biografia: any;
  Email:any;
}