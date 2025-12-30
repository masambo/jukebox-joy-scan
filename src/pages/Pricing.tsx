import { Check, Music } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const pricingTiers = [
  {
    name: 'Starter',
    price: 300,
    albums: '100',
    description: 'Perfect for small bars and venues',
    features: [
      'Up to 100 albums',
      'QR code jukebox access',
      'Custom bar branding',
      'Song request management',
      'Basic analytics',
    ],
  },
  {
    name: 'Professional',
    price: 500,
    albums: '200',
    description: 'Ideal for growing venues',
    features: [
      'Up to 200 albums',
      'QR code jukebox access',
      'Custom bar branding',
      'Song request management',
      'Advanced analytics',
      'Priority support',
    ],
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 1000,
    albums: '300',
    description: 'For large establishments',
    features: [
      'Up to 300 albums',
      'QR code jukebox access',
      'Custom bar branding',
      'Song request management',
      'Full analytics suite',
      'Priority support',
      'Multiple playlists',
    ],
  },
  {
    name: 'Custom',
    price: null,
    albums: '300+',
    description: 'For venues needing more',
    features: [
      'Unlimited albums',
      'All Enterprise features',
      'Dedicated account manager',
      'Custom integrations',
      'White-label options',
      'Volume discounts',
    ],
  },
];

export default function Pricing() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4">
              <Music className="h-8 w-8 text-primary" />
              <span className="text-2xl font-heading font-bold">Namjukes</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">
              Simple, Transparent <span className="text-glow text-primary">Pricing</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Choose the plan that fits your venue. All plans include full access to our digital jukebox platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {pricingTiers.map((tier) => (
              <Card 
                key={tier.name} 
                className={`glass relative flex flex-col ${tier.popular ? 'neon-border ring-2 ring-primary' : 'border-border/50'}`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-xl font-heading">{tier.name}</CardTitle>
                  <CardDescription className="text-sm">{tier.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <div className="text-center mb-6">
                    {tier.price !== null ? (
                      <>
                        <span className="text-4xl font-bold">N${tier.price}</span>
                        <span className="text-muted-foreground text-sm block mt-1">once-off</span>
                      </>
                    ) : (
                      <span className="text-3xl font-bold">Contact Us</span>
                    )}
                    <p className="text-sm text-muted-foreground mt-1">
                      Up to {tier.albums} albums
                    </p>
                  </div>
                  
                  <ul className="space-y-3 mb-6 flex-1">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className="w-full" 
                    variant={tier.popular ? 'default' : 'outline'}
                    asChild
                  >
                    <Link to={tier.price !== null ? '/auth' : 'mailto:contact@namjukes.com'}>
                      {tier.price !== null ? 'Get Started' : 'Contact Sales'}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-muted-foreground">
              All prices are in Namibian Dollars (N$). Once-off payment, no recurring fees.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
