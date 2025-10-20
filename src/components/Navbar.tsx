import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "./ui/button";
import { Briefcase } from "lucide-react";
import { LanguageSwitcher } from "./LanguageSwitcher";

const Navbar = () => {
  const { t } = useTranslation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary">
            <Briefcase className="h-6 w-6" />
            <span>Citra Overseas</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              {t('nav.home')}
            </Link>
            <Link to="/jobs" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              {t('nav.jobs')}
            </Link>
            <Link to="/login" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              {t('nav.login')}
            </Link>
            <Link to="/register">
              <Button variant="default" size="sm">
                {t('nav.register')}
              </Button>
            </Link>
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
