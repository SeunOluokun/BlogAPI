const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  first_name: { 
    type: String, 
    required: true 
},
  last_name: { 
    type: String, 
    required: true 
},
  email: { 
    type: String, 
    unique: true, 
    required: true 
},
  password: { 
    type: String, 
    required: true 
}
});

userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
