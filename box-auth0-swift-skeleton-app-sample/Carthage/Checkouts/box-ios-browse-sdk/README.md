[![Project Status](http://opensource.box.com/badges/active.svg)](http://opensource.box.com/badges)

Box iOS Browse SDK
===================

This SDK allows you to show UI that allows users to browse their folders on Box.

<img src="https://cloud.box.com/shared/static/x7do7jgfgt7vz6dheizuvzjnm4yn8ta1.png" width="200"/>
<img src="https://cloud.box.com/shared/static/dfy0t2ammy8jashk2qhlv6zuin1vcpee.png" width="200"/>
<img src="https://cloud.box.com/shared/static/k14dvhfvr4hd6a1q57p27y3ugk71cwzn.png" width="200"/>

Developer Setup
---------------
 * Ensure you have the latest version of [Xcode](https://developer.apple.com/xcode/) installed.
 * We encourage you to use [Carthage](https://github.com/Carthage/Carthage) to import the SDK into your project.

Quickstart
----------
Step 1: Setup Carthage
```
brew install carthage
```
Create Cartfile in your project directory, add the following line:
```
 git "git@github.com:box/box-ios-browse-sdk.git" "master"
```
This will fetch the latest commit on master branch.
 
Step 2: Run Carthage Update
 
In the same directory as your Cartfile, run the following command:
```
carthage update --platform ios
```
Step 3: Import

In your project:
 
```objectivec
@import BoxBrowseSDK;
```

Step 4: Set the Box Client ID and Client Secret that you obtain from [creating a developer account](http://developers.box.com/)
```objectivec
[BOXContentClient setClientID:@"your-client-id" clientSecret:@"your-client-secret"];
```
Step 5: Launch a BOXFolderViewController
```objectivec
BOXContentClient *contentClient = [BOXContentClient defaultClient];
BOXFolderViewController *folderViewController = [[BOXFolderViewController alloc] initWithContentClient:contentClient];

// You must push it to a UINavigationController (i.e. do not 'presentViewController')
UINavigationController *navigationController = [[UINavigationController alloc] initWithRootViewController:folderViewController];
[self presentViewController:navigationController animated:YES completion:nil];
```

Sample App
----------
A sample app can be found in the [BoxBrowseSDKSampleApp](../../tree/master/BoxBrowseSDKSampleApp) folder. To execute the sample app:
Step 1: Update Carthage
```
cd BoxBrowseSDKSampleApp
carthage update --platform iOS
```
Step 2: Open Workspace
```
open BoxBrowseSDKSampleApp.xcworkspace
```

Contributing
------------
See [CONTRIBUTING](CONTRIBUTING.md) on how to help out.


Copyright and License
---------------------
Copyright 2015 Box, Inc. All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
