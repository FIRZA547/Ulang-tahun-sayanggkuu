/* =========================================================
   PENGATURAN YANG BISA DIGANTI DENGAN MUDAH
========================================================= */
const CONFIG = {
  // Ganti tanggal ulang tahun (format: 'YYYY-MM-DDTHH:mm:ss')
  birthdayDate: '2026-08-13T00:00:00',
  // Warna untuk confetti & partikel hati
  confettiColors: ['#D4AF6A', '#F8D3DE', '#E4D6F5', '#C97B94', '#FFFCF9'],
  balloonColors: ['#F8D3DE', '#E4D6F5', '#C97B94', '#D4AF6A', '#FCE4EC'],
};

/* =========================================================
   1. WELCOME SCREEN -> BUKA KEJUTAN
========================================================= */
const welcomeScreen = document.getElementById('welcome-screen');
const openBtn = document.getElementById('open-surprise-btn');
const mainContent = document.getElementById('main-content');
const envelope = document.querySelector('.envelope-flap');
const bgMusic = document.getElementById('bg-music');

let surpriseOpened = false;

openBtn.addEventListener('click', () => {
  if (surpriseOpened) return;
  surpriseOpened = true;

  // Animasi amplop terbuka
  if (envelope) {
    envelope.style.transition = 'transform .6s ease';
    envelope.style.transform = 'rotateX(180deg)';
  }

  // Confetti besar saat dibuka
  burstConfetti(180);

  // Coba putar musik otomatis
  attemptAutoplayMusic();

  setTimeout(() => {
    welcomeScreen.classList.add('fade-out');
    mainContent.classList.remove('hidden');
    requestAnimationFrame(() => {
      mainContent.classList.add('revealed');
    });
    spawnBalloons(9);
    startAmbientHearts();
  }, 700);

  setTimeout(() => {
    welcomeScreen.remove();
  }, 2000);
});

/* =========================================================
   2. CONFETTI (canvas particle system)
========================================================= */
const canvas = document.getElementById('confetti-canvas');
const ctx = canvas.getContext('2d');
let confettiParticles = [];

