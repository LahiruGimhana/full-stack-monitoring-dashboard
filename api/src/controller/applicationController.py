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

import copy
from datetime import datetime
from gc import enable
import io
import json
import logging
import os
import shutil
from sqlite3 import Binary
import stat
from sys import version
import tempfile
import zipfile
from classy_fastapi import Routable
from fastapi import UploadFile
from fastapi.responses import JSONResponse
from src.controller.base.types import ResponseModel, ApplicationModel
# from app_manager import AppManager
from src.model.app_manager import AppManager
from src.controller.cacheController.sessionController import  SessionController
from src.controller.cacheController.appCacheController import AppCacheController, PortCacheController
from src.controller.base.controllerBase import ControllerBase
from src.templates.config_template import appconfig_template, mainconfig_template
from src.utilities.utilities import create_directory, copy_directory, create_build_sh, create_run_sh, deep_copy, execute_sh,  merge_directories, move_directory, remove_file, remove_directory, create_path, save_binary, save_file

class ApplicationController(Routable):
    def __init__(self, base_dir, configuration) -> None:
        super().__init__()
        self.app_mgr = AppManager(base_dir)
        self.session_mgr = SessionController()
        self.app_cache = AppCacheController()
        self.port_cache = PortCacheController()
        self.controller_base = ControllerBase()
        
        self.configuration = configuration
        self.Temp_dest_folder = self.configuration.get("TEMP_DEST_FOLDER")
        self.App_dest_folder = self.configuration.get("APP_DEST_FOLDER")
    """Retrieves all applications.

    Args:
        token (str): The authorization header containing the token.

    Returns:
        JSONResponse: A JSON response containing the list of applications.
    """
    def getApps(self, token: str):
        _user_data = None
        _err = None
        try:
            _user_data, _err = self.session_mgr.get_current_user_data(token)
            if _err:
                logging.error(f"[{self.__class__.__name__}: {self.getApps.__name__}: {datetime.now()}]: [ERROR] - Error retrieving user type: {_err}")
                return self.controller_base.generate_response(None, 500)
            if _user_data is None:
                logging.warning(f"[{self.__class__.__name__}: {self.getApps.__name__}: {datetime.now()}]: [WARNING] - Unauthorized: Invalid access token")
                return self.controller_base.generate_response(None, 401)

            # _app_data, _err = self.app_mgr.getAllApps(_user_data.userType, _user_data.cid)
            # self.app_cache.create_app_cache(_app_data) 
            _app_data = self.app_cache.getAllApps(_user_data.cid, _user_data.userType)

            if _err:
                logging.error(f"[{self.__class__.__name__}: {self.getApps.__name__}: {datetime.now()}]: [ERROR] - Error retrieving applications data: {_err}")
                return self.controller_base.generate_response(None, 500)
            elif not _app_data:
                logging.warning(f"[{self.__class__.__name__}: {self.getApps.__name__}: {datetime.now()}]: [WARNING] - Applications not found")
                return self.controller_base.generate_response(_app_data, 200)
            else:
                logging.info(f"[{self.__class__.__name__}: {self.getApps.__name__}: {datetime.now()}]: [INFO] - Applications data retrieved successfully")
                return self.controller_base.generate_response(_app_data, 200)
    
        except Exception as _e:
            logging.error(f"[{self.__class__.__name__}: {self.getApps.__name__}: {datetime.now()}]: [ERROR] - An unexpected error occurred: {str(_e)}")
            del _e
            return self.controller_base.generate_response(None, 500)
        
        finally:
            del _user_data, _err


        
    """Retrieves a specific application by ID.

    Args:
        aid (int): The application ID.
        token (str): The authorization header containing the token.

    Returns:
        JSONResponse: A JSON response containing the application details.
    """
    def getApp(self, aid: int, token: str):
        try:
            # if any(param is None for param in (aid,)):
            #     logging.warning(f"[{self.__class__.__name__}: {self.getApp.__name__}: {datetime.now()}]: [WARNING] - Bad Request: Missing input parameter")
            #     return self.controller_base.generate_response(None, 400)
            
            _user_data, _err = self.session_mgr.get_current_user_data(token)
            if _err:
                logging.error(f"[{self.__class__.__name__}: {self.getApp.__name__}: {datetime.now()}]: [ERROR] - Error retrieving user type: {_err}")
                return self.controller_base.generate_response(None, 500)
            if _user_data is None:
                logging.warning(f"[{self.__class__.__name__}: {self.getApp.__name__}: {datetime.now()}]: [WARNING] - Unauthorized: Invalid access token")
                return self.controller_base.generate_response(None, 401)

            
            _app_data = self.app_cache.getAppById(aid, _user_data.cid, _user_data.userType)
            if _err:
                logging.error(f"[{self.__class__.__name__}: {self.getApp.__name__}: {datetime.now()}]: [ERROR] - Error retrieving application data: {_err}")
                return self.controller_base.generate_response(None, 500)
            elif not _app_data:
                logging.warning(f"[{self.__class__.__name__}: {self.getApp.__name__}: {datetime.now()}]: [WARNING] - Application not found")
                return self.controller_base.generate_response(None, 404)
            else:
                logging.info(f"[{self.__class__.__name__}: {self.getApp.__name__}: {datetime.now()}]: [INFO] - Application data retrieved successfully")
                return self.controller_base.generate_response(_app_data, 200)
        
        except Exception as _e:
            logging.error(f"[{self.__class__.__name__}: {self.getApp.__name__}: {datetime.now()}]: [ERROR] - An unexpected error occurred: {str(_e)}")
            return self.controller_base.generate_response(None, 500)
        
        finally:
            del _user_data, _err
    
    """Adds a new application.

    Args:
        aid (int): The application ID.
        name (str): The name of the application.
        ip (str): The IP address of the application.
        rest_port (int): The REST port of the application.
        ws_port (int): The WebSocket port of the application.
        zid (str): The configuration ID of the application.
        key (str): The key of the application.
        desc (str): The desc of the application.
        cid (int): The company ID.
        token (str): The authorization header containing the token.

    Returns:
        JSONResponse: A JSON response indicating the result of the operation.
    """
    async def addApp(self, name: str, ip: str, rest_port: int, ws_port: int, prof_port: int, zid: str, key: str, desc: str, enable: int, cid: int, 
                       version: str, token: str, appUnit_name: str, appUnit_ifname: str, appUnit_path: str, appUnit_enable: int, appUnit_pool_size: int, appUnit_uname: str, cname: str, file: Binary):
        try:
            # if any(param is None for param in( name, ip, rest_port, ws_port, zid, key, desc, enable, cid)):
            #     logging.warning(f"[{self.__class__.__name__}: {self.addApp.__name__}: {datetime.now()}]: [WARNING] - Bad Request: Missing input parameter")
            #     return self.controller_base.generate_response(None, 400)
            
            _saveApp = None
            
            _user_data, _err = self.session_mgr.get_current_user_data(token)
            if _err:
                logging.error(f"[{self.__class__.__name__}: {self.addApp.__name__}: {datetime.now()}]: [ERROR] - Error retrieving user type: {_err}")
                return self.controller_base.generate_response(None, 500)
            if _user_data is None:
                logging.warning(f"[{self.__class__.__name__}: {self.addApp.__name__}: {datetime.now()}]: [WARNING] - Unauthorized: Invalid access token")
                return self.controller_base.generate_response(None, 401)
            
            _validateZip = await self.extractZipFile(file, appUnit_name)
            if not _validateZip:
                logging.error(f"[{self.__class__.__name__}: {self.addApp.__name__}: {datetime.now()}]: [ERROR] - Error adding application: {_err}")
                return self.controller_base.generate_response(None, 500)
            
             # save app in storage
            _saveApp = await self.saveApp(name, zid, version, appUnit_name, appUnit_ifname, appUnit_path, appUnit_enable, appUnit_pool_size, appUnit_uname, cname, rest_port, ws_port, prof_port)
            if not _saveApp:
                logging.error(f"[{self.__class__.__name__}: {self.addApp.__name__}: {datetime.now()}]: [ERROR] - Error adding application: {_err}")
                return self.controller_base.generate_response(None, 500)

            # add application to app table
            result, _err = self.app_mgr.addApp(name, ip, rest_port, ws_port, prof_port, zid, key, desc, enable, cid, _user_data.userType, _user_data.cid, _user_data.userName)
            if _err:
                logging.error(f"[{self.__class__.__name__}: {self.addApp.__name__}: {datetime.now()}]: [ERROR] - Error adding application: {_err}")
                return self.controller_base.generate_response(None, 500)
            elif not result:
                logging.warning(f"[{self.__class__.__name__}: {self.addApp.__name__}: {datetime.now()}]: [WARNING] - Application added not successfully")
                return self.controller_base.generate_response(None, 404)
            
            # add application to app unit table
            auResult, _err = await self.app_mgr.addAppUnit(zid, appUnit_name, appUnit_ifname, appUnit_path, appUnit_enable, appUnit_pool_size, appUnit_uname, _user_data.userType, _user_data.userName, cid)
            if _err:
                logging.error(f"[{self.__class__.__name__}: {self.addApp.__name__}: {datetime.now()}]: [ERROR] - Error adding app unit: {_err}")
                return self.controller_base.generate_response(None, 500)
            elif not result:
                logging.warning(f"[{self.__class__.__name__}: {self.addApp.__name__}: {datetime.now()}]: [WARNING] - App unit added not successfully")
                return self.controller_base.generate_response(None, 404)

            
            _app_data, _err = self.app_mgr.getAllApps()
            
            if _err:
                logging.error(f"[{self.__class__.__name__}: {self.addApp.__name__}: {datetime.now()}]: [ERROR] - Error adding application: {_err}")
                return self.controller_base.generate_response(None, 500)
            else:
                logging.info(f"[{self.__class__.__name__}: {self.addApp.__name__}: {datetime.now()}]: [INFO] - Application added successfully")
                self.app_cache.create_app_cache(_app_data)
                self.port_cache.update_port_cache(rest_port, ws_port, prof_port)
                
                return self.controller_base.generate_response(result, 200)
            
            
        except Exception as _e:
            logging.error(f"[{self.__class__.__name__}: {self.addApp.__name__}: {datetime.now()}]: [ERROR] - An unexpected error occurred: {str(_e)}")
            return self.controller_base.generate_response(None, 500)
       
        finally:
            # Clean up variables
            del _user_data, _validateZip, _saveApp, _app_data, _err

    async def extractZipFile(self, file, appUnit_name):
        try:
            self.Temp_dest_folder = self.Temp_dest_folder or tempfile.gettempdir()
            
            # _file_path = create_path(self.Temp_dest_folder, "temp")
            # create_directory(_file_path)

            # Read the file content
            _file_content = await file.read()
            _file_name = file.filename
            _file_path = create_path(self.Temp_dest_folder, _file_name)

            # Save the uploaded zip file to the given location
            save_binary(_file_content, _file_path)
            
            # Check if the file is a valid zip file
            
            with zipfile.ZipFile(io.BytesIO(_file_content)) as zip_file:
                # Check if the required files are present
                # _required_files = [f"{appUnit_name.split(".")[0]}/{appUnit_name}", f"{appUnit_name.split(".")[0]}/config/config.json"]
                _required_files = [
                    f"{appUnit_name.split('.')[0]}/{appUnit_name}",
                    f"{appUnit_name.split('.')[0]}/config/config.json"]
                _zip_contents = zip_file.namelist()
                for _required_file in _required_files:
                    if _required_file not in _zip_contents:
                        logging.error(f"[{self.__class__.__name__}: {self.extractZipFile.__name__}: {datetime.now()}]: [ERROR] - The uploaded zip file '{_file_name}' does not contain '{_required_file}'")
                        return False
                    
                logging.info(f"[{self.__class__.__name__}: {self.extractZipFile.__name__}: {datetime.now()}]: [INFO] - The uploaded zip file '{_file_name}' contain format is correct")
                # Extract the zip file to the same location
                _extract_path = create_path(self.Temp_dest_folder, _file_name.rstrip('.zip'))
                zip_file.extractall(_extract_path)
                logging.info(f"[{self.__class__.__name__}: {self.extractZipFile.__name__}: {datetime.now()}]: [INFO] - The uploaded zip file '{_file_name}' extracted successfully")
            
            return True
            
        except zipfile.BadZipFile:
            logging.error(f"[{self.__class__.__name__}: {self.extractZipFile.__name__}: {datetime.now()}]: [ERROR] - The uploaded file '{_file_name}' is not a valid zip file")
            return False
        
        except Exception as _e:
            logging.error(f"[{self.__class__.__name__}: {self.extractZipFile.__name__}: {datetime.now()}]: [ERROR] - An unexpected error occurred: {str(_e)}")
            return False
            
        finally:
            # Clean up variables
            del _file_content, _file_path, _extract_path, _required_files, _zip_contents 
        

    def save_config(self, config, destination):
        with open(destination, 'w') as file:
            json.dump(config, file, indent=4)
 
 
    async def saveApp(self, name, zid, version, appUnit_name, appUnit_ifname, appUnit_path, appUnit_enable, appUnit_pool_size, appUnit_uname, cname, rest_port, ws_port, prof_port):
        try:
            _user_folder = None

            # Update the configuration with new values
            _new_config, _status = await self.addAPPUConf(name, zid, version, appUnit_name, appUnit_ifname, appUnit_path, appUnit_enable, appUnit_pool_size, appUnit_uname)
            if not _status:
                return False
            
            # Create the directory structure
            # _user_folder = create_path(self.App_dest_folder, "Apps")
            # create_directory(_user_folder)
            
            _user_folder = create_path(self.App_dest_folder, cname)
            create_directory(_user_folder)

            _user_folder = create_path(_user_folder, zid)
            create_directory(_user_folder)
            
            #create logs directory
            create_directory(create_path(_user_folder, 'logs'))
            
            # prof_port = find_available_port(23450)
            
            #create .sh file
            create_build_sh(name, _user_folder, rest_port, ws_port, prof_port, 1)
            create_run_sh(self.App_dest_folder, _user_folder, rest_port, ws_port, prof_port)
            
            _config_file_path = create_path(_user_folder, 'appconfig.json')
            self.save_config(_new_config, _config_file_path)

            _config_file_path = create_path(_user_folder, 'mainconfig.json')
            self.save_config(mainconfig_template, _config_file_path)

            _appunits_folder = create_path(_user_folder, appUnit_path.split('/')[0])

            _app_name = appUnit_name.split('.')[0]

            _app_folder = create_path(_appunits_folder, _app_name)

            # remove_directory(_app_folder)

            create_directory(_appunits_folder)
            # Copy the entire directory tree
            _src_folder = create_path(self.Temp_dest_folder, _app_name)
            _src_folder = create_path(_src_folder, _app_name)
            copy_directory(_src_folder, _app_folder)

            logging.info(f"[{self.__class__.__name__}: {self.saveApp.__name__}: {datetime.now()}]: [INFO] - The {_app_name} ZAU app successfully uploaded to {_src_folder} location")

            remove_file(create_path(self.Temp_dest_folder, f"{_app_name}.zip")) 

            # Check if the directory exists and delete it
            remove_directory(create_path(self.Temp_dest_folder, _app_name))

            return True

        except Exception as _e:
            logging.error(f"[{self.__class__.__name__}: {self.saveApp.__name__}: {datetime.now()}]: [ERROR] - Error adding application: {_e}")
            return False
        
        finally:
            # Clean up variables
            del _new_config, _user_folder, _config_file_path, _appunits_folder, _app_name, _app_folder, _src_folder 

    async def addAPPUConf(self, name, zid, version, appUnit_name, appUnit_ifname, appUnit_path, appUnit_enable, appUnit_pool_size, appUnit_uname):
        try:
            _appconfig = deep_copy(appconfig_template)

            # Update the copy with new values
            _appconfig["app"]["name"] = name
            _appconfig["app"]["id"] = zid
            _appconfig["app"]["version"] = version

            _appconfig["appunits"][0]["name"] = appUnit_name
            _appconfig["appunits"][0]["ifname"] = appUnit_ifname
            _appconfig["appunits"][0]["path"] = appUnit_path
            _appconfig["appunits"][0]["enable"] = appUnit_enable
            _appconfig["appunits"][0]["pool_size"] = appUnit_pool_size
            _appconfig["appunits"][0]["uname"] = appUnit_uname

            return _appconfig, True

        except Exception as _e:
            logging.error(f"[{self.__class__.__name__}: {self.addAPPUConf.__name__}: {datetime.now()}]: [ERROR] - An unexpected error occurred: {str(_e)}")
            return None, False



    """Updates an existing application.

    Args:
        aid (int): The application ID.
        name (str): The name of the application.
        ip (str): The IP address of the application.
        rest_port (int): The REST port of the application.
        ws_port (int): The WebSocket port of the application.
        zid (str): The configuration ID of the application.
        key (str): The key of the application.
        desc (str): The desc of the application.
        cid (int): The company ID.
        token (str): The authorization header containing the token.

    Returns:
        JSONResponse: A JSON response indicating the result of the operation.
    """
    def updateApp(self, aid: int, name: str, ip: str, rest_port: int, ws_port: int, zid: str, key: str, desc: str, enable: int, cid: int, token: str):
        try:
            # if any(param is None for param in(aid, name, ip, rest_port, ws_port, zid, key, desc, enable, cid)):
            #     logging.warning(f"[{self.__class__.__name__}: {self.updateApp.__name__}: {datetime.now()}]: [WARNING] - Bad Request: Missing input parameter")
            #     return self.controller_base.generate_response(None, 400)
            
            _user_data, _err = self.session_mgr.get_current_user_data(token)
            if _err:
                logging.error(f"[{self.__class__.__name__}: {self.updateApp.__name__}: {datetime.now()}]: [ERROR] - Error retrieving user type: {_err}")
                return self.controller_base.generate_response(None, 500)
            if _user_data is None:
                logging.warning(f"[{self.__class__.__name__}: {self.updateApp.__name__}: {datetime.now()}]: [WARNING] - Unauthorized: Invalid access token")
                return self.controller_base.generate_response(None, 401)
            
            result, _err = self.app_mgr.updateApp(aid, name, ip, rest_port, ws_port, zid, key, desc, enable, cid, _user_data.userType, _user_data.cid, _user_data.userName)
            if _err:
                logging.error(f"[{self.__class__.__name__}: {self.updateApp.__name__}: {datetime.now()}]: [ERROR] - Error updating application: {_err}")
                return self.controller_base.generate_response(None, 500)
            elif not result:
                logging.warning(f"[{self.__class__.__name__}: {self.updateApp.__name__}: {datetime.now()}]: [WARNING] - Application updated not successfully")
                return self.controller_base.generate_response(None, 404)
            
            # if zid != exist_zid:
            #     _src_folder = create_path(self.App_dest_folder, "Apps")
            #     _current_path = create_path(_src_folder, exist_zid)
            #     _new_path = create_path(_src_folder, zid)
            #     os.rename(_current_path, _new_path)
                
            
            _app_data, _err = self.app_mgr.getAllApps()
            if _err:
                logging.error(f"[{self.__class__.__name__}: {self.addApp.__name__}: {datetime.now()}]: [ERROR] - Error adding application: {_err}")
                return self.controller_base.generate_response(None, 500)
            else:
                self.app_cache.create_app_cache(_app_data)
                logging.info(f"[{self.__class__.__name__}: {self.updateApp.__name__}: {datetime.now()}]: [INFO] - Application updated successfully")
                return self.controller_base.generate_response(result, 200)
            
        except Exception as _e:
            logging.error(f"[{self.__class__.__name__}: {self.updateApp.__name__}: {datetime.now()}]: [ERROR] - An unexpected error occurred: {str(_e)}")
            return self.controller_base.generate_response(None, 500)

        finally:
            # Clean up variables
            del _user_data, _app_data, _err

    """Deletes an application.

    Args:
        aid (int): The application ID.
        token (str): The authorization header containing the token.

    Returns:
        JSONResponse: A JSON response indicating the result of the operation.
    """
    async def deleteApp(self, cid: int, aid: int, token: str):
        _user_data = None
        _cache_app_data = None 
        _app_data = None 
        _err = None

        try:
            # if any(param is None for param in (aid,)):
            #     logging.warning(f"[{self.__class__.__name__}: {self.deleteApp.__name__}: {datetime.now()}]: [WARNING] - Bad Request: Missing input parameter")
            #     return self.controller_base.generate_response(None, 400)

            _user_data, _err = self.session_mgr.get_current_user_data(token)
            if _err:
                logging.error(f"[{self.__class__.__name__}: {self.deleteApp.__name__}: {datetime.now()}]: [ERROR] - Error retrieving user type: {_err}")
                return self.controller_base.generate_response(None, 500)
            if _user_data is None:
                logging.warning(f"[{self.__class__.__name__}: {self.deleteApp.__name__}: {datetime.now()}]: [WARNING] - Unauthorized: Invalid access token")
                return self.controller_base.generate_response(None, 401)
            

            _cache_app_data= self.app_cache.deleteAppById(aid, cid, _user_data.userType)

            # await self.deleteAppData(cid, _cache_app_data["zid"])
            await self.deleteAppData(_cache_app_data['cname'], _cache_app_data["zid"])
            await self.app_mgr.delAllAppUnit( _user_data.userType, _user_data.userName, cid, _cache_app_data["zid"])

            result, _err = self.app_mgr.deleteApp(aid, _user_data.userType, cid, _user_data.userName)
            if _err:
                logging.error(f"[{self.__class__.__name__}: {self.deleteApp.__name__}: {datetime.now()}]: [ERROR] - Error deleting application: {_err}")
                return self.controller_base.generate_response(None, 500)
            elif not result:
                logging.warning(f"[{self.__class__.__name__}: {self.deleteApp.__name__}: {datetime.now()}]: [WARNING] - Application deleted not successfully")
                return self.controller_base.generate_response(None, 404)
            
            # if _err:
            #     logging.error(f"[{self.__class__.__name__}: {self.addApp.__name__}: {datetime.now()}]: [ERROR] - Error adding application: {_err}")
            #     return self.controller_base.generate_response(None, 500)
            else:
                _app_data, _err = self.app_mgr.getAllApps()
                self.app_cache.create_app_cache(_app_data)
                logging.info(f"[{self.__class__.__name__}: {self.deleteApp.__name__}: {datetime.now()}]: [INFO] - Application deleted successfully")
                return self.controller_base.generate_response(result, 200)
            
        except Exception as _e:
            logging.error(f"[{self.__class__.__name__}: {self.deleteApp.__name__}: {datetime.now()}]: [ERROR] - An unexpected error occurred: {str(_e)}")
            del _e
            return self.controller_base.generate_response(None, 500)

        finally:
            # Clean up variables
            del _user_data, _cache_app_data, _app_data, _err

    


    async def deleteAppData(self, cname, zid):
        _app_folder = None
        _src_folder = None
        try:
            _app_folder = create_path(self.App_dest_folder, "Delete")
            create_directory(_app_folder)
            _app_folder = create_path(_app_folder, cname)
            create_directory(_app_folder)
            _app_folder = create_path(_app_folder, zid)
            # create_directory(_app_folder)

            # _src_folder = create_path(self.App_dest_folder, "Apps")
            _src_folder = create_path(self.App_dest_folder, cname)
            _src_folder = create_path(_src_folder, zid)

            move_directory(_src_folder, _app_folder)
        
            return True

        except Exception as _e:
            logging.error(f"[{self.__class__.__name__}: {self.deleteAppData.__name__}: {datetime.now()}]: [ERROR] - Error adding application: {_e}")
            del _e
            return False
        
        finally:
            # Clean up variables
            del _app_folder, _src_folder




    """Retrieves ports.


    Returns:
        JSONResponse: A JSON response containing the ports.
    """
    def getPorts(self):
        _user_data = None
        _err = None
        try:
            _port_data, _err = self.port_cache.get_ports()

            if _err:
                logging.error(f"[{self.__class__.__name__}: {self.getPorts.__name__}: {datetime.now()}]: [ERROR] - Error retrieving ports data: {_err}")
                return self.controller_base.generate_response(None, 500)
            elif not _port_data:
                logging.warning(f"[{self.__class__.__name__}: {self.getPorts.__name__}: {datetime.now()}]: [WARNING] - ports not found")
                return self.controller_base.generate_response(_port_data, 200)
            else:
                logging.info(f"[{self.__class__.__name__}: {self.getPorts.__name__}: {datetime.now()}]: [INFO] - ports data retrieved successfully")
                return self.controller_base.generate_response(_port_data, 200)
    
        except Exception as _e:
            logging.error(f"[{self.__class__.__name__}: {self.getApps.__name__}: {datetime.now()}]: [ERROR] - An unexpected error occurred: {str(_e)}")
            del _e
            return self.controller_base.generate_response(None, 500)
        
        finally:
            del _user_data, _err





    async def startApp(self, token: str, cname, zid):
        try:
            result, _err = self.session_mgr.get_current_user_data(token)
            if _err:
                logging.error(f"[{self.__class__.__name__}: {self.addApp.__name__}: {datetime.now()}]: [ERROR] - Error retrieving user type: {_err}")
                return self.controller_base.generate_response(None, 500)
            if result is None:
                logging.warning(f"[{self.__class__.__name__}: {self.addApp.__name__}: {datetime.now()}]: [WARNING] - Unauthorized: Invalid access token")
                return self.controller_base.generate_response(None, 401)
            
            _user_folder = create_path(self.App_dest_folder, cname)
            _user_folder = create_path(_user_folder, zid)
            
            logging.info(f"[{self.__class__.__name__}: {self.addApp.__name__}: {datetime.now()}]: [WARNING] - {_user_folder}")
            result, err = await execute_sh(_user_folder, zid)

                
            if _err:
                return self.controller_base.generate_response(None, 500)
            else:
                return  self.controller_base.generate_response(result, 200)
            
            
        except Exception as _e:
            logging.error(f"[{self.__class__.__name__}: {self.addApp.__name__}: {datetime.now()}]: [ERROR] - An unexpected error occurred: {str(_e)}")
            return self.controller_base.generate_response(None, 500)
       
            
            
            
            


