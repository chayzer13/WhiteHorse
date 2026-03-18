document.addEventListener('DOMContentLoaded', () => {

    // ===== HEADER SCROLL =====
    const header = document.getElementById('header');
    window.addEventListener('scroll', () => {
        header.classList.toggle('header--scrolled', window.scrollY > 20);
    });

    // ===== BURGER MENU =====
    const burger = document.getElementById('burger');
    const nav = document.getElementById('nav');

    burger.addEventListener('click', () => {
        burger.classList.toggle('active');
        nav.classList.toggle('active');
    });

    // Close menu on link click
    nav.querySelectorAll('.nav__link').forEach(link => {
        link.addEventListener('click', () => {
            burger.classList.remove('active');
            nav.classList.remove('active');
        });
    });

    // ===== CALCULATOR =====
    const productRadios = document.querySelectorAll('input[name="productType"]');
    const pavingTypeBlock = document.getElementById('calcPavingType');
    const borderTypeBlock = document.getElementById('calcBorderType');
    const areaLabel = document.getElementById('calcAreaLabel');
    const calcBtn = document.getElementById('calcBtn');
    const calcValue = document.getElementById('calcValue');
    const pavingSelect = document.getElementById('pavingSelect');
    const borderSelect = document.getElementById('borderSelect');
    const areaInput = document.getElementById('calcAreaInput');

    productRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            const isPaving = radio.value === 'paving';
            pavingTypeBlock.classList.toggle('hidden', !isPaving);
            borderTypeBlock.classList.toggle('hidden', isPaving);
            areaLabel.textContent = isPaving ? 'Площадь (м²)' : 'Количество (шт)';
            areaInput.placeholder = isPaving ? 'Введите площадь' : 'Введите количество';
            areaInput.value = isPaving ? '50' : '30';
        });
    });

    calcBtn.addEventListener('click', () => {
        const type = document.querySelector('input[name="productType"]:checked').value;
        const area = parseFloat(areaInput.value);

        if (!area || area <= 0) {
            calcValue.textContent = 'Укажите значение';
            return;
        }

        let price;
        if (type === 'paving') {
            price = parseInt(pavingSelect.value) * area;
        } else {
            price = parseInt(borderSelect.value) * area;
        }

        calcValue.textContent = price.toLocaleString('ru-RU') + ' ₽';
        calcValue.style.animation = 'none';
        calcValue.offsetHeight; // reflow
        calcValue.style.animation = 'fadeIn 0.4s ease';
    });

    // ===== CATALOG TABS =====
    const tabs = document.querySelectorAll('.catalog__tab');
    const tabContents = document.querySelectorAll('.catalog__content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById('tab-' + tab.dataset.tab).classList.add('active');
        });
    });

    // ===== REVIEWS SLIDER =====
    const track = document.getElementById('reviewsTrack');
    const prevBtn = document.getElementById('reviewPrev');
    const nextBtn = document.getElementById('reviewNext');
    let reviewIndex = 0;

    function getCardsPerView() {
        if (window.innerWidth <= 768) return 1;
        if (window.innerWidth <= 1024) return 2;
        return 3;
    }

    function updateSlider() {
        const cards = track.querySelectorAll('.review-card');
        const perView = getCardsPerView();
        const maxIndex = Math.max(0, cards.length - perView);
        reviewIndex = Math.min(reviewIndex, maxIndex);

        const card = cards[0];
        if (!card) return;
        const cardWidth = card.offsetWidth + 24; // gap
        track.style.transform = `translateX(-${reviewIndex * cardWidth}px)`;
    }

    prevBtn.addEventListener('click', () => {
        if (reviewIndex > 0) {
            reviewIndex--;
            updateSlider();
        }
    });

    nextBtn.addEventListener('click', () => {
        const cards = track.querySelectorAll('.review-card');
        const perView = getCardsPerView();
        if (reviewIndex < cards.length - perView) {
            reviewIndex++;
            updateSlider();
        }
    });

    window.addEventListener('resize', updateSlider);

    // ===== REVIEW FORM =====
    const starsInput = document.getElementById('starsInput');
    const starBtns = starsInput.querySelectorAll('.star-btn');
    let selectedRating = 0;

    starBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            selectedRating = parseInt(btn.dataset.value);
            starBtns.forEach(s => {
                s.classList.toggle('active', parseInt(s.dataset.value) <= selectedRating);
            });
        });

        btn.addEventListener('mouseenter', () => {
            const hoverVal = parseInt(btn.dataset.value);
            starBtns.forEach(s => {
                s.classList.toggle('active', parseInt(s.dataset.value) <= hoverVal);
            });
        });
    });

    starsInput.addEventListener('mouseleave', () => {
        starBtns.forEach(s => {
            s.classList.toggle('active', parseInt(s.dataset.value) <= selectedRating);
        });
    });

    const submitReview = document.getElementById('submitReview');
    const reviewName = document.getElementById('reviewName');
    const reviewText = document.getElementById('reviewText');
    const reviewSuccess = document.getElementById('reviewSuccess');
    const reviewFormFields = document.querySelector('.review-form__fields');

    submitReview.addEventListener('click', () => {
        const name = reviewName.value.trim();
        const text = reviewText.value.trim();

        if (!name || !text || selectedRating === 0) {
            alert('Пожалуйста, заполните все поля и поставьте оценку.');
            return;
        }

        // Save review to localStorage for moderation
        const pendingReviews = JSON.parse(localStorage.getItem('whs_pending_reviews') || '[]');
        pendingReviews.push({
            id: Date.now(),
            name: name,
            text: text,
            rating: selectedRating,
            date: new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }),
            approved: false
        });
        localStorage.setItem('whs_pending_reviews', JSON.stringify(pendingReviews));

        reviewFormFields.classList.add('hidden');
        reviewSuccess.classList.remove('hidden');

        // Reset after delay
        setTimeout(() => {
            reviewFormFields.classList.remove('hidden');
            reviewSuccess.classList.add('hidden');
            reviewName.value = '';
            reviewText.value = '';
            selectedRating = 0;
            starBtns.forEach(s => s.classList.remove('active'));
        }, 3000);
    });

    // Load approved reviews from localStorage
    function loadApprovedReviews() {
        const approved = JSON.parse(localStorage.getItem('whs_approved_reviews') || '[]');
        approved.forEach(review => {
            const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
            const initials = review.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
            const card = document.createElement('div');
            card.className = 'review-card';
            card.innerHTML = `
                <div class="review-card__stars">${stars}</div>
                <p class="review-card__text">${escapeHtml(review.text)}</p>
                <div class="review-card__author">
                    <div class="review-card__avatar">${escapeHtml(initials)}</div>
                    <div>
                        <p class="review-card__name">${escapeHtml(review.name)}</p>
                        <p class="review-card__date">${escapeHtml(review.date)}</p>
                    </div>
                </div>
            `;
            track.appendChild(card);
        });
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    loadApprovedReviews();

    // ===== FAQ =====
    const faqItems = document.querySelectorAll('.faq__item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq__question');
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            faqItems.forEach(i => i.classList.remove('active'));
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });

    // ===== SMOOTH SCROLL for anchor links =====
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const target = document.querySelector(link.getAttribute('href'));
            if (target) {
                e.preventDefault();
                const offset = 80;
                const top = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

    // ===== SCROLL ANIMATIONS =====
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.product-card, .catalog-card, .service-card, .review-card, .faq__item, .contacts__item').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});
