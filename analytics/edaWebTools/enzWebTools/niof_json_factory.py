'''
Created on Jun 29, 2015

@author: rwt

This module is used to create JSON documents from NIOF SQLite data files.
It uses the queries from enzConfig.py
'''
import sqlite3
import argparse
from enzWebTools import enzConfig
from webTools.webToolsUtils import strToFile
import json

JSON_FILE = "json.out"

def jsonFactory(cursor, tuple):
    ''' This function will return JSON formatted code using dicts and arrays 
        for SQLite queries. '''
    rtnDict = {}
    for colIdx, colName in enumerate(cursor.description):
        rtnDict[colName[0]] = tuple[colIdx]
    return rtnDict


def getSqliteCursor(filename):
    ''' Connect to an sqlite database. '''
    conn = sqlite3.connect(filename)
    conn.row_factory = jsonFactory
    return conn, conn.cursor()

def clearJSONFile():
    output = open(JSON_FILE, "w")
    output.write("")
    output.close()

def appendJSONFile(text, fileName):
    '''Write a file wtih the given name and text'''
    output = open(fileName, "a")
    output.write(text)
    output.write('\n')
    output.close()

def printJSON(cursor):
    #print(json.dumps(cursor.fetchall(), indent=2))
    appendJSONFile(json.dumps(cursor.fetchall(), indent=2), JSON_FILE)

def parseArgs():
    # Parse Args
    argparser = argparse.ArgumentParser(description='json_sqlite_factory.py Command Line Parser')
    argparser.add_argument('dbFileLoc', nargs="?", default=".", help='file location of SQLite file')

    args = argparser.parse_args()
    
    if (args.dbFileLoc):
        return args.dbFileLoc

if __name__ == '__main__':
    clearJSONFile()
    fileName = '/afs/eda.fishkill.ibm.com/u/rwt/project/sqlite/l3dactl_pmac.niof.data'
    fn       = parseArgs()
    if (fn):
       fileName = fn
   
    print("(I):  Using File '{}'".format(fileName))
    print('\r'+"(I):  Querying File (Summary)...", end='')
    dbConn, cursor = getSqliteCursor(fileName)
    cursor.execute(enzConfig.summaryQuery)
    
    print('\r'+"(I):  Printing JSON (Summary)...", end='')
    #print("Summary Results:")
    appendJSONFile("Summary Results:", JSON_FILE)
    printJSON(cursor)
    
    print('\r'+"(I):  Querying File (Detailed)...", end='')
    victimName = 'tc_l3_lbist_ac_mode_dc'
    rhsQuery = enzConfig.rightHandSideQuery.format(vname=victimName)
    cursor.execute(rhsQuery)
    #print("Sink Results:")
    appendJSONFile("Sink Results:", JSON_FILE)
    print('\r'+"(I):  Printing JSON (Detailed)...", end='')
    printJSON(cursor)
    
    dbConn.close()
    print('\r'+"Done.", end='\n')


