const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
    },
    bloodGroup: {
      type: String,
      required: [true, 'Blood group is required'],
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    latitude: {
      type: Number,
      default: null,
    },
    longitude: {
      type: Number,
      default: null,
    },
    role: {
      type: String,
      enum: ['donor', 'requester'],
      default: 'donor',
    },
    donationCount: {
      type: Number,
      default: 0,
    },
    reliabilityScore: {
      type: Number,
      default: 80,
      min: 0,
      max: 100,
    },
    phone: {
      type: String,
      trim: true,
    },
    lastDonationDate: {
      type: Date,
    },
    campus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campus',
    },
    // ── Health Screening ──────────────────────────────────────────────────
    isHealthScreeningComplete: {
      type: Boolean,
      default: false,
    },
    healthScreening: {
      age:                  { type: Number },
      weight:               { type: Number },
      hasDiabetes:          { type: Boolean },
      hasHeartDisease:      { type: Boolean },
      hasHIV:               { type: Boolean },
      hasHepatitis:         { type: Boolean },
      recentSurgery:        { type: Boolean },   // surgery in last 6 months
      recentTattoo:         { type: Boolean },   // tattoo/piercing in last 6 months
      currentMedications:   { type: Boolean },   // on blood-thinners or antibiotics
      isPregnant:           { type: Boolean },
      alcoholLast24h:       { type: Boolean },
      submittedAt:          { type: Date },
      // result stored after backend validation
      eligible:             { type: Boolean },
      ineligibilityReasons: [{ type: String }],
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Virtual for badge level
userSchema.virtual('badgeLevel').get(function () {
  if (this.donationCount >= 8) return 'Gold';
  if (this.donationCount >= 4) return 'Silver';
  return 'Bronze';
});

module.exports = mongoose.model('User', userSchema);
