(() => {
  'use strict';
  const data = window.SITE_DATA;
  let language = data.defaultLanguage === 'en' ? 'en' : 'zh';
  try { const saved = localStorage.getItem('portfolio-v2-language'); if (['zh', 'en'].includes(saved)) language = saved; } catch {}
  let revealObserver;
  let sectionObserver;
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const t = value => typeof value === 'object' && value !== null ? value[language] ?? value.zh ?? '' : value ?? '';
  const text = value => escape(t(value));
  const ui = key => text(data.ui[key]);
  // Reject executable URLs, keep relative paths compatible with file:// and GitHub Pages subdirectories.
  const safeUrl = value => {
    if (!value) return '';
    try { const url = new URL(value, location.href); return ['https:', 'http:', 'file:'].includes(url.protocol) ? escape(value) : ''; } catch { return ''; }
  };
  const external = (url, label, className = '') => safeUrl(url) ? `<a class="${className}" href="${safeUrl(url)}" target="_blank" rel="noopener noreferrer">${label}</a>` : ``;
  function resume(className = 'button secondary') {
    const url = data.profile.resumePublicApproved ? safeUrl(data.profile.resume) : "";
    return url ? `<a class="${className}" href="${url}" download>${ui('resume')} <span aria-hidden="true">↓</span></a>` : "";
  }
  const tagList = tags => `<div class="tags">${tags.map(tag=>`<span>${text(tag)}</span>`).join('')}</div>`;
  const renderList = items => `<ul class="list">${items.map(item=>`<li><strong>${text(item.label)}${language==='zh'?'：':': '}</strong><span>${text(item.description)}</span></li>`).join('')}</ul>`;
  function renderMarquee(){const group=data.marquee.map(item=>`<span>${text(item)}</span><i aria-hidden="true">✦</i>`).join('');return `<div class="marquee"><div class="marquee-track"><div class="marquee-group">${group}</div><div class="marquee-group" aria-hidden="true">${group}</div></div></div>`;}
  function educationTimeline(){
    return `<div class="edu-timeline">${data.education.map(item=>`<article class="edu-node reveal"><div class="edu-year"><b>${escape(item.year)}</b>${text(item.degree)}</div><div class="edu-card"><h3>${text(item.title)}</h3><p class="subtitle">${text(item.subtitle)} · ${text(item.meta)}</p><p class="desc">${text(item.description)}</p>${tagList(item.tags)}</div></article>`).join('')}</div>`;
  }
  function experienceCards(){
    return `<div class="exp-list">${data.experience.map((item,index)=>`<article class="exp-card ${index===0?'featured':''} reveal"><div class="exp-date">${text(item.meta)}</div><div><div class="exp-head"><h3>${text(item.title)}</h3></div><p class="subtitle sub">${text(item.subtitle)}</p><p class="desc">${text(item.description)}</p>${renderList(item.bullets)}</div></article>`).join('')}</div>`;
  }
  function academicCards(){
    return `<div class="academic-list">${data.research.map(item=>`<article class="academic-card reveal"><p class="academic-type">${text(item.meta)}</p><div><h3>${item.url?external(item.url,text(item.title)):text(item.title)}</h3>${item.subtitle?`<p class="subtitle">${text(item.subtitle)}</p>`:''}<p class="desc">${text(item.description)}</p></div></article>`).join('')}</div>`;
  }
  function projectCard(project,index){return `<article class="project-card reveal" id="project-${escape(project.id)}"><div class="project-copy"><p class="project-time">${escape(project.category)}</p><h3>${text(project.name)}</h3><p class="subtitle">${text(project.subtitle)} · ${text(project.role)}</p><p class="desc">${text(project.intro)}</p>${project.origin?`<div class="project-origin"><p class="project-origin-title">${text(project.originTitle)}</p><p class="project-origin-text">${text(project.origin)}</p></div>`:''}${tagList(project.tags)}<div class="project-links">${external(project.url,ui('view')+' ↗','project-link')}</div></div><div class="project-process"><figure><button class="project-media image-button" data-preview="${index}" aria-label="${ui('preview')} — ${text(project.name)}"><img src="${safeUrl(project.image)}" alt="${text(project.imageAlt)}" width="1200" height="750" loading="lazy"></button><figcaption class="image-caption">${text(project.imageCaption)} · ${ui('preview')} ↗</figcaption></figure>${renderList(project.highlights)}<p class="result"><strong>${ui('value')}${language==='zh'?'：':': '}</strong>${text(project.value)}</p><details><summary>${ui('details')} +</summary><p class="desc">${text(project.technology)}</p></details></div></article>`;}

  function sectionContent(section) {
    switch (section.id) {
      case 'projects': return `<div class="projects-grid">${data.projects.map(projectCard).join('')}</div>`;
      case 'education': return educationTimeline();
      case 'skills': return `<div class="skills-grid">${data.skills.map((skill,index)=>`<article class="skill skill-card reveal"><p class="skill-num">${String(index+1).padStart(2,'0')}</p><h3>${text(skill.title)}</h3><p>${text(skill.description)}</p></article>`).join('')}</div>`;
      case 'experience': return experienceCards();
      case 'research': return academicCards();
      case 'honors': return `<div class="honors-grid">${data.honors.map(item=>`<article class="honor-card reveal"><p class="meta">${text(item.meta)}</p><h3>${text(item.title)}</h3><p>${text(item.description)}</p></article>`).join('')}</div>`;
      default: return '';
    }
  }
  function render() {
    const profile = data.profile;
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
    document.title = t(data.ui.title);
    document.querySelector('meta[name="description"]').content = t(data.ui.description);
    document.getElementById('app').innerHTML = `
      <a class="skip" href="#main">${ui('skip')}</a>
      <div class="scroll-progress" aria-hidden="true"></div><header class="header"><nav class="navigation wrap" aria-label="${ui('brand')}"><a class="brand" href="#top"><span class="brand-mark">${escape(profile.monogram)}</span><span>${ui('brand')}</span></a><div class="nav-links" id="navigation">${data.sections.map(section=>`<a href="#${escape(section.id)}">${text(section.nav || section.title)}</a>`).join('')}</div><div class="nav-controls"><button class="language" id="language" aria-label="${ui('language')}"><span class="${language==='zh'?'active':''}">中</span><span class="${language==='en'?'active':''}">EN</span></button><button class="menu" id="menu" aria-label="${ui('menu')}" aria-expanded="false" aria-controls="navigation">☰</button></div></nav></header>
      <main id="main"><section class="hero" id="top"><div class="hero-glow" aria-hidden="true"></div><div class="wrap hero-grid"><div class="hero-content"><div class="eyebrow">${profile.heroTags.map(tag=>`<span>${text(tag)}</span>`).join('')}</div><h1 class="hero-name"><span class="${language==='zh'?'zh':'latin'}">${[...t(profile.name)].map((ch,i)=>`<span class="ch" style="animation-delay:${i*.09}s">${escape(ch)}</span>`).join('')}</span></h1><h2 class="hero-title">${text(profile.headline).replace(language==='zh'?'AI 产品':'AI product','<em>'+(language==='zh'?'AI 产品':'AI product')+'</em>')}</h2><p class="hero-bio">${text(profile.bio)}</p><div class="hero-actions">${profile.resume&&profile.resumePublicApproved?resume('button primary'):`<button class="button primary" disabled title="${ui('pdfPending')}">${ui('pdf')} ↓</button>`}<a class="button secondary" href="mailto:${escape(profile.email)}">${escape(profile.email)}</a>${profile.phone?`<a class="button secondary" href="tel:${escape(profile.phone)}">${escape(profile.phone)}</a>`:''}</div><div class="hero-keywords">${profile.capabilities.map(item=>`<span>${text(item)}</span>`).join('')}</div><a class="story-cue" href="#education"><span aria-hidden="true">↓</span>${ui('scroll')}</a></div>
        <figure class="hero-portrait"><div class="portrait-halo" aria-hidden="true"></div><div class="portrait-frame"><img src="${safeUrl(profile.portrait)}" alt="${text(profile.portraitAlt)}" width="1280" height="1792" fetchpriority="high"></div><figcaption class="profile-meta">${profile.meta.map(item=>`<p><b>${text(item.label)}</b> · ${text(item.description)}</p>`).join('')}</figcaption><span class="portrait-star" aria-hidden="true">✳</span></figure>
      </div>${renderMarquee()}</section>
      <div class="wrap sections">${data.sections.map(section=>`<section class="content-section ${escape(section.id)}" id="${escape(section.id)}" aria-labelledby="heading-${escape(section.id)}"><div class="section-heading reveal"><p>${escape(section.number)} <span>/ ${escape(section.label)}</span></p><div><h2 id="heading-${escape(section.id)}">${text(section.title)}</h2><p class="section-note">${text(section.note)}</p></div></div>${sectionContent(section)}</section>`).join('')}</div></main><section class="contact" id="contact"><div class="wrap"><h2>${ui('contactHeadline').split('\n').map((line,i)=>i?'<em>'+line+'</em>':line).join('<br>')}</h2><p class="contact-sub">${ui('contactIntro')}</p><div class="contact-grid"><a class="contact-item resume-request" href="mailto:${escape(profile.email)}?subject=${encodeURIComponent(t(data.ui.resumeMailSubject))}"><span>${ui('resumeRequest')}</span><b>${escape(profile.email)}</b></a></div>
      <footer class="wrap footer"><span>© ${new Date().getFullYear()} ${text(profile.name)} <span class="footer-note">/ ${ui('footer')}</span></span><a href="#top">${ui('top')} ↑</a></footer></div></section>
      <dialog class="lightbox" aria-label="${ui('preview')}"><div class="lightbox-inner"><button class="close-preview" aria-label="${ui('close')}">×</button><img alt=""><p></p></div></dialog>`;
    bind(); updateProgress();
  }
  function bind() {
    document.getElementById('language').addEventListener('click',()=>{
      const visible = [...document.querySelectorAll('main section[id]')].find(section=>section.getBoundingClientRect().bottom > 110)?.id;
      language = language === 'zh' ? 'en' : 'zh';
      try { localStorage.setItem('portfolio-v2-language',language); } catch {}
      render();
      if (visible && visible !== 'top') document.getElementById(visible)?.scrollIntoView({behavior:'instant'});
      document.getElementById('language').focus({preventScroll:true});
    });
    const menu = document.getElementById('menu');
    menu.addEventListener('click',()=>{
      const open = menu.getAttribute('aria-expanded') !== 'true';
      menu.setAttribute('aria-expanded',String(open));
      document.getElementById('navigation').classList.toggle('open',open);
    });
    document.querySelectorAll('.nav-links a').forEach(link=>link.addEventListener('click',()=>{
      menu.setAttribute('aria-expanded','false'); document.getElementById('navigation').classList.remove('open');
    }));
    document.querySelectorAll('img').forEach(img=>img.addEventListener('error',()=>{
      img.hidden = true;
      const message = document.createElement('p'); message.className='image-error'; message.textContent=t(data.ui.imageError); img.after(message);
    },{once:true}));
    const dialog = document.querySelector('.lightbox');
    document.querySelectorAll('[data-preview]').forEach(button=>button.addEventListener('click',()=>{
      const project = data.projects[Number(button.dataset.preview)];
      dialog.querySelector('img').src=project.image;
      dialog.querySelector('img').alt=t(project.imageAlt);
      dialog.querySelector('p').textContent=t(project.imageCaption);
      dialog.showModal(); document.body.classList.add('preview-open');
    }));
    dialog.querySelector('button').addEventListener('click',()=>dialog.close());
    dialog.addEventListener('click',event=>{if(event.target===dialog) dialog.close();});
    dialog.addEventListener('close',()=>document.body.classList.remove('preview-open'));
    revealObserver?.disconnect(); sectionObserver?.disconnect();
    if ('IntersectionObserver' in window) {
      revealObserver = new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');revealObserver.unobserve(entry.target);}}),{threshold:0.07});
      document.querySelectorAll('.reveal').forEach(item=>{item.classList.add('will-reveal');revealObserver.observe(item);});
      sectionObserver = new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){document.querySelectorAll('.nav-links a').forEach(link=>link.classList.toggle('current',link.hash===`#${entry.target.id}`));}}),{rootMargin:'-15% 0px -65% 0px'});
      document.querySelectorAll('.content-section').forEach(section=>sectionObserver.observe(section));
    }
  }
  window.addEventListener('keydown',event=>{if(event.key==='Escape'){document.getElementById('navigation').classList.remove('open');document.getElementById('menu').setAttribute('aria-expanded','false');}});
  function updateProgress(){const max=document.documentElement.scrollHeight-innerHeight;const bar=document.querySelector('.scroll-progress');if(bar)bar.style.transform='scaleX('+(max>0?scrollY/max:0)+')';}
  window.addEventListener('scroll',updateProgress,{passive:true});
  window.addEventListener('resize',updateProgress);
  // Outside render(): language changes must not recreate the glow or its listeners.
  function initCursorGlow() {
    if (document.getElementById('cursorGlow')) return;
    const glow = document.createElement('div');
    glow.id = 'cursorGlow';
    glow.className = 'cursor-glow';
    glow.setAttribute('aria-hidden', 'true');
    document.body.append(glow);
    const eligible = window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 961px) and (prefers-reduced-motion: no-preference)');
    let gx = -400, gy = -400, tx = -400, ty = -400, frame = null;
    function hideGlow() {
      document.body.classList.remove('has-cursor');
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null;
    }
    function glowLoop() {
      gx += (tx - gx) * 0.12;
      gy += (ty - gy) * 0.12;
      const moving = Math.abs(tx - gx) + Math.abs(ty - gy) > 0.1;
      if (!moving) { gx = tx; gy = ty; }
      glow.style.transform = `translate(${gx}px, ${gy}px)`;
      frame = moving ? requestAnimationFrame(glowLoop) : null;
    }
    window.addEventListener('mousemove', event => {
      if (!eligible.matches || document.hidden) return;
      tx = event.clientX; ty = event.clientY;
      document.body.classList.add('has-cursor');
      if (frame === null) frame = requestAnimationFrame(glowLoop);
    }, { passive: true });
    document.documentElement.addEventListener('mouseleave', hideGlow);
    window.addEventListener('blur', hideGlow);
    document.addEventListener('visibilitychange', () => { if (document.hidden) hideGlow(); });
    eligible.addEventListener('change', hideGlow);
  }
  render();
  initCursorGlow();
})();
