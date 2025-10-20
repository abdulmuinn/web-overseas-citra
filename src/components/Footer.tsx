import { Briefcase, Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-primary text-primary-foreground mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 font-bold text-xl">
              <Briefcase className="h-6 w-6" />
              <span>Citra Overseas</span>
            </div>
            <p className="text-sm text-primary-foreground/80">
              {t('footer.description')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">{t('footer.quickLinks') || 'Quick Links'}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-secondary transition-colors">
                  {t('nav.home')}
                </Link>
              </li>
              <li>
                <Link to="/jobs" className="hover:text-secondary transition-colors">
                  {t('nav.jobs')}
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-secondary transition-colors">
                  {t('nav.login')}
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-secondary transition-colors">
                  {t('nav.register')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold mb-4">{t('footer.contact') || 'Contact'}</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <Mail className="h-4 w-4 mt-1 flex-shrink-0" />
                <span>info@citraoverseas.com</span>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="h-4 w-4 mt-1 flex-shrink-0" />
                <span>+62 21 1234 5678</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-1 flex-shrink-0" />
                <span>Jakarta, Indonesia</span>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4">{t('footer.legal') || 'Legal'}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-secondary transition-colors">
                  {t('footer.privacy') || 'Privacy Policy'}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-secondary transition-colors">
                  {t('footer.terms') || 'Terms & Conditions'}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-sm text-primary-foreground/60">
          <p>&copy; {new Date().getFullYear()} PT Citra Insan Mandiri. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
