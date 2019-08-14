import { HttpClient } from '@angular/common/http';
import { ConfigService } from './../../config/configService';
import { AbstractWS } from './abstractService';
import { Injectable } from '@angular/core';
import { UserProfile, ServiceIndustry, Brand } from '../app.data.model';
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

    public deleteServiceIndustry(name_en: string): Promise<any> {
        const token = this.cookieService.get('token');
        return this.makeDeleteRequest(
            this.path + 'service-industries/delete/' + name_en + '/',
            false,
            token
        )
            .then(res => {
                return Promise.resolve(res);
            })
            .catch(error => {
                console.log('Error: ' + error);
                return Promise.reject(error);
            });
    }

    public createServiceIndustry(name_en: string, name_es: string) {
        const token = this.cookieService.get('token');
        const fd = new FormData();
        fd.append('name_en', name_en);
        fd.append('name_es', name_es);
        return this.makePostRequest(
            this.path + 'service-industries/create/',
            fd,
            token
        )
            .then(res => {
                return Promise.resolve(res);
            })
            .catch(error => {
                return Promise.reject(error);
            });
    }

    public listBrands(page: Number): Promise<any> {
        const token = this.cookieService.get('token');
        return this.makeGetRequest(this.path + 'brands/', { page: page }, token)
            .then(res => {
                return Promise.resolve(res);
            })
            .catch(error => {
                console.log('Error: ' + error);
                return Promise.reject(error);
            });
    }

    public deleteBrand(username: string): Promise<any> {
        const token = this.cookieService.get('token');
        return this.makeDeleteRequest(
            this.path + 'brands/delete/' + username + '/',
            false,
            token
        )
            .then(res => {
                return Promise.resolve(res);
            })
            .catch(error => {
                console.log('Error: ' + error);
                return Promise.reject(error);
            });
    }

    public listOpinions(selector: string, page: Number): Promise<any> {
        const token = this.cookieService.get('token');
        return this.makeGetRequest(
            this.path + 'opinions/' + selector + '/',
            { page: page },
            token
        )
            .then(res => {
                return Promise.resolve(res);
            })
            .catch(error => {
                console.log('Error: ' + error);
                return Promise.reject(error);
            });
    }

    public pinOpinion(id: Number): Promise<any> {
        const token = this.cookieService.get('token');
        const fd = new FormData();
        return this.makeUpdateRequest(
            this.path + 'opinions/pin/' + id + '/',
            false,
            fd,
            token
        )
            .then(res => {
                return Promise.resolve(res);
            })
            .catch(error => {
                console.log('Error: ' + error);
                return Promise.reject(error);
            });
    }

    public unpinOpinion(id: Number): Promise<any> {
        const token = this.cookieService.get('token');
        const fd = new FormData();
        return this.makeUpdateRequest(
            this.path + 'opinions/unpin/' + id + '/',
            false,
            fd,
            token
        )
            .then(res => {
                return Promise.resolve(res);
            })
            .catch(error => {
                console.log('Error: ' + error);
                return Promise.reject(error);
            });
    }

    public deleteOpinion(id: Number): Promise<any> {
        const token = this.cookieService.get('token');
        return this.makeDeleteRequest(
            this.path + 'opinions/delete/' + id + '/',
            false,
            token
        )
            .then(res => {
                return Promise.resolve(res);
            })
            .catch(error => {
                console.log('Error: ' + error);
                return Promise.reject(error);
            });
    }

    public evaluateOpinion(id: Number): Promise<any> {
        const token = this.cookieService.get('token');
        const fd = new FormData();
        return this.makeUpdateRequest(
            this.path + 'opinions/evaluate/' + id + '/',
            false,
            fd,
            token
        )
            .then(res => {
                return Promise.resolve(res);
            })
            .catch(error => {
                console.log('Error: ' + error);
                return Promise.reject(error);
            });
    }

    public loadOpinions() {
        const token = this.cookieService.get('token');
        const fd = new FormData();
        return this.makePostRequest(this.path + 'opinions/load/', fd, token)
            .then(res => {
                return Promise.resolve(res);
            })
            .catch(error => {
                return Promise.reject(error);
            });
    }

    public evaluateAllOpinions() {
        const token = this.cookieService.get('token');
        const fd = new FormData();
        return this.makePostRequest(
            this.path + 'opinions/evaluate/all/',
            fd,
            token
        )
            .then(res => {
                return Promise.resolve(res);
            })
            .catch(error => {
                return Promise.reject(error);
            });
    }

    public listFollowers(selector: string, page: Number): Promise<any> {
        const token = this.cookieService.get('token');
        return this.makeGetRequest(
            this.path + 'followers/' + selector + '/',
            { page: page },
            token
        )
            .then(res => {
                return Promise.resolve(res);
            })
            .catch(error => {
                console.log('Error: ' + error);
                return Promise.reject(error);
            });
    }

    public loadFollowers() {
        const token = this.cookieService.get('token');
        const fd = new FormData();
        return this.makePostRequest(this.path + 'followers/load/', fd, token)
            .then(res => {
                return Promise.resolve(res);
            })
            .catch(error => {
                return Promise.reject(error);
            });
    }

    public evaluateFollower(id: Number): Promise<any> {
        const token = this.cookieService.get('token');
        const fd = new FormData();
        return this.makeUpdateRequest(
            this.path + 'followers/evaluate/' + id + '/',
            false,
            fd,
            token
        )
            .then(res => {
                return Promise.resolve(res);
            })
            .catch(error => {
                console.log('Error: ' + error);
                return Promise.reject(error);
            });
    }

    public evaluateAllFollowers() {
        const token = this.cookieService.get('token');
        const fd = new FormData();
        return this.makePostRequest(
            this.path + 'followers/evaluate/all/',
            fd,
            token
        )
            .then(res => {
                return Promise.resolve(res);
            })
            .catch(error => {
                return Promise.reject(error);
            });
    }

    public deleteFollower(id: Number): Promise<any> {
        const token = this.cookieService.get('token');
        return this.makeDeleteRequest(
            this.path + 'followers/delete/' + id + '/',
            false,
            token
        )
            .then(res => {
                return Promise.resolve(res);
            })
            .catch(error => {
                console.log('Error: ' + error);
                return Promise.reject(error);
            });
    }

    public updateBrand(): Promise<any> {
        const token = this.cookieService.get('token');
        const fd = new FormData();
        return this.makeUpdateRequest(
            this.path + 'brand/update/',
            false,
            fd,
            token
        )
            .then(res => {
                return Promise.resolve(res);
            })
            .catch(error => {
                console.log('Error: ' + error);
                return Promise.reject(error);
            });
    }

    public getDashboardData() {
        const token = this.cookieService.get('token');
        const fd = new FormData();
        return this.makePostRequest(this.path + 'dashboard/', fd, token)
            .then(res => {
                return Promise.resolve(res);
            })
            .catch(err => {
                return Promise.reject(err);
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
