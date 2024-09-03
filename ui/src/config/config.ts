  // interface ClientConfig {
  //   serverIp: string;
  //   protocol: 'http' | 'https';
  //   port: number;
  // }
  
  // interface ServerConfig {
  //   serverIp: string;
  //   protocol: 'http' | 'https';
  //   port: number;
  // }
  
  // interface AppConfig {
  //   clientConfig: ClientConfig;
  //   serverConfig: ServerConfig;
  // }



  
  // const clientConfig: ClientConfig = {
  //   serverIp: '127.0.0.1',
  //   protocol: 'http',
  //   port: 5173,
  // };
  
  // // const serverConfig: ServerConfig = {
  // //   serverIp: '10.81.49.161',
  // //   protocol: 'http',
  // //   port: 9000,
  // // };
  
  // // const serverConfig: ServerConfig = {
  // //   serverIp: '10.9.0.210',
  // //   protocol: 'http',
  // //   port: 8000,
  // // };
  // const serverConfig: ServerConfig = {
  //   serverIp: '127.0.0.1',
  //   protocol: 'http',
  //   port: 8000,
  // };
  






  // const appConfig: AppConfig = {
  //   clientConfig: clientConfig,
  //   serverConfig: serverConfig,
  // };
  
  // export default appConfig;














  interface ClientConfig {
    serverIp: string;
    protocol: 'http' | 'https';
    port: number;
  }
  
  interface ServerConfig {
    serverIp: string;
    protocol: 'http' | 'https';
    port: number;
  }
  
  interface AppConfig {
    clientConfig: ClientConfig;
    serverConfig: ServerConfig;
    retryCount: number;
    maxRetries: number;
    retryDelay: number;
  }
  
  const clientConfig: ClientConfig = {
    serverIp: process.env.REACT_APP_CLIENT_SERVER_IP || '127.0.0.1', //'127.0.0.1',
    protocol: process.env.REACT_APP_CLIENT_PROTOCOL as 'http' | 'https' || 'http',
    port: parseInt(process.env.REACT_APP_CLIENT_PORT || '5173', 10),
  };
  
  const serverConfig: ServerConfig = {
    serverIp: process.env.REACT_APP_SERVER_SERVER_IP || '127.0.0.1', //'127.0.0.1',
    protocol: process.env.REACT_APP_SERVER_PROTOCOL as 'http' | 'https' || 'http',
    port: parseInt(process.env.REACT_APP_SERVER_PORT || '8000', 10),
  };
  
  const appConfig: AppConfig = {
    clientConfig: clientConfig,
    serverConfig: serverConfig,
    retryCount: parseInt(process.env.REACT_APP_RETRY_COUNT || '0', 10),
    maxRetries: parseInt(process.env.REACT_APP_MAX_RETRIES || '2', 10),
    retryDelay: parseInt(process.env.REACT_APP_RETRY_DELAY || '1000', 10),
    version: "1.0.0"
  };
  
  export default appConfig;
  
  
  