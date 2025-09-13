const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Budget = require('../models/Budget');
const Department = require('../models/Department');
const Project = require('../models/Project');
const Vendor = require('../models/Vendor');
const Transaction = require('../models/Transaction');
const AuditLog = require('../models/AuditLog');

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Clear all data
const clearData = async () => {
  try {
    await User.deleteMany({});
    await Budget.deleteMany({});
    await Department.deleteMany({});
    await Project.deleteMany({});
    await Vendor.deleteMany({});
    await Transaction.deleteMany({});
    await AuditLog.deleteMany({});
    console.log('All data cleared');
  } catch (error) {
    console.error(`Error clearing data: ${error.message}`);
    process.exit(1);
  }
};

// Seed Users
const seedUsers = async () => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const users = [
      {
        name: 'Admin User',
        email: 'admin@trustledger.com',
        role: 'admin',
        password: hashedPassword,
      },
      {
        name: 'Auditor User',
        email: 'auditor@trustledger.com',
        role: 'auditor',
        password: hashedPassword,
      },
      {
        name: 'Viewer User',
        email: 'viewer@trustledger.com',
        role: 'viewer',
        password: hashedPassword,
      },
    ];

    const createdUsers = await User.insertMany(users);
    console.log('Users seeded');
    return createdUsers;
  } catch (error) {
    console.error(`Error seeding users: ${error.message}`);
    process.exit(1);
  }
};

// Seed Budgets
const seedBudgets = async (adminUser) => {
  try {
    const budgets = [
      {
        name: 'Annual Budget 2023',
        fiscalYear: '2023',
        totalAmount: 1000000,
        description: 'Annual budget for fiscal year 2023',
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-12-31'),
        createdBy: adminUser._id,
      },
      {
        name: 'Annual Budget 2024',
        fiscalYear: '2024',
        totalAmount: 1200000,
        description: 'Annual budget for fiscal year 2024',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        createdBy: adminUser._id,
      },
    ];

    const createdBudgets = await Budget.insertMany(budgets);
    console.log('Budgets seeded');
    return createdBudgets;
  } catch (error) {
    console.error(`Error seeding budgets: ${error.message}`);
    process.exit(1);
  }
};

// Seed Departments
const seedDepartments = async (adminUser, budgets) => {
  try {
    const departments = [
      {
        name: 'Engineering',
        budgetId: budgets[0]._id,
        allocatedAmount: 400000,
        description: 'Engineering department for software development',
        createdBy: adminUser._id,
      },
      {
        name: 'Marketing',
        budgetId: budgets[0]._id,
        allocatedAmount: 300000,
        description: 'Marketing department for product promotion',
        createdBy: adminUser._id,
      },
      {
        name: 'Operations',
        budgetId: budgets[0]._id,
        allocatedAmount: 300000,
        description: 'Operations department for day-to-day activities',
        createdBy: adminUser._id,
      },
      {
        name: 'Research',
        budgetId: budgets[1]._id,
        allocatedAmount: 500000,
        description: 'Research department for innovation',
        createdBy: adminUser._id,
      },
      {
        name: 'Sales',
        budgetId: budgets[1]._id,
        allocatedAmount: 400000,
        description: 'Sales department for revenue generation',
        createdBy: adminUser._id,
      },
      {
        name: 'Human Resources',
        budgetId: budgets[1]._id,
        allocatedAmount: 300000,
        description: 'HR department for employee management',
        createdBy: adminUser._id,
      },
    ];

    const createdDepartments = await Department.insertMany(departments);
    console.log('Departments seeded');
    return createdDepartments;
  } catch (error) {
    console.error(`Error seeding departments: ${error.message}`);
    process.exit(1);
  }
};

