const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

$$('[data-scroll]').forEach((button) => {
  button.addEventListener('click', () => {
    document.getElementById(button.dataset.scroll)?.scrollIntoView({ behavior: 'smooth' });
  });
});

const modal = $('#videoModal');
const fullVideo = $('#fullVideo');

function openVideo() {
  modal.hidden = false;
  document.body.style.overflow = 'hidden';
  fullVideo.play().catch(() => {});
}

function closeVideo() {
  fullVideo.pause();
  modal.hidden = true;
  document.body.style.overflow = '';
}

$('#watchParadise')?.addEventListener('click', openVideo);
$('#watchParadiseTwo')?.addEventListener('click', openVideo);
$('#closeVideo')?.addEventListener('click', closeVideo);
modal?.addEventListener('click', (event) => { if (event.target === modal) closeVideo(); });
document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && modal && !modal.hidden) closeVideo(); });

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.12 });
$$('.reveal').forEach((el) => revealObserver.observe(el));

const form = $('#registryForm');
const successPanel = $('#successPanel');
const citizenId = $('#citizenId');
const citizenCount = $('#citizenCount');
const formStatus = $('#formStatus');

function campaignSource() {
  const params = new URLSearchParams(window.location.search);
  return (params.get('utm_source') || params.get('source') || document.referrer || 'direct').slice(0, 80);
}

function campaignName() {
  const params = new URLSearchParams(window.location.search);
  return (params.get('utm_campaign') || 'paradise_launch').slice(0, 80);
}

async function loadCitizenCount() {
  try {
    const response = await fetch('/api/stats', { headers: { Accept: 'application/json' } });
    if (!response.ok) return;
    const data = await response.json();
    citizenCount.textContent = String(data.count || 0).padStart(3, '0');
  } catch (_) {
    citizenCount.textContent = '000';
  }
}

loadCitizenCount();

form?.addEventListener('submit', async (event) => {
  event.preventDefault();

  const button = form.querySelector('button[type="submit"]');
  const formData = new FormData(form);

  // Invisible bot trap. Humans never see or fill this field.
  if (formData.get('website')) return;

  const payload = {
    name: formData.get('name'),
    email: formData.get('email'),
    emailConsent: formData.get('emailConsent') === 'true',
    source: campaignSource(),
    campaign: campaignName()
  };

  button.disabled = true;
  button.textContent = 'DOCUMENTING ENTRY…';
  formStatus.textContent = '';

  try {
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'Registration could not be completed.');

    citizenId.textContent = data.citizen.citizen_number;
    form.hidden = true;
    successPanel.hidden = false;

    if (data.citizen.founding_citizen) {
      successPanel.classList.add('founding');
    }

    await loadCitizenCount();
    successPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
  } catch (error) {
    button.disabled = false;
    button.textContent = 'REGISTER AS A CITIZEN';
    formStatus.textContent = error.message;
    formStatus.classList.add('error');
  }
});


// iPhone / Safari hero video playback
const heroVideo = document.querySelector('.hero-video');

if (heroVideo) {
  heroVideo.muted = true;
  heroVideo.defaultMuted = true;
  heroVideo.playsInline = true;

  const startHeroVideo = () => {
    const playAttempt = heroVideo.play();

    if (playAttempt !== undefined) {
      playAttempt.catch(() => {
        // Safari may require the first user interaction.
      });
    }
  };

  startHeroVideo();

  ['touchstart', 'click'].forEach((eventName) => {
    document.addEventListener(eventName, startHeroVideo, {
      once: true,
      passive: true
    });
  });
}
