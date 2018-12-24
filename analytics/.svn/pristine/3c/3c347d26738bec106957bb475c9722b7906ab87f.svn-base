'''
Created on Apr 13, 2015

@author: rwt
'''
import webbrowser

debug = 0;

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