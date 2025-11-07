export default function decorate(block) {
  block.classList.add('block', 'comparison');

  // read authored values (flat fields, similar to teaser pattern)
  const get = (name) => {
    const el = block.querySelector(`[data-model-key="${name}"]`);
    return el ? el.textContent.trim() : '';
  };
  const getImg = (name) => {
    const el = block.querySelector(`[data-model-key="${name}"] img, [data-model-key="${name}"] picture img`);
    return el ? { src: el.currentSrc || el.src, alt: el.alt || '' } : { src: '', alt: '' };
  };

  const title = get('content_title') || 'Compare models';
  const left = getImg('left_image');
  const right = getImg('right_image');
  const leftTitle = get('left_title');
  const rightTitle = get('right_title');

  const specs = [
    { label: get('specs_fuelTank_label'), left: get('specs_fuelTank_left'), right: get('specs_fuelTank_right') },
    { label: get('specs_height_label'), left: get('specs_height_left'), right: get('specs_height_right') },
    { label: get('specs_length_label'), left: get('specs_length_left'), right: get('specs_length_right') },
    { label: get('specs_shocks_label'), left: get('specs_shocks_left'), right: get('specs_shocks_right') },
    { label: get('specs_colour_label'), left: get('specs_colour_left'), right: get('specs_colour_right') },
  ].filter((s) => s.label || s.left || s.right);

  // reset
  block.innerHTML = '';

  // heading like example
  const headingEl = document.createElement('h2');
  headingEl.className = 'block-heading';
  headingEl.textContent = title;
  block.appendChild(headingEl);

  const row = document.createElement('div');
  row.className = 'comparison-row';

  // left image
  const leftCol = document.createElement('div');
  leftCol.className = 'comparison-image';
  if (left.src) {
    const imgL = document.createElement('img');
    imgL.src = left.src;
    imgL.alt = left.alt || 'Left image';
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

  // collect spec rows from authored DOM: treat each child row after the first as a spec row
  const authoredSpecs = specs.map((s, idx) => ({
    key: `spec-${idx + 1}`,
    label: s.label,
    leftValue: s.left,
    rightValue: s.right,
  }));

  // build tabs + articles
  authoredSpecs.forEach((s, idx) => {
    const id = (s.label || `spec-${idx + 1}`)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-');

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
  if (right.src) {
    const imgR = document.createElement('img');
    imgR.src = right.src;
    imgR.alt = right.alt || 'Right image';
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
      block
        .querySelectorAll('.spec-item')
        .forEach((i) => i.classList.remove('active'));
      block
        .querySelectorAll('.specs-article')
        .forEach((a) => a.classList.remove('active'));
      // activate clicked
      const item = link.closest('.spec-item');
      if (item) item.classList.add('active');
      const targetId = link.getAttribute('href');
      const article = block.querySelector(`.specs-article${targetId}`)
        || block.querySelector(targetId);
      if (article) article.classList.add('active');
    });
  });
}
