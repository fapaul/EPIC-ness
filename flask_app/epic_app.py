from flask import Flask, request, session, g, redirect, url_for, abort, render_template, flash, Response, jsonify
from credentials_hana import db_HOST, db_PORT, db_USER, db_PASSWORD, flask_user, flask_password
from secret_key import SECRET
import pyhdb
import json
import datetime
from barchartsCalculator import queryYears, queryMonths, queryWeeks

#TODO: Store dummy data in json files (heatmap, barcharts, calmap)

#configuration
DEBUG = True
SECRET_KEY = SECRET
USERNAME = flask_user
PASSWORD = flask_password

app = Flask(__name__)
app.config.from_object(__name__)

def connect_db():
	try:
		connection = pyhdb.connect(
			host = db_HOST,
			port = db_PORT,
			user = db_USER,
			password = db_PASSWORD)
		return connection
	except:
		raise Exception('HANA connection failed. Did you turn on VPN?')

@app.before_request
def before_request():
	g.db = connect_db()

@app.teardown_request
def teardown_request(exception):
	db = getattr(g, 'db', None)
	if db is not None:
		db.close()

# --------- Frontend application -------------------------- #

@app.route('/')
@app.route('/frontend')
def frontend():
	return render_template('frontend.html')

# Contains counts for years, months and weeks
@app.route('/getYearsCount', methods=['GET', 'POST'])
def responseYears():
	if request.method == 'GET':
		months = request.args.getlist('months[]')
		years = request.args.getlist('years[]')
	else: # POST method
		months = request.form.getlist('months[]')
		years = request.form.getlist('years[]')

	# Exported because queryMonths is also used by queryYears
	return Response(json.dumps(queryYears(months, years)))

# Contains counts for months and weeks
@app.route('/getMonthsCount', methods=['GET', 'POST'])
def responseMonths():
	if request.method == 'GET':
		months = request.args.getlist('months[]')
		years = request.args.getlist('years[]')
	else: # POST method
		months = request.form.getlist('months[]')
		years = request.form.getlist('years[]')

	# Exported because queryMonths is also used by queryYears
	return Response(json.dumps(queryMonths(months, years)))

# Contains count for weeks
@app.route('/getWeeksCount', methods=['GET', 'POST'])
def responseWeeks():
	if request.method == 'GET':
		months = request.args.getlist('months[]')
		years = request.args.getlist('years[]')
	else: # POST method
		months = request.form.getlist('months[]')
		years = request.form.getlist('years[]')

	# Exported because queryWeeks is also used by queryMonths
	return Response(json.dumps(queryWeeks(months, years)))

@app.route('/getCalMapData', methods=['GET', 'POST'])
def getCalmapData():
	requestObj = request.args if (request.method == 'GET') else request.form
	years = requestObj.getlist('years[]');
	months = requestObj.getlist('months[]');
	weeks = requestObj.getlist('weeks[]');
	dayHours = requestObj.getlist('dayHours[]');
	south_west = {'lat': requestObj.get('SouthWest[lat]'),
				'long': requestObj.get('SouthWest[long]')}
	north_east = {'lat': requestObj.get('NorthEast[lat]'),
 				'long': requestObj.get('NorthEast[long]')}

	resultAsJson = open('./queries/frontend/calmap/dummyData.json').read()
	return Response(resultAsJson)

	#TODO: write query for calmap with sw and ne
	"""
	monday = 946854000
	sec_per_day = 86400
	sec_per_minute = 60
	sec_per_hour = 3600
	cur = g.db.cursor()

	query = open('./queries/frontend/calmap/getCalMapData.sql').read()
	cur.execute(query)

	timestamps = [[row[0], row[1], row[2]] for row in cur.fetchall()]
	result = dict()
	for timestamp in timestamps:
		key = timestamp[2] * sec_per_day + monday + sec_per_hour * timestamp[0] + sec_per_minute * timestamp[1]
		if key in result:
			result[key] += 1
		else:
			result[key] = 1
	return Response(json.dumps(result))
	"""

@app.route('/getHeatmapData', methods=['GET', 'POST'])
def getHeatmapData():
	requestObj = request.args if (request.method == 'GET') else request.form
	years = requestObj.getlist('years[]');
	months = requestObj.getlist('months[]');
	weeks = requestObj.getlist('weeks[]');
	dayHours = requestObj.getlist('dayHours[]');
	south_west = {'lat': requestObj.get('SouthWest[lat]'),
				'long': requestObj.get('SouthWest[long]')}
	north_east = {'lat': requestObj.get('NorthEast[lat]'),
 				'long': requestObj.get('NorthEast[long]')}

	# TODO: Query results including params

	return json.dumps([
		dict(lat=40.645320892333984, long=-73.7768783569336),
		dict(lat=40.72430419921875, long=-73.9999008178711),
		dict(lat=40.762916564941406, long=-73.99524688720703),
		dict(lat=40.747989654541016, long=-73.97357940673828),
		dict(lat=40.68174362182617, long=-73.98006439208984),
		dict(lat=40.774208068847656, long=-73.87296295166016),
		dict(lat=40.75990676879883, long=-73.99391174316406),
		dict(lat=40.76718521118164, long=-73.99007415771484),
		dict(lat=40.645050048828125, long=-73.79256439208984),
		dict(lat=40.751739501953125, long=-73.89812469482422),
		dict(lat=40.78850555419922, long=-73.94905853271484),
	 	dict(lat=40.72579574584961, long=-73.9828872680664),
		dict(lat=40.72705078125, long=-73.99354553222656),
	 	dict(lat=40.74961853027344, long=-73.99532318115234)])

if __name__ == '__main__':
	app.run()
