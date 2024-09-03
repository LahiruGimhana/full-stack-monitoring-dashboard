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
from classy_fastapi import Routable, get, post
from fastapi import Depends, Form, HTTPException, Request, APIRouter, Response
from fastapi.responses import JSONResponse
from fastapi.security import  OAuth2PasswordRequestForm
from src.routers.base.routeBase import LogModel, RouteBase
from src.controller.loginController import LoginController
# from loginController import LoginController
validate_router = APIRouter()


class LoginRoute(Routable):
    def __init__(self, base_dir) -> None:
        super().__init__()
        self.login_controller = LoginController(base_dir)
        self.routeBase = RouteBase()

        # self.logger = logging.getLogger(__name__)
    
    """Handles user login. Attempts to authenticate the user with provided credentials.

    Args:
        form_data (OAuth2PasswordRequestForm, optional): Form data containing username and password.
        user_role (str, optional): The role of the user.

    Raises:
        HTTPException: If an error occurs during authentication.

    Returns:
        JSONResponse: A JSON response containing the authentication result.
    """
    @post("/login")
    def login(self, user_data: LogModel, req: Request) -> JSONResponse:
        logging.info(f"[{self.__class__.__name__}: {self.login.__name__}: {datetime.now()}]: [INFO] - Attempting to authenticate user")
        try:
            return self.login_controller.authenticate_user(user_data.userName, user_data.password)
        except Exception as e:
            logging.error(f"[{self.__class__.__name__}: {self.login.__name__}: {datetime.now()}]: [ERROR] - An error occurred during authentication: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal Server Error")

    
    """Handles user logout. Initiates user logout and invalidates the authentication _token.

    Args:
        req (Request): The request object.

    Raises:
        HTTPException: If an error occurs during logout.

    Returns:
        JSONResponse: A JSON response indicating the result of logout.
    """
    @get("/logout")
    def logout(self, req: Request) -> JSONResponse:
        logging.info(f"[{self.__class__.__name__}: {self.logout.__name__}: {datetime.now()}]: [INFO] - User logout initiated")
        try:
            _token = self.routeBase.verify_auth_token_type(req.headers.get("authorization"))
            if _token:
                return self.login_controller.logout_user(_token)
            return self.routeBase.generate_response(None, 401)
        except HTTPException as http_error:
            raise HTTPException(status_code=500, detail=f"Internal Server Error: {http_error}")
        except Exception as e:
            logging.error(f"[{self.__class__.__name__}: {self.logout.__name__}: {datetime.now()}]: [ERROR] - An error occurred during logout: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal Server Error")


    @get("/validate")
    def validate(self, req: Request) -> JSONResponse:
        logging.info(f"[{self.__class__.__name__}: {self.validate.__name__}: {datetime.now()}]: [INFO] - User validation initiated")
        try:
            _token = self.routeBase.verify_auth_token_type(req.headers.get("authorization"))
            if _token:
                return self.login_controller.validate_user(_token)
            raise HTTPException(status_code=401, detail="Unauthorized")
        except HTTPException as http_error:
            raise HTTPException(status_code=500, detail=f"Internal Server Error: {http_error}")
        except Exception as e:
            logging.error(f"[{self.__class__.__name__}: {self.validate.__name__}: {datetime.now()}]: [ERROR] - An error occurred during validation: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal Server Error")









# class validateRoute():
#     def __init__(self, base_dir) -> None:
#         super().__init__()
#         self.login_controller = LoginController(base_dir)
#         self.routeBase = RouteBase()


#     @validate_router.head("/validate")
#     def validate(self, req: Request):
#         try:
#             logging.info(f"[{self.__class__.__name__}: {self.validate.__name__}: {datetime.now()}]: [INFO] - User validate initiated")
#             _token = self.routeBase.verify_auth_token_type(req.headers["authorization"])
#             if _token:
#                 return self.login_controller.validate_user(_token)
#             else:
#                 raise HTTPException(status_code=401)
#         except HTTPException as http_error:
#             raise HTTPException(status_code=500, detail=f"Internal Server Error: {http_error}")
#         except Exception as e:
#             logging.error(f"[{self.__class__.__name__}: {self.validate.__name__}: {datetime.now()}]: [ERROR] - An error occurred during logout: {str(e)}")
#             raise HTTPException(status_code=500, detail="Internal Server Error")