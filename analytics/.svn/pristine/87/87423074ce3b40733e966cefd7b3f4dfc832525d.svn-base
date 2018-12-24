#
# Python
# Parser of EDA logfiles, will send the results into a CLOUDANT database
#
import gzip
import bz2
import re
import argparse
import json
import os
import datetime
import requests
from eLogUtils import *
from eLogFile import *
from eLogTopParser import *
from cloudantAccountURL import *

if __name__ == '__main__':

    print 'EDA Log Parser begin. Run starting at ' + datetime.datetime.today().isoformat(' ')
    #
    # Parse the command line, get the file, handle gziped files
    #
    cmdlineparser = argparse.ArgumentParser(description='EDA logfile parser.')
    cmdlineparser.add_argument('-f', help='file to be parsed')
    cmdlineparser.add_argument('-json', help='produce json files')
    cmdlineparser.add_argument('-xmit', nargs='?', const='true', default='false', help='transmit json files')
    cmdlineparser.add_argument('-bulk', nargs='?', const='false', default='true', help='use bulk transmit')
    args = cmdlineparser.parse_args()
    filename = args.f
    jsonfile = args.json
    print 'xmit = ' + args.xmit 
    print 'bulk = ' + args.bulk
    debug = False
    if args.bulk == 'false':
        debug = True
    xmit = False
    if args.xmit == 'true':
        xmit = True
    db = 'testdb3'
    Xmitter = DBComm(debug, xmit, db)
    FileStack = eLogSplitFile()
    Parser = LogParser(os.path.abspath(filename), FileStack, Xmitter)
    FileStack.pushFile(filename)

    #
    # Pattern matching rules for basic nutshell
    #   - look at one line at a time
    #   - concatenate lines if line continuation character is found
    #   - concatenate lines if pattern is matched that requires multiple lines
    #   - pass matched line to the next level of parsing
    #
    
    #	| 'Install' 'Directory:' String NL									# Install
    #	| 'Current' 'Directory:' String NL									# Cdir
    #	| 'Starting:' String String String String String String NL						# Starting
    #	| 'Machine:' String+ NL											# Machine
    #	| 'Process:' String+ NL			            							# Process
    #	| 'Loading:' String+ NL											# Loading1
    #	| ('[IDM-48]:' | '[IMS-160]:') 'Loading:' String+ NL							# Loading2
    #	| 'Binding:' String NL String+ NL									# Binding
    #	| '[ucon-1]:' 'Starting:' String+ NL									# Ucon1A
    #	| '[ucon-1]:' String String 'Starting:' String+ NL							# Ucon1B
    #	| '[ucon-5]:' String String 'Continuing:' String+ NL							# Ucon1C
    #	| '[ucon-2]:' 'Ended:' String+ NL									# Ucon2A
    #	| '[ucon-2]:' String String 'Ended:' String+ NL								# Ucon2B
    #	| '[ucon-3]:' String+ NL										# Ucon3
    #
    # This command used Python auto concatenate!
    # Last entry should not have an or
    basic_match_re = re.compile(
        '^\w[\w\s]+\w+: |'
        '^\S+\w+: |'
        '^\[\S+\]: |'
        '^\[\S+\] |'
        '^Process took |'
        '^Used '
        )

    #
    # Main loop. Note that a line cache is created for runtime.
    #
    linecount = 0
    charcount = 0
    contcount = 0
    matchcount = 0
    concatline = ''
    # loop until the file has been
    #while 1:
    #    # cache in a bunch of lines
    #    lines = fobject.readlines(100000)
    #    if not lines:
    #        break
    #    # read over the lines in the cache
    #    # for line in lines:
    while not FileStack.eof():
        # for il in range(0, len(lines)):
        # line = lines[il]
        line = FileStack.getLine()
        Parser.rawlinecount += 1
        Parser.rawcharcount += len(line)
        # check if the line has a continuation character
        match = Parser.cont_line_re.match(line)
        # check if the line has a recognizable token
        match2 = basic_match_re.match(line)
        if match2 != None:
            matchcount += 1
        # remove concatenation and eol
        cleanline = Parser.cont_line_ws_re.sub(' ',line)
        concatline = concatline + cleanline
        if match != None:
            contcount += 1
        elif match2 != None and (match2.group() == 'Binding:' or match2.group()[:7] == '[ET-18]'):
            contcount += 1
        elif match2 != None and match2.group().strip() == 'ete::region::evaluate:' and line[-2] == ':':
            contcount += 1
        else:
            # the line is ready and good to parse
            linecount += 1
            charcount += len(concatline)
            match2 = basic_match_re.match(concatline)
            if match2 != None:
                Parser.parse_top_line(match2,concatline)
            concatline = ''
            
    # close the top logfile
    # fobject.close()

    # save json
    if jsonfile != None:
        jobject = open(jsonfile, 'w')
        jobject.write( json.dumps(Parser.JdocList, indent=4, separators=(',', ': ')) )
        jobject.close()

    # wait until all threads are done
    Parser.wait_until_threads_done()

    # transmit data
    Xmitter.xmit_bulk_safe(Parser.JdocList)
    
    Parser.print_unmatched()
    print 'Read ' + repr(Parser.rawlinecount) + ' raw lines ' + repr(Parser.rawcharcount) + ' raw characters '
    print 'Transmitted a total of ' + repr(Xmitter.sent_bytes()/1024/1024) + ' Mb in ' + repr(Xmitter.sent_docs()) + ' documents. ' + repr(Xmitter.unsent_docs()) + ' documents were not transmitted.'
    print 'Parsed ' + repr(matchcount) + ' lines out of ' + repr(linecount) + ' lines in ' + filename
    print 'DB root id: ' + Parser.RootId()

    print 'EDA Log Parser end. Run ended at ' + datetime.datetime.today().isoformat(' ')
