const express = require('express');
const session = require('express-session');
const path = require('path');
const bcrypt = require('bcryptjs');
const db = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Setup EJS views engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Configure Sessions
app.use(session({
  secret: process.env.SESSION_SECRET || 'kritika_ai_default_secret_key_2026',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 2, // 2 hours session expiration
    secure: process.env.NODE_ENV === 'production', // Set to true if running on HTTPS
    httpOnly: true, // Protects against XSS cookie theft
    sameSite: 'lax' // CSRF protection
  }
}));

// Session auth middleware for admin routes (FR-04)
// Also sets no-store cache headers (FR-06) so the browser Back button
// cannot reveal a cached dashboard after logout.
function requireAdmin(req, res, next) {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  if (req.session && req.session.adminId) {
    return next();
  }
  res.redirect('/admin/login');
}

// Pass session data to EJS templates (for navbar/header states)
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

// Database Initialization
db.initDb().then(() => {
  console.log('Database system initialized.');
}).catch(err => {
  console.error('Database initialization failed:', err.message);
});

// ==========================================
// PUBLIC ROUTES
// ==========================================

// 1. Home Page
app.get('/', async (req, res) => {
  try {
    // Get recent 3 reviews to show on home page
    const reviews = await db.query('SELECT * FROM reviews ORDER BY created_at DESC LIMIT 3');
    res.render('home', { activePage: 'Home', reviews });
  } catch (err) {
    console.error('Error loading home data:', err.message);
    res.render('home', { activePage: 'Home', reviews: [] });
  }
});

// 2. Solutions
app.get('/solutions', (req, res) => {
  res.render('solutions', { activePage: 'Solutions' });
});

// 3. Case Studies (List)
app.get('/cases', (req, res) => {
  res.render('cases', { activePage: 'Case Studies' });
});

// Case Studies data for details
const caseStudiesData = {
  1: {
    title: 'Triage bot for a city clinic',
    subtitle: 'A WhatsApp-first triage assistant that cut average response time from 28 min → 8 min.',
    badge: 'Chatbot',
    year: '2025',
    kpis: [
      { key: '-70%', val: 'response time' },
      { key: '24/7', val: 'coverage' },
      { key: '12k', val: 'msgs / month' },
      { key: '8 wks', val: 'discovery → launch' }
    ],
    brief: 'The clinic faced an overwhelming volume of repeat inquiries and symptoms-matching triage calls. Staff spent hours answering common operational questions instead of treating patients.',
    whatWeDid: 'We designed and shipped a WhatsApp-first AI triage assistant powered by customized clinic FAQ models. The chatbot accurately resolves operational inquiries and safely directs symptom checks to nurses, logging data securely.',
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80',
    secImage1: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
    secImage2: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80'
  },
  2: {
    title: 'Reports, end-to-end',
    subtitle: 'From spreadsheet mess to automated dashboards in 3 weeks.',
    badge: 'Automation',
    year: '2025',
    kpis: [
      { key: '95%', val: 'time saved' },
      { key: '0 errors', val: 'data loss' },
      { key: '3 weeks', val: 'development' },
      { key: 'Real-time', val: 'analytics' }
    ],
    brief: 'Operational reports were compiled manually across six spreadsheets, leading to delays, inconsistent statistics, and high administrative workload every Friday.',
    whatWeDid: 'We implemented automated data pipelines using secure ETL scripts that ingest raw records and build visual dashboards instantly, freeing up management bandwidth.',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    secImage1: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
    secImage2: '/images/invoice.jpg'
  },
  3: {
    title: 'Search that actually finds',
    subtitle: 'Internal semantic search for HR documents using embeddings + rerankers.',
    badge: 'Custom AI',
    year: '2024',
    kpis: [
      { key: 'RAG', val: 'architecture' },
      { key: '<1s', val: 'retrieval latency' },
      { key: 'On-prem', val: 'deployment' },
      { key: '98%', val: 'accuracy rating' }
    ],
    brief: 'Employees spent an average of 15 minutes searching through legacy PDFs, compliance docs, and HR policies to answer basic onboarding and benefits questions.',
    whatWeDid: 'We deployed a private semantic search engine on internal documentation. Using embedding vector searches and deep reranking, the tool returns exact sections and references within a second.',
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80',
    secImage1: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
    secImage2: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80'
  },
  4: {
    title: 'Lead bot for a school',
    subtitle: 'WhatsApp lead collection and scheduling assistant.',
    badge: 'Chatbot',
    year: '2024',
    kpis: [
      { key: '+40%', val: 'admissions leads' },
      { key: '82%', val: 'bot resolution' },
      { key: 'Pre-filled', val: 'handoff' },
      { key: 'WhatsApp', val: 'first UI' }
    ],
    brief: 'Parents sending admissions inquiries outside working hours received delayed responses, resulting in lost enrollment opportunities.',
    whatWeDid: 'We launched a responsive WhatsApp-based lead capture bot that answers admissions FAQs, collects prospect details, and registers parent information directly into the database.',
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80',
    secImage1: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
    secImage2: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80'
  },
  5: {
    title: 'Invoice OCR pipeline',
    subtitle: 'AI-powered document processing with 97% extraction accuracy.',
    badge: 'Automation',
    year: '2024',
    kpis: [
      { key: '97%', val: 'accuracy' },
      { key: '10x', val: 'triage speed' },
      { key: 'MySQL', val: 'write sync' },
      { key: 'Custom OCR', val: 'model' }
    ],
    brief: 'Accounts payable manually processed hundreds of unstructured paper and PDF invoices weekly, leading to data entry errors and late payment penalties.',
    whatWeDid: 'We built a custom OCR pipeline integrated with LLMs to automatically parse invoice values, validate totals, and write clean ledger data directly to the database.',
    image: 'https://images.unsplash.com/photo-1450101499163-c8848c66cb85?auto=format&fit=crop&w=800&q=80',
    secImage1: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    secImage2: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80'
  },
  6: {
    title: 'Recommendation engine',
    subtitle: 'Cross-selling model achieving +18% Average Order Value (AOV).',
    badge: 'Custom AI',
    year: '2025',
    kpis: [
      { key: '+18%', val: 'AOV increase' },
      { key: '150k', val: 'daily users' },
      { key: 'Real-time', val: 'predictions' },
      { key: 'ML-based', val: 'personalization' }
    ],
    brief: 'An online storefront relied on static, rule-based product pairings that failed to reflect personalized visitor interests.',
    whatWeDid: 'We trained and deployed a real-time product recommendation engine. The system analyzes behavioral signals to dynamically match and suggest highly relevant products.',
    image: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=800&q=80',
    secImage1: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    secImage2: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80'
  }
};

