import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { lazy, Suspense } from "react";
import { useGlobalReminders } from "@/hooks/useGlobalReminders";

// Lazy load route components for code splitting
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const Trash = lazy(() => import("./pages/Trash"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const Donate = lazy(() => import("./pages/Donate"));
const Achievements = lazy(() => import("./pages/Achievements"));
const Tools = lazy(() => import("./pages/Tools"));
const Triage = lazy(() => import("./pages/Triage"));
const Coach = lazy(() => import("./pages/Coach"));
const Settings = lazy(() => import("./pages/Settings"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const Features = lazy(() => import("./pages/Features"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const AppContent = () => {
  useGlobalReminders();
  
  return (
    <BrowserRouter>
          <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/trash" element={<Trash />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/donate" element={<Donate />} />
              <Route path="/achievements" element={<Achievements />} />
              <Route path="/tools" element={<Tools />} />
              <Route path="/triage" element={<Triage />} />
              <Route path="/coach" element={<Coach />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/features" element={<Features />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppContent />
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
