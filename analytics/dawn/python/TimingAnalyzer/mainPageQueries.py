############################################################################### 
# mainPageQueries.py
# This script contains functions that support queries required in DAWN portal's
# Timing Analyzer app; in particular, this script supports all summary related
# info.
#
#  Author: Shesha Raghunathan
#  Created: 01/Dec/2015
############################################################################### 
 
import sqlite3
import sys, os, random
import argparse

#------------------------------------------------------------------------------
# This API is used when epsilon needs to be used. Used in fuzzy float point 
# calculations.
#------------------------------------------------------------------------------
def getEpsilon():
  eps = 0.001
  return eps

#------------------------------------------------------------------------------
# Returns what will be treated as positive infinity the program 
#------------------------------------------------------------------------------
def inf():
  return 10e15

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
# General utility API that translates integer list to a comma separated string.
#------------------------------------------------------------------------------
def getStrListAsStr(strList):
  retstr = ""
  for i in range(len(strList)):
    if (len(retstr) > 0):
      if (strList[i] is not None): retstr += ", '{0}'".format(strList[i]) 
    else:
      if (strList[i] is not None): retstr = "'{0}'".format(strList[i])
  return retstr
 
#------------------------------------------------------------------------------
# Generates slack histogram bar. Outputs number of paths that meet lower and
# upper slack limit criteria, along with the corresponding list of path keys.
#------------------------------------------------------------------------------
def getHistoBarInfo(db, lowerLimit, upperLimit, bucketNum):
  numPaths = 0
  pathKeys = []
  try:
      cursor1 = db.cursor()
      if (bucketNum != 1): lowerLimit = lowerLimit + getEpsilon()
      query  = "SELECT COUNT(PATH_KEY) FROM ENDPT_SUMMARY WHERE SLACK BETWEEN {0} AND {1};".format(lowerLimit, upperLimit) 
      cursor1.execute(query)
      for row1 in cursor1:
        if (row1[0] is not None): numPaths = int(row1[0])

      cursor2 = db.cursor()
      if (numPaths > 0): 
        query  = "SELECT PATH_KEY FROM ENDPT_SUMMARY WHERE SLACK BETWEEN {0} AND {1};".format(lowerLimit, upperLimit) 
        cursor2.execute(query)
        for row2 in cursor2:
          if (row2[0] is not None): pathKeys.append(int(row2[0]))

  except Exception as e:
      print (e)
  finally:
      if (cursor1): cursor1.close()
      if (cursor2): cursor2.close()
  return (numPaths, pathKeys)
  
#------------------------------------------------------------------------------
# Generates slack histogram with 'numBuckets'
#------------------------------------------------------------------------------
def getMinMaxSlack(db):
  minSlk = -inf()
  maxSlk = inf()
  try:
      cursor = db.cursor()
      query  = "SELECT MIN(SLACK), MAX(SLACK) FROM ENDPT_SUMMARY;"
      cursor.execute(query)
      for row in cursor:
        if (row[0] is not None): minSlk = float(row[0])
        if (row[1] is not None): maxSlk = float(row[1])
  except Exception as e:
      print(e)
  finally:
     if (cursor): cursor.close()
  return (minSlk, maxSlk)

#------------------------------------------------------------------------------
# Generates slack histogram with 'numBuckets'
# Feeder APIs: getMinMaxSlack
#------------------------------------------------------------------------------
def getSlackHisto(dbfile, numBuckets):
  retstr = ""
  try:
      db = sqlite3.connect(dbfile)
      db.row_factory = sqlite3.Row
      (minSlack, maxSlack) = getMinMaxSlack(db)
      bucketsize = (maxSlack - minSlack)/numBuckets
      pathKeys = []
      numPaths = 0 
      cnt = 0
      for i in range(numBuckets):
        lowerLimit = minSlack + i*bucketsize
        upperLimit = minSlack + (i+1)*bucketsize
        (numPaths, pathKeys) = getHistoBarInfo(db, lowerLimit, upperLimit, i+1)
        if (numPaths > 0):
          pathStr = getIntListAsStr(pathKeys)
          #pathStr = ""
          cnt += 1
          if (len(retstr) > 0):
            retstr  += ", {{ \"BucketNum\": {0}, \"SlackRange\": \"{1} to {2}\", \"NumPaths\": {3}, \"PathKeys\": [ {4} ] }}".format(i+1, lowerLimit, upperLimit, numPaths, pathStr)
          else:
            retstr   = "[ {{ \"key\": \"SlackHisto\", \"values\":[ {{ \"BucketNum\": {0}, \"SLACK_RANGE\": \"{1} to {2}\", \"NumPaths\": {3}, \"PathKeys\": [ {4} ] }}".format(i+1, lowerLimit, upperLimit, numPaths, pathStr)
          numPaths = 0
          del pathKeys[:]
      if (len(retstr) > 0):
        retstr += " ]} ]"
  
  except Exception as e:
      print(e)
  finally:
      if (db): db.close()
  return retstr

