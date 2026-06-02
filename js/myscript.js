// --- Web3Forms Configuration ---
// Paste your Web3Forms Access Key here:
const WEB3FORMS_ACCESS_KEY = "5693a3ad-cc13-490f-a05c-1da11911737e";

// --- Medium Integration Configuration ---
const MEDIUM_USERNAME = "emdibee";

document.addEventListener('DOMContentLoaded', () => {

    // --- Dark Theme Toggle Control ---
    const themeToggles = document.querySelectorAll('.theme-toggle');
    
    // Function to apply theme (light or dark)
    const applyTheme = (theme) => {
        if (theme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
    };

    // Attach click listeners to all theme toggles
    themeToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            applyTheme(newTheme);
            localStorage.setItem('mbr-theme', newTheme);
        });
    });

    // --- Sticky/Floating Navbar Reveal on Scroll ---
    const navbarWrapper = document.querySelector('.navbar-wrapper');
    const heroSection = document.getElementById('hero');

    if (navbarWrapper && heroSection) {
        const handleScroll = () => {
            const heroHeight = heroSection.offsetHeight;
            if (window.scrollY >= heroHeight - 200) {
                navbarWrapper.classList.add('visible');
            } else {
                navbarWrapper.classList.remove('visible');
            }
        };

        // Run on load to set initial state
        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });
    }

    // --- Mobile Menu Toggle ---
    const nav = document.querySelector('.navbar');
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelectorAll('.nav-links a');

    if (menuToggle && nav) {
        menuToggle.addEventListener('click', () => {
            const isOpened = menuToggle.getAttribute('aria-expanded') === 'true';
            menuToggle.setAttribute('aria-expanded', !isOpened);
            nav.classList.toggle('mobile-active');
        });

        // Close menu when clicking a nav link
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.setAttribute('aria-expanded', 'false');
                nav.classList.remove('mobile-active');
            });
        });
    }

    // --- Contact Form Handling & Validation ---
    const contactForm = document.getElementById('contact-form');
    const formName = document.getElementById('form-name');
    const formEmail = document.getElementById('form-email');
    const formMessage = document.getElementById('form-message');
    const submitBtn = document.getElementById('submit-btn');

    // Modals
    const feedbackModal = document.getElementById('feedback-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const senderNameSpan = document.getElementById('sender-name');

    if (contactForm) {
        // Validate single group
        const validateInput = (input, validatorFn) => {
            const group = input.closest('.form-group');
            const isValid = validatorFn(input.value.trim());
            if (isValid) {
                group.classList.remove('invalid');
            } else {
                group.classList.add('invalid');
            }
            return isValid;
        };

        // Validators
        const isNotEmpty = val => val.length > 0;
        const isValidEmail = val => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(val);
        };

        // Live input feedback (clears error states when user types)
        [formName, formEmail, formMessage].forEach(input => {
            input.addEventListener('input', () => {
                const group = input.closest('.form-group');
                group.classList.remove('invalid');
            });
        });

        // Form Submit
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Run validation
            const isNameValid = validateInput(formName, isNotEmpty);
            const isEmailValid = validateInput(formEmail, isValidEmail);
            const isMessageValid = validateInput(formMessage, isNotEmpty);

            if (isNameValid && isEmailValid && isMessageValid) {
                // Form is valid! Set to loading state
                submitBtn.classList.add('loading');
                submitBtn.disabled = true;
                formName.disabled = true;
                formEmail.disabled = true;
                formMessage.disabled = true;

                // Helper to reset loading state
                const resetFormLoading = () => {
                    submitBtn.classList.remove('loading');
                    submitBtn.disabled = false;
                    formName.disabled = false;
                    formEmail.disabled = false;
                    formMessage.disabled = false;
                };

                // Helper to show success modal
                const showSuccess = () => {
                    senderNameSpan.textContent = formName.value.trim();
                    feedbackModal.classList.add('active');
                    feedbackModal.setAttribute('aria-hidden', 'false');
                    contactForm.reset();
                };

                // Fallback simulation if access key is not configured yet
                if (!WEB3FORMS_ACCESS_KEY) {
                    console.warn("Web3Forms Access Key is not set. Simulating form submission.");
                    setTimeout(() => {
                        resetFormLoading();
                        showSuccess();
                    }, 1200);
                    return;
                }

                // Send data to Web3Forms
                fetch("https://api.web3forms.com/submit", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        access_key: WEB3FORMS_ACCESS_KEY,
                        name: formName.value.trim(),
                        email: formEmail.value.trim(),
                        message: formMessage.value.trim()
                    })
                })
                    .then(response => {
                        if (response.ok) {
                            return response.json();
                        }
                        throw new Error('Network response was not ok.');
                    })
                    .then(data => {
                        resetFormLoading();
                        if (data && data.success) {
                            showSuccess();
                        } else {
                            alert("There was an error sending your message: " + (data.message || "Unknown error"));
                        }
                    })
                    .catch(error => {
                        console.error("Form submission error:", error);
                        resetFormLoading();
                        alert("Failed to send message. Please check your internet connection or try again later.");
                    });
            }
        });
    }

    // --- Modal Management ---
    if (feedbackModal && modalCloseBtn) {
        const closeModal = () => {
            feedbackModal.classList.remove('active');
            feedbackModal.setAttribute('aria-hidden', 'true');
        };

        modalCloseBtn.addEventListener('click', closeModal);

        // Click outside modal content to close
        feedbackModal.addEventListener('click', (e) => {
            if (e.target === feedbackModal) {
                closeModal();
            }
        });

        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && feedbackModal.classList.contains('active')) {
                closeModal();
            }
        });
    }

    // --- Timeline Scroll-into-view Observer ---
    const timelineItems = document.querySelectorAll('.timeline-item');
    if (timelineItems.length > 0) {
        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -15% 0px',
            threshold: 0.1
        };

        const timelineObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                } else {
                    entry.target.classList.remove('in-view');
                }
            });
        }, observerOptions);

        timelineItems.forEach(item => {
            timelineObserver.observe(item);
        });
    }

    // --- Collapsible Work Experience ---
    const expandButtons = document.querySelectorAll('.expand-btn');
    expandButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const collapsible = btn.closest('.collapsible');
            const isExpanded = collapsible.classList.contains('expanded');

            if (isExpanded) {
                collapsible.classList.remove('expanded');
                btn.textContent = 'Show More';
                // Scroll back to the top of the timeline item if it goes off-screen
                collapsible.closest('.timeline-item').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            } else {
                collapsible.classList.add('expanded');
                btn.textContent = 'Show Less';
            }
        });
    });

    // --- Fetch & Render Medium Posts ---
    const fetchMediumPosts = () => {
        const writingSection = document.getElementById('writing');
        const writingGrid = document.getElementById('writing-grid');

        if (!writingSection || !writingGrid || !MEDIUM_USERNAME) return;

        // Use rss2json API to fetch Medium RSS feed as JSON
        const rssFeedUrl = `https://medium.com/feed/@${MEDIUM_USERNAME}`;
        const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssFeedUrl)}`;

        fetch(apiUrl)
            .then(response => {
                if (!response.ok) throw new Error('Failed to fetch RSS feed');
                return response.json();
            })
            .then(data => {
                if (data.status !== 'ok' || !data.items || data.items.length === 0) {
                    throw new Error('No items found or status not ok');
                }

                // Slice the most recent 3 posts
                const posts = data.items.slice(0, 3);
                writingGrid.innerHTML = ''; // Clear skeleton or default text

                const tagClasses = ['tag-indigo', 'tag-sky', 'tag-purple', 'tag-emerald', 'tag-orange'];

                posts.forEach((post, index) => {
                    // Extract tag/category
                    const rawTag = (post.categories && post.categories.length > 0) ? post.categories[0] : 'Article';
                    const tagClass = tagClasses[index % tagClasses.length];

                    // Format Date
                    let formattedDate = 'Recent';
                    if (post.pubDate) {
                        // Replace dashes with slashes for cross-browser compatibility
                        const dateObj = new Date(post.pubDate.replace(/-/g, '/'));
                        if (!isNaN(dateObj.getTime())) {
                            formattedDate = dateObj.toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                            });
                        }
                    }

                    // Format & clean description snippet
                    let description = '';
                    if (post.description) {
                        description = post.description
                            .replace(/<[^>]*>/g, '') // strip HTML
                            .replace(/\s+/g, ' ')    // normalize spacing
                            .trim();
                        // Truncate to a reasonable character length for a snippet
                        if (description.length > 140) {
                            description = description.slice(0, 137) + '...';
                        }
                    }

                    // Card template
                    const card = document.createElement('a');
                    card.href = post.link;
                    card.target = '_blank';
                    card.rel = 'noopener noreferrer';
                    card.className = 'writing-card';

                    // Extract thumbnail from post content if API thumbnail is empty
                    let thumbnailSrc = post.thumbnail;
                    if (!thumbnailSrc) {
                        const imgMatch = (post.description || post.content || '').match(/<img[^>]+src=["']([^"']+)["']/i);
                        if (imgMatch) {
                            thumbnailSrc = imgMatch[1];
                        }
                    }

                    // Thumbnail image element (with fallback if missing)
                    const thumbnailHtml = thumbnailSrc 
                        ? `<img src="${thumbnailSrc}" alt="${post.title}" class="writing-thumbnail" loading="lazy">`
                        : `<div class="writing-thumbnail-fallback"></div>`;

                    card.innerHTML = `
                        <div class="writing-thumbnail-wrapper">
                            ${thumbnailHtml}
                        </div>
                        <div class="writing-content">
                            <div class="writing-meta">
                                <span class="writing-tag ${tagClass}">${rawTag}</span>
                                <span class="writing-date">${formattedDate}</span>
                            </div>
                            <h3 class="writing-title">${post.title}</h3>
                            <p class="writing-desc">${description}</p>
                            <span class="writing-link">
                                Read on Medium
                                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                    <polyline points="12 5 19 12 12 19"></polyline>
                                </svg>
                            </span>
                        </div>
                    `;

                    writingGrid.appendChild(card);
                });

                // On success, reveal the section with fade-in animation
                writingSection.classList.add('visible');
            })
            .catch(err => {
                console.warn('Medium posts fetch failed. Keeping section hidden. Error:', err);
                // Section remains hidden (display: none)
            });
    };

    fetchMediumPosts();


});
