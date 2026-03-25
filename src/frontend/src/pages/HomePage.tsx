import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  ChevronRight,
  Grid3x3,
  Sparkles,
  Star,
  Upload,
} from "lucide-react";
import { motion } from "motion/react";
import type { Page } from "../App";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface HomePageProps {
  navigate: (page: Page) => void;
}

const steps = [
  {
    icon: Upload,
    title: "Upload Clothes",
    description:
      "Photograph or upload images of your clothing items. Our AI automatically identifies and catalogs each piece.",
  },
  {
    icon: Grid3x3,
    title: "Organize Categories",
    description:
      "Items are sorted into smart categories. Browse your entire wardrobe digitally, anytime, anywhere.",
  },
  {
    icon: Sparkles,
    title: "Get Suggestions",
    description:
      "Receive AI-powered outfit recommendations tailored to occasions, weather, and your personal style.",
  },
];

export default function HomePage({ navigate }: HomePageProps) {
  const { login, loginStatus } = useInternetIdentity();

  return (
    <div className="bg-background">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-medium mb-6">
              <Sparkles className="w-3 h-3" /> AI-Powered Fashion Intelligence
            </div>
            <h1 className="font-display text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight tracking-tight text-foreground mb-6">
              Your Smart
              <span className="block italic text-primary">
                Digital Wardrobe
              </span>
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8 max-w-lg">
              Digitize your entire wardrobe, discover perfect outfits with AI
              assistance, and stop buying clothes you already own. Save time,
              reduce waste, dress better.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                size="lg"
                onClick={login}
                disabled={loginStatus === "logging-in"}
                className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 text-sm font-medium"
                data-ocid="hero.get_started.button"
              >
                Get Started Free <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() =>
                  document
                    .getElementById("how-it-works")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="rounded-full px-8 border-border text-foreground hover:bg-secondary text-sm font-medium"
                data-ocid="hero.learn_more.button"
              >
                Learn More
              </Button>
            </div>
            <div className="mt-10 flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex -space-x-2">
                {["#0F4B57", "#6B8F71", "#C09A6B", "#8B5E52"].map((color) => (
                  <div
                    key={color}
                    className="w-8 h-8 rounded-full border-2 border-background"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <div>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-3 h-3 text-gold fill-gold" />
                  ))}
                </div>
                <span>Loved by 12,000+ fashion enthusiasts</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-modal">
              <img
                src="/assets/generated/hero-wardrobe.dim_800x600.jpg"
                alt="Organized wardrobe"
                className="w-full h-auto object-cover"
              />
              <div className="absolute bottom-6 left-6 right-6">
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-card flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-foreground">
                      AI Suggestion Ready
                    </div>
                    <div className="text-xs text-muted-foreground">
                      3 outfits for today&apos;s weather
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
                </div>
              </div>
            </div>
            <div className="absolute -top-4 -right-4 text-gold">
              <Star className="w-8 h-8 fill-gold text-gold opacity-60" />
            </div>
            <div className="absolute top-1/3 -left-4 text-gold">
              <Star className="w-5 h-5 fill-gold text-gold opacity-40" />
            </div>
            <div className="absolute -bottom-2 right-1/4">
              <Sparkles className="w-6 h-6 text-gold opacity-50" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: "12K+", label: "Active Users" },
              { value: "500K+", label: "Items Catalogued" },
              { value: "98%", label: "AI Accuracy" },
              { value: "2hrs", label: "Avg. Time Saved / Month" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="font-display text-3xl font-bold text-white">
                  {stat.value}
                </div>
                <div className="text-white/70 text-xs mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section
        id="how-it-works"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <p className="text-primary text-sm font-medium uppercase tracking-widest mb-3">
            Simple Process
          </p>
          <h2 className="font-display text-4xl lg:text-5xl font-bold text-foreground">
            How It Works
          </h2>
          <p className="text-muted-foreground mt-4 text-lg max-w-xl mx-auto">
            Three simple steps to transform your wardrobe experience
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="text-center group"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-5 group-hover:bg-primary group-hover:border-primary transition-all duration-300">
                <step.icon className="w-7 h-7 text-primary group-hover:text-white transition-colors duration-300" />
              </div>
              <div className="w-7 h-7 rounded-full bg-muted text-muted-foreground text-xs font-bold flex items-center justify-center mx-auto mb-4">
                {i + 1}
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                {step.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center mt-14"
        >
          <Button
            size="lg"
            onClick={() => navigate("inventory")}
            className="bg-primary hover:bg-primary/90 text-white rounded-full px-10"
            data-ocid="home.start_inventory.button"
          >
            Start Your Digital Wardrobe <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </motion.div>
      </section>
    </div>
  );
}
