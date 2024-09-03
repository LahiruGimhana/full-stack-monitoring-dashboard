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
# K.G.Lahiru GImhana Dayananda  12/03/2024  Modified    Add User API endpoints.
# #######################################################################################################

from datetime import datetime
import logging
from classy_fastapi import Routable, get, delete, post, put
from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse
from src.routers.base.routeBase import ResponseModel, RouteBase, UserModel
from src.controller.userController import UserController

# from routes.base.routeBase import ResponseModel
class UserRoute(Routable):
    def __init__(self, base_dir) -> None:
        super().__init__()
        self.userController = UserController(base_dir)
        self.routeBase = RouteBase()

        

    """API route to retrieve all users.

    Args:
        req (Request): The HTTP request.

    Returns:
        ResponseModel: A response containing the list of users.
    """
    @get("/", response_model=ResponseModel)
    def get_all_users(self, req: Request):
        try:
            logging.info(f"[{self.__class__.__name__}: {self.get_all_users.__name__}: {datetime.now()}]: [INFO] - Retrieving all users")
            _token = self.routeBase.verify_auth_token_type(req.headers["authorization"])

            if _token is not None:
                return self.userController.getUsers(_token)
            else:
                return self.routeBase.generate_response(None, 401)

            
        except Exception as e:
            logging.error(f"[{self.__class__.__name__}: {self.get_all_users.__name__}: {datetime.now()}]: [ERROR] - An error occurred: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal Server Error")

    """API route to retrieve a specific user.

    Args:
        uid (int): The user ID.
        req (Request): The HTTP request.

    Returns:
        ResponseModel: A response containing the user details.
    """
    @get("/{uid}", response_model=ResponseModel)
    def get_user(self, uid, req: Request):
        try:
            logging.info(f"[{self.__class__.__name__}: {self.get_user.__name__}: {datetime.now()}]: [INFO] - Retrieving user with UID: {uid}")
            _token = self.routeBase.verify_auth_token_type(req.headers["authorization"])

            if _token is not None:
                return self.userController.getUser(uid, _token)
            else:
                return self.routeBase.generate_response(None, 401)

            
        except Exception as e:
            logging.error(f"[{self.__class__.__name__}: {self.get_user.__name__}: {datetime.now()}]: [ERROR] - An error occurred: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal Server Error")

    """API route to add a new user.

    Args:
        user (UserModel): The user details.
        req (Request): The HTTP request.

    Returns:
        ResponseModel: A response containing the result of the operation.
    """
    @post("/", response_model=ResponseModel)
    def add_user(self, user: UserModel, req: Request):
        try:
            logging.info(f"[{self.__class__.__name__}: {self.add_user.__name__}: {datetime.now()}]: [INFO] - Adding a new user")
            _token = self.routeBase.verify_auth_token_type(req.headers["authorization"])

            if _token is not None:
                return self.userController.addUser(user.name, user.email, user.password, user.enable, user.cid, user.utid, _token)
            else:
                return self.routeBase.generate_response(None, 401)

            
        except Exception as e:
            logging.error(f"[{self.__class__.__name__}: {self.add_user.__name__}: {datetime.now()}]: [ERROR] - An error occurred: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal Server Error")

    """API route to update an existing user.

    Args:
        uid (int): The user ID.
        user (UserModel): The updated user details.
        req (Request): The HTTP request.

    Returns:
        ResponseModel: A response containing the result of the operation.
    """
    @put("/{uid}", response_model=ResponseModel)
    def update_user(self, uid: int, user: UserModel, req: Request):
        try:
            logging.info(f"[{self.__class__.__name__}: {self.update_user.__name__}: {datetime.now()}]: [INFO] - Updating user with UID: {uid}")
            _token = self.routeBase.verify_auth_token_type(req.headers["authorization"])

            if _token is not None:
                return self.userController.updateUser(uid, user.name, user.email, user.password, user.enable, user.cid, user.utid, _token)
            else:
                return self.routeBase.generate_response(None, 401)

            
        except Exception as e:
            logging.error(f"[{self.__class__.__name__}: {self.update_user.__name__}: {datetime.now()}]: [ERROR] - An error occurred: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal Server Error")

    """API route to delete a user.

    Args:
        uid (int): The user ID.
        req (Request): The HTTP request.

    Returns:
        ResponseModel: A response containing the result of the operation.
    """
    @delete("/{uid}", response_model=ResponseModel)
    async def delete_user(self, uid: int, req: Request):
        try:
            logging.info(f"[{self.__class__.__name__}: {self.delete_user.__name__}: {datetime.now()}]: [INFO] - Deleting user with UID: {uid}")
            _token = self.routeBase.verify_auth_token_type(req.headers["authorization"])

            if _token is not None:
                return self.userController.deleteUser(uid, _token)
            else:
                return self.routeBase.generate_response(None, 401)

        except Exception as e:
            logging.error(f"[{self.__class__.__name__}: {self.delete_user.__name__}: {datetime.now()}]: [ERROR] - An error occurred: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal Server Error")