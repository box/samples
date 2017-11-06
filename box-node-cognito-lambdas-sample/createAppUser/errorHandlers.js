'use strict';
module.exports.handleConflictError = (err) => {
    let userID;
    if (err && err.response && err.response.body && err.response.body.context_info &&
        err.response.body.context_info && err.response.body.context_info.conflicts) {
        if (err.response.body.context_info.conflicts.length > 0) {
            userID = err.response.body.context_info.conflicts[0].id;
            console.log("User already exists");
            console.log(userID);
        } else {
            throw err;
        }
    }
}