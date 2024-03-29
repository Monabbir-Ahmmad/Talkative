﻿using System.Text.Json.Serialization;
using Application.Common.Interface;
using Application.Common.ViewModels;
using Domain.Entities;
using MediatR;
using MongoDB.Bson;
using MongoDB.Driver;
using INotification = Application.Common.Interface.INotification;

namespace Application.Comments.Commands.CreateComment;

public class CreateCommentCommand : IRequest<CreateCommentCommandVm>
{
    [JsonIgnore] public string? UserId { get; set; }

    public string? TweetId { get; set; }
    public string? Text { get; set; }
}

public class CreateCommentCommandHandler
    : IRequestHandler<CreateCommentCommand, CreateCommentCommandVm>
{
    private readonly IComment _commentService;
    private readonly IBsonDocumentMapper<TweetVm> _mapper;
    private readonly INotification _notificationService;
    private readonly ITweet _tweetService;

    public CreateCommentCommandHandler(
        IComment commentService,
        ITweet tweetService,
        IBsonDocumentMapper<TweetVm> tweetMapper,
        INotification notificationService
    )
    {
        _commentService = commentService;
        _tweetService = tweetService;
        _mapper = tweetMapper;
        _notificationService = notificationService;
    }

    public async Task<CreateCommentCommandVm> Handle(
        CreateCommentCommand request,
        CancellationToken cancellationToken
    )
    {
        var id = ObjectId.GenerateNewId().ToString();

        var comment = new Comment
        {
            UserId = request.UserId,
            CreatedAt = DateTime.Now,
            TweetId = request.TweetId,
            Likes = new List<string>(),
            Id = id,
            Text = request.Text
        };

        await _commentService.CreateComment(comment);

        var tweet = await _tweetService.GetTweetById(request.TweetId!);
        var tweetVm = _mapper.map(tweet!);

        tweetVm.Comments!.Add(id);

        await _tweetService.PartialUpdate(
            request.TweetId!,
            Builders<Tweet>.Update.Set(p => p.Comments, new List<string>(tweetVm.Comments!))
        );

        await _notificationService.TriggerCommentNotification(comment, tweetVm);
        return new CreateCommentCommandVm { Id = id };
    }
}