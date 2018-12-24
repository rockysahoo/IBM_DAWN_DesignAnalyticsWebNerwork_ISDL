############################################################################### 
# lat2latAnal.py
# This script performs latch to latch analysis on endpoint report. The goal 
# here is to provide back-end analysis support to EDA Analytics' DAWN portal.
#
#  Author: Shesha Raghunathan
#  Created: 01/Dec/2015
############################################################################### 

import sqlite3
import sys, os, random
import argparse

#------------------------------------------------------------------------------
# Returns True if forward trace, else False
#------------------------------------------------------------------------------
def isForwardTrace(db):
  forward = False
  query = "SELECT TRACE_DIRECTION FROM ENDPT_META;"
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
# Returns min and max path slack values in the database
#------------------------------------------------------------------------------
def getMinMaxSlack(db):
  min_slack = min 
  max_slack = max
  query = "SELECT MIN(SLACK), MAX(SLACK) FROM ENDPT_SUMMARY;"
  try: 
     cursor = db.cursor() 
     cursor.execute(query)
     for row in cursor:
       if (row[0] is not None): min_slack = float(row[0])
       if (row[1] is not None): max_slack = float(row[1])
     #print ("Min = {0:.2f}, Max = {1:.2f}\n".format(min_slack, max_slack))
  except Exception as e:
     print(e)
  finally:
     if (cursor): cursor.close()
  return (min_slack, max_slack)
 
#------------------------------------------------------------------------------
# Returns total FOM for the report
#------------------------------------------------------------------------------
def totalFOM(db, minslk, maxslk):
  fom = 0.0
  if (maxslk > 0.0): maxslk = 0.0
  if (minslk > 0.0): minslk = 0.0
  query = "SELECT SUM(SLACK) FROM ENDPT_SUMMARY WHERE SLACK BETWEEN {0} AND {1};".format(minslk, maxslk)
  try:
      cursor = db.cursor()
      cursor.execute(query)
      for row in cursor:
        if (row[0] is not None): fom = float(row[0])
  except Exception as e:
      print (e)
  finally:
      if (cursor): cursor.close()
  return fom

#------------------------------------------------------------------------------
# This API is used when epsilon needs to be used. Used in fuzzy float point 
# calculations.
#------------------------------------------------------------------------------
def getEpsilon():
   eps = 0.001
   return eps

def inf():
   return 1e15

#------------------------------------------------------------------------------
# General utility API that translates string list to a comma separated string.
#------------------------------------------------------------------------------
def getStrListAsStr(strList):
  retstr = ""
  for i in range(len(strList)):
    if (len(retstr) > 0):
      retstr += ", '{0}'".format(strList[i]) 
    else:
      retstr = "'{0}'".format(strList[i])
  return retstr
 
#------------------------------------------------------------------------------
# General utility API that translates integer list to a comma separated string.
#------------------------------------------------------------------------------
def getIntListAsStr(intList):
  retstr = ""
  for i in range(len(intList)):
    if (len(retstr) > 0):
      retstr += ", {0}".format(intList[i]) 
    else:
      retstr = "{0}".format(intList[i])
  return retstr

#------------------------------------------------------------------------------
# General utility API. Takes pin name and returns usage box of the pin.
#------------------------------------------------------------------------------
def getUsageNameFromPinName(pin):
  usage = ""
  if (len(pin) > 0):
    words = []
    words = pin.rsplit('/',1)
    if (words[0] is not None): usage = words[0]
  return usage
            
#------------------------------------------------------------------------------
# General utility API. Takes latch name and returns latch group it belongs to.
# It assumes the following format: Latch name = <LATCH_GROUP>_#
#------------------------------------------------------------------------------
def getLatchGroup(latch):
  latchGourp = ""
  if (len(latch) > 0):
    words = []
    words = latch.rsplit('_',1)
    if (words[0] is not None): latchGroup = words[0]
  return latchGroup

