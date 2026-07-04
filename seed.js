const db = require('./db');
const bcrypt = require('bcryptjs');

async function seed() {
  console.log('Starting database seeding...');
  
  try {
    // Initialize database
    await db.initDb();
    
    // 1. Seed Admin User
    const adminUsername = 'admin@kritika.ai';
    const adminPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    // Clear existing admins (in SQLite or MySQL)
    await db.execute('DELETE FROM admins');
    
    // Insert new admin
    await db.execute(
      'INSERT INTO admins (username, password) VALUES (?, ?)',
      [adminUsername, hashedPassword]
    );
    console.log(`Admin account seeded:`);
    console.log(`  Username: ${adminUsername}`);
    console.log(`  Password: ${adminPassword} (hashed: ${hashedPassword})`);
    
    // 2. Seed Inquiries
    await db.execute('DELETE FROM inquiries');
    
    const sampleInquiries = [
      {
        name: 'Sarita Adhikari',
        email: 'sarita@studio.np',
        phone: '+977 984-1123456',
        company: 'Galaxy Public School',
        country: 'Nepal',
        job_title: 'Admissions Coordinator',
        job_details: 'Hi! We get ~200 parent queries every week before admissions open. Most are repeats. Would love to explore a chatbot on our site + WhatsApp that handles common questions and books a callback for the rest. Open to a discovery call next week.',
        status: 'New',
        assigned_to: 'Kritika S.'
      },
      {
        name: 'Rohan Pant',
        email: 'rohan@finsure.io',
        phone: '+977 985-1029384',
        company: 'FinSure Nepal',
        country: 'Nepal',
        job_title: 'CTO',
        job_details: 'Internal search for HR docs. Looking for a secure local embeddings-based search engine for our employee policies and insurance documents. Needs to be deployed on-premise.',
        status: 'New',
        assigned_to: 'Kritika S.'
      },
      {
        name: 'L. McAllister',
        email: 'lily@edtech.uk',
        phone: '+44 7700-900077',
        company: 'EdTech Inc.',
        country: 'United Kingdom',
        job_title: 'Training Lead',
        job_details: 'Quote on a virtual advisory workshop. We want to conduct a 2-day virtual workshop for our product managers to define our AI roadmap and ROI metrics.',
        status: 'Replied',
        assigned_to: 'Kritika S.'
      },
      {
        name: 'Priya K.',
        email: 'priya@marketplace.np',
        phone: '+977 980-1122334',
        company: 'Marketplace.np',
        country: 'Nepal',
        job_title: 'COO',
        job_details: 'Recommendation engine phase 2. We want to enhance our current model to support cross-selling and real-time personalized product recommendations on our e-commerce platform.',
        status: 'In progress',
        assigned_to: 'Kritika S.'
      },
      {
        name: 'Anu R.',
        email: 'anu@clinicco.com',
        phone: '+1 (555) 019-9238',
        company: 'Clinic Co.',
        country: 'United States',
        job_title: 'Operations Lead',
        job_details: 'Bot maintenance plan. We would like to sign up for a monthly support contract to monitor and retrain our WhatsApp triage bot.',
        status: 'Replied',
        assigned_to: 'Kritika S.'
      },
      {
        name: 'David L.',
        email: 'david@beta.co',
        phone: '+1 (555) 014-2281',
        company: 'Beta Co.',
        country: 'Canada',
        job_title: 'Engineering Manager',
        job_details: 'Custom model - quote. Looking for fine-tuning assistance for a small language model (8B parameter) on our customer service logs.',
        status: 'New',
        assigned_to: 'Kritika S.'
      }
    ];
    
    for (const inq of sampleInquiries) {
      await db.execute(
        `INSERT INTO inquiries (name, email, phone, company, country, job_title, job_details, status, assigned_to) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [inq.name, inq.email, inq.phone, inq.company, inq.country, inq.job_title, inq.job_details, inq.status, inq.assigned_to]
      );
    }
    console.log(`Seeded ${sampleInquiries.length} sample inquiries.`);
    
    // 3. Seed Reviews
    await db.execute('DELETE FROM reviews');
    
    const sampleReviews = [
      {
        name: 'Anu R.',
        role: 'Ops Lead, Clinic Co.',
        rating: 5,
        comment: 'They asked the right questions before writing a line of code.'
      },
      {
        name: 'Sajan M.',
        role: 'CTO, FinSure',
        rating: 5,
        comment: 'Pragmatic, fast, and they push back when needed.'
      },
      {
        name: 'Priya K.',
        role: 'COO, Marketplace.np',
        rating: 5,
        comment: 'We saw value in week 2. Real value, not demos.'
      },
      {
        name: 'David L.',
        role: 'Eng Mgr, EdTech Inc.',
        rating: 5,
        comment: 'The handover was as clean as the build.'
      }
    ];
    
    for (const rev of sampleReviews) {
      await db.execute(
        'INSERT INTO reviews (name, role, rating, comment) VALUES (?, ?, ?, ?)',
        [rev.name, rev.role, rev.rating, rev.comment]
      );
    }
    console.log(`Seeded ${sampleReviews.length} client feedback reviews.`);
    
    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err.message);
    process.exit(1);
  }
}

seed();
