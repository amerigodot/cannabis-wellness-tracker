import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { PageHeader } from "@/components/PageHeader";
import { Search, Calendar, Clock, Tag, BookOpen } from "lucide-react";
import { blogPosts, getAllCategories, getAllTags } from "@/data/blogPosts";

export default function Blog() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const categories = getAllCategories();
  const tags = getAllTags();

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = searchQuery === "" || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = !selectedCategory || post.category === selectedCategory;
    const matchesTag = !selectedTag || post.tags.includes(selectedTag);
    
    return matchesSearch && matchesCategory && matchesTag;
  });

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCategory(null);
    setSelectedTag(null);
  };

  return (
    <>
      <SEO 
        title="Blog - Medical Marijuana Tracking & Wellness Tips"
        description="Expert guides on medical marijuana tracking, strain selection, THC/CBD ratios, and wellness optimization. Learn how to get the most from your medical cannabis journey."
        keywords="medical marijuana blog, cannabis tracking guide, strain guides, THC CBD education, wellness tips"
        canonicalUrl="https://medical-marijuana-journal.lovable.app/blog"
      />
      <div className="min-h-screen flex flex-col bg-background">
        <div className="flex-1 container mx-auto px-4 py-6 sm:py-8 max-w-7xl">
          <PageHeader
            title="Blog"
            description="Expert articles on tracking, strain selection, and wellness optimization"
            breadcrumbs={[{ label: "Blog" }]}
            icon={<BookOpen className="h-6 w-6 sm:h-7 sm:w-7" />}
          />

          {/* Search and Filters */}
          <div className="mb-8 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex flex-wrap gap-4">
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-medium text-muted-foreground self-center">Categories:</span>
                {categories.map(category => (
                  <Badge
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-muted-foreground self-center">Tags:</span>
              {tags.map(tag => (
                <Badge
                  key={tag}
                  variant={selectedTag === tag ? "default" : "secondary"}
                  className="cursor-pointer"
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                >
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>

            {(searchQuery || selectedCategory || selectedTag) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
              >
                Clear All Filters
              </Button>
            )}
          </div>

          {/* Blog Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {filteredPosts.map(post => (
              <Card 
                key={post.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate(`/blog/${post.slug}`)}
              >
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">{post.category}</Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {post.readTime}
                    </span>
                  </div>
                  <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                  <CardDescription className="line-clamp-3">
                    {post.excerpt}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(post.publishedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                    <span>{post.author}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {post.tags.slice(0, 3).map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">
                No articles found matching your filters. Try adjusting your search criteria.
              </p>
            </div>
          )}
        </div>

        <Footer />
      </div>
    </>
  );
}
