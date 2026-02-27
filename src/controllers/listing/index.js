const { getListings } = require('./getListings');
const { getListingById } = require('./getListingById');
const { createListing } = require('./createListing');
const { updateListing } = require('./updateListing');
const { deleteListing } = require('./deleteListing');
const { getMyListings } = require('./getMyListings');

module.exports = {
  getListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
  getMyListings
};
