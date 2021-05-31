import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { ProfileComponent } from './profile/profile.component';
import { BoardUserComponent } from './board-user/board-user.component';
import { BoardAdminComponent } from './board-admin/board-admin.component';
import { ApiComponent } from './api/api.component';
import { DriveComponent } from './drive/drive.component';
import { ActivateComponent } from './activate/activate.component';
import { RecoverPasswordComponent } from './recover-password/recover-password.component';
import { DownloadComponent } from './download/download.component';


const routes: Routes = [

  {path: 'home',                 component:    HomeComponent},
  {path: 'login',                component:    LoginComponent},
  {path: 'register',             component:    RegisterComponent},
  {path: 'profile',              component:    ProfileComponent},
  {path: 'user',                 component:    BoardUserComponent},
  {path: 'admin',                component:    BoardAdminComponent},
  {path: 'api',                  component:    ApiComponent},
  {path: 'drive',                component:    DriveComponent},
  {path: 'activate',             component:    ActivateComponent},
  {path: 'recover-password',     component:    RecoverPasswordComponent},
  {path: 'download',             component:    DownloadComponent},
  {path: '',redirectTo: 'home',pathMatch:'full'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
