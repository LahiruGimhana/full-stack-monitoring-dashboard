import time
from locust import HttpUser, task, between

class FastAPIUser(HttpUser):
    wait_time = between(1, 5)
    auth_token = None

    def on_start(self):
        if not FastAPIUser.auth_token:
            # Perform login and store the token
            with self.client.post("/auth/login", json={"userName": "user", "password": "123456"}, catch_response=True) as response:
                if response.status_code == 200:
                    FastAPIUser.auth_token = response.json().get("data", {}).get("auth_token")
                    if not FastAPIUser.auth_token:
                        response.failure("Login succeeded but no auth token found in response")
                else:
                    response.failure(f"Login failed: {response.text}")


    # get request
    def get_request_with_auth(self, method, url, **kwargs):
        if self.auth_token:
            headers = kwargs.pop("headers", {})
            headers["Authorization"] = f"Bearer {self.auth_token}"
            kwargs["headers"] = headers
        with self.client.request(method, url, catch_response=True, **kwargs) as response:
            if response.status_code >= 400:
                response.failure(f"{method} {url} failed: {response.text}")
            else:
                response.success()
        return response


    @task
    def getAllApplication(self):
        response = self.get_request_with_auth("GET", "/application")
        if response.status_code != 200:
            response.failure(f"GET /api/v1/application failed: {response.text}")

   
    @task
    def getAllAppUnits(self):
        response = self.get_request_with_auth("GET", "/application/appunits/2")
        if response.status_code != 200:
            response.failure(f"GET /api/v1/application/appUnits/2 failed: {response.text}")

   
    @task
    def getAllCompany(self):
        response = self.get_request_with_auth("GET", "/company")
        if response.status_code != 200:
            response.failure(f"GET /api/v1/company failed: {response.text}")

   
    @task
    def getAllUsers(self):
        response = self.get_request_with_auth("GET", "/user")
        if response.status_code != 200:
            response.failure(f"GET /api/v1/user failed: {response.text}")

   



   #post req