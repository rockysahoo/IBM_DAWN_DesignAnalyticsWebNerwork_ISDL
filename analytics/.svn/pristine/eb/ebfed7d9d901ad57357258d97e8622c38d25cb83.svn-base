
#
# Python
# Parser of Big Brother files
#
import gzip
import bz2
import re
import argparse
import json
import os
import requests
import threading
import copy
from eLogUtils import *

#
# RE for parse
#
word_re = re.compile('\S+\s+|\S+$')

#
# Create the _id field if it does not exist and if all the data is there
#
def check_and_add_id(Jdoc, docint):
    if '_id' in Jdoc:
        pass
    else:
        if 'user' in Jdoc:
            if 'start_time' in Jdoc:
                if 'host' in Jdoc:
                    shorthost = Jdoc['host'].split('.')[0]
                    rootid = Jdoc['user'] + '_' + Jdoc['start_time'] + '_' + shorthost  + '_' + str(docint)
                    Jdoc['_id'] = rootid

#
# Manage threaded xmit
#
def ThreadedJsonXmit(Threads, JdocList):
    t = threading.Thread(target=JsonXmit, args=('bigbrother2', copy.deepcopy(JdocList), False));
    t.start()
    Threads.append(t)
    JdocList = []
    if len(Threads) > 4:
        for t in Threads:
            t.join()
        Threads = []
                        
#
# Parse a set of BB lines
#
def ParseBB(fname, lines, xmit):
    print(' Parsing ', fname) 
    Threads = []
    Jdoc = {}
    JdocList = []
    doccount = 0
    continuation = False
    contkey = ''
    # read over the lines in the cache
    for line in lines:
        if len(line) > 0:
            if continuation:
                if line[0] == '^':
                    continuation = False
                else:
                    Jdoc[contkey].append(line[:len(line)-1])
            else:
                if line[0] == '$':
                    tokens = parse_a_line(word_re, ws_re, line[1:])
                    if len(tokens) == 2:
                        Jdoc[tokens[0]] = tokens[1]
                    else:
                        Jdoc[tokens[0]] = tokens[1:]
                elif line[0] == '@':
                    contkey = line[1:len(line)-1]
                    Jdoc[contkey] = []
                    continuation = True
                elif line[0] == '&':
                    if xmit:
                        doccount += 1
                        check_and_add_id(Jdoc,doccount)
                        Jdoc_copy = copy.deepcopy(Jdoc)
                        JdocList.append(Jdoc_copy)
                        if len(JdocList) > 999:
                            JsonXmit('bigbrother2', copy.deepcopy(JdocList), False)
                            JdocList = []
                            # ThreadedJsonXmit(Threads, JdocList)
                    Jdoc = {}
    # Transmit?
    if xmit:
        JsonXmit('bigbrother2', copy.deepcopy(JdocList), False)
        #ThreadedJsonXmit(Threads, JdocList)
        # Wait until the threads are done
        #for t in Threads:
        #    t.join()
    return doccount

