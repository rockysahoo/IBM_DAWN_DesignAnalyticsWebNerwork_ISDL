DAWNControllers.controller('mainCtrl_MSF_OLD2', ['$scope', '$http', '$modalInstance', function ($scope, $http, $modalInstance) {
  console.log("(D) Started up mainCtrl for MSF");
  $scope.appTitle = "MSF Status";
  window.location = "/#/msf";
  $scope.changeApp = function(){
  	console.log("changing app");
   	$http.get('applications.json').success(function(data) {
   		$scope.apps = data;
   		$scope.app = $scope.apps.timingAnalyzer[0];
   	});
    //console.log($modalInstance);
  	//$modalInstance.close($scope.selectedRun);
   	//startupSettingsService.setRunId($scope.selectedRun.runId);
    //console.log($scope.selectedRun);
   	window.location = "/#/msf";
  }       
}]);

DAWNControllers.factory('MSFDataService', [function() {

  var msfData = {
    designList: [
      {name: 'TE_SUPERRLM'},
      {name: 'C_SKITTER_CTRL_MAC'}
    ],
    roleList: [
      {name: 'Physical Designer'},
      {name: 'Technical Lead'},
      {name: 'Manager'}
    ],
    viewList: [
      {name: 'Scorecard'},
      {name: 'Takedown'},
      {name: 'Progress'},
      {name: 'Activity'}
    ],
    //currView: $rootScope.msfViewChosen,
    //currDesign: $rootScope.msfDesignChosen
  };       
  
  return msfData;
}]);

DAWNControllers.factory('MSFBarChartService', [function() {

var msfBarChartData = [
    { y: "2006", a: 100, b: 90 },
    { y: "2007", a: 75,  b: 65 },
    { y: "2008", a: 50,  b: 40 },
    { y: "2009", a: 75,  b: 65 },
    { y: "2010", a: 50,  b: 40 },
    { y: "2011", a: 75,  b: 65 },
    { y: "2012", a: 100, b: 90 }
];    

return msfBarChartData;

}]);

DAWNControllers.factory('MSFBarChartServiceChoose', [function() {

var msfBarChartData = [
    { "labels": [ "[-85.0 to -81.6)", "[-81.6 to -78.2)", "[-78.2 to -74.8)", "[-74.8 to -71.4)", "[-71.4 to -68.0)",
                  "[-68.0 to -64.6)", "[-64.6 to -61.2)", "[-61.2 to -57.8)", "[-57.8 to -54.4)", "[-54.4 to -51.0)",
                  "[-51.0 to -47.6)", "[-47.6 to -44.2)", "[-44.2 to -40.8)", "[-40.8 to -37.4)", "[-37.4 to -34.0)",
                  "[-34.0 to -30.6)", "[-30.6 to -27.2)", "[-27.2 to -23.8)", "[-23.8 to -20.4)", "[-20.4 to -17.0)",
                  "[-17.0 to -13.6)", "[-13.6 to -10.2)", "[-10.2 to -6.8)", "[-6.8 to -3.4)", "[-3.4 to 0.0)" ],
      "data": [ "1", " ", "0", " ", "0",
                " ", "1", " ", "0", " ",
                "0", " ", "1", " ", "0",
                " ", "1", "1", " ", "1",
                " ", "0", " ", "1", "1",
                " ", "0", " ", "0", " ",
                "0", " ", "0", " ", "0",
                " ", "0", " ", "0", " ",
                "0", " ", "0", " ", "0",
                " ", "0", " ", "0", " ",
                "0" ],
      "title": "150_SYN_Logic_Synthesis"
    },
    { "labels": [ "[-10.0 to -9.6)", "[-9.6 to -9.2)", "[-9.2 to -8.8)", "[-8.8 to -8.4)", "[-8.4 to -8.0)",
                  "[-8.0 to -7.6)", "[-7.6 to -7.2)", "[-7.2 to -6.8)", "[-6.8 to -6.4)", "[-6.4 to -6.0)",
                  "[-6.0 to -5.6)", "[-5.6 to -5.2)", "[-5.2 to -4.8)", "[-4.8 to -4.4)", "[-4.4 to -4.0)",
                  "[-4.0 to -3.6)", "[-3.6 to -3.2)", "[-3.2 to -2.8)", "[-2.8 to -2.4)", "[-2.4 to -2.0)",
                  "[-2.0 to -1.6)", "[-1.6 to -1.2)", "[-1.2 to -0.8)", "[-0.8 to -0.4)", "[-0.4 to 0.0)" ],
      "data": [ "1", " ", "0", " ", "0",
                " ", "0", " ", "1", " ",
                "0", " ", "0", " ", "0",
                " ", "0", " ", "0", " ",
                "0", " ", "0", " ", "0",
                " ", "0", " ", "0", " ",
                "0", " ", "0", " ", "0",
                " ", "0", " ", "0", " ",
                "0", " ", "0", " ", "0",
                " ", "0", " ", "0" ],
    "title": "420_PDS_Turbo_PlaceOpt"
   } ]; 

  return msfBarChartData;

}]);   

