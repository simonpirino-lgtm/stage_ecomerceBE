import { Routes } from '@angular/router';
import { HomeComponent } from './components/home-component/home-component';
import { CarrelloPageComponent } from './components/carrello-page/carrello-page';

export const routes: Routes = [
    {path:"", component: HomeComponent},
    {path:"carrello",component: CarrelloPageComponent}
    
];
 