// import { HttpClient } from '@angular/common/http';
// import { Injectable } from '@angular/core';
// import { environment } from 'src/environments/environment';

// @Injectable({
//   providedIn: 'root'
// })
// export class AdminAuthService {

//   private api = environment.url + '/api/admin/auth';

//   constructor(private http: HttpClient) {}

//   login(correo: string, password: string) {
//     return this.http.post<any>(`${this.api}/login`, {
//       correo,
//       password
//     });
//   }

//   saveToken(token: string) {
//     localStorage.setItem('admin_token', token);
//   }

//   getToken() {
//     return localStorage.getItem('admin_token');
//   }

//   logout() {
//     localStorage.removeItem('admin_token');
//   }

//   isLoggedIn(): boolean {
//     return !!this.getToken();
//   }
// }