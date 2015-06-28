from flask import Flask, request, session, g, redirect, url_for, abort, render_template, flash, Response, jsonify
from credentials_hana import db_HOST, db_PORT, db_USER, db_PASSWORD, flask_user, flask_password
from secret_key import SECRET
import pyhdb
import json
import datetime

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

@app.route('/showMarker')
def showMarker():
	cur = g.db.cursor()
	cur.execute("SELECT TRIP_DOUBLE.PICKUP_LAT as lati, TRIP_DOUBLE.PICKUP_LONG as long  FROM NYCCAB.TRIP_DOUBLE WHERE (TRIP_DOUBLE.PICKUP_lat <> 0 AND TRIP_DOUBLE.PICKUP_LONG <> 0) LIMIT 10")
	entries = json.dumps([dict(lat=row[0], long=row[1]) for row in cur.fetchall()])
	return Response(entries)

@app.route('/heatmap', methods=['GET', 'POST'])
def heatmap():
	if request.method == 'POST':
		years = request.form.getlist('years[]');
		months = request.form.getlist('months[]');
		weeks = request.form.getlist('weeks[]');
		# latitude/longitude von ursprung/extend


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


@app.route('/')
def show_entries():
	entries = 1
	return render_template('show_entries.html', entries=entries)

@app.route('/login', methods=['GET', 'POST'])
def login():
	error = None
	if request.method == 'POST':
		if request.form['username'] != app.config['USERNAME']:
			error = 'Invalid username'
		elif request.form['password'] != app.config['PASSWORD']:
			error = 'Invalid password'
		else:
			session['logged_in'] = True
			flash('You were logged in')
			return redirect(url_for('show_entries'))
	return render_template('login.html', error=error)

@app.route('/logout')
def logout():
	session.pop('logged_in', None)
	flash('You were logged out')
	return redirect(url_for('show_entries'))

@app.route('/chooseChart')
def chooseChart():
	return render_template('chooseChart.html')

@app.route('/barChart/<chartName>')
def barChart(chartName):
	if (chartName == None):
		chartName = 'SumTotalPerMonth' # Define default example chart
	return render_template('barChart.html', chartName = chartName)

@app.route('/pieChart/<chartName>')
def pieChart(chartName):
	if (chartName == None):
		chartName = 'SumTotalPerMonth' # Define default example chart
	return render_template('pieChart.html', chartName = chartName)

@app.route('/frontend')
def frontend():
	return render_template('frontend.html')

# Called by AJAX
@app.route('/loadChart/<chartName>')
def loadBarChart(chartName):
	cur = g.db.cursor()
	query = open('./queries/' + chartName + '.sql').read()
	cur.execute(query)
	leftKey = cur.description[0][0].lower()
	rightKey = cur.description[1][0].lower()
	result = cur.fetchall()

	# FIXME: Dirty hotfix (keys are switched by list comprehension)
	if chartName == "CountUsesPerPaymentType":
		temp = leftKey
		leftKey = rightKey
		rightKey = temp

	# FIXME: Dirty hotfix
	if (chartName == "CountDriversPerVendor"):
		print "Query doesn't work with pyhdb connector on windows for any reason -> datas are manually collected (HOTFIX)"
		chartContent = json.dumps([{"unternehmen": "CMT", "fahreranzahl": 347979848}, {"unternehmen": "VTS", "fahreranzahl": 345592304}, {"unternehmen": "DDS", "fahreranzahl": 4050283}])
	elif chartName == "SumTotalPerVendorInApril2010":
		print "Query doesn't work with pyhdb connector on windows for any reason -> datas are manually collected (HOTFIX)"
		chartContent = json.dumps([{"unternehmen": "CMT", "umsatz": 6477535}, {"unternehmen": "DDS", "umsatz": 846870}, {"unternehmen": "VTS", "umsatz": 7268059}])
	else:
		chartContent = json.dumps([{leftKey:row[0], rightKey:row[1]} for row in result if row[0] != ''])

	# Determine if the current bug occurred in this query
	countEmptyRows = 0
	for row in result:
		if row[0] == '':
			countEmptyRows = countEmptyRows + 1
	if countEmptyRows > 0:
		print 'WARNING: '+str(countEmptyRows)+' empty row'+('s' if countEmptyRows > 1 else '')+' discovered for query "'+chartName+'" !!!'
	return chartContent


@app.route('/heatMapCal')
def loadHeatMapCal():
	return render_template('calMap.html')

@app.route('/convertDateFormat')
def convertHeatMapData():
	monday = 946854000
	sec_per_day = 86400
	sec_per_minute = 60
	sec_per_hour = 3600
	cur = g.db.cursor()
	cur.execute("SELECT HOUR(FARE.PICKUP_TIME), MINUTE(FARE.PICKUP_TIME), weekday(FARE.PICKUP_TIME) FROM NYCCAB.FARE LIMIT 700000")
	timestamps = [[row[0], row[1], row[2]] for row in cur.fetchall()]

	result = dict()
	for timestamp in timestamps:
		key = timestamp[2] * sec_per_day + monday + sec_per_hour * timestamp[0] + sec_per_minute * timestamp[1]
		if key in result:
			result[key] += 1
		else:
			result[key] = 1
	return Response(json.dumps(result))

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

