/* Update History: Please add a description of your update to this file here
09/29/15    aparasur    Initial
12/14/15    bsahoo      Added a function for handle Window Resize and put selectedMemoryDesign to the last parameter of memory and walltime
01/07/16    bsahoo      Added the $interval and this will call resize after modal finishes opening - usually only necessary on a bootstrap modal
01/18/16    bsahoo      Changed the functionality of drop down menu Tool,Release and Year.
01/21/16    bsahoo      2016 is added to years scope and gna is added to tools.
02/26/16    bsahoo      Added the loading busy icon for memory & walltime gird,print a warning message when tools don't 
have data.
*/

DAWNControllers
.controller('bbCtrl', function ($scope, $http,  $timeout, $interval, uiGridConstants, startupSettingsService) {
  console.log("Entering BB controller");
   

  //global variables
  $scope.selectedRun = startupSettingsService.getRunId();
  
  $scope.appTitle = "Big Brother";
  $scope.selectedTool = ''; 
  $scope.selectedRelease = '';
  $scope.selectedYear = '';
  $scope.selectedMemoryDesign = '';
  $scope.selectedWalltimeDesign = '';
  $scope.results= "";
  $scope.isResultGrid = false;
  //$scope.isResultMemoryChart = false;
  //$scope.isResultWalltimeChart = false;
  $scope.memoryList = '';
  $scope.walltimeList = '';
  $scope.memoryChartList = '';
  $scope.walltimeChartList = '';

  
  //oct 17

  $scope.tools = [
  '6thsense',
  'abc',
  'alps',
  'bdd',
  'bdz',
  'bonnLLG',
  'bonnRoute',
  'chipbench',
  'chipedit',
  'chiprelease',
  'cmoschks',
  'console',
  'cre',
  'dadb',
  'dft',
  'einsnoise',
  'einstimer',
  'ezafs',
  'finale',
  'gna',
  'gna_flatten',
  'gna_meth_stats',
  'ics',
  'lefToOa',
  'lsf',
  'lts',
  'mar2_2243',
  'mdiff',
  'methStats',
  'modelutil',
  'morph',
  'oa',
  'oab',
  'pds',
  'pme',
  'portals',
  'theguide',
  'tli',
  'validate_assertions',
  'verity',
  'vimfetch',
  'wiz',
  'wizdadb',
  'writehdl'
  ];
  $scope.selectTool ='Select Tool';
  $scope.releases = [
  '14.1'
  ];
  $scope.selectRelease ='Select Release';
  $scope.years = [
  '2015',
  '2016'
  ];
  $scope.selectYear ='Select Year';

  $scope.setMenuSelection = function($event, menutype, menuValue) {
   if(menutype == "Tool")
     {
      $scope.selectedTool = menuValue;
      $scope.selectTool = menuValue;
     }
    if(menutype == "Release")
     {
      $scope.selectedRelease = menuValue;
      $scope.selectRelease=menuValue;
     } 
    if(menutype == "Year") 
     {
      $scope.selectedYear = menuValue;
      $scope.selectYear=menuValue;
     } 
    $event.preventDefault();
    $event.stopPropagation();
  }  
   

  //triggers grid content creation/updation on menu change
  $scope.$watchCollection('[selectedTool, selectedRelease, selectedYear, results]', function(newValues){
    console.log('*** Watched has been fired. ***');
    console.log('New Planets :', newValues[0], newValues[1], newValues[2], newValues[3]);
    if (newValues[3]!=null) {
      if(newValues[0] != "" && newValues[1] !="" && newValues[2]!="") {
        $scope.results= newValues[0] + ":" + newValues[1] + ":" + newValues[2];
        queryWalltimeList();
        queryMemoryList();
        $scope.isResultGrid = true;
        console.log('results :', $scope.results, $scope.isResultGrid);
      }
    }
  });



  //Begins: DB call and grid manipulation for memory versus design
 // queryMemoryList();
    $scope.$watch('memoryList',
     function(newVal, oldVal) {
     console.log('One of the images have changed : ' + oldVal + ' : '+ newVal);
     }
    ); 


 $scope.memoryGrid = { 
  data: 'memoryList',
  columnDefs: [
  {field: 'name', displayName: 'Design', width: "50%"},
  {field: 'memory', displayName: 'Memory (in GB)', width: "50%"}
  ],

  //enableRowHeaderSelection: false, 
    enableFiltering: true,
    multiSelect: false,
    enableGridMenu: true,
    enableRowHeaderSelection: false, 
    enableSorting: true,
    enableColumnResizing: true

};



$scope.memoryGrid.onRegisterApi = function(gridApi){
      
      //set gridApi on scope
      $scope.gridApi = gridApi;
      $scope.gridApi.selection.selectAllRows( $scope.gridApi.grid);
      $scope.gridApi.selection.on.rowSelectionChanged($scope,function(row){
      console.log('row selected ' + row.entity.name);
      $scope.selectedMemoryDesign = row.entity.name;
      queryMemoryChartList();
      //$scope.isResultMemoryChart = true;

      });   
          
          //call resize after modal finishes opening - usually only necessary on a bootstrap modal
            $interval( function() {
            $scope.gridApi = gridApi;
            $scope.gridApi.core.handleWindowResize();
            }, 1000, 500);
          
    };  
  // Accessing the Angular $http Service to get data via REST Communication from Node Server
  function queryMemoryList() {
    console.log("Querying design versus memory for "  + $scope.selectedTool + $scope.selectedRelease + $scope.selectedYear);
    var url_design_memory = 'db/memory?'
    +'userSelection='+$scope.selectedTool.toLowerCase()
    + "_"
    + $scope.selectedRelease
    + "_memory" + "_" 
    + $scope.selectedYear; // URL where the Node.js server is running 
    
    console.log("Querying design versus memory");

    $scope.isDataMemory=true;
    $scope.dataLoadedMemory=false;
    $scope.noDataGirdMemory="";
    $http.get(url_design_memory).success(function(data) {

         if(data.length <= 0 && data != undefined) {
             $scope.noDataGirdMemory="Data is not Available";
             console.log("Data is not Available for memory");
             $scope.isDataMemory=false;
            }
          $scope.memoryList = data; 
          $scope.dataLoadedMemory=true;

          //$scope.memoryGrid.data = data;
           return true;
            
      })
          .error(function(data, status) {
          console.log("Error from controller. Could not query DB.");
          return false;
      })  
         .then(function() {
        $scope.gridApi.core.handleWindowResize();
      });
      
      
    }
  //Ends: DB call and grid manipulation for memory versus design

 //Begins: DB call and grid manipulation for walltime versus design
 // queryWalltimeList();
 $scope.$watch('walltimeList',
     function(newVal, oldVal) {
     console.log('One of the images have changed : ' + oldVal + ' : '+ newVal);
     }
    ); 

 $scope.walltimeGrid = { 
  data: 'walltimeList',
  columnDefs: [
  {field: 'name', displayName: 'Design', width: "50%"},
  {field: 'walltime', displayName: 'Walltime', width: "50%"}
  ],
    //enableRowHeaderSelection: false, 
    enableFiltering: true,
    multiSelect: false,
    enableGridMenu: true,
    enableRowHeaderSelection: false, 
    enableSorting: true,
    enableColumnResizing: true

  };
  $scope.walltimeGrid.onRegisterApi = function(gridApi){
      //set gridApi on scope
      $scope.gridApi = gridApi;    
      $scope.gridApi.selection.selectAllRows( $scope.gridApi.grid );
      $scope.gridApi.selection.on.rowSelectionChanged($scope,function(row){
      console.log('row selected ' + row.entity.name);
      $scope.selectedWalltimeDesign = row.entity.name;
      queryWaltimeChartList();  
      //$scope.isResultWalltimeChart = true;
        
      });
          //call resize after modal finishes opening - usually only necessary on a bootstrap modal
          $interval( function() {
          $scope.gridApi = gridApi;
          $scope.gridApi.core.handleWindowResize();
            }, 100, 500);
          
    };  

  // Accessing the Angular $http Service to get data via REST Communication from Node Server
  function queryWalltimeList() {
    var url_design_walltime = 'db/walltime?'
    +'userSelection='+$scope.selectedTool.toLowerCase()
    + "_"
    + $scope.selectedRelease
    + "_walltime" + "_" 
    + $scope.selectedYear; // URL where the Node.js server is running 

    console.log("Querying design versus walltime");

    $scope.isDataWalltime=true;
    $scope.dataLoadedWalltime=false;
    $scope.noDataGirdWalltime="";
    $http.get(url_design_walltime).success(function(data) {

      if(data.length <= 0 && data != undefined) {
             $scope.noDataGirdWalltime="Data is not Available";
             console.log("Data is not Available for walltime");
             $scope.isDataWalltime=false;
            }
      $scope.walltimeList = data;
      $scope.dataLoadedWalltime=true;
      return true;

    })
    .error(function(data, status) {
      console.log("Error from controller:queryWalltimeList(). Could not query DB.");
      return false;
    })
        .then(function() {
        $scope.gridApi.core.handleWindowResize();
      });
  }

  //Ends: DB call and grid manipulation for memory versus design

 //Begins: DB call and grid manipulation for memory avg, max, min per design
function queryMemoryChartList() {
  console.log("Querying memory avg, max, min per design");
 var url_design_memory_chart = 'db/memorychart?'
  +'userSelection='+$scope.selectedTool.toLowerCase()
  + "_"
  + $scope.selectedRelease
  + "_" 
  + $scope.selectedYear
  + "*"
  + $scope.selectedMemoryDesign; // URL where the Node.js server is running 
  
      
  console.log("calling " + url_design_memory_chart);

    $scope.isResultMemoryChart = false;
    $scope.dataLoadedMemoryChart=true;
    $http.get(url_design_memory_chart).success(function(data) {
        
        $scope.memoryChartList = data;
        $scope.dataLoadedMemoryChart=false;
        $scope.isResultMemoryChart = true;
       
        console.log("Run controller:queryMemoryChartList()...");

      })
      .error(function(data, status) {
        console.log("Error from controller:queryMemoryChartList(). Could not query DB.");
      });
      
    } 

 var memoryChartBull =    Morris.Line({
      element: "memoryChartBull",
      data: datareload(),
      xkey: 'y',
      ykeys: ['a', 'b', 'c'],
      labels: ['Maximum', 'Average', 'Minimum']
    });

function datareload(){
  return $scope.memoryChartList;
}
var nReloads = 0;
function update() {
  nReloads++;
  memoryChartBull.setData(datareload());
  //$('#reloadStatus').text(nReloads + ' reloads');
}
 setInterval(update, 50);
//Ends: DB call and grid manipulation for memory avg, max, min per design

 //Begins: DB call and grid manipulation for walltime avg, max, min per design
 function queryWaltimeChartList() {
    console.log("Querying walltime avg, max, min per design");
    var url_design_walltime_chart = 'db/walltimechart?'
    +'userSelection='+$scope.selectedTool.toLowerCase()
    + "_"
    + $scope.selectedRelease
    + "_" 
    + $scope.selectedYear
    + "*" 
    + $scope.selectedWalltimeDesign; // URL where the Node.js server is running 
    

    console.log("calling " + url_design_walltime_chart);


    $scope.isResultWalltimeChart = false;
    $scope.dataLoadedWalltimeChart=true;
    $http.get(url_design_walltime_chart).success(function(data) {

         $scope.walltimeChartList = data;
         $scope.dataLoadedWalltimeChart=false;
         $scope.isResultWalltimeChart = true;
        
         console.log("Run controller:queryWaltimeChartList()...");
      
      })
      .error(function(data, status) {
        console.log("Error from controller:queryWaltimeChartList(). Could not query DB.");
      });
    }

  
var walltimeChartBull =    Morris.Line({
      element: "walltimeChartBull",
      data: walltimeChartreload(),
      xkey: 'y',
      ykeys: ['a', 'b', 'c'],
      labels: ['Maximum', 'Average', 'Minimum']
    });

function walltimeChartreload(){
  return $scope.walltimeChartList;
}
var nReloads = 0;
function updateWalltime() {
  nReloads++;
  walltimeChartBull.setData(walltimeChartreload());
}
setInterval(updateWalltime, 50);
 //Ends: DB call and grid manipulation for walltime avg, max, min per design
    

}); /*final controller braces*/


