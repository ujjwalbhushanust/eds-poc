export default function decorate(block) {
  console.log(block);
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
  const content = (model.content && typeof model.content === 'object') ? model.content : {
    title: model.comparison_title || model.title || '',
    descriptionHTML: model.descriptionHTML || model.comparison_description || '',
  };

  const leftVehicle = (model.leftVehicle && typeof model.leftVehicle === 'object')
    ? model.leftVehicle
    : {
      title: model.comparison_leftTitle || model.leftTitle || model.left_name || '',
      image: model.comparison_leftImage || model.leftImage || '',
      alt: model.leftAlt || '',
    };

  const rightVehicle = (model.rightVehicle && typeof model.rightVehicle === 'object')
    ? model.rightVehicle
    : {
      title: model.comparison_rightTitle || model.rightTitle || model.right_name || '',
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
    ? specs.map((s) => {
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
    }).join('')
    : '';

  const resolvedLeft = resolveImage(leftVehicle.image);
  const resolvedRight = resolveImage(rightVehicle.image);

  // Render grid directly inside the existing block (no nested .comparison block)
  block.innerHTML = `
    <h2 class="comparison-title">${content.title || 'Compare Models'}</h2>
    <div class="comparison-grid">
      <div class="bike-column left">
        <h3 class="bike-title left">${leftVehicle.title || ''}</h3>
        ${resolvedLeft ? `<img src="${resolvedLeft}" alt="${leftVehicle.alt || leftVehicle.title || ''}" />` : ''}
      </div>

      <div class="specs-column">
        ${specsHtml || `
          <div class="spec-row">
            <div class="left-value"></div>
            <div class="label">No specifications available</div>
            <div class="right-value"></div>
          </div>
        `}
      </div>

      <div class="bike-column right">
        <h3 class="bike-title right">${rightVehicle.title || ''}</h3>
        ${resolvedRight ? `<img src="${resolvedRight}" alt="${rightVehicle.alt || rightVehicle.title || ''}" />` : ''}
      </div>
    </div>
  `;
}
