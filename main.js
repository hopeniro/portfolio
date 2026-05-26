import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let isMobile = window.innerWidth <= 768;

function initSquishEffect() {
    document.querySelectorAll('.squish-title').forEach(title => {
        if (!title.innerText.trim() || title.querySelectorAll('.squish-letter').length > 0) return;
        const originalText = title.innerText;
        title.innerHTML = originalText.split('').map(char => 
            `<span class="squish-letter">${char === ' ' ? '&nbsp;' : char}</span>`
        ).join('');
    });
}

function initHeroInteractions() {
    const nameContainer = document.querySelector('.name-container');
    if(!nameContainer) return;
    const text = nameContainer.innerText;
    const chars = text.split('');
    
    nameContainer.innerHTML = chars.map((c, i) => `<span style="transition-delay: ${i * 0.05}s">${c === ' ' ? '&nbsp;' : c}</span>`).join('');
    
    const glassOverlay = document.createElement('div');
    glassOverlay.className = 'glass-overlay';
    glassOverlay.innerHTML = nameContainer.innerHTML;
    nameContainer.appendChild(glassOverlay);

    setTimeout(() => document.querySelectorAll('.name-container span').forEach(s => s.classList.add('revealed')), 100);

    const updateMousePos = (e) => {
        if (window.innerWidth > 768) {
            const rect = nameContainer.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            nameContainer.style.setProperty('--x', `${x}px`);
            nameContainer.style.setProperty('--y', `${y}px`);
        }
    };

    nameContainer.addEventListener('mousemove', updateMousePos);
    nameContainer.addEventListener('mouseleave', () => {
        nameContainer.style.setProperty('--x', `-100%`);
        nameContainer.style.setProperty('--y', `-100%`);
    });

    initSquishEffect();
}
initHeroInteractions();

// Floating images drag
const draggables = document.querySelectorAll('.float-img');
let activeElement = null, offset = { x: 0, y: 0 };

function onStart(e) {
    activeElement = e.target.closest('.float-img');
    if (!activeElement) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    offset.x = clientX - activeElement.offsetLeft;
    offset.y = clientY - activeElement.offsetTop;
    activeElement.style.zIndex = "100";
    activeElement.style.animation = "none";
}

function onMove(e) {
    if (!activeElement) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    activeElement.style.left = (clientX - offset.x) + 'px';
    activeElement.style.top = (clientY - offset.y) + 'px';
}

function onEnd() { 
    if(activeElement) activeElement.style.zIndex = "15"; 
    activeElement = null; 
}

draggables.forEach(img => {
    img.addEventListener('mousedown', onStart);
    img.addEventListener('touchstart', onStart, {passive: true});
});
document.addEventListener('mousemove', onMove);
document.addEventListener('touchmove', onMove, {passive: false});
document.addEventListener('mouseup', onEnd);
document.addEventListener('touchend', onEnd);

// --- WORKS CAROUSEL LOGIC ---
const track = document.getElementById('carousel-track');
const nextBtn = document.getElementById('nextBtn');
const prevBtn = document.getElementById('prevBtn');
let currentIndex = 0;
const carouselImages = Array.from(document.querySelectorAll('.carousel-item img'));
const totalItems = carouselImages.length;
let visibleItems = window.innerWidth <= 768 ? 1 : 2;

function updateCarousel() {
    const slideWidth = 100 / visibleItems;
    track.style.transform = `translateX(-${currentIndex * slideWidth}%)`;
}

nextBtn.addEventListener('click', () => {
    currentIndex = (currentIndex + visibleItems >= totalItems) ? 0 : currentIndex + visibleItems;
    updateCarousel();
});

prevBtn.addEventListener('click', () => {
    currentIndex = (currentIndex - visibleItems < 0) ? totalItems - visibleItems : currentIndex - visibleItems;
    updateCarousel();
});

let autoSlideInterval = setInterval(() => {
    currentIndex = (currentIndex + visibleItems >= totalItems) ? 0 : currentIndex + visibleItems;
    updateCarousel();
}, 5000);

[nextBtn, prevBtn].forEach(btn => {
    btn.addEventListener('mouseenter', () => clearInterval(autoSlideInterval));
    btn.addEventListener('mouseleave', () => {
        clearInterval(autoSlideInterval);
        autoSlideInterval = setInterval(() => {
            currentIndex = (currentIndex + visibleItems >= totalItems) ? 0 : currentIndex + visibleItems;
            updateCarousel();
        }, 5000);
    });
});

// --- MODAL & GALLERY LOGIC ---
const seeMoreBtn = document.getElementById('seeMoreBtn');
const galleryModal = document.getElementById('galleryModal');
const closeModal = document.querySelector('.close-modal');
const modalGrid = document.getElementById('modal-gallery-grid');