# #====================================App Units===========================

#     """Retrieves all applications.

#     Args:
#         token (str): The authorization header containing the token.

#     Returns:
#         JSONResponse: A JSON response containing the list of applications.
#     """
#     def getAppUnits(self, token: str, zid: str, cid: int):
#         _user_data = None
#         _err = None
#         try:
#             _user_data, _err = self.session_mgr.get_current_user_data(token)
#             if _err:
#                 logging.error(f"[{self.__class__.__name__}: {self.getAppUnits.__name__}: {datetime.now()}]: [ERROR] - Error retrieving user type: {_err}")
#                 return self.controller_base.generate_response(None, 500)
#             if _user_data is None:
#                 logging.warning(f"[{self.__class__.__name__}: {self.getAppUnits.__name__}: {datetime.now()}]: [WARNING] - Unauthorized: Invalid access token")
#                 return self.controller_base.generate_response(None, 401)

#             # _app_data, _err = self.app_mgr.getAllApps(_user_data.userType, _user_data.cid)
#             # self.app_cache.create_app_cache(_app_data) 
#             _app_data, _err = self.app_mgr.getAllAppUnits( _user_data.userType, cid, zid)

#             if _err:
#                 logging.error(f"[{self.__class__.__name__}: {self.getAppUnits.__name__}: {datetime.now()}]: [ERROR] - Error retrieving application units data: {_err}")
#                 return self.controller_base.generate_response(None, 500)
#             elif not _app_data:
#                 logging.warning(f"[{self.__class__.__name__}: {self.getAppUnits.__name__}: {datetime.now()}]: [WARNING] - Application units not found")
#                 return self.controller_base.generate_response(None, 200)
#             else:
#                 logging.info(f"[{self.__class__.__name__}: {self.getAppUnits.__name__}: {datetime.now()}]: [INFO] - Application units data retrieved successfully")
#                 return self.controller_base.generate_response(_app_data, 200)
    
