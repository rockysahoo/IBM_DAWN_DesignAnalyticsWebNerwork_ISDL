'''
Created on Mar 23, 2015

@author: RW Taggart

This file is the first pass at implementing a script that 
will dynamically generate HTML from data colleced from 
an SQLite script. 

This file is the second implementaiton of using SQLite for this.
'''

import sqlite3
import webbrowser

debug = 0;
debug = 1;
# debug = 2;

def limitFloatPrec(var, precision):
    if var == None:
        return None
    try:
        float(var)
        if (debug >= 4):
            print("      Converting Floating Point: " + str(var))
        casted = float("%.*f" % (precision, var))
    except ValueError:
        casted = var
        if (debug >= 4):
            print("      Could not convert floating point number = '" + str(var) + "', type=" + str(type(var))) 

    return casted

def fileToStr(fileName):
    """Return a string containing the contents of the named file."""
    filein = open(fileName)
    contents = filein.read()
    filein.close()
    return contents

def strToFile(text, filename):
    '''Write a file wtih the given name and text'''
    output = open(filename, "w")
    output.write(text)
    output.close()
    
def browseWeb(port, webpageName = None):
    if (webpageName == None):
        webpageName = "index.html"
    webbrowser.open("localhost:" + str(port) + "/" + webpageName, 2)


class HTMLGeneratorBase:
    def __init__(self, appname, title):
        self.appname = appname
        self.title = title
        
    def addToBody(self, text):
        return
    
    def addTable(self, headerNames, dataValues):
        return
    
    def getHTML(self):
        return
    

class HTMLGenerator(HTMLGeneratorBase):
    ''' This class is responsible for generating generic HTML. I created a new 
    class because these methods are the same between projects 4 and 5. '''
    
    def __init__(self, appname, title):
        self.appname = appname
        self.htmlHead = "<!-- Automatically generated HTML from servlet as response. -->";
        self.htmlHead += "<html><head><title>" + title + "</title>";
        self.htmlHead += ("<style>"
                    + "p {color: black; font-size: x-large}"
                    + ".error {color: red; font-size: large}"
#                     + "th {position:fixed; padding:5px; top:0px}"
                    + "</style>")
        self.htmlHead += "</head>";
        self.htmlBody = "<body>";
        self.htmlBody += "<h2>" + title + "</h2>";
        self.htmlBody += "<p>";
        self.htmlTail = "</p></body></html>"
        
        self.htmlBody += '''
               <form id="IDinfoForm">
               Search Net: <input type="input" name="fNet" value=""/><br/>
               Display Options: 
               <input type="checkbox" name="netOpts" value="Noise Type"/>Noise Type (IH/IL)
               <input type="checkbox" name="netOpts" value="Analysis Type"/>Analysis Type (P/D/S)
               <input type="checkbox" name="netOpts" value="slack"/>Noise Slack
               <input type="checkbox" name="netOpts" value="peak-area"/>Peak/Area
               <input type="checkbox" name="netOpts" value="aggrs"/>Aggressors
               <br/>
               <button type="button" onclick="displaySearch()">Display Info!</button>
            </form>
            <br/><br/>
            '''
            
    def addToBody(self, text):
        self.htmlBody += text;
    
    def addTable(self, headerNames, dataValues):
        if (debug > 0):
            print("Building Table. Number Cols={cols}, number rows={rows}".format(cols=str(len(headerNames)), rows=str(len(dataValues))))
            
        self.htmlTable = "<table border='1'>"
        self.htmlTable += "<tr>"
        for th in headerNames:
            self.htmlTable += "<th>" + th + "</th>"
        self.htmlTable += "</tr>"
        
        for row in dataValues:
            if (debug > 1):
                print("  building row: {}".format(row))
            self.htmlTable += "<tr>"
            i = 0;
            for td in row:
                td = limitFloatPrec(td, 3)
                if (i == 0):
                    self.htmlTable += ("<td>" + "<a href={get} >".format(get = (self.appname + '?' + 'vid=' + str(row[0]))) 
                                                           + str(td) + "</a>" + "</td>")
                    i += 1
                else:
                    self.htmlTable += ("<td>" + str(td) + "</td>")

            self.htmlTable += "</tr>"
        self.htmlTable += "</table>"
        
        if (debug > 2):
            print ("  HTML Table: \n {}".format(self.htmlTable))
        self.addToBody(self.htmlTable)
        
    def getHTML(self):
        return self.htmlHead + self.htmlBody + self.htmlTail;

class HTMLTemplateReader(HTMLGenerator):
    def __init__(self, appname, title, filename):
        self.htmlTemplate = fileToStr(filename)
        
    def addToBody(self, text):
        self.htmlTemplate.format(body=str(text + "<br/>" + "{body}"))
        
    def addToTable(self):
        return
    
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

def genSummaryInfo(queryResult):
    totalNets = 0;
    failingNets = 0;
    for row in queryResult:
        totalNets += 1
        if row[2] < 0: 
            failingNets += 1
    content = '''
    <p><h3>Run Summary</h3>
    Total Nets Analyzed:  {tnets}</br>
    <b>Total Failing Nets:  {fnets}<b></br>
    </p>
    '''.format(tnets=totalNets, fnets=failingNets)
    
    return content

def constructHTML(htmlGen, fileName, table):
    htmlGen.addTable(table[0], table[1:])
    strToFile(htmlGen.getHTML(), fileName);
    return htmlGen.getHTML()

def main():
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
    print("Executing NiofDataGen.py - NIOF SQLite Data Generator.")
    main()