#------------------------------------------------------------------------------
# Class:
# This class holds timing path summary information.
#------------------------------------------------------------------------------
class PathSummary(object):
  def __init__(self, src, sink, key, slack):
    self.sourcePin      = src
    self.sourceUsageBox = getUsageNameFromPinName(src)
    self.sinkPin        = sink
    self.sinkUsageBox   = getUsageNameFromPinName(sink)
    self.pathKey        = key
    self.slack          = slack

  def clear(self):
    self.sourcePin      = ""
    self.sourceUsageBox = ""
    self.sinkPin        = ""
    self.sinkUsageBox   = ""

  def show_self(self):
    print ("PathSummary: Src = {0}, Snk = {1}, SrcUbox = {2}, SnkUbox = {3}, PathKey = {4}, Slack = {5:.2f}\n".format(self.sourcePin, self.sinkPin, self.sourceUsageBox, self.sinkUsageBox, self.pathKey, self.slack))

#------------------------------------------------------------------------------
# Class:
# This class is for grouping of paths. We gather attributes for a given group
# like, worst slack, best slack, number of paths, path keys etc.
#------------------------------------------------------------------------------
class GroupAttribs(object):
  def __init__(self, name):
    self.name       = name
    self.fom        = 0.0
    self.worstSlack = inf()  #max
    self.bestSlack  = -inf() #min
    self.cnt        = 0
    self.pathKeys   = []
  
  def clear(self):
    self.name     = ""
    del self.pathKeys[:]

  def outputString(self):
    retstr = ""
    if (len(self.name) > 0):
      outstr = "\"GROUP_NAME\": \"{0}\", \"FOM\": {1:.2f}, \"WORST_SLACK\": {2:.2f}, \"BEST_SLACK\": {3:.2f}, \"COUNT\": {4}".format(self.name, self.fom, self.worstSlack, self.bestSlack, self.cnt)
      pathkeys = ""
      for i in range(len(self.pathKeys)):
        if (i == 0): pathkeys = ", \"PATH_KEYS\": [ {0}".format(self.pathKeys[i])
        else: pathkeys += ", {0}".format(self.pathKeys[i])
      if (len(pathkeys) > 0): 
        pathkeys += " ]"
        #outstr += pathkeys
    restr = "{{ {0} }}".format(outstr) 
    return restr
  
  def getName(self):
    return self.name

  def getFOM(self):
    return self.fom

  def getWorstSlack(self):
    return self.worstSlack

  def getBestSlack(self):
    return self.bestSlack

  def getCount(self):
    return self.cnt

  def getPathKeys(self):
    return self.pathKeys

  def addElement(self, key, slack):
    if (key != 0): 
      self.pathKeys.append(key)
      if (slack < 0.0): self.fom += float(slack)
      if (slack < self.worstSlack): self.worstSlack = float(slack)
      if (slack > self.bestSlack):  self.bestSlack  = float(slack)
      self.cnt += 1

