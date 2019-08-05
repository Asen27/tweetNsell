import { HttpClient } from '@angular/common/http';
import { ConfigService } from './../../config/configService';
import { AbstractWS } from './abstractService';
import { Injectable } from '@angular/core';
import { UserProfile, ServiceIndustry, Brand} from '../app.data.model';
import { CookieService } from 'ngx-cookie-service';


@Injectable()
export class RestWS extends AbstractWS {
  path = '';

  constructor(
    private config: ConfigService,
    http: HttpClient,
    private cookieService: CookieService
  ) {
    super(http);
    // this.path = this.config.config().restUrlPrefix;
    this.path = this.config.config().restUrlPrefixLocalhost;
  }
  // Methods
  public login(credentials) {
    const fd = new FormData();
    fd.append('username', credentials.username);
    fd.append('password', credentials.password);
    return this.makePostRequest(this.path + 'login/', fd)
      .then(res => {
        console.log('Logged successfully');
        return Promise.resolve(res);
      })
      .catch(error => {
        console.log('Error: ' + error);
        return Promise.reject(error);
      });
  }

  public listServiceIndustries(): Promise<any> {
    return this.makeGetRequest(this.path + 'service-industries/', false)
      .then(res => {
        return Promise.resolve(res);
      })
      .catch(error => {
        console.log('Error: ' + error);
        return Promise.reject(error);
      });
  }



  public register(
    username: string,
    password: string,
    confirm_password: string,
    email: string,
    service_industry: string
  ) {
    const fd = new FormData();
    fd.append('username', username);
    fd.append('password', password);
    fd.append('confirm_password', confirm_password);
    fd.append('email', email);
    fd.append('service_industry', service_industry);

    return this.makePostRequest(this.path + 'register/', fd)
      .then(res => {
        console.log('Sign up successfully');
        return Promise.resolve(res);
      })
      .catch(error => {
        return Promise.reject(error);
      });
  }


  public getUserLogged(token) {
    const fd = new FormData();
   // fd.append('token', token);
    return this.makePostRequest(this.path + 'getUserByToken/', fd, token)
      .then(res => {
        return Promise.resolve(res);
      })
      .catch(err => {
        return Promise.reject(err);
      });
  }


  public turnOnDjangoServer() {
    this.makeGetRequest(this.path + 'backend-wakeup/', null);
  }


}
