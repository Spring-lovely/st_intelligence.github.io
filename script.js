(() => {
  'use strict';

  const config = window.SITE_CONFIG || {};
  const brandChinese = config.brandChinese || '时空智研';
  const brandEnglish = config.brandEnglish || 'ST INTELLIGENCE';
  document.documentElement.classList.add('js-ready');
  document.querySelectorAll('[data-brand-cn]').forEach(el => { el.textContent = brandChinese; });
  document.querySelectorAll('[data-brand-en]').forEach(el => { el.textContent = brandEnglish; });
  document.querySelector('.brand').setAttribute('aria-label', `${brandChinese}，返回首页`);
  document.title = `${brandChinese} ${brandEnglish} · 智慧气象 · 短临预报与定量降水估计`;
  document.querySelector('meta[property="og:title"]').content = `${brandChinese} ${brandEnglish} · 让智慧气象，走进业务`;
  const description = `${brandChinese} ${brandEnglish}，聚焦智慧气象，以降水短临预报与定量降水估计（QPE）为核心，提供算法验证、区域适配与部署集成的技术合作。`;
  document.querySelector('meta[name="description"]').content = description;
  document.querySelector('meta[property="og:description"]').content = description;
  document.querySelector('#year').textContent = new Date().getFullYear();

  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#main-nav');
  menuToggle.hidden = false;
  const closeMenu = () => {
    nav.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', '打开导航');
  };
  menuToggle.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? '关闭导航' : '打开导航');
  });
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && nav.classList.contains('is-open')) {
      closeMenu();
      menuToggle.focus();
    }
  });
  document.addEventListener('click', event => {
    if (!event.target.closest('.site-header')) closeMenu();
  });
  const desktop = window.matchMedia('(min-width: 641px)');
  desktop.addEventListener('change', closeMenu);

  const scenes = {
    weather: { index: '01', label: '多源感知 / 时空建模', output: '从气象数据，到预测能力' },
    flight: { index: '03', label: '后续探索 / 低空气象', output: '结合数据条件，探索低空应用' },
    agent: { index: '02', label: '领域模型 / 智能体协作', output: '从模型能力，到业务应用' },
  };
  document.querySelectorAll('[data-scene]').forEach(button => {
    button.addEventListener('click', () => {
      const key = button.dataset.scene;
      const scene = scenes[key];
      document.querySelectorAll('[data-scene]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      document.querySelectorAll('.scene-layer').forEach(layer => {
        if (layer.classList.contains(`scene-${key}`)) layer.removeAttribute('hidden');
        else layer.setAttribute('hidden', '');
      });
      document.querySelector('#scene-index').textContent = `${scene.index} / 03`;
      document.querySelector('#scene-label').textContent = scene.label;
      document.querySelector('#scene-output').textContent = scene.output;
    });
  });

  const navLinks = [...nav.querySelectorAll('a')];
  const sections = [...document.querySelectorAll('main > section[id], main > .expertise-section[id], main > .approach-section[id]')];
  let queued = false;
  const updateNavigation = () => {
    let current = 'home';
    sections.forEach(section => { if (section.getBoundingClientRect().top <= 160) current = section.id; });
    navLinks.forEach(link => {
      if (link.hash === `#${current}`) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    queued = false;
  };
  window.addEventListener('scroll', () => {
    if (!queued) { queued = true; requestAnimationFrame(updateNavigation); }
  }, { passive: true });
  updateNavigation();

  const email = typeof config.email === 'string' && /^[^\s@?&#]+@[^\s@?&#]+\.[^\s@?&#]+$/.test(config.email) ? config.email : '';
  const channels = document.querySelector('#contact-channels');
  const addLink = (label, href, external = false) => {
    const link = document.createElement('a');
    link.textContent = `${label} ↗`;
    link.href = href;
    if (external) { link.target = '_blank'; link.rel = 'noopener noreferrer'; }
    channels.append(link);
  };
  if (email) addLink(email, `mailto:${email}`);
  const safeWebUrl = raw => {
    try { const url = new URL(raw); return url.protocol === 'https:' ? url.href : ''; }
    catch { return ''; }
  };
  const xiaohongshu = safeWebUrl(config.xiaohongshuUrl);
  const github = safeWebUrl(config.githubUrl);
  if (xiaohongshu) addLink('在小红书找到我们', xiaohongshu, true);
  if (github) addLink('GitHub', github, true);
  if (typeof config.wechat === 'string' && config.wechat.trim()) {
    const wechat = document.createElement('span');
    wechat.textContent = `业务微信：${config.wechat.trim()}`;
    wechat.style.cssText = 'font-size:12px;overflow-wrap:anywhere;align-self:center';
    channels.append(wechat);
  }
  document.querySelector('#contact-pending').hidden = channels.childElementCount > 0;

  const projectType = document.querySelector('#project-type');
  document.querySelectorAll('[data-interest]').forEach(link => link.addEventListener('click', () => {
    projectType.value = link.dataset.interest;
  }));
  const form = document.querySelector('#brief-form');
  const dialog = document.querySelector('#brief-dialog');
  const output = document.querySelector('#brief-output');
  const status = document.querySelector('#brief-status');
  const copyButton = document.querySelector('#copy-brief');
  const emailLink = document.querySelector('#email-brief');
  const makeBrief = () => [
    `${brandChinese} · 项目合作简述`,
    '',
    `合作方向：${projectType.value}`,
    '',
    '项目需求：',
    document.querySelector('#project-description').value.trim(),
    '',
    `期望周期：${document.querySelector('#project-timeline').value.trim() || '待沟通'}`,
    '',
    '建议进一步对齐：数据来源与使用范围、交付目标、部署环境、验收指标、预算范围。',
  ].join('\n');
  form.addEventListener('submit', event => {
    event.preventDefault();
    const descriptionInput = document.querySelector('#project-description');
    if (!descriptionInput.value.trim()) {
      descriptionInput.setCustomValidity('请简单描述一下你的项目需求。');
      descriptionInput.reportValidity();
      return;
    }
    output.value = makeBrief();
    status.textContent = '';
    copyButton.textContent = '复制简述';
    if (email) {
      emailLink.hidden = false;
      emailLink.href = `mailto:${email}?subject=${encodeURIComponent(`项目合作 · ${projectType.value}`)}&body=${encodeURIComponent(output.value)}`;
    }
    dialog.showModal();
  });
  document.querySelector('#project-description').addEventListener('input', event => event.target.setCustomValidity(''));
  document.querySelector('.close-dialog').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  copyButton.addEventListener('click', async () => {
    try {
      if (!navigator.clipboard || !window.isSecureContext) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(output.value);
      status.textContent = '已复制，可粘贴到你选择的合作渠道。';
      copyButton.textContent = '已复制 ✓';
    } catch {
      output.focus();
      output.select();
      status.textContent = '请使用 Ctrl+C / ⌘C 复制已选中的内容，或点击下载文本。';
    }
  });
  document.querySelector('#download-brief').addEventListener('click', () => {
    const blob = new Blob(['\uFEFF', output.value], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ST-Intelligence-project-brief.txt';
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    status.textContent = '已生成下载文件；这份简述尚未发送给团队。';
  });
})();
