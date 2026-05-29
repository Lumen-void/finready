import Script from "next/script";
import "../assets/css/styles.css";

export const metadata = {
  metadataBase: new URL("https://finready.ai"),
  title: "FinReady",
  description:
    "AI-based tools for B2B finance, financial literacy education, online courses, payroll management, recruitment services, and AI learning tools.",
  openGraph: {
    title: "FinReady",
    description:
      "AI tools and certification-led learning for finance teams, students, and professionals.",
    type: "website",
    url: "https://finready.ai",
    images: ["/assets/images/hero-dashboard.svg"]
  },
  twitter: {
    card: "summary_large_image",
    title: "FinReady",
    description:
      "AI tools and certification-led learning for finance teams, students, and professionals.",
    images: ["/assets/images/hero-dashboard.svg"]
  },
  icons: {
    icon: "/assets/images/favicon.svg"
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Script src="/assets/js/main.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
