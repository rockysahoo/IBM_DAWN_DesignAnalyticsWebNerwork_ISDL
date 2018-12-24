'''
Created on Apr 13, 2015

@author: RW Taggart
'''
 
try: 
    reload
except:  
    NameError
    from imp import reload

import xml.etree.ElementTree as ET

from webTools.webToolsUtils import strToFile 
from webTools.htmlGen       import HTMLHandlerBase, HTMLGenerator, XMLGenerator, HTMLTemplateGenerator, AppDataManipulatorBase 
from enzWebTools            import enzConfig
from webTools.dataBase      import SQLiteDataBase
import enzWebTools

debug = 1
debug = 3

class enzVictimAppDataManipulator(AppDataManipulatorBase):
    ''' This class will contain callbacks from within 
        the HTML generator. This way we iterate over
        the data exactly once.  '''
    def initCallBacks(self, header):
        self.rowAttr                = None
        self.isLink                 = None
        self.noiseSlackIndex        = -1
        self.noiseSlackThreshold    = 0.0
        try:
            self.noiseSlackIndex    = header.index('NoiseSlack')
        except ValueError:
            if debug > 3:  print("(W):  Trying to find index for 'NoiseSlack' in header '{}'. Not found.".format(header))
    
    def rowCallBack(self, row):
        ''' Call this function once on every row. 
            @return: '''
        if self.noiseSlackIndex > 0 and row[self.noiseSlackIndex] < self.noiseSlackThreshold:
            # We want the row to be red, for failure.
            self.rowAttr = 'trRed'
    
    def cellCallBack(self, i, element):
        self.isLink = False
        if i == 0:
            # This was hard coded to 0 element. May as well keep it for now.
            self.isLink = True
            
class enzAggrAppDataManipulator(AppDataManipulatorBase):
    ''' This class will contain callbacks from within 
        the HTML generator. This way we iterate over
        the data exactly once.  '''
    def initCallBacks(self, header):
        self.rowAttr = None
        self.isLink  = None
        self.noiseSlackIndex = -1
        try:
            self.noiseSlackIndex     = header.index('NoiseSlack')
        except ValueError:
            if debug > 3:  print("(W):  Trying to find index for 'NoiseSlack' in header '{}'. Not found.".format(header))
        self.noiseSlackThreshold = 0.0
        return self
    
    def rowCallBack(self, row):
        ''' Call this function once on every row. 
            @return: '''
        if self.noiseSlackIndex > 0 and row[self.noiseSlackIndex] < self.noiseSlackThreshold:
            # We want the row to be red, for failure.
            self.rowAttr = 'trRed'
    
    def cellCallBack(self, i, element):
        self.isLink = False
        if i == 0:
            # This was hard coded to 0 element. May as well keep it for now.
            self.isLink = True


class enzHTMLHandler(HTMLHandlerBase):
    # TODO: rename to enzAppHandler
    # The 'custom' part of the application
    # This class will execute queries from DB class and populate the 
    # HTML document.

    DETAIL_QUERY    = "vic_detail"
    RAW_DATA_QUERY  = "vic_raw"
    VICTIM_ID       = "vid"
    SINK_NAME       = "sink"

    def __init__(self, db, htmlTemplateFile=None, *args, **kwargs):
        self.db = db
        self.appname  = enzConfig.appname
        self.title    = enzConfig.indexConfig['title']
        self.htmlName = enzConfig.indexConfig['htmlName']
        self.content  = ""
    
    def initHTMLGen(self, templateFile):
        #incase there were changes to the config file.
        reload(enzConfig)
        self.htmlGen = HTMLTemplateGenerator(self.appname, self.title, enzVictimAppDataManipulator)
        self.htmlGen.readHTMLTemplate(enzWebTools.__path__[0], templateFile)
    
    def setDbLoc(self, location):
        self.db.setDBLoc(None, location)
        
    def constructHTML(self, htmlGen, fileName, table):
        htmlGen.addTable(table[0], table[1:])
        strToFile(htmlGen.getHTML(), fileName);
        return htmlGen.getHTML()

    def constructHTMLOnly(self, htmlGen, fileName):
        strToFile(htmlGen.getHTML(), fileName);
        return htmlGen.getHTML()
    
    def genSummaryInfo(self, queryResult):
        totalNets = 0;
        failingNets = 0;
        for row in queryResult:
            totalNets += 1
            if row[1] < 0: 
                failingNets += 1
        return {'fnets': failingNets, 'tnets': totalNets}

    
    def executeSummaryQuery(self, victimName=None, **kwargs):
        # First query to be executed. Shows 'summary' information.
        print(kwargs)
        query = enzConfig.summaryQuery.format(cols = ",TotalPeak")
        header, netTable = self.db.executeQuery(query)
        if debug:  print("(D):  Execute summary query. size={}".format(len(netTable)))

        self.initHTMLGen(enzConfig.summaryHTMLTemplateFile)
        self.htmlGen.addToBody(self.genSummaryInfo(netTable))

