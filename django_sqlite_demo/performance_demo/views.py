import time
import random
import string
from django.http import JsonResponse
from django.shortcuts import render
from .models import Item

def generate_random_string(length):
    return ''.join(random.choices(string.ascii_letters + string.digits, k=length))

def perform_operations(duration=0.1):
    start_time = time.time()
    read_count = 0
    write_count = 0

    while time.time() - start_time < duration:
        # Write operation
        Item.objects.create(value=generate_random_string(10))
        write_count += 1

        # Read operation
        Item.objects.order_by('?').first()
        read_count += 1

    elapsed_time = time.time() - start_time
    return read_count, write_count, elapsed_time

def index(request):
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        # This is an AJAX request for metrics
        read_count, write_count, elapsed_time = perform_operations()
        reads_per_second = round(read_count / elapsed_time)
        writes_per_second = round(write_count / elapsed_time)
        return JsonResponse({'reads': reads_per_second, 'writes': writes_per_second})
    else:
        # This is a regular request, serve the HTML
        return render(request, 'performance_demo/index.html')