﻿using Application.Common.Interface;
using Infrastructure.DbConfig;
using Infrastructure.Services;
using Infrastructure.Services.RMQHandlerService;
using Microsoft.Extensions.DependencyInjection;

namespace Infrastructure;

public static class ConfigureServices
{
    public static IServiceCollection AddInfrastructureServices(
        this IServiceCollection services
    )
    {
        services.DatabaseIndexConfig();
        services.AddTransient<IUser, UserService>();
        services.AddTransient<IToken, TokenService>();
        services.AddTransient<IAuth, AuthService>();
        services.AddTransient<IComment, CommentService>();
        services.AddTransient<IFollow, FollowService>();
        services.AddTransient<ITweet, TweetService>();
        services.AddTransient<IRetweet, RetweetService>();
        services.AddTransient<IBlockFilter, BlockFilterService>();
        services.AddTransient<IBlock, BlockService>();
        services.AddTransient<INotification, NotificationService>();
        services.AddSingleton<IRabbitmq, RabbitmqService>();
        services.AddScoped<ICloudinary, CloudinaryService>();
        services.AddHostedService<DbNotificationHandlerService>();
        services.AddHostedService<RtNotificationHandlerService>();
        return services;
    }
}