# react-monitoring-dashboard
docker build -t zaion-monitoring-ui .
docker run -d -p 5173:80 zaion-monitoring-ui

docker run -d -p 5173:80 --name zaion-monitoring-ui zaion-monitoring-ui
