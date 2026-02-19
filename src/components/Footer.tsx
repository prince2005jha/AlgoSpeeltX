import { Github, FileText, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="border-t bg-muted/30 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              AlgoSplitX
            </h3>
            <p className="text-sm text-muted-foreground">
              Built on Algorand. Designed for simplicity.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/create" className="hover:text-primary transition-smooth">
                  Create Payment
                </Link>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-primary transition-smooth">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-primary transition-smooth">
                  Features
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-primary transition-smooth">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-smooth">
                  API Reference
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-smooth">
                  Support
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">Connect</h4>
            <div className="flex space-x-4">
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-muted hover:bg-primary/10 flex items-center justify-center transition-smooth hover-lift"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-muted hover:bg-primary/10 flex items-center justify-center transition-smooth hover-lift"
              >
                <FileText className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-muted hover:bg-primary/10 flex items-center justify-center transition-smooth hover-lift"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>© 2026 TeamWarer. Built with ❤️ on Algorand.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
