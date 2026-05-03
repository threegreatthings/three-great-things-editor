type RichTextToolbarProps = {
  activeElement: HTMLElement | null;
  activeLabel: string;
};

const LEGACY_FONT_SIZE = "7";

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

    activeElement.focus();
    const url = window.prompt("Link URL", "https://");
    if (!url) {
      return;
    }
    document.execCommand("createLink", false, url);
    fireInput(activeElement);
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
      <button type="button" disabled={disabled} onMouseDown={(event) => event.preventDefault()} onClick={clearFormatting}>
        Clear
      </button>
    </div>
  );
}
