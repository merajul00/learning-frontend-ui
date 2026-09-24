import { Component, input } from '@angular/core';
import { LearningItem } from '../../../core/models/learning-item.model';
import { AudioButton } from '../audio-button/audio-button';
import { StrokeOrderViewer } from '../stroke-order-viewer/stroke-order-viewer';

@Component({
  imports: [AudioButton, StrokeOrderViewer],
  selector: 'app-japanese-character-card',
  styleUrl: './japanese-character-card.scss',
  templateUrl: './japanese-character-card.html',
})
export class JapaneseCharacterCard {
  item = input.required<LearningItem>();

  get showStrokeOrder(): boolean {
    return this.item().type === 'character';
  }
}