#------------------------------------------------------------------------------
# Class:
# This is the main class that performs grouping of paths. This grouping is
# based on grouping of latches. 
# Dependencies: GroupAtrribs
#------------------------------------------------------------------------------
class GroupPaths(object):
  def __init__(self, pathlist):
    self.pathList    = pathlist
    self.srcGroup    = []
    self.snkGroup    = []
    self.srcSnkGroup = []
    self.groupPaths()

  def clear(self):
    self.pathList.clear()
    for i in range(len(self.srcGroup)):
      self.srcGroup[i].clear()
    self.srcGroup.clear()
    for i in range(len(self.snkGroup)):
      self.snkGroup[i].clear()
    self.snkGroup.clear()
    for i in range(len(self.srcSnkGroup)):
      self.srcSnkGroup[i].clear()
    self.srcSnkGroup.clear()

  def outputGroupString(self, group):
    retstr  = ""
    outstr = ""
    for i in range(len(group)):
      attribs = group[i]
      if i != 0: outstr += ", "
      outstr +=  "{0}".format(attribs.outputString())
    if len(outstr) > 0 :
      retstr = "{0}".format(outstr)
    return retstr
  
  def outputString(self):
    retstr = ""
    outstr = "" 
    if (len(self.srcGroup) > 0):
      outstr = "\"SOURCE_GROUP\": [{0} ]".format(self.outputGroupString(self.srcGroup))
    if (len(self.snkGroup) > 0):
      if (len(outstr) > 0):
        outstr += ", "
      outstr += "\"SINK_GROUP\": [{0} ]".format(self.outputGroupString(self.snkGroup))
    if (len(self.srcSnkGroup) > 0):
      if (len(outstr) > 0):
        outstr += ", "
      outstr += "\"SOURCE_SINK_GROUP\": [{0} ] ".format(self.outputGroupString(self.srcSnkGroup))
    if (len(outstr) > 0):
      retstr = "{0}".format(outstr)
    return retstr

  def getPathList(self):
    return self.pathList

  def getSourceGroup(self):
    return self.srcGroup

  def getSinkGroup(self):
    return self.snkGroup

  def getSourceSinkGroup(self):
    return self.srcSnkGroup

  def updateSrcGroup(self, path):
    found = False
    srcGroup = getLatchGroup(path.sourceUsageBox)
    for i in range(len(self.srcGroup)):
      if (found == False):
        src = self.srcGroup[i]
        if (src.name == srcGroup):
          src.addElement(path.pathKey, path.slack)
          found = True
    if (found == False):
      src = GroupAttribs(srcGroup)
      src.addElement(path.pathKey, path.slack)
      self.srcGroup.append(src)

  def updateSnkGroup(self, path):
    found = False
    snkGroup = getLatchGroup(path.sinkUsageBox)
    for i in range(len(self.snkGroup)):
      if (found == False):
        snk = self.snkGroup[i]
        if (snk.name == snkGroup):
          snk.addElement(path.pathKey, path.slack)
          found = True
    if (found == False):
      snk = GroupAttribs(snkGroup)
      snk.addElement(path.pathKey, path.slack)
      self.snkGroup.append(snk)

  def updateSrcSnkGroup(self, path):
    found = False
    srcGroup = getLatchGroup(path.sourceUsageBox)
    snkGroup = getLatchGroup(path.sinkUsageBox)
    srcSnkPair = "{0} {1}".format(srcGroup, snkGroup)
    for i in range(len(self.srcSnkGroup)):
      if (found == False):
        srcSnk = self.srcSnkGroup[i]
        if (srcSnk.name == srcSnkPair):
          srcSnk.addElement(path.pathKey, path.slack)
          found = True
    if (found == False):
      srcSnk = GroupAttribs(srcSnkPair)
      srcSnk.addElement(path.pathKey, path.slack)
      self.srcSnkGroup.append(srcSnk)
 
  def groupPaths(self):
    for i in range(len(self.pathList)):
      path = self.pathList[i]
      self.updateSrcGroup(path)
      self.updateSnkGroup(path)
      self.updateSrcSnkGroup(path)

#------------------------------------------------------------------------------
#
#------------------------------------------------------------------------------
class LatchPairs(object):
  def __init__(self, src, sink):
    self.source     = src
    self.sink       = sink
    self.worstSlk   = 0.0
    self.FOM        = 0.0
    self.percentFOM = 0.0
    self.pathKeys   = []

  def clear(self):
    self.source = ""
    self.sink   = ""
    del self.pathKeys[:]

  def setWorstSlack(self, slk):
    self.worstSlk = slk

  def getWorstSlack(self):
    return self.worstSlk

  def setFOM(self, fom):
    self.FOM = fom

  def getFOM(self):
    return self.FOM

  def setPercentFOM(self, fom):
    self.percentFOM = fom

  def getPercentFOM(self):
    return self.percentFOM
 
  def addPathKey(self, key):
    self.pathKeys.append(key)

  def getPathKeys(self):
    return self.pathKeys

