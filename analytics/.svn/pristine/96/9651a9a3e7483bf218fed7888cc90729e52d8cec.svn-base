'''
Created on Apr 13, 2015

@author: RW Taggart
'''

from webTools.webToolsUtils import *
import xml.etree.ElementTree as ET
import os.path


debug = 0
debug = 1
debug = 3

class AppDataManipulatorBase:
    def __init__(self):
        return
    
    def initCallBacks(self):
        raise NotImplementedError
    
    def rowCallBack(self):
        raise NotImplementedError
    
    def cellCallBack(self):
        raise NotImplementedError
    


class HTMLHandlerBase:
    ''' This class is used as a handle for generating the 
        HTML files for the application. '''
    def __init__(self):
        return
        
    def getIndexPage(self):
        raise NotImplementedError
    
    
class HTMLGeneratorBase:
    def __init__(self, appname, title, callBackObjType):
        self.appname = appname
        self.title = title
        self.callBackObjType = callBackObjType
        
    def addToBody(self, text):
        return
    
    def addTable(self, headerNames, dataValues, index, lessvalue):
        return
    
    def getHTML(self):
        return
    
###   We don't think this is used anymore.
###   Test to find out.
class HTMLGenerator(HTMLGeneratorBase):
    ''' This class is responsible for generating generic HTML. I created a new 
    class because these methods are the same between projects 4 and 5. '''
    
    def __init__(self, appname, title):
        self.appname = appname
#         self.htmlHead = "<!-- Automatically generated HTML from servlet as response. -->";
#         self.htmlHead += "<html><head><title>" + title + "</title>";
#         self.htmlHead += ("<style>"
#                     + "p {color: black; font-size: x-large}"
#                     + ".error {color: red; font-size: large}"
# #                     + "th {position:fixed; padding:5px; top:0px}"
#                     + "</style>")
#         self.htmlHead += "</head>";
#         self.htmlBody = "<body>";
#         self.htmlBody += "<h2>" + title + "</h2>";
#         self.htmlBody += "<p>";
#         self.htmlTail = "</p></body></html>"
#         
#         self.htmlBody += '''
#                <form id="IDinfoForm" method = "POST">
#                Search Net: <input type="input" name="fNet" value=""/><br/>
#                Display Options: 
#                <input type="checkbox" name="netOpts" value="Noise Type"/>Noise Type (IH/IL)
#                <input type="checkbox" name="netOpts" value="Analysis Type"/>Analysis Type (P/D/S)
#                <input type="checkbox" name="netOpts" value="slack"/>Noise Slack
#                <input type="checkbox" name="netOpts" value="peak-area"/>Peak/Area
#                <input type="checkbox" name="netOpts" value="aggrs"/>Aggressors
#                <br/>
#                <button type="button" onclick="displaySearch()">Display Info!</button>
#             </form>
#             <br/><br/>
#             '''
#             
#     def addToBody(self, text):
#         self.htmlBody += text;
#     
#     def addTable(self, headerNames, dataValues, index, lessvalue):
#         if (debug > 0):
#             print("Building Table. Number Cols={cols}, number rows={rows}".format(cols=str(len(headerNames)), rows=str(len(dataValues))))
#              
            
#         self.htmlTable = "<table border='1'>"
#         self.htmlTable += "<tr>"
#         for th in headerNames:
#             self.htmlTable += "<th>" + th + "</th>"
#         self.htmlTable += "</tr>"
#         
#         for row in dataValues:
#             if (debug > 1):
#                 print("  building row: {}".format(row))
#             self.htmlTable += "<tr>"
#             i = 0;
#             for td in row:
#                 td = limitFloatPrec(td, 3)
#                 if (i == 0):
#                     self.htmlTable += ("<td>" + "<a href={get} >".format(get = (self.appname + '?' + 'vid=' + str(row[0]))) 
#                                                            + str(td) + "</a>" + "</td>")
#                     i += 1
#                 else:
#                     self.htmlTable += ("<td>" + str(td) + "</td>")
# 
#             self.htmlTable += "</tr>"
#         self.htmlTable += "</table>"
#         
#         if (debug > 2):
#             print ("  HTML Table: \n {}".format(self.htmlTable))
#         self.addToBody(self.htmlTable)
#         
#     def getHTML(self):
#         return self.htmlHead + self.htmlBody + self.htmlTail;

