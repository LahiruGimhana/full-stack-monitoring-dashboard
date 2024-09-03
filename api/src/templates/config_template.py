appconfig_template ={
    "app": {
      "name": "",
      "id": "AppTest_1",
      "version": "1.0.0.0"
    },
    "log":{
      "leg_level": "debug",
      "log_file_max_size": 10000,
      "log_file_base_path": "/var/log/app/"
    },
    "appunits": [{
      "uname": "",
      "enable": 1,
      "pool_size": 1,
      "ifname": "",
      "path": "",
      "name": ""
    }]
  }


mainconfig_template = {
    "log": {
      "leg_level": "debug",
      "log_file_max_size": 10000,
      "log_file_base_path": "/var/log/app/"
    },
    "http_monitor": {
      "enable": 1,
      "ip_addr": "0.0.0.0",
      "port": 8080,
      "profiler_port": 8881
    },
    "ws_monitor": {
      "enable": 1,
      "auto_start": 0,
      "ip_addr": "0.0.0.0",
      "port": 2345
    },
    "mq_engine": {
      "enable": 0,
      "ifname": "IMQClient",
      "path": "plugins/mq/redis/",
      "name": "zredisclient.so"
    },
    "http": {
      "enable": 1,
      "ifname": "IZHTTPClient",
      "path": "plugins/http/",
      "name": "zhttpclient.so"
    },
    "websocket": {
      "enable": 1,
      "ifname": "IZWSClient",
      "path": "plugins/websocket/",
      "name": "zwsclient.so"
    },
    "logger": {
      "enable": 1,
      "ifname": "IZLogger",
      "path": "plugins/logger/",
      "name": "zlogger.so"
    },
    "mailer": {
      "enable": 1,
      "ifname": "IZMailMessage",
      "path": "plugins/mailer/",
      "name": "zmailer.so"
    }
  }