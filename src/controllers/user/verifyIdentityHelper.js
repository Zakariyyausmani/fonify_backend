const handleFiles = (req, user) => {
  if (!req.files) return;
  console.log('Processing files...');
  if (!user.cnicImages) {
    user.cnicImages = { front: '', back: '' };
  }
  if (req.files.cnicFront && req.files.cnicFront[0]) {
    user.cnicImages.front = req.files.cnicFront[0].path;
  }
  if (req.files.cnicBack && req.files.cnicBack[0]) {
    user.cnicImages.back = req.files.cnicBack[0].path;
  }
  if (req.files.selfie && req.files.selfie[0]) {
    user.selfieImage = req.files.selfie[0].path;
  }
  user.markModified('cnicImages');
};

const parseLocation = (location, user) => {
  if (!location) return;
  console.log('Processing location...');
  if (typeof location === 'string') {
    try { location = JSON.parse(location); } catch (e) { console.error(e.message); }
  }
  if (location && (Array.isArray(location.coordinates) || (location.lat && location.lng))) {
    let coords = Array.isArray(location.coordinates)
      ? [parseFloat(location.coordinates[0]) || 0, parseFloat(location.coordinates[1]) || 0]
      : [parseFloat(location.lng) || 0, parseFloat(location.lat) || 0];

    if (!user.location) user.location = { type: 'Point', coordinates: [0, 0] };
    user.location.type = 'Point';
    user.location.coordinates = coords;
    user.markModified('location');
  }
};

const parseDetails = (details, user) => {
  if (!details) return;
  console.log('Processing details...');
  if (typeof details === 'string') {
    try { details = JSON.parse(details); } catch (e) { console.error(e.message); }
  }
  if (typeof details === 'object' && details !== null) {
    for (const [key, value] of Object.entries(details)) {
      user.identityVerificationDetails.set(key, String(value));
    }
  }
};

module.exports = { handleFiles, parseLocation, parseDetails };
