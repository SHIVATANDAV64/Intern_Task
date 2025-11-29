import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Zap, Shield, Share2 } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <Sparkles className="h-6 w-6 text-primary" />
            FormGen AI
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          Create Dynamic Forms with
          <span className="text-primary"> AI Power</span>
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
          Transform natural language into beautiful, shareable forms. Our AI learns from your history 
          to create smarter forms every time.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link href="/register">
            <Button size="lg" className="gap-2">
              <Sparkles className="h-5 w-5" />
              Start Creating
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline">
              View Demo
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Why Choose FormGen AI?
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <Sparkles className="h-10 w-10 text-primary mb-2" />
              <CardTitle>AI-Powered</CardTitle>
              <CardDescription>
                Just describe your form in plain English and watch the magic happen
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Zap className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Context-Aware</CardTitle>
              <CardDescription>
                AI learns from your form history to make smarter suggestions
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Share2 className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Shareable</CardTitle>
              <CardDescription>
                Generate public links to collect responses from anyone
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Secure</CardTitle>
              <CardDescription>
                Your data is protected with enterprise-grade security
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          How It Works
        </h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mb-4">
                1
              </div>
              <CardTitle>Describe Your Form</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Tell AI what kind of form you need in natural language
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mb-4">
                2
              </div>
              <CardTitle>AI Generates</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                AI creates a complete form with validation and styling
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mb-4">
                3
              </div>
              <CardTitle>Share & Collect</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Share your form link and start collecting responses
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2025 FormGen AI. Built with ❤️ for CentralAlign AI Assessment.</p>
        </div>
      </footer>
    </div>
  );
}
