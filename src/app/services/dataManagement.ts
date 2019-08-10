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

  public deleteServiceIndustry(name_en: string): Promise<any> {
    return this.restService
      .deleteServiceIndustry(name_en)
      .then(data => {
        return Promise.resolve(data);
      })
      .catch(error => {
        return Promise.reject(error);
      });
  }

  public createServiceIndustry(
    name_en: string,
    name_es: string
  ): Promise<any> {
    return this.restService
      .createServiceIndustry(
        name_en,
        name_es
      )
      .then(data => {
        return Promise.resolve(data);
      })
      .catch(error => {
        return Promise.reject(error);
      });
  }

  public listOpinions(selector: string, page: Number): Promise<any> {
    return this.restService
      .listOpinions(selector, page)
      .then(data => {
        return Promise.resolve(data);
      })
      .catch(error => {
        return Promise.reject(error);
      });
  }


  public pinOpinion(id: Number): Promise<any> {
    return this.restService
      .pinOpinion(id)
      .then(data => {
        return Promise.resolve(data);
      })
      .catch(error => {
        return Promise.reject(error);
      });
  }


  public unpinOpinion(id: Number): Promise<any> {
    return this.restService
      .unpinOpinion(id)
      .then(data => {
        return Promise.resolve(data);
      })
      .catch(error => {
        return Promise.reject(error);
      });
  }

  public deleteOpinion(id: Number): Promise<any> {
    return this.restService
      .deleteOpinion(id)
      .then(data => {
        return Promise.resolve(data);
      })
      .catch(error => {
        return Promise.reject(error);
      });
  }




  public evaluateOpinion(id: Number): Promise<any> {
    return this.restService
      .evaluateOpinion(id)
      .then(data => {
        return Promise.resolve(data);
      })
      .catch(error => {
        return Promise.reject(error);
      });
  }

  public loadOpinions(): Promise<any> {
    return this.restService
      .loadOpinions()
      .then(data => {
        return Promise.resolve(data);
      })
      .catch(error => {
        return Promise.reject(error);
      });
  }

  public evaluateAllOpinions(): Promise<any> {
    return this.restService
      .evaluateAllOpinions()
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
