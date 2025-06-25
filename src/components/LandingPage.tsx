
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, Users, Calendar, QrCode, BarChart3, Shield, Zap, Crown, Play, Star, ArrowRight, ChevronDown } from "lucide-react";
import AuthModal from "./auth/AuthModal";

const LandingPage = () => {
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');

  const features = [
    {
      icon: <Users className="h-8 w-8" />,
      title: "Multi-Tenant System",
      description: "Complete gym isolation with enterprise-grade security"
    },
    {
      icon: <Calendar className="h-8 w-8" />,
      title: "Smart Scheduling",
      description: "AI-powered class booking and attendance tracking"
    },
    {
      icon: <QrCode className="h-8 w-8" />,
      title: "QR Check-ins",
      description: "Lightning-fast member check-ins with QR scanning"
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: "Power Analytics",
      description: "Real-time insights to grow your fitness empire"
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Fort Knox Security",
      description: "Bank-level security with audit trails"
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Content Engine",
      description: "Upload workout videos and training content"
    }
  ];

  const plans = [
    {
      name: "STARTER",
      price: "$29",
      description: "Launch your fitness journey",
      features: ["1 Branch", "50 Members", "Class Booking", "Basic Analytics"],
      popular: false
    },
    {
      name: "DOMINATOR",
      price: "$79",
      description: "Conquer the fitness world",
      features: ["3 Branches", "500 Members", "QR Check-ins", "Content Library", "Advanced Analytics", "SMS/Email"],
      popular: true
    },
    {
      name: "EMPIRE",
      price: "$199",
      description: "Rule the fitness industry",
      features: ["Unlimited Everything", "Custom Branding", "White Label", "Priority Support", "Custom Integrations"],
      popular: false
    }
  ];

  const testimonials = [
    {
      name: "Marcus Thompson",
      role: "Elite Fitness Owner",
      content: "GymCloud transformed my business. 300% member growth in 6 months!",
      rating: 5
    },
    {
      name: "Sarah Chen",
      role: "FitZone Chain CEO",
      content: "The analytics alone saved us $50K annually. Game changer!",
      rating: 5
    },
    {
      name: "David Rodriguez",
      role: "Iron Paradise Founder",
      content: "Members love the QR check-ins. Retention up 40%!",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Header */}
      <header className="relative z-50 border-b border-gray-800/50 bg-black/90 backdrop-blur-sm sticky top-0">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Dumbbell className="h-10 w-10 text-orange-500 animate-pulse" />
              <div className="absolute inset-0 bg-orange-500/20 rounded-full blur-xl"></div>
            </div>
            <span className="text-3xl font-black bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent">
              GymCloud
            </span>
          </div>
          <div className="flex space-x-3">
            <Button 
              variant="ghost" 
              className="text-gray-300 hover:text-white hover:bg-gray-800/50 border border-gray-700/50"
              onClick={() => { setAuthMode('signin'); setShowAuth(true); }}
            >
              Sign In
            </Button>
            <Button 
              className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold shadow-lg shadow-orange-500/25"
              onClick={() => { setAuthMode('signup'); setShowAuth(true); }}
            >
              GET STARTED
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-red-500/10 to-pink-500/10"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        
        <div className="relative z-10 container mx-auto px-4 text-center">
          <Badge className="mb-8 bg-gradient-to-r from-orange-500/20 to-red-500/20 border-orange-500/30 text-orange-400 text-lg px-6 py-2">
            🔥 THE ULTIMATE GYM MANAGEMENT BEAST
          </Badge>
          
          <h1 className="text-6xl md:text-8xl font-black mb-8 leading-none">
            <span className="bg-gradient-to-r from-white via-orange-500 to-red-500 bg-clip-text text-transparent">
              UNLEASH
            </span>
            <br />
            <span className="bg-gradient-to-r from-red-500 via-pink-500 to-orange-500 bg-clip-text text-transparent">
              YOUR GYM'S
            </span>
            <br />
            <span className="text-white">POTENTIAL</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto font-medium leading-relaxed">
            Stop settling for mediocre gym software. GymCloud is the <span className="text-orange-500 font-bold">BEAST</span> that transforms ordinary gyms into <span className="text-red-500 font-bold">FITNESS EMPIRES</span>. 
            Multi-tenant. Scalable. Unstoppable.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
            <Button 
              size="lg" 
              className="text-xl px-12 py-6 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-black shadow-2xl shadow-orange-500/30 transform hover:scale-105 transition-all duration-300"
              onClick={() => { setAuthMode('signup'); setShowAuth(true); }}
            >
              DOMINATE NOW
              <Zap className="ml-3 h-6 w-6" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-xl px-12 py-6 border-2 border-gray-600 text-white hover:bg-gray-800/50 font-bold backdrop-blur-sm"
            >
              <Play className="mr-3 h-6 w-6" />
              WATCH DEMO
            </Button>
          </div>
          
          <div className="animate-bounce">
            <ChevronDown className="h-8 w-8 text-orange-500 mx-auto" />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900/50 to-black"></div>
        <div className="relative z-10 container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-black mb-6">
              <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                EXPLOSIVE FEATURES
              </span>
            </h2>
            <p className="text-2xl text-gray-300 font-medium">Built for champions, designed for dominance</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-gradient-to-br from-gray-900 to-black border-gray-700/50 hover:border-orange-500/50 transition-all duration-300 group hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/20">
                <CardHeader className="text-center">
                  <div className="text-orange-500 mb-4 flex justify-center group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-2xl font-black text-white group-hover:text-orange-500 transition-colors">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-lg text-gray-300 font-medium text-center">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-red-500/5 to-pink-500/5"></div>
        <div className="relative z-10 container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-black mb-6">
              <span className="bg-gradient-to-r from-white to-orange-500 bg-clip-text text-transparent">
                CHAMPIONS SPEAK
              </span>
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-gradient-to-br from-gray-900/80 to-black/80 border-gray-700/50 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-orange-500 fill-current" />
                    ))}
                  </div>
                  <CardDescription className="text-lg text-gray-300 italic">
                    "{testimonial.content}"
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-white font-bold">{testimonial.name}</div>
                  <div className="text-orange-500 font-medium">{testimonial.role}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900 to-black"></div>
        <div className="relative z-10 container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-black mb-6">
              <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                CHOOSE YOUR POWER
              </span>
            </h2>
            <p className="text-2xl text-gray-300 font-medium">Every plan built to make you unstoppable</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <Card key={index} className={`relative overflow-hidden ${
                plan.popular 
                  ? 'bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-500 scale-105 shadow-2xl shadow-orange-500/20' 
                  : 'bg-gradient-to-br from-gray-900 to-black border-gray-700/50'
              }`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-orange-500 to-red-600 text-white font-black px-4 py-2">
                      <Crown className="h-4 w-4 mr-2" />
                      MOST POPULAR
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pt-8">
                  <CardTitle className="text-3xl font-black text-white mb-2">{plan.name}</CardTitle>
                  <div className="text-5xl font-black text-orange-500 my-6">
                    {plan.price}<span className="text-xl text-gray-400">/month</span>
                  </div>
                  <CardDescription className="text-lg text-gray-300 font-medium">{plan.description}</CardDescription>
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-gray-300">
                        <div className="h-3 w-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mr-4"></div>
                        <span className="font-medium">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className={`w-full py-4 font-black text-lg ${
                      plan.popular 
                        ? 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 shadow-lg shadow-orange-500/25' 
                        : 'bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white'
                    }`}
                    onClick={() => { setAuthMode('signup'); setShowAuth(true); }}
                  >
                    START DOMINATING
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-red-500/10 to-pink-500/10"></div>
        <div className="relative z-10 container mx-auto px-4 text-center">
          <h2 className="text-5xl md:text-7xl font-black mb-8">
            <span className="bg-gradient-to-r from-white via-orange-500 to-red-500 bg-clip-text text-transparent">
              READY TO DOMINATE?
            </span>
          </h2>
          <p className="text-2xl text-gray-300 mb-12 max-w-4xl mx-auto font-medium">
            Join the <span className="text-orange-500 font-bold">elite gym owners</span> who refuse to settle for average. 
            Your fitness empire starts NOW.
          </p>
          <Button 
            size="lg" 
            className="text-2xl px-16 py-8 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-black shadow-2xl shadow-orange-500/30 transform hover:scale-105 transition-all duration-300"
            onClick={() => { setAuthMode('signup'); setShowAuth(true); }}
          >
            UNLEASH THE BEAST
            <Zap className="ml-4 h-8 w-8" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-gray-800/50 py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="relative">
              <Dumbbell className="h-8 w-8 text-orange-500" />
              <div className="absolute inset-0 bg-orange-500/20 rounded-full blur-xl"></div>
            </div>
            <span className="text-2xl font-black bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              GymCloud
            </span>
          </div>
          <p className="text-gray-400 text-lg">
            © 2024 GymCloud. All rights reserved. Built for champions, by champions. 💪
          </p>
        </div>
      </footer>

      <AuthModal 
        isOpen={showAuth} 
        onClose={() => setShowAuth(false)} 
        mode={authMode}
        onModeChange={setAuthMode}
      />
    </div>
  );
};

export default LandingPage;
