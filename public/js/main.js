document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile Navbar Toggling
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const navMenu = document.getElementById('nav-menu');

  if (mobileMenuBtn && navMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      if (navMenu.style.display === 'flex') {
        navMenu.style.display = 'none';
      } else {
        navMenu.style.display = 'flex';
        navMenu.style.flexDirection = 'column';
        navMenu.style.position = 'absolute';
        navMenu.style.top = '70px';
        navMenu.style.left = '0';
        navMenu.style.width = '100%';
        navMenu.style.backgroundColor = 'rgba(10, 12, 16, 0.95)';
        navMenu.style.padding = '20px';
        navMenu.style.borderBottom = '1px solid rgba(255, 255, 255, 0.1)';
        navMenu.style.gap = '16px';
      }
    });
  }

  // 2. Case Study Category Filters
  const filterPills = document.querySelectorAll('.case-filters .pill');
  const caseCards = document.querySelectorAll('.cases-grid .case-card');

  if (filterPills.length > 0 && caseCards.length > 0) {
    filterPills.forEach(pill => {
      pill.addEventListener('click', () => {
        // Toggle active class on pills
        filterPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');

        const filter = pill.getAttribute('data-filter');

        // Filter cards
        caseCards.forEach(card => {
          const category = card.getAttribute('data-category');
          if (filter === 'all' || category === filter) {
            card.style.display = 'flex';
            // Subtle fade-in animation
            card.style.opacity = '0';
            setTimeout(() => {
              card.style.opacity = '1';
              card.style.transition = 'opacity 0.3s ease';
            }, 50);
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  // 3. Contact Form Prefilling from Chatbot Handoff
  const urlParams = new URLSearchParams(window.location.search);
  const prefill = urlParams.get('prefill');
  
  if (prefill) {
    const jobTitleField = document.getElementById('job_title');
    const jobDetailsField = document.getElementById('job_details');
    const companyField = document.getElementById('company');

    if (jobTitleField && jobDetailsField) {
      if (prefill === 'chatbot') {
        jobTitleField.value = 'AI Chatbot Integration';
        jobDetailsField.value = 'I am interested in building an AI Chatbot for my business. I engaged with the chatbot assistant on your site and would like to explore this further.';
      } else if (prefill === 'timeline') {
        jobTitleField.value = 'AI Project Discovery';
        jobDetailsField.value = 'I want to schedule an initial discovery call for a custom AI solution. Please contact me to discuss requirements and get a project timeline estimate.';
      } else if (prefill === 'handoff') {
        jobTitleField.value = 'AI Solutions Consultation';
        jobDetailsField.value = 'Prefilled inquiry via AI Chatbot helper. I would like a consultation regarding custom AI solutions for my business workflows.';
      }
    }
  }

  // 4. Star Rating Selection (Feedback Form Modal)
  const stars = document.querySelectorAll('.star-rating-select span');
  const ratingInput = document.getElementById('rating-value');
  const addReviewBtn = document.getElementById('add-review-btn');
  const reviewModal = document.getElementById('review-modal');
  const closeModal = document.getElementById('close-modal');

  if (addReviewBtn && reviewModal && closeModal) {
    addReviewBtn.addEventListener('click', () => {
      reviewModal.style.display = 'flex';
    });

    closeModal.addEventListener('click', () => {
      reviewModal.style.display = 'none';
    });

    // Close when clicking outside of modal content
    window.addEventListener('click', (e) => {
      if (e.target === reviewModal) {
        reviewModal.style.display = 'none';
      }
    });
  }

  if (stars.length > 0 && ratingInput) {
    stars.forEach(star => {
      star.addEventListener('click', () => {
        const val = parseInt(star.getAttribute('data-value'));
        ratingInput.value = val;
        
        // Update visual selection
        stars.forEach(s => {
          const sVal = parseInt(s.getAttribute('data-value'));
          if (sVal <= val) {
            s.classList.add('selected');
          } else {
            s.classList.remove('selected');
          }
        });
      });
    });
  }

  // 5. Event RSVPs Interaction
  const rsvpBtns = document.querySelectorAll('.event-card .btn');
  rsvpBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const eventTitle = btn.closest('.event-card').querySelector('h3').textContent;
      showToast(`RSVP Confirmed for: "${eventTitle}"! We will email you the link shortly.`);
      btn.textContent = 'Registered';
      btn.classList.remove('btn-primary');
      btn.classList.add('btn-secondary');
      btn.style.pointerEvents = 'none';
    });
  });

  // Helper function to show notifications
  function showToast(message) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      toast.remove();
    }, 5000);
  }
});
