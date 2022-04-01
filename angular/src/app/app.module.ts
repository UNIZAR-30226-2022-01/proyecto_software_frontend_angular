import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TopBarComponent } from './top-bar/top-bar.component';
import { InicioSesionComponent } from './inicio-sesion/inicio-sesion.component';
import { RegistroComponent } from './registro/registro.component';
import { InicioComponent } from './inicio/inicio.component';
import { TiendaComponent } from './tienda/tienda.component';
import { ConfigPartidaComponent } from './config-partida/config-partida.component';
import { BuscarPartidaComponent } from './buscar-partida/buscar-partida.component';
import { PerfilComponent } from './perfil/perfil.component';
import { PersonalizacionComponent } from './personalizacion/personalizacion.component';
import { NotificacionesComponent } from './notificaciones/notificaciones.component';
import { MapaComponent } from './mapa/mapa.component';
import { RouterModule, Routes } from '@angular/router';
import { CrearPartidaComponent } from './crear-partida/crear-partida.component';
import { RankingComponent } from './ranking/ranking.component';
import { AmigosComponent } from './amigos/amigos.component';
import { DownBarComponent } from './down-bar/down-bar.component';
import { TopBarJuegoComponent } from './top-bar-juego/top-bar-juego.component';
import { CirculosTropasComponent } from './circulos-tropas/circulos-tropas.component';
import { IdentificacionComponent } from './identificacion/identificacion.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

const appRoutes: Routes = [
  {path: 'inicio', component: InicioComponent},
  {path: 'registroUsuario', component: RegistroComponent},
  {path: 'inicioSesion', component: InicioSesionComponent},
  {path: 'tienda', component: TiendaComponent},
  {path: 'top-bar', component: TopBarComponent},
  {path: 'configuracionPartida', component: ConfigPartidaComponent},
  {path: 'buscarPartida', component: BuscarPartidaComponent},
  {path: 'perfilUsuario', component: PerfilComponent},
  {path: 'personalizacion', component: PersonalizacionComponent},
  {path: 'notificaciones', component: NotificacionesComponent},
  {path: '', component: MapaComponent},
  {path: 'crearPartida', component: CrearPartidaComponent},
  {path: 'ranking', component: RankingComponent},
  {path: 'amigos', component: AmigosComponent},
  {path: 'identificacion', component: IdentificacionComponent}
]


@NgModule({
  declarations: [
    AppComponent,
    TopBarComponent,
    InicioSesionComponent,
    RegistroComponent,
    InicioComponent,
    TiendaComponent,
    ConfigPartidaComponent,
    BuscarPartidaComponent,
    PerfilComponent,
    PersonalizacionComponent,
    NotificacionesComponent,
    MapaComponent,
    CrearPartidaComponent,
    RankingComponent,
    AmigosComponent,
    DownBarComponent,
    TopBarJuegoComponent,
    CirculosTropasComponent,
    IdentificacionComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    FormsModule,
    RouterModule.forRoot(appRoutes),
  ],
  exports:[RouterModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
