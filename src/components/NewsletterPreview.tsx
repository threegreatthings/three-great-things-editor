import { memo, useState } from "react";
import type { NewsletterImageFields, NewsletterState, NewsletterStory } from "../types/newsletter";
import { cloneNewsletterState } from "../utils/exportHtml";
import { safeUrl } from "../utils/sanitize";
import { EditableRichText } from "./EditableRichText";
import { ImagePicker } from "./ImagePicker";

type NewsletterPreviewProps = {
  newsletter: NewsletterState;
  editMode: boolean;
  onChange: (newsletter: NewsletterState) => void;
  onFocusField: (element: HTMLElement, label: string) => void;
};

type LinkControlProps = {
  text: string;
  url: string;
  label: string;
  editMode: boolean;
  onTextChange: (value: string) => void;
  onUrlChange: (value: string) => void;
  onFocusField: (element: HTMLElement, label: string) => void;
};

function Spacer({ size }: { size: number }) {
  return <div style={{ height: size }} />;
}

function LinkControl({ text, url, label, editMode, onTextChange, onUrlChange, onFocusField }: LinkControlProps) {
  const [open, setOpen] = useState(false);

  if (!editMode) {
    return (
      <a className="email-link" href={safeUrl(url, "#")}>
        {text}
      </a>
    );
  }

  return (
    <span className="link-control">
      <EditableRichText
        as="span"
        html={text}
        plainText
        singleLine
        className="email-link editable-link"
        aria-label={`${label} text`}
        onChange={onTextChange}
        onFocusField={onFocusField}
      />
      <button type="button" className="url-chip" onClick={() => setOpen((current) => !current)}>
        URL
      </button>
      {open && (
        <span className="url-popover">
          <label>
            Link URL
            <input type="url" value={url} placeholder="https://..." onChange={(event) => onUrlChange(event.currentTarget.value)} />
          </label>
          <button type="button" onClick={() => setOpen(false)}>
            Done
          </button>
        </span>
      )}
    </span>
  );
}

function Divider({
  label,
  editMode,
  onChange,
  onFocusField,
}: {
  label: string;
  editMode: boolean;
  onChange: (value: string) => void;
  onFocusField: (element: HTMLElement, label: string) => void;
}) {
  return (
    <div className="section-divider">
      <span />
      <EditableRichText
        as="strong"
        html={label}
        plainText
        singleLine
        disabled={!editMode}
        aria-label="Divider label"
        onChange={onChange}
        onFocusField={onFocusField}
      />
      <span />
    </div>
  );
}

function StoryCard({
  story,
  index,
  editMode,
  onChange,
  onFocusField,
}: {
  story: NewsletterStory;
  index: number;
  editMode: boolean;
  onChange: (patch: Partial<NewsletterStory>) => void;
  onFocusField: (element: HTMLElement, label: string) => void;
}) {
  return (
    <article className="story-card">
      <ImagePicker story={story} disabled={!editMode} onChange={onChange} />
      <div className="story-content">
        <div className="tag-pill">
          <EditableRichText
            as="span"
            html={story.category}
            plainText
            singleLine
            disabled={!editMode}
            aria-label={`Story ${index + 1} category`}
            onChange={(category) => onChange({ category })}
            onFocusField={onFocusField}
          />
        </div>
        <EditableRichText
          as="h2"
          html={story.headlineHtml}
          className="story-headline"
          disabled={!editMode}
          aria-label={`Story ${index + 1} headline`}
          onChange={(headlineHtml) => onChange({ headlineHtml })}
          onFocusField={onFocusField}
        />
        <EditableRichText
          as="p"
          html={story.bodyHtml}
          className="story-body"
          disabled={!editMode}
          aria-label={`Story ${index + 1} body`}
          onChange={(bodyHtml) => onChange({ bodyHtml })}
          onFocusField={onFocusField}
        />
        <LinkControl
          text={story.linkText}
          url={story.linkUrl}
          label={`Story ${index + 1} link`}
          editMode={editMode}
          onTextChange={(linkText) => onChange({ linkText })}
          onUrlChange={(linkUrl) => onChange({ linkUrl })}
          onFocusField={onFocusField}
        />
      </div>
    </article>
  );
}