#         except Exception as _e:
#             logging.error(f"[{self.__class__.__name__}: {self.getAppUnits.__name__}: {datetime.now()}]: [ERROR] - An unexpected error occurred: {str(_e)}")
#             del _e
#             return self.controller_base.generate_response(None, 500)
        
#         finally:
#             del _user_data, _err


#     async def addAppUnit(self, token: str, zid: str, name:str, ifname: str, path: str, enable: int, pool_size: int, uname: str, cname: str, cid: int, file: Binary):
#         _src_folder = None
#         try:
#             # if any(param is None for param in( name, ip, rest_port, ws_port, zid, key, desc, enable, cid)):
#             #     logging.warning(f"[{self.__class__.__name__}: {self.addApp.__name__}: {datetime.now()}]: [WARNING] - Bad Request: Missing input parameter")
#             #     return self.controller_base.generate_response(None, 400)
            
#             _user_data, _err = self.session_mgr.get_current_user_data(token)
#             if _err:
#                 logging.error(f"[{self.__class__.__name__}: {self.getApps.__name__}: {datetime.now()}]: [ERROR] - Error retrieving user type: {_err}")
#                 return self.controller_base.generate_response(None, 500)
#             if _user_data is None:
#                 logging.warning(f"[{self.__class__.__name__}: {self.getApps.__name__}: {datetime.now()}]: [WARNING] - Unauthorized: Invalid access token")
#                 return self.controller_base.generate_response(None, 401)
            

