#######################################################################################################
# Author        :   K.G.Lahiru GImhana Dayananda  | 19/03/2024
# Copyright     :   Zaion.AI 2024
# Class/module  :   Agent assist monitoring REST API
# Objective     :   Create the FastAPI server API endpoints
#######################################################################################################
# Author                        Date        Action      desc
#------------------------------------------------------------------------------------------------------
# K.G.Lahiru GImhana Dayananda  19/03/2024  Created     Created the initial version
#

# #######################################################################################################

from pydantic import BaseModel
from src.model.db_manager import DBManager
from src.model.base.modelBase import UserType
from src.utilities.settings import  get_config
from src.utilities.audit_log import AuditEntry, print_log


class AppManager:
    def __init__(self, base_dir):
        self.database_mgr = DBManager(base_dir)
        self.base_dir = base_dir
        self.app = get_config("APP_TABLE")
        self.company = get_config("COMPANY_TABLE")
        self.appUnitTable = get_config("APP_UNIT_TABLE")


    def getAllApps(self):
        """
        Retrieves all apps from the database.

        Returns:
            Tuple: A tuple containing a list of apps and any potential error.
        """

        _sqlQuery = f'''
            SELECT a.*, c.name AS cname
            FROM {self.app} a
            LEFT JOIN {self.company} c ON a.cid = c.cid
        '''

        _result =  self.database_mgr.executeQuery(_sqlQuery)
        
        if _result:
            return _result[0], None
        else:
            return None, None
        
    def addApp(self, name: str, ip: str, rest_port: int, ws_port: int, prof_port:int, zid: str, key: str, desc: str, enable: int, cid: int,  user_type: str, user_cid: int, user_name):
        """
        Adds an app to the database.

        Args:
            name (str): The name of the app.
            ip (str): The IP address of the app.
            rest_port (int): The REST port of the app.
            ws_port (int): The WebSocket port of the app.
            prof_port (int): The profiler port of the app.
            zid (str): The configuration ID of the app.
            key (str): The key of the app.
            desc (str): The desc of the app.
            enable (int): The disable status of the app.
            cid (int): The company ID of the app.
            user_type (str): The type of user performing the action.
            user_cid (int): The company ID of the user.

        Returns:
            Tuple: A tuple containing the _result of the operation and any potential error.
        """
        if user_type == UserType.SUPER_ADMIN.value:
            _sqlQuery = f"INSERT INTO {self.app} (name, ip, rest_port, ws_port, prof_port, zid, key, desc, enable, cid) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
            _params = (name, ip, rest_port, ws_port, prof_port, zid, key, desc, enable, cid)
            _result, _err = self.database_mgr.executeQuery(_sqlQuery, _params)
            print_log(AuditEntry(self.base_dir, user_name, user_type, name, "Add Application", _result, _err ))
            return _result, _err
        elif user_type == UserType.ADMIN.value:
            if user_cid != cid:
                return None, "App belongs to another company"
            _sqlQuery = f"INSERT INTO {self.app} (name, ip, rest_port, ws_port, prof_port, zid, key, desc, enable, cid) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
            _params = (name, ip, rest_port, ws_port, prof_port, zid, key, desc, enable, cid)
            _result, _err = self.database_mgr.executeQuery(_sqlQuery, _params)
            print_log(AuditEntry(self.base_dir, user_name, user_type, name, "Add Application", _result, _err ))
            return _result, _err
        
    def updateApp(self, aid: int, name: str, ip: str, rest_port: int, ws_port: int, zid: str, key: str, desc: str, enable: int, cid: int, user_type: str, user_cid: int, user_name):
        """
        Updates an existing app in the database.

        Args:
            aid (int): The ID of the app to be updated.
            name (str): The new name of the app.
            ip (str): The new IP address of the app.
            rest_port (int): The new REST port of the app.
            ws_port (int): The new WebSocket port of the app.
            zid (str): The new configuration ID of the app.
            key (str): The new key of the app.
            desc (str): The new desc of the app.
            enable (int): The new disable status of the app.
            cid (int): The new company ID of the app.
            user_type (str): The type of user performing the action.
            user_cid (int): The company ID of the user.

        Returns:
            Tuple: A tuple containing the _result of the operation and any potential error.
        """
        if user_type == UserType.SUPER_ADMIN.value:
            _sqlQuery = f"UPDATE {self.app} SET name=?, ip=?, rest_port=?, ws_port=?, zid=?, key=?, desc=?, enable=?, cid=?  WHERE aid=?"
            _params = (name, ip, rest_port, ws_port, zid, key, desc, enable, cid, aid)
            _result, _err = self.database_mgr.executeNonQuery(_sqlQuery, _params)
            print_log(AuditEntry(self.base_dir, user_name, user_type, name, "Modify Application", _result, _err ))
            return _result, _err

        if user_type == UserType.ADMIN.value:
            if user_cid != cid:
                return None, "App belongs to another company"
            _sqlQuery = f"UPDATE {self.app}  SET name=?, ip=?, rest_port=?, ws_port=?, zid=?, key=?, desc=?, enable=?, cid=? WHERE aid=? AND cid=?"
            _params = (name, ip, rest_port, ws_port, zid, key, desc, enable, cid, aid, cid)
            _result, _err = self.database_mgr.executeNonQuery(_sqlQuery, _params)
            print_log(AuditEntry(self.base_dir, user_name, user_type, name, "Modify Application", _result, _err ))
            return _result, _err


    def deleteApp(self, aid: int, user_type: str, cid: int, user_name):
        """
        Deletes an app from the database.

        Args:
            aid (int): The ID of the app to be deleted.
            user_type (str): The type of user performing the action.
            user_cid (int): The company ID of the user.

        Returns:
            Tuple: A tuple containing the _result of the operation and any potential error.
        """
        if user_type == UserType.SUPER_ADMIN.value:
            _sqlQuery = "DELETE FROM {} WHERE aid = ?".format(self.app)
            _result, _err = self.database_mgr.executeNonQuery(_sqlQuery, (aid,))
            print_log(AuditEntry(self.base_dir, user_name, user_type, aid, "Delete Application", _result, _err ))
            return _result, _err
        elif user_type == UserType.ADMIN.value:
            _sqlQuery = f"DELETE FROM {self.app} WHERE aid = ? AND cid = ?"
            _result, _err = self.database_mgr.executeNonQuery(_sqlQuery, (aid, cid))
            print_log(AuditEntry(self.base_dir, user_name, user_type, aid, "Delete Application", _result, _err ))
            return _result, _err
        
        
        
    def getAppPorts(self):
        """
        Retrieves apps ports from the database.

        Returns:
            Tuple: A tuple containing a list of apps and any potential error.
        """
        
        _sqlQuery = f'''
            SELECT 
                MAX(rest_port) AS max_rest_port, 
                MAX(ws_port) AS max_ws_port,
                MAX(prof_port) AS max_prof_port
            FROM {self.app}
        '''

        _result, _err = self.database_mgr.executeQuery(_sqlQuery)
        return _result, _err

        
        

    # App Units
        
    def getAllAppUnits(self, user_type: str, cid: int, zid: int):
        """
        Retrieves a company by its ID from the database based on user type.

        Args:
            cid (int): The ID of the company to retrieve.
            user_type (str): The type of user performing the action.

        Returns:
            Tuple: A tuple containing the company information and any potential error.
        """
        # if user_type == UserType.SUPER_ADMIN.value:
        #     _sqlQuery = "SELECT * FROM {} WHERE zid = ?".format(self.appUnitTable)
        #     return self.database_mgr.executeQuery(_sqlQuery, ( zid,))
        # else:
        _sqlQuery = "SELECT * FROM {} WHERE cid = ? AND zid = ?".format(self.appUnitTable)
        return self.database_mgr.executeQuery(_sqlQuery, (cid, zid))




    def getAppUnit(self, user_type: str, cid: int, id: int):
        """
        Retrieves a company by its ID from the database based on user type.

        Args:
            cid (int): The ID of the company to retrieve.
            user_type (str): The type of user performing the action.

        Returns:
            Tuple: A tuple containing the company information and any potential error.
        """
        # if user_type == UserType.SUPER_ADMIN.value or user_type == UserType.ADMIN.value:
        #     _sqlQuery = "SELECT * FROM {} WHERE id = ?".format(self.appUnitTable)
        #     return self.database_mgr.executeQuery(_sqlQuery, (id,))
        _sqlQuery = """
            SELECT app.zid, app.name, app.uname, company.name AS cname
            FROM {} AS app
            JOIN {} AS company ON app.cid = company.cid
            WHERE app.id = ? AND app.cid = ?
            """.format(self.appUnitTable, self.company)
        
        return self.database_mgr.executeQuery(_sqlQuery, (id,cid))


    async def addAppUnit(self, zid, name, ifname, path, enable, pool_size, uname, user_type, user_name, cid):
        """
        Retrieves a company by its ID from the database based on user type.

        Args:
            cid (int): The ID of the company to retrieve.
            user_type (str): The type of user performing the action.

        Returns:
            Tuple: A tuple containing the company information and any potential error.
        """

        if user_type == UserType.SUPER_ADMIN.value or user_type == UserType.ADMIN.value:
            _sqlQuery = f"INSERT INTO {self.appUnitTable} (zid, uname, pool_size, ifname, path, name, enable, cid) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
            _params = (zid, uname, pool_size, ifname, path, name, enable, cid)
            _result, _err = self.database_mgr.executeQuery(_sqlQuery, _params)
            print_log(AuditEntry(self.base_dir, user_name, user_type, name, "Add App Unit", bool(_result), _err ))
            return _result, _err

    async def updateAppUnit(self, user_type: str, user_name, id, zid, uname, pool_size, ifname, path, name, enable, cid):
        """
        Retrieves a company by its ID from the database based on user type.

        Args:
            cid (int): The ID of the company to retrieve.
            user_type (str): The type of user performing the action.

        Returns:
            Tuple: A tuple containing the company information and any potential error.
        """

        if user_type == UserType.SUPER_ADMIN.value or user_type == UserType.ADMIN.value:
            if ifname:
                _sqlQuery = f"UPDATE {self.appUnitTable} SET zid=?, uname=?, pool_size=?, enable=?, ifname=?, path=?, name=? WHERE id= ? AND cid= ?"
                _params = (zid, uname, pool_size, enable, ifname, path, name, id, cid)

            else:
                _sqlQuery = f""" UPDATE {self.appUnitTable} SET uname = ?,  pool_size = ?, enable = ? WHERE id= ? AND cid = ? """
                _params = (uname, pool_size, enable, id, cid)

            _result, _err =  self.database_mgr.executeNonQuery(_sqlQuery, _params)
            print_log(AuditEntry(self.base_dir, user_name, user_type, id, "Modify App Unit", _result, _err ))
            return _result, _err


    async def delAppUnit(self, user_type: str, user_name, cid: int, id: int):
        """
        Retrieves a company by its ID from the database based on user type.

        Args:
            cid (int): The ID of the company to retrieve.
            user_type (str): The type of user performing the action.

        Returns:
            Tuple: A tuple containing the company information and any potential error.
        """
        if user_type == UserType.SUPER_ADMIN.value or user_type == UserType.ADMIN.value:
            _sqlQuery = "DELETE FROM {} WHERE cid = ? AND id = ?".format(self.appUnitTable)
            _result, _err =  self.database_mgr.executeNonQuery(_sqlQuery, (cid, id))
            print_log(AuditEntry(self.base_dir, user_name, user_type, id, "Delete App Unit", _result, _err ))
            return _result, _err


    async def delAllAppUnit(self, user_type: str, user_name: str, cid: int, zid: str):
        """
        Deletes all rows from the app units table based on cid and zid.

        Args:
            user_type (str): The type of user performing the action.
            user_name (str): The name of the user performing the action.
            cid (int): The company ID.
            zid (str): The zone ID.

        Returns:
            Tuple: A tuple containing the result of the delete operation and any potential error.
        """
        if user_type == UserType.SUPER_ADMIN.value or  user_type == UserType.ADMIN.value:
            _sqlQuery = "DELETE FROM {} WHERE cid = ? AND zid = ?".format(self.appUnitTable)
            _result, _err = self.database_mgr.executeNonQuery(_sqlQuery, (cid, zid))
            print_log(AuditEntry(self.base_dir, user_name, user_type, cid, "Delete App Unit", _result, _err))
            return _result, _err
        else:
            _err = "Unauthorized operation"
            return None, _err
