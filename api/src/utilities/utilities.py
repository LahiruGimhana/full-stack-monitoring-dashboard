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

from asyncio import subprocess
import asyncio
import copy
import io
import json
import os
import shutil
import logging
from datetime import datetime
import tempfile
import zipfile
import socket
import subprocess

from fastapi import HTTPException

def create_directory(path):
    try:
        os.makedirs(path, exist_ok=True)
        logging.info(f"[{__name__}: create_directory: {datetime.now()}]: [INFO] - Directory '{path}' created successfully")
    except Exception as _e:
        logging.error(f"[{__name__}: create_directory: {datetime.now()}]: [ERROR] - Error creating directory '{path}': {_e}")
        raise

def copy_directory(src, dest):
    try:
        if os.path.exists(dest):
            # Remove the existing destination directory
            shutil.rmtree(dest)
            logging.info(f"[{__name__}: copy_directory: {datetime.now()}]: [INFO] - Existing directory at '{dest}' removed")
        shutil.copytree(src, dest)
        logging.info(f"[{__name__}: copy_directory: {datetime.now()}]: [INFO] - Directory copied from '{src}' to '{dest}' successfully")
    except Exception as _e:
        logging.error(f"[{__name__}: copy_directory: {datetime.now()}]: [ERROR] - Error copying directory from '{src}' to '{dest}': {_e}")
        raise

def merge_directories(src, dest):
    try:
        for item in os.listdir(src):
            src_path = os.path.join(src, item)
            dest_path = os.path.join(dest, item)
            if os.path.isdir(src_path):
                shutil.copytree(src_path, dest_path, dirs_exist_ok=True)
            else:
                shutil.copy2(src_path, dest_path)
        logging.info(f"[{__name__}: merge_directories: {datetime.now()}]: [INFO] - Directory merged from '{src}' to '{dest}' successfully")
    except Exception as _e:
        logging.error(f"[{__name__}: merge_directories: {datetime.now()}]: [ERROR] - Error merging directory from '{src}' to '{dest}': {_e}")
        raise
    

def copy_file(src, dest):
    try:
        shutil.copyfile(src, dest)
        logging.info(f"[{__name__}: copy_file: {datetime.now()}]: [INFO] - File copied from '{src}' to '{dest}' successfully")
    except Exception as _e:
        logging.error(f"[{__name__}: copy_file: {datetime.now()}]: [ERROR] - Error copying file from '{src}' to '{dest}': {_e}")
        raise

def deep_copy(file):
    try:
        return copy.deepcopy(file)
    except Exception as _e:
        logging.error(f"[{__name__}: deep copy_file: {datetime.now()}]: [ERROR] - Error copying file  '{file}' : {_e}")
        raise

def remove_file(file_path):
    try:
        if os.path.exists(file_path) and os.path.isfile(file_path):
            os.remove(file_path)
            logging.info(f"[{__name__}: remove_file: {datetime.now()}]: [INFO] - File '{file_path}' deleted successfully")
    except Exception as _e:
        logging.error(f"[{__name__}: remove_file: {datetime.now()}]: [ERROR] - Error deleting file '{file_path}': {_e}")
        raise

def remove_directory(dir_path):
    try:
        if os.path.exists(dir_path) and os.path.isdir(dir_path):
            shutil.rmtree(dir_path)
            logging.info(f"[{__name__}: remove_directory: {datetime.now()}]: [INFO] - Directory '{dir_path}' deleted successfully")
    except Exception as _e:
        logging.error(f"[{__name__}: remove_directory: {datetime.now()}]: [ERROR] - Error deleting directory '{dir_path}': {_e}")
        raise

def move_directory(src, dst):
    try:
        if os.path.exists(src) and os.path.isdir(src):
            original_dst = dst
            counter = 1
            while os.path.exists(dst):
                dst = f"{original_dst}_{counter}"
                counter += 1
            
            shutil.move(src, dst)
            logging.info(f"[{__name__}: move_directory: {datetime.now()}]: [INFO] - Directory '{src}' moved to '{dst}' successfully")
        
        return True
    except Exception as e:
        logging.error(f"[{__name__}: move_directory: {datetime.now()}]: [ERROR] - Error moving directory '{src}' to '{dst}': {e}")
        return False

def save_file(content, file_path):
    try:
        with open(file_path, 'w') as file:
            file.write(json.dumps(content, indent=4))
        logging.info(f"[{__name__}: save_file: {datetime.now()}]: [INFO] - File saved to '{file_path}' successfully")
        return True
    except Exception as _e:
        logging.error(f"[{__name__}: save_file: {datetime.now()}]: [ERROR] - Error saving file to '{file_path}': {_e}")
        return False
    
