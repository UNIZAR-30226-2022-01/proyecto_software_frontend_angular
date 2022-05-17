import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormControl, FormBuilder } from '@angular/forms';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import {LlamadasAPI} from "../llamadas-api";

@Component({
  selector: 'app-buscar-partida',
  templateUrl: './buscar-partida.component.html',
  styleUrls: ['./buscar-partida.component.css']
})
export class BuscarPartidaComponent implements OnInit {
  jsonArray: any;
  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router) {
  }

  profileForm = this.fb.group({
    password: new FormControl(''),
  });

  ngOnInit(): void {
    document.body.style.background = "#f8f9fc";
    this.http.get(LlamadasAPI.URLApi+'/api/obtenerPartidas', {withCredentials: true}).subscribe(data => {
      console.log(data);
      this.jsonArray = data;
    })
  }

  onSubmit(id: string, esPub: boolean){
    var formData: any = new FormData();
    formData.append('idPartida', id);
    formData.append('password', this.profileForm.get('password')!.value);


    this.http.post(LlamadasAPI.URLApi+'/api/unirseAPartida', formData, {withCredentials: true})
    .subscribe({
      next : () => this.router.navigate(['/lobby']),
      error: (error) => {Swal.fire({
                                    title: 'Se ha producido un error al unirse a la partida',
                                    text: error.error,
                                    icon: 'error',
                                  });
                        }
      });
  }
}
