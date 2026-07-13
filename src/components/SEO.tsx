import { useEffect } from "react";
import { useTranslation } from "react-i18next";

/**
 * SEO Component
 * Dynamically synchronizes document title, HTML lang attribute,
 * and key meta tags (Description, Keywords, Open Graph, and Twitter Cards)
 * based on the active language selected through i18next.
 */
export default function SEO() {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const activeLang = i18n.language || "en";

    // 1. Update HTML language attribute for accessibility (screen readers) and indexers
    document.documentElement.lang = activeLang;

    // 2. Fetch localized meta payloads
    const title = t("seo.title");
    const description = t("seo.description");
    const keywords = t("seo.keywords");

    // 3. Dynamic Title Update
    if (title) {
      document.title = title;
    }

    // Helper function to safely update or insert meta tags
    const setMetaTag = (attributeName: "name" | "property", attributeValue: string, content: string) => {
      if (!content) return;
      let element = document.querySelector(`meta[${attributeName}="${attributeValue}"]`);
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attributeName, attributeValue);
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };

    // 4. Update Meta Description and Associated Social Crawler Tokens
    if (description) {
      setMetaTag("name", "description", description);
      setMetaTag("property", "og:description", description);
      setMetaTag("property", "twitter:description", description);
    }

    // 5. Update Keywords
    if (keywords) {
      setMetaTag("name", "keywords", keywords);
    }

    // 6. Update Open Graph and Twitter Card Title Fields
    if (title) {
      setMetaTag("property", "og:title", title);
      setMetaTag("property", "twitter:title", title);
    }
  }, [t, i18n.language]);

  return null;
}
