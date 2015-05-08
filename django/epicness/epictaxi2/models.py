# -*- coding: utf-8 -*-
from django.db import models
from django_hana import column_store

@column_store
class Fare(models.Model):
	id = models.IntegerField(primary_key=True)
	medallion = models.IntegerField()
	driver = models.IntegerField()
	vendor = models.CharField(max_length=5)
	pickup_time = models.DateTimeField()
	payment_type = models.CharField(max_length=3)
	fare = models.DecimalField(max_digits=24, decimal_places=7)
	surcharge = models.DecimalField(max_digits=24, decimal_places=7)
	mta_tax = models.DecimalField(max_digits=24, decimal_places=7)
	tip = models.DecimalField(max_digits=24, decimal_places=7)
	tolls = models.DecimalField(max_digits=24, decimal_places=7)
	total = models.DecimalField(max_digits=24, decimal_places=7)
	class Meta:
		db_table = 'FARE_DOUBLE'
		managed = False
		ordering = None

@column_store
class Trip(models.Model):
	id = models.IntegerField(primary_key=True)
	medallion = models.IntegerField()
	driver = models.IntegerField()
	vendor = models.CharField(max_length=5)
	pickup_time = models.DateTimeField()
	dropoff_time = models.DateTimeField()
	passenger = models.IntegerField()
	triptime = models.DecimalField(max_digits=24, decimal_places=7)
	distance = models.DecimalField(max_digits=24, decimal_places=7)
	pickup_long = models.DecimalField(max_digits=24, decimal_places=7)
	pickup_lat = models.DecimalField(max_digits=24, decimal_places=7)
	dropoff_long = models.DecimalField(max_digits=24, decimal_places=7)
	drophoff_lat = models.DecimalField(max_digits=24, decimal_places=7)
	class Meta:
		db_table = 'TRIP_DOUBLE'
		managed = False
		ordering = None


