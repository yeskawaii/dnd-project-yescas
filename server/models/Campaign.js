import mongoose from 'mongoose';

const campaignSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  dm: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true
  },
  inviteCode: { 
    type: String, 
    required: true, 
    unique: true
  }
}, { timestamps: true });

export default mongoose.model('Campaign', campaignSchema);