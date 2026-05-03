import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { STORAGE_KEY } from "../types/newsletter";
import type { NewsletterState } from "../types/newsletter";
import {
  freshNewsletterState,
  renderDeeperDiveSnippetHtml,
  renderFullEmailHtml,
  renderMainArticleSnippetHtml,
  renderOutroSnippetHtml,
  validateEmailHtmlBalance,
} from "../utils/exportHtml";
import { NewsletterPreview } from "./NewsletterPreview";
import { RichTextToolbar } from "./RichTextToolbar";

type ExportKey = "full" | "main" | "deeperDive" | "outro";

type ExportOutput = {
  key: ExportKey;
  title: string;
  copyLabel: string;
  copiedStatus: string;
  html: string;
};

function cloneDefaultState() {
  return freshNewsletterState();
}

function mergeDraft(parsed: Partial<NewsletterState>): NewsletterState {
  const base = cloneDefaultState();

  return {
    ...base,
    ...parsed,
    header: { ...base.header, ...parsed.header },
    intro: { ...base.intro, ...parsed.intro },
    stories: base.stories.map((story, index) => ({ ...story, ...(parsed.stories?.[index] ?? {}) })),
    deeperDive: { ...base.deeperDive, ...parsed.deeperDive },
    closing: { ...base.closing, ...parsed.closing },
    footer: { ...base.footer, ...parsed.footer },
  };
}

function loadInitialState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { state: cloneDefaultState(), loadedDraft: false };
    }
    return { state: mergeDraft(JSON.parse(raw)), loadedDraft: true };
  } catch {
    return { state: cloneDefaultState(), loadedDraft: false };
  }
}

