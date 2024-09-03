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
from fastapi import Response
from fastapi.responses import JSONResponse
from src.controller.base.controllerBase import ControllerBase
from src.model.authManager import AuthManager
from src.controller.cacheController.sessionController import SessionController
from src.controller.base.types import ResponseModel

class LoginController():
    def __init__(self, base_dir)-> None:
        super().__init__()
        self.session_mgr = SessionController()
        self.login_manager = AuthManager(base_dir)
        # self.logger = logging.getLogger(__name__)
        self.controller_base = ControllerBase()


    """Authenticates the user with provided credentials.

    Args:
        userName (str): The name of the user.
        password (str): The password of the user.
        userType (str): The type of user.

    Raises:
        HTTPException: If authentication fails.

    Returns:
        JSONResponse: A JSON response containing the authentication result.
    """
    def authenticate_user(self, userName: str, password: str) -> JSONResponse:
        try:
            # if any(param is None for param in(userName, password)):
            #     logging.warning(f"[{self.__class__.__name__}: {self.authenticate_user.__name__}: {datetime.now()}]: [WARNING] - Bad Request: Missing input parameter")
            #     return self.controller_base.generate_response(None, 400)
        
            _user_data, _err = self.login_manager.validateUserLogin(userName, password)
            if _err:
                logging.error(f"[{self.__class__.__name__}: {self.authenticate_user.__name__}: {datetime.now()}]: [ERROR] - Internal server error occurred during authentication: {_err}")
                return self.controller_base.generate_response(None, 500)

            if not _user_data:
                logging.warning(f"[{self.__class__.__name__}: {self.authenticate_user.__name__}: {datetime.now()}]: [WARNING] - Invalid Username or Password")
                return self.controller_base.generate_response(None, 401)
         
            _user_info = {"userName": _user_data["name"], "userId": _user_data["uid"], "userType": _user_data["utid"], "cid": _user_data["cid"]}

            _auth_token, _err = self.session_mgr.create_auth_token(_user_data)
            if _err:
                logging.error(f"[{self.__class__.__name__}: {self.authenticate_user.__name__}: {datetime.now()}]: [ERROR] - Internal server error occurred during create user token: {_err}")
                return self.controller_base.generate_response(None, 500)

            logging.info(f"[{self.__class__.__name__}: {self.authenticate_user.__name__}: {datetime.now()}]: [INFO] - User authentication successful")
            return self.controller_base.generate_response({'auth_token': _auth_token, '_user_data': _user_info}, 200)
        
                
        except Exception as e:
            logging.error(f"[{self.__class__.__name__}: {self.authenticate_user.__name__}: {datetime.now()}]: [ERROR] - Exception occurred: {str(e)}")
            return self.controller_base.generate_response(None, 500)


    """Invalidates the authentication token upon user logout.
    
    Args:
        token (str): The authentication header containing the token.
    
    Raises:
        HTTPException: If the token is missing or invalid.
    
    Returns:
        JSONResponse: A JSON response indicating the result of token invalidation.
    """
    def logout_user(self, token: str) -> JSONResponse:
        if not token:
            return self.controller_base.generate_response(None, 401)
        
        try:
            _result, _err = self.session_mgr.remove_auth_token(token)
            if _err:
                logging.error(f"[{self.__class__.__name__}: {self.logout_user.__name__}: {datetime.now()}]: [ERROR] - User logout not successful: {str(_err)}")
                return self.controller_base.generate_response(None, 500)
            elif not _result:
                logging.warning(f"[{self.__class__.__name__}: {self.logout_user.__name__}: {datetime.now()}]: [WARNING] - User logout not successful")
                return self.controller_base.generate_response(None, 401)
            else:
                logging.info(f"[{self.__class__.__name__}: {self.logout_user.__name__}: {datetime.now()}]: [INFO] - User logged out successfully")
                return self.controller_base.generate_response(None, 200)
        except Exception as e:
            logging.error(f"[{self.__class__.__name__}: {self.logout_user.__name__}: {datetime.now()}]: [ERROR] - Exception occurred: {str(e)}")
            return self.controller_base.generate_response(None, 500)
        finally:
            del token, _result, _err 


    def validate_user(self, token: str) -> JSONResponse:
        if not token:
            return self.controller_base.generate_response(None, 401)
        try:
            _result = self.session_mgr.extend_auth_token_expiry(token)
            if _result:
                logging.info(f"[{self.__class__.__name__}: {self.validate_user.__name__}: {datetime.now()}]: [INFO] - User token validated and extended successfully")
                del _result
                return Response(status_code=200)
            else:
                logging.info(f"[{self.__class__.__name__}: {self.validate_user.__name__}: {datetime.now()}]: [INFO] - User token validation and extension failed")
                return Response(status_code=401)
        except Exception as e:
            logging.error(f"[{self.__class__.__name__}: {self.validate_user.__name__}: {datetime.now()}]: [ERROR] - Exception occurred: {str(e)}")
            del e
            return self.controller_base.generate_response(None, 500)

