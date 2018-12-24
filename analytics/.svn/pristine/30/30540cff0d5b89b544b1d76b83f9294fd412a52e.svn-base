
import re
import json
import time
import base64
from eLogUtils import *

#
# Open, load and encode a png file
#
def encode_png_file(fullfilename, dict):
    try:
        f = open(fullfilename, 'r')
        print ' Saving ' + get_filename(fullfilename)
        dict["content_type"] = 'image/png'
        dict["data"] = base64.b64encode(f.read())
        f.close()
    except IOError:
        return

#
# Determine whether an input file is gziped or not, and encode accordingly
#
def encode_text_file(fullfilename, dict):
    global gz_re
    match = gz_re.match(fullfilename)
    if match != None:
        encode_gzip_file(fullfilename, dict)
    else:
        encode_plain_text_file(fullfilename, dict)
    
#
# Open, load and encode a raw, gziped log file
#
def encode_gzip_file(fullfilename, dict):
    try:
        f = open(fullfilename, 'r')
        print ' Saving ' + get_filename(fullfilename)
        dict["content_type"] = 'application/gzip'
        dict["data"] = base64.b64encode(f.read())
        f.close()
    except IOError:
        return
    
#
# Open, load and encode a raw, text log file
#
def encode_plain_text_file(fullfilename, dict):
    try:
        f = open(fullfilename, 'r')
        print ' Saving ' + get_filename(fullfilename)
        dict["content_type"] = 'text/plain'
        dict["data"] = base64.b64encode(f.read())
        f.close()
    except IOError:
        return
    


