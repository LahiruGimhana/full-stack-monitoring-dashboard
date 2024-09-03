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
 
from fastapi.responses import JSONResponse
from src.controller.base.types import ResponseModel


class ControllerBase:
    def __init__(self):
        super().__init__()


    """
        Generate response based on the provided data and status code.
        
        Parameters:
            data: Data to be included in the response.
            status_code (int): HTTP status code.
            
        Returns:
            JSONResponse: Response containing status code and data.
    """
    def generate_response(self, data, status_code: int):
        if status_code != 200:
            return JSONResponse(content=None, status_code=status_code)
        _content = ResponseModel(status_code=status_code, data=data)
        return JSONResponse(content=_content.dict(), status_code=status_code)
