import { Button } from "@/components/ui/button";
import { Sparkles, User, Wand2 } from "lucide-react";
import type { ReactNode } from "react";
import type { Page } from "../App";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface LayoutProps {
  children: ReactNode;
  currentPage: Page;
  navigate: (page: Page) => void;
}

const navLinks: { label: string; page: Page }[] = [
  { label: "Dashboard", page: "home" },
  { label: "Inventory", page: "inventory" },
  { label: "Outfits", page: "outfits" },
];

export default function Layout({
  children,
  currentPage,
  navigate,
}: LayoutProps) {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const isLoggedIn = !!identity;
  const principal = identity?.getPrincipal().toString();
  const shortPrincipal = principal ? `${principal.slice(0, 8)}...` : "";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="bg-navy sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              type="button"
              onClick={() => navigate("home")}
              className="flex items-center gap-2 text-white hover:opacity-80 transition-opacity"
              data-ocid="nav.home.link"
            >
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Wand2 className="w-4 h-4 text-white" />
              </div>
              <span className="font-display text-lg font-semibold tracking-tight">
                Wardrobe Wizard
              </span>
              <Sparkles className="w-3 h-3 text-gold" />
            </button>

            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <button
                  type="button"
                  key={link.page}
                  onClick={() => navigate(link.page)}
                  data-ocid={`nav.${link.page}.link`}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    currentPage === link.page
                      ? "bg-white/15 text-white"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              {isLoggedIn ? (
                <div className="flex items-center gap-2">
                  <div className="hidden sm:flex items-center gap-2 bg-white/10 rounded-full px-3 py-1.5">
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <User className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-white/90 text-xs font-mono">
                      {shortPrincipal}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clear}
                    className="border-white/30 text-white bg-transparent hover:bg-white/10 hover:text-white text-xs"
                    data-ocid="nav.logout.button"
                  >
                    Sign Out
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  onClick={login}
                  disabled={loginStatus === "logging-in"}
                  className="bg-primary hover:bg-primary/90 text-white rounded-full px-4"
                  data-ocid="nav.login.button"
                >
                  <User className="w-3.5 h-3.5 mr-1.5" />
                  Account
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="bg-navy">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                <Wand2 className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-display text-white text-base font-medium">
                Wardrobe Wizard
              </span>
              <span className="text-white/40 text-xs ml-2">
                © {new Date().getFullYear()}
              </span>
            </div>
            <nav className="flex items-center gap-6">
              {["About", "FAQ", "Contact", "Privacy Policy", "Terms"].map(
                (item) => (
                  <button
                    type="button"
                    key={item}
                    className="text-white/60 text-xs hover:text-white transition-colors"
                  >
                    {item}
                  </button>
                ),
              )}
            </nav>
            <p className="text-white/50 text-xs">
              Built with ❤️ using{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-white transition-colors"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
