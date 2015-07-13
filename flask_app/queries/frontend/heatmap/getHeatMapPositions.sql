SELECT PICKUP_LAT, PICKUP_LONG
FROM NYCCAB.TRIP
WHERE
	YEAR(PICKUP_TIME) in ? AND
	MONTH(PICKUP_TIME) in ? AND
	ROUND(DAYOFMONTH(PICKUP_TIME) / 7, 0, ROUND_UP) in ? AND
	PICKUP_LAT < ? AND PICKUP_LAT > ? AND
	PICKUP_LONG < ? AND PICKUP_LONG > ?
	?