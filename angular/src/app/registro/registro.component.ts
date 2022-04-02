import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl  } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';


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
  
  cookie:any;

  constructor(private fb: FormBuilder, private router: Router, private http: HttpClient) {}
  
  onSubmit() {
    var formData: any = new FormData();
    formData.append('nombre', this.profileForm.get('nombre')!.value);
    formData.append('email', this.profileForm.get('email')!.value);
    formData.append('password', this.profileForm.get('password')!.value);
    
    this.http.post('http://localhost:8090/registro', formData, {observe:'response', responseType:'text'})
        .subscribe({
          next :(response) => {Swal.fire({
                                          title: 'Registro completado con éxito',
                                          icon: 'success',
                                          timer: 2000,
                                          timerProgressBar: true,
                                        }),
                              //this.cookie = response.body,
                              //localStorage.setItem('cookie', this.cookie),
                              document.cookie = response.body!,
                              this.router.navigate(['/identificacion'])
                              },
                              
          error: (error) => {Swal.fire({
                                      title: 'Se ha producido un error al registrarse',
                                      text: error.error,
                                      icon: 'error',
                                      });}
        });  
  }


  get nombre() { return this.profileForm.get('nombre')!; }
  get email() { return this.profileForm.get('email')!; }
  get password() { return this.profileForm.get('password')!; }
  get password2() { return this.profileForm.get('password2')!; }

}

 