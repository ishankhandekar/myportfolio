/* =========================================================
   Ishan Khandekar — Portfolio interactions
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

    /* ---- Current year in footer ---- */
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    /* ---- Dark mode toggle (persisted) ---- */
    const themeToggle = document.getElementById('themeToggle');
    const rootEl = document.documentElement;
    if (localStorage.getItem('theme') === 'dark') rootEl.setAttribute('data-theme', 'dark');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const isDark = rootEl.getAttribute('data-theme') === 'dark';
            if (isDark) {
                rootEl.removeAttribute('data-theme');
                localStorage.setItem('theme', 'light');
            } else {
                rootEl.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
            }
        });
    }

    /* ---- Scroll-reactive marquee (faster scroll = faster drift) ---- */
    const mqTrack = document.querySelector('.marquee-track');
    if (mqTrack && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        let offset = 0;
        let boost = 0;
        let lastY = window.scrollY;
        window.addEventListener('scroll', () => {
            boost += Math.abs(window.scrollY - lastY);
            lastY = window.scrollY;
        }, { passive: true });

        const drift = () => {
            const half = mqTrack.scrollWidth / 2 || 1;
            offset += Math.min(0.25 + boost * 0.04, 3);
            boost *= 0.9;
            if (offset >= half) offset -= half;
            mqTrack.style.transform = 'translateX(' + (-offset) + 'px)';
            requestAnimationFrame(drift);
        };
        requestAnimationFrame(drift);
    }

    /* ---- Kinetic word-swap + hand-drawn underline ---- */
    const swap = document.getElementById('swap');
    const underlinePath = document.getElementById('underlinePath');
    if (swap && underlinePath) {
        const words = ['yours', 'alive', 'human', 'one-of-one', 'hand-built'];
        const len = underlinePath.getTotalLength();
        underlinePath.style.strokeDasharray = len;
        underlinePath.style.strokeDashoffset = 0;
        let i = 0;

        const drawUnderline = () => {
            underlinePath.style.transition = 'none';
            underlinePath.style.strokeDashoffset = len;
            underlinePath.getBoundingClientRect();
            underlinePath.style.transition = 'stroke-dashoffset 0.55s ease';
            underlinePath.style.strokeDashoffset = 0;
        };

        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (!reduceMotion) {
            setInterval(() => {
                swap.classList.add('out');
                setTimeout(() => {
                    i = (i + 1) % words.length;
                    swap.textContent = words[i];
                    swap.classList.remove('out');
                    drawUnderline();
                }, 280);
            }, 2400);
        }
    }

    /* ---- Work lightbox (click a project to expand full-screen) ---- */
    const lightbox = document.getElementById('lightbox');
    const iitCard = document.getElementById('iitCard');
    const iitShot = document.getElementById('iitShot');
    const lbImg = document.getElementById('lbImg');
    const lbScroll = document.getElementById('lbScroll');
    if (lightbox && iitCard && iitShot && lbImg) {
        const openLightbox = () => {
            if (!lbImg.src || !lbImg.src.endsWith(iitShot.getAttribute('src'))) {
                lbImg.src = iitShot.getAttribute('src');
            }
            if (lbScroll) lbScroll.scrollTop = 0;
            lightbox.classList.add('open');
            lightbox.setAttribute('aria-hidden', 'false');
            document.body.classList.add('locked');
        };
        const closeLightbox = () => {
            lightbox.classList.remove('open');
            lightbox.setAttribute('aria-hidden', 'true');
            document.body.classList.remove('locked');
        };

        iitCard.addEventListener('click', openLightbox);
        iitCard.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(); }
        });
        document.getElementById('lbClose').addEventListener('click', closeLightbox);
        document.getElementById('lbBackdrop').addEventListener('click', closeLightbox);
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox();
        });
    }

    /* ---- Dismissible announcement ribbon ---- */
    const announce = document.getElementById('announce');
    const announceClose = document.getElementById('announceClose');
    if (announceClose && announce) {
        announceClose.addEventListener('click', () => {
            announce.classList.add('hide');
            document.body.classList.add('announce-hidden');
        });
    }

    /* ---- Navbar background on scroll ---- */
    const navbar = document.getElementById('navbar');
    const onScroll = () => {
        navbar.classList.toggle('scrolled', window.scrollY > 40);
    };
    window.addEventListener('scroll', onScroll);
    onScroll();

    /* ---- Mobile menu toggle ---- */
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');
    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('open');
        navLinks.classList.toggle('open');
    });
    // Close menu when a link is clicked
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            menuToggle.classList.remove('open');
            navLinks.classList.remove('open');
        });
    });

    /* ---- Reveal-on-scroll ---- */
    const revealEls = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Stagger children slightly for a nicer effect
                    entry.target.style.transitionDelay =
                        (entry.target.dataset.delay || '0') + 'ms';
                    entry.target.classList.add('visible');
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

        revealEls.forEach((el, i) => {
            // Give grouped items a light stagger
            const siblings = el.parentElement.querySelectorAll(':scope > .reveal');
            if (siblings.length > 1) {
                el.dataset.delay = ([...siblings].indexOf(el) * 90).toString();
            }
            observer.observe(el);
        });
    } else {
        revealEls.forEach(el => el.classList.add('visible'));
    }

    /* ---- Animated stat counters ---- */
    const statNums = document.querySelectorAll('.stat-num');
    const runCounter = (el) => {
        const target = parseInt(el.dataset.target, 10);
        const duration = 1400;
        const start = performance.now();
        const step = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            // ease-out
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.round(target * eased);
            if (progress < 1) requestAnimationFrame(step);
            else el.textContent = target;
        };
        requestAnimationFrame(step);
    };

    if ('IntersectionObserver' in window && statNums.length) {
        const statObserver = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    runCounter(entry.target);
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.6 });
        statNums.forEach(el => statObserver.observe(el));
    }

    /* ---- Contact form validation ---- */
    const form = document.getElementById('contactForm');
    const success = document.getElementById('formSuccess');

    const setError = (input, message) => {
        const field = input.closest('.field');
        const errorEl = form.querySelector(`.error-msg[data-for="${input.id}"]`);
        field.classList.add('invalid');
        if (errorEl) errorEl.textContent = message;
    };

    const clearError = (input) => {
        const field = input.closest('.field');
        const errorEl = form.querySelector(`.error-msg[data-for="${input.id}"]`);
        field.classList.remove('invalid');
        if (errorEl) errorEl.textContent = '';
    };

    const isEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            let valid = true;

            const name = form.name;
            const email = form.email;
            const message = form.message;

            if (!name.value.trim()) { setError(name, 'Please enter your name.'); valid = false; }
            else clearError(name);

            if (!email.value.trim()) { setError(email, 'Please enter your email.'); valid = false; }
            else if (!isEmail(email.value.trim())) { setError(email, 'That email looks off — double-check it.'); valid = false; }
            else clearError(email);

            if (!message.value.trim()) { setError(message, 'Tell me a bit about your project.'); valid = false; }
            else clearError(message);

            if (valid) {
                // ┌─────────────────────────────────────────────────────────────┐
                // │ 1. Go to https://web3forms.com  → enter your email           │
                // │ 2. Copy the access key it emails you                         │
                // │ 3. Paste it below, replacing YOUR_ACCESS_KEY_HERE            │
                // └─────────────────────────────────────────────────────────────┘
                const ACCESS_KEY = 'cba6a041-2658-4244-8684-b9f7ec0927ad';

                const nameVal = name.value.trim();
                const submitBtn = form.querySelector('button[type="submit"]');
                const originalLabel = submitBtn.textContent;
                submitBtn.textContent = 'Sending…';
                submitBtn.disabled = true;

                fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify({
                        access_key: ACCESS_KEY,
                        subject: `New project inquiry from ${nameVal} — ${form.project.value}`,
                        from_name: nameVal,
                        name: nameVal,
                        email: email.value.trim(),
                        project: form.project.value,
                        message: message.value.trim()
                    })
                })
                    .then((r) => r.json())
                    .then((data) => {
                        if (data.success) {
                            success.textContent = "✓ Thanks! Your message landed in my inbox — I'll be in touch soon.";
                            form.reset();
                        } else {
                            success.textContent = '⚠ Hmm, that didn\'t go through. Email me directly at ishankhandekar614@gmail.com';
                        }
                        success.classList.add('show');
                    })
                    .catch(() => {
                        success.textContent = '⚠ Hmm, that didn\'t go through. Email me directly at ishankhandekar614@gmail.com';
                        success.classList.add('show');
                    })
                    .finally(() => {
                        submitBtn.textContent = originalLabel;
                        submitBtn.disabled = false;
                        setTimeout(() => success.classList.remove('show'), 9000);
                    });
            }
        });

        // Live-clear errors as the user types
        ['name', 'email', 'message'].forEach(id => {
            const input = form[id];
            if (input) input.addEventListener('input', () => clearError(input));
        });
    }
});
