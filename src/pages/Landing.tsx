import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shield, Globe, Users, CheckCircle, Star } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatBot from "@/components/ChatBot";
import { useTranslation } from "react-i18next";

const Landing = () => {
  const benefits = [
    {
      icon: Shield,
  title: "Aman & Legal",
  description: "Semua program dijamin legalitas dan keamanannya",
    },
    {
      icon: Globe,
      title: "Negara Terpilih",
      description: "Kesempatan bekerja di berbagai negara maju",
    },
    {
      icon: Users,
      title: "Pendampingan Penuh",
      description: "Didampingi dari awal hingga keberangkatan",
    },
  ];

  const testimonials = [
    {
      name: "Rina Susanti",
      country: "Jepang",
      rating: 5,
      text: "Prosesnya cepat dan transparan. Sekarang saya bekerja di Jepang dengan gaji yang memuaskan!",
    },
    {
      name: "Ahmad Fauzi",
      country: "Korea Selatan",
      rating: 5,
      text: "Tim Citra Overseas sangat membantu. Semua dokumen diurus dengan baik dan profesional.",
    },
    {
      name: "Siti Nurhaliza",
      country: "Singapura",
      rating: 5,
      text: "Impian kerja di luar negeri saya tercapai berkat Citra Overseas. Terima kasih!",
    },
  ];

  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 bg-gradient-hero">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground mb-6 whitespace-pre-line">
              {t('landing.hero.title')}
            </h1>
            <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
              {t('landing.hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" variant="secondary" className="text-lg px-8">
                  {t('landing.hero.register')}
                </Button>
              </Link>
              <Link to="/jobs">
                <Button size="lg" variant="outline" className="text-lg px-8 bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30">
                  {t('landing.hero.jobs')}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t('landing.benefits.title')}
            </h2>
            <p className="text-muted-foreground text-lg">
              {t('landing.benefits.description')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary/10 mb-4">
                    <benefit.icon className="h-8 w-8 text-secondary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{t(`landing.benefits.items.${idx}.title`)}</h3>
                  <p className="text-muted-foreground">{t(`landing.benefits.items.${idx}.description`)}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t('landing.process.title')}
            </h2>
            <p className="text-muted-foreground text-lg">
              {t('landing.process.description')}
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            {t('landing.process.steps', { returnObjects: true }).map((step: string, idx: number) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="flex items-start gap-4"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  {idx + 1}
                </div>
                <div className="flex-1 pt-2">
                  <p className="text-lg">{step}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Testimoni Alumni
            </h2>
            <p className="text-muted-foreground text-lg">
              Dengarkan cerita sukses dari peserta kami
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-secondary text-secondary" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">"{testimonial.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="font-bold text-primary">{testimonial.name[0]}</span>
                    </div>
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.country}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-hero">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-6">
              {t('landing.cta.title')}
            </h2>
            <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
              {t('landing.cta.subtitle')}
            </p>
            <Link to="/register">
                <Button size="lg" variant="secondary" className="text-lg px-8">
                {t('landing.cta.register')}
                </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
      <ChatBot />
    </div>
  );
};

export default Landing;
