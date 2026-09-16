import type { RgaaMappingEntry } from "./types.js";

// Correspondance indicative entre règles axe-core et critères RGAA 4.1.
// axe-core est construit autour des critères de succès WCAG 2.x ; le RGAA en
// est l'implémentation française officielle, donc la correspondance est
// généralement directe mais pas garantie 1:1 (à vérifier contre le
// référentiel en vigueur avant tout usage en audit officiel/appel d'offres).
// Une règle axe-core absente de cette table est classée "Non mappé" plutôt
// que rattachée arbitrairement à un critère RGAA.
export const RGAA_MAPPING: Record<string, RgaaMappingEntry> = {
  // 1. Images
  "image-alt": { rgaaRef: "1.1", category: "Images" },
  "input-image-alt": { rgaaRef: "1.1", category: "Images" },
  "area-alt": { rgaaRef: "1.1", category: "Images" },
  "object-alt": { rgaaRef: "1.1", category: "Images" },
  "role-img-alt": { rgaaRef: "1.1", category: "Images" },
  "svg-img-alt": { rgaaRef: "1.1", category: "Images" },
  "image-redundant-alt": { rgaaRef: "1.2", category: "Images" },

  // 2. Cadres
  "frame-title": { rgaaRef: "2.1", category: "Cadres" },
  "frame-title-unique": { rgaaRef: "2.2", category: "Cadres" },
  "frame-tested": { rgaaRef: "2.1", category: "Cadres" },

  // 3. Couleurs
  "color-contrast": { rgaaRef: "3.2", category: "Couleurs" },
  "color-contrast-enhanced": { rgaaRef: "3.2", category: "Couleurs" },
  "link-in-text-block": { rgaaRef: "3.3", category: "Couleurs" },

  // 4. Multimédia
  "video-caption": { rgaaRef: "4.2", category: "Multimédia" },
  "audio-caption": { rgaaRef: "4.1", category: "Multimédia" },
  "no-autoplay-audio": { rgaaRef: "4.5", category: "Multimédia" },

  // 5. Tableaux
  "td-headers-attr": { rgaaRef: "5.6", category: "Tableaux" },
  "th-has-data-cells": { rgaaRef: "5.6", category: "Tableaux" },
  "scope-attr-valid": { rgaaRef: "5.6", category: "Tableaux" },
  "table-duplicate-name": { rgaaRef: "5.1", category: "Tableaux" },

  // 6. Liens
  "link-name": { rgaaRef: "6.1", category: "Liens" },
  "identical-links-same-purpose": { rgaaRef: "6.2", category: "Liens" },

  // 7. Scripts (essentiellement usage ARIA/JS)
  "aria-allowed-attr": { rgaaRef: "7.1", category: "Scripts" },
  "aria-allowed-role": { rgaaRef: "7.1", category: "Scripts" },
  "aria-required-attr": { rgaaRef: "7.1", category: "Scripts" },
  "aria-required-children": { rgaaRef: "7.1", category: "Scripts" },
  "aria-required-parent": { rgaaRef: "7.1", category: "Scripts" },
  "aria-roles": { rgaaRef: "7.1", category: "Scripts" },
  "aria-valid-attr": { rgaaRef: "7.1", category: "Scripts" },
  "aria-valid-attr-value": { rgaaRef: "7.1", category: "Scripts" },
  "aria-hidden-body": { rgaaRef: "7.1", category: "Scripts" },
  "aria-hidden-focus": { rgaaRef: "7.1", category: "Scripts" },
  "aria-command-name": { rgaaRef: "7.1", category: "Scripts" },
  "aria-input-field-name": { rgaaRef: "7.1", category: "Scripts" },
  "aria-meter-name": { rgaaRef: "7.1", category: "Scripts" },
  "aria-progressbar-name": { rgaaRef: "7.1", category: "Scripts" },
  "aria-toggle-field-name": { rgaaRef: "7.1", category: "Scripts" },
  "aria-tooltip-name": { rgaaRef: "7.1", category: "Scripts" },
  "button-name": { rgaaRef: "7.1", category: "Scripts" },
  "nested-interactive": { rgaaRef: "7.1", category: "Scripts" },

  // 8. Éléments obligatoires
  "html-has-lang": { rgaaRef: "8.3", category: "Éléments obligatoires" },
  "html-lang-valid": { rgaaRef: "8.3", category: "Éléments obligatoires" },
  "html-xml-lang-mismatch": { rgaaRef: "8.3", category: "Éléments obligatoires" },
  "valid-lang": { rgaaRef: "8.9", category: "Éléments obligatoires" },
  "document-title": { rgaaRef: "8.5", category: "Éléments obligatoires" },
  "duplicate-id": { rgaaRef: "8.10", category: "Éléments obligatoires" },
  "duplicate-id-active": { rgaaRef: "8.10", category: "Éléments obligatoires" },
  "duplicate-id-aria": { rgaaRef: "8.10", category: "Éléments obligatoires" },

  // 9. Structuration de l'information
  "heading-order": { rgaaRef: "9.1", category: "Structuration de l'information" },
  "empty-heading": { rgaaRef: "9.1", category: "Structuration de l'information" },
  "page-has-heading-one": { rgaaRef: "9.1", category: "Structuration de l'information" },
  "list": { rgaaRef: "9.1", category: "Structuration de l'information" },
  "listitem": { rgaaRef: "9.1", category: "Structuration de l'information" },
  "definition-list": { rgaaRef: "9.1", category: "Structuration de l'information" },
  "dlitem": { rgaaRef: "9.1", category: "Structuration de l'information" },
  "landmark-one-main": { rgaaRef: "9.3", category: "Structuration de l'information" },
  "region": { rgaaRef: "9.3", category: "Structuration de l'information" },
  "landmark-unique": { rgaaRef: "9.3", category: "Structuration de l'information" },
  "landmark-banner-is-top-level": { rgaaRef: "9.3", category: "Structuration de l'information" },
  "landmark-complementary-is-top-level": { rgaaRef: "9.3", category: "Structuration de l'information" },
  "landmark-contentinfo-is-top-level": { rgaaRef: "9.3", category: "Structuration de l'information" },
  "landmark-no-duplicate-banner": { rgaaRef: "9.3", category: "Structuration de l'information" },
  "landmark-no-duplicate-contentinfo": { rgaaRef: "9.3", category: "Structuration de l'information" },

  // 10. Présentation de l'information
  "meta-viewport": { rgaaRef: "10.14", category: "Présentation de l'information" },
  "css-orientation-lock": { rgaaRef: "10.14", category: "Présentation de l'information" },

  // 11. Formulaires
  "label": { rgaaRef: "11.1", category: "Formulaires" },
  "label-title-only": { rgaaRef: "11.1", category: "Formulaires" },
  "form-field-multiple-labels": { rgaaRef: "11.1", category: "Formulaires" },
  "select-name": { rgaaRef: "11.1", category: "Formulaires" },
  "autocomplete-valid": { rgaaRef: "11.13", category: "Formulaires" },

  // 12. Navigation
  "bypass": { rgaaRef: "12.7", category: "Navigation" },
  "skip-link": { rgaaRef: "12.7", category: "Navigation" },
  "tabindex": { rgaaRef: "12.8", category: "Navigation" },
  "focus-order-semantics": { rgaaRef: "12.8", category: "Navigation" },

  // 13. Consultation
  "meta-refresh": { rgaaRef: "13.2", category: "Consultation" },
  "meta-refresh-no-exceptions": { rgaaRef: "13.2", category: "Consultation" },
  "blink": { rgaaRef: "13.3", category: "Consultation" },
  "marquee": { rgaaRef: "13.3", category: "Consultation" },
};

export const UNMAPPED_CATEGORY = "Non mappé";

export function resolveRgaaMapping(axeRuleId: string, wcagTags: string[]): RgaaMappingEntry {
  const known = RGAA_MAPPING[axeRuleId];
  if (known) return known;

  const wcagTag = wcagTags.find((t) => /^wcag\d/.test(t));
  return {
    rgaaRef: wcagTag ? `Non mappé (${wcagTag})` : "Non mappé",
    category: UNMAPPED_CATEGORY,
  };
}
