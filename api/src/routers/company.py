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
# K.G.Lahiru GImhana Dayananda  12/03/2024  Modified    Add Company API endpoints.
# #######################################################################################################

from datetime import datetime
import logging
from classy_fastapi import Routable, get, delete, post, put
from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse
from src.routers.base.routeBase import ResponseModel, CompanyModel, RouteBase
from src.controller.companyController import CompanyController

# from routes.base.routeBase import ResponseModel
class CompanyRoute(Routable):
    def __init__(self, base_dir) -> None:
        super().__init__()
        self.companyController = CompanyController(base_dir)
        self.routeBase = RouteBase()


    """API route to retrieve all companies.

    Args:
        req (Request): The HTTP request.

    Returns:
        ResponseModel: A response containing the list of companies.
    """
    @get("/", response_model=ResponseModel)
    def get_all_company(self, req: Request):
        try:
            logging.info(f"[{self.__class__.__name__}: {self.get_all_company.__name__}: {datetime.now()}]: [INFO] - Retrieving all companies")
            _token = self.routeBase.verify_auth_token_type(req.headers["authorization"])

            if _token is not None:
                return self.companyController.getCompanies(_token)
            else:
                return self.routeBase.generate_response(None, 401)

        except Exception as e:
            logging.error(f"[{self.__class__.__name__}: {self.get_all_company.__name__}: {datetime.now()}]: [ERROR] - An error occurred: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal Server Error")
    

    """API route to retrieve a specific company.

    Args:
        cid (int): The company ID.
        req (Request): The HTTP request.

    Returns:
        ResponseModel: A response containing the company details.
    """
    @get("/{cid}", response_model=ResponseModel)
    def get_company(self, cid, req: Request):
        try:
            logging.info(f"[{self.__class__.__name__}: {self.get_company.__name__}: {datetime.now()}]: [INFO] - Retrieving company with CID: {cid}")
            _token = self.routeBase.verify_auth_token_type(req.headers["authorization"])

            if _token is not None:
                return self.companyController.getCompany(cid, _token)
            else:
                return self.routeBase.generate_response(None, 401)

        except Exception as e:
            logging.error(f"[{self.__class__.__name__}: {self.get_company.__name__}: {datetime.now()}]: [ERROR] - An error occurred: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal Server Error")
    

    """API route to add a new company.

    Args:
        company (CompanyModel): The company details.
        req (Request): The HTTP request.

    Returns:
        ResponseModel: A response containing the result of the operation.
    """
    @post("/", response_model=ResponseModel)
    def add_company(self, company: CompanyModel, req: Request):
        try:
            logging.info(f"[{self.__class__.__name__}: {self.add_company.__name__}: {datetime.now()}]: [INFO] - Adding a new company")
            _token = self.routeBase.verify_auth_token_type(req.headers["authorization"])

            if _token is not None:
                return self.companyController.addCompany(company.name, company.enable, _token)
            else:
                return self.routeBase.generate_response(None, 401)

        except Exception as e:
            logging.error(f"[{self.__class__.__name__}: {self.add_company.__name__}: {datetime.now()}]: [ERROR] - An error occurred: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal Server Error")
    

    """API route to update an existing company.

    Args:
        cid (int): The company ID.
        company (CompanyModel): The updated company details.
        req (Request): The HTTP request.

    Returns:
        ResponseModel: A response containing the result of the operation.
    """
    @put("/{cid}", response_model=ResponseModel)
    def update_company(self, cid: int, company: CompanyModel, req: Request):
        try:
            logging.info(f"[{self.__class__.__name__}: {self.update_company.__name__}: {datetime.now()}]: [INFO] - Updating company with CID: {cid}")
            _token = self.routeBase.verify_auth_token_type(req.headers["authorization"])

            if _token is not None:
                return self.companyController.updateCompany(cid, company.name, company.enable, _token)
            else:
                return self.routeBase.generate_response(None, 401)

        except Exception as e:
            logging.error(f"[{self.__class__.__name__}: {self.update_company.__name__}: {datetime.now()}]: [ERROR] - An error occurred: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal Server Error")
    
    """API route to delete a company.

    Args:
        cid (int): The company ID.
        req (Request): The HTTP request.

    Returns:
        ResponseModel: A response containing the result of the operation.
    """
    @delete("/{cid}", response_model=ResponseModel)
    async def delete_company(self, cid: int, req: Request):
        try:
            logging.info(f"[{self.__class__.__name__}: {self.delete_company.__name__}: {datetime.now()}]: [INFO] - Deleting company with CID: {cid}")
            _token = self.routeBase.verify_auth_token_type(req.headers["authorization"])

            if _token is not None:
                return self.companyController.deleteCompany(cid, _token)
            else:
                return self.routeBase.generate_response(None, 401)

        except Exception as e:
            logging.error(f"[{self.__class__.__name__}: {self.delete_company.__name__}: {datetime.now()}]: [ERROR] - An error occurred: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal Server Error")

