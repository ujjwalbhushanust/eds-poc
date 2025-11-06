export default function decorate(block) {
  const data = window.getBlockData(block); // provided by Franklin runtime

  const title = document.createElement('h2');
  title.className = 'compare-title';
  title.textContent = data.compare_title || 'Compare Bikes';

  const container = document.createElement('div');
  container.className = 'compare-container';

  // Left bike section
  const leftSection = document.createElement('div');
  leftSection.className = 'bike left';

  const leftImg = document.createElement('img');
  leftImg.src = data.left_bike_image;
  leftImg.alt = data.left_bike_name;

  const leftName = document.createElement('h3');
  leftName.textContent = data.left_bike_name;

  leftSection.append(leftImg, leftName);

  // Right bike section
  const rightSection = document.createElement('div');
  rightSection.className = 'bike right';

  const rightImg = document.createElement('img');
  rightImg.src = data.right_bike_image;
  rightImg.alt = data.right_bike_name;

  const rightName = document.createElement('h3');
  rightName.textContent = data.right_bike_name;

  rightSection.append(rightImg, rightName);

  // Specs table
  const specsTable = document.createElement('table');
  specsTable.className = 'bike-specs';

  const specs = data.children || []; // repeatable child specs
  specs.forEach((spec) => {
    const row = document.createElement('tr');

    const label = document.createElement('td');
    label.textContent = spec.spec_label;

    const leftValue = document.createElement('td');
    leftValue.textContent = spec.left_bike_value;

    const rightValue = document.createElement('td');
    rightValue.textContent = spec.right_bike_value;

    row.append(label, leftValue, rightValue);
    specsTable.appendChild(row);
  });

  container.append(leftSection, specsTable, rightSection);
  block.append(title, container);
}
