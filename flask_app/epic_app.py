from flask import Flask, request, session, g, redirect, url_for, abort, render_template, flash, Response, jsonify
from credentials_hana import db_HOST, db_PORT, db_USER, db_PASSWORD
from secret_key import SECRET
import pyhdb
import json
import datetime
import time
from barchartsCalculator import queryYears, queryMonths, queryWeeks, createYearsCheck #TODO: ,queryCalmap, queryHeatmap
from database_connection import DatabaseConnection

#TODO: Store dummy data in json files (heatmap, barcharts, calmap)

#configuration
DEBUG = True
DUMMY = False
SECRET_KEY = SECRET

app = Flask(__name__)
app.config.from_object(__name__)
connection_pool = []

@app.before_request
def before_request():
	# Dont create db connection when pulling a static file
	if request.path[-3:] != '.js' and request.path[-4:] != '.css':
		connection_pool.append(DatabaseConnection(request.path))

@app.teardown_request
def teardown_request(exception):
	"""db = getattr(g, 'db', None)
	if db is not None:
		db.close()"""
	for connection in connection_pool:
		if connection.path == request.path:
			try:
				connection.connector.close()
				connection_pool.remove(connection)
			except:
				continue
			print len(connection_pool)


def connect_db(requestName):
	for connection in connection_pool:
		if connection.path == requestName:
			return connection.connector



# --------- Frontend application -------------------------- #

@app.route('/')
@app.route('/frontend')
def frontend():
	return render_template('frontend.html')

# Contains counts for years, months and weeks
@app.route('/getYearsCount', methods=['GET', 'POST'])
def responseYears():
	return Response(json.dumps(queryYears(connect_db(request.path), DUMMY)))

# Contains counts for months and weeks
@app.route('/getMonthsCount', methods=['GET', 'POST'])
def responseMonths():
	if request.method == 'GET':
		years = request.args.getlist('years[]')
	else: # POST method
		years = request.form.getlist('years[]')
	return Response(json.dumps(queryMonths(connect_db(request.path), DUMMY, years)))

# Contains count for weeks
@app.route('/getWeeksCount', methods=['GET', 'POST'])
def responseWeeks():
	if request.method == 'GET':
		years = request.args.getlist('years[]')
		months = request.args.getlist('months[]')
	else: # POST method
		years = request.form.getlist('years[]')
		months = request.form.getlist('months[]')
	return Response(json.dumps(queryWeeks(connect_db(request.path), DUMMY, years, months)))

@app.route('/getCalmapData', methods=['GET', 'POST'])
def getCalmapData():
	if (not DUMMY):
		requestObj = request.args if (request.method == 'GET') else request.form
		years = requestObj.getlist('years[]');
		months = requestObj.getlist('months[]');
		weeks = requestObj.getlist('weeks[]');
		southWest = {'lat': float(requestObj.get('southWest[lat]')),
					'long': float(requestObj.get('southWest[long]'))}
		northEast = {'lat': float(requestObj.get('northEast[lat]')),
	 				'long': float(requestObj.get('northEast[long]'))}

		i = 0;
		dayHours = [];
		while(requestObj.getlist('dayHours['+str(i)+'][]')):
			dayHours.append(requestObj.getlist('dayHours['+str(i)+'][]'))
			i += 1

		latMax = southWest['lat']
		latMin = northEast['lat']
		if (southWest['lat'] < northEast['lat']):
			latMax = northEast['lat']
			latMin = southWest['lat']
		longMax = southWest['long']
		longMin = northEast['long']
		if (southWest['long'] < northEast['long']):
			longMax = northEast['long']
			longMin = southWest['long']
		# Query results including params
		query = open('./queries/frontend/calmap/getCalmapData.sql').read()

		# TODO: Check if months or weeks is null
		yearsCheck = createYearsCheck(years)
		query = query.replace('?', yearsCheck, 1).replace(
			'?', '('+(','.join(months))+')', 1).replace(
			'?', '('+(','.join(weeks))+')', 1).replace(
			'?', str(latMax+0.002), 1).replace(
			'?', str(latMin-0.002), 1).replace(
			'?', str(longMax+0.002), 1).replace(
			'?', str(longMin-0.002), 1)
		#print(query)

		cur = connect_db(request.path).cursor()
		print('Executing calmap query...')
		cur.execute(query)
		timestamps = [[row[0], row[1], row[2]] for row in cur.fetchall()]

		monday = 946854000
		sec_per_day = 86400
		sec_per_minute = 60
		sec_per_hour = 3600

		result = dict()
		for timestamp in timestamps:
			key = timestamp[1] * sec_per_day + monday + sec_per_hour * timestamp[0] + sec_per_minute * 30
			result[key] = timestamp[2]

		return Response(json.dumps(result))
	else:
		print('Executing calmap query... (DUMMY)')
		time.sleep(3)
		resultAsJson = open('./queries/frontend/calmap/dummyData.json').read()
		return Response(resultAsJson)

