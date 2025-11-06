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
  const modelProductFromItems = Array.isArray(model && model.items)
    ? model.items.find((it) => it && it.model === 'product')
    : null;
  const product = model && (model.product || modelProductFromItems);

  const title = (model && model.title)
    || (product && (product.product_title || product.title))
    || (heading && heading.textContent.trim())
    || 'Compare models';

  const imgs = Array.from(block.querySelectorAll('img'));
  const leftSrc = (model && model.leftImage)
    || (product && (product.product_leftImage || product.leftImage))
    || (imgs[0] && imgs[0].src)
    || '';
  const rightSrc = (model && model.rightImage)
    || (product && (product.product_rightImage || product.rightImage))
    || (imgs[1] && imgs[1].src)
    || (imgs[0] && imgs[0].src)
    || '';

  // static spec rows (match screenshot)
  const staticSpecs = [
    { label: 'Fuel Tank Capacity', left: '9.8 Litre', right: '9.6 Litre' },
    { label: 'Height (mm)', left: '1052', right: '1045' },
    { label: 'Length (mm)', left: '2000', right: '1965' },
    {
      label: 'Adjustable Hydraulic Shock Absorbers',
      left: '5-step',
      right: '2-step',
    },
    { label: 'Colour/Graphic Options', left: '11', right: '5' },
  ];

  // rebuild DOM
  block.innerHTML = '';

  const titleEl = document.createElement('div');
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
    imgL.alt = (model && model.leftAlt) || 'Left image';
    leftCol.appendChild(imgL);
  }
  row.appendChild(leftCol);

  // center content
  const center = document.createElement('div');
  // match CSS which targets .comparison-content
  center.className = 'comparison-content';

  // vehicle titles (static colored headings)
  const vehicleTitles = document.createElement('div');
  vehicleTitles.className = 'vehicle-titles';
  const vtLeft = document.createElement('div');
  // CSS expects .comparison-vehicle-title for accent styles
  vtLeft.className = 'comparison-vehicle-title left';
  const leftTitleText = (model && model.leftTitle)
    || (product && (product.product_leftTitle || product.leftTitle))
    || 'SPLENDOR+';
  vtLeft.textContent = leftTitleText;
  const vtSpacer = document.createElement('div');
  const vtRight = document.createElement('div');
  vtRight.className = 'comparison-vehicle-title right';
  const rightTitleText = (model && model.rightTitle)
    || (product && (product.product_rightTitle || product.rightTitle))
    || 'HF DELUXE';
  vtRight.textContent = rightTitleText;
  vehicleTitles.appendChild(vtLeft);
  vehicleTitles.appendChild(vtSpacer);
  vehicleTitles.appendChild(vtRight);
  center.appendChild(vehicleTitles);

  // specs
  const specsWrap = document.createElement('div');
  specsWrap.className = 'comparison-specs';
  staticSpecs.forEach((s) => {
    const rowEl = document.createElement('div');
    rowEl.className = 'comparison-spec-row';

    const leftCell = document.createElement('div');
    leftCell.className = 'left-cell';
    const leftVal = document.createElement('div');
    // add comparison-value class so CSS accent selectors match
    leftVal.className = 'comparison-value left-value';
    leftVal.textContent = s.left;
    leftCell.appendChild(leftVal);

    const labelCell = document.createElement('div');
    labelCell.className = 'label-cell';
    const lbl = document.createElement('div');
    lbl.className = 'spec-label';
    lbl.textContent = s.label;
    labelCell.appendChild(lbl);

    const rightCell = document.createElement('div');
    rightCell.className = 'right-cell';
    const rightVal = document.createElement('div');
    rightVal.className = 'comparison-value right-value';
    rightVal.textContent = s.right;
    rightCell.appendChild(rightVal);

    rowEl.appendChild(leftCell);
    rowEl.appendChild(labelCell);
    rowEl.appendChild(rightCell);
    specsWrap.appendChild(rowEl);
  });
  center.appendChild(specsWrap);

  // optional: render description from model if provided
  // description may live on the product item or on the block model
  const descriptionHTML = (model && model.descriptionHTML)
    || (product && (product.product_descriptionHTML || product.descriptionHTML))
    || '';
  if (descriptionHTML) {
    const desc = document.createElement('div');
    desc.className = 'comparison-description';
    desc.innerHTML = descriptionHTML;
    center.appendChild(desc);
  }

  // optional: render additional specs from model if present (array of {label,leftValue,rightValue})
  const extraSpecs = (model && Array.isArray(model.specs) && model.specs) || [];
  if (extraSpecs.length) {
    // append to the existing specsWrap
    extraSpecs.forEach((s) => {
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
  }

  row.appendChild(center);

  // right image
  const rightCol = document.createElement('div');
  rightCol.className = 'comparison-image';
  if (rightSrc) {
    const imgR = document.createElement('img');
    imgR.src = rightSrc;
    imgR.alt = (model && model.rightAlt) || 'Right image';
    rightCol.appendChild(imgR);
  }
  row.appendChild(rightCol);

  block.appendChild(row);
}
