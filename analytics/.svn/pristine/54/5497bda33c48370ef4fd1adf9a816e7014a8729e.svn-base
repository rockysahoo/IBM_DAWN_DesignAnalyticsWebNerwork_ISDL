
import re
import json
import time
import base64
import threading
import requests
import copy
from eLogUtils import *
from eLogFile import *
from eLogParseEndp import *
from eLogFileEncode import *
from eLogPdsXfm import *
from eLogSci import *

#
# PDS Log parser
#
class LogParser:

    def __init__(self, logfile, filestack, xmitter):
        self.xmitter = xmitter
        self.filestack = filestack
        #
        # Global regular expressions
        #
        self.cont_line_re = re.compile(r'.*\\s*\n')
        self.cont_line_ws_re = re.compile(r'[\\\n]+$')
        self.word_re = re.compile('[\w\.:]+\s+')
        self.invoked_as_re = re.compile(r'[\w\-@\.,&:{}\[\]\/]+[#\s]*')
        self.current_directory_re = re.compile(r'[\w\-@.&:\/]+\s*')
        self.starting_re = re.compile(r'[\w:()]+\s*')
        self.starting_ws_re = re.compile('[\(\)\s]+')
        self.machine_re = re.compile(r'[\w./%\-()\s]+([:,]\s+|$)')
        self.machine_ws_re = re.compile(r'[:,]\s+')
        self.pid_ws_re = re.compile(r'pid\s+')
        self.loading_re = re.compile(r'[^:,\s]+([:,]\s+|\s+|$)|[^,]+[,]\s+|\d+\.*$|[^,]+\s$')
        self.loading_ws_re = re.compile(r'[:,]+|\.\s$|\s$')
        self.ucon_re = re.compile(r'\S+([\s\*]+|$)')
        self.ucon_ws_re = re.compile(r'[\s,%"\*]+')
        self.strip_paren_re = re.compile(r'[()]')
        self.day_match_re = re.compile('Mon|Tue|Wed|Thu|Fri|Sat|Sun')
        self.peak_match_re = re.compile(r'.+gigs peak')
        self.deltacurr_match_re = re.compile(r'[Ms/]+')
        self.draw_match_re = re.compile(r'draw_\w+')
        self.pds_begin_this_call_re = re.compile('.*The id for this call is:')
        self.pds_transforms_invoked_re = re.compile('.*transforms invoked:')
        self.par_string_re = re.compile('PAR\-\d+')
        self.pds_xfm_re = re.compile('(.* :: )+.*')
        #
        # Global container of json docs
        #
        # Jdoc contains the root document
        # JdocList is a list, containing all docs
        #
        self.rootid = ''
        self.Jdoc = {}
        self.Ids = {}
        # self.JdocRawfileAttachments = {}
        # self.JdocList = [ self.Jdoc, self.JdocRawfileAttachments  ]
        self.RawFileCount = 0
        self.JdocList = [ self.Jdoc ]
        self.Jdoc['Logfile'] = logfile
        # self.JdocRawfileAttachments["_attachments"] = {}
        self.current_transform = PdsXfm()
        self.congestion = PdsSci()
        #
        # Stack used for hierarchical docs
        #
        self.JdocStack = [ self.Jdoc ]
        self.AttachmentStack = []
        self.AttachmentStack.append({})
        self.ParentAppNames = []
        self.sort_order = 0
        self.Threads = []
        #
        # Unmatched sentences
        #
        self.Unmatched = {}
        self.unmatchedcount = 0
        self.rawlinecount = 0
        self.rawcharcount = 0
        #
        # uncon fields
        #
        self.UconValues = {
            'Gates:'      : 0,
            'Connections:': 0,
            'Area:'       : 0,
            'NumNegs:'    : 0,
            'L2lNegs:'    : 0,
            'eFOM:'       : 0,
            'WireLen:'    : 0,
            'NumTest:'    : 0,
            'Leakage:'    : 1,
            'Dynamic:'    : 1,
            'wACE4:'      : 1,
            'WstSlk:'     : 1,
            'daFOM:'      : 1,
            'L2lSlk:'     : 1,
            'L2lFom:'     : 1,
            'daExtendedFOM:' : 1
            }

        #
        # Setup for parser
        #
        self.functionDict = {
            'Invoked as':  self.parse_invoked_as,
            'Current Directory': self.parse_current_directory,
            'Install Directory': self.parse_install_directory,
            'Starting': self.parse_starting,
            'Machine': self.parse_machine,
            'Process': self.parse_process,
            'Loading': self.parse_loading_1,
            'Binding': self.parse_binding,
            'Process took': self.parse_process_took,
            'Used': self.parse_used,
            'idme': self.parse_idme,
            'srule': self.parse_srule,
            'IDM-48': self.parse_loading_2,
            'IDM-36': self.parse_dm_allocator,
            'IMS-160': self.parse_loading_2,
            'ucon-1': self.parse_ucon1,
            'ucon-2': self.parse_ucon2,
            'ucon-3': self.parse_ucon3,
            'pds::turbo': self.parse_retcode,
            'ET-18': self.parse_et18,
            'ET-224': self.parse_et224,
            'plot::draw_congestion': self.parse_plot_draw,
            'plot::draw_ports':  self.parse_plot_draw,
            'plot::draw_usages': self.parse_plot_draw,
            'plot::draw_movebounds': self.parse_plot_draw,
            'plot::draw_wires': self.parse_plot_draw,
            'plot::draw_buffer_tree': self.parse_plot_draw,
            'plot::draw_bin_density': self.parse_plot_draw,
            'plot::draw_endpoint': self.parse_plot_draw,
            'ete::region::evaluate': self.ete_region_evaluate,
            'sci': self.parse_sci,
            '~~i~~': self.parse_transform_end
            }

    def makedate3(self, mmddyy, hhmmss):
        try:
            datestring = mmddyy + ' ' + hhmmss + ' ' + self.Jdoc['TZ']
            return int(time.mktime(time.strptime(datestring, '%m/%d/%y %H:%M:%S %Z')))
        except ValueError:
            datestring = mmddyy + ' ' + hhmmss
        return int(time.mktime(time.strptime(datestring, '%m/%d/%y %H:%M:%S')))

    #
    # rootid
    #
    def RootId(self):
        return self.rootid
        
    #
    # Save raw file
    #
    def save_raw_logfile(self, fullfilename):
        try:
            f = open(fullfilename, 'r')
            f.close()
            filename = get_filename(fullfilename)
            rawFileJdoc = {}
            rawFileJdocId = self.rootid + '_raw_' + repr(self.RawFileCount)
            rawFileJdoc['_id'] = rawFileJdocId
            rawFileJdoc['Appid'] = 'raw file'
            rawFileJdoc['filename'] = fullfilename
            self.Ids[rawFileJdocId] = True
            #self.JdocRawfileAttachments["_attachments"][filename] = {}
            #self.JdocRawfileAttachments["_attachments"][filename]["content_type"] = ''
            #self.JdocRawfileAttachments["_attachments"][filename]["data"] = ''
            #encode_text_file(fullfilename, self.JdocRawfileAttachments["_attachments"][filename])
            rawFileJdoc["_attachments"] = {}
            rawFileJdoc["_attachments"][filename] = {}
            rawFileJdoc["_attachments"][filename]["content_type"] = ''
            rawFileJdoc["_attachments"][filename]["data"] = ''
            encode_text_file(fullfilename, rawFileJdoc["_attachments"][filename])
            self.xmitter.xmit_doc(rawFileJdoc)
            self.RawFileCount += 1
        except IOError:
            return

    #
    # Wait until all threads are done
    #
    def wait_until_threads_done(self):
        # wait until all the threads are done
        for t in self.Threads:
            t.join()
        self.Threads = []

    #
    # Invoked as
    #
    def parse_invoked_as(self, line):
        global ws_re
        tokens = parse_a_line(self.invoked_as_re, ws_re, line)
        tokens.pop(0)
        tokens.pop(0)
        if 'Appid' in self.Jdoc:
            pass
        else:
            self.Jdoc['Appid'] = tokens[0]
        for i in range(0, len(tokens)):
            if tokens[i] == '-def':
                if 'Def' in self.Jdoc:
                    pass
                else:
                    self.Jdoc['Def'] = tokens[i+1]
            elif tokens[i] == '-tech':
                if 'Tech' in self.Jdoc:
                    pass
                else:
                    self.Jdoc['Tech'] = tokens[i+1]
            elif tokens[i] == '-runid':
                if 'Runid' in self.Jdoc:
                    pass
                else:
                    self.Jdoc['Runid'] = tokens[i+1]
        if 'InvokedAsInfo' in self.Jdoc:
            pass
        else:
            self.Jdoc['InvokedAsInfo'] = []
        self.Jdoc['InvokedAsInfo'].append(tokens);
    
    #
    # Current directory
    #
    def parse_current_directory(self, line):
        global ws_re
        tokens = parse_a_line(self.current_directory_re, ws_re, line)
        if 'CurrentDirectory' in self.Jdoc:
            pass
        else:
            self.Jdoc['CurrentDirectory'] = tokens[2]
        
    #
    # Install directory
    #
    def parse_install_directory(self,line):
        global ws_re
        tokens = parse_a_line(self.current_directory_re, ws_re, line)
        if 'InstallDirectory' in self.Jdoc:
            pass
        else:
            self.Jdoc['InstallDirectory'] = tokens[2]

    #
    # Create the _id field if it does not exist and if all the data is there
    #
    def check_and_add_id(self):
        if '_id' in self.Jdoc:
            pass
        else:
            if 'Machid' in self.Jdoc:
                if 'Starting' in self.Jdoc:
                    if 'Userid' in self.Jdoc:
                        if 'Procid' in self.Jdoc:
                            self.rootid = self.Jdoc['Userid'] + '_' + str(self.Jdoc['Starting']) + '_' + self.Jdoc['Machid']  + '_' + self.Jdoc['Procid']
                            self.Jdoc['_id'] = self.rootid
                            self.Ids[self.rootid] = True
                            # self.JdocRawfileAttachments['_id'] = self.rootid + '_' + 'raw'
                            # self.Ids[self.rootid + '_' + 'raw'] = True
                            self.ParentAppNames.append(self.rootid)
                            self.xmitter.UniqueIdCheck(self.rootid, True)
                            self.save_raw_logfile(self.Jdoc['Logfile'])

    #
    # Starting
    #
    def parse_starting(self, line):
        tokens = parse_a_line(self.starting_re, self.starting_ws_re, line)
        if 'Starting' in self.Jdoc:
            pass
        else:
            self.Jdoc['TZ'] = tokens[5]
            self.Jdoc['Starting'] = int(tokens[6])
        self.check_and_add_id()    
                
    #
    # Machine
    #
    def parse_machine(self, line):
        tokens = parse_a_line(self.machine_re, self.machine_ws_re, line)
        if 'Machine' in self.Jdoc:
            pass
        else:
            self.Jdoc['Machine'] = []
            self.Jdoc['Machid'] = tokens[1]
            for i in range(1, len(tokens)):
                self.Jdoc['Machine'].append(tokens[i])
        self.check_and_add_id()    

    #
    # Process
    #
    def parse_process(self, line):
        tokens = parse_a_line(self.machine_re, self.machine_ws_re, line)    
        if 'Process' in self.Jdoc:
            pass
        else:
            self.Jdoc['Process'] = []
            self.Jdoc['Userid'] = tokens[1]
            self.Jdoc['Procid'] = self.pid_ws_re.sub('', tokens[2])
            for i in range(1, len(tokens)):
                self.Jdoc['Process'].append(tokens[i])
        self.check_and_add_id()

    #
    # Loading
    #
    def parse_loading(self,line,skiptokens):
        tokens = parse_a_line(self.loading_re, self.loading_ws_re, self.strip_paren_re.sub('',line))
        for i in range(0,skiptokens):
            tokens.pop(0)
        if tokens[0] == 'def':
            return
        if 'LoadingInfo' in self.Jdoc:
            pass
        else:
            self.Jdoc['LoadingInfo'] = {}
        loadfile = {}
        loadfile['file'] = tokens.pop(0)
        filetype = 'other'
        if len(tokens) > 0:
            if tokens[0] == 'file':
                filetype = tokens.pop(0)
                loadfile['date'] = makefiledate(tokens[0], tokens[1], tokens[2], tokens[3])
                loadfile['size'] = int(tokens[4])
            elif len(tokens) == 6:
                filetype = tokens.pop(0)
                if len(tokens[3]) == 6:
                    loadfile['date'] = makedate2(tokens[0], tokens[1], tokens[2], tokens[3])
                else:
                    loadfile['date'] = makedate(tokens[0], tokens[1], tokens[2], tokens[3])
                loadfile['size'] = int(tokens[4])
            elif len(tokens) == 5:
                if len(tokens[3]) == 6:
                    loadfile['date'] = makedate2(tokens[0], tokens[1], tokens[2], tokens[3])
                else:
                    loadfile['date'] = makedate(tokens[0], tokens[1], tokens[2], tokens[3])
                loadfile['size'] = int(tokens[4])   
            else:
                print ' Not quite parsed: ' + line
                print tokens
        if filetype in self.Jdoc['LoadingInfo']:
            pass
        else:
            self.Jdoc['LoadingInfo'][filetype] = []
        self.Jdoc['LoadingInfo'][filetype].append(loadfile)

    def parse_loading_1(self,line):
        self.parse_loading(line, 1)

    def parse_loading_2(self, line):
        self.parse_loading(line, 2)

    #
    # Binding
    #
    def parse_binding(self, line):
        tokens = parse_a_line(self.loading_re, self.loading_ws_re, self.strip_paren_re.sub('',line))
        if 'BindingInfo' in self.Jdoc:
            pass
        else:
            self.Jdoc['BindingInfo'] = []
        bindfile = {}
        tokens.pop(0)
        bindfile['file'] = tokens.pop(0)
        if len(tokens) == 7:
            bindfile['dll'] = tokens.pop(0)
            tokens.pop(0)
            bindfile['version'] = tokens.pop(0)
            bindfile['date'] = makedate(tokens[0], tokens[1], tokens[2], tokens[3])
        self.Jdoc['BindingInfo'].append(bindfile)

    #
    # pds::turbo
    #
    def parse_retcode(self,line):
        global ws_re    
        tokens = parse_a_line(self.invoked_as_re, ws_re, line)
        if len(tokens) == 5 and tokens[2] == 'Return' and tokens[3] == 'code':
            self.Jdoc['Retcode'] = int(tokens[4])
            
    #
    # Process took
    #
    def parse_process_took(self,line):
        global ws_re
        tokens = parse_a_line(self.word_re, ws_re, line)
        self.Jdoc['WallTime'] = makeseconds(tokens[6])

    #
    # Used
    #
    def parse_used(self,line):
        global ws_re
        match = self.peak_match_re.match(line)
        if match != None:
            tokens = parse_a_line(self.word_re, ws_re, line)
            self.Jdoc['Memory'] = float(tokens[4])

    #
    # child id
    #
    def childid(self,appname):
        cid = ''
        for name in self.ParentAppNames:
            cid += name + '_'
        cid += appname
        if cid in self.Ids:
            print ' (E) duplicate id: ' + cid
        #for num in range(100):
        #    if num == 0:
        #        if cid not in self.Ids:
        #            self.Ids[cid] = True
        #            return cid
        #    else:
        #        if cid+'_'+repr(num) not in self.Ids:
        #            cid += '_'+repr(num)
        #            self.Ids[cid] = True
        #            return cid
        # cid = self.ParentAppNames[0] + '_' + repr(self.sort_order)
        return cid

    #
    # ucon-1
    #
    def parse_ucon1(self,line):
        tokens = parse_a_line(self.ucon_re, self.ucon_ws_re, line)
        newJdoc = {}
        tokens.pop(0)
        if tokens[0] == 'Starting:':
            if len(tokens) > 2:
                if tokens[1] != 'Writing':
                    newId = tokens[1] + tokens[2]
                else:
                    newId = tokens[1]
            else:
                newId = tokens[1]
        else:
            newJdoc['Starting'] = self.makedate3(tokens[0], tokens[1])
            if len(tokens) > 4:
                newId = tokens[3] + tokens[4]
            else:
                newId = tokens[3]
        print "Parsing " + newId
        newJdoc['Sort_order'] = self.sort_order
        numId = repr(self.sort_order)
        self.sort_order += 1
        newJdoc['_id'] = self.childid(numId)
        newJdoc['Appid'] = newId
        myparents = list(self.ParentAppNames)
        newJdoc['parents'] = myparents
        self.ParentAppNames.append(numId)
        self.JdocStack.append(newJdoc)
        self.JdocList.append(newJdoc)
        self.AttachmentStack.append({})

    #
    # ucon-2
    #
    def parse_ucon2(self, line):
        # wait until all the threads are done
        # self.wait_until_threads_done()
        # proceed ...
        tokens = parse_a_line(self.ucon_re, self.ucon_ws_re, line)
        tokens.pop(0)
        if tokens[0] == 'Ended:':
            pass
        else:
            self.JdocStack[-1]['Ended'] = self.makedate3(tokens[0], tokens[1])
        # self.JdocStack[-1]['Sort_order'] = self.sort_order
        # self.sort_order += 1
        self.JdocStack.pop()
        self.ParentAppNames.pop()
        self.AttachmentStack.pop()

    #
    # ucon-3
    #
    def parse_ucon3(self, line):
        tokens = parse_a_line(self.ucon_re, self.ucon_ws_re, line)
        i = 0
        for token in tokens:
            if token == 'delta/current:':
                nums = self.deltacurr_match_re.sub(' ', tokens[i+1]).split()
                if tokens[i-2] == 'CPU':
                    self.JdocStack[-1]['CPUTime'] = int(nums[1])                
                elif tokens[i-2] == 'Wall':
                    self.JdocStack[-1]['WallTime'] = int(nums[1])                
                elif tokens[i-1] == 'Memory':
                    self.JdocStack[-1]['Memory'] = float(int(nums[1])*10/1024)
            elif token == 'Amode:':
                self.JdocStack[-1]['Amode'] = tokens[i+1]
            elif token == 'Slew-Dependency:':
                self.JdocStack[-1]['SlewDependency'] = tokens[i+1]
            elif token == 'Utilization:' and tokens[i-1] == 'Area':
                self.JdocStack[-1]['AreaUtil'] = int(tokens[i+1])
            elif token == 'worst:' and tokens[i-1] == '20':
                self.JdocStack[-1]['Avg20'] = float(tokens[i+1])
            elif token == 'CapV:' and tokens[i-1] == 'Num':
                self.JdocStack[-1]['NumCapV'] = int(tokens[i+1])
            elif token == 'Slew:' and tokens[i-1] == 'Default':
                self.JdocStack[-1]['DefaultSlew'] = float(tokens[i+1])
            elif token == 'SlewV:' and tokens[i-1] == 'Num':
                self.JdocStack[-1]['NumSlewV'] = int(tokens[i+1])
            elif token == 'Nets>90:':
                self.JdocStack[-1]['Over90'] = int(tokens[i+1])
            elif token == 'Nets>100:':
                self.JdocStack[-1]['Over100'] = int(tokens[i+1])
            elif token in self.UconValues:
                stoken = token.rstrip(':')
                if self.UconValues[token] == 0:
                    self.JdocStack[-1][stoken] = int(tokens[i+1])
                elif self.UconValues[token] == 1:
                    self.JdocStack[-1][stoken] = float(tokens[i+1])
            i += 1

    #
    # Note:
    # Draw calls a thread to do the inline encoding of the data
    #
    def parse_plot_draw(self,line):
        tokens = parse_a_line(self.ucon_re, self.ucon_ws_re, line)
        if tokens[1] == 'Creating':
            match = self.draw_match_re.match(tokens[0],7)
            if match != None:
                if not self.AttachmentStack:
                    self.AttachmentDocs =  {}
                    self.AttachmentStack.append(self.AttachmentDocs)
                draw_group = match.group()
                if draw_group in self.AttachmentStack[-1]:
                    pass
                else:
                    self.AttachmentStack[-1][draw_group] = {}
                    self.AttachmentStack[-1][draw_group]['_id'] = self.JdocStack[-1]['_id'] + '_' + draw_group
                    self.AttachmentStack[-1][draw_group]['Appid'] = draw_group
                    self.AttachmentStack[-1][draw_group]["_attachments"] = {}
                    self.JdocList.append(self.AttachmentStack[-1][draw_group])
                pngfile = get_filename(tokens[2])
                self.AttachmentStack[-1][draw_group]["_attachments"][pngfile] = {}
                self.AttachmentStack[-1][draw_group]["_attachments"][pngfile]["content_type"] = ''
                self.AttachmentStack[-1][draw_group]["_attachments"][pngfile]["data"] = ''
                t = threading.Thread(target=encode_png_file, args=(copy.deepcopy(tokens[2]), self.AttachmentStack[-1][draw_group]["_attachments"][pngfile]))
                t.start()
                self.Threads.append(t)
            else:
                print tokens

    #
    # Parse [PAR-nnn]: 
    # Parallel console line
    #
    def parse_par(self, line):
        tokens = parse_a_line(self.ucon_re, self.ucon_ws_re, self.strip_paren_re.sub('',line))
        # print 'PAR: ' + repr(tokens)
        if tokens[1] == 'Redirecting': 
            self.save_raw_logfile(tokens[-1])
            self.filestack.pushFile(tokens[-1])

    #
    # Parse [ET-18]: >Begin...New
    # which is a custom endpoint report
    #
    def parse_et18(self, line):
        tokens = parse_a_line(self.ucon_re, self.ucon_ws_re, line)
        if tokens[1] == '>Begin...New' or tokens[1] == '>Begin...Newest':
            endp_parser = EndpointParser(self.xmitter)
            ## endp_parser.parse_endpoint_report(tokens[6], self.JdocStack[-1]['_id'], False, True)
            self.save_raw_logfile(tokens[6])
            t = threading.Thread(target=endp_parser.parse_endpoint_report, args=(copy.deepcopy(tokens[6]), self.JdocStack[-1]['_id'], False, True))
            t.start()
            self.Threads.append(t)
        elif tokens[1] == '>Begin...Generate':
            self.save_raw_logfile(tokens[6])
        elif tokens[1] == '>Begin...Custom':
            self.save_raw_logfile(tokens[6])
        elif tokens[1] == '>Begin...Info':
            self.save_raw_logfile(tokens[5])
        elif tokens[1] == '>Begin...Nets':
            self.save_raw_logfile(tokens[5])
        elif tokens[1] == '>Begin...Histogram':
            self.save_raw_logfile(tokens[5])
        #else:
        #    pass
        #    print ' Ignoring ' + tokens[1]

    #
    # Transform parsers
    #
    def ete_region_evaluate(self, line):
        tokens = parse_a_line(self.ucon_re, self.ucon_ws_re, line)
        tokens.pop(0)
        #tokens.pop(0)
        #tokens.pop(0)
        self.current_transform.region_evaluate(tokens)
                
    def parse_transform_end(self,line):
        tokens = parse_a_line(self.ucon_re, self.ucon_ws_re, line)
        tname = ''
        if len(tokens) == 4:
            tname = tokens[3]
        elif tokens[2] == 'Completed':
            tname = tokens[3]
        elif tokens[1] == 'Completed':
            tname = tokens[2]
        else:
            print '  Transform end: ' + repr(tokens)
        if tname == '':
            self.current_transform.clear()
        else:
            # numId = repr(self.sort_order)
            # self.current_transform.end(tname, self.sort_order, self.childid(numId), self.JdocList, self.ParentAppNames)
            self.current_transform.end(tname, self.JdocList)
    #        if self.current_transform != '' and tname != '':
    #            if self.current_transform != tname:
    #                print '  (E) TEND, Current transform: ' + self.current_transform + ' tname: ' + tname
    #        self.current_transform = ''
            
    def parse_pds_transform(self, matchstring, line):
        tokens = parse_a_line(self.ucon_re, self.ucon_ws_re, line)
        driver = tokens.pop(0).rstrip(':').strip('[]')
        self.current_transform.transform_data(driver, tokens)

    def parse_transform_this_call(self, matchstring, line):
        pass
    #        if not self.current_transform:
    #            self.current_transform = matchstring
    #        elif self.current_transform != matchstring:
    #            print '  (E) THISCALL current transform: ' + self.current_transform + ' matchstring: ' + matchstring
    #            self.current_transform = matchstring
    #        tokens = parse_a_line(self.ucon_re, self.ucon_ws_re, line)
    #        tokens.pop(0)
    #        if len(tokens) == 7 and tokens[6] != self.current_transform:
    #            if tokens[6] != 'is:':
    #                self.current_transform = tokens[6]
    #        elif len(tokens) == 8 and tokens[7] != self.current_transform:
    #            if tokens[7] != 'is:':
    #                self.current_transform = tokens[7]
    #        #        else:
    #            print '  >> ' + repr(tokens)
    # print '  Transform ' + matchstring + ' start: ' + repr(tokens)

    def parse_transforms_invoked(self, matchstring, line):
        #        if not self.current_transform:
        #            self.current_transform = matchstring
        #        elif self.current_transform != matchstring:
        #            print '  (E) INVOKED Current transform: ' + self.current_transform + ' matchstring: ' + matchstring
        #            self.current_transform = matchstring
        tokens = parse_a_line(self.ucon_re, self.ucon_ws_re, line)
        tokens.pop(0)
        tokens.pop(0)
        tokens.pop(0)
        tokens.pop(0)
        # print '  Transform ' + self.current_transform + ' invoked: '  + repr(tokens)
        # self.current_transform.end(tname, self.sort_order, self.childid(numId), self.JdocList, self.ParentAppNames)
        numId = repr(self.sort_order)
        self.current_transform.transforms_invoked(tokens, self.sort_order, self.childid(numId), self.JdocList, self.ParentAppNames)
        self.sort_order += 1

    #
    # SCI congestion data parser
    #
    def parse_sci(self,line):
        tokens = parse_a_line(self.ucon_re, self.ucon_ws_re, line)
        tokens.pop(0)
        if tokens[0] == 'The' and tokens[1] == 'key':
            self.congestion.sci_start(tokens)
        elif tokens[0] == 'wACE4':
            numId = repr(self.sort_order)
            self.congestion.sci_end(tokens, self.sort_order, self.childid(numId), self.JdocList, self.ParentAppNames)
            self.sort_order += 1
        elif len(tokens) > 4 and tokens[0] != 'Layer(s)' and tokens[1] == '|' and tokens[3] == '|':
            self.congestion.sci_data(tokens)

    #
    # Other parsers
    #
    def parse_dm_allocator(self,line):
        pass

    def parse_et224(self,line):
        pass

    def parse_idme(self,line):
        pass

    def parse_srule(self,line):
        pass

    #
    # Parse one concatenated line 
    #
    def parse_top_line(self, match, line):
        brackets = False
        matchstring = match.group().strip()
        if matchstring[-1] == ':':
            matchstring = matchstring[:-1]
        if matchstring[0] == '[' and matchstring[-1] == ']':
            brackets = True
            matchstring = matchstring[1:-1]
        if matchstring in self.functionDict:
            self.functionDict[matchstring](line)
            return
        elif self.par_string_re.match(matchstring) != None:
            self.parse_par(line)
            return
        elif self.pds_xfm_re.match(line) != None:
            self.parse_pds_transform(matchstring, line)
            return
        if brackets:
            offset = match.end()
            match_this_call = self.pds_begin_this_call_re.match(line, offset)
            if match_this_call != None:
                self.parse_transform_this_call(matchstring, line)
                return
            match_transforms_invoked = self.pds_transforms_invoked_re.match(line, offset)
            if match_transforms_invoked != None:
                self.parse_transforms_invoked(matchstring, line)
                return
        self.unmatchedcount += 1
        if match.group() in self.Unmatched:
            self.Unmatched[match.group()] += 1
        else:
            self.Unmatched[match.group()] = 1

    def print_unmatched(self):
        print 'Found ' + repr(self.unmatchedcount) + ' sentences of ' + repr(len(self.Unmatched)) + ' types'


    
