const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  avatar: String,
  number: String,
  role: String,
  deposit: { type: Number, default: 0 },
  profit: { type: Number, default: 0 },
  totalWithdrawn: { type: Number, default: 0 },
  lastPlan: { type: String, default: "None" },
  referralsBalance: { type: Number, default: 0 },
  referralCode: String,
  agentID: String,
  agentCode: String,
  isOwner: { type: Boolean, default: false },
  referredUsers: { type: Number, default: 0 },
  referredBy: String,
  referralRedeemed: { type: Boolean, default: false },
  isUserActive: { type: Boolean, default: false },
  hasPaid: { type: Boolean, default: false },
  name: String,
  email: String,
  lastLogin: Date,
  userId: { type: String, required: true, unique: true },
  firstLogin: { type: Boolean, default: true },
  currencySymbol: { type: String, default: "$" },
  country: String,
});

const User = mongoose.model('User', schema);
module.exports = User;
