import axios from "axios";
import appConfig from '../config/config';

const baseURL =  `${appConfig.serverConfig.protocol}://${appConfig.serverConfig.serverIp}:${appConfig.serverConfig.port}`;
 
const axiosInstance = axios.create({
  headers: {
    "Content-type": "application/json",
    "Access-Control-Allow-Origin": "*"
  },
});

const apiClient = {
  get: (endPoint, params = {}) => {
    return new Promise((resolve, reject) => {
      const authToken = sessionStorage.getItem("authToken");
      if (authToken) {
        const headers = { Authorization: `Bearer ${authToken}` };

        // Use 'params' instead of 'data' to send query parameters
        axiosInstance.get(`${baseURL}/${endPoint}`, { headers, params })
          .then(response => resolve(response.data))
          .catch(error => {
            reject(error);
          });
      } else {
        const error = new Error("No authToken available in sessionStorage");
        reject(error);
      }
    });
  },

  post: (endPoint: string, data: unknown) => {
    return new Promise((resolve, reject) => {
      const authToken = sessionStorage.getItem("authToken");
      if (authToken) {
        const headers = { Authorization: `Bearer ${authToken}`};

        axiosInstance.post( `${baseURL}/${endPoint}`, data, { headers })
          .then(response => resolve(response.data))
          .catch(error => {
            // console.error("API request failed:", error);
            reject(error);
          });
      } else {
        const error = new Error("No authToken available in sessionStorage");
        // console.error("API request failed:", error);
        reject(error);
      }
    });
  },

  put: (endPoint: string, data: unknown) => {
    return new Promise((resolve, reject) => {
      const authToken = sessionStorage.getItem("authToken");
      if (authToken) {
        const headers = { Authorization: `Bearer ${authToken}` };
        axiosInstance.put( `${baseURL}/${endPoint}`, data, { headers })
          .then(response => resolve(response.data))
          .catch(error => {
            // console.error("API request failed:", error);
            reject(error);
          });
      } else {
        const error = new Error("No authToken available in sessionStorage");
        // console.error("API request failed:", error);
        reject(error);
      }
    });
  },

  delete: (endPoint: string) => {
    return new Promise((resolve, reject) => {
      const authToken = sessionStorage.getItem("authToken");
      if (authToken) {
        const headers = { Authorization: `Bearer ${authToken}` };
        axiosInstance.delete( `${baseURL}/${endPoint}`, { headers })
          .then(response => resolve(response.data))
          .catch(error => {
            // console.error("API request failed:", error);
            reject(error);
          });
      } else {
        const error = new Error("No authToken available in sessionStorage");
        // console.error("API request failed:", error);
        reject(error);
      }
    });
  },



postFile: (endPoint: string, data: unknown) => {
  return new Promise((resolve, reject) => {
    const authToken = sessionStorage.getItem("authToken");
    if (authToken) {
      const headers = { Authorization: `Bearer ${authToken}`, 'Content-Type': 'multipart/form-data'};

      axiosInstance.post( `${baseURL}/${endPoint}`, data, { headers })
        .then(response => resolve(response.data))
        .catch(error => {
          // console.error("API request failed:", error);
          reject(error);
        });
    } else {
      const error = new Error("No authToken available in sessionStorage");
      // console.error("API request failed:", error);
      reject(error);
    }
  });
},
};

export default apiClient;










// import axios from "axios";

// // const baseurl: string = "http://10.81.49.161:9000"; 
// const baseurl: string = "http://localhost:8000"; 

// const axiosInstance = axios.create({
//   baseurl: string,
//   headers: {
//     "Content-type": "application/json",
//   },
// });

// const authToken = sessionStorage.getItem("authToken");
// const headers =  {Authorization: `Bearer ${authToken}`} ;

// const apiClient = {
//   get: (url: string: string) => {

//     return axiosInstance.get(url: string, { headers });
//   },
//   post: (url: string: string, data: unknown) => {
//     const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};
//     return axiosInstance.post(url: string, data, { headers });
//   },
//   put: (url: string: string, data: unknown) => {
//     const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};
//     return axiosInstance.put(url: string, data, { headers });
//   },
//   delete: (url: string: string) => {
//     const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};
//     return axiosInstance.delete(url: string, { headers });
//   },
// };

// export default apiClient;