export const NewsletterPreview = memo(function NewsletterPreview({
  newsletter,
  editMode,
  onChange,
  onFocusField,
}: NewsletterPreviewProps) {
  function update(updater: (draft: NewsletterState) => void) {
    const draft = cloneNewsletterState(newsletter);
    updater(draft);
    onChange(draft);
  }

  function updateStory(index: number, patch: Partial<NewsletterStory>) {
    update((draft) => {
      draft.stories[index] = { ...draft.stories[index], ...patch };
    });
  }

  function updateDeeperDiveImage(patch: Partial<NewsletterImageFields>) {
    update((draft) => {
      draft.deeperDive = { ...draft.deeperDive, ...patch };
    });
  }

  return (
    <div className={`newsletter-artboard ${editMode ? "is-editing" : "is-previewing"}`}>
      <div className="email-container-preview">
        <header className="newsletter-header">
          <EditableRichText
            as="p"
            html={newsletter.header.dateLine}
            className="header-date"
            plainText
            singleLine
            disabled={!editMode}
            aria-label="Date line"
            onChange={(dateLine) => update((draft) => void (draft.header.dateLine = dateLine))}
            onFocusField={onFocusField}
          />
          <EditableRichText
            as="h1"
            html={newsletter.header.title}
            className="header-title"
            plainText
            singleLine
            disabled={!editMode}
            aria-label="Newsletter title"
            onChange={(title) => update((draft) => void (draft.header.title = title))}
            onFocusField={onFocusField}
          />
          <div className="header-subtitle-row">
            <span />
            <EditableRichText
              as="p"
              html={newsletter.header.subtitle}
              className="header-subtitle"
              plainText
              singleLine
              disabled={!editMode}
              aria-label="Subtitle line"
              onChange={(subtitle) => update((draft) => void (draft.header.subtitle = subtitle))}
              onFocusField={onFocusField}
            />
            <span />
          </div>
        </header>

        <main className="newsletter-body">
          <section className="intro-card">
            <EditableRichText
              as="p"
              html={newsletter.intro.html}
              className="intro-text"
              disabled={!editMode}
              aria-label="Intro paragraph"
              onChange={(html) => update((draft) => void (draft.intro.html = html))}
              onFocusField={onFocusField}
            />
          </section>

          <Spacer size={16} />

          {newsletter.stories.map((story, index) => (
            <div key={index}>
              <StoryCard
                story={story}
                index={index}
                editMode={editMode}
                onChange={(patch) => updateStory(index, patch)}
                onFocusField={onFocusField}
              />
              {index < newsletter.stories.length - 1 && <Spacer size={16} />}
            </div>
          ))}

          <Spacer size={28} />

          <Divider
            label={newsletter.deeperDive.dividerLabel}
            editMode={editMode}
            onChange={(dividerLabel) => update((draft) => void (draft.deeperDive.dividerLabel = dividerLabel))}
            onFocusField={onFocusField}
          />

          <Spacer size={20} />

          <section className="deeper-dive-card">
            <ImagePicker
              story={newsletter.deeperDive}
              disabled={!editMode}
              placeholderText="Deeper Dive Photo"
              onChange={updateDeeperDiveImage}
            />
            <div className="deeper-dive-content">
              <EditableRichText
                as="p"
                html={newsletter.deeperDive.categoryLabel}
                className="deeper-category"
                plainText
                singleLine
                disabled={!editMode}
                aria-label="Deeper Dive category"
                onChange={(categoryLabel) => update((draft) => void (draft.deeperDive.categoryLabel = categoryLabel))}
                onFocusField={onFocusField}
              />
              <EditableRichText
                as="h2"
                html={newsletter.deeperDive.headlineHtml}
                className="deeper-headline"
                disabled={!editMode}
                aria-label="Deeper Dive headline"
                onChange={(headlineHtml) => update((draft) => void (draft.deeperDive.headlineHtml = headlineHtml))}
                onFocusField={onFocusField}
              />
              <EditableRichText
                as="p"
                html={newsletter.deeperDive.bodyHtml}
                className="story-body"
                disabled={!editMode}
                aria-label="Deeper Dive body"
                onChange={(bodyHtml) => update((draft) => void (draft.deeperDive.bodyHtml = bodyHtml))}
                onFocusField={onFocusField}
              />
              <LinkControl
                text={newsletter.deeperDive.linkText}
                url={newsletter.deeperDive.linkUrl}
                label="Deeper Dive link"
                editMode={editMode}
                onTextChange={(linkText) => update((draft) => void (draft.deeperDive.linkText = linkText))}
                onUrlChange={(linkUrl) => update((draft) => void (draft.deeperDive.linkUrl = linkUrl))}
                onFocusField={onFocusField}
              />
            </div>
          </section>

          <Spacer size={28} />

          <Divider
            label={newsletter.closing.dividerLabel}
            editMode={editMode}
            onChange={(dividerLabel) => update((draft) => void (draft.closing.dividerLabel = dividerLabel))}
            onFocusField={onFocusField}
          />

          <Spacer size={20} />

          <section className="closing-card">
            <EditableRichText
              as="p"
              html={newsletter.closing.noteHtml}
              className="closing-note"
              disabled={!editMode}
              aria-label="Closing note"
              onChange={(noteHtml) => update((draft) => void (draft.closing.noteHtml = noteHtml))}
              onFocusField={onFocusField}
            />
            <div className="closing-rule" />
            <EditableRichText
              as="p"
              html={newsletter.closing.signature}
              className="closing-signature"
              plainText
              singleLine
              disabled={!editMode}
              aria-label="Closing signature"
              onChange={(signature) => update((draft) => void (draft.closing.signature = signature))}
              onFocusField={onFocusField}
            />
          </section>
        </main>

        <footer className="newsletter-footer">
          <EditableRichText
            as="p"
            html={newsletter.footer.bodyHtml}
            className="footer-copy"
            disabled={!editMode}
            aria-label="Footer text"
            onChange={(bodyHtml) => update((draft) => void (draft.footer.bodyHtml = bodyHtml))}
            onFocusField={onFocusField}
          />
          <div className="footer-links">
            <a href={safeUrl(newsletter.footer.unsubscribeUrl, "#")} onClick={(event) => editMode && event.preventDefault()}>
              Unsubscribe
            </a>
            <span>·</span>
            <a href={safeUrl(newsletter.footer.managePreferencesUrl, "#")} onClick={(event) => editMode && event.preventDefault()}>
              Manage Preferences
            </a>
            <span>·</span>
            <a href={safeUrl(newsletter.footer.viewInBrowserUrl, "#")} onClick={(event) => editMode && event.preventDefault()}>
              View in Browser
            </a>
          </div>
          {editMode && (
            <details className="footer-url-editor">
              <summary>Footer URLs</summary>
              <label>
                Unsubscribe
                <input
                  type="text"
                  value={newsletter.footer.unsubscribeUrl}
                  onChange={(event) => update((draft) => void (draft.footer.unsubscribeUrl = event.currentTarget.value))}
                />
              </label>
              <label>
                Manage Preferences
                <input
                  type="text"
                  value={newsletter.footer.managePreferencesUrl}
                  onChange={(event) => update((draft) => void (draft.footer.managePreferencesUrl = event.currentTarget.value))}
                />
              </label>
              <label>
                View in Browser
                <input
                  type="text"
                  value={newsletter.footer.viewInBrowserUrl}
                  onChange={(event) => update((draft) => void (draft.footer.viewInBrowserUrl = event.currentTarget.value))}
                />
              </label>
            </details>
          )}
        </footer>
      </div>
    </div>
  );
});
