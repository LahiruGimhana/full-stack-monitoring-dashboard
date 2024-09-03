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
from classy_fastapi import Routable
from fastapi import UploadFile
from fastapi.responses import JSONResponse
from src.controller.base.types import ResponseModel, ApplicationModel
# from app_manager import AppManager
from src.model.app_manager import AppManager
from src.controller.cacheController.sessionController import  SessionController
from src.controller.cacheController.appCacheController import AppCacheController
from src.controller.base.controllerBase import ControllerBase
from src.templates.config_template import appconfig_template, mainconfig_template
from src.utilities.utilities import create_directory, copy_directory, deep_copy, merge_directories, move_directory, remove_file, remove_directory, create_path, save_binary, save_file, extractZipFile

class AppUnitController(Routable):
    def __init__(self, base_dir, configuration) -> None:
        super().__init__()
        self.app_mgr = AppManager(base_dir)
        self.session_mgr = SessionController()
        self.app_cache = AppCacheController()
        self.controller_base = ControllerBase()
        
        self.configuration = configuration
        self.Temp_dest_folder = self.configuration.get("TEMP_DEST_FOLDER")
        self.App_dest_folder = self.configuration.get("APP_DEST_FOLDER")

#====================================App Units===========================

    """Retrieves all applications.

    Args:
        token (str): The authorization header containing the token.

    Returns:
        JSONResponse: A JSON response containing the list of applications.
    """
    async def getAppUnits(self, token: str, zid: str, cid: int):
        _user_data = None
        _err = None
        try:
            _user_data, _err = self.session_mgr.get_current_user_data(token)
            if _err:
                logging.error(f"[{self.__class__.__name__}: {self.getAppUnits.__name__}: {datetime.now()}]: [ERROR] - Error retrieving user type: {_err}")
                return self.controller_base.generate_response(None, 500)
            if _user_data is None:
                logging.warning(f"[{self.__class__.__name__}: {self.getAppUnits.__name__}: {datetime.now()}]: [WARNING] - Unauthorized: Invalid access token")
                return self.controller_base.generate_response(None, 401)

            # _app_data, _err = self.app_mgr.getAllApps(_user_data.userType, _user_data.cid)
            # self.app_cache.create_app_cache(_app_data) 
            _app_data, _err = self.app_mgr.getAllAppUnits( _user_data.userType, cid, zid)

            if _err:
                logging.error(f"[{self.__class__.__name__}: {self.getAppUnits.__name__}: {datetime.now()}]: [ERROR] - Error retrieving application units data: {_err}")
                return self.controller_base.generate_response(None, 500)
            elif not _app_data:
                logging.warning(f"[{self.__class__.__name__}: {self.getAppUnits.__name__}: {datetime.now()}]: [WARNING] - Application units not found")
                return self.controller_base.generate_response(None, 200)
            else:
                logging.info(f"[{self.__class__.__name__}: {self.getAppUnits.__name__}: {datetime.now()}]: [INFO] - Application units data retrieved successfully")
                return self.controller_base.generate_response(_app_data, 200)
    
        except Exception as _e:
            logging.error(f"[{self.__class__.__name__}: {self.getAppUnits.__name__}: {datetime.now()}]: [ERROR] - An unexpected error occurred: {str(_e)}")
            del _e
            return self.controller_base.generate_response(None, 500)
        
        finally:
            del _user_data, _err


    async def addAppUnit(self, token: str, zid: str, name:str, ifname: str, path: str, enable: int, pool_size: int, uname: str, cname: str, cid: int, file: Binary):
        _src_folder = None
        try:
            # if any(param is None for param in( name, ip, rest_port, ws_port, zid, key, desc, enable, cid)):
            #     logging.warning(f"[{self.__class__.__name__}: {self.addAppUnit.__name__}: {datetime.now()}]: [WARNING] - Bad Request: Missing input parameter")
            #     return self.controller_base.generate_response(None, 400)
            
            _user_data, _err = self.session_mgr.get_current_user_data(token)
            if _err:
                logging.error(f"[{self.__class__.__name__}: {self.getApps.__name__}: {datetime.now()}]: [ERROR] - Error retrieving user type: {_err}")
                return self.controller_base.generate_response(None, 500)
            if _user_data is None:
                logging.warning(f"[{self.__class__.__name__}: {self.getApps.__name__}: {datetime.now()}]: [WARNING] - Unauthorized: Invalid access token")
                return self.controller_base.generate_response(None, 401)
            

            _validateZip = await extractZipFile(self, file, name, self.Temp_dest_folder)
            if not _validateZip:
                logging.error(f"[{self.__class__.__name__}: {self.addAppUnit.__name__}: {datetime.now()}]: [ERROR] - Error adding application: {_err}")
                return self.controller_base.generate_response(None, 500)
            

            # _src_folder = create_path(self.App_dest_folder, "Apps")
            _src_folder = create_path(self.App_dest_folder, cname)
            _src_folder = create_path(_src_folder, zid)
            

            _saveApp = await self.saveAppUnit(_src_folder, name, ifname, path, enable, pool_size, uname)
            if not _saveApp:
                logging.error(f"[{self.__class__.__name__}: {self.addAppUnit.__name__}: {datetime.now()}]: [ERROR] - Error adding application: {_err}")
                return self.controller_base.generate_response(None, 500)
            

            # _result = await self.updateAPPUConf(_src_folder, appUnit_enable, appUnit_pool_size, appUnit_uname)
            # if not _result:
            #     logging.error(f"[{self.__class__.__name__}: {self.addAppUnit.__name__}: {datetime.now()}]: [ERROR] - Error adding app unit: {_err}")
            #     return self.controller_base.generate_response(None, 500)

            # result, _err = self.app_mgr.addAppUnit(name, ip, rest_port, ws_port, zid, key, desc, enable, cid, _user_data.userType, _user_data.cid)
            # if _err:
            #     logging.error(f"[{self.__class__.__name__}: {self.addAppUnit.__name__}: {datetime.now()}]: [ERROR] - Error adding application: {_err}")
            #     return self.controller_base.generate_response(None, 500)
            # elif not result:
            #     logging.warning(f"[{self.__class__.__name__}: {self.addAppUnit.__name__}: {datetime.now()}]: [WARNING] - Application added not successfully")
            #     return self.controller_base.generate_response(None, 404)
            
            # add app unit to App Unit table

                        # add application to app unit table
            
            result, _err = await self.app_mgr.addAppUnit(zid, name, ifname, path, enable, pool_size, uname, _user_data.userType, _user_data.userName, cid)
            if _err:
                logging.error(f"[{self.__class__.__name__}: {self.addAppUnit.__name__}: {datetime.now()}]: [ERROR] - Error adding app unit: {_err}")
                return self.controller_base.generate_response(None, 500)
            elif not result:
                logging.warning(f"[{self.__class__.__name__}: {self.addAppUnit.__name__}: {datetime.now()}]: [WARNING] - App unit added not successfully")
                return self.controller_base.generate_response(None, 404)
            else:
                logging.info(f"[{self.__class__.__name__}: {self.deleteAppUnit.__name__}: {datetime.now()}]: [INFO] - Application units data deleted successfully")
                return self.controller_base.generate_response(result, 200)
            
        except Exception as _e:
            logging.error(f"[{self.__class__.__name__}: {self.addAppUnit.__name__}: {datetime.now()}]: [ERROR] - An unexpected error occurred: {str(_e)}")
            return self.controller_base.generate_response(None, 500)
       
        finally:
            # Clean up variables
            del _user_data




    async def saveAppUnit(self, file_path, name, ifname, path, enable, pool_size, uname):
        try:
            # create_directory(self.Temp_dest_folder)

            # Update the configuration with new values
            _file_path = create_path(file_path, "appconfig.json")
            _status = await self.updateAPPUConf(_file_path, name, ifname, path, enable, pool_size, uname)
            # _new_config, _status = await self.updateAPPUConf(_file_path, name, ifname, path, enable, pool_size, uname)
            if not _status:
                return False
            
            # Create the directory structure
            # _user_folder = create_path(file_path, "zappunits")
            # create_directory(_user_folder)

            _user_folder = create_path(file_path, path.split('/')[0])

            _app_name = name.split('.')[0]

            _app_folder = create_path(self.Temp_dest_folder, _app_name)

            # _src_folder = create_path(_user_folder, _app_name)

            merge_directories( _app_folder,  _user_folder)

            logging.info(f"[{self.__class__.__name__}: {self.saveAppUnit.__name__}: {datetime.now()}]: [INFO] - The {_app_name} ZAU app successfully uploaded to  location")

            remove_file(create_path(self.Temp_dest_folder, f"{_app_name}.zip")) 

            # Check if the directory exists and delete it
            remove_directory(create_path(self.Temp_dest_folder, _app_name))

            return True

        except Exception as _e:
            logging.error(f"[{self.__class__.__name__}: {self.saveAppUnit.__name__}: {datetime.now()}]: [ERROR] - Error adding application: {_e}")
            return False
        
        finally:
            # Clean up variables
            del  _user_folder, _app_name, _app_folder


    async def updateAPPUConf(self, file_path, name, ifname, path, enable, pool_size, uname):
        try:
            with open(file_path, "r") as file:
                data = json.load(file)

            # Create a new dictionary for the new "appunits" element
            new_appunit = {
                "uname": uname,
                "enable": enable,
                "pool_size": pool_size,
                "ifname": ifname,
                "path": path,
                "name": name
            }

            # Append the new "appunits" element to the list
            # data["appunits"].append(new_appunit)
            data["appunits"].append(new_appunit)

            # Write the updated data back to the JSON file
            save_file(data, file_path)

            return True

        except Exception as _e:
            logging.error(f"[{self.__class__.__name__}: {self.updateAPPUConf.__name__}: {datetime.now()}]: [ERROR] - An unexpected error occurred: {str(_e)}")
            return False
        







    async def deleteAppUnit(self, token: str, cid: int, zid: str, id: int):
        _src_folder = None
        try:
            # if any(param is None for param in( name, ip, rest_port, ws_port, zid, key, desc, enable, cid)):
            #     logging.warning(f"[{self.__class__.__name__}: {self.addAppUnit.__name__}: {datetime.now()}]: [WARNING] - Bad Request: Missing input parameter")
            #     return self.controller_base.generate_response(None, 400)
            
            _user_data, _err = self.session_mgr.get_current_user_data(token)
            if _err:
                logging.error(f"[{self.__class__.__name__}: {self.deleteAppUnit.__name__}: {datetime.now()}]: [ERROR] - Error retrieving user type: {_err}")
                return self.controller_base.generate_response(None, 500)
            if _user_data is None:
                logging.warning(f"[{self.__class__.__name__}: {self.deleteAppUnit.__name__}: {datetime.now()}]: [WARNING] - Unauthorized: Invalid access token")
                return self.controller_base.generate_response(None, 401)
            

            _app_data, _err = self.app_mgr.getAppUnit(_user_data.userType, cid, id)

            if _err:
                logging.error(f"[{self.__class__.__name__}: {self.deleteAppUnit.__name__}: {datetime.now()}]: [ERROR] - Error retrieving application units data: {_err}")
                return self.controller_base.generate_response(None, 500)
            elif not _app_data:
                logging.warning(f"[{self.__class__.__name__}: {self.deleteAppUnit.__name__}: {datetime.now()}]: [WARNING] - Application units not found")
                return self.controller_base.generate_response(None, 404)
            

            _result = await self.deleteAppUnitData(_app_data[0]['zid'], _app_data[0]['name'].split('.')[0], _app_data[0]['uname'], _app_data[0]['cname'])
            if not _result:
                logging.error(f"[{self.__class__.__name__}: {self.deleteAppUnit.__name__}: {datetime.now()}]: [ERROR] - Error adding app unit: {_err}")
                # return self.controller_base.generate_response(None, 500)


            _app_data, _err = await self.app_mgr.delAppUnit(_user_data.userType, _user_data.userName, cid, id)
            if _err:
                logging.error(f"[{self.__class__.__name__}: {self.deleteAppUnit.__name__}: {datetime.now()}]: [ERROR] - Error retrieving application units data: {_err}")
                return self.controller_base.generate_response(None, 500)
            elif not _app_data:
                logging.warning(f"[{self.__class__.__name__}: {self.deleteAppUnit.__name__}: {datetime.now()}]: [WARNING] - Application unit not found")
                return self.controller_base.generate_response(None, 404)
            else:
                logging.info(f"[{self.__class__.__name__}: {self.deleteAppUnit.__name__}: {datetime.now()}]: [INFO] - Application units data deleted successfully")
                return self.controller_base.generate_response(_app_data, 200)
    
        except Exception as _e:
            logging.error(f"[{self.__class__.__name__}: {self.addAppUnit.__name__}: {datetime.now()}]: [ERROR] - An unexpected error occurred: {str(_e)}")
            return self.controller_base.generate_response(None, 500)
       
        finally:
            # Clean up variables
            del _user_data, _app_data, _err



    async def deleteAppUnitData(self, zid, name, uname, cname):
        _dest_folder = None
        _src_folder = None
        try:
                        
            # _src_folder = create_path(self.App_dest_folder, "Apps")
            _src_folder = create_path(self.App_dest_folder, cname)
            _src_folder = create_path(_src_folder, zid)

            _file_path = create_path(_src_folder, "appconfig.json")
            _status = await self.removeAPPUConf(_file_path, uname)
            if not _status:
                return False

            _src_folder = create_path(_src_folder, "zappunits")
            _src_folder = create_path(_src_folder, name)


            _dest_folder = create_path(self.App_dest_folder, "Delete")
            create_directory(_dest_folder)

            _dest_folder = create_path(_dest_folder, cname)
            create_directory(_dest_folder)
            
            _dest_folder = create_path(_dest_folder, zid)
            create_directory(_dest_folder)

            _dest_folder = create_path(_dest_folder, "zappunits")
            create_directory(_dest_folder)
            
            _dest_folder = create_path(_dest_folder, name)
            # create_directory(_dest_folder)

            return move_directory(_src_folder, _dest_folder)
        
            

        except Exception as _e:
            logging.error(f"[{self.__class__.__name__}: {self.deleteAppData.__name__}: {datetime.now()}]: [ERROR] - Error adding application: {_e}")
            del _e
            return False
        
        finally:
            # Clean up variables
            del _src_folder, _dest_folder

    async def removeAPPUConf(self, file_path, uname):
        try:
            with open(file_path, "r") as file:
                data = json.load(file)

            appunits = [appunit for appunit in data["appunits"] if appunit['uname'] != uname]
            
            data["appunits"] = appunits
            return save_file(data, file_path)

        except Exception as _e:
            logging.error(f"[{self.__class__.__name__}: {self.deleteAppUnitData.__name__}: {datetime.now()}]: [ERROR] - An unexpected error occurred: {str(_e)}")
            return False
        finally:
            # Clean up variables
            del appunits, data
        












    async def updateAppUnit(self, token: str, zid, id, name, ifname, path, enable, pool_size, uname, cname, cid, file):
        _src_folder = None
        try:
            # if any(param is None for param in( name, ip, rest_port, ws_port, zid, key, desc, enable, cid)):
            #     logging.warning(f"[{self.__class__.__name__}: {self.addAppUnit.__name__}: {datetime.now()}]: [WARNING] - Bad Request: Missing input parameter")
            #     return self.controller_base.generate_response(None, 400)
            
            _user_data, _err = self.session_mgr.get_current_user_data(token)
            if _err:
                logging.error(f"[{self.__class__.__name__}: {self.deleteAppUnit.__name__}: {datetime.now()}]: [ERROR] - Error retrieving user type: {_err}")
                return self.controller_base.generate_response(None, 500)
            if _user_data is None:
                logging.warning(f"[{self.__class__.__name__}: {self.deleteAppUnit.__name__}: {datetime.now()}]: [WARNING] - Unauthorized: Invalid access token")
                return self.controller_base.generate_response(None, 401)
            
            #  # update app unit table
            # _app_data, _err = self.app_mgr.updateAppUnit(_user_data.userType, id, zid, uname, pool_size, ifname, path, name, enable)
            # if _err:
            #     logging.error(f"[{self.__class__.__name__}: {self.deleteAppUnit.__name__}: {datetime.now()}]: [ERROR] - Error retrieving application units data: {_err}")
            #     return self.controller_base.generate_response(None, 500)
            # elif not _app_data:
            #     logging.warning(f"[{self.__class__.__name__}: {self.deleteAppUnit.__name__}: {datetime.now()}]: [WARNING] - Application unit not found")
            #     return self.controller_base.generate_response(None, 404)
            # else:
            #     logging.info(f"[{self.__class__.__name__}: {self.deleteAppUnit.__name__}: {datetime.now()}]: [INFO] - Application units data deleted successfully")
            #     return self.controller_base.generate_response(_app_data, 200)

            _app_data, _err = self.app_mgr.getAppUnit(_user_data.userType, cid, id)
            if file:

                if _err:
                    logging.error(f"[{self.__class__.__name__}: {self.deleteAppUnit.__name__}: {datetime.now()}]: [ERROR] - Error retrieving application units data: {_err}")
                    return self.controller_base.generate_response(None, 500)
                elif not _app_data:
                    logging.warning(f"[{self.__class__.__name__}: {self.deleteAppUnit.__name__}: {datetime.now()}]: [WARNING] - Application units not found")
                    return self.controller_base.generate_response(None, 404)

                _validateZip = await extractZipFile(self, file, name, self.Temp_dest_folder)
                if not _validateZip:
                    logging.error(f"[{self.__class__.__name__}: {self.addAppUnit.__name__}: {datetime.now()}]: [ERROR] - Error adding application: {_err}")
                    return self.controller_base.generate_response(None, 500)



                _result = await self.updateAppUnitData(_app_data[0]['zid'], _app_data[0]['uname'], _app_data[0]['name'], name, uname, enable, pool_size, ifname, path, cname)
                if not _result:
                    logging.error(f"[{self.__class__.__name__}: {self.deleteAppUnit.__name__}: {datetime.now()}]: [ERROR] - Error adding app unit: {_err}")
                    return self.controller_base.generate_response(None, 500)

                # update app unit table
                _app_data, _err = await self.app_mgr.updateAppUnit(_user_data.userType, _user_data.userName,  id, zid, uname, pool_size, ifname, path, name, enable, cid)
                if _err:
                    logging.error(f"[{self.__class__.__name__}: {self.deleteAppUnit.__name__}: {datetime.now()}]: [ERROR] - Error retrieving application units data: {_err}")
                    return self.controller_base.generate_response(None, 500)
                elif not _app_data:
                    logging.warning(f"[{self.__class__.__name__}: {self.deleteAppUnit.__name__}: {datetime.now()}]: [WARNING] - Application unit not found")
                    return self.controller_base.generate_response(None, 404)
                else:
                    logging.info(f"[{self.__class__.__name__}: {self.deleteAppUnit.__name__}: {datetime.now()}]: [INFO] - Application units data deleted successfully")
                    return self.controller_base.generate_response(_app_data, 200)
            
            else:
                _result = await self.updateAppUnitData(_app_data[0]['zid'], _app_data[0]['uname'], _app_data[0]['name'], name, uname, enable, pool_size, ifname, path, cname)
                if not _result:
                    logging.error(f"[{self.__class__.__name__}: {self.deleteAppUnit.__name__}: {datetime.now()}]: [ERROR] - Error adding app unit: {_err}")
                    return self.controller_base.generate_response(None, 500)
                
                # update app unit table        user_type: str, id, zid, uname, pool_size, ifname, path, name, enable
                _app_data, _err = await self.app_mgr.updateAppUnit(_user_data.userType, _user_data.userName, id, zid, uname, pool_size, ifname, path, name, enable, cid)
                if _err:
                    logging.error(f"[{self.__class__.__name__}: {self.deleteAppUnit.__name__}: {datetime.now()}]: [ERROR] - Error retrieving application units data: {_err}")
                    return self.controller_base.generate_response(None, 500)
                elif not _app_data:
                    logging.warning(f"[{self.__class__.__name__}: {self.deleteAppUnit.__name__}: {datetime.now()}]: [WARNING] - Application unit not found")
                    return self.controller_base.generate_response(None, 404)
                else:
                    logging.info(f"[{self.__class__.__name__}: {self.deleteAppUnit.__name__}: {datetime.now()}]: [INFO] - Application units data deleted successfully")
                    return self.controller_base.generate_response(_app_data, 200)
            

        except Exception as _e:
            logging.error(f"[{self.__class__.__name__}: {self.addAppUnit.__name__}: {datetime.now()}]: [ERROR] - An unexpected error occurred: {str(_e)}")
            return self.controller_base.generate_response(None, 500)
       
        finally:
            # Clean up variables
            del _user_data, _app_data, _err



    async def updateAppUnitData(self, zid, ext_uname, ext_name, name, uname, enable, pool_size, ifname, path, cname):
        _dest_folder = None
        _src_folder = None
        try:
                        
            # _src_folder = create_path(self.App_dest_folder, "Apps")
            _src_folder = create_path(self.App_dest_folder, cname)
            _src_folder = create_path(_src_folder, zid)

            _file_path = create_path(_src_folder, "appconfig.json")
            _status = await self.editAPPUConf(_file_path, ext_uname, uname, enable, pool_size, ifname, path, name)
            if not _status:
                return False
            if not ifname:
                return True
            
            _user_folder = create_path(_src_folder, "zappunits")
            # _ex_app_name = ext_name.split('.')[0]

            _src_folder = create_path(_user_folder, ext_name.split('.')[0])


            # move app unit to edited folder
            _dest_folder = create_path(self.App_dest_folder, "Edit")
            create_directory(_dest_folder)
            
            _dest_folder = create_path(_dest_folder, cname)
            create_directory(_dest_folder)

            _dest_folder = create_path(_dest_folder, zid)
            create_directory(_dest_folder)

            _dest_folder = create_path(_dest_folder, "zappunits")
            create_directory(_dest_folder)
            _dest_folder = create_path(_dest_folder, ext_name.split('.')[0])
            # create_directory(_dest_folder)

            move_directory(_src_folder, _dest_folder)


            # save new app unit file
            _app_name = name.split('.')[0]
            _app_folder = create_path(self.Temp_dest_folder, _app_name)

            merge_directories( _app_folder,  _user_folder)

            logging.info(f"[{self.__class__.__name__}: {self.saveAppUnit.__name__}: {datetime.now()}]: [INFO] - The {_app_name} ZAU app successfully uploaded to  location")

            remove_file(create_path(self.Temp_dest_folder, f"{_app_name}.zip")) 

            # Check if the directory exists and delete it
            remove_directory(create_path(self.Temp_dest_folder, _app_name))
        
            return True
            

        except Exception as _e:
            logging.error(f"[{self.__class__.__name__}: {self.deleteAppData.__name__}: {datetime.now()}]: [ERROR] - Error adding application: {_e}")
            del _e
            return False
        
        finally:
            # Clean up variables
            del _src_folder, _dest_folder

    async def editAPPUConf(self, file_path, ext_uname, uname=None, enable=None, pool_size=None, ifname=None, path=None, name=None):
        try:
            with open(file_path, "r") as file:
                data = json.load(file)

            updates = {
                "uname": uname,
                "enable": enable,
                "pool_size": pool_size,
                "ifname": ifname,
                "path": path,
                "name": name
            }
    
            for element in data["appunits"]:
                if element['uname'] == ext_uname:
                    # Update only the keys that have valid (non-None, non-empty) values
                    for key, value in updates.items():
                        if value not in (None, ""):
                            element[key] = value
    
            # Write the updated data back to the JSON file
            return save_file(data, file_path)

        except Exception as _e:
            logging.error(f"[{self.__class__.__name__}: {self.editAPPUConf.__name__}: {datetime.now()}]: [ERROR] - An unexpected error occurred: {str(_e)}")
            return False
        