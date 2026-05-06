import { normalizeBodyLinkUrl } from "../utils/sanitize";

type RichTextToolbarProps = {
  activeElement: HTMLElement | null;
  activeLabel: string;
};

const LEGACY_FONT_SIZE = "7";
const INLINE_LINK_STYLE = "color:#8A937E;text-decoration:underline;";

function replaceLegacyFontTags(activeElement: HTMLElement, size: string) {
  activeElement.querySelectorAll("font[size]").forEach((font) => {
    const span = document.createElement("span");
    span.setAttribute("style", `font-size:${size};`);
    span.innerHTML = font.innerHTML;
    font.replaceWith(span);
  });
}

function fireInput(activeElement: HTMLElement) {
  activeElement.dispatchEvent(new Event("input", { bubbles: true }));
}

function rangeBelongsToElement(range: Range, activeElement: HTMLElement) {
  const container =
    range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE
      ? range.commonAncestorContainer
      : range.commonAncestorContainer.parentElement;

  return Boolean(container && activeElement.contains(container));
}

function getActiveRange(activeElement: HTMLElement) {
  const selection = window.getSelection();

  if (!selection || selection.rangeCount === 0) {
    return null;
  }

  const range = selection.getRangeAt(0);
  return rangeBelongsToElement(range, activeElement) ? range.cloneRange() : null;
}

function restoreRange(range: Range) {
  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
}

function linkFromNode(node: Node, activeElement: HTMLElement) {
  const element = node.nodeType === Node.ELEMENT_NODE ? (node as Element) : node.parentElement;
  const link = element?.closest("a");
  return link && activeElement.contains(link) ? (link as HTMLAnchorElement) : null;
}

function linkFromRange(range: Range, activeElement: HTMLElement) {
  return linkFromNode(range.startContainer, activeElement) || linkFromNode(range.endContainer, activeElement);
}

function applyInlineLinkStyle(activeElement: HTMLElement) {
  activeElement.querySelectorAll("a[href]").forEach((link) => {
    link.setAttribute("style", INLINE_LINK_STYLE);
    if (link.getAttribute("target") === "_blank") {
      link.setAttribute("rel", "noopener noreferrer");
    }
  });
}

function unwrapLink(link: HTMLAnchorElement) {
  const fragment = document.createDocumentFragment();
  while (link.firstChild) {
    fragment.appendChild(link.firstChild);
  }
  link.replaceWith(fragment);
}

export function RichTextToolbar({ activeElement, activeLabel }: RichTextToolbarProps) {
  const disabled = !activeElement;

  function run(command: string, value?: string) {
    if (!activeElement) {
      return;
    }

    activeElement.focus();
    document.execCommand(command, false, value);
    fireInput(activeElement);
  }

  function applyFontSize(size: string) {
    if (!activeElement || !size) {
      return;
    }

    activeElement.focus();
    document.execCommand("fontSize", false, LEGACY_FONT_SIZE);
    replaceLegacyFontTags(activeElement, size);
    fireInput(activeElement);
  }

  function createLink() {
    if (!activeElement) {
      return;
    }

    const range = getActiveRange(activeElement);
    const existingLink = range ? linkFromRange(range, activeElement) : null;

    if (!existingLink && (!range || !range.toString().trim())) {
      window.alert("Select text to add a link.");
      activeElement.focus();
      return;
    }

    const url = window.prompt("Link URL", existingLink?.getAttribute("href") || "https://");

    if (url === null) {
      activeElement.focus();
      return;
    }

    const normalizedUrl = normalizeBodyLinkUrl(url);
    if (!normalizedUrl) {
      window.alert("Enter a safe link, like https://example.com.");
      activeElement.focus();
      return;
    }

    activeElement.focus();

    if (existingLink) {
      existingLink.setAttribute("href", normalizedUrl);
      existingLink.setAttribute("style", INLINE_LINK_STYLE);
    } else if (range) {
      restoreRange(range);
      document.execCommand("createLink", false, normalizedUrl);
      applyInlineLinkStyle(activeElement);
    }

    fireInput(activeElement);
  }

  function removeLink() {
    if (!activeElement) {
      return;
    }

    const range = getActiveRange(activeElement);
    const existingLink = range ? linkFromRange(range, activeElement) : null;

    activeElement.focus();

    if (existingLink) {
      unwrapLink(existingLink);
      fireInput(activeElement);
      return;
    }

    if (range && range.toString().trim()) {
      restoreRange(range);
      document.execCommand("unlink");
      fireInput(activeElement);
      return;
    }

    window.alert("Select linked text to remove a link.");
  }

  function clearFormatting() {
    if (!activeElement) {
      return;
    }

    activeElement.focus();
    document.execCommand("removeFormat");
    document.execCommand("unlink");
    fireInput(activeElement);
  }

  return (
    <div className="rich-toolbar" aria-label="Rich text toolbar">
      <span className="toolbar-status">{activeLabel || "Select text"}</span>
      <button type="button" disabled={disabled} onMouseDown={(event) => event.preventDefault()} onClick={() => run("bold")} aria-label="Bold">
        B
      </button>
      <button type="button" disabled={disabled} onMouseDown={(event) => event.preventDefault()} onClick={() => run("italic")} aria-label="Italic">
        <i>I</i>
      </button>
      <button type="button" disabled={disabled} onMouseDown={(event) => event.preventDefault()} onClick={() => run("underline")} aria-label="Underline">
        <u>U</u>
      </button>
      <select
        disabled={disabled}
        aria-label="Font size"
        defaultValue=""
        onChange={(event) => {
          applyFontSize(event.currentTarget.value);
          event.currentTarget.value = "";
        }}
      >
        <option value="">Size</option>
        <option value="12px">12</option>
        <option value="13.5px">13.5</option>
        <option value="15px">15</option>
        <option value="18px">18</option>
        <option value="20px">20</option>
      </select>
      <button type="button" disabled={disabled} onMouseDown={(event) => event.preventDefault()} onClick={createLink}>
        Link
      </button>
      <button type="button" disabled={disabled} onMouseDown={(event) => event.preventDefault()} onClick={removeLink}>
        Unlink
      </button>
      <button type="button" disabled={disabled} onMouseDown={(event) => event.preventDefault()} onClick={clearFormatting}>
        Clear
      </button>
    </div>
  );
}
