'''
Created on Apr 13, 2015

@author: RW Taggart

This file is used as a configuration.
'''

appname = "enz"

###  TODO:  Organize this file:
#               o Keep SQL query definitions together.
#               o Keep HTML template file definitions together.

### TODO:  Take out fancy-ness. We don't need it
indexConfig = dict (  tables      =  "VICTIM"
#                     , attributes = ['VictimName', 'TotalPeak', 'NoiseSlack']
#                     , conditions = ['NoiseSlack', '<', '0.0']
#                     , order      = ['NoiseSlack', 'ASC']
                    , title      = "Victims Sorted By Slack"
                    , htmlName   = "VictimSummary.html"
                    )

htmlConfig = dict (  
                     details    = dict(
                                       tables = "VICTIM"
                                     , attributes = ['*']
                                     , conditions = ['VictimName', 'like', 'vid']
                                     , order      = ['NoiseSlack', 'ASC', 'NoiseType']
                                       )
                   , aggressorDetails = dict(
                                             tables = ["VICTIM", "AGGRESSOR"]
                                           , attributes = ['AggrName', 'CouplingCap', 'TransitionTime', 'NoisePeak'] )
                                           , conditions = ['AGGRESSOR.VID', 'like', 'VICTIM.VID']
                                           , order      = []
                   )


summaryHTMLTemplateFile = "framedFormat.html"
detailAggrTemplate = "victimNetTemplate.html"
# Find victim name, total peak, and Noise Slack in ASC slack order.
summaryQuery =    "SELECT substr(VictimName, 1, 3000) as VictimName , MIN(NoiseSlack) as NoiseSlack, TotalPeak FROM VICTIM GROUP BY VictimName ORDER BY NoiseSlack ASC LIMIT 15000;"
#In between these two is a variable that adds additional columns to the SELECT statement

netsHTMLTemplateFile    = "netsTemplate.html"
rawDataHTMLTemplate     = "victimNetRawDataTemplate.html"

### v this is the good one.
#summaryQuery =    "SELECT DISTINCT (VictimName), TotalPeak, NoiseSlack from VICTIM ORDER BY NoiseSlack ASC;"
#summaryQuery =    "SELECT DISTINCT (VictimName), ROUND(TotalPeak, 3), ROUND(NoiseSlack, 3) from VICTIM  ORDER BY NoiseSlack ASC;"
# summaryQuery =    "SELECT tbl.VictimName, tbl.TotalPeak, tbl.NoiseSlack FROM VICTIM tbl Inner Join ( Select Distinct VictimName, MIN(NoiseSlack) MinPoint From VICTIM Group By VictimName) tbl1 On tbl1.VictimName=tbl.VictimName Where tbl1.MinPoint=tbl.NoiseSlack Order By tbl.NoiseSlack ASC;"

# We want to match the victim name from the first page. 
detailQuery      = "SELECT * from VICTIM where VictimName like '{vname}' ORDER BY NoiseSlack ASC, NoiseType LIMIT 20;"

# For each VID we have on each victim net, we want to find all of the aggressors.
#detailAggrQuery  = "SELECT SinkName, Min(NoiseSlack) AS NoiseSlack, TotalPeak, CornerName, AnalysisType, NoiseType, DriverName from VICTIM where VictimName like '{vname}' GROUP BY SinkName ORDER BY NoiseSlack ASC, NoiseType LIMIT 20;"
aggrQuery        = "SELECT AggrName, Max(NoisePeak) AS NoisePeak, NoiseArea, CouplingCap, percIncluded, TransitionTime FROM AGGRESSOR WHERE VID in (SELECT VID from Victim where Victim.SinkName = '{SinkName}') GROUP BY AggrName;"

rightHandSideQuery = "SELECT SinkName, NoiseType, AnalysisType, TotalPeak, Min(NoiseSlack) as NoiseSlack, TotalCoupling From Victim  Where VictimName like '{vname}' GROUP BY SinkName ORDER BY NoiseSlack ASC;"  


# TODO: stick histogram statement here. 
bucketSlackQuery = ""
