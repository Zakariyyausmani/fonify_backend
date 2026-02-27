const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/authMiddleware');

// Define routes
const routes = [
  { path: '/auth', route: require('../authRoutes'), protected: false },
  { path: '/users', route: require('../userRoutes'), protected: true },
  { path: '/listings', route: require('../listingRoutes'), protected: true },
  { path: '/messages', route: require('../messageRoutes'), protected: true },
  { path: '/admin', route: require('../adminRoutes'), protected: true },
  { path: '/verification', route: require('../verificationRoutes'), protected: true },
  { path: '/notifications', route: require('../notificationRoutes'), protected: true },
];

// Register routes
routes.forEach((route) => {
  if (route.protected) {
    router.use(route.path, protect, route.route);
  } else {
    router.use(route.path, route.route);
  }
});

module.exports = router;