#             _validateZip = await self.extractZipFile(file, name)
#             if not _validateZip:
#                 logging.error(f"[{self.__class__.__name__}: {self.addApp.__name__}: {datetime.now()}]: [ERROR] - Error adding application: {_err}")
#                 return self.controller_base.generate_response(None, 500)
            

#             _src_folder = create_path(self.App_dest_folder, "Apps")
#             _src_folder = create_path(_src_folder, cname)
#             _src_folder = create_path(_src_folder, zid)
            

#             _saveApp = await self.saveAppUnit(_src_folder, name, ifname, path, enable, pool_size, uname)
#             if not _saveApp:
#                 logging.error(f"[{self.__class__.__name__}: {self.addApp.__name__}: {datetime.now()}]: [ERROR] - Error adding application: {_err}")
#                 return self.controller_base.generate_response(None, 500)
            

#             # _result = await self.updateAPPUConf(_src_folder, appUnit_enable, appUnit_pool_size, appUnit_uname)
#             # if not _result:
#             #     logging.error(f"[{self.__class__.__name__}: {self.addAppUnit.__name__}: {datetime.now()}]: [ERROR] - Error adding app unit: {_err}")
#             #     return self.controller_base.generate_response(None, 500)

#             # result, _err = self.app_mgr.addApp(name, ip, rest_port, ws_port, zid, key, desc, enable, cid, _user_data.userType, _user_data.cid)
#             # if _err:
#             #     logging.error(f"[{self.__class__.__name__}: {self.addApp.__name__}: {datetime.now()}]: [ERROR] - Error adding application: {_err}")
#             #     return self.controller_base.generate_response(None, 500)
#             # elif not result:
#             #     logging.warning(f"[{self.__class__.__name__}: {self.addApp.__name__}: {datetime.now()}]: [WARNING] - Application added not successfully")
#             #     return self.controller_base.generate_response(None, 404)
            
