export default function decorate(block) {
  const data = window.getBlockData(block); // provided by Franklin runtime

  // helper: try multiple candidate keys for backward compatibility
  const getField = (obj, keys, fallback = '') => {
    for (let i = 0; i < keys.length; i += 1) {
      const k = keys[i];
      if (
        Object.prototype.hasOwnProperty.call(obj, k)
        && obj[k] !== undefined
        && obj[k] !== null
        && obj[k] !== ''
      ) return obj[k];
    }
    return fallback;
  };

  // Build DOM structure to match comparison.css selectors
  block.classList.add('comparison');

  const title = document.createElement('h2');
  title.className = 'comparison-title';
  title.textContent = getField(
    data,
    ['title', 'compare-title', 'compare_title', 'compareTitle'],
    'Compare Bikes',
  );

  const row = document.createElement('div');
  row.className = 'comparison-row';

  // Left image column
  const leftCol = document.createElement('div');
  leftCol.className = 'comparison-image';
  const leftImg = document.createElement('img');
  leftImg.src = getField(
    data,
    ['leftImage', 'left_image', 'leftImageUrl', 'product_leftImage'],
    '',
  );
  leftImg.alt = getField(
    data,
    ['leftTitle', 'left_title', 'product_leftAlt'],
    '',
  );
  leftCol.appendChild(leftImg);

  // Content column (titles + specs)
  const contentCol = document.createElement('div');
  contentCol.className = 'comparison-content';

  const vehicleTitles = document.createElement('div');
  vehicleTitles.className = 'vehicle-titles';

  const leftTitle = document.createElement('div');
  leftTitle.className = 'comparison-vehicle-title left';
  leftTitle.textContent = getField(
    data,
    ['leftTitle', 'left_title', 'product_leftTitle'],
    'Left',
  );

  const rightTitle = document.createElement('div');
  rightTitle.className = 'comparison-vehicle-title right';
  rightTitle.textContent = getField(
    data,
    ['rightTitle', 'right_title', 'product_rightTitle'],
    'Right',
  );

  vehicleTitles.append(leftTitle, rightTitle);

  const description = document.createElement('p');
  description.className = 'comparison-description';
  description.innerHTML = getField(
    data,
    ['description', 'product_descriptionHTML'],
    '',
  );

  // Specs list
  const specsContainer = document.createElement('div');
  specsContainer.className = 'comparison-specs';

  // Support two possible content shapes:
  // 1) Direct spec children: data.children = [ { label, leftValue, rightValue }, ... ]
  // 2) Grouped specs (legacy): data.children = [ { specs: [ {label,..}, ... ] }, ... ]
  const rawChildren = data.children || [];
  const specs = [];
  rawChildren.forEach((child) => {
    if (!child) return;
    // If this child has a 'specs' array (specGroup), flatten it
    if (Array.isArray(child.specs) && child.specs.length) {
      child.specs.forEach((s) => {
        if (s) specs.push(s);
      });
      return;
    }
    // If child itself looks like a spec (has label or left/right values), use it
    if (child.label || child.leftValue || child.rightValue) {
      specs.push(child);
    }
  });

  specs.forEach((spec) => {
    const rowSpec = document.createElement('div');
    rowSpec.className = 'comparison-spec-row';

    const leftCell = document.createElement('div');
    leftCell.className = 'left-cell comparison-value left-value';
    leftCell.textContent = getField(
      spec,
      ['leftValue', 'left_value', 'leftValueText', 'product_leftValue'],
      '',
    );

    const labelCell = document.createElement('div');
    labelCell.className = 'label-cell spec-label';
    labelCell.textContent = getField(
      spec,
      ['label', 'spec-label', 'spec_label', 'specLabel'],
      '',
    );

    const rightCell = document.createElement('div');
    rightCell.className = 'right-cell comparison-value right-value';
    rightCell.textContent = getField(
      spec,
      ['rightValue', 'right_value', 'rightValueText', 'product_rightValue'],
      '',
    );

    rowSpec.append(leftCell, labelCell, rightCell);
    specsContainer.append(rowSpec);
  });

  contentCol.append(vehicleTitles, description, specsContainer);

  // Right image column
  const rightCol = document.createElement('div');
  rightCol.className = 'comparison-image';
  const rightImg = document.createElement('img');
  rightImg.src = getField(
    data,
    ['rightImage', 'right_image', 'product_rightImage'],
    '',
  );
  rightImg.alt = getField(
    data,
    ['rightTitle', 'right_title', 'product_rightAlt'],
    '',
  );
  rightCol.appendChild(rightImg);

  row.append(leftCol, contentCol, rightCol);

  block.append(title, row);
}
