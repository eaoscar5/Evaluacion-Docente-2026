import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { Routes, RouterModule } from "@angular/router";
import { NgApexchartsModule } from "ng-apexcharts";
import { DashboardComponent } from "./dashboard.component";
import { FeedsComponent } from "./dashboard-components/feeds/feeds.component";
import { TopCardsComponent } from "./dashboard-components/top-cards/top-cards.component";

const routes: Routes = [
  {
    path: "",
    data: {
      title: "Dashboard",
      urls: [{ title: "Dashboard", url: "/dashboard" }, { title: "Dashboard" }],
    },
    component: DashboardComponent,
  },
];

@NgModule({
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    RouterModule.forChild(routes),
    NgApexchartsModule,
  ],
  declarations: [
    DashboardComponent,
    FeedsComponent,
    TopCardsComponent
  ],
})
export class DashboardModule {}
