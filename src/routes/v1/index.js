const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/authMiddleware');

// Define routes
const routes = [
  { path: '/auth', route: require('../authRoutes'), protected: false },
  { path: '/users', route: require('../userRoutes'), protected: true },
  { path: '/listings', route: require('../listingRoutes'), protected: false },
  { path: '/messages', route: require('../messageRoutes'), protected: true },
  { path: '/admin', route: require('../adminRoutes'), protected: true },
  { path: '/verification', route: require('../verificationRoutes'), protected: true },
  { path: '/notifications', route: require('../notificationRoutes'), protected: true },
  { path: '/offers', route: require('../offerRoutes'), protected: true },
  { path: '/transactions', route: require('../transactionRoutes'), protected: true },
  { path: '/reviews', route: require('../reviewRoutes'), protected: true },
  { path: '/reports', route: require('../reportRoutes'), protected: true },
  { path: '/phone-models', route: require('../phoneModelRoutes'), protected: false },
  { path: '/utils', route: require('../utilRoutes'), protected: false },
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