#             # add app unit to App Unit table

#                         # add application to app unit table
            
#             result, _err = self.app_mgr.addAppUnit(zid, name, ifname, path, enable, pool_size, uname, _user_data.userType, _user_data.userName, cid)
#             if _err:
#                 logging.error(f"[{self.__class__.__name__}: {self.addApp.__name__}: {datetime.now()}]: [ERROR] - Error adding app unit: {_err}")
#                 return self.controller_base.generate_response(None, 500)
#             elif not result:
#                 logging.warning(f"[{self.__class__.__name__}: {self.addApp.__name__}: {datetime.now()}]: [WARNING] - App unit added not successfully")
#                 return self.controller_base.generate_response(None, 404)
#             else:
#                 logging.info(f"[{self.__class__.__name__}: {self.deleteAppUnit.__name__}: {datetime.now()}]: [INFO] - Application units data deleted successfully")
#                 return self.controller_base.generate_response(result, 200)
            
#         except Exception as _e:
#             logging.error(f"[{self.__class__.__name__}: {self.addApp.__name__}: {datetime.now()}]: [ERROR] - An unexpected error occurred: {str(_e)}")
#             return self.controller_base.generate_response(None, 500)
       
#         finally:
#             # Clean up variables
#             del _user_data




#     async def saveAppUnit(self, file_path, name, ifname, path, enable, pool_size, uname):
#         try:
#             # create_directory(self.Temp_dest_folder)

