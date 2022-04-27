import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormControl, FormBuilder } from '@angular/forms';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

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
    this.http.get('http://localhost:8090/api/obtenerPartidas', {withCredentials: true}).subscribe(data => {
      console.log(data);
      this.jsonArray = data;
    })
  }

  onSubmit(id: string, esPub: boolean){
    var formData: any = new FormData();
    formData.append('idPartida', id);
    formData.append('password', this.profileForm.get('password')!.value);
   
    
    this.http.post('http://localhost:8090/api/unirseAPartida', formData, {withCredentials: true})
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
