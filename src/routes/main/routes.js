const express = require("express");
const router = express.Router();

// Import routes
const adminRoutes = require("../adminRoutes");
const userRoutes = require("../userRoutes");
const hadithRoutes = require("../hadithRoutes");
const hadithCategoryRoutes = require("../hadithCategoryRoutes");
const aiRoutes = require("../aiRoutes");

// Routes
router.use(adminRoutes);
router.use(userRoutes);
router.use(hadithRoutes);
router.use(hadithCategoryRoutes);
router.use(aiRoutes);

module.exports = router;
