import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

@Component({
  imports: [],
  selector: 'app-coming-soon',
  styleUrl: './coming-soon.scss',
  templateUrl: './coming-soon.html',
})
export class ComingSoon {
  private readonly route = inject(ActivatedRoute);

  data = toSignal(
    this.route.data.pipe(
      map((data) => ({
        title: (data['title'] as string) ?? 'Coming soon',
        description: (data['description'] as string) ?? '',
      })),
    ),
    { initialValue: { title: 'Coming soon', description: '' } },
  );
}
