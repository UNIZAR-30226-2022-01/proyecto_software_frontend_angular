import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolicitarTokenComponent } from './solicitar-token.component';

describe('SolicitarTokenComponent', () => {
  let component: SolicitarTokenComponent;
  let fixture: ComponentFixture<SolicitarTokenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SolicitarTokenComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SolicitarTokenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