#             # Update the configuration with new values
#             _file_path = create_path(file_path, "appconfig.json")
#             _status = await self.updateAPPUConf(_file_path, name, ifname, path, enable, pool_size, uname)
#             # _new_config, _status = await self.updateAPPUConf(_file_path, name, ifname, path, enable, pool_size, uname)
#             if not _status:
#                 return False
            
#             # Create the directory structure
#             # _user_folder = create_path(file_path, "zappunits")
#             # create_directory(_user_folder)

#             _user_folder = create_path(file_path, path.split('/')[0])

#             _app_name = name.split('.')[0]

#             _app_folder = create_path(self.Temp_dest_folder, _app_name)

#             # _src_folder = create_path(_user_folder, _app_name)

#             merge_directories( _app_folder,  _user_folder)

#             logging.info(f"[{self.__class__.__name__}: {self.saveApp.__name__}: {datetime.now()}]: [INFO] - The {_app_name} ZAU app successfully uploaded to  location")

#             remove_file(create_path(self.Temp_dest_folder, f"{_app_name}.zip")) 

#             # Check if the directory exists and delete it
#             remove_directory(create_path(self.Temp_dest_folder, _app_name))

#             return True

#         except Exception as _e:
#             logging.error(f"[{self.__class__.__name__}: {self.saveApp.__name__}: {datetime.now()}]: [ERROR] - Error adding application: {_e}")
#             return False
        
#         finally:
#             # Clean up variables
#             del  _user_folder, _app_name, _app_folder


#     async def updateAPPUConf(self, file_path, name, ifname, path, enable, pool_size, uname):
#         try:
#             with open(file_path, "r") as file:
#                 data = json.load(file)

#             # Create a new dictionary for the new "appunits" element
#             new_appunit = {
#                 "uname": uname,
#                 "enable": enable,
#                 "pool_size": pool_size,
#                 "ifname": ifname,
#                 "path": path,
#                 "name": name
#             }

#             # Append the new "appunits" element to the list
#             # data["appunits"].append(new_appunit)
#             data["appunits"].append(new_appunit)

#             # Write the updated data back to the JSON file
#             save_file(data, file_path)

#             return True

#         except Exception as _e:
#             logging.error(f"[{self.__class__.__name__}: {self.updateAPPUConf.__name__}: {datetime.now()}]: [ERROR] - An unexpected error occurred: {str(_e)}")
#             return False
        







#     async def deleteAppUnit(self, token: str, cid: int, zid: str, id: int):
#         _src_folder = None
#         try:
#             # if any(param is None for param in( name, ip, rest_port, ws_port, zid, key, desc, enable, cid)):
#             #     logging.warning(f"[{self.__class__.__name__}: {self.addApp.__name__}: {datetime.now()}]: [WARNING] - Bad Request: Missing input parameter")
#             #     return self.controller_base.generate_response(None, 400)
            
#             _user_data, _err = self.session_mgr.get_current_user_data(token)
#             if _err:
#                 logging.error(f"[{self.__class__.__name__}: {self.deleteAppUnit.__name__}: {datetime.now()}]: [ERROR] - Error retrieving user type: {_err}")
#                 return self.controller_base.generate_response(None, 500)
#             if _user_data is None:
#                 logging.warning(f"[{self.__class__.__name__}: {self.deleteAppUnit.__name__}: {datetime.now()}]: [WARNING] - Unauthorized: Invalid access token")
#                 return self.controller_base.generate_response(None, 401)
            

#             _app_data, _err = self.app_mgr.getAppUnit(_user_data.userType, cid, id)

#             if _err:
#                 logging.error(f"[{self.__class__.__name__}: {self.deleteAppUnit.__name__}: {datetime.now()}]: [ERROR] - Error retrieving application units data: {_err}")
#                 return self.controller_base.generate_response(None, 500)
#             elif not _app_data:
#                 logging.warning(f"[{self.__class__.__name__}: {self.deleteAppUnit.__name__}: {datetime.now()}]: [WARNING] - Application units not found")
#                 return self.controller_base.generate_response(None, 404)
            

