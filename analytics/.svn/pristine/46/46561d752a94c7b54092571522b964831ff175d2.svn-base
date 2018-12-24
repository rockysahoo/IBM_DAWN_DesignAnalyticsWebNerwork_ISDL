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

#    "$or": [
#             {"_id": "arjen_1407167426_fshlnx10ao_12985"},
#             {"_id": "gus_1404575243_gridlnx160_20955"}, 
#             {"_id": "gus_1404575248_gridlnx080_27164"}
#       ]

#        "$and": [
#            { "_id" : {"$gt": "gmschaef_1422919009_fshlnx10ce_32427"} },
#            { "_id" : {"$lt": "gmschaef_1422919009_fshlnx10ce_32427_z"} }
#            ]


db = 'testdb3'
headers = {'Content-type': 'application/json'}
db_url = account_url + '/' + db + '/_find'
doc = {
    'selector': {
        "Appid": "final_assessment",
        "$and": [
            { "_id" : {"$gt": "gmschaef_1422919009_fshlnx10ce_32427"} },
            { "_id" : {"$lt": "gmschaef_1422919009_fshlnx10ce_32427_z"} }
            ]
        },
    'fields' : [ '_id' ]
    }

response = requests.post(db_url, data=json.dumps(doc), headers=headers)
print ' Query: ' + json.dumps(doc)
print json.dumps(response.json(), indent=4, separators=(',', ': '))
