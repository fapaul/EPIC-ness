import pyhdb
import traceback
from credentials_hana import HOST, PORT, USER, PASSWORD

connection = pyhdb.connect(
	host=HOST,
	port=PORT,
	user=USER,
	password=PASSWORD
)

# Calculate the average turnover of a certain hour at a day of the week
# dayOfWeek: 1 - 7
# hour: 1 - 23
# TODO: Are there "Perpared Statements" with PyHDB ? (for safety & speed)
def queryHoursFareAverage( dayOfWeek, hour ):
	query = open('results/AverageTurnoverPerHour_Weekday.sql').read()
	
	query = query.replace('?', str(dayOfWeek), 1) # Replace first question mark
	query = query.replace('?', str(hour), 1)
	
	cursor = connection.cursor()
	cursor.execute(query)
	
	hoursFareAverage = cursor.fetchone()[0]
	print hoursFareAverage
	
	return hoursFareAverage

# Calculate the average turnover of a week of the year
# weekNumber: 1 - 53 (53st week has 1 or 2 days)
# TODO: Are there "Perpared Statements" with PyHDB ? (for safety & speed)
def queryWeeksFareAverage( weekNumber ):
	query = open('results/AverageTurnoverPerWeek.sql').read()
	
	query = query.replace('?', str(weekNumber), 1) # Replace first question mark
	
	cursor = connection.cursor()
	cursor.execute(query)
	
	weeksFareAverage = cursor.fetchone()[0]
	print weeksFareAverage
	
	return weeksFareAverage

# Executing test code
try :
	print "Connection successfull \n";
	
	# TODO:
	# Fuer die Prognose werden nach Prioriaet geordnet folgende Attribute beachtet:
	# 1.) Wochentag zu dieser Stunde & Minute
	#	- DAYNAME/WEEKDAY and HOUR and MINUTE
	# 2.) Woche des Jahres (statt Jahreszeiten/-quartal)
	#	- WEEK
	
	# Hana SQL Date functions: https://help.sap.com/saphelp_hanaone/helpdata/en/20/9f228975191014baed94f1b69693ae/content.htm
	
	hoursFareAverage = queryHoursFareAverage(1, 19)
	weeksFareAverage = queryWeeksFareAverage(32)
	
except Exception as e:
	print "Error detected: ", e;
	print traceback.format_exc(e);
finally :
	print "Connection closed";
	connection.close()