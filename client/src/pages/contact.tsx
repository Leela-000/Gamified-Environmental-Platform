import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function ContactHelpPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Submit contact form
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      alert('Message sent successfully! We\'ll get back to you soon.');
      setFormData({ name: '', email: '', category: '', subject: '', message: '' });
    } catch (error) {
      alert('Failed to send message. Please try again.');
    }
    
    setIsSubmitting(false);
  };

  return (
    <div 
      className="min-h-screen text-white p-6 relative"
      style={{
        backgroundImage: 'url(/api/image/pexels-thatguycraig000-1563356.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Overlay for better text visibility */}
      <div className="absolute inset-0 bg-black/60"></div>
      
      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white/90">Contact & Help</h1>
          <p className="mt-2 text-white/70">We're here to help! Reach out to us anytime.</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Contact Form */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl rounded-xl p-8">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-2xl">💬</span>
              <h2 className="text-2xl font-semibold text-white/90">Send us a Message</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-white/80 mb-2">Your Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full rounded-lg px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/60"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/80 mb-2">Email Address</label>
                  <input
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full rounded-lg px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/60"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-white/80 mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full rounded-lg px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white"
                  required
                >
                  <option value="" className="text-gray-900">Select a category</option>
                  <option value="technical" className="text-gray-900">Technical Support</option>
                  <option value="account" className="text-gray-900">Account Issues</option>
                  <option value="general" className="text-gray-900">General Inquiry</option>
                  <option value="feedback" className="text-gray-900">Feedback</option>
                  <option value="partnership" className="text-gray-900">Partnership</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-white/80 mb-2">Subject</label>
                <input
                  type="text"
                  placeholder="How can we help you?"
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  className="w-full rounded-lg px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/60"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm text-white/80 mb-2">Message</label>
                <textarea
                  placeholder="Describe your question or issue in detail..."
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  rows={5}
                  className="w-full rounded-lg px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/60 resize-none"
                  required
                />
              </div>
              
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg"
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </Button>
            </form>
          </div>
          
          {/* Right Side - Help & Info */}
          <div className="space-y-6">
            
            {/* Quick Help */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">❓</span>
                <h3 className="text-xl font-semibold text-white/90">Quick Help</h3>
              </div>
              
              <div className="space-y-4">
                <div className="bg-white/10 rounded-lg p-4">
                  <h4 className="font-medium text-white/90 mb-2">How do I reset my password?</h4>
                  <p className="text-sm text-white/70">Go to the sign-in page and click "Forgot Password" to receive a reset link.</p>
                </div>
                
                <div className="bg-white/10 rounded-lg p-4">
                  <h4 className="font-medium text-white/90 mb-2">How do I earn more Eco-Points?</h4>
                  <p className="text-sm text-white/70">Play games, complete quizzes, and participate in challenges to earn points and badges.</p>
                </div>
                
                <div className="bg-white/10 rounded-lg p-4">
                  <h4 className="font-medium text-white/90 mb-2">Can't access my account?</h4>
                  <p className="text-sm text-white/70">Make sure your account is approved by an admin. Contact us if you're still having issues.</p>
                </div>
              </div>
            </div>
            
            {/* Get in Touch */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">📞</span>
                <h3 className="text-xl font-semibold text-white/90">Get in Touch</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-lg">📧</span>
                  <div>
                    <p className="font-medium text-white/90">Email Support</p>
                    <p className="text-sm text-white/70">help@ecovision.edu</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className="text-lg">⏰</span>
                  <div>
                    <p className="font-medium text-white/90">Response Time</p>
                    <p className="text-sm text-white/70">Within 24 hours</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className="text-lg">🌐</span>
                  <div>
                    <p className="font-medium text-white/90">Support Hours</p>
                    <p className="text-sm text-white/70">24/7 Online Support</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Helpful Resources */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">📖</span>
                <h3 className="text-xl font-semibold text-white/90">Helpful Resources</h3>
              </div>
              
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-white/90">User Guide</h4>
                  <p className="text-sm text-white/70">Learn how to use EcoVision effectively</p>
                </div>
                <div>
                  <h4 className="font-medium text-white/90">Teacher Resources</h4>
                  <p className="text-sm text-white/70">Guides for educators and administrators</p>
                </div>
                <div>
                  <h4 className="font-medium text-white/90">Environmental Tips</h4>
                  <p className="text-sm text-white/70">Daily actions to help the environment</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
