export default function decorate(block) {
  block.classList.add('block', 'comparison');

  // snapshot original authored DOM to extract content
  const source = block.cloneNode(true);

  // derive title from first heading or paragraph
  const heading = source.querySelector('h1,h2,h3,h4,h5,h6');
  const firstP = source.querySelector('p');
  const title = (heading && heading.textContent.trim())
    || (firstP && firstP.textContent.trim())
    || 'Compare models';

  // derive images (first and last img in authored content)
  const imgs = Array.from(source.querySelectorAll('img'));
  const leftImg = imgs[0];
  const rightImg = imgs.length > 1 ? imgs[imgs.length - 1] : imgs[0];
  const leftSrc = (leftImg && leftImg.src) || '';
  const rightSrc = (rightImg && rightImg.src) || '';
  const leftAlt = (leftImg && leftImg.alt) || 'Left image';
  const rightAlt = (rightImg && rightImg.alt) || 'Right image';

  // optional vehicle titles (first and last h3 if present)
  const h3s = Array.from(source.querySelectorAll('h3'));
  const leftTitle = (h3s[0] && h3s[0].textContent.trim()) || '';
  const rightTitle = (h3s.length > 1 && h3s[h3s.length - 1].textContent.trim()) || '';

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

  // collect spec rows from authored DOM: treat each child row after the first as a spec row
  const rows = Array.from(source.children);
  const specRows = rows.slice(1); // assume first row holds title/images; rest are specs
  const authoredSpecs = specRows.map((specRow, idx) => {
    const cells = Array.from(specRow.children);
    let leftValue = '';
    let label = '';
    let rightValue = '';
    if (cells.length >= 3) {
      const p0 = cells[0].querySelector('p, h4, span') || cells[0];
      const p1 = cells[1].querySelector('p, h4, span') || cells[1];
      const p2 = cells[2].querySelector('p, h4, span') || cells[2];
      leftValue = (p0 && p0.textContent.trim()) || '';
      label = (p1 && p1.textContent.trim()) || '';
      rightValue = (p2 && p2.textContent.trim()) || '';
    } else {
      const ps = specRow.querySelectorAll('p, h4, span');
      if (ps.length >= 3) {
        label = ps[0].textContent.trim();
        leftValue = ps[1].textContent.trim();
        rightValue = ps[2].textContent.trim();
      } else if (ps.length === 2) {
        leftValue = ps[0].textContent.trim();
        label = ps[1].textContent.trim();
      }
    }
    return {
      key: `spec-${idx + 1}`,
      label,
      leftValue,
      rightValue,
    };
  }).filter((s) => s.label || s.leftValue || s.rightValue);

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
