
import re
import json
import time
import base64
import threading
import requests
from eLogUtils import *
from eLogParseEndp import *
from eLogFileEncode import *

#
# Global regular expressions
#
cont_line_re = re.compile(r'.*\\s*\n')
cont_line_ws_re = re.compile(r'[\\\n]+$')

word_re = re.compile('[\w\.:]+\s+')
invoked_as_re = re.compile(r'[\w\-@\.,&:{}\[\]\/]+[#\s]*')
current_directory_re = re.compile(r'[\w\-@.&:\/]+\s*')
starting_re = re.compile(r'[\w:()]+\s*')
starting_ws_re = re.compile('[\(\)\s]+')
machine_re = re.compile(r'[\w./%\-()\s]+([:,]\s+|$)')
machine_ws_re = re.compile(r'[:,]\s+')
pid_ws_re = re.compile(r'pid\s+')
loading_re = re.compile(r'[^:,\s]+([:,]\s+|\s+|$)|[^,]+[,]\s+|\d+\.*$|[^,]+\s$')
loading_ws_re = re.compile(r'[:,]+|\.\s$|\s$')
ucon_re = re.compile(r'\S+([\s\*]+|$)')
ucon_ws_re = re.compile(r'[\s,%"\*]+')
strip_paren_re = re.compile(r'[()]')
day_match_re = re.compile('Mon|Tue|Wed|Thu|Fri|Sat|Sun')
peak_match_re = re.compile(r'.+gigs peak')
deltacurr_match_re = re.compile(r'[Ms/]+')
draw_match_re = re.compile(r'draw_\w+')
pds_begin_this_call_re = re.compile('.*The id for this call is:')
pds_transforms_invoked_re = re.compile('.*transforms invoked:')

#
# Global container of json docs
#
# Jdoc contains the root document
# JdocList is a list, containing all docs
#
Jdoc = {}
JdocList = [ Jdoc ]

#
# Stack used for hierarchical docs
#
JdocStack = [ Jdoc ]
AttachmentStack = []
AttachmentStack.append({})
ParentAppNames = []
sort_order = 0
Threads = []

#
# Unmatched sentences
#
Unmatched = {}
unmatchedcount = 0
rawlinecount = 0
rawcharcount = 0

