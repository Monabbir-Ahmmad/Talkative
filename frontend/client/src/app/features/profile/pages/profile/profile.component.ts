import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { BlockService } from 'src/app/core/services/block.service';
import { FollowService } from 'src/app/core/services/follow.service';
import { TweetService } from 'src/app/core/services/tweet.service';
import { UserService } from 'src/app/core/services/user.service';
import { UserStore } from 'src/app/core/store/user.store';
import { PaginationModel } from '../../../../core/models/pagination.model';
import { TweetModel } from '../../../../core/models/tweet.model';
import {
  UserAnalyticsModel,
  UserModel,
  UserUpdateReqModel,
} from '../../../../core/models/user.model';
import { TweetStore } from '../../../../core/store/tweet.store';

import { PasswordUpdateDialogComponent } from '../../ui/password-update-dialog/password-update-dialog.component';
import { ProfileImageUploaderDialogComponent } from '../../ui/profile-image-uploader-dialog/profile-image-uploader-dialog.component';
import { ProfileUpdateDialogComponent } from '../../ui/profile-update-dialog/profile-update-dialog.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  tweetPagination: PaginationModel = {
    pageNumber: 1,
  };

  followingPagination: PaginationModel = {
    pageNumber: 1,
  };

  followersPagination: PaginationModel = {
    pageNumber: 1,
  };

  blockListPagination: PaginationModel = {
    pageNumber: 1,
  };

  userAuth?: UserModel;
  profileId: string = '';
  profile?: UserModel;
  followers: UserModel[] = [];
  followings: UserModel[] = [];
  blockList: UserModel[] = [];
  tweets: TweetModel[] = [];
  userAnalytics?: UserAnalyticsModel;

  constructor(
    public dialog: MatDialog,
    private userStore: UserStore,
    private userService: UserService,
    private blockService: BlockService,
    private tweetService: TweetService,
    private followService: FollowService,
    private tweetStore: TweetStore,
    private activeRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.userStore.userAuth.subscribe((res) => {
      this.userAuth = res;
    });

    this.tweetStore.tweetList.subscribe((res) => {
      this.tweets = res;
    });

    this.activeRoute.params.subscribe((params) => {
      this.profileId = params['userId'];
      this.refreshData();
    });
  }

  refreshData() {
    if (this.profileId) {
      this.tweetPagination.pageNumber = 1;
      this.followingPagination.pageNumber = 1;
      this.followersPagination.pageNumber = 1;
      this.blockListPagination.pageNumber = 1;

      this.getProfile(this.profileId);
      this.getAnalytics(this.profileId);
      this.getFollowers(this.profileId);
      this.getFollowings(this.profileId);
      this.getBlockList(this.profileId);
      this.getUserTweets(this.profileId);
    }
  }

  onScroll() {
    this.tweetPagination.pageNumber++;
    this.getUserTweets(this.profileId);
  }

  onFollowingScroll() {
    this.followingPagination.pageNumber++;
    this.getFollowings(this.profileId);
  }

  onFollowersScroll() {
    this.followersPagination.pageNumber++;
    this.getFollowers(this.profileId);
  }

  onBlockListScroll() {
    this.blockListPagination.pageNumber++;
    this.getBlockList(this.profileId);
  }

  getProfile(userId: string) {
    this.userService.getUser(userId).subscribe((res) => {
      this.profile = res;
    });
  }

  getAnalytics(userId: string) {
    this.userService.getUserAnalytics(userId).subscribe((res) => {
      this.userAnalytics = res;
    });
  }

  getUserTweets(userId: string) {
    this.tweetService.getUserTweets(userId, this.tweetPagination).subscribe();
  }

  getFollowers(userId: string) {
    this.followService
      .getFollowers(userId, this.followersPagination)
      .subscribe((res) => {
        if (this.followersPagination.pageNumber === 1) {
          this.followers = res;
        } else {
          this.followers = this.followers.concat(res);
        }
      });
  }

  getFollowings(userId: string) {
    this.followService
      .getFollowings(userId, this.followingPagination)
      .subscribe((res) => {
        if (this.followingPagination.pageNumber === 1) {
          this.followings = res;
        } else {
          this.followings = this.followings.concat(res);
        }
      });
  }

  getBlockList(userId: string) {
    this.blockService
      .getBlockList(userId, this.blockListPagination)
      .subscribe((res) => {
        if (this.blockListPagination.pageNumber === 1) {
          this.blockList = res;
        } else {
          this.blockList = this.blockList.concat(res);
        }
      });
  }

  onProfileEdit() {
    const dialogRef = this.dialog.open(ProfileUpdateDialogComponent, {
      width: '500px',
      data: this.profile,
    });

    dialogRef.afterClosed().subscribe((result: UserUpdateReqModel) => {
      if (result) {
        this.userService.updateProfile(result).subscribe((res) => {
          this.getProfile(this.profileId);
        });
      }
    });
  }

  onPasswordEdit() {
    const dialogRef = this.dialog.open(PasswordUpdateDialogComponent, {
      width: '500px',
      data: this.profile,
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.userService
          .updatePassword(result.oldPassword, result.newPassword)
          .subscribe();
      }
    });
  }

  onProfileImageEdit() {
    const dialogRef = this.dialog.open(ProfileImageUploaderDialogComponent, {
      width: '500px',
    });

    dialogRef.afterClosed().subscribe((result: File) => {
      if (result) {
        this.userService.updateProfileImage(result).subscribe((res) => {
          this.getProfile(this.profileId);
        });
      }
    });
  }

  onCoverImageEdit() {
    const dialogRef = this.dialog.open(ProfileImageUploaderDialogComponent, {
      width: '500px',
      data: { isCover: true },
    });

    dialogRef.afterClosed().subscribe((result: File) => {
      if (result) {
        this.userService.updateCoverImage(result).subscribe((res) => {
          this.getProfile(this.profileId);
        });
      }
    });
  }

  onFollow(user?: UserModel) {
    if (!user) {
      this.followService.follow(this.profile?.userId!).subscribe((res) => {
        this.followers.unshift(this.userAuth!);
        this.userAnalytics!.followerCount++;
      });
    } else if (user && this.profile?.userId === this.userAuth?.userId) {
      this.followings.unshift(user);
      this.userAnalytics!.followingCount++;
    }
  }

  onUnfollow(user?: UserModel) {
    if (!user) {
      this.followService.unfollow(this.profile?.userId!).subscribe((res) => {
        this.followers = this.followers.filter(
          (x) => x.userId !== this.userAuth?.userId
        );
        this.userAnalytics!.followerCount--;
      });
    } else if (user && this.profile?.userId === this.userAuth?.userId) {
      this.followings = this.followings.filter((x) => x.userId !== user.userId);
      this.userAnalytics!.followingCount--;
    }
  }

  onBlock(user?: UserModel) {
    if (!user) {
      this.blockService.blockUser(this.profile?.userId!).subscribe((res) => {
        this.followers = this.followers.filter(
          (x) => x.userId !== this.userAuth?.userId
        );

        this.userAnalytics!.followerCount--;
      });
    } else if (user && this.profile?.userId === this.userAuth?.userId) {
      this.blockList.unshift(user);
      this.followings = this.followings.filter((x) => x.userId !== user.userId);
      this.followers = this.followers.filter((x) => x.userId !== user.userId);
      this.userAnalytics!.followingCount--;
      this.userAnalytics!.followerCount--;
    }
  }

  onUnblock(user?: UserModel) {
    if (!user) {
      this.blockService.unblockUser(this.profile?.userId!).subscribe();
    } else if (user && this.profile?.userId === this.userAuth?.userId) {
      this.blockList = this.blockList.filter((x) => x.userId !== user.userId);
    }
  }
}
