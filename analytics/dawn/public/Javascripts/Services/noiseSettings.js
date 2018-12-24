Router.factory('startupSettingsService', function() {
  var settings = [
		{runId: 0}
  ];
  
  return {
    setRunId: function(id) {
        settings.runId = id;
    },
    getRunId: function() {
        return settings.runId;
    },
	setAppTitle: function(title){
		settings.appTitle = title;
	},
	getAppTitle: function(){
		return settings.appTitle;
	}
  };
});