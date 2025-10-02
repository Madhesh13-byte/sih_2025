const mongoose = require('mongoose');

const workingDaySchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['working', 'holiday', 'exam', 'break'],
    required: true
  },
  description: {
    type: String,
    maxlength: 200
  },
  academicYear: {
    type: String,
    required: true
  },
  semester: {
    type: Number,
    min: 1,
    max: 8
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

workingDaySchema.index({ date: 1, academicYear: 1 });
workingDaySchema.index({ type: 1, academicYear: 1 });

workingDaySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('WorkingDay', workingDaySchema);