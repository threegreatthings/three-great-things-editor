import { useLayoutEffect, useRef } from "react";
import type { ClipboardEvent, FocusEvent, KeyboardEvent, MouseEvent as ReactMouseEvent } from "react";
import { escapeHtml, plainTextFromHtml, plainTextToHtml, sanitizeRichHtml } from "../utils/sanitize";

type EditableTag = "div" | "p" | "h1" | "h2" | "span" | "strong";

type EditableRichTextProps = {
  as?: EditableTag;
  html: string;
  className?: string;
  disabled?: boolean;
  plainText?: boolean;
  singleLine?: boolean;
  "aria-label": string;
  onChange: (value: string) => void;
  onFocusField?: (element: HTMLElement, label: string) => void;
};

export function EditableRichText({
  as: Tag = "div",
  html,
  className,
  disabled = false,
  plainText = false,
  singleLine = false,
  "aria-label": ariaLabel,
  onChange,
  onFocusField,
}: EditableRichTextProps) {
  const ref = useRef<HTMLElement | null>(null);
  const Component = Tag as any;

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element || document.activeElement === element) {
      return;
    }

    const nextHtml = plainText ? escapeHtml(html) : sanitizeRichHtml(html, { inline: true });
    if (element.innerHTML !== nextHtml) {
      element.innerHTML = nextHtml;
    }
  }, [html, plainText]);

  function commit(element: HTMLElement) {
    if (plainText) {
      const cleanText = plainTextFromHtml(element.innerHTML);
      onChange(cleanText);
      element.innerHTML = escapeHtml(cleanText);
      return;
    }

    const cleanHtml = sanitizeRichHtml(element.innerHTML, { inline: true });
    onChange(cleanHtml);
    element.innerHTML = cleanHtml;
  }

  function handlePaste(event: ClipboardEvent<HTMLElement>) {
    if (disabled) {
      return;
    }

    event.preventDefault();
    const clipboard = event.clipboardData;
    const htmlFromClipboard = clipboard.getData("text/html");
    const textFromClipboard = clipboard.getData("text/plain");
    const htmlToInsert = plainText
      ? plainTextToHtml(singleLine ? textFromClipboard.replace(/\r?\n/g, " ") : textFromClipboard)
      : sanitizeRichHtml(htmlFromClipboard || plainTextToHtml(textFromClipboard), { inline: true });

    document.execCommand("insertHTML", false, htmlToInsert);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (singleLine && event.key === "Enter") {
      event.preventDefault();
      (event.currentTarget as HTMLElement).blur();
      return;
    }

    if (!plainText && event.key === "Enter") {
      event.preventDefault();
      document.execCommand("insertLineBreak");
    }
  }

  function handleFocus(event: FocusEvent<HTMLElement>) {
    onFocusField?.(event.currentTarget, ariaLabel);
  }

  function handleMouseUp(event: ReactMouseEvent<HTMLElement>) {
    if (disabled) {
      return;
    }

    const selection = window.getSelection();
    if (event.detail > 1 || (selection && !selection.isCollapsed)) {
      return;
    }

    const documentWithCaret = document as Document & {
      caretPositionFromPoint?: (x: number, y: number) => { offsetNode: Node; offset: number } | null;
      caretRangeFromPoint?: (x: number, y: number) => Range | null;
    };

    let range: Range | null = null;

    if (documentWithCaret.caretPositionFromPoint) {
      const position = documentWithCaret.caretPositionFromPoint(event.clientX, event.clientY);
      if (position) {
        range = document.createRange();
        range.setStart(position.offsetNode, position.offset);
        range.collapse(true);
      }
    } else if (documentWithCaret.caretRangeFromPoint) {
      range = documentWithCaret.caretRangeFromPoint(event.clientX, event.clientY);
    }

    if (!range || !event.currentTarget.contains(range.startContainer)) {
      return;
    }

    selection?.removeAllRanges();
    selection?.addRange(range);
  }

  return (
    <Component
      ref={ref}
      className={className}
      contentEditable={!disabled}
      suppressContentEditableWarning
      role={disabled ? undefined : "textbox"}
      aria-label={ariaLabel}
      tabIndex={disabled ? undefined : 0}
      onBlur={(event: FocusEvent<HTMLElement>) => commit(event.currentTarget)}
      onPaste={handlePaste}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      onMouseUp={handleMouseUp}
    />
  );
}
