/**
  Module: DawnAuthenticator.js
  Description:
     Provides functionality to authenticate one or more email ids against
     a list of qualifying bluegroups.  This class provides a javascript API
     to talk to the bluegroups database. Internally it uses Bluegroups XML API
     https://w3-03.sso.ibm.com/FIM/sps/auth?FedName=IBM_W3_SAML20_INTERNAL&FedId=uuid3cfe4e97-0139-183a-bdf6-a016685ce30d

     Typical usage:
        var checker = new DawnAuthenticator();
        var email = 'foo@in.ibm.com'
        checker.validate(email, getStatus);

    where, getStatus is a call back function which will get the results.

  @author: Ninad Sathaye <nsathaye@in.ibm.com>
  @copyright: 2015, IBM
  @dependency: Needs xml2js package. Install is as: npm install xml2js --save
  @see: secureDawn.js (the caller)
*/

var https = require('https');

var exports = module.exports = {};

/**
 Creates an instance of DawnAuthenticator

 Description:
   This is equivalent to a 'class'. The class methods are defined
   as javascript prototypes below.

 @constructor
 @this: {Dawnauthenticator}
*/
exports.DawnAuthenticator = function() {
    this.groups = ['eclipz:c14_p9_members', 'eclipz:c14_z9_members']
    this.task = 'inAGroup';
    this.baseQueryURL='/tools/groups/groupsxml.wss?'

    this.options = {
        host :  'bluepages.ibm.com',
        path : '',
        method : 'GET'
    };

    this.emails = ['balibora@us.ibm.com', 'nsathaye@in.ibm.com'];

    this.queryParams = {"task": "inAGroup" ,
                        "email" : '',
                        "group": [],
                        "depth": "2"};

    this.statusCode = 999
    this.message = "JUNK MESSAGE."
};

/**
   Method: performRequest
   Description:
    The work-horse function that queries the Bluegroups databases and gets an
    XML response. It does an https request using the Bluegroup XML API.
   @param {function} callaback The call back function for handling the results.
   @see inAGroup, inAllGroups, inAnyGroup
*/
exports.DawnAuthenticator.prototype.performRequest = function(callback) {
    var self = this
    var getReq = https.request(this.options, function(res) {
      console.log('STATUS: ' + res.statusCode);
      console.log('HEADERS: ' + JSON.stringify(res.headers));
      res.setEncoding('utf8');
      // Finally update the status.
      res.on('data', function(xmlRes) {
        self.updateStatus(xmlRes);
        callback(self.statusCode, self.message)
      });
    });

    getReq.end();
    getReq.on('error', function(err){
        console.log("Error: ", err); });

};

/**
   Method: inAGroup
   Description:
    This  query function verifies the membership of a user in a group.
    It traverses the group data structure by default to determine subgroups
    and include their members when checking membership. The default number of
    subgroup levels to be checked is 3, which can be overridden by the query
    parameter depth.

   @this {DawnAuthenticator}
   @param {string} email The email address of the user to be authenticated
   @param {string} groupName The name of the group
   @param {function} callback  The call back function for handling the results
*/
exports.DawnAuthenticator.prototype.inAGroup = function(email, groupName, callback) {
    //var path = this.baseQueryURL + "task=inAGroup" + "&email=" + email + "&group=" + groupName + "&depth=" + "2";
    this.queryParams["task"] = "inAGroup";
    this.queryParams["email"] = email;
    this.queryParams["group"] = [groupName];

    this.options.path= this.constructQueryURL(this.baseQueryURL, this.queryParams);

    //console.log("debug path:", this.options.path)

    this.performRequest(callback);
};

/**
  Method: inAllGroups
  Description:
   This  query function verifies the membership of a user in all of the groups
   specified. It traverses the data structs of all groups specified by default
   to determine subgroups and include their members when checking membership.
   The default number of subgroup levels to be checked is 3, which can be
   overridden by the query parameter depth. The query parameter "group" can be
   repeated to specify multiple groups.

   @this {DawnAuthenticator}
   @param {string} email The email address of the user to be authenticated
                         in all the specified blue groups
   @param {function} callback  The call back function for handling the results
*/
exports.DawnAuthenticator.prototype.inAllGroups = function(email, callback) {
    this.queryParams["task"] = "inAllGroups";
    this.queryParams["email"] = email;
    this.queryParams["group"] = this.groups;

    this.options.path= this.constructQueryURL(this.baseQueryURL, this.queryParams);

    this.performRequest(callback);

};

