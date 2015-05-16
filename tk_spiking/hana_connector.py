import pyhdb
import traceback
from credentials_hana import HOST, PORT, USER, PASSWORD

connection = pyhdb.connect(
	host=HOST,
	port=PORT,
	user=USER,
	password=PASSWORD
)

cursor = connection.cursor()
print "HANA connection successfull \n";

# Example: SELECT DRIVER, FARE FROM NYCCAB.FARE_DOUBLE LIMIT 3
def callQuery( sqlQuery ):
	result = None
	try :
		print "Executing SQL query: " + sqlQuery;
		cursor.execute(sqlQuery)
		result = cursor.fetchall()
		print "Query successfull";
	except Exception as e:
		print "Error detected: ", e;
		print traceback.format_exc(e);
	finally :
		connection.close()
		print "Connection closed";
		return result