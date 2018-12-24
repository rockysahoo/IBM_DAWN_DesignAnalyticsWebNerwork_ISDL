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

def list_key(entry):
    if 'Sort_order' in entry:
        return entry['Sort_order']
    return 0

db = 'testdb3'
headers = {'Content-type': 'application/json'}
db_url = account_url + '/' + db + '/_find'
doc = {
    'selector': {
    "$and": [{"_id": {"$gte": "srstg_1416821897_fshlnx10r_28601"}}, {"_id": {"$lte": "srstg_1416821897_fshlnx10r_28601z"}}], 
    },
    'fields' : [ '_id', 'Sort_order', 'Appid', 'parents' ]
    }

response = requests.post(db_url, data=json.dumps(doc), headers=headers)
#print('   ', json.dumps(doc))
#print(json.dumps(response.json(), indent=4, separators=(',', ': ')))
data = response.json()
data['docs'].sort(key=list_key)
for entry in data['docs']:
    if 'Sort_order' in entry:
        print repr(entry['Sort_order']) + ' ' + entry['_id'] + ' ' + entry['Appid'] + ' ' + repr(entry['parents'])
    elif 'Appid' in entry:
        print '0 ' + entry['_id'] + ' ' + entry['Appid']
    else:
        print '0 ' + entry['_id']
