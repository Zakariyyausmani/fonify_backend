const { toggleMode } = require('./toggleMode');
const { updateProfile } = require('./updateProfile');
const { getFavorites } = require('./getFavorites');
const { toggleFavorite } = require('./toggleFavorite');
const { verifyIdentity } = require('./verifyIdentity');
const { updateShopInfo } = require('./updateShopInfo');
const { getPublicProfile } = require('./getPublicProfile');
const { getAdminContact } = require('./getAdminContact');

module.exports = {
  toggleMode,
  updateProfile,
  getFavorites,
  toggleFavorite,
  verifyIdentity,
  updateShopInfo,
  getPublicProfile,
  getAdminContact
};
