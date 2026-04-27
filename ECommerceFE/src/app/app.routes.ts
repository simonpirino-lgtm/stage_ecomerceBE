import { Routes } from '@angular/router';
import { HomeComponent } from './components/home-component/home-component';
import { LoginComponent } from './components/login-page/login-component';
import { CarrelloPageComponent } from './components/carrello-page/carrello-page';
import { AuthGuard } from './services/authguard.service';
import { ErrorComponent } from './components/error.component/error.component';
import { CreditComponent } from './components/credit-component/credit-component';
import { SettingsPageComponent } from './components/settings-page/settings-page';
import { LibreriaComponent } from './components/libreria-component/libreria-component';
import { AdminGiochiComponent } from './components/admin-giochi/admin-giochi';
import { RoleGuard } from './services/role.guard';




export const routes: Routes = [

  { path: '', component: LoginComponent },
  { path: 'home', canActivate: [AuthGuard], component:HomeComponent},
  { path: 'carrello', canActivate: [AuthGuard], component: CarrelloPageComponent},
  { path: 'credito', canActivate: [AuthGuard], component: CreditComponent},
  { path: 'account' , canActivate :[AuthGuard], component: SettingsPageComponent},
  { path : 'libreria', canActivate : [AuthGuard], component: LibreriaComponent},
  { path: 'admin/giochi',canActivate: [AuthGuard, RoleGuard],component: AdminGiochiComponent},
  { path: '**', component: ErrorComponent}
];
 