const mongoose = require('mongoose');

// _id is a readable string (e.g. "cricket"), not an ObjectId
const categorySchema = new mongoose.Schema(
  {
    _id: { type: String },
    name: { type: String, required: true },
    parentId: { type: String, default: null, ref: 'Category' },
  },
  { _id: false, id: false }
);

// Allow string _id
categorySchema.set('toObject', { virtuals: false });
categorySchema.set('toJSON', { virtuals: false });

module.exports = mongoose.model('Category', categorySchema);
