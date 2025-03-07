import mongoose from 'mongoose';
const setupDatabase = async (url) => {
    // Connect to MongoDB
    await mongoose.connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
};
export default setupDatabase;
