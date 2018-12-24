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

headers = {'Content-type': 'application/json'}
db_url = account_url + '/_active_tasks';

response = requests.get(db_url)
print(json.dumps(response.json(), indent=4, separators=(',', ': ')))
