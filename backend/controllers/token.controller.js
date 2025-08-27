const { PrismaClient } = require('@prisma/client');
const axios = require('axios');

const prisma = new PrismaClient();

// Função para atualizar um token do Instagram
async function refreshInstagramToken(token) {
  const refreshResponse = await axios.get('https://graph.instagram.com/refresh_access_token', {
    params: {
      grant_type: 'ig_refresh_token',
      access_token: token
    }
  });

  const refreshedToken = refreshResponse.data.access_token;
  const expiresIn = refreshResponse.data.expires_in; // Em segundos
  const tokenExpiresAt = new Date(Date.now() + expiresIn * 1000);
  
  return {
    token: refreshedToken,
    expiresAt: tokenExpiresAt
  };
}

// Get user's token JavaScript file
exports.getUserToken = async (req, res) => {
  try {
    const { apiKey } = req.params;
    
    if (!apiKey) {
      return res.status(400).json({ error: 'API Key is required' });
    }
    
    console.log('Looking up user with API Key:', apiKey);
    
    // Find user by api_key instead of id
    const user = await prisma.user.findUnique({
      where: { api_key: apiKey },
      select: {
        id: true,
        long_lived_token: true,
        token_expires_at: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found with the provided API Key' });
    }
    
    if (!user.long_lived_token) {
      return res.status(404).json({ error: 'Instagram token not found for this user' });
    }

    // Check if token is expired and needs to be refreshed
    const now = new Date();
    if (user.token_expires_at && user.token_expires_at < now) {
      // Token has expired, but we can't automatically refresh it without user intervention
      return res.status(401).json({ error: 'Token has expired. User needs to reconnect with Instagram.' });
    }

    // Set content type to JavaScript
    res.setHeader('Content-Type', 'application/javascript');
    
    // Return JavaScript code with the token
    res.send(`window.myInstagramToken = "${user.long_lived_token}";`);
    
  } catch (error) {
    console.error('Get user token error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Refresh long-lived token
exports.refreshToken = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Ensure user can only refresh their own token
    if (parseInt(id) !== req.user.id) {
      return res.status(403).json({ error: true, message: 'Forbidden: You can only refresh your own token' });
    }
    
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        instagram_user_id: true, 
        username: true,
        long_lived_token: true,
        token_expires_at: true
      }
    });

    if (!user || !user.long_lived_token) {
      return res.status(404).json({ error: true, message: 'User or token not found' });
    }

    console.log(`Manual refresh requested for user ${user.id} (${user.username})`);
    
    try {
      // Refresh long-lived token using nossa função utilitária
      const refreshedData = await refreshInstagramToken(user.long_lived_token);

      // Update token in database
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          long_lived_token: refreshedData.token,
          token_expires_at: refreshedData.expiresAt
        },
        select: {
          token_expires_at: true
        }
      });

      console.log(`Token refreshed successfully for user ${user.id} (${user.username}), new expiration: ${refreshedData.expiresAt}`);

      res.json({ 
        error: false, 
        message: 'Token refreshed successfully',
        expires_at: updatedUser.token_expires_at
      });
    } catch (refreshError) {
      console.error(`Error refreshing token for user ${user.id} (${user.username}):`, refreshError.message);
      res.status(500).json({ error: true, message: `Failed to refresh Instagram token: ${refreshError.message}` });
    }
    
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

// Get token information
exports.getTokenInfo = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: true, message: 'Authentication required' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        username: true,
        long_lived_token: true,
        token_expires_at: true,
        api_key: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: true, message: 'User not found' });
    }

    res.json({
      error: false,
      data: {
        user_id: user.id,
        username: user.username,
        has_token: !!user.long_lived_token,
        expires_at: user.token_expires_at,
        api_key: user.api_key
      }
    });
  } catch (error) {
    console.error('Get token info error:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};
