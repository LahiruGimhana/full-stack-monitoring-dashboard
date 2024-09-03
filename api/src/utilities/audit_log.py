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

from datetime import datetime
import os

class AuditEntry:
    def __init__(self, base_dir, user, role, company, action, status, error):
        super().__init__()
        self.base_dir = base_dir
        self.user = user
        self.role = role
        self.company = company
        self.action = action
        self.status = status
        self.error = error

def print_log(audit_entry: AuditEntry):
    logs_dir = os.path.join(audit_entry.base_dir, "audit")
    if not os.path.exists(logs_dir):
        os.makedirs(logs_dir)
        
    audit_log_path = os.path.join(logs_dir, "audit_log.log")
    file_exists = os.path.isfile(audit_log_path)

    with open(audit_log_path, "a") as file:
        if not file_exists:
            file.write("ID,Date of Action,User,Role,Action,Company,Status,Error\n")
        
        file.write(f"audit_{datetime.now().strftime('%Y%m%d%H%M%S%f')},"
                   f"{audit_entry.user},"
                   f"{audit_entry.role},"
                   f"{audit_entry.company},"
                   f"{audit_entry.action},"
                   f"{audit_entry.status},"
                   f"{audit_entry.error}\n")
