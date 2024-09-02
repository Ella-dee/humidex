import { Component, OnInit, Input } from '@angular/core';
import { CityService } from '../_services/city.service';
import { City } from '../core/models/city.model';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  errorMessage = ''; 
  zipCode!: string;
  queryParam!: string;
  private readonly unsubscribe$ = new Subject();
  city!: City;   
  inputUserZipCode!: any;
  isSuccessful!: boolean;
  dataGouvCity!: any;
  humidex!:any;
  data!:any;
  apparentTemp!: any;
  humClass!:string;
  isVisible!: boolean;
  showLegend!: boolean;
  infoRead!: boolean;
  dropdownText!: string;

  private readonly unsub$ = new Subject();


  constructor(private cityService: CityService, private http: HttpClient) { }

  ngOnInit() {
    this.isSuccessful = false; 
    this.isVisible = true; 
    this.infoRead = false; 
    this.showLegend = false;
    this.dropdownText = "Afficher la légende";
  }

  onSubmit(obj: Object) :void{
    console.log("form submitted");    
    const zipCodeFormValue: string = obj['inputUserZipCode'];
    this.zipCode = zipCodeFormValue;
    this.queryParam = this.zipCode+"&limit=1";
    this.callDataGouvApi(this.queryParam);
  }

  callDataGouvApi(queryParam: string):void{
    this.http.get<any>('https://api-adresse.data.gouv.fr/search/?q='+this.queryParam ).subscribe(
      response => {
        this.dataGouvCity = response;   
        this.city = <City>{
          label:this.dataGouvCity['features'][0]["properties"]["label"],
          longitude:this.dataGouvCity['features'][0]["geometry"]["coordinates"][0],
          latitude: this.dataGouvCity['features'][0]["geometry"]["coordinates"][1],
        };
        this.isSuccessful= true;
        this.http.get<any>('https://api.open-meteo.com/v1/forecast?latitude='+this.city.latitude+"&longitude="+this.city.longitude+"&current=temperature_2m,relative_humidity_2m,apparent_temperature&models=meteofrance_seamless").subscribe(
      response => {
        this.data = response;   
        let celsius = this.data["current"]["temperature_2m"];
        let humidity = this.data["current"]["relative_humidity_2m"];
        let dewPoint = this.dewPointFast(celsius, humidity);
        this.humidex = this.getHumidex(celsius, dewPoint);
        this.apparentTemp = this.data["current"]["apparent_temperature"];
        this.isVisible = false;
        if(this.humidex<30){
          this.humClass='hum1';
        }
        if(this.humidex >= 30 && this.humidex < 35){
          this.humClass='hum2';
        }
        if(this.humidex >= 35 && this.humidex < 40){
          this.humClass='hum3';
        }
        if(this.humidex >= 40 && this.humidex < 45){
          this.humClass='hum4';
        }
        if(this.humidex >= 45 && this.humidex < 55){
          this.humClass='hum5';
        }
        if(this.humidex >= 55){
          this.humClass='hum6';
        }
      }, err => {
        this.errorMessage = err.error.message;
        this.isSuccessful = false;
      },
    );       
    this.isSuccessful= true;
  }
    );}

    onBack(){
      this.isSuccessful=false;
      this.isVisible=true;
    }

    dismiss(){
      this.infoRead = true;
    }

    
    toggleLegend(){
      if(this.showLegend){
        this.showLegend = false;
        this.dropdownText = "Afficher la légende";
      }else{
        this.showLegend = true;
        this.dropdownText = "Masquer la légende";
      }
    }


  dewPointFast(celsius: number, humidity: number): number{
    const a = 17.271;
    const b = 237.7;
    let temp = (a * celsius) / (b + celsius) + Math.log(humidity*0.01);
    let dp = (b * temp) / (a-temp);
    return dp;
  }

  getHumidex(temp: number, dewPoint: number): number{
    const kelvin = 273.15;
    let tempature = temp + kelvin;
    let dp = dewPoint + kelvin;
    //vapor pressure in bar
    let e = 6.11 * Math.exp(5417.7530 * ((1/kelvin)  - (1/dp)));
    //saturation vapor pressure
    let h = 0.5555*(e-10.0);
    return tempature + h - kelvin;
  }
}