#             _result = await self.deleteAppUnitData(_app_data[0]['zid'], _app_data[0]['name'].split('.')[0], _app_data[0]['uname'], _app_data[0]['cname'])
#             if not _result:
#                 logging.error(f"[{self.__class__.__name__}: {self.deleteAppUnit.__name__}: {datetime.now()}]: [ERROR] - Error adding app unit: {_err}")
#                 # return self.controller_base.generate_response(None, 500)


#             _app_data, _err = self.app_mgr.delAppUnit(_user_data.userType, _user_data.userName, cid, id)
#             if _err:
#                 logging.error(f"[{self.__class__.__name__}: {self.deleteAppUnit.__name__}: {datetime.now()}]: [ERROR] - Error retrieving application units data: {_err}")
#                 return self.controller_base.generate_response(None, 500)
#             elif not _app_data:
#                 logging.warning(f"[{self.__class__.__name__}: {self.deleteAppUnit.__name__}: {datetime.now()}]: [WARNING] - Application unit not found")
#                 return self.controller_base.generate_response(None, 404)
#             else:
#                 logging.info(f"[{self.__class__.__name__}: {self.deleteAppUnit.__name__}: {datetime.now()}]: [INFO] - Application units data deleted successfully")
#                 return self.controller_base.generate_response(_app_data, 200)
    
#         except Exception as _e:
#             logging.error(f"[{self.__class__.__name__}: {self.addApp.__name__}: {datetime.now()}]: [ERROR] - An unexpected error occurred: {str(_e)}")
#             return self.controller_base.generate_response(None, 500)
       
#         finally:
#             # Clean up variables
#             del _user_data, _app_data, _err



#     async def deleteAppUnitData(self, zid, name, uname, cname):
#         _dest_folder = None
#         _src_folder = None
#         try:
                        
#             _src_folder = create_path(self.App_dest_folder, "Apps")
#             _src_folder = create_path(_src_folder, cname)
#             _src_folder = create_path(_src_folder, zid)

#             _file_path = create_path(_src_folder, "appconfig.json")
#             _status = await self.removeAPPUConf(_file_path, uname)
#             if not _status:
#                 return False

#             _src_folder = create_path(_src_folder, "zappunits")
#             _src_folder = create_path(_src_folder, name)


#             _dest_folder = create_path(self.App_dest_folder, "Delete")
#             create_directory(_dest_folder)

#             _dest_folder = create_path(_dest_folder, zid)
#             create_directory(_dest_folder)

#             _dest_folder = create_path(_dest_folder, "zappunits")
#             create_directory(_dest_folder)
            
#             _dest_folder = create_path(_dest_folder, name)
#             # create_directory(_dest_folder)

#             return move_directory(_src_folder, _dest_folder)
        
            

#         except Exception as _e:
#             logging.error(f"[{self.__class__.__name__}: {self.deleteAppData.__name__}: {datetime.now()}]: [ERROR] - Error adding application: {_e}")
#             del _e
#             return False
        
#         finally:
#             # Clean up variables
#             del _src_folder, _dest_folder

#     async def removeAPPUConf(self, file_path, uname):
#         try:
#             with open(file_path, "r") as file:
#                 data = json.load(file)

#             appunits = [appunit for appunit in data["appunits"] if appunit['uname'] != uname]
#             data["appunits"] = appunits
#             # Write the updated data back to the JSON file
#             return save_file(data, file_path)

#         except Exception as _e:
#             logging.error(f"[{self.__class__.__name__}: {self.deleteAppUnitData.__name__}: {datetime.now()}]: [ERROR] - An unexpected error occurred: {str(_e)}")
#             return False
#         finally:
#             # Clean up variables
#             del appunits, data
        












#     async def updateAppUnit(self, token: str, zid, id, name, ifname, path, enable, pool_size, uname, cname, cid, file):
#         _src_folder = None
#         try:
#             # if any(param is None for param in( name, ip, rest_port, ws_port, zid, key, desc, enable, cid)):
#             #     logging.warning(f"[{self.__class__.__name__}: {self.addApp.__name__}: {datetime.now()}]: [WARNING] - Bad Request: Missing input parameter")
#             #     return self.controller_base.generate_response(None, 400)
            
#             _user_data, _err = self.session_mgr.get_current_user_data(token)
#             if _err:
#                 logging.error(f"[{self.__class__.__name__}: {self.deleteAppUnit.__name__}: {datetime.now()}]: [ERROR] - Error retrieving user type: {_err}")
#                 return self.controller_base.generate_response(None, 500)
#             if _user_data is None:
#                 logging.warning(f"[{self.__class__.__name__}: {self.deleteAppUnit.__name__}: {datetime.now()}]: [WARNING] - Unauthorized: Invalid access token")
#                 return self.controller_base.generate_response(None, 401)
            
#             #  # update app unit table
#             # _app_data, _err = self.app_mgr.updateAppUnit(_user_data.userType, id, zid, uname, pool_size, ifname, path, name, enable)
#             # if _err:
#             #     logging.error(f"[{self.__class__.__name__}: {self.deleteAppUnit.__name__}: {datetime.now()}]: [ERROR] - Error retrieving application units data: {_err}")
#             #     return self.controller_base.generate_response(None, 500)
#             # elif not _app_data:
#             #     logging.warning(f"[{self.__class__.__name__}: {self.deleteAppUnit.__name__}: {datetime.now()}]: [WARNING] - Application unit not found")
#             #     return self.controller_base.generate_response(None, 404)
#             # else:
#             #     logging.info(f"[{self.__class__.__name__}: {self.deleteAppUnit.__name__}: {datetime.now()}]: [INFO] - Application units data deleted successfully")
#             #     return self.controller_base.generate_response(_app_data, 200)

#             if file:
#                 _app_data, _err = self.app_mgr.getAppUnit(_user_data.userType, cid, id)

#                 if _err:
#                     logging.error(f"[{self.__class__.__name__}: {self.deleteAppUnit.__name__}: {datetime.now()}]: [ERROR] - Error retrieving application units data: {_err}")
#                     return self.controller_base.generate_response(None, 500)
#                 elif not _app_data:
#                     logging.warning(f"[{self.__class__.__name__}: {self.deleteAppUnit.__name__}: {datetime.now()}]: [WARNING] - Application units not found")
#                     return self.controller_base.generate_response(None, 404)

