#
# Python
# Parser of EDA logfiles, will send the results into a CLOUDANT database
#
import gzip
import bz2
import re
import argparse
import json
import os
import requests
from cloudantAccountURL import *

db = 'testdb3'
headers = {'Content-type': 'application/json'}
db_url = account_url + '/' + db + '/_index';
doc = {
    'name': 'root-doc-index',
    'type': 'json',
    'index': {
    'fields': [ 'parents[0]', 'Appid' ]
    }
    }

response = requests.post(db_url, data=json.dumps(doc), headers=headers)
print('   ', response.json())
