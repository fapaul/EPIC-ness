import pyhdb
import traceback
from credentials_hana import HOST, PORT, USER, PASSWORD

connection = pyhdb.connect(
	host=HOST,
	port=PORT,
	user=USER,
	password=PASSWORD
)

try :
	print "Connection successfull \n";
	
	cursor = connection.cursor()
	# FARE, SURCHARGE, MTA_TAX, TIP, TOLLS, TOTAL (-> Float alias Real) throws Exception:
	# "unpack requires a string argument of length 4"
	cursor.execute("SELECT DRIVER, FARE FROM NYCCAB.FARE_DOUBLE LIMIT 3")
	#("SELECT MEDALLION, DRIVER, VENDOR, PICKUP_TIME, PAYMENT_TYPE, TOTAL FROM NYCCAB.FARE LIMIT 1")
	print cursor.fetchone()
	print "Query successfull";
except Exception as e:
	print "Error detected: ", e;
	print traceback.format_exc(e);
finally :
	print "Connection closed";
	connection.close()

