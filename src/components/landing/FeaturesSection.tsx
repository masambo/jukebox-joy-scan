import { Camera, Palette, BarChart3, Users, Smartphone, Wifi } from "lucide-react";

const features = [
  {
    icon: <Camera className="w-8 h-8" />,
    title: "AI Album Scanning",
    description: "Take a photo of any album track listing and our AI automatically extracts song titles, track numbers, and more.",
    color: "primary",
  },
  {
    icon: <Palette className="w-8 h-8" />,
    title: "Custom Branding",
    description: "Each bar gets a unique look with custom logos, colors, and themes that match their vibe.",
    color: "secondary",
  },
  {
    icon: <BarChart3 className="w-8 h-8" />,
    title: "Analytics Dashboard",
    description: "See which songs are most popular, peak usage times, and user engagement metrics.",
    color: "accent",
  },
  {
    icon: <Users className="w-8 h-8" />,
    title: "Multi-Role Access",
    description: "Super admin, bar managers, and patrons each get tailored experiences and permissions.",
    color: "primary",
  },
  {
    icon: <Smartphone className="w-8 h-8" />,
    title: "Mobile-First Design",
    description: "Built for bar lighting with high contrast, large touch targets, and drunk-friendly UX.",
    color: "secondary",
  },
  {
    icon: <Wifi className="w-8 h-8" />,
    title: "Offline Ready",
    description: "Works even with spotty WiFi - patrons can browse the catalog without connectivity.",
    color: "accent",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-24 bg-card">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">
            Everything You Need
          </h2>
          <p className="text-lg text-muted-foreground">
            A complete solution for digitizing bar jukeboxes with powerful features for owners, managers, and patrons.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-8 rounded-2xl bg-background border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_40px_hsl(280_100%_65%/0.15)]"
            >
              <div
                className={`w-16 h-16 rounded-xl flex items-center justify-center mb-6 transition-all duration-300 ${
                  feature.color === "primary"
                    ? "bg-primary/20 text-primary group-hover:bg-primary group-hover:text-primary-foreground"
                    : feature.color === "secondary"
                    ? "bg-secondary/20 text-secondary group-hover:bg-secondary group-hover:text-secondary-foreground"
                    : "bg-accent/20 text-accent group-hover:bg-accent group-hover:text-accent-foreground"
                }`}
              >
                {feature.icon}
              </div>
              <h3 className="text-xl font-display font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
