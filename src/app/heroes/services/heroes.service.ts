import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Hero } from '../interfaces/hero.interface';
import { environment } from '../../../environments/environment';

@Injectable({providedIn: 'root'})
export class HeroesService {

  private baseUrl: string = environment.baseUrl;
  
  constructor(private http: HttpClient) { }
  
  getHeroes(): Observable<Hero[]>{
    return this.http.get<Hero[]>(`${this.baseUrl}/heroes`);
  }
}