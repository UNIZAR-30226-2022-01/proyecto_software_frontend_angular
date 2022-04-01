import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigPartidaComponent } from './config-partida.component';

describe('ConfigPartidaComponent', () => {
  let component: ConfigPartidaComponent;
  let fixture: ComponentFixture<ConfigPartidaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConfigPartidaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigPartidaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
