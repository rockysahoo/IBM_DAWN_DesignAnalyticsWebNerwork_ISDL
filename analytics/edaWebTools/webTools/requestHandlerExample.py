'''
Created on Apr 1, 2015

@author: RW Taggart

This is a simple example based on one from the internet.
'''
from http.server import BaseHTTPRequestHandler, HTTPServer
from socketserver import TCPServer

class ExampleHTTPHandler(BaseHTTPRequestHandler):
    
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'text/html')
        self.end_headers()
        self.wfile.write(b'Hello World!')
        return
    

if __name__ == "__main__":
    port = 8000
    
#     exampleServer = HTTPServer(("", port), ExampleHTTPHandler)
    exampleServer = TCPServer(("", port), ExampleHTTPHandler)
    print ("Started server on port " + str(port)  + ".")

    try:
        exampleServer.serve_forever()
    
    except KeyboardInterrupt:
        exampleServer.socket.close()