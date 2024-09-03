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
from src.controller.base.types import ResponseModel, UserType
from src.model.company_manager import CompanyManager
from src.controller.cacheController.sessionController import SessionController


class CompanyController():
    def __init__(self, base_dir) -> None:
        super().__init__()
        self.company_manager = CompanyManager(base_dir)
        self.session_mgr = SessionController()
        self.controller_base = ControllerBase()
    
    """
    Retrieves all companies.

    Args:
        token (str): The authentication header containing the token.

    Returns:
        JSONResponse: A JSON response containing the list of companies or an error message.
    """
    def getCompanies(self, token: str):
        try:
            _user_info, _err = self.session_mgr.get_current_user_data(token)
            if _err:
                logging.error(f"[{self.__class__.__name__}: {self.getCompanies.__name__}: {datetime.now()}]: [ERROR] - Error retrieving user type: {_err}")
                return self.controller_base.generate_response(None, 500)
            elif _user_info is None :
                logging.warning(f"[{self.__class__.__name__}: {self.getCompanies.__name__}: {datetime.now()}]: [WARNING] - Unauthorized: Invalid access token")
                return self.controller_base.generate_response(None, 401)
            
            # _company_data, _err = self.company_manager.getAllCompanies(_user_type)
            _company_data, _err = self.company_manager.getAllCompanies(_user_info.userType, _user_info.cid)
            if _err:
                logging.error(f"[{self.__class__.__name__}: {self.getCompanies.__name__}: {datetime.now()}]: [ERROR] - Error retrieving data: {str(_err)}")
                return self.controller_base.generate_response(None, 500)
            elif not _company_data:
                logging.warning(f"[{self.__class__.__name__}: {self.getCompanies.__name__}: {datetime.now()}]: [WARNING] - Companies not found")
                return self.controller_base.generate_response(_company_data, 200)
            else:
                logging.info(f"[{self.__class__.__name__}: {self.getCompanies.__name__}: {datetime.now()}]: [INFO] - Companies data retrieved successfully")
                return self.controller_base.generate_response(_company_data, 200)
            
        except Exception as e:
            logging.error(f"[{self.__class__.__name__}: {self.getCompanies.__name__}: {datetime.now()}]: [ERROR] - An unexpected error occurred: {str(e)}")
            return self.controller_base.generate_response(None, 500)

    """
    Retrieves a specific company by ID.

    Args:
        cid (int): The ID of the company.
        token (str): The authentication header containing the token.

    Returns:
        JSONResponse: A JSON response containing the company data or an error message.
    """
    def getCompany(self, cid, token: str):
        try:
            # if any(param is None for param in (cid,)):
            #     logging.warning(f"[{self.__class__.__name__}: {self.getCompany.__name__}: {datetime.now()}]: [WARNING] - Bad Request: Missing input parameter")
            #     return self.controller_base.generate_response(None, 400)
        
            _user_info, _err = self.session_mgr.get_current_user_data(token)
            if _err:
                logging.error(f"[{self.__class__.__name__}: {self.getCompany.__name__}: {datetime.now()}]: [ERROR] - Error retrieving user type: {_err}")
                return self.controller_base.generate_response(None, 500)
            elif _user_info is None :
                logging.warning(f"[{self.__class__.__name__}: {self.getCompany.__name__}: {datetime.now()}]: [WARNING] - Unauthorized: Invalid access token")
                return self.controller_base.generate_response(None, 401)
            
            _company_data, _err = self.company_manager.getCompanyById(cid, _user_info.userType)
            if _err:
                logging.error(f"[{self.__class__.__name__}: {self.getCompany.__name__}: {datetime.now()}]: [ERROR] - Error retrieving data: {str(_err)}")
                return self.controller_base.generate_response(None, 500)
            elif not _company_data:
                logging.warning(f"[{self.__class__.__name__}: {self.getCompany.__name__}: {datetime.now()}]: [WARNING] - Company not found")
                return self.controller_base.generate_response(_company_data, 404)
            else:
                logging.info(f"[{self.__class__.__name__}: {self.getCompany.__name__}: {datetime.now()}]: [INFO] - Company data retrieved successfully")
                return self.controller_base.generate_response(_company_data, 200)
            
        except Exception as e:
            logging.error(f"[{self.__class__.__name__}: {self.getCompany.__name__}: {datetime.now()}]: [ERROR] - An unexpected error occurred: {str(e)}")
            return self.controller_base.generate_response(None, 500)


    """
    Adds a new company.

    Args:
        cid (int): The ID of the company.
        name (str): The name of the company.
        enable (bool): Flag indicating if the company is disabled.
        token (str): The authentication header containing the token.

    Returns:
        JSONResponse: A JSON response indicating success or failure of the operation.
    """
    def addCompany(self, name, enable, token: str):
        try:
            # if any(param is None for param in(name, enable)):
            #     logging.warning(f"[{self.__class__.__name__}: {self.addCompany.__name__}: {datetime.now()}]: [WARNING] - Bad Request: Missing input parameter")
            #     return self.controller_base.generate_response(None, 400)
            
            _user_info, _err = self.session_mgr.get_current_user_data(token)
            if _err:
                logging.error(f"[{self.__class__.__name__}: {self.addCompany.__name__}: {datetime.now()}]: [ERROR] - Error retrieving user type: {_err}")
                return self.controller_base.generate_response(None, 500)
            elif _user_info is None :
                logging.warning(f"[{self.__class__.__name__}: {self.addCompany.__name__}: {datetime.now()}]: [WARNING] - Unauthorized: Invalid access token")
                return self.controller_base.generate_response(None, 401)
            
            _company_data, _err = self.company_manager.addCompany(name, enable, _user_info.userType, _user_info.userName)
            if _err:
                logging.error(f"[{self.__class__.__name__}: {self.addCompany.__name__}: {datetime.now()}]: [ERROR] - Error adding new company: {str(_err)}")
                return self.controller_base.generate_response(None, 500)
            elif not _company_data:
                logging.warning(f"[{self.__class__.__name__}: {self.addCompany.__name__}: {datetime.now()}]: [WARNING] - Company added not successfully")
                return self.controller_base.generate_response(_company_data, 404)
            else:
                logging.info(f"[{self.__class__.__name__}: {self.addCompany.__name__}: {datetime.now()}]: [INFO] - Company added successfully")
                return self.controller_base.generate_response(_company_data, 200)
            
        except Exception as e:
            logging.error(f"[{self.__class__.__name__}: {self.addCompany.__name__}: {datetime.now()}]: [ERROR] - An unexpected error occurred: {str(e)}")
            return self.controller_base.generate_response(None, 500)


    """
    Updates an existing company.

    Args:
        cid (int): The ID of the company.
        name (str): The name of the company.
        enable (bool): Flag indicating if the company is disabled.
        token (str): The authentication header containing the token.

    Returns:
        JSONResponse: A JSON response indicating success or failure of the operation.
    """
    def updateCompany(self, cid, name, enable, token: str):
        try:

            # if any(param is None for param in(cid, name, enable)):
            #     logging.warning(f"[{self.__class__.__name__}: {self.updateCompany.__name__}: {datetime.now()}]: [WARNING] - Bad Request: Missing input parameter")
            #     return self.controller_base.generate_response(None, 400)
            
            _user_info, _err = self.session_mgr.get_current_user_data(token)
            if _err:
                logging.error(f"[{self.__class__.__name__}: {self.updateCompany.__name__}: {datetime.now()}]: [ERROR] - Error retrieving user type: {_err}")
                return self.controller_base.generate_response(None, 500)
            elif _user_info is None :
                logging.warning(f"[{self.__class__.__name__}: {self.updateCompany.__name__}: {datetime.now()}]: [WARNING] - Unauthorized: Invalid access token")
                return self.controller_base.generate_response(None, 401)

            _company_data, _err = self.company_manager.updateCompany(cid, name, enable, _user_info.userType, _user_info.userName)
            if _err:
                logging.error(f"[{self.__class__.__name__}: {self.updateCompany.__name__}: {datetime.now()}]: [ERROR] - Error updating data: {str(_err)}")
                return self.controller_base.generate_response(None, 500)
            elif not _company_data:
                logging.warning(f"[{self.__class__.__name__}: {self.updateCompany.__name__}: {datetime.now()}]: [WARNING] - Company updated not successfully")
                return self.controller_base.generate_response(_company_data, 404)
            else:
                logging.info(f"[{self.__class__.__name__}: {self.updateCompany.__name__}: {datetime.now()}]: [INFO] - Company updated successfully")
                return self.controller_base.generate_response(_company_data, 200)

        except Exception as e:
            logging.error(f"[{self.__class__.__name__}: {self.updateCompany.__name__}: {datetime.now()}]: [ERROR] - An unexpected error occurred: {str(e)}")
            return self.controller_base.generate_response(None, 500)

    """
    Deletes a company.

    Args:
        cid (int): The ID of the company to be deleted.
        token (str): The authentication header containing the token.

    Returns:
        JSONResponse: A JSON response indicating success or failure of the operation.
    """
    def deleteCompany(self, cid, token: str):
        try:
            # if any(param is None for param in (cid,)):
            #     logging.warning(f"[{self.__class__.__name__}: {self.deleteCompany.__name__}: {datetime.now()}]: [WARNING] - Bad Request: Missing input parameter")
            #     return self.controller_base.generate_response(None, 400)

            _user_info, _err = self.session_mgr.get_current_user_data(token)
            if _err:
                logging.error(f"[{self.__class__.__name__}: {self.deleteCompany.__name__}: {datetime.now()}]: [ERROR] - Error retrieving user type: {_err}")
                return self.controller_base.generate_response(None, 500)
            elif _user_info is None :
                logging.warning(f"[{self.__class__.__name__}: {self.deleteCompany.__name__}: {datetime.now()}]: [WARNING] - Unauthorized: Invalid access token")
                return self.controller_base.generate_response(None, 401)
            
            _company_data, _err = self.company_manager.deleteCompany(cid, _user_info.userType, _user_info.userName)
            if _err:
                logging.error(f"[{self.__class__.__name__}: {self.deleteCompany.__name__}: {datetime.now()}]: [ERROR] - Error deleting company: {str(_err)}")
                return self.controller_base.generate_response(None, 500)
            elif not _company_data:
                logging.warning(f"[{self.__class__.__name__}: {self.deleteCompany.__name__}: {datetime.now()}]: [WARNING] - Company deleted not successfully")
                return self.controller_base.generate_response(_company_data, 404)
            else:
                logging.info(f"[{self.__class__.__name__}: {self.deleteCompany.__name__}: {datetime.now()}]: [INFO] - Company deleted successfully")
                return self.controller_base.generate_response(_company_data, 200)
        
        except Exception as e:
            logging.error(f"[{self.__class__.__name__}: {self.deleteCompany.__name__}: {datetime.now()}]: [ERROR] - An unexpected error occurred: {str(e)}")
            return self.controller_base.generate_response(None, 500)


