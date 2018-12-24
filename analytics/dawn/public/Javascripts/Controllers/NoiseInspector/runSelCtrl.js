DAWNControllers.controller('runSelCtrl', function ($scope, $http, $modalInstance, startupSettingsService) {	
   queryRunList();
	console.log("(D) Started up run select control");
	
	$scope.changeApp = function(){
		console.log("changing app");
		$http.get('applications.json').success(function(data) {
			$scope.apps = data;
			$scope.app = $scope.apps.noiseInspector[0];
		});
		$modalInstance.close($scope.selectedRun);
		startupSettingsService.setRunId($scope.selectedRun.runId);
		console.log($scope.selectedRun);
		window.location = "/#/noise";
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
			{field: 'runName' , displayName: 'Macro/Unit name'},
                        {field: 'dev'     , displayName: 'dev run'}
		]
	};
	$scope.runsGrid.onRegisterApi = function(gridApi){
      //set gridApi on scope
        $scope.gridApi = gridApi;
        gridApi.selection.on.rowSelectionChanged($scope,function(row){
			console.log("selected a new run.");
			$scope.selectedRun = row.entity;
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
		})
		.error(function(data, status) {
			console.log("(E) mainCtrl:  Error. Could not query DB.");
		});
	}
	
	
});