import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export default class User {
  static init(mongoose) {
    const schema = {
      name: {
        type: String,
        required: true,
      },
      username: {
        type: String,
        required: true,
        unique: true,
      },
      password: {
        type: String,
        required: true,
      },
    };

    const options = {
      timestamps: true,
    };

    const userSchema = new mongoose.Schema(schema, options);

    userSchema.pre('save', async function (next) {
      if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 8);
      }
      next();
    });

    userSchema.methods.comparePassword = async function (password) {
      return await bcrypt.compare(password, this.password);
    };

    return mongoose.models.User || mongoose.model('User', userSchema);
  }

  // static associate(models) {
  //   // Implementar se necessário no futuro
  // }
}
