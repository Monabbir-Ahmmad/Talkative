import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { RetweetService } from 'src/app/home/services/retweet.service';
import { TweetStore } from 'src/app/shared/store/tweet.store';
import { TweetModel, TweetWriteModel } from '../../../models/tweet.model';
import { UserModel } from '../../../models/user.model';
import { TweetService } from '../../../services/tweet.service';
import { UserService } from '../../../services/user.service';
import { PostMakerDialogComponent } from '../post-maker-dialog/post-maker-dialog.component';

@Component({
  selector: 'app-tweet-item',
  templateUrl: './tweet-item.component.html',
  styleUrls: ['./tweet-item.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class TweetItemComponent implements OnInit, OnChanges {
  @Input() data?: TweetModel;
  @Input() detailedView: boolean = false;

  @Output() onEditClick = new EventEmitter<TweetModel>();
  @Output() onDeleteClick = new EventEmitter<TweetModel>();
  @Output() onLikeClick = new EventEmitter<TweetModel>();
  @Output() onCommentClick = new EventEmitter<TweetModel>();
  @Output() onRetweetClick = new EventEmitter<TweetModel>();
  @Output() onQuoteRetweetClick = new EventEmitter<TweetModel>();
  @Output() onRetweetUndoClick = new EventEmitter<TweetModel>();

  tweet?: TweetModel;
  userAuth?: UserModel;

  alreadyLiked: boolean = false;
  alreadyRetweeted: boolean = false;

  constructor(
    private userService: UserService,
    private tweetService: TweetService,
    private retweetService: RetweetService,
    private storeService: TweetStore,
    private router: Router,
    public dialog: MatDialog
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (this.data?.isRetweet) this.tweet = this.data?.originalTweet;
    else this.tweet = this.data;
  }

  ngOnInit(): void {
    this.userService.userAuth.subscribe((res) => {
      this.userAuth = res;
    });

    if (this.data?.isRetweet) this.tweet = this.data?.originalTweet;
    else this.tweet = this.data;

    this.alreadyLiked = !!this.tweet?.likes?.some(
      (likedBy) => likedBy === this.userAuth?.userId
    );

    this.alreadyRetweeted = !!this.tweet?.retweetUsers?.some(
      (retweetedBy) => retweetedBy === this.userAuth?.userId
    );
  }

  onTweetClick() {
    if (!this.detailedView)
      this.router.navigate([`/home/tweet/${this.tweet?.id}`]);
  }

  onTagClick(hashtag: string) {
    this.router.navigate(['/home/search'], {
      queryParams: { type: 'hashtag', value: hashtag },
    });
  }

  onLike() {
    if (this.alreadyLiked && this.tweet)
      this.tweet.likes = this.tweet.likes.filter(
        (likedBy) => likedBy !== this.userAuth?.userId
      );
    else this.tweet?.likes?.push(this.userAuth?.userId!);

    this.alreadyLiked = !this.alreadyLiked;

    this.tweetService.likeTweet(this.tweet?.id!, this.alreadyLiked).subscribe();
  }

  onComment() {
    this.onTweetClick();
    this.onCommentClick.emit(this.tweet);
  }

  onRetweet() {
    this.tweet?.retweetUsers?.push(this.userAuth?.userId!);
    this.alreadyRetweeted = true;

    this.retweetService
      .createRetweet({
        isQuoteRetweet: false,
        originalTweetId: this.tweet?.id!,
      })
      .subscribe();

    this.onRetweetClick.emit(this.tweet);
  }

  onQuote() {
    const dialogRef = this.dialog.open(PostMakerDialogComponent, {
      width: '500px',
      data: {
        isQuoteRetweet: true,
        originalTweetId: this.tweet?.id,
      },
    });

    dialogRef.afterClosed().subscribe((result: TweetWriteModel) => {
      if (result) {
        this.retweetService
          .createRetweet({
            isQuoteRetweet: true,
            originalTweetId: result.originalTweetId!,
            text: result.text,
            hashtags: result.hashtags!,
          })
          .subscribe((res) => this.tweet?.quoteRetweets?.push(res.id));
      }
    });

    this.onQuoteRetweetClick.emit(this.tweet);
  }

  onRetweetUndo() {
    this.tweet!.retweetUsers = this.tweet?.retweetUsers?.filter(
      (retweetBy) => retweetBy !== this.userAuth?.userId
    )!;
    this.alreadyRetweeted = false;

    this.retweetService.undoRetweet(this.tweet?.id!).subscribe(() => {
      if (!this.detailedView) {
        if (this.data?.isRetweet) {
          this.storeService.removeTweetFromTweetList(this.data?.id!);
        } else {
          this.storeService.tweetList.getValue().forEach((tweet) => {
            if (
              tweet.isRetweet &&
              tweet.originalTweetId === this.tweet?.id &&
              tweet.user.userId === this.userAuth?.userId
            ) {
              this.storeService.removeTweetFromTweetList(tweet.id);
            }
          });
        }
      }
    });

    this.onRetweetUndoClick.emit(this.data);
  }

  onEdit() {
    const dialogRef = this.dialog.open(PostMakerDialogComponent, {
      width: '500px',
      data: {
        isEdit: true,
        id: this.tweet?.id,
        text: this.tweet?.text,
        isQuoteRetweet: this.tweet?.isQuoteRetweet,
        originalTweetId: this.tweet?.originalTweetId,
      },
    });

    dialogRef.afterClosed().subscribe((result: TweetWriteModel) => {
      if (result) {
        this.tweetService
          .updateTweet({
            id: result.id!,
            text: result.text,
            hashtags: result.hashtags,
          })
          .subscribe((res) => {
            this.tweet = res;
          });
      }
    });

    this.onEditClick.emit(this.tweet);
  }

  onDelete() {
    if (this.tweet?.id) {
      if (this.tweet?.isQuoteRetweet)
        this.retweetService
          .deleteQuoteRetweet(this.tweet.id, this.tweet?.originalTweetId!)
          .subscribe();
      else this.tweetService.deleteTweet(this.tweet?.id).subscribe();
    }

    this.onDeleteClick.emit(this.tweet);
  }
}
