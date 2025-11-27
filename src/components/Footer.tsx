import { Lock, Shield, EyeOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function Footer() {
  return (
    <footer className="w-full border-t border-border py-8">
      <div className="max-w-4xl mx-auto px-4">
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
        
        {/* Footer Links */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-6 text-sm text-muted-foreground">
          <a 
            href="/blog" 
            className="hover:text-foreground transition-colors font-medium"
          >
            Blog
          </a>
          <a 
            href="/settings" 
            className="hover:text-foreground transition-colors font-medium"
          >
            Settings
          </a>
          <a 
            href="/privacy" 
            className="hover:text-foreground transition-colors font-medium"
          >
            Privacy Policy
          </a>
          <a 
            href="/terms" 
            className="hover:text-foreground transition-colors font-medium"
          >
            Terms of Service
          </a>
          <a 
            href="/donate" 
            className="hover:text-foreground transition-colors flex items-center gap-2 font-medium"
          >
            Support Us
            <Badge 
              variant="default" 
              className="animate-pulse bg-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.5)]"
            >
              💝
            </Badge>
          </a>
        </div>
        
        {/* Copyright */}
        <p className="text-center text-xs text-muted-foreground mt-4">
          © {new Date().getFullYear()} Cannabis Wellness Tracker. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
