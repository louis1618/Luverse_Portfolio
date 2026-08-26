import { getPosts } from "@/utils/posts";
import { baseURL, work, person } from "@/resources";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  const posts = await getPosts('work');

  // Sort posts by date (newest first)
  const sortedPosts = posts.sort((a, b) => {
    return new Date(b.metadata.publishedAt).getTime() - new Date(a.metadata.publishedAt).getTime();
  });

  // Generate RSS XML
  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${work.title}</title>
    <link>${baseURL}/work</link>
    <description>${work.description}</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseURL}/api/rss/work" rel="self" type="application/rss+xml" />
    <managingEditor>${person.email || "noreply@example.com"} (${person.name})</managingEditor>
    <webMaster>${person.email || "noreply@example.com"} (${person.name})</webMaster>
    <image>
      <url>${baseURL}${person.avatar || "/images/avatar.jpg"}</url>
      <title>${work.title}</title>
      <link>${baseURL}/work</link>
    </image>
    ${sortedPosts
      .map(
        (post) => `
    <item>
      <title>${post.metadata.title}</title>
      <link>${baseURL}/work/${post.slug}</link>
      <guid>${baseURL}/work/${post.slug}</guid>
      <pubDate>${new Date(post.metadata.publishedAt).toUTCString()}</pubDate>
      <description><![CDATA[${post.metadata.summary}]]></description>
      ${post.metadata.image ? `<enclosure url="${baseURL}${post.metadata.image}" type="image/jpeg" />` : ""}
      ${post.metadata.tag ? `<category>${post.metadata.tag}</category>` : ""}
      <author>${person.email || "noreply@example.com"} (${person.name})</author>
    </item>`,
      )
      .join("")}
  </channel>
</rss>`;

  return new NextResponse(rssXml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
