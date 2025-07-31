module.exports = {
  apps: [{
    name: 'conference-backend',
    script: 'java',
    args: '-jar ConferenceRoomMgtsys/target/ConferenceRoomMgtsys-0.0.1-SNAPSHOT.jar',
    cwd: '/var/www/conferenceroomapp/Conferenceroomsystem',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      GOOGLE_CLIENT_ID: '851412910623-bmcsbrgp2ue1aqerc8tla1vqjnjc9rl0.apps.googleusercontent.com',
      GOOGLE_CLIENT_SECRET: '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'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
