import json

def queryYears(db, isDummy, months, years):
	print('Executing years query...')
	if (not isDummy):
		#FIXME: Not working in Windows -> Use Dummy Data
		query = open('./queries/frontend/barcharts/getYearsCount.sql').read()
		query = query.replace('?', '('+(','.join(years))+')')

		cur = db.cursor()
		cur.execute(query)
		yearsCount = [row[1] for row in cur.fetchall()]

		data = queryMonths(db, isDummy, months, years)
		return {'years': yearsCount, 'months': data['months'], 'weeks': data['weeks']}
	else:
		# Hardcoded results from Hana
		yearsCount = [169001153, 176897199, 178544324, 173179759]

		data = queryMonths(db, isDummy, months, years)
		return {'years': yearsCount, 'months': data['months'], 'weeks': data['weeks']}

def queryMonths(db, isDummy, months, years):
	print('Executing months query...')
	if (not isDummy):
		#FIXME: Not working in Windows -> Use Dummy Data
		query = open('./queries/frontend/barcharts/getMonthsCount.sql').read()
		query = query.replace('?', '('+(','.join(years))+')')

		cur = db.cursor()
		cur.execute(query)
		monthsCount = [row[1] for row in cur.fetchall()]

		weeksCount = queryWeeks(db, isDummy, months, years)
		return {'months': monthsCount, 'weeks': weeksCount}
	else:
		# Hardcoded results from Hana
		monthsCount = [0 for i in range(0,12)]
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

		weeksCount = queryWeeks(db, isDummy, months, years)
		return {'months': monthsCount, 'weeks': weeksCount}

def queryWeeks(db, isDummy, months, years):
	print('Executing weeks query...')
	if (not isDummy):
		#FIXME: Not working in Windows -> Use Dummy Data
		query = open('./queries/frontend/barcharts/getWeeksCount.sql').read()
		query = query.replace('?', '('+(','.join(years))+')', 1)
		query = query.replace('?', '('+(','.join(months))+')', 1)

		cur = db.cursor()
		cur.execute(query)
		weeksCount = [row[1] for row in cur.fetchall()]

		return weeksCount
	else:
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
