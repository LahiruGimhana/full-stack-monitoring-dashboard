# Use the smallest possible base image
FROM nginx:alpine-slim

# Copy only the necessary files
COPY build/ /usr/share/nginx/html

# Copy the entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Remove default Nginx configuration
RUN rm /etc/nginx/conf.d/default.conf

# Add custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/

# Optimize Nginx and remove unnecessary files
RUN nginx -t && \
    # nginx -s reload && \
    rm -rf /var/cache/apk/* && \
    rm -rf /tmp/*

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]