DAWNControllers.controller('runSelCtrl_TA', [ '$rootScope', '$scope', '$http', '$modalInstance', 'startupSettingsService', function ($rootScope, $scope, $http, $modalInstance, startupSettingsService) {
	console.log("(D) Started up select control for timing analyzer");
    $scope.sqlitefiles = {endpt:"", checks:"", comp:""};

    $scope.changeApp = function() {
		console.log("changing app");
        console.log($modalInstance);
        $rootScope.sqliteFiles = {endpt:"", checks:"", comp:""};
        $rootScope.sqliteFiles.endpt  = $scope.sqlitefiles.endpt;
        $rootScope.sqliteFiles.checks = $scope.sqlitefiles.checks;
        $rootScope.sqliteFiles.comp   = $scope.sqlitefiles.comp;
        console.log("(D) Endpoint report: " + $scope.sqlitefiles.endpt);
		$modalInstance.close();
		window.location = "/#/timing";
    }

    // More function dev needed to validate if the file exists
    function checkIfFileExits(filename) {
        var tmp=new Image;
        tmp.src=filename;

        if(tmp.complete)        
            alert(filename+" is available");        
        else        
            alert(filename+" is not available");   
    }

}]);
/*
DAWNControllers.controller('runSelCtrl_TA', function ($scope, $http, $modalInstance, startupSettingsService) {
    queryRunList();
	console.log("(D) Started up run select control");
	
	$scope.changeApp = function(){
		console.log("changing app");
		$http.get('applications.json').success(function(data) {
			$scope.apps = data;
			$scope.app = $scope.apps.timingAnalyzer[0];
		});
        console.log($modalInstance);
		$modalInstance.close($scope.selectedRun);
		startupSettingsService.setRunId($scope.selectedRun.runId);
        console.log($scope.selectedRun);
		window.location = "/#/timing";
    }
	
   
	$scope.runsArray = [];
	$scope.runsGrid = { 
		data: 'runsList',
		multiSelect: false,
		enableRowHeaderSelection: false,
		enableRowSelection: true,
		enableGridMenu: true,
		columnDefs: [ 
			{field: 'user'    , displayName: 'User Name'},
			{field: 'date'    , displayName: 'Date'},
			{field: 'runName' , displayName: 'Macro/Unit name'}
		]
	};
	$scope.runsGrid.onRegisterApi = function(gridApi){
      //set gridApi on scope
        $scope.gridApi = gridApi;
        gridApi.selection.on.rowSelectionChanged($scope,function(row){
			console.log("selected a new run.");
			$scope.selectedRun = row.entity;
            console.log($scope.selectedRun);
        });
    };
	
  	$scope.vid = "None";
  	$scope.sink = "None";
  	$scope.selectedSinkId = "None";

	
	//  TODO:  Stick this function (and other helpers in a different place. Probably
	function queryRunList() {
		console.log("(D):  qvlist called from runSelCtrl. ");
		$http.get('DB/runs').success(function(data) {
			$scope.runsList = data;
            console.log(data);
		})
		.error(function(data, status) {
			console.log("(E) mainCtrl:  Error. Could not query DB.");
		});
	}
	
	
});
*/
