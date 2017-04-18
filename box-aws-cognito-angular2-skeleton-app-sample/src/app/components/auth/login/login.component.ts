import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { CognitoCallback, UserLoginService, LoggedInCallback } from "../../../services/aws/cognito.service";

@Component({
    selector: 'awscognito-angular2-app',
    templateUrl: './login.html'
})
export class LoginComponent implements CognitoCallback, LoggedInCallback, OnInit {
    email: string;
    password: string;
    errorMessage: string;

    constructor(public router: Router,
        public userService: UserLoginService) {
        console.log("LoginComponent constructor");
    }

    ngOnInit() {
        this.errorMessage = null;
        console.log("Checking if the user is already authenticated. If so, then redirect to the secure site");
        this.userService.isAuthenticated(this);
    }

    onLogin() {
        if (this.email == null || this.password == null) {
            this.errorMessage = "All fields are required";
            return;
        }
        this.errorMessage = null;
        this.userService.authenticate(this.email, this.password, this);
    }

    cognitoCallback(message: string, result: any) {
        if (message != null) { //error
            this.errorMessage = message;
            console.log("result: " + this.errorMessage);
            if (this.errorMessage === 'User is not confirmed.') {
                console.log("redirecting");
                this.router.navigate(['/confirmRegistration', this.email]);
            }
        } else { //success
            this.router.navigate(['/explorer']);
        }
    }

    isLoggedIn(message: string, isLoggedIn: boolean) {
        if (isLoggedIn)
            this.router.navigate(['/explorer']);
    }
}