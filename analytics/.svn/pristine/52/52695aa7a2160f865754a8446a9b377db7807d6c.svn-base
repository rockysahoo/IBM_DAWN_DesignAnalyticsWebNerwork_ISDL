#
# Python
# Utilities
#
import gzip
import bz2
import re
import time
import sys
import json
import requests
from cloudantAccountURL import *

#
# gzip and bzip2 file ending match
#
gz_re = re.compile(r'.*.gz')
bz_re = re.compile(r'.*.bz2')
xz_re = re.compile(r'.*.xz')
ws_re = re.compile('\s+')
int_re = re.compile('^\-?\d+$')
float_re = re.compile('^\-?\d+\.\d+$')

#
# Returns an integer for an Unix epoch date
#
def makedate(month, day, year, hhmmssedt):
    try:
        datestring = month + ' ' + day + ' ' + year + ' ' + hhmmssedt
        return int(time.mktime(time.strptime(datestring, '%b %d %Y %H%M%S %Z')))
    except ValueError:
        brokenup = hhmmssedt.split()
        datestring = month + ' ' + day + ' ' + year + ' ' + brokenup[0]
        return int(time.mktime(time.strptime(datestring, '%b %d %Y %H%M%S')))

def makedate2(month, day, year, hhmmss):
    datestring = month + ' ' + day + ' ' + year + ' ' + hhmmss
    return int(time.mktime(time.strptime(datestring, '%b %d %Y %H%M%S')))


def makefiledate(dayname, month, day, hhmmssyr):
    datestring = month + ' ' + day + ' ' + hhmmssyr
    return int(time.mktime(time.strptime(datestring, '%b %d %H%M%S %Y')))

def makeseconds(hhmmss):
    tt = hhmmss.split(':')
    return int(tt[0])*3600 + int(tt[1])*60 + int(tt[2])

def get_filename(fullpathname):
    ff = fullpathname.split('/')
    return ff[-1]

#
# Retrurn the value from a field in the form of an int, float or string
#
def parse_int_float_or_string(field):
    global int_re, float_re
    match = int_re.match(field)
    if match != None:
        return int(field)
    match = float_re.match(field)
    if match != None:
        return float(field)
    return field

#
# Parse a line, takes in a regular expression, returns the groups in a list of tokens
#
def parse_a_line(re, line_ws_re, line):
    tokens = []
    offset = 0
    while offset < len(line):
        match = re.match(line, offset)
        if match is None:
            break
        tokens.append(line_ws_re.sub('',match.group()))
        offset = match.end()
    if len(line) != offset:
        print ' (E) Incomplete tokenization at ' + repr(offset) + ' of line: ' + line
        print ' (E) ' + repr(tokens)
    return tokens

#
# return a string containg the size of the json string for a doc
#
def json_string_size(doc):
    return repr(len(json.dumps(doc)))

