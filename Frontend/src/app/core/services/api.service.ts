import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  get<T>(endpoint: string, params?: any): Observable<T> {
    return this.http.get<T>(this.baseUrl + endpoint, {
      params: this.createParams(params)
    });
  }

  post<T>(endpoint: string, body: any, params?: any): Observable<T> {
    return this.http.post<T>(this.baseUrl + endpoint, body, {
      params: this.createParams(params)
    });
  }

  put<T>(endpoint: string, body: any): Observable<T> {
    return this.http.put<T>(this.baseUrl + endpoint, body);
  }

  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(this.baseUrl + endpoint);
  }

  private createParams(params: any): HttpParams {
    let httpParams = new HttpParams();

    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          httpParams = httpParams.append(key, params[key]);
        }
      });
    }

    return httpParams;
  }
}