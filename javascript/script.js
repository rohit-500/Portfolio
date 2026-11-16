const root = document.documentElement;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---- Theme toggle (initial theme is applied by the inline script in <head>)
const themeToggle = document.getElementById('theme-toggle');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

const currentTheme = () => root.dataset.theme || (prefersDark.matches ? 'dark' : 'light');

function syncThemeToggle() {
    const dark = currentTheme() === 'dark';
    themeToggle.setAttribute('aria-pressed', String(dark));
    themeToggle.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
}

function toggleTheme() {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (e) { }
    syncThemeToggle();
    return next;
}

themeToggle.addEventListener('click', toggleTheme);
prefersDark.addEventListener('change', syncThemeToggle);
syncThemeToggle();

// ---- Mobile menu
const menu = document.getElementById('menu-icon');
const navbar = document.getElementById('navbar');

function setMenu(open) {
    navbar.classList.toggle('active', open);
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
}

menu.addEventListener('click', () => setMenu(!navbar.classList.contains('active')));
navbar.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));
window.addEventListener('scroll', () => {
    if (navbar.classList.contains('active')) setMenu(false);
}, { passive: true });

// ---- Reading progress line
const progress = document.getElementById('progress');

function updateProgress() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.setProperty('--p', max > 0 ? Math.min(window.scrollY / max, 1) : 0);
}

window.addEventListener('scroll', updateProgress, { passive: true });
window.addEventListener('resize', updateProgress);
updateProgress();

// ---- Hero grid: spotlight and cell trail following the mouse
const hero = document.getElementById('top');
const heroFx = document.getElementById('hero-fx');
const CELL = 56;
let lastCell = '';

if (!reduceMotion) {
    hero.addEventListener('pointermove', (e) => {
        if (e.pointerType !== 'mouse') return;
        const rect = heroFx.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        heroFx.style.setProperty('--hx', `${x}px`);
        heroFx.style.setProperty('--hy', `${y}px`);
        heroFx.classList.add('is-active');

        if (y < 0 || y > rect.height) return;
        const cx = Math.floor(x / CELL) * CELL;
        const cy = Math.floor(y / CELL) * CELL;
        const key = `${cx},${cy}`;
        if (key === lastCell) return;
        lastCell = key;

        const cell = document.createElement('span');
        cell.className = 'hero-cell';
        cell.style.left = `${cx + 1}px`;
        cell.style.top = `${cy + 1}px`;
        heroFx.appendChild(cell);
        cell.addEventListener('animationend', () => cell.remove());
    });
    hero.addEventListener('pointerleave', () => {
        heroFx.classList.remove('is-active');
        lastCell = '';
    });
}

// ---- Rubber-band logo
const logoMark = document.querySelector('.logo-mark');
document.querySelector('.logo').addEventListener('click', () => {
    if (reduceMotion) return;
    logoMark.classList.remove('rubber');
    void logoMark.offsetWidth; // restart the animation on repeated clicks
    logoMark.classList.add('rubber');
});
logoMark.addEventListener('animationend', () => logoMark.classList.remove('rubber'));

// ---- Toast + confetti helpers
const toast = document.getElementById('toast');
let toastTimer;

function showToast(message) {
    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2200);
}

function confetti(x = window.innerWidth / 2, y = window.innerHeight / 2) {
    if (reduceMotion) return;
    const pieces = ['🎉', '✨', '🚀', '⭐', '☁️', '💙'];
    for (let i = 0; i < 18; i++) {
        const el = document.createElement('span');
        el.className = 'confetti';
        el.textContent = pieces[i % pieces.length];
        const angle = Math.random() * Math.PI * 2;
        const dist = 80 + Math.random() * 140;
        el.style.left = `${x}px`;
        el.style.top = `${y}px`;
        el.style.setProperty('--x', `${Math.cos(angle) * dist}px`);
        el.style.setProperty('--y', `${Math.sin(angle) * dist - 60}px`);
        el.style.setProperty('--rot', `${Math.random() * 540 - 270}deg`);
        document.body.appendChild(el);
        el.addEventListener('animationend', () => el.remove());
    }
}

