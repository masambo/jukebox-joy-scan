import { NeonButton } from "@/components/ui/NeonButton";
import { QrCode, Music, Search } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-jukebox-new.png";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Neon jukebox in a bar"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 pt-24 pb-16 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold mb-8 leading-tight">
            Find Your Song
            <br />
            <span className="text-primary text-glow">In Seconds</span>
          </h1>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link to="/demo">
              <NeonButton variant="hero" size="xl">
                <QrCode className="w-5 h-5" />
                Try Demo Jukebox
              </NeonButton>
            </Link>
            <Link to="/pricing">
              <NeonButton variant="glass" size="xl">
                For Bar Owners
              </NeonButton>
            </Link>
          </div>

          {/* Features Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <FeatureCard
              icon={<QrCode className="w-6 h-6" />}
              title="Scan & Go"
              description="One QR code opens your bar's entire jukebox catalog"
            />
            <FeatureCard
              icon={<Search className="w-6 h-6" />}
              title="Smart Search"
              description="Find songs by title, artist, genre, or disk number"
            />
            <FeatureCard
              icon={<Music className="w-6 h-6" />}
              title="Big Numbers"
              description="Disk & track displayed large for easy reading"
            />
          </div>
        </div>
      </div>

      {/* Decorative glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
    </section>
  );
};

const FeatureCard = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => (
  <div className="glass-dark rounded-xl p-6 border border-border/30 hover:border-primary/50 transition-all hover:shadow-[0_0_30px_hsl(280_100%_65%/0.2)]">
    <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center text-primary mb-4 mx-auto">
      {icon}
    </div>
    <h3 className="text-lg font-display font-semibold mb-2">{title}</h3>
    <p className="text-sm text-muted-foreground">{description}</p>
  </div>
);

export default HeroSection;
