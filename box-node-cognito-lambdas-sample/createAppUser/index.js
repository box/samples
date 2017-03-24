/*
 * Copyright 2017. AMSXBG. All Rights Reserved.
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
**/
"use strict";
let cognitoManager = require('./cognito-manager');
let boxManager = require('./box-manager');

exports.handler = function (event, context) {
    console.log('Calling create app user')
    try {
        let params = {
            UserPoolId: event.userPoolId,
            Username: event.userName
        };
        
        cognitoManager.adminGetUser(params)
            .then(function(cognitoResponse) {
                let boxAppUserId = cognitoManager.getAppUserProperty(cognitoResponse.UserAttributes);
                if (boxAppUserId !== null) {
                    context.done(null, event);
                } else {
                    return boxManager.createAppUser(event.userName);    
                }
            }).then(function(appUser) {
                return cognitoManager.updateUserAttribute(event.userPoolId, event.userName, appUser.id);
            }).then(function(updated) {
                context.done(null, event);        
            }).catch(function(error) {
                context.done(error);
            })

        /*
        cognitoidentityserviceprovider.adminGetUser(params).promise()
            .then(function(cognitoResponse) {
                let boxAppUserId = getAppUserProp(cognitoResponse.UserAttributes);
                if (boxAppUserId !== null) {
                    context.done(null, event);
                } else {
                    createAppUser(event.userName)
                        .then(function(appUser) {
                            return updateUserAttribute(cognitoidentityserviceprovider, event.userPoolId, event.userName, appUser.id);
                        }).then(function(updated) {
                            context.done(null, event);        
                        }).catch(function(error) {
                            context.done(e);
                        })                    
                }
            }).catch(function(error) {
                context.done(e)
            })*/
    } catch (e) {
        context.done(e);
    }
}