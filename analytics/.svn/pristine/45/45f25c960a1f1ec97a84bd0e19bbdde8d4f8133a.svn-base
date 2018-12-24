'''
Created on Apr 1, 2015

@author: RW Taggart

This module is responsible for serving HTTP requests. It will 
generate responses to the browser asking for it.

NOTE: this module is here for histoy and is out of date. 
'''

from http.server import BaseHTTPRequestHandler
import socketserver
import socket
import enzWebTools.NiofDataGen2 as dataGen
import sys
# import urlparse

debug = 1

class ReportServiceHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        print("Serving do_GET from my stuff.")
        
#         self.parse_request()
        print("request line: " + self.requestline)
#         parsed_path = urlparse(self.path)
        path_parts = self.path.split('?')
        query = None
        if (len(path_parts) > 1):
            query = path_parts[1].split('=')

        if query != None:
            print("DEBUG:  ")
            for name in query:
                print("{}, ".format(name))
#             
#         message_parts = [
#                           'CLIENT VALUES'
#                           , 'client_address=%s (%s)' % (self.client_address, self.address_string())
#                           , 'command=%s' % self.command
#                           , 'path=%s' % self.path
#                           , 'real path=%s' % parsed_path.path
#                           , 'query=%s' % parsed_path.query
#                           , 'request_version' % self.request_version
#                           , ''
#                           , 'SERVER VALUES:'
#                           , 'server_version=%s' % self.server_version
#                           , 'sys_version=%s' % self.sys_version
#                           , 'protocol_version=%s' % self.protocol_version
#                           , ''
#                           , 'HEADERS RECEIVED:'
#                           ,]
#         for name, value in sorted(self.headers.items()):
#             message_parts.append('%s=%s' % (name, value.rstrip()))
#             
#         message_parts.append('')
#         message = '\r\n'.join(message_parts)
#         
        self.send_response(200)
        self.end_headers()
#         self.wfile.write(message)

        
#         print("request=" + self.request)
#         print("r.path=" + self.path)
#         print("r.command" + self.command)
#         print("r.header" + self.header)
        
#         self.send_response(200)
#         self.send_header("content-type", "text/html")
#         self.end_headers()
#         self.wfile.write(b"Hello world! This is my contribution.")
        
#         self.wfile.write(bytearray("Query: {}".format(str(query)), 'utf-8'))
        
        appname = "VICTIM"
        title = "Victims Sorted By Slack"
        htmlName = "VictimSummary.html"
        content = ""
        if (query == None):
            print("QUERY IS NONE")
            content = dataGen.executeSummaryQuery(appname, title, htmlName)
        elif (len(query) > 0):
            vname = query[1]
            if (debug):  print("(D)  victim name = {}".format(vname))
            content = dataGen.executeDetailsQuery2(appname, title, htmlName, vname)
            
        self.wfile.write(bytearray(content, 'utf-8'))
        return

class ReportServer:
    MAX_PORT_ATTMPTS=100
    
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
    
    def startServer(self, port):
            handler = ReportServiceHandler
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
            httpd.serve_forever()

if __name__ == "__main__":
    port = 8000
    print("Executing Server in 'test' environment")
    
    args = sys.argv
    print("Arguments given:  {}".format(str(args)))
    if (args != None and len(args) > 1 and args[1] != None):
        port = int(args[1])
    
    ReportServer.startServer(port);
