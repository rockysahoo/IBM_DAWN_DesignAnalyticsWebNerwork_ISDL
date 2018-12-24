/**
 * This file is used to set up the Log-in stuff for our app.
 * We may decide to rename this module something like "session module"
 */

var bodyCtrl = angular.module('LoginModule', []);

//  NOTE:  This belongs somewhere near the top of the DOM.
//  TODO:  Rename part of this module to "AppController" or something like that.
bodyCtrl.controller('AppController', function ($scope, USER_ROLES, AuthService) {
    $scope.currentUser  = null;
    $scope.userRoles    = USER_ROLES;
    $scope.isAuthorized = AuthService.isAuthorized;

    $scope.setCurrentUser = function (user) {
        $scope.currentUser = user;
    };
})

bodyCtrl
.constant('AUTH_EVENTS', {
    loginSuccess:     'auth-login-success',
    loginFailed:      'auth-login-failed',
    logoutSuccess:    'auth-logout-success',
    sessionTimeout:   'auth-session-timeout',
    notAuthenticated: 'auth-not-authenticated',
    notAutherized:    'auth-not-authorized'
})
.constant('USER_ROLES', {
    all:    '*',
    admin:  'admin',
    editor: 'editor',
    guest:  'guest'
})
.factory('AuthService', function($http, $location, Session) {
    console.log("(D):  AuthService factory called/created.");
    var authService = {};

    authService.login = function (creds, error_callback) {
       console.log("(D):  authService.login function, creds: %j", creds);
       return $http
               .post('/DAWN/auth_login', creds)  // Attempts to login with creds
               .then(function(response) {        // Calls this function if succeeded.
                
                   // See also app.js -> dawnRouter.post which does the 
                   // validation stuff
                   console.log("(D):  authentication success");
                   console.log("(D):  response.status=" + response.status);
                   console.log("(D):  TODO: user.id and user.role need to be defined");

                   // TODO: There is no such attribute as response.data.user
                   // so changed it to response.data.username -- Ninad Oct 10, 2015
                   Session.create(response.data.id, response.data.username, 1);
                   //Session.create(response.data.id, response.data.user.id, response.data.user.role)

                   console.log("(D):  redirecting after login...");
                   //Redirect it to the main page
                   // TODO: It should redirect to the LAST page instead of the
                   // main page. OK for now -- Ninad Oct 13, 2015
                   $location.path('/main');
                   console.log("(D):  TODO: Should redirect to last visited page instead of main page");


                   return response.data.username;
               }, function(response) {          // Calls this function is auth. failed.
                   
                   console.log("(D):  authentication failure");
                   console.log("(D):  response.status=" + response.status);
                   console.log("(D):  response = ", response);

                   // response.status for bluegroup is an error if the error 
                   // code is one of 2, 5, 6, 9 (see Bluegroup XML API link)        
                   if ([2, 5, 6, 9 ].indexOf(response.status) > -1){
                    error_callback("Bluegroup authentication failure. You are not authorized");

                   }
                   else {
                    error_callback("Incorrect Intranet ID or password. Please try again.");
                   }
                   
               });
    };

    authService.isAuthenticated = function() {
        return !!Session.userId;
    };

    authService.isAuthorized = function(authorizedRoles) {
        if (!angular.isArray(authorizedRoles)) {
            authorizedRoles = [authorizedRoles];
        }
        return (authService.isAuthenticated() && authorizedRoles.indexOf(Session.userRole) !== -1);
    };
    return authService;
})
.service('Session', function() {
    this.create = function (sessionId, userId, userRole) {
        this.id       = sessionId;
        this.userId   = userId;
        this.userRole = userRole;
    };
    this.destroy = function () {
        this.id       = null;
        this.userId   = null;
        this.uesrRole = null;
    };
})
.controller('DawnLoginCtrl', function($scope, $rootScope, $http, AUTH_EVENTS, AuthService) {
    $scope.creds = {
        inetID:  '',
        inetPwd: ''
    };
    $scope.login_error_msg = "";
    $scope.dawnLoginFnc = function(creds) {
        console.log("(D):  dawnLogin function");
        var loginStatus = AuthService.login(creds, function(err_msg) {
            $scope.login_error_msg = err_msg;
        });
    };
})
