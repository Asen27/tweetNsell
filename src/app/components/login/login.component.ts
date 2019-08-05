import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { DataManagement } from '../../services/dataManagement';
import { CookieService } from 'ngx-cookie-service';
import { AlertService } from '../../services/alertService';
import { StorageService } from '../../services/storageService';
import { TranslateService } from '@ngx-translate/core';
import { routerTransition } from '../../router.animations';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    animations: [routerTransition()]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  submitted = false;
  returnUrl: string;
  language: string;
  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private alertService: AlertService,
    public dm: DataManagement,
    private cookieService: CookieService,
    private storageService: StorageService,
    private translateService: TranslateService
  ) {
     this.turnOnDjangoServer();

    this.language = this.cookieService.get('lang');

     // redirect to home if already logged in
    if (this.cookieService.check('token')) {
      this.router.navigate(['/']);
    }

  }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });

    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.loginForm.controls;
  }

  onSubmit() {
    this.submitted = true;

    // reset alerts on submit
    this.alertService.clear();

    // stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;

    this.dm
      .login({
        username: this.f.username.value,
        password: this.f.password.value
      })
      .then(data => {

        setTimeout(() => {
          // this.cookieService.set('token', data.token, this.getTimeToExpire());
          this.cookieService.set('token', data.token);
          this.dm.getUserLogged(data.token).then(user => {
            this.storageService.setItem('user:logged', JSON.stringify(user));
            this.router.navigate([this.returnUrl]);
          });
        }, 1500);
      })
      .catch(error => {
        this.alertService.error(error);
        this.loading = false;
      });
  }


  register() {
    this.router.navigate(['/register']);
  }


  turnOnDjangoServer() {
    this.dm.turnOnDjangoServer();
  }


  changeLanguage(selectedValue: string) {
    this.cookieService.set('lang', selectedValue);
    this.translateService.use(selectedValue);
  }

}