#------------------------------------------------------------------------------
#
#------------------------------------------------------------------------------
def getBoundaryPaths(db, pipoPaths, lat2latPaths):
  boundaryPaths = []
  fom           = 0.0
  pathList      = getIntListAsStr(pipoPaths)
  pathList     += getIntListAsStr(lat2latPaths)
  query = "SELECT PATH_KEY, SLACK FROM ENDPT_SUMMARY WHERE PATH_KEY NOT IN ({0});".format(pathList)
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
#
#------------------------------------------------------------------------------
def getLatchToPins(db):
  latchpins = []
  query = "SELECT PIN_NAME FROM ENDPT_SUMMARY WHERE PIN_NAME IN (SELECT PIN_NAME FROM ENDPT_PATH WHERE CELL_NAME LIKE '%LAT%');"
  try:
      cursor = db.cursor()
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
#
#------------------------------------------------------------------------------
def getLatchFromPins(db):
  latchpins = []
  query = "SELECT FROM_PIN FROM ENDPT_SUMMARY WHERE FROM_PIN IN (SELECT PIN_NAME FROM ENDPT_PATH WHERE CELL_NAME LIKE '%LAT%');"
  try:
      cursor = db.cursor()
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
#
#------------------------------------------------------------------------------
def getLatchToLatchPaths(db):
  lat2latPaths = []
  fom          = 0.0
  topinslist   = getStrListAsStr(getLatchToPins(db))
  frompinslist = getStrListAsStr(getLatchFromPins(db))
  query        = "SELECT PATH_KEY, SLACK FROM ENDPT_SUMMARY WHERE PIN_NAME IN ({0}) AND FROM_PIN IN ({1});".format(topinslist, frompinslist) 
  try:
      cursor = db.cursor()
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
#
#------------------------------------------------------------------------------
def getPIPins(db):
  piPins = []
  query = "SELECT PIN_NAME FROM ENDPT_PATH WHERE CELL_NAME = 'PI';"
  try:
      cursor = db.cursor()
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
#
#------------------------------------------------------------------------------
def getPOPins(db):
  poPins = []
  query = "SELECT PIN_NAME FROM ENDPT_PATH WHERE CELL_NAME = 'PO';"
  try:
      cursor = db.cursor()
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
#
#------------------------------------------------------------------------------
def getPIPOPaths(db):
  pipoPaths  = []
  piPinsList = getStrListAsStr(getPIPins(db))
  poPinsList = getStrListAsStr(getPOPins(db))
  query      = "SELECT PATH_KEY, SLACK FROM ENDPT_SUMMARY WHERE PIN_NAME IN ({0}) AND FROM_PIN IN ({1});".format(poPinsList, piPinsList)
  fom        = 0.0
  try:
      cursor = db.cursor()
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
def getPathsTypeBreakdown(dbfile):
  retstr = ""
  try: 
      db                           = sqlite3.connect(dbfile)
      db.row_factory               = sqlite3.Row
      (pipoPaths, pipofom)         = getPIPOPaths(db)
      (lat2latPaths, lat2latfom)   = getLatchToLatchPaths(db)
      (boundaryPaths, boundaryfom) = getBoundaryPaths(db, pipoPaths, lat2latPaths)
      outstr         = ""
      if (len(pipoPaths) > 0):
        outstr = " {{ \"PATHS_TYPE\": \"PI_PO\", \"DATA\": {{ \"COUNT\": {0}, \"FOM\": {1:.2f} }}, \"PATH_KEYS\": [ {2} ] }}".format(len(pipoPaths), pipofom, getIntListAsStr(pipoPaths))
      if (len(lat2latPaths) > 0):
        if (len(outstr) > 0):
          outstr += ", "
        outstr += " {{\"PATHS_TYPE\": \"LATCH_LATCH\", \"DATA\": {{ \"COUNT\": {0}, \"FOM\": {1:.2f}, \"PATH_KEYS\": [ {2} ] }} }}".format(len(lat2latPaths), lat2latfom, getIntListAsStr(lat2latPaths))
      if (len(lat2latPaths) > 0):
        if (len(outstr) > 0):
          outstr += ", "
        outstr += " {{\"PATHS_TYPE\": \"BOUNDARY\", \"DATA\": {{ \"COUNT\": {0}, \"FOM\": {1:.2f}, \"PATH_KEYS\": [ {2} ] }} }}".format(len(boundaryPaths), boundaryfom, getIntListAsStr(boundaryPaths))
      if (len(outstr) > 0):
        retstr = "[{{ \"KEY\": \"PATHS_BREAKDOWN\", \"BREAKDOWN\":  [ {0} ]}}]".format(outstr) 
  except Exception as e:
      print(e)
  finally:
      if (db): db.close()
  return retstr

