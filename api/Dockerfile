FROM alpine:3.14

LABEL version="1.0"
LABEL maintainer="team@zaion.ai"

# Install necessary packages
RUN apk add --update --no-cache python3 sqlite-dev nano asterisk \
    && ln -sf python3 /usr/bin/python \
    && python3 -m ensurepip \
    && pip3 install --no-cache --upgrade pip setuptools

# Set root as the working directory
WORKDIR /API

# Copy the entire project directory to the container
COPY . /API

# Install Python dependencies
RUN pip3 install --no-cache -r /API/setup/requirements.txt

# Expose port (this can be overridden at runtime)
EXPOSE 9000

# Command to run FastAPI server
CMD ["uvicorn", "bin.main:app", "--host", "0.0.0.0", "--port", "9000"]