def queryYears(months, years):
	query = open('./queries/frontend/barcharts/getYearsCount.sql').read()

	print('Executing years query...')
	query = query.replace('?', '('+(','.join(years))+')')

	#FIXME: Not working in Windows -> Use Dummy Data

	#cur = g.db.cursor()
	#cur.execute(query)
	#monthsCount = [{'year': row[0], 'count': row[1]} for row in cur.fetchall()]
	#print(yearsCount)

	monthsCount = [0 for i in range(0,12)]

	# TODO: Load results from extern JSON file
	# Hardcoded results from Hana
	yearsCount = [169001153, 176897199, 178544324, 173179759]

	data = queryMonths(months, years)
	return {'years': yearsCount, 'months': data['months'], 'weeks': data['weeks']}

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

def queryMonths(months, years):
	query = open('./queries/frontend/barcharts/getMonthsCount.sql').read()

	print('Executing months query...')
	query = query.replace('?', '('+(','.join(years))+')')

	#FIXME: Not working in Windows -> Use Dummy Data

	#cur = g.db.cursor()
	#cur.execute(query)
	#monthsCount = [{'month': row[0], 'count': row[1]} for row in cur.fetchall()]
	#print(monthsCount)

	monthsCount = [0 for i in range(0,12)]

	# TODO: Load results from extern JSON file
	# Hardcoded results from Hana
	if ('2010' in years):
		monthsCount[0] += 12528177
		monthsCount[1] += 15540209
		monthsCount[2] += 14199607
		monthsCount[3] += 13912310
		monthsCount[4] += 13819313
		monthsCount[5] += 11145409
		monthsCount[6] += 12884362
		monthsCount[7] += 14863778
		monthsCount[8] += 15481351
		monthsCount[9] += 15144990
		monthsCount[10] += 14825128
		monthsCount[11] += 14656519
	if ('2011' in years):
		monthsCount[0] += 14202800
		monthsCount[1] += 13464996
		monthsCount[2] += 16066350
		monthsCount[3] += 14718973
		monthsCount[4] += 15554868
		monthsCount[5] += 15097861
		monthsCount[6] += 14742561
		monthsCount[7] += 13262441
		monthsCount[8] += 14626748
		monthsCount[9] += 15707756
		monthsCount[10] += 14525862
		monthsCount[11] += 14925983
	if ('2012' in years):
		monthsCount[0] += 14969132
		monthsCount[1] += 14983521
		monthsCount[2] += 16146923
		monthsCount[3] += 15477914
		monthsCount[4] += 15567525
		monthsCount[5] += 15096468
		monthsCount[6] += 14379307
		monthsCount[7] += 14381752
		monthsCount[8] += 14546854
		monthsCount[9] += 14522315
		monthsCount[10] += 13776030
		monthsCount[11] += 14696583
	if ('2013' in years):
		monthsCount[0] += 14776615
		monthsCount[1] += 13990176
		monthsCount[2] += 15749228
		monthsCount[3] += 15100468
		monthsCount[4] += 15285049
		monthsCount[5] += 14385456
		monthsCount[6] += 13823840
		monthsCount[7] += 12597109
		monthsCount[8] += 14107693
		monthsCount[9] += 15004556
		monthsCount[10] += 14388451
		monthsCount[11] += 13971118

	weeksCount = queryWeeks(months, years)

	return {'months': monthsCount, 'weeks': weeksCount}

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

def queryWeeks(months, years):
	query = open('./queries/frontend/barcharts/getWeeksCount.sql').read()

	print('Executing weeks query...')
	query = query.replace('?', '('+(','.join(years))+')', 1)
	query = query.replace('?', '('+(','.join(months))+')', 1)

	#FIXME: Not working in Windows -> Use Dummy Data

	#cur = g.db.cursor()
	#cur.execute(query)
	#weeksCount = [{'week': row[0], 'count': row[1]} for row in cur.fetchall()]
	#print(weeksCount)

	weeksCount = [0, 0, 0, 0, 0]

	# Hardcoded results from HANA
	if ('2011' in years and '1' in months):
		weeksCount[0] += 2526123
		weeksCount[1] += 3235706
		weeksCount[2] += 3244598
		weeksCount[3] += 3082576
		weeksCount[4] += 1375993
	if ('2011' in years and '2' in months):
		weeksCount[0] += 3353670
		weeksCount[1] += 3713859
		weeksCount[2] += 3581927
		weeksCount[3] += 3553344
		weeksCount[4] += 0
	if ('2011' in years and '3' in months):
		weeksCount[0] += 3706084
		weeksCount[1] += 3636907
		weeksCount[2] += 3625977
		weeksCount[3] += 3561190
		weeksCount[4] += 1536192

	return weeksCount

@app.route('/getBoundsData', methods=['POST'])
def getBoundsData():
	south_west = request.form.get('SouthWest')
	north_east = request.form.get("NorthEast")
	return Response(json.dumps(south_west), status = 200)

if __name__ == '__main__':
	app.run()
