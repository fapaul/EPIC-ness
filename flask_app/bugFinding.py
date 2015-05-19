import pyhdb
from credentials_hana import db_HOST, db_PORT, db_USER, db_PASSWORD

db = pyhdb.connect(
		host = "192.168.30.206",
		port = 30015,
		user = "SYSTEM",
		password = "manager")

# Test:
cur = db.cursor()
query = 'SELECT FARE.VENDOR AS Unternehmen, COUNT(FARE.DRIVER) AS Fahreranzahl FROM NYCCAB.FARE_DOUBLE AS FARE WHERE FARE.DRIVER > 10 GROUP BY FARE.VENDOR ORDER BY Fahreranzahl DESC'
cur.execute(query)
print cur.fetchall() # Same bug when using fetchone() three times

# Prints on Windows: [(u'CMT', 347979848), (u'', None), (u'', None)]
# ( In hdbstudio: CMT|347.979.848 ; VTS|345.592.304 ; DDS|4.050.283 )
# -> Bug in Pyhdb? (but works on Linux/Mac)