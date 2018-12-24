/**
  Module: secureDawn.js
  Description:
     An example of the client code that makes calls to the
     DawnAuthenticator   to authenticate one or more email ids against
     a list of qualifying bluegroups. 
     This file is NOT USED anywhere.  Intention is just to provide an illustration
     on how to use DawnAuthenticator API. 

     Typical usage:
        var checker = new DawnAuthenticator();
        var email = 'foo@in.ibm.com'
        checker.validate(email, getStatus);

    where, getStatus is a call back function which will get the results.

  @author: Ninad Sathaye <nsathaye@in.ibm.com>
  @copyright: 2015, IBM
  @dependency: Needs xml2js package. Install is as: npm install xml2js
  @see: DawnAuthenticator.js (called here)
*/

var dawn = require("./DawnAuthenticator.js");

/**
  Function: getStatus
  Decription: This function is provided as a callback to the DawnAuthenticator
     to get the return code and the message.
  @param {number} statusCode The return code (rc) from the bluegroup request
  @param {string} message  Message on what the return code means
*/
function getStatus(statusCode, message) {
    console.log("in getStatus");
    console.log("--------------------------------");
    console.log("Message:", message);
    console.log("Status:", statusCode);
    console.log("--------------------------------");
};

// Create a new DawnAuthentocator instance.
var checker = new dawn.DawnAuthenticator();

// Provide the user email id to check if it belongs to restricted bluegroups.
//var email = 'balibora@us.ibm.com';
//var email = 'guzowski@us.ibm.com'
var email = 'nsathaye@us.ibm.com'
var group = 'eclipz:c14_p9_members';

// Authenticate the user. See the getStatus function.
checker.validate(email, getStatus);
