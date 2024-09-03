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
from classy_fastapi import Routable
from fastapi.responses import JSONResponse
from src.controller.base.controllerBase import ControllerBase
from src.controller.base.types import ResponseModel
from src.controller.cacheController.sessionController import SessionController
from src.model.user_manager import UserManager


class UserController(Routable):
    def __init__(self, base_dir) -> None:
        super().__init__()
        self.user_mgr = UserManager(base_dir)
        self.session_mgr = SessionController()
        self.controller_base = ControllerBase()
    
    """
    Retrieves all users.

    Args:
        token (str): The authentication header containing the token.

    Returns:
        JSONResponse: A JSON response containing the list of users or an error message.
    """
    def getUsers(self, token: str):
        try:
            _user_info, _err = self.session_mgr.get_current_user_data(token)
            if _err:
                logging.error(f"[{self.__class__.__name__}: {self.getUsers.__name__}: {datetime.now()}]: [ERROR] - Error retrieving user type: {_err}")
                return self.controller_base.generate_response(None, 500)
            if _user_info is None:
                logging.warning(f"[{self.__class__.__name__}: {self.getUsers.__name__}: {datetime.now()}]: [WARNING] - Unauthorized: Invalid access token")
                return self.controller_base.generate_response(None, 401)
            
            _user_data, _err = self.user_mgr.getAllUsers(_user_info.userType, _user_info.uid)
            if _err:
                logging.error(f"[{self.__class__.__name__}: {self.getUsers.__name__}: {datetime.now()}]: [ERROR] - Error retrieving data: {str(_err)}")
                return self.controller_base.generate_response(None, 500)
            elif not _user_data:
                logging.warning(f"[{self.__class__.__name__}: {self.getUsers.__name__}: {datetime.now()}]: [WARNING] - Users not found")
                return self.controller_base.generate_response(_user_data, 404)
            else:
                logging.info(f"[{self.__class__.__name__}: {self.getUsers.__name__}: {datetime.now()}]: [INFO] - Users retrieved successfully")
                return self.controller_base.generate_response(_user_data, 200)
    
        except Exception as e:
            logging.error(f"[{self.__class__.__name__}: {self.getUsers.__name__}: {datetime.now()}]: [ERROR] - An unexpected error occurred: {str(e)}")
            return self.controller_base.generate_response(None, 500)

    """
    Retrieves a specific user by ID.

    Args:
        uid (int): The ID of the user.
        token (str): The authentication header containing the token.

    Returns:
        JSONResponse: A JSON response containing the user data or an error message.
    """
    def getUser(self, uid, token: str):
        try:     
            # if any(param is None for param in (uid,)):
            #     logging.warning(f"[{self.__class__.__name__}: {self.getUser.__name__}: {datetime.now()}]: [WARNING] - Bad Request: Missing input parameter")
            #     return self.controller_base.generate_response(None, 400)
    
            _user_info, _err = self.session_mgr.get_current_user_data(token)
            if _err:
                logging.error(f"[{self.__class__.__name__}: {self.getUser.__name__}: {datetime.now()}]: [ERROR] - Error retrieving user type: {_err}")
                return self.controller_base.generate_response(None, 500)
            if _user_info is None:
                logging.warning(f"[{self.__class__.__name__}: {self.getUser.__name__}: {datetime.now()}]: [WARNING] - Unauthorized: Invalid access token")
                return self.controller_base.generate_response(None, 401)
            
            _user_data, _err = self.user_mgr.getUserById(uid, _user_info.userType, _user_info.uid)
            if _err:
                logging.error(f"[{self.__class__.__name__}: {self.getUser.__name__}: {datetime.now()}]: [ERROR] - Error retrieving data: {str(_err)}")
                return self.controller_base.generate_response(None, 500)
            elif not _user_data:
                logging.warning(f"[{self.__class__.__name__}: {self.getUser.__name__}: {datetime.now()}]: [WARNING] - User not found")
                return self.controller_base.generate_response(_user_data, 404)
            else:
                logging.info(f"[{self.__class__.__name__}: {self.getUser.__name__}: {datetime.now()}]: [INFO] - User retrieved successfully")
                return self.controller_base.generate_response(_user_data, 200)
    
        except Exception as e:
            logging.error(f"[{self.__class__.__name__}: {self.getUser.__name__}: {datetime.now()}]: [ERROR] - An unexpected error occurred: {str(e)}")
            return self.controller_base.generate_response(None, 500)

    """
    Adds a new user.

    Args:
        uid (int): The ID of the user.
        name (str): The name of the user.
        email (str): The email of the user.
        password (str): The password of the user.
        enable (bool): Flag indicating if the user is disabled.
        cid (int): The ID of the company associated with the user.
        utid (int): The ID of the user type.
        token (str): The authentication header containing the token.

    Returns:
        JSONResponse: A JSON response indicating success or failure of the operation.
    """
    def addUser(self, name, email, password, enable, cid, utid, token: str):
        try:
            # if any(param is None for param in(name, email, password, enable, cid, utid)):
            #     logging.warning(f"[{self.__class__.__name__}: {self.addUser.__name__}: {datetime.now()}]: [WARNING] - Bad Request: Missing input parameter")
                # return self.controller_base.generate_response(None, 400)
    
            _user_info, _err = self.session_mgr.get_current_user_data(token)
            if _err:
                logging.error(f"[{self.__class__.__name__}: {self.addUser.__name__}: {datetime.now()}]: [ERROR] - Error retrieving user type: {_err}")
                return self.controller_base.generate_response(None, 500)
            if _user_info is None:
                logging.warning(f"[{self.__class__.__name__}: {self.addUser.__name__}: {datetime.now()}]: [WARNING] - Unauthorized: Invalid access token")
                return self.controller_base.generate_response(None, 401)
            
            _user_data, _err = self.user_mgr.addUser(name, email, password, enable, cid, utid, _user_info.userType, _user_info.userName)
            if _err:
                logging.error(f"[{self.__class__.__name__}: {self.addUser.__name__}: {datetime.now()}]: [ERROR] - Error adding user: {str(_err)}")
                return self.controller_base.generate_response(None, 500)
            elif not _user_data:
                logging.warning(f"[{self.__class__.__name__}: {self.addUser.__name__}: {datetime.now()}]: [WARNING] - User not added successfully")
                return self.controller_base.generate_response(_user_data, 404)
            else:
                logging.info(f"[{self.__class__.__name__}: {self.addUser.__name__}: {datetime.now()}]: [INFO] - User added successfully")
                return self.controller_base.generate_response(_user_data, 200)
    
        except Exception as e:
            logging.error(f"[{self.__class__.__name__}: {self.addUser.__name__}: {datetime.now()}]: [ERROR] - An unexpected error occurred: {str(e)}")
            return self.controller_base.generate_response(None, 500)

    """
    Updates an existing user.

    Args:
        uid (int): The ID of the user.
        name (str): The name of the user.
        email (str): The email of the user.
        password (str): The password of the user.
        enable (bool): Flag indicating if the user is disabled.
        cid (int): The ID of the company associated with the user.
        utid (int): The ID of the user type.
        token (str): The authentication header containing the token.

    Returns:
        JSONResponse: A JSON response indicating success or failure of the operation.
    """
    def updateUser(self, uid, name, email, password, enable, cid, utid, token: str):
        try:
            # if any(param is None for param in(uid, name, email, password, enable, cid, utid)):
            #     logging.warning(f"[{self.__class__.__name__}: {self.updateUser.__name__}: {datetime.now()}]: [WARNING] - Bad Request: Missing input parameter")
            #     return self.controller_base.generate_response(None, 400)
            
            _user_info, _err = self.session_mgr.get_current_user_data(token)
            if _err:
                logging.error(f"[{self.__class__.__name__}: {self.updateUser.__name__}: {datetime.now()}]: [ERROR] - Error retrieving user type: {_err}")
                return self.controller_base.generate_response(None, 500)
            if _user_info is None:
                logging.warning(f"[{self.__class__.__name__}: {self.updateUser.__name__}: {datetime.now()}]: [WARNING] - Unauthorized: Invalid access token")
                return self.controller_base.generate_response(None, 401)
    
            _user_data, _err = self.user_mgr.updateUser(uid, name, email, password, enable, cid, utid, _user_info.userType, _user_info.userName)
            if _err:
                logging.error(f"[{self.__class__.__name__}: {self.updateUser.__name__}: {datetime.now()}]: [ERROR] - Error updating user: {str(_err)}")
                return self.controller_base.generate_response(None, 500)
            elif not _user_data:
                logging.warning(f"[{self.__class__.__name__}: {self.updateUser.__name__}: {datetime.now()}]: [WARNING] - User not updated successfully")
                return self.controller_base.generate_response(_user_data, 404)
            else:
                logging.info(f"[{self.__class__.__name__}: {self.updateUser.__name__}: {datetime.now()}]: [INFO] - User updated successfully")
                return self.controller_base.generate_response(_user_data, 200)
    
        except Exception as e:
            logging.error(f"[{self.__class__.__name__}: {self.updateUser.__name__}: {datetime.now()}]: [ERROR] - An unexpected error occurred: {str(e)}")
            return self.controller_base.generate_response(None, 500)

    """
    Deletes a user.

    Args:
        uid (int): The ID of the user to be deleted.
        token (str): The authentication header containing the token.

    Returns:
        JSONResponse: A JSON response indicating success or failure of the operation.
    """
    def deleteUser(self, uid, token: str):
        try:
            # if any(param is None for param in (uid,)):
            #     logging.warning(f"[{self.__class__.__name__}: {self.deleteUser.__name__}: {datetime.now()}]: [WARNING] - Bad Request: Missing input parameter")
            #     return self.controller_base.generate_response(None, 400)
    
            _user_info, _err = self.session_mgr.get_current_user_data(token)
            if _err:
                logging.error(f"[{self.__class__.__name__}: {self.deleteUser.__name__}: {datetime.now()}]: [ERROR] - Error retrieving user type: {_err}")
                return self.controller_base.generate_response(None, 500)
            if _user_info is None:
                logging.warning(f"[{self.__class__.__name__}: {self.deleteUser.__name__}: {datetime.now()}]: [WARNING] - Unauthorized: Invalid access token")
                return self.controller_base.generate_response(None, 401)
            
            _user_data, _err = self.user_mgr.deleteUser(uid, _user_info.uid, _user_info.userType, _user_info.userName)
            if _err:
                logging.error(f"[{self.__class__.__name__}: {self.deleteUser.__name__}: {datetime.now()}]: [ERROR] - Error deleting user: {str(_err)}")
                return self.controller_base.generate_response(None, 500)
            elif not _user_data:
                logging.warning(f"[{self.__class__.__name__}: {self.deleteUser.__name__}: {datetime.now()}]: [WARNING] - User not deleted successfully")
                return self.controller_base.generate_response(_user_data, 404)
            else:
                logging.info(f"[{self.__class__.__name__}: {self.deleteUser.__name__}: {datetime.now()}]: [INFO] - User deleted successfully")
                return self.controller_base.generate_response(_user_data, 200)
        
        except Exception as e:
            logging.error(f"[{self.__class__.__name__}: {self.deleteUser.__name__}:  {datetime.now()}]: [ERROR] - An unexpected error occurred: {str(e)}")
            return self.controller_base.generate_response(None, 500)
        
