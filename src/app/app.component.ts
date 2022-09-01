import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild, HostBinding, Directive, Input} from '@angular/core';
import { FormControl, NgForm} from '@angular/forms';
import { MatSelect } from '@angular/material/select';
import { ReplaySubject, Subject, isObservable} from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { HttpService } from './http.service';

interface University {
  name: string;
  longitude: number;
  latitude: number;
  asian_percent: number;
  id: number;
  student_population: number;
}

interface City {
  name: string;
  asian_percent: number;
  stateID: number;
  longitude: number;
  latitude: number;
  id: number;
  population: number;
  state: string;
}

interface Neighborhood {
  name: string;
  longitude: number;
  latitude: number;
  asian_percent: number;
  cityID: number;
  population: number;
  id: number;
  city: string;
}

interface State {
  id: number;
  name: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})

export class AppComponent {
  title = 'Demographics API';

  @Input('ngModel') username: string;
  @Input('ngModel') password: string;

  public error: boolean = false;
  public isUserLoggedIn: boolean = false;

  protected universities: University[] = [];
  protected cities: City[] = [];
  protected states: State[] = [];
  protected neighborhoods: Neighborhood[] = [];

  public showCity: boolean = false;
  public displayCity: City;

  public showNeighborhood: boolean = false;
  public displayNeighborhood: Neighborhood;

  public showUniversity: boolean = false;
  public displayUniversity: University;

  protected temp1: any;
  protected temp2: any;
  protected temp3: any;
  protected temp4: any;
  protected tempCity: any;
  protected tempNeighborhood: any;
  protected tempUniversity: any;

  public universityCtrl: FormControl = new FormControl();
  public universityFilterCtrl: FormControl = new FormControl();
  public filteredUniversities: ReplaySubject<any> = new ReplaySubject(1);

  public cityCtrl: FormControl = new FormControl();
  public cityFilterCtrl: FormControl = new FormControl();
  public filteredCities: ReplaySubject<any> = new ReplaySubject(1);

  public neighborhoodCtrl: FormControl = new FormControl();
  public neighborhoodFilterCtrl: FormControl = new FormControl();
  public filteredNeighborhoods: ReplaySubject<any> = new ReplaySubject(1);

  public isDarkTheme: Boolean = false;

  toggleControl = new FormControl(false);

  @ViewChild('singleSelect', { static: true }) singleSelect: MatSelect;
  
  protected _onDestroy = new Subject();

  constructor(private httpService: HttpService){};

  ngOnInit() {
    this.toggleControl.valueChanges.subscribe(val => {
      if(val == null) this.isDarkTheme = false;
      else this.isDarkTheme = val;
    })
  }

  ngOnDestroy() {
    this._onDestroy.next(true);
    this._onDestroy.complete();
  }

  loadAllInfo(){
    this.httpService.get("http://localhost:8080/universitiesID").subscribe(
      (response) => {
        this.temp1 = response;
        this.universities = this.temp1;
        this.filteredUniversities.next(this.universities.slice());
        this.universityFilterCtrl.valueChanges
          .pipe(takeUntil(this._onDestroy))
          .subscribe(() => {
            this.filterUniversities();
          });
      },
      (error) => { console.log(error); });

    this.httpService.get("http://localhost:8080/states").subscribe(
      (response) => {
        this.temp3 = response;
        this.states = this.temp3;

        this.httpService.get("http://localhost:8080/citiesID").subscribe(
          (response) => {
            this.temp2 = response;
            this.cities = this.temp2;
            this.setStates();
            this.filteredCities.next(this.cities.slice());
            this.cityFilterCtrl.valueChanges
              .pipe(takeUntil(this._onDestroy))
              .subscribe(() => {
                this.filterCities();
              });

            this.httpService.get("http://localhost:8080/neighborhoodsID").subscribe(
              (response) => {
                this.temp4 = response;
                this.neighborhoods = this.temp4;
                this.setNeighborhoods();
                this.filteredNeighborhoods.next(this.neighborhoods.slice());
                this.neighborhoodFilterCtrl.valueChanges
                  .pipe(takeUntil(this._onDestroy))
                  .subscribe(() => {
                    this.filterNeighborhoods();
                  });
              },
              (error) => { console.log(error); });
          },
          (error) => { console.log(error); });
      },
      (error) => { console.log(error); });
  }

