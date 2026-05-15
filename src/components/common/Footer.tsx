import { Link } from 'react-router-dom';
import { Brain, Mail } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 xl:gap-12">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link to="/home" className="flex items-center gap-3 group w-fit">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-xl blur-md"></div>
                <div className="relative p-2 bg-gradient-to-br from-primary to-primary/80 rounded-xl shadow-lg">
                  <Brain className="h-7 w-7 text-primary-foreground" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Aptix
                </span>
                <span className="text-xs text-muted-foreground font-medium -mt-1">
                  Master Your Aptitude
                </span>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Empowering students to excel in aptitude tests through systematic learning,
              comprehensive practice, and detailed performance analytics.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-base font-semibold text-foreground mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/learn" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Learning Topics
                </Link>
              </li>
              <li>
                <Link to="/test" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Practice Tests
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-base font-semibold text-foreground mb-4">Resources</h3>
            <ul className="space-y-3">
              <li>
                <span className="text-sm text-muted-foreground">8 Core Topics</span>
              </li>
              <li>
                <span className="text-sm text-muted-foreground">Practice Problems</span>
              </li>
              <li>
                <span className="text-sm text-muted-foreground">Step-by-Step Solutions</span>
              </li>
              <li>
                <span className="text-sm text-muted-foreground">Performance Analytics</span>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="text-base font-semibold text-foreground mb-4">Support</h3>
            <p className="text-sm text-muted-foreground mb-4">
              For any technical issues or queries, please reach out via email.
            </p>
            <div className="flex gap-3">
              <a
                href="https://mail.google.com/mail/?view=cm&fs=1&to=varsharg21@gmail.com,sujithanavalar27@gmail.com&su=Aptix Support Request"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-6 h-12 rounded-xl border-2 border-[#0f2e6e]/5 hover:border-[#0f2e6e] text-[#0f2e6e] hover:bg-[#0f2e6e] hover:text-white font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 group w-fit shadow-sm"
                aria-label="Contact Support via Gmail"
              >
                <Mail className="h-4 w-4 text-[#ff7f0e] group-hover:scale-110 transition-transform" /> Contact Support
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                <Brain className="h-4 w-4 text-[#0f2e6e]" />
              </div>
              <p className="text-[10px] font-black text-[#0f2e6e] uppercase tracking-[0.2em]">
                Developed by <span className="text-[#ff7f0e]">Varsha R G</span> & <span className="text-[#ff7f0e]">Sujitha N</span>
              </p>
            </div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
              <span className="font-black text-slate-600">CSE Department</span> • {currentYear} Aptix
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
