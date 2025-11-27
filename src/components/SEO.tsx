import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogType?: string;
  canonicalUrl?: string;
  noindex?: boolean;
}

export const SEO = ({
  title = "Medical Marijuana Journal - Track Your Wellness Journey",
  description = "Private, encrypted journal to track medical marijuana use. Monitor THC/CBD levels, discover patterns, and optimize your wellness with smart insights and AI-powered analysis.",
  keywords = "medical marijuana journal, cannabis tracker, THC CBD tracking, wellness journal, strain tracking, private health journal",
  ogImage = "https://storage.googleapis.com/gpt-engineer-file-uploads/Xh5SEatm4iRWgsiGoF3q49KhLhX2/social-images/social-1760110342852-IMG_5649.jpeg",
  ogType = "website",
  canonicalUrl = "https://medical-marijuana-journal.lovable.app/",
  noindex = false,
}: SEOProps) => {
  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  );
};
