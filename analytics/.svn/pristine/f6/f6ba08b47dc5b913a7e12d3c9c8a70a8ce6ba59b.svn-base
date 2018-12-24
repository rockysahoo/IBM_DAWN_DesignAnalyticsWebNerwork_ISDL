import copy
import json
import re
from eLogUtils import *

#
# PDS sci output parsing algorithm
#
class PdsSci:

    def __init__(self):
        self.Jdoc = {}
        self.ilayer = 0

    def clear(self):
        self.Jdoc = {}
        self.ilayer = 0

    def sci_start(self, tokens):
        self.clear()
        # print ' SCISTART: ' + str(tokens)
        self.Jdoc['Appid'] = 'sci'
        self.Jdoc['congestion'] = []
        self.Jdoc['premap'] = False
        for i in range(0, len(tokens)):
            token = tokens[i]
            if (token == 'wACE4' or token == 'OF100' or token == 'OFtgt') and len(tokens) > i+2:
                self.Jdoc[token] = parse_int_float_or_string(tokens[i+2])
            elif token == 'stage:' and len(tokens) > i+1:
                self.Jdoc['stage'] = tokens[i+1].rstrip(';')
            elif token == 'premap' and tokens[i+1] == 'not':
                self.Jdoc['premap'] = True

    def sci_data(self, tokens):
        if len(tokens) != 15:
            print ' SCIDATA : ' + str(tokens)
            print ' (E) wrong number of sci tokens: ' + repr(len(tokens))
            return
        tableentry = {}
        tableentry['index'] = self.ilayer
        tableentry['layers'] = tokens[0]
        tableentry['wACE4'] = parse_int_float_or_string(tokens[2])
        tableentry['OF100'] = parse_int_float_or_string(tokens[9])
        tableentry['OFtgt'] = parse_int_float_or_string(tokens[10])
        tableentry['NWL'] = parse_int_float_or_string(tokens[12])
        tableentry['ZCEWW'] = parse_int_float_or_string(tokens[14])
        self.Jdoc['congestion'].append(tableentry)
        self.ilayer += 1

    def sci_end(self, tokens, sort_order, idstr, JdocList, ParentAppNames):
        # print ' SCIEND  : '
        self.Jdoc['_id'] = idstr
        self.Jdoc['sort_order'] = sort_order
        self.Jdoc['parents'] = list(ParentAppNames)
        #print json.dumps(self.Jdoc, indent=4, sort_keys=True, separators=(',', ': '))
        #return
                
    
        
