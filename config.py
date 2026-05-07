import multiprocessing
import os

workers=2*multiprocessing.cpu_count()+1
worker_class='sync'
worker_connections=1000

timeout=30
graceful_timeout=30

max_requests = 1000
max_requests_jitter = 50

accesslog='-'
errorlog='-'
loglevel='info'

bind = f"0.0.0.0:{os.environ.get('PORT', 10000)}"