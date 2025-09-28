// script.js — полная версия с интро и навигацией
document.addEventListener('DOMContentLoaded', () => {
  initIntro();
});

function initIntro() {
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.getElementById('web');

  const cx = 250;
  const cy = 200;
  const radialCount = 26;
  const ringSteps = 8;
  const maxR = 240;

  // === Кольца ===
  for (let step = 1; step <= ringSteps; step++) {
    const r = (maxR / ringSteps) * step;
    let points = [];
    for (let i = 0; i < radialCount; i++) {
      const angle = (i / radialCount) * Math.PI * 2;
      const rand = r * (0.97 + Math.random() * 0.06);
      const x = cx + Math.cos(angle) * rand;
      const y = cy + Math.sin(angle) * rand;
      points.push(`${i === 0 ? 'M' : 'L'} ${x} ${y}`);
    }
    const d = points.join(" ") + " Z";
    const path = document.createElementNS(svgNS, 'path');
    path.setAttribute('d', d);
    path.classList.add('webpath', 'ring');
    svg.appendChild(path);
  }

  // === Радиалы ===
  for (let i = 0; i < radialCount; i++) {
    const angle = (i / radialCount) * Math.PI * 2;
    const x = cx + Math.cos(angle) * maxR;
    const y = cy + Math.sin(angle) * maxR;
    const d = `M ${cx} ${cy} L ${x} ${y}`;
    const p = document.createElementNS(svgNS, 'path');
    p.setAttribute('d', d);
    p.classList.add('webpath', 'radial');
    svg.appendChild(p);
  }

  // === Паук ===
  const spiderG = document.createElementNS(svgNS, 'g');
  spiderG.setAttribute('id', 'spiderEl');
  spiderG.setAttribute('transform', `translate(${cx}, ${cy}) scale(0)`);

  const body = document.createElementNS(svgNS, 'circle');
  body.setAttribute('r', 7);
  body.setAttribute('fill', '#000');
  body.setAttribute('stroke', '#ccc');
  body.setAttribute('stroke-width', 0.5);
  spiderG.appendChild(body);

  svg.appendChild(spiderG);

  // === Стили нитей ===
  const webPaths = svg.querySelectorAll('.webpath');
  webPaths.forEach((p) => {
    const len = p.getTotalLength();
    p.style.strokeDasharray = len;
    p.style.strokeDashoffset = len;
    p.dataset.len = len;
    p.style.stroke = `rgba(255,255,255,${0.25 + Math.random() * 0.25})`;
    p.style.strokeWidth = 0.9;
    p.style.fill = 'none';
  });

  gsap.registerPlugin(MotionPathPlugin);
  const tl = gsap.timeline();

  // 1) Появление паутины из темноты
  tl.fromTo('#web',
    { opacity: 0, scale: 0.95, filter: 'blur(12px)' },
    { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 1.2, ease: 'power2.out' }
  );

  // 2) Паук появляется
  tl.to(spiderG, { duration: 0.35, scale: 1, ease: 'back.out(1.2)' }, '>-0.2');

  // 3) Радиалы — паук тянет нить за собой
  const radialPaths = svg.querySelectorAll('.radial');
  radialPaths.forEach((p) => {
    const len = p.dataset.len;
    const dUR = 0.15;
    tl.to(spiderG, {
      duration: dUR,
      motionPath: { path: p, align: p, alignOrigin: [0.5, 0.5] },
      ease: 'none',
      onUpdate: function () {
        const prog = this.progress();
        p.style.strokeDashoffset = len * (1 - prog);
      }
    }, '>');
  });

  // 4) Кольца — тоже тянутся за пауком
  const ringPaths = Array.from(svg.querySelectorAll('.ring')).reverse();
  ringPaths.forEach((p) => {
    const len = p.dataset.len;
    const dUR = 0.25;
    tl.to(spiderG, {
      duration: dUR,
      motionPath: { path: p, align: p, alignOrigin: [0.5, 0.5] },
      ease: 'none',
      onUpdate: function () {
        const prog = this.progress();
        p.style.strokeDashoffset = len * (1 - prog);
      }
    }, '>');
  });

  // 5) Финал — лёгкая вибрация
  tl.to('#web', {
    duration: 0.6,
    scale: 1.01,
    rotation: 0.2,
    transformOrigin: '50% 50%',
    yoyo: true,
    repeat: 2,
    ease: 'sine.inOut'
  }, '>');
  
  // 6) Завершение интро
  tl.to('#intro', { 
    opacity: 0, 
    duration: 0.8, 
    ease: 'power2.out', 
    onComplete: () => {
      document.getElementById('intro').style.display = 'none';
      document.getElementById('site').classList.add('visible');
      document.body.style.overflow = 'auto';
      initNavigation(); // Инициализируем навигацию после интро
    }
  }, '>');
}

