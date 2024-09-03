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
import sqlite3
import os
import logging
from concurrent.futures import ThreadPoolExecutor
import threading

from src.utilities.settings import get_config

def singleton(cls):
    instances = {}

    def get_instance(*args, **kwargs):
        if cls not in instances:
            instances[cls] = cls(*args, **kwargs)
        return instances[cls]

    return get_instance

"""Singleton class for managing SQLite database connections and queries."""
@singleton
class DBManager:
    def __init__(self, base_dir, max_workers=10):
        self.base_dir = base_dir
        self.thread_pool = ThreadPoolExecutor(max_workers=max_workers)
        self._db_path = None
        self.db_connected = False
        self.conn = None
        self.cursor = None
        self.companyName = None
        self.encryption_key = get_config("ENCRYPTION_KEY")
        # Create a threading lock
        self.lock = threading.Lock()


        
    def __init(self):
        pass

    """Destructor method. Cleans up resources.""" 
    def __del__(self):
        try:
            del self._db_path
            del self.db_connected
            del self.conn
            del self.cursor
        except:
            pass
        pass

    """Connect to the SQLite database.

    Args:
        db_name (str): The name of the database.

    Returns:
        tuple: A tuple containing a boolean indicating the connection status 
               and any error encountered during connection.
    """
    def connect(self, db_name: str):
        try:
            with self.lock:
                self.db_name=db_name

                self._db_path = os.path.join(self.base_dir, 'db', f'{self.db_name}.db')
                if not os.path.exists(os.path.dirname(self._db_path)):
                    os.makedirs(os.path.dirname(self._db_path))

                logging.info(f"[{self.__class__.__name__}: {self.connect.__name__}: {datetime.now()}]: [INFO] - Connecting to SQLite Database...")
                self.pragma_cursor = None
                if self.encryption_key:
                    # If an encryption key is provided, set PRAGMA key before connecting
                    pragma_query = f"PRAGMA key='{self.encryption_key}'"
                    self.pragma_cursor = sqlite3.connect(self._db_path)
                    self.pragma_cursor.execute(pragma_query)
                    self.pragma_cursor.close()

                # Check if database file exists
                if os.path.getsize(self._db_path):
                    # Connect to SQLite database
                    self.conn = sqlite3.connect(self._db_path, check_same_thread=False)
                    self.cursor = self.conn.cursor()
                    self.db_connected = True
                    logging.info(f"[{self.__class__.__name__}: {self.connect.__name__}: {datetime.now()}]: [INFO] - Successfully connected to the SQLite database!")

                else:
                    logging.info(f"[{self.__class__.__name__}: {self.connect.__name__}: {datetime.now()}]: [INFO] - Database '{self.db_name}' does not exist. Creating a new one...")
                    # Execute SQL schema query to create database and tables
                    schema_file_path = os.path.join(self.base_dir, 'config', 'schema.sql')
                    if os.path.exists(schema_file_path):
                        logging.info(f"[{self.__class__.__name__}: {self.connect.__name__}: {datetime.now()}]: [INFO] - Executing SQL schema query from file: {schema_file_path}")
                        with open(schema_file_path, "r") as schema_file:
                            _schema_query = schema_file.read()
                        try:
                            self.conn = sqlite3.connect(self._db_path, check_same_thread=False)
                            self.cursor = self.conn.cursor()
                            self.cursor.executescript(_schema_query)
                            self.conn.commit()
                            logging.info(f"[{self.__class__.__name__}: {self.connect.__name__}: {datetime.now()}]: [INFO] - Database schema created successfully!")
                            self.db_connected = True
                            logging.info(f"[{self.__class__.__name__}: {self.connect.__name__}: {datetime.now()}]: [INFO] - Successfully connected to the SQLite database!")
                        except sqlite3.Error as e:
                            logging.error(f"[{self.__class__.__name__}: {self.connect.__name__}: {datetime.now()}]: [ERROR] - Error executing schema query: {e}")
                            self.db_connected = False
                    else:
                        logging.error(f"[{self.__class__.__name__}: {self.connect.__name__}: {datetime.now()}]: [ERROR] - Schema file '{schema_file_path}' not found. Cannot create database.")
                        self.db_connected = False

                return self.db_connected, None

        except sqlite3.Error as e:
            logging.error(f"[{self.__class__.__name__}: {self.connect.__name__}: {datetime.now()}]: [ERROR] - SQLite error occurred: {str(e)}")
            logging.error(f"[{self.__class__.__name__}: {self.connect.__name__}: {datetime.now()}]: [ERROR] - SQLite error code: {e.args[0]}")
            return False, e
        
        except Exception as exp:
            logging.error(f"[{self.__class__.__name__}: {self.connect.__name__}: {datetime.now()}]: [ERROR] - Connection to SQLite DB Failed: {str(exp)}")
            logging.error(exp, stack_info=True, exc_info=True)
            logging.error(exp.__traceback__)
            return False, exp


    """Close the connection to the SQLite database."""
    def close_connection(self):
        try:
            with self.lock:
                if self.conn:
                    self.conn.close()
                    logging.info(f"[{self.__class__.__name__}: {self.executeNonQuery.__name__}: {datetime.now()}]: [INFO] - Connection to SQLite Database closed")
                    self.db_connected = False
                    return True
                else:
                    return False
        except Exception as exp:
            logging.error(f"[{self.__class__.__name__}: {self.close_connection.__name__}: {datetime.now()}]: [ERROR] - Closing Connection Failed: {str(exp)}")
            logging.error(exp, stack_info=True, exc_info=True)
            logging.error(exp.__traceback__)
            return False


    """Execute a SQL query.

    Args:
        sqlQuery (str): The SQL query to execute.
        params (tuple, optional): Parameters for the query. Defaults to ().

    Returns:
        tuple: A tuple containing the query results and any error encountered during execution.
    """
    def executeQuery(self, sqlQuery: str, params: tuple = ()):
        try:
            # if not self.lock.locked():
            #     self.lock.acquire()

            with self.lock:
                if not self.db_connected:
                    self.connect(self.db_name)

                # Execute the SQL query
                self.cursor.execute(sqlQuery, params)
                self.conn.commit()
                # rows = self.cursor.fetchall()
                logging.info(f"[{self.__class__.__name__}: {self.executeQuery.__name__}: {datetime.now()}]: [INFO] - Query executed successfully")
                # return rows, None

                if sqlQuery.strip().upper().startswith("INSERT"):
                    # Get the last inserted row ID
                    last_row_id = self.cursor.lastrowid

                    # Construct a SELECT query to retrieve the inserted row
                    table_name = sqlQuery.split("INTO")[1].split("(")[0].strip()
                    # select_query = f"SELECT * FROM {table_name} WHERE id = {last_row_id}"
                    # self.cursor.execute(f"SELECT * FROM {table_name} WHERE ROWID IN (SELECT max(ROWID) FROM {table_name});")
                    # last_row = self.cursor.fetchone()
                    # return last_row, None

                    select_query = f"SELECT * FROM {table_name} WHERE ROWID IN (SELECT max(ROWID) FROM {table_name});"
                    last_row = self.cursor.fetchone()

                     # Execute the SELECT query
                    self.cursor.execute(select_query)

                    # Fetch the inserted row
                    _columns = [column[0] for column in self.cursor.description]
                    _row = self.cursor.fetchone()
                    _data = [dict(zip(_columns, _row))]
                    return _data, None
            
                else:
                    _columns  = [column[0] for column in self.cursor.description]
                    _data = [dict(zip(_columns , row)) for row in self.cursor.fetchall()]
                    return _data, None

        except sqlite3.Error as e:
            logging.error(f"[{self.__class__.__name__}: {self.executeQuery.__name__}: {datetime.now()}]: [ERROR] - SQLite error occurred: {str(e)}")
            logging.error(f"SQLite error code: {e.args[0]}")
            return None, e

        except Exception as exp:
            logging.error(f"[{self.__class__.__name__}: {self.executeQuery.__name__}: {datetime.now()}]: [ERROR] - Error executing query: {str(exp)}")
            logging.error(exp, stack_info=True, exc_info=True)
            logging.error(exp.__traceback__)
            return None, exp


    """Execute a non-query SQL statement.

    Args:
        sqlQuery (str): The SQL statement to execute.
        params (tuple, optional): Parameters for the statement. Defaults to ().
        
    Returns:
        tuple: A tuple containing a boolean indicating the execution status and any error encountered.
    """
    def executeNonQuery(self, sqlQuery: str, params: tuple = ()):
        try:
            # if not self.lock.locked():
            #     self.lock.acquire()

            with self.lock:
                if not self.db_connected:
                    self.connect(self.db_name)
    
                # Execute the SQL query with parameters
                self.cursor.execute(sqlQuery, params)
                self.conn.commit()
                logging.info(f"[{self.__class__.__name__}: {self.executeNonQuery.__name__}: {datetime.now()}]: [INFO] - Non-query executed successfully")
                retrieved_data = self.cursor.fetchall()
                return True, None

        except sqlite3.Error as e:
            logging.error(f"[{self.__class__.__name__}: {self.executeNonQuery.__name__}: {datetime.now()}]: [ERROR] - SQLite error occurred: {str(e)}")
            logging.error(f"SQLite error code: {e.args[0]}")
            self.conn.rollback()
            return False, e

        except Exception as exp:
            logging.error(f"[{self.__class__.__name__}: {self.executeNonQuery.__name__}: {datetime.now()}]: [ERROR] - Error executing non-query: {str(exp)}")
            logging.error(exp, stack_info=True, exc_info=True)
            logging.error(exp.__traceback__)
            self.conn.rollback()
            return False, exp


