import { HttpClient } from '@angular/common/http';
import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs';


@Injectable({
  //available anywhere in Angular application
  providedIn: 'root'
})
export class MainService {
  

  constructor(private http: HttpClient) { }


  getIncidents(): Observable<Incident[]> {
    return this.http.get<Incident[]>('https://firefeeds.ventura.org/api/incidents');
  }



}

export interface Incident {
    address: string;
    block: string;
    city: string;
    comment: string;
    incidentNumber: string;
    incidentType: string;
    latitude: string;
    longitude: string;
    responseDate: string;
    status: string;
    units: string;
  }