@app.route('/getHeatmapData', methods=['GET', 'POST'])
def getHeatmapData():
	if (not DUMMY):
		requestObj = request.args if (request.method == 'GET') else request.form
		years = requestObj.getlist('years[]');
		months = requestObj.getlist('months[]');
		weeks = requestObj.getlist('weeks[]');
		southWest = {'lat': float(requestObj.get('southWest[lat]')),
					'long': float(requestObj.get('southWest[long]'))}
		northEast = {'lat': float(requestObj.get('northEast[lat]')),
	 				'long': float(requestObj.get('northEast[long]'))}
		zoomLevel = int(requestObj.get('zoomLevel'))
		precision = 0
		if (zoomLevel <= 12):
			precision = 3
		else:
			precision = 4


		i = 0;
		dayHours = [];
		while(requestObj.getlist('dayHours['+str(i)+'][]')):
			dayHours.append(requestObj.getlist('dayHours['+str(i)+'][]'))
			i += 1

		latMax = southWest['lat']
		latMin = northEast['lat']
		if (southWest['lat'] < northEast['lat']):
			latMax = northEast['lat']
			latMin = southWest['lat']
		longMax = southWest['long']
		longMin = northEast['long']
		if (southWest['long'] < northEast['long']):
			longMax = northEast['long']
			longMin = southWest['long']
		if len(dayHours) >= 2:
			hourMax = dayHours[1][1]
			hourMin = dayHours[0][1]
			dayMax = dayHours[1][0]
			dayMin = dayHours[0][0]
		else:
			hourMax = '23'
			hourMin = '0'
			dayMax = '7'
			dayMin = '1'
		if (dayMax < dayMin):
			print('Calmap: dayhours BUG')
			print(dayHours)
			print(dayMax)
			print(dayMin)

		# Query results including params
		query = open('./queries/frontend/heatmap/getHeatMapPositions.sql').read()

		# TODO: Check if months or weeks is null
		yearsCheck = createYearsCheck(years)
		query = query.replace('?', yearsCheck, 1).replace(
			'?', '('+(','.join(months))+')', 1).replace(
			'?', '('+(','.join(weeks))+')', 1).replace(
			'?', str(latMax+0.002), 1).replace(
			'?', str(latMin-0.002), 1).replace(
			'?', str(longMax+0.002), 1).replace(
			'?', str(longMin-0.002), 1).replace(
			'?', str(hourMax), 1).replace(
			'?', str(hourMin), 1).replace(
			'?', str(dayMax), 1).replace(
			'?', str(dayMin), 1).replace(
			'$', str(precision))
		#print(query)
		cur = connect_db(request.path).cursor()
		print('Executing heatmap query...')
		cur.execute(query)
		locations = [dict(lat=row[0], long=row[1], count=row[2]) for row in cur.fetchall()]

		return Response(json.dumps(locations))
	else:
		print('Executing heatmap query... (DUMMY)')
		time.sleep(3)
		return Response(json.dumps([
			dict(lat=40.645320892333984, long=-73.7768783569336, count=1000),
			dict(lat=40.72430419921875, long=-73.9999008178711, count=50),
			dict(lat=40.762916564941406, long=-73.99524688720703, count=30),
			dict(lat=40.747989654541016, long=-73.97357940673828, count= 500),
			dict(lat=40.68174362182617, long=-73.98006439208984, count=3),
			dict(lat=40.774208068847656, long=-73.87296295166016, count=2),
			dict(lat=40.75990676879883, long=-73.99391174316406, count=10000),
			dict(lat=40.76718521118164, long=-73.99007415771484, count=53),
			dict(lat=40.645050048828125, long=-73.79256439208984, count=100),
			dict(lat=40.751739501953125, long=-73.89812469482422, count=900),
			dict(lat=40.78850555419922, long=-73.94905853271484, count=6000),
		 	dict(lat=40.72579574584961, long=-73.9828872680664, count=10000),
			dict(lat=40.72705078125, long=-73.99354553222656, count=200),
		 	dict(lat=40.74961853027344, long=-73.99532318115234, count=5)]))

if __name__ == '__main__':
	app.run(threaded=True)
