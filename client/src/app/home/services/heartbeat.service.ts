import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class HeartbeatService {
  heartbeatApiDeployUrl = 'http://kernel-panic.learnathon.net/api2/Heartbeat/';
  heartbeatApiUrl = 'http://localhost:5001/Heartbeat/';

  constructor(private http: HttpClient) {}

  sendHeartbeat() {
    const headers = new HttpHeaders();

    headers.set('Cookie', document.cookie);

    return this.http.get(this.heartbeatApiUrl, {
      headers: headers,
      withCredentials: true,
    });
  }
}
