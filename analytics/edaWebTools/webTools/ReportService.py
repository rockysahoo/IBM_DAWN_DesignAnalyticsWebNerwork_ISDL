'''
Created on Apr 1, 2015

@author: RW Taggart

This module is responsible for serving HTTP requests. It will 
generate responses to the browser asking for it. 
'''

from http.server import BaseHTTPRequestHandler
from urllib.parse import urlparse
import socketserver
import socket
import sys
from tkinter import Tk
import os.path

debug = 1

###
# TODO: Set up generic functions for relaying messages to the user. 
#       Mostly for error conditions
###

class ReportServiceHandler(BaseHTTPRequestHandler):
    dataGen = None
    registeredApps = ['VICTIM', 'enz']
        
    def do_GET(self):
      try:
        print("GET request: " + self.requestline)

        parsedURL = urlparse(self.path)
        if debug:  print("(D):  {}".format(str(parsedURL)))

        queryStr = parsedURL.query
        path = parsedURL.path

        if 'iso' in os.path.basename(os.path.normpath(path)):
            self.send_response(404)
            self.end_headers()
            self.wfile.write(bytearray("Could not find requested page.", 'utf-8'))
            return
        else:
            print("(D):  GET Request OK")
        
        appname = self.registeredApps[1]
        if path:
            #Check the last value in the path for 'registered apps'
            if path in self.registeredApps:
                appname = path
        
        query = None
        if queryStr:
            query = dict(item.split("=") for item in queryStr.split("&"))

        if query != None:
            print("DEBUG:  ")
            print(query)
            # NOTE:  Don't uncomment the following. Causes a crash. "too many values to unpack"
#            for name, val in query:
#               print("{}={}, ".format(name, val))

        if query and 'file' in query:
            #Don't do this for the "root"
            self.dataGen.setDbLoc(query['file'])
            del query['file']

        title = "Victims Sorted By Slack"
        htmlName = "VictimSummary.html"
        content = None
        if (not query):
            content = self.dataGen.getIndexPage(**query)
        elif (len(query) > 0):
            content = self.dataGen.getHTMLPage(appname, **query)
            vname = query['vid']
            if (debug):  print("(D)  victim name = {}".format(vname))
            
        
        if content == None:
            self.send_response(404)
        else:
            self.send_response(200)
        
        self.end_headers()
        
        if content != None:
            self.wfile.write(bytearray(content, 'utf-8'))
        else:
            self.wfile.write(bytearray("Could not find requested page.", 'utf-8'))
        return

      except Exception as e:
        self.send_response(404)
        self.end_headers();
        self.wfile.write(bytearray("An error has occured. {}".format(e), 'utf-8'))
        raise

class ReportServer:
    MAX_PORT_ATTMPTS=100
    
    def copyToClipboard(self, string):
        try:
            r = Tk()
            r.withdraw()
            r.clipboard_clear()
            r.clipboard_append(string);
            r.destroy()
        except:
            print("(E):  Could not copy URL to clipboard.")
    
    def checkPort(self, port):
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        if (sock.connect_ex(("localhost", port)) == 0):
            return True
        else:
            return False
        
    def findOpenPort(self, startingPort):
        testPort = startingPort
        while ( not self.checkPort(testPort)):
            if (testPort - startingPort > self.MAX_PORT_ATTMPTS):
                break
            testPort += 1
        return testPort
    
    def startServer(self, port, requestHandler, dataGen):
            handler = requestHandler
            handler.dataGen = dataGen
            useport = port
    #         useport = self.findOpenPort(port)
    #         if (checkPort(port)):
    #             useport = port
    #         else:
    #             useport = port+1
            if (useport < 1024):
                print("(E): can not open port below 1024. Super user access required.")
                
            httpd = socketserver.TCPServer(("", useport), handler);
            
            print("Starting HTTP Server at port " + str(useport))
            print("URL:  {url}:{port}/".format(url=socket.gethostname(), port=port))
            
            self.copyToClipboard("{url}:{port}".format(url=socket.gethostname, port=port))
            
            httpd.serve_forever()


if __name__ == "__main__":
    #Test Function.
    port = 8000
    print("Executing Server in 'test' environment")
    
    args = sys.argv
    print("Arguments given:  {}".format(str(args)))
    if (args != None and len(args) > 1 and args[1] != None):
        port = int(args[1])
    
    ReportServer.startServer(port);
