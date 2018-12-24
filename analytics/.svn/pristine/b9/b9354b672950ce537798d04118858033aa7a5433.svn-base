#
# Python
# Parser of ET custom endpoint reports
#
import gzip
import bz2
import re
import argparse
import json
import os
import string
import requests
import sys
from eLogUtils import *
from cloudantAccountURL import *

#
# Endpoint Report parser class
#
# Calling parse_endpoint_report shoild be thread safe if:
#   - No global variables are used
#   - All processing is done with local or class local variables
#   - There copy of EnpointParser used by the thread is unique
#
class EndpointParser:

    def __init__(self, xmitter):
        self.xmitter = xmitter
        #
        # regexps
        #
        self.not_ws_re = re.compile('\s*\S+\s+')
        self.float_re = re.compile('[0-9\.]+')
        self.gz_re = re.compile(r'.*.gz')
        self.ws_re = re.compile('\s+')
        # top level pattern catcher
        self.endp_match_re = re.compile(
            '^\s+Design|'
            '^\s+TimingMode|'
            '^\s+DelayMode|'
            '^\s+Options'
            )
        self.endphide_match_re = re.compile(
            '^Possible Hide Values:'
            )
        self.endphideend_match_re = re.compile(
            '^NOTES:'
            )
        self.endpstart_match_re = re.compile(
            '^\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-'
            )
        self.endpstartsp_match_re = re.compile(
            '^\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.'
            )
        self.endpcomment_match_re = re.compile(
            '^#.*|'
            '^\[PDSCUST\]:|'
            '^.+Included Adjust.*'
            )

    
    #
    # Parse a sentence in a path
    #
    def parse_path_sentence(self, endp_doc, line, first, subpath, pathid):
        tokens = parse_a_line(self.not_ws_re, self.ws_re,  line)
        # print repr(tokens)
        
    #
    # Parse Possible Hide Values
    #
    def parse_endpoint_hide(self, endp_doc, line):
        tokens = line.split(':')
        tokens = parse_a_line(self.not_ws_re, self.ws_re, tokens[-1])
        endp_doc['Hidevalues'] = tokens

    def parse_endpoint_design(self, endp_doc, line):
        tokens = line.split(':')
        endp_doc['Design'] = self.ws_re.sub('',tokens[-1])

    def  parse_endpoint_timingmode(self, endp_doc, line):
        tokens = line.split(':')
        endp_doc['Timingmode'] = self.ws_re.sub('',tokens[-1])

    def  parse_endpoint_delaymode(self, endp_doc, line):
        tokens = line.split(':')
        endp_doc['Delaymode'] = self.ws_re.sub('',tokens[-1])

    def parse_endpoint_options(self, endp_doc, line):
        tokens = line.split(':')
        tokens = parse_a_line(self.not_ws_re, self.ws_re, tokens[-1])
        endp_doc['Options'] = tokens

    def parse_comment_line(self, endp_doc, line, pathid):
        if line[:23] ==  '#      Early Mode Trace':
            return 1
        elif line[:15] == '# (Path_delay =':
            tokens = parse_a_line(self.not_ws_re, self.ws_re,  line)
            wire_delay = float(tokens[9])
            full_gate_delay = float(tokens[15])
            buffer_delay = float(tokens[20])
            cycle_time = float(tokens[26])
            endp_doc[pathid]['Wiredelay'] = wire_delay
            endp_doc[pathid]['Bufferdelay'] = buffer_delay
            endp_doc[pathid]['Gatedelay'] = float(int((full_gate_delay - buffer_delay)*100.0))/100.0
            endp_doc[pathid]['Cycletime'] = cycle_time
        elif line[:10]== '# Slack on':
            pass
        elif line[:10]== '# Path Len':
            pass
        elif line[:1] == '#':
            pass
        elif  line[:14] == '[PDSCUST]: (W)':
            pass
        elif line[7:16] == '-- Includ':
            tokens = parse_a_line(self.not_ws_re, self.ws_re,  line)
            endp_doc[pathid][tokens[5]] = float(tokens[4])
        else:
            print(line)
        return 0

    #
    # Average path sentence
    #
    def  parse_path_sentenceN(self, endp_doc, line, pathid):
        tokens = parse_a_line(self.not_ws_re, self.ws_re,  line)
        path_entry = []
        path_entry.append(tokens[0])         # Path
        path_entry.append(tokens[1])         # Phase
        path_entry.append(tokens[2])         # E
        if tokens[3] == 'N/C':
            path_entry.append(tokens[3])  # Slack
        else:
            path_entry.append(float(tokens[3]))  # Slack
        match = self.float_re.match(tokens[4])    # Delay + character
        if match != None:
            chlen = len(match.group())
            path_entry.append(float(match.group())) # Delay
            path_entry.append(tokens[4][chlen:])    # Characters
        else:
            path_entry.append(float(tokens[4]))     # Delay
            path_entry.append(None)                 # Nada
        path_entry.append(int(tokens[5][:-1])) # percentage
        path_entry.append(float(tokens[6]))    # Arrival
        path_entry.append(float(tokens[7]))    # Slew
        match = self.float_re.match(tokens[8])      # CL + character
        if match != None:
            chlen = len(match.group())
            path_entry.append(float(match.group())) # CL
            path_entry.append(tokens[8][chlen:])    # Characters
        else:
            path_entry.append(float(tokens[8]))     # CL
            path_entry.append(None)                 # Nada
        path_entry.append(int(tokens[9]))           # F
        if tokens[10] == '|' or tokens[10] == '>':
            path_entry.append(None)                # Layers
            path_entry.append(None)                # WC
            path_entry.append(None)                # A
            path_entry.append(tokens[10])          # | or >
            path_entry.append(tokens[11])          # Pin(X,Y)
            path_entry.append(tokens[13])          # Box/PinHide
            path_entry.append(tokens[14])          # Cell
            inext = 14
        elif tokens[11] == '|' or tokens[11] == '>':
            path_entry.append(None)                # Layers
            path_entry.append(None)                # WC
            path_entry.append(tokens[10])          # A
            path_entry.append(tokens[11])          # | or >
            path_entry.append(tokens[12])          # Pin(X,Y)
            path_entry.append(tokens[14])          # Box/PinHide
            path_entry.append(tokens[15])          # Cell
            inext = 15
        elif tokens[12] == '|' or tokens[12] == '>':
            path_entry.append(tokens[10])          # Layers
            path_entry.append(tokens[11])          # WC
            path_entry.append(None)                # A
            path_entry.append(tokens[12])          # | or >
            path_entry.append(tokens[13])          # Pin(X,Y)
            path_entry.append(tokens[15])          # Box/PinHide
            path_entry.append(tokens[16])          # Cell
            inext = 16
        elif tokens[13] == '|' or tokens[13] == '>':
            path_entry.append(tokens[10])          # Layers
            path_entry.append(tokens[11])          # WC
            path_entry.append(tokens[12])          # A
            path_entry.append(tokens[13])          # | or >
            path_entry.append(tokens[14])          # Pin(X,Y)
            path_entry.append(tokens[16])          # Box/PinHide
            path_entry.append(tokens[17])          # Cell
            inext = 17
        else:
            print('Could not parse',tokens)
            return
        if tokens[inext] == 'PO' or tokens[inext] == 'PI':
            path_entry.append(None)            # P
            path_entry.append(None)            # Func
            inext += 1
        else:
            inext += 1
            path_entry.append(tokens[inext])   # P
            inext += 1
            path_entry.append(tokens[inext])   # Func
            inext += 1
        path_entry.append(tokens[inext])       # PinName
        inext += 1
        if len(tokens) > inext:
            path_entry.append(tokens[inext])       # Net or Signal
            inext += 1
            if len(tokens) > inext:
                path_entry.append(string.join(tokens[inext:]))
            else:
                path_entry.append(None)
        else:
            path_entry.append(None)
            path_entry.append(None)
            endp_doc[pathid]['Path'].append(path_entry) 

    #
    # Second path sentence
    #
    def parse_path_sentence2(self, endp_doc, line, pathid):
        tokens = parse_a_line(self.not_ws_re, self.ws_re,  line)
        path_entry = []
        path_entry.append(tokens[0])         # Path
        path_entry.append(tokens[1])         # Phase
        path_entry.append(tokens[2])         # E
        path_entry.append(None)              # Slack
        path_entry.append(float(tokens[3]))  # Delay
        path_entry.append(None)              # Delay character
        path_entry.append(None)              # percentage
        path_entry.append(float(tokens[4]))  # Arrival
        path_entry.append(float(tokens[5]))  # Slew
        path_entry.append(float(tokens[6]))  # CL
        path_entry.append(None)              # CL character
        path_entry.append(None)              # F
        path_entry.append(None)              # Layers
        path_entry.append(None)              # WC
        path_entry.append(None)              # A
        path_entry.append(tokens[7])         # | or >
        path_entry.append(tokens[8])         # Pin(X,Y)
        #                                      skip | or <
        path_entry.append(tokens[10])        # Box/PinHide
        path_entry.append(tokens[11])        # Cell
        if tokens[11] == 'PO' or tokens[11] == 'PI':
            path_entry.append(None)          # P
            path_entry.append(None)          # Func
            inext = 12
        else:
            path_entry.append(tokens[12])    # P
            path_entry.append(tokens[13])    # Func
            inext = 14
        path_entry.append(tokens[inext])       # PinName
        inext += 1
        if len(tokens) > inext:
            path_entry.append(tokens[inext]) # Net or Signal
            inext += 1
            if len(tokens) > inext:
                path_entry.append(string.join(tokens[inext:]))
            else:
                path_entry.append(None)
        else:
            path_entry.append(None)
            path_entry.append(None)
        endp_doc[pathid]['Path'].append(path_entry)

    def parse_subpath_sentence1(self, endp_doc, line, pathid):
        tokens = parse_a_line(self.not_ws_re, self.ws_re,  line)
        #print repr(tokens)
        return pathid

    #
    # First path sentence
    #
    def parse_path_sentence1(self, endp_doc, line):
        tokens = parse_a_line(self.not_ws_re, self.ws_re,  line)
        begtoken = ''
        if tokens[0] == 'N' or tokens[0] == 'T':
            begtoken = tokens[0] + ' ' + tokens[1]
            tokens.pop(0)
        else:
            begtoken = tokens[0]
        pathid = tokens[0]
        endp_doc[pathid] = {}
        endp_doc[pathid]['Path'] = []
        path_entry = []
        path_entry.append(begtoken)         # Path
        path_entry.append(tokens[1])         # Phase
        path_entry.append(tokens[2])         # E
        path_entry.append(float(tokens[3]))  # Slack
        match = self.float_re.match(tokens[4])    # Delay + character
        if match != None:
            chlen = len(match.group())
            path_entry.append(float(match.group()))
            path_entry.append(tokens[4][chlen:])
        else:
            path_entry.append(float(tokens[4]))
            path_entry.append(None)
        path_entry.append(int(tokens[5][:-1])) # percentage
        path_entry.append(float(tokens[6]))    # Arrival
        path_entry.append(float(tokens[7]))    # Slew
        path_entry.append(float(tokens[8]))    # CL
        path_entry.append(None)                # CL character
        path_entry.append(int(tokens[9]))      # F
        path_entry.append(None)                # Layers
        path_entry.append(None)                # WC
        if tokens[10] == '|' or tokens[10] == '>':
            path_entry.append(None)            # A
            inext = 10
        else:
            path_entry.append(tokens[10])       # A
            inext = 11
        path_entry.append(tokens[inext])       # | or >
        inext += 1
        path_entry.append(tokens[inext])       # Pin(X,Y)
        inext += 2
        path_entry.append(tokens[inext])       # Box/PinHide
        inext += 1
        path_entry.append(tokens[inext])       # Cell
        if tokens[inext] == 'PO' or tokens[inext] == 'PI':
            path_entry.append(None)            # P
            path_entry.append(None)            # Func
            inext += 1
        else:
            inext += 1
            path_entry.append(tokens[inext])   # P
            inext += 1
            path_entry.append(tokens[inext])   # Func
            inext += 1
        path_entry.append(tokens[inext])       # PinName
        inext += 1
        if len(tokens) > inext:
            path_entry.append(tokens[inext])       # Net or Signal
            inext += 1
            if len(tokens) > inext:
                path_entry.append(string.join(tokens[inext:]))
            else:
                path_entry.append(None)
        else:
            path_entry.append(None)
            path_entry.append(None)
        endp_doc[pathid]['Path'].append(path_entry)
        return pathid

    #
    # main entry point
    #
    def parse_endpoint_report(self, fullfilename, parentid, do_print, do_xmit):
        # open the file, handle gziped files
        match = self.gz_re.match(fullfilename)
        try:
            if match != None:
                fobject = gzip.open(fullfilename, 'r')
                endpfile = get_filename(fullfilename)[:-3]
            else:
                fobject = open(fullfilename, 'r')
                endpfile = get_filename(fullfilename)
        except IOError:
            return
        
        print ' Parsing ' + get_filename(fullfilename)
        # initialize the endpoint report doc
        # print(fullfilename)
        tokens = endpfile.split('.')
        endp_doc = {}
        if len(tokens) == 3:
            endp_doc['_id'] = parentid + '_' + tokens[-1]
        elif len(tokens) == 4:
            endp_doc['_id'] = parentid + '_' +tokens[-2] + '_' + tokens[-1]
        else:
            return
        endp_doc['Appid'] = 'Endpoint Report'
        endp_doc['Keys'] = ['Path', 'Phase', 'E', 'Slack', 'Delay', 'Dchar', 'Pctg', 'Arrival', 'Slew', 'CL', 'Clchar', 'F', 'Layers', 'WC', 'A', 'PLchar', 'PinXY', 'Hide', 'Cell', 'P', 'Func', 'PinName', 'Net', 'OpSlk']

        # cache in the file
        lines = fobject.readlines()
        # close the file
        fobject.close()
        # read over the lines in the cache
        errors = []
        contline = ''
        state = 0
        pathstate = 0
        pathid = '0'
        done = False
        subpath = False
        sentence_no = 0
        for line in lines:
            # 2 - path, 1 - continuation, 0 - intro
            if state == 2:
                match = self.endpstart_match_re.match(line)
                matchsub = self.endpstartsp_match_re.match(line)
                if match != None:
                    subpath = False
                    done = False
                    pathstate = 0
                    sentence_no = 0
                elif matchsub != None:
                    subpath = True
                    done = False
                    sentence_no = 0
                    pathstate = 0
                elif not done:
                    try:
                        match2 = self.endpcomment_match_re.match(line)
                        if match2 != None:
                            pathstate = self.parse_comment_line(endp_doc, line, pathid)
                        else:
                            sentence_no += 1
                            if sentence_no > 2:
                                if pathstate == 0:
                                    self.parse_path_sentenceN(endp_doc, line, pathid)
                            elif sentence_no == 1:
                                if subpath:
                                    pathid = self.parse_subpath_sentence1(endp_doc, line, pathid)
                                    done = True
                                else:
                                    pathid = self.parse_path_sentence1(endp_doc, line)
                            elif sentence_no == 2:
                                self.parse_path_sentence2(endp_doc, line, pathid)
                    except IndexError:
                        errors.append({
                            'error': 'IndexError',
                            'line': line
                            })
                        pass
                    except ValueError:
                        errors.append({
                            'error': 'ValueError',
                            'line': line
                            })
                        pass
                    except KeyError:
                        errors.append({
                            'error': 'KeyError',
                            'line': line
                            })
                        pass
                    except:
                        print 'Error parsing: ' + line
                        print "Exception", sys.exc_info()[0]
                        quit()
            elif state == 1:
                match = self.endphideend_match_re.match(line)
                if match != None:
                    state = 0
                    self.parse_endpoint_hide(endp_doc, contline)
                else:
                    contline += line
            elif state == 0:
                # matching line?
                match = self.endp_match_re.match(line)
                # match?
                if match != None:
                    matchg = match.group()[-6:]
                    if   matchg == 'Design':
                        self.parse_endpoint_design(endp_doc, line)
                    elif matchg == 'Timing':
                        self.parse_endpoint_timingmode(endp_doc, line)
                    elif matchg == 'ayMode':
                        self.parse_endpoint_delaymode(endp_doc, line)
                    elif matchg == 'ptions':
                        self.parse_endpoint_options(endp_doc, line)
                else:
                    match2 = self.endphide_match_re.match(line)
                    if match2 != None:
                        contline = ''
                        state = 1
                    else:
                        match3 = self.endpstart_match_re.match(line)
                        if match3 != None:
                            state = 2

        print '  Endpoint parsing of ' + endpfile + ' finished with ' + repr(len(errors)) + ' errors'
                        
        # print(endp_doc)
        if do_print:
            jobject = open(endpfile + '.json', 'w')
            jobject.write( json.dumps(endp_doc, indent=4, separators=(',', ': ')) )
            jobject.close()

        if do_xmit:
            self.xmitter.xmit_doc(endp_doc)
            
#            db = 'testdb3'
#            jdoclist = [ endp_doc ]
#            JsonXmit(db, jdoclist, False)

#            headers = {'Content-type': 'application/json'}
#            db_url = account_url + '/' + db + '?batch=ok'
#            response = requests.post(db_url, data=json.dumps(endp_doc), headers=headers)
    