// ---- Hero: rotating words in the tagline
const rotatorWord = document.getElementById('rotator-word');
const words = ['cloud infrastructure', 'CI/CD pipelines', 'Terraform modules', 'observability stacks', 'backup systems'];

if (!reduceMotion) {
    let wordIndex = 0;
    let charIndex = words[0].length;
    let deleting = true;

    const tick = () => {
        const word = words[wordIndex];
        charIndex += deleting ? -1 : 1;
        rotatorWord.textContent = word.slice(0, charIndex);

        let delay = deleting ? 40 : 75;
        if (!deleting && charIndex === word.length) {
            deleting = true;
            delay = 1800;
        } else if (deleting && charIndex === 0) {
            deleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            delay = 300;
        }
        setTimeout(tick, delay);
    };
    setTimeout(tick, 2200);
}

// ---- Cursor-following spotlight on cards
document.querySelectorAll('.spot').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${e.clientX - rect.left}px`);
        card.style.setProperty('--my', `${e.clientY - rect.top}px`);
    });
});

// ---- Reveal-on-scroll and active nav link
const revealEls = document.querySelectorAll('.reveal');
const navLinks = [...navbar.querySelectorAll('a')];

if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            el.classList.add('is-visible');
            setTimeout(() => {
                el.classList.add('is-settled');
                el.style.transitionDelay = '';
            }, 1000);
            revealObserver.unobserve(el);
        });
    }, { threshold: 0.12 });
    revealEls.forEach((el, i) => {
        el.style.transitionDelay = `${(i % 4) * 70}ms`;
        revealObserver.observe(el);
    });

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            navLinks.forEach((link) => {
                if (link.hash === `#${entry.target.id}`) link.setAttribute('aria-current', 'true');
                else link.removeAttribute('aria-current');
            });
        });
    }, { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('main section[id]').forEach((section) => sectionObserver.observe(section));
} else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
}

// ---- Terminal playground
const terminalBody = document.getElementById('terminal-body');
const terminalOut = document.getElementById('terminal-out');
const terminalForm = document.getElementById('terminal-form');
const terminalInput = document.getElementById('terminal-input');
const history = [];
let historyIndex = 0;

const RESUME_URL = 'https://drive.google.com/file/d/1ajfGJ8qU53skAWKLOd3RG8lOuSibXOFL/view?usp=drive_link';
const LINKEDIN_URL = 'https://www.linkedin.com/in/rohit-nagmoti-6a878a214/';

