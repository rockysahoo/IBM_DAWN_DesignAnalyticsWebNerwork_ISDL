#
# Python
# Parser of one Big Brother file
#
import gzip
import bz2
import re
import argparse
import json
import os
import requests
from bbParse.py import *

#
# Parse the command line, get the file, handle gziped files
#
cmdlineparser = argparse.ArgumentParser(description='Big Brother file parser.')
cmdlineparser.add_argument('-f', help='file to be parsed')
cmdlineparser.add_argument('-json', help='produce json files')
cmdlineparser.add_argument('-xmit', nargs='?', const='true', default='false', help='transmit json files')
cmdlineparser.add_argument('-bulk', nargs='?', const='false', default='true', help='use bulk transmit')
args = cmdlineparser.parse_args()
filename = args.f
jsonfile = args.json
print(' xmit    = ', args.xmit )
print(' bulk = ', args.bulk )

match = gz_re.match(filename)
if match != None:
    print('Got a gzip file!')
    fobject = gzip.open(filename, 'r')
else:
    print('Got a normal file')
    fobject = open(filename, 'r')

# Main loop. Note that a line cache is created for runtime.
lines = fobject.readlines()

# parse
ParseBB(filename, lines, False, False)

# close the top logfile
fobject.close()
