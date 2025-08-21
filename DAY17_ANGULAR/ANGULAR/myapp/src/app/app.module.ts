import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { FileOpsComponent } from './component/file-ops/file-ops.component';
import { HttpClientModule } from '@angular/common/http';
import { LoginComponent } from './component/login/login.component';
import { RegisterComponent } from './component/register/register.component';
import { UsersComponent } from './component/users/users.component';
import { Menu } from './component/menu/menu';
import { Lifecycle } from './component/lifecycle/lifecycle';
import { Style2 } from './component/style2/style2';
import { MypipePipe } from './pipes/mypipe-pipe';

@NgModule({
  declarations: [
    AppComponent,
    FileOpsComponent,
    LoginComponent,
    RegisterComponent,
    UsersComponent,
    Menu,
    Lifecycle,
    Style2,
    MypipePipe
  ],
  imports: [
    BrowserModule,
    FormsModule,
        
    HttpClientModule

  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }