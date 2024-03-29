﻿using Application.Common.Interface;
using Application.Common.ViewModels;
using Domain.Entities;
using Infrastructure.DbConfig;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using MongoDB.Driver.Linq;

namespace Infrastructure.Services;

public class FollowService : IFollow
{
    private readonly IMongoCollection<Follower> _followerCollection;
    private readonly IMongoCollection<User> _userCollection;

    public FollowService(
    )
    {

        var mongoClient = new MongoClient(Environment.GetEnvironmentVariable("ConnectionString"));
        var mongoDatabase = mongoClient.GetDatabase(Environment.GetEnvironmentVariable("DatabaseName"));

        _followerCollection = mongoDatabase.GetCollection<Follower>(
            Environment.GetEnvironmentVariable("FollowerCollectionName")
        );

        _userCollection = mongoDatabase.GetCollection<User>(
            Environment.GetEnvironmentVariable("UserCollectionName")
        );

        var settings = MongoClientSettings.FromConnectionString(
            Environment.GetEnvironmentVariable("ConnectionString")
        );

        settings.LinqProvider = LinqProvider.V3;
    }

    public async Task AddNewFollower(Follower follower)
    {
        await _followerCollection.InsertOneAsync(follower);
    }

    public async Task DeleteFollower(string followerId, string followingId)
    {
        await _followerCollection.DeleteManyAsync(
            x => x.FollowingId == followingId && x.FollowerId == followerId
        );
    }

    public async Task<long> GetNumberOfFollowerOfSingleUser(string userId)
    {
        return await _followerCollection.CountDocumentsAsync(x => x.FollowingId == userId);
    }

    public async Task<long> GetNumberOfFollowingOfSingleUser(string userId)
    {
        return await _followerCollection.CountDocumentsAsync(x => x.FollowerId == userId);
    }

    public async Task<bool> CheckIfFollowerExists(string followerId, string followingId)
    {
        var follower = await _followerCollection
            .Find(x => x.FollowerId == followerId && x.FollowingId == followingId)
            .FirstOrDefaultAsync();
        return follower != null;
    }

    public async Task<Dictionary<string, bool>> GetFollowingOfCurrentUser(string userId)
    {
        var followingHashmap = new Dictionary<string, bool>();
        var list = await _followerCollection
            .Aggregate()
            .Match(x => x.FollowerId == userId)
            .ToListAsync();

        var followingIds = new List<string?>();
        foreach (var following in list) followingHashmap.Add(following.FollowingId!, true);

        return followingHashmap;
    }

    public async Task<IList<UserVm>> GetFollowerOfSingleUser(string userId, int skip, int limit)
    {
        var followerList = await _followerCollection
            .Aggregate()
            .Match(x => x.FollowingId == userId)
            .Limit(limit)
            .Skip(skip)
            .Lookup("users", "followerId", "_id", "user")
            .Unwind("user")
            .ReplaceRoot<User>("$user")
            .SortByDescending(x => x.Username)
            .Project(user => new UserVm
            { UserId = user.Id, Username = user.Username, ProfilePicture = user.ProfilePicture })
            .ToListAsync();

        return followerList;
    }

    public async Task<IList<UserVm>> GetFollowingsOfSingleUser(
        string userId,
        int skip,
        int limit
    )
    {
        var followingList = await _followerCollection
            .Aggregate()
            .Match(x => x.FollowerId == userId)
            .Limit(limit)
            .Skip(skip)
            .Lookup("users", "followingId", "_id", "user")
            .Unwind("user")
            .ReplaceRoot<User>("$user")
            .SortByDescending(x => x.Username)
            .Project(user => new UserVm
            { UserId = user.Id, Username = user.Username, ProfilePicture = user.ProfilePicture })
            .ToListAsync();

        return followingList;
    }
}