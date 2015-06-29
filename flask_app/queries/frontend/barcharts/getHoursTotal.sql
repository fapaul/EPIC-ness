SELECT
	hour, AVG(TOTAL) as Average_Total
FROM
    (
        SELECT
            ROUND(DAYOFMONTH(PICKUP_TIME) / 7, 0, ROUND_UP) as week
        FROM
            NYCCAB.FARE
		WHERE
			HOUR(PICKUP_TIME) in ? and DAY(PICKUP_TIME) in ? and MONTH(PICKUP_TIME) in ? and YEAR(PICKUP_TIME) in ?
    )
WHERE
	 week in ?
GROUP BY
	HOUR(PICKUP_TIME) as hour