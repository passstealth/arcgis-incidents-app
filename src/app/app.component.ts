import { Component, OnInit} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule, NgFor } from '@angular/common';

import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import Graphic from "@arcgis/core/Graphic";
import Point from "@arcgis/core/geometry/Point";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import SimpleMarkerSymbol from "@arcgis/core/symbols/SimpleMarkerSymbol";
import PictureMarkerSymbol from "@arcgis/core/symbols/PictureMarkerSymbol";
import TextSymbol from "@arcgis/core/symbols/TextSymbol";
import { Incident, MainService } from './services/main.service';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgFor],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent  implements OnInit {
  title = 'Active Incidents';
  Incidents: Incident[] = [];
  subscription: Subscription  | null = null;
  lastExecuted: Date | null = null;
  primaryLong = -118.9684
  priamryLat = 34.3922
  map = new Map({
    basemap: 'hybrid'
  });

  // Initialize the MapView
  
   view = new MapView();


  constructor(private main: MainService ) {
    
  }

  ngOnInit(): void {
    this.makeAPICall();
    this.view = new MapView({
      container: 'mapViewDiv',
      map: this.map,
      center: [this.primaryLong, this.priamryLat], // Longitude, Latitude
      zoom: 10
    });
    this.subscription = interval(15000).subscribe(() => {
      this.executeTask();
    });
   

  }

  resetView(): void {
    console.log("reset clicked")
    if (this.view) {
 
      this.view.goTo({
        center: [this.primaryLong, this.priamryLat],
        zoom: 10
      });
    }
  }

  makeAPICall() {
    this.main.getIncidents().subscribe({
      complete: () => {
        console.log('done')
        this.loadMap();
      },
      error: (err) => {
        console.log(err);
      },
      next: (data) => {
        this.Incidents = data;
      //  console.log(data);
      }

    });
  }

  executeTask(): void {
    console.log('Task executed at', new Date());
    this.lastExecuted = new Date();
    // Your code to execute every minute goes here
    this.makeAPICall();
  }
  loadMap() {
    
    this.removeAnnotations();

    
    // Add pins to the map
 for(let location in this.Incidents) {
      
      const point = new Point({
        longitude: Number(this.Incidents[location].longitude),
        latitude: Number(this.Incidents[location].latitude)
      });

      // const symbol = new SimpleMarkerSymbol({
      //   color: "red",
      //   size: "12px",
      //   outline: {
      //     color: "white",
      //     width: 1
      //   }
      // });
      const symbol = new PictureMarkerSymbol({

        url: "assets/images/yellow.png", // Replace with your image URL
        width: "20px",
        height: "30px"
      });

      const textSymbol = new TextSymbol({
        text: this.Incidents[location].incidentType,
        color: "black",
        haloColor: "white",
        haloSize: "1px",
        xoffset: 0,
        yoffset: 20, // Adjust offset to position the label
        font: {
          size: 12,
          family: "sans-serif"
        }
      });

      // const graphic = new Graphic({
      //   geometry: point,
      //   symbol: symbol
      // });
      const pictureGraphic = new Graphic({
        geometry: point,
        symbol: symbol
      });

      // Graphic for the label (callout)
      const textGraphic = new Graphic({
        geometry: point,
        symbol: textSymbol
      });

      this.view.graphics.addMany([pictureGraphic, textGraphic]);
    }
  }
  zoomToArea(longitude: string, latitude: string, zoomLevel: number): void {
    console.log("zoom clicked")
    if (this.view) {
      console.log("zoom clicked 1")
      this.view.goTo({
        center: [Number(longitude), Number(latitude)],
        zoom: zoomLevel
      });
    }
  }
  removeAnnotations(): void {
    // Remove all graphics from the layer
    this.view.graphics.removeAll();
  }
  ngOnDestroy(): void {
    // Unsubscribe to avoid memory leaks
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
