import copy
import json
import re
from eLogUtils import *

#
# PDS command parser
#
class PdsCommandParser:
     
     def __init__(self):
          self.cmd_re = re.compile('[^()\s]*([()\s]|$)')

     def parse_command(self, tokens):
          commandlist = []
          commandobject = {}
          line = ''
          for i in range(0, len(tokens)):
               line = line + ' ' + tokens[i]
          newtokens = parse_a_line(self.cmd_re, ws_re, line)
          # print '       : ' + repr(newtokens)
          depth = 0
          lastparm = ''
          prevtoken = ''
          for i in range(0, len(newtokens)):
               token = newtokens[i]
               if len(token) > 0:
                    if token[-1] == ')':
                         depth -= 1
                         if depth == 0:
                              if len(token) > 1:
                                   lastparm = token.rstrip('()')
                                   commandobject['parms'][lastparm] = True
                              if commandobject['name'] == '':
                                   print '  (E) commmand with no name '
                                   print '  TINVK: ' + repr(tokens)
                                   print '  ' + repr(newtokens)
                              commandlist.append(commandobject)
                              commandobject = {}
                         else:
                              value = token.rstrip('()')
                              commandobject['parms'][lastparm] = parse_int_float_or_string(value)
                    else:
                         if depth == 0:
                              if 'name' in commandobject:
                                   commandlist.append(commandobject)
                              commandobject = {}
                              if token != '(':
                                   commandobject['name'] = token.rstrip('()')
                              else:
                                   commandobject['name'] = prevtoken
                         else:
                              if not 'parms' in commandobject:
                                   commandobject['parms'] = {}
                              lastparm = token.rstrip('()')
                              commandobject['parms'][lastparm] = True
                         if token[-1] == '(':
                              depth += 1
                    prevtoken = token
          return commandlist

#
# PDS Region data class
#
class PdsRegion:

     def __init__(self):
          self.Jdoc = {}
          self.Inited = False
          self.keyeqval_re = re.compile('\S+\=\S+')
          self.keyeqval2_re = re.compile('[\w_\-\.\:\/]+(\=|$)')
          self.equal_re = re.compile('\=')
          self.slashval_re = re.compile('\S+\/\S+\/\S+')
          self.slashval2_re = re.compile('[\w_\-\.]+(\/|$)')
          self.slash_re = re.compile('\/')
          self.param_re = re.compile('\-\S+')
          self.command_parser = PdsCommandParser()

     def clear(self):
          self.Jdoc = {}
          self.Inited = False

     def start(self):
          self.Jdoc = {}
          self.Inited = False

     def region_parse_command(self, tokens):
          token = tokens.pop(0)
          while token != 'region:':
               token = tokens.pop(0)
          if len(tokens) == 0:
               return
          self.Jdoc['driver'] = tokens.pop(0).strip(':')
          # print '  TRCOMM: ' + repr(tokens)
          xforms = []
          inTokens = False
          for token in tokens:
               if token == '-xforms':
                    inTokens = True
               elif inTokens:
                    xforms.append(token.strip('{').strip('}'))
                    if token[-1] == '}':
                         inTokens = False
          self.Jdoc['commands']= self.command_parser.parse_command(xforms)
                    
     def region_data(self, tokens):
          if not self.Inited:
               self.clear()
               self.Inited = True
               self.Jdoc['name'] = tokens[0]
               self.Jdoc['Appid'] = 'regions'
          # print '  TREVA: ' + repr(tokens)
          regionFound = False
          bacFound = False
          aeaFound = False
          complFound = False
          keyvalFound = False
          paramFound = False
          outstring = ''
          append = [ '', '', '' ]
          for token in tokens:
               if token == 'region:':
                    regionFound = True
                    outstring += ' +region'
               elif token == 'BEFORE/AFTER/CHANGE':
                    bacFound = True
                    outstring += ' +bac'
                    append = [ 'before_', 'after_', 'change_' ]
               elif token == 'ANALYSIS/EXECUTE/APPLY':
                    aeaFound = True
                    outstring += ' +aea'
                    append = [ 'analysis_', 'execute_', 'apply_' ]
               elif token == 'completion':
                    complFound = True
                    outstring += ' +compl'
               else:
                    match = self.keyeqval_re.match(token)
                    if match != None:
                         keyvalFound = True
                         outstring += ' +keyval'
                         newtokens = parse_a_line(self.keyeqval2_re, self.equal_re, token)
                         # print '  keyval: ' + token + ' => ' + repr(newtokens)
                         match = self.slashval_re.match(newtokens[1])
                         if match != None:
                              values = parse_a_line(self.slashval2_re, self.slash_re, newtokens[1])
                              basekey = newtokens[0]
                              self.Jdoc[append[0]+basekey] = parse_int_float_or_string(values[0])
                              self.Jdoc[append[1]+basekey] = parse_int_float_or_string(values[1])
                              self.Jdoc[append[2]+basekey] = parse_int_float_or_string(values[2])
                         else:
                              self.Jdoc[newtokens[0]] = parse_int_float_or_string(newtokens[1])
                    else:
                         match = self.param_re.match(token)
                         if match != None:
                              paramFound = True
                              outstring += ' +param'
          if regionFound:
               self.region_parse_command(tokens)
          # print ' ' + outstring
          if complFound:
               self.Inited = False
               # print json.dumps(self.Jdoc, indent=4, sort_keys=True, separators=(',', ': '))               


