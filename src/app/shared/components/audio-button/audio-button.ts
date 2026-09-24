import { Component, input, signal } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-audio-button',
  styleUrl: './audio-button.scss',
  templateUrl: './audio-button.html',
})
export class AudioButton {
  text = input.required<string>();
  lang = input('ja-JP');
  label = input('Play pronunciation');

  isSupported = 'speechSynthesis' in window;
  playing = signal(false);

  play(): void {
    if (!this.isSupported || !this.text()) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(this.text());
    utterance.lang = this.lang();
    utterance.onstart = () => this.playing.set(true);
    utterance.onend = () => this.playing.set(false);
    utterance.onerror = () => this.playing.set(false);
    window.speechSynthesis.speak(utterance);
  }
}
