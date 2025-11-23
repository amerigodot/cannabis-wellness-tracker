import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, Coffee, Sparkles, Crown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Footer } from "@/components/Footer";
import { cn } from "@/lib/utils";

const contributionTiers = [
  {
    id: "supporter",
    name: "Supporter",
    icon: Coffee,
    amount: "$5",
    description: "Buy us a coffee",
    features: [
      "Covers hosting for 50 users for a month",
      "Supports 2 hours of development work",
      "Helps maintain server infrastructure"
    ],
    color: "primary"
  },
  {
    id: "contributor",
    name: "Contributor",
    icon: Heart,
    amount: "$15",
    description: "Show your appreciation",
    features: [
      "Covers hosting for 150 users for a month",
      "Funds 6 hours of feature development",
      "Supports database backup and security",
      "Enables one major bug fix or improvement"
    ],
    color: "secondary",
    popular: true
  },
  {
    id: "champion",
    name: "Champion",
    icon: Crown,
    amount: "$50",
    description: "Become a wellness champion",
    features: [
      "Covers hosting for 500 users for a month",
      "Funds 20 hours of feature development",
      "Enables development of a complete new feature",
      "Supports third-party integrations",
      "Helps us reach sustainability goals"
    ],
    color: "accent"
  }
];

export default function Donate() {
  const navigate = useNavigate();
  const [selectedTier, setSelectedTier] = useState<string | null>(null);

  const handleContribute = (tierId: string) => {
    setSelectedTier(tierId);
    // TODO: Integrate with payment processor (Stripe)
    console.log("Selected tier:", tierId);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <div className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-8"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Heart className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Support Cannabis Wellness Tracker</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your contribution helps us keep this app free, private, and ad-free for everyone. 
            Every donation directly supports development, hosting, and new features.
          </p>
        </div>

        {/* Contribution Tiers */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {contributionTiers.map((tier) => {
            const Icon = tier.icon;
            const isSelected = selectedTier === tier.id;
            
            return (
              <Card 
                key={tier.id}
                className={cn(
                  "relative border-2 transition-all hover:shadow-hover",
                  tier.popular && "border-primary shadow-soft",
                  isSelected && "ring-2 ring-ring"
                )}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Most Popular
                    </span>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className={cn(
                    "inline-flex items-center justify-center w-12 h-12 rounded-full mx-auto mb-3",
                    tier.color === "primary" && "bg-primary/10",
                    tier.color === "secondary" && "bg-secondary/10",
                    tier.color === "accent" && "bg-accent/10"
                  )}>
                    <Icon className={cn(
                      "w-6 h-6",
                      tier.color === "primary" && "text-primary",
                      tier.color === "secondary" && "text-secondary",
                      tier.color === "accent" && "text-accent"
                    )} />
                  </div>
                  <CardTitle className="text-2xl">{tier.name}</CardTitle>
                  <div className="text-3xl font-bold mt-2">{tier.amount}</div>
                  <CardDescription>{tier.description}</CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className="w-full"
                    variant={tier.popular ? "default" : "outline"}
                    onClick={() => handleContribute(tier.id)}
                  >
                    Support with {tier.amount}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Why Support Section */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl">Why Your Support Matters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-foreground mb-2">🔒 Privacy First</h3>
                <p className="text-sm">
                  We don't sell your data or show ads. Your contributions allow us to maintain this 
                  commitment to privacy while covering server costs and development.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">🚀 Continuous Development</h3>
                <p className="text-sm">
                  Your support enables us to add new features, improve existing ones, and keep 
                  the app modern and secure with regular updates.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">🌱 Community Driven</h3>
                <p className="text-sm">
                  We build features based on community feedback. Supporters get priority 
                  consideration for feature requests and direct communication with our team.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">💚 Free for Everyone</h3>
                <p className="text-sm">
                  Your generosity helps keep this app accessible to everyone who needs it, 
                  regardless of their ability to pay.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Other Ways to Support */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Other Ways to Support</CardTitle>
            <CardDescription>
              Can't contribute financially? Here are other ways you can help:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span><strong className="text-foreground">Spread the word:</strong> Share the app with friends who might benefit from it</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span><strong className="text-foreground">Provide feedback:</strong> Tell us what features you'd like to see or report bugs</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span><strong className="text-foreground">Write a review:</strong> Share your experience to help others discover the app</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span><strong className="text-foreground">Contribute ideas:</strong> Suggest improvements and help shape the future of the app</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <div className="mt-12 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Is my contribution tax-deductible?</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Currently, contributions are not tax-deductible as we are not a registered 
                non-profit organization. We're exploring options for the future.
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Will the app remain free?</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Yes! We're committed to keeping the core functionality free for everyone. 
                Your support helps us maintain this commitment.
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I cancel my support?</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                All contributions are one-time payments. There are no recurring charges or 
                subscriptions to cancel. You have full control over when and how much you give.
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How is my contribution used?</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                100% of contributions go toward server hosting, development tools, maintenance, 
                and new feature development. We're committed to transparency about how funds are used.
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