function initNavigation() {
  const navLinks = document.querySelectorAll('.nav-bar a');
  const transitionEl = document.getElementById('page-transition');
  const transitionWeb = document.getElementById('transition-web');
  
  // Создаем паутину для переходов
  createTransitionWeb();
  
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const targetSection = document.querySelector(targetId);
      
      if (!targetSection) return;
      
      // Анимация перехода
      const tl = gsap.timeline({
        onComplete: () => {
          // Плавная прокрутка к целевой секции
          targetSection.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
      
      // Эффект перехода
      tl.to(transitionEl, { 
        opacity: 1, 
        duration: 0.5,
        ease: "power2.inOut"
      })
      .to(transitionWeb, { 
        opacity: 1, 
        scale: 1, 
        duration: 0.6,
        ease: "back.out(1.2)" 
      }, '-=0.3')
      .to(transitionWeb, { 
        opacity: 0, 
        scale: 1.5, 
        duration: 0.4,
        ease: "power2.in"
      })
      .to(transitionEl, { 
        opacity: 0, 
        duration: 0.4,
        ease: "power2.out"
      }, '-=0.2');
    });
  });
  
  // Добавляем плавный скролл для якорных ссылок
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const targetSection = document.querySelector(targetId);
      
      if (targetSection) {
        targetSection.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

function createTransitionWeb() {
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.getElementById('transition-web');
  const size = 150;
  
  // Очищаем существующую паутину
  while (svg.firstChild) {
    svg.removeChild(svg.firstChild);
  }
  
  // Простая паутина для переходов - радиальные линии
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const x = size/2 + Math.cos(angle) * 60;
    const y = size/2 + Math.sin(angle) * 60;
    
    const line = document.createElementNS(svgNS, 'path');
    line.setAttribute('d', `M ${size/2} ${size/2} L ${x} ${y}`);
    line.style.stroke = `rgba(255,255,255,${0.3 + Math.random() * 0.4})`;
    line.style.strokeWidth = '1.5';
    line.style.strokeDasharray = '1000';
    line.style.strokeDashoffset = '1000';
    svg.appendChild(line);
  }
  
  // Внешнее кольцо
  const outerRing = document.createElementNS(svgNS, 'circle');
  outerRing.setAttribute('cx', size/2);
  outerRing.setAttribute('cy', size/2);
  outerRing.setAttribute('r', '60');
  outerRing.setAttribute('fill', 'none');
  outerRing.style.stroke = 'rgba(255,255,255,0.4)';
  outerRing.style.strokeWidth = '1';
  outerRing.style.strokeDasharray = '1000';
  outerRing.style.strokeDashoffset = '1000';
  svg.appendChild(outerRing);
  
  // Внутреннее кольцо
  const innerRing = document.createElementNS(svgNS, 'circle');
  innerRing.setAttribute('cx', size/2);
  innerRing.setAttribute('cy', size/2);
  innerRing.setAttribute('r', '30');
  innerRing.setAttribute('fill', 'none');
  innerRing.style.stroke = 'rgba(255,255,255,0.6)';
  innerRing.style.strokeWidth = '1.2';
  innerRing.style.strokeDasharray = '1000';
  innerRing.style.strokeDashoffset = '1000';
  svg.appendChild(innerRing);
}

// Обработка форм
document.addEventListener('DOMContentLoaded', function() {
  // Обработка формы контактов
  const contactForm = document.querySelector('.contact-form form');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Простая валидация
      const inputs = this.querySelectorAll('input, textarea');
      let isValid = true;
      
      inputs.forEach(input => {
        if (input.hasAttribute('required') && !input.value.trim()) {
          isValid = false;
          input.style.borderColor = '#ff4444';
        } else {
          input.style.borderColor = '#333';
        }
      });
      
      if (isValid) {
        // Имитация отправки
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        submitBtn.textContent = 'Отправка...';
        submitBtn.disabled = true;
        
        setTimeout(() => {
          submitBtn.textContent = 'Отправлено!';
          submitBtn.style.background = '#4CAF50';
          
          setTimeout(() => {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            submitBtn.style.background = '';
            this.reset();
          }, 2000);
        }, 1500);
      }
    });
  }
  
  // Обработка кнопок записи в прайсе
  const priceButtons = document.querySelectorAll('.price-btn');
  priceButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      const priceCard = this.closest('.price-card');
      const serviceName = priceCard.querySelector('h3').textContent;
      const price = priceCard.querySelector('.price-amount').textContent;
      
      // Плавный скролл к форме контактов
      document.querySelector('#contact').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
      
      // Автозаполнение текстового поля
      setTimeout(() => {
        const textarea = document.querySelector('.contact-form textarea');
        if (textarea) {
          textarea.value = `Заинтересовала услуга: ${serviceName} (${price}). Хочу записаться на консультацию.`;
        }
      }, 800);
    });
  });
});

