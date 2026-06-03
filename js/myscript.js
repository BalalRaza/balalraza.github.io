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
    let contactIntent = 'not_classified';
    const contactForm = document.getElementById('contact-form');
    const formName = document.getElementById('form-name');
    const formEmail = document.getElementById('form-email');
    const contactMessage = document.getElementById('contact-message');
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
        [formName, formEmail, contactMessage].forEach(input => {
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
            const isMessageValid = validateInput(contactMessage, isNotEmpty);

            if (isNameValid && isEmailValid && isMessageValid) {
                // Form is valid! Set to loading state
                submitBtn.classList.add('loading');
                submitBtn.disabled = true;
                formName.disabled = true;
                formEmail.disabled = true;
                contactMessage.disabled = true;

                // Helper to reset loading state
                const resetFormLoading = () => {
                    submitBtn.classList.remove('loading');
                    submitBtn.disabled = false;
                    formName.disabled = false;
                    formEmail.disabled = false;
                    contactMessage.disabled = false;
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

                // Send data to Web3Forms (with dynamic subject line to facilitate email filtering)
                const subjectLine = contactIntent === 'generic spam'
                    ? '[SPAM] New Contact Inquiry'
                    : contactIntent === 'engineering consulting'
                    ? '[High-Value] New Contact Inquiry'
                    : 'New Contact Inquiry';

                fetch("https://api.web3forms.com/submit", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        access_key: WEB3FORMS_ACCESS_KEY,
                        subject: subjectLine,
                        name: formName.value.trim(),
                        email: formEmail.value.trim(),
                        message: contactMessage.value.trim(),
                        intent: contactIntent
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

                // Filter out the older article from 2017 (and 2018 first-year article)
                const posts = data.items
                    .filter(post => {
                        if (!post.pubDate) return true;
                        const dateObj = new Date(post.pubDate.replace(/-/g, '/'));
                        const year = dateObj.getFullYear();
                        return isNaN(year) || (year !== 2017 && year !== 2018);
                    })
                    .slice(0, 3);

                if (posts.length === 1) {
                    writingGrid.classList.add('single-post');
                } else {
                    writingGrid.classList.remove('single-post');
                }

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

                    // Format & clean description snippet, extracting photo attribution if present
                    let cleanDescription = post.description || '';
                    let photoAttribution = '';
                    
                    const figcaptionMatch = cleanDescription.match(/<figcaption>([\s\S]*?)<\/figcaption>/i);
                    if (figcaptionMatch) {
                        photoAttribution = figcaptionMatch[1].replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
                        // Remove the figure/figcaption entirely from the description before stripping HTML
                        cleanDescription = cleanDescription.replace(/<figure>[\s\S]*?<\/figure>/i, '');
                    }
                    
                    let description = cleanDescription
                        .replace(/<[^>]*>/g, '') // strip HTML
                        .replace(/\s+/g, ' ')    // normalize spacing
                        .trim();
                    
                    if (!photoAttribution) {
                        const attributionMatch = description.match(/^(Photo by\s+.*?on\s+Unsplash)/i);
                        if (attributionMatch) {
                            photoAttribution = attributionMatch[1];
                            description = description.substring(photoAttribution.length).trim();
                        }
                    }
                    
                    // Truncate to a reasonable character length for a snippet
                    if (description.length > 140) {
                        description = description.slice(0, 137) + '...';
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
                            ${photoAttribution ? `<span class="photo-attribution">${photoAttribution}</span>` : ''}
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

    // --- Edge Telemetry Ticker Logic ---
    const initTelemetry = async () => {
        const dashboard = document.getElementById('telemetry-dashboard');
        const statusDot = document.getElementById('telemetry-status');
        const tokenCountEl = document.getElementById('token-count');
        const computeCostEl = document.getElementById('compute-cost');
        const toggleBtn = document.getElementById('telemetry-toggle-btn');
        
        if (!dashboard || !statusDot || !tokenCountEl || !computeCostEl || !toggleBtn) return;
        
        let totalTokens = 0;
        let tokenizer = null;
        
        // Handle panel expand/collapse and user interaction flag
        toggleBtn.addEventListener('click', () => {
            dashboard.classList.add('user-interacted');
            dashboard.classList.toggle('collapsed');
        });
        
        try {
            // Dynamically import js-tiktoken
            const { getEncoding } = await import("https://esm.sh/js-tiktoken");
            tokenizer = getEncoding("cl100k_base");
            
            // Update status UI to ready
            statusDot.classList.remove('pulse');
            statusDot.classList.add('ready');
            statusDot.setAttribute('title', 'Telemetry Ready & Active');
            
            // Auto-reveal the dashboard upon initialization, then collapse after 4 seconds
            dashboard.classList.remove('collapsed');
            setTimeout(() => {
                if (!dashboard.matches(':hover') && !dashboard.classList.contains('user-interacted')) {
                    dashboard.classList.add('collapsed');
                }
            }, 4000);
            
            // Setup IntersectionObserver
            const observerOptions = {
                root: null,
                rootMargin: '0px',
                threshold: 0.1
            };
            
            const handleIntersection = (entries, observer) => {
                let updated = false;
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const element = entry.target;
                        if (element.getAttribute('data-tokenized') === 'true') return;
                        
                        element.setAttribute('data-tokenized', 'true');
                        
                        // Calculate tokens
                        const text = element.innerText || "";
                        if (text.trim().length > 0 && tokenizer) {
                            const tokens = tokenizer.encode(text).length;
                            totalTokens += tokens;
                            updated = true;
                        }
                    }
                });
                
                if (updated) {
                    updateTelemetryUI();
                }
            };
            
            const updateTelemetryUI = () => {
                const simulatedCost = (totalTokens / 1000000) * 0.15;
                
                // Trigger metrics flash micro-animation
                tokenCountEl.classList.add('flash');
                computeCostEl.classList.add('flash');
                
                tokenCountEl.textContent = totalTokens.toLocaleString();
                computeCostEl.textContent = `$${simulatedCost.toFixed(5)}`;
                
                setTimeout(() => {
                    tokenCountEl.classList.remove('flash');
                    computeCostEl.classList.remove('flash');
                }, 300);
            };
            
            const observer = new IntersectionObserver(handleIntersection, observerOptions);
            
            // Target distinct, non-overlapping primary containers
            const targets = [
                document.getElementById('hero'),
                ...document.querySelectorAll('.case-study-card'),
                ...document.querySelectorAll('.timeline-item'),
                document.getElementById('doctrine'),
                document.getElementById('contact')
            ].filter(el => el !== null);
            
            targets.forEach(target => observer.observe(target));
            
        } catch (error) {
            console.error("Failed to load tokenizer from CDN:", error);
            statusDot.style.backgroundColor = "var(--pastel-orange-text)";
            statusDot.setAttribute('title', 'Telemetry Offline (CDN error)');
        }
    };
    
    initTelemetry();

    // --- Shared Edge AI Model Loader ---
    let sharedExtractor = null;
    let sharedModelLoadingPromise = null;

    const getSharedExtractor = async () => {
        if (sharedExtractor) return sharedExtractor;
        if (sharedModelLoadingPromise) return sharedModelLoadingPromise;

        sharedModelLoadingPromise = (async () => {
            console.log("Downloading/Initializing shared edge AI model pipeline...");
            const { pipeline, env } = await import('https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.1/dist/transformers.min.js');
            env.allowLocalModels = false;
            sharedExtractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
            return sharedExtractor;
        })();

        return sharedModelLoadingPromise;
    };

    // --- Semantic Search (Client-Side RAG) ---
    const initSemanticSearch = () => {
        const searchInput = document.getElementById('semantic-search');
        const resultsContainer = document.getElementById('search-results');
        const loaderContainer = document.getElementById('search-loader-container');
        const statusBadge = document.getElementById('search-status-badge');
        const helpBtn = document.getElementById('search-help-btn');
        const tooltipContainer = document.getElementById('search-tooltip-container');
        
        if (!searchInput || !resultsContainer || !loaderContainer || !statusBadge) return;
        
        let extractor = null;
        let modelLoading = false;
        let embeddingsData = null;
        
        // 1. Fetch static embeddings on load
        const loadEmbeddings = async () => {
            try {
                const rootPath = document.querySelector('script[src*="myscript.js"]').getAttribute('src').replace('js/myscript.js', '');
                const res = await fetch(rootPath + 'embeddings.json');
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                embeddingsData = await res.json();
                console.log("Semantic search embeddings loaded successfully!");
            } catch (e) {
                console.error("Failed to load semantic search embeddings:", e);
                statusBadge.style.display = 'none';
            }
        };
        
        // 2. Lazy-load all-MiniLM-L6-v2 pipeline on focus
        const loadModel = async () => {
            if (extractor || modelLoading) return;
            modelLoading = true;
            
            // UI Feedback: Loading
            loaderContainer.style.display = 'flex';
            statusBadge.classList.add('loading');
            const statusText = statusBadge.querySelector('.status-text');
            if (statusText) statusText.textContent = "Loading AI Model...";
            
            try {
                // Get the shared extractor instance
                extractor = await getSharedExtractor();
                
                // UI Feedback: Ready
                statusBadge.classList.remove('loading');
                statusBadge.classList.add('ready');
                if (statusText) statusText.textContent = "AI Search Active";
                console.log("Transformers.js pipeline initialized successfully in search!");
            } catch (e) {
                console.error("Failed to load edge AI model in search:", e);
                statusBadge.classList.remove('loading');
                if (statusText) statusText.textContent = "AI Offline";
            } finally {
                modelLoading = false;
                loaderContainer.style.display = 'none';
            }
        };
        
        // Cosine Similarity function
        const cosineSimilarity = (vecA, vecB) => {
            let dotProduct = 0;
            let normA = 0;
            let normB = 0;
            for (let i = 0; i < vecA.length; i++) {
                dotProduct += vecA[i] * vecB[i];
                normA += vecA[i] * vecA[i];
                normB += vecB[i] * vecB[i];
            }
            if (normA === 0 || normB === 0) return 0;
            return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
        };
        
        // Render search results in dropdown
        const renderResults = (matches) => {
            resultsContainer.innerHTML = '';
            
            if (matches.length === 0) {
                resultsContainer.innerHTML = '<div class="search-no-results">No relevant matches found.</div>';
                resultsContainer.style.display = 'block';
                return;
            }
            
            matches.forEach(match => {
                const percentage = Math.round(match.similarity * 100);
                
                const card = document.createElement('div');
                card.className = 'search-result-card';
                card.innerHTML = `
                    <div class="search-result-header">
                        <span class="search-result-title">${match.title}</span>
                        <span class="search-result-score">${percentage}% match</span>
                    </div>
                    <p class="search-result-snippet">${match.content.substring(0, 140)}${match.content.length > 140 ? '...' : ''}</p>
                    <span class="search-result-action">Scroll to section &rarr;</span>
                `;
                
                card.addEventListener('click', () => {
                    const targetEl = document.getElementById(match.id);
                    if (targetEl) {
                        // Check if it's in a collapsed work experience card, expand it
                        const collapsible = targetEl.querySelector('.collapsible');
                        if (collapsible && !collapsible.classList.contains('expanded')) {
                            collapsible.classList.add('expanded');
                            const btn = collapsible.querySelector('.expand-btn');
                            if (btn) btn.textContent = 'Show Less';
                        }
                        
                        // Scroll smoothly to target element
                        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        
                        // Pulse animation to highlight target element
                        targetEl.classList.add('highlight-pulse');
                        setTimeout(() => {
                            targetEl.classList.remove('highlight-pulse');
                        }, 2500);
                    }
                    
                    // Reset search field and dropdown
                    searchInput.value = '';
                    resultsContainer.innerHTML = '';
                    resultsContainer.style.display = 'none';
                });
                
                resultsContainer.appendChild(card);
            });
            
            resultsContainer.style.display = 'block';
        };
        
        // Perform semantic search query
        const performSearch = async (queryText) => {
            if (!extractor || !embeddingsData) return;
            
            try {
                const output = await extractor(queryText, {
                    pooling: 'mean',
                    normalize: true
                });
                const queryVector = output.tolist()[0];
                
                // Compute similarity for all segments
                const matches = embeddingsData.map(doc => {
                    const similarity = cosineSimilarity(queryVector, doc.embedding);
                    return {
                        ...doc,
                        similarity
                    };
                });
                
                // Sort by descending similarity and take top 2
                matches.sort((a, b) => b.similarity - a.similarity);
                
                // Filter to reasonable threshold (e.g. similarity > 0.15) to avoid random matches
                const filteredMatches = matches.filter(m => m.similarity > 0.15).slice(0, 2);
                
                renderResults(filteredMatches);
            } catch (e) {
                console.error("Semantic search processing error:", e);
            }
        };
        
        // Debounce helper (delay in ms)
        const debounce = (func, delay) => {
            let timeoutId;
            return (...args) => {
                if (timeoutId) clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    func.apply(null, args);
                }, delay);
            };
        };
        
        // Event Listeners
        searchInput.addEventListener('focus', () => {
            loadModel();
            if (tooltipContainer) {
                tooltipContainer.classList.remove('active');
                if (helpBtn) helpBtn.setAttribute('aria-expanded', 'false');
            }
        });
        
        searchInput.addEventListener('input', debounce((e) => {
            const val = e.target.value.trim();
            if (val.length > 0) {
                // Close tooltip if open when typing
                if (tooltipContainer) {
                    tooltipContainer.classList.remove('active');
                    if (helpBtn) helpBtn.setAttribute('aria-expanded', 'false');
                }
                performSearch(val);
            } else {
                resultsContainer.innerHTML = '';
                resultsContainer.style.display = 'none';
            }
        }, 400));
        
        // Help Tooltip Toggle
        if (helpBtn && tooltipContainer) {
            helpBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const isActive = tooltipContainer.classList.contains('active');
                if (isActive) {
                    tooltipContainer.classList.remove('active');
                    helpBtn.setAttribute('aria-expanded', 'false');
                } else {
                    // Close search results dropdown
                    resultsContainer.innerHTML = '';
                    resultsContainer.style.display = 'none';
                    
                    tooltipContainer.classList.add('active');
                    helpBtn.setAttribute('aria-expanded', 'true');
                }
            });
            
            // Close tooltip on Escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    tooltipContainer.classList.remove('active');
                    helpBtn.setAttribute('aria-expanded', 'false');
                }
            });
        }
        
        // Close dropdown & tooltip when clicking outside
        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !resultsContainer.contains(e.target)) {
                resultsContainer.style.display = 'none';
            }
            if (tooltipContainer && helpBtn && !tooltipContainer.contains(e.target) && !helpBtn.contains(e.target)) {
                tooltipContainer.classList.remove('active');
                helpBtn.setAttribute('aria-expanded', 'false');
            }
        });
        
        // Initialize fetch
        loadEmbeddings();
    };
    
    initSemanticSearch();

    // --- Jargon Decoder (Explain like a Founder) ---
    const initJargonDecoder = () => {
        const toggleInputs = document.querySelectorAll('.jargon-toggle-input');
        const jargonTerms = document.querySelectorAll('.jargon-term');
        const tooltip = document.getElementById('jargon-tooltip');
        
        if (toggleInputs.length === 0 || jargonTerms.length === 0 || !tooltip) return;
        
        const arrow = tooltip.querySelector('.tooltip-arrow');
        const titleEl = tooltip.querySelector('.tooltip-title');
        const translationEl = tooltip.querySelector('.tooltip-translation');
        
        let dictionaryData = null;
        let isJargonModeActive = false;
        
        // 1. Fetch static jargon dictionary
        const loadDictionary = async () => {
            try {
                const rootPath = document.querySelector('script[src*="myscript.js"]').getAttribute('src').replace('js/myscript.js', '');
                const res = await fetch(rootPath + 'jargon-dictionary.json');
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                dictionaryData = await res.json();
                console.log("Jargon dictionary loaded successfully!");
            } catch (e) {
                console.error("Failed to load jargon dictionary:", e);
            }
        };
        
        // 2. Synchronize toggle checkboxes and handle active state changes
        const setJargonMode = (active) => {
            isJargonModeActive = active;
            
            // Sync all inputs
            toggleInputs.forEach(input => {
                input.checked = active;
            });
            
            localStorage.setItem('jargonMode', active);
            
            if (active) {
                document.body.classList.add('jargon-mode-active');
                // Preload model in background when turned on
                getSharedExtractor().catch(err => console.error("Error preloading model for jargon decoder:", err));
            } else {
                document.body.classList.remove('jargon-mode-active');
                hideTooltip();
            }
        };
        
        toggleInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                setJargonMode(e.target.checked);
            });
        });
        
        // Cosine similarity helper
        const cosineSimilarity = (vecA, vecB) => {
            let dotProduct = 0;
            let normA = 0;
            let normB = 0;
            for (let i = 0; i < vecA.length; i++) {
                dotProduct += vecA[i] * vecB[i];
                normA += vecA[i] * vecA[i];
                normB += vecB[i] * vecB[i];
            }
            if (normA === 0 || normB === 0) return 0;
            return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
        };
        
        // Tooltip hide / show functions
        const showTooltip = (termEl, initialContentHtml) => {
            tooltip.className = 'active'; // Reset hidden classes
            titleEl.textContent = "";
            translationEl.innerHTML = initialContentHtml;
            
            positionTooltip(termEl);
        };
        
        const updateTooltip = (termText, translation) => {
            titleEl.textContent = termText;
            translationEl.textContent = translation;
            
            // Re-position because text height may have changed
            const activeTerm = document.querySelector('.jargon-term.active-target');
            if (activeTerm) {
                positionTooltip(activeTerm);
            }
        };
        
        const hideTooltip = () => {
            tooltip.classList.remove('active');
            tooltip.classList.add('tooltip-hidden');
            jargonTerms.forEach(t => t.classList.remove('active-target'));
        };
        
        const positionTooltip = (termEl) => {
            const rect = termEl.getBoundingClientRect();
            const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            const tooltipWidth = tooltip.offsetWidth;
            const tooltipHeight = tooltip.offsetHeight;
            
            // Default position: above the term
            let top = rect.top + scrollTop - tooltipHeight - 12;
            let left = rect.left + scrollLeft + (rect.width - tooltipWidth) / 2;
            
            // Responsive mobile boundaries check
            const margin = 16;
            if (left < margin) {
                left = margin;
            } else if (left + tooltipWidth > window.innerWidth - margin) {
                left = window.innerWidth - tooltipWidth - margin;
            }
            
            // Overflow top boundary check (if it overflows top of screen, display below the term)
            const arrowOffset = 6.5;
            if (rect.top - tooltipHeight - 12 < 0) {
                top = rect.bottom + scrollTop + 12;
                
                // Position arrow pointing up
                arrow.style.top = `-${arrowOffset}px`;
                arrow.style.bottom = 'auto';
                arrow.style.borderBottom = 'none';
                arrow.style.borderRight = 'none';
                arrow.style.borderTop = '1.5px solid var(--pastel-orange-text)';
                arrow.style.borderLeft = '1.5px solid var(--pastel-orange-text)';
            } else {
                // Position arrow pointing down
                arrow.style.bottom = `-${arrowOffset}px`;
                arrow.style.top = 'auto';
                arrow.style.borderTop = 'none';
                arrow.style.borderLeft = 'none';
                arrow.style.borderBottom = '1.5px solid var(--pastel-orange-text)';
                arrow.style.borderRight = '1.5px solid var(--pastel-orange-text)';
            }
            
            // Align the arrow with the horizontal center of the target term
            const arrowLeft = rect.left + scrollLeft + rect.width / 2 - left - arrowOffset;
            arrow.style.left = `${arrowLeft}px`;
            
            tooltip.style.top = `${top}px`;
            tooltip.style.left = `${left}px`;
        };
        
        // Handle term tap / click events
        jargonTerms.forEach(termEl => {
            const handleInteraction = async (e) => {
                if (!isJargonModeActive) return;
                e.preventDefault();
                e.stopPropagation();
                
                // Clear previous active states
                jargonTerms.forEach(t => t.classList.remove('active-target'));
                termEl.classList.add('active-target');
                
                const text = termEl.innerText.trim();
                
                // Show loading state in tooltip
                const loadingHtml = `
                    <div class="tooltip-loading">
                        <svg class="spinner" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="3" fill="none">
                            <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
                            <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path>
                        </svg>
                        <span>Translating term at the edge...</span>
                    </div>
                `;
                showTooltip(termEl, loadingHtml);
                
                try {
                    // 1. Get the shared model pipeline extractor
                    const extractor = await getSharedExtractor();
                    
                    // 2. Extract embedding for the clicked term text
                    const output = await extractor(text, {
                        pooling: 'mean',
                        normalize: true
                    });
                    const termVector = output.tolist()[0];
                    
                    // 3. Find closest dictionary match using cosine similarity
                    if (!dictionaryData || dictionaryData.length === 0) {
                        updateTooltip(text, "Failed to load jargon translation dictionary.");
                        return;
                    }
                    
                    let bestMatch = null;
                    let bestScore = -1;
                    
                    for (const dictItem of dictionaryData) {
                        const score = cosineSimilarity(termVector, dictItem.embedding);
                        if (score > bestScore) {
                            bestScore = score;
                            bestMatch = dictItem;
                        }
                    }
                    
                    // Display result if a good match exists (similarity threshold > 0.6)
                    if (bestMatch && bestScore > 0.6) {
                        updateTooltip(bestMatch.technical_term, bestMatch.translation);
                    } else {
                        updateTooltip(text, `No simple translation found for this term (Confidence: ${Math.round(bestScore * 100)}%).`);
                    }
                    
                } catch (err) {
                    console.error("Jargon decoding error:", err);
                    updateTooltip(text, "Error running translation model at the edge. Please try again.");
                }
            };
            
            termEl.addEventListener('click', handleInteraction);
            termEl.addEventListener('touchend', handleInteraction);
        });
        
        // 3. Dismiss tooltip triggers
        document.addEventListener('click', (e) => {
            if (!tooltip.contains(e.target) && !e.target.classList.contains('jargon-term')) {
                hideTooltip();
            }
        });
        
        document.addEventListener('scroll', () => {
            if (tooltip.classList.contains('active')) {
                hideTooltip();
            }
        }, { passive: true });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && tooltip.classList.contains('active')) {
                hideTooltip();
            }
        });
        
        // Load the dictionary dataset
        loadDictionary();
        
        // Restore persistent state
        const savedJargonMode = localStorage.getItem('jargonMode') === 'true';
        if (savedJargonMode) {
            setJargonMode(true);
        }
    };

    initJargonDecoder();

    // --- Contact Form Edge AI Classification ---
    const initContactClassification = () => {
        const contactMessage = document.getElementById('contact-message');
        const intentBadge = document.getElementById('intent-badge');
        
        if (!contactMessage || !intentBadge) return;

        let classifier = null;
        let modelLoading = false;
        let debounceTimeout = null;

        // Lazy-load zero-shot-classification pipeline on first focus
        const loadClassifier = async () => {
            if (classifier || modelLoading) return;
            modelLoading = true;

            // Update badge UI to show initialization loading
            intentBadge.classList.remove('badge-hidden', 'badge-high-value', 'badge-generic');
            intentBadge.classList.add('badge-loading');
            intentBadge.textContent = "Loading edge classification model...";

            try {
                // Dynamic import pipeline and env from CDN
                const { pipeline, env } = await import('https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.1');
                env.allowLocalModels = false;

                classifier = await pipeline('zero-shot-classification', 'Xenova/mobilebert-uncased-mnli');
                console.log("Edge classification pipeline loaded successfully!");

                // Once loaded, immediately trigger classification check on existing text
                runClassification();
            } catch (e) {
                console.error("Failed to load edge classification model:", e);
                // On error, hide the badge so it doesn't block the UI
                intentBadge.classList.remove('badge-loading');
                intentBadge.classList.add('badge-hidden');
            } finally {
                modelLoading = false;
            }
        };

        const runClassification = async () => {
            const text = contactMessage.value.trim();

            // If length is 20 or less, hide the badge
            if (text.length <= 20) {
                intentBadge.classList.remove('badge-loading', 'badge-high-value', 'badge-generic');
                intentBadge.classList.add('badge-hidden');
                contactIntent = 'not_classified';
                return;
            }

            // If classifier is not loaded yet, don't run classification (it will run once loaded)
            if (!classifier) return;

            // Update badge UI to processing state
            intentBadge.classList.remove('badge-hidden', 'badge-high-value', 'badge-generic');
            intentBadge.classList.add('badge-loading');
            intentBadge.textContent = "Edge Intent: Analyzing...";

            try {
                const result = await classifier(text, ['engineering consulting', 'recruiter outreach', 'generic spam']);
                const topLabel = result.labels[0];

                intentBadge.classList.remove('badge-loading');
                
                if (topLabel === 'engineering consulting') {
                    intentBadge.classList.add('badge-high-value');
                    intentBadge.textContent = "[ Edge Intent: High-Value Engineering Query ]";
                    contactIntent = 'engineering consulting';
                } else if (topLabel === 'recruiter outreach') {
                    intentBadge.classList.add('badge-generic');
                    intentBadge.textContent = "[ Edge Intent: Standard Outreach Detected ]";
                    contactIntent = 'recruiter outreach';
                } else {
                    intentBadge.classList.add('badge-generic');
                    intentBadge.textContent = "[ Edge Intent: Spam / Irrelevant Content Detected ]";
                    contactIntent = 'generic spam';
                }
            } catch (e) {
                console.error("Edge classification processing error:", e);
                intentBadge.classList.remove('badge-loading');
                intentBadge.classList.add('badge-hidden');
            }
        };

        const formName = document.getElementById('form-name');
        const formEmail = document.getElementById('form-email');

        // Attach event listeners to start model loading on any input focus
        [formName, formEmail, contactMessage].forEach(input => {
            if (input) {
                input.addEventListener('focus', () => {
                    loadClassifier();
                });
            }
        });

        contactMessage.addEventListener('input', () => {
            // Debounce classification to prevent UI thread lockups
            if (debounceTimeout) clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(() => {
                runClassification();
            }, 800);
        });
    };

    initContactClassification();

});
