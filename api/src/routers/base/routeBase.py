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
from typing import Optional, TypeVar, Generic, Union
from fastapi.responses import JSONResponse
from pydantic import BaseModel, validator
import sys
import logging
T = TypeVar("T")



class RouteBase:
    def __init__(self) -> None:
        super().__init__()


    """Verifies the type of authentication token."""
    def verify_auth_token_type(self, auth_header):
        # Split the header value to get the token part
        _token_type, _, _token  = auth_header.partition(" ")
        if _token_type != "Bearer":
            logging.warning(f"[{self.__class__.__name__}: {self.verify_auth_token_type.__name__}: {datetime.now()}]: [WARNING] - Invalid user authentication: Missing or invalid token type")
            return None
        return _token


    """Generates a JSON response.

    Args:
        data: The data to include in the response.
        status_code (int): The HTTP status code.

    Returns:
        JSONResponse: A JSON response with the specified data and status.
    """
    def generate_response(self, data, status_code):
        if status_code != 200:
            return JSONResponse(content = None, status_code=status_code)
        _content = ResponseModel(status_code = status_code, data = data)
        return JSONResponse(content=_content.dict(), status_code=status_code)


#create Router models
class ResponseModel(BaseModel):
    isSuccess: bool
    status_code: int
    message: str
    data: Optional[T] = None

class UserModel(BaseModel):
    name: str
    email: str
    password: str
    enable: int
    cid: Union[int, str]
    utid: int

    # @validator('cid')
    # def validate_cid(cls, v):
    #     if isinstance(v, str) and v != '*':
    #         raise ValueError('String value for cid must be "*"')
    #     return v

class ApplicationModel(BaseModel):
    name: str
    ip: str
    rest_port: int
    ws_port: int
    prof_port: int
    zid: str
    key:str
    desc: str
    enable: int
    cid: int
    version: str

class Appunit(BaseModel):
    ifname: str
    path: str
    enable: int
    name: str
    pool_size: int
    uname: str
    cname: str

class App(BaseModel):
    ip: str
    rest_port: int

class CompanyModel(BaseModel):
    name: str
    enable: int

class AppUnitModel(BaseModel):
    auid: int
    name: str
    fileName: str
    path: str
    zid: str

class LogModel(BaseModel):
    userName: str
    password: str