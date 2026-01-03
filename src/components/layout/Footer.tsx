import { Link } from "react-router-dom";
import namjukesLogo from "@/assets/namjukes-logo.png";

const Footer = () => {
  return (
    <footer className="py-12 border-t border-border/30 bg-card">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center mb-4">
              <img 
                src={namjukesLogo} 
                alt="NamJukes" 
                className="h-10 w-auto"
              />
            </Link>
            <p className="text-muted-foreground text-sm">
              The digital companion for every jukebox. Find songs faster, play better music.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-display font-semibold mb-4">Product</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/features" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/demo" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                  Demo
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/privacy" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border/30 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col gap-2">
            <p className="text-muted-foreground text-sm">
              © {new Date().getFullYear()} Namjukes. All rights reserved.
            </p>
            <p className="text-muted-foreground text-sm">
              Founder: <a href="tel:+264813495173" className="text-primary hover:underline">Johannes Masambo</a> | <a href="tel:+264813495173" className="text-primary hover:underline">+264 81 349 5173</a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
