import { getRouteKeys, loadRouteHtml } from "@/lib/html-loader";

export const dynamicParams = false;

export async function generateStaticParams() {
  return [{ slug: [] }, ...getRouteKeys().map((route) => ({ slug: route.split("/") }))];
}

export default async function Page({ params }) {
  const resolvedParams = await params;
  const route = resolvedParams?.slug?.join("/") || "";
  const html = await loadRouteHtml(route);
  return <div suppressHydrationWarning dangerouslySetInnerHTML={{ __html: html }} />;
}
