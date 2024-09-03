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

# from urllib.request import Request
from datetime import datetime
import json
import logging
from classy_fastapi import Routable, get, delete, post, put
from fastapi import Form, HTTPException, APIRouter, Query, Request, UploadFile, File
from fastapi.responses import JSONResponse
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from src.routers.base.routeBase import Appunit, ResponseModel, ApplicationModel, RouteBase
from src.controller.applicationController import ApplicationController
from src.controller.appUnitController import AppUnitController
# from applicationController import ApplicationController

# from routes.base.routeBase import ResponseModel
class ApplicationRoute(Routable):
    def __init__(self, base_dir, configuration) -> None:
        super().__init__()
        self.appController = ApplicationController(base_dir, configuration)
        self.appUnitController = AppUnitController(base_dir, configuration)
        self.security = HTTPBearer()
        self.routeBase = RouteBase()
        
    """API route to retrieve all apps.

    Args:
        req (Request): The HTTP request.

    Returns:
        ResponseModel: A response containing the list of apps.
    """
    @get("/", response_model=ResponseModel)
    async def get_all_apps(self, req: Request):
        try:
            logging.info(f"[{self.__class__.__name__}: {self.get_all_apps.__name__}: {datetime.now()}]: [INFO] - Retrieving all apps")
            _token = self.routeBase.verify_auth_token_type(req.headers["authorization"])

            if _token is not None:
                return self.appController.getApps(_token)
            else:
                return self.routeBase.generate_response(None, 401)

        except Exception as e:
            logging.error(f"[{self.__class__.__name__}: {self.get_all_apps.__name__}: {datetime.now()}]: [ERROR] - An error occurred: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal Server Error")

        finally:
            del _token

    """API route to retrieve a specific application.

    Args:
        aid (int): The application ID.
        req (Request): The HTTP request.

    Returns:
        ResponseModel: A response containing the application details.
    """
    @get("/{aid:int}", response_model=ResponseModel)
    def get_app(self, aid: int, req: Request):
        try:
            logging.info(f"[{self.__class__.__name__}: {self.get_app.__name__}: {datetime.now()}]: [INFO] - Retrieving application with AID: {aid}")
            _token = self.routeBase.verify_auth_token_type(req.headers["authorization"])

            if _token is not None:
                return self.appController.getApp(aid, _token)
            else:
                return self.routeBase.generate_response(None, 401)

        except Exception as e:
            logging.error(f"[{self.__class__.__name__}: {self.get_app.__name__}: {datetime.now()}]: [ERROR] - An error occurred: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal Server Error")

        finally:
            del _token

    """API route to add a new application.

    Args:
        application (ApplicationModel): The application details.
        req (Request): The HTTP request.

    Returns:
        ResponseModel: A response containing the result of the operation.
    """
    @post("/", response_model=ResponseModel)
    async def add_app(self, req: Request, appunit_data: str = Form(...),  file: UploadFile = File(...)):
        try:
            logging.info(f"[{self.__class__.__name__}: {self.add_app.__name__}: {datetime.now()}]: [INFO] - Adding a new application")
            _token = self.routeBase.verify_auth_token_type(req.headers["authorization"])

            _application_data = ApplicationModel.parse_raw(appunit_data)

            _data = json.loads(appunit_data)
            _appunits_data = _data.get("appunits")
            _appUnit_data = Appunit.parse_obj(_appunits_data)

            if _token is not None:
                return await self.appController.addApp(_application_data.name, _application_data.ip, _application_data.rest_port, _application_data.ws_port, _application_data.prof_port, _application_data.zid, _application_data.key, _application_data.desc, _application_data.enable, _application_data.cid, _application_data.version, _token, _appUnit_data.name, _appUnit_data.ifname, _appUnit_data.path, _appUnit_data.enable, _appUnit_data.pool_size, _appUnit_data.uname, _appUnit_data.cname, file)
            else:
                return self.routeBase.generate_response(None, 401)

        except Exception as e:
            logging.error(f"[{self.__class__.__name__}: {self.add_app.__name__}: {datetime.now()}]: [ERROR] - An error occurred: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal Server Error")
        
        finally:
            _application_data, _data, _appunits_data, _appUnit_data

    """API route to update an existing application.

    Args:
        aid (int): The application ID.
        application (ApplicationModel): The updated application details.
        req (Request): The HTTP request.

    Returns:
        ResponseModel: A response containing the result of the operation.
    """
    @put("/{aid}", response_model=ResponseModel)
    async def update_app(self, aid:int, application: ApplicationModel, req:Request):
        try:
            logging.info(f"[{self.__class__.__name__}: {self.update_app.__name__}: {datetime.now()}]: [INFO] - Updating application with AID: {aid}")
            _token = self.routeBase.verify_auth_token_type(req.headers["authorization"])
            
            if _token is not None:
                return self.appController.updateApp(aid, application.name, application.ip, application.rest_port, application.ws_port, application.zid, application.key, application.desc, application.enable, application.cid, _token)
            else:
                return self.routeBase.generate_response(None, 401)

        except Exception as e:
            logging.error(f"[{self.__class__.__name__}: {self.update_app.__name__}: {datetime.now()}]: [ERROR] - An error occurred: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal Server Error")

        finally:
            del _token

    """API route to delete an application.

    Args:
        aid (int): The application ID.
        req (Request): The HTTP request.

    Returns:
        ResponseModel: A response containing the result of the operation.
    """
    @delete("/{cid}/{aid}", response_model=ResponseModel)
    async def delete_app(self, cid: int, aid: int, req: Request):
        try:
            logging.info(f"[{self.__class__.__name__}: {self.delete_app.__name__}: {datetime.now()}]: [INFO] - Deleting application with AID: {aid}")
            _token = self.routeBase.verify_auth_token_type(req.headers["authorization"])

            if _token is not None:
                return await self.appController.deleteApp(cid, aid, _token)
            else:
                return self.routeBase.generate_response(None, 401)

        except Exception as e:
            logging.error(f"[{self.__class__.__name__}: {self.delete_app.__name__}: {datetime.now()}]: [ERROR] - An error occurred: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Internal Server Error {str(e)}")
        finally:
            del _token


    """API route to retrieve all apps.

    Args:
        req (Request): The HTTP request.

    Returns:
        ResponseModel: A response containing the list of apps.
    """
    @get("/ports", response_model=ResponseModel)
    async def get_ports(self, req: Request):
        try:
            logging.info(f"[{self.__class__.__name__}: {self.get_ports.__name__}: {datetime.now()}]: [INFO] - Retrieving zau listining last ports")

            return self.appController.getPorts()


        except Exception as e:
            logging.error(f"[{self.__class__.__name__}: {self.get_ports.__name__}: {datetime.now()}]: [ERROR] - An error occurred: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal Server Error")



    """API route to deploy application.

    Args:
        req (Request): The HTTP request.

    Returns:
        ResponseModel: A response containing the status.
    """
    @get("/start")
    async def start_app(self, req: Request, cname: str = Query(...), zid: str = Query(...)):
        try:
            logging.info(f"[{self.__class__.__name__}: {self.start_app.__name__}: {datetime.now()}]: [INFO] - Start (deploy) the application")
            _token = self.routeBase.verify_auth_token_type(req.headers["authorization"])

            if _token is not None:
                return await self.appController.startApp(_token, cname, zid)
            else:
                return self.routeBase.generate_response(None, 401)


        except Exception as e:
            logging.error(f"[{self.__class__.__name__}: {self.get_ports.__name__}: {datetime.now()}]: [ERROR] - An error occurred: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal Server Error")











    # app Units
    """API route to get an app unit.

    Args:
        zid (int): The z app ID.
        req (Request): The HTTP request.

    Returns:
        ResponseModel: A response containing the result of the operation.
    """
    @get("/appunits/{cid}/{zid}", response_model=ResponseModel)
    async def getAppUnits(self, zid: str, cid: int, req: Request):
        try:
            logging.info(f"[{self.__class__.__name__}: {self.getAppUnits.__name__}: {datetime.now()}]: [INFO] - Retrieving all app units")
            _token = self.routeBase.verify_auth_token_type(req.headers["authorization"])

            if _token is not None:
                return await self.appUnitController.getAppUnits( _token, zid, cid)
            else:
                return self.routeBase.generate_response(None, 401)

        except Exception as e:
            logging.error(f"[{self.__class__.__name__}: {self.get_all_apps.__name__}: {datetime.now()}]: [ERROR] - An error occurred: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal Server Error")

        finally:
            del _token



    """API route to add a new app unit.

    Args:
        appUnit (AppUnitModel): The application details.
        zid (int): The z app ID.
        req (Request): The HTTP request.

    Returns:
        ResponseModel: A response containing the result of the operation.
    """
    @post("/appunit/{cid}/{zid}", response_model=ResponseModel)
    async def add_app_unit(self, zid, cid, req: Request, appunit_data: str = Form(...),  file: UploadFile = File(...)):
        try:
            logging.info(f"[{self.__class__.__name__}: {self.add_app_unit.__name__}: {datetime.now()}]: [INFO] - Adding a new app unit")
            _token = self.routeBase.verify_auth_token_type(req.headers["authorization"])

            _appUnit_data = Appunit.parse_raw(appunit_data)

            if _token is not None:
                return await self.appUnitController.addAppUnit(_token, zid, _appUnit_data.name, _appUnit_data.ifname, _appUnit_data.path, _appUnit_data.enable, _appUnit_data.pool_size, _appUnit_data.uname, _appUnit_data.cname, cid, file)
            else:
                return self.routeBase.generate_response(None, 401)

        except Exception as e:
            logging.error(f"[{self.__class__.__name__}: {self.add_app_unit.__name__}: {datetime.now()}]: [ERROR] - An error occurred: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal Server Error")
        

    """API route to edit existing app unit.

    Args:
        appUnit (AppUnitModel): The application details.
        zid (int): The z app ID.
        id (int): The App unit ID.
        req (Request): The HTTP request.

    Returns:
        ResponseModel: A response containing the result of the operation.
    """
    @post("/appunit/{cid}/{zid}/{id}", response_model=ResponseModel)
    async def update_full_app_unit(self, zid, cid, id, req: Request, appunit_data: str = Form(...),  file: UploadFile = File(None)):
        try:
            logging.info(f"[{self.__class__.__name__}: {self.add_app_unit.__name__}: {datetime.now()}]: [INFO] - update app unit with zau")
            _token = self.routeBase.verify_auth_token_type(req.headers["authorization"])

            _appUnit_data = Appunit.parse_raw(appunit_data)

            if _token is not None:
                return await self.appUnitController.updateAppUnit(_token, zid, id, _appUnit_data.name, _appUnit_data.ifname, _appUnit_data.path, _appUnit_data.enable, _appUnit_data.pool_size, _appUnit_data.uname, _appUnit_data.cname, cid, file)
            else:
                return self.routeBase.generate_response(None, 401)

        except Exception as e:
            logging.error(f"[{self.__class__.__name__}: {self.add_app_unit.__name__}: {datetime.now()}]: [ERROR] - An error occurred: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal Server Error")
        

    """API route to edit existing app unit.

    Args:
        appUnit (AppUnitModel): The application details.
        zid (int): The z app ID.
        id (int): The App unit ID.
        req (Request): The HTTP request.

    Returns:
        ResponseModel: A response containing the result of the operation.
    """
    @put("/appunit/{cid}/{zid}/{id}", response_model=ResponseModel)
    async def update_app_unit(self, zid, cid, id, appunit: Appunit, req: Request):
        try:
            logging.info(f"[{self.__class__.__name__}: {self.add_app_unit.__name__}: {datetime.now()}]: [INFO] - update app unit")
            _token = self.routeBase.verify_auth_token_type(req.headers["authorization"])

            if _token is not None:
                return await self.appUnitController.updateAppUnit(_token, zid, id, appunit.name, appunit.ifname, appunit.path, appunit.enable, appunit.pool_size, appunit.uname, appunit.cname, cid, file="")
            else:
                return self.routeBase.generate_response(None, 401)

        except Exception as e:
            logging.error(f"[{self.__class__.__name__}: {self.add_app_unit.__name__}: {datetime.now()}]: [ERROR] - An error occurred: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal Server Error")
        

    """API route to delete app unit.

    Args:
        appUnit (AppUnitModel): The application details.
        zid (int): The z app ID.
        id (int): The App unit ID.
        req (Request): The HTTP request.

    Returns:
        ResponseModel: A response containing the result of the operation.
    """
    @delete("/appunit/{cid}/{zid}/{id}", response_model=ResponseModel)
    async def delete_app_unit(self, cid, zid, id,  req: Request):
        try:
            logging.info(f"[{self.__class__.__name__}: {self.add_app_unit.__name__}: {datetime.now()}]: [INFO] - Delete app unit")
            _token = self.routeBase.verify_auth_token_type(req.headers["authorization"])

            if _token is not None:
                return await self.appUnitController.deleteAppUnit(_token, cid, zid, id)
            else:
                return self.routeBase.generate_response(None, 401)

        except Exception as e:
            logging.error(f"[{self.__class__.__name__}: {self.add_app_unit.__name__}: {datetime.now()}]: [ERROR] - An error occurred: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal Server Error")
        
