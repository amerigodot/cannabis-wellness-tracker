import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { ArrowLeft, Calendar, Clock, Tag, Share2 } from "lucide-react";
import { getPostBySlug, getRelatedPosts } from "@/data/blogPosts";
import ReactMarkdown from "react-markdown";
import { useToast } from "@/hooks/use-toast";

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const post = slug ? getPostBySlug(slug) : undefined;
  const relatedPosts = slug ? getRelatedPosts(slug, 3) : [];

  useEffect(() => {
    if (!post) {
      navigate("/blog");
    }
  }, [post, navigate]);

  if (!post) {
    return null;
  }

  const handleShare = async () => {
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: url,
        });
      } catch (err) {
        // User cancelled or error occurred
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(url);
      toast({
        title: "Link copied!",
        description: "Article link copied to clipboard",
      });
    }
  };

  return (
    <>
      <SEO 
        title={`${post.title} - Medical Marijuana Journal Blog`}
        description={post.metaDescription}
        keywords={post.metaKeywords}
        canonicalUrl={`https://medical-marijuana-journal.lovable.app/blog/${post.slug}`}
        ogImage={post.imageUrl}
        ogType="article"
      />
      <div className="min-h-screen flex flex-col bg-background">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        
        <article className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
          <Button
            variant="ghost"
            onClick={() => navigate("/blog")}
            className="mb-8"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Button>

          {/* Article Header */}
          <header className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary">{post.category}</Badge>
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {post.readTime}
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{post.title}</h1>
            
            <div className="flex items-center justify-between flex-wrap gap-4 text-muted-foreground mb-6">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(post.publishedAt).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
                <span>By {post.author}</span>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="gap-2"
              >
                <Share2 className="w-4 h-4" />
                Share
              </Button>
            </div>

            <img
              src={post.imageUrl}
              alt={post.title}
              className="w-full h-[400px] object-cover rounded-lg mb-6"
            />

            <p className="text-lg text-muted-foreground">{post.excerpt}</p>
          </header>

          <Separator className="my-8" />

          {/* Article Content */}
          <div className="prose prose-lg dark:prose-invert max-w-none mb-8">
            <ReactMarkdown
              components={{
                h1: ({ node, ...props }) => <h1 className="text-3xl font-bold mt-8 mb-4" {...props} />,
                h2: ({ node, ...props }) => <h2 className="text-2xl font-semibold mt-6 mb-3" {...props} />,
                h3: ({ node, ...props }) => <h3 className="text-xl font-semibold mt-4 mb-2" {...props} />,
                p: ({ node, ...props }) => <p className="mb-4 leading-relaxed" {...props} />,
                ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-4 space-y-2" {...props} />,
                ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-4 space-y-2" {...props} />,
                li: ({ node, ...props }) => <li className="ml-4" {...props} />,
                strong: ({ node, ...props }) => <strong className="font-semibold text-foreground" {...props} />,
                em: ({ node, ...props }) => <em className="italic" {...props} />,
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>

          <Separator className="my-8" />

          {/* Article Footer */}
          <footer>
            <div className="mb-6">
              <h3 className="text-sm font-semibold mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {post.tags.map(tag => (
                  <Badge key={tag} variant="outline" className="cursor-pointer">
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {relatedPosts.length > 0 && (
              <>
                <Separator className="my-8" />
                
                <div className="mb-8">
                  <h3 className="text-2xl font-semibold mb-6">Related Articles</h3>
                  <div className="grid md:grid-cols-3 gap-6">
                    {relatedPosts.map(relatedPost => (
                      <Card 
                        key={relatedPost.id} 
                        className="cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => navigate(`/blog/${relatedPost.slug}`)}
                      >
                        <img
                          src={relatedPost.imageUrl}
                          alt={relatedPost.title}
                          className="w-full h-48 object-cover rounded-t-lg"
                        />
                        <CardContent className="pt-4">
                          <Badge variant="secondary" className="mb-2">
                            {relatedPost.category}
                          </Badge>
                          <h4 className="font-semibold mb-2 line-clamp-2">
                            {relatedPost.title}
                          </h4>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {relatedPost.excerpt}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {relatedPost.readTime}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </>
            )}

            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-2">Start Your Wellness Journey</h3>
                <p className="text-muted-foreground mb-4">
                  Ready to track your medical marijuana use and discover what works best for you? 
                  Start journaling today with our free, private tracking tool.
                </p>
                <div className="flex gap-3">
                  <Button onClick={() => navigate("/auth")}>
                    Get Started Free
                  </Button>
                  <Button variant="outline" onClick={() => navigate("/")}>
                    Try Demo Mode
                  </Button>
                </div>
              </CardContent>
            </Card>
          </footer>
        </article>

        <Footer />
      </div>
    </>
  );
}