const detailModal = document.getElementById('detailModal');
const detailImg = document.getElementById('detailImage');
const closeDetail = document.querySelector('.close-detail');
const detailPrev = document.getElementById('detailPrev');
const detailNext = document.getElementById('detailNext');

let currentDetailIndex = 0;

seeMoreBtn.addEventListener('click', () => {
    galleryModal.style.display = "block";
    document.body.style.overflow = "hidden";
    
    if(modalGrid.children.length === 0) {
        carouselImages.forEach((img, idx) => {
            const clone = img.cloneNode();
            clone.addEventListener('click', () => {
                currentDetailIndex = idx;
                openDetail(carouselImages[idx].src);
            });
            modalGrid.appendChild(clone);
        });
    }
});

function openDetail(src) {
    detailModal.style.display = "flex";
    detailImg.src = src;
}

detailNext.addEventListener('click', (e) => {
    e.stopPropagation();
    currentDetailIndex = (currentDetailIndex + 1) % totalItems;
    detailImg.src = carouselImages[currentDetailIndex].src;
});

detailPrev.addEventListener('click', (e) => {
    e.stopPropagation();
    currentDetailIndex = (currentDetailIndex - 1 + totalItems) % totalItems;
    detailImg.src = carouselImages[currentDetailIndex].src;
});

carouselImages.forEach((img, idx) => {
    img.addEventListener('click', () => {
        currentDetailIndex = idx;
        openDetail(img.src);
    });
});

closeModal.addEventListener('click', () => {
    galleryModal.style.display = "none";
    document.body.style.overflow = "auto";
});

closeDetail.addEventListener('click', () => {
    detailModal.style.display = "none";
});

window.onclick = (e) => {
    if (e.target == galleryModal) {
        galleryModal.style.display = "none";
        document.body.style.overflow = "auto";
    }
    if (e.target == detailModal) detailModal.style.display = "none";
};

// --- HEART GLITTER ---
function initHeartGlitter() {
    const container = document.getElementById('heart-glitter-container');
    if (!container) return;
    const hScene = new THREE.Scene();
    const hCamera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    const hRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    hRenderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(hRenderer.domElement);
    const positions = new Float32Array(2000 * 3);
    for (let i = 0; i < 2000; i++) {
        const t = Math.random() * Math.PI * 2;
        let x = 16 * Math.pow(Math.sin(t), 3);
        let y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
        positions[i * 3] = x * 0.3 * (1 + (Math.random() - 0.5) * 0.1);
        positions[i * 3 + 1] = y * 0.3 * (1 + (Math.random() - 0.5) * 0.1);
        positions[i * 3 + 2] = (Math.random() - 0.5) * 2;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const pts = new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.12, color: 0xffb6c1, transparent: true, opacity: 0.8 }));
    hScene.add(pts);
    hCamera.position.z = 15;
    function hAnim() { requestAnimationFrame(hAnim); pts.rotation.y += 0.005; hRenderer.render(hScene, hCamera); }
    hAnim();
}

// Form Handler
const contactForm = document.getElementById('myContactForm');
if(contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = new FormData(contactForm);
        const thankYou = document.getElementById('thank-you-msg');
        const submitBtn = contactForm.querySelector('.submit-btn');
        submitBtn.textContent = "SENDING...";
        submitBtn.disabled = true;
        try {
            const response = await fetch(contactForm.action, { method: 'POST', body: data, headers: { 'Accept': 'application/json' } });
            if (response.ok) { thankYou.style.display = 'block'; contactForm.reset(); }
        } catch (error) { alert("Error connecting to server."); } 
        finally {
            submitBtn.textContent = "SEND MESSAGE";
            submitBtn.disabled = false;
            setTimeout(() => { thankYou.style.display = 'none'; }, 5000);
        }
    });
}

window.onload = () => { 
    initHeartGlitter(); 
};

// Updated Scroll Listener with Skill Reveal
window.addEventListener('scroll', () => {
    // Standard section reveal
    document.querySelectorAll('.reveal').forEach(el => {
        if (el.getBoundingClientRect().top < window.innerHeight * 0.85) el.classList.add('active');
    });

    // Sequential Skill Reveal Logic
    const skillSection = document.getElementById('skills');
    const skillItems = document.querySelectorAll('.reveal-skill');
    if (skillSection && skillSection.getBoundingClientRect().top < window.innerHeight * 0.85) {
        skillItems.forEach((item, index) => {
            setTimeout(() => {
                item.classList.add('active');
            }, index * 200);
        });
    }
});

window.addEventListener('resize', () => {
    isMobile = window.innerWidth <= 768;
    visibleItems = isMobile ? 1 : 2;
    updateCarousel();
});
