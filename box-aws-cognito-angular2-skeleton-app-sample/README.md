# box-cognito-angular-skeleton-app

### Currently Using Angular 4.0.0

## Immediate Build and Run
This project includes sample configuration included so that you can download and immediately run the app.
Just download the assets as a `.zip` file, unzip, open a terminal in the root directory, and use `ng serve` to build and run the project on a local development server.

The remaining documentation describes how to switch the existing credentials to target your own Box Developer and AWS accounts.

## Prerequisites
* [Angular CLI](https://cli.angular.io/)
* [Node.js](https://nodejs.org/en/)
* [NPM](https://www.npmjs.com/)
* [AWS Account](https://aws.amazon.com)
* [Box Developer Account](https://developer.box.com/)

### Configuration
Please refer to the README documentation [available here](https://github.com/box/samples/tree/master/box-node-cognito-lambdas-sample) to learn how to create the necessary AWS Cognito integration for Box Platform. 

#### Angular 2 Application Configuration
##### Step 1. Download the project dependencies
1. Use `npm install` to download the needed depenedencies for this project.
2. Don't forget to install the [Angular CLI](https://cli.angular.io/) if you haven't already.
##### Step 2. Add environment variables to the Angular App
1. Navigate to `src > environments` and change the `environment.ts` file to the values from your AWS Cognito User Pool, Federated Identity pool, and Client Application.
2. Navigate to `src > app > config > box` and change the `box.config.ts` file `refreshTokenUrl` to the AWS API Gateway URL you created.
3. Build and run your app by using the `ng serve` command from the root directory.
4. Navigate your browser to `http://localhost:4200`.

#### Angular CLI Commands
##### Development server
Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

##### Code scaffolding
Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive/pipe/service/class/module`.

##### Build
Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

##### Running unit tests
Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

##### Running end-to-end tests
Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).
Before running the tests make sure you are serving the app via `ng serve`.

##### Further help
To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

### Next Steps
* [Box Platform Developer Documentation](https://developer.box.com/).
* [Box Platform Blog](https://docs.box.com/blog/).
* [AWS Cognito Documentation](https://aws.amazon.com/documentation/cognito/).
* [AWS Cognito](https://aws.amazon.com/cognito/).
* [Box Platform on the AWS Marketplace](https://aws.amazon.com/marketplace/pp/B06XY1XHGV?ref_=%22hmpg_saas_featured%22_B06XY1XHGV_3).

Support
-------

Need to contact us directly?
* [Box Developer Forum](https://community.box.com/t5/Developer-Forum/bd-p/DeveloperForum).

Copyright and License
---------------------

Copyright 2017 Box, Inc. All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

