############################################################################### 
# endpointReport.py
# This is a library of operations on endpoint report SQLite files. 
#
#  Author: Shesha Raghunathan
#  Created: 09/Dec/2015
############################################################################### 

import sqlite3
import sys, os, random
import argparse

########################   General utility APIs  ##############################

# This API is used when epsilon needs to be used. Used in fuzzy float point 
# calculations.
def getEpsilon():
    eps = 0.001
    return eps

# Returns what we deem to be infinity
def inf():
    return 1e15

# General utility API that translates string list to a comma separated string.
def getStrListAsStr(strList):
    retstr = ""
    for i in range(len(strList)):
      if (len(retstr) > 0):
        retstr += ", '{0}'".format(strList[i]) 
      else:
        retstr = "'{0}'".format(strList[i])
    return retstr
 
# General utility API that translates integer list to a comma separated string.
def getIntListAsStr(intList):
    retstr = ""
    for i in range(len(intList)):
      if (len(retstr) > 0):
        retstr += ", {0}".format(intList[i]) 
      else:
        retstr = "{0}".format(intList[i])
    return retstr

# General utility API. Takes pin name and returns usage box of the pin.
def getUsageNameFromPinName(pin):
    usage = ""
    if (len(pin) > 0):
      words = []
      words = pin.rsplit('/',1)
      if (words[0] is not None): usage = words[0]
    return usage
            
# General utility API. Takes latch name and returns latch group it belongs to.
# It assumes the following format: Latch name = <LATCH_GROUP>_#
def getLatchGroup(latch):
    latchGourp = ""
    if (len(latch) > 0):
      words = []
      words = latch.rsplit('_',1)
      if (words[0] is not None): latchGroup = words[0]
    return latchGroup
 
####------------------------------------------------------------------------------
##  Endpoint report class:
##     Provides SQLite query utilities on endpoint report
####------------------------------------------------------------------------------

