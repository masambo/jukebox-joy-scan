import { Music2, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { NeonButton } from "@/components/ui/NeonButton";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-dark border-b border-border/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-[0_0_20px_hsl(280_100%_65%/0.5)] group-hover:shadow-[0_0_30px_hsl(280_100%_65%/0.7)] transition-shadow">
              <Music2 className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl md:text-2xl font-display font-bold text-foreground">
              Nam<span className="text-primary text-glow">jukes</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              Home
            </Link>
            <Link to="/demo" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              Demo
            </Link>
            <Link to="/features" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              Features
            </Link>
            <Link to="/pricing" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              Pricing
            </Link>
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/auth">
              <NeonButton variant="ghost" size="sm">
                Login
              </NeonButton>
            </Link>
            <Link to="/pricing">
              <NeonButton variant="hero" size="sm">
                Get Started
              </NeonButton>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-foreground"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/30">
            <nav className="flex flex-col gap-4">
              <Link
                to="/"
                className="text-foreground hover:text-primary transition-colors font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/demo"
                className="text-foreground hover:text-primary transition-colors font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Demo
              </Link>
              <Link
                to="/features"
                className="text-foreground hover:text-primary transition-colors font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                to="/pricing"
                className="text-foreground hover:text-primary transition-colors font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Pricing
              </Link>
              <div className="flex gap-3 pt-4 border-t border-border/30">
                <Link to="/auth" className="flex-1" onClick={() => setIsMenuOpen(false)}>
                  <NeonButton variant="ghost" size="sm" className="w-full">
                    Login
                  </NeonButton>
                </Link>
                <Link to="/pricing" className="flex-1" onClick={() => setIsMenuOpen(false)}>
                  <NeonButton variant="hero" size="sm" className="w-full">
                    Get Started
                  </NeonButton>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
