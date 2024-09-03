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
 
from enum import Enum
from typing import Optional, TypeVar, Generic, Union
from pydantic import BaseModel, validator

import sys
import logging

T = TypeVar("T")

#create Router models


class ResponseModel(BaseModel):
    data: Optional[T] = None

class UserModel(BaseModel):
    uid: int
    name: str
    email: str
    password: str
    uid: int 
    cid: int

class ApplicationModel(BaseModel):
    aid: int
    name: str
    ip: str
    rest_port: int
    ws_port: int
    zid: str
    key:str
    desc: str
    enable: int
    cid: int

class CompanyModel(BaseModel):
    cid: int
    name: str
    desc: str

class AppUnitModel(BaseModel):
    auid: int
    name: str
    fileName: str
    path: str
    zid: str

class UserInfoModel(BaseModel):
    uid: int
    userName: str
    email: str
    userType: int
    cid: Union[int, str]

class UserType(Enum):
    SUPER_ADMIN = 0
    ADMIN = 1
    USER = 2
