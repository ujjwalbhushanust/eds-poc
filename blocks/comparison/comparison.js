export default function decorate(block) {
  // small DOM helper factory (similar to dom-helpers.js used in reference)
  const el = (tag, attrs, ...children) => {
    const node = document.createElement(tag);
    if (attrs) {
      if (typeof attrs === "string") node.className = attrs;
      else {
        Object.keys(attrs).forEach((k) => {
          if (k === "class") node.className = attrs[k];
          else if (k === "html") node.innerHTML = attrs[k];
          else node.setAttribute(k, attrs[k]);
        });
      }
    }
    children.flat().forEach((c) => {
      if (c == null) return;
      if (typeof c === "string") node.appendChild(document.createTextNode(c));
      else node.appendChild(c);
    });
    return node;
  };
  const div = (a, ...c) => el("div", a, ...c);
  const h2 = (a, ...c) => el("h2", a, ...c);
  const img = (a) => {
    const n = document.createElement("img");
    if (a) {
      if (a.src) n.src = a.src;
      if (a.alt) n.alt = a.alt;
      if (a.class) n.className = a.class;
    }
    return n;
  };

  block.classList.add("block", "comparison");

  // read model data (Franklin runtime)
  const model = (window.getBlockData && window.getBlockData(block)) || {};

  // fallback: try to parse existing markup if model is empty
  const fromMarkup = () => {
    const heading = block.querySelector("h1,h2,h3,h4,h5,h6");
    const imgs = Array.from(block.querySelectorAll("img"));
    return {
      title: (heading && heading.textContent.trim()) || "",
      leftImage: imgs[0] && imgs[0].src,
      rightImage: imgs[1] && imgs[1].src,
    };
  };

  const data = { ...fromMarkup(), ...(model || {}) };

  // collect specs: prefer model.specs (array), else check children for spec items
  let specs = [];
  if (Array.isArray(data.specs) && data.specs.length) specs = data.specs;
  else {
    // try to read children as spec items: each child block with label/leftValue/rightValue
    const children = Array.from(
      block.querySelectorAll(":scope > div, :scope > section")
    );
    children.forEach((ch) => {
      const label = ch
        .querySelector(".label, .spec-label")
        ?.textContent?.trim();
      const left = ch.querySelector(".left, .left-value")?.textContent?.trim();
      const right = ch
        .querySelector(".right, .right-value")
        ?.textContent?.trim();
      if (label || left || right)
        specs.push({ label, leftValue: left, rightValue: right });
    });
  }

  // clear and build new DOM using helpers
  block.innerHTML = "";

  // title
  const titleEl = h2(
    { class: "comparison-title" },
    data.title || "COMPARE MODELS"
  );

  // left image
  const leftCol = div({ class: "comparison-image" });
  if (data.leftImage) {
    leftCol.appendChild(
      img({
        src: data.leftImage,
        alt: data.leftAlt || data.leftTitle || "Left image",
      })
    );
  }

  // right image
  const rightCol = div({ class: "comparison-image" });
  if (data.rightImage) {
    rightCol.appendChild(
      img({
        src: data.rightImage,
        alt: data.rightAlt || data.rightTitle || "Right image",
      })
    );
  }

  // center content
  const vehicleTitles = div(
    { class: "vehicle-titles" },
    div({ class: "comparison-vehicle-title left" }, data.leftTitle || "Left"),
    div(),
    div({ class: "comparison-vehicle-title right" }, data.rightTitle || "Right")
  );

  const description =
    data.product_descriptionHTML || data.descriptionHTML || "";
  const descEl = description
    ? div({ class: "comparison-description", html: description })
    : null;

  // specs container
  const specsWrap = div({ class: "comparison-specs" });

  specs.forEach((s) => {
    const row = div(
      { class: "comparison-spec-row" },
      div(
        { class: "left-cell" },
        div(
          { class: "comparison-value left-value" },
          s.leftValue || s.left || ""
        )
      ),
      div({ class: "label-cell" }, div({ class: "spec-label" }, s.label || "")),
      div(
        { class: "right-cell" },
        div(
          { class: "comparison-value right-value" },
          s.rightValue || s.right || ""
        )
      )
    );
    specsWrap.appendChild(row);
  });

  const center = div(
    { class: "comparison-content" },
    vehicleTitles,
    descEl,
    specsWrap
  );

  const row = div({ class: "comparison-row" }, leftCol, center, rightCol);

  block.appendChild(titleEl);
  block.appendChild(row);
}