#
# PDS Transform data class
#
class PdsXfm:

     def __init__(self):
         # self.Jdoc = {}
         self.JdocList = []
         self.Tnames = []
         self.RegionData = PdsRegion()
         self.Inited = False
         self.paren_re = re.compile('\(.*|.*\)')
         self.cmd_re = re.compile('[^()\s]*([()\s]|$)')
         self.keytokens = {
              'num' : 0,
              'area' : 0,
              'image_area' : 0,
              'num_bins' : 0,
              'num_nets' : 0,
              'num_nets_constant' : 0,
              'num_nets_ideal' : 0,
              'num_viols' : 0,
              'num_decomposed_aoi' : 0,
              'num_decomposed_oai' : 0,
              'num_decomposed_nand4' : 0,
              'num_empad_buffers' : 0,
              'efom' : 0,
              'overhead' : 0,
              'allowed:' : 0,
              'bin_density' : 0,
              'bin_used_area' : 0,
              'bin_fixed_area' : 0,
              'bin_movable_area' : 0,
              'num_attempted' : 0,
              'num_accepted' : 0,
              'reduction' : 0,
              'took:' : 0,
              'area:' : 0,
              'da_negs:' : 0,
              'da_fom:' : 0,
              'slack:' : 0,
              'worst_slack:' : 0,
              'slack_target:' : 0,
              'size:' : 0,
              'num_xform_tried:' : 0,
              'num_net_apply:' : 0,
              'net_list_size:' : 0,
              'total_net_length' : 0,
              'num_assigned:' : 0,
              'num_placed:' : 0,
              'num_bogus:' : 0,
              'tfuzz:' : 0,
              'threshold:' : 0,
              'total:' : 0,
              'initialization:' : 0,
              'reports:' : 0,
              'transforms:': 0,
              'execute:' : 0,
              'termination:' : 0,
              'collection:' : 0,
              'change:' : 0,
              'time:' : 0,
              'overhead:' : 0,
              'leakage:' : 0,
              'analysis:' : 0,
              'crit_net:' : 0,
              'intialization:' : 0,
              'execution:' : 0,
              'analysis:' : 0,
              'termination:' : 0,
              'up:' : 0,
              'down:' : 0
              }

     def clear(self):
         self.JdocList = []
         self.Tnames = []
         self.RegionData.clear()
         self.Inited = False

     def start(self):
         self.Inited = True
         self.JdocList.append({})

     def transform_data(self, driver, tokens):
         if driver == 'sci' or driver == 'pds_nextnet' or driver == 'slack_profile':
              return
         if len(self.JdocList) == 0:
              # print '  (E) Transform data found, but no transform done message found !!'
              # print '  TDATA: ' + repr(tokens)
              return
         if not 'driver' in self.JdocList[-1]:
              self.JdocList[-1]['driver'] = driver
         found_num = False
         bad_separator = False
         error = False
         parse_class = 0
         savtokens = []
         separators = []
         keys = []
         pos = 0
         for i in range(0, len(tokens)):
              token = tokens[i].lower().strip('()')
              # match = self.paren_re.match(token)
              # if match == None:
              if token == '=' or token == '+' or token == ':':
                   continue
              savtokens.append(token.rstrip(':').rstrip('.'))
              if token in self.keytokens:
                   keys.append(pos)
              elif token == '::':
                   separators.append(pos)
              pos += 1
         basekey = ''
         baseobject = ''
         istart = 0
         separators.append(len(savtokens))
         if len(keys) == 0:
              print '  (E) No keys found, sentence skipped. '
              print '  TDATA: ' + repr(tokens)
              print '       : ' + repr(savtokens)
              return
         if len(savtokens) >  2 and savtokens[0] == 'finished' and savtokens[1] == 'iteration':
              baseobject = savtokens[1] + savtokens[2]
              basekey = ''
              if not baseobject in self.JdocList[-1]:
                   self.JdocList[-1][baseobject] = {}
              parse_class = 1
              if separators[0] < keys[0]:
                   istart = 1
              else:
                   istart = 0
              last = 3
         elif separators[0] < keys[0]:
              if separators[0] != 2:
                   print '  (E) More than two tokens before the first separator!!'
                   print '  TDATA: ' + repr(tokens)
                   print '       : ' + repr(savtokens)
                   return
              parse_class = 1
              baseobject = savtokens[0]
              if not baseobject in self.JdocList[-1]:
                   self.JdocList[-1][baseobject] = {}
              basekey = savtokens[1]
              istart = 1
              last = 3
         else:
              parse_class = 2
              istart = 0
              last = 0
         if bad_separator:
              parse_class = 0
         k = 0
         for i in range(istart, len(separators)):
              ikeys = []
              while k < len(keys) and keys[k] < separators[i]:
                   ikeys.append(keys[k])
                   k = k+1
              if len(ikeys) > 0:
                   for z in range(0, len(ikeys)):
                        thiskey = basekey
                        ivalue = ikeys[z]+1
                        # print '  ' + repr(ivalue) + ': ' + savtokens[ivalue]
                        if savtokens[last] == 'initial' or savtokens[last] == 'final':
                             baseobject = savtokens[last]
                             if not baseobject in self.JdocList[-1]:
                                  self.JdocList[-1][baseobject] = {}
                             last = last+1
                        for j in range(last, ivalue):
                             if thiskey == '':
                                  thiskey = savtokens[j]
                             else:
                                  thiskey = thiskey + '_' + savtokens[j]
                        # print '  ' + basekey +  ' ' + thiskey + ' last ' + repr(last) + ' key ' + repr(j) + ': ' + savtokens[j]
                        if thiskey != 'change' and thiskey != '':
                             if not baseobject == '':
                                  self.JdocList[-1][baseobject][thiskey] = parse_int_float_or_string(savtokens[ivalue])
                             elif parse_class == 2:
                                  self.JdocList[-1][thiskey] = parse_int_float_or_string(savtokens[ivalue])
                        last = ivalue+1
              else:
                   print '  (E) no keys before separator ' + repr(i) + ' at pos ' + repr(separators[i])
                   error = True
              last = separators[i]+1
         if error:
              print '  TDATA: ' + repr(tokens)
              print '       : ' + repr(savtokens)

     def transforms_invoked(self, tokens, sort_order, idstr, JdocList, ParentAppNames):
          global ws_re
          if len(self.Tnames) > 0:
               self.processTransforms(JdocList)
          self.start()
          self.JdocList[-1]['_id'] = idstr
          self.JdocList[-1]['name'] = ''
          self.JdocList[-1]['Appid'] = 'transform'
          self.JdocList[-1]['sort_order'] = sort_order
          self.JdocList[-1]['parents'] = list(ParentAppNames)
          #          print '  TINVK: ' + repr(tokens)
          if len(tokens) > 0:
               if not 'commands' in self.JdocList[-1]:
                   self.JdocList[-1]['commands'] = []
          if len(tokens) == 1:
               commandobject = {}
               commandobject['name'] = tokens[0].rstrip(':').strip('[]')
               self.JdocList[-1]['commands'].append(commandobject)
          elif len(tokens) > 1:
               commandobject = {}
               line = ''
               for i in range(0, len(tokens)):
                    line = line + ' ' + tokens[i]
               newtokens = parse_a_line(self.cmd_re, ws_re, line)
               # print '       : ' + repr(newtokens)
               depth = 0
               lastparm = ''
               prevtoken = ''
               for i in range(0, len(newtokens)):
                    token = newtokens[i]
                    if len(token) > 0:
                         if token[-1] == ')':
                              depth -= 1
                              if depth == 0:
                                   if len(token) > 1:
                                        lastparm = token.rstrip('()')
                                        commandobject['parms'][lastparm] = True
                                   if commandobject['name'] == '':
                                        print '  (E) commmand with no name '
                                        print '  TINVK: ' + repr(tokens)
                                        print '  ' + repr(newtokens)
                                   self.JdocList[-1]['commands'].append(commandobject)
                                   commandobject = {}
                              else:
                                   value = token.rstrip('()')
                                   commandobject['parms'][lastparm] = parse_int_float_or_string(value)
                         else:
                              if depth == 0:
                                   if 'name' in commandobject:
                                        self.JdocList[-1]['commands'].append(commandobject)
                                   commandobject = {}
                                   if token != '(':
                                        commandobject['name'] = token.rstrip('()')
                                   else:
                                        commandobject['name'] = prevtoken
                              else:
                                   if not 'parms' in commandobject:
                                        commandobject['parms'] = {}
                                   lastparm = token.rstrip('()')
                                   commandobject['parms'][lastparm] = True
                              if token[-1] == '(':
                                   depth += 1
                         prevtoken = token
               if len(self.JdocList[-1]['commands']) == 0:
                    print ' (E) Empty command list '
                    print '       : ' + repr(newtokens)

     #
     # Region evaluate behaves almost like transform done, except that:
     # For a transform with multiple commands, there also may be multiple region evaluates
     # So therefore, the region evaluate records are disjoint with anything else in the transform data,
     # even though most of the time, they are 1-1
     #
     def region_evaluate(self, tokens):
         self.RegionData.region_data(tokens)

     def end(self, name, JdocList):
         if not self.Inited:
             return
         # print '  TEND : ' + name
         self.Tnames.append(name)
         if len(self.Tnames) == len(self.JdocList):
              self.processTransforms(JdocList)
         return

     def processTransforms(self, JdocList):
         k = -1
         i = 0
         while i < len(self.Tnames) and i < len(self.JdocList):
              aname = self.Tnames[k]
              self.JdocList[k]['name'] = aname
              k -= 1
              i += 1
         for Jdoc in self.JdocList:
              JdocList.append(copy.deepcopy(Jdoc))
              #     print json.dumps(Jdoc, indent=4, sort_keys=True, separators=(',', ': '))
         self.clear()

     
