from flask import Flask, request, session, g, redirect, url_for, abort, render_template, flash, Response, jsonify
from credentials_hana import db_HOST, db_PORT, db_USER, db_PASSWORD, flask_user, flask_password
from secret_key import SECRET
import pyhdb
import json

#configuration
DEBUG = True
SECRET_KEY = SECRET
USERNAME = flask_user
PASSWORD = flask_password

app = Flask(__name__)
app.config.from_object(__name__)

def connect_db(): 
	return pyhdb.connect(
		host = db_HOST,
		port = db_PORT,
		user = db_USER,
		password = db_PASSWORD)

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
	
	# TODO:
	# 1.) Ajay's query aufrufen
	# 2.) Long und Lat fenster mitgeben
	# 3.) Daten für Balkendiagramm und Calmap mitgeben
	
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

if __name__ == '__main__':
	app.run()

