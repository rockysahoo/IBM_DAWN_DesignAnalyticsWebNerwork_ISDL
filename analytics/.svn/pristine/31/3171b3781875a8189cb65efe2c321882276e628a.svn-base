import sqlite3
import sys, os, random
import argparse

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
# Get row details for the path page. 
#------------------------------------------------------------------------------
def getRow(dbfile, pathKey, rowNum):
  retstr = ""
  try: 
    db = sqlite3.connect(dbfile)
    db.row_factory = sqlite3.Row
    cursor = db.cursor()
    query = "SELECT PIN_NAME, EDGE, PHASE, AT, SLACK, SLEW, DELAY, ADJUST, CELL_NAME, NET_NAME, FO FROM ENDPT_PATH WHERE PATH_KEY = {0} AND ROW_NUM = {1};".format(pathKey, rowNum)
    try: 
      cursor.execute(query)
      i = 0
      retstr = "["
      record = ""
      for row in cursor:
        record = "{{ \"PIN_NAME\": \"{0}\", \"EDGE\": \"{1}\", \"PHASE\": \"{2}\"".format(row[0], row[1], row[2])
        if (row[3] is not None): record += ", \"AT\": {0:.2f}".format(row[3])
        if (row[4] is not None): record += ", \"SLACK\": {0:.2f}".format(row[4])
        if (row[5] is not None): record += ", \"SLEW\": {0:.2f}".format(row[5])
        if (row[6] is not None): record += ", \"DELAY\": {0:.2f}".format(row[6])
        if (row[7] is not None): record += ", \"ADJUST\": {0:.2f}".format(row[7])
        record += ", \"CELL_NAME\": \"{0}\", \"NET_NAME\": \"{1}\"".format(row[8], row[9])
        if (row[10] is not None): record += ", \"FO\": {0} }}".format(row[10])
        else: record += " }"
        if (i > 0):
          retstr += ", "
        retstr += "{0}".format(record)
        i += 1
      retstr += "]"
    except Exception as e:
      print (e)
  finally:
    if (cursor): cursor.close()    
    if (db): db.close()
  return retstr        

#------------------------------------------------------------------------------
# Obtains path for a given path_key.
#------------------------------------------------------------------------------
def getPath(dbfile, pathKey):
  retstr = ""
  try: 
    db = sqlite3.connect(dbfile)
    db.row_factory = sqlite3.Row
    cursor = db.cursor()
    query = "SELECT PATH_KEY, ROW_NUM, PATH_TYPE, PIN_NAME, EDGE, PHASE, AT, SLACK, SLEW FROM ENDPT_PATH WHERE PATH_KEY = {0};".format(pathKey)
    try: 
      cursor.execute(query)
      i = 0
      retstr = "["
      record = ""
      for row in cursor:
        record = "{{ \"PATH_KEY\": {0}, \"ROW_NUM\": {1}, \"PATH_TYPE\": \"{2}\", \"PIN_NAME\": \"{3}\", \"EDGE\": \"{4}\", \"PHASE\": \"{5}\"".format(int(row[0]), int(row[1]), row[2], row[3], row[4], row[5])
        if (row[6] is not None): record += ", \"AT\": {0:.2f}".format(row[6])
        if (row[7] is not None): record += ", \"SLACK\": {0:.2f}".format(row[7])
        if (row[8] is not None): record += ", \"SLEW\": {0:.2f} }}".format(row[8])
        else: record += " }"
        if (i > 0): retstr += ", "
        retstr += "{0}".format(record)
        i += 1
      retstr += " ]"
    except Exception as e:
      print (e)
  finally:
    if (cursor): cursor.close()    
    if (db): db.close()
  return retstr         
  
#------------------------------------------------------------------------------
# Queries summary table sorted by ascending order of slack.
#------------------------------------------------------------------------------
def querySummaryTable(dbfile, keys):
  retstr = "["
  try: 
    db             = sqlite3.connect(dbfile)
    db.row_factory = sqlite3.Row
    cursor = db.cursor()
    if (len(keys) > 0):
      #keylist = getIntListAsStr(keys)
      keylist = keys
      query = "SELECT PATH_KEY, TEST_TYPE, PHASE, PIN_NAME, SLACK FROM ENDPT_SUMMARY WHERE PATH_KEY IN ({0}) ORDER BY SLACK ASC;".format(keylist)
    else:
      query = "SELECT PATH_KEY, TEST_TYPE, PHASE, PIN_NAME, SLACK FROM ENDPT_SUMMARY ORDER BY SLACK ASC;"
    try: 
      cursor.execute(query)
      i = 0
      record = ""
      for row in cursor:
        record = "{{ \"PATH_KEY\": {0},   \"TEST_TYPE\": \"{1}\",   \"PHASE\": \"{2}\",   \"PIN_NAME\": \"{3}\",   \"SLACK\": {4:.2f} }} ".format(row[0], row[1], row[2], row[3], row[4])
        if (i > 0):
          retstr += ",  "
        retstr += "{0}".format(record)
        i += 1
      retstr += " ]"
    except Exception as e:
      print (e)
  finally:
    if (cursor): cursor.close()    
    if (db):    db.close()
  return retstr   

#------------------------------------------------------------------------------
#  Main function
#------------------------------------------------------------------------------
if __name__ == '__main__':
  parser = argparse.ArgumentParser (prog = 'Query endpoint report for eda analytics application')
  parser.add_argument ("--endpt",          "-endpt",             help="Path to sqlite endpoint report.",                  required = True)
  parser.add_argument ("--json",           "-json",              help="Output file name in json format.",                 required = False,  default = "" )
  parser.add_argument ("--query1",         "-query1",            help="Queries summary table.",                           required = False,  default = False, action = "store_true" )
  parser.add_argument ("--keys",           "-keys",              help="Path keys. Specifies paths of interest.",          required = False,  default = ""    )
  parser.add_argument ("--query2",         "-query2",            help="Queries path table for a path.",                   required = False,  default = False, action = "store_true" )
  parser.add_argument ("--query3",         "-query3",            help="Queries path table for a row.",                    required = False,  default = False, action = "store_true" )
  parser.add_argument ("--path_key",       "-path_key",          help="Path key. Specifies path of interest.",            required = False,  default = 0,     type = int )
  parser.add_argument ("--row_num",        "-row_num",           help="Row number. Specifies row in a path of interest.", required = False,  default = -1,    type = int )

  args = parser.parse_args()
  output = ""
  keys = ""

  if (args.keys == "0"):
    args.keys = ""
  
  #print (args.keys)
  #for i in range(len(args.keys)):
  #  keys.append(int(args.keys[i]))

  #if (len(keys) == 1 and keys[0] == 0):
  #    keys = []
  #    args.keys = []

  if (args.query1 == True):
    output = querySummaryTable(args.endpt, args.keys)

  if ((args.query2 == True) and (args.path_key != 0)):
    output = getPath(args.endpt, args.path_key)

  if ((args.query3 == True) and (args.path_key != 0) and (args.row_num > -1)):
    output = getRow(args.endpt, args.path_key, args.row_num)

  if (args.json != ""):
    f = open(args.json, 'w')
    f.write(output)
    f.close()

  print (output)    
