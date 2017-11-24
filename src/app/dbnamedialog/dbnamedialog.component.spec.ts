import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DbnamedialogComponent } from './dbnamedialog.component';

describe('DbnamedialogComponent', () => {
  let component: DbnamedialogComponent;
  let fixture: ComponentFixture<DbnamedialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DbnamedialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DbnamedialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
