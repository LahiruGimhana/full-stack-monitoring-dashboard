#######################################################################################################
# Author        :   K.G.Lahiru GImhana Dayananda  | 19/03/2024
# Copyright     :   Zaion.AI 2024
# Class/module  :   Summary REST API and UI
# Objective     :   Create the FastAPI server API endpoints
#######################################################################################################
# Author                        Date        Action      Description
#------------------------------------------------------------------------------------------------------
# K.G.Lahiru GImhana Dayananda  19/03/2024  Created     Created the initial version
#

# #######################################################################################################

import logging
from datetime import datetime
from typing import Optional
from passlib.context import CryptContext
import cachetools
import secrets
from src.controller.base.types import UserInfoModel, UserType
from src.utilities.settings import  get_config
# Some basic configuration



def singleton(cls):
    instances = {}

    def get_instance():
        if cls not in instances:
            instances[cls] = cls()
        return instances[cls]

    return get_instance

@singleton
class SessionController:
    def __init__(self):
        # AUTH_CACHE_EXPIRE_MINUTES =  get_config("AUTH_CACHE_EXPIRE_MINUTES")
        # CACHE_MAX_SIZE = get_config("CACHE_MAX_SIZE")
        self.token_cache = cachetools.TTLCache(maxsize=int(get_config("CACHE_MAX_SIZE")), ttl=int(get_config("AUTH_TOKEN_EXPIRE_MINUTES")) * 60)  

    """Verifies the type of authentication token."""
    def verify_auth_token_type(self, token):
        try:
            _token_type, _, _token = token.partition(" ")
            if _token_type != "Bearer":
                logging.warning(f"[{self.__class__.__name__}: {self.verify_auth_token_type.__name__}: {datetime.now()}]: [WARNING] - Invalid user authentication: Missing or invalid token type")
                return False, None
            return True, _token
        except Exception as _e:
            logging.error(f"[{self.__class__.__name__}: {self.verify_auth_token_type.__name__}: {datetime.now()}]: [ERROR] - An error occurred while verifying token type: {str(_e)}")
            return False, None

    """Verifies the authentication token."""
    def verify_auth_token(self, token):
        try:
            _user_info = self.token_cache.get(token)
            if _user_info:
                logging.info(f"[{self.__class__.__name__}: {self.verify_auth_token.__name__}: {datetime.now()}]: [INFO] - Authentication token verified successfully")
                return True, None
            else:
                logging.warning(f"[{self.__class__.__name__}: {self.verify_auth_token.__name__}: {datetime.now()}]: [WARNING] - Authentication token not found")
                return False, None
        except Exception as _e:
            logging.error(f"[{self.__class__.__name__}: {self.verify_auth_token.__name__}: {datetime.now()}]: [ERROR] - An error occurred while verifying authentication token: {str(_e)}")
            return False, _e

    """Verifies the authentication token and retrieves the user data."""
    def get_current_user_data(self, token: str) -> Optional[str]:
        try:
            # print(self.token_cache)
            _user_info = self.token_cache.get(token)
            if _user_info is None:
                logging.warning(f"[{self.__class__.__name__}: {self.get_current_user_data.__name__}: {datetime.now()}]: [WARNING] - Token not found in cache")
                return None, None
            logging.info(f"[{self.__class__.__name__}: {self.get_current_user_data.__name__}: {datetime.now()}]: [INFO] - User data retrieved successfully")
            return _user_info, None
        except KeyError as _e:
            logging.error(f"[{self.__class__.__name__}: {self.get_current_user_data.__name__}: {datetime.now()}]: [ERROR] - KeyError: {str(_e)}")
            return None, _e
        except Exception as _e:
            logging.error(f"[{self.__class__.__name__}: {self.get_current_user_data.__name__}: {datetime.now()}]: [ERROR] - An error occurred while retrieving user data: {str(_e)}")
            return None, _e



    """Revokes the authentication token for a user."""
    def remove_auth_token(self, token: str):
        try:
            logging.info(f"[{self.__class__.__name__}: {self.remove_auth_token.__name__}: {datetime.now()}]: [INFO] - Revoking authentication token for user")
            if token in self.token_cache:
                del self.token_cache[token]
                logging.info(f"[{self.__class__.__name__}: {self.remove_auth_token.__name__}: {datetime.now()}]: [INFO] - Authentication token revoked successfully")
                return True, None
            else:
                logging.warning(f"[{self.__class__.__name__}: {self.remove_auth_token.__name__}: {datetime.now()}]: [WARNING] - Authentication token not found")
                return False, None
        except Exception as _e:
            logging.error(f"[{self.__class__.__name__}: {self.remove_auth_token.__name__}: {datetime.now()}]: [ERROR] - An error occurred while revoking authentication token: {str(_e)}")
            return False, _e

    """Generates an authentication token for a user."""
    def create_auth_token(self, user_data):
        try:
            _auth_token = secrets.token_urlsafe(32)
            _user_info = UserInfoModel(uid=user_data["uid"], userName=user_data["name"], email=user_data["email"], userType=user_data["utid"], cid=user_data["cid"])
            self.token_cache[_auth_token] = _user_info
            logging.info(f"[{self.__class__.__name__}: {self.create_auth_token.__name__}: {datetime.now()}]: [INFO] - Authentication token generated successfully")
            return _auth_token, None
        except Exception as _e:
            logging.error(f"[{self.__class__.__name__}: {self.create_auth_token.__name__}: {datetime.now()}]: [ERROR] - An error occurred while generating authentication token: {str(_e)}")
            return None, _e


    """Extends the expiry of an authentication token."""
    def extend_auth_token_expiry(self, auth_token):
        try:
            # Get the user info associated with the token
            _user_info = self.token_cache.pop(auth_token)
            # Re-insert the user info with the same token, effectively resetting the TTL
            self.token_cache[auth_token] = _user_info
            logging.info(f"[{self.__class__.__name__}: {self.extend_auth_token_expiry.__name__}: {datetime.now()}]: [INFO] - Authentication token expiry extended successfully")
            return True
        except KeyError:
            logging.error(f"[{self.__class__.__name__}: {self.extend_auth_token_expiry.__name__}: {datetime.now()}]: [ERROR] - Authentication token not found")
            return False
        except Exception as _e:
            logging.error(f"[{self.__class__.__name__}: {self.extend_auth_token_expiry.__name__}: {datetime.now()}]: [ERROR] - An error occurred while extending authentication token expiry: {str(_e)}")
            return False


