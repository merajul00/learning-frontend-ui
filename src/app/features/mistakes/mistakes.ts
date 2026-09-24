import { Component, OnInit, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MistakeItem } from '../../core/models/mistake.model';
import { MistakesService } from '../../core/services/mistakes.service';
import { AudioButton } from '../../shared/components/audio-button/audio-button';

interface CategoryGroup {
  levelId: string;
  levelNumber: number;
  titleEn: string;
  titleBn: string;
  mistakes: MistakeItem[];
}

interface WeakTopic {
  titleEn: string;
  totalMistakes: number;
}

@Component({
  imports: [RouterLink, AudioButton],
  selector: 'app-mistakes',
  styleUrl: './mistakes.scss',
  templateUrl: './mistakes.html',
})
export class Mistakes implements OnInit {
  mistakes = signal<MistakeItem[]>([]);
  loading = signal(true);

  totalMistakes = computed(() => this.mistakes().length);

  mostConfused = computed(() => this.mistakes().slice(0, 5));

  weakTopics = computed<WeakTopic[]>(() => {
    const totals = new Map<string, number>();
    for (const mistake of this.mistakes()) {
      totals.set(mistake.levelTitleEn, (totals.get(mistake.levelTitleEn) ?? 0) + mistake.mistakeCount);
    }
    return [...totals.entries()]
      .map(([titleEn, totalMistakes]) => ({ titleEn, totalMistakes }))
      .sort((a, b) => b.totalMistakes - a.totalMistakes)
      .slice(0, 2);
  });

  categories = computed<CategoryGroup[]>(() => {
    const groups = new Map<string, CategoryGroup>();
    for (const mistake of this.mistakes()) {
      if (!groups.has(mistake.levelId)) {
        groups.set(mistake.levelId, {
          levelId: mistake.levelId,
          levelNumber: mistake.levelNumber,
          titleEn: mistake.levelTitleEn,
          titleBn: mistake.levelTitleBn,
          mistakes: [],
        });
      }
      groups.get(mistake.levelId)!.mistakes.push(mistake);
    }
    return [...groups.values()].sort((a, b) => a.levelNumber - b.levelNumber);
  });

  constructor(private readonly mistakesService: MistakesService) {}

  async ngOnInit(): Promise<void> {
    try {
      this.mistakes.set(await this.mistakesService.getMyMistakes());
    } finally {
      this.loading.set(false);
    }
  }
}