#         index = header.index('NoiseSlack')
#        if debug:  print("(D):  ns index={}".format(str(index)))
#        if debug:  print("(D):  data index pos val={}".format(str(netTable[5][index])))

        #  TODO:  Stick this in a "tuple callback" so we iterate on data only once.
#         queryResult = [ ['link', row] if row[index] < 0.0 else [None, row] for row in netTable ]

        queryResult = netTable  # TODO:  Take this out once it works. We don't need this var anymore.
        if debug > 1:  print("qres: {}".format(queryResult[0:10]))
        
        victimDataManip = enzVictimAppDataManipulator()
        victimDataManip.initCallBacks(header)
        self.htmlGen.addTable(header, queryResult, victimDataManip)
        #time to put the right side table in
#         query = enzConfig.detailAggrQuery.format(vname = victimName)
#         self.htmlGen.addToBody({'victimNet': victimName})
#         v_header, v_netTable = self.db.executeQuery(query, True)
#         victimDataManip2      = enzVictimAppDataManipulator()
#         victimDataManip2.initCallBacks(v_header)
#         tableBuffer = ""
#         for row in v_netTable:
#             tableBuffer += self.htmlGen.tableToHtml(v_header, [row, None])
#             tableBuffer += "<br>"
#             aggrQuery = enzConfig.aggrQuery.format(SinkName=str(row[0]))
#             a_header, aggrTable = self.db.executeQuery(aggrQuery, True)
#             aggrDataManip = enzVictimAppDataManipulator()
#             aggrDataManip.initCallBacks(a_header)
#             tableBuffer += self.htmlGen.tableToHtml(a_header, aggrTable)
#             tableBuffer += "<br>"


        
        self.executeRHSQuery(victimName, **kwargs)
        

        #self.htmlGen.addToBody({'table2': tableBuffer})
        content = self.constructHTMLOnly(self.htmlGen, self.htmlName)
        print("WebPage:  " + self.htmlName)
        return content

    def executeRHSQuery(self, victimName, **kwargs):
        query = enzConfig.rightHandSideQuery.format(vname = victimName)
        print(query)
        self.htmlGen.addToBody({'victimNet': victimName})
        if not victimName:
            self.htmlGen.addToBody({'table2': ""})
            self.htmlGen.addToBody({'table3': ""})
            self.htmlGen.addToBody({'sinkName': ""})
        else:
            v_header, v_netTable = self.db.executeQuery(query, True)
            self.htmlGen.addToBody({'table2': self.htmlGen.tableToHtml(v_header, v_netTable, victimName, True)})
        
            print(v_netTable[0])
            print(v_netTable[0][0])
            if not self.SINK_NAME in kwargs:
                sinkName = v_netTable[0][0]
            else:
                sinkName = kwargs[self.SINK_NAME]
            self.executeAggrQuery(sinkName, victimName)

    def executeAggrQuery(self, sinkName, victimName):
        query = enzConfig.aggrQuery.format(SinkName = sinkName)
        self.htmlGen.addToBody({'sinkName': sinkName})
        v_header, v_netTable = self.db.executeQuery(query, True)
        self.htmlGen.addToBody({'table3': self.htmlGen.tableToHtml(v_header, v_netTable, victimName, False)})
        

    def executeDetailQuery(self, **kwargs):
        #  FIXME:  We don't think this is used anymore.
        #  TODO:   Comment this out, and then delete.
        content = None
        if not self.VICTIM_ID in kwargs:
            return content
        
        victimName = kwargs[self.VICTIM_ID]
            
        header, netTable = self.db.executeQuery(enzConfig.detailQuery.format(vname = victimName))
        if debug:  print("(D):  Execute Details Query. size={}".format(len(netTable)))

        index = header.index('NoiseSlack')
        table = []

        queryResult = [ ['link', row] if row[index] < 0.0 else [None, row] for row in netTable ]
        if debug:  print("qres: {}".format(queryResult[0:10]))       

        self.initHTMLGen()
        content = self.constructHTML(self.htmlGen, self.htmlName, queryResult)
        print("WebPage:  " + self.htmlName)
        return content
        
    def executeDetailAggrQuery(self, **kwargs):
        #TODO:  Add call back function to HTMLgen addTable to process each tuple. 
        #       This can include/exclude columns, add modifiers with col info. 
        #       Callback should pass back object with special instructions on what to do.
        
        return self.executeSummaryQuery(kwargs[self.VICTIM_ID], **kwargs)#TODO - refactor this
