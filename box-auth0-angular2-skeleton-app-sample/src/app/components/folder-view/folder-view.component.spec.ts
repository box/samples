import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FolderViewComponent } from './folder-view.component';

describe('FolderViewComponent', () => {
  let component: FolderViewComponent;
  let fixture: ComponentFixture<FolderViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FolderViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FolderViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
