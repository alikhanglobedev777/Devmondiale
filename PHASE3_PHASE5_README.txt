Dev Mondiale — Phase 3 (homepage copy) + Phase 5 (service pages)
=================================================================
This is an INCREMENTAL patch for the repository AFTER applying:
  1. Devmondiale_HelioHR_UIUX.git.patch
  2. Devmondiale_ProjectCards_HelioHR_CargoStyle_v2.git.patch

WHAT CHANGES
- Homepage: updated titles/descriptions and copy for hero, AI solutions,
  automation previews, projects, development services, About, process, FAQs,
  contact CTAs and footer. All current visuals, assets and showcase controls remain.
- New service directory at /services/ with an overview page and dedicated pages:
    /services/ai-automation/
    /services/erp-development/
    /services/web-development/
    /services/mobile-app-development/
    /services/ui-ux-design/
- Shared, responsive styles at /services/services.css.
- Service cards now link to service detail pages, with paths back to the
  homepage, project showcases and contact options.
- New static content/navigation test: tests/service-pages.test.cjs.

LOCAL TEST COMMANDS (run in the Git repository root)
  git diff --check
  node --test tests/card-touch.test.cjs tests/hrms-gallery.test.cjs tests/service-pages.test.cjs

NOT INCLUDED IN THIS PATCH
- The CargoPro and HelioHR project components themselves are NOT redesigned.
- Canonical URLs, structured data, sitemap.xml, robots.txt, Search Console,
  domain consolidation, Lighthouse scoring and performance changes belong to
  the future technical SEO/performance phases.
- No backend, contact form, paid integrations or analytics service is added.

DEPLOYMENT NOTES
- Uses static directory index.html files. Verify that Vercel serves URLs
  ending in /services/.../ using your actual deployment configuration.
- External Google Fonts are requested as on the main site; system fallbacks exist.
- Page metadata intentionally avoids a canonical domain until the preferred
  production domain is agreed.
- All project/technology claims must be checked against your current offerings
  before publishing. SEO copy alone does not guarantee search rankings.
