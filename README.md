# VideoX Client

Web-based client application for managing VideoX Video Management System (VMS) servers. Connect to one or more VideoX backend servers to manage cameras, view recordings, and configure storage.

## Features

- **Multi-Server Support**: Connect to multiple VideoX backend servers
- **Server Management**: Add, edit, and test server connections
- **Camera Management**: View, add, edit, and delete cameras
- **Recording Browser**: Browse and view recorded footage
- **Storage Management**: Monitor storage usage and integrity
- **Live Status**: Real-time camera online/recording status
- **User Preferences**: Customizable date/time formats

## Prerequisites

- **Node.js**: v16 or higher
- **npm** or **yarn**: Package manager
- **VideoX Server**: Running backend instance (see [videox](https://github.com/yourusername/videox))

## Installation

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd videox-client
```

### 2. Install Dependencies

```bash
npm install
```

## Development

### Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Configuration

### Server Connection

The client uses local browser storage to manage server configurations. No configuration files are needed.

On first launch:
1. Click "Add New Server"
2. Enter server details:
   - **Name**: Friendly name for the server
   - **Address**: IP address or hostname
   - **Port**: Server port (default: 3002)
   - **TLS**: Enable for HTTPS connections
3. Click "Test Connection" to verify
4. Click "Add" to save

### Multiple Servers

You can configure multiple VideoX servers and switch between them:
1. Add multiple servers using "Add New Server"
2. Select the desired server from the dropdown
3. Log in with server-specific credentials

Server configurations are stored in browser localStorage and persist across sessions.

## Deployment

### Option 1: Static Hosting (Recommended)

Deploy the built files to any static hosting service:

**Nginx:**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/videox-client/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Optional: Enable gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

**Apache (.htaccess):**
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

### Option 2: Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod
```

### Option 3: Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### Option 4: Docker

Create `Dockerfile`:
```dockerfile
FROM node:16-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Create `nginx.conf`:
```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Build and run:
```bash
docker build -t videox-client .
docker run -p 8080:80 videox-client
```

## Usage

### First Time Setup

1. **Add a Server**:
   - Launch the application
   - Click "Add New Server"
   - Enter your VideoX server details
   - Test the connection
   - Save the server

2. **Login**:
   - Select your server
   - Enter username and password
   - Click "Login"

### Managing Cameras

**Add Camera:**
1. Navigate to "Cameras" page
2. Click "Add Camera"
3. Enter camera details:
   - Name
   - Serial number
   - IP address/hostname
   - HTTP port (for VAPIX API, default: 80)
   - RTSP port (for streaming, default: 554)
   - Credentials
   - Resolution and frame rate
4. Click "Test Connection"
5. Click "Add Camera"

**View Camera Status:**
- Online/Offline indicator
- Recording active/inactive status
- Live thumbnail (click to refresh)

**Edit Camera:**
- Click the edit icon on any camera
- Modify settings
- Save changes

**Enable/Disable Recording:**
- Toggle the recording switch for each camera
- Changes take effect immediately

### Browsing Recordings

1. Navigate to "Storage" page
2. Use filters:
   - Camera selection
   - Date range
   - Protected status
3. Click on a recording to view details
4. Download or play recordings

### Storage Management

**View Statistics:**
- Disk usage
- Recording count and size
- Oldest/newest recordings

**Check Integrity:**
- Click "Check Integrity"
- View missing files and orphaned files
- Import or remove orphaned recordings

**Flush All Recordings:**
- Emergency cleanup option
- Deletes all recordings (cannot be undone)

### Settings

**Date/Time Format:**
- Choose between US format (MM/DD/YYYY, 12-hour)
- Or ISO format (YYYY-MM-DD, 24-hour)
- Applies to all timestamps in the application

## Browser Storage

The client stores the following in browser localStorage:
- Server configurations (name, address, port, TLS)
- Selected server ID
- Authentication tokens
- User preferences (date/time format)

**Important**: Passwords are NEVER stored. You must re-authenticate when tokens expire.

### Clearing Data

To reset the client:
```javascript
// Open browser console (F12) and run:
localStorage.clear();
// Then refresh the page
```

## Security Considerations

1. **HTTPS Recommended**: Use HTTPS for both client and server in production
2. **Server Configuration**: Only add trusted VideoX servers
3. **Public Computers**: Use "Logout" to clear tokens on shared computers
4. **Browser Privacy**: Consider using private/incognito mode on public computers

## Troubleshooting

### Cannot Connect to Server

**Problem**: "Connection failed" error when testing server

**Solutions**:
- Verify server is running
- Check server address and port
- Ensure server is accessible from client network
- Check firewall rules
- Verify CORS is configured on server

### Server Requires CORS Configuration

If you get CORS errors, configure the server's `.env`:
```bash
CORS_ORIGIN=http://your-client-domain.com:5173
```

### Authentication Fails

**Problem**: "Invalid credentials" error

**Solutions**:
- Verify username and password
- Check that server credentials match `.env` configuration
- Ensure server is reachable

### Recordings Not Displaying

**Problem**: Recordings page is empty

**Solutions**:
- Verify cameras are recording
- Check storage path on server
- Verify MongoDB connection on server
- Check recording retention policies

## Development

### Project Structure

```
videox-client/
├── src/
│   ├── components/
│   │   ├── layout/       # Sidebar, Header, etc.
│   │   └── ...
│   ├── context/          # React contexts
│   │   ├── AuthContext.jsx
│   │   └── ToastContext.jsx
│   ├── pages/            # Page components
│   │   ├── Login.jsx
│   │   ├── Cameras.jsx
│   │   ├── Storage.jsx
│   │   └── Settings.jsx
│   ├── services/         # API services
│   │   ├── api.js        # Axios instance
│   │   ├── serverConfig.js  # Server management
│   │   ├── cameras.js
│   │   ├── recordings.js
│   │   └── ...
│   ├── utils/            # Utilities
│   │   └── dateFormatter.js
│   ├── App.jsx           # Main app component
│   └── main.jsx          # Entry point
├── public/               # Static assets
├── index.html            # HTML template
├── vite.config.js        # Vite configuration
├── package.json          # Dependencies
└── README.md             # This file
```

### Tech Stack

- **React 19**: UI framework
- **React Router**: Navigation
- **Material-UI (MUI)**: Component library
- **Axios**: HTTP client
- **Vite**: Build tool
- **Video.js**: Video player for HLS playback

### Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

[Your License Here]

## Related Projects

- [VideoX Server](https://github.com/yourusername/videox) - Backend VMS server

## Support

For issues and questions, please open an issue on GitHub.
