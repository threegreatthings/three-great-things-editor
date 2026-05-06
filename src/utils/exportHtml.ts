import { DEFAULT_NEWSLETTER } from "../types/newsletter";
import type { NewsletterImageFields, NewsletterState, NewsletterStory } from "../types/newsletter";
import {
  escapeAttribute,
  escapeHtml,
  safeHostedImageUrl,
  safeUrl,
  sanitizeRichHtml,
} from "./sanitize";

export type HtmlBalanceReport = {
  isBalanced: boolean;
  tableDelta: number;
  rowDelta: number;
  cellDelta: number;
};

function rich(value: string) {
  const clean = sanitizeRichHtml(value, { inline: true }).trim();
  return clean || "&nbsp;";
}

function text(value: string) {
  return escapeHtml(value.trim() || " ");
}

function attr(value: string) {
  return escapeAttribute(value.trim());
}

function placeholderImageFor(image: NewsletterImageFields, placeholderText = "Story Photo") {
  const color = (image.imageFallbackColor || "#8A937E").replace("#", "") || "8A937E";
  const label = encodeURIComponent(placeholderText.trim()).replace(/%20/g, "+");
  return `https://via.placeholder.com/600x200/${color}/ffffff?text=${label}`;
}

function renderSpacer(height: number) {
  return `<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%"><tr><td style="height:${height}px;"></td></tr></table>`;
}

