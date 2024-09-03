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

import hashlib
import logging
from typing import Any, Dict, Optional, Tuple
from src.model.db_manager import DBManager
from src.utilities.settings import get_config

class AuthManager:
    def __init__(self, base_dir):
        self.database_mgr = DBManager(base_dir)
        self.user_table = get_config("USER_TABLE")
        self.user_type_table=get_config("USER_ROLE_TABLE")
        self.company_table = get_config("COMPANY_TABLE")


    """Validates user login credentials.

    Args:
        username_or_email (str): The name or email of the user.
        password (str): The password of the user.
        user_type (str): The type of the user.

    Returns:
        tuple: A tuple containing a boolean indicating the validation result 
               and any error encountered during validation.
    """
    def validateUserLogin(self, username_or_email: str, password: str) -> Tuple[Optional[Dict[str, Any]], Optional[Exception]]:
        try:

            # _sqlQuery = f'''
            #     SELECT DISTINCT u.uid, u.name, u.email, u.hashed_password, u.enable, u.cid, u.utid
            #     FROM {self.user_table} u 
            #     JOIN {self.company_table} c ON (u.cid = c.cid OR u.cid = '*')
            #     WHERE (u.name = ? OR u.email = ?) 
            #       AND u.enable = 1 AND c.enable = 1
            #       AND (u.cid = '*' OR (u.cid != '*' AND u.cid = c.cid))
            # '''

            _sqlQuery = f'''
                SELECT DISTINCT u.uid, u.name, u.email, u.hashed_password, u.enable, u.cid, u.utid
                FROM {self.user_table} u 
                LEFT JOIN {self.company_table} c ON u.cid = c.cid
                WHERE (u.name = ? OR u.email = ?) 
                  AND u.enable = 1
                  AND (u.cid = '*' OR c.enable = 1 OR c.cid IS NULL)
            '''



            _user_data, _err = self.database_mgr.executeQuery(_sqlQuery, (username_or_email, username_or_email))

            if _user_data:
                _hashed_password, _is_enable = _user_data[0]['hashed_password'], _user_data[0]['enable']

                if _is_enable and _hashed_password == self.hash_password(password):  # Verify the password
                    return _user_data[0], None

            return None, _err
        except Exception as e:
            logging.error(f"An error occurred while validating user login: {e}")
            return None, e


    """Hashes the password using SHA-256.
    
    Args:
        password (str): The password to hash.
    
    Returns:
        str: The hashed password.
    """
    def hash_password(self, password):
        try:
            _hashed_password = hashlib.sha256(password.encode('utf-8')).hexdigest()
            return _hashed_password
        except Exception as e:
            logging.error(f"An error occurred while hashing password: {e}")
