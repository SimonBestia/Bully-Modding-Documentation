// Lightweight blog loader: lists posts and renders a single post

const blogBase = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? ''
  : window.location.origin + '/Bully-Modding-Documentation';

async function fetchJSON(path) {
  const res = await fetch(`${blogBase}/blog/${path}`);
  if (!res.ok) throw new Error('Failed to load ' + path);
  return res.json();
}

async function fetchText(path) {
  const res = await fetch(`${blogBase}/blog/${path}`);
  if (!res.ok) throw new Error('Failed to load ' + path);
  return res.text();
}

function formatDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  } catch (_) {
    return iso;
  }
}

function markdownToHtml(md) {
  // Strip comments
  md = md
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/^\s*\[\/\/\]:\s*#\s*\(([\s\S]*?)\)\s*$/gm, '')
    .replace(/^\s*\[\/\/\]:\s*#\s*"([\s\S]*?)"\s*$/gm, '')
    .replace(/^\s*\[comment\]:\s*<>\s*\(([\s\S]*?)\)\s*$/gm, '');

  // Preprocess images with {attr=val ...}
  md = md.replace(/!\[([^\]]*)\]\(([^)]+)\)(\{([^}]*)\})?/g, (match, alt, src, _fullAttrs, attrsRaw) => {
    let classes = ['post-image'];
    let styles = [];

    if (attrsRaw) {
      const parts = attrsRaw.trim().split(/\s+/);
      parts.forEach(part => {
        const [key, val] = part.includes('=') ? part.split('=') : [null, part];
        if (!key) {
          classes.push(val);
        } else {
          switch (key.toLowerCase()) {
            case 'class':
              classes.push(...val.split(','));
              break;
            case 'w':
            case 'width':
              styles.push(`width:${val}${/%$/.test(val) ? '' : 'px'}`);
              styles.push('height:auto');
              styles.push('max-width:100%');
              break;
            case 'h':
            case 'height':
              styles.push(`height:${val}${/%$/.test(val) ? '' : 'px'}`);
              break;
          }
        }
      });
    }

    const classAttr = `class="${classes.join(' ')}"`;
    const styleAttr = styles.length ? `style="${styles.join(';')}"` : '';

    return `<img src="${src}" alt="${alt}" ${classAttr} ${styleAttr}>`;
  });

  // Years-ago replacement
  md = md.replace(/\{\{years-ago:([\d]{4}-\d{1,2}-\d{1,2})\}\}/g, (m, date) =>
    `<span class="years-ago" data-date="${date}"></span>`
  );

  // Add target="_blank" to all links
  const renderer = new marked.Renderer();
  const origLink = renderer.link;
  renderer.link = function(href, title, text) {
    let html = origLink.call(this, href, title, text);
    return html.replace(/^<a /, '<a target="_blank" rel="noopener noreferrer" ');
  };

  return marked.parse(md, { renderer });
}


async function renderList() {
  const listEl = document.getElementById('blog-list');
  if (!listEl) return;
  try {
    const posts = await fetchJSON('posts.json');
    posts.sort((a, b) => new Date(b.date) - new Date(a.date));
    listEl.innerHTML = posts.map(p => {
      const url = `post.html?slug=${encodeURIComponent(p.slug)}`;
      return `<li>
        <a class="nav-link" href="${url}">${p.title}</a>
        <div class="post-meta">${formatDate(p.date)} · ${p.tags?.join(', ') || ''}</div>
      </li>`;
    }).join('');
  } catch (e) {
    listEl.innerHTML = '<li>Failed to load posts.</li>';
  }
}

async function renderPost() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');
  const titleEl = document.getElementById('post-title');
  const metaEl = document.getElementById('post-meta');
  const contentEl = document.getElementById('post-content');
  if (!slug || !titleEl || !contentEl) return;
  try {
    const posts = await fetchJSON('posts.json');
    const post = posts.find(p => p.slug === slug);
    if (!post) throw new Error('Post not found');
    const md = await fetchText(post.file);
    titleEl.textContent = post.title;
    
    // Build metadata with last modified date
    let metaText = 'Published on: ' + formatDate(post.date);
    if (post.author) metaText += ' · Author: ' + post.author;
    
    // Add last modified date based on file modification time
    try {
      const fileResponse = await fetch(post.file, { method: 'HEAD' });
      if (fileResponse.ok) {
        const lastModified = fileResponse.headers.get('last-modified');
        if (lastModified) {
          const lastModifiedDate = new Date(lastModified);
          const formattedLastModified = lastModifiedDate.toLocaleDateString(undefined, { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          });
          metaText += ' · Last modified: ' + formattedLastModified;
        }
      }
    } catch (e) {
      // If we can't get file modification time, skip it
      console.log('Could not fetch file modification time');
    }
    
    metaEl.textContent = metaText;
    contentEl.innerHTML = markdownToHtml(md);
    updateYearsAgo(contentEl);
    document.title = `${post.title} - Bully Modding Documentation`;
  } catch (e) {
    if (contentEl) contentEl.textContent = 'Failed to load post.';
  }
}

async function renderSidebar() {
  const sidebar = document.getElementById('blog-sidebar');
  if (!sidebar) return;
  const params = new URLSearchParams(window.location.search);
  const currentSlug = params.get('slug');
  try {
    const posts = await fetchJSON('posts.json');
    posts.sort((a, b) => new Date(b.date) - new Date(a.date));
    const groups = posts.reduce((acc, p) => {
      const y = new Date(p.date).getFullYear();
      (acc[y] = acc[y] || []).push(p);
      return acc;
    }, {});
    const years = Object.keys(groups).sort((a, b) => Number(b) - Number(a));
    
    sidebar.innerHTML = years.map(y => {
      const items = groups[y].map(p => {
        const active = p.slug === currentSlug ? ' class="active"' : '';
        return `<li><a${active} href="post.html?slug=${encodeURIComponent(p.slug)}">${p.title}</a></li>`;
      }).join('');
      return `
        <div class="year-header" data-year="${y}">${y}</div>
        <ul class="year-posts">${items}</ul>
      `;
    }).join('');

    // collapse logic
    sidebar.querySelectorAll('.year-header').forEach(header => {
      const ul = header.nextElementSibling;
      header.addEventListener('click', () => {
        ul.classList.toggle('collapsed');
        header.classList.toggle('collapsed');
      });
    });    
  } catch (e) {
    sidebar.textContent = 'Failed to load posts list.';
  }
}


document.addEventListener('DOMContentLoaded', () => {
  renderList();
  renderPost();
  renderSidebar();
});


// parse YYYY-MM-DD safely (avoids ISO timezone quirks)
function yearsBetween(isoYmd) {
  const m = isoYmd && isoYmd.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (!m) return null;
  const year = parseInt(m[1], 10);
  const monthIndex = parseInt(m[2], 10) - 1; // 0-based
  const day = parseInt(m[3], 10);

  const today = new Date();
  let years = today.getFullYear() - year;

  // If today's date is before the anniversary this year, subtract 1
  if (today.getMonth() < monthIndex || (today.getMonth() === monthIndex && today.getDate() < day)) {
    years--;
  }
  return years;
}

function updateYearsAgo(root = document) {
  const nodes = root.querySelectorAll('.years-ago[data-date]');
  nodes.forEach(el => {
    const iso = el.getAttribute('data-date');
    const yrs = yearsBetween(iso);
    if (yrs === null) return;
    el.textContent = yrs; // insert number only; surrounding text can say "years ago"
  });
}
