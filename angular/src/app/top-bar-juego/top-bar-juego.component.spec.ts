import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopBarJuegoComponent } from './top-bar-juego.component';

describe('TopBarJuegoComponent', () => {
  let component: TopBarJuegoComponent;
  let fixture: ComponentFixture<TopBarJuegoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TopBarJuegoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TopBarJuegoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
