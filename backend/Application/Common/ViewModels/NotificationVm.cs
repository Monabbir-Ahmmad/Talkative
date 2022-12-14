namespace Application.Common.ViewModels;

public class NotificationVm
{
    public string? NotificationId { get; set; }
    public string? EventType { get; set; }
    public string? NotificationReceiverId { get; set; }
    public string? EventTriggererId { get; set; }
    public string? EventTriggererProfilePicture { get; set; }
    public string? EventTriggererUsername { get; set; }
    public string? TweetId { get; set; }
    public string? CommentId { get; set; }
    public DateTime DateTime { get; set; }
    public bool IsRead { get; set; }
}