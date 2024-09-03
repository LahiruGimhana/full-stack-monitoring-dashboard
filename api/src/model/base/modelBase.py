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
from pydantic import BaseModel

class UserTypeModel(BaseModel):
    uid: str
    type: str

class User(BaseModel):
    username: str
    email: str
    disabled: bool
    
class ApplicationModel(BaseModel):
    aid: int
    name: str
    ip: str
    rest_port: int
    ws_port: int
    company_name: str
    zid: str
    key:str
    desc: str
    enable: int
    cid: int
    utid: int

# class UserType(str, Enum):
#     SUPER_ADMIN = "super_admin"
#     ADMIN = "admin"
#     USER = "user"

class UserType(Enum):
    SUPER_ADMIN = 0
    ADMIN = 1
    USER = 2