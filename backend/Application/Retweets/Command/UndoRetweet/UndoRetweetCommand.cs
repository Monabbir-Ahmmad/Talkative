﻿using Application.Common.Interface;
using Application.Common.ViewModels;
using Domain.Entities;
using MediatR;
using MongoDB.Driver;

namespace Application.Retweets.Command.UndoRetweet;

public class UndoRetweetCommand : IRequest
{
    public string? OriginalTweetId { get; set; }
    public string? UserId { get; set; }
}

public class UndoRetweetCommandHandler : IRequestHandler<UndoRetweetCommand>
{
    private readonly IRetweet _retweetService;
    private readonly IBsonDocumentMapper<TweetVm> _tweetDocumentMapper;
    private readonly ITweet _tweetService;

    public UndoRetweetCommandHandler(
        IRetweet retweetService,
        ITweet tweetService,
        IBsonDocumentMapper<TweetVm> tweetDocumentMapper
    )
    {
        _retweetService = retweetService;
        _tweetDocumentMapper = tweetDocumentMapper;
        _tweetService = tweetService;
    }

    public async Task<Unit> Handle(
        UndoRetweetCommand request,
        CancellationToken cancellationToken
    )
    {
        var tweet = await _tweetService.GetTweetById(request.OriginalTweetId!);

        var originalTweetVm = _tweetDocumentMapper.map(tweet!);
        await UpdateOriginalTweet(originalTweetVm, request);

        await _retweetService.UndoRetweet(originalTweetVm.Id!, request.UserId!);

        return Unit.Value;
    }

    private async Task UpdateOriginalTweet(TweetVm originalTweet, UndoRetweetCommand request)
    {
        if (originalTweet == null)
            return;
        originalTweet.RetweetUsers!.Remove(request.UserId);
        await _tweetService.PartialUpdate(
            originalTweet.Id!,
            Builders<Tweet>.Update.Set(x => x.RetweetUsers, originalTweet.RetweetUsers!)
        );
    }
}