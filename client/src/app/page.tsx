import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowRight, 
  CheckCircle2, 
  Layout, 
  Zap, 
  BarChart3, 
  Share2, 
  Shield, 
  Sparkles,
  MousePointer2,
  Layers
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/10">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight hover:opacity-90 transition-opacity">
            <div className="p-1.5 rounded-lg bg-primary text-primary-foreground">
              <Layout className="h-5 w-5" />
            </div>
            <span>FormGen AI</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <Link href="#features" className="hover:text-foreground transition-colors">Features</Link>
            <Link href="#how-it-works" className="hover:text-foreground transition-colors">How it Works</Link>
            <Link href="#pricing" className="hover:text-foreground transition-colors">Pricing</Link>
          </nav>
          
          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden sm:block">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">Log in</Button>
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

      <main className="flex-1">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-24 md:py-32 text-center max-w-5xl">
          <div className="flex flex-col items-center gap-8 animate-fade-in">
            <Badge variant="secondary" className="px-4 py-1.5 text-sm font-medium rounded-full border bg-muted/50 hover:bg-muted transition-colors cursor-default">
              <Sparkles className="mr-2 h-3.5 w-3.5 inline-block text-primary" />
              Reimagining Form Creation with AI
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-balance leading-[1.1]">
              Build complex forms <br className="hidden md:block" />
              <span className="text-primary relative">
                in seconds
                <svg className="absolute w-full h-3 -bottom-1 left-0 text-primary/20 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                </svg>
              </span>
              , not hours.
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance leading-relaxed">
              Describe your form in plain English, and let our AI generate the perfect structure, validation, and styling instantly.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 mt-6">
              <Link href="/register">
                <Button size="lg" className="h-14 px-8 text-base rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:-translate-y-0.5">
                  Start Building Free
                </Button>
              </Link>
              <Link href="#demo">
                <Button variant="outline" size="lg" className="h-14 px-8 text-base rounded-full hover:bg-muted/50 transition-all">
                  View Demo
                </Button>
              </Link>
            </div>

            <div className="mt-12 text-sm text-muted-foreground flex flex-wrap justify-center gap-x-8 gap-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>Free forever plan</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>GDPR Compliant</span>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof / Divider */}
        <div className="border-y bg-muted/30">
          <div className="container mx-auto px-4 py-16">
            <p className="text-center text-sm font-semibold text-muted-foreground mb-10 tracking-wider uppercase">Trusted by innovative teams at</p>
            <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
              {/* Placeholder Logos using text for now, typically these would be SVGs */}
              <div className="text-2xl font-bold flex items-center gap-2"><div className="h-6 w-6 bg-current rounded-full"></div>ACME</div>
              <div className="text-2xl font-bold flex items-center gap-2"><div className="h-6 w-6 bg-current rounded-md"></div>Global</div>
              <div className="text-2xl font-bold flex items-center gap-2"><div className="h-6 w-6 bg-current rotate-45"></div>Nebula</div>
              <div className="text-2xl font-bold flex items-center gap-2"><div className="h-6 w-6 bg-current rounded-sm"></div>FoxRun</div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <section id="features" className="container mx-auto px-4 py-32">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">Everything you need to collect data</h2>
            <p className="text-muted-foreground text-xl">
              Powerful features packaged in a clean, intuitive interface.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border bg-card/50 hover:bg-card hover:shadow-lg transition-all duration-300 group">
              <CardHeader>
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 text-primary group-hover:scale-110 transition-transform">
                  <Zap className="h-7 w-7" />
                </div>
                <CardTitle className="text-xl">AI Generation</CardTitle>
                <CardDescription className="text-base mt-2 leading-relaxed">
                  Simply describe what you need, and watch as the AI constructs your form with appropriate fields and logic.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border bg-card/50 hover:bg-card hover:shadow-lg transition-all duration-300 group">
              <CardHeader>
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 text-primary group-hover:scale-110 transition-transform">
                  <BarChart3 className="h-7 w-7" />
                </div>
                <CardTitle className="text-xl">Real-time Analytics</CardTitle>
                <CardDescription className="text-base mt-2 leading-relaxed">
                  Gain insights immediately as responses come in. Visualize data with built-in charts and export options.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border bg-card/50 hover:bg-card hover:shadow-lg transition-all duration-300 group">
              <CardHeader>
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 text-primary group-hover:scale-110 transition-transform">
                  <Share2 className="h-7 w-7" />
                </div>
                <CardTitle className="text-xl">Easy Sharing</CardTitle>
                <CardDescription className="text-base mt-2 leading-relaxed">
                  Share your forms via link, embed them on your site, or send them directly via email campaigns.
                </CardDescription>
              </CardHeader>
            </Card>
            
             <Card className="border bg-card/50 hover:bg-card hover:shadow-lg transition-all duration-300 group">
              <CardHeader>
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 text-primary group-hover:scale-110 transition-transform">
                  <Shield className="h-7 w-7" />
                </div>
                <CardTitle className="text-xl">Secure & Reliable</CardTitle>
                <CardDescription className="text-base mt-2 leading-relaxed">
                  Enterprise-grade security with spam protection and data encryption to keep your information safe.
                </CardDescription>
              </CardHeader>
            </Card>

             <Card className="border bg-card/50 hover:bg-card hover:shadow-lg transition-all duration-300 group">
              <CardHeader>
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 text-primary group-hover:scale-110 transition-transform">
                  <MousePointer2 className="h-7 w-7" />
                </div>
                <CardTitle className="text-xl">Drag & Drop Editor</CardTitle>
                <CardDescription className="text-base mt-2 leading-relaxed">
                  Fine-tune your forms with our intuitive editor. Reorder fields, add logic, and customize styling.
                </CardDescription>
              </CardHeader>
            </Card>

             <Card className="border bg-card/50 hover:bg-card hover:shadow-lg transition-all duration-300 group">
              <CardHeader>
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 text-primary group-hover:scale-110 transition-transform">
                  <Layers className="h-7 w-7" />
                </div>
                <CardTitle className="text-xl">Templates Library</CardTitle>
                <CardDescription className="text-base mt-2 leading-relaxed">
                  Start from scratch or choose from hundreds of pre-built templates for every use case.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* How it Works */}
        <section id="how-it-works" className="bg-muted/30 py-32">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
              <div className="flex-1 space-y-10">
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
                  From idea to published form in three steps.
                </h2>
                
                <div className="space-y-8">
                  <div className="flex gap-6 group">
                    <div className="flex-none h-12 w-12 rounded-full bg-background border-2 border-primary/20 text-primary flex items-center justify-center font-bold text-lg group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">1</div>
                    <div>
                      <h3 className="font-bold text-xl mb-2">Describe your needs</h3>
                      <p className="text-muted-foreground text-lg leading-relaxed">Tell the AI what kind of information you want to collect. Be as specific or vague as you like.</p>
                    </div>
                  </div>
                  <div className="flex gap-6 group">
                    <div className="flex-none h-12 w-12 rounded-full bg-background border-2 border-primary/20 text-primary flex items-center justify-center font-bold text-lg group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">2</div>
                    <div>
                      <h3 className="font-bold text-xl mb-2">Customize & Refine</h3>
                      <p className="text-muted-foreground text-lg leading-relaxed">Tweak the generated form using our drag-and-drop editor. Add branding and custom logic.</p>
                    </div>
                  </div>
                  <div className="flex gap-6 group">
                    <div className="flex-none h-12 w-12 rounded-full bg-background border-2 border-primary/20 text-primary flex items-center justify-center font-bold text-lg group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">3</div>
                    <div>
                      <h3 className="font-bold text-xl mb-2">Publish & Share</h3>
                      <p className="text-muted-foreground text-lg leading-relaxed">Get a public link instantly and start collecting responses. Analyze data in real-time.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 w-full">
                <div className="relative rounded-2xl border bg-background shadow-2xl p-4 rotate-1 hover:rotate-0 transition-transform duration-500">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-2xl blur opacity-20"></div>
                  <div className="relative rounded-xl bg-muted/10 aspect-[4/3] flex flex-col border overflow-hidden">
                    {/* Mock UI */}
                    <div className="h-12 border-b bg-muted/20 flex items-center px-4 gap-2">
                      <div className="h-3 w-3 rounded-full bg-red-400"></div>
                      <div className="h-3 w-3 rounded-full bg-yellow-400"></div>
                      <div className="h-3 w-3 rounded-full bg-green-400"></div>
                    </div>
                    <div className="flex-1 p-8 flex flex-col gap-4">
                        <div className="h-8 w-3/4 bg-muted/20 rounded animate-pulse"></div>
                        <div className="h-32 bg-muted/20 rounded animate-pulse delay-75"></div>
                        <div className="h-10 w-1/3 bg-primary/20 rounded animate-pulse delay-150"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-32 text-center">
          <div className="max-w-4xl mx-auto space-y-8 bg-primary/5 rounded-[3rem] p-12 md:p-24 border border-primary/10">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              Ready to streamline your data collection?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join thousands of users who are saving time with AI-powered forms. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                <Link href="/register">
                <Button size="lg" className="h-14 px-10 text-lg rounded-full shadow-xl shadow-primary/20">
                    Get Started for Free
                </Button>
                </Link>
                <Link href="/contact">
                <Button variant="outline" size="lg" className="h-14 px-10 text-lg rounded-full bg-background">
                    Contact Sales
                </Button>
                </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-16 bg-muted/10">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="space-y-4">
              <div className="flex items-center gap-2 font-bold text-xl">
                <div className="p-1.5 rounded-lg bg-primary text-primary-foreground">
                  <Layout className="h-5 w-5" />
                </div>
                <span>FormGen AI</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The smartest way to build forms and collect data. Powered by advanced AI models.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-6">Product</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-primary transition-colors">Features</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Pricing</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Templates</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Integrations</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-6">Company</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-primary transition-colors">About</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Blog</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Careers</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-6">Legal</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          
          <Separator className="my-8" />
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>© 2025 FormGen AI. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="#" className="hover:text-foreground transition-colors">Twitter</Link>
              <Link href="#" className="hover:text-foreground transition-colors">GitHub</Link>
              <Link href="#" className="hover:text-foreground transition-colors">Discord</Link>
              <Link href="#" className="hover:text-foreground transition-colors">LinkedIn</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
