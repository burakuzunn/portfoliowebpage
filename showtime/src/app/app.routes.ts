import { Routes } from '@angular/router';
import { PhoneComponent } from './phone/phone.component';

export const routes: Routes = [
  { path: 'phone', component: PhoneComponent },
  { path: '', redirectTo: '/', pathMatch: 'full' }
];