class EndPointReport(object):
    # Constructor
    def __init__(self, dbfile, logfile):
        self._dbfile  = dbfile
        self._logfile = logfile
        self._src_defs = ""
        self._snk_defs = ""
        self._src_pins = ""
        self._snk_pins = ""
        self._chosen_min_slack = -inf()
        self._chosen_max_slack = inf()
        if (self._dbfile != ""):
          self.openDB()
        if (self._logfile != ""):
          self._log = open(self._logfile, 'w')
        
    # 'Destructor'
    def clear(self):
        self._dbfile   = ""
        self._src_defs = ""
        self._snk_defs = ""
        self._src_pins = ""
        self._snk_pins = ""
        self._logfile  = ""
        if (self._db): self._db.close()
        if (self._log): self._log.close()

    # Returns true of log file is set
    def logEnabled(self):
        rc = (self._logfile != "") ? True : False
        return rc
    
    # Output to logfile
    def outlog(self, str):
        if (self._log):
          self._log.write(str)

    # Set SQLite db file name
    def setDBFile(self, dbfile):
        self._dbfile = dbfile

    # Return SQLite db file name
    def dbFile(self):
        return self._dbfile

    # Return SQLite db pointer. Open SQLite db file if not open.
    def DB(self):
        if (!self._db):
          if (self.dbFile() != ""):
            self.openDB()
          else:
             print ("(E) DBFile not set!")
             return None
        return self._db 

    # Returns source def list 
    def sourceDefs(self):
        return self._source_defs

    # Returns sink def list 
    def sinkDefs(self):
        return self._sink_defs

    # Returns source pin list 
    def sourcePins(self):
        return self._source_defs

    # Returns sink pin list 
    def sinkPins(self):
        return self._sink_defs

    # Open SQLite db file
    def openDB(self):
        try:
            self._db  = sqlite3.connect(self._dbfile)  
            self._db.row_factory = sqlite3.Row
        except Exception as e:
            print e

    # Close SQLite db file
    def closeDB(self):
        if (self._db): self._db.close()

    #------------------------------------------------------------------------------
    # Returns total FOM for the report
    #------------------------------------------------------------------------------
    def totalFOM(self minslk, maxslk):
        fom = 0.0
        if (maxslk > 0.0): maxslk = 0.0
        if (minslk > 0.0): minslk = 0.0
        query = "SELECT SUM(SLACK) FROM ENDPT_SUMMARY WHERE SLACK BETWEEN {0} AND {1};".format(minslk, maxslk)
        try:
            cursor = self.DB().cursor()
            cursor.execute(query)
            for row in cursor:
              if (row[0] is not None): fom = float(row[0])
        except Exception as e:
            print (e)
        finally:
            if (cursor): cursor.close()
        return fom
 
    #------------------------------------------------------------------------------
    # Returns min and max path slack values in the database
    #------------------------------------------------------------------------------
    def getMinMaxSlack(self):
        min_slack = min 
        max_slack = max
        query = "SELECT MIN(SLACK), MAX(SLACK) FROM ENDPT_SUMMARY;"
        db = self.DB()
        try: 
           cursor = db.cursor() 
           cursor.execute(query)
           for row in cursor:
             if (row[0] is not None): min_slack = float(row[0])
             if (row[1] is not None): max_slack = float(row[1])
        except Exception as e:
           print(e)
        finally:
           if (cursor): cursor.close()
        return (min_slack, max_slack)
 
    #------------------------------------------------------------------------------
    # Returns True if forward trace, else False
    #------------------------------------------------------------------------------
    def isForwardTrace(self):
        forward = False
        query = "SELECT TRACE_DIRECTION FROM ENDPT_META;"
        db = self.DB()
        try:
          cursor = db.cursor()
          cursor.execute(query)
          for row in cursor:
            if (row[0] is not None): 
              if (int(row[0]) > 0): forward = True
        except Exceptions as e:
          print (e)
        finally:
          if (cursor): cursor.close()
        return forward
 
    #------------------------------------------------------------------------------
    # Obtains list of distinct cell names
    #------------------------------------------------------------------------------
    def getDistinctLatchCells(self):
        celllist = []
        try:
            cursor = self.DB().cursor()
            query  = "SELECT DISTINCT CELL_NAME FROM ENDPT_PATH WHERE CELL_NAME LIKE '%LAT%';"
            for row in cursor:
              if (row[0] is not None):  
                celllist.append("{0}".format(row[0]))
        except Exception as e:
            print(e)
        finally:
            if (cursor): cursor.close()
        return celllist
 
    #------------------------------------------------------------------------------
    # This API captures a list of distinct to pins that are part of a latch
    #------------------------------------------------------------------------------
    def getDistinctLatchToPins(self):
        distLatchToPins = []
        defs = self.sinkDefs()
        celllike = " CELL_NAME LIKE "
        cellquery = ""
        if (defs != ""):
          for i in range(len(defs)):
            if (len(cellquery) > 0):
              cellquery += " OR {0} '{1}'".format(celllike, defs[i])
            else:      
              cellquery += "{0} '{1}'".format(celllike, defs[i])
        else:
          cellquery = "{0} '%LAT%'".format(celllike)
  
        sinkpins = self.sinkPins()
        pinsquery = ""
        pinlike = " PIN_NAME LIKE "
        if (sinkpins != ""):
          for i in range(len(sinkpins)):
            if (len(pinsquery)):
              pinsquery += " OR {0} '{1}'".format(pinlike, sinkpins[i])
            else:
              pinsquery += "{0} '{1}'".format(pinlike, sinkpins[i])
        query = ""
        if (len(pinsquery) > 0):
          query = "SELECT DISTINCT PIN_NAME FROM ENDPT_SUMMARY WHERE PIN_NAME IN (SELECT DISTINCT PIN_NAME FROM ENDPT_PATH WHERE ({0}) AND ({1}));".format(pinsquery, cellquery)  #TODO: check with customers if this needs to be an OR condition
        else:
          query = "SELECT DISTINCT PIN_NAME FROM ENDPT_SUMMARY WHERE PIN_NAME IN (SELECT DISTINCT PIN_NAME FROM ENDPT_PATH WHERE {0});".format(cellquery) 
          
        try:
            cursor = self.DB().cursor()
            cursor.execute(query)
            for row in cursor:
              if (row[0] is not None):
                distLatchToPins.append("{0}".format(row[0]))
            if (self.logEnabled()):
              self.outlog ("getDistinctLatchToPins: query = {0}\n".format(query))
              self.outlog ("getDistinctLatchToPins: num pins = {0}\n".format(len(distLatchToPins)))
        except Exception as e:
            print(e)
        finally:
            if (cursor): cursor.close()
        return distLatchToPins
  
    #------------------------------------------------------------------------------
    # This API captures a list of distinct from pins that are part of a latch
    #------------------------------------------------------------------------------
    def getDistinctLatchFromPins(self, fromPins):
        distLatchFromPins = fromPins
        defs = self.sourceDefs()
        celllike = " CELL_NAME LIKE "
        cellquery = ""
        if (defs != ""):
          for i in range(len(defs)):
            if (len(cellquery) > 0):
              cellquery += " OR {0} '{1}'".format(celllike, defs[i])
            else:      
              cellquery += "{0} '{1}'".format(celllike, defs[i])
        else:
          cellquery = "{0} '%LAT%'".format(celllike)
        srcpins = self.sourcePins()
        pinsquery = ""
        pinlike = " PIN_NAME LIKE "
        if (srcpins != ""):
          for i in range(len(srcpins)):
            if (len(pinsquery) > 0):
              pinsquery += " OR {0} '{1}'".format(pinlike, srcpins[i])
            else:
              pinsquery += "{0} '{1}'".format(pinlike, srcpins[i])
        query = ""
        if (len(pinsquery) > 0):
          query = "SELECT DISTINCT FROM_PIN FROM ENDPT_SUMMARY WHERE FROM_PIN IN (SELECT DISTINCT PIN_NAME FROM ENDPT_PATH WHERE ({0}) AND ({1}));".format(pinsquery, cellquery)  #TODO: check with customers if this needs to be an OR condition
        else:
          query = "SELECT DISTINCT FROM_PIN FROM ENDPT_SUMMARY WHERE FROM_PIN IN (SELECT DISTINCT PIN_NAME FROM ENDPT_PATH WHERE {0});".format(cellquery) 
   
        try:
            cursor = self.DB().cursor()
            cursor.execute(query)
            for row in cursor:
              if (row[0] is not None):
                distLatchFromPins.append("{0}".format(row[0]))
            if (self.logEnabled()):
              self.outlog ("getDistinctLatchFromPins: query = {0}\n".format(query))
              self.outlog ("getDistinctLatchFromPins: num pins = {0}\n".format(len(distLatchFromPins)))
        except Exception as e:
            print(e)
        finally:
            if (cursor): cursor.close()
        return distLatchFromPins

    #------------------------------------------------------------------------------
    # Calculated limited latch to latch FOM
    #------------------------------------------------------------------------------
    def totalFOMBetweenPins(self, toPins, fromPins):
        fom = 0.0
        tolist   = getStrListAsStr(toPins)
        fromlist = getStrListAsStr(fromPins)
        query    = "SELECT SUM(SLACK) FROM ENDPT_SUMMARY WHERE (PIN_NAME IN ({0})) AND (FROM_PIN IN ({1})) AND (SLACK < 0.0);".format(tolist, fromlist)
        try:
            cursor = self.DB().cursor()
            cursor.execute(query)
            for row in cursor:
              if (row[0] is not None): fom = float(row[0])
        except Exception as e:
            print (e)
        finally:
            if (cursor): cursor.close()
        return fom
    
    #------------------------------------------------------------------------------
    # Calculated limited latch to latch FOM
    #------------------------------------------------------------------------------
    def slackLimitedFOMBetweenPins(self, toPins, fromPins, minslk, maxslk):
        fom = 0.0
        tolist   = getStrListAsStr(toPins)
        fromlist = getStrListAsStr(fromPins)
        if (minslk > 0.0): minslk = 0.0
        if (maxslk > 0.0): maxslk = 0.0
        query    = "SELECT SUM(SLACK) FROM ENDPT_SUMMARY WHERE (PIN_NAME IN ({0})) AND (FROM_PIN IN ({1})) AND (SLACK BETWEEN {2} AND {3});".format(tolist, fromlist, minslk, maxslk)
        try:
            cursor = self.DB().cursor()
            cursor.execute(query)
            for row in cursor:
              if (row[0] is not None): fom = float(row[0])
        except Exception as e:
            print (e)
        finally:
            if (cursor): cursor.close()
        return fom

    #------------------------------------------------------------------------------
    # Returns boundary paths (path keys) along with fom:
    #  requires pipo and lat2lat path list
    #------------------------------------------------------------------------------
    def getBoundaryPaths(self, pipoPaths, lat2latPaths):
        boundaryPaths = []
        fom           = 0.0
        db            = self.DB()
        pathList      = getIntListAsStr(pipoPaths)
        pathList     += getIntListAsStr(lat2latPaths)
        query         = "SELECT PATH_KEY, SLACK FROM ENDPT_SUMMARY WHERE PATH_KEY NOT IN ({0});".format(pathList)
        try:
            cursor = db.cursor()
            cursor.execute(query)
            for row in cursor:
              if (row[0] is not None): boundaryPaths.append(int(row[0]))
              if (row[1] is not None):
                if (float(row[1]) < 0.0): fom += float(row[1])
        except Exception as e:
            print(e)
        finally:
            if (cursor): cursor.close()
        return (boundaryPaths, fom)
  
    #------------------------------------------------------------------------------
    # Returns list of test pins that are latch pins
    #------------------------------------------------------------------------------
    def getLatchToPins(self):
        latchpins = []
        query = "SELECT PIN_NAME FROM ENDPT_SUMMARY WHERE PIN_NAME IN (SELECT PIN_NAME FROM ENDPT_PATH WHERE CELL_NAME LIKE '%LAT%');"
        try:
            cursor = self.DB().cursor()
            cursor.execute(query)
            for row in cursor:
              if (row[0] is not None ): 
                if (row[0] != ""): latchpins.append(row[0])
        except Exception as e:
            print(e)
        finally:
            if (cursor): cursor.close()
        return latchpins
    
    #------------------------------------------------------------------------------
    # Returns list of from pins that are latch pins as well
    #------------------------------------------------------------------------------
    def getLatchFromPins(self):
        latchpins = []
        query = "SELECT FROM_PIN FROM ENDPT_SUMMARY WHERE FROM_PIN IN (SELECT PIN_NAME FROM ENDPT_PATH WHERE CELL_NAME LIKE '%LAT%');"
        try:
            cursor = self.DB().cursor()
            cursor.execute(query)
            for row in cursor:
              if (row[0] is not None): 
                if (row[0] != ""): latchpins.append(row[0])
        except Exception as e:
            print(e)
        finally:
            if (cursor): cursor.close()
        return latchpins
    
    #------------------------------------------------------------------------------
    # Returns latch to latch paths (path keys)
    #------------------------------------------------------------------------------
    def getLatchToLatchPaths(self):
        lat2latPaths = []
        fom          = 0.0
        topinslist   = getStrListAsStr(getLatchToPins())
        frompinslist = getStrListAsStr(getLatchFromPins())
        query        = "SELECT PATH_KEY, SLACK FROM ENDPT_SUMMARY WHERE PIN_NAME IN ({0}) AND FROM_PIN IN ({1});".format(topinslist, frompinslist) 
        try:
            cursor = self.DB().cursor()
            cursor.execute(query)
            for row in cursor:
              if (row[0] is not None): lat2latPaths.append(int(row[0]))
              if (row[1] is not None):
                if (float(row[1]) < 0.0): fom += float(row[1])
        except Exception as e:
            print(e)
        finally:
            if (cursor): cursor.close()
        return (lat2latPaths, fom)
      
    #------------------------------------------------------------------------------
    # Returns PI pins in the report
    #------------------------------------------------------------------------------
    def getPIPins(self):
        piPins = []
        query = "SELECT PIN_NAME FROM ENDPT_PATH WHERE CELL_NAME = 'PI';"
        try:
            cursor = self.DB().cursor()
            cursor.execute(query)
            for row in cursor:
              if (row[0] is not None): 
                if (row[0] != ""): piPins.append(row[0])
        except Exception as e:
            print(e)
        finally:
            if (cursor): cursor.close()
        return piPins
    
    #------------------------------------------------------------------------------
    # Returns PO pins in the report
    #------------------------------------------------------------------------------
    def getPOPins(self):
        poPins = []
        query  = "SELECT PIN_NAME FROM ENDPT_PATH WHERE CELL_NAME = 'PO';"
        try:
            cursor = self.DB().cursor()
            cursor.execute(query)
            for row in cursor:
              if (row[0] is not None): 
                if (row[0] != ""): poPins.append(row[0])
        except Exception as e:
            print(e)
        finally:
            if (cursor): cursor.close()
        return poPins
       
    #------------------------------------------------------------------------------
    # Returns PI-PO or feedthrough paths (path keys) in the report
    #------------------------------------------------------------------------------
    def getPIPOPaths(self):
        pipoPaths  = []
        piPinsList = getStrListAsStr(getPIPins())
        poPinsList = getStrListAsStr(getPOPins())
        query      = "SELECT PATH_KEY, SLACK FROM ENDPT_SUMMARY WHERE PIN_NAME IN ({0}) AND FROM_PIN IN ({1});".format(poPinsList, piPinsList)
        fom        = 0.0
        try:
            cursor = self.DB().cursor()
            cursor.execute(query)
            for row in cursor:
              if (row[0] is not None): pipoPaths.append(int(row[0]))
              if (row[1] is not None): 
                if (float(row[1]) < 0.0): fom += float(row[1])
        except Exception as e:
            print(e)
        finally:
            if (cursor): cursor.close()
        return (pipoPaths, fom)
    
    #------------------------------------------------------------------------------
    # Breaks paths in 'db' into: (i) PI-PO, (ii) latch-latch and (iii) boundary 
    # paths. 
    #
    # PI-PO: Looks for cell_name being 'PI' and 'PO' and generate PI/PO pinlists;
    #        use these lists to identify PI-PO paths from summary table.
    # Latch-latch: Collect list of pins that are not either PI/PO. Use this list
    #        and filter paths that are between theses pins in summary table.
    # Boundary: Remove all pathkeys from the other two groups and list them. 
    #------------------------------------------------------------------------------
    def getPathsTypeBreakdown(self):
        retstr                       = ""
        (pipoPaths, pipofom)         = getPIPOPaths()
        (lat2latPaths, lat2latfom)   = getLatchToLatchPaths()
        (boundaryPaths, boundaryfom) = getBoundaryPaths(pipoPaths, lat2latPaths)
        outstr                       = ""
        if (len(pipoPaths) > 0):
          #outstr = "\"PI_PO_PATHS\": {{ \"COUNT\": {0}, \"PATH_KEYS\": [ {1} ] }}".format(len(pipoPaths), getIntListAsStr(pipoPaths))
          outstr = " {{ \"PATHS_TYPE\": \"PI_PO\", \"DATA\": {{ \"COUNT\": {0}, \"FOM\": {1:.2f} }} }}".format(len(pipoPaths), pipofom)
        if (len(lat2latPaths) > 0):
          if (len(outstr) > 0):
            outstr += ", "
          #outstr += "\"LATCH_LATCH_PATHS\": {{ \"COUNT\": {0}, \"PATH_KEYS\": [ {1} ] }}".format(len(lat2latPaths), getIntListAsStr(lat2latPaths))
          outstr += " {{\"PATHS_TYPE\": \"LATCH_LATCH\", \"DATA\": {{ \"COUNT\": {0}, \"FOM\": {1:.2f} }} }}".format(len(lat2latPaths), lat2latfom)
        if (len(lat2latPaths) > 0):
          if (len(outstr) > 0):
            outstr += ", "
          #outstr += "\"BOUNDARY_PATHS\": {{ \"COUNT\": {0}, \"PATH_KEYS\": [ {1} ] }}".format(len(boundaryPaths), getIntListAsStr(boundaryPaths))
          outstr += " {{\"PATHS_TYPE\": \"BOUNDARY\", \"DATA\": {{ \"COUNT\": {0}, \"FOM\": {1:.2f} }} }}".format(len(boundaryPaths), boundaryfom)
        if (outstr != ""):
          retstr = "[{{ \"KEY\": \"PATHS_BREAKDOWN\", \"BREAKDOWN\":  [ {0} ]}}]".format(outstr) 
        return retstr
    
    #------------------------------------------------------------------------------
    # Gets failing info like total failing paths and total FOM in a given db
    #------------------------------------------------------------------------------
    def getFailingInfo(self):
        totFailingPaths = 0
        totFOM          = 0.0
        try:
            cursor = self.DB().cursor()
            query  = "SELECT COUNT(*), SUM(SLACK) FROM ENDPT_SUMMARY WHERE SLACK < 0.0;"
            cursor.execute(query)
            for row in cursor:
              if (row[0] is not None): totFailingPaths = int  (row[0])
              if (row[1] is not None): totFOM          = float(row[1])
        except Exception as e:
            print(e)
        finally:
            if (cursor): cursor.close()
        return (totFailingPaths, totFOM)
    
    #------------------------------------------------------------------------------
    # Obtains summary information in a given db
    #------------------------------------------------------------------------------
    def getSummaryInfo(self):
        totPaths = distPins = distTests = 0
        minSlk   = -inf()
        maxSlk   = inf()
        db       = self.DB()
        try:
            cursor = db.cursor()
            query  = "SELECT COUNT(*), COUNT(DISTINCT PIN_NAME), COUNT(DISTINCT TEST_TYPE), MIN(SLACK), MAX(SLACK) FROM ENDPT_SUMMARY;" 
            cursor.execute(query)
            for row in cursor:
              if (row[0] is not None): totPaths  = int  (row[0])
              if (row[1] is not None): distPins  = int  (row[1])
              if (row[2] is not None): distTests = int  (row[2])
              if (row[3] is not None): minSlk    = float(row[3])
              if (row[4] is not None): maxSlk    = float(row[4])
        except Exception as e:
            print(e)
        finally:
            if (cursor): cursor.close()
        return (totPaths, distPins, distTests, minSlk, maxSlk)     
       
