import { readFile } from "node:fs/promises";
import path from "node:path";
import { notFound } from "next/navigation";

const routeToFile = {
  "": "index.php",
  "index.php": "index.php",
  "ai-tools": "ai-tools.php",
  "ai-tools.php": "ai-tools.php",
  "tool-detail": "tool-detail.php",
  "tool-detail.php": "tool-detail.php",
  "courses": "courses.php",
  "courses.php": "courses.php",
  "course-detail": "course-detail.php",
  "course-detail.php": "course-detail.php",
  "certifications": "certifications.php",
  "certifications.php": "certifications.php",
  "dashboard": "dashboard.php",
  "dashboard.php": "dashboard.php",
  "pricing": "pricing.php",
  "pricing.php": "pricing.php",
  "about": "about.php",
  "about.php": "about.php",
  "blog": "blog.php",
  "blog.php": "blog.php",
  "contact": "contact.php",
  "contact.php": "contact.php",
  "case-studies": "case-studies.php",
  "case-studies.php": "case-studies.php",
  "roi-calculator": "roi-calculator.php",
  "roi-calculator.php": "roi-calculator.php",
  "enterprise": "enterprise.php",
  "enterprise.php": "enterprise.php",
  "team-dashboard": "team-dashboard.php",
  "team-dashboard.php": "team-dashboard.php",
  "payroll-ai": "payroll-ai.php",
  "payroll-ai.php": "payroll-ai.php",
  "recruitment-ai": "recruitment-ai.php",
  "recruitment-ai.php": "recruitment-ai.php",
  "reports": "reports.php",
  "reports.php": "reports.php",
  "help-center": "help-center.php",
  "help-center.php": "help-center.php",
  "faq": "faq.php",
  "faq.php": "faq.php",
  "privacy": "privacy.php",
  "privacy.php": "privacy.php",
  "terms": "terms.php",
  "terms.php": "terms.php",
  "my-courses": "my-courses.php",
  "my-courses.php": "my-courses.php",
  "my-certificates": "my-certificates.php",
  "my-certificates.php": "my-certificates.php",
  "careers": "careers.php",
  "careers.php": "careers.php",
  "book-demo": "book-demo.php",
  "book-demo.php": "book-demo.php",
  "thank-you": "thank-you.php",
  "thank-you.php": "thank-you.php",
  "login": "login.php",
  "login.php": "login.php",
  "register": "register.php",
  "register.php": "register.php",
  "admin": "admin.php",
  "admin.php": "admin.php",
  "admin-leads": "admin-leads.php",
  "admin-leads.php": "admin-leads.php",
  "admin-users": "admin-users.php",
  "admin-users.php": "admin-users.php",
  "admin-operations": "admin-operations.php",
  "admin-operations.php": "admin-operations.php",
  "admin-analytics": "admin-analytics.php",
  "admin-analytics.php": "admin-analytics.php",
  "admin-courses": "admin-courses.php",
  "admin-courses.php": "admin-courses.php",
  "admin-tools": "admin-tools.php",
  "admin-tools.php": "admin-tools.php"
};

function stripBody(html) {
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const content = bodyMatch ? bodyMatch[1] : html;
  return content
    .replace(/<script[^>]*src=["']assets\/js\/main\.js["'][^>]*><\/script>/gi, "")
    .trim();
}

export function getRouteKeys() {
  return Object.keys(routeToFile).filter((key) => key !== "" && !key.endsWith(".php"));
}

export async function loadRouteHtml(routeKey) {
  const normalized = routeKey || "";
  const fileName = routeToFile[normalized];

  if (!fileName) {
    notFound();
  }

  const fullPath = path.join(process.cwd(), fileName);
  const raw = await readFile(fullPath, "utf8");
  return stripBody(raw);
}
