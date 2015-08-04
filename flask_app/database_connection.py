from credentials_hana import db_HOST, db_PORT, db_USER, db_PASSWORD, flask_user, flask_password
import pyhdb

class DatabaseConnection:
	def __init__(self, queryName):
		self.queryName = queryName

	@property
	def connector(self):
		connector = pyhdb.connect(
			host = db_HOST,
			port = db_PORT,
			user = db_USER,
			password = db_PASSWORD)	   
		return connector
	