export function Footer() {
  return (
    <footer className="w-full border-t border-border py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row justify-center items-center gap-6 text-sm text-muted-foreground">
          <a 
            href="/privacy" 
            className="hover:text-foreground transition-colors"
          >
            Privacy Policy
          </a>
          <a 
            href="/terms" 
            className="hover:text-foreground transition-colors"
          >
            Terms of Service
          </a>
          <a 
            href="/donate" 
            className="hover:text-foreground transition-colors"
          >
            Support Us
          </a>
        </div>
        <p className="text-center text-xs text-muted-foreground mt-4">
          © {new Date().getFullYear()} Cannabis Wellness Tracker. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
