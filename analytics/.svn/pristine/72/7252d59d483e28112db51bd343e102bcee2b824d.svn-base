DAWNControllers.controller('mainCtrl', function ($scope, $http, uiGridConstants, $modal, startupSettingsService) {
	console.log("(D) Main Ctrl called");
	$scope.selectedRun = startupSettingsService.getRunId();
	
	/** This loads the app from applications.json */
	$scope.appTitle = "Noise Inspector";
	
    queryVictimList();
	
	/** 
	*	This sets the data and all of the options for the victimGrid.
	*	This is all using ui-grid, so google that for more information
	*/
	$scope.victimGrid = { 
		data: 'victimList',
		enableRowHeaderSelection: false, 
		enableFiltering: true,
		multiSelect: false,
		enableGridMenu: true,
		columnDefs: [
			{field: 'VictimName', displayName: 'Victim Name', width: "45%"},
			{field: 'NoiseSlack', displayName: 'Noise Slack', width: "25%", 
				/** This applies the css style 'failing' to all rows with a noise slack below zero */
				cellClass: function(grid, row, col, rowRenderIndex, colRenderIndex) { 
					if (grid.getCellValue(row,col)<0) {
						return 'failing';
					}
				}
			},
			{field: 'TotalPeak', displayName: 'Total Peak', width: "30%", cellFilter: 'number:4', groupable: false}
		]
	};
	
	$scope.victimGrid.onRegisterApi = function(gridApi){
      //set gridApi on scope
        $scope.gridApi = gridApi;
        gridApi.selection.on.rowSelectionChanged($scope,function(row){
			console.log("selected a new net.");
			$scope.selectedNet = row.entity;
			querySinkList(row);
			$scope.open('lg');
        });
		
    };
	
	$scope.sinkArray = [];
	/** This handles the data and options for the sink grid. It all uses ui-grid */
	$scope.sinkGrid = { 
		data: 'SinkList',
		multiSelect: false,
		enableGridMenu: true,
		enableRowHeaderSelection: false,
		enableFiltering: true,
		selectedItems: $scope.sinkArray,
		resizeable: true,
		afterSelectionChange: function(rowItem, event){
			if(rowItem.selected===true){ //This prevents the query from being executed on deselection
				queryAggsList(rowItem, event);
			}
		},
		columnDefs: [
			{field: 'SinkName', width: "28%"},
			{field: 'NoiseSlack', displayName: 'Noise Slack (V)', 
				/** this gives the css class of failing to all rows with noise slack < 0 */
				cellClass: function(grid, row, col, rowRenderIndex, colRenderIndex) {
					if (grid.getCellValue(row,col)<0) {
						return 'failing';
					}
				}
			},
			{field: 'TotalPeak', width: "12%"},
			{field: 'TotalCoupling', width: "12%"},
			{field: 'GroundCap', width: "12%"},
			{field: 'CornerName', visible: false}, //Things with visibility false can be shown by the user clicking to show them from the grid menu
			{field: 'SrcMacroName', width: "12%"},
			{field: 'NoiseType', width: "12%", 
				filter:{
					type:uiGridConstants.filter.SELECT, // This creates a drop down menu for the filter of this column
					selectOptions: [ { value: 'IH', label: 'IH' }, { value: 'IL', label: 'IL' }] //These are the values in that drop down selector
				}
			},
			{field: 'DriverName', visible: false},
			{field: 'AnalysisType', visible: false},
			{field: 'PulseArea', visible: false},
			{field: 'PulseWidth', visible: false},
			{field: 'PinCap', visible: false},
			{field: 'DriverRes', visible: false},
			{field: 'VDD', visible: false},
			{field: 'NRC', visible: false},
			{field: 'SrcNPeak', visible: false},
			{field: 'SrcNArea', visible: false},
			{field: 'SnkMacroName', visible: false},
			{field: 'AggrCnt', visible: false}
		]
	};
	
	$scope.sinkGrid.onRegisterApi = function(gridApi){
      //set gridApi on scope
        $scope.gridApi = gridApi;
		
        gridApi.selection.on.rowSelectionChanged($scope,function(row){
			console.log("selected a new sink.");
			$scope.selectedSink = row.entity;
			queryAggsList(row);
        });
    };
	
	$aggsOnSinkArray = [];
	$scope.aggsOnSinkGrid = {
		data: 'AggsOnSinkList',
		enableGridMenu: true,
		enableRowSelection: false,
		enableFiltering: true,
		columnDefs: [
			{field: 'AggrName', displayName: 'Aggressor Name', width: "30%"},
			{field: 'CouplingCap'},
			{field: 'TransitionTime'},
			{field: 'NoisePeak'},
			{field: 'NoiseArea'},
			{field: 'NoiseTime'},
			{field: 'percIncluded', visible: false},
			{field: 'AggrVDD', visible: false},
			{field: 'DriverStrength', visible: false}
			
		]
	}
	
  	$scope.vid = "None";
  	$scope.sink = "None";
  	$scope.selectedSinkId = "None";

	function getVictimList(file){
		$scope.file = file;
		$http.get(file).success(function(data){
			$scope.victimList = data;
		});
	}
	
	//  TODO:  Stick this function (and other helpers in a different place. Probably
	function queryVictimList() {
		console.log("(D):  qvlist called. "+$scope.selectedRun);
		$http.get('DB/vnets?runId='+$scope.selectedRun).success(function(data) {
			$scope.victimList = data;
		})
		.error(function(data, status) {
			console.log("(E) mainCtrl:  Error. Could not query DB.");
		});
	}
   
   	//  TODO:  Stick this function (and other helpers in a different place. Probably
	function querySinkList(rowItem) {
      console.log("(D):  sink query.  rowItem=" + rowItem.entity);
	  //$scope.aggsOnSinkList = [];
      if (rowItem.entity && rowItem.entity.VictimName)
         var selItems = rowItem.entity.VictimName;
      else
         var selItems = "";
		console.log("(D):  qvlist called. net=" + selItems);
		$http.get('DB/sinks?runId='+$scope.selectedRun+'&vname='+selItems).success(function(data) {
         console.log("(D):  successfully queried DB for sinks.");
         $scope.SinkList = data;
		 console.log($scope.SinkList);
		})
		.error(function(data, status) {
			console.log("(E) mainCtrl:  Error. Could not query DB.");
		});
      console.log("(D):  exiting querysinklist()");
	}
	
	function queryAggsList(rowItem) {
      console.log("(D):  aggsOnSink query.  rowItem=" + rowItem.entity);
      if (rowItem.entity && rowItem.entity.SinkName)
         var selItems = rowItem.entity.SinkName;
      else
         var selItems = "";
		console.log("(D):  qvlist called. sink=" + selItems);
		$http.get('DB/aggs?sinkName='+selItems).success(function(data) {
         console.log("(D):  successfully queried DB for aggs.");
         $scope.AggsOnSinkList = data[2]; //VERY HACKY - the two queries before the final one also return stuff, but we just want the final query
		 console.log($scope.AggsOnSinkList);
		})
		.error(function(data, status) {
			console.log("(E) mainCtrl:  Error. Could not query DB.");
		});
      
      console.log("(D):  exiting queryAggsList()");
	}
	
	
});