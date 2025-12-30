import { QrCode, Search, Play } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: <QrCode className="w-8 h-8" />,
    title: "Scan the QR Code",
    description: "Find the QR code at the bar and scan it with your phone. No app download needed - it opens right in your browser.",
  },
  {
    number: "02",
    icon: <Search className="w-8 h-8" />,
    title: "Search or Browse",
    description: "Search by song, artist, or genre. Or browse through albums and disks to discover what's available.",
  },
  {
    number: "03",
    icon: <Play className="w-8 h-8" />,
    title: "Get the Numbers",
    description: "Find your song and see the disk number and track number displayed large and clear. Walk to the jukebox and punch it in!",
  },
];

const HowItWorksSection = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-0 w-72 h-72 bg-primary/10 rounded-full blur-[100px] -translate-y-1/2" />
      <div className="absolute top-1/2 right-0 w-72 h-72 bg-accent/10 rounded-full blur-[100px] -translate-y-1/2" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground">
            Three simple steps from walking into the bar to playing your favorite tune.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-20 left-[60%] w-full h-0.5 bg-gradient-to-r from-primary/50 to-transparent" />
              )}

              <div className="text-center">
                {/* Step number */}
                <div className="text-6xl font-display font-bold text-primary/20 mb-4">
                  {step.number}
                </div>

                {/* Icon */}
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center text-primary mb-6">
                  {step.icon}
                </div>

                {/* Content */}
                <h3 className="text-xl font-display font-semibold mb-3">{step.title}</h3>
                <p className="text-muted-foreground max-w-xs mx-auto">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