/*
DAWNControllers.directive('datepicker', function() {
  return {
    require: 'ngModel',
    link: function(scope, el, attr, ngModel) {
      $(el).datepicker({
        onSelect: function(dateText) {
          scope.$apply(function() {
            ngModel.$setViewValue(dateText);
          });
        }
      });
    }
  };
});
*/


DAWNControllers.controller('mainCtrl_MSF', ['$rootScope', '$scope', '$modalInstance', 'MSFDataService', 'MSFBarChartService', 
function ($rootScope, $scope, $modalInstance, MSFDataService, MSFBarChartService) {
  console.log("(D) Started up mainLandingCtrl controller for MSF");
  //$scope.appTitle = "MSF Status";
  $scope.MSFData = MSFDataService;
  $scope.viewChosen = $rootScope.msfViewChosen;
  $scope.designChosen = $rootScope.msfDesignChosen;
  $scope.roleChosen = $rootScope.msfRoleChosen;

  if ($rootScope.msfViewChosen != "") $scope.currView = $rootScope.msfViewChosen;
  else $scope.currView = "";

  if ($rootScope.msfDesignChosen != "") $scope.currView = $rootScope.msfDesignChosen;
  else $scope.currDesign = "";

  if ($rootScope.msfRoleChosen != "") $scope.currRole = $rootScope.msfRoleChosen;
  else $scope.currRole = "";

  $scope.initDesign = function() {
    $scope.designChosen = $rootScope.msfDesignChosen;
  }

  $scope.initRole = function() {
    $scope.roleChosen = $rootScope.msfRoleChosen;
  }

  $scope.initView = function() {
    $scope.viewChosen = $rootScope.msfViewChosen;
  }


  $scope.changeApp = function($location, $window) {
    $rootScope.msfViewChosen = $scope.viewChosen;
    $modalInstance.close();
    console.log("(D) In changeApp: currView = " + $rootScope.msfViewChosen);
    if ($scope.viewChosen == "Scorecard") {
      window.location = "/#/msf/scorecard";
    } else if ($scope.viewChosen == "Takedown") {
      window.location = "/#/msf/takedown";
    } else if ($scope.viewChosen == "Progress") {
      window.location = "/#/msf/progress";
    } else if ($scope.viewChosen == "Activity") {
      window.location = "/#/msf/activity";
    } else {
      window.location = "/#/msf";
    }                                      
  }
  $scope.changeDesign = function() {
    $rootScope.msfDesignChosen = $scope.designChosen;
  }
  $scope.changeRole = function() {
    $rootScope.msfRoleChosen = $scope.roleChosen;
  }  
}]);
 
DAWNControllers.controller('designRoleViewPanelCtrl', ['$rootScope', '$scope', 'MSFDataService', function ($rootScope, $scope, MSFDataService) {

  console.log("(D) Inside designRoleViewPanelCtrl controller for MSF");
  this.MSFData = MSFDataService;
  console.log("(D) currView = " + $rootScope.msfViewChosen);
  console.log("(D) currDesign = " + $rootScope.msfDesignChosen);
  console.log("(D) currRole = " + $rootScope.msfRoleChosen);

  this.initDesign = function() {
    this.designChosen = $rootScope.msfDesignChosen;
    console.log("(D) initDesign() currDesign = " + this.designChosen);
  }

  this.initRole = function() {
    this.roleChosen = $rootScope.msfRoleChosen;
    console.log("(D) initRole() currRole = " + this.roleChosen);
  }

  this.initView = function() {
    this.viewChosen = $rootScope.msfViewChosen;
    console.log("(D) initView() currView = " + this.viewChosen);
  }   

  this.changeApp = function($location, $window) {
    $rootScope.msfViewChosen = this.viewChosen;
    $scope.viewChosen = this.viewChosen;
    console.log("(D) In changeApp: currView = " + $rootScope.msfViewChosen);
    if ($scope.viewChosen == "Scorecard") {
      window.location = "/#/msf/scorecard";
    } else if ($scope.viewChosen == "Takedown") {
      window.location = "/#/msf/takedown";
    } else if ($scope.viewChosen == "Progress") {
      window.location = "/#/msf/progress";
    } else if ($scope.viewChosen == "Activity") {
      window.location = "/#/msf/activity";
    } else {
      window.location = "/#/msf";
    }                                      
  }   

  this.changeDesign = function() {
    $rootScope.msfDesignChosen = this.designChosen;
    $scope.designChosen = this.designChosen;
  }

  this.changeRole = function() {
    $rootScope.msfRoleChosen = this.roleChosen;
    $scope.roleChosen = this.roleChosen;
  }
                                                
}]);

