import {
  div,
  span,
  a,
  h2,
  i,
} from '../../scripts/dom-helpers.js';

export default function decorate(block) {
  const props = Array.from(block.children).map((ele) => ele.children);
  const containerDetails = props[0][0].querySelectorAll('p');
  // const headingType = containerDetails[1].textContent;
  const specsDetails = props.slice(1);
  block.innerHTML = '';
  block.append(
    h2({ class: 'block-heading' }, containerDetails[0].textContent),
    div(
      { class: 'specifications-wrapper' },

      div({ class: 'specs-header' }),
    ),
  );
  const bikeBannerImage = containerDetails[2].querySelector('picture');
  const specs = block.querySelector('.specs-header');
  specs.innerHTML = '';
  const specsBody = div({ class: 'specs-body' });
  specsDetails.forEach((prop, idx) => {
    const paragraphs = prop[0].querySelectorAll('p');
    const firstP = paragraphs[0];
    const secondP = paragraphs[1];
    let classList = '';
    let articleClassList = '';
    if (idx === 0) {
      classList = 'spec-item active';
      articleClassList = 'specs-article active';
    } else {
      classList = 'spec-item';
      articleClassList = 'specs-article';
    }
    const specsArticle = div({
      class: articleClassList,
      id: secondP.textContent.toLowerCase(),
    });
    specsArticle.innerHTML = '';
    const specsContent = div({
      class: 'specs-main',
    });
    specsContent.innerHTML = '';
    const specItem = div(
      { class: classList },
      a(
        { href: secondP.textContent.toLowerCase() },
        i({ class: `spec-icon hero-icon ${firstP.textContent}` }),
        div({ class: 'spec-title' }, secondP.textContent),
      ),
    );
    specs.append(specItem);
    if (containerDetails[3]) {
      const moreWrapper = div({ class: 'more-info-wrapper' });
      const downloadLink = a(
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
      moreWrapper.append(downloadLink, shareLink);
      specsArticle.append(moreWrapper);
    }
    Array.from(prop)
      .slice(1)
      .forEach((child, index) => {
        const classes = ['specs-image', 'specs-text'];
        specsContent.append(div({ class: classes[index] }, child));
      });

    if (bikeBannerImage) {
      specsContent.append(
        div({ class: 'bike-banner' }, bikeBannerImage.cloneNode(true)),
      );
    }

    specsArticle.append(specsContent);
    specsBody.append(specsArticle);
  });

  const specsWrapper = block.querySelector('.specifications-wrapper');
  specsWrapper.append(specsBody);

  // Get all spec items (tabs)
  const specItems = block.querySelectorAll('.spec-item a');
  // Get all spec articles (content sections)
  // const specArticles = block.querySelectorAll('.specs-article');

  specItems.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();

      // 1️⃣ Remove active from all items and articles
      block
        .querySelectorAll('.spec-item')
        .forEach((item) => item.classList.remove('active'));
      block
        .querySelectorAll('.specs-article')
        .forEach((article) => article.classList.remove('active'));

      // 2️⃣ Add active to clicked item
      const clickedItem = link.closest('.spec-item');
      clickedItem.classList.add('active');

      // 3️⃣ Find matching article via href (id reference)
      const targetId = link.getAttribute('href');
      const targetArticle = block.querySelector(`.specs-article#${targetId}`);

      if (targetArticle) {
        targetArticle.classList.add('active');
      }
    });
  });
}