// 4. Case Study Detail View
app.get('/cases/:id', (req, res) => {
  const caseId = req.params.id;
  const detail = caseStudiesData[caseId];
  if (!detail) {
    return res.status(404).redirect('/cases');
  }
  res.render('case-detail', { activePage: 'Case Studies', detail });
});

// 5. Feedback & Ratings Page
app.get('/feedback', async (req, res) => {
  try {
    const reviews = await db.query('SELECT * FROM reviews ORDER BY created_at DESC');
    
    // Calculate aggregate score
    let avgScore = 4.9;
    if (reviews.length > 0) {
      const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
      avgScore = (sum / reviews.length).toFixed(1);
    }
    
    res.render('feedback', { activePage: 'Feedback', reviews, avgScore });
  } catch (err) {
    console.error('Error loading reviews:', err.message);
    res.render('feedback', { activePage: 'Feedback', reviews: [], avgScore: '4.9' });
  }
});

// Post Feedback / Review Route
app.post('/feedback/add', async (req, res) => {
  const { name, role, rating, comment } = req.body;
  
  if (!name || !rating || !comment) {
    return res.redirect('/feedback?error=missing_fields');
  }
  
  try {
    await db.execute(
      'INSERT INTO reviews (name, role, rating, comment) VALUES (?, ?, ?, ?)',
      [name, role || 'Client', parseInt(rating), comment]
    );
    res.redirect('/feedback?success=review_added');
  } catch (err) {
    console.error('Error adding review:', err.message);
    res.redirect('/feedback?error=db_error');
  }
});

// 6. Articles Section
app.get('/articles', (req, res) => {
  const searchQuery = req.query.q || '';
  res.render('articles', { activePage: 'Articles', searchQuery });
});

// 7. Gallery & Events Page
app.get('/gallery', (req, res) => {
  res.render('gallery', { activePage: 'Gallery' });
});

// 8. Contact Us Form Page
app.get('/contact', (req, res) => {
  const statusMsg = req.query.status || null;
  res.render('contact', { activePage: 'Contact', statusMsg, errorMsg: null, formData: {} });
});

