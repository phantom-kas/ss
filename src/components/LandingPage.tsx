import { useState, useEffect } from 'react';
import { CheckCircle2, Star, Shield, Clock, TrendingUp, ArrowRight, Smartphone, Menu, X, DollarSign, Zap, Users, Download, Apple, PlayCircle, Award, Lock, Globe, CreditCard, Phone, Mail, Twitter, Facebook, Instagram, Minus, Plus, Gift, Sparkles, ChevronRight, ArrowUpRight, Heart, TrendingDown, Percent } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Link, useNavigate } from '@tanstack/react-router';
import { ImageWithFallback } from './figma/ImageWithFallback';
import logo from 'figma:asset/872c19024a848c86be2cfb9320e9ce2d33228284.png';

export function LandingPage() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [sendAmount, setSendAmount] = useState('500');
  const [totalTransferred, setTotalTransferred] = useState(20000000);
  const [activeUsers, setActiveUsers] = useState(50000);

  useEffect(() => {
    const interval = setInterval(() => {
      setTotalTransferred(prev => prev + Math.floor(Math.random() * 1000));
      setActiveUsers(prev => prev + Math.floor(Math.random() * 3));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const calculateGHS = (usd: string) => {
    const amount = parseFloat(usd) || 0;
    return (amount * 11.25).toFixed(2);
  };

  const calculateFee = (usd: string) => {
    const amount = parseFloat(usd) || 0;
    return (amount * 0.005).toFixed(2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-emerald-50 to-blue-50">
      {/* African Pattern Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-5" style={{
        backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, #059669 10px, #059669 20px),
                         repeating-linear-gradient(-45deg, transparent, transparent 10px, #1e40af 10px, #1e40af 20px)`
      }}></div>

      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-md border-b-4 border-emerald-500 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-emerald-500 to-blue-600 rounded-lg blur opacity-30"></div>
                <img src={logo} alt="StableSend" className="relative h-9 sm:h-10" />
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <span className="px-3 py-1 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs rounded-full font-bold shadow-lg">🇬🇭 Ghana</span>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-6">
              <a href="#how-it-works" className="text-sm text-slate-700 hover:text-blue-700 transition-colors font-semibold">How It Works</a>
              <a href="#pricing" className="text-sm text-slate-700 hover:text-blue-700 transition-colors font-semibold">Pricing</a>
              <a href="#security" className="text-sm text-slate-700 hover:text-blue-700 transition-colors font-semibold">Security</a>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => navigate({ to: '/signin' })}
                className="border-2 border-blue-700 text-blue-700 hover:bg-blue-50 font-semibold"
              >
                Log In
              </Button>
              <Button
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold shadow-xl shadow-blue-500/50"
                onClick={() => navigate({ to: '/signup' })}
              >
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            <button
              className="md:hidden text-blue-700"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t-2 border-emerald-400 bg-white">
            <div className="px-4 py-4 space-y-3">
              <a href="#how-it-works" className="block text-sm text-slate-700 font-semibold py-2">How It Works</a>
              <a href="#pricing" className="block text-sm text-slate-700 font-semibold py-2">Pricing</a>
              <a href="#security" className="block text-sm text-slate-700 font-semibold py-2">Security</a>
              <div className="pt-2 space-y-2">
                <Button variant="outline" className="w-full border-2 border-blue-700 text-blue-700 font-semibold" onClick={() => navigate({ to: '/signin' })}>Log In</Button>
                <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold" onClick={() => navigate({ to: '/signup' })}>Get Started</Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-8 sm:py-12">
        {/* Vibrant Background Circles */}
        <div className="absolute top-10 right-10 w-72 h-72 bg-gradient-to-br from-blue-400/30 to-emerald-400/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-gradient-to-tr from-emerald-400/30 to-blue-400/30 rounded-full blur-3xl" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-br from-amber-400/20 to-emerald-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-100 to-blue-100 border-2 border-emerald-400 text-emerald-700 px-4 py-2 rounded-full mb-6 shadow-lg">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-bold">Trusted by 50,000+ families across Africa</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl text-slate-900 mb-6 leading-[1.1] font-black">
                Send Money Home to
                <span className="block mt-2 bg-gradient-to-r from-blue-600 via-emerald-500 to-blue-600 bg-clip-text text-transparent"> Ghana 🇬🇭</span>
              </h1>

              <p className="text-xl text-slate-700 mb-8 leading-relaxed font-medium">
                Lightning-fast transfers ⚡ Unbeatable rates 💰 Zero hidden fees ✨
                <span className="block mt-2 text-emerald-700">Your family gets more, you pay less!</span>
              </p>

              {/* Live Stats with StableSend Colors */}
              <div className="grid grid-cols-3 gap-4 mb-8 p-4 bg-white/80 backdrop-blur-sm rounded-2xl border-4 border-emerald-400 shadow-2xl">
                <div className="text-center">
                  <div className="text-2xl font-black bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">
                    ${(totalTransferred / 1000000).toFixed(1)}M+
                  </div>
                  <p className="text-xs text-slate-700 font-semibold mt-1">Total Sent</p>
                </div>
                <div className="text-center border-x-2 border-emerald-200">
                  <div className="text-2xl font-black bg-gradient-to-r from-blue-700 to-blue-600 bg-clip-text text-transparent">
                    {activeUsers.toLocaleString()}+
                  </div>
                  <p className="text-xs text-slate-700 font-semibold mt-1">Happy Users</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                    <span className="text-2xl font-black text-slate-900">4.9</span>
                  </div>
                  <p className="text-xs text-slate-700 font-semibold mt-1">Rating</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 mb-6">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold shadow-2xl shadow-blue-500/60 px-8 text-lg"
                  onClick={() => navigate({ to: '/signup' })}
                >
                  Send Money Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-4 border-emerald-500 text-emerald-700 hover:bg-emerald-50 font-bold"
                >
                  <PlayCircle className="w-5 h-5 mr-2" />
                  Watch Demo
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-2 text-slate-700 font-semibold">
                  <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                  <span>No signup fee</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 font-semibold">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                  <span>2-min transfers</span>
                </div>
              </div>
            </div>

            {/* Interactive Calculator Widget with StableSend Colors */}
            <div className="relative">
              <div className="absolute -inset-6 bg-gradient-to-r from-blue-500 via-emerald-500 to-blue-500 rounded-3xl blur-2xl opacity-30 animate-pulse"></div>
              <Card className="relative p-6 shadow-2xl border-4 border-blue-600 backdrop-blur-sm bg-white/95">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-black text-lg text-slate-900">💰 See Your Savings</h3>
                  <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs font-bold rounded-full shadow-lg">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <span>LIVE RATE</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <label className="text-sm text-slate-700 mb-2 block font-bold">You send</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-700">$</span>
                      <input
                        type="number"
                        value={sendAmount}
                        onChange={(e) => setSendAmount(e.target.value)}
                        min="0"
                        step="0.01"
                        className="w-full h-16 pl-10 pr-20 text-3xl font-black bg-gradient-to-br from-blue-50 to-slate-50 border-4 border-blue-600 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500 focus:border-blue-600"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold text-sm shadow-lg">USD</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 via-emerald-500 to-blue-600 rounded-full flex items-center justify-center shadow-xl animate-pulse">
                      <ArrowRight className="w-6 h-6 text-white font-bold" />
                    </div>
                  </div>

                  <div className="relative">
                    <label className="text-sm text-slate-700 mb-2 block font-bold">They receive</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-emerald-600">₵</span>
                      <div className="w-full h-16 pl-10 pr-20 text-3xl font-black bg-gradient-to-br from-emerald-100 to-emerald-50 border-4 border-emerald-500 rounded-2xl flex items-center text-emerald-700 shadow-inner">
                        {calculateGHS(sendAmount)}
                      </div>
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl font-bold text-sm shadow-lg">GHS</span>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-slate-50 to-blue-50 border-3 border-blue-300 rounded-2xl p-4 space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-700 font-semibold">StableSend Rate</span>
                      <span className="font-black text-slate-900">1 USD = ₵11.25</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-700 font-semibold">Fee (0.5%)</span>
                      <span className="font-black text-slate-900">${calculateFee(sendAmount)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t-2 border-blue-300">
                      <span className="text-emerald-700 font-bold">💚 You save vs banks</span>
                      <span className="font-black text-emerald-600 flex items-center gap-1 text-lg">
                        ${(parseFloat(sendAmount || '0') * 0.045).toFixed(2)}
                        <TrendingDown className="w-4 h-4" />
                      </span>
                    </div>
                  </div>

                  <Button
                    size="lg"
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-black shadow-2xl text-lg"
                    onClick={() => Link.to('signup')}
                  >
                    Send ${sendAmount} Now
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Banner with StableSend Colors */}
      <section className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 py-6 border-y-4 border-emerald-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="group">
              <div className="flex items-center justify-center gap-2 text-white mb-1">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Shield className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="font-bold text-white text-sm">Bank of Ghana</p>
              <p className="text-emerald-400 text-xs font-semibold">Licensed & Regulated</p>
            </div>
            <div className="group">
              <div className="flex items-center justify-center gap-2 text-white mb-1">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Lock className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="font-bold text-white text-sm">256-bit SSL</p>
              <p className="text-emerald-400 text-xs font-semibold">Bank-Level Security</p>
            </div>
            <div className="group">
              <div className="flex items-center justify-center gap-2 text-white mb-1">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Zap className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="font-bold text-white text-sm">2 Minutes</p>
              <p className="text-emerald-400 text-xs font-semibold">Average Transfer Time</p>
            </div>
            <div className="group">
              <div className="flex items-center justify-center gap-2 text-white mb-1">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Award className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="font-bold text-white text-sm">50,000+ Users</p>
              <p className="text-emerald-400 text-xs font-semibold">Growing Community</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why StableSend with Brand Colors */}
      <section className="py-12 bg-gradient-to-br from-blue-50 via-emerald-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="inline-block mb-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-full font-bold shadow-xl">
                <Heart className="w-4 h-4" />
                <span>Made for African Families</span>
              </div>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
              Why families choose StableSend
            </h2>
            <p className="text-xl text-slate-700 font-medium">
              We're not just another app. We're family. 🏠
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="p-6 hover:shadow-2xl transition-all duration-300 group border-4 border-blue-300 hover:border-blue-600 bg-white hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all shadow-xl">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-3">⚡ Lightning Fast</h3>
              <p className="text-sm text-slate-700 leading-relaxed mb-3 font-medium">Money arrives in 2 minutes. Your family doesn't wait days anymore!</p>
              <div className="flex items-center gap-2 text-xs text-emerald-600 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Instant mobile money delivery</span>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-2xl transition-all duration-300 group border-4 border-emerald-300 hover:border-emerald-600 bg-white hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all shadow-xl">
                <Percent className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-3">💰 Unbeatable Rates</h3>
              <p className="text-sm text-slate-700 leading-relaxed mb-3 font-medium">Just 0.5% fee. 90% cheaper than traditional money transfer services!</p>
              <div className="flex items-center gap-2 text-xs text-emerald-600 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>100% transparent pricing</span>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-2xl transition-all duration-300 group border-4 border-blue-300 hover:border-blue-600 bg-white hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 via-blue-700 to-emerald-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all shadow-xl">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-3">🛡️ 100% Secure</h3>
              <p className="text-sm text-slate-700 leading-relaxed mb-3 font-medium">Licensed by Bank of Ghana with military-grade 256-bit encryption!</p>
              <div className="flex items-center gap-2 text-xs text-emerald-600 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>24/7 fraud monitoring system</span>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-2xl transition-all duration-300 group border-4 border-emerald-300 hover:border-emerald-600 bg-white hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-blue-700 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all shadow-xl">
                <Smartphone className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-3">📱 All Mobile Money</h3>
              <p className="text-sm text-slate-700 leading-relaxed mb-3 font-medium">MTN, Vodafone, AirtelTigo, and all major Ghanaian banks supported!</p>
              <div className="flex items-center gap-2 text-xs text-emerald-600 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Maximum flexibility for recipients</span>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-2xl transition-all duration-300 group border-4 border-blue-300 hover:border-blue-600 bg-white hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all shadow-xl">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-3">🤝 24/7 Support</h3>
              <p className="text-sm text-slate-700 leading-relaxed mb-3 font-medium">Real people, anytime. We're always here when you need us most!</p>
              <div className="flex items-center gap-2 text-xs text-emerald-600 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Support in multiple languages</span>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-2xl transition-all duration-300 group border-4 border-emerald-300 hover:border-emerald-600 bg-white hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 via-emerald-700 to-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all shadow-xl">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-3">❤️ Built for Diaspora</h3>
              <p className="text-sm text-slate-700 leading-relaxed mb-3 font-medium">Designed with you and your loved ones in mind. Send love home!</p>
              <div className="flex items-center gap-2 text-xs text-emerald-600 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Made with love & care</span>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">How it works</h2>
            <p className="text-xl text-slate-700 font-medium">Send money in 3 simple steps ✨</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Smartphone, title: 'Choose Delivery', description: 'Select mobile money or bank. We support all major providers in Ghana.', color: 'from-blue-600 to-blue-700', step: '1', emoji: '📱' },
              { icon: DollarSign, title: 'Enter Amount', description: 'See live rates and exact fees upfront. No surprises, ever!', color: 'from-emerald-600 to-emerald-700', step: '2', emoji: '💵' },
              { icon: CheckCircle2, title: 'Money Arrives', description: 'Recipient gets money in minutes. Track in real-time from your phone.', color: 'from-blue-600 via-emerald-600 to-blue-600', step: '3', emoji: '✅' },
            ].map((step, index) => (
              <Card key={index} className="p-8 text-center hover:shadow-2xl transition-all group relative overflow-hidden border-4 border-emerald-300 hover:border-emerald-600 bg-gradient-to-br from-white to-blue-50 hover:-translate-y-2">
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-blue-200 to-emerald-200 rounded-full opacity-50"></div>
                <div className="absolute top-4 right-4 w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-black text-xl shadow-xl">
                  {step.step}
                </div>
                <div className={`w-20 h-20 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all`}>
                  <step.icon className="w-10 h-10 text-white" />
                </div>
                <div className="text-4xl mb-3">{step.emoji}</div>
                <h3 className="text-xl font-black text-slate-900 mb-3">{step.title}</h3>
                <p className="text-sm text-slate-700 leading-relaxed font-medium">{step.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing with StableSend Colors */}
      <section id="pricing" className="py-12 bg-gradient-to-br from-blue-50 via-emerald-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
              Transparent pricing 💎
            </h2>
            <p className="text-lg text-slate-700 font-semibold">
              What you see is what you pay. No surprises, ever!
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="p-8 border-4 border-emerald-500 bg-gradient-to-br from-white via-blue-50 to-emerald-50 shadow-2xl">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Left: Pricing Info */}
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-emerald-600 rounded-2xl flex items-center justify-center shadow-xl">
                      <Zap className="w-8 h-8 text-white fill-white" />
                    </div>
                    <div>
                      <h3 className="font-black text-xl text-slate-900">Simple, Fair Pricing</h3>
                      <p className="text-sm text-slate-600 font-semibold">Send any amount to Ghana</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-5 mb-4 border-4 border-blue-300 shadow-lg">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-xs text-slate-600 font-bold mb-1">Our Fee</p>
                        <p className="text-3xl font-black bg-gradient-to-r from-blue-700 to-blue-600 bg-clip-text text-transparent">0.5%</p>
                      </div>
                      <div className="border-x-2 border-blue-200">
                        <p className="text-xs text-slate-600 font-bold mb-1">Exchange Rate</p>
                        <p className="text-3xl font-black bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent">Live</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 font-bold mb-1">Hidden Fees</p>
                        <p className="text-3xl font-black text-slate-900">$0</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-emerald-100 to-emerald-50 border-3 border-emerald-400 rounded-2xl p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-emerald-800 leading-relaxed font-bold">Traditional services charge 4-6% PLUS poor rates. We charge 0.5% with real market rates. More money for your family! 💚</p>
                    </div>
                  </div>
                </div>

                {/* Right: Example */}
                <div>
                  <div className="bg-gradient-to-br from-blue-100 to-blue-50 border-4 border-blue-400 rounded-2xl p-5 mb-4 shadow-lg">
                    <h4 className="font-black text-slate-900 mb-4 text-base">Example: Send $500 to Ghana 🇬🇭</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-700 font-semibold">You send</span>
                        <span className="font-black text-slate-900 text-lg">$500.00</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-700 font-semibold">Our fee (0.5%)</span>
                        <span className="font-black text-slate-900 text-lg">$2.50</span>
                      </div>
                      <div className="h-1 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full my-2"></div>
                      <div className="flex justify-between items-center bg-white rounded-xl p-3 border-2 border-emerald-500">
                        <span className="text-emerald-700 font-bold">They receive</span>
                        <span className="text-2xl font-black text-emerald-600">₵5,606.25</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-5 border-4 border-emerald-300 shadow-lg">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-slate-700 font-bold">Traditional services</span>
                      <span className="text-sm text-red-600 font-black bg-red-100 px-3 py-1 rounded-full">4-6% fees</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-700 font-bold">With StableSend ✨</span>
                      <span className="text-sm text-emerald-600 font-black bg-emerald-100 px-3 py-1 rounded-full">Save $22.50+</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Trust Section with StableSend Colors */}
      <section id="security" className="py-12 bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white border-y-8 border-emerald-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block mb-6">
                <span className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-bold rounded-full shadow-xl">
                  🛡️ Your Security Matters
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black mb-6">
                Your trust is everything to us
              </h2>
              <p className="text-xl text-blue-100 mb-8 font-medium leading-relaxed">
                Connecting families across borders, powering dreams, building trust one transfer at a time. 🌍
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border-2 border-emerald-400 hover:bg-white/20 transition-all group">
                  <Shield className="w-10 h-10 text-emerald-400 mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="font-black text-base mb-1">Bank of Ghana</h3>
                  <p className="text-xs text-emerald-300 font-semibold">Licensed & Regulated</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border-2 border-blue-400 hover:bg-white/20 transition-all group">
                  <Lock className="w-10 h-10 text-blue-400 mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="font-black text-base mb-1">256-bit SSL</h3>
                  <p className="text-xs text-blue-300 font-semibold">Military-Grade Encryption</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border-2 border-emerald-400 hover:bg-white/20 transition-all group">
                  <Award className="w-10 h-10 text-amber-400 mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="font-black text-base mb-1">PCI Certified</h3>
                  <p className="text-xs text-emerald-300 font-semibold">Industry Compliant</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border-2 border-blue-400 hover:bg-white/20 transition-all group">
                  <Users className="w-10 h-10 text-emerald-400 mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="font-black text-base mb-1">50,000+ Users</h3>
                  <p className="text-xs text-blue-300 font-semibold">Trusted Community</p>
                </div>
              </div>

              <Button
                size="lg"
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-black shadow-2xl px-8"
                onClick={() => Link.to('signup')}
              >
                Get Started Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-3xl blur-xl opacity-50"></div>
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-emerald-400">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1594385464373-91a02a3afeda?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBhZnJpY2FuJTIwYnVzaW5lc3MlMjBwZW9wbGV8ZW58MXx8fHwxNzYyOTA1MTQxfDA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Trusted service"
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
              Questions? We've got answers 💬
            </h2>
          </div>

          <div className="space-y-3">
            {[
              {
                question: '⚡ How fast will my money arrive?',
                answer: 'Mobile money arrives in 2 minutes! Bank transfers take 2-4 hours. You get instant notifications at every step.'
              },
              {
                question: '💰 What are your fees?',
                answer: 'Just 0.5% per transfer. Send $500 for only $2.50. No hidden fees, no surprises, ever!'
              },
              {
                question: '🛡️ Is my money safe?',
                answer: 'Absolutely! Licensed by Bank of Ghana, military-grade 256-bit encryption, 24/7 fraud monitoring, and PCI compliant.'
              },
              {
                question: '📱 Which services do you support?',
                answer: 'MTN Mobile Money, Vodafone Cash, AirtelTigo Money, and all major Ghanaian banks including GCB, Ecobank, Stanbic, and more!'
              },
            ].map((faq, index) => (
              <Card key={index} className="overflow-hidden border-4 border-blue-300 hover:border-emerald-500 transition-all hover:shadow-xl">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full p-5 text-left flex items-center justify-between bg-gradient-to-r from-white to-blue-50 hover:from-blue-50 hover:to-emerald-50 transition-colors"
                >
                  <h3 className="font-black text-slate-900 pr-4 text-base">{faq.question}</h3>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${openFaq === index
                      ? 'bg-gradient-to-r from-blue-600 to-emerald-600'
                      : 'bg-gradient-to-r from-slate-200 to-slate-300'
                    }`}>
                    {openFaq === index ? (
                      <Minus className="w-5 h-5 text-white" />
                    ) : (
                      <Plus className="w-5 h-5 text-slate-600" />
                    )}
                  </div>
                </button>
                {openFaq === index && (
                  <div className="px-5 pb-5 bg-gradient-to-br from-blue-50 to-emerald-50">
                    <p className="text-sm text-slate-700 leading-relaxed font-medium pt-3 border-t-2 border-emerald-200">{faq.answer}</p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA with StableSend Colors */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-emerald-600 to-blue-700"></div>
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-400/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-400/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <div className="mb-6">
            <span className="text-6xl">🏠</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black mb-6 drop-shadow-lg">
            Ready to send love home?
          </h2>
          <p className="text-2xl mb-10 text-blue-100 font-bold leading-relaxed">
            Join 50,000+ families making every cedi count 💚
          </p>
          <div className="flex flex-wrap gap-4 justify-center mb-8">
            <Button
              size="lg"
              className="bg-white text-blue-700 hover:bg-blue-50 px-10 py-6 text-xl font-black shadow-2xl hover:scale-105 transition-transform"
              onClick={() => Link.to('signup')}
            >
              Send Money Now
              <ArrowRight className="w-6 h-6 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-4 border-white text-white hover:bg-white/20 px-10 py-6 text-xl font-black backdrop-blur-sm"
            >
              <PlayCircle className="w-6 h-6 mr-2" />
              Watch How It Works
            </Button>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-base text-white font-bold">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span>No signup fee</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span>First transfer in 2 minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span>24/7 support</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer with StableSend Colors */}
      <footer className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-slate-300 border-t-4 border-emerald-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-5 gap-8 mb-10">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-emerald-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <Zap className="w-6 h-6 text-white fill-white" />
                </div>
                <span className="text-white font-black text-2xl">StableSend</span>
              </div>
              <p className="text-slate-400 mb-6 leading-relaxed font-medium">
                The fastest, cheapest way to send money to Ghana. Built with love for the African diaspora. 💚
              </p>
              <div className="flex items-center gap-3">
                <a href="#" className="w-10 h-10 bg-gradient-to-br from-blue-700 to-blue-600 rounded-xl flex items-center justify-center hover:from-emerald-500 hover:to-emerald-600 transition-all hover:scale-110">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-gradient-to-br from-blue-700 to-blue-600 rounded-xl flex items-center justify-center hover:from-emerald-500 hover:to-emerald-600 transition-all hover:scale-110">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-gradient-to-br from-blue-700 to-blue-600 rounded-xl flex items-center justify-center hover:from-emerald-500 hover:to-emerald-600 transition-all hover:scale-110">
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-white font-black mb-4">Product</h3>
              <ul className="space-y-3 text-sm">
                <li><a href="#how-it-works" className="hover:text-emerald-400 transition-colors font-medium">How It Works</a></li>
                <li><a href="#pricing" className="hover:text-emerald-400 transition-colors font-medium">Pricing</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors font-medium">Mobile App</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-black mb-4">Company</h3>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="hover:text-emerald-400 transition-colors font-medium">About Us</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors font-medium">Blog</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors font-medium">Careers</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-black mb-4">Support</h3>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="hover:text-emerald-400 transition-colors font-medium">Help Center</a></li>
                <li><a href="#security" className="hover:text-emerald-400 transition-colors font-medium">Security</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors font-medium">Terms</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t-2 border-emerald-500/30 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-slate-400 font-medium">
              © 2024 StableSend. Licensed by Bank of Ghana. Made with ❤️ for Africa
            </div>
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <Lock className="w-4 h-4" />
                <span>256-bit SSL</span>
              </div>
              <div className="flex items-center gap-2 text-blue-400 font-bold">
                <Shield className="w-4 h-4" />
                <span>PCI Compliant</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}