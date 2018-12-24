/*
DAWNControllers.factory('SummaryInfoService', [ '$rootScope', '$http', function($rootScope, $http) {

/*
    var filename = $rootScope.sqliteFiles.endpt;
    var summaryInfo = function($http) {
        console.log("(D):  Testing python scirpt...");
		$http.get('DB/summary?fileName='+ filename).success(function(data) {
    	  console.log("(D):  Summary query through python...successful");
          console.log(data); 
		})
		.error(function(data, status) {
			console.log("(E) SummarInfoService:  Error. Could not query DB.");
		});    
    };              
    var summaryInfo = [{ "TOTAL_PATHS": 16,                                                               
                        "FAIL_PATHS": 10,                                                                           
                        "TOTAL_TESTS": 5,                                                                           
                        "UNIQUE_PINS": 7,                                                                           
                        "MIN_SLACK": -6.53,                                                                         
                        "MAX_SLACK": 4.86,                                                                          
                        "FOM": -40.04 }];   
    return summaryInfo;
}]);      
*/

DAWNControllers.controller('mainCtrl_TA', ['$rootScope', '$scope', '$http', 'uiGridConstants', '$modal', 
function ($rootScope, $scope, $http, uiGridConstants, $modal) {

	console.log("(D) Main Ctrl for timing is called");

    $scope.appTitle = "Timing Analyzer: Analysis";
    $scope.buckets = 5;
    $rootScope.selectedBucket = 0;
    $rootScope.paths = "";

	console.log("(D) calculateSummaryData called on " + $rootScope.sqliteFiles.endpt);
    calculateSummaryData($rootScope.sqliteFiles.endpt);

	console.log("(D) calculatePathsBreakdown called on " + $rootScope.sqliteFiles.endpt);
    calculatePathsBreakdown($rootScope.sqliteFiles.endpt);

	console.log("(D) generateSlackHistogram called on " + $rootScope.sqliteFiles.endpt + " with buckets = " + $scope.buckets);
    generateSlackHistogram($rootScope.sqliteFiles.endpt, $scope.buckets);

    $scope.testPython = function() {
    	console.log("(D):  Testing python scirpt...");
		$http.get('DB/path_page_query?fileName='+ $rootScope.sqliteFiles.endpt + '&queryName=query1').success(function(data) {
    	  console.log("(D):  Testing python scirpt...successful");
          console.log(data); 
		})
		.error(function(data, status) {
			console.log("(E) mainCtrl_TA:  Error. Could not query DB.");
		});    
    }

   $scope.displayPaths = function() {
        //$rootScope.paths = "";
        console.log("(D): Selected bucket = " + $scope.selectedBucket);
        if ($scope.selectedBucket != 0) {
          console.log("(D): Data = " + $scope.SlackHisto + " Length = " + $scope.SlackHisto[0].values.length);
          var paths = "";
          for (i = 0; i < $scope.SlackHisto[0].values.length; i++)  {
            if ($scope.selectedBucket == $scope.SlackHisto[0].values[i].BucketNum) {
              paths = $scope.SlackHisto[0].values[i].PathKeys.toString();
            }  
          }  
          console.log("(D): paths = " + paths);
          $rootScope.paths = paths;
        }
		window.location = "/#/timing/paths";
    };       

    $scope.slackHistoOptions = {
            chart: {
                type: 'discreteBarChart',
                height: 450,
                margin : {
                    top: 20,
                    right: 20,
                    bottom: 50,
                    left: 55
                },
                x: function(d){return d.BucketNum;},
                y: function(d){return d.NumPaths;},
                showValues: true,
                valueFormat: function(d){
                    return d3.format('d')(d);
                },
                duration: 500,
                xAxis: {
                    axisLabel: 'BucketNum',
                    tickFormat: function(d) { return d3.format(',f')(d);}
                },
                yAxis: {
                    axisLabel: 'Num of Paths',
                    tickFormat: function(d) { return d3.format(',f')(d);},
                    axisLabelDistance: -10
                }
            },
            title: {
                enable: true,
                text: 'Slack histogram',
                css: {
                  'color': 'Gray'
                }
            }
    };    

    $scope.pathsTypeCountOptions = {
            chart: {
                type: 'pieChart',
                height: 500,
                x: function(d){return d.PATHS_TYPE;},
                y: function(d){return d.DATA.COUNT;},
                showLabels: true,
                valueFormat: function(d){
                    return d3.format('d')(d);
                },
                duration: 500,
                labelThreshold: 0,
                labelSunbeamLayout: true,
                legend: {
                    margin: {
                        top: 5,
                        right: 35,
                        bottom: 5,
                        left: 0
                    }
                }
            }, 
            title: {
                enable: true,
                text: 'Breakdown: Paths Count',
                css: {
                  'color': 'Gray'
                }
            }
     };

     $scope.pathsTypeFOMOptions = {
            chart: {
                type: 'pieChart',
                height: 500,
                x: function(d){return d.PATHS_TYPE;},
                y: function(d){return d.DATA.FOM;},
                showLabels: true,
                duration: 500,
                labelThreshold: 0,
                labelSunbeamLayout: true,
                legend: {
                    margin: {
                        top: 5,
                        right: 35,
                        bottom: 5,
                        left: 0
                    }
                }
            },
            title: {
                enable: true,
                text: 'Breakdown: FOM',
                css: {
                  'color': 'Gray'
                }
            }
     };   

    function calculateSummaryData(endptfile) {
        $scope.selectedBucket = 0;
        console.log("(D):  Testing python scirpt...");
		$http.get('DB/main_page_query?fileName='+ endptfile+'&queryName=summary').success(function(data) {
    	  console.log("(D):  Summary query through python...successful");
          //console.log(data); 
          $scope.summaryData = data;
		})
		.error(function(data, status) {
			console.log("(E) calculateSummaryData:  Error. Could not query DB.");
		});          
    }       

    function generateSlackHistogram(endptfile, numBuckets) {
        console.log("(D):  generateSlackHistogram ...");
		$http.get('DB/main_page_query?fileName='+ endptfile+'&queryName=slack_histo&numBuckets='+numBuckets).success(function(data) {
    	  console.log("(D):  Query through python...successful");
          console.log(data); 
          $scope.SlackHisto = data;
		})
		.error(function(data, status) {
			console.log("(E) generateSlackHistogram:  Error. Could not query DB.");
		});          
    }

    function calculatePathsBreakdown(endptfile) {
        console.log("(D): Executing calculatePathsBreakdown...");
		$http.get('DB/main_page_query?fileName='+ endptfile+'&queryName=path_type_breakdown').success(function(data) {
    	  console.log("(D):  Summary query through python...successful");
          //console.log(data); 
          $scope.pathsBreakdown = data;
		})
		.error(function(data, status) {
			console.log("(E) calculatePathsBreakdown:  Error. Could not query DB.");
		});          
    }  
}]);

