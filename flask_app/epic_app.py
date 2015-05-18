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
	cur.execute("SELECT TRIP_DOUBLE.PICKUP_LONG as longi, TRIP_DOUBLE.PICKUP_LAT as lat  FROM NYCCAB.TRIP_DOUBLE WHERE (TRIP_DOUBLE.PICKUP_LONG <> 0 AND TRIP_DOUBLE.PICKUP_LAT <> 0) LIMIT 10")
	entries = json.dumps([dict(long=row[0], lat=row[1]) for row in cur.fetchall()])
	return Response(entries)

 
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

# Called by AJAX
@app.route('/loadBarChart/<chartName>')
def loadBarChart(chartName):
	cur = g.db.cursor()
	query = open('./queries/' + chartName + '.sql').read()
	cur.execute(query)
	leftKey = cur.description[0][0].lower()
	rightKey = cur.description[1][0].lower()
	result = cur.fetchall()
	print result
	chartContent = json.dumps([{leftKey:row[0], rightKey:row[1]} for row in result])
	return chartContent


if __name__ == '__main__':
	app.run()

