"""
gunicorn.conf.py — Config de producción.
Uso: gunicorn -c gunicorn.conf.py app:app
"""
import multiprocessing

workers      = multiprocessing.cpu_count() * 2 + 1
worker_class = 'sync'
threads      = 2
timeout      = 60
bind         = '0.0.0.0:5000'
loglevel     = 'info'
accesslog    = '-'
errorlog     = '-'
