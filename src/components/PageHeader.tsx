import { useNavigate } from "react-router-dom";
import { ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  backTo?: string;
  backLabel?: string;
  showThemeToggle?: boolean;
  actions?: React.ReactNode;
  icon?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  backTo = "/",
  backLabel = "Back",
  showThemeToggle = true,
  actions,
  icon,
}: PageHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="mb-6 sm:mb-8">
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink 
                href="/" 
                onClick={(e) => { e.preventDefault(); navigate("/"); }}
                className="flex items-center gap-1"
              >
                <Home className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only">Home</span>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {breadcrumbs.map((crumb, index) => (
              <span key={crumb.label} className="contents">
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {index === breadcrumbs.length - 1 ? (
                    <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink 
                      href={crumb.href || "#"}
                      onClick={(e) => { 
                        e.preventDefault(); 
                        if (crumb.href) navigate(crumb.href);
                      }}
                    >
                      {crumb.label}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </span>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      )}

      {/* Main Header Row */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
          {/* Back Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(backTo)}
            className="shrink-0 h-10 w-10"
            aria-label={backLabel}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          {/* Title Section */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 sm:gap-3">
              {icon && (
                <span className="shrink-0 text-primary">{icon}</span>
              )}
              <h1 className="text-2xl sm:text-3xl font-bold truncate">{title}</h1>
            </div>
            {description && (
              <p className="text-muted-foreground text-sm sm:text-base mt-1 line-clamp-2">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {actions}
          {showThemeToggle && <ThemeToggle />}
        </div>
      </div>
    </header>
  );
}