// Seed Projects
const seedProjects = async (adminUser, departments) => {
  try {
    const projects = [
      {
        name: 'Website Redesign',
        departmentId: departments[0]._id, // Engineering
        allocatedAmount: 150000,
        description: 'Redesign company website with modern UI/UX',
        startDate: new Date('2023-02-01'),
        endDate: new Date('2023-06-30'),
        status: 'in-progress',
        createdBy: adminUser._id,
      },
      {
        name: 'Mobile App Development',
        departmentId: departments[0]._id, // Engineering
        allocatedAmount: 200000,
        description: 'Develop mobile app for iOS and Android',
        startDate: new Date('2023-03-15'),
        endDate: new Date('2023-09-30'),
        status: 'in-progress',
        createdBy: adminUser._id,
      },
      {
        name: 'Digital Marketing Campaign',
        departmentId: departments[1]._id, // Marketing
        allocatedAmount: 120000,
        description: 'Launch digital marketing campaign for new product',
        startDate: new Date('2023-04-01'),
        endDate: new Date('2023-07-31'),
        status: 'in-progress',
        createdBy: adminUser._id,
      },
      {
        name: 'Social Media Strategy',
        departmentId: departments[1]._id, // Marketing
        allocatedAmount: 80000,
        description: 'Develop and implement social media strategy',
        startDate: new Date('2023-05-01'),
        endDate: new Date('2023-08-31'),
        status: 'planned',
        createdBy: adminUser._id,
      },
      {
        name: 'Supply Chain Optimization',
        departmentId: departments[2]._id, // Operations
        allocatedAmount: 180000,
        description: 'Optimize supply chain for cost reduction',
        startDate: new Date('2023-02-15'),
        endDate: new Date('2023-11-30'),
        status: 'in-progress',
        createdBy: adminUser._id,
      },
      {
        name: 'AI Research Initiative',
        departmentId: departments[3]._id, // Research
        allocatedAmount: 250000,
        description: 'Research and develop AI solutions for business',
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-10-31'),
        status: 'planned',
        createdBy: adminUser._id,
      },
      {
        name: 'Sales Enablement Program',
        departmentId: departments[4]._id, // Sales
        allocatedAmount: 150000,
        description: 'Develop sales enablement program for team',
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-07-31'),
        status: 'planned',
        createdBy: adminUser._id,
      },
      {
        name: 'Employee Training Program',
        departmentId: departments[5]._id, // HR
        allocatedAmount: 120000,
        description: 'Develop and implement employee training program',
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-08-31'),
        status: 'planned',
        createdBy: adminUser._id,
      },
    ];

    const createdProjects = await Project.insertMany(projects);
    console.log('Projects seeded');
    return createdProjects;
  } catch (error) {
    console.error(`Error seeding projects: ${error.message}`);
    process.exit(1);
  }
};

// Seed Vendors
const seedVendors = async (adminUser) => {
  try {
    const vendors = [
      {
        name: 'TechSolutions Inc.',
        gstin: 'TECH1234567890',
        contactInfo: {
          email: 'contact@techsolutions.com',
          phone: '+1-123-456-7890',
          address: '123 Tech Street, Silicon Valley, CA',
        },
        description: 'Technology solutions provider',
        createdBy: adminUser._id,
      },
      {
        name: 'Marketing Experts LLC',
        gstin: 'MARK1234567890',
        contactInfo: {
          email: 'info@marketingexperts.com',
          phone: '+1-234-567-8901',
          address: '456 Marketing Avenue, New York, NY',
        },
        description: 'Marketing and advertising agency',
        createdBy: adminUser._id,
      },
      {
        name: 'Supply Chain Partners',
        gstin: 'SUPP1234567890',
        contactInfo: {
          email: 'info@supplychainpartners.com',
          phone: '+1-345-678-9012',
          address: '789 Supply Road, Chicago, IL',
        },
        description: 'Supply chain management services',
        createdBy: adminUser._id,
      },
      {
        name: 'Research Innovations',
        gstin: 'RESE1234567890',
        contactInfo: {
          email: 'contact@researchinnovations.com',
          phone: '+1-456-789-0123',
          address: '101 Innovation Blvd, Boston, MA',
        },
        description: 'Research and development services',
        createdBy: adminUser._id,
      },
      {
        name: 'Sales Training Pro',
        gstin: 'SALE1234567890',
        contactInfo: {
          email: 'info@salestrainingpro.com',
          phone: '+1-567-890-1234',
          address: '202 Sales Drive, Austin, TX',
        },
        description: 'Sales training and consulting',
        createdBy: adminUser._id,
      },
      {
        name: 'HR Solutions Group',
        gstin: 'HRSO1234567890',
        contactInfo: {
          email: 'contact@hrsolutions.com',
          phone: '+1-678-901-2345',
          address: '303 HR Boulevard, Seattle, WA',
        },
        description: 'Human resources consulting services',
        createdBy: adminUser._id,
      },
    ];

    const createdVendors = await Vendor.insertMany(vendors);
    console.log('Vendors seeded');
    return createdVendors;
  } catch (error) {
    console.error(`Error seeding vendors: ${error.message}`);
    process.exit(1);
  }
};