function resizeCanvas(){
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

function burstConfetti(count){
  const { confettiColors } = CONFIG;
  for (let i = 0; i < count; i++){
    confettiParticles.push({
      x: canvas.width / 2 + (Math.random() - 0.5) * 200,
      y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 14,
      vy: (Math.random() - 1.6) * 14,
      size: Math.random() * 8 + 4,
      color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 12,
      shape: Math.random() > 0.5 ? 'rect' : 'circle',
      gravity: 0.28,
      life: 0,
      maxLife: 160 + Math.random() * 60,
    });
  }
  if (!confettiRunning) animateConfetti();
}

let confettiRunning = false;
function animateConfetti(){
  confettiRunning = true;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  confettiParticles.forEach(p => {
    p.vy += p.gravity * 0.05;
    p.x += p.vx;
    p.y += p.vy;
    p.rotation += p.rotationSpeed;
    p.life++;

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate((p.rotation * Math.PI) / 180);
    ctx.globalAlpha = Math.max(0, 1 - p.life / p.maxLife);
    ctx.fillStyle = p.color;
    if (p.shape === 'rect'){
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  });

  confettiParticles = confettiParticles.filter(p => p.life < p.maxLife && p.y < canvas.height + 50);

  if (confettiParticles.length > 0){
    requestAnimationFrame(animateConfetti);
  } else {
    confettiRunning = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

/* =========================================================
   3. PARTIKEL HATI BERJATUHAN (ambient, terus-menerus)
========================================================= */
const heartsContainer = document.getElementById('hearts-container');
let ambientHeartsInterval = null;

function startAmbientHearts(){
  if (ambientHeartsInterval) return;
  spawnHeart();
  ambientHeartsInterval = setInterval(spawnHeart, 900);
}

function spawnHeart(){
  const heart = document.createElement('span');
  heart.className = 'floating-heart';
  heart.textContent = Math.random() > 0.5 ? '💕' : '❤️';
  const left = Math.random() * 100;
  const duration = 8 + Math.random() * 6;
  const drift = (Math.random() - 0.5) * 160;
  heart.style.left = left + 'vw';
  heart.style.setProperty('--drift', drift + 'px');
  heart.style.animationDuration = duration + 's';
  heart.style.fontSize = (1 + Math.random() * 1.2) + 'rem';
  heartsContainer.appendChild(heart);
  setTimeout(() => heart.remove(), duration * 1000 + 200);
}

/* =========================================================
   4. BALON NAIK DARI BAWAH
========================================================= */
const balloonsContainer = document.getElementById('balloons-container');

function spawnBalloons(count){
  const { balloonColors } = CONFIG;
  for (let i = 0; i < count; i++){
    setTimeout(() => {
      const balloon = document.createElement('div');
      balloon.className = 'balloon';
      const left = Math.random() * 90;
      const sway = (Math.random() - 0.5) * 120;
      const color = balloonColors[Math.floor(Math.random() * balloonColors.length)];
      balloon.style.left = left + 'vw';
      balloon.style.setProperty('--sway', sway + 'px');
      balloon.style.background = `radial-gradient(circle at 30% 30%, #fff, ${color})`;
      balloonsContainer.appendChild(balloon);
      setTimeout(() => balloon.remove(), 7200);
    }, i * 300);
  }
}

/* =========================================================
   5. COUNTDOWN MENUJU ULANG TAHUN
========================================================= */
const cdDays = document.getElementById('cd-days');
const cdHours = document.getElementById('cd-hours');
const cdMinutes = document.getElementById('cd-minutes');
const cdSeconds = document.getElementById('cd-seconds');
const countdownGrid = document.getElementById('countdown-grid');
const countdownDone = document.getElementById('countdown-done');

function pad(n){ return String(n).padStart(2, '0'); }

function updateCountdown(){
  const target = new Date(CONFIG.birthdayDate).getTime();
  const now = Date.now();
  const diff = target - now;

  if (diff <= 0){
    countdownGrid.classList.add('hidden');
    countdownDone.classList.remove('hidden');
    burstConfetti(120);
    clearInterval(countdownTimer);
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  cdDays.textContent = pad(days);
  cdHours.textContent = pad(hours);
  cdMinutes.textContent = pad(minutes);
  cdSeconds.textContent = pad(seconds);
}

updateCountdown();
const countdownTimer = setInterval(updateCountdown, 1000);

/* =========================================================
   6. GALERI FOTO & VIDEO + LIGHTBOX
========================================================= */
const galleryItemEls = Array.from(document.querySelectorAll('.gallery-item'));
const lightbox = document.getElementById('lightbox');
const lightboxMedia = document.getElementById('lightbox-media');
const lightboxClose = document.getElementById('lightbox-close');
const lightboxPrev = document.getElementById('lightbox-prev');
const lightboxNext = document.getElementById('lightbox-next');
let currentImageIndex = 0;

// Kumpulkan data setiap item galeri (foto atau video)
const galleryMedia = galleryItemEls.map(item => {
  const isVideo = item.classList.contains('is-video');
  const el = isVideo ? item.querySelector('video') : item.querySelector('img');
  return {
    type: isVideo ? 'video' : 'image',
    src: el.getAttribute('src'),
    alt: el.getAttribute('alt') || '',
  };
});

function renderLightboxMedia(index){
  const data = galleryMedia[index];
  lightboxMedia.innerHTML = '';

  if (data.type === 'video'){
    const video = document.createElement('video');
    video.src = data.src;
    video.controls = true;
    video.autoplay = true;
    video.muted = true; 
    video.playsInline = true;
    lightboxMedia.appendChild(video);
  } else {
    const img = document.createElement('img');
    img.src = data.src;
    img.alt = data.alt;
    lightboxMedia.appendChild(img);
  }
}

function openLightbox(index){
  currentImageIndex = index;
  renderLightboxMedia(index);
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function stopLightboxVideo(){
  const playingVideo = lightboxMedia.querySelector('video');
  if (playingVideo) playingVideo.pause();
}

function closeLightbox(){
  stopLightboxVideo();
  lightbox.classList.remove('active');
  document.body.style.overflow = '';
}

function showNextImage(delta){
  stopLightboxVideo();
  currentImageIndex = (currentImageIndex + delta + galleryMedia.length) % galleryMedia.length;
  renderLightboxMedia(currentImageIndex);
}

galleryItemEls.forEach((item, index) => {
  item.addEventListener('click', () => openLightbox(index));
});

lightboxClose.addEventListener('click', closeLightbox);
lightboxPrev.addEventListener('click', () => showNextImage(-1));
lightboxNext.addEventListener('click', () => showNextImage(1));
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});
document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('active')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') showNextImage(-1);
  if (e.key === 'ArrowRight') showNextImage(1);
});

/* =========================================================
   7. MUSIK LATAR
========================================================= */
const musicToggle = document.getElementById('music-toggle');
const vinyl = document.querySelector('.vinyl');
let musicPlaying = false;

function attemptAutoplayMusic(){
  const playPromise = bgMusic.play();
  if (playPromise !== undefined){
    playPromise
      .then(() => {
        musicPlaying = true;
        vinyl.classList.add('spinning');
      })
      .catch(() => {
        // Browser mencegah autoplay — biarkan pengguna menekan tombol play
        musicPlaying = false;
        vinyl.classList.remove('spinning');
      });
  }
}

musicToggle.addEventListener('click', () => {
  if (musicPlaying){
    bgMusic.pause();
    musicPlaying = false;
    vinyl.classList.remove('spinning');
  } else {
    bgMusic.play()
      .then(() => {
        musicPlaying = true;
        vinyl.classList.add('spinning');
      })
      .catch(() => {
        console.warn('Tidak dapat memutar musik. Pastikan file musik/background-music.mp3 tersedia.');
      });
  }
});

/* =========================================================
   8. SCROLL REVEAL ANIMATION
========================================================= */
const revealTargets = document.querySelectorAll(
  '.countdown-section, .gallery-section, .message-section, .timeline-section, .footer, .gallery-item, .timeline-item, .message-card'
);
revealTargets.forEach(el => el.classList.add('reveal'));

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting){
      entry.target.classList.add('in-view');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

revealTargets.forEach(el => observer.observe(el));
