#######################################################################################################
# Author        :   K.G.Lahiru GImhana Dayananda  | 19/03/2024
# Copyright     :   Zaion.AI 2024
# Class/module  :   Agent assist monitoring REST API
# Objective     :   Create the FastAPI server API endpoints
#######################################################################################################
# Author                        Date        Action      Description
#------------------------------------------------------------------------------------------------------
# K.G.Lahiru GImhana Dayananda  19/03/2024  Created     Created the initial version
#

# #######################################################################################################


from logging.handlers import TimedRotatingFileHandler
import os
import sys
import logging
from datetime import datetime
from pathlib import Path
import threading
import uvicorn
from dotenv import dotenv_values
from starlette.middleware import Middleware

### import fastapi related packages
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware



## extract the running folder
base_dir = str(Path(__file__).resolve().parent.parent.resolve())  # extract the base path 

sys.path.insert(0, f"{base_dir}/src")
sys.path.insert(0, f"{base_dir}/src/routers/")  # add the current path to sys path
sys.path.insert(0, f"{base_dir}/src/routers/base/")  # add the current path to sys path
sys.path.insert(0, f"{base_dir}/src/controller/base/")  # add the current path to sys path
sys.path.insert(0, f"{base_dir}/src/model/")  # add the current path to sys path
sys.path.insert(0, f"{base_dir}/src/controller/")  # add the current path to sys path
sys.path.insert(0, f"{base_dir}/src/templates/")  # add the current path to sys paths
sys.path.insert(0, f"{base_dir}/src/utilities/")  # add the current path to sys paths
sys.path.insert(0, f"{base_dir}/src/controller/cacheController/")  # add the current path to sys paths

from src.model.app_manager import AppManager
from src.model.db_manager import DBManager
from src.routers.login import LoginRoute
from src.routers.app import AppRoute
from src.routers.company import CompanyRoute
from src.routers.user import UserRoute
from src.routers.application import ApplicationRoute 
from src.controller.cacheController.appCacheController import AppCacheController, PortCacheController
from src.utilities.settings import initialize_config, get_all_config
from src.utilities.logger import start_logger

database_mgr = None
configuration = None 
dbconn = False

"""
Create FastAPI application with specified configuration.
"""
def CreateApp():
    global configuration
    ### create the fastapi application
    return FastAPI(
        title=configuration["APP_NAME"],
        description=configuration["DESC"],
        version=configuration["VERSION"],
        terms_of_service="https://zaion.ai/",
        contact={
            "name": "contact@zaion.ai",
            "url": "https://zaion.ai/contact/",
            "email": "contact@zaion.ai",
        },
        debug=False
    )

"""
    Load settings from configuration files and set up logging.
"""  

def Load_Settings():
    global configuration
    global base_dir

    initialize_config(base_dir)
    configuration = get_all_config()

     # Start the logger with loaded settings
    start_logger(base_dir, configuration["LOG_LEVEL"].upper())

"""
    Set up CORS middleware based on configuration.
"""
def Set_CORS():
    global configuration
    ### set the allowed CORS
    _cors_Origins = []
    try:
        _corsEntries = configuration["CORS_ORIGINS"].split(',')
        for entry in _corsEntries:
            _cors_Origins.append(entry)

        del _corsEntries

        if len(_cors_Origins) == 0:
            return

        ### add the CORS middleware with allowed CORS URLs
        app.add_middleware(
            CORSMiddleware,
            allow_origins=_cors_Origins,
            allow_credentials=True,
            allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            allow_headers=["*"],
        )
    except:
        pass
    finally:
        del _cors_Origins

Load_Settings()

app = CreateApp()

app.state.configuration = configuration
app.state.base_dir = base_dir

user_route = UserRoute(base_dir)
app.include_router(router=user_route.router, prefix="/user", tags=["auth"])

application_route = ApplicationRoute(base_dir, app.state.configuration)
app.include_router(router=application_route.router, prefix="/application", tags=["auth"])

company_route = CompanyRoute(base_dir)
app.include_router(router=company_route.router, prefix="/company", tags=["auth"])

app_route = AppRoute(base_dir)
app.include_router(router=app_route.router, prefix="/app", tags=["auth"])

login_route = LoginRoute(base_dir)
app.include_router(router=login_route.router, prefix="/auth")


