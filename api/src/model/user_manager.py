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
from src.model.authManager import AuthManager
from src.model.db_manager import DBManager
from src.model.base.modelBase import UserType
from src.utilities.settings import get_config
from src.utilities.audit_log import AuditEntry, print_log

class UserManager:
    def __init__(self, base_dir):
        self.database_mgr = DBManager(base_dir)
        self.auth_mgr = AuthManager(base_dir)
        self.base_dir = base_dir
        self.user = get_config("USER_TABLE")
        self.userTypeTable = get_config("USER_ROLE_TABLE")
        self.company = get_config("COMPANY_TABLE")


    def getAllUsers(self, user_type: str, log_uid: str):
        """
        Retrieves all users from the database based on user type and logged-in user ID.

        Args:
            user_type (str): The type of user performing the action.
            log_uid (str): The ID of the logged-in user.

        Returns:
            Tuple: A tuple containing a list of users and any potential error.
        """

        if user_type == UserType.ADMIN.value:
            _sqlQuery = f'''
                SELECT u.uid, u.utid, u.cid, u.name, u.email, u.enable, c.name AS cname
                FROM {self.user} u
                LEFT JOIN {self.company} c ON u.cid = c.cid
                WHERE u.cid = (SELECT cid FROM {self.user} WHERE uid = ?)
            '''
            return self.database_mgr.executeQuery(_sqlQuery, (log_uid,))
            
        elif user_type == UserType.SUPER_ADMIN.value:
            _sqlQuery = f'''
                SELECT u.uid, u.utid, u.cid, u.name, u.email, u.enable, c.name AS cname
                FROM {self.user} u
                LEFT JOIN {self.company} c ON u.cid = c.cid
            '''
            return self.database_mgr.executeQuery(_sqlQuery,)
        else:
            _sqlQuery = f'''
                SELECT u.uid, u.utid, u.cid, u.name, u.email, u.enable, c.name AS cname
                FROM {self.user} u
                LEFT JOIN {self.company} c ON u.cid = c.cid
                WHERE u.cid = (SELECT cid FROM {self.user} WHERE uid = ?)
                AND u.enable = 1
            '''
            return self.database_mgr.executeQuery(_sqlQuery, (log_uid,))


    def getUserById(self, uid: int, user_type: str, log_uid: str):
        """
        Retrieves a user by their ID from the database based on user type and logged-in user ID.

        Args:
            uid (int): The ID of the user to retrieve.
            user_type (str): The type of user performing the action.
            log_uid (str): The ID of the logged-in user.

        Returns:
            Tuple: A tuple containing the user information and any potential error.
        """
        if user_type in [UserType.SUPER_ADMIN.value, UserType.ADMIN.value, UserType.USER.value]:
            _sqlQuery = f'''SELECT * FROM {self.user}
                        WHERE uid = ?
                        AND (SELECT cid FROM {self.user} WHERE uid = ?) = cid
                        AND uid IN (?, ?)'''

            return self.database_mgr.executeQuery(_sqlQuery, (uid, log_uid, uid, log_uid))
        else:
            return None, "User has not access to view"
        
        
    def addUser(self, name: str, email: str, password: str, enable: int, cid: int, utid: int, user_type: str, user_name: str):
        """
        Adds a new user to the database.

        Args:
            name (str): The name of the new user.
            email (str): The email of the new user.
            password (str): The password of the new user.
            enable (int): The disable status of the new user.
            cid (int): The ID of the company associated with the new user.
            utid (int): The ID of the user type associated with the new user.
            user_type (str): The type of user performing the action.

        Returns:
            Tuple: A tuple containing the _result of the operation and any potential error.
        """
        _hashed_password = self.auth_mgr.hash_password(password)
        if user_type in [UserType.SUPER_ADMIN.value, UserType.ADMIN.value]:
            _sqlQuery = f"INSERT INTO {self.user} (name, email, hashed_password, enable, cid, utid) VALUES (?, ?, ?, ?, ?, ?)"
            _params = (name, email, _hashed_password, enable, cid, utid)
            _result, _err = self.database_mgr.executeQuery(_sqlQuery, _params)
            if _result:
                del _result[0]['hashed_password']
                
            print_log(AuditEntry(self.base_dir, user_name, user_type, name, "Add User", bool(_result), _err ))
            return _result, _err
        else:
            return None, "User has not access to add"

    def updateUser(self, uid: int, name: str, email: str, password: str, enable: int, cid: int, utid: int, user_type: str, user_name: str):
        """
        Updates an existing user in the database.

        Args:
            uid (int): The ID of the user to be updated.
            name (str): The new name of the user.
            email (str): The new email of the user.
            password (str): The new password of the user.
            enable (int): The new disable status of the user.
            utid (int): The new user type ID of the user.
            cid (int): The new company ID associated with the user.
            user_type (str): The type of user performing the action.

        Returns:
            Tuple: A tuple containing the _result of the operation and any potential error.
        """
        _hashed_password = self.auth_mgr.hash_password(password)
        if user_type in [UserType.SUPER_ADMIN.value, UserType.ADMIN.value]:
            _sqlQuery = f"UPDATE {self.user} SET name=?, email=?, hashed_password=?, enable=?, utid=?, cid=? WHERE uid=?"
            _params = (name, email, _hashed_password, enable, utid, cid, uid)
            _result, _err =  self.database_mgr.executeNonQuery(_sqlQuery, _params)
            print_log(AuditEntry(self.base_dir, user_name, user_type, name, "Modify User", _result, _err ))
            return _result, _err
        
        else:
            _sqlQuery = f"UPDATE {self.user} SET name=?, email=?, hashed_password=?, enable=? WHERE uid=?"
            _params = (name, email, _hashed_password, enable, uid)
            _result, _err =  self.database_mgr.executeNonQuery(_sqlQuery, _params)
            print_log(AuditEntry(self.base_dir, user_name, user_type, name, "Modify User", _result, _err ))
            return _result, _err
        

    def deleteUser(self, uid: int, log_uid: str, user_type: str, user_name: str):
        """
        Deletes a user from the database.

        Args:
            uid (int): The ID of the user to be deleted.
            user_type (str): The type of user performing the action.
            log_uid (str): The ID of the logged-in user.

        Returns:
            Tuple: A tuple containing the _result of the operation and any potential error.
        """
        if uid == log_uid:
            return None, "Cannot delete own profile"
        if user_type == UserType.SUPER_ADMIN.value:
            _sqlQuery = f'''DELETE FROM {self.user} 
                   WHERE uid = ? AND utid > 0'''

            _result, _err =  self.database_mgr.executeNonQuery(_sqlQuery, (uid,))
            print_log(AuditEntry(self.base_dir, user_name, user_type, uid, "Delete User", _result, _err ))
            return _result, _err
        
        elif user_type == UserType.ADMIN.value:
            _sqlQuery = f'''UPDATE {self.user} 
                           SET enable = 1
                           WHERE utid > 0 
                           AND (SELECT cid FROM {self.user} WHERE uid = ?) = cid
                           AND uid IN (?, ?)'''

            _result, _err =  self.database_mgr.executeNonQuery(_sqlQuery, (log_uid, uid, uid))
            print_log(AuditEntry(self.base_dir, user_name, user_type, uid, "Delete User", _result, _err ))
            return _result, _err
        
        else:
            print_log(AuditEntry(self.base_dir, user_name, user_type, uid, "Delete User", _result, _err ))
            return None, "User has not access to delete"