// Seed Transactions
const seedTransactions = async (adminUser, projects, vendors) => {
  try {
    const transactions = [
      // Website Redesign Transactions
      {
        projectId: projects[0]._id, // Website Redesign
        vendorId: vendors[0]._id, // TechSolutions Inc.
        amount: 50000,
        date: new Date('2023-02-15'),
        description: 'Initial payment for website redesign',
        invoiceNumber: 'INV-2023-001',
        status: 'completed',
        signedBy: adminUser._id,
        signedAt: new Date('2023-02-16'),
      },
      {
        projectId: projects[0]._id, // Website Redesign
        vendorId: vendors[0]._id, // TechSolutions Inc.
        amount: 40000,
        date: new Date('2023-04-15'),
        description: 'Milestone payment for website redesign',
        invoiceNumber: 'INV-2023-002',
        status: 'completed',
        signedBy: adminUser._id,
        signedAt: new Date('2023-04-16'),
      },
      
      // Mobile App Development Transactions
      {
        projectId: projects[1]._id, // Mobile App Development
        vendorId: vendors[0]._id, // TechSolutions Inc.
        amount: 80000,
        date: new Date('2023-03-20'),
        description: 'Initial payment for mobile app development',
        invoiceNumber: 'INV-2023-003',
        status: 'completed',
        signedBy: adminUser._id,
        signedAt: new Date('2023-03-21'),
      },
      {
        projectId: projects[1]._id, // Mobile App Development
        vendorId: vendors[0]._id, // TechSolutions Inc.
        amount: 60000,
        date: new Date('2023-05-20'),
        description: 'Milestone payment for mobile app development',
        invoiceNumber: 'INV-2023-004',
        status: 'pending',
      },
      
      // Digital Marketing Campaign Transactions
      {
        projectId: projects[2]._id, // Digital Marketing Campaign
        vendorId: vendors[1]._id, // Marketing Experts LLC
        amount: 45000,
        date: new Date('2023-04-05'),
        description: 'Initial payment for digital marketing campaign',
        invoiceNumber: 'INV-2023-005',
        status: 'completed',
        signedBy: adminUser._id,
        signedAt: new Date('2023-04-06'),
      },
      {
        projectId: projects[2]._id, // Digital Marketing Campaign
        vendorId: vendors[1]._id, // Marketing Experts LLC
        amount: 35000,
        date: new Date('2023-05-25'),
        description: 'Ad spend for digital marketing campaign',
        invoiceNumber: 'INV-2023-006',
        status: 'pending',
      },
      
      // Supply Chain Optimization Transactions
      {
        projectId: projects[4]._id, // Supply Chain Optimization
        vendorId: vendors[2]._id, // Supply Chain Partners
        amount: 70000,
        date: new Date('2023-03-01'),
        description: 'Initial payment for supply chain optimization',
        invoiceNumber: 'INV-2023-007',
        status: 'completed',
        signedBy: adminUser._id,
        signedAt: new Date('2023-03-02'),
      },
      {
        projectId: projects[4]._id, // Supply Chain Optimization
        vendorId: vendors[2]._id, // Supply Chain Partners
        amount: 50000,
        date: new Date('2023-06-01'),
        description: 'Consulting services for supply chain optimization',
        invoiceNumber: 'INV-2023-008',
        status: 'pending',
      },
      
      // AI Research Initiative Transactions
      {
        projectId: projects[5]._id, // AI Research Initiative
        vendorId: vendors[3]._id, // Research Innovations
        amount: 100000,
        date: new Date('2024-01-20'),
        description: 'Initial payment for AI research',
        invoiceNumber: 'INV-2024-001',
        status: 'pending',
      },
      
      // Sales Enablement Program Transactions
      {
        projectId: projects[6]._id, // Sales Enablement Program
        vendorId: vendors[4]._id, // Sales Training Pro
        amount: 60000,
        date: new Date('2024-02-10'),
        description: 'Initial payment for sales enablement program',
        invoiceNumber: 'INV-2024-002',
        status: 'pending',
      },
      
      // Employee Training Program Transactions
      {
        projectId: projects[7]._id, // Employee Training Program
        vendorId: vendors[5]._id, // HR Solutions Group
        amount: 45000,
        date: new Date('2024-03-05'),
        description: 'Initial payment for employee training program',
        invoiceNumber: 'INV-2024-003',
        status: 'pending',
      },
    ];

    const createdTransactions = await Transaction.insertMany(transactions);
    console.log('Transactions seeded');
    return createdTransactions;
  } catch (error) {
    console.error(`Error seeding transactions: ${error.message}`);
    process.exit(1);
  }
};