Set_CORS()

@app.on_event("startup")
def startup() -> None:
    global database_mgr
    global configuration
    global base_dir
    global dbconn

    logging.warning(f"[{__name__}]: [{startup.__name__}]: {datetime.now()}: [WARNING] - {configuration['APP_NAME']} is starting up")
    database_mgr = DBManager(base_dir)  ## pass base path as a parameter
    app_mgr = AppManager(base_dir)
    app_cache = AppCacheController()
    port_cache = PortCacheController()

    con, err = database_mgr.connect(configuration["DATABASE_NAME"])
    if err:
        logging.error(f"[{__name__}]: [{startup.__name__}]: {datetime.now()}: [ERROR] - DB Connection failed. Failed to start the {configuration['APP_NAME']}")
        return
    elif not con:
        logging.error(f"[{__name__}]: [{startup.__name__}]: {datetime.now()}: [ERROR] - DB Connection failed. Failed to start the {configuration['APP_NAME']}")
        dbconn = True
        return
    else:
        logging.info(f"[{__name__}]: [{startup.__name__}]: {datetime.now()}: [WARNING] - {configuration['APP_NAME']} started successfully.")
        logging.info(f"[{__name__}]: [{startup.__name__}]: {datetime.now()}: [WARNING] - Serving on {configuration['HOST']}:{configuration['PORT']}")
        _app_data, _err = app_mgr.getAllApps()
        if _err:
            logging.error(f"[{__name__}]: [{startup.__name__}]: {datetime.now()}: [ERROR] - Failed to fetch app data.")
        elif _app_data:
            app_cache.create_app_cache(_app_data) 
            logging.info(f"[{__name__}]: [{startup.__name__}]: {datetime.now()}: [WARNING] - app Table data successfully loaded to cache")
            
        _app_ports, _err = app_mgr.getAppPorts()
        if _err:
            logging.error(f"[{__name__}]: [{startup.__name__}]: {datetime.now()}: [ERROR] - Failed to fetch app ports.")
        elif _app_ports:
            port_cache.create_port_cache(_app_ports) 
            logging.info(f"[{__name__}]: [{startup.__name__}]: {datetime.now()}: [WARNING] - app ports data successfully loaded to cache")

"""Shutdown handler of the fastapi application. Clears all the resources before terminating
Returns:
    None: returns None
"""
@app.on_event("shutdown")
async def shutdown() -> None:
    
    global database_mgr
    global configuration
    global base_dir
    
    try:
        logging.info(f"[{__name__}]: [{shutdown.__name__}]: {datetime.now()}: [WARNING] - {configuration['APP_NAME']} is shutting down")
        ### close and clear resources that we allocate to mongoDB
        if database_mgr.db_connected:
            database_mgr.close_connection()
    except:
        pass
    finally:
        logging.info(f"[{__name__}]: [{shutdown.__name__}]: {datetime.now()}: [WARNING] - {configuration['APP_NAME']} is Shutting down ...... completed")
        ### clear the declared resources
        del configuration
        del base_dir

### main entry point for the API
if __name__ == "__main__":
    
    if configuration["SSL_ENABLED"] == "true":
        uvicorn.run(
            "main:app",
            host=configuration["HOST"],
            port=int(configuration["PORT"]),
            log_level=configuration["LOG_LEVEL"],
            reload=False,
            workers=int(configuration["NO_OF_WORKERS"]),
            ws_max_size=int(configuration["CHUNCK_SIZE"]),
            reload_excludes="'.txt,*.ini,.py,.env,~*'",
            ssl_keyfile=f"{base_dir}{configuration['SSL_KEY_FILE']}",
            ssl_certfile=f"{base_dir}{configuration['SSL_CERT_FILE']}",
            ssl_ca_certs=f"{base_dir}{configuration['SSL_CA_CERT_FILE']}"
        )
    else:
         uvicorn.run(
            "main:app",
            host=configuration["HOST"],
            port=int(configuration["PORT"]),
            log_level=configuration["LOG_LEVEL"],
            reload=False,
            workers=int(configuration["NO_OF_WORKERS"]),
            ws_max_size=int(configuration["CHUNCK_SIZE"]),
            reload_excludes="'.txt,*.ini,.py,.env,~*'"
        )
         

