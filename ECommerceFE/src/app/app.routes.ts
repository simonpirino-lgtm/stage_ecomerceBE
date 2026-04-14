import { Routes } from '@angular/router';
import { HomeComponent } from './components/home-component/home-component';
import { CarrelloPage } from './components/carrello-page/carrello-page';
import { LoginComponent } from './components/login-page/login-component';

/* export const routes: Routes = [
    {path:"", component: HomeComponent},
    {path:"carrello",component: CarrelloPage}
    
]; */

export const routes: Routes = [

  { path: '', component: LoginComponent },
  { path: 'home', component:HomeComponent}
];
