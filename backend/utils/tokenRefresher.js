const { PrismaClient } = require('@prisma/client');
const axios = require('axios');

const prisma = new PrismaClient();

// Refresh tokens that are about to expire (within the next day)
const refreshTokens = async () => {
  try {
    console.log('Running token refresh scheduler...');
    
    const oneDayFromNow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    
    const usersToRefresh = await prisma.user.findMany({
      where: {
        long_lived_token: { not: null },
        token_expires_at: {
          lt: oneDayFromNow
        }
      }
    });

    console.log(`Found ${usersToRefresh.length} tokens to refresh`);
    
    for (const user of usersToRefresh) {
      try {
        console.log(`Refreshing token for user ${user.id} (${user.username})...`);
        
        const refreshResponse = await axios.get('https://graph.instagram.com/refresh_access_token', {
          params: {
            grant_type: 'ig_refresh_token',
            access_token: user.long_lived_token
          }
        });

        const refreshedToken = refreshResponse.data.access_token;
        const expiresIn = refreshResponse.data.expires_in; // In seconds
        const tokenExpiresAt = new Date(Date.now() + expiresIn * 1000);

        await prisma.user.update({
          where: { id: user.id },
          data: {
            long_lived_token: refreshedToken,
            token_expires_at: tokenExpiresAt
          }
        });
        
        console.log(`Successfully refreshed token for user ${user.id} (${user.username}), new expiration: ${tokenExpiresAt}`);
      } catch (error) {
        console.error(`Error refreshing token for user ${user.id} (${user.username}):`, error.message);
      }
    }
  } catch (error) {
    console.error('Token refresh scheduler error:', error);
  }
};

// Schedule token refresh to run daily
const setupTokenRefreshScheduler = () => {
  // Run immediately on startup
  refreshTokens();
  
  // Then schedule to run daily
  setInterval(refreshTokens, 24 * 60 * 60 * 1000);
  
  console.log('Token refresh scheduler set up to run daily');
};

module.exports = { setupTokenRefreshScheduler };
