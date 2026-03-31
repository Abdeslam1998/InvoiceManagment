import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from '../shared/header/header';
import { BottomNav } from '../shared/bottom-nav/bottom-nav';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, Header, BottomNav],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout {}
