import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    role: { type: String, enum: ['user', 'manager', 'admin'], default: 'user' },
    isActive: { type: Boolean, default: true },
    isEmailVerified: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

async function createTestUser() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Check if user exists
        const existingUser = await User.findOne({ email: 'tej@example.com' });
        
        if (existingUser) {
            console.log('User already exists, deleting...');
            await User.deleteOne({ email: 'tej@example.com' });
        }

        // Hash password: 13$@Tsingh
        const hashedPassword = await bcrypt.hash('13$@Tsingh', 10);

        // Create user
        const user = await User.create({
            email: 'tej@example.com',
            password: hashedPassword,
            firstName: 'Tej',
            lastName: 'Singh',
            role: 'admin',
            isActive: true,
            isEmailVerified: true
        });

        console.log('\n✅ Test user created successfully!');
        console.log('\nCredentials:');
        console.log('  Email: tej@example.com');
        console.log('  Password: 13$@Tsingh');
        console.log('  Role: admin');
        
        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

createTestUser();
