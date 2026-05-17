const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const { name, mobile, location, password } = req.body;
    const updates = {};

    if (name) updates.name = name;
    if (mobile) {
      if (mobile.length !== 10) {
        return res.status(400).json({ message: "Mobile must be 10 digits" });
      }
      updates.mobile = mobile;
    }
    if (location) updates.location = location;
    if (password) {
      updates.password = await bcrypt.hash(password, 10);
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
    }).select("-password");

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch("/blockchain-status", authMiddleware, async (req, res) => {
  try {
    const { walletAddress, blockchainIDIssued } = req.body;
    const updates = {};
    if (walletAddress) updates.walletAddress = walletAddress;
    if (blockchainIDIssued !== undefined) updates.blockchainIDIssued = blockchainIDIssued;

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
    }).select("-password");

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