DAWNControllers.controller('msf_scorecard', ['$rootScope', '$scope', '$http', 'MSFDataService', 'MSFBarChartService', 'MSFBarChartServiceChoose', 
function ($rootScope, $scope, $http, MSFDataService, MSFBarChartService, MSFBarChartServiceChoose) {

  console.log("(D) Started up msf_scorecard controller for MSF");
  $scope.appTitle = "MSF Status: Scorecard";

  if ($rootScope.msfViewChosen != "") $scope.currView = $rootScope.msfViewChosen;
  else $scope.currView = "";

  if ($rootScope.msfDesignChosen != "") $scope.currView = $rootScope.msfDesignChosen;
  else $scope.currDesign = "";

  if ($rootScope.msfRoleChosen != "") $scope.currRole = $rootScope.msfRoleChosen;
  else $scope.currRole = "";

  $scope.jsonData = [];
  $scope.plotData = [];
  $rootScope.plotData = [];
  $scope.plotData = $rootScope.plotData;
  
  console.log("(D): Calling getJSONData...");
  getJSONData();

  $scope.MSFData = MSFDataService;
  console.log("(D) currView = " + $rootScope.msfViewChosen);
  console.log("(D) currDesign = " + $rootScope.msfDesignChosen);
  console.log("(D) currRole = " + $rootScope.msfRoleChosen);

  $scope.MSFBarChartData = MSFBarChartService;
  $scope.MSFBarChartDataChoose = MSFBarChartServiceChoose;

  $scope.titleChosen = "Choose title";
  $scope.changeChart = function(title) {
    $scope.titleChosen = title;
    console.log("(D) changeChart() titleChosen = " + $scope.titleChosen);
  };

  $scope.initDesign = function() {
    $scope.designChosen = $rootScope.msfDesignChosen;
    console.log("(D) initDesign() currDesign = " + $scope.designChosen);
  };

  $scope.initRole = function() {
    $scope.roleChosen = $rootScope.msfRoleChosen;
    console.log("(D) initRole() currRole = " + $scope.roleChosen);
  };

  $scope.initView = function() {
    $scope.viewChosen = $rootScope.msfViewChosen;
    console.log("(D) initView() currView = " + $scope.viewChosen);
  };   

  $scope.changeApp = function($location, $window) {
    $rootScope.msfViewChosen = $scope.viewChosen;
    console.log("(D) In changeApp: currView = " + $rootScope.msfViewChosen);
    if ($scope.viewChosen == "Scorecard") {
      window.location = "/#/msf/scorecard";
    } else if ($scope.viewChosen == "Takedown") {
      window.location = "/#/msf/takedown";
    } else if ($scope.viewChosen == "Progress") {
      window.location = "/#/msf/progress";
    } else if ($scope.viewChosen == "Activity") {
      window.location = "/#/msf/activity";
    } else {
      window.location = "/#/msf";
    }                                      
  };   

  $scope.changeDesign = function() {
    $rootScope.msfDesignChosen = $scope.designChosen;
  };

  $scope.changeRole = function() {
    $rootScope.msfRoleChosen = $scope.roleChosen;
  };
           
  //$('#datepicker').datepicker();

  $scope.getDate = function() {
    $rootScope.msfDateSelected = $scope.dt;
  };

 $scope.chart_options = {
     //element: 'area-example',
     data: [
      { y: '1.1.', a: 100, b: 90 },
      { y: '2.1.', a: 75,  b: 65 },
      { y: '3.1.', a: 50,  b: 40 },
      { y: '4.1.', a: 75,  b: 65 },
      { y: '5.1.', a: 50,  b: 40 },
      { y: '6.1.', a: 75,  b: 65 },
      { y: '7.1.', a: 100, b: 90 }
     ],
     xkey: 'y',
     ykeys: ['a', 'b'],
     labels: ['Series A', 'Series B'],
     colors: ['#31C0BE', '#c7254e']
  };

  $scope.msfSlackHistoOptions = {
            chart: {
                type: 'discreteBarChart',
                height: 650,
                margin : {
                    top: 20,
                    right: 50,
                    bottom: 120,
                    left: 55
                },
                x: function(d){return d.range;},
                y: function(d){return d.count;},
                showValues: true,
                valueFormat: function(d){
                    return d3.format('d')(d);
                },
                duration: 500,
                xAxis: {
                    axisLabel: 'Slack Bins',
                    rotateLabels: "45",
                    tickFormat: function(d) { return d3.requote(d);}
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

  // Example data
  $scope.multiBarChartData = [{
    "key": "Series 1",
    "values": [
      [0, 10],
      [1, 20],
      [2, 30],
      [3, 40],
      [4, 50]
    ]
  }, {
    "key": "Series 2",
    "values": [
      [0, 10],
      [1, 40],
      [2, 60],
      [3, 20],
      [4, 40]
    ]
  }];

  $scope.msfMultiBarChartOptions = {
          chart: {
            type: "multiBarChart",
            height: 450,
            margin: {
              top: 20,
              right: 20,
              bottom: 45,
              left: 45
            },
            clipEdge: true,
            duration: 500,
            stacked: true,
            xAxis: {
              axisLabel: "Time (ms)",
              showMaxMin: false
            },
            yAxis: {
              axisLabel: "Y Axis",
              axisLabelDistance: -20
            }
          }
        };

  $scope.outputPlotData = function() {
      console.log("(D): plotData...length = " + $scope.plotData.length);
      console.log($scope.plotData);
      var outputPlotData = $scope.plotData[0];
      for (i = 0; i < outputPlotData.values.length; i++) {
          console.log("(D): i = " + i + " range = " + outputPlotData.values[i].range + " count = " + outputPlotData.values[i].count);
          console.log(outputPlotData.values[i]);
      }
  };

  $scope.switchPlot = function() {
      console.log("(D): Switching plot....key chosen = " + $scope.keyChosen);
      var found = false;
      var i = 0, j = 0;
      for (i = 0; i < $scope.jsonData.length && !found; i++) {
          if ($scope.jsonData[i].key == $scope.keyChosen) {
              found = true;
              var obj = $scope.jsonData[i];
              $scope.plotData = [];
              $scope.plotData.push(obj);
              console.log("(D): Key = " + $scope.plotData[0].key);
              for (j = 0; j < obj.values.length; j++) {
                  console.log("(D): j = " + j + " range = " + obj.values[j].range + " count = " + obj.values[j].count);
              }
              console.log($scope.plotData);
          }
      }
      if (found == true) {
        //$scope.api.refresh();
      }
  };

  function getJSONData() {
      console.log("(D):  Scorecard...getJSONData");
  	  $http.get('DB/scorecard').success(function(data) {
  	      console.log("(D):  getJSONData...successful");
          console.log(data); 
          $scope.jsonData = data;
          var obj = $scope.jsonData[0];
          $scope.plotData = [];
          $scope.plotData.push(obj);
          $scope.keyChosen = obj.key;
          
          for (i = 0; i < obj.values.length; i++) {
              var obj2 = obj.values[i];
              console.log("(D): i = " + i + " range = " + obj2.range + " count = " + obj2.count);
              //$scope.plotData.push(obj2);
              //console.log($scope.plotData[i]);
          }
          
          $rootScope.plotData = $scope.plotData;
          console.log("(D): plotData length = " + $rootScope.plotData.length);
          console.log($rootScope.plotData);
	  })
	  .error(function(data, status) {
	  	console.log("(E) getJSONData:  Failed!");
	  });          
  }    
}]);

DAWNControllers.controller('msf_takedown', ['$rootScope', '$scope', '$http', 'MSFDataService', 'MSFBarChartService', 
function ($rootScope, $scope, $http,  MSFDataService, MSFBarChartService) {

  console.log("(D) Started up msf_takedown controller for MSF");
  $scope.appTitle = "MSF Status: Takedown";

  if ($rootScope.msfViewChosen != "") $scope.currView = $rootScope.msfViewChosen;
  else $scope.currView = "";

  if ($rootScope.msfDesignChosen != "") $scope.currView = $rootScope.msfDesignChosen;
  else $scope.currDesign = "";

  if ($rootScope.msfRoleChosen != "") $scope.currRole = $rootScope.msfRoleChosen;
  else $scope.currRole = "";

  $scope.MSFData = MSFDataService;
  console.log("(D) currView = " + $rootScope.msfViewChosen);
  console.log("(D) currDesign = " + $rootScope.msfDesignChosen);
  console.log("(D) currRole = " + $rootScope.msfRoleChosen);

  $scope.jsonData = [];
  $scope.plotData = [];
  $rootScope.takedownPlotData = [];
  $scope.plotData = $rootScope.takedownPlotData;
  
  console.log("(D): Calling getJSONData...");
  getJSONData();

  $scope.MSFBarChartData = MSFBarChartService;

  $scope.initDesign = function() {
    $scope.designChosen = $rootScope.msfDesignChosen;
    console.log("(D) initDesign() currDesign = " + $scope.designChosen);
  }

  $scope.initRole = function() {
    $scope.roleChosen = $rootScope.msfRoleChosen;
    console.log("(D) initRole() currRole = " + $scope.roleChosen);
  }

  $scope.initView = function() {
    $scope.viewChosen = $rootScope.msfViewChosen;
    console.log("(D) initView() currView = " + $scope.viewChosen);
  }   

  $scope.changeApp = function($location, $window) {
    $rootScope.msfViewChosen = $scope.viewChosen;
    console.log("(D) In changeApp: currView = " + $rootScope.msfViewChosen);
    if ($scope.viewChosen == "Scorecard") {
      window.location = "/#/msf/scorecard";
    } else if ($scope.viewChosen == "Takedown") {
      window.location = "/#/msf/takedown";
    } else if ($scope.viewChosen == "Progress") {
      window.location = "/#/msf/progress";
    } else if ($scope.viewChosen == "Activity") {
      window.location = "/#/msf/activity";
    } else {
      window.location = "/#/msf";
    }                                      
  }   

  $scope.changeDesign = function() {
    $rootScope.msfDesignChosen = $scope.designChosen;
  }

  $scope.changeRole = function() {
    $rootScope.msfRoleChosen = $scope.roleChosen;
  }                                

  $scope.msfSlackHistoOptions = {
            chart: {
                type: 'discreteBarChart',
                height: 650,
                margin : {
                    top: 20,
                    right: 50,
                    bottom: 120,
                    left: 55
                },
                x: function(d){return d.range;},
                y: function(d){return d.count;},
                showValues: true,
                valueFormat: function(d){
                    return d3.format('d')(d);
                },
                duration: 500,
                xAxis: {
                    axisLabel: 'Slack Bins',
                    rotateLabels: "45",
                    tickFormat: function(d) { return d3.requote(d);}
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

  $scope.switchPlot = function() {
      console.log("(D): Switching plot....key chosen = " + $scope.keyChosen);
      var found = false;
      var i = 0, j = 0;
      for (i = 0; i < $scope.jsonData.length && !found; i++) {
          if ($scope.jsonData[i].key == $scope.keyChosen) {
              found = true;
              var obj = $scope.jsonData[i];
              $scope.plotData = [];
              $scope.plotData.push(obj);
              console.log("(D): Key = " + $scope.plotData[0].key);
              for (j = 0; j < obj.values.length; j++) {
                  console.log("(D): j = " + j + " range = " + obj.values[j].range + " count = " + obj.values[j].count);
              }
              console.log($scope.plotData);
          }
      }
      if (found == true) {
        //$scope.api.refresh();
      }
  };


  function getJSONData() {
      console.log("(D):  Takedown...getJSONData");
  	  $http.get('DB/scorecard').success(function(data) {
  	      console.log("(D):  getJSONData...successful");
          console.log(data); 
          $scope.jsonData = data;
          var obj = $scope.jsonData[0];
          $scope.plotData = [];
          $scope.plotData.push(obj);
          $scope.keyChosen = obj.key;
          
          for (i = 0; i < obj.values.length; i++) {
              var obj2 = obj.values[i];
              console.log("(D): i = " + i + " range = " + obj2.range + " count = " + obj2.count);
              //$scope.plotData.push(obj2);
              //console.log($scope.plotData[i]);
          }
          
          $rootScope.takedownPlotData = $scope.plotData;
          console.log("(D): plotData length = " + $rootScope.takedownPlotData.length);
          console.log($rootScope.takedownPlotData);
	  })
	  .error(function(data, status) {
	  	console.log("(E) getJSONData:  Failed!");
	  });          
  }    
}]); 

DAWNControllers.controller('msf_progress', ['$rootScope', '$scope', 'MSFDataService', 'MSFBarChartService', 
function ($rootScope, $scope, MSFDataService, MSFBarChartService) {

  console.log("(D) Started up msf_progress controller for MSF");
  $scope.appTitle = "MSF Status: Progress";

  if ($rootScope.msfViewChosen != "") $scope.currView = $rootScope.msfViewChosen;
  else $scope.currView = "";

  if ($rootScope.msfDesignChosen != "") $scope.currView = $rootScope.msfDesignChosen;
  else $scope.currDesign = "";

  if ($rootScope.msfRoleChosen != "") $scope.currRole = $rootScope.msfRoleChosen;
  else $scope.currRole = "";

  $scope.MSFData = MSFDataService;
  console.log("(D) currView = " + $rootScope.msfViewChosen);
  console.log("(D) currDesign = " + $rootScope.msfDesignChosen);
  console.log("(D) currRole = " + $rootScope.msfRoleChosen);

  $scope.MSFBarChartData = MSFBarChartService;

  $scope.initDesign = function() {
    $scope.designChosen = $rootScope.msfDesignChosen;
    console.log("(D) initDesign() currDesign = " + $scope.designChosen);
  }

  $scope.initRole = function() {
    $scope.roleChosen = $rootScope.msfRoleChosen;
    console.log("(D) initRole() currRole = " + $scope.roleChosen);
  }

  $scope.initView = function() {
    $scope.viewChosen = $rootScope.msfViewChosen;
    console.log("(D) initView() currView = " + $scope.viewChosen);
  }   

  $scope.changeApp = function($location, $window) {
    $rootScope.msfViewChosen = $scope.viewChosen;
    console.log("(D) In changeApp: currView = " + $rootScope.msfViewChosen);
    if ($scope.viewChosen == "Scorecard") {
      window.location = "/#/msf/scorecard";
    } else if ($scope.viewChosen == "Takedown") {
      window.location = "/#/msf/takedown";
    } else if ($scope.viewChosen == "Progress") {
      window.location = "/#/msf/progress";
    } else if ($scope.viewChosen == "Activity") {
      window.location = "/#/msf/activity";
    } else {
      window.location = "/#/msf";
    }                                      
  }   

  $scope.changeDesign = function() {
    $rootScope.msfDesignChosen = $scope.designChosen;
  }

  $scope.changeRole = function() {
    $rootScope.msfRoleChosen = $scope.roleChosen;
  }    
}]); 

DAWNControllers.controller('msf_activity', ['$rootScope', '$scope', 'MSFDataService', 'MSFBarChartService', 
function ($rootScope, $scope, MSFDataService, MSFBarChartService) {

  console.log("(D) Started up msf_activity controller for MSF");
  $scope.appTitle = "MSF Status: Activity";

  if ($rootScope.msfViewChosen != "") $scope.currView = $rootScope.msfViewChosen;
  else $scope.currView = "";

  if ($rootScope.msfDesignChosen != "") $scope.currView = $rootScope.msfDesignChosen;
  else $scope.currDesign = "";

  if ($rootScope.msfRoleChosen != "") $scope.currRole = $rootScope.msfRoleChosen;
  else $scope.currRole = "";

  $scope.MSFData = MSFDataService;
  console.log("(D) currView = " + $rootScope.msfViewChosen);
  console.log("(D) currDesign = " + $rootScope.msfDesignChosen);
  console.log("(D) currRole = " + $rootScope.msfRoleChosen);

  $scope.MSFBarChartData = MSFBarChartService;

  $scope.initDesign = function() {
    $scope.designChosen = $rootScope.msfDesignChosen;
    console.log("(D) initDesign() currDesign = " + $scope.designChosen);
  }

  $scope.initRole = function() {
    $scope.roleChosen = $rootScope.msfRoleChosen;
    console.log("(D) initRole() currRole = " + $scope.roleChosen);
  }

  $scope.initView = function() {
    $scope.viewChosen = $rootScope.msfViewChosen;
    console.log("(D) initView() currView = " + $scope.viewChosen);
  }   

  $scope.changeApp = function($location, $window) {
    $rootScope.msfViewChosen = $scope.viewChosen;
    console.log("(D) In changeApp: currView = " + $rootScope.msfViewChosen);
    if ($scope.viewChosen == "Scorecard") {
      window.location = "/#/msf/scorecard";
    } else if ($scope.viewChosen == "Takedown") {
      window.location = "/#/msf/takedown";
    } else if ($scope.viewChosen == "Progress") {
      window.location = "/#/msf/progress";
    } else if ($scope.viewChosen == "Activity") {
      window.location = "/#/msf/activity";
    } else {
      window.location = "/#/msf";
    }                                      
  }   

  $scope.changeDesign = function() {
    $rootScope.msfDesignChosen = $scope.designChosen;
  }

  $scope.changeRole = function() {
    $rootScope.msfRoleChosen = $scope.roleChosen;
  }   
}]); 

DAWNControllers.controller('dropDownMenu',['$scope', function ($scope) {
  console.log("(D) Started up drop down menu control for MSF");
  $scope.viewChosen = data.viewSelect;
}]);
       

DAWNControllers.controller('mainCtrl_MSF_OLD', function ($scope, $http, uiGridConstants, $modal, startupSettingsService) {

	console.log("(D) Main Ctrl for MSF is called");
	$scope.selectedRun = startupSettingsService.getRunId();

	/** This loads the app from applications.json */
	$scope.appTitle = "MSF Status";
    queryPaths();

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
			queryPathDetails(row);
			$scope.open('lg');
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
				queryEndPointDetails(rowItem, event);
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
			queryEndPointDetails(row);
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
	function queryPaths() {
		console.log("(D):  stlist called. "+$scope.selectedRun);
		$http.get('DB/paths?runId='+$scope.selectedRun).success(function(data) {
			$scope.pathList = data;
		})
		.error(function(data, status) {
			console.log("(E) mainCtrl_TA:  Error. Could not query DB.");
		});
	}

  	//  TODO:  Stick this function (and other helpers) in a different place. Probably
	function queryPathDetails(rowItem) {
      console.log("(D):  path query.  rowItem=" + rowItem.entity);
      if (rowItem.entity && rowItem.entity.PATH_KEY)
         var selItems = rowItem.entity.PATH_KEY;
      else
         var selItems = "";
	  console.log("(D):  pdlist called. path_key=" + selItems);
	  $http.get('DB/path_details?runId='+$scope.selectedRun+'&pathKey='+selItems).success(function(data) {
         console.log("(D):  successfully queried DB for sinks.");
         $scope.pathDetails = data;
		 console.log($scope.pathDetails);
		})
		.error(function(data, status) {
			console.log("(E) mainCtrl_MSF:  Error. Could not query DB.");
	    });
      console.log("(D):  exiting queryPathDetails()");
	}

  	//  TODO:  Stick this function (and other helpers) in a different place. Probably
 	function queryEndPointDetails(rowItem) {
      console.log("(D):  endPointDetails query.  rowItem=" + rowItem.entity);
      if (rowItem.entity && rowItem.entity.PATH_KEY && rowItem.entity.PIN_NAME && rowItem.entity.ROW_NUM) {
         var selItems = rowItem.entity.PATH_KEY;
         var selItems2 = rowItem.entity.PIN_NAME;
         var selItems3 = rowItem.entity.ROW_NUM;
      } else  {
         var selItems = "";
         var selItems2 = "";
         var selItems3 = "";
      }
	  console.log("(D):  qvlist called. sink=" + selItems);
	  $http.get('DB/endpoint?pathKey='+selItems+'&pinName='+selItems2+'&rowNum='+selItems3).success(function(data) {
        console.log("(D):  successfully queried DB for endpoint.");
        $scope.endPointDetails = data; 
	    console.log($scope.endPointDetails);
	  })
	  .error(function(data, status) {
	  	console.log("(E) mainCtrl_MSF:  Error. Could not query DB.");
	  });
      
      console.log("(D):  exiting queryEndPointDetails()");
	}        
           
});

