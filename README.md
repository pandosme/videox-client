# VideoX Client

Web-based management interface for the VideoX recording engine. This client lets administrators and integrators manage Axis cameras, monitor status, and browse recordings stored on an existing VideoX server.

**Important**: VideoX is a recording engine, not a full VMS. This repository contains only the client. A VideoX server must already be installed and reachable before deploying this client.   

VideoX Server: https://github.com/pandosme/videox

The client can access several VideoX Servers when logging in.

## Audience

This document targets:

- System administrators deploying the VideoX client in production environments.
- Integrators installing and configuring the client for customers.

## Prerequisites

- Existing VideoX server installation with a reachable HTTP/HTTPS endpoint.
- Node.js v16 or higher (for building the client).
- npm or yarn.
- A web server for static files (Nginx, Apache, or container platform such as Docker).
- Network connectivity from client users’ browsers to the VideoX server.

## Quick Start (Local Testing)

For evaluation or lab setups:

```
git clone https://github.com/pandosme/videox-client
cd videox-client

# Install dependencies
npm install

# Start development server
npm run dev
```

By default the development server listens on `http://localhost:5173`. Configure connections to your existing VideoX server inside the running client (see “Server Connections” below). 

> Use this mode only for testing and development, not for production.

## Production Installation

### 1. Build the Client

On a build machine or deployment host:

```
git clone https://github.com/pandosme/videox-client
cd videox-client

npm install
npm run build
```

The production build is created in the `dist/` directory. 

### 2. Deploy as Static Files (Nginx Example)

Copy the built files to your web root:

```
sudo mkdir -p /var/www/videox-client
sudo cp -r dist/* /var/www/videox-client/
```

Example Nginx configuration:

```
server {
    listen 80;
    server_name videox-client.example.com;

    root /var/www/videox-client;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Optional: gzip for better performance
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

Reload Nginx:

```
sudo nginx -t
sudo systemctl reload nginx
```

## Security and Network Notes

- Deploy the client over HTTPS in production.
- Ensure that the client origin is allowed by the VideoX server’s CORS policy.
- Restrict access to the client and VideoX server to trusted networks or via VPN/reverse proxy.
- Do not expose the VideoX server or client directly to the internet without proper access control and TLS termination.

## Basic Usage (For Admins/Integrators)

After connecting to an existing VideoX server:

- Log in using credentials configured on that server.
- Use the client to:
  - Add and configure Axis cameras.
  - Enable/disable recording.
  - Browse and playback recordings stored on the VideoX server.
  - Inspect storage usage and recording retention information.

The exact capabilities available depend on the VideoX server configuration.

## Troubleshooting (Client-Side)

### Cannot Reach VideoX Server

- Confirm the VideoX server is running and reachable from the client network.
- Check that the server address and port in the client match the actual deployment.
- Verify firewalls and reverse proxies allow traffic from user browsers to the VideoX server.

### CORS / Browser Errors

- If the browser reports CORS issues, update the VideoX server configuration to allow the client’s origin.
- Ensure protocol (http/https), host, and port in the VideoX CORS configuration match the client URL exactly.

### Login Fails

- Verify credentials against the VideoX server configuration.
- Confirm the VideoX server authentication settings and user accounts.
- When deplying HTTPS, both client and server must use HTTPS

