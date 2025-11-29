"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Layout, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function LandingNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out",
        isScrolled ? "pt-4 px-[5%] md:px-[20%]" : "pt-8 px-[2%] md:px-[15%]"
      )}
    >
      <header
        className={cn(
          "w-full border rounded-full transition-all duration-500 ease-in-out",
          "bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60",
          isScrolled ? "shadow-lg" : "shadow-sm"
        )}
      >
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-xl tracking-tight hover:opacity-90 transition-opacity"
          >
            <div className="p-1.5 rounded-lg bg-primary text-primary-foreground">
              <Layout className="h-5 w-5" />
            </div>
            <span>FormGen AI</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <Link
              href="#features"
              className="hover:text-foreground transition-colors"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="hover:text-foreground transition-colors"
            >
              How it Works
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden sm:block">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
              >
                Log in
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="font-medium rounded-full px-6">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>
    </div>
  );
}
