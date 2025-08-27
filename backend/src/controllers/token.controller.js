const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Get token information including expiration date
 */
const getTokenInfo = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get the user's token information from the database
    const user = await prisma.user.findUnique({
      where: {
        id: userId
      },
      select: {
        token_expires_at: true,
        long_lived_token: true,
        access_token: false, // Don't return the actual token for security
        created_at: true,
        updated_at: true
      }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if subscription is active or in trial period
    const subscription = await prisma.subscription.findFirst({
      where: {
        user_id: userId,
        OR: [
          { status: 'active' },
          { 
            trial_ends_at: {
              gt: new Date() // Trial period hasn't ended yet
            } 
          }
        ]
      }
    });
    
    // Prepare token info to return
    const tokenInfo = {
      expires_at: user.token_expires_at,
      created_at: user.created_at,
      updated_at: user.updated_at
    };
    
    // If no active subscription or trial, token will expire soon
    if (!subscription) {
      // Set token expiration to be 1 day from now for demo purposes
      // In a real application, you might want to check the trial_ends_at date
      const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
      tokenInfo.expires_at = new Date(Date.now() + oneDay);
    }
    
    return res.status(200).json(tokenInfo);
  } catch (error) {
    console.error('Error getting token info:', error);
    return res.status(500).json({ error: 'Failed to retrieve token information' });
  }
};

module.exports = {
  getTokenInfo
};