#         self.initHTMLGen(enzConfig.detailAggrTemplate)
#         if debug:  print("(D):  Execute Details Aggressor Query")
#         content = None
#         if not self.VICTIM_ID in kwargs:
#             return content
#         
#         victimName = kwargs[self.VICTIM_ID]
#         query = enzConfig.detailAggrQuery.format(vname = victimName)
#         if debug:  print("(D):  SQL Detailed Net Query:  {}".format(query))
#         
#         v_header, v_netTable = self.db.executeQuery(query, True)
#         victimDataManip      = enzVictimAppDataManipulator()
#         victimDataManip.initCallBacks(v_header)
# #         index = v_header.index('NoiseSlack')
#         table = []
# 
#         # Determine if the value needs to be a link.
#         #  TODO:  Add this to the call back so we can process it.
# #         v_queryResult = [ ['link', row] if row[index] < 0.0 else [None, row] for row in v_netTable ]
#         v_queryResult = v_netTable  # TODO:  delete this variable once this works. We won't need it anymore.
#         if debug:  print("(D):  Victim queryResult size={}".format(len(v_queryResult)))
# 
#         for row in v_queryResult:
# #             table.append(row)
#             if debug > 1:
#                 print("(D):    Execute query next row[{}]:".format(len(row))) 
#                 print(str(row))
#             
#             ''' Add 'None' row so that we're still passing in a table. '''
#             self.htmlGen.addTable(v_header, [row, None], victimDataManip)  
#             self.htmlGen.addNewLineToTables()
#             #self.htmlGen.addToBody(vName="someNetName")
#             aggrQuery = enzConfig.aggrQuery.format(SinkName=str(row[0]))
#             if debug:   print("(D):  Aggr SQL Query:  {}".format(aggrQuery))
#             a_header, aggrTable = self.db.executeQuery(aggrQuery, True)
#             if debug:   print("(D):   Aggressor table size={}".format(len(aggrTable)))
#             aggrDataManip = enzVictimAppDataManipulator()
#             aggrDataManip.initCallBacks(a_header)
#    
#             if aggrTable != None:
# #                 at = []
# #                 for arow in aggrTable:
# #                     ll = list(arow)
# #                     ll.insert(0, "")
# #                     at.append(ll)
# #                 table.extend(at) 
# #                table.extend([[None, arow] for arow in aggrTable])
#                 if debug > 2:  print("(D):  aggr row = {}".format(aggrTable))
#                 self.htmlGen.addTable(a_header, aggrTable, aggrDataManip)
#             #self.htmlGen.addHorizontalToTables()
#         if debug:  print("(D):  detailed net/aggressor table len={}".format(len(table)))
#         if debug > 1:  print("(D):  det net/aggr table begin:  {}".format(table[0:4]))
#         
#         #self.htmlGen.addTable(netTable[0])
# #         if debug > 1:  print("(D):  XML Element: {}".format(ET.tostring(self.htmlGen.tableBody, 'utf-8')))
#         content = self.constructHTMLOnly(self.htmlGen, self.htmlName)
#         return content

    def executeRawDataQuery(self, **kwargs):
        ''' This query will be used to show all of the "raw" data that we 
            generate from EinsNoise. '''
        # NOTE:  This is a copy of executeAggrDetailQuery(). We should fix that.
        if debug:  print("(D):  Execute Details Aggressor Query")
        content = None
        if not self.VICTIM_ID in kwargs:
            return content
        
        victimName = kwargs[self.VICTIM_ID]

        query = enzConfig.detailAggrQuery.format(vname = victimName)
        if debug:  print("(D):  SQL Detailed Net Query:  {}".format(query))
        
        header, netTable = self.db.executeQuery(query)
        index = header.index('NoiseSlack')
        table = []

        # Determine if the value needs to be a link.
        queryResult = [ ['link', row] if row[index] < 0.0 else [None, row] for row in netTable ]
        
        if debug:  print("(D):  Victim queryResult size={}".format(len(queryResult)))

        for row in queryResult:
            table.append(row)
            if debug > 1:
                print("(D):    Execute query next row[{}]:".format(len(row))) 
                print(str(row))
            aggrQuery = enzConfig.aggrQuery.format(vid=str(row[1][0]))
            if debug:   print("(D):  Aggr SQL Query:  {}".format(aggrQuery))
            aggrTable = self.db.executeQuery(aggrQuery, False)
            if debug:   print("(D):   Aggressor table size={}".format(len(aggrTable)))
   
            if aggrTable != None:
                at = []
                for arow in aggrTable:
                    ll = list(arow)
                    ll.insert(0, "")
                    at.append([None, ll])
                table.extend(at) 
