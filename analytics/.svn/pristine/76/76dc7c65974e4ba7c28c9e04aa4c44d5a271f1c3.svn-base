
#
# Python
# Parser of Big Brother files
#
import gzip
import bz2
import pylzma as xz
import re
import os
import copy
from subprocess import Popen, PIPE
from os import walk
from eLogUtils import *
from bbParse import *
from multiprocessing import Pool

#
# One file
#
def DoAFile(fname):
    print(' Reading ', fname) 
    gz_match = gz_re.match(fname)
    bz_match = bz_re.match(fname)
    xz_match = xz_re.match(fname)
    try:
        if gz_match != None:
            fobject = gzip.open(fname, 'r')
            lines = fobject.readlines()
            fobject.close()
        elif bz_match != None:
            fobject = bz2.BZ2File(fname)
            lines = fobject.readlines()
            fobject.close()
        elif xz_match != None:
            cmd = 'unxz'
            p = Popen([cmd, '-c', fname], stdout=PIPE)
            lines = p.communicate()[0].splitlines()
        else:
            fobject = open(fname, 'r')
            lines = fobject.readlines()
            fobject.close()
        if len(lines) > 0:
            numdocs = ParseBB(fname, lines, True)
            print(fname, ' l:', len(lines), ' d:', numdocs)
    except IOError:
        print(' Error opening ', fname)
        pass
    

#
# Files
#
def DoFiles(mypool, dirpath, filenames):
    #for f in filenames:
    #    fname = dirpath + '/' + f
    #    DoAFile(fname)
    for f in filenames:
        fname = dirpath + '/' + f
        mypool.apply_async(DoAFile, args = (fname,))
        
#
# Dirs
#
def DoDirs(dirnames):
    pass

#
# Visit all the files 
#
def DoDir(mypath):
    mypool = Pool(8)
    for (dirpath, dirnames, filenames) in walk(mypath):
        print('In directory: ', dirpath)
        DoFiles(mypool, dirpath, filenames)
    mypool.close()
    mypool.join()

#
# Main
#
if __name__ == '__main__':
    print(' Begin Parsing and Transmitting ')
    DoDir('.')
    print(' Done Parsing and Transmitting ')