#------------------------------------------------------------------------------
# Gets failing info like total failing paths and total FOM in a given db
#------------------------------------------------------------------------------
def getFailingInfo(db):
  totFailingPaths = 0
  totFOM          = 0.0
  try:
      cursor = db.cursor()
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
def getSummaryInfo(db):
  totPaths = distPins = distTests = 0
  minSlk = -99999.0
  maxSlk = 99999.0
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

#------------------------------------------------------------------------------
# Gets summary information for a given dbfile and output as string in JSON format
# Feeder APIs: getSummary and getFailingInfo
#------------------------------------------------------------------------------
def getSummary(dbfile):
    retstr = ""
    try:
        db = sqlite3.connect(dbfile)
        db.row_factory = sqlite3.Row
        (totPaths, uniquePins, totTests, minSlack, maxSlack) = getSummaryInfo(db)
        (totFailingPaths, totFOM) = getFailingInfo(db)
        #retstr += "{{ \"TOTAL_PATHS\": {0}, \"FAIL_PATHS\": {1}, \"TOTAL_TESTS\": {2}, \"UNIQUE_PINS\": {3}, \"MIN_SLACK\": {4:.2f}, \"MAX_SLACK\": {5:.2f}, \"FOM\": {6:.2f} }}".format(totPaths, totFailingPaths, totTests, uniquePins, minSlack, maxSlack, totFOM)
        retstr += "[{{ \"KEY\": \"TOTAL_PATHS\", \"VAL\": {0} }}, {{ \"KEY\" : \"FAIL_PATHS\", \"VAL\": {1} }}, {{\"KEY\": \"TOTAL_TESTS\", \"VAL\": {2} }}, {{ \"KEY\":\"UNIQUE_PINS\", \"VAL\": {3} }}, {{ \"KEY\": \"MIN_SLACK\", \"VAL\": {4:.2f} }}, {{ \"KEY\":\"MAX_SLACK\", \"VAL\": {5:.2f} }}, {{\"KEY\":\"FOM\", \"VAL\": {6:.2f}}}]".format(totPaths, totFailingPaths, totTests, uniquePins, minSlack, maxSlack, totFOM)
    except Exception as e:
        print(e)
    finally:
        if (db): db.close()
    return retstr

#------------------------------------------------------------------------------
#  Main function
#------------------------------------------------------------------------------
if __name__ == '__main__':
  parser = argparse.ArgumentParser (prog = 'Queries in main landing page of timing analyzer')
  parser.add_argument ("--endpt",                  "-endpt",                     help="Path to SQLite endpoint report.",                     required = True)
  parser.add_argument ("--json",                   "-json",                      help="Output file name in JSON format.",                    required = False,  default = "")
  parser.add_argument ("--summary",                "-summary",                   help="Summary info for the report.",                        required = False,  default = False, action = "store_true" )
  # Slack histogram group: first one is the flag and the second sets the number of buckets
  parser.add_argument ("--slack_histo",            "-slack_histo",               help="Slack histogram for the report.",                     required = False,  default = False, action = "store_true" )
  parser.add_argument ("--num_buckets",            "-num_buckets",               help="Number of buckets in slack histogram.",               required = False,  default = 0,     type = int )
  # Break-down based on path type
  parser.add_argument ("--path_type_breakdown",    "-path_type_breakdown",       help="Breakdown of paths into types: PIPO, L2L, Boundary.", required = False,  default = False, action = "store_true" )

  args = parser.parse_args()
  output = ""
  if (args.summary):
    output = getSummary(args.endpt)

  if (args.slack_histo and args.num_buckets > 0):
    output = getSlackHisto(args.endpt, args.num_buckets)
  
  if (args.path_type_breakdown == True):
    output = getPathsTypeBreakdown(args.endpt)

  if (args.json != ""):
    f = open(args.json, 'w')
    f.write(output)
    f.close()
  print (output)    

# END OF FILE
