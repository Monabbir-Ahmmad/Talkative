using System.Net;

namespace Application.Common.Exceptions;

public class ApiException : Exception
{
    public ApiException(int statusCode, string message) : base(message)
    {
        StatusCode = statusCode;
    }

    public ApiException(HttpStatusCode statusCode, string message) : base(message)
    {
        StatusCode = (int)statusCode;
    }

    public int StatusCode { get; }
}