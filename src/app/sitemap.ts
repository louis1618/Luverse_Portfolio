import { getPosts } from "@/utils/posts";
import { baseURL, routes as routesConfig } from "@/resources";

export default async function sitemap() {
  const [blogPosts, workPosts] = await Promise.all([
    getPosts('blog'),
    getPosts('work'),
  ]);

  const blogs = blogPosts.map((post) => ({
    url: `${baseURL}/blog/${post.slug}`,
    lastModified: post.metadata.publishedAt,
  }));

  const works = workPosts.map((post) => ({
    url: `${baseURL}/work/${post.slug}`,
    lastModified: post.metadata.publishedAt,
  }));

  const activeRoutes = Object.keys(routesConfig).filter(
    (route) => routesConfig[route as keyof typeof routesConfig],
  );

  const routes = activeRoutes.map((route) => ({
    url: `${baseURL}${route !== "/" ? route : ""}`,
    lastModified: new Date().toISOString().split("T")[0],
  }));

  return [...routes, ...blogs, ...works];
}