def save_binary(content, file_path):
    try:
        with open(file_path, 'wb') as f:
                f.write(content)
        logging.info(f"[{__name__}: save_file: {datetime.now()}]: [INFO] - File saved to '{file_path}' successfully")
        return True
    except Exception as _e:
        logging.error(f"[{__name__}: save_file: {datetime.now()}]: [ERROR] - Error saving file to '{file_path}': {_e}")
        return False

def create_path(path, nextPath):
    try:
        return os.path.join(path, str(nextPath))
    except Exception as _e:
        logging.error(f"[{__name__}: create_path: {datetime.now()}]: [ERROR] - Error creating path '{path}': {_e}")
        return None
    
async def extractZipFile(self, file, appUnit_name, Temp_dest_folder):
    try:
        Temp_dest_folder = Temp_dest_folder or tempfile.gettempdir()
        
        # _file_path = create_path(Temp_dest_folder, "temp")
        # create_directory(_file_path)
        # Read the file content
        _file_content = await file.read()
        _file_name = file.filename
        _file_path = create_path(Temp_dest_folder, _file_name)
        # Save the uploaded zip file to the given location
        save_binary(_file_content, _file_path)
        
        # Check if the file is a valid zip file
        
        with zipfile.ZipFile(io.BytesIO(_file_content)) as zip_file:
            # Check if the required files are present
            # _required_files = [f"{appUnit_name.split(".")[0]}/{appUnit_name}", f"{appUnit_name.split(".")[0]}/config/config.json"]
            _required_files = [
                f"{appUnit_name.split('.')[0]}/{appUnit_name}",
                f"{appUnit_name.split('.')[0]}/config/config.json"]
            _zip_contents = zip_file.namelist()
            for _required_file in _required_files:
                if _required_file not in _zip_contents:
                    logging.error(f"[{self.__class__.__name__}: 'extractZipFile': {datetime.now()}]: [ERROR] - The uploaded zip file '{_file_name}' does not contain '{_required_file}'")
                    return False
                
            logging.info(f"[{self.__class__.__name__}: 'extractZipFile': {datetime.now()}]: [INFO] - The uploaded zip file '{_file_name}' contain format is correct")
            # Extract the zip file to the same location
            _extract_path = create_path(Temp_dest_folder, _file_name.rstrip('.zip'))
            zip_file.extractall(_extract_path)
            logging.info(f"[{self.__class__.__name__}: 'extractZipFile': {datetime.now()}]: [INFO] - The uploaded zip file '{_file_name}' extracted successfully")
        
        return True
        
    except zipfile.BadZipFile:
        logging.error(f"[{self.__class__.__name__}: 'extractZipFile': {datetime.now()}]: [ERROR] - The uploaded file '{_file_name}' is not a valid zip file")
        return False
    
    except Exception as _e:
        logging.error(f"[{self.__class__.__name__}: 'extractZipFile': {datetime.now()}]: [ERROR] - An unexpected error occurred: {str(_e)}")
        return False
        
    finally:
        # Clean up variables
        del _file_content, _file_path, _extract_path, _required_files, _zip_contents 
        
        
        
        
        

def create_build_sh(app_name, app_path, rest_port, ws_port, prof_port, instance=0):
    
    logs_path = os.path.join(app_path, 'logs')
    container_name = app_name.replace(" ", "_")
    
    
    docker_command = f"""#!/bin/sh

    docker run  -it --hostname {container_name}_{instance} --name {container_name}_{instance} --restart unless-stopped  
    --volume={app_path + '/'} :/home/test 
    --volume={logs_path + '/'}:/var/log/app 
    -p {rest_port}:8080/tcp -p {ws_port}:8081/tcp -p {prof_port}:2345/tcp -d zaion.ai/zaf-alpine-amd64:0.0.0.1
    """
    
    filename = f'build_{container_name}.sh'
    file_path = os.path.join(app_path, filename)


    with open(file_path, 'w') as file:
        file.write(docker_command)
    
    os.chmod(file_path, 0o755)
    
    print("execute.sh file created successfully with executable permissions.")



