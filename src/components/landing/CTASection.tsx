import { NeonButton } from "@/components/ui/NeonButton";
import { ArrowRight, Music2 } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="relative rounded-3xl overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-background to-accent/20" />
          <div className="absolute inset-0 glass-dark" />

          {/* Decorative elements */}
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-primary/30 rounded-full blur-[80px]" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-accent/30 rounded-full blur-[80px]" />

          {/* Content */}
          <div className="relative z-10 py-16 px-8 md:py-24 md:px-16 text-center">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-8 shadow-[0_0_40px_hsl(280_100%_65%/0.5)] animate-float">
              <Music2 className="w-10 h-10 text-primary-foreground" />
            </div>

            <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">
              Ready to Digitize Your Jukebox?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
              Join bars across the country that are making their jukeboxes more accessible. Get started in minutes with our easy setup process.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <NeonButton variant="hero" size="xl">
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </NeonButton>
              <NeonButton variant="glass" size="xl">
                Schedule a Demo
              </NeonButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
