import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { HighlightTag } from 'angular-text-input-highlight';

@Component({
  selector: 'app-hashtag-input',
  templateUrl: './hashtag-input.component.html',
  styleUrls: ['./hashtag-input.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class HashtagInputComponent implements OnInit, AfterViewInit {
  @ViewChild('textarea') textArea?: ElementRef;

  @Input() classExpression: string = 'w-full p-4 text-lg';
  @Input() rows: Number = 2;
  @Input() placeholder: string = 'Type here...';
  @Input() text: string = '';
  @Output() onChange = new EventEmitter();

  tags: HighlightTag[] = [];

  hashtags = new Set<string>();
  matchHashtag = /(#\w+) ?/gm;

  constructor() {}

  ngAfterViewInit() {
    if (!!this.textArea) {
      this.textArea.nativeElement.focus();
    }
  }

  ngOnInit(): void {
    this.addTags();
  }

  addTags() {
    this.tags = [];
    this.hashtags.clear();
    let hashtag;

    while ((hashtag = this.matchHashtag.exec(this.text))) {
      this.tags.push({
        indices: {
          start: hashtag.index,
          end: hashtag.index + hashtag[1].length,
        },
        data: hashtag[1],
      });

      this.hashtags.add(hashtag[1]);
    }

    this.onTextChange();
  }

  onTextChange() {
    this.onChange.emit({
      text: this.text,
      hashtags: Array.from(this.hashtags),
    });
  }
}
