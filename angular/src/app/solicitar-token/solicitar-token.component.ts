import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-solicitar-token',
  templateUrl: './solicitar-token.component.html',
  styleUrls: ['./solicitar-token.component.css']
})
export class SolicitarTokenComponent implements OnInit {

  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router) { }

  profileForm = this.fb.group({
    usuario: new FormControl('',[
      Validators.required,
    ])
  });

  ngOnInit(): void {
    document.body.style.background = "#4e73df;";
    document.body.style.backgroundImage= "linear-gradient(180deg,#4e73df 10%,#224abe 100%)"
  }

  onSubmit() {
    var formData: any = new FormData();
    formData.append('usuario', this.profileForm.get('usuario')!.value);

    this.http.post('http://localhost:8090/obtenerTokenResetPassword', formData, {observe:'response', responseType:'text'})
      .subscribe({
        next :(response) => {Swal.fire({
          title: 'Token solicitado con éxito. Por favor, consulta tu bandeja de correo electrónico.',
          icon: 'success',
          timer: 2000,
          timerProgressBar: true,}),
          this.router.navigate(['/resetPassword'])
        },

        error: (error) => {Swal.fire({
          title: 'Se ha producido un error al solicitar el token',
          text: error.error,
          icon: 'error',
        });
        }
      });
  }

  get usuario() { return this.profileForm.get('usuario')!; }

}
