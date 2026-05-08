import os

workers = 2

worker_class = "gthread"
threads = 4

worker_connections = 1000

timeout = 120
graceful_timeout = 30

max_requests = 1000
max_requests_jitter = 50

accesslog = "-"
errorlog = "-"
loglevel = "info"

bind = f"0.0.0.0:{os.environ.get('PORT', 10000)}"