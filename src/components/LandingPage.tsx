
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, Users, Calendar, QrCode, BarChart3, Shield, Zap, Crown } from "lucide-react";
import AuthModal from "./auth/AuthModal";

const LandingPage = () => {
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');

  const features = [
    {
      icon: <Users className="h-6 w-6" />,
      title: "Multi-Tenant Architecture",
      description: "Complete gym isolation with role-based access control"
    },
    {
      icon: <Calendar className="h-6 w-6" />,
      title: "Class Booking System",
      description: "Schedule classes, manage bookings, and track attendance"
    },
    {
      icon: <QrCode className="h-6 w-6" />,
      title: "QR Code Attendance",
      description: "Quick member check-ins with QR code scanning"
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Advanced Analytics",
      description: "Detailed reports and performance metrics"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Enterprise Security",
      description: "Row-level security and audit logging"
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Content Library",
      description: "Upload and manage workout videos and guides"
    }
  ];

  const plans = [
    {
      name: "Startup",
      price: "$29",
      description: "Perfect for small gyms",
      features: ["1 Branch", "Up to 50 Members", "Class Booking", "Basic Reports"],
      popular: false
    },
    {
      name: "Growth",
      price: "$79",
      description: "For growing fitness businesses",
      features: ["3 Branches", "Up to 500 Members", "QR Check-in", "Content Library", "Advanced Reports", "Communication Tools"],
      popular: true
    },
    {
      name: "Enterprise",
      price: "$199",
      description: "For large gym chains",
      features: ["Unlimited Branches", "Unlimited Members", "Custom Branding", "Custom Domain", "Priority Support"],
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Dumbbell className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">GymCloud</span>
          </div>
          <div className="flex space-x-2">
            <Button variant="ghost" onClick={() => { setAuthMode('signin'); setShowAuth(true); }}>
              Sign In
            </Button>
            <Button onClick={() => { setAuthMode('signup'); setShowAuth(true); }}>
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-4">
            🚀 World-Class Gym Management Platform
          </Badge>
          <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Transform Your Gym with
            <span className="text-blue-600"> Smart Management</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Complete multi-tenant SaaS platform for gyms to manage branches, staff, trainers, and members with enterprise-grade security and analytics.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8 py-3" onClick={() => { setAuthMode('signup'); setShowAuth(true); }}>
              Start Free Trial
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-3">
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything You Need</h2>
          <p className="text-xl text-gray-600">Powerful features designed for modern fitness businesses</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="text-blue-600 mb-2">{feature.icon}</div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="container mx-auto px-4 py-20 bg-gray-50 rounded-2xl mx-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
          <p className="text-xl text-gray-600">Choose the plan that fits your gym's needs</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <Card key={index} className={`relative ${plan.popular ? 'ring-2 ring-blue-600 shadow-xl' : ''}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-600 text-white">
                    <Crown className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="text-4xl font-bold text-blue-600 my-4">
                  {plan.price}<span className="text-lg text-gray-500">/month</span>
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <div className="h-2 w-2 bg-blue-600 rounded-full mr-3"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button 
                  className="w-full" 
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => { setAuthMode('signup'); setShowAuth(true); }}
                >
                  Get Started
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Ready to Transform Your Gym?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Join hundreds of gyms already using GymCloud to streamline their operations and grow their business.
          </p>
          <Button size="lg" className="text-lg px-8 py-3" onClick={() => { setAuthMode('signup'); setShowAuth(true); }}>
            Start Your Free Trial Today
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Dumbbell className="h-6 w-6" />
            <span className="text-xl font-bold">GymCloud</span>
          </div>
          <p className="text-gray-400">
            © 2024 GymCloud. All rights reserved. Built with ❤️ for the fitness industry.
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
