export default function decorate(block) {
  // Ensure block has expected base classes
  block.classList.add('block', 'comparison');

  // Try to extract JSON model if Franklin injected it
  let model = null;
  const jsonScript = block.querySelector('script[type="application/json"]');
  if (jsonScript) {
    try {
      model = JSON.parse(jsonScript.textContent || '{}');
    } catch (e) {
      model = null;
    }
  }

  // Helper: get first heading text
  const heading = block.querySelector('h1,h2,h3,h4,h5,h6');
  const titleText = (model && model.title) || (heading && heading.textContent.trim()) || 'Compare models';

  // Helper: get first paragraph HTML as description
  const firstP = block.querySelector('p');
  const descriptionHTML = (model && model.description) || (firstP && firstP.innerHTML.trim()) || '';

  // Helper: collect image sources
  const imgs = Array.from(block.querySelectorAll('img'));
  const leftSrc = (model && model.leftImage) || (imgs[0] && imgs[0].src) || '';
  const rightSrc =
    (model && model.rightImage) ||
    (imgs[1] && imgs[1].src) ||
    (imgs[0] && imgs[0].src) ||
    '';

  // Helper: try to extract spec rows from a table or list if present
  const specs = [];
  const table = block.querySelector('table');
  if (table) {
    Array.from(table.rows).forEach((r) => {
      const cells = Array.from(r.cells).map((c) => c.textContent.trim());
      if (cells.length >= 3) {
        specs.push({ label: cells[1], leftValue: cells[0], rightValue: cells[2] });
      } else if (cells.length === 2) {
        specs.push({ label: cells[0], leftValue: cells[1], rightValue: '' });
      }
    });
  } else {
    // try UL/OL with "label - left - right" pattern
    const lis = block.querySelectorAll('li');
    if (lis.length) {
      lis.forEach((li) => {
        const parts = li.textContent.split(/\s*[-–—:]\s*/);
        if (parts.length >= 3) {
          specs.push({ label: parts[0].trim(), leftValue: parts[1].trim(), rightValue: parts[2].trim() });
        }
      });
    }
  }

  // If model has comparisonItems array, prefer those
  if (model && Array.isArray(model.comparisonItems)) {
    model.comparisonItems.forEach((it) => {
      if (it && (it.label || it.leftValue || it.rightValue)) {
        specs.push({ label: it.label || '', leftValue: it.leftValue || '', rightValue: it.rightValue || '' });
      }
    });
  }

  // Build DOM structure expected by CSS
  block.innerHTML = ''; // clear existing content, we'll rebuild

  // Title
  const titleEl = document.createElement('div');
  titleEl.className = 'comparison-title';
  titleEl.textContent = titleText;
  block.appendChild(titleEl);

  // Main row
  const row = document.createElement('div');
  row.className = 'comparison-row';

  // Left image
  const leftCol = document.createElement('div');
  leftCol.className = 'comparison-image left';
  if (leftSrc) {
    const imgL = document.createElement('img');
    imgL.src = leftSrc;
    imgL.alt = (model && model.leftAlt) || 'Left image';
    leftCol.appendChild(imgL);
  }
  row.appendChild(leftCol);

  // Center content
  const center = document.createElement('div');
  center.className = 'comparison-center';

  // Vehicle titles row (can be empty placeholders if not available)
  const vehicleTitles = document.createElement('div');
  vehicleTitles.className = 'vehicle-titles';
  const vtLeft = document.createElement('div');
  vtLeft.className = 'vehicle-title left';
  vtLeft.textContent = (model && model.leftTitle) || '';
  const vtSpacer = document.createElement('div');
  const vtRight = document.createElement('div');
  vtRight.className = 'vehicle-title right';
  vtRight.textContent = (model && model.rightTitle) || '';
  vehicleTitles.appendChild(vtLeft);
  vehicleTitles.appendChild(vtSpacer);
  vehicleTitles.appendChild(vtRight);
  center.appendChild(vehicleTitles);

  // Description
  if (descriptionHTML) {
    const desc = document.createElement('div');
    desc.className = 'comparison-description';
    desc.innerHTML = descriptionHTML;
    center.appendChild(desc);
  }

  // Specs list (if any)
  if (specs.length) {
    const specsWrap = document.createElement('div');
    specsWrap.className = 'comparison-specs';
    specs.forEach((s) => {
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
    center.appendChild(specsWrap);
  }

  row.appendChild(center);

  // Right image
  const rightCol = document.createElement('div');
  rightCol.className = 'comparison-image right';
  if (rightSrc) {
    const imgR = document.createElement('img');
    imgR.src = rightSrc;
    imgR.alt = (model && model.rightAlt) || 'Right image';
    rightCol.appendChild(imgR);
  }
  row.appendChild(rightCol);

  block.appendChild(row);
}
