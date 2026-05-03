import { useRef, useState } from "react";
import type { NewsletterImageFields } from "../types/newsletter";

type ImagePickerProps = {
  story: NewsletterImageFields;
  disabled?: boolean;
  placeholderText?: string;
  onChange: (patch: Partial<NewsletterImageFields>) => void;
};

function placeholderFor(story: NewsletterImageFields, placeholderText: string) {
  const color = (story.imageFallbackColor || "#8A937E").replace("#", "") || "8A937E";
  const label = encodeURIComponent(placeholderText.trim()).replace(/%20/g, "+");
  return `https://via.placeholder.com/600x200/${color}/ffffff?text=${label}`;
}

export function ImagePicker({ story, disabled = false, placeholderText = "Story Photo", onChange }: ImagePickerProps) {
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
        style={{ backgroundColor: story.imageFallbackColor || "#8A937E" }}
        onClick={() => !disabled && setOpen((current) => !current)}
        aria-label="Edit story image"
      >
        {previewSrc ? (
          <img src={previewSrc} alt={story.imageAlt || "Story photo"} />
        ) : (
          <span className="image-placeholder-text">{placeholderText}</span>
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
            <button type="button" onClick={() => onChange({ imageUrl: placeholderFor(story, placeholderText), localImagePreview: undefined })}>
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