// Плавное появление элементов при скролле
function initScrollAnimations() {
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

  // Наблюдаем за элементами для анимации
  const animatedElements = document.querySelectorAll('.team-member-card, .price-card, .we-are-box');
  animatedElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
  // Даем время на завершение интро-анимации
  setTimeout(() => {
    initScrollAnimations();
  }, 4000);
});
// ЗАМЕНЯЕМ функцию initNavigation в script.js:

function initNavigation() {
  const navLinks = document.querySelectorAll('.nav-bar a');
  const transitionEl = document.getElementById('page-transition');
  const transitionWeb = document.getElementById('transition-web');
  
  createTransitionWeb();
  
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const targetSection = document.querySelector(targetId);
      
      if (!targetSection) return;
      
      // УСКОРЕННАЯ АНИМАЦИЯ ПЕРЕХОДА
      const tl = gsap.timeline({
        onComplete: () => {
          targetSection.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
      
      // Более быстрая анимация (вместо 0.5 → 0.3 сек)
      tl.to(transitionEl, { 
        opacity: 1, 
        duration: 0.2, // Быстрее
        ease: "power2.inOut"
      })
      .to(transitionWeb, { 
        opacity: 1, 
        scale: 1, 
        duration: 0.3, // Быстрее
        ease: "power2.out" 
      }, '-=0.1') // Меньше перекрытия
      .to(transitionWeb, { 
        opacity: 0, 
        scale: 1.3, 
        duration: 0.2, // Быстрее
        ease: "power2.in"
      })
      .to(transitionEl, { 
        opacity: 0, 
        duration: 0.2, // Быстрее
        ease: "power2.out"
      }, '-=0.1'); // Меньше перекрытия
    });
  });
}

// ОБНОВЛЯЕМ функцию createTransitionWeb чтобы паутинка была видна:

function createTransitionWeb() {
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.getElementById('transition-web');
  const size = 120; // Немного меньше для лучшего вида
  
  // Очищаем
  while (svg.firstChild) {
    svg.removeChild(svg.firstChild);
  }
  
  // Яркая и заметная паутина
  for (let i = 0; i < 12; i++) { // Больше линий
    const angle = (i / 12) * Math.PI * 2;
    const x = size/2 + Math.cos(angle) * 45;
    const y = size/2 + Math.sin(angle) * 45;
    
    const line = document.createElementNS(svgNS, 'path');
    line.setAttribute('d', `M ${size/2} ${size/2} L ${x} ${y}`);
    line.style.stroke = `rgba(255,255,255,0.8)`; // Ярче
    line.style.strokeWidth = '2'; // Толще
    line.style.strokeDasharray = '1000';
    line.style.strokeDashoffset = '1000';
    svg.appendChild(line);
  }
  
  // Яркие кольца
  const rings = [
    { r: 50, opacity: 0.7 },
    { r: 35, opacity: 0.9 },
    { r: 20, opacity: 1.0 }
  ];
  
  rings.forEach(ring => {
    const circle = document.createElementNS(svgNS, 'circle');
    circle.setAttribute('cx', size/2);
    circle.setAttribute('cy', size/2);
    circle.setAttribute('r', ring.r.toString());
    circle.setAttribute('fill', 'none');
    circle.style.stroke = `rgba(255,255,255,${ring.opacity})`;
    circle.style.strokeWidth = '1.5';
    circle.style.strokeDasharray = '1000';
    circle.style.strokeDashoffset = '1000';
    svg.appendChild(circle);
  });
}

// ДОБАВЛЯЕМ обработку кнопки CTA на главной
document.addEventListener('DOMContentLoaded', function() {
  // Кнопка "Записаться на консультацию" на главной
  const ctaButton = document.querySelector('.cta-button');
  if (ctaButton) {
    ctaButton.addEventListener('click', function() {
      document.querySelector('#contact').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    });
  }
  
  // Остальной код обработки форм...
});
// ВАРИАНТ С ПЛАВНЫМ ПОЯВЛЕНИЕМ
function initFixedPhoto() {
  const fixedPhoto = document.querySelector('.about-fixed-photo');
  const aboutSection = document.querySelector('#about');
  
  if (!fixedPhoto || !aboutSection) return;
  
  function updatePhotoVisibility() {
    const aboutRect = aboutSection.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    
    // Плавное изменение opacity в зависимости от позиции
    if (aboutRect.top < windowHeight && aboutRect.bottom > 0) {
      const progress = 1 - Math.max(0, Math.min(1, aboutRect.top / windowHeight));
      fixedPhoto.style.opacity = progress * 0.9;
    } else {
      fixedPhoto.style.opacity = '0';
    }
  }
  
  window.addEventListener('scroll', updatePhotoVisibility);
  window.addEventListener('resize', updatePhotoVisibility);
  updatePhotoVisibility();
}
window.addEventListener("scroll", () => {
  let scrollTop = window.scrollY;
  let scale = 1 + scrollTop / 3000; // 3000 — скорость зума
  document.body.style.transform = `scale(${scale})`;
});
