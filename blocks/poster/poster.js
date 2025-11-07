export default function decorate(block) {
  block.classList.add('block', 'poster');

  // Get authored fields using data-model-key selectors
  const get = (name) => {
    const el = block.querySelector(`[data-model-key="${name}"]`);
    return el ? el.textContent.trim() : '';
  };
  const getImg = (name) => {
    const el = block.querySelector(`[data-model-key="${name}"] img, [data-model-key="${name}"] picture img`);
    return el ? { src: el.currentSrc || el.src, alt: el.alt || '' } : { src: '', alt: '' };
  };

  const image = getImg('image');
  const imageAlt = get('imageAlt') || image.alt || '';
  const title = get('content_title');
  const descriptionHTML = get('content_descriptionHTML');

  block.innerHTML = '';

  // Image at top
  if (image.src) {
    const img = document.createElement('img');
    img.className = 'poster-image';
    img.src = image.src;
    img.alt = imageAlt;
    block.appendChild(img);
  }

  // Title
  if (title) {
    const titleEl = document.createElement('h3');
    titleEl.className = 'poster-title';
    titleEl.textContent = title;
    block.appendChild(titleEl);
  }

  // Description
  if (descriptionHTML) {
    const desc = document.createElement('div');
    desc.className = 'poster-description';
    desc.innerHTML = descriptionHTML;
    block.appendChild(desc);
  }
}
