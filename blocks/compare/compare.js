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

  const title = document.createElement('h2');
  title.className = 'compare-title';
  title.textContent = getField(
    data,
    ['compare-title', 'compare_title', 'compareTitle'],
    'Compare Bikes',
  );

  const container = document.createElement('div');
  container.className = 'compare-container';

  // Left bike section
  const leftSection = document.createElement('div');
  leftSection.className = 'bike left';

  const leftImg = document.createElement('img');
  leftImg.src = getField(data, [
    'left-bike-image',
    'left_bike_image',
    'leftBikeImage',
  ]);
  leftImg.alt = getField(data, [
    'left-bike-name',
    'left_bike_name',
    'leftBikeName',
  ]);

  const leftName = document.createElement('h3');
  leftName.textContent = getField(data, [
    'left-bike-name',
    'left_bike_name',
    'leftBikeName',
  ]);

  leftSection.append(leftImg, leftName);

  // Right bike section
  const rightSection = document.createElement('div');
  rightSection.className = 'bike right';

  const rightImg = document.createElement('img');
  rightImg.src = getField(data, [
    'right-bike-image',
    'right_bike_image',
    'rightBikeImage',
  ]);
  rightImg.alt = getField(data, [
    'right-bike-name',
    'right_bike_name',
    'rightBikeName',
  ]);

  const rightName = document.createElement('h3');
  rightName.textContent = getField(data, [
    'right-bike-name',
    'right_bike_name',
    'rightBikeName',
  ]);

  rightSection.append(rightImg, rightName);

  // Specs table
  const specsTable = document.createElement('table');
  specsTable.className = 'bike-specs';

  const specs = data.children || []; // repeatable child specs
  specs.forEach((spec) => {
    const row = document.createElement('tr');

    const label = document.createElement('td');
    label.textContent = getField(spec, [
      'spec-label',
      'spec_label',
      'specLabel',
    ]);

    const leftValue = document.createElement('td');
    leftValue.textContent = getField(spec, [
      'left-bike-value',
      'left_bike_value',
      'leftBikeValue',
    ]);

    const rightValue = document.createElement('td');
    rightValue.textContent = getField(spec, [
      'right-bike-value',
      'right_bike_value',
      'rightBikeValue',
    ]);

    row.append(label, leftValue, rightValue);
    specsTable.appendChild(row);
  });

  container.append(leftSection, specsTable, rightSection);
  block.append(title, container);
}