  protected filterUniversities() {
    if (!this.universities) {
      return;
    }
    
    let search = this.universityFilterCtrl.value;
    if (!search) {
      this.filteredUniversities.next(this.universities.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
  
    this.filteredUniversities.next(
      this.universities.filter(university => university.name.toLowerCase().indexOf(search) > -1)
    );
  }

  protected filterCities() {
    if (!this.cities) {
      return;
    }
    
    let search = this.cityFilterCtrl.value;
    if (!search) {
      this.filteredCities.next(this.cities.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
  
    this.filteredCities.next(
      this.cities.filter(city => (city.name.toLowerCase() + ", " + city.state.toLowerCase()).indexOf(search) > -1)
    );
  }

  protected filterNeighborhoods() {
    if (!this.neighborhoods) {
      return;
    }
    
    let search = this.neighborhoodFilterCtrl.value;
    if (!search) {
      this.filteredNeighborhoods.next(this.neighborhoods.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
  
    this.filteredNeighborhoods.next(
      this.neighborhoods.filter(neighborhood => (neighborhood.name.toLowerCase() + ", " + neighborhood.city.toLowerCase()).indexOf(search) > -1)
    );
  }

  protected setStates(){
    for (let i=0; i<this.cities.length; i++){
      this.cities[i].state = this.states[this.cities[i].stateID - 1].name;
    }
  }

  protected setNeighborhoods(){
    for (let i=0; i<this.neighborhoods.length; i++){
      this.neighborhoods[i].city = this.cities[this.neighborhoods[i].cityID - 1].name;
    }
  }
  
  public loadCityInfo(curCity: City){
    this.showCity = false;
    this.httpService.get("http://localhost:8080/cityInfo/" + curCity.id).subscribe(
      (response) => {
        this.tempCity = response;
        curCity = this.tempCity;
        curCity.state = this.states[curCity.stateID - 1].name;
        this.displayCity = curCity;
        this.showCity = true;
      },
      (error) => { console.log(error); });
  }

  public loadNeighborhoodInfo(curNeighborhood: Neighborhood){
    this.showNeighborhood = false;
    this.httpService.get("http://localhost:8080/neighborhoodInfo/" + curNeighborhood.id).subscribe(
      (response) => {
        this.tempNeighborhood = response;
        curNeighborhood = this.tempNeighborhood;
        curNeighborhood.city = this.cities[curNeighborhood.cityID - 1].name;
        this.displayNeighborhood = curNeighborhood;
        this.showNeighborhood = true;
      },
      (error) => { console.log(error); });
  }

  public loadUniversityInfo(curUniversity: University){
    this.showUniversity = false;
    this.httpService.get("http://localhost:8080/universityInfo/" + curUniversity.id).subscribe(
      (response) => {
        this.tempUniversity = response;
        curUniversity = this.tempUniversity;
        this.displayUniversity = curUniversity;
        this.showUniversity = true;
      },
      (error) => { console.log(error); });
  }
  
  public round(decimal: number): number{
    return Math.round(decimal);
  }

  public login(form: NgForm){   
    this.error = false;

    const formData = new FormData();
    formData.append('username', this.username);
    formData.append('password', this.password);

    this.httpService.post("http://localhost:8080/process-login", formData).subscribe(
      (response) => {
        this.isUserLoggedIn = true;
        this.loadAllInfo();
        form.resetForm();
      },
      (error) => { 
        console.log(error); 
        this.error = true;
      });
  }

  public logout(){ 
    this.httpService.get("http://localhost:8080/logout");
    this.isUserLoggedIn = false;
  }
}