// This is tab controller in latch to latch analysis page
DAWNControllers.controller('TabController', ['$rootScope', '$scope', function ($rootScope, $scope) {
    this.tab = 1;
    this.selectTab = function(setTab) {
       this.tab = setTab;
    };

    this.isSelected = function(checkTab) {
       return this.tab === checkTab;
    }    
}]);

DAWNControllers.controller('LatchToLatchAnalysis', ['$rootScope', '$scope', '$http', function ($rootScope, $scope, $http) {
	console.log("(D): LatchToLatchAnalysis controller is called");
   
    $scope.numElementsToDisplay = 5;
    $scope.filterMinSlack = -10e15;
    $scope.filterMaxSlack = 10e15;
    $scope.filterDefBoxes = "";
    $scope.filterToPins = "";
    $scope.filterFromPins = "";
    $rootScope.filterMinSlack = $scope.filterMinSlack;
    $rootScope.filterMaxSlack = $scope.filterMaxSlack;
    $rootScope.filterDefBoxes = $scope.filterDefBoxes;
    $rootScope.filterToPins   = $scope.filterToPins;
    $rootScope.filterFromPins = $scope.filterFromPins;

    $scope.sortedSrcGrpFOM    = [];
    $scope.srcGrpFOMToDisplay = [];
    $scope.sortedSrcGrpCnt    = [];
    $scope.srcGrpCntToDisplay = [];
    $scope.sortedSrcGrpFOM    = $rootScope.sortedSrcGrpFOM;
    $scope.srcGrpFOMToDisplay = $rootScope.srcGrpFOMToDisplay;
    $scope.sortedSrcGrpCnt    = $rootScope.sortedSrcGrpCnt;
    $scope.srcGrpCntToDisplay = $rootScope.srcGrpCntToDisplay;

    $scope.sortedSnkGrpFOM    = [];
    $scope.snkGrpFOMToDisplay = [];
    $scope.sortedSnkGrpCnt    = [];
    $scope.snkGrpCntToDisplay = [];
    $scope.sortedSnkGrpFOM    = $rootScope.sortedSnkGrpFOM;
    $scope.snkGrpFOMToDisplay = $rootScope.snkGrpFOMToDisplay;
    $scope.sortedSnkGrpCnt    = $rootScope.sortedSnkGrpCnt;
    $scope.snkGrpCntToDisplay = $rootScope.snkGrpCntToDisplay;
 
    $scope.sortedSrcSnkGrpFOM    = [];
    $scope.srcSnkGrpFOMToDisplay = [];
    $scope.sortedSrcSnkGrpCnt    = [];
    $scope.srcSnkGrpCntToDisplay = [];
    $scope.sortedSrcSnkGrpFOM    = $rootScope.sortedSrcSnkGrpFOM;
    $scope.srcSnkGrpFOMToDisplay = $rootScope.srcSnkGrpFOMToDisplay;
    $scope.sortedSrcSnkGrpCnt    = $rootScope.sortedSrcSnkGrpCnt;
    $scope.srcSnkGrpCntToDisplay = $rootScope.srcSnkGrpCntToDisplay;

    console.log("(D): Calling filterLat2LatPaths function...");
    filterLat2LatPaths($rootScope.sqliteFiles.endpt, $scope.filterMinSlack, $scope.filterMaxSlack, $scope.filterToPins, $scope.filterFromPins, $scope.filterDefBoxes, $scope.numElementsToDisplay);

    $scope.reEvaluate = function() {
        console.log("(D): reEvaluate()'s scope var =  " + $scope);
        $rootScope.filterMinSlack = $scope.filterMinSlack;
        $rootScope.filterMaxSlack = $scope.filterMaxSlack;
        $rootScope.filterDefBoxes = $scope.filterDefBoxes;
        $rootScope.filterToPins   = $scope.filterToPins;
        $rootScope.filterFromPins = $scope.filterFromPins;
        console.log("(D): Re-evalulating filterLat2LatPaths function...");
        filterLat2LatPaths($rootScope.sqliteFiles.endpt, $scope.filterMinSlack, $scope.filterMaxSlack, $scope.filterToPins, $scope.filterFromPins, $scope.filterDefBoxes, $scope.numElementsToDisplay);
    };

    $scope.lat2latSrcGrpCntOptions = {
            chart: {
                type: 'pieChart',
                height: 500,
                x: function(d){return d.GROUP_NAME;},
                y: function(d){return d.COUNT;},
                showLabels: false,
                valueFormat: function(d){
                    return d3.format('d')(d);
                },
                duration: 500,
                labelThreshold: 0,
                labelSunbeamLayout: false,
                donut: true,
                donutRatio: 0.35,
                legend: {
                    margin: {
                        top: 5,
                        right: 35,
                        bottom: 5,
                        left: 0
                    }
                }
            }, 
            title: {
                enable: true,
                text: 'Source group: Count',
                css: {
                  'color': 'Gray'
                }
            }
    };                                   

    $scope.lat2latSrcGrpFomOptions = {
            chart: {
                type: 'pieChart',
                height: 500,
                x: function(d){return d.GROUP_NAME;},
                y: function(d){return d.FOM;},
                showLabels: false,
                duration: 500,
                labelThreshold: 0,
                labelSunbeamLayout: false,
                donut: true,
                donutRatio: 0.35,
                legend: {
                    margin: {
                        top: 5,
                        right: 35,
                        bottom: 5,
                        left: 0
                    }
                }
            },
            title: {
                enable: true,
                text: 'Source group: FOM',
                css: {
                  'color': 'Gray'
                }
            }
     };  

     $scope.lat2latSnkGrpCntOptions = {
            chart: {
                type: 'pieChart',
                height: 500,
                x: function(d){return d.GROUP_NAME;},
                y: function(d){return d.COUNT;},
                showLabels: false,
                valueFormat: function(d){
                    return d3.format('d')(d);
                },
                duration: 500,
                labelThreshold: 0,
                labelSunbeamLayout: false,
                donut: true,
                donutRatio: 0.35,
                legend: {
                    margin: {
                        top: 5,
                        right: 35,
                        bottom: 5,
                        left: 0
                    }
                }
            }, 
            title: {
                enable: true,
                text: 'Sink group: Count',
                css: {
                  'color': 'Gray'
                }
            }
    };                                   

    $scope.lat2latSnkGrpFomOptions = {
            chart: {
                type: 'pieChart',
                height: 500,
                x: function(d){return d.GROUP_NAME;},
                y: function(d){return d.FOM;},
                showLabels: false,
                duration: 500,
                labelThreshold: 0,
                donut: true,
                donutRatio: 0.35,
                labelSunbeamLayout: false,
                legend: {
                    margin: {
                        top: 5,
                        right: 35,
                        bottom: 5,
                        left: 0
                    }
                }
            },
            title: {
                enable: true,
                text: 'Sink group: FOM',
                css: {
                  'color': 'Gray'
                }
            }
    };             

    $scope.lat2latSrcSnkGrpCntOptions = {
            chart: {
                type: 'pieChart',
                height: 500,
                x: function(d){return d.GROUP_NAME;},
                y: function(d){return d.COUNT;},
                showLabels: false,
                valueFormat: function(d){
                    return d3.format('d')(d);
                },
                duration: 500,
                labelThreshold: 0,
                labelSunbeamLayout: false,
                donut: true,
                donutRatio: 0.35,
                legend: {
                    margin: {
                        top: 5,
                        right: 35,
                        bottom: 5,
                        left: 0
                    }
                }
            }, 
            title: {
                enable: true,
                text: 'Source-Sink group: Count',
                css: {
                  'color': 'Gray'
                }
            }
    };                                   

    $scope.lat2latSrcSnkGrpFomOptions = {
            chart: {
                type: 'pieChart',
                height: 500,
                x: function(d){return d.GROUP_NAME;},
                y: function(d){return d.FOM;},
                showLabels: false,
                duration: 500,
                labelThreshold: 0,
                labelSunbeamLayout: false,
                donut: true,
                donutRatio: 0.35,
                legend: {
                    margin: {
                        top: 5,
                        right: 35,
                        bottom: 5,
                        left: 0
                    }
                }
            },
            title: {
                enable: true,
                text: 'Source-Sink group: FOM',
                css: {
                  'color': 'Gray'
                }
            }
     };        

    function filterLat2LatPaths(endptfile, minSlack, maxSlack, toPins, fromPins, defBoxes, numElements) {
        var options = 'fileName='  + endptfile + '&queryName=summary' + '&minSlack='+ minSlack + '&maxSlack='+ maxSlack + '&sinkPins=' + toPins + '&sourcePins=' + fromPins + '&defBoxes=' + defBoxes;
        console.log("(D):  filterLat2LatPaths ... " + options);             
		//$http.get('DB/lat2lat_query?fileName='+ endptfile+'&queryName=summary&minSlack='+minSlack+'&maxSlack='+maxSlack).success(function(data) {
		$http.get('DB/lat2lat_query?' + options).success(function(data) {
    	  console.log("(D):  filterLat2LatPaths: query...successful");
          console.log(data); 
          $scope.lat2LatData            = data;
          console.log("(D): lat2LatData length = " + $scope.lat2LatData[0].DATA.SOURCE_GROUP[0].length);
          // Source group
          var srcGrpFOMArr          = data[0].DATA.SOURCE_GROUP;
          $scope.sortedSrcGrpFOM    = sortJSONArrayByKey(srcGrpFOMArr, "FOM", "ASC");
          var srcGrpCntArr          = data[0].DATA.SOURCE_GROUP;
          $scope.sortedSrcGrpCnt    = sortJSONArrayByKey(srcGrpCntArr, "COUNT", "DEC");
          $scope.srcGrpFOMToDisplay = [];
          $scope.srcGrpCntToDisplay = [];
          // Sink group
          var snkGrpFOMArr          = data[0].DATA.SINK_GROUP;
          $scope.sortedSnkGrpFOM    = sortJSONArrayByKey(snkGrpFOMArr, "FOM", "ASC");
          var snkGrpCntArr          = data[0].DATA.SINK_GROUP;
          $scope.sortedSnkGrpCnt    = sortJSONArrayByKey(snkGrpCntArr, "COUNT", "DEC");
          $scope.snkGrpFOMToDisplay = [];
          $scope.snkGrpCntToDisplay = [];
          // Source-Sink group
          var srcSnkGrpFOMArr          = data[0].DATA.SOURCE_SINK_GROUP;
          $scope.sortedSrcSnkGrpFOM    = sortJSONArrayByKey(srcSnkGrpFOMArr, "FOM", "ASC");
          var srcSnkGrpCntArr          = data[0].DATA.SOURCE_SINK_GROUP;
          $scope.sortedSrcSnkGrpCnt    = sortJSONArrayByKey(srcSnkGrpCntArr, "COUNT", "DEC");
          $scope.srcSnkGrpFOMToDisplay = [];
          $scope.srcSnkGrpCntToDisplay = [];
          
          // Pick numElements from sorted lists
          for (i=0; i < numElements; i++) {
            // Source group
            if (i < $scope.sortedSrcGrpFOM.length) {
              var obj = $scope.sortedSrcGrpFOM[i];
              $scope.srcGrpFOMToDisplay.push(obj);
            }
            if (i < $scope.sortedSrcGrpCnt.length) {
              var obj = $scope.sortedSrcGrpCnt[i];
              $scope.srcGrpCntToDisplay.push(obj);
            }
            // Sink group
            if (i < $scope.sortedSnkGrpFOM.length) {
              var obj = $scope.sortedSnkGrpFOM[i];
              $scope.snkGrpFOMToDisplay.push(obj);
            }
            if (i < $scope.sortedSnkGrpCnt.length) {
              var obj = $scope.sortedSnkGrpCnt[i];
              $scope.snkGrpCntToDisplay.push(obj);
            }
            // Source-Sink group
            if (i < $scope.sortedSrcSnkGrpFOM.length) {
              var obj = $scope.sortedSrcSnkGrpFOM[i];
              $scope.srcSnkGrpFOMToDisplay.push(obj);
            }
            if (i < $scope.sortedSrcSnkGrpCnt.length) {
              var obj = $scope.sortedSrcSnkGrpCnt[i];
              $scope.srcSnkGrpCntToDisplay.push(obj);
            }
          }
          console.log("(D): srcGrpFOMToDisplay : ");
          console.log($scope.srcGrpFOMToDisplay);
          console.log("(D): srcGrpCntToDisplay : ");
          console.log($scope.srcGrpCntToDisplay);
          console.log("(D): snkGrpFOMToDisplay : ");
          console.log($scope.snkGrpFOMToDisplay);
          console.log("(D): snkGrpCntToDisplay : ");
          console.log($scope.snkGrpCntToDisplay);
          console.log("(D): srcSnkGrpFOMToDisplay : ");
          console.log($scope.srcSnkGrpFOMToDisplay);
          console.log("(D): srcSnkGrpCntToDisplay : ");
          console.log($scope.snkGrpCntToDisplay);
          /*
          console.log("(D): srcGrpArr length = " + srcGrpArr.length);
          $scope.sortedSrcGrpFOM        = sortJSONArrayByKey(srcGrpArr, "FOM");
          console.log("(D): sortedSrcGrpFOM length = " + $scope.sortedSrcGrpFOM.length);
          console.log($scope.sortedSrcGrpFOM);
          $scope.srcGrpFOMToDisplay = [];
          console.log("(D): entering for loop... numElements = "+ numElements);
          for (i=0; i < (numElements - 1); i++) {
            console.log($scope.sortedSrcGrpFOM[i]);
            var obj = $scope.sortedSrcGrpFOM[i];
            $scope.srcGrpFOMToDisplay.push(obj);
            console.log("(D): element = " + i + " FOM = " + obj.FOM);
          }
          console.log("(D): srcGrpFOMToDisplay length = " + $scope.srcGrpFOMToDisplay.length);
          console.log($scope.srcGrpFOMToDisplay);
          $scope.sortedSrcGrpCnt        = sortJSONArrayByKey(data, "COUNT");
          $scope.srcGrpCntToDisplay = [];
          for (i=0; i < numElements; i++) {
            var obj = $scope.sortedSrcGrpCnt[i];
            $scope.srcGrpCntToDisplay.push(obj);
            console.log("(D): element = " + i + " Cnt = " + obj.COUNT);
          }
          */
          // Source group
          $rootScope.sortedSrcGrpFOM       = $scope.sortedSrcGrpFOM;
          $rootScope.srcGrpFOMToDisplay    = $scope.srcGrpFOMToDisplay;
          $rootScope.sortedSrcGrpCnt       = $scope.sortedSrcGrpCnt;
          $rootScope.srcGrpCntToDisplay    = $scope.srcGrpCntToDisplay;
          // Sink group
          $rootScope.sortedSnkGrpFOM       = $scope.sortedSnkGrpFOM;
          $rootScope.snkGrpFOMToDisplay    = $scope.snkGrpFOMToDisplay;
          $rootScope.sortedSnkGrpCnt       = $scope.sortedSnkGrpCnt;
          $rootScope.snkGrpCntToDisplay    = $scope.snkGrpCntToDisplay;
          // Source-Sink group
          $rootScope.sortedSrcSnkGrpFOM    = $scope.sortedSrcSnkGrpFOM;
          $rootScope.srcSnkGrpFOMToDisplay = $scope.srcSnkGrpFOMToDisplay;
          $rootScope.sortedSrcSnkGrpCnt    = $scope.sortedSrcSnkGrpCnt;
          $rootScope.srcSnkGrpCntToDisplay = $scope.srcSnkGrpCntToDisplay;
		})
		.error(function(data, status) {
			console.log("(E) filterLat2LatPaths:  Error. Could not query DB.");
		});          
    }    

   function sortJSONArrayByKey(obj, key, order) {
       return obj.sort( function(a, b) {
           var x = a[key]; var y = b[key];
           if (order == "ASC") {
             return ((x < y) ? -1 : ((x > y) ? 1 : 0));
           } else {
             return ((x > y) ? -1 : ((x < y) ? 1 : 0));
           }
       });
   }
  
}]);

