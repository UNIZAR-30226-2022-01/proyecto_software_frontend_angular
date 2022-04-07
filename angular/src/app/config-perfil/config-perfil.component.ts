import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-config-perfil',
  templateUrl: './config-perfil.component.html',
  styleUrls: ['./config-perfil.component.css']
})
export class ConfigPerfilComponent implements OnInit {

  ngOnInit(): void {
  }

  profileForm = this.fb.group({
    nombreUsuario: new FormControl('',[
      Validators.required,
      Validators.minLength(4),]),
    descripcion: new FormControl('',[]),
    email: new FormControl('',[
        Validators.required,]),
    password: new FormControl('',[
      Validators.required,]),
  });

  constructor(private fb: FormBuilder) { }

  onSubmit() {
    console.warn(this.profileForm.value);
    console.log(this.profileForm.value);
  }

  get nombreUsuario() { return this.profileForm.get('nombreUsuario')!; }
  get email() { return this.profileForm.get('email')!; }
  get password() { return this.profileForm.get('password')!; }
}
