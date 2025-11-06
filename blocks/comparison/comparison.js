export default function decorate(block) {
  const model = (window.getBlockData && window.getBlockData(block)) || {};

  // small resolver for image fields which may be string, object or array
  const resolveImage = (v) => {
    if (!v) return '';
    if (typeof v === 'string') return v;
    if (Array.isArray(v) && v.length) return resolveImage(v[0]);
    if (typeof v === 'object') return v.src || v.url || v.path || v.fileReference || v['@id'] || '';
    return '';
  };

  // try to capture authored props (used by the tabbed UI fallback)
  const props = Array.from(block.children || []).map((ele) => ele.children);
  const containerDetails = props[0] && props[0][0]
    ? Array.from(props[0][0].querySelectorAll('p'))
    : [];
  const specsDetails = props.slice(1);

  // model-backed fields (editor side sets these keys)
  const title = model.comparison_title
    || (containerDetails[0] && containerDetails[0].textContent.trim())
    || 'Compare Models';
  const leftTitle = model.comparison_leftTitle
    || (containerDetails[1] && containerDetails[1].textContent.trim())
    || 'Left Model';
  const rightTitle = model.comparison_rightTitle
    || (containerDetails[1] && containerDetails[1].textContent.trim())
    || 'Right Model';
  // note: image resolution for final rendering happens further down

  // specs can come from model (array) or as authored child spec items (specsDetails)
  const specsFromModel = Array.isArray(model.comparison_specs)
    ? model.comparison_specs
    : [];

  // If authored props exist, render the tabbed UI like the reference pattern
  if (specsDetails && specsDetails.length) {
    // build tabbed UI
    // clear existing
    block.innerHTML = '';
    // title and wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'specifications-wrapper';
    const titleEl = document.createElement('h2');
    titleEl.className = 'comparison-title';
    titleEl.textContent = title;
    block.appendChild(titleEl);

    const specsHeader = document.createElement('div');
    specsHeader.className = 'specs-header';
    const specsBody = document.createElement('div');
    specsBody.className = 'specs-body';

    const bikeBannerImage = containerDetails[2] && containerDetails[2].querySelector
      ? containerDetails[2].querySelector('picture')
      : null;

    specsDetails.forEach((prop, idx) => {
      const paragraphs = prop[0]
        ? Array.from(prop[0].querySelectorAll('p'))
        : [];
      const firstP = paragraphs[0] || { textContent: '' };
      const secondP = paragraphs[1] || { textContent: `spec-${idx}` };

      const classList = idx === 0 ? 'spec-item active' : 'spec-item';
      const articleClassList = idx === 0 ? 'specs-article active' : 'specs-article';

      const specId = secondP.textContent
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-');

      const specsArticle = document.createElement('div');
      specsArticle.className = articleClassList;
      specsArticle.id = specId;
      const specsContent = document.createElement('div');
      specsContent.className = 'specs-main';

      const specItem = document.createElement('div');
      specItem.className = classList;
      const link = document.createElement('a');
      link.href = specId;
      const icon = document.createElement('i');
      icon.className = `spec-icon hero-icon ${firstP.textContent.trim()}`;
      const titleDiv = document.createElement('div');
      titleDiv.className = 'spec-title';
      titleDiv.textContent = secondP.textContent.trim();
      link.appendChild(icon);
      link.appendChild(titleDiv);
      specItem.appendChild(link);

      specsHeader.appendChild(specItem);

      // optional download/share
      if (containerDetails[3] && containerDetails[3].href) {
        const moreWrapper = document.createElement('div');
        moreWrapper.className = 'more-info-wrapper';
        const downloadLink = document.createElement('a');
        downloadLink.href = containerDetails[3].href;
        downloadLink.target = '_blank';
        downloadLink.rel = 'noopener noreferrer';
        downloadLink.textContent = 'Download Brochure';
        const dlSpan = document.createElement('span');
        dlSpan.className = 'hero-icon download-icon';
        downloadLink.appendChild(dlSpan);
        const shareLink = document.createElement('span');
        shareLink.className = 'share-link hero-icon share-icon';
        shareLink.tabIndex = 0;
        shareLink.title = 'Share this link';
        moreWrapper.appendChild(downloadLink);
        moreWrapper.appendChild(shareLink);
        specsArticle.appendChild(moreWrapper);
      }

      Array.from(prop)
        .slice(1)
        .forEach((child, index) => {
          const classes = ['specs-image', 'specs-text'];
          const slot = document.createElement('div');
          slot.className = classes[index] || '';
          slot.appendChild(child.cloneNode(true));
          specsContent.appendChild(slot);
        });

      if (bikeBannerImage) {
        const banner = document.createElement('div');
        banner.className = 'bike-banner';
        banner.appendChild(bikeBannerImage.cloneNode(true));
        specsContent.appendChild(banner);
      }

      specsArticle.appendChild(specsContent);
      specsBody.appendChild(specsArticle);
    });

    wrapper.appendChild(specsHeader);
    wrapper.appendChild(specsBody);
    block.appendChild(wrapper);

    // wire up tabs
    block.querySelectorAll('.spec-item a').forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        block
          .querySelectorAll('.spec-item')
          .forEach((it) => it.classList.remove('active'));
        block
          .querySelectorAll('.specs-article')
          .forEach((art) => art.classList.remove('active'));
        const clickedItem = link.closest('.spec-item');
        if (clickedItem) clickedItem.classList.add('active');
        const targetId = link.getAttribute('href');
        const targetArticle = block.querySelector(`.specs-article#${targetId}`);
        if (targetArticle) targetArticle.classList.add('active');
      });
    });

    return;
  }

  // Otherwise render the static three-column comparison grid using model data
  const resolvedLeftImage = resolveImage(model.comparison_leftImage) || '';
  const resolvedRightImage = resolveImage(model.comparison_rightImage) || '';

  const specsHtml = specsFromModel.length
    ? specsFromModel
      .map(
        (s) => `
        <div class="spec-row">
          <div class="left-value">${s.spec_leftValue || s.leftValue || ''}</div>
          <div class="label">${s.spec_label || s.label || ''}</div>
          <div class="right-value">${
  s.spec_rightValue || s.rightValue || ''
}</div>
        </div>
      `,
      )
      .join('')
    : '';

  block.innerHTML = `
    <div class="comparison-container">
      <h2 class="comparison-title">${title}</h2>
      <div class="comparison-grid">
        <div class="bike-column left">
          <h3 class="bike-title left">${leftTitle}</h3>
          ${
  resolvedLeftImage
    ? `<img src="${resolvedLeftImage}" alt="${leftTitle}" />`
    : ''
}
        </div>

        <div class="specs-column">
          ${specsHtml}
        </div>

        <div class="bike-column right">
          <h3 class="bike-title right">${rightTitle}</h3>
          ${
  resolvedRightImage
    ? `<img src="${resolvedRightImage}" alt="${rightTitle}" />`
    : ''
}
        </div>
      </div>
    </div>
  `;
}
