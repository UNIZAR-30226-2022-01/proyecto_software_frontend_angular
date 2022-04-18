import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapaInfoComponent } from './mapa-info.component';

describe('MapaInfoComponent', () => {
  let component: MapaInfoComponent;
  let fixture: ComponentFixture<MapaInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MapaInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MapaInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