// Seed Audit Logs
const seedAuditLogs = async (users, transactions) => {
  try {
    const auditLogs = [
      {
        userId: users[0]._id, // Admin
        action: 'CREATE',
        entityType: 'Transaction',
        entityId: transactions[0]._id,
        details: 'Created transaction for Website Redesign project',
        timestamp: new Date('2023-02-15T10:30:00'),
        ipAddress: '192.168.1.1',
      },
      {
        userId: users[0]._id, // Admin
        action: 'APPROVE',
        entityType: 'Transaction',
        entityId: transactions[0]._id,
        details: 'Approved transaction for Website Redesign project',
        timestamp: new Date('2023-02-16T09:15:00'),
        ipAddress: '192.168.1.1',
      },
      {
        userId: users[0]._id, // Admin
        action: 'CREATE',
        entityType: 'Transaction',
        entityId: transactions[1]._id,
        details: 'Created transaction for Website Redesign project',
        timestamp: new Date('2023-04-15T14:20:00'),
        ipAddress: '192.168.1.1',
      },
      {
        userId: users[0]._id, // Admin
        action: 'APPROVE',
        entityType: 'Transaction',
        entityId: transactions[1]._id,
        details: 'Approved transaction for Website Redesign project',
        timestamp: new Date('2023-04-16T11:05:00'),
        ipAddress: '192.168.1.1',
      },
      {
        userId: users[0]._id, // Admin
        action: 'CREATE',
        entityType: 'Transaction',
        entityId: transactions[2]._id,
        details: 'Created transaction for Mobile App Development project',
        timestamp: new Date('2023-03-20T09:45:00'),
        ipAddress: '192.168.1.1',
      },
      {
        userId: users[0]._id, // Admin
        action: 'APPROVE',
        entityType: 'Transaction',
        entityId: transactions[2]._id,
        details: 'Approved transaction for Mobile App Development project',
        timestamp: new Date('2023-03-21T10:10:00'),
        ipAddress: '192.168.1.1',
      },
      {
        userId: users[1]._id, // Auditor
        action: 'VIEW',
        entityType: 'Transaction',
        entityId: transactions[0]._id,
        details: 'Viewed transaction details for Website Redesign project',
        timestamp: new Date('2023-02-17T15:30:00'),
        ipAddress: '192.168.1.2',
      },
      {
        userId: users[1]._id, // Auditor
        action: 'VIEW',
        entityType: 'Transaction',
        entityId: transactions[1]._id,
        details: 'Viewed transaction details for Website Redesign project',
        timestamp: new Date('2023-04-17T16:45:00'),
        ipAddress: '192.168.1.2',
      },
      {
        userId: users[1]._id, // Auditor
        action: 'VIEW',
        entityType: 'Transaction',
        entityId: transactions[2]._id,
        details: 'Viewed transaction details for Mobile App Development project',
        timestamp: new Date('2023-03-22T14:20:00'),
        ipAddress: '192.168.1.2',
      },
      {
        userId: users[2]._id, // Viewer
        action: 'VIEW',
        entityType: 'Transaction',
        entityId: transactions[0]._id,
        details: 'Viewed transaction details for Website Redesign project',
        timestamp: new Date('2023-02-18T11:15:00'),
        ipAddress: '192.168.1.3',
      },
    ];

    const createdAuditLogs = await AuditLog.insertMany(auditLogs);
    console.log('Audit logs seeded');
    return createdAuditLogs;
  } catch (error) {
    console.error(`Error seeding audit logs: ${error.message}`);
    process.exit(1);
  }
};

// Main seed function
const seedData = async () => {
  try {
    // Connect to database
    await connectDB();

    // Clear existing data
    await clearData();

    // Seed data
    const users = await seedUsers();
    const adminUser = users[0]; // Admin user

    const budgets = await seedBudgets(adminUser);
    const departments = await seedDepartments(adminUser, budgets);
    const projects = await seedProjects(adminUser, departments);
    const vendors = await seedVendors(adminUser);
    const transactions = await seedTransactions(adminUser, projects, vendors);
    await seedAuditLogs(users, transactions);

    console.log('All data seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Run the seed function
seedData();