DAWNControllers.controller('GateNetAnalysis', ['$rootScope', '$scope', '$http', function ($rootScope, $scope, $http) {
	console.log("(D): GateNetAnalysis controller is called");

}]);

DAWNControllers.controller('pathCtrl_TA', ['$rootScope', '$scope', '$http', 'uiGridConstants', '$modal', 'startupSettingsService',  function ($rootScope, $scope, $http, uiGridConstants, $modal, startupSettingsService) {

	console.log("(D) Path Ctrl for timing is called");
	//$scope.selectedRun = startupSettingsService.getRunId();

	/** This loads the app from applications.json */
	$scope.appTitle = "Timing Analyzer: Paths";
    $scope.sqlitefiles = {  endpt  : $rootScope.sqliteFiles.endpt,
                            comp   : $rootScope.sqliteFiles.comp,
                            checks : $rootScope.sqliteFiles.checks };
    $scope.paths = $rootScope.paths;
    console.log("(D) Paths selected: " + $rootScope.paths);

    console.log("(D) Endpoint report used: " + $rootScope.sqliteFiles.endpt);
    queryPaths($scope.sqlitefiles.endpt, $scope.paths);
    console.log("(D) queryPaths is done!" + "...");
    console.log($scope.pathList);

 	/** 
	*	This sets the data and all of the options for the victimGrid.
	*	This is all using ui-grid, so google that for more information
	*/
	$scope.pathGrid = { 
 		data: 'pathList',
		enableRowHeaderSelection: false, 
		enableFiltering: true,
		multiSelect: false,
		enableGridMenu: true,
        paginationPageSizes: [25, 50, 75],
        paginationPageSize: 25,
		columnDefs: [
			//{field: 'PATH_KEY',  displayName: 'Path Key', width: "45%", visible: false},
			{field: 'PIN_NAME',  displayName: 'Pin Name', width: "35%"},
			{field: 'TEST_TYPE', displayName: 'Test',     width: "25%"},
			{field: 'PHASE',     displayName: 'Phase',    width: "20%"},
			{field: 'SLACK',     displayName: 'Slack',    width: "20%", 
				/** This applies the css style 'failing' to all rows with a noise slack below zero */
				cellClass: function(grid, row, col, rowRenderIndex, colRenderIndex) { 
					if (grid.getCellValue(row,col)<0) {
						return 'failing';
					}
				}
			}
		]    
    };

 	$scope.pathGrid.onRegisterApi = function(gridApi){
      //set gridApi on scope
        $scope.gridApi = gridApi;
        gridApi.selection.on.rowSelectionChanged($scope,function(row){
			console.log("selected a new path.");
			$scope.selectedPath = row.entity;
			queryPathDetails($rootScope.sqliteFiles.endpt, row);
			//$scope.open('lg');
        });
		
    };    

 	$scope.pathArray = [];
	/** This handles the data and options for the sink grid. It all uses ui-grid */
	$scope.pathDetailsGrid = { 
		data: 'pathDetails',
		multiSelect: false,
		enableGridMenu: true,
		enableRowHeaderSelection: false,
		enableFiltering: true,
		selectedItems: $scope.pathArray,
		resizeable: true,
		afterSelectionChange: function(rowItem, event){
			if(rowItem.selected===true){ //This prevents the query from being executed on deselection
				queryEndPointDetails($rootScope.sqliteFiles.endpt, rowItem, event);
			}
		},
		columnDefs: [
			{field: 'PIN_NAME', displayName: 'Pin'}, 
			{field: 'ROW_NUM', displayName: 'Row Number'}, 
			{field: 'PATH_TYPE', displayName: 'Path Type'}, 
			{field: 'PHASE'},
			{field: 'EDGE'},
			{field: 'AT', displayName: 'AT'},
			{field: 'SLACK', displayName: 'Slack',
				/** this gives the css class of failing to all rows with noise slack < 0 */
				cellClass: function(grid, row, col, rowRenderIndex, colRenderIndex) {
                    //var temp = grid.getCellValue(row,col).toFixed(2);
                    //grid.setCellValue(row,col) = temp;
					if (grid.getCellValue(row,col)<0) {
						return 'failing';
					}
				}
			},
			{field: 'SLEW'} 
		]
	};
	
	$scope.pathDetailsGrid.onRegisterApi = function(gridApi){
      //set gridApi on scope
        $scope.gridApi = gridApi;
		
        gridApi.selection.on.rowSelectionChanged($scope,function(row){
			console.log("selected a new path.");
			$scope.selectedPin = row.entity;
			queryEndPointDetails($rootScope.sqliteFiles.endpt, row);
        });
    };

  	$endPointDetailsArray = [];
	$scope.endPointDetailsGrid = {
		data: 'endPointDetails',
		enableGridMenu: true,
		enableRowSelection: false,
		enableFiltering: true,
		columnDefs: [
			{field: 'PIN_NAME',  displayName: 'Pin',    visible: false},
			{field: 'EDGE',      displayName: 'Edge',   visible: false},
			{field: 'PHASE',     displayName: 'Phase',  visible: false},
			{field: 'AT',        displayName: 'AT'},
			{field: 'SLACK',     displayName: 'Slack'},
			{field: 'SLEW',      displayName: 'Slew'},
			{field: 'DELAY',     displayName: 'Delay'},
			{field: 'ADJUST',    displayName: 'Adjust'},
			{field: 'CELL_NAME', displayName: 'Cell'},
			{field: 'NET_NAME',  displayName: 'Net'},
			{field: 'FO',        displayName: 'FO'}
		]
	}
	
  	$scope.path_key = "None";
  	$scope.pin_name = "None";
  	$scope.selectedPinName = "None";    
 
  	//  TODO:  Stick this function (and other helpers) in a different place. Probably
	function queryPaths(endptfile, paths) {
		console.log("(D):  Endpoint report: "+endptfile);
		//$http.get('DB/paths?fileName='+endptfile).success(function(data) {
		$http.get('DB/path_page_query?fileName='+endptfile+'&queryName=query1'+'&keys='+paths).success(function(data) {
			$scope.pathList = data;
            console.log("(D) output data: ");
            console.log(data);
		})
		.error(function(data, status) {
			console.log("(E) mainCtrl_TA:  Error. Could not query DB.");
		});
	}

  	//  TODO:  Stick this function (and other helpers) in a different place. Probably
	function queryPathDetails(endptfile, rowItem) {
      console.log("(D):  path query.  rowItem=" + rowItem.entity);
	  //$scope.aggsOnSinkList = [];
      if (rowItem.entity && rowItem.entity.PATH_KEY) {
        var selItems = rowItem.entity.PATH_KEY;
	    console.log("(D):  pdlist called. path_key=" + selItems);
	    console.log("(D):  Endpoint report: "+endptfile);
	    //$http.get('DB/path_details?fileName='+endptfile+'&pathKey='+selItems).success(function(data) {
	    $http.get('DB/path_page_query?fileName='+endptfile+'&queryName=query2&pathKey='+selItems).success(function(data) {
          console.log("(D):  successfully queried DB for sinks.");
          $scope.pathDetails = data;
		  console.log($scope.pathDetails);
		})
		.error(function(data, status) {
		  console.log("(E) mainCtrl_TA:  Error. Could not query DB.");
	    });
      } else {
        console.log("(D): selItems is empty.");
      }
      console.log("(D):  exiting queryPathDetails()");
	}

  	//  TODO:  Stick this function (and other helpers) in a different place. Probably
 	function queryEndPointDetails(endptfile, rowItem) {
      console.log("(D):  endPointDetails query.  rowItem=" + rowItem.entity);
      if (rowItem.entity && rowItem.entity.PATH_KEY && rowItem.entity.PIN_NAME && rowItem.entity.ROW_NUM) {
        var selItems = rowItem.entity.PATH_KEY;
        var selItems2 = rowItem.entity.PIN_NAME;
        var selItems3 = rowItem.entity.ROW_NUM;
	    console.log("(D):  qvlist called. sink=" + selItems);
	    console.log("(D):  Endpoint report: "+endptfile);
	    //$http.get('DB/endpoint?fileName='+endptfile+'&pathKey='+selItems+'&pinName='+selItems2+'&rowNum='+selItems3).success(function(data) {
	    $http.get('DB/path_page_query?fileName='+endptfile+'&queryName=query3&pathKey='+selItems+'&pinName='+selItems2+'&rowNum='+selItems3).success(function(data) {
          console.log("(D):  successfully queried DB for endpoint.");
          $scope.endPointDetails = data; 
	      console.log($scope.endPointDetails);
	    })
	    .error(function(data, status) {
	  	  console.log("(E) mainCtrl:  Error. Could not query DB.");
	    });
      } else  {
        console.log("(D): selItems is empty.");
      }
      console.log("(D):  exiting queryEndPointDetails()");
	}        
           
}]);

