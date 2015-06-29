SELECT
    week, AVG(TOTAL) as Average_Total
FROM
    (
        SELECT
            ROUND(DAYOFMONTH(PICKUP_TIME) / 7, 0, ROUND_UP) as week
        FROM
            NYCCAB.FARE
		WHERE
			MONTH(PICKUP_TIME) in ? and YEAR(PICKUP_TIME) in ?
    )
WHERE
    week in ?
GROUP BY
    week