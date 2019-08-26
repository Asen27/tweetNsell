import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataManagement } from '../../services/dataManagement';
import { CookieService } from 'ngx-cookie-service';
import { AlertService  } from '../../services/alertService';
import { ServiceIndustry } from '../../app.data.model';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { routerTransition } from '../../router.animations';
import { StorageService } from 'src/app/services/storageService';

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss'],
    animations: [routerTransition()]
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  loading = false;
  submitted = false;
  language: string;
  serviceIndustriesOptions: ServiceIndustry[];

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private alertService: AlertService,
    private cookieService: CookieService,
    private dm: DataManagement,
    private translateService: TranslateService,
    private storageService: StorageService
  ) {

    this.language = this.cookieService.check('lang') ? this.cookieService.get('lang') : 'en';
    this.listServiceIndustries();

    // redirect to home if already logged in
    if (this.cookieService.check('token')) {
      this.router.navigate(['/']);
    }
  }

  ngOnInit() {
    this.registerForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
      email: ['', Validators.email],
      serviceIndustry: ['']
    });

    this.translateService.onLangChange.subscribe((event: LangChangeEvent) => {
        this.language = event.lang;
    });
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.registerForm.controls;
  }

  onSubmit() {
    this.submitted = true;

    // reset alerts on submit
    this.alertService.clear();

    // stop here if form is invalid
    if (this.registerForm.invalid) {
      return;
    }

    this.loading = true;

    this.dm
      .register(
        this.f.username.value,
        this.f.password.value,
        this.f.confirmPassword.value,
        this.f.email.value,
        this.f.serviceIndustry.value
      )
      .then(data => {
        setTimeout(() => {
        this.loading = false;
        const message = this.translateService.instant('SUCCESS.REGISTER');
        this.alertService.success(message, true);
        this.dm
        .login({
        username: this.f.username.value,
        password: this.f.password.value
        })
        .then(token => {
          this.cookieService.set('token', token.token);
          this.dm.getUserLogged(token.token).then(user => {
            this.storageService.setItem('user:logged', JSON.stringify(user));
          }).finally(() => this.router.navigate(['/info']));
        });
          }, 1500);
        })
        .catch(error => {
          this.alertService.error(error);
          this.loading = false;
        });
    }

  public listServiceIndustries() {
    this.dm
      .listServiceIndustries()
      .then(data => {
        this.serviceIndustriesOptions = data.results;
      })
      .catch(error => {
        console.log(error);
      });
  }

  changeLanguage(selectedValue: string) {
    this.cookieService.set('lang', selectedValue);
    this.translateService.use(selectedValue);
  }

}

