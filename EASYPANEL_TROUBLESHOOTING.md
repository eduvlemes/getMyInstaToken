# EasyPanel Deployment Guide

## Important Configuration

To resolve the SIGTERM shutdown issue:

1. **Container Settings**:
   - In the EasyPanel UI, set the container memory limit to at least 512MB
   - Increase the healthcheck interval to at least 30 seconds

2. **Environment Variables**:
   - Make sure `PORT=3000` is set
   - Set `NODE_ENV=production`

3. **Advanced Options**:
   - Set the startup command to: `cd backend && node server.minimal.js`
   - Set the healthcheck command to: `sh healthcheck.sh`

## Troubleshooting

If you still see SIGTERM errors:

1. Check the container logs for memory usage issues
2. Try increasing the memory limit further
3. Set `NODE_OPTIONS=--max-old-space-size=256` to limit memory usage
4. Disable any database operations on startup

## Important Files

- `server.minimal.js`: Simplified server with no database access
- `healthcheck.sh`: Script to check application health
- `.nixpacks.toml`: EasyPanel build configuration
