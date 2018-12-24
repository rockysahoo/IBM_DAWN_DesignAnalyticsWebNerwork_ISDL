'''
Created on Mar 23, 2015

@author: RW Taggart

This file is the first pass at implementing a script that 
will dynamically generate HTML from data collected from 
an SQLite script. 

This file is the second implementaiton of using SQLite for this.
'''

import sqlite3
from webTools.webToolsUtils import *
from webTools.htmlGen import HTMLGenerator

debug = 0;
debug = 1;
# debug = 2;

class DataBase:
    ''' This is intended to be a base class which all
    other supported DB wrappers may be based on. '''
    def __init__(self, name, location):
        args = None
        if debug:
            print("(D):  Init database. name={name}, loc={loc}. args={args}".format(name=name, loc=location, args=args))
        self.name = name
        self.loc = location
    
    def setDBLoc(self, name, location):
        if name:
            self.name = name
        self.loc = location
        
    def connect(self):
        raise NotImplementedError
        
    def defineQuery(self, statement):
        raise NotImplementedError
    
    def executeQuery(self):
        raise NotImplementedError
    
    
class SQLiteDataBase(DataBase):
    ''' Wrapper around sqlite3 python package. '''
        
    def connect(self):
        try:
            self.conn = sqlite3.connect(self.loc)
            self.c = self.conn.cursor()
        except:
            print("(E):  could not connect to db at '{}'".format(self.loc))
            raise
    
    def retriveTableNames(self):
        self.c.execute("SELECT name FROM sqlite_master WHERE type='table';")
        return [item[0] for item in self.c.fetchall()]
    
    def retriveTableAttributes(self, table=None):
        ''' Return attributes for the specified table.
            Return for everything if table==None 
            It returns a dict with table names as keys, 
            and a list of attributes as values.'''
        tables = []
        attrs = {}
        if table == None:
            tables = [item for item in self.retriveTableNames()]
        else:
            tables[0] = table
            
        for t in tables:
            sql = "PRAGMA table_info('{}');".format(t)
            if debug:  print("Retrieve attrs stmnt = {}".format(sql))
            attrs[t] = [item[1] for item in self.executeQuery(sql)] 
            
        return attrs
    
    def getHeader(self):
        return [item[0] for item in self.c.description]
    
    #TODO:  Return header, data. Remove header argument
    def executeQuery(self, sqlStatement, header=True):
        ''' Executes the SQL statement passed in as an argument.
            Return:  fully populated table (list) with the first
            row representing the header. '''
        self.c.execute(sqlStatement)
        table = self.c.fetchall()
        
        if debug:  print("(D):  query table type={}".format(type(table)))
        if table == None:
            #or table[0][0] == None:
            return None
        #elif table[0] == None :
            #return None

        if debug:  print("(D):  query result begin: {}".format(str(table[0:3])))
        
        return self.getHeader(), table
    
    def executeQueryFirst(self, queryHandle, sqlStatement):
        ''' Executes the SQL statement passed in as an argument.
            Return:  tuple of (header, first row) from result '''
        if queryHandle:
            try:
                self.qh[queryHandle] = self.c
            except:
                self.qh = {queryHandle: self.c}  
        self.c.execute(sqlStatement)

        row = self.c.fetchone()
        return (self.getHeader(), row)
    
    def executeQueryNext(self, queryHandle):
        ''' Returns the next tuple of the SQL query. 
            Call executeQueryFirst first! '''
        
        c = self.qh[queryHandle]
        row = c.fetchone()
        return row
    
    def executeQueryArgs(self, sqlStatement, args):
        #TODO: replace with *args and do list compreh.
        ''' Executes the SQL statement passed in as an argument.
            Will pass other arguments into sqlite API for variable
            substitution. 
            Return:  fully populated table (list) with the first
            row representing the header. '''
        self.c.execute(sqlStatement, args)
        table = self.c.fetchall()
        
        table.insert(0, [item[0] for item in self.c.description])
        return table

