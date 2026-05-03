import { useRef, useState } from "react";
import type { NewsletterStory } from "../types/newsletter";

type ImagePickerProps = {
  story: NewsletterStory;
  disabled?: boolean;
  onChange: (patch: Partial<NewsletterStory>) => void;
};

function placeholderFor(story: NewsletterStory) {
  const color = story.imageFallbackColor.replace("#", "") || "8A937E";
  return `https://via.placeholder.com/600x200/${color}/ffffff?text=Story+Photo`;
}

export function ImagePicker({ story, disabled = false, onChange }: ImagePickerProps) {
  const [open, setOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const previewSrc = story.localImagePreview || story.imageUrl;
  const hasLocalOnlyImage = Boolean(story.localImagePreview && !story.imageUrl);

  function handleFile(file: File | undefined) {
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      onChange({ localImagePreview: String(reader.result), imageUrl: "" });
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="image-picker">
      <button
        type="button"
        className="story-image-button"
        style={{ backgroundColor: story.imageFallbackColor }}
        onClick={() => !disabled && setOpen((current) => !current)}
        aria-label="Edit story image"
      >
        {previewSrc ? (
          <img src={previewSrc} alt={story.imageAlt || "Story photo"} />
        ) : (
          <span className="image-placeholder-text">Story photo</span>
        )}
        {!disabled && <span className="image-edit-pill">Image</span>}
        {hasLocalOnlyImage && <span className="image-host-warning">Needs hosted URL</span>}
      </button>

      {open && !disabled && (
        <div className="image-popover">
          <label>
            Hosted image URL
            <input
              type="url"
              value={story.imageUrl}
              placeholder="https://..."
              onChange={(event) => onChange({ imageUrl: event.currentTarget.value })}
            />
          </label>
          <label>
            Alt text
            <input
              type="text"
              value={story.imageAlt}
              onChange={(event) => onChange({ imageAlt: event.currentTarget.value })}
            />
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(event) => handleFile(event.currentTarget.files?.[0])}
          />
          <div className="image-actions">
            <button type="button" onClick={() => fileInputRef.current?.click()}>
              Upload
            </button>
            <button type="button" onClick={() => onChange({ imageUrl: placeholderFor(story), localImagePreview: undefined })}>
              Reset
            </button>
            <button type="button" onClick={() => onChange({ imageUrl: "", localImagePreview: undefined })}>
              Remove
            </button>
            <button type="button" onClick={() => setOpen(false)}>
              Done
            </button>
          </div>
          {hasLocalOnlyImage && (
            <p className="image-note">Uploaded files preview locally. Paste a hosted URL before exporting for reliable email images.</p>
          )}
        </div>
      )}
    </div>
  );
}