/**
   Method: inAnyGroup
   Description:
    This  query function verifies the membership of a user in any
    of the groups specified. It traverses the data structures of all groups
    specified by default to determine subgroups and include their members when
    checking membership. The default number of subgroup levels to be checked
    is 3, which can be overridden by the query parameter depth. The query
    parameter   "group" can be repeated to specify multiple groups

   @this {DawnAuthenticator}
   @param {string} email The email address of the user to be authenticated
                         in any of the groups specified in groupList
   @param {array} groupList An array representing group names as strings
   @param {function} callback  The call back function for handling the results
*/
exports.DawnAuthenticator.prototype.inAnyGroup = function(email, groupList, callback) {
    this.queryParams["task"] = "inAnyGroup";
    this.queryParams["email"] = email;
    this.queryParams["group"] = groupList;
};

/**
   Method: getBlueGroups
   Description:
     Returns a list of Blue groups . Before calling this method,
     client should make sure that it has provided a qualifying list of group
     names (by calling setBlueGroups)

   @this {DawnAuthenticator}
   @return {list} Returns a list containing the blue group names.
   @see setBlueGroups
   @todo As of 2015-09-30, this returns a list of sample groups. This function
         should be updated with the real groups we would like to validate!
*/
exports.DawnAuthenticator.prototype.getBlueGroups = function() {
    return this.groups
};

/**
  Method: setBlueGroups
  Description:
     An optional setter method to specify a list of blue groups for which
     we will check the membership of a  particular email id.
     The client can use this setter to have a custom list of bluegroups.
     For example, this method can be called after we query the GMS database
     to get a list of legitimate bluegroups for DAWN.
  @this {DawnAuthenticator}
  @param {list} groupList List of qualifying bluegroups sent by the client code.
*/
exports.DawnAuthenticator.prototype.setBlueGroups = function(groupList) {
    this.groups = groupList
};

/**
   Method: validate
   Description:
     Checks if the given email id belongs to one or more specified bluegroups

   @this {DawnAuthenticator}
   @todo Specify bluegroup names as an optional argument. If this option is not
       specified, the code should authenticate the email by checking in ALL
       known bluegroups. As of 2015-09-30 this is the default implementation.
   @todo Do we need to validate multiple emails at one time? Unlikely. The
         disabled code in this method shows one illustration.
*/
exports.DawnAuthenticator.prototype.validate = function(email, callback) {
    //this.inAGroup(email, 'EDirectoryWiki', callback);

    this.inAllGroups(email, callback);
    // Implementation for validating multiple emails
    // var self = this
    // this.emails.forEach( function(email, index, array) {
    //     self.inAGroup(email, 'EDirectoryWiki', callback);
    //     });
};

/**
   Method: updateStatus
   Description:
     This is called as a call back to capture the response from performRequest.
     It updates the values of this.message and this.statusCode to be consumed
     by the client later.
   @this {DawnAuthenticator}
   @see performRequest
*/
exports.DawnAuthenticator.prototype.updateStatus =  function(xmlRes) {
    var parseString = require('xml2js').parseString;
    var self = this;
    parseString(xmlRes,
        function (err, result) {
            self.statusCode = parseInt(result['group']['rc'][0])
            self.message = result['group']['msg'][0]
            //console.log("Message:", self.message)
            //console.log ("Status Code:", self.statusCode);
        });
};

/**
  Method: constructQueryURL
  Description:
     Utility function to construct a query URL
  @param {string} basePath The base query path. Does NOT include the hotname
  @param {dict} queryParams Key value pairs for query parameters.
  @todo: This may well be a part of a new module that manages all utility
           functions. For now keeping it in DawnAuthenticator class.
  @see: DawnAuthenticator constructor
*/
exports.DawnAuthenticator.prototype.constructQueryURL = function(basePath, queryParams) {
   var chunk = [];

   for (var key in queryParams)
      if (key == 'group') {
        groupList = queryParams[key]
        groupList.forEach( function(group) {
            chunk.push(key + "=" + group) });
      }
      else {
        chunk.push(key + "=" + queryParams[key])
    }

    console.log("(D): DawnAuthenticator.constructQueryURL chunk:", chunk)

   return basePath + chunk.join("&");
};
