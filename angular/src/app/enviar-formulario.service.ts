import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class EnviarFormularioService {

  api_registro = 'http://localhost:8090/registro';
  api_inicio_sesion = 'http://localhost:8090/login ';
  
  constructor(private _http: HttpClient) { }

  enviarFormularioRegistro(formulario: FormGroup) : Observable<FormGroup>{
    return this._http.post<FormGroup>(this.api_registro, formulario);
  }

}
