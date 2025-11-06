export default function decorate(block) {
  const model = (window.getBlockData && window.getBlockData(block)) || {};

  // resolve image helper (string | object | array)
  const resolveImage = (v) => {
    if (!v) return '';
    if (typeof v === 'string') return v;
    if (Array.isArray(v) && v.length) return resolveImage(v[0]);
    if (typeof v === 'object') return v.src || v.url || v.path || v.fileReference || v['@id'] || '';
    return '';
  };

  // Prefer grouped model fields (comparison.content, leftVehicle, rightVehicle, specs)
  // but keep backward-compatibility with older flat keys
  const content = model.content && typeof model.content === 'object'
    ? model.content
    : {
      title: model.comparison_title || model.title || '',
      descriptionHTML:
            model.descriptionHTML || model.comparison_description || '',
    };

  const leftVehicle = model.leftVehicle && typeof model.leftVehicle === 'object'
    ? model.leftVehicle
    : {
      title:
            model.comparison_leftTitle
            || model.leftTitle
            || model.left_name
            || '',
      image: model.comparison_leftImage || model.leftImage || '',
      alt: model.leftAlt || '',
    };

  const rightVehicle = model.rightVehicle && typeof model.rightVehicle === 'object'
    ? model.rightVehicle
    : {
      title:
            model.comparison_rightTitle
            || model.rightTitle
            || model.right_name
            || '',
      image: model.comparison_rightImage || model.rightImage || '',
      alt: model.rightAlt || '',
    };

  // specs can be model.specs (new) or model.comparison_specs (old)
  let specs = [];
  if (Array.isArray(model.specs)) {
    specs = model.specs;
  } else if (Array.isArray(model.comparison_specs)) {
    specs = model.comparison_specs;
  }

  // Build specs HTML rows
  const specsHtml = specs.length
    ? specs
      .map((s) => {
        const label = s.label || s.spec_label || '';
        const left = s.leftValue || s.spec_leftValue || s.left || '';
        const right = s.rightValue || s.spec_rightValue || s.right || '';
        return `
        <div class="spec-row">
          <div class="left-value">${left}</div>
          <div class="label">${label}</div>
          <div class="right-value">${right}</div>
        </div>
      `;
      })
      .join('')
    : '';

  const resolvedLeft = resolveImage(leftVehicle.image);
  const resolvedRight = resolveImage(rightVehicle.image);

  // Try to build a tabbed UI (specifications-wrapper) from authored child content
  const authoredRows = Array.from(block.children || []);
  if (authoredRows.length) {
    // capture authored structure then clear block
    const sections = authoredRows.map((row) => Array.from(row.children || []));
    block.innerHTML = '';

    // title
    const titleEl = document.createElement('h2');
    titleEl.className = 'comparison-title';
    titleEl.textContent = content.title || 'Compare Models';
    block.appendChild(titleEl);

    // wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'specifications-wrapper';
    const header = document.createElement('div');
    header.className = 'specs-header';
    const body = document.createElement('div');
    body.className = 'specs-body';

    // The first authored column often carries meta (like bike banner or links)
    // Specs start from the second column onward
    const specsCols = sections.slice(1);

    specsCols.forEach((col, idx) => {
      const firstCell = col[0] || null;
      const paragraphs = firstCell
        ? Array.from(firstCell.querySelectorAll('p'))
        : [];
      const iconText = (paragraphs[0] && paragraphs[0].textContent.trim()) || '';
      const titleText = (paragraphs[1] && paragraphs[1].textContent.trim()) || `spec-${idx}`;
      const specId = titleText.toLowerCase().replace(/\s+/g, '-');

      // header item
      const item = document.createElement('div');
      item.className = idx === 0 ? 'spec-item active' : 'spec-item';
      const a = document.createElement('a');
      a.setAttribute('href', specId);
      const icon = document.createElement('i');
      icon.className = `spec-icon hero-icon ${iconText}`.trim();
      const t = document.createElement('div');
      t.className = 'spec-title';
      t.textContent = titleText;
      a.appendChild(icon);
      a.appendChild(t);
      item.appendChild(a);
      header.appendChild(item);

      // article body
      const article = document.createElement('div');
      article.className = idx === 0 ? 'specs-article active' : 'specs-article';
      article.id = specId;
      const main = document.createElement('div');
      main.className = 'specs-main';

      // copy remaining cells into the article
      col.slice(1).forEach((cell, i) => {
        const slot = document.createElement('div');
        const slotClasses = ['specs-image', 'specs-text']; // avoid nested ternary
        slot.className = slotClasses[i] || '';
        slot.appendChild(cell.cloneNode(true));
        main.appendChild(slot);
      });

      article.appendChild(main);
      body.appendChild(article);
    });

    wrapper.appendChild(header);
    wrapper.appendChild(body);
    block.appendChild(wrapper);

    // tab wiring
    block.querySelectorAll('.spec-item a').forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const id = link.getAttribute('href');
        block
          .querySelectorAll('.spec-item')
          .forEach((el) => el.classList.remove('active'));
        block
          .querySelectorAll('.specs-article')
          .forEach((el) => el.classList.remove('active'));
        const li = link.closest('.spec-item');
        if (li) li.classList.add('active');
        const panel = block.querySelector(`.specs-article#${id}`);
        if (panel) panel.classList.add('active');
      });
    });

    return;
  }

  // Fallback: simple three-column comparison grid rendered from model data
  block.innerHTML = `
    <h2 class="comparison-title">${content.title || 'Compare Models'}</h2>
    <div class="comparison-grid">
      <div class="bike-column left">
        <h3 class="bike-title left">${leftVehicle.title || ''}</h3>
        ${
  resolvedLeft
    ? `<img src="${resolvedLeft}" alt="${
      leftVehicle.alt || leftVehicle.title || ''
    }" />`
    : ''
}
      </div>

      <div class="specs-column">
        ${
  specsHtml
          || `
          <div class="spec-row">
            <div class="left-value"></div>
            <div class="label">No specifications available</div>
            <div class="right-value"></div>
          </div>
        `
}
      </div>

      <div class="bike-column right">
        <h3 class="bike-title right">${rightVehicle.title || ''}</h3>
        ${
  resolvedRight
    ? `<img src="${resolvedRight}" alt="${
      rightVehicle.alt || rightVehicle.title || ''
    }" />`
    : ''
}
      </div>
    </div>
  `;
}
