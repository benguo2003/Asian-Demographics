import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders} from  '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  constructor(private http: HttpClient) { }

  get(url: string){
    let options = { withCredentials: true };
    return this.http.get(url, options);
  }

  post(url: string, formdata: FormData){
    let options = { withCredentials: true };
    return this.http.post<any>(url, formdata, options);
  }
}
