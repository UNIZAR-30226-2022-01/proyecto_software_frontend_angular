import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'inicio-sesion',
  templateUrl: './inicio-sesion.component.html',
  styleUrls: ['./inicio-sesion.component.css']
})
export class InicioSesionComponent  {
    
    profileForm = this.fb.group({
        nombre: new FormControl('',[
          Validators.required,
          Validators.minLength(4),
        ]),
        password: new FormControl('',[
          Validators.required,]),
      });

  constructor(private fb: FormBuilder) { }

  onSubmit() {
    console.warn(this.profileForm.value);
    console.log(this.profileForm.value);
  }

get nombre() { return this.profileForm.get('nombre')!; }
get password() { return this.profileForm.get('password')!; }
}
