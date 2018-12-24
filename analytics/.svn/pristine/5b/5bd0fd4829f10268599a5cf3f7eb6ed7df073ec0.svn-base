
import gzip
import bz2
import pylzma as xz
import re
import os
from subprocess import Popen, PIPE
from os import walk
from eLogUtils import *

#
# General file reader
#
class eLogFile:

    def __init__(self, filename):
        self.filename = filename
        self.line_no = 0
        self.lines = []
        self.read = False
        self.readFile()

    def fileName(self):
        return self.filename

    def lineNo(self):
        return self.line_no

    def fileRead(self):
        return self.read

    def readFile(self):
        filename = self.filename
        gz_match = gz_re.match(filename)
        bz_match = bz_re.match(filename)
        xz_match = xz_re.match(filename)
        try:
            if gz_match != None:
                fobject = gzip.open(filename, 'r')
                self.lines = fobject.readlines()
                self.line_no = 0
                fobject.close()
            elif bz_match != None:
                fobject = bz2.BZ2File(filename)
                self.lines = fobject.readlines()
                self.line_no = 0
                fobject.close()
            elif xz_match != None:
                cmd = 'unxz'
                p = Popen([cmd, '-c', filename], stdout=PIPE)
                self.lines = p.communicate()[0].splitlines()
                self.line_no = 0
            else:
                fobject = open(filename, 'r')
                self.lines = fobject.readlines()
                self.line_no = 0
                fobject.close()
            if len(self.lines) > 0:
                self.read = True
                print ' Read ' + repr(len(self.lines)) + ' lines from ' + self.filename
            else:
                self.read = False
        except IOError:
            print ' Error opening ' + filename
            self.read = False
            return False
        return True

    def eof(self):
        return self.line_no >= len(self.lines)

    def getPrevLine(self):
        line = ''
        if self.line_no-1 < len(self.lines) and self.line_no-1 >= 0:
            line = self.lines[self.line_no-1]
        return line
        
    def getLine(self):
        if self.eof():
            return
        line = self.lines[self.line_no]
        self.line_no += 1
        return line

#
# Split file reader
#
class eLogSplitFile:

    def __init__(self):
        self.logFileStack = []

    def pushFile(self, filename):
        #if len(self.logFileStack) > 0:
        #    prevline = self.logFileStack[-1].getPrevLine()
        #    print repr(self.logFileStack[-1].lineNo()-1) + ' ' + self.logFileStack[-1].fileName() + ' - ' + prevline
        file = eLogFile(filename)
        if file.fileRead():
            self.logFileStack.append(file)

    def eof(self):
        if len(self.logFileStack) > 0:
            return False
        return True

    def getLine(self):
        line = ''
        if not self.eof():
            line = self.logFileStack[-1].getLine()
            # print repr(self.logFileStack[-1].lineNo()) + ' ' + self.logFileStack[-1].fileName() + ' - ' + line
            if self.logFileStack[-1].eof():
                self.logFileStack.pop()
        return line
