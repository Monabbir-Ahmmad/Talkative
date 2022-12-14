import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { finalize, Observable } from 'rxjs';
import { LoaderService } from '../../shared/services/loader.service';

@Injectable()
export class HttpLoadingInterceptor implements HttpInterceptor {
  noLoadingUrls = ['like', 'unlike'];
  constructor(private loaderService: LoaderService) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (
      this.noLoadingUrls.some((url) => request.url.toLowerCase().includes(url))
    ) {
      return next.handle(request);
    }

    this.loaderService.setLoading(true, request.url);

    return next.handle(request).pipe(
      finalize(() => {
        this.loaderService.setLoading(false, request.url);
      })
    );
  }
}
