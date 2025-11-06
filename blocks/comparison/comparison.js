export default function decorate(block) {
  const model = (window.getBlockData && window.getBlockData(block)) || {};

  const title = model.comparison_title || 'Compare Models';
  const leftTitle = model.comparison_leftTitle || 'Left Model';
  const rightTitle = model.comparison_rightTitle || 'Right Model';
  const leftImage = model.comparison_leftImage
    || 'https://via.placeholder.com/360x360?text=Left';
  const rightImage = model.comparison_rightImage
    || 'https://via.placeholder.com/360x360?text=Right';
  const specs = Array.isArray(model.comparison_specs)
    ? model.comparison_specs
    : [];

  block.innerHTML = `
    <div class="comparison-container">
      <h2 class="comparison-title">${title}</h2>
      <div class="comparison-grid">
        <div class="bike-column left">
          <h3 class="bike-title left">${leftTitle}</h3>
          <img src="${leftImage}" alt="${leftTitle}" />
        </div>

        <div class="specs-column">
          ${specs
    .map(
      (s) => `
              <div class="spec-row">
                <div class="left-value">${s.spec_leftValue || ''}</div>
                <div class="label">${s.spec_label || ''}</div>
                <div class="right-value">${s.spec_rightValue || ''}</div>
              </div>`,
    )
    .join('')}
        </div>

        <div class="bike-column right">
          <h3 class="bike-title right">${rightTitle}</h3>
          <img src="${rightImage}" alt="${rightTitle}" />
        </div>
      </div>
    </div>
  `;
}
