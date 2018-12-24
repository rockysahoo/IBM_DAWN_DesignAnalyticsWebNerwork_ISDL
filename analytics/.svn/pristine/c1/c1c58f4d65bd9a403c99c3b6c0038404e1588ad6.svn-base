
#
# Python
# Fetch the raw file attachments from an entry and save to a local file system
#
import gzip
import bz2
import re
import argparse
import threading
import json
import os
import requests
from eLogUtils import *
from cloudantAccountURL import *

def SaveAttachmentFile(Xmitter, id, filename):
    filedata = Xmitter.FetchAttachment(id, filename)
    f = open(filename, 'wb')
    f.write(filedata)
    f.close()

if __name__ == '__main__':
    #
    # Parse the command line, get the id 
    #
    cmdlineparser = argparse.ArgumentParser(description='Fetch raw logfiles from Cloudant.')
    cmdlineparser.add_argument('-id', help='Cloudant run database id')
    args = cmdlineparser.parse_args()
    args = cmdlineparser.parse_args()
    rootid = args.id

    db = 'testdb3'
    Xmitter = DBComm(False, False, db)
    Threads = []

    if Xmitter.FindId(rootid):
        print ' Id ' + rootid + ' was found in the database. '
        rawlogfileid = rootid + '_raw'
        if Xmitter.FindId(rawlogfileid):
            print ' Id ' + rawlogfileid + ' was found in the database. '
            data = Xmitter.FetchDoc(rawlogfileid)
            for filename in data['_attachments']:
                print '  ' + filename
                t = threading.Thread(target=SaveAttachmentFile, args=(Xmitter, rawlogfileid, filename))
                t.start()
                Threads.append(t)
            print 'Saving .... '
            for t in Threads:
                t.join()
            print 'Done'
        else:
            print ' Id ' + rawlogfileid + ' was not found in the database. '
    else:
        print ' Id ' + rootid + ' was not found in the database. '


