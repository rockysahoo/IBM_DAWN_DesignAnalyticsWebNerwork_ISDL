////////////////////////////////////////////////////////////
//  Author:  RW Taggart
//  Date:    2015.7.9
//
//  This is a sample JS file that will connect to a 
//  MySQL database and perform some simple queries on it
////////////////////////////////////////////////////////////

/** Used to initialize database connection.
  * @return:  'connection pool' object which is used to manage db connections
  */
exports.initMySql = function() {
	var  mysql  = require('mysql');
	var  pool 	= mysql.createPool({
		  connectionLimit  : 100
	    , host   		    : 'bluejiffium.btv.ibm.com'
	    , port            : '3306'
	    , user            : 'nteam'
	    , password        : 'nteampwd'
	    , database        : 'noise'
	    , debug           : false
		, multipleStatements : true
    });
    
    return pool;
 }
 
/** 
  * Executes query given.
  * @param Connection Pool Object
  * @param an object that will contain the return information from the query.
  * @param callback function to call when operation is completed.
  */
exports.executeQuery = function(connPoolObj, query, args, callback) {
	console.log('(D) executing query '+query)
   connPoolObj.getConnection(function(err, connection) {
      if (err) {
         connection.release();
         callback({"emsg": "Could not connect to database" + err});
         return;
      }
      
      console.log('connected to db as id ' + connection.threadId);
      if (!args)
         connection.query(query, queryCallBack);
      else
         connection.query(query, args, queryCallBack);
      
      function queryCallBack (err, rows) {
         connection.release();
         if (!err) {
            callback(null, rows);
         }
		 else {
            console.log('(E) node-mysql:  Error querying database. ' + err )
         } 
      };
   });
}