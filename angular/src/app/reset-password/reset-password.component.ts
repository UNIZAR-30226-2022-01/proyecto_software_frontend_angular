import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormControl, Validators} from "@angular/forms";
import {HttpClient} from "@angular/common/http";
import {Router} from "@angular/router";
import Swal from "sweetalert2";

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {

  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router) { }

  profileForm = this.fb.group({
    token: new FormControl('',[
      Validators.required,
    ]),
    password: new FormControl('',[
      Validators.required,]),
  });

  ngOnInit(): void {
  }

  onSubmit() {
    var formData: any = new FormData();
    formData.append('token', this.profileForm.get('token')!.value);
    formData.append('password', this.profileForm.get('password')!.value);

    this.http.post('http://localhost:8090/resetearPassword', formData, {observe:'response', responseType:'text'})
      .subscribe({
        next :(response) => {Swal.fire({
          title: 'Reseteo de contraseña completado con éxito',
          icon: 'success',
          timer: 2000,
          timerProgressBar: true,})

          this.router.navigate(['/'])
        },

        error: (error) => {Swal.fire({
          title: 'Se ha producido un error al resetear la contraseña',
          text: error.error,
          icon: 'error',
        });
        }
      });
  }

  get token() { return this.profileForm.get('token')!; }
  get password() { return this.profileForm.get('password')!; }
}
