import { Component, OnInit } from '@angular/core';
import { CityService } from './_services/city.service';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  private roles!: string[];
  isLoggedIn = false;
  registeredUser!: any;
  patient!: any;
  private readonly unsubscribe$ = new Subject();
  title: string = 'app';

  constructor( private cityService: CityService, private router: Router) { 
  }
 
  ngOnInit() {
  }

}
