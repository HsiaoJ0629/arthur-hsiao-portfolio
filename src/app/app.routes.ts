import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { DemoComponent } from './components/demo/demo.component';

// The portfolio is now a single page; About and Contact live as sections on Home.
export const routes: Routes = [
  { path: 'home', component: HomeComponent, title: 'Arthur Hsiao — Full Stack Developer' },
  { path: 'demo', component: DemoComponent, title: 'Product management demo — Arthur Hsiao' },
  { path: 'about', redirectTo: '/home' },
  { path: 'contact', redirectTo: '/home' },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', redirectTo: '/home' }
];