# @singleton
# class AppCache:
#     def __init__(self):
#         super().__init__()
#         self._app_cache = cachetools.TTLCache(maxsize=CACHE_MAX_SIZE, ttl=60 * 60 * 24 * 356 * 1000)
#         self.session_mgr = SessionController()


#     def create_app_cache(self, app_data):
#         """Create or update the app cache with the provided data."""
#         try:
#             self._app_cache.clear()  # Clear existing cache

#             for _row in app_data:
#                 _cid = _row['cid']

#                 if _cid not in self._app_cache:
#                     self._app_cache[_cid] = []
#                     self._app_cache[_cid].append(_row)
#                 else:
#                     # if isinstance(self._app_cache[_cid], dict):
#                     self._app_cache[_cid].append(_row)
#                     # else:
#                         # self._app_cache[_cid].append(_row)


#             # print(self._app_cache)
#             logging.info(f"[{self.__class__.__name__}: {self.create_app_cache.__name__}: {datetime.now()}]: [INFO] - App data stored successfully")
#             return True, None

#         except Exception as _e:
#             logging.error(f"[{self.__class__.__name__}: {self.create_app_cache.__name__}: {datetime.now()}]: [ERROR] - An error occurred while storing app in cache: {str(_e)}")
#             return None, _e


#     # def create_app_cache(self, app_data):
#     #     """Create or update the app cache with the provided data."""
#     #     try:
#     #         self._app_cache.clear()  # Clear existing cache

#     #         for _row in app_data:
#     #             _cid = _row['cid']

#     #             if _cid not in self._app_cache:
#     #                 self._app_cache[_cid] = _row
#     #             else:
#     #                 if isinstance(self._app_cache[_cid], dict):
#     #                     self._app_cache[_cid] = [self._app_cache[_cid], _row]
#     #                 else:
#     #                     self._app_cache[_cid].append(_row)

#     #         logging.info(f"[{self.__class__.__name__}: {self.create_app_cache.__name__}: {datetime.now()}]: [INFO] - App data stored successfully")
#     #         return True, None

#     #     except Exception as _e:
#     #         logging.error(f"[{self.__class__.__name__}: {self.create_app_cache.__name__}: {datetime.now()}]: [ERROR] - An error occurred while storing app in cache: {str(_e)}")
#     #         return None, _e

#     def get_app_key(self, aid, cid):
#         """Retrieve the app key from the cache."""
#         try:
#             _key = None
#             if cid == '*':
#                 for _value in self._app_cache.values():
#                     if isinstance(_value, list):
#                         for _item in _value:
#                             if isinstance(_item, dict) and _item.get('aid') == aid:
#                                 _key = _item.get('key')
#                                 break
#                     elif isinstance(_value, dict) and _value.get('aid') == aid:
#                         _key = _value.get('key')
#                         break
#             else:
#                 for _item in self._app_cache[cid]:
#                     if _item['aid'] == aid:
#                         _key = _item['key']
#                         break

#             if _key is None:
#                 logging.warning(f"[{self.__class__.__name__}: {self.get_app_key.__name__}: {datetime.now()}]: [WARNING] - App key not found in cache for aid: {aid}, cid: {cid}")
#             return _key

#         except Exception as _e:
#             logging.error(f"[{self.__class__.__name__}: {self.get_app_key.__name__}: {datetime.now()}]: [ERROR] - An error occurred while retrieving app key from cache: {str(_e)}")
#             return None

#     def getAllApps(self, cid, user_type):
#         """Retrieve all apps based on the user type and cid."""
#         try:
#             _app_data = []
#             # print(self._app_cache)
#             if user_type == UserType.SUPER_ADMIN:
#                 for cid, _data in self._app_cache.items():
#                     if isinstance(_data, list):
#                         # for item in _data:
#                             # if 'key' in item:
#                             #     del item['key']
#                         _app_data.extend(_data)
#                     else:
#                         _app_data.append(_data)
#                 return _app_data
#             elif user_type == UserType.ADMIN or user_type == UserType.USER:
#                 return self._app_cache[cid]

#         except Exception as _e:
#             logging.error(f"[{self.__class__.__name__}: {self.getAllApps.__name__}: {datetime.now()}]: [ERROR] - An error occurred while retrieving all apps from cache: {str(_e)}")
#             return None

#     def getAppById(self, aid: str, cid, user_type):
#         """Retrieve an app by its ID based on the user type and cid."""
#         _data = None
#         _row = None
#         try:
#             if user_type == UserType.SUPER_ADMIN:
#                 for cid, _data in self._app_cache.items():
#                     for index, _row in enumerate(_data):
#                         if _row.get('aid') == aid:
#                             del _data[index]
#                             return _row
#                             break
#             elif user_type == UserType.ADMIN or user_type == UserType.USER:
#                 if cid in self._app_cache:
#                     for index, _row in enumerate(self._app_cache[cid]):
#                         if _row.get('aid') == aid:
#                             del _data[index]
#                             return _row
#                             break

#         except Exception as _e:
#             logging.error(f"[{self.__class__.__name__}: {self.getAppById.__name__}: {datetime.now()}]: [ERROR] - An error occurred while retrieving app by ID from cache: {str(_e)}")
#             del _e
#             return None

#         finally:
#             # Delete variables
#             del _data


#     def __del__(self):
#         """Destructor to ensure cleanup is called."""
        