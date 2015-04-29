import pyhdb

connection = pyhdb.connect(
	host="", 
	port=30015, 
	user="", 
	password="")

connection.close()