#
# Database communications
#
class DBComm:

    def __init__(self, debug, xmit, db):
        global account_url
        self.debug = debug
        self.xmit = xmit
        self.DB = db
        self.URL = account_url
        self.maxtrys = 2
        self.xmit_bytes = 0
        self.xmit_docs = 0
        self.skiped_docs = 0
        
    def get_url(self):
        return self.URL + '/' + self.DB

    def get_view_url(self, view):
        return self.get_url() + '/_design/turbologviewer/_view/' + view

    def sent_bytes(self):
        return self.xmit_bytes
    
    def sent_docs(self):
        return self.xmit_docs

    def unsent_docs(self):
        return self.skiped_docs

    def xmit_doc(self, doc):
        if not self.xmit:
            return
        docsize = json_string_size(doc)
        print '  Transmitting ' + doc['_id'] + ' (' + docsize + ' bytes) to db: ' + self.DB
        if int(docsize) > 100000000:
            print '  Transmission failed, doc is too large!'
            self.skiped_docs += 1
            return
        headers = {'Content-type': 'application/json'}
        db_url = self.get_url() + '?batch=ok'
        repeat = True
        trys = 0
        response = {}
        while repeat and trys < self.maxtrys:
            try:
                response = requests.post(db_url, data=json.dumps(doc), headers=headers)
                repeat = False
            except requests.exceptions.RequestException as e:    
                repeat = True
                trys += 1
                time.sleep(trys*trys*10)
        if response.status_code != 202:
            print '  (E) ' + repr(response.status_code) + ' ' + doc['_id']
            self.skiped_docs += 1
        else:
            print '  Transmission ' + doc['_id']  +' successful.'
            self.xmit_bytes += int(docsize)
            self.xmit_docs += 1

    def xmit_bulk(self, JdocList):
        if not self.xmit:
            return
        if len(JdocList) == 0:
            return
        print '  Transmitting ' + repr(len(JdocList)) + ' docs (' + json_string_size(JdocList) + ' bytes) to db: ' + self.DB
        headers = {'Content-type': 'application/json'}
        if self.debug:
            # one doc at a time
            db_url = self.get_url() + '?batch=ok'
            for doc in JdocList:
                try:
                    response = requests.post(db_url, data=json.dumps(doc), headers=headers)
                    if response.status_code != 202:
                        print '  (E) ' + repr(response.status_code) + ' ' + doc['_id'] + ', Size:' + json_string_size(doc)
                        self.skiped_docs += 1
                    else:
                        print '  Transmission ' + doc['_id']  + ' successful.'
                        self.xmit_bytes += int(docsize)
                        self.xmit_docs += 1
                except requests.exceptions.RequestException as e:
                    print '  (E) Transmission failed for doc ' + doc['_id'] + ' Size:' + json_string_size(doc)
                    self.skiped_docs += 1
        else:
            # all docs at once
            BulkJdoc = {}
            BulkJdoc['docs'] = JdocList
            docsize = json_string_size(BulkJdoc)
            db_url = self.get_url() + '/_bulk_docs?batch=ok'
            repeat = True
            trys = 0
            while repeat and trys < self.maxtrys:
                try:
                    response = requests.post(db_url, data=json.dumps(BulkJdoc), headers=headers)
                    data = response.json()
                    repeat = False
                except requests.exceptions.RequestException as e:    
                    repeat = True
                    trys += 1
                    time.sleep(trys*trys*10)
            if repeat:
                print '  (E) Transmission failed, after trying ' + repr(trys) + ' times. Size:' + json_string_size(JdocList)
                print '      Exception:' + repr(e)
                print '      Trying debug transmit, one doc at a time. '
                self.debug = True
                self.xmit_bulk(JdocList)
                self.debug = False
            else:
                errorcount = 0
                doccount = 0
                for entry in data:
                    doccount += 1
                    if 'error' in entry:
                        errorcount += 1
                        print '  (E) ' + entry['error'] + ' ' + entry['id']
                if errorcount == 0:
                    print '  Transmitted ' + repr(doccount) + ' documents successfully'
                    self.xmit_bytes += int(docsize)
                    self.xmit_docs += len(JdocList)

    def xmit_bulk_safe(self, JdocList):
        # break up doc list into sets of 50- docs at a time
        # number of docs is arbitrary, at about 64M+ cloudant starts refusing doclists
        max_docs = 50
        num_docs = len(JdocList)
        myJdocList = []
        for doc in JdocList:
            myJdocList.append(doc)
            if len(myJdocList) == max_docs:
                self.xmit_bulk(myJdocList)
                myJdocList = []
        if len(myJdocList) > 0:
            self.xmit_bulk(myJdocList)   

    def FindId(self, id):
        db_url = self.get_url() + '/_all_docs';
        params = {
            "startkey":"\"" + id + "\"",  
            "endkey":"\"" + id + "\""
            }
        response = requests.get(db_url, params=params)
        data = response.json()
        if not 'rows' in data:
            return 0
        return len(data['rows'])

    def FetchDoc(self, id):
        db_url = self.get_url() + '/' + id;
        response = requests.get(db_url)
        data = response.json()
        return data

    def FetchAttachment(self, id, attachment):
        db_url = self.get_url() + '/' + id + '/' + attachment;
        response = requests.get(db_url)
        return response.content

    # https://gusetellez.cloudant.com/testdb3/_all_docs?startkey=%22arjen_1407167426_fshlnx10ao_12985%22&endkey=%22arjen_1407167426_fshlnx10ao_12985
    # https://gusetellez.cloudant.com/testdb3/_all_docs?startkey=%22arjen_1407167426_fshlnx10ao_12985%22&endkey=%22arjen_1407167426_fshlnx10ao_12985\ufff0%22
    def UniqueIdCheck(self, rootid, delete):
        print '  Checking uniqueness of id ' + rootid
        numrows = self.FindId(rootid)
        if numrows > 0:
            print '  Id ' + rootid + ' is not unique.'
            if delete:
                self.DeleteId(rootid)
        else:
            print '  Id ' + rootid + ' is unique'
            return True
        return False

    def GetAllDocs(self, rootid, alldata):
        db_url = self.get_url() + '/_all_docs'
        headers = {'Content-type': 'application/json'}
        if alldata:
            params = {
                "include_docs": "true",
                "startkey":"\"" + rootid + "\"",  
                "endkey":"\"" + rootid + "\ufff0\""
                }
        else:
            params = {
                "startkey":"\"" + rootid + "\"",  
                "endkey":"\"" + rootid + "\ufff0\""
                }
        response = requests.get(db_url, params=params)
        data = response.json()
        return data

    def GetAppidDocs(self, rootid, alldata):
        db_url = self.get_view_url('appids')
        headers = {'Content-type': 'application/json'}
        if alldata:
            params = {
                "include_docs": "true",
                "startkey":"\"" + rootid + "\"",  
                "endkey":"\"" + rootid + "\ufff0\""
                }
        else:
            params = {
                "startkey":"\"" + rootid + "\"",  
                "endkey":"\"" + rootid + "\ufff0\""
                }
        response = requests.get(db_url, params=params)
        data = response.json()
        return data

    def DeleteId(self, rootid):
        if not self.xmit:
            return
        print '  Deleting all ids: ' + rootid 
        db_url = self.get_url() + '/_all_docs'
        headers = {'Content-type': 'application/json'}
        params = {
            "startkey":"\"" + rootid + "\"",  
            "endkey":"\"" + rootid + "\ufff0\""
            }
        response = requests.get(db_url, params=params)
        bulkdocs = { "docs": [] }
        data = response.json()
        for entry in data['rows']:
            doc = {
                "_id": entry["id"],
                "_rev": entry["value"]["rev"],
                "_deleted": True
                }
            bulkdocs["docs"].append(doc)
        db_url = self.get_url() + '/_bulk_docs?batch=ok'
        response = requests.post(db_url, headers=headers, data=json.dumps(bulkdocs))
        errorcount = 0
        doccount = 0
        data = response.json()
        for entry in data:
            doccount += 1
            if 'error' in entry:
                errorcount += 1
                print '  (E) ' + entry['error'] + ' ' + entry['id']
        if errorcount == 0:
            print '  Deleted ' + repr(doccount) + ' documents successfully'

