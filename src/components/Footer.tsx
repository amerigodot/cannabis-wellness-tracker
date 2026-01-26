import { Link } from "react-router-dom";
import { Lock, Shield, EyeOff, BookOpen, Settings, FileText, Scale, Heart, Sparkles, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const footerLinks = {
  main: [
    { href: "/", label: "Dashboard", icon: Sparkles },
    { href: "/achievements", label: "Achievements", icon: Award },
    { href: "/tools", label: "AI Tools", icon: Settings },
    { href: "/blog", label: "Blog", icon: BookOpen },
  ],
  legal: [
    { href: "/privacy", label: "Privacy Policy", icon: FileText },
    { href: "/terms", label: "Terms of Service", icon: Scale },
    { href: "/features", label: "Features", icon: Sparkles },
  ],
};

export function Footer() {
  return (
    <footer className="w-full border-t border-border py-8 mt-auto">
      <div className="max-w-5xl mx-auto px-4">
        {/* Trust Signals */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Lock className="w-4 h-4" />
            <span>Encrypted & Private</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="w-4 h-4" />
            <span>You Own Your Data</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <EyeOff className="w-4 h-4" />
            <span>No Ads</span>
          </div>
        </div>

        <Separator className="my-6" />
        
        {/* Footer Navigation */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-6">
          {/* Main Links */}
          <div>
            <h3 className="font-semibold text-sm mb-3">Navigation</h3>
            <ul className="space-y-2">
              {footerLinks.main.map((link) => (
                <li key={link.href}>
                  <Link 
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                  >
                    <link.icon className="h-3.5 w-3.5" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold text-sm mb-3">Legal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link 
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                  >
                    <link.icon className="h-3.5 w-3.5" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className="col-span-2 sm:col-span-2">
            <h3 className="font-semibold text-sm mb-3">Support the Project</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Help keep this app free, private, and ad-free for everyone.
            </p>
            <Link 
              to="/donate"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              <Heart className="h-4 w-4" />
              Support Us
              <Badge 
                variant="default" 
                className="animate-pulse bg-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.5)]"
              >
                💝
              </Badge>
            </Link>
          </div>
        </div>
        
        {/* Copyright */}
        <Separator className="my-6" />
        <p className="text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Cannabis Wellness Tracker. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
