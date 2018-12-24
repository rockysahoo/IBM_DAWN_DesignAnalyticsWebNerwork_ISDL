/*
DAWNControllers.controller('mainCtrl', ["$scope", "NotifyMSFStates", function ($scope, NotifyMSFStates) {
  console.log("(D) Started up mainCtrl for MSF");

}]);

DAWNControllers.controller('mainLandingCtrl', ["$scope", "NotifyMSFStates", function ($scope, NotifyMSFStates) {
  console.log("(D) Started up mainLandingCtrl controller for MSF");

})];
 
DAWNControllers.controller('dropDownMenu', ["$scope", "NotifyMSFStates", function ($scope, NotifyStates) {
  console.log("(D) Started up drop down menu control for MSF");
  $scope.viewChosen = data.viewSelect;
}]);

DAWNControllers.controller('runSelCtrl_MSF', function ($scope, $http, $modalInstance, startupSettingsService) {
    queryRunList();
	console.log("(D) Started up run select control for MSF");
	
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
		window.location = "/#/msf";
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
			console.log("(E) mainCtrl_MSF:  Error. Could not query DB.");
		});
	}
	
});
*/
