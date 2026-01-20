import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Leaf, PlusCircle, BarChart2, Calendar } from "lucide-react";

interface WelcomeGuideProps {
  onStartEntry: () => void;
}

export const WelcomeGuide: React.FC<WelcomeGuideProps> = ({ onStartEntry }) => {
  return (
    <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20 shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-700">
      <CardHeader className="text-center pb-2">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-primary/10 rounded-full">
            <Leaf className="w-12 h-12 text-primary" />
          </div>
        </div>
        <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Welcome to Your Wellness Journey
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8 p-6 md:p-8">
        <p className="text-center text-lg text-muted-foreground max-w-2xl mx-auto">
          Track your cannabis consumption, monitor effects, and discover what works best for your unique physiology.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col items-center text-center space-y-3 p-4 rounded-lg bg-background/50 border border-border/50">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
              <PlusCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-semibold text-lg">Log Entries</h3>
            <p className="text-sm text-muted-foreground">
              Record strains, dosage, and methods. Track how you feel before and after.
            </p>
          </div>

          <div className="flex flex-col items-center text-center space-y-3 p-4 rounded-lg bg-background/50 border border-border/50">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full">
              <BarChart2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-semibold text-lg">View Insights</h3>
            <p className="text-sm text-muted-foreground">
              Visualize trends and find correlations between strains and positive effects.
            </p>
          </div>

          <div className="flex flex-col items-center text-center space-y-3 p-4 rounded-lg bg-background/50 border border-border/50">
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
              <Calendar className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-semibold text-lg">Track History</h3>
            <p className="text-sm text-muted-foreground">
              Review your history with a calendar view and manage your wellness routine.
            </p>
          </div>
        </div>

        <div className="flex justify-center pt-4">
          <Button 
            size="lg" 
            className="gap-2 text-lg px-8 py-6 rounded-full shadow-md hover:shadow-xl transition-all"
            onClick={onStartEntry}
          >
            <PlusCircle className="w-5 h-5" />
            Create Your First Entry
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