function renderFullDocumentStart(newsletter: NewsletterState) {
  const headerTitle = text(newsletter.header.title);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${headerTitle}</title>
  <style>
    body { margin:0; padding:0; background-color:#E7E0D2; }
    table { border-collapse:collapse; }
    img { border:0; line-height:100%; outline:none; text-decoration:none; }
    a { color:inherit; }
    @media only screen and (max-width: 620px) {
      .email-container { width:100% !important; max-width:100% !important; }
      .outer-padding { padding-left:12px !important; padding-right:12px !important; }
      .body-padding { padding-left:22px !important; padding-right:22px !important; }
      .header-padding { padding:38px 18px 28px !important; }
      .content-padding { padding-left:22px !important; padding-right:22px !important; }
      .mobile-title { font-size:32px !important; }
      .story-image, .story-image img { height:180px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#E7E0D2;">`;
}

function renderFullDocumentEnd() {
  return `</body>
</html>`;
}

function renderEmailShellStart(outerPadding: string) {
  return `<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#E7E0D2;">
  <tr>
    <td align="center" style="padding:${outerPadding};">
      <table class="email-container" role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" style="width:600px;max-width:600px;background-color:#EDE6D8;">`;
}

function renderEmailShellEnd() {
  return `      </table>
    </td>
  </tr>
</table>`;
}

function renderHeader(newsletter: NewsletterState) {
  const headerTitle = text(newsletter.header.title);

  return `<tr>
  <td class="outer-padding" style="padding:30px 10px 0;">
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#3E4932;">
      <tr>
        <td class="header-padding" style="padding:48px 28px 28px;text-align:center;">
          <p style="margin:0 0 42px;font-family:Georgia,'Times New Roman',serif;font-size:10px;line-height:1.3;color:rgba(244,237,222,0.55);letter-spacing:5px;text-transform:uppercase;">${text(newsletter.header.dateLine)}</p>
          <h1 class="mobile-title" style="margin:0 0 18px;font-family:Georgia,'Times New Roman',serif;font-size:34px;font-weight:600;line-height:1.15;color:#F4EDDE;">${headerTitle}</h1>
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center">
            <tr>
              <td style="width:60px;height:11px;background-color:rgba(244,237,222,0.22);"></td>
              <td style="padding:0 14px;white-space:nowrap;text-align:center;"><span style="font-family:Georgia,'Times New Roman',serif;font-size:9px;letter-spacing:3px;text-transform:uppercase;color:rgba(244,237,222,0.55);">${text(newsletter.header.subtitle)}</span></td>
              <td style="width:60px;height:11px;background-color:rgba(244,237,222,0.22);"></td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </td>
</tr>`;
}

function renderBodyStart() {
  return `<tr>
  <td class="body-padding" style="padding:0 44px;background-color:#EDE6D8;">`;
}

function renderBodyEnd() {
  return `  </td>
</tr>`;
}

function renderIntroBubble(newsletter: NewsletterState) {
  return `<!-- section: intro_bubble -->
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#ffffff;border-radius:12px;border:1px solid rgba(62,73,50,0.12);">
  <tr>
    <td class="content-padding" style="padding:24px 28px;">
      <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:15px;line-height:1.85;color:#4D3B31;font-style:italic;">
        ${rich(newsletter.intro.html)}
      </p>
    </td>
  </tr>
</table>`;
}

function renderStoryCard(story: NewsletterStory, index: number) {
  const imageSrc = safeHostedImageUrl(story.imageUrl, placeholderImageFor(story));
  const linkUrl = safeUrl(story.linkUrl, "https://threegreatthings.com");

  return `<!-- section: story_${index + 1} -->
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#ffffff;border-radius:12px;border:1px solid rgba(62,73,50,0.12);overflow:hidden;">
  <tr>
    <td class="story-image" style="height:200px;background-color:${attr(story.imageFallbackColor)};text-align:center;vertical-align:middle;">
      <img src="${attr(imageSrc)}" width="600" alt="${attr(story.imageAlt || "Story photo")}" style="display:block;width:100%;height:200px;object-fit:cover;max-width:600px;">
    </td>
  </tr>
  <tr>
    <td aria-hidden="true" style="height:6px;line-height:6px;font-size:0;background-color:${attr(story.imageFallbackColor)};mso-line-height-rule:exactly;">&nbsp;</td>
  </tr>
  <tr>
    <td class="content-padding" style="padding:22px 24px;">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr>
        <td style="background-color:#3E4932;border-radius:20px;padding:5px 12px;">
          <span style="font-family:Georgia,serif;font-size:9px;color:#F4EDDE;letter-spacing:2px;text-transform:uppercase;">${text(story.category)}</span>
        </td>
      </tr></table>
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%"><tr><td style="height:12px;"></td></tr></table>
      <h2 style="margin:0 0 10px;font-family:Georgia,'Times New Roman',serif;font-size:20px;font-weight:600;color:#3E4932;line-height:1.35;">
        ${rich(story.headlineHtml)}
      </h2>
      <p style="margin:0 0 16px;font-family:Georgia,serif;font-size:13.5px;line-height:1.75;color:#4D3B31;">
        ${rich(story.bodyHtml)}
      </p>
      <a href="${attr(linkUrl)}" style="font-family:Georgia,serif;font-size:13px;color:#8A937E;text-decoration:none;font-weight:600;letter-spacing:0.3px;">${text(story.linkText)}</a>
    </td>
  </tr>
</table>`;
}

function renderStories(newsletter: NewsletterState) {
  return newsletter.stories.map((story, index) => renderStoryCard(story, index)).join(`\n\n${renderSpacer(16)}\n\n`);
}

function renderDivider(sectionId: "deeper_dive_divider" | "note_from_3gt_divider", label: string) {
  return `<!-- section: ${sectionId} -->
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
  <tr>
    <td style="width:40%;height:1px;background-color:rgba(62,73,50,0.2);vertical-align:middle;"></td>
    <td style="padding:0 14px;white-space:nowrap;text-align:center;">
      <span style="font-family:Georgia,serif;font-size:9px;letter-spacing:2.5px;text-transform:uppercase;color:#8A937E;">${text(label)}</span>
    </td>
    <td style="width:40%;height:1px;background-color:rgba(62,73,50,0.2);vertical-align:middle;"></td>
  </tr>
</table>`;
}

function renderCategoryArticle(newsletter: NewsletterState) {
  const imageSrc = safeHostedImageUrl(newsletter.deeperDive.imageUrl || "", placeholderImageFor(newsletter.deeperDive, "Deeper Dive Photo"));
  const linkUrl = safeUrl(newsletter.deeperDive.linkUrl, "https://threegreatthings.com");

  return `<!-- section: category_article -->
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#ffffff;border-radius:12px;border:1px solid rgba(62,73,50,0.12);overflow:hidden;">
  <tr>
    <td class="story-image" style="height:200px;background-color:${attr(newsletter.deeperDive.imageFallbackColor || "#8A937E")};text-align:center;vertical-align:middle;">
      <img src="${attr(imageSrc)}" width="600" alt="${attr(newsletter.deeperDive.imageAlt || "Deeper Dive photo")}" style="display:block;width:100%;height:200px;object-fit:cover;max-width:600px;">
    </td>
  </tr>
  <tr>
    <td class="content-padding" style="padding:24px 28px;">
      <p style="margin:0 0 14px;font-family:Georgia,serif;font-size:9px;letter-spacing:2.5px;text-transform:uppercase;color:#8A937E;">${text(newsletter.deeperDive.categoryLabel)}</p>
      <h2 style="margin:0 0 12px;font-family:Georgia,'Times New Roman',serif;font-size:19px;font-weight:600;color:#3E4932;line-height:1.35;">
        ${rich(newsletter.deeperDive.headlineHtml)}
      </h2>
      <p style="margin:0 0 16px;font-family:Georgia,serif;font-size:13.5px;line-height:1.75;color:#4D3B31;">
        ${rich(newsletter.deeperDive.bodyHtml)}
      </p>
      <a href="${attr(linkUrl)}" style="font-family:Georgia,serif;font-size:13px;color:#8A937E;text-decoration:none;font-weight:600;letter-spacing:0.3px;">${text(newsletter.deeperDive.linkText)}</a>
    </td>
  </tr>
</table>`;
}

function renderClosingMessage(newsletter: NewsletterState) {
  return `<!-- section: closing_message -->
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#3E4932;border-radius:12px;">
  <tr>
    <td class="content-padding" style="padding:26px 28px;">
      <p style="margin:0 0 18px;font-family:Georgia,'Times New Roman',serif;font-size:15px;line-height:1.85;color:#F4EDDE;font-style:italic;">
        ${rich(newsletter.closing.noteHtml)}
      </p>
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr><td style="height:1px;background-color:rgba(244,237,222,0.2);"></td></tr>
      </table>
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%"><tr><td style="height:16px;"></td></tr></table>
      <p style="margin:0;font-family:Georgia,serif;font-size:12px;color:rgba(244,237,222,0.6);">${text(newsletter.closing.signature)}</p>
    </td>
  </tr>
</table>`;
}

function renderFooter(newsletter: NewsletterState) {
  const footer = newsletter.footer;
  const unsubscribeUrl = safeUrl(footer.unsubscribeUrl, "{{unsubscribe_url}}");
  const preferencesUrl = safeUrl(footer.managePreferencesUrl, "{{manage_preferences_url}}");
  const browserUrl = safeUrl(footer.viewInBrowserUrl, "{{view_in_browser_url}}");

  return `<tr>
  <td class="outer-padding" style="padding:0 10px 30px;">
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#4D3B31;">
      <tr>
        <td style="padding:38px 28px;text-align:center;">
          <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:12px;line-height:1.6;color:rgba(244,237,222,0.58);">${rich(footer.bodyHtml)}</p>
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%"><tr><td style="height:28px;"></td></tr></table>
          <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:11px;line-height:1.6;color:rgba(138,147,126,0.9);">
            <a href="${attr(unsubscribeUrl)}" style="color:#8A937E;text-decoration:none;">Unsubscribe</a>
            <span style="color:rgba(244,237,222,0.32);">&nbsp;&middot;&nbsp;</span>
            <a href="${attr(preferencesUrl)}" style="color:#8A937E;text-decoration:none;">Manage Preferences</a>
            <span style="color:rgba(244,237,222,0.32);">&nbsp;&middot;&nbsp;</span>
            <a href="${attr(browserUrl)}" style="color:#8A937E;text-decoration:none;">View in Browser</a>
          </p>
        </td>
      </tr>
    </table>
  </td>
</tr>`;
}

function renderMainArticleBody(newsletter: NewsletterState) {
  return `${renderSpacer(24)}
${renderIntroBubble(newsletter)}

${renderSpacer(16)}

${renderStories(newsletter)}

${renderSpacer(28)}`;
}

function renderDeeperDiveBody(newsletter: NewsletterState) {
  return `${renderDivider("deeper_dive_divider", newsletter.deeperDive.dividerLabel)}

${renderSpacer(20)}

${renderCategoryArticle(newsletter)}

${renderSpacer(28)}`;
}

function renderOutroBody(newsletter: NewsletterState) {
  return `${renderDivider("note_from_3gt_divider", newsletter.closing.dividerLabel)}

${renderSpacer(20)}

${renderClosingMessage(newsletter)}

${renderSpacer(28)}`;
}

function renderBody(content: string) {
  return `${renderBodyStart()}
${content}
${renderBodyEnd()}`;
}

export function renderFullEmailHtml(newsletter: NewsletterState) {
  return `${renderFullDocumentStart(newsletter)}
${renderEmailShellStart("12px 0")}
${renderHeader(newsletter)}
${renderBody(`${renderMainArticleBody(newsletter)}

${renderDeeperDiveBody(newsletter)}

${renderOutroBody(newsletter)}`)}
${renderFooter(newsletter)}
${renderEmailShellEnd()}
${renderFullDocumentEnd()}`;
}

export function renderMainArticleSnippetHtml(newsletter: NewsletterState) {
  return `${renderEmailShellStart("12px 0 0")}
${renderHeader(newsletter)}
${renderBody(renderMainArticleBody(newsletter))}
${renderEmailShellEnd()}`;
}

export function renderDeeperDiveSnippetHtml(newsletter: NewsletterState) {
  return `${renderEmailShellStart("0")}
${renderBody(renderDeeperDiveBody(newsletter))}
${renderEmailShellEnd()}`;
}

export function renderOutroSnippetHtml(newsletter: NewsletterState) {
  return `${renderEmailShellStart("0 0 12px")}
${renderBody(renderOutroBody(newsletter))}
${renderFooter(newsletter)}
${renderEmailShellEnd()}`;
}

export function generateNewsletterHtml(newsletter: NewsletterState) {
  return renderFullEmailHtml(newsletter);
}

export function validateEmailHtmlBalance(html: string): HtmlBalanceReport {
  const deltaFor = (tagName: "table" | "tr" | "td") => {
    const openPattern = new RegExp(`<${tagName}(?:\\s|>)`, "gi");
    const closePattern = new RegExp(`</${tagName}>`, "gi");
    return (html.match(openPattern) ?? []).length - (html.match(closePattern) ?? []).length;
  };

  const tableDelta = deltaFor("table");
  const rowDelta = deltaFor("tr");
  const cellDelta = deltaFor("td");

  return {
    isBalanced: tableDelta === 0 && rowDelta === 0 && cellDelta === 0,
    tableDelta,
    rowDelta,
    cellDelta,
  };
}

export function freshNewsletterState(): NewsletterState {
  return cloneNewsletterState(DEFAULT_NEWSLETTER);
}

export function cloneNewsletterState<T>(value: T): T {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value)) as T;
}
