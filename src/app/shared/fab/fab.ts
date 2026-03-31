import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-fab',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './fab.html',
  styleUrl: './fab.css',
})
export class Fab {
  @Input() link: string = '';
}