UconValues = {
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

def makedate3(mmddyy, hhmmss):
    try:
        datestring = mmddyy + ' ' + hhmmss + ' ' + Jdoc['TZ']
        return int(time.mktime(time.strptime(datestring, '%m/%d/%y %H:%M:%S %Z')))
    except ValueError:
        datestring = mmddyy + ' ' + hhmmss
        return int(time.mktime(time.strptime(datestring, '%m/%d/%y %H:%M:%S')))

#
# Invoked as
#
def parse_invoked_as(line):
    global current_directory_re
    global ws_re
    tokens = parse_a_line(invoked_as_re, ws_re, line)
    tokens.pop(0);
    tokens.pop(0);
    if 'Appid' in Jdoc:
        pass
    else:
        Jdoc['Appid'] = tokens[0]
    for i in range(0, len(tokens)):
        if tokens[i] == '-def':
            if 'Def' in Jdoc:
                pass
            else:
                Jdoc['Def'] = tokens[i+1]
        elif tokens[i] == '-tech':
            if 'Tech' in Jdoc:
                pass
            else:
                Jdoc['Tech'] = tokens[i+1]
        elif tokens[i] == '-runid':
            if 'Runid' in Jdoc:
                pass
            else:
                Jdoc['Runid'] = tokens[i+1]
    if 'InvokedAsInfo' in Jdoc:
        pass
    else:
        Jdoc['InvokedAsInfo'] = []
    Jdoc['InvokedAsInfo'].append(tokens);
    
#
# Current directory
#
def parse_current_directory(line):
    global current_directory_re
    global ws_re
    tokens = parse_a_line(current_directory_re, ws_re, line)
    if 'CurrentDirectory' in Jdoc:
        pass
    else:
        Jdoc['CurrentDirectory'] = tokens[2]
        
#
# Install directory
#
def parse_install_directory(line):
    global current_directory_re
    global ws_re
    tokens = parse_a_line(current_directory_re, ws_re, line)
    if 'InstallDirectory' in Jdoc:
        pass
    else:
        Jdoc['InstallDirectory'] = tokens[2]

#
# Create the _id field if it does not exist and if all the data is there
#
def check_and_add_id():
    if '_id' in Jdoc:
        pass
    else:
        if 'Machid' in Jdoc:
            if 'Starting' in Jdoc:
                if 'Userid' in Jdoc:
                    if 'Procid' in Jdoc:
                        rootid = Jdoc['Userid'] + '_' + str(Jdoc['Starting']) + '_' + Jdoc['Machid']  + '_' + Jdoc['Procid']
                        Jdoc['_id'] = rootid
                        ParentAppNames.append(rootid)

#
# Starting
#
def parse_starting(line):
    global starting_re
    global strarting_ws_re
    tokens = parse_a_line(starting_re, starting_ws_re, line)
    if 'Starting' in Jdoc:
        pass
    else:
        Jdoc['TZ'] = tokens[5]
        Jdoc['Starting'] = int(tokens[6])
    check_and_add_id()    

#
# Machine
#
def parse_machine(line):
    global machine_re
    global machine_ws_re
    tokens = parse_a_line(machine_re, machine_ws_re, line)
    if 'Machine' in Jdoc:
        pass
    else:
        Jdoc['Machine'] = []
        Jdoc['Machid'] = tokens[1]
    for i in range(1, len(tokens)):
        Jdoc['Machine'].append(tokens[i])
    check_and_add_id()    

#
# Process
#
def parse_process(line):
    global machine_re
    global machine_ws_re
    tokens = parse_a_line(machine_re, machine_ws_re, line)    
    if 'Process' in Jdoc:
        pass
    else:
        Jdoc['Process'] = []
        Jdoc['Userid'] = tokens[1]
        Jdoc['Procid'] = pid_ws_re.sub('', tokens[2])
        for i in range(1, len(tokens)):
            Jdoc['Process'].append(tokens[i])
    check_and_add_id()

#
# Loading
#
def parse_loading(line,skiptokens):
    global loading_re
    global loading_ws_re
    tokens = parse_a_line(loading_re, loading_ws_re, strip_paren_re.sub('',line))
    for i in range(0,skiptokens):
        tokens.pop(0)
    if 'LoadingInfo' in Jdoc:
        pass
    else:
        Jdoc['LoadingInfo'] = {}
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
    if filetype in Jdoc['LoadingInfo']:
        pass
    else:
        Jdoc['LoadingInfo'][filetype] = []
    Jdoc['LoadingInfo'][filetype].append(loadfile)

def parse_loading_1(line):
    parse_loading(line, 1)

def parse_loading_2(line):
    parse_loading(line, 2)

#
# Binding
#
def parse_binding(line):
    global loading_re
    global loading_ws_re
    tokens = parse_a_line(loading_re, loading_ws_re, strip_paren_re.sub('',line))
    if 'BindingInfo' in Jdoc:
        pass
    else:
        Jdoc['BindingInfo'] = []
    bindfile = {}
    tokens.pop(0)
    bindfile['file'] = tokens.pop(0)
    if len(tokens) == 7:
        bindfile['dll'] = tokens.pop(0)
        tokens.pop(0)
        bindfile['version'] = tokens.pop(0)
        bindfile['date'] = makedate(tokens[0], tokens[1], tokens[2], tokens[3])
    Jdoc['BindingInfo'].append(bindfile)

#
# pds::turbo
#
def parse_retcode(line):
    global invoked_as_re
    global ws_re    
    tokens = parse_a_line(invoked_as_re, ws_re, line)
    if len(tokens) == 5 and tokens[2] == 'Return' and tokens[3] == 'code':
        Jdoc['Retcode'] = int(tokens[4])

#
# Process took
#
def parse_process_took(line):
    global word_re
    global ws_re
    tokens = parse_a_line(word_re, ws_re, line)
    Jdoc['WallTime'] = makeseconds(tokens[6])

#
# Used
#
def parse_used(line):
    global word_re
    global ws_re
    global peak_match_re
    match = peak_match_re.match(line)
    if match != None:
        tokens = parse_a_line(word_re, ws_re, line)
        Jdoc['Memory'] = float(tokens[4])

#
# child id
#
def childid(appname):
    cid = ''
    for name in ParentAppNames:
        cid += name + '_'
    cid += appname
    return cid

#
# ucon-1
#
def parse_ucon1(line):
    global ucon_re
    global ucon_ws_re
    tokens = parse_a_line(ucon_re, ucon_ws_re, line)
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
        newJdoc['Starting'] = makedate3(tokens[0], tokens[1])
        if len(tokens) > 4:
            newId = tokens[3] + tokens[4]
        else:
            newId = tokens[3]
    print "Parsing " + newId
    newJdoc['_id'] = childid(newId)
    newJdoc['Appid'] = newId
    myparents = list(ParentAppNames)
    newJdoc['parents'] = myparents
    ParentAppNames.append(newId)
    JdocStack.append(newJdoc)
    JdocList.append(newJdoc)
    AttachmentStack.append({})

#
# ucon-2
#
def parse_ucon2(line):
    global ucon_re
    global ucon_ws_re
    global sort_order
    global Threads
    # wait until all the threads are done
    for t in Threads:
        t.join()
    Threads = []
    # proceed ...
    tokens = parse_a_line(ucon_re, ucon_ws_re, line)
    tokens.pop(0)
    if tokens[0] == 'Ended:':
        pass
    else:
        JdocStack[-1]['Ended'] = makedate3(tokens[0], tokens[1])
    JdocStack[-1]['Sort_order'] = sort_order
    sort_order += 1
    JdocStack.pop()
    ParentAppNames.pop()
    AttachmentStack.pop()

#
# ucon-3
#
def parse_ucon3(line):
    global ucon_re
    global ucon_ws_re
    tokens = parse_a_line(ucon_re, ucon_ws_re, line)
    i = 0
    for token in tokens:
        if token == 'delta/current:':
            nums = deltacurr_match_re.sub(' ', tokens[i+1]).split()
            if tokens[i-2] == 'CPU':
                JdocStack[-1]['CPUTime'] = int(nums[1])                
            elif tokens[i-2] == 'Wall':
                JdocStack[-1]['WallTime'] = int(nums[1])                
            elif tokens[i-1] == 'Memory':
                JdocStack[-1]['Memory'] = float(int(nums[1])*10/1024)
        elif token == 'Amode:':
            JdocStack[-1]['Amode'] = tokens[i+1]
        elif token == 'Slew-Dependency:':
            JdocStack[-1]['SlewDependency'] = tokens[i+1]
        elif token == 'Utilization:' and tokens[i-1] == 'Area':
            JdocStack[-1]['AreaUtil'] = int(tokens[i+1])
        elif token == 'worst:' and tokens[i-1] == '20':
            JdocStack[-1]['Avg20'] = float(tokens[i+1])
        elif token == 'CapV:' and tokens[i-1] == 'Num':
            JdocStack[-1]['NumCapV'] = int(tokens[i+1])
        elif token == 'Slew:' and tokens[i-1] == 'Default':
            JdocStack[-1]['DefaultSlew'] = float(tokens[i+1])
        elif token == 'SlewV:' and tokens[i-1] == 'Num':
            JdocStack[-1]['NumSlewV'] = int(tokens[i+1])
        elif token == 'Nets>90:':
            JdocStack[-1]['Over90'] = int(tokens[i+1])
        elif token == 'Nets>100:':
            JdocStack[-1]['Over100'] = int(tokens[i+1])
        elif token in UconValues:
            stoken = token.rstrip(':')
            if UconValues[token] == 0:
                JdocStack[-1][stoken] = int(tokens[i+1])
            elif UconValues[token] == 1:
                JdocStack[-1][stoken] = float(tokens[i+1])
        i += 1

#
# Note:
# Draw calls a thread to do the inline encoding of the data
#
def parse_plot_draw(line):
    global ucon_re
    global ucon_ws_re
    global draw_match_re
    return
    tokens = parse_a_line(ucon_re, ucon_ws_re, line)
    if tokens[1] == 'Creating':
        match = draw_match_re.match(tokens[0],7)
        if match != None:
            if not AttachmentStack:
                AttachmentDocs =  {}
                AttachmentStack.append(AttachmentDocs)
            draw_group = match.group()
            if draw_group in AttachmentStack[-1]:
                pass
            else:
                AttachmentStack[-1][draw_group] = {}
                AttachmentStack[-1][draw_group]['_id'] = JdocStack[-1]['_id'] + '_' + draw_group
                AttachmentStack[-1][draw_group]["_attachments"] = {}
                JdocList.append(AttachmentStack[-1][draw_group])
            pngfile = get_filename(tokens[2])
            AttachmentStack[-1][draw_group]["_attachments"][pngfile] = {}
            AttachmentStack[-1][draw_group]["_attachments"][pngfile]["content_type"] = ''
            AttachmentStack[-1][draw_group]["_attachments"][pngfile]["data"] = ''
            t = threading.Thread(target=encode_png_file, args=(tokens[2], AttachmentStack[-1][draw_group]["_attachments"][pngfile]))
            t.start()
            Threads.append(t)
        else:
            print tokens

#
# Parse [ET-18]: >Begin...Newest
# which is a custom endpoint report
#
def parse_et18(line):
    global ucon_re
    global ucon_ws_re
    return
    tokens = parse_a_line(ucon_re, ucon_ws_re, line)
    print tokens[6]
    endp_parser = EndpointParser()
    #    endp_parser.parse_endpoint_report(tokens[6], JdocStack[-1]['_id'])
    t = threading.Thread(target=endp_parser.parse_endpoint_report, args=(tokens[6], JdocStack[-1]['_id'], False, True))
    t.start()
    Threads.append(t)

#
# Transform parsers
#
def parse_transform_end(line):
    global ucon_re
    global ucon_ws_re
    tokens = parse_a_line(ucon_re, ucon_ws_re, line)
#    print('Transform end', tokens)

def parse_transform_this_call(line):
    global ucon_re
    global ucon_ws_re
    tokens = parse_a_line(ucon_re, ucon_ws_re, line)
#    print('Transform start', tokens)

def parse_transforms_invoked(line):
    global ucon_re
    global ucon_ws_re
    tokens = parse_a_line(ucon_re, ucon_ws_re, line)
#    print('Transform done', tokens)

#
# Other parsers
#
def parse_dm_allocator(line):
    pass

def parse_et224(line):
    pass

def parse_idme(line):
    pass

def parse_srule(line):
    pass

#
# Setup for parser
#
functionDict = {
    'Invoked as':  parse_invoked_as,
    'Current Directory': parse_current_directory,
    'Install Directory': parse_install_directory,
    'Starting': parse_starting,
    'Machine': parse_machine,
    'Process': parse_process,
    'Loading': parse_loading_1,
    'Binding': parse_binding,
    'Process took ': parse_process_took,
    'Used ': parse_used,
    'idme': parse_idme,
    'srule': parse_srule,
    'IDM-48': parse_loading_2,
    'IDM-36': parse_dm_allocator,
    'IMS-160': parse_loading_2,
    'ucon-1': parse_ucon1,
    'ucon-2': parse_ucon2,
    'ucon-3': parse_ucon3,
    'pds::turbo': parse_retcode,
    'ET-18': parse_et18,
    'ET-224': parse_et224,
    'plot::draw_congestion': parse_plot_draw,
    'plot::draw_ports':  parse_plot_draw,
    'plot::draw_usages': parse_plot_draw,
    'plot::draw_movebounds': parse_plot_draw,
    'plot::draw_wires': parse_plot_draw,
    'plot::draw_buffer_tree': parse_plot_draw,
    'plot::draw_bin_density': parse_plot_draw,
    'plot::draw_endpoint': parse_plot_draw,
    '~~i~~': parse_transform_end
    };
            
#
# Parse one concatenated line 
#
def parse_top_line(match, line):
    global unmatchedcount
    brackets = False
    matchstring = match.group()
    if matchstring[-1] == ':':
        matchstring = matchstring[:-1]
    if matchstring[0] == '[' and matchstring[-1] == ']':
        brackets = True
        matchstring = matchstring[1:-1]
    if matchstring in functionDict:
        functionDict[matchstring](line)
        return
    if brackets:
        offset = match.end()
        match_this_call = pds_begin_this_call_re.match(line, offset)
        if match_this_call != None:
            parse_transform_this_call(line)
            return
        match_transforms_invoked = pds_transforms_invoked_re.match(line, offset)
        if match_transforms_invoked != None:
            parse_transforms_invoked(line)
            return
    unmatchedcount += 1
    if match.group() in Unmatched:
        Unmatched[match.group()] += 1
    else:
        Unmatched[match.group()] = 1
#        print('Function for ', match.group(), ' is not defined in eLogParser.py ')

def print_unmatched():
    global unmatchedcount
    print 'Found ' + repr(unmatchedcount) + ' sentences of ' + repr(len(Unmatched)) + ' types'

def old():
    if match.group() == 'Invoked as:':
        # parse_invoked_as(line)
        pass
    elif match.group() == 'Current Directory:':
        # parse_current_directory(line)
        pass
    elif match.group() == 'Install Directory:':
        # parse_install_directory(line)
        pass
    elif match.group() == 'Starting:':
        # parse_starting(line)
        pass
    elif match.group() == 'Machine:':
        # parse_machine(line)
        pass
    elif match.group() == 'Process:':
        # parse_process(line)
        pass
    elif match.group() == 'Loading:':
        # parse_loading(line,1)
        pass
    elif match.group() == 'Binding:':
        # parse_binding(line)
        pass
    elif match.group() == 'Process took ':
        # parse_process_took(line)
        pass
    elif match.group() == 'Used ':
        # parse_used(line)
        pass
    elif match.group() == '[IDM-48]:' or match.group() == '[IMS-160]:':
        # parse_loading(line,2)
        pass
    elif match.group() == '[ucon-1]:':
        # parse_ucon1(line)
        pass
    elif match.group() == '[ucon-2]:':
        # parse_ucon2(line)
        pass
    elif match.group() == '[ucon-3]:':
        # parse_ucon3(line)
        pass
    elif match.group() == '[pds::turbo]:':
        # parse_retcode(line)
        pass
    elif match.group()[:7] == '[ET-18]':
        # parse_et18(line)
        pass
    elif match.group()[:12] == '[plot::draw_':
        # parse_plot_draw(line)
        pass
    else:
        unmatchedcount += 1
        if match.group() in Unmatched:
            Unmatched[match.group()] += 1
        else:
            Unmatched[match.group()] = 1
            print 'Def for ' + match.group() + ' is not defined in eLogParser.py '

    
