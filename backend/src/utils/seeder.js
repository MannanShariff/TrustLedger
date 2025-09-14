const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load models
const User = require('../models/User');
const Budget = require('../models/Budget');
const Department = require('../models/Department');
const Project = require('../models/Project');
const Vendor = require('../models/Vendor');
const Transaction = require('../models/Transaction');
const AuditLog = require('../models/AuditLog');

// Load env vars
dotenv.config();

// Connect to DB
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://mannanshariff:mannan123@trustledger.lalfgxo.mongodb.net/');

// Sample data
const users = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    password: 'password123'
  },
  {
    name: 'Department Head',
    email: 'department@example.com',
    role: 'department_head',
    password: 'password123'
  },
  {
    name: 'Project Manager',
    email: 'project@example.com',
    role: 'project_manager',
    password: 'password123'
  },
  {
    name: 'Auditor',
    email: 'auditor@example.com',
    role: 'auditor',
    password: 'password123'
  }
];

const createSampleData = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Budget.deleteMany();
    await Department.deleteMany();
    await Project.deleteMany();
    await Vendor.deleteMany();
    await Transaction.deleteMany();
    await AuditLog.deleteMany();

    console.log('Data cleared...');

    // Create users
    const createdUsers = {};
    for (const user of users) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
      const newUser = await User.create(user);
      createdUsers[user.role] = newUser._id;
    }

    console.log('Users created...');

    // Create budget
    const budget = await Budget.create({
      name: 'Annual Budget 2023-2024',
      fiscalYear: '2023-2024',
      totalAmount: 10000000,
      description: 'Annual budget for the fiscal year 2023-2024',
      createdBy: createdUsers.admin
    });

    console.log('Budget created...');

    // Create departments
    const departments = [
      {
        name: 'Information Technology',
        budgetId: budget._id,
        allocatedAmount: 3000000,
        description: 'IT department budget allocation',
        createdBy: createdUsers.admin
      },
      {
        name: 'Infrastructure',
        budgetId: budget._id,
        allocatedAmount: 4000000,
        description: 'Infrastructure department budget allocation',
        createdBy: createdUsers.admin
      },
      {
        name: 'Research & Development',
        budgetId: budget._id,
        allocatedAmount: 3000000,
        description: 'R&D department budget allocation',
        createdBy: createdUsers.admin
      }
    ];

    const createdDepartments = [];
    for (const dept of departments) {
      const newDept = await Department.create(dept);
      createdDepartments.push(newDept);
    }

    console.log('Departments created...');

    // Create projects
    const projects = [
      {
        name: 'Server Infrastructure Upgrade',
        departmentId: createdDepartments[0]._id,
        allocatedAmount: 1500000,
        description: 'Upgrade server infrastructure to improve performance',
        startDate: new Date('2023-04-01'),
        endDate: new Date('2023-12-31'),
        status: 'in_progress',
        createdBy: createdUsers.department_head
      },
      {
        name: 'Software Development Tools',
        departmentId: createdDepartments[0]._id,
        allocatedAmount: 1000000,
        description: 'Purchase and implement new software development tools',
        startDate: new Date('2023-05-01'),
        endDate: new Date('2023-10-31'),
        status: 'in_progress',
        createdBy: createdUsers.department_head
      },
      {
        name: 'Road Construction Project',
        departmentId: createdDepartments[1]._id,
        allocatedAmount: 2500000,
        description: 'Construction of new roads in the city',
        startDate: new Date('2023-03-15'),
        endDate: new Date('2024-03-14'),
        status: 'in_progress',
        createdBy: createdUsers.department_head
      },
      {
        name: 'Bridge Renovation',
        departmentId: createdDepartments[1]._id,
        allocatedAmount: 1500000,
        description: 'Renovation of existing bridges',
        startDate: new Date('2023-06-01'),
        endDate: new Date('2023-12-31'),
        status: 'in_progress',
        createdBy: createdUsers.department_head
      },
      {
        name: 'AI Research Initiative',
        departmentId: createdDepartments[2]._id,
        allocatedAmount: 2000000,
        description: 'Research on artificial intelligence applications',
        startDate: new Date('2023-04-01'),
        endDate: new Date('2024-03-31'),
        status: 'in_progress',
        createdBy: createdUsers.department_head
      },
      {
        name: 'Renewable Energy Research',
        departmentId: createdDepartments[2]._id,
        allocatedAmount: 1000000,
        description: 'Research on renewable energy sources',
        startDate: new Date('2023-05-15'),
        endDate: new Date('2024-02-28'),
        status: 'in_progress',
        createdBy: createdUsers.department_head
      }
    ];

    const createdProjects = [];
    for (const project of projects) {
      const newProject = await Project.create(project);
      createdProjects.push(newProject);
    }

    console.log('Projects created...');

    // Create vendors
    const vendors = [
      {
        name: 'Tech Solutions Inc.',
        gstin: 'TECH1234567890',
        contactInfo: {
          email: 'contact@techsolutions.com',
          phone: '1234567890',
          address: '123 Tech Street, Tech City'
        },
        description: 'IT hardware and software provider',
        isActive: true,
        createdBy: createdUsers.admin
      },
      {
        name: 'Construction Masters',
        gstin: 'CONS1234567890',
        contactInfo: {
          email: 'info@constructionmasters.com',
          phone: '0987654321',
          address: '456 Build Road, Construction Town'
        },
        description: 'Construction materials and services provider',
        isActive: true,
        createdBy: createdUsers.admin
      },
      {
        name: 'Research Equipment Suppliers',
        gstin: 'RESE1234567890',
        contactInfo: {
          email: 'sales@researchequipment.com',
          phone: '1122334455',
          address: '789 Research Avenue, Science Park'
        },
        description: 'Research equipment and laboratory supplies',
        isActive: true,
        createdBy: createdUsers.admin
      }
    ];

    const createdVendors = [];
    for (const vendor of vendors) {
      const newVendor = await Vendor.create(vendor);
      createdVendors.push(newVendor);
    }

    console.log('Vendors created...');

    // Create transactions
    const transactions = [
      {
        projectId: createdProjects[0]._id,
        vendorId: createdVendors[0]._id,
        amount: 500000,
        date: new Date('2023-05-15'),
        description: 'Server hardware purchase',
        invoiceNumber: 'INV-001',
        documentHash: 'sample_hash_1',
        status: 'completed',
        createdBy: createdUsers.project_manager
      },
      {
        projectId: createdProjects[0]._id,
        vendorId: createdVendors[0]._id,
        amount: 300000,
        date: new Date('2023-06-20'),
        description: 'Server software licenses',
        invoiceNumber: 'INV-002',
        documentHash: 'sample_hash_2',
        status: 'completed',
        createdBy: createdUsers.project_manager
      },
      {
        projectId: createdProjects[2]._id,
        vendorId: createdVendors[1]._id,
        amount: 800000,
        date: new Date('2023-04-10'),
        description: 'Construction materials',
        invoiceNumber: 'INV-003',
        documentHash: 'sample_hash_3',
        status: 'completed',
        createdBy: createdUsers.project_manager
      },
      {
        projectId: createdProjects[2]._id,
        vendorId: createdVendors[1]._id,
        amount: 600000,
        date: new Date('2023-07-05'),
        description: 'Construction equipment rental',
        invoiceNumber: 'INV-004',
        documentHash: 'sample_hash_4',
        status: 'completed',
        createdBy: createdUsers.project_manager
      },
      {
        projectId: createdProjects[4]._id,
        vendorId: createdVendors[2]._id,
        amount: 700000,
        date: new Date('2023-05-25'),
        description: 'AI research equipment',
        invoiceNumber: 'INV-005',
        documentHash: 'sample_hash_5',
        status: 'completed',
        createdBy: createdUsers.project_manager
      },
      {
        projectId: createdProjects[5]._id,
        vendorId: createdVendors[2]._id,
        amount: 400000,
        date: new Date('2023-06-15'),
        description: 'Renewable energy research materials',
        invoiceNumber: 'INV-006',
        documentHash: 'sample_hash_6',
        status: 'completed',
        createdBy: createdUsers.project_manager
      }
    ];

    for (const transaction of transactions) {
      await Transaction.create(transaction);
    }

    console.log('Transactions created...');

    console.log('Sample data created successfully!');
    process.exit();
  } catch (error) {
    console.error('Error creating sample data:', error);
    process.exit(1);
  }
};

// Run the function
createSampleData();