import jinja2
import hana_connector as db

# Code source: http://kagerato.net/articles/software/libraries/jinja-quickstart.html
# Useful Jinja documentation: http://jinja.pocoo.org/docs/dev/templates/

# lstrip_block removes leading spaces/tabs (TK: not sure what that means because there is still intending)
templateEnv = jinja2.Environment( loader=jinja2.FileSystemLoader( searchpath="./" ), trim_blocks=True)

# This constant string specifies the template file we will use (as a relative path).
TEMPLATE_FILE = "displayData_jinja.html"

# Load the template file using the template environment.
template = templateEnv.get_template( TEMPLATE_FILE )

# TODO: Query an Hana und in templateVars abspeichern
dbResult = db.callQuery("SELECT FARE FROM NYCCAB.FARE_DOUBLE LIMIT 4")
# print dbResult[0][0] # -> Output: 6.5

# Specify any input variables to the template as a dictionary.
templateVars = {} # "chartDataAsJson" : "Test Example" -> Format: look at chartDataExmaple.js

# Finally, process the template to produce our final text.
outputText = template.render( templateVars )

print outputText