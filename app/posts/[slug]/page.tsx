/**
 * app/posts/[slug]/page.tsx
 * Redirects to the canonical category URL: /{category}/{slug}
 * This preserves the WordPress permalink structure and keeps a single
 * canonical URL per post. If the post has no category, renders inline.
 */

import { redirect, notFound } from "next/navigation";
import { getPostBySlug, getAllPostSlugs, getPrimaryCategory } from "@/lib/wordpress";

export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await getAllPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function PostSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) notFound();

  const category = getPrimaryCategory(post);
  if (category) {
    // Redirect to canonical category-based URL
    redirect(`/${category.slug}/${post.slug}`);
  }

  // Fallback for posts with no category
  const PostPage = (await import("@/components/PostPage")).default;
  return <PostPage post={post} />;
}