// Handle Inquiry Form Submission (FR-02)
app.post('/contact', async (req, res) => {
  const { name, email, phone, company, country, job_title, job_details } = req.body;
  const formData = req.body;
  
  // 1. Check required fields presence
  if (!name || !email || !phone || !job_details) {
    return res.render('contact', {
      activePage: 'Contact',
      statusMsg: 'error_missing',
      errorMsg: 'Please fill all required fields marked with an asterisk (*).',
      formData
    });
  }
  
  // Trim whitespace
  const trimmedName = name.trim();
  const trimmedEmail = email.trim();
  const trimmedPhone = phone.trim();
  const trimmedCompany = (company || '').trim();
  const trimmedCountry = (country || '').trim();
  const trimmedJobTitle = (job_title || '').trim();
  const trimmedJobDetails = job_details.trim();

  // 2. Validate Name format and length
  if (trimmedName.length < 2 || trimmedName.length > 100) {
    return res.render('contact', {
      activePage: 'Contact',
      statusMsg: null,
      errorMsg: 'Full Name must be between 2 and 100 characters.',
      formData
    });
  }
  const nameRegex = /^[a-zA-Z\s'\-\.]+$/;
  if (!nameRegex.test(trimmedName)) {
    return res.render('contact', {
      activePage: 'Contact',
      statusMsg: null,
      errorMsg: 'Full Name contains invalid characters. Use letters, spaces, hyphens, or dots only.',
      formData
    });
  }

  // 3. Validate Email format and length
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (trimmedEmail.length > 100 || !emailRegex.test(trimmedEmail)) {
    return res.render('contact', {
      activePage: 'Contact',
      statusMsg: null,
      errorMsg: 'Invalid email address format (e.g. name@domain.com).',
      formData
    });
  }

  // 4. Validate Phone format and length
  if (trimmedPhone.length < 7 || trimmedPhone.length > 20) {
    return res.render('contact', {
      activePage: 'Contact',
      statusMsg: null,
      errorMsg: 'Phone Number must be between 7 and 20 characters.',
      formData
    });
  }
  const phoneRegex = /^[0-9\s\-\+\(\)\.]+$/;
  if (!phoneRegex.test(trimmedPhone)) {
    return res.render('contact', {
      activePage: 'Contact',
      statusMsg: null,
      errorMsg: 'Phone Number contains invalid characters. Use digits, spaces, hyphens, plus, or parentheses only.',
      formData
    });
  }

  // 5. Validate optional fields
  if (trimmedCompany.length > 100) {
    return res.render('contact', {
      activePage: 'Contact',
      statusMsg: null,
      errorMsg: 'Company Name cannot exceed 100 characters.',
      formData
    });
  }
  if (trimmedCountry.length > 100) {
    return res.render('contact', {
      activePage: 'Contact',
      statusMsg: null,
      errorMsg: 'Country cannot exceed 100 characters.',
      formData
    });
  }
  if (trimmedJobTitle.length > 100) {
    return res.render('contact', {
      activePage: 'Contact',
      statusMsg: null,
      errorMsg: 'Job Title cannot exceed 100 characters.',
      formData
    });
  }

  // 6. Validate Job Details length
  if (trimmedJobDetails.length < 10 || trimmedJobDetails.length > 2000) {
    return res.render('contact', {
      activePage: 'Contact',
      statusMsg: null,
      errorMsg: 'Project details must be between 10 and 2000 characters.',
      formData
    });
  }
  
  try {
    await db.execute(
      `INSERT INTO inquiries (name, email, phone, company, country, job_title, job_details, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 'New')`,
      [trimmedName, trimmedEmail, trimmedPhone, trimmedCompany, trimmedCountry, trimmedJobTitle, trimmedJobDetails]
    );
    
    res.render('contact', {
      activePage: 'Contact',
      statusMsg: 'success',
      errorMsg: null,
      formData: {}
    });
  } catch (err) {
    console.error('Error inserting inquiry:', err.message);
    res.render('contact', {
      activePage: 'Contact',
      statusMsg: 'error_server',
      errorMsg: null,
      formData
    });
  }
});

// ==========================================
// ADMIN AUTHENTICATION
// ==========================================

// Admin Login Page
app.get('/admin/login', (req, res) => {
  if (req.session && req.session.adminId) {
    return res.redirect('/admin/dashboard');
  }
  const errorMsg = req.query.error || null;
  res.render('admin-login', { activePage: 'Admin Login', errorMsg });
});

// Handle Admin Login (FR-03 authentication)
app.post('/admin/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.redirect('/admin/login?error=missing');
  }
  
  try {
    const admin = await db.getOne('SELECT * FROM admins WHERE username = ?', [email]);
    
    if (!admin) {
      return res.redirect('/admin/login?error=invalid');
    }
    
    // Compare password using bcrypt
    const match = await bcrypt.compare(password, admin.password);
    
    if (!match) {
      return res.redirect('/admin/login?error=invalid');
    }
    
    // Auth Success - Prevent Session Fixation by regenerating session (NFR-02 secure storage)
    req.session.regenerate((err) => {
      if (err) {
        console.error('Session regeneration error:', err.message);
        return res.redirect('/admin/login?error=server');
      }
      req.session.adminId = admin.id;
      req.session.adminUser = admin.username;
      
      req.session.save((saveErr) => {
        if (saveErr) {
          console.error('Session save error:', saveErr.message);
          return res.redirect('/admin/login?error=server');
        }
        res.redirect('/admin/dashboard');
      });
    });
  } catch (err) {
    console.error('Admin login error:', err.message);
    res.redirect('/admin/login?error=server');
  }
});

