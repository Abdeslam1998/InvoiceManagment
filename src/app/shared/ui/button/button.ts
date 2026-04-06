import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [],
  templateUrl: './button.html',
  styleUrl: './button.css',
})
export class AppButton {
  @Input() variant: 'primary' | 'secondary' | 'ghost' | 'error' | 'icon' = 'primary';
  @Input() icon: string = '';
  @Input() disabled: boolean = false;
  @Input() type: string = 'button';
  @Input() extraClasses: string = '';
  
  @Output() onClick = new EventEmitter<Event>();
}
