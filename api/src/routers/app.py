#######################################################################################################
#Author        :   K.G.Lahiru GImhana Dayananda  | 19/03/2024
#Copyright     :   Zaion.AI 2024
#Class/module  :   Agent assist monitoring REST API
#Objective     :   Create the FastAPI server API endpoints
#######################################################################################################
#Author                        Date        Action      Description
#------------------------------------------------------------------------------------------------------
#K.G.Lahiru GImhana Dayananda  19/03/2024  Created     Created the initial version
#

########################################################################################################

#from urllib.request import Request
import asyncio
from datetime import datetime
import logging
from classy_fastapi import Routable, post, delete, post, put
from fastapi import HTTPException, APIRouter, Request
from fastapi.responses import JSONResponse
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from src.routers.base.routeBase import ResponseModel, App, RouteBase
from src.controller.appController import AppController
# from appController import AppController

class AppRoute(Routable):
    def __init__(self, base_dir) -> None:
        super().__init__()
        self.appController = AppController(base_dir)
        self.security = HTTPBearer()
        self.routeBase = RouteBase()
        
    """ API route to retrieve app info """ 
    @post("/{aid}/info", response_model = ResponseModel)
    async def get_app_info(self, aid: int, app: App, req: Request):
        # if any(param is None for param in (aid,)):
        #     logging.warning(f"[{self.__class__.__name__}: {self.get_app_info.__name__}: {datetime.now()}]: [WARNING] - Bad Request: Missing input parameter")
        #     return self.routeBase.generate_response(None, 400)
        _token = self.routeBase.verify_auth_token_type(req.headers["authorization"])
        if _token is None:
            return self.routeBase.generate_response(None, 401)
        
        # return self.appController.getAppInfo(aid, app.ip, app.rest_port, _token)
        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(None, self.appController.getAppInfo, aid, app.ip, app.rest_port, _token)
        return response
        
    """ API route to retrieve app """ 
    @post("/{aid}/status", response_model = ResponseModel)
    def get_app_status(self, aid: int, app: App, req: Request):
        # if any(param is None for param in (aid,)):
        #     logging.warning(f"[{self.__class__.__name__}: {self.get_app_status.__name__}: {datetime.now()}]: [WARNING] - Bad Request: Missing input parameter")
        #     return self.routeBase.generate_response(None, 400)
        _token = self.routeBase.verify_auth_token_type(req.headers["authorization"])
        if _token is None:
            return self.routeBase.generate_response(None, 401)
        else:
            return self.appController.getAppStatus(aid, app.ip, app.rest_port, _token)

        

    """ API route for live monitoring """ 
    @post("/{aid}/live", response_model=ResponseModel)
    def live_monitoring(self, aid: int, app: App, req: Request):
        # if any(param is None for param in (aid,)):
        #     logging.warning(f"[{self.__class__.__name__}: {self.live_monitoring.__name__}: {datetime.now()}]: [WARNING] - Bad Request: Missing input parameter")
        #     return self.routeBase.generate_response(None, 400)
        _token = self.routeBase.verify_auth_token_type(req.headers["authorization"])
        if _token is None:
            return self.routeBase.generate_response(None, 401)
        else:
            return self.appController.liveMonitoring(aid, app.ip, app.rest_port, _token)

        

    """ API route to retrieve logs """ 
    @post("/{aid}/logs", response_model=ResponseModel)
    def retrieve_logs(self, aid: int, app: App, req: Request):
        # if any(param is None for param in (aid,)):
        #     logging.warning(f"[{self.__class__.__name__}: {self.retrieve_logs.__name__}: {datetime.now()}]: [WARNING] - Bad Request: Missing input parameter")
        #     return self.routeBase.generate_response(None, 400)
        _token = self.routeBase.verify_auth_token_type(req.headers["authorization"])
        if _token is None:
            return self.routeBase.generate_response(None, 401)
        else:
            return self.appController.retrieveLogs(aid, app.ip, app.rest_port, _token)

        

    """ API route to reload configuration """ 
    @post("/{aid}/config-reload", response_model=ResponseModel)
    def reload_configuration(self, aid: int, app: App, req: Request):
        # if any(param is None for param in (aid,)):
        #     logging.warning(f"[{self.__class__.__name__}: {self.reload_configuration.__name__}: {datetime.now()}]: [WARNING] - Bad Request: Missing input parameter")
        #     return self.routeBase.generate_response(None, 400)
        _token = self.routeBase.verify_auth_token_type(req.headers["authorization"])
        if _token is None:
            return self.routeBase.generate_response(None, 401)
        else:
            return self.appController.reloadConfiguration(aid, app.ip, app.rest_port, _token)

        

    """ API route to stop WSMonitor """ 
    @post("/{aid}/WSMonitor-stop", response_model=ResponseModel)
    def stop_WSMonitor(self, aid: int, app: App, req: Request):
        # if any(param is None for param in (aid,)):
        #     logging.warning(f"[{self.__class__.__name__}: {self.stop_WSMonitor.__name__}: {datetime.now()}]: [WARNING] - Bad Request: Missing input parameter")
        #     return self.routeBase.generate_response(None, 400)
        _token = self.routeBase.verify_auth_token_type(req.headers["authorization"])
        if _token is None:
            return self.routeBase.generate_response(None, 401)
        else:
            return self.appController.stopWSMonitor(aid, app.ip, app.rest_port, _token)


    """ API route to start WSMonitor """ 
    @post("/{aid}/WSMonitor-start", response_model=ResponseModel)
    def start_WSMonitor(self, aid: int, app: App, req: Request):
        # if any(param is None for param in (aid,)):
        #     logging.warning(f"[{self.__class__.__name__}: {self.start_WSMonitor.__name__}: {datetime.now()}]: [WARNING] - Bad Request: Missing input parameter")
        #     return self.routeBase.generate_response(None, 400)
        _token = self.routeBase.verify_auth_token_type(req.headers["authorization"])
        if _token is None:
            return self.routeBase.generate_response(None, 401)
        else:
            return self.appController.startWSMonitor(aid, app.ip, app.rest_port, _token)


    """ API route to stop Profiler """ 
    @post("/{aid}/Profiler-stop", response_model=ResponseModel)
    def stop_profiler(self, aid: int, app: App, req: Request):
        # if any(param is None for param in (aid,)):
        #     logging.warning(f"[{self.__class__.__name__}: {self.stop_profiler.__name__}: {datetime.now()}]: [WARNING] - Bad Request: Missing input parameter")
        #     return self.routeBase.generate_response(None, 400)
        _token = self.routeBase.verify_auth_token_type(req.headers["authorization"])
        if _token is None:
            return self.routeBase.generate_response(None, 401)
        else:
            return self.appController.stopProfiler(aid, app.ip, app.rest_port, _token)


    """ API route to start Profiler """ 
    @post("/{aid}/Profiler-start", response_model=ResponseModel)
    def start_profiler(self, aid: int, app: App, req: Request):
        # if any(param is None for param in (aid,)):
        #     logging.warning(f"[{self.__class__.__name__}: {self.start_profiler.__name__}: {datetime.now()}]: [WARNING] - Bad Request: Missing input parameter")
        #     return self.routeBase.generate_response(None, 400)
        _token = self.routeBase.verify_auth_token_type(req.headers["authorization"])
        if _token is None:
            return self.routeBase.generate_response(None, 401)
        else:
            return self.appController.startProfiler(aid, app.ip, app.rest_port, _token)


    """ API route to save configuration """ 
    @post("/{aid}/config-save", response_model=ResponseModel)
    def save_configuration(self, aid: int, app: App, req: Request):
        # if any(param is None for param in (aid,)):
        #     logging.warning(f"[{self.__class__.__name__}: {self.save_configuration.__name__}: {datetime.now()}]: [WARNING] - Bad Request: Missing input parameter")
        #     return self.routeBase.generate_response(None, 400)
        _token = self.routeBase.verify_auth_token_type(req.headers["authorization"])
        if _token is None:
            return self.routeBase.generate_response(None, 401)
        else:
            return self.appController.saveConfiguration(aid, app.ip, app.rest_port, _token)
        


