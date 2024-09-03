import os
import logging
import threading
from logging.handlers import TimedRotatingFileHandler

def init_logger(base_dir, log_level):
    """Initialize logging settings."""
    format = "%(asctime)s: [%(name)s]: [%(levelname)s]: %(message)s"

    logs_dir = os.path.join(base_dir, "logs")
    if not os.path.exists(logs_dir):
        os.makedirs(logs_dir)

    log_file_path = os.path.join(logs_dir, "Log")
    
    # Set up TimedRotatingFileHandler to rotate logs daily
    handler = TimedRotatingFileHandler(log_file_path, when="midnight", interval=1, backupCount=7)
    handler.suffix = "%Y-%m-%d.log"
    handler.setFormatter(logging.Formatter(format, datefmt="%H:%M:%S"))

    # Configure logging with the handler
    logging.basicConfig(handlers=[handler], level=log_level)

def logger_thread(base_dir, log_level):
    """logger setup in a separate thread"""
    init_logger(base_dir, log_level)
    # This thread will keep running to handle logging
    while True:
        pass

def start_logger(base_dir, log_level):
    """Start the logger in separate thread."""
    threading.Thread(target=logger_thread, args=(base_dir, log_level), daemon=True).start()
