
#
# Python
# Retrieve a logfile worth of parsed data, given its id
#
import gzip
import bz2
import re
import argparse
import json
import os
import requests
from eLogUtils import *
from cloudantAccountURL import *

if __name__ == '__main__':
    #
    # Parse the command line, get the id 
    #
    cmdlineparser = argparse.ArgumentParser(description='Fetch parsed logfiles from Cloudant.')
    cmdlineparser.add_argument('-id', help='Cloudant run database id')
    cmdlineparser.add_argument('-all', nargs='?', const='true', default='false', help='return all document ids')
    args = cmdlineparser.parse_args()
    rootid = args.id
    alldocs = args.all

    db = 'testdb3'
    Xmitter = DBComm(False, False, db)

    if Xmitter.FindId(rootid):
        print ' Id ' + rootid + ' was found in the database. '
        data1 = Xmitter.GetAllDocs(rootid, False)
        data2 = Xmitter.GetAppidDocs(rootid, False)
        if alldocs == 'true':
            numdocs = len(data1['rows'])
            for entry in data1['rows']:
                print '  ' + entry["id"]
        else:
            numdocs = len(data2['rows'])
            data2 = Xmitter.GetAppidDocs(rootid, False)
            for entry in data2['rows']:
                print '  ' + entry["id"] + ' ' + entry["value"][0]
        if len(data1['rows']) != len(data2['rows']):
            print ' Some (' + repr(len(data1['rows'])- len(data2['rows']))  + ') documents have no appids'
        print ' Found ' + repr(numdocs) + ' documents. '
    else:
        print ' Id ' + rootid + ' was not found in the database. '
