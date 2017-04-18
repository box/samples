import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BoxExplorerComponent } from './box-explorer.component';

describe('BoxExplorerComponent', () => {
  let component: BoxExplorerComponent;
  let fixture: ComponentFixture<BoxExplorerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BoxExplorerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BoxExplorerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
