#!/usr/bin/env python

from setuptools import setup

setup(
    name='django_hana',
    version='1.1',
    description='SAP HANA backend for Django 1.7',
    author='Max Bothe, Kapil Ratnani',
    author_email='mathebox@gmail.com, kapil.ratnani@iiitb.net',
    url='https://github.com/mathebox/django_hana',
    packages=['django_hana'],
    install_requires = [
        'pyhdb==0.2.2'
    ],
)