class JsonDatabase(DataBase):
    ''' Wrapper around JSON data objects. 
    This may be unnecessary. '''
    def __init__(self, *args, **kwargs):
        DataBase(*args, **kwargs)
        raise NotImplementedError

def executeSQLiteQuery(query):
    if (debug >= 1):  print("(D):  Query = {}".format(query))
    niof_fileName = "niof.data"
    conn = sqlite3.connect(niof_fileName)
    c = conn.cursor()
    
    
    c.execute(query)
    table = c.fetchall()
    table.insert(0, [item[0] for item in c.description])
    if (debug >= 2):
        print(table)
    return table

def executeSummaryQuery(appname, title, htmlName):
    # Execute Summary Query
    queryResult = executeSQLiteQuery('SELECT DISTINCT VictimName, TotalPeak, NoiseSlack ' 
              + 'from VICTIM where TotalPeak > 0.2 ' 
              + ' ORDER BY NoiseSlack ASC;')
    htmlGen = HTMLGenerator(appname, title)
    
    htmlGen.addToBody(genSummaryInfo(queryResult[1:]))
    
    content = constructHTML(htmlGen, htmlName, queryResult)
    print("WebPage:  " + htmlName)
    return content

def executeDetailsQuery(appname, title, htmlName, victimName):
        # Execute Details Query
    title = "Victim Net Details"
    htmlName = (title + ".html").replace(" ", "")
    queryResult = executeSQLiteQuery('SELECT * ' 
              + "from VICTIM where VictimName like '{vname}'".format(vname = victimName) 
              + ' ORDER BY NoiseSlack ASC, NoiseType;')
    htmlGen = HTMLGenerator(appname, title)
    content = constructHTML(htmlGen, htmlName, queryResult)
    print("WebPage:  " + htmlName)
    return content

def executeDetailsQuery2(appname, title, htmlName, victimName):
        # Execute Details Query
    title = "New Query"
    htmlName = (title + ".html").replace(" ", "")
    queryResult = executeSQLiteQuery('SELECT * ' 
              + "from VICTIM where VictimName like '{}'".format(victimName) 
              + ' ORDER BY NoiseType;')
    htmlGen = HTMLGenerator(appname, title)
    content = constructHTML(htmlGen, htmlName, queryResult)
    print("WebPage:  " + htmlName)
    return content

# def genSummaryInfo(queryResult):
#     totalNets = 0;
#     failingNets = 0;
#     for row in queryResult:
#         #totalNets += 1
#         if row[2] < 0: 
#             failingNets += 1
#     content = '''
#     <p><h3>Run Summary</h3>
#     Total Nets Analyzed:  {tnets}</br>
#     <b>Total Failing Nets:  {fnets}<b></br>
#     </p>
#     '''.format(tnets=totalNets, fnets=failingNets)
#     
#     return content

def constructHTML(htmlGen, fileName, table):
    htmlGen.addTable(table[0], table[1:])
    strToFile(htmlGen.getHTML(), fileName);
    return htmlGen.getHTML()

def main_test():
    port = 8003
    title = "Victim Nets Sorted by Slack"
    appname="NiofDataGen2"
    htmlName = (title + ".html").replace(" ", "")
    
#     contents = '''fileToStr('exampleTemplate.html').format(**locals())'''
#     strToFile(contents, "index.html")
    
    executeSummaryQuery(appname, title, htmlName)
    
    executeDetailsQuery(appname, title, htmlName)
    
    executeDetailsQuery2(appname, title, htmlName)
    
    browseWeb(port, htmlName)
    


if __name__ == "__main__":
    print("Executing Database.py in test environment.")
#     print("Executing NiofDataGen.py - NIOF SQLite Data Generator.")
#     main_test()
    dbLocation = "./niof.data"
    db = SQLiteDataBase("test", dbLocation)
    db.connect()
    print("Table Names:")
    print(db.retriveTableNames())
    print("{")
    for key, values in db.retriveTableAttributes().items():
        print("{key}: {value}".format(key=key, value=values))
    print("}")
#     print(db.retriveTableAttributes())
    
#     print(db.executeQuery("SELECT * FROM VICTIM where NoiseSlack < 0.0;"))