const commands = {
    help: () => [
        'Available commands:',
        '  <b>whoami</b>        who is this guy?',
        '  <b>experience</b>    where I have worked',
        '  <b>projects</b>      things I have built',
        '  <b>blog</b>          things I have written',
        '  <b>skills</b>        my toolbox',
        '  <b>achievements</b>  shiny things',
        '  <b>contact</b>       say hi',
        '  <b>resume</b>        open my résumé',
        '  <b>theme</b>         flip light / dark',
        '  <b>clear</b>         clean the screen',
        '<span class="t-dim">…and a few hidden ones. Try thinking like a DevOps engineer.</span>',
    ],
    whoami: () => [
        'Rohit Nagmoti — Software Engineer, DevOps &amp; Platform Engineering @ Infraspec (Bengaluru).',
        'B.E. Computer Science, KLS GIT — CGPA 9.63/10.',
    ],
    experience: () => [
        '<span class="t-blue">Infraspec</span> · Software Engineer          Jun 2024 – now',
        '  ├─ LG Ad Solutions: $60K+ saved, incident response 10d → 1d, 60+ runbooks',
        '  └─ Glomopay: manual infra → Terraform IaC on GCP, CI/CD, OpenTelemetry',
        '<span class="t-blue">Infraspec</span> · Software Engineer Intern   Jan 2024 – Apr 2024',
        '  └─ AWS + Terraform, Kubernetes deployments, Dockerized Discord bot',
    ],
    projects: () => [
        '🎨 Picfusion         text-to-image platform · Django, Celery, Redis, AWS',
        '🦍 ECS Kong Module   Terraform module for Kong on ECS',
        '🍓 PXE Boot Pi       network-boot automation · Linux, Bash',
        '🤖 Discord Bot       task management · JavaScript, Docker, CI/CD',
    ],
    blog: () => [
        '📝 <a href="https://www.infraspec.dev/blog/tag-strat-blog" target="_blank" rel="noopener">Essential AWS Tagging Strategies</a>        Jul 2024',
        '📝 <a href="https://www.infraspec.dev/blog/rpi-netboot-automation" target="_blank" rel="noopener">Automated Netbooting for Raspberry Pi</a>   Apr 2024',
        '📝 <a href="https://www.infraspec.dev/blog/rpi-netboot-deep-dive" target="_blank" rel="noopener">PXE Boot Sequence Deep Dive</a>             Apr 2024',
    ],
    skills: () => [
        '<span class="t-yellow">cloud</span>      AWS, GCP, S3, DataSync, IAM, Terraform, Packer, Kubernetes, Helm, Docker',
        '<span class="t-yellow">languages</span>  Go, Java, Python, JavaScript, C, C++, SQL, Bash',
        '<span class="t-yellow">tools</span>      Spring Boot, Django, GitHub Actions, Jenkins, Git, Linux',
        '<span class="t-yellow">observe</span>    OpenTelemetry, Prometheus, Grafana, HDFS, Ceph',
    ],
    achievements: () => [
        '🏅 AWS Certified Cloud Practitioner',
        '🏆 CodeChef 4★ (1904) — qualified for the IICC Grand Finale',
        '🚀 CodeChef Starters 29 Div 2 — Global Rank 256',
    ],
    contact: () => [
        'email     <a href="mailto:rrohitnagmoti@gmail.com">rrohitnagmoti@gmail.com</a>',
        `linkedin  <a href="${LINKEDIN_URL}" target="_blank" rel="noopener">in/rohit-nagmoti-6a878a214</a>`,
    ],
    resume: () => {
        window.open(RESUME_URL, '_blank', 'noopener');
        return ['Opening résumé in a new tab… 📄'];
    },
    theme: () => [`Switched to ${toggleTheme()} mode. ${currentTheme() === 'dark' ? '🌙' : '☀️'}`],
    ls: () => ['experience/  projects/  blog/  skills.yaml  achievements.md  contact.txt  <span class="t-dim">.secrets</span>'],
    'cat .secrets': () => ['Nice try. 🔒 The real secret is good runbooks.'],
    pwd: () => ['/home/rohit/portfolio'],
    date: () => [new Date().toString()],
    echo: (args) => [args.join(' ').replace(/</g, '&lt;')],
    'sudo hire-rohit': () => {
        confetti();
        setTimeout(() => document.getElementById('contact').scrollIntoView({ behavior: 'smooth' }), 900);
        return ['<span class="t-yellow">[sudo]</span> permission granted ✓', 'Redirecting you to the contact form… 🎉'];
    },
    'terraform apply': () => [
        'Plan: 1 to add, 0 to change, 0 to destroy.',
        '  + resource "friendship" "you_and_rohit" {}',
        '<b>Apply complete! Resources: 1 added, 0 changed, 0 destroyed.</b>',
    ],
    'terraform destroy': () => ['<span class="t-yellow">Error:</span> prevent_destroy = true. Some things are meant to last. 💙'],
    'kubectl get pods': () => [
        'NAME                      READY   STATUS    RESTARTS',
        'portfolio-7f9c6d-x2k8p    1/1     Running   0',
        'coffee-maker-5b8d4-q9w2   1/1     Running   42',
    ],
    coffee: () => ['☕ Brewing… done. Productivity +20%.'],
    sudo: () => ['rohit is not in the sudoers file. This incident will be reported. 😄 (psst: try <b>sudo hire-rohit</b>)'],
    'rm -rf /': () => ['Nope. We have backups anyway — I made sure of that. 😎'],
    exit: () => ['There is no escape. Try <b>help</b> instead. 🙂'],
};

