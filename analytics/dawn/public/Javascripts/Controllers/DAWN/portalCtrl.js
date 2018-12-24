/** this controller handles most everything about DAWN */

/* Update History
10/13/15    aparasur    added Re-routing to BigBrother
*/

DAWNControllers.controller('portalCtrl', function ($scope, $http, $modal) {

    console.log("(D) Portal Controller Called");
    $scope.appTitle = "Design Analytics Web Network";

    /** This called with ng-click from the buttons in portal.html */
    $scope.open = function (app) {
        if (app === "Noise Inspector") {
            $scope.html = 'views/NoiseInspector/runSelection.html';
            $scope.ctrl = 'runSelCtrl';
        }
		if(app==="Timing Analyzer"){			
			$scope.html = 'views/TimingAnalyzer/runSelection_TA.html';
			$scope.ctrl = 'runSelCtrl_TA';
		}
		if(app==="MSF Status"){			
			$scope.html = 'views/MSFStatus/mainPage.html';
			$scope.ctrl = 'mainCtrl_MSF';
		}
        if (app === "Dusk") {
            $scope.html = 'views/Dusk/entryModal.html';
            $scope.ctrl = 'duskEntry';
        }
        $scope.modalInstance = $modal.open({
            templateUrl: $scope.html,
            controller: $scope.ctrl,
            windowClass: 'backdropForSelectionModal' //This is how we get the backdrop to be the darker dawn image
        });
    };

    //Re-routing to BigBrother
    $scope.goBigBrother = function($location, $window) {
        console.log("inside topCtrl's goBigBrother");
        window.location = "/#/bigbrother";
        window.location.reload();

        console.log("outside topCtrl's goBigBrother")
    }
});