#------------------------------------------------------------------------------
# Class:
# This is the main class for latch to latch analysis. Contains filter data from
# user along with database name and DB file pointer. 
# Dependencies: GroupAttribs, PathSummary
#------------------------------------------------------------------------------
class LatchToLatchAnalysis(object):
  def __init__(self, args):
    self._dbfile             = args.endpt
    self._json               = args.json
    self._summary            = args.summary
    self._source_defs        = args.source_defs
    self._sink_defs          = args.sink_defs
    self._source_pins        = args.source_pins
    self._sink_pins          = args.sink_pins
    self._chosen_max_slack   = args.max_slack
    self._chosen_min_slack   = args.min_slack
    #self._num_buckets       = args.num_buckets
    self._outstr             = ""
    self._forward            = False
    self._totalFOM           = 0.0
    self._totalLat2LatFOM    = 0.0
    self._limitedFOM         = 0.0
    self._limitedLat2LatFOM  = 0.0
    self._logFileName        = args.log_file
    if (self._logFileName != ""):
      self._logFile = open(self._logFileName, 'w')
    if (self._dbfile != ""): 
      self.openDB()
      if (self._db):
        self._forward = isForwardTrace(self.DB())
        (self._min_slack, self._max_slack) = getMinMaxSlack(self.DB())
        self._totalFOM = totalFOM(self.DB(), self.minSlack(), self.maxSlack())
        self.setChosenMinMaxSlack()
        self._limitedFOM = totalFOM(self.DB(), self.chosenMinSlack(), self.chosenMaxSlack())

  def clear(self):
    self._dbfile      = ""
    self._json        = ""
    self._source_defs = ""
    self._sink_defs   = ""
    self._source_pins = ""
    self._sink_pins   = ""
    self._dbfile      = ""
    self._outstr      = ""
    self.closeDB()
    if (self._logFileName != ""):
      if (self._logFile): self._logFile.close()
    self._logFileName = ""

  def logEnabled(self):
    rc = False
    if (self._logFileName != ""): rc = True
    return rc

  def outlog(self, str):
    if (self._logFile):
      self._logFile.write(str)

  def dbfile(self):
    return self._dbfile

  def sourceDefs(self):
     return self._source_defs

  def sinkDefs(self):
     return self._sink_defs

  def sourcePins(self):
     return self._source_pins

  def sinkPins(self):
     return self._sink_pins

  #def numBuckets(self):
  #   return self._num_buckets

  def outStr(self):
     return self._outstr

  def minSlack(self):
     return self._min_slack

  def chosenMinSlack(self):
     return self._chosen_min_slack

  def setMinSlack(self, minslk):
     self._min_slack = minslk
     if (self.logEnabled()): self.outlog ("Min slack: {0}\n".format(minslk))

  def setChosenMinSlack(self, minslk):
     self._chosen_min_slack = minslk
     if (self.logEnabled()): self.outlog ("Chosen min slack: {0}\n".format(minslk))

  def maxSlack(self):
     return self._max_slack

  def setMaxSlack(self, maxslk):
     self._max_slack = maxslk
     if (self.logEnabled()): self.outlog ("Max slack: {0}\n".format(maxslk))

  def chosenMaxSlack(self):
     return self._chosen_max_slack

  def setChosenMaxSlack(self, maxslk):
     self._chosen_max_slack = maxslk
     if (self.logEnabled()): self.outlog ("Chosen max slack: {0}\n".format(maxslk))

  def totalFOM(self):
     return self._totalFOM

  def totalLat2LatFOM(self):
     return self._totalLat2LatFOM

  def setTotalLat2LatFOM(self, fom):
     self._totalLat2LatFOM = fom
     if (self.logEnabled()): self.outlog ("Total latch-latch FOM: {0}\n".format(fom))

  def limitedFOM(self):
     return self._limitedFOM

  def limitedLat2LatFOM(self):
     return self._limitedLat2LatFOM

  def setLimitedLat2LatFOM(self, fom):
     self._limitedLat2LatFOM = fom
     if (self.logEnabled()): self.outlog ("Limited latch-latch FOM: {0}\n".format(fom))

  def isForward(self):
    return self._forward

  def DB(self):
     return self._db

  def openDB(self):
    try:
        self._db = sqlite3.connect(self._dbfile)
        self._db.row_factory = sqlite3.Row
    except Exception as e:
        print(e)
    
  def closeDB(self):
    if (self._db): self._db.close()

  # Sets min and max slack values
  def setChosenMinMaxSlack(self):
    if (self.chosenMinSlack() == min or self.chosenMaxSlack() == max):
      (minslk, maxslk) = getMinMaxSlack(self.DB())
      if (self.chosenMinSlack() == min):
        self.setChosenMinSlack(minslk)
      if (self.chosenMaxSlack() == max):
        self.setChosenMaxSlack(maxslk)
    
  # Obtains list of distinct cell names
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
    
  # This API captures a list of distinct to pins that are part of a latch
  def getDistinctLatchToPins(self):
    distLatchToPins = []
    defs = self.sinkDefs()
    celllike = " CELL_NAME LIKE "
    cellquery = ""
    if (defs != ""):
      defsList = defs.split(" ")
      for i in range(len(defsList)):
        if (len(cellquery) > 0):
          cellquery += " OR {0} '{1}'".format(celllike, defsList[i])
        else:      
          cellquery += "{0} '{1}'".format(celllike, defsList[i])
    else:
      cellquery = "{0} '%LAT%'".format(celllike)

    sinkpins = self.sinkPins()
    pinsquery = ""
    pinlike = " PIN_NAME LIKE "
    if (sinkpins != ""):
      sinkpinsList = sinkpins.split(" ")
      for i in range(len(sinkpinsList)):
        if (pinsquery != ""):
          pinsquery += " OR {0} '{1}'".format(pinlike, sinkpinsList[i])
        else:
          pinsquery += "{0} '{1}'".format(pinlike, sinkpinsList[i])
    query = ""
    if (pinsquery != ""):
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

  # This API captures a list of distinct from pins that are part of a latch
  def getDistinctLatchFromPins(self):
    distLatchFromPins = []
    defs = self.sourceDefs()
    celllike = " CELL_NAME LIKE "
    cellquery = ""
    if (defs != ""):
      defsList = defs.split(" ")
      for i in range(len(defsList)):
        if (len(cellquery) > 0):
          cellquery += " OR {0} '{1}'".format(celllike, defsList[i])
        else:      
          cellquery += "{0} '{1}'".format(celllike, defsList[i])
    else:
      cellquery = "{0} '%LAT%'".format(celllike)
    srcpins = self.sourcePins()
    pinsquery = ""
    pinlike = " PIN_NAME LIKE "
    if (srcpins != ""):
      srcpinsList = srcpins.split(" ")
      for i in range(len(srcpinsList)):
        if (pinsquery != ""):
          pinsquery += " OR {0} '{1}'".format(pinlike, srcpinsList[i])
        else:
          pinsquery += "{0} '{1}'".format(pinlike, srcpinsList[i])
    query = ""
    if (pinsquery != ""):
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

  # Obtains slack info with appropriate filtering: on to/from pins, slack and cell names
  def getPathDetails(self, toPins, fromPins):
    pathList = []
    tolist   = getStrListAsStr(toPins)
    fromlist = getStrListAsStr(fromPins)
    query    = "SELECT PATH_KEY, PIN_NAME, FROM_PIN, SLACK FROM ENDPT_SUMMARY WHERE (PIN_NAME IN ({0})) AND (FROM_PIN IN ({1})) AND (SLACK BETWEEN {2} AND {3});".format(tolist, fromlist, self.chosenMinSlack(), self.chosenMaxSlack())
    try:
        cursor = self.DB().cursor()
        cursor.execute(query)
        for row in cursor:
          if ((row[0] is not None) and (row[1] is not None) and (row[2] is not None) and (row[3] is not None)):
            path = PathSummary(row[2], row[1], int(row[0]), float(row[3]))
            pathList.append(path)
        if (self.logEnabled()):
          self.outlog ("getPathDetails: query = {0}\n".format(query))
          self.outlog ("getPathDetails: num paths = {0}\n".format(len(pathList)))
    except Exceptions as e:
        print (e)
    finally:
        if (cursor): cursor.close()
    return pathList

  # Calculated total latch to latch FOM
  def calculateTotalLat2LatFOM(self, toPins, fromPins):
    fom = 0.0
    tolist   = getStrListAsStr(toPins)
    fromlist = getStrListAsStr(fromPins)
    query    = "SELECT SUM(SLACK) FROM ENDPT_SUMMARY WHERE (PIN_NAME IN ({0})) AND (FROM_PIN IN ({1})) AND (SLACK < 0.0);".format(tolist, fromlist)
    if (self.logEnabled()):
      self.outlog ("calculateTotalLat2LatFOM: len(toPins) = {0}, len(fromPins) = {1}\n".format(len(toPins), len(fromPins)))
      self.outlog ("calculateTotalLat2LatFOM: query = \n {0} \n".format(query))
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

  # Calculated limited latch to latch FOM
  def calculateLimitedLat2LatFOM(self, toPins, fromPins):
    fom = 0.0
    tolist   = getStrListAsStr(toPins)
    fromlist = getStrListAsStr(fromPins)
    minslk   = maxslk = 0.0
    if (self.chosenMinSlack() < 0.0): minslk = self.chosenMinSlack()
    if (self.chosenMaxSlack() < 0.0): maxslk = self.chosenMaxSlack()
    query    = "SELECT SUM(SLACK) FROM ENDPT_SUMMARY WHERE (PIN_NAME IN ({0})) AND (FROM_PIN IN ({1})) AND (SLACK BETWEEN {2} AND {3});".format(tolist, fromlist, minslk, maxslk)
    if (self.logEnabled()):
      self.outlog ("calculateLimitedLat2LatFOM: len(toPins) = {0}, len(fromPins) = {1}\n".format(len(toPins), len(fromPins)))
      self.outlog ("calculateLimitedLat2LatFOM: query = \n {0} \n".format(query))
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
  
  # Main API to obtain summary info
  def getSummaryInfo(self):
    retstr = ""
    #self.setMinMaxSlack()
    to_pins      = self.getDistinctLatchToPins()
    from_pins    = self.getDistinctLatchFromPins()
    path_details = self.getPathDetails(to_pins, from_pins)   
    self.setTotalLat2LatFOM (self.calculateTotalLat2LatFOM(to_pins, from_pins))
    self.setLimitedLat2LatFOM (self.calculateLimitedLat2LatFOM(to_pins, from_pins))
    to_pins.clear()
    from_pins.clear()
    path_groups  = GroupPaths(path_details) 
    pathgrpstr   = path_groups.outputString()
    if (pathgrpstr == ""):
      if (self.logEnabled()): self.outlog ("getSummaryInfo: path_groups.outputString() returned empty!\n")
    #retstr = "{{\"MIN_SLACK\": {0:.2f}, \"MAX_SLACK\": {1:.2f}, \"TOTAL_FOM\": {2:.2f}, \"CHOSEN_MIN_SLACK\": {3:.2f}, \"CHOSEN_MAX_SLACK\": {4:.2f}, \"FOM_IN_RANGE\": {5:.2f}, {6} }}".format(self.minSlack(), self.maxSlack(), self.totalFOM(), self.chosenMinSlack(), self.chosenMaxSlack(), self.limitedFOM(), retstr)
    retstr = "\"MIN_SLACK\": {0:.2f}, \"MAX_SLACK\": {1:.2f}, \"TOTAL_FOM\": {2:.2f}, \"TOTAL_LAT2LAT_FOM\": {3:.2f}, ".format(self.minSlack(), self.maxSlack(), self.totalFOM(), self.totalLat2LatFOM())
    retstr += " \"CHOSEN_MIN_SLACK\": {0:.2f}, \"CHOSEN_MAX_SLACK\": {1:.2f}, \"FOM_IN_RANGE\": {2:.2f}, \"LAT2LAT_FOM_IN_RANGE\": {3:.2f}".format(self.chosenMinSlack(), self.chosenMaxSlack(), self.limitedFOM(), self.limitedLat2LatFOM())
    if (pathgrpstr != ""):
      retstr = "{{ {0}, {1} }}".format(retstr, pathgrpstr)
    else:
      retstr = "{{ {0} }}".format(retstr)
    retstr = "[ {{ \"KEY\": \"LATCH_LATCH\", \"DATA\": {0} }} ]".format(retstr)
    path_groups.clear()
    return retstr

