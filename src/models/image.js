/**
 * Mongoose model image.
 *
 * @author Vanja Maric
 * @version 1.0.0
 */

import mongoose from 'mongoose'
import validator from 'validator'

const { isURL } = validator

// Create a schema.
const schema = new mongoose.Schema({
  // The image encoded in base64.
  imageUrl: {
    type: String,
    required: true,
    trim: true,
    validate: [isURL, 'Please provide a valid URL.'],
    minlength: 1
  },
  location: {
    type: String,
    required: false,
    trim: true
  },
  description: {
    type: String,
    required: false,
    trim: true
  }
},
{
  timestamps: true,
  toJSON: {
    /**
     * Performs a transformation of the resulting object to remove sensitive information.
     *
     * @param {object} doc - The mongoose document which is being converted.
     * @param {object} ret - The plain object representation which has been converted.
     */
    transform: function (doc, ret) {
      delete ret.__v
      delete ret._id
    },
    virtuals: true // ensure virtual fields are serialized
  }
})

schema.virtual('id').get(function () {
  return this._id.toHexString()
})

// Create a model using the schema.
export const Image = mongoose.model('Image', schema)
