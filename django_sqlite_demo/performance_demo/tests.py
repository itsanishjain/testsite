from django.test import TestCase
from django.db import models

# Create your tests here.
class Item(models.Model):
    value = models.CharField(max_length=10)