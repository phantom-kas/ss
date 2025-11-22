import { useState } from 'react';
import { Star, ArrowLeft, MessageCircle, HelpCircle, Book, Mail, Phone, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { AppLayout } from './AppLayout';
import type { Page } from '../App';

interface SupportProps {
  navigateTo: (page: Page) => void;
  onLogout: () => void;
}

export function Support({ navigateTo, onLogout }: SupportProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const faqs = [
    {
      question: 'How long does a transfer take?',
      answer: 'Most transfers complete within 2 minutes for mobile money. Bank transfers typically take 2-4 hours depending on the destination bank.',
    },
    {
      question: 'What are the fees?',
      answer: 'StableSend charges a flat 0.5% fee on all transfers with no hidden charges. You always see the exact amount your recipient will receive before confirming.',
    },
    {
      question: 'Is my money safe?',
      answer: 'Yes! StableSend is fully licensed and regulated. All transfers are insured and protected by bank-level security. We use encryption and multi-factor authentication to keep your account secure.',
    },
    {
      question: 'What countries can I send money to?',
      answer: 'We support transfers to 45+ countries including Ghana, Nigeria, Philippines, Mexico, India, Kenya, and many more. Check our website for the complete list.',
    },
    {
      question: 'How do I verify my identity?',
      answer: 'Identity verification is a simple one-time process. You\'ll need a government-issued ID, proof of address, and a selfie. The process typically takes 5-10 minutes.',
    },
    {
      question: 'Can I cancel a transfer?',
      answer: 'You can cancel a transfer before it\'s processed, usually within the first minute. Once the transfer is being processed or completed, cancellation is not possible.',
    },
  ];

  const helpTopics = [
    {
      icon: Book,
      title: 'Getting Started',
      description: 'Learn how to set up your account and send your first transfer',
      articles: 8,
    },
    {
      icon: HelpCircle,
      title: 'Transfers',
      description: 'Everything about sending and receiving money',
      articles: 12,
    },
    {
      icon: Phone,
      title: 'Security',
      description: 'Keep your account safe and secure',
      articles: 6,
    },
    {
      icon: MessageCircle,
      title: 'Account Settings',
      description: 'Manage your profile and preferences',
      articles: 10,
    },
  ];

  return (
    <AppLayout navigateTo={navigateTo} currentPage="support" onLogout={onLogout}>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 md:pb-6">
        <div className="text-center mb-8">
          <h1 className="text-slate-900 dark:text-white mb-3 text-xl">How can we help you?</h1>
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
            <Input
              placeholder="Search for help articles..."
              className="pl-9 h-10 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Help Topics */}
            <div>
              <h2 className="text-slate-900 dark:text-white mb-4 text-base">Browse by Topic</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {helpTopics.map((topic, index) => (
                  <Card key={index} className="p-4 dark:bg-slate-800 dark:border-slate-700 hover:shadow-lg dark:hover:bg-slate-700/50 transition-shadow cursor-pointer">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center mb-3">
                      <topic.icon className="w-5 h-5 text-blue-700 dark:text-blue-400" />
                    </div>
                    <h3 className="text-slate-900 dark:text-white mb-1 text-sm font-medium">{topic.title}</h3>
                    <p className="text-slate-600 dark:text-slate-400 text-xs mb-2">{topic.description}</p>
                    <p className="text-blue-700 dark:text-blue-400 text-xs">{topic.articles} articles</p>
                  </Card>
                ))}
              </div>
            </div>

            {/* FAQ Section */}
            <div>
              <h2 className="text-slate-900 dark:text-white mb-4 text-base">Frequently Asked Questions</h2>
              <div className="space-y-3">
                {faqs.map((faq, index) => (
                  <Card key={index} className="overflow-hidden dark:bg-slate-800 dark:border-slate-700">
                    <button
                      onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                      className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                    >
                      <span className="text-slate-900 dark:text-white pr-4 text-sm">{faq.question}</span>
                      {expandedFaq === index ? (
                        <ChevronUp className="w-4 h-4 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                      )}
                    </button>
                    {expandedFaq === index && (
                      <div className="px-4 pb-4">
                        <p className="text-slate-600 dark:text-slate-400 text-sm">{faq.answer}</p>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Contact Support */}
            <Card className="p-4 dark:bg-slate-800 dark:border-slate-700">
              <h3 className="text-slate-900 dark:text-white mb-3 text-sm">Contact Support</h3>
              <div className="space-y-2">
                <Button className="w-full justify-start bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 h-9 text-sm">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Live Chat
                </Button>
                <Button variant="outline" className="w-full justify-start dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 h-9 text-sm">
                  <Mail className="w-4 h-4 mr-2" />
                  Email Us
                </Button>
                <Button variant="outline" className="w-full justify-start dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 h-9 text-sm">
                  <Phone className="w-4 h-4 mr-2" />
                  Call Us
                </Button>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <p className="text-slate-600 dark:text-slate-400 text-xs mb-1">Average response time</p>
                <p className="text-slate-900 dark:text-white text-sm">Under 2 minutes</p>
              </div>
            </Card>

            {/* Submit a Ticket */}
            <Card className="p-4 dark:bg-slate-800 dark:border-slate-700">
              <h3 className="text-slate-900 dark:text-white mb-3 text-sm">Submit a Ticket</h3>
              <form className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="subject" className="text-sm dark:text-slate-300">Subject</Label>
                  <Input id="subject" placeholder="What do you need help with?" className="h-9 text-sm dark:bg-slate-700 dark:border-slate-600" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="category" className="text-sm dark:text-slate-300">Category</Label>
                  <select
                    id="category"
                    className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option>Select a category</option>
                    <option>Transfer Issue</option>
                    <option>Account Problem</option>
                    <option>Technical Support</option>
                    <option>Billing Question</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="message" className="text-sm dark:text-slate-300">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Describe your issue..."
                    rows={3}
                    className="text-sm dark:bg-slate-700 dark:border-slate-600"
                  />
                </div>
                <Button type="submit" className="w-full bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 h-9 text-sm">
                  Submit Ticket
                </Button>
              </form>
            </Card>

            {/* Quick Links */}
            <Card className="p-4 dark:bg-slate-800 dark:border-slate-700">
              <h3 className="text-slate-900 dark:text-white mb-3 text-sm">Quick Links</h3>
              <div className="space-y-1.5">
                <a href="#" className="block text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-xs">
                  Terms of Service
                </a>
                <a href="#" className="block text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-xs">
                  Privacy Policy
                </a>
                <a href="#" className="block text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-xs">
                  Security Information
                </a>
                <a href="#" className="block text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-xs">
                  Fee Schedule
                </a>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </AppLayout>
  );
}