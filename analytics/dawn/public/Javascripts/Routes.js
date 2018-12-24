
//  TODO:  Rename this to Main App or DAWN App. Or something like that. `
//         This is the top-level module in the web app.

/* Update History
10/13/15	 aparasur	added routing for big brother
*/


var Router = angular.module('Router', ['ngRoute', 'DAWNControllers', 'LoginModule']);

Router.config(['$routeProvider', '$locationProvider', function($routeProvider) {
	$routeProvider.
	when('/noise', {
		templateUrl: 'views/NoiseInspector/mainPage.html',
		controller: 'mainCtrl'
	}).
	when('/timing', {
		templateUrl: 'views/TimingAnalyzer/mainPage_TA.html',
		controller: 'mainCtrl_TA'
	}).
	when('/timing/paths', {
		templateUrl: 'views/TimingAnalyzer/pathPage_TA.html',
		controller: 'pathCtrl_TA'
	}).
	when('/msf', {
		templateUrl: 'views/MSFStatus/mainPage.html',
		controller: 'mainCtrl_MSF'
	}).
	when('/main', {
		templateUrl: 'views/DAWN/portal.html',
		controller: 'portalCtrl'
	}).
	when('/dusk', {
		templateUrl: 'views/Dusk/mainView.html',
		controller: 'duskCtrl'
	}).
	when('/bigbrother', {
		templateUrl: 'views/BigBrother/bbRunsPage.html',
		controller: 'bbCtrl'
	}).
    when('/login', {
                templateUrl: 'views/DAWN/loginForm.html',
                controller:  'DawnLoginCtrl'
    }).
    when('/msf/main', {
     templateUrl:'views/MSFStatus/mainPage.html',
     controller: 'msf_mainCtrl'
    }).
    when('/msf/scorecard', {
     templateUrl:'views/MSFStatus/scorecard.html',
     controller: 'msf_scorecard'
    }).
    when('/msf/takedown', {
     templateUrl:'views/MSFStatus/takedown.html',
     controller: 'msf_takedown'
    }).
    when('/msf/progress', {
     templateUrl:'views/MSFStatus/progress.html',
     controller: 'msf_progress'
    }).
    when('/msf/activity', {
     templateUrl:'views/MSFStatus/activity.html',
     controller: 'msf_activity'
    }).                             
	otherwise({
		redirectTo: '/login'
	});

}]);

/*
var MSFRouter = angular.module('MSFRouter', ['ngRoute', 'MSFControllers', 'DAWNControllers', 'LoginModule']);
MSFRouter.config(['$routeProvier', '$locationProvier', function($routeProvider) {
   $routeProvier
   .when('/msf/main', {
     templateUrl:'views/MSFStatus/mainPage.html',
     controller: 'msf_mainCtrl'
   })
   .when('/msf/scorecard', {
     templateUrl:'views/MSFStatus/scorecard.html',
     controller: 'msf_scorecard'
   })
   .when('/msf/takedown', {
     templateUrl:'views/MSFStatus/takedown.html',
     controller: 'msf_takedown'
   })
   .when('/msf/progress', {
     templateUrl:'views/MSFStatus/progress.html',
     controller: 'msf_progress'
   })
   .when('/msf/activity', {
     templateUrl:'views/MSFStatus/activity.html',
     controller: 'msf_activity'
   })
   .when('/login', {
     templateUrl: 'views/DAWN/loginForm.html',
     controller:  'DawnLoginCtrl'
   })
   .when('/main', {
     templateUrl: 'views/DAWN/portal.html',
     controller:  'portalCtrl'
   }) 
   .otherwise( {
     redirectTo: '/main'
   });
}]);   
*/
