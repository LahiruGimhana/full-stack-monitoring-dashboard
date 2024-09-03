#######################################################################################################
# Author        :   K.G.Lahiru GImhana Dayananda  | 19/03/2024
# Copyright     :   Zaion.AI 2024
# Class/module  :   Agent assist monitoring REST API
# Objective     :   Create the FastAPI server API endpoints
#######################################################################################################
# Author                        Date        Action      desc
#------------------------------------------------------------------------------------------------------
# K.G.Lahiru GImhana Dayananda  19/03/2024  Created     Created the initial version
#
# #######################################################################################################

# import datetime
# import logging
# import os
# from dotenv import dotenv_values

# Global variable to store configuration
# configuration = None

# def initialize_config(base_dir):
#     global configuration
#     if configuration is None:
#         # Load the .env file
#         configuration = dotenv_values(os.path.join(base_dir, "config/.env"))
        
# # Function to get configuration values
# def get_config(key, default=None):
#     if configuration is None:
#         logging.error(f"[: get_config: {datetime.now()}]: [ERROR] - Configuration has not been initialized")
#         pass
#     value= configuration.get(key, default)
#     if isinstance(value, str) and value.isdigit():
#         return int(value)
#     return value

# def get_all_config():
#     return configuration


import os
import configparser
import logging
from dotenv import load_dotenv
from datetime import datetime

# Global configuration dictionary
configuration = {}

def initialize_config(base_dir):
    global configuration
    
    # Load environment variables from .env file if it exists
    env_file_path = os.path.join(base_dir, "config/.env")
    if os.path.exists(env_file_path):
        load_dotenv(env_file_path)  # Load .env file into environment variables
    
    # Initialize configuration dictionary from environment variables
    for key, value in os.environ.items():
        configuration[key] = value
    
    # Load configuration from .conf file
    conf_file_path = os.path.join(base_dir, "config/config.conf")
    if os.path.exists(conf_file_path):
        config_parser = configparser.ConfigParser()
        config_parser.read(conf_file_path)
        
        # Read database, logging, and app sections
        for section in config_parser.sections():
            for key, value in config_parser.items(section):
                if key.upper() not in configuration:
                    configuration[key.upper()] = value

def get_config(key, default=None):
    if configuration is None:
        logging.error(f"[: get_config: {datetime.now()}]: [ERROR] - Configuration has not been initialized")
        return default
    
    # Return the value from the configuration dictionary
    return configuration.get(key.upper(), default)

def get_all_config():
    return configuration