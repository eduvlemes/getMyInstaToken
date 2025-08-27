const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Get user profile by ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        instagram_user_id: true,
        username: true,
        full_name: true,
        profile_picture: true,
        api_key: true,
        posts_count: true,
        followers_count: true,
        following_count: true,
        created_at: true,
        updated_at: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: true, message: 'User not found' });
    }

    res.json({ error: false, user });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

// Update user profile
exports.updateUser = async (req, res) => {
  try {
    // Only allow updating certain fields
    const { username, full_name, profile_picture } = req.body;
    const { id } = req.params;
    
    // Ensure user can only update their own profile
    if (parseInt(id) !== req.user.id) {
      return res.status(403).json({ error: true, message: 'Forbidden: You can only update your own profile' });
    }
    
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        username,
        full_name,
        profile_picture
      },
      select: {
        id: true,
        instagram_user_id: true,
        username: true,
        full_name: true,
        profile_picture: true,
        api_key: true,
        posts_count: true,
        followers_count: true,
        following_count: true,
        created_at: true,
        updated_at: true
      }
    });
    
    res.json({ error: false, user: updatedUser });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

// Regenerate API key for user
exports.regenerateApiKey = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: true, message: 'Authentication required' });
    }
    
    // Gerar um novo UUID usando a função nativa do PostgreSQL
    try {
      // Usar Prisma.$executeRaw para executar SQL nativo para gerar um novo UUID
      await prisma.$executeRaw`UPDATE "User" SET api_key = gen_random_uuid() WHERE id = ${req.user.id}`;
      
      // Buscar o usuário atualizado com o novo api_key
      const updatedUser = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          api_key: true
        }
      });
      
      res.json({ 
        error: false, 
        message: 'API key regenerated successfully',
        api_key: updatedUser.api_key
      });
    } catch (sqlError) {
      console.error('SQL Error during API key regeneration:', sqlError);
      res.status(500).json({ error: true, message: 'Failed to regenerate API key. Database may not support gen_random_uuid().' });
    }
  } catch (error) {
    console.error('Regenerate API key error:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};
