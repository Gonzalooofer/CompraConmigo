import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/compra_conmigo';

export async function connectDb() {
  mongoose.set('strictQuery', true);
  await mongoose.connect(MONGO_URI);
}
