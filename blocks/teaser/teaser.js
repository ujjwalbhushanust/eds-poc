/* /blocks/teaser/teaser.js */

/**
 * Block options are applied as classes to the block's DOM element
 * alongside the `block` and `<block-name>` classes.
 *
 * @param {HTMLElement} block represents the block's DOM element/tree
 */
function getOptions(block) {
  // Get the block's classes, excluding 'block' and 'teaser'.
  return [...block.classList].filter((c) => !['block', 'teaser'].includes(c));
}

/**
 * Adds a zoom effect to the image using event listeners.
 *
 * When the CTA button is hovered over, the image zooms in.
 *
 * @param {HTMLElement} block represents the block's DOM tree
 */
function addEventListeners(block) {
  const img = block.querySelector('.image');
  const btn = block.querySelector('.content .button') || block.querySelector('.button');

  if (!btn || !img) return; // guard - don't attach if either is missing

  btn.addEventListener('mouseover', () => {
    img.classList.add('zoom');
  });

  btn.addEventListener('mouseout', () => {
    img.classList.remove('zoom');
  });
}

/**
 * Entry point to the block's JavaScript.
 * Must be exported as default and accept a block's DOM element.
 * This function is called by the project's style.js, passing the block's element.
 *
 * @param {HTMLElement} block represents the block's DOM element/tree
 */
export default function decorate(block) {
  /* Common treatments for all options */
  const options = getOptions(block);

  const lastDiv = block.querySelector(':scope > div:last-child');
  if (lastDiv) lastDiv.classList.add('content');

  const heading = block.querySelector('h1,h2,h3,h4,h5,h6');
  if (heading) heading.classList.add('title');

  const img = block.querySelector('img');
  if (img) img.classList.add('image');

  // Process each paragraph and mark it as text or terms-and-conditions
  block.querySelectorAll('p').forEach((p) => {
    const innerHTML = p.innerHTML?.trim();
    if (innerHTML?.startsWith('Terms and conditions:')) {
      p.classList.add('terms-and-conditions');
    }
  });

  /* Conditional treatments for specific options */
  if (options.includes('side-by-side')) {
    /* For side-by-side teaser, add the image-wrapper to a higher-level div to support CSS */
    const firstDiv = block.querySelector(':scope > div:first-child');
    if (firstDiv) firstDiv.classList.add('image-wrapper');
  } else if (options.length === 0) {
    /* For the default option, add the image-wrapper to the picture element to support CSS */
    const picture = block.querySelector('picture');
    if (picture) picture.classList.add('image-wrapper');
  }

  addEventListeners(block);
}
