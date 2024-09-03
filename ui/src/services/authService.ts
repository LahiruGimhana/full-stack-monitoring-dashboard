import axios from "axios";
import appConfig from '../config/config';

const baseURL =  `${appConfig.serverConfig.protocol}://${appConfig.serverConfig.serverIp}:${appConfig.serverConfig.port}`;
 

const axiosInstance = axios.create({
  headers: {
    "Content-type": "application/json",
  },
});

const authClient = {
  // get: (url: string) => {
  //   return axiosInstance.get(url)
  //     .then(response => response.data)
  //     .catch(handleApiError);
  // },
  // post: (url: string, data: unknown) => {
  //   return axiosInstance.post(url, data)
  //     .then(response => response.data)
  //     .catch(error => {
  //       handleApiError(error);
  //       reject(error);
  //     });
  // },
  post: (endPoint: string, data: unknown) => {
    const url = `${baseURL}${endPoint}`;

    return new Promise((resolve, reject) => {
        axiosInstance.post( url, data)
          .then(response => resolve(response.data))
          .catch(error => {
            handleApiError(error);
            reject(error);
          });
     
    });
  },

  get: (endPoint: string, token: string) => {
    return new Promise((resolve, reject) => {
      axiosInstance.get(`${baseURL}/${endPoint}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(response => {
        resolve(response);
      })
      .catch(error => {
        handleApiError(error);
        reject(error);
      });
    });
  },
}

const handleApiError = (error: Error) =>{
  console.error("API request failed:", error);
}

export default authClient;