def create_run_sh(relative_path, app_path, rest_port, ws_port, prof_port):
    
    main_path = os.path.dirname(relative_path)
    main_path = create_path(main_path, 'debian/zaf')
    create_directory(main_path)

    logs_path = os.path.join(app_path, 'logs')
    
    docker_command = f"""    #! /bin/sh
    
    ## set defult paths
    MAINPATH={main_path + '/'}
    APPPATH={app_path + '/'}  ### set the default ZAU app path. this should mount with docker HOST
    LOGPATH={logs_path + '/'} ### set the defautl log path. this should mount with docker HOST
    
    cd $MAINPATH
    
    ### run the ZAF with params
    ./app --mainpath $MAINPATH --apppath $APPPATH --logpath $LOGPATH --restport {rest_port} --wsport {ws_port} --profport {prof_port}
        """
    
    
    filename = 'run.sh'
    file_path = os.path.join(app_path, filename)

    with open(file_path, 'w') as file:
        file.write(docker_command)
    
    os.chmod(file_path, 0o755)
    
    print("execute.sh file created successfully with executable permissions.")


def execute_sh1(app_path, zid):
    
    container_name = zid.replace(" ", "_")
    filename = f'build_{container_name}.sh'
    file_path = create_path(app_path, filename)
    
    # Check if the file exists
    if not os.path.isfile(file_path):
        return False, HTTPException(status_code=400, detail="File does not exist.")
        # raise HTTPException(status_code=400, detail="File does not exist.")
    
    # Check if the file is executable
    if not os.access(file_path, os.X_OK):
        return False,  HTTPException(status_code=400, detail="File is not executable.")
        # raise HTTPException(status_code=400, detail="File is not executable.")

    try:
        # Execute the shell script at the given file path
        result = subprocess.run(
            ["/bin/bash", file_path],
            check=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        return True, None
    except subprocess.CalledProcessError as e:
        # Return an error if the script fails to execute
        return False,  HTTPException(
            status_code=500, 
            detail=f"Script execution failed: {e.stderr.decode('utf-8')}"
        )
    
        # raise HTTPException(
        #     status_code=500, 
        #     detail=f"Script execution failed: {e.stderr.decode('utf-8')}"
        # )
    
    
    
# async def execute_sh(app_path, zid):
    
#     container_name = zid.replace(" ", "_")
#     filename = f'build_{container_name}.sh'
#     file_path = create_path(app_path, filename)
    
#     logging.info(f"[: {execute_sh.__name__}: {datetime.now()}]: [WARNING] - {file_path}")
#     # Check if the file exists
#     if not os.path.isfile(file_path):
#         logging.error(f"[: {execute_sh.__name__}: {datetime.now()}]: [WARNING] - File does not exist")
#         return False, HTTPException(status_code=400, detail="File does not exist.")
#         # raise HTTPException(status_code=400, detail="File does not exist.")
    
#     # Check if the file is executable
#     if not os.access(file_path, os.X_OK):
#         logging.error(f"[: {execute_sh.__name__}: {datetime.now()}]: [WARNING] - File is not executable.")
#         return False,  HTTPException(status_code=400, detail="File is not executable.")
#         # raise HTTPException(status_code=400, detail="File is not executable.")

#     host_command = f'chroot /host /bin/bash -c "{file_path}"'
    
#     try:
#         # Execute the command on the host
#         logging.info(f"[: {execute_sh.__name__}: {datetime.now()}]: [info] - start execution .sh file")
        
#         result = subprocess.run(host_command, shell=True, capture_output=True, text=True)
#         output = result.stdout
#         error = result.stderr
#         status_code = result.returncode
        
#         logging.info(f"Command executed with return code {status_code}.")
#         logging.info(f"Output: {output}")
#         logging.info(f"Error: {error}")
        
#         if status_code != 0:
#             return False, HTTPException(status_code=500, detail=f"Command failed: {error}")
        
#         return True, None
    
#     except subprocess.CalledProcessError as e:
#         # Return an error if the script fails to execute
#         logging.error(f"[: {execute_sh.__name__}: {datetime.now()}]: [WARNING] - exception  {e.stderr.decode('utf-8')}")
        
#         return False,  HTTPException(
#             status_code=500, 
#             detail=f"Script execution failed: {e.stderr.decode('utf-8')}"
#         )
    
  
  
  
#   WORKING ONE 
    
# async def execute_sh(app_path, zid):
#     container_name = zid.replace(" ", "_")
#     filename = f'build_{container_name}.sh'
#     file_path = create_path(app_path, filename)
    
#     logging.info(f"[: {execute_sh.__name__}: {datetime.now()}]: [WARNING] - {file_path}")
    
#     # Check if the file exists
#     if not os.path.isfile(file_path):
#         logging.error(f"[: {execute_sh.__name__}: {datetime.now()}]: [WARNING] - File does not exist")
#         return False, HTTPException(status_code=400, detail="File does not exist.")
    
#     # Check if the file is executable
#     if not os.access(file_path, os.X_OK):
#         logging.error(f"[: {execute_sh.__name__}: {datetime.now()}]: [WARNING] - File is not executable.")
#         return False,  HTTPException(status_code=400, detail="File is not executable.")
    
#     host_command = f'chroot /host /bin/bash -c "{file_path}"'
    
#     try:
#         # Execute the command on the host
#         logging.info(f"[: {execute_sh.__name__}: {datetime.now()}]: [INFO] - start execution of .sh file")
        
#         # result = subprocess.run(host_command, shell=True, capture_output=True, text=True)
#         # output = result.stdout
#         # error = result.stderr
#         # status_code = result.returncode
        
#         # # stdout, stderr = await proc.communicate()
        
#         # logging.info(f"Command executed with return code {status_code}.")
#         # logging.info(f"Output: {output}")
#         # logging.info(f"Error: {error}")
        
#         proc = await asyncio.create_subprocess_shell(
#             host_command,
#             stdout=asyncio.subprocess.PIPE,
#             stderr=asyncio.subprocess.PIPE
#         )
        
#         stdout, stderr = await proc.communicate()
        
#         output = stdout.decode()
#         error = stderr.decode()
#         status_code = proc.returncode
        
#         logging.info(f"Command executed with return code {status_code}.")
#         logging.info(f"Output: {output}")
#         logging.info(f"Error: {error}")
        
#         if status_code != 0:
#             raise HTTPException(status_code=500, detail=f"Command failed: {error}")
        
#         return True, None
    
#     except Exception as e:
#         logging.error(f"[: {execute_sh.__name__}: {datetime.now()}]: [WARNING] - Exception occurred: {str(e)}")
#         return False, HTTPException(status_code=500, detail=f"Script execution failed: {str(e)}")








async def execute_sh(app_path, zid):
    container_name = zid.replace(" ", "_")
    run_filename = 'run.sh'
    build_filename = f'build_{container_name}.sh'
    
    run_file_path = create_path(app_path, run_filename)
    build_file_path = create_path(app_path, build_filename)
    
    # Check if run.sh exists, if not, use build_{container_name}.sh
    if os.path.isfile(run_file_path):
        file_path = run_file_path
        logging.info(f"[: {execute_sh.__name__}: {datetime.now()}]: [INFO] - Using run.sh")
    elif os.path.isfile(build_file_path):
        file_path = build_file_path
        logging.info(f"[: {execute_sh.__name__}: {datetime.now()}]: [INFO] - Using {build_filename}")
    else:
        logging.error(f"[: {execute_sh.__name__}: {datetime.now()}]: [WARNING] - Neither run.sh nor {build_filename} exist")
        return False, HTTPException(status_code=400, detail="Required script files do not exist.")
    
    logging.info(f"[: {execute_sh.__name__}: {datetime.now()}]: [WARNING] - {file_path}")
    
    # Check if the file is executable
    if not os.access(file_path, os.X_OK):
        logging.error(f"[: {execute_sh.__name__}: {datetime.now()}]: [WARNING] - File is not executable.")
        return False, HTTPException(status_code=400, detail="File is not executable.")
    
    host_command = f'chroot /host /bin/bash -c "{file_path}"'
    
    try:
        # Execute the command on the host
        logging.info(f"[: {execute_sh.__name__}: {datetime.now()}]: [INFO] - start execution of {file_path} file")
        
        proc = await asyncio.create_subprocess_shell(
            host_command,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        
        stdout, stderr = await proc.communicate()
        
        output = stdout.decode()
        error = stderr.decode()
        status_code = proc.returncode
        
        logging.info(f"Command executed with return code {status_code}.")
        logging.info(f"Output: {output}")
        logging.info(f"Error: {error}")
        
        if status_code != 0:
            logging.error(f"[: {execute_sh.__name__}: {datetime.now()}]: [WARNING] - Command failed: {error}")
            return False, HTTPException(status_code=500, detail=f"Command failed: {error}")
        
        return True, None
    
    except Exception as e:
        logging.error(f"[: {execute_sh.__name__}: {datetime.now()}]: [WARNING] - Exception occurred: {str(e)}")
        return False, HTTPException(status_code=500, detail=f"Script execution failed: {str(e)}")