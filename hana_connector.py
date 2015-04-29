import pyhdb
from credentials_hana import HOST, PORT, USER, PASSWORD

connection = pyhdb.connect(
	host=HOST, 
	port=PORT, 
	user=USER, 
	password=PASSWORD)

cursor = connection.cursor()
cursor.execute("SELECT Name FROM FARE")
print(cursor.fetchall())
connection.close()