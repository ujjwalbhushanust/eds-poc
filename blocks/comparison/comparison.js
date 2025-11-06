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

  // try parse JSON model if present
  let model = null;
  const jsonScript = block.querySelector('script[type="application/json"]');
  if (jsonScript) {
    try {
      model = JSON.parse(jsonScript.textContent || '{}');
    } catch (e) {
      model = null;
    }
  }

  // read title and images from model or from first elements
  const heading = block.querySelector('h1,h2,h3,h4,h5,h6');
  const title = (model && (model.title || model.product_title))
    || (heading && heading.textContent.trim())
    || 'Compare models';

  const imgs = Array.from(block.querySelectorAll('img'));
  const leftSrc = resolveImage(model && (model.leftImage || model.product_leftImage)) || (imgs[0] && imgs[0].src) || '';
  const rightSrc = resolveImage(model && (model.rightImage || model.product_rightImage))
    || (imgs[1] && imgs[1].src)
    || (imgs[0] && imgs[0].src)
    || '';

  // rebuild DOM
  block.innerHTML = '';

  const titleEl = document.createElement('h2');
  titleEl.className = 'comparison-title';
  titleEl.textContent = title;
  block.appendChild(titleEl);

  const row = document.createElement('div');
  row.className = 'comparison-row';

  // left image
  const leftCol = document.createElement('div');
  leftCol.className = 'comparison-image';
  if (leftSrc) {
    const imgL = document.createElement('img');
    imgL.src = leftSrc;
    imgL.alt = (model && (model.leftAlt || model.product_leftAlt)) || 'Left image';
    leftCol.appendChild(imgL);
  }
  row.appendChild(leftCol);

  // center content
  const center = document.createElement('div');
  center.className = 'comparison-content';

  // vehicle titles
  const vehicleTitles = document.createElement('div');
  vehicleTitles.className = 'vehicle-titles';
  const vtLeft = document.createElement('div');
  vtLeft.className = 'comparison-vehicle-title left';
  vtLeft.textContent = (model && (model.leftTitle || model.product_leftTitle)) || 'SPLENDOR+';
  const vtSpacer = document.createElement('div');
  const vtRight = document.createElement('div');
  vtRight.className = 'comparison-vehicle-title right';
  vtRight.textContent = (model && (model.rightTitle || model.product_rightTitle)) || 'HF DELUXE';
  vehicleTitles.appendChild(vtLeft);
  vehicleTitles.appendChild(vtSpacer);
  vehicleTitles.appendChild(vtRight);
  center.appendChild(vehicleTitles);

  // specs (authorable via model.specs or block items in model.items)
  const specsWrap = document.createElement('div');
  specsWrap.className = 'comparison-specs';
  let authoredSpecs = (model && Array.isArray(model.specs) && model.specs)
    || (model && Array.isArray(model.product_specs) && model.product_specs)
    || [];
  if (!authoredSpecs.length && model && Array.isArray(model.items)) {
    authoredSpecs = model.items
      .map((it) => (it && it.model ? it.model : it))
      .filter((m) => m && (m.label || m.leftValue || m.rightValue));
  }
  if (authoredSpecs.length) {
    authoredSpecs.forEach((s) => {
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
      specsWrap.appendChild(rowEl);
    });
  } else {
    const rowEl = document.createElement('div');
    rowEl.className = 'comparison-spec-row';
    rowEl.innerHTML = `
      <div class="left-cell"><div class="comparison-value left-value"></div></div>
      <div class="label-cell"><div class="spec-label">No specifications available</div></div>
      <div class="right-cell"><div class="comparison-value right-value"></div></div>
    `;
    specsWrap.appendChild(rowEl);
  }
  center.appendChild(specsWrap);

  // optional description
  const descriptionHTML = (model && (model.descriptionHTML || model.product_descriptionHTML)) || '';
  if (descriptionHTML) {
    const desc = document.createElement('div');
    desc.className = 'comparison-description';
    desc.innerHTML = descriptionHTML;
    center.appendChild(desc);
  }

  row.appendChild(center);

  // right image
  const rightCol = document.createElement('div');
  rightCol.className = 'comparison-image';
  if (rightSrc) {
    const imgR = document.createElement('img');
    imgR.src = rightSrc;
    imgR.alt = (model && (model.rightAlt || model.product_rightAlt)) || 'Right image';
    rightCol.appendChild(imgR);
  }
  row.appendChild(rightCol);

  block.appendChild(row);
}
