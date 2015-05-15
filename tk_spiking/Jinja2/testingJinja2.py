import jinja2

# Code source: http://kagerato.net/articles/software/libraries/jinja-quickstart.html
# Useful Jinja tutorial/documentation: http://jinja.pocoo.org/docs/dev/templates/

# In this case, we will load templates off the filesystem so we must construct a FileSystemLoader object.
# The search path can be used to make finding templates by relative paths much easier.
templateLoader = jinja2.FileSystemLoader( searchpath="./" )

# An environment provides the data necessary to read and parse templates.
# trim_blocks removes template lines (which would be empty in the result)
# lstrip_block removes leading spaces/tabs (TK: not sure what that means because there is still intending)
templateEnv = jinja2.Environment( loader=templateLoader, trim_blocks=True, lstrip_blocks=True )

# This constant string specifies the template file we will use (as a relative path).
TEMPLATE_FILE = "example.jinja"

# Load the template file using the template environment.
template = templateEnv.get_template( TEMPLATE_FILE )

# Specify any input variables to the template as a dictionary.
templateVars = { "title" : "Test Example",
                 "description" : "A simple inquiry of function.",
				 "favorites" : [ "chocolates", "lunar eclipses", "rabbits" ] }

# Finally, process the template to produce our final text.
outputText = template.render( templateVars )

print outputText