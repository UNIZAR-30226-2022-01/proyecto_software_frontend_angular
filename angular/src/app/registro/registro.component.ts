import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, AbstractControl  } from '@angular/forms';
//import { CustomValidators } from '../custom-validators';


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
    ]),
    email: new FormControl('',[
      Validators.required,]),
    password: new FormControl('',[
      Validators.required,]),
    password2: new FormControl('',[
      Validators.required,]),
    //password2: [''],
  });
  

  
  constructor(private fb: FormBuilder) { }
  


  
  onSubmit() {
    console.warn(this.profileForm.value);
    console.log(this.profileForm.value);
  }


get nombre() { return this.profileForm.get('nombre')!; }
get email() { return this.profileForm.get('email')!; }
get password() { return this.profileForm.get('password')!; }
get password2() { return this.profileForm.get('password2')!; }

}