#
# Transmit a json
#
def JsonXmit(db, JdocList, debug):
    print 'Transmitting to db: ' + db
    data = {}
    if len(JdocList) == 0:
        return data
    headers = {'Content-type': 'application/json'}
    if debug:
        # one doc at a time
        db_url = account_url + '/' + db + '?batch=ok'
        for doc in JdocList:
            response = requests.post(db_url, data=json.dumps(doc), headers=headers)
            if response.status_code != 201:
                print ' (E) ' + repr(response.status_code) + ' ' + doc['_id']
                # print json.dumps(doc, indent=4, separators=(',', ': '))
    else:
        # all docs at once
        BulkJdoc = {}
        BulkJdoc['docs'] = JdocList
        db_url = account_url + '/' + db + '/_bulk_docs?batch=ok'
        repeat = True
        trys = 0
        while repeat and trys < 6:
            try:
                response = requests.post(db_url, data=json.dumps(BulkJdoc), headers=headers)
                data = response.json()
                repeat = False
            except requests.exceptions.RequestException as e:    
                repeat = True
                trys += 1
                time.sleep(trys*trys*10)
        if repeat:
            print ' Transmission failed, after trying ' + trys + ' times. Exception:' + e
        else:
            errorcount = 0
            doccount = 0
            for entry in data:
                doccount += 1
                if entry['error']:
                    errorcount += 1
                    print ' (E) ' + entry['error'] + ' ' + entry['id']
            if errorcount == 0:
                print 'Transmitted ' + repr(doccount) + ' documents successfully'
    return data