function print(lines, cls) {
    lines.forEach((line) => {
        const p = document.createElement('p');
        if (cls) p.className = cls;
        p.innerHTML = line;
        terminalOut.appendChild(p);
    });
    terminalBody.scrollTop = terminalBody.scrollHeight;
}

function runCommand(raw) {
    const input = raw.trim();
    const cmdLine = document.createElement('p');
    cmdLine.className = 't-cmd';
    cmdLine.textContent = input;
    terminalOut.appendChild(cmdLine);
    if (!input) return;

    history.push(input);
    historyIndex = history.length;

    const normalized = input.replace(/\s+/g, ' ').toLowerCase();
    if (normalized === 'clear') {
        terminalOut.innerHTML = '';
        return;
    }
    const [name, ...args] = normalized.split(' ');
    const lookup = (key) => (Object.hasOwn(commands, key) ? commands[key] : null);
    const handler = lookup(normalized) || (name === 'echo' ? commands.echo : null) || (args.length === 0 && lookup(name));
    if (handler) {
        print(handler(input.split(/\s+/).slice(1)));
    } else {
        print([`command not found: ${name.replace(/</g, '&lt;')}. Type <b>help</b> to see what I can do.`]);
    }
}

terminalForm.addEventListener('submit', (e) => {
    e.preventDefault();
    runCommand(terminalInput.value);
    terminalInput.value = '';
});

terminalInput.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' && historyIndex > 0) {
        historyIndex -= 1;
        terminalInput.value = history[historyIndex];
        e.preventDefault();
    } else if (e.key === 'ArrowDown') {
        historyIndex = Math.min(historyIndex + 1, history.length);
        terminalInput.value = history[historyIndex] || '';
        e.preventDefault();
    } else if (e.key === 'Tab') {
        const partial = terminalInput.value.toLowerCase();
        const match = Object.keys(commands).find((c) => partial && c.startsWith(partial));
        if (match) terminalInput.value = match;
        e.preventDefault();
    }
});

terminalBody.addEventListener('click', () => {
    if (!window.getSelection().toString()) terminalInput.focus({ preventScroll: true });
});

// ---- Copy email
const copyEmail = document.getElementById('copy-email');
copyEmail.addEventListener('click', async (e) => {
    const email = copyEmail.dataset.email;
    try {
        await navigator.clipboard.writeText(email);
        showToast('Email copied to clipboard ✓');
        confetti(e.clientX, e.clientY);
    } catch (err) {
        window.location.href = `mailto:${email}`;
    }
});

// ---- Contact form → Google Apps Script → Google Sheet
const scriptURL =
    'https://script.google.com/macros/s/AKfycbwf8kEMZ6PO4RboP3mJxxgMYMS-pyiM_dQ2oiuccuTpKuvO4Y0BeR0uqz_tXhzMFPQ1/exec';

const form = document.forms['google-sheet'];
const submitBtn = document.getElementById('sub1');
const submitLabel = submitBtn.querySelector('.btn-label');
const formStatus = document.getElementById('form-status');

form.addEventListener('submit', (e) => {
    e.preventDefault();

    submitBtn.disabled = true;
    submitLabel.textContent = 'Sending…';
    formStatus.textContent = '';

    fetch(scriptURL, {
        method: 'POST',
        body: new FormData(form)
    })
        .then(() => {
            formStatus.textContent = 'Thanks! Your message has been sent — I’ll get back to you soon.';
            form.reset();
            const rect = submitBtn.getBoundingClientRect();
            confetti(rect.left + rect.width / 2, rect.top);
        })
        .catch((error) => {
            console.error('Error!', error.message);
            formStatus.textContent = 'Something went wrong. Please try again.';
        })
        .finally(() => {
            submitBtn.disabled = false;
            submitLabel.textContent = 'Send message';
        });
});
