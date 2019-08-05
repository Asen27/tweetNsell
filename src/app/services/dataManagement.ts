import {UserProfile, Brand, ServiceIndustry } from './../app.data.model';
import { Injectable } from '@angular/core';
import { RestWS } from './restService';

@Injectable()
export class DataManagement {
  constructor(private restService: RestWS) { }

  public login(credentials): Promise<any> {
    return this.restService
      .login(credentials)
      .then(data => {
        return Promise.resolve(data);
      })
      .catch(error => {
        return Promise.reject(error);
      });
  }

  public listServiceIndustries(): Promise<any> {
    return this.restService
      .listServiceIndustries()
      .then(data => {
        return Promise.resolve(data);
      })
      .catch(error => {
        return Promise.reject(error);
      });
  }


  public register(
    username: string,
    password: string,
    confirm_password: string,
    email: string,
    service_industry: string
  ): Promise<any> {
    return this.restService
      .register(
        username,
        password,
        confirm_password,
        email,
        service_industry
      )
      .then(data => {
        return Promise.resolve(data);
      })
      .catch(error => {
        return Promise.reject(error);
      });
  }



  public getUserLogged(token): Promise<any> {
    return this.restService
      .getUserLogged(token)
      .then(data => {
        return Promise.resolve(data);
      })
      .catch(error => {
        return Promise.reject(error);
      });
  }


  public hasConnection(): boolean {
    return true;
  }



  public turnOnDjangoServer() {
    this.restService.turnOnDjangoServer();
  }



}
