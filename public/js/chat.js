document.addEventListener('DOMContentLoaded', () => {
  const chatBubble = document.getElementById('chat-bubble');
  const chatTooltip = document.getElementById('chat-tooltip');
  const chatPanel = document.getElementById('chat-panel');
  const chatClose = document.getElementById('chat-close');
  const chatMessages = document.getElementById('chat-messages');
  const chatInput = document.getElementById('chat-input');
  const chatSend = document.getElementById('chat-send');
  const suggestContainer = document.getElementById('chat-suggestions');

  if (!chatBubble || !chatPanel) return;

  // Show tooltip after a short delay
  setTimeout(() => {
    if (chatPanel.style.display !== 'flex') {
      chatTooltip.style.display = 'block';
    }
  }, 4000);

  // Toggle Panel
  chatBubble.addEventListener('click', () => {
    chatPanel.style.display = 'flex';
    chatBubble.style.display = 'none';
    chatTooltip.style.display = 'none';
    scrollToBottom();
  });

  chatClose.addEventListener('click', (e) => {
    e.stopPropagation();
    chatPanel.style.display = 'none';
    chatBubble.style.display = 'flex';
  });

  // Suggested questions click handler
  if (suggestContainer) {
    suggestContainer.addEventListener('click', (e) => {
      const target = e.target.closest('.chat-suggest-btn');
      if (!target) return;
      const text = target.textContent.trim();
      handleUserMsg(text);
    });
  }

  // Input field Enter key handler
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const text = chatInput.value.trim();
      if (text) {
        handleUserMsg(text);
        chatInput.value = '';
      }
    }
  });

  // Send button click
  chatSend.addEventListener('click', () => {
    const text = chatInput.value.trim();
    if (text) {
      handleUserMsg(text);
      chatInput.value = '';
    }
  });

  function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function appendMessage(text, isUser = false, isHTML = false) {
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${isUser ? 'chat-bubble-user' : 'chat-bubble-bot'}`;
    if (isHTML) {
      bubble.innerHTML = text;
    } else {
      bubble.textContent = text;
    }
    chatMessages.appendChild(bubble);
    scrollToBottom();
    return bubble;
  }

  function showTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'chat-bubble chat-bubble-bot typing-indicator-bubble';
    indicator.innerHTML = `
      <div class="typing-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
    `;
    chatMessages.appendChild(indicator);
    scrollToBottom();
    return indicator;
  }

  function handleUserMsg(text) {
    // Append user message
    appendMessage(text, true);

    // Hide initial suggestions once user starts chatting
    if (suggestContainer) {
      suggestContainer.style.display = 'none';
    }

    // Show typing indicator
    const indicator = showTypingIndicator();

    // Generate response
    setTimeout(() => {
      indicator.remove();
      const response = getBotResponse(text);
      appendMessage(response.text, false, true);

      // Render custom follow-up suggestions/buttons if any
      if (response.suggestions && response.suggestions.length > 0) {
        const followUpContainer = document.createElement('div');
        followUpContainer.className = 'chat-suggestions';
        response.suggestions.forEach(item => {
          if (item.type === 'link') {
            const btn = document.createElement('a');
            btn.className = 'chat-suggest-btn btn-primary btn-sm';
            btn.href = item.url;
            btn.style.display = 'inline-block';
            btn.style.margin = '4px 4px 0 0';
            btn.style.textAlign = 'center';
            btn.innerHTML = item.label;
            followUpContainer.appendChild(btn);
          } else {
            const btn = document.createElement('button');
            btn.className = 'chat-suggest-btn';
            btn.textContent = item.label;
            followUpContainer.appendChild(btn);
          }
        });
        chatMessages.appendChild(followUpContainer);
        scrollToBottom();
      }
    }, 1000);
  }

  // FAQ matching logic
  function getBotResponse(userMsg) {
    const msg = userMsg.toLowerCase();
    
    // 1. WhatsApp / Chatbot query
    if (msg.includes('chatbot') || msg.includes('bot') || msg.includes('chat')) {
      return {
        text: `We specialize in building intelligent **AI Chatbots** for websites, WhatsApp, and Slack. They run on custom knowledge bases (using Retrieval-Augmented Generation / RAG) so they only answer from your official documentation.
        <br/><br/>
        Would you like to get a quote or pass your details to our team for a callback?`,
        suggestions: [
          { type: 'link', label: 'See Chatbot Case Study →', url: '/cases/1' },
          { type: 'link', label: 'Pre-fill Contact Form →', url: '/contact?prefill=chatbot' }
        ]
      };
    }

    // 2. Timeline query
    if (msg.includes('long') || msg.includes('time') || msg.includes('duration') || msg.includes('weeks') || msg.includes('timeline')) {
      return {
        text: `A typical project takes **4 to 8 weeks** from discovery to launch:
        <ul>
          <li><strong>Weeks 1-2:</strong> Discovery, requirements & UX mockups.</li>
          <li><strong>Weeks 3-5:</strong> Core frontend & backend integration.</li>
          <li><strong>Weeks 6-7:</strong> Testing, validation & security audits.</li>
          <li><strong>Week 8:</strong> Production deployment & training.</li>
        </ul>
        What kind of project timeline are you aiming for?`,
        suggestions: [
          { type: 'link', label: 'Start Project Discovery →', url: '/contact?prefill=timeline' }
        ]
      };
    }

    // 3. Case Studies query
    if (msg.includes('case') || msg.includes('project') || msg.includes('portfolio') || msg.includes('work') || msg.includes('showcase')) {
      return {
        text: `We have shipped several successful AI solutions, including:
        <br/>
        • **Triage bot** for a health clinic (cut response times by 70%)
        <br/>
        • **Internal semantic search** for HR/insurance policies
        <br/>
        • **Lead engagement bot** for an educational institution
        <br/><br/>
        You can view full details on our **Case Studies** page!`,
        suggestions: [
          { type: 'link', label: 'View Case Studies →', url: '/cases' }
        ]
      };
    }

    // 4. Human / contact query
    if (msg.includes('human') || msg.includes('person') || msg.includes('contact') || msg.includes('call') || msg.includes('talk') || msg.includes('admin')) {
      return {
        text: `I can package our conversation and forward it to our team. Click below to open our pre-filled project inquiry form, and Kritika will get back to you within 1 business day!`,
        suggestions: [
          { type: 'link', label: 'Open Contact Form →', url: '/contact?prefill=handoff' }
        ]
      };
    }

    // 5. Pricing / Cost query
    if (msg.includes('price') || msg.includes('cost') || msg.includes('budget') || msg.includes('npr') || msg.includes('rate')) {
      return {
        text: `Our pricing depends entirely on the scope (e.g., whether it is a simple website FAQ chatbot or a custom multi-agent workflow automation system). 
        <br/><br/>
        We work with flexible budgets and offer transparent estimates during our discovery phase. Tell us a bit about your requirement to get an estimate!`,
        suggestions: [
          { type: 'link', label: 'Request custom quote →', url: '/contact' }
        ]
      };
    }

    // 6. Services overview query
    if (msg.includes('service') || msg.includes('offer') || msg.includes('what do you do') || msg.includes('solution') || msg.includes('help with')) {
      return {
        text: `We offer three core AI services:
        <br/><br/>
        • <strong>AI Chatbots</strong> — website, WhatsApp & Slack assistants trained on your docs<br/>
        • <strong>Workflow Automation</strong> — document processing, reporting & data pipelines<br/>
        • <strong>Custom Models</strong> — recommendation engines, semantic search & fine-tuned LLMs
        <br/><br/>
        Which one fits your need?`,
        suggestions: [
          { type: 'link', label: 'Explore Solutions →', url: '/solutions' }
        ]
      };
    }

    // 7. Automation query
    if (msg.includes('automat') || msg.includes('workflow') || msg.includes('ocr') || msg.includes('invoice') || msg.includes('report')) {
      return {
        text: `Our <strong>automation</strong> work removes repetitive manual tasks — invoice OCR pipelines, automated reporting dashboards, and data entry sync. One client saved 95% of weekly reporting time.`,
        suggestions: [
          { type: 'link', label: 'See Automation Case →', url: '/cases/5' }
        ]
      };
    }

    // 8. Machine learning / custom model query
    if (msg.includes('machine learning') || msg.includes('ml') || msg.includes('model') || msg.includes('recommendation') || msg.includes('rag') || msg.includes('embedding')) {
      return {
        text: `We build <strong>custom machine learning models</strong> — semantic search with embeddings + rerankers, real-time recommendation engines, and on-premise RAG systems for private data. Deployments can be fully on-prem for security.`,
        suggestions: [
          { type: 'link', label: 'View Custom AI Work →', url: '/cases/3' }
        ]
      };
    }

    // 9. Company / about info query
    if (msg.includes('about') || msg.includes('who are you') || msg.includes('company') || msg.includes('where') || msg.includes('located') || msg.includes('experience')) {
      return {
        text: `Kritika.ai is a focused AI software studio based in <strong>Kathmandu, Nepal</strong>, building chatbots, automation, and ML solutions since <strong>2021</strong>. We work end-to-end, from discovery to deployment and handover.`,
        suggestions: [
          { type: 'link', label: 'Read Client Feedback →', url: '/feedback' }
        ]
      };
    }

    // 10. Greeting
    if (msg.includes('hi') || msg.includes('hello') || msg.includes('hey') || msg.includes('greetings')) {
      return {
        text: `Hello! 👋 I'm Kritika's AI assistant. Ask me about our services, pricing, project timelines, or past work — or I can connect you with a human.`,
        suggestions: [
          { type: 'button', label: 'What services do you offer?' },
          { type: 'button', label: 'How much does it cost?' }
        ]
      };
    }

    // Default Fallback Response
    return {
      text: `Thanks for your message! I'm Kritika's AI assistant. I can answer questions about our services (Chatbots, Automation, Custom Models), timelines, and past projects.
      <br/><br/>
      Select one of the topics below or type your question:`,
      suggestions: [
        { type: 'button', label: 'AI chatbot capabilities' },
        { type: 'button', label: 'Typical project timelines' },
        { type: 'button', label: 'Talk to a human developer' }
      ]
    };
  }
});
