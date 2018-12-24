/** this controller handles the top bar*/
DAWNControllers.controller('topCtrl', function($scope, $http){
	console.log("(D) topCtrl was called");
	$scope.goHome = function(){
		window.location = "/#/main";
		window.location.reload(); //This a hack to prevent a ui-grid rendering issue. Take this line out at your own peril. 
	}
}).controller('userDropDownCtrl', function($scope, $log) {
    $scope.items = [
        'This is the first thingy!',
        'this is a second thingy',
        'this is a third thingy'
    ];
    
    $scope.status = {
        isopen: false
    };
    
    $scope.toggled = function(open) {
        $log.log('Dropdown is now: ', open);
    };
    
    $scope.toggleDropDown = function($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.status.isopen = !$scope.status.isopen;
    };
}).controller('userSettingsCtrl', function($scope, $log) {
    $scope.items = [
        
    ];
    
    $scope.status = {
        isopen: false
    };
    
    $scope.toggleDropDown = function($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.status.isopen = !$scope.status.isopen;
    }
});