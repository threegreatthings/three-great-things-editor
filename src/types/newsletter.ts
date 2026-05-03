export type NewsletterHeader = {
  dateLine: string;
  title: string;
  subtitle: string;
};

export type NewsletterImageFields = {
  imageUrl: string;
  localImagePreview?: string;
  imageAlt: string;
  imageFallbackColor: string;
};

export type NewsletterStory = NewsletterImageFields & {
  category: string;
  headlineHtml: string;
  bodyHtml: string;
  linkText: string;
  linkUrl: string;
};

export type NewsletterState = {
  header: NewsletterHeader;
  intro: {
    html: string;
  };
  stories: NewsletterStory[];
  deeperDive: {
    imageUrl: string;
    localImagePreview?: string;
    imageAlt: string;
    imageFallbackColor: string;
    dividerLabel: string;
    categoryLabel: string;
    headlineHtml: string;
    bodyHtml: string;
    linkText: string;
    linkUrl: string;
  };
  closing: {
    dividerLabel: string;
    noteHtml: string;
    signature: string;
  };
  footer: {
    bodyHtml: string;
    unsubscribeUrl: string;
    managePreferencesUrl: string;
    viewInBrowserUrl: string;
  };
};

export const STORAGE_KEY = "three-great-things-newsletter-draft-v1";

export const DEFAULT_NEWSLETTER: NewsletterState = {
  header: {
    dateLine: "Tuesday, April 28, 2026 \u00b7 Issue #1",
    title: "Three Great Things",
    subtitle: "Good News Worth Reading",
  },
  intro: {
    html: "Good morning &mdash; we&rsquo;ve got three things worth smiling about today. From a scientific breakthrough decades in the making to a community that&rsquo;s rewriting what neighborhood solidarity looks like, today&rsquo;s edition is your reminder that progress doesn&rsquo;t pause.",
  },
  stories: [
    {
      imageUrl: "https://via.placeholder.com/600x200/8A937E/ffffff?text=Story+Photo",
      imageAlt: "Story photo",
      imageFallbackColor: "#8A937E",
      category: "Science & Innovation",
      headlineHtml: "Scientists achieve fusion breakthrough with net energy gain for the third straight year",
      bodyHtml:
        "Researchers at Lawrence Livermore confirmed another successful ignition run, bringing commercial fusion energy closer to reality than at any point in history. This one&rsquo;s worth paying attention to.",
      linkText: "Read the full story \u2192",
      linkUrl: "https://threegreatthings.com",
    },
    {
      imageUrl: "https://via.placeholder.com/600x200/4D3B31/ffffff?text=Story+Photo",
      imageAlt: "Story photo",
      imageFallbackColor: "#4D3B31",
      category: "Human Interest",
      headlineHtml: "After 30 years, a Cleveland neighborhood&rsquo;s community garden becomes a city landmark",
      bodyHtml:
        "What started as a vacant lot cleanup project in 1994 is now a protected urban greenspace &mdash; and the three women who started it are finally getting their due recognition.",
      linkText: "Read the full story \u2192",
      linkUrl: "https://threegreatthings.com",
    },
    {
      imageUrl: "https://via.placeholder.com/600x200/3E4932/ffffff?text=Story+Photo",
      imageAlt: "Story photo",
      imageFallbackColor: "#3E4932",
      category: "Health & Wellness",
      headlineHtml: "New sleep research finds a simple evening habit cuts insomnia rates by 40%",
      bodyHtml:
        "Stanford researchers published results from a two-year study &mdash; and the intervention costs nothing and takes under ten minutes. Your evenings just got a useful upgrade.",
      linkText: "Read the full story \u2192",
      linkUrl: "https://threegreatthings.com",
    },
  ],
  deeperDive: {
    imageUrl: "https://via.placeholder.com/600x200/8A937E/ffffff?text=Deeper+Dive+Photo",
    imageAlt: "Deeper Dive photo",
    imageFallbackColor: "#8A937E",
    dividerLabel: "Deeper Dive",
    categoryLabel: "This Week in Technology",
    headlineHtml: "The quiet revolution: how small AI tools are transforming rural healthcare access",
    bodyHtml:
      "From diagnostic screening in underserved counties to remote patient monitoring, a new generation of lightweight AI applications is closing gaps that billion-dollar hospital systems never could. The story of a movement flying under the radar.",
    linkText: "Read the full story \u2192",
    linkUrl: "https://threegreatthings.com",
  },
  closing: {
    dividerLabel: "A Note from 3GT",
    noteHtml:
      "&ldquo;These three stories didn&rsquo;t make the front page &mdash; but we think they deserved to. Each one is a quiet proof point that the arc of human progress bends toward something better. Thanks for being here. See you Thursday.&rdquo;",
    signature: "\u2014 Three Great Things",
  },
  footer: {
    bodyHtml:
      "You&rsquo;re receiving this because you signed up for Three Great Things.<br>Delivered every Tuesday &amp; Thursday morning.",
    unsubscribeUrl: "{{unsubscribe_url}}",
    managePreferencesUrl: "{{manage_preferences_url}}",
    viewInBrowserUrl: "{{view_in_browser_url}}",
  },
};
