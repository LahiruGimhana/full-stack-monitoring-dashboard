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

import logging
from datetime import datetime
import cachetools
from src.controller.cacheController.sessionController import SessionController
from src.controller.base.types import UserType
from src.utilities.settings import get_config

def singleton(cls):
    instances = {}

    def get_instance(*args, **kwargs):
        if cls not in instances:
            instances[cls] = cls(*args, **kwargs)
        return instances[cls]

    return get_instance



@singleton
class AppCacheController:
    def __init__(self):
        super().__init__()
        self._app_cache = cachetools.TTLCache(maxsize=int(get_config("APP_CACHE_SIZE")), ttl=60 * 60 * 24 * 356 * 1000)
        self.session_mgr = SessionController()


    def create_app_cache(self, app_data):
        """Create or update the app cache with the provided data."""
        try:
            self._app_cache.clear()  # Clear existing cache

            for _row in app_data:
                _cid = _row['cid']

                if _cid not in self._app_cache:
                    self._app_cache[_cid] = []
                    self._app_cache[_cid].append(_row)
                else:
                    self._app_cache[_cid].append(_row)

            logging.info(f"[{self.__class__.__name__}: {self.create_app_cache.__name__}: {datetime.now()}]: [INFO] - App data stored successfully")
            return True, None

        except Exception as _e:
            logging.error(f"[{self.__class__.__name__}: {self.create_app_cache.__name__}: {datetime.now()}]: [ERROR] - An error occurred while storing app in cache: {str(_e)}")
            return None, _e


    def get_app_key(self, aid, cid):
        """Retrieve the app key from the cache."""
        try:
            _key = None
            if cid == '*':
                for _value in self._app_cache.values():
                    if isinstance(_value, list):
                        for _item in _value:
                            if isinstance(_item, dict) and _item.get('aid') == aid:
                                _key = _item.get('key')
                                break
                    elif isinstance(_value, dict) and _value.get('aid') == aid:
                        _key = _value.get('key')
                        break
            else:
                for _item in self._app_cache[cid]:
                    if _item['aid'] == aid:
                        _key = _item['key']
                        break

            if _key is None:
                logging.warning(f"[{self.__class__.__name__}: {self.get_app_key.__name__}: {datetime.now()}]: [WARNING] - App key not found in cache for aid: {aid}, cid: {cid}")
            return _key

        except Exception as _e:
            logging.error(f"[{self.__class__.__name__}: {self.get_app_key.__name__}: {datetime.now()}]: [ERROR] - An error occurred while retrieving app key from cache: {str(_e)}")
            return None

    def getAllApps(self, cid, user_type):
        """Retrieve all apps based on the user type and cid."""
        try:
            _app_data = []
            # print(self._app_cache)
            if user_type == UserType.SUPER_ADMIN.value:
                for cid, _data in self._app_cache.items():
                    if isinstance(_data, list):
                        # for item in _data:
                            # if 'key' in item:
                            #     del item['key']
                        _app_data.extend(_data)
                    else:
                        _app_data.append(_data)
                # return _app_data
                if not _app_data:
                    return []
                return [
                    {k: v for k, v in item.items() if k != 'key'}
                    for item in _app_data
                ]
            elif user_type == UserType.ADMIN.value:
                return [
                    {k: v for k, v in item.items() if k != 'key'}
                    for item in self._app_cache.get(cid, [])
                ]
            else:
                return [
                    {k: v for k, v in item.items() if k != 'key'}
                    for item in self._app_cache.get(cid, [])
                    if item['enable'] == 1
                ]
                

        except Exception as _e:
            logging.error(f"[{self.__class__.__name__}: {self.getAllApps.__name__}: {datetime.now()}]: [ERROR] - An error occurred while retrieving all apps from cache: {str(_e)}")
            return None

    def getAppById(self, app_id, cid, user_type):
        try:
            _app_data = {}
            if user_type == UserType.SUPER_ADMIN.value:
                for _data in self._app_cache.values():
                    if isinstance(_data, list):
                        for _item in _data:
                            if _item.get('aid') == app_id:
                                _app_data = _item
                                return {k: v for k, v in _app_data.items() if k != 'key'}

            elif user_type == UserType.ADMIN.value:
                # Retrieve data for a specific 'cid' and search for the app by ID
                if cid in self._app_cache:
                    for _item in self._app_cache[cid]:
                        if _item.get('aid') == app_id:
                                _app_data = _item
                                return {k: v for k, v in _app_data.items() if k != 'key'}

            else:
                # Retrieve data for a specific 'cid' and search for the app by ID if enabled
                if cid in self._app_cache:
                    for _item in self._app_cache[cid]:
                        if _item.get('aid') == app_id and _item.get('enable') == 1:
                            _app_data = _item
                            return {k: v for k, v in _app_data.items() if k != 'key'}

            # Return None or an appropriate response if the app was not found
            return None

        except Exception as e:
            # Handle exceptions (logging, re-raising, etc.)
            print(f"Error retrieving app by ID: {e}")
            return None


    def deleteAppById(self, aid: str, cid, user_type):
        """Retrieve an app by its ID based on the user type and cid."""
        _data = None
        _row = None
        try:
            if user_type == UserType.SUPER_ADMIN.value:
                for cid, _data in self._app_cache.items():
                    for index, _row in enumerate(_data):
                        if _row.get('aid') == aid:
                            del _data[index]
                            return _row
                            break
            elif user_type == UserType.ADMIN.value or user_type == UserType.USER.value:
                if cid in self._app_cache:
                    for index, _row in enumerate(self._app_cache[cid]):
                        if _row.get('aid') == aid:
                            del self._app_cache[cid][index]
                            return _row
                            break

        except Exception as _e:
            logging.error(f"[{self.__class__.__name__}: {self.deleteAppById.__name__}: {datetime.now()}]: [ERROR] - An error occurred while retrieving app by ID from cache: {str(_e)}")
            del _e
            return None

        finally:
            # Delete variables
            del _data


    def __del__(self):
        """Destructor to ensure cleanup is called."""
        


