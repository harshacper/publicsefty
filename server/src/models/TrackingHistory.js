import mongoose from 'mongoose';

const trackingHistorySchema = new mongoose.Schema(
  {
    complaintId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Complaint',
      required: true,
      index: true,
    },
    previousStatus: {
      type: String,
      required: true,
    },
    newStatus: {
      type: String,
      required: true,
    },
    updatedBy: {
      type: String,
      required: true,
    },
    updatedById: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    remarks: {
      type: String,
      default: '',
    },
    isInternal: {
      type: Boolean,
      default: false,
    },
    supportingDocument: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

trackingHistorySchema.index({ complaintId: 1, createdAt: 1 });

const TrackingHistory = mongoose.models.TrackingHistory || mongoose.model('TrackingHistory', trackingHistorySchema);
export default TrackingHistory;
