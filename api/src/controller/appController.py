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
 
from datetime import datetime
import logging
import requests
from fastapi import Request
from fastapi.responses import JSONResponse
from src.controller.base.controllerBase import ControllerBase
from src.controller.base.types import ResponseModel, UserType
# from app_manager import AppManager
from src.controller.cacheController.sessionController import SessionController
from src.controller.cacheController.appCacheController import AppCacheController
from classy_fastapi import Routable
from requests.adapters import HTTPAdapter
from requests.exceptions import RequestException
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor

class AppController(Routable):
    def __init__(self, base_dir) -> None:
        super().__init__()
        self.session_mgr = SessionController()
        self.app_cache = AppCacheController()
        self.controller_base = ControllerBase()
        self.executor = ThreadPoolExecutor(max_workers=10)  # Adjust the number of workers as needed


    """
        API route to get application information.
        
        Parameters:
            aid (int): Application ID.
            ip (str): IP address of the server.
            port (int): Port number.
            token (str): Authorization header containing access token.
            
        Returns:
            JSONResponse: Response containing status code and data.
    """
    def getAppInfo(self, aid: int, ip: str, port: int, token: str):
        try:
            user_info = self.getUserData(token)
            if user_info is None:
                logging.warning(f"[{self.__class__.__name__}: {self.getAppInfo.__name__}: {datetime.now()}]: [WARNING] - Unauthorized access")
                return self.controller_base.generate_response(None, 401)
                
            _url = f"http://{ip}:{port}/info"
            # return self.sendHttpRequest(aid, _url, user_info.cid)
            future = self.executor.submit(self.sendHttpRequest, aid, _url, user_info.cid)
            response = future.result()  # Block until the thread completes
            return response

        except Exception as e:
            logging.error(f"[{self.__class__.__name__}: {self.getAppInfo.__name__}: {datetime.now()}]: [ERROR] - An unexpected error occurred: {str(e)}")
            return self.controller_base.generate_response(None, 500)

    """
        API route to get application status.
        
        Parameters:
            aid (int): Application ID.
            ip (str): IP address of the server.
            port (int): Port number.
            token (str): Authorization header containing access token.
            
        Returns:
            JSONResponse: Response containing status code and data.
    """
    def getAppStatus(self, aid: int, ip: str, port: int, token: str):
        try:
            user_info = self.getUserData(token)
            if user_info is None:
                logging.warning(f"[{self.__class__.__name__}: {self.getAppStatus.__name__}: {datetime.now()}]: [WARNING] - Unauthorized access")
                return self.controller_base.generate_response(None, 401)
                
            _url = f"http://{ip}:{port}/status"
            _aa= self.sendHttpRequest(aid, _url, user_info.cid)
            return _aa

        except Exception as e:
            logging.error(f"[{self.__class__.__name__}: {self.getAppStatus.__name__}: {datetime.now()}]: [ERROR] - An unexpected error occurred: {str(e)}")
            return self.controller_base.generate_response(None, 500)

    """
        API route for live monitoring.
        
        Parameters:
            aid (int): Application ID.
            ip (str): IP address of the server.
            port (int): Port number.
            token (str): Authorization header containing access token.
            
        Returns:
            JSONResponse: Response containing status code and data.
    """
    def liveMonitoring(self, aid: int, ip: str, port: int, token: str):
        try:
            user_info = self.getUserData(token)
            if user_info is None:
                logging.warning(f"[{self.__class__.__name__}: {self.liveMonitoring.__name__}: {datetime.now()}]: [WARNING] - Unauthorized access")
                return self.controller_base.generate_response(None, 401)
                
            _url = f"http://{ip}:{port}/live"
            return self.sendHttpRequest(aid, _url, user_info.cid)

        except Exception as e:
            logging.error(f"[{self.__class__.__name__}: {self.liveMonitoring.__name__}: {datetime.now()}]: [ERROR] - An unexpected error occurred: {str(e)}")
            return self.controller_base.generate_response(None, 500)


    """
        API route to retrieve logs.

        Parameters:
            aid (int): Application ID.
            ip (str): IP address of the server.
            port (int): Port number.
            token (str): Authorization header containing access token.

        Returns:
            JSONResponse: Response containing status code and data.
    """
    def retrieveLogs(self, aid: int, ip: str, port: int, token: str):
        try:
            user_info = self.getUserData(token)
            if user_info is None:
                logging.warning(f"[{self.__class__.__name__}: {self.retrieveLogs.__name__}: {datetime.now()}]: [WARNING] - Unauthorized access")
                return self.controller_base.generate_response(None, 401)
                
            _url = f"http://{ip}:{port}/admin/log"
            return self.sendHttpRequest(aid, _url, user_info.cid)

        except Exception as e:
            logging.error(f"[{self.__class__.__name__}: {self.retrieveLogs.__name__}: {datetime.now()}]: [ERROR] - An unexpected error occurred: {str(e)}")
            return self.controller_base.generate_response(None, 500)


    """
        API route to reload configuration.

        Parameters:
            aid (int): Application ID.
            ip (str): IP address of the server.
            port (int): Port number.
            token (str): Authorization header containing access token.

        Returns:
            JSONResponse: Response containing status code and data.
    """
    def reloadConfiguration(self, aid: int, ip: str, port: int, token: str):
        try:
            user_info = self.getUserData(token)
            if user_info.userType not in {UserType.SUPER_ADMIN.value, UserType.ADMIN.value}:
                logging.warning(f"[{self.__class__.__name__}: {self.reloadConfiguration.__name__}: {datetime.now()}]: [WARNING] - Unauthorized access")
                return self.controller_base.generate_response(None, 403)
                
            _url = f"http://{ip}:{port}/admin/config/reload"
            return self.sendHttpRequest(aid, _url, user_info.cid)

        except Exception as e:
            logging.error(f"[{self.__class__.__name__}: {self.reloadConfiguration.__name__}: {datetime.now()}]: [ERROR] - An unexpected error occurred: {str(e)}")
            return self.controller_base.generate_response(None, 500)


    """
        API route to stop WebSocket monitor.

        Parameters:
            aid (int): Application ID.
            ip (str): IP address of the server.
            port (int): Port number.
            token (str): Authorization header containing access token.

        Returns:
            JSONResponse: Response containing status code and data.
    """
    def stopWSMonitor(self, aid: int, ip: str, port: int, token: str):
        try:
            user_info = self.getUserData(token)
            # if user_info.userType not in {UserType.SUPER_ADMIN.value, UserType.ADMIN.value}:
            #     logging.warning(f"[{self.__class__.__name__}: {self.stopWSMonitor.__name__}: {datetime.now()}]: [WARNING] - Unauthorized access")
            #     return self.controller_base.generate_response(None, 403)
                
            _url = f"http://{ip}:{port}/admin/monitor/stop"
            return self.sendHttpRequest(aid, _url, user_info.cid)

        except Exception as e:
            logging.error(f"[{self.__class__.__name__}: {self.stopWSMonitor.__name__}: {datetime.now()}]: [ERROR] - An unexpected error occurred: {str(e)}")
            return self.controller_base.generate_response(None, 500)


    """
        API route to start WebSocket monitor.

        Parameters:
            aid (int): Application ID.
            ip (str): IP address of the server.
            port (int): Port number.
            token (str): Authorization header containing access token.

        Returns:
            JSONResponse: Response containing status code and data.
    """
    def startWSMonitor(self, aid: int, ip: str, port: int, token: str):
        try:
            user_info = self.getUserData(token)
            # if user_info.userType not in {UserType.SUPER_ADMIN.value, UserType.ADMIN.value}:
            #     logging.warning(f"[{self.__class__.__name__}: {self.startWSMonitor.__name__}: {datetime.now()}]: [WARNING] - Unauthorized access")
            #     return self.controller_base.generate_response(None, 403)
                
            _url = f"http://{ip}:{port}/admin/monitor/start"
            return self.sendHttpRequest(aid, _url, user_info.cid)

        except Exception as e:
            logging.error(f"[{self.__class__.__name__}: {self.startWSMonitor.__name__}: {datetime.now()}]: [ERROR] - An unexpected error occurred: {str(e)}")
            return self.controller_base.generate_response(None, 500)


    """
        API route to stop profiler.

        Parameters:
            aid (int): Application ID.
            ip (str): IP address of the server.
            port (int): Port number.
            token (str): Authorization header containing access token.

        Returns:
            JSONResponse: Response containing status code and data.
    """
    def stopProfiler(self, aid: int, ip: str, port: int, token: str):
        try:
            user_info = self.getUserData(token)
            if user_info.userType not in {UserType.SUPER_ADMIN.value, UserType.ADMIN.value}:
                logging.warning(f"[{self.__class__.__name__}: {self.stopProfiler.__name__}: {datetime.now()}]: [WARNING] - Unauthorized access")
                return self.controller_base.generate_response(None, 403)
                
            _url = f"http://{ip}:{port}/admin/profiler/stop"
            return self.sendHttpRequest(aid, _url, user_info.cid)

        except Exception as e:
            logging.error(f"[{self.__class__.__name__}: {self.stopProfiler.__name__}: {datetime.now()}]: [ERROR] - An unexpected error occurred: {str(e)}")
            return self.controller_base.generate_response(None, 500)


    """
        API route to start profiler.

        Parameters:
            aid (int): Application ID.
            ip (str): IP address of the server.
            port (int): Port number.
            token (str): Authorization header containing access token.

        Returns:
            JSONResponse: Response containing status code and data.
    """
    def startProfiler(self, aid: int, ip: str, port: int, token: str):
        try:
            user_info = self.getUserData(token)
            if user_info.userType not in {UserType.SUPER_ADMIN.value, UserType.ADMIN.value}:
                logging.warning(f"[{self.__class__.__name__}: {self.startProfiler.__name__}: {datetime.now()}]: [WARNING] - Unauthorized access")
                return self.controller_base.generate_response(None, 403)
                
            _url = f"http://{ip}:{port}/admin/profiler/start"
            return self.sendHttpRequest(aid, _url, user_info.cid)

        except Exception as e:
            logging.error(f"[{self.__class__.__name__}: {self.startProfiler.__name__}: {datetime.now()}]: [ERROR] - An unexpected error occurred: {str(e)}")
            return self.controller_base.generate_response(None, 500)


    """
        API route to save configuration.

        Parameters:
            aid (int): Application ID.
            ip (str): IP address of the server.
            port (int): Port number.
            token (str): Authorization header containing access token.

        Returns:
            JSONResponse: Response containing status code and data.
    """
    def saveConfiguration(self, aid: int, ip: str, port: int, token: str):
        try:
            user_info = self.getUserData(token)
            if user_info.userType not in {UserType.SUPER_ADMIN.value, UserType.ADMIN.value}:
                logging.warning(f"[{self.__class__.__name__}: {self.saveConfiguration.__name__}: {datetime.now()}]: [WARNING] - Unauthorized access")
                return self.controller_base.generate_response(None, 403)
                
            _url = f"http://{ip}:{port}/admin/config/save"
            return self.sendHttpRequest(aid, _url, user_info.cid)

        except Exception as e:
            logging.error(f"[{self.__class__.__name__}: {self.saveConfiguration.__name__}: {datetime.now()}]: [ERROR] - An unexpected error occurred: {str(e)}")
            return self.controller_base.generate_response(None, 500)



    """
        Check user type based on the provided authorization header.

        Parameters:
            token (str): Authorization header containing access token.

        Returns:
            UserType: Type of user (SUPER_ADMIN, ADMIN, etc.).
    """

    def getUserData(self, token: str):
        try:
            user_info, _err = self.session_mgr.get_current_user_data(token)
            if _err:
                logging.error(f"[{self.__class__.__name__}: {self.getUserData.__name__}: {datetime.now()}]: [ERROR] - Error retrieving user type: {_err}")
                return None
            if user_info is None:
                logging.warning(f"[{self.__class__.__name__}: {self.getUserData.__name__}: {datetime.now()}]: [WARNING] - Unauthorized access")
                return None
            return user_info
    
        except Exception as e:
            logging.error(f"[{self.__class__.__name__}: {self.getUserData.__name__}: {datetime.now()}]: [ERROR] - An unexpected error occurred: {str(e)}")
            return None


    """
        Send HTTP request to the specified URL with the given parameters.

        Parameters:
            aid (int): Application ID.
            _url (str): URL for the HTTP request.
            token (str): Authorization header containing access token.

        Returns:
            JSONResponse: Response containing status code and data.
    """
    def sendHttpRequest(self, aid: int, _url: str, cid: int):
        # try:
        #     _key = self.app_cache.get_app_key(aid, cid)
        #     if _key is None:
        #         logging.warning(f"[{self.__class__.__name__}: {self.sendHttpRequest.__name__}: {datetime.now()}]: [WARNING] - Application key not found")
        #         return self.controller_base.generate_response(None, 404)

            # headers = {"apikey": _key}
            # _response = requests.get(_url, headers=headers)

            # if _response.status_code == 200:
            #     logging.info(f"[{self.__class__.__name__}: {self.sendHttpRequest.__name__}: {datetime.now()}]: [INFO] - Data retrieved successfully from the external server. Status code: {_response.status_code}")
            #     return self.controller_base.generate_response(_response.json(), 200)
            # else:
            #     logging.error(f"[{self.__class__.__name__}: {self.sendHttpRequest.__name__}: {datetime.now()}]: [ERROR] - Failed to retrieve data from the external server. Status code: {_response.status_code}")
            #     return self.controller_base.generate_response(None, 500)


        try:
            _key = self.app_cache.get_app_key(aid, cid)
            if _key is None:
                logging.warning(f"[{self.__class__.__name__}: {self.sendHttpRequest.__name__}: {datetime.now()}]: [WARNING] - Application key not found")
                return self.controller_base.generate_response(None, 404)
        
            headers = {"apikey": _key}
            _response = requests.get(_url, headers=headers, timeout=5)  # Add a timeout
            
            if _response.status_code == 200:
                logging.info(f"[{self.__class__.__name__}: {self.sendHttpRequest.__name__}: {datetime.now()}]: [INFO] - Data retrieved successfully from the external server. Status code: {_response.status_code}")
                return self.controller_base.generate_response(_response.json(), 200)
            else:
                logging.error(f"[{self.__class__.__name__}: {self.sendHttpRequest.__name__}: {datetime.now()}]: [ERROR] - Failed to retrieve data from the external server. Status code: {_response.status_code}")
                return self.controller_base.generate_response(None, 500)
        
        except RequestException as e:
            logging.error(f"[{self.__class__.__name__}: {self.sendHttpRequest.__name__}: {datetime.now()}]: [ERROR] - Connection error: {str(e)}")
            return self.controller_base.generate_response(None, 500)
        
        except Exception as e:
            logging.error(f"[{self.__class__.__name__}: {self.sendHttpRequest.__name__}: {datetime.now()}]: [ERROR] - An unexpected error occurred: {str(e)}")
            return self.controller_base.generate_response(None, 500)
    
        # except Exception as e:
        #     logging.error(f"[{self.__class__.__name__}: {self.sendHttpRequest.__name__}: {datetime.now()}]: [ERROR] - An unexpected error occurred: {str(e)}")
        #     return self.controller_base.generate_response(None, 500)
