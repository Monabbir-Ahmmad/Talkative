﻿using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using server.Dto.RequestDto.TweetRequestDto;
using server.Interface;

namespace server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TweetController : ControllerBase
    {
        private readonly ITweetService _tweetService;
        public TweetController(ITweetService tweetService)
        {
            _tweetService = tweetService;
        }

        [HttpPost]
        public async Task<ActionResult> PublishTweet(TweetRequestDto tweetRequestDto)
        {
            var context = HttpContext;
            var userId = context.Items["User"]!.ToString();
            await _tweetService.PublishTweet(tweetRequestDto, userId!);
            return NoContent();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult> GetTweetById(string id)
        {
            return Ok(await _tweetService.GetTweetById(id));
        }

        [HttpPut]
        public async Task<ActionResult> UpdateTweet(TweetRequestDto tweetRequestDto)
        {
            await _tweetService.UpdateTweet(tweetRequestDto);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteTweet(string id)
        {
            await _tweetService.DeleteTweet(id);
            return NoContent();
        }
    }
}