#                table.extend([[None, arow] for arow in aggrTable]){app}
                if debug > 2:  print("(D):  aggr row = {}".format(table[-1]))
    
        if debug:  print("(D):  detailed net/aggressor table len={}".format(len(table)))
        if debug > 1:  print("(D):  det net/aggr table begin:  {}".format(table[0:4]))

                
        self.initHTMLGen()
        self.htmlGen.addTable(header, table)
        content = self.constructHTMLOnly(self.htmlGen, self.htmlName)
        return content
        
    def getIndexPage(self, **kwargs):
        self.db.connect()
        content = self.executeSummaryQuery(**kwargs)
        return content
    
    def getHTMLPage(self, appID, *args, **kwargs):
        self.db.connect()
        content = None
        if not appID == self.appname:  return content

### NOTE: This 'if' statement doesn't work properly.        
#        if self.DETAIL_QUERY in kwargs:
#            kwargs.remove(self.DETAIL_QUERY)  ''' Leave this commented out. We use it later. '''
#           content = self.executeDetailQuery(**kwargs)

        if debug:  print("(D):  Executing DetailAggrQuery. ")
        content = self.executeDetailAggrQuery(**kwargs)

#        elif self.RAW_DATA_QUERY in kwargs:
#            content = self.executeRawDataQuery(**kwargs)

        if debug and not content:  print("(D):  return in HTTP response content==None")
        return content

class enzXMLHandler(enzHTMLHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.htmlGen = XMLGenerator(self.appname, self.title)

class enzDataHandlerFactory():
    def create(self, HtmlGenerator, *args, **kwargs):
        handler = enzHTMLHandler(*args, **kwargs)
        handler.htmlGen = HtmlGenerator(handler.appname, handler.title)
        return handler

def oldMain():
    handler = enzHTMLHandler(db)
    print("Tables")
    print(db.retriveTableNames())
#     print(handler.executeSummaryQuery())
#     print(handler.getIndexPage())
#     print(handler.executeSummaryQueryConfigs())
    data = db.executeQuery("SELECT * FROM VICTIM where NoiseSlack < 0.0")
    handler = enzXMLHandler(db)
    handler.htmlGen.addTable(data[0], data[1:])
    handler.htmlGen.writeToFile("example.xml")
    print(handler.htmlGen.getHTML())
    handler.getIndexPage()

if __name__ == "__main__":
    dbLoc = "./niof.data"
    templateFileName="victimNetSummaryTemplate.html"
    db = SQLiteDataBase("test", dbLoc)
    db.connect()

    handler = enzDataHandlerFactory().create(HTMLTemplateGenerator, db)
    handler.htmlGen.readHTMLTemplate(enzWebTools.__path__[0], templateFileName)
    
    handler.getIndexPage()
    