#------------------------------------------------------------------------------
#  Main function
#------------------------------------------------------------------------------
if __name__ == '__main__':
  parser = argparse.ArgumentParser (prog = 'Queries in main landing page of timing analyzer')
  parser.add_argument ("--endpt",          "-endpt",             help="Path to SQLite endpoint report.",                  required = True)
  parser.add_argument ("--json",           "-json",              help="Output file name in JSON format.",                 required = False,  default = "")
  parser.add_argument ("--log_file",       "-log_file",          help="Log file for debug.",                              required = False,  default = "")
  parser.add_argument ("--summary",        "-summary",           help="Summary info for the report.",                     required = False,  default = False, action = "store_true" )
  parser.add_argument ("--source_defs",    "-source_defs",       help="List of source blocks to analyze.",                required = False,  default = "" )
  parser.add_argument ("--sink_defs",      "-sink_defs",         help="List of sink blocks to analyze.",                  required = False,  default = "" )
  parser.add_argument ("--source_pins",    "-source_pins",       help="List of source pins to analyze.",                  required = False,  default = "" )
  parser.add_argument ("--sink_pins",      "-sink_pins",         help="List of sink pins to analyze.",                    required = False,  default = "" )
  parser.add_argument ("--min_slack",      "-min_slack",         help="Minimum slack.",                                   required = False,  default = min,   type = float )
  parser.add_argument ("--max_slack",      "-max_slack",         help="Maximum slack.",                                   required = False,  default = max,   type = float )
  #parser.add_argument ("--num_buckets",    "-num_buckets",       help="Number of buckets in slack histogram.",            required = False,  default = 5,     type = int )

  args = parser.parse_args()
  output = ""
  #args.log_file = "/afs/apd.pok.ibm.com/u/sheraghu/vol1/edanalytics/sandboxes/sheraghu/dawn/python/TimingAnalyzer/out.log";
  if (args.source_defs == "%"): args.source_defs = ""
  if (args.sink_defs   == "%"): args.sink_defs   = ""
  if (args.source_pins == "%"): args.source_pins = ""
  if (args.sink_pins   == "%"): args.sink_pins   = ""
  

  lat2latAnalysis = LatchToLatchAnalysis(args)
  if (lat2latAnalysis.logEnabled()):
    lat2latAnalysis.outlog("Options: source_defs = ({0}, {1}), sink_defs = ({2}, {3}), source_pins = ({4}, {5}), sink_pins = ({6}, {7}), min_slack = {8}, max_slack = {9}\n".format(len(args.source_defs), args.source_defs, len(args.sink_defs), args.sink_defs, len(args.source_pins), args.source_pins, len(args.sink_pins), args.sink_pins, args.min_slack, args.max_slack))
  output = lat2latAnalysis.getSummaryInfo()
  lat2latAnalysis.clear()
  if (args.json != ""):
    f = open(args.json, 'w')
    f.write(output)
    f.close()
  print (output)    

# END OF FILE
