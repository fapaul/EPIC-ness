import pyhdb

connection = pyhdb.connect(
	host="192.168.30.206", 
	port=30015, 
	user="SYSTEM", 
	password="manager")

connection.close()