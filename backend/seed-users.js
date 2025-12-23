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
    department: { type: String },
    jobTitle: { type: String },
    isActive: { type: Boolean, default: true },
    isEmailVerified: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Sample users with different roles and departments
const sampleUsers = [
    // Admins
    {
        email: 'tej@example.com',
        password: '13$@Tsingh',
        firstName: 'Tej',
        lastName: 'Singh',
        role: 'admin',
        department: 'Management',
        jobTitle: 'CEO'
    },
    {
        email: 'sarah.admin@example.com',
        password: 'Admin@123',
        firstName: 'Sarah',
        lastName: 'Johnson',
        role: 'admin',
        department: 'Management',
        jobTitle: 'CTO'
    },
    
    // Managers
    {
        email: 'john.manager@example.com',
        password: 'Manager@123',
        firstName: 'John',
        lastName: 'Smith',
        role: 'manager',
        department: 'Engineering',
        jobTitle: 'Engineering Manager'
    },
    {
        email: 'emma.manager@example.com',
        password: 'Manager@123',
        firstName: 'Emma',
        lastName: 'Williams',
        role: 'manager',
        department: 'Marketing',
        jobTitle: 'Marketing Manager'
    },
    {
        email: 'michael.manager@example.com',
        password: 'Manager@123',
        firstName: 'Michael',
        lastName: 'Brown',
        role: 'manager',
        department: 'Sales',
        jobTitle: 'Sales Manager'
    },
    {
        email: 'lisa.manager@example.com',
        password: 'Manager@123',
        firstName: 'Lisa',
        lastName: 'Davis',
        role: 'manager',
        department: 'HR',
        jobTitle: 'HR Manager'
    },
    {
        email: 'david.manager@example.com',
        password: 'Manager@123',
        firstName: 'David',
        lastName: 'Wilson',
        role: 'manager',
        department: 'Product',
        jobTitle: 'Product Manager'
    },
    
    // Engineering Team
    {
        email: 'alex.dev@example.com',
        password: 'User@123',
        firstName: 'Alex',
        lastName: 'Turner',
        role: 'user',
        department: 'Engineering',
        jobTitle: 'Senior Software Engineer'
    },
    {
        email: 'james.dev@example.com',
        password: 'User@123',
        firstName: 'James',
        lastName: 'Martinez',
        role: 'user',
        department: 'Engineering',
        jobTitle: 'Full Stack Developer'
    },
    {
        email: 'sophia.dev@example.com',
        password: 'User@123',
        firstName: 'Sophia',
        lastName: 'Garcia',
        role: 'user',
        department: 'Engineering',
        jobTitle: 'Frontend Developer'
    },
    {
        email: 'oliver.dev@example.com',
        password: 'User@123',
        firstName: 'Oliver',
        lastName: 'Anderson',
        role: 'user',
        department: 'Engineering',
        jobTitle: 'Backend Developer'
    },
    
    // Marketing Team
    {
        email: 'emily.marketing@example.com',
        password: 'User@123',
        firstName: 'Emily',
        lastName: 'Taylor',
        role: 'user',
        department: 'Marketing',
        jobTitle: 'Content Marketing Specialist'
    },
    {
        email: 'daniel.marketing@example.com',
        password: 'User@123',
        firstName: 'Daniel',
        lastName: 'Thomas',
        role: 'user',
        department: 'Marketing',
        jobTitle: 'Social Media Manager'
    },
    {
        email: 'mia.marketing@example.com',
        password: 'User@123',
        firstName: 'Mia',
        lastName: 'Jackson',
        role: 'user',
        department: 'Marketing',
        jobTitle: 'SEO Specialist'
    },
    
    // Sales Team
    {
        email: 'william.sales@example.com',
        password: 'User@123',
        firstName: 'William',
        lastName: 'White',
        role: 'user',
        department: 'Sales',
        jobTitle: 'Sales Representative'
    },
    {
        email: 'ava.sales@example.com',
        password: 'User@123',
        firstName: 'Ava',
        lastName: 'Harris',
        role: 'user',
        department: 'Sales',
        jobTitle: 'Account Executive'
    },
    {
        email: 'noah.sales@example.com',
        password: 'User@123',
        firstName: 'Noah',
        lastName: 'Martin',
        role: 'user',
        department: 'Sales',
        jobTitle: 'Business Development Manager'
    },
    
    // HR Team
    {
        email: 'isabella.hr@example.com',
        password: 'User@123',
        firstName: 'Isabella',
        lastName: 'Thompson',
        role: 'user',
        department: 'HR',
        jobTitle: 'HR Specialist'
    },
    {
        email: 'lucas.hr@example.com',
        password: 'User@123',
        firstName: 'Lucas',
        lastName: 'Garcia',
        role: 'user',
        department: 'HR',
        jobTitle: 'Recruitment Specialist'
    },
    
    // Finance Team
    {
        email: 'robert.finance@example.com',
        password: 'Manager@123',
        firstName: 'Robert',
        lastName: 'Lee',
        role: 'manager',
        department: 'Finance',
        jobTitle: 'Finance Manager'
    },
    {
        email: 'charlotte.finance@example.com',
        password: 'User@123',
        firstName: 'Charlotte',
        lastName: 'Walker',
        role: 'user',
        department: 'Finance',
        jobTitle: 'Financial Analyst'
    },
    {
        email: 'henry.finance@example.com',
        password: 'User@123',
        firstName: 'Henry',
        lastName: 'Hall',
        role: 'user',
        department: 'Finance',
        jobTitle: 'Accountant'
    },
    
    // Product Team
    {
        email: 'amelia.product@example.com',
        password: 'User@123',
        firstName: 'Amelia',
        lastName: 'Allen',
        role: 'user',
        department: 'Product',
        jobTitle: 'Product Designer'
    },
    {
        email: 'ethan.product@example.com',
        password: 'User@123',
        firstName: 'Ethan',
        lastName: 'Young',
        role: 'user',
        department: 'Product',
        jobTitle: 'UX Researcher'
    },
    
    // Design Team
    {
        email: 'grace.design@example.com',
        password: 'Manager@123',
        firstName: 'Grace',
        lastName: 'King',
        role: 'manager',
        department: 'Design',
        jobTitle: 'Design Manager'
    },
    {
        email: 'benjamin.design@example.com',
        password: 'User@123',
        firstName: 'Benjamin',
        lastName: 'Wright',
        role: 'user',
        department: 'Design',
        jobTitle: 'UI/UX Designer'
    },
    {
        email: 'chloe.design@example.com',
        password: 'User@123',
        firstName: 'Chloe',
        lastName: 'Lopez',
        role: 'user',
        department: 'Design',
        jobTitle: 'Graphic Designer'
    },
    
    // Support Team
    {
        email: 'mason.support@example.com',
        password: 'Manager@123',
        firstName: 'Mason',
        lastName: 'Hill',
        role: 'manager',
        department: 'Support',
        jobTitle: 'Support Manager'
    },
    {
        email: 'ella.support@example.com',
        password: 'User@123',
        firstName: 'Ella',
        lastName: 'Scott',
        role: 'user',
        department: 'Support',
        jobTitle: 'Customer Support Specialist'
    },
    {
        email: 'jack.support@example.com',
        password: 'User@123',
        firstName: 'Jack',
        lastName: 'Green',
        role: 'user',
        department: 'Support',
        jobTitle: 'Technical Support Engineer'
    },
    
    // Operations Team
    {
        email: 'lily.ops@example.com',
        password: 'Manager@123',
        firstName: 'Lily',
        lastName: 'Adams',
        role: 'manager',
        department: 'Operations',
        jobTitle: 'Operations Manager'
    },
    {
        email: 'ryan.ops@example.com',
        password: 'User@123',
        firstName: 'Ryan',
        lastName: 'Baker',
        role: 'user',
        department: 'Operations',
        jobTitle: 'Operations Coordinator'
    }
];

async function seedUsers() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing users except the main admin
        console.log('\n🗑️  Clearing existing users (except main admin)...');
        await User.deleteMany({ email: { $ne: 'tej@example.com' } });

        // Hash passwords and create users
        console.log('👥 Creating users...\n');
        
        let created = 0;
        for (const userData of sampleUsers) {
            try {
                const existingUser = await User.findOne({ email: userData.email });
                
                if (existingUser) {
                    console.log(`  ⚠️  User already exists: ${userData.email}`);
                    continue;
                }

                const hashedPassword = await bcrypt.hash(userData.password, 10);
                await User.create({
                    ...userData,
                    password: hashedPassword,
                    isActive: true,
                    isEmailVerified: true
                });
                
                created++;
                const roleIcon = userData.role === 'admin' ? '👑' : userData.role === 'manager' ? '📊' : '👤';
                console.log(`  ${roleIcon} Created: ${userData.firstName} ${userData.lastName} (${userData.department}) - ${userData.email}`);
            } catch (error) {
                console.error(`  ❌ Failed to create ${userData.email}:`, error.message);
            }
        }

        // Get statistics
        const stats = await User.aggregate([
            {
                $group: {
                    _id: '$department',
                    count: { $sum: 1 },
                    admins: { $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] } },
                    managers: { $sum: { $cond: [{ $eq: ['$role', 'manager'] }, 1, 0] } },
                    users: { $sum: { $cond: [{ $eq: ['$role', 'user'] }, 1, 0] } }
                }
            },
            { $sort: { count: -1 } }
        ]);

        const totalUsers = await User.countDocuments();
        const totalAdmins = await User.countDocuments({ role: 'admin' });
        const totalManagers = await User.countDocuments({ role: 'manager' });
        const totalRegularUsers = await User.countDocuments({ role: 'user' });

        console.log('\n' + '='.repeat(60));
        console.log('✅ USER SEEDING COMPLETED!');
        console.log('='.repeat(60));
        console.log(`\n📊 Overall Statistics:`);
        console.log(`   Total Users: ${totalUsers}`);
        console.log(`   👑 Admins: ${totalAdmins}`);
        console.log(`   📊 Managers: ${totalManagers}`);
        console.log(`   👤 Regular Users: ${totalRegularUsers}`);
        
        console.log(`\n🏢 Department-wise Breakdown:`);
        stats.forEach(dept => {
            console.log(`   ${dept._id}: ${dept.count} (${dept.admins} admins, ${dept.managers} managers, ${dept.users} users)`);
        });

        console.log('\n🔑 Login Credentials:');
        console.log('   Admin: tej@example.com / 13$@Tsingh');
        console.log('   Admin: sarah.admin@example.com / Admin@123');
        console.log('   Manager: john.manager@example.com / Manager@123');
        console.log('   User: alex.dev@example.com / User@123');
        console.log('\n💡 All users have the same password pattern:');
        console.log('   Admins: Admin@123');
        console.log('   Managers: Manager@123');
        console.log('   Users: User@123\n');

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

seedUsers();
