/**
 * User.js - Mongoose model for TransitOps platform users.
 *
 * Features:
 *   - Email regex validation and unique index
 *   - Pre-save bcrypt password hashing (12 salt rounds)
 *   - Instance method: comparePassword(candidatePassword)
 *   - toJSON transform that strips password and __v
 *   - Role enum with SCREAMING_SNAKE_CASE values
 *   - Optional fields: phone, profileImage
 *   - isActive flag for soft deactivation
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { ROLES_ARRAY } = require('../utils/constants');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name must not exceed 100 characters'],
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        'Please provide a valid email address',
      ],
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Exclude from queries by default.
    },

    role: {
      type: String,
      enum: {
        values: ROLES_ARRAY,
        message: 'Role must be one of: ' + ROLES_ARRAY.join(', '),
      },
      required: [true, 'Role is required'],
    },

    phone: {
      type: String,
      trim: true,
      default: null,
    },

    profileImage: {
      type: String,
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// ──────────────────────────────────────
// Indexes
// ──────────────────────────────────────

UserSchema.index({ role: 1 });
UserSchema.index({ isActive: 1 });

// ──────────────────────────────────────
// Pre-save Hook: Hash password
// ──────────────────────────────────────

UserSchema.pre('save', async function (next) {
  // Only hash if the password field has been modified.
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ──────────────────────────────────────
// Instance Methods
// ──────────────────────────────────────

/**
 * Compare a candidate password with the stored hash.
 * @param {string} candidatePassword - Plain-text password to check.
 * @returns {Promise<boolean>}
 */
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ──────────────────────────────────────
// JSON Transform: Strip sensitive fields
// ──────────────────────────────────────

UserSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    delete ret.password;
    return ret;
  },
});

module.exports = mongoose.model('User', UserSchema);