class HTMLTemplateGenerator(HTMLGeneratorBase):
    def __init__(self, appname, title, callBackObjType):
        #  TODO:  Use *args & **kwargs for this stuff, rather than explicitly stating.
        super().__init__(appname, title, callBackObjType)
        self.bodykw = {'tnets': "", 'fnets': "", 'victimNet': ""}
        
#         self.bodyElem  = ET.Element("body")
#         ET.SubElement(self.bodyElem, "h2").text = title
        self.pElem     = ET.Element("p")
        self.tableBody = ET.Element("body")
    
    def readHTMLTemplate(self, path, fileName):
        templateFileName = os.path.join(path, fileName)
        self.template = fileToStr(templateFileName)
    
    def addToBody(self, html):
        # This function is expecting a dictionary of name/value pairs to pass
        # to the format function. These should be specified in the HTML
        # document template.
        # html: expecting dict of kw/val pairs corresponding to the HTML
        # template document's body.
        
        self.bodykw.update(html)
        
    def addNewLineToTables(self):
        ET.SubElement(self.tableBody, "br")
        
    def addHorizontalToTables(self):
        ET.SubElement(self.tableBody, "hr")
    
    def addBarGraph(self):
        xVals = {0, 1 ,2, 4, 7, 8, 13}
        yVals = {0, 1, 4, 16, 49, 64, 139}
        pylab.plot(xVals, yVals)
    
    def tableToHtml(self, headerNames, dataValues,victimName, hasLinks, selectedRow = "NOT IMPLEMENETED YET"):
            htmlBuffer = "<table style ='margin-left:auto; margin-right:auto;' border = 1;><tr>"
            rowIsSelected = False;
            for header in headerNames:
                htmlBuffer += "<th>"
                htmlBuffer += header
                htmlBuffer += "</th>"
            htmlBuffer += "</tr>"
            for row in dataValues:
                if row != None:
                    htmlBuffer += "<tr>"
                    for val in row:
                        htmlBuffer += "<td>"
                        if(val==selectedRow):
                            htmlBuffer += "<div style = 'background-color: yellow;'>"
                            rowIsSelected = True
                        if(hasLinks and val==row[0]):
                            link = "{app}?file=/afs/eda/project/einsnoise/sandboxes/wth/testcases/fails/niof.data&vid={value}&sink={sValue}".format(app=self.appname, value=victimName, sValue=val)
                            htmlBuffer += "<a href ="
                            htmlBuffer += link
                            htmlBuffer += ">"
                            htmlBuffer += val
                            htmlBuffer += "</a>"
                        else:
                            if isinstance(val, float):
                                val = round(val, 3)
                            htmlBuffer += repr(val)
                        htmlBuffer += "</td>"
                    if(rowIsSelected):
                        rowIsSelected = False
                        htmlBuffer += "</div>"
                    htmlBuffer += "</tr>"
            htmlBuffer += "</table>"
            return htmlBuffer
                
            
    
    def addTable(self, headerNames, dataValues, callBackObj):
        #  This function is expecting a list of lists for datavalues
        #  The first column is a "modifier." 
        tableElem = ET.SubElement(self.tableBody, "table", {'border': '3'})
        if debug:  print("(D):  htmlGen.addTable(size={})".format(len(dataValues)))
        if debug > 1:  print("(D):  header:  {}".format(str(headerNames)))
        if debug > 1:  print("(D):  data:    {}".format(str(dataValues[0:3])))

        tablehr = ET.SubElement(tableElem, "tr")
        for th in headerNames:
            etth = ET.SubElement(tablehr, "th").text=th
#         try:
#             ET.tostring(etth, 'utf-8')
#         except Exception as e:
#             print('could not write header "{}" to string. e:{}'.format(str(th), str(e)))
#             raise
                    
        
        for vals in dataValues:
            if not vals:  continue
#             modifier = vals[0]
#             try:
#                 row = vals[1]
#             except Exception as e:
#                 print("(D):  htmlgen error has occured. '{}'. vals={}.  dataValues:{}".format(e, str(vals), dataValues[0:10]))
#                 raise
            row = vals  # TODO:  Take this out once this works. We won't need it anymore.
            attr={}
#             if debug > 1: 
#                 print("(D): mod={}, row={}".format(str(modifier), str(row)))
            
            #  TODO: 
            #  Would be used to indicate if a net is failing, 
            #  or some other thing. -- That translates to adjusting
            #  the style or properties of the row.
            callBackObj.rowCallBack(row)
            
            # TODO:  Make modifier of type Enum.
            if callBackObj.rowAttr:
                attr={'class': callBackObj.rowAttr}
            trow = ET.SubElement(tableElem, "tr", attr)
            
            i = 0
            vid = row[0]
            for elem in row:
                elem = limitFloatPrec(elem, 3)
                
                #  TODO:
                #  Used to indicate special formatting of the element.
                #  Also indicate if should be a link. For now we can 
                #  use this to hide rows as well, although that should 
                #  be done in the query. 
                callBackObj.cellCallBack(i, elem)
                ttd = ET.SubElement(trow, "td")
                if (callBackObj.isLink):
                    #FIXME:  Hardcoded to make first column "linked" also get rid of hackiness from change to framed format
                    link = "{app}?file=/afs/eda/project/einsnoise/sandboxes/wth/testcases/fails/niof.data&{key}={value}".format(app=self.appname, key='vid', value=vid)
                    ET.SubElement(ttd, "a", {'href': link}).text=str(elem)
                else:
                    ttd.text = str(elem)
                try: 
                    ET.tostring(ttd, 'utf-8')
                except Exception as e:
                    print('could not write body "{}" to string. e:{}'.format(row[0]), str(e))
                    raise
                i = i + 1
    
    def getHTML(self):
        if debug:  print("(D):  dataGen.getHTML()")
        if debug:
            for key in self.bodykw:
                print(key)
        self.template_format = self.template.format(
                               title    = self.title
                             , input    = ""
                             , table    = ET.tostring(self.tableBody, "utf-8").decode("utf-8")
                             , **self.bodykw
                             )
        return self.template_format

###  FIXME:  I believe this is not used.
# class HTMLTemplateReader(HTMLGeneratorBase):
#     def __init__(self, appname, title, filename):
#         self.htmlTemplate = fileToStr(filename)
#         
#     def addToBody(self, text):
#         self.htmlTemplate.format(body=str(text + "<br/>" + "{body}"))
#         
#     def addToTable(self):
#         return
    
class XMLGenerator(HTMLGeneratorBase):
   ### This class is used to mimic the HTML generator, but it uses an XML tree.
   ### I believe that we had issues when converting the string to bytecode for 
   ### The HTTP request. 

    def __init__(self, appname, title):
        self.docRoot = ET.Element("NIOF")
        self.header  = ET.SubElement(self.docRoot, "noiseHeader")
        self.units   = ET.SubElement(self.header, "units", {'time':'ps', 'voltage':'V', 'capacitance':'fF'})
        
        self.table   = ET.SubElement(self.docRoot, "table")
        self.body    = ET.SubElement(self.docRoot, "body")
        
    def addToBody(self, text):
        ET.SubElement(self.body, "body", {}, text=text)
        
    def addTable(self, headerNames, dataValues):
        if debug > 1:  print("(D):  table headers: ")
        headAttrs = {"c" + str(i):str(val) for i,val in enumerate(headerNames, 1)}
        if debug > 1:  print(headAttrs)
        ET.SubElement(self.table, "tableHead", headAttrs)
        print("(D):  table values:")
        for datum in dataValues:
            if debug:  print(datum)
            attrs = {"c" + str(i):str(val) for i,val in enumerate(datum, 1)}
            if debug:  print(attrs)
            ET.SubElement(self.table, "tableRow", attrs)
    
    def getHTML(self):
        self.xmlTree = ET.ElementTree(self.docRoot)
        if debug:  print(ET.tostring(self.docRoot))
        return ET.tostring(self.docRoot, "utf-8").decode("utf-8")

    def writeToFile(self, fileName):
        self.xmlTree = ET.ElementTree(self.docRoot)
        self.xmlTree.write(fileName, xml_declaration=True)
