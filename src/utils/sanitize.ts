const ALLOWED_TAGS = new Set(["A", "B", "BR", "EM", "I", "P", "SPAN", "STRONG", "U"]);
const DROP_WITH_CONTENT = new Set(["SCRIPT", "STYLE", "IFRAME", "OBJECT", "EMBED"]);

const FONT_SIZE_BY_LEGACY_VALUE: Record<string, string> = {
  "1": "10px",
  "2": "12px",
  "3": "14px",
  "4": "16px",
  "5": "18px",
  "6": "22px",
  "7": "26px",
};

const INLINE_LINK_STYLE = "color:#8A937E;text-decoration:underline;";

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function escapeAttribute(value: string) {
  return escapeHtml(value).replace(/`/g, "&#96;");
}

export function safeUrl(value: string | undefined, fallback = "#") {
  const trimmed = (value ?? "").trim();

  if (!trimmed) {
    return fallback;
  }

  if (/^\{\{[a-zA-Z0-9_]+\}\}$/.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.startsWith("#")) {
    return trimmed;
  }

  if (!/^(https?:|mailto:|tel:)/i.test(trimmed)) {
    return fallback;
  }

  try {
    const parsed = new URL(trimmed);
    if (["http:", "https:", "mailto:", "tel:"].includes(parsed.protocol)) {
      return trimmed;
    }
  } catch {
    return fallback;
  }

  return fallback;
}

export function normalizeBodyLinkUrl(value: string | undefined) {
  const trimmed = (value ?? "").trim();

  if (!trimmed) {
    return "";
  }

  if (trimmed.startsWith("#")) {
    return trimmed;
  }

  const candidate = /^[a-z][a-z0-9+.-]*:/i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const parsed = new URL(candidate);
    if (["http:", "https:", "mailto:", "tel:"].includes(parsed.protocol)) {
      return candidate;
    }
  } catch {
    return "";
  }

  return "";
}

export function safeHostedImageUrl(value: string | undefined, fallback: string) {
  const trimmed = (value ?? "").trim();
  if (!trimmed) {
    return fallback;
  }

  if (!/^https?:\/\//i.test(trimmed)) {
    return fallback;
  }

  try {
    const parsed = new URL(trimmed);
    if (["http:", "https:"].includes(parsed.protocol)) {
      return trimmed;
    }
  } catch {
    return fallback;
  }

  return fallback;
}

function fontSizeFromStyle(style: string | null) {
  if (!style) {
    return "";
  }

  const match = /font-size\s*:\s*([0-9.]+(?:px|em|rem|%))/i.exec(style);
  return match ? match[1] : "";
}

function cleanNode(node: Node): Node | null {
  if (node.nodeType === Node.TEXT_NODE) {
    return document.createTextNode(node.textContent ?? "");
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return null;
  }

  const element = node as HTMLElement;
  const tag = element.tagName.toUpperCase();

  if (DROP_WITH_CONTENT.has(tag)) {
    return null;
  }

  if (tag === "FONT") {
    const span = document.createElement("span");
    const size = element.getAttribute("size");
    const mappedSize = size ? FONT_SIZE_BY_LEGACY_VALUE[size] : "";
    if (mappedSize) {
      span.setAttribute("style", `font-size:${mappedSize};`);
    }
    Array.from(element.childNodes).forEach((child) => {
      const cleaned = cleanNode(child);
      if (cleaned) {
        span.appendChild(cleaned);
      }
    });
    return span;
  }

  if (!ALLOWED_TAGS.has(tag)) {
    const fragment = document.createDocumentFragment();
    Array.from(element.childNodes).forEach((child) => {
      const cleaned = cleanNode(child);
      if (cleaned) {
        fragment.appendChild(cleaned);
      }
    });
    return fragment;
  }

  if (tag === "A") {
    const href = normalizeBodyLinkUrl(element.getAttribute("href") ?? "");
    if (!href) {
      const fragment = document.createDocumentFragment();
      Array.from(element.childNodes).forEach((child) => {
        const cleaned = cleanNode(child);
        if (cleaned) {
          fragment.appendChild(cleaned);
        }
      });
      return fragment;
    }
  }

  const cleanedElement = document.createElement(tag.toLowerCase());

  if (tag === "A") {
    cleanedElement.setAttribute("href", normalizeBodyLinkUrl(element.getAttribute("href") ?? ""));
    cleanedElement.setAttribute("style", INLINE_LINK_STYLE);
    if (element.getAttribute("target") === "_blank") {
      cleanedElement.setAttribute("target", "_blank");
      cleanedElement.setAttribute("rel", "noopener noreferrer");
    }
  }

  if (tag === "SPAN") {
    const fontSize = fontSizeFromStyle(element.getAttribute("style"));
    if (fontSize) {
      cleanedElement.setAttribute("style", `font-size:${fontSize};`);
    }
  }

  Array.from(element.childNodes).forEach((child) => {
    const cleaned = cleanNode(child);
    if (cleaned) {
      cleanedElement.appendChild(cleaned);
    }
  });

  return cleanedElement;
}

function unwrapParagraphs(html: string) {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = html;

  Array.from(wrapper.querySelectorAll("p")).forEach((paragraph) => {
    const fragment = document.createDocumentFragment();
    while (paragraph.firstChild) {
      fragment.appendChild(paragraph.firstChild);
    }
    if (paragraph.nextSibling) {
      fragment.appendChild(document.createElement("br"));
    }
    paragraph.replaceWith(fragment);
  });

  return wrapper.innerHTML.replace(/(\s*<br>\s*)+$/i, "");
}

export function sanitizeRichHtml(html: string, options: { inline?: boolean } = {}) {
  const template = document.createElement("template");
  template.innerHTML = html;

  const output = document.createElement("div");
  Array.from(template.content.childNodes).forEach((child) => {
    const cleaned = cleanNode(child);
    if (cleaned) {
      output.appendChild(cleaned);
    }
  });

  return options.inline ? unwrapParagraphs(output.innerHTML) : output.innerHTML;
}

export function plainTextFromHtml(html: string) {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = sanitizeRichHtml(html, { inline: true });
  return (wrapper.textContent ?? "").replace(/\s+/g, " ").trim();
}

export function plainTextToHtml(text: string) {
  return escapeHtml(text).replace(/\r?\n/g, "<br>");
}
