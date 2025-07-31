module.exports = {
  apps: [{
    name: 'conference-backend',
    script: 'java',
    args: '-jar target/ConferenceRoomMgtsys-0.0.1-SNAPSHOT.jar',
    cwd: '/var/www/conferenceroomapp/Conferenceroomsystem/ConferenceRoomMgtsys',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      // You can move these to .env file or use PM2's ecosystem secret support
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET
    },
    error_file: '/var/www/conferenceroomapp/Conferenceroomsystem/logs/err.log',
    out_file: '/var/www/conferenceroomapp/Conferenceroomsystem/logs/out.log',
    log_file: '/var/www/conferenceroomapp/Conferenceroomsystem/logs/combined.log',
    time: true
  }]
};
