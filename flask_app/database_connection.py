from credentials_hana import db_HOST, db_PORT, db_USER, db_PASSWORD
import pyhdb

class DatabaseConnection:
	def __init__(self, queryName):
		self.path = queryName
		self._connector = None

	def __str__(self):
		return str(self.path)

	def __eq__(self, name):
		if type(name) == str:
			return self.__str__ == name
		else:
			print str(type(name))
			return self.__dict__ == name.__dict__

	@property
	def connector(self):
		if self._connector == None:
			connector = pyhdb.connect(
				host = db_HOST,
				port = db_PORT,
				user = db_USER,
				password = db_PASSWORD)
			self._connector = connector
		return self._connector
