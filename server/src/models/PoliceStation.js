import mongoose from 'mongoose';

const policeStationSchema = new mongoose.Schema(
  {
    stationName: {
      type: String,
      required: [true, 'Police station name is required'],
      trim: true,
    },
    stationCode: {
      type: String,
      required: [true, 'Station code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      index: true,
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
    },
    pinCode: {
      type: String,
      required: [true, 'PIN Code is required'],
      trim: true,
    },
    latitude: {
      type: Number,
      required: [true, 'Latitude is required'],
    },
    longitude: {
      type: Number,
      required: [true, 'Longitude is required'],
    },
    contactNumber: {
      type: String,
      required: [true, 'Official contact number is required'],
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      default: '',
    },
    jurisdiction: {
      type: String,
      required: [true, 'Jurisdiction details are required'],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// 2dsphere index can also be added for geo queries
policeStationSchema.index({ latitude: 1, longitude: 1 });

const PoliceStation = mongoose.models.PoliceStation || mongoose.model('PoliceStation', policeStationSchema);
export default PoliceStation;
