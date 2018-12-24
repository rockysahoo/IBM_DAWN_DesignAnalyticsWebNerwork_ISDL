////////////////////////////////////////////////////
// Author:  RW Taggart
// Date:    2015.7.9
//
// This is a file that contains the SQL queries 
// that we would like to use in EinsNoise. 
////////////////////////////////////////////////////

/** This query returns the list of victim nets.*/
exports.netsQuery =    "SELECT VictimName as VictimName , Min(NoiseSlack) as NoiseSlack, Max(TotalPeak) as TotalPeak " 
                        + "FROM VICTIM WHERE runID like ? AND NoiseSlack < 0.2 GROUP BY VictimName ORDER BY NoiseSlack ASC;";

//This is a hack to get around mySQL's terrible handling of nested subqueries. 
exports.aggrsOnSinkQuery1  = "DROP TEMPORARY TABLE IF EXISTS tempTable; create temporary table tempTable as SELECT VID FROM VICTIM WHERE SinkName like ?;"; 
exports.aggrsOnSinkQuery2 =  " SELECT * FROM AGGRESSOR, tempTable WHERE AGGRESSOR.VID = tempTable.VID;";

exports.sinkQuery = "SELECT SinkName, NoiseSlack, TotalPeak, TotalCoupling, GroundCap, CornerName, SrcMacroName, NoiseType, DriverName, AnalysisType "
					+ ", PulseArea, PulseWidth, PinCap, DriverRes, VDD, NRC, SrcNPeak, SrcNArea, SnkMacroName, AggrCnt "
                     + "From VICTIM  Where runID = ? AND VictimName like ?;";
                     
exports.runsQuery = "SELECT * FROM userInfo;";
