'''
Created on Apr 13, 2015

@author: rwt
'''
import sys
import argparse
from webTools.ReportService import ReportServer, ReportServiceHandler
from enzWebTools.enzHtmlHandler import enzHTMLHandler
from webTools.dataBase import SQLiteDataBase
from enzWebTools import NiofDataGen2, NIOFReportService

#def processArgs(port, dbFileLocation):
#    args = sys.argv
#
#    if len(args) > 2):
#        dbFileLocation = args[2]
#        port = int(args[1])
#    elif len(args) > 1:
#        port = int(args[1])
#    
#    return [port, dbFileLocation]

if __name__ == "__main__":
    #Entry point for application
    port = 8000
    dbFileLocation="./niof.data"
    htmlTemplateFile="victimNetSummaryTemplate.html"
    
#    port, dbFileLocation = processArgs(port, dbFileLocation)

    # Parse Args
    argparser = argparse.ArgumentParser(description='webNiofGui.py Command Line Parser')
    argparser.add_argument('port', type=int, nargs="?", default=port, help='port number for application server')
    argparser.add_argument('dbFileLoc', nargs="?", default=".", help='file location of SQLite file')
    argparser.add_argument('-genStatic', action='store_true', help='Generate Static HTML files in current directory')

    args = argparser.parse_args()
    
    if (args.dbFileLoc):
        dbFileLocation = args.dbFileLoc
   
    # Get DB Access 
    db = SQLiteDataBase("NIOF", dbFileLocation)
    
    htmlHandler = enzHTMLHandler(db, htmlTemplateFile)
    requestHandler = ReportServiceHandler

    ReportServer().startServer(args.port, requestHandler, htmlHandler)


