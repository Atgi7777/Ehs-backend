
const jwt = require('jsonwebtoken');

const verifyEmailGeneric = async (req, res, model) => {
  try {
    const { token } = req.query;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await model.findByPk(decoded.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const tokenIssuedAt = decoded.iat * 1000;
    const currentTime = new Date().getTime();
    if (currentTime - tokenIssuedAt > 3600000) {
      await user.destroy();
      return res.status(410).json({ message: 'Token expired and user deleted.' });
    }

    user.verified = true;
    await user.save();

    res.status(200).json({ message: 'Email verified successfully.' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Invalid or expired token' });
  }
};

module.exports = verifyEmailGeneric;
