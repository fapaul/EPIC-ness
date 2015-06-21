"""
paramstyle	Meaning
        ---------------------------------------------------------
        1) qmark       Question mark style, e.g. ...WHERE name=?
        2) numeric     Numeric, positional style, e.g. ...WHERE name=:1
        3) named       Named style, e.g. ...WHERE name=:name
        4) format      ANSI C printf format codes, e.g. ...WHERE name=%s
        5) pyformat    Python extended format codes, e.g. ...WHERE name=%(name)s

        Hana's 'prepare statement' feature supports 1) and 2), while 4 and 5
        are handle by Python's own string expansion mechanism.
        Note that case 3 is not yet supported by this method!

        - check cursor.py in pyhdb
"""

" get montly averages "
monthlyStatement = "SELECT months, AVG(TOTAL) as Average_Total 
FROM NYCCAB.FARE 
WHERE MONTH(PICKUP_TIME) in ? and YEAR(PICKUP_TIME) in ?
GROUP BY MONTH(PICKUP_TIME) as months";

" get weekly averages "
weeklyStatement = "SELECT weeks, AVG(TOTAL) as Average_Total 
FROM NYCCAB.FARE 
WHERE WEEK(PICKUP_TIME) in ? and MONTH(PICKUP_TIME) in ? and YEAR(PICKUP_TIME) in ?
GROUP BY WEEK(PICKUP_TIME) as weeks";

" get daily averages "
dailyStatement = "SELECT day, AVG(TOTAL) as Average_Total 
FROM NYCCAB.FARE 
WHERE DAY(PICKUP_TIME) in ? and WEEK(PICKUP_TIME) in ? and MONTH(PICKUP_TIME) in ? and YEAR(PICKUP_TIME) in ?
GROUP BY DAY(PICKUP_TIME) as day";