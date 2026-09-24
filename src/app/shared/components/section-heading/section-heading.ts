import { Component, input } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-section-heading',
  styleUrl: './section-heading.scss',
  templateUrl: './section-heading.html',
})
export class SectionHeading {
  eyebrow = input('');
  title = input('');
}
