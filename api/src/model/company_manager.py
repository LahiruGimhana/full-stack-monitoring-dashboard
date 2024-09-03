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
from src.model.base.modelBase import UserType
from src.model.db_manager import DBManager
from src.utilities.audit_log import AuditEntry, print_log
from src.utilities.settings import get_config  # Import the audit log functions


class CompanyManager:
    def __init__(self, base_dir):
        self.database_mgr = DBManager(base_dir)
        self.base_dir = base_dir
        self.company = get_config("COMPANY_TABLE")

    def getAllCompanies(self, user_type: str, cid):
        """
        Retrieves all companies from the database based on user type.

        Args:
            user_type (str): The type of user performing the action.

        Returns:
            Tuple: A tuple containing a list of companies and any potential error.
        """
        if user_type == UserType.SUPER_ADMIN.value:
            _sqlQuery = "SELECT * FROM {}".format(self.company)
            return self.database_mgr.executeQuery(_sqlQuery)
        else:
            _sqlQuery = "SELECT * FROM {} WHERE cid = ?".format(self.company)
            return self.database_mgr.executeQuery(_sqlQuery, (cid,))
        

    def getCompanyById(self, cid: int, user_type: str):
        """
        Retrieves a company by its ID from the database based on user type.

        Args:
            cid (int): The ID of the company to retrieve.
            user_type (str): The type of user performing the action.

        Returns:
            Tuple: A tuple containing the company information and any potential error.
        """
        if user_type in [UserType.SUPER_ADMIN.value, UserType.ADMIN.value]:
            _sqlQuery = "SELECT * FROM {} WHERE cid = ?".format(self.company)
            return self.database_mgr.executeQuery(_sqlQuery, (cid,))

    def addCompany(self, name: str, enable: int, user_type: str, user_name: str):
        """
        Adds a new company to the database.

        Args:
            name (str): The name of the company.
            enable (int): The disable status of the company.
            user_type (str): The type of user performing the action.

        Returns:
            Tuple: A tuple containing the _result of the operation and any potential error.
        """
        if user_type in [UserType.SUPER_ADMIN.value, UserType.ADMIN.value]:
            _sqlQuery = f"INSERT INTO {self.company} (name, enable) VALUES (?, ?)"
            _params = (name, enable)
            _result, _err = self.database_mgr.executeQuery(_sqlQuery, _params)
            print_log(AuditEntry(self.base_dir, user_name, user_type, name, "Add Company", _result, _err ))
            return _result, _err

    def updateCompany(self, cid: int, name: str, enable: int, user_type: str, user_name: str):
        """
        Updates an existing company in the database.

        Args:
            cid (int): The ID of the company to be updated.
            name (str): The new name of the company.
            enable (int): The new disable status of the company.
            user_type (str): The type of user performing the action.

        Returns:
            Tuple: A tuple containing the _result of the operation and any potential error.
        """
        if user_type == UserType.SUPER_ADMIN.value:
            _sqlQuery = f"UPDATE {self.company} SET name=?, enable=? WHERE cid=?"
            _params = (name, enable, cid)
            _result, _err = self.database_mgr.executeNonQuery(_sqlQuery, _params)
            print_log(AuditEntry(self.base_dir, user_name, user_type, name, "Modify Company", _result, _err ))
            return _result, _err
        
        elif user_type == UserType.ADMIN.value:
            _sqlQuery = f"UPDATE {self.company} SET name=?, enable=? WHERE cid=?"
            _params = (name, enable,  cid)
            _result, _err =  self.database_mgr.executeNonQuery(_sqlQuery, _params)
            print_log(AuditEntry(self.base_dir, user_name, user_type, name, "Modify Company", _result, _err ))
            return _result, _err

    def deleteCompany(self, cid: int, user_type: str, user_name: str):
        """
        Deletes a company from the database.

        Args:
            cid (int): The ID of the company to be deleted.
            user_type (str): The type of user performing the action.

        Returns:
            Tuple: A tuple containing the _result of the operation and any potential error.
        """
        if user_type == UserType.SUPER_ADMIN.value:
            _sqlQuery = "DELETE FROM {} WHERE cid = ?".format(self.company)
            _result, _err =  self.database_mgr.executeNonQuery(_sqlQuery, (cid,))
            print_log(AuditEntry(self.base_dir, user_name, user_type, cid, "Delete Company", _result, _err))
            return _result, _err
        elif user_type == UserType.ADMIN.value:
            sql_query = "DELETE FROM {} WHERE cid = ?".format(self.company)
            _result, _err = self.database_mgr.executeNonQuery(sql_query, (cid,))

            print_log(AuditEntry(self.base_dir, user_name, user_type, cid, "Delete Company", _result , _err))
            return _result, _err