#                 _validateZip = await self.extractZipFile(file, name)
#                 if not _validateZip:
#                     logging.error(f"[{self.__class__.__name__}: {self.addApp.__name__}: {datetime.now()}]: [ERROR] - Error adding application: {_err}")
#                     return self.controller_base.generate_response(None, 500)



#                 _result = await self.updateAppUnitData(_app_data[0]['zid'], _app_data[0]['uname'], _app_data[0]['name'], name, uname, enable, pool_size, ifname, path, cname)
#                 if not _result:
#                     logging.error(f"[{self.__class__.__name__}: {self.deleteAppUnit.__name__}: {datetime.now()}]: [ERROR] - Error adding app unit: {_err}")
#                     return self.controller_base.generate_response(None, 500)

#                 # update app unit table
#                 _app_data, _err = self.app_mgr.updateAppUnit(_user_data.userType, _user_data.userName,  id, zid, uname, pool_size, ifname, path, name, enable, cid)
#                 if _err:
#                     logging.error(f"[{self.__class__.__name__}: {self.deleteAppUnit.__name__}: {datetime.now()}]: [ERROR] - Error retrieving application units data: {_err}")
#                     return self.controller_base.generate_response(None, 500)
#                 elif not _app_data:
#                     logging.warning(f"[{self.__class__.__name__}: {self.deleteAppUnit.__name__}: {datetime.now()}]: [WARNING] - Application unit not found")
#                     return self.controller_base.generate_response(None, 404)
#                 else:
#                     logging.info(f"[{self.__class__.__name__}: {self.deleteAppUnit.__name__}: {datetime.now()}]: [INFO] - Application units data deleted successfully")
#                     return self.controller_base.generate_response(_app_data, 200)
            
#             else:
#                 # update app unit table        user_type: str, id, zid, uname, pool_size, ifname, path, name, enable
#                 _app_data, _err = self.app_mgr.updateAppUnit(_user_data.userType, _user_data.userName, id, zid, uname, pool_size, ifname, path, name, enable, cid)
#                 if _err:
#                     logging.error(f"[{self.__class__.__name__}: {self.deleteAppUnit.__name__}: {datetime.now()}]: [ERROR] - Error retrieving application units data: {_err}")
#                     return self.controller_base.generate_response(None, 500)
#                 elif not _app_data:
#                     logging.warning(f"[{self.__class__.__name__}: {self.deleteAppUnit.__name__}: {datetime.now()}]: [WARNING] - Application unit not found")
#                     return self.controller_base.generate_response(None, 404)
#                 else:
#                     logging.info(f"[{self.__class__.__name__}: {self.deleteAppUnit.__name__}: {datetime.now()}]: [INFO] - Application units data deleted successfully")
#                     return self.controller_base.generate_response(_app_data, 200)
            

#         except Exception as _e:
#             logging.error(f"[{self.__class__.__name__}: {self.addApp.__name__}: {datetime.now()}]: [ERROR] - An unexpected error occurred: {str(_e)}")
#             return self.controller_base.generate_response(None, 500)
       
#         finally:
#             # Clean up variables
#             del _user_data, _app_data, _err



#     async def updateAppUnitData(self, zid, ext_uname, ext_name, name, uname, enable, pool_size, ifname, path, cname):
#         _dest_folder = None
#         _src_folder = None
#         try:
                        
#             _src_folder = create_path(self.App_dest_folder, "Apps")
#             _src_folder = create_path(_src_folder, cname)
#             _src_folder = create_path(_src_folder, zid)

#             _file_path = create_path(_src_folder, "appconfig.json")
#             _status = await self.editAPPUConf(_file_path, ext_uname, uname, enable, pool_size, ifname, path, name)
#             if not _status:
#                 return False

#             _user_folder = create_path(_src_folder, "zappunits")
#             # _ex_app_name = ext_name.split('.')[0]

#             _src_folder = create_path(_user_folder, ext_name.split('.')[0])


#             # move app unit to edited folder
#             _dest_folder = create_path(self.App_dest_folder, "Edit")
#             create_directory(_dest_folder)

#             _dest_folder = create_path(_dest_folder, zid)
#             create_directory(_dest_folder)

#             _dest_folder = create_path(_dest_folder, "zappunits")
#             create_directory(_dest_folder)
#             _dest_folder = create_path(_dest_folder, ext_name.split('.')[0])
#             # create_directory(_dest_folder)

#             move_directory(_src_folder, _dest_folder)


#             # save new app unit file
#             _app_name = name.split('.')[0]
#             _app_folder = create_path(self.Temp_dest_folder, _app_name)

#             merge_directories( _app_folder,  _user_folder)

#             logging.info(f"[{self.__class__.__name__}: {self.saveApp.__name__}: {datetime.now()}]: [INFO] - The {_app_name} ZAU app successfully uploaded to  location")

#             remove_file(create_path(self.Temp_dest_folder, f"{_app_name}.zip")) 

#             # Check if the directory exists and delete it
#             remove_directory(create_path(self.Temp_dest_folder, _app_name))
        
#             return True
            

#         except Exception as _e:
#             logging.error(f"[{self.__class__.__name__}: {self.deleteAppData.__name__}: {datetime.now()}]: [ERROR] - Error adding application: {_e}")
#             del _e
#             return False
        
#         finally:
#             # Clean up variables
#             del _src_folder, _dest_folder

#     async def editAPPUConf(self, file_path, ext_uname, uname, enable, pool_size, ifname, path, name):
#         try:
#             with open(file_path, "r") as file:
#                 data = json.load(file)

#             new_values = {
#                 "uname": uname,
#                 "enable": enable,
#                 "pool_size": pool_size,
#                 "ifname": ifname,
#                 "path": path,
#                 "name": name
#             }

#             for element in data["appunits"]:
#                 if element['uname'] == ext_uname:
#                     element.update(new_values)

#             # Write the updated data back to the JSON file
#             return save_file(data, file_path)

#         except Exception as _e:
#             logging.error(f"[{self.__class__.__name__}: {self.editAPPUConf.__name__}: {datetime.now()}]: [ERROR] - An unexpected error occurred: {str(_e)}")
#             return False
        
        