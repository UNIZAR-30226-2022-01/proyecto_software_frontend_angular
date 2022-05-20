import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CambioContrasegnaComponent } from './cambio-contrasegna.component';

describe('CambioContrasegnaComponent', () => {
  let component: CambioContrasegnaComponent;
  let fixture: ComponentFixture<CambioContrasegnaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CambioContrasegnaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CambioContrasegnaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
