const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  avatar: String,
  number: String,
  role: String,
  deposit: Number,
  profit: Number,
  totalWithdrawn: { type: Number, default: 0 },
  lastPlan: { type: String, default: "None" },
  referralsBalance: Number,
  referralCode: String,
  agentID: String,
  agentCode: String,
  isOwner: Boolean,
  referredUsers: Number,
  referredBy: String,
  referralRedeemed: Boolean,
  isUserActive: Boolean,
  hasPaid: Boolean,
  name: String,
  email: String,
  lastLogin: Date,
  userId: { type: String, required: true, unique: true },
  firstLogin: { type: Boolean, default: true },
  currencySymbol: String,
  country: String,
});


const User = mongoose.model('User', schema);
module.exports = User;