export function NewsletterEditor() {
  const initial = useMemo(loadInitialState, []);
  const [newsletter, setNewsletter] = useState<NewsletterState>(initial.state);
  const [loadedDraft] = useState(initial.loadedDraft);
  const [activeElement, setActiveElement] = useState<HTMLElement | null>(null);
  const [activeLabel, setActiveLabel] = useState("");
  const [editMode, setEditMode] = useState(true);
  const [hasExported, setHasExported] = useState(false);
  const [selectedExportKey, setSelectedExportKey] = useState<ExportKey>("full");
  const [showExportPreview, setShowExportPreview] = useState(false);
  const [status, setStatus] = useState(loadedDraft ? "Draft loaded" : "Template loaded");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const exportOutputs = useMemo<Record<ExportKey, ExportOutput>>(
    () => ({
      full: {
        key: "full",
        title: "Full HTML",
        copyLabel: "Copy Full HTML",
        copiedStatus: "Full HTML copied",
        html: renderFullEmailHtml(newsletter),
      },
      main: {
        key: "main",
        title: "Main Article Snippet",
        copyLabel: "Copy Main Article Snippet",
        copiedStatus: "Main Article Snippet copied",
        html: renderMainArticleSnippetHtml(newsletter),
      },
      deeperDive: {
        key: "deeperDive",
        title: "Deeper Dive Snippet",
        copyLabel: "Copy Deeper Dive Snippet",
        copiedStatus: "Deeper Dive Snippet copied",
        html: renderDeeperDiveSnippetHtml(newsletter),
      },
      outro: {
        key: "outro",
        title: "Outro Snippet",
        copyLabel: "Copy Outro Snippet",
        copiedStatus: "Outro Snippet copied",
        html: renderOutroSnippetHtml(newsletter),
      },
    }),
    [newsletter],
  );
  const exportOrder: ExportKey[] = ["full", "main", "deeperDive", "outro"];
  const selectedExport = exportOutputs[selectedExportKey];
  const selectedBalance = validateEmailHtmlBalance(selectedExport.html);

  const imageWarnings = [
    ...newsletter.stories.map((story, index) => (story.localImagePreview && !story.imageUrl ? `Story ${index + 1}` : "")),
    newsletter.deeperDive.localImagePreview && !newsletter.deeperDive.imageUrl ? "Deeper Dive" : "",
  ].filter(Boolean);

  useEffect(() => {
    setStatus("Saving...");
    const timer = window.setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newsletter));
      setStatus("Saved locally");
    }, 250);

    return () => window.clearTimeout(timer);
  }, [newsletter]);

  const handleFocusField = useCallback((element: HTMLElement, label: string) => {
    setActiveElement(element);
    setActiveLabel(label);
  }, []);

  function handleExport() {
    setHasExported(true);
    setSelectedExportKey("full");
    setShowExportPreview(true);
    window.setTimeout(() => textareaRef.current?.focus(), 0);
  }

  async function copyOutput(key: ExportKey) {
    const output = exportOutputs[key];
    setHasExported(true);
    setSelectedExportKey(key);

    try {
      await navigator.clipboard.writeText(output.html);
      setStatus(output.copiedStatus);
    } catch {
      const copyBuffer = document.createElement("textarea");
      copyBuffer.value = output.html;
      copyBuffer.setAttribute("readonly", "true");
      copyBuffer.style.position = "fixed";
      copyBuffer.style.left = "-9999px";
      copyBuffer.style.top = "0";
      document.body.appendChild(copyBuffer);
      copyBuffer.select();
      const copied = document.execCommand("copy");
      document.body.removeChild(copyBuffer);

      if (copied) {
        setStatus(output.copiedStatus);
      } else {
        textareaRef.current?.select();
        setStatus("Select the HTML panel to copy");
      }
    }
  }

  function resetTemplate() {
    if (!window.confirm("Reset this draft to the original template?")) {
      return;
    }

    const resetState = cloneDefaultState();
    setNewsletter(resetState);
    setHasExported(false);
    setActiveElement(null);
    setActiveLabel("");
    localStorage.setItem(STORAGE_KEY, JSON.stringify(resetState));
    setStatus("Template reset");
  }

  return (
    <div className="app-shell">
      <div className="editor-topbar">
        <div className="brand-lockup">
          <strong>Three Great Things</strong>
          <span>{status}</span>
        </div>
        <RichTextToolbar activeElement={editMode ? activeElement : null} activeLabel={editMode ? activeLabel : "Preview mode"} />
        <div className="topbar-actions">
          <button type="button" className={editMode ? "is-active" : ""} onClick={() => setEditMode((current) => !current)}>
            {editMode ? "Edit Mode" : "Preview Mode"}
          </button>
          <button type="button" onClick={handleExport}>
            Export HTML
          </button>
          <button type="button" onClick={() => copyOutput("full")}>
            Copy HTML
          </button>
          <button type="button" className="subtle-action" onClick={resetTemplate}>
            Reset
          </button>
        </div>
      </div>

      {imageWarnings.length > 0 && (
        <div className="export-warning">
          {imageWarnings.join(", ")} {imageWarnings.length === 1 ? "uses" : "use"} an uploaded local preview. Add a hosted image URL
          before exporting for reliable email images.
        </div>
      )}

      <div className={`workspace ${hasExported ? "has-export" : ""}`}>
        <section className="preview-column" aria-label="Newsletter editor preview">
          <NewsletterPreview
            newsletter={newsletter}
            editMode={editMode}
            onChange={setNewsletter}
            onFocusField={handleFocusField}
          />
        </section>

        {hasExported && (
          <aside className="export-panel" aria-label="Exported HTML">
            <div className="export-panel-header">
              <strong>Exported HTML</strong>
              <button type="button" className="export-close-button" onClick={() => setHasExported(false)}>
                Close
              </button>
            </div>

            <div className="export-tabs" role="tablist" aria-label="Export outputs">
              {exportOrder.map((key) => (
                <button
                  key={key}
                  type="button"
                  className={selectedExportKey === key ? "is-selected" : ""}
                  role="tab"
                  aria-selected={selectedExportKey === key}
                  onClick={() => setSelectedExportKey(key)}
                >
                  {exportOutputs[key].title}
                </button>
              ))}
            </div>

            <div className="export-output-header">
              <strong>{selectedExport.title}</strong>
              <div>
                <button type="button" onClick={() => copyOutput(selectedExportKey)}>
                  {selectedExport.copyLabel}
                </button>
              </div>
            </div>
            <textarea ref={textareaRef} value={selectedExport.html} readOnly spellCheck={false} />
            {!selectedBalance.isBalanced && (
              <p className="export-balance-warning">
                This output has an unexpected table balance. Tables: {selectedBalance.tableDelta}, rows: {selectedBalance.rowDelta},
                cells: {selectedBalance.cellDelta}.
              </p>
            )}
            <label className="preview-toggle">
              <input
                type="checkbox"
                checked={showExportPreview}
                onChange={(event) => setShowExportPreview(event.currentTarget.checked)}
              />
              Preview exported HTML
            </label>
            {showExportPreview && <iframe className="export-iframe" title="Exported newsletter preview" srcDoc={selectedExport.html} />}
          </aside>
        )}
      </div>
    </div>
  );
}
