import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNewFolderComponent } from './add-new-folder.component';

describe('AddNewFolderComponent', () => {
  let component: AddNewFolderComponent;
  let fixture: ComponentFixture<AddNewFolderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddNewFolderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddNewFolderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