// Admin Logout (FR-06) - destroy session and return to the Admin Login page
app.get('/admin/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error('Error clearing session:', err.message);
    res.clearCookie('connect.sid');
    // Prevent the back button from showing a cached authenticated page
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.redirect('/admin/login');
  });
});

// ==========================================
// ADMIN DASHBOARD SECURE ROUTES (FR-04, FR-05)
// ==========================================

// Dashboard Overview (FR-05 dashboard details)
app.get('/admin/dashboard', requireAdmin, async (req, res) => {
  try {
    // 1. Total count metrics
    const totalCountRow = await db.getOne('SELECT COUNT(*) AS total FROM inquiries');
    const totalInquiries = totalCountRow ? totalCountRow.total : 0;
    
    const unreadCountRow = await db.getOne("SELECT COUNT(*) AS total FROM inquiries WHERE status = 'New'");
    const unreadInquiries = unreadCountRow ? unreadCountRow.total : 0;
    
    const progressCountRow = await db.getOne("SELECT COUNT(*) AS total FROM inquiries WHERE status = 'In progress'");
    const progressInquiries = progressCountRow ? progressCountRow.total : 0;
    
    const reviewsRow = await db.getOne("SELECT COUNT(*) AS count, AVG(rating) as avg FROM reviews");
    const avgRating = reviewsRow && reviewsRow.avg ? parseFloat(reviewsRow.avg).toFixed(1) : '4.9';
    const reviewsCount = reviewsRow ? reviewsRow.count : 0;
    
    // 2. Fetch list of inquiries
    const inquiries = await db.query('SELECT * FROM inquiries ORDER BY created_at DESC');
    
    res.render('admin-dashboard', {
      activePage: 'Dashboard',
      metrics: {
        total: totalInquiries,
        unread: unreadInquiries,
        progress: progressInquiries,
        rating: avgRating,
        reviewsCount: reviewsCount
      },
      inquiries
    });
  } catch (err) {
    console.error('Error loading admin dashboard:', err.message);
    res.status(500).send('Administrative System Error');
  }
});

// Admin Articles
app.get('/admin/articles', requireAdmin, (req, res) => {
  res.render('admin-articles', { activePage: 'Articles' });
});

// Admin Events
app.get('/admin/events', requireAdmin, (req, res) => {
  res.render('admin-events', { activePage: 'Events' });
});

// Admin Gallery
app.get('/admin/gallery', requireAdmin, (req, res) => {
  res.render('admin-gallery', { activePage: 'Gallery' });
});

// Admin Reviews
app.get('/admin/reviews', requireAdmin, async (req, res) => {
  try {
    const reviews = await db.query('SELECT * FROM reviews ORDER BY created_at DESC');
    res.render('admin-reviews', { activePage: 'Reviews', reviews });
  } catch (err) {
    console.error('Error loading admin reviews:', err.message);
    res.render('admin-reviews', { activePage: 'Reviews', reviews: [] });
  }
});

// Admin Settings
app.get('/admin/settings', requireAdmin, (req, res) => {
  res.render('admin-settings', { activePage: 'Settings', session: req.session });
});

// Inquiry Detail View
app.get('/admin/inquiries/:id', requireAdmin, async (req, res) => {
  const inquiryId = req.params.id;
  try {
    const inquiry = await db.getOne('SELECT * FROM inquiries WHERE id = ?', [inquiryId]);
    if (!inquiry) {
      return res.redirect('/admin/dashboard');
    }
    
    res.render('admin-inquiry', {
      activePage: 'Inquiries',
      inquiry
    });
  } catch (err) {
    console.error('Error fetching inquiry detail:', err.message);
    res.redirect('/admin/dashboard');
  }
});

// Update Inquiry Status (POST)
app.post('/admin/inquiries/:id/status', requireAdmin, async (req, res) => {
  const inquiryId = req.params.id;
  const { status } = req.body;
  
  if (!status) {
    return res.redirect(`/admin/inquiries/${inquiryId}?error=status_required`);
  }
  
  try {
    await db.execute('UPDATE inquiries SET status = ? WHERE id = ?', [status, inquiryId]);
    res.redirect(`/admin/inquiries/${inquiryId}?success=status_updated`);
  } catch (err) {
    console.error('Error updating inquiry status:', err.message);
    res.redirect(`/admin/inquiries/${inquiryId}?error=db_error`);
  }
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`Kritika AI Website serving on http://localhost:${PORT}`);
  console.log(`Database engine active: [SQLite -> ./database.sqlite]`);
  console.log(`Admin panel: http://localhost:${PORT}/admin/login`);
  console.log(`=======================================================`);
});
