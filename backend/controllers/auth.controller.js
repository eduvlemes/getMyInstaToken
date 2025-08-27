const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

// Handle Instagram login redirect
exports.loginWithInstagram = (req, res) => {
  // Use Instagram API with Instagram Login for Business
  const instagramAuthUrl = `https://api.instagram.com/oauth/authorize?client_id=${process.env.INSTAGRAM_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.INSTAGRAM_REDIRECT_URI)}&scope=instagram_business_basic,instagram_business_manage_messages&response_type=code`;
  
  console.log('Instagram auth URL:', instagramAuthUrl);
  res.json({ redirectUrl: instagramAuthUrl });
};

// Handle Instagram callback after user authorization
exports.instagramCallback = async (req, res) => {
  try {
    const { code } = req.query;
    
    if (!code) {
      return res.status(400).json({ error: true, message: 'Authorization code is required' });
    }

    // Exchange code for access token using Instagram Business API
    // Instagram API expects form-urlencoded data, not JSON
    const formData = new URLSearchParams();
    formData.append('client_id', process.env.INSTAGRAM_CLIENT_ID);
    formData.append('client_secret', process.env.INSTAGRAM_CLIENT_SECRET);
    formData.append('code', code);
    formData.append('redirect_uri', process.env.INSTAGRAM_REDIRECT_URI);
    formData.append('grant_type', 'authorization_code');
    
    const tokenResponse = await axios.post('https://api.instagram.com/oauth/access_token', 
        formData, 
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }
    );

    console.log('Token response:', tokenResponse.data);
    const { access_token, user_id } = tokenResponse.data;
    
    // For Instagram Business API, the user_id is directly returned in the token response
    console.log('Instagram user ID:', user_id);

    // Using Instagram Business API directly without needing to go through Facebook accounts
    let instagram_user_id = user_id;
    let username = '';
    let media_count = 0;
    let fullName = '';
    let profilePicture = '';
    let followersCount = null;
    let followingCount = null;
    
    // Now get Instagram user info
    const igAccountResponse = await axios.get(`https://graph.instagram.com/me`, {
      params: {
        fields: 'id,username,account_type,media_count,profile_picture_url,followers_count,follows_count',
        access_token: access_token
      }
    });
    
    console.log('Instagram User Account response:', igAccountResponse.data);
    
    // Extraindo todos os dados disponíveis da resposta
    username = igAccountResponse.data.username || '';
    media_count = igAccountResponse.data.media_count || 0;
    profilePicture = igAccountResponse.data.profile_picture_url || '';
    followersCount = igAccountResponse.data.followers_count || null;
    followingCount = igAccountResponse.data.follows_count || null;
    
    // Já temos todas as informações necessárias da primeira chamada à API
    // Não precisamos fazer uma segunda chamada para buscar informações adicionais
    
    // Log das informações obtidas para depuração
    console.log('Informações do usuário do Instagram obtidas:');
    console.log('- Username:', username);
    console.log('- Media Count:', media_count);
    console.log('- Profile Picture:', profilePicture ? 'Available' : 'Not available');
    console.log('- Followers Count:', followersCount);
    console.log('- Following Count:', followingCount);

    // Exchange for long-lived token using Instagram Business API
    // According to Instagram documentation, this endpoint accepts GET requests with query parameters
    console.log('Requesting long-lived token...');
    console.log('Using access token:', access_token);
    
    const longLivedTokenResponse = await axios.get('https://graph.instagram.com/access_token', {
      params: {
        grant_type: 'ig_exchange_token',
        client_secret: process.env.INSTAGRAM_CLIENT_SECRET,
        access_token: access_token
      }
    });
    
    console.log('Long-lived token response:', longLivedTokenResponse.data);
    const longLivedToken = longLivedTokenResponse.data.access_token;
    const expiresIn = longLivedTokenResponse.data.expires_in; // In seconds
    const tokenExpiresAt = new Date(Date.now() + expiresIn * 1000);

    // Create or update user in database
    let user = await prisma.user.findUnique({
      where: { instagram_user_id: instagram_user_id.toString() }
    });

    if (user) {
      user = await prisma.user.update({
        where: { instagram_user_id: instagram_user_id.toString() },
        data: {
          username,
          full_name: fullName || username, // Usar username como fallback para full_name
          profile_picture: profilePicture,
          access_token,
          long_lived_token: longLivedToken,
          token_expires_at: tokenExpiresAt,
          posts_count: media_count || null,
          followers_count: followersCount,
          following_count: followingCount,
          // A api_key será gerada automaticamente pelo Prisma para usuários existentes
          // que ainda não possuem api_key (@default(uuid()))
          updated_at: new Date()
        }
      });
    } else {
      user = await prisma.user.create({
        data: {
          instagram_user_id: instagram_user_id.toString(),
          username,
          full_name: fullName || username, // Usar username como fallback para full_name
          profile_picture: profilePicture,
          access_token,
          long_lived_token: longLivedToken,
          token_expires_at: tokenExpiresAt,
          posts_count: media_count || null,
          followers_count: followersCount,
          following_count: followingCount,
          // A api_key será gerada automaticamente pelo Prisma (@default(uuid()))
          created_at: new Date(),
          updated_at: new Date()
        }
      });
    }

    // Generate JWT token
    console.log('Generating JWT token for user ID:', user.id);
    
    const jwtToken = jwt.sign(
      { id: user.id, instagram_user_id: user.instagram_user_id }, 
      process.env.JWT_SECRET, 
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    
    console.log('JWT token generated successfully');

    // Set JWT token in cookie
    res.cookie('token', jwtToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      secure: false, // Set to false for development with HTTP, true for production
      sameSite: 'lax'
    });
    
    console.log('Cookie set with token');

    // Redirect to frontend profile page with the token
    res.redirect(`${process.env.FRONTEND_URL}/profile?token=${jwtToken}`);
    
  } catch (error) {
    console.error('Instagram callback error:', error);
    
    // Log more detailed error information
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
      console.error('Error response headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Error request:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error message:', error.message);
    }
    
    res.status(500).json({ error: true, message: error.message });
  }
};

// Get current user's profile information
exports.getCurrentUser = async (req, res) => {
  try {
    console.log('getCurrentUser called');
    console.log('req.user:', req.user);
    
    if (!req.user) {
      return res.status(401).json({ error: true, message: 'Authentication required' });
    }
    
    console.log('Looking up user with ID:', req.user.id);
    
    // User should be attached to req by auth middleware
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        instagram_user_id: true,
        username: true,
        full_name: true,
        profile_picture: true,
        posts_count: true,
        followers_count: true,
        following_count: true,
        api_key: true,  // Incluir a api_key na resposta
        token_expires_at: true,  // Incluir a data de expiração do token
        created_at: true,
        updated_at: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: true, message: 'User not found' });
    }

    res.json({ error: false, user });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

// Logout
exports.logout = (req, res) => {
  res.clearCookie('token');
  res.json({ error: false, message: 'Successfully logged out' });
};
