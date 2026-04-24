import { Component, Injectable } from '@angular/core';
import { RouterLink } from "@angular/router";
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-error.component',
  imports: [RouterLink],
  templateUrl: './error.component.html',
  styleUrl: './error.component.css',
})
@Injectable({
  providedIn: 'root'
})

export class ErrorComponent {
  constructor(
    public theme: ThemeService
  ) {}
  ngOnInit() {
    this.theme.init();
  }
}
