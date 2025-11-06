function resolveImage(ref) {
  if (!ref) return '';
  if (typeof ref === 'string') return ref;
  if (Array.isArray(ref)) return ref.length ? resolveImage(ref[0]) : '';
  if (typeof ref === 'object') {
    if (typeof ref.path === 'string') return ref.path;
    if (typeof ref.src === 'string') return ref.src;
    if (ref.asset) {
      if (typeof ref.asset === 'string') return ref.asset;
      if (ref.asset && typeof ref.asset.path === 'string') return ref.asset.path;
    }
    if (typeof ref.url === 'string') return ref.url;
  }
  return '';
}

export default function decorate(block) {
  block.classList.add('block', 'comparison');

  // parse model from embedded JSON (if present)
  let model = null;
  const jsonScript = block.querySelector('script[type="application/json"]');
  if (jsonScript) {
    try {
      model = JSON.parse(jsonScript.textContent || '{}');
    } catch (e) {
      model = null;
    }
  }

  // values with grouped field names (≤4 cells): content_, left_, right_
  const heading = block.querySelector('h1,h2,h3,h4,h5,h6');
  const title = (model && (model.content_title || model.title))
    || (heading && heading.textContent.trim())
    || '';

  const imgs = Array.from(block.querySelectorAll('img'));
  const leftSrc = resolveImage(model && (model.left_image || model.leftImage)) || (imgs[0] && imgs[0].src) || '';
  const rightSrc = resolveImage(model && (model.right_image || model.rightImage))
    || (imgs[1] && imgs[1].src)
    || (imgs[0] && imgs[0].src)
    || '';
  const leftAlt = (model && (model.left_imageAlt || model.leftAlt)) || 'Left image';
  const rightAlt = (model && (model.right_imageAlt || model.rightAlt)) || 'Right image';
  const leftTitle = (model && (model.left_title || model.leftTitle)) || '';
  const rightTitle = (model && (model.right_title || model.rightTitle)) || '';

  // reset
  block.innerHTML = '';

  // heading like example
  const headingEl = document.createElement('h2');
  headingEl.className = 'block-heading';
  headingEl.textContent = title || 'Compare models';
  block.appendChild(headingEl);

  const row = document.createElement('div');
  row.className = 'comparison-row';

  // left image
  const leftCol = document.createElement('div');
  leftCol.className = 'comparison-image';
  if (leftSrc) {
    const imgL = document.createElement('img');
    imgL.src = leftSrc;
    imgL.alt = leftAlt;
    leftCol.appendChild(imgL);
  }
  row.appendChild(leftCol);

  // center: specs wrapper UI
  const center = document.createElement('div');
  center.className = 'comparison-content';

  const specsWrapper = document.createElement('div');
  specsWrapper.className = 'specifications-wrapper';
  const specsHeader = document.createElement('div');
  specsHeader.className = 'specs-header';
  const specsBody = document.createElement('div');
  specsBody.className = 'specs-body';

  // collect spec items from model.items or model.specs
  let authoredSpecs = [];
  if (model && Array.isArray(model.items)) {
    authoredSpecs = model.items
      .map((it) => (it && it.model ? it.model : it))
      .filter((m) => m && (m.label || m.leftValue || m.rightValue));
  }
  if (!authoredSpecs.length && model && Array.isArray(model.specs)) {
    authoredSpecs = model.specs;
  }

  // build tabs + articles
  authoredSpecs.forEach((s, idx) => {
    const id = (s.label || `spec-${idx + 1}`).toLowerCase().replace(/[^a-z0-9]+/g, '-');

    // header item
    const specItem = document.createElement('div');
    specItem.className = `spec-item${idx === 0 ? ' active' : ''}`;
    const link = document.createElement('a');
    link.href = `#${id}`;
    const titleDiv = document.createElement('div');
    titleDiv.className = 'spec-title';
    titleDiv.textContent = s.label || '';
    link.appendChild(titleDiv);
    specItem.appendChild(link);
    specsHeader.appendChild(specItem);

    // body article
    const article = document.createElement('div');
    article.className = `specs-article${idx === 0 ? ' active' : ''}`;
    article.id = id;
    const specsMain = document.createElement('div');
    specsMain.className = 'specs-main';

    // render one comparison row for this spec
    const rowEl = document.createElement('div');
    rowEl.className = 'comparison-spec-row';

    const leftCell = document.createElement('div');
    leftCell.className = 'left-cell';
    const leftVal = document.createElement('div');
    leftVal.className = 'comparison-value left-value';
    leftVal.textContent = s.leftValue || '';
    leftCell.appendChild(leftVal);

    const labelCell = document.createElement('div');
    labelCell.className = 'label-cell';
    const lbl = document.createElement('div');
    lbl.className = 'spec-label';
    lbl.textContent = s.label || '';
    labelCell.appendChild(lbl);

    const rightCell = document.createElement('div');
    rightCell.className = 'right-cell';
    const rightVal = document.createElement('div');
    rightVal.className = 'comparison-value right-value';
    rightVal.textContent = s.rightValue || '';
    rightCell.appendChild(rightVal);

    rowEl.appendChild(leftCell);
    rowEl.appendChild(labelCell);
    rowEl.appendChild(rightCell);
    specsMain.appendChild(rowEl);

    article.appendChild(specsMain);
    specsBody.appendChild(article);
  });

  // vehicle titles above the wrapper (optional)
  if (leftTitle || rightTitle) {
    const vehicleTitles = document.createElement('div');
    vehicleTitles.className = 'vehicle-titles';
    const vtLeft = document.createElement('div');
    vtLeft.className = 'comparison-vehicle-title left';
    vtLeft.textContent = leftTitle || '';
    const vtSpacer = document.createElement('div');
    const vtRight = document.createElement('div');
    vtRight.className = 'comparison-vehicle-title right';
    vtRight.textContent = rightTitle || '';
    vehicleTitles.appendChild(vtLeft);
    vehicleTitles.appendChild(vtSpacer);
    vehicleTitles.appendChild(vtRight);
    center.appendChild(vehicleTitles);
  }

  specsWrapper.appendChild(specsHeader);
  specsWrapper.appendChild(specsBody);
  center.appendChild(specsWrapper);

  row.appendChild(center);

  // right image
  const rightCol = document.createElement('div');
  rightCol.className = 'comparison-image';
  if (rightSrc) {
    const imgR = document.createElement('img');
    imgR.src = rightSrc;
    imgR.alt = rightAlt;
    rightCol.appendChild(imgR);
  }
  row.appendChild(rightCol);

  block.appendChild(row);

  // tab click wiring
  const specLinks = block.querySelectorAll('.spec-item a');
  specLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      // deactivate all
      block.querySelectorAll('.spec-item').forEach((i) => i.classList.remove('active'));
      block.querySelectorAll('.specs-article').forEach((a) => a.classList.remove('active'));
      // activate clicked
      const item = link.closest('.spec-item');
      if (item) item.classList.add('active');
      const targetId = link.getAttribute('href');
      const article = block.querySelector(`.specs-article${targetId}`) || block.querySelector(targetId);
      if (article) article.classList.add('active');
    });
  });
}
