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
db_url = account_url + '/' + db + '/_all_docs?include_docs=true'
doc = {
    'keys': [ "arjen_1407167426_fshlnx10ao_12985", "gus_1404575243_gridlnx160_20955", "gus_1404575248_gridlnx080_27164"]       
    }

response = requests.post(db_url, data=json.dumps(doc), headers=headers)
print('   ', json.dumps(doc))
print(json.dumps(response.json(), indent=4, separators=(',', ': ')))
