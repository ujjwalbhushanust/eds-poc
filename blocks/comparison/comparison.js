export default function decorate(block) {
  // Small DOM helpers, mirroring the reference code style
  const el = (tag, attrs, ...children) => {
    const node = document.createElement(tag);
    if (attrs) {
      if (typeof attrs === 'string') node.className = attrs;
      else {
        Object.keys(attrs).forEach((k) => {
          if (k === 'class') node.className = attrs[k];
          else if (k === 'html') node.innerHTML = attrs[k];
          else node.setAttribute(k, attrs[k]);
        });
      }
    }
    children.flat().forEach((c) => {
      if (c == null) return;
      if (typeof c === 'string') node.appendChild(document.createTextNode(c));
      else node.appendChild(c);
    });
    return node;
  };
  const div = (a, ...c) => el('div', a, ...c);
  const span = (a, ...c) => el('span', a, ...c);
  const a$ = (a, ...c) => el('a', a, ...c);
  const h2 = (a, ...c) => el('h2', a, ...c);
  const i = (a, ...c) => el('i', a, ...c);

  // Read the current block children to transform authoring markup
  const props = Array.from(block.children).map((ele) => ele.children);
  const containerDetails = props[0] && props[0][0]
    ? Array.from(props[0][0].querySelectorAll('p'))
    : [];
  const specsDetails = props.slice(1);

  // Clear the block and build the tabbed UI like the reference
  block.innerHTML = '';

  // Title (use first paragraph in containerDetails if available)
  const titleText = (containerDetails[0] && containerDetails[0].textContent.trim())
    || 'COMPARE MODELS';

  block.append(
    h2({ class: 'comparison-title' }, titleText),
    div({ class: 'specifications-wrapper' }, div({ class: 'specs-header' })),
  );

  const bikeBannerImage = containerDetails[2] && containerDetails[2].querySelector
    ? containerDetails[2].querySelector('picture')
    : null;

  const specsHeader = block.querySelector('.specs-header');
  specsHeader.innerHTML = '';
  const specsBody = div({ class: 'specs-body' });

  // Build spec tabs from authored props (each prop represents a spec item)
  specsDetails.forEach((prop, idx) => {
    const paragraphs = prop[0] ? Array.from(prop[0].querySelectorAll('p')) : [];
    const firstP = paragraphs[0] || { textContent: '' };
    const secondP = paragraphs[1] || { textContent: `spec-${idx}` };

    const classList = idx === 0 ? 'spec-item active' : 'spec-item';
    const articleClassList = idx === 0 ? 'specs-article active' : 'specs-article';

    const specId = secondP.textContent
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-');

    const specsArticle = div({ class: articleClassList, id: specId });
    const specsContent = div({ class: 'specs-main' });

    const specItem = div(
      { class: classList },
      a$(
        { href: specId },
        i({ class: `spec-icon hero-icon ${firstP.textContent.trim()}` }),
        div({ class: 'spec-title' }, secondP.textContent.trim()),
      ),
    );

    specsHeader.appendChild(specItem);

    // optional download/share
    if (containerDetails[3] && containerDetails[3].href) {
      const moreWrapper = div({ class: 'more-info-wrapper' });
      const downloadLink = a$(
        {
          href: containerDetails[3].href,
          target: '_blank',
          rel: 'noopener noreferrer',
        },
        'Download Brochure',
        span({ class: 'hero-icon download-icon' }),
      );
      const shareLink = span({
        class: 'share-link hero-icon share-icon',
        tabindex: '0',
        title: 'Share this link',
      });
      moreWrapper.appendChild(downloadLink);
      moreWrapper.appendChild(shareLink);
      specsArticle.appendChild(moreWrapper);
    }

    // append authored content (image/text blocks) into the article
    Array.from(prop)
      .slice(1)
      .forEach((child, index) => {
        const classes = ['specs-image', 'specs-text'];
        specsContent.appendChild(
          div({ class: classes[index] }, child.cloneNode(true)),
        );
      });

    if (bikeBannerImage) {
      specsContent.appendChild(
        div({ class: 'bike-banner' }, bikeBannerImage.cloneNode(true)),
      );
    }

    specsArticle.appendChild(specsContent);
    specsBody.appendChild(specsArticle);
  });

  // Put the specs body into the wrapper
  const specsWrapper = block.querySelector('.specifications-wrapper');
  specsWrapper.appendChild(specsBody);

  // Wire up tab click behaviour
  const specItems = block.querySelectorAll('.spec-item a');
  specItems.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      // remove active
      block
        .querySelectorAll('.spec-item')
        .forEach((it) => it.classList.remove('active'));
      block
        .querySelectorAll('.specs-article')
        .forEach((art) => art.classList.remove('active'));
      // activate clicked
      const clickedItem = link.closest('.spec-item');
      if (clickedItem) clickedItem.classList.add('active');
      const targetId = link.getAttribute('href');
      const targetArticle = block.querySelector(`.specs-article#${targetId}`);
      if (targetArticle) targetArticle.classList.add('active');
    });
  });
}
