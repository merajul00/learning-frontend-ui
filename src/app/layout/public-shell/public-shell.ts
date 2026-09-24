import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from '../header/header';
import { Footer } from '../footer/footer';

@Component({
  imports: [RouterOutlet, Header, Footer],
  selector: 'app-public-shell',
  styleUrl: './public-shell.scss',
  templateUrl: './public-shell.html',
})
export class PublicShell {}