@singleton
class PortCacheController:
    def __init__(self):
        super().__init__()
        self._port_cache = cachetools.TTLCache(maxsize=3, ttl=60 * 60 * 24 * 356 * 1000)

    def create_port_cache(self, port_data):
        """Create the port cache"""
        try:
            self._port_cache.clear()  # Clear existing cache

            if port_data[0]['max_rest_port']:
                self._port_cache['ports'] = port_data
            else:
                port_data[0]['max_rest_port'] = int(get_config("REST_PORT"))
                port_data[0]['max_ws_port'] = int(get_config("WS_PORT"))
                port_data[0]['max_prof_port'] = int(get_config("PROF_PORT")) 

                self._port_cache['ports'] = port_data

                

            logging.info(f"[{self.__class__.__name__}: {self.create_port_cache.__name__}: {datetime.now()}]: [INFO] - Port data stored successfully")
            return True, None

        except Exception as _e:
            logging.error(f"[{self.__class__.__name__}: {self.create_port_cache.__name__}: {datetime.now()}]: [ERROR] - An error occurred while storing ports in cache: {str(_e)}")
            return None, _e


    def get_ports(self):
        """Retrieve all the max ports values in use."""
        try:
            ports = self._port_cache.get('ports')
            if not ports:
                port_data = [{}] 

                port_data[0]['max_rest_port'] = int(get_config("REST_PORT"))
                port_data[0]['max_ws_port'] = int(get_config("WS_PORT"))
                port_data[0]['max_prof_port'] = int(get_config("PROF_PORT"))

                self._port_cache['ports'] = port_data
                logging.info(f"[{self.__class__.__name__}: {self.get_ports.__name__}: {datetime.now()}]: [INFO] - Missing port data populated successfully")
                return self._port_cache['ports'][0], None

            return ports[0], None

        except Exception as _e:
            logging.error(f"[{self.__class__.__name__}: {self.get_ports.__name__}: {datetime.now()}]: [ERROR] - An error occurred while retrieving all ports: {str(_e)}")
            return None, _e
        
        
    def update_port_cache(self, rest_port, ws_port, prof_port):
        """Update the port cache with new ports."""
        try:
            new_port_data = {'max_rest_port': rest_port, 'max_ws_port': ws_port, 'max_prof_port':prof_port}

            self._port_cache['ports'] = [new_port_data]

            logging.info(f"[{self.__class__.__name__}: {self.update_port_cache.__name__}: {datetime.now()}]: [INFO] - Port data updated successfully")
            return True, None

        except Exception as _e:
            logging.error(f"[{self.__class__.__name__}: {self.update_port_cache.__name__}: {datetime.now()}]: [ERROR] - An error occurred while updating port data in cache: {str(_e)}")
            return None, _e

    def __del__(self):
        """Destructor to ensure cleanup is called."""
        pass  # Your cleanup logic if necessary
