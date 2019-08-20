import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../../helpers/auth.guard';
import { AdminGuard } from '../../helpers/admin.guard';
import { BrandGuard } from '../../helpers/brand.guard';
import { HomeComponent } from './home.component';
import { InfoComponent } from './info/info.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { IndustryComponent } from './industry/industry.component';
import { ProfileComponent } from './profile/profile.component';
import { OpinionComponent } from './opinion/opinion.component';
import { ChartComponent } from './chart/chart.component';
import { BrandComponent } from './brand/brand.component';
import { FollowerComponent } from './follower/follower.component';

const routes: Routes = [
    {
        path: '',
        component: HomeComponent,
        children: [
            { path: '', redirectTo: 'info', pathMatch: 'prefix' },
            { path: 'info', component: InfoComponent, canActivate: [AuthGuard]},
            { path: 'dashboard', component: DashboardComponent, canActivate: [AdminGuard]},
            { path: 'service-industries', component: IndustryComponent, canActivate: [AdminGuard]},
            { path: 'users', component: BrandComponent, canActivate: [AdminGuard]},
            { path: 'profile', component: ProfileComponent, canActivate: [BrandGuard] },
            { path: 'online-reputation', component: OpinionComponent, canActivate: [BrandGuard] },
            { path: 'online-reputation/charts', component: ChartComponent, canActivate: [BrandGuard] },
            { path: 'influence-meter', component: FollowerComponent, canActivate: [BrandGuard] },
            { path: '**', redirectTo: '' }
        ]
    }
];


@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class HomeRoutingModule